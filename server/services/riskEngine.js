// ============================================================
// NIRIKSHAN AI — Risk Engine
// Explainable rule-based anomaly scoring. Not an accusation system.
// ============================================================

const TODAY = new Date('2026-09-28');

function daysBetween(d1, d2) {
  return Math.round((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));
}

// Peer-category typical durations (days) for benchmarking
const PEER_DURATION = {
  'Road Construction': 365,
  'Drinking Water Supply': 300,
  'Community Hall': 400,
  'School Building': 365,
  'Bridge': 540,
  'Irrigation': 400,
  'Sanitation': 240,
  'Drainage': 450,
  'Anganwadi': 270,
  'Flood Relief Infrastructure': 180,
  'Cyclone Relief Infrastructure': 180,
  'Fishing Harbour': 600,
};

// Peer-category typical cost per lakh (as % overage threshold)
const COST_THRESHOLD = {
  HIGH: 0.20,    // >20% over sanction = HIGH signal
  WATCH: 0.08,   // >8%  over sanction = WATCH signal
};

function computeRisk(work, allWorks, allExpenditures) {
  const signals = [];
  let score = 0;

  const sanctioned = work.sanctioned_amount_lakh;
  const spent = work.total_expenditure_lakh || 0;
  const isOngoing = work.status === 'ONGOING';
  const isCompleted = work.status === 'COMPLETED';

  // ── A. Cost Deviation ──────────────────────────────────────
  if (sanctioned && spent > 0) {
    const deviation = (spent - sanctioned) / sanctioned;
    const peerWorks = allWorks.filter(w =>
      w.internal_work_key !== work.internal_work_key &&
      w.category === work.category &&
      w.sanctioned_amount_lakh &&
      w.total_expenditure_lakh > 0
    );
    let peerBenchmark = null;
    let peerLabel = 'Peer benchmark unavailable (insufficient peer data)';

    if (peerWorks.length >= 3) {
      const peerDeviations = peerWorks.map(p =>
        (p.total_expenditure_lakh - p.sanctioned_amount_lakh) / p.sanctioned_amount_lakh
      );
      peerBenchmark = peerDeviations.reduce((a, b) => a + b, 0) / peerDeviations.length;
      peerLabel = `Peer category average deviation: ${(peerBenchmark * 100).toFixed(1)}%`;
    }

    if (deviation > COST_THRESHOLD.HIGH) {
      const sig = {
        id: 'COST_DEVIATION',
        label: 'Cost deviation',
        severity: deviation > 0.30 ? 'HIGH' : 'WATCH',
        detail: `Expenditure ₹${spent.toFixed(1)}L is ${(deviation * 100).toFixed(1)}% above sanctioned amount ₹${sanctioned.toFixed(1)}L.`,
        calculation: `(${spent.toFixed(1)} - ${sanctioned.toFixed(1)}) / ${sanctioned.toFixed(1)} = ${(deviation * 100).toFixed(1)}%`,
        peer_note: peerLabel,
      };
      signals.push(sig);
      score += sig.severity === 'HIGH' ? 35 : 20;
    } else if (deviation > COST_THRESHOLD.WATCH) {
      signals.push({
        id: 'COST_DEVIATION_MINOR',
        label: 'Minor cost deviation',
        severity: 'WATCH',
        detail: `Expenditure is ${(deviation * 100).toFixed(1)}% above sanctioned amount.`,
        calculation: `(${spent.toFixed(1)} - ${sanctioned.toFixed(1)}) / ${sanctioned.toFixed(1)} = ${(deviation * 100).toFixed(1)}%`,
        peer_note: peerLabel,
      });
      score += 10;
    }
  }

  // ── B. Duration Deviation ─────────────────────────────────
  if (work.sanctioned_date) {
    const endDate = isCompleted && work.completion_date ? new Date(work.completion_date) : TODAY;
    const actualDays = daysBetween(work.sanctioned_date, endDate);
    const peerDays = PEER_DURATION[work.category] || 365;

    if (isOngoing && actualDays > peerDays * 1.5) {
      signals.push({
        id: 'DURATION_LONG',
        label: 'Extended duration',
        severity: actualDays > peerDays * 2 ? 'HIGH' : 'WATCH',
        detail: `Work has been ongoing for ${Math.round(actualDays / 30)} months. Typical duration for ${work.category}: ~${Math.round(peerDays / 30)} months.`,
        calculation: `${actualDays} days elapsed vs peer benchmark ${peerDays} days`,
        peer_note: `Based on MPLADS category norms for ${work.category}`,
      });
      score += actualDays > peerDays * 2 ? 25 : 12;
    } else if (isCompleted && actualDays > peerDays * 2) {
      signals.push({
        id: 'DURATION_COMPLETED_LONG',
        label: 'Long completion duration',
        severity: 'WATCH',
        detail: `Work took ${Math.round(actualDays / 30)} months to complete. Typical: ~${Math.round(peerDays / 30)} months.`,
        calculation: `${actualDays} days vs peer ${peerDays} days`,
        peer_note: `Based on MPLADS category norms for ${work.category}`,
      });
      score += 8;
    }
  }

  // ── C. Payment Pattern ────────────────────────────────────
  const workPayments = allExpenditures.filter(e => e.work_key === work.internal_work_key);
  if (workPayments.length > 0 && sanctioned) {
    const sortedByAmount = [...workPayments].sort((a, b) => b.amount_lakh - a.amount_lakh);
    const largestPayment = sortedByAmount[0];
    const largestFraction = largestPayment.amount_lakh / sanctioned;

    if (largestFraction > 0.60) {
      signals.push({
        id: 'PAYMENT_CONCENTRATION',
        label: 'Unusual payment concentration',
        severity: largestFraction > 0.75 ? 'HIGH' : 'WATCH',
        detail: `Largest single payment ₹${largestPayment.amount_lakh.toFixed(1)}L is ${(largestFraction * 100).toFixed(1)}% of sanctioned amount across ${workPayments.length} payments.`,
        calculation: `${largestPayment.amount_lakh.toFixed(1)} / ${sanctioned.toFixed(1)} = ${(largestFraction * 100).toFixed(1)}%`,
        peer_note: 'Unusually concentrated disbursement pattern — requires review',
      });
      score += largestFraction > 0.75 ? 20 : 10;
    }
  }

  // ── D. Vendor Pattern ─────────────────────────────────────
  if (work.vendor_ids && work.vendor_ids.length > 0) {
    const flaggedVendorWorks = allWorks.filter(w =>
      w.internal_work_key !== work.internal_work_key &&
      w.vendor_ids && w.vendor_ids.some(vid => work.vendor_ids.includes(vid))
    );
    const multipleWorks = flaggedVendorWorks.length >= 5;
    if (multipleWorks) {
      signals.push({
        id: 'VENDOR_PATTERN',
        label: 'Vendor pattern',
        severity: 'WATCH',
        detail: `Vendor(s) associated with this work appear in ${flaggedVendorWorks.length} other works.`,
        calculation: `${flaggedVendorWorks.length} shared vendor works detected`,
        peer_note: 'High vendor concentration — pattern review recommended',
      });
      score += 8;
    }
  }

  // ── E. Potential Duplicate ────────────────────────────────
  if (work.description && work.status !== 'RECOMMENDED') {
    const desc = work.description.toLowerCase();
    const keywords = desc.split(' ').filter(w => w.length > 5);
    const potentialDuplicates = allWorks.filter(w =>
      w.internal_work_key !== work.internal_work_key &&
      w.state === work.state &&
      w.category === work.category &&
      w.mp_id === work.mp_id &&
      (() => {
        const odesc = (w.description || '').toLowerCase();
        const matches = keywords.filter(k => odesc.includes(k));
        return matches.length >= Math.ceil(keywords.length * 0.5);
      })()
    );
    if (potentialDuplicates.length > 0) {
      signals.push({
        id: 'POTENTIAL_DUPLICATE',
        label: 'Potential duplicate',
        severity: 'WATCH',
        detail: `${potentialDuplicates.length} potentially similar work(s) found in the same MP constituency and category.`,
        calculation: `Description keyword overlap > 50% with ${potentialDuplicates.length} other record(s)`,
        peer_note: 'Manual investigation recommended — may be distinct phases of the same project',
        similar_keys: potentialDuplicates.map(w => w.internal_work_key),
      });
      score += 10;
    }
  }

  // ── F. Fund Utilization ───────────────────────────────────
  if (sanctioned && isOngoing) {
    const utilized = spent / sanctioned;
    if (utilized < 0.15 && work.sanctioned_date) {
      const monthsSinceSanction = daysBetween(work.sanctioned_date, TODAY) / 30;
      if (monthsSinceSanction > 6) {
        signals.push({
          id: 'LOW_UTILIZATION',
          label: 'Low fund utilization',
          severity: 'WATCH',
          detail: `Only ${(utilized * 100).toFixed(1)}% of sanctioned funds utilized after ${Math.round(monthsSinceSanction)} months.`,
          calculation: `${spent.toFixed(1)} / ${sanctioned.toFixed(1)} = ${(utilized * 100).toFixed(1)}%`,
          peer_note: 'Stalled execution or delayed commencement',
        });
        score += 8;
      }
    }
  }

  // ── Compute risk level ────────────────────────────────────
  let risk_level;
  if (score >= 50) risk_level = 'CRITICAL';
  else if (score >= 25) risk_level = 'HIGH';
  else if (score >= 8) risk_level = 'WATCH';
  else risk_level = 'LOW';

  // ── Generate explanation ──────────────────────────────────
  const explanation = generateExplanation(work, signals, risk_level);

  return {
    risk_level,
    risk_score: score,
    risk_signals: signals,
    risk_explanation: explanation,
    explanation_type: 'RISK_ENGINE',
  };
}

function generateExplanation(work, signals, risk_level) {
  if (signals.length === 0) {
    return 'No significant anomaly signals detected. This work is within normal parameters based on available data.';
  }
  const parts = signals.map((s, i) => `${String(i + 1).padStart(2, '0')} ${s.label}: ${s.detail}`);
  const context = work.calamity
    ? `\n\nContext: This work is associated with a calamity approval (${work.calamity.type} — ${work.calamity.description}). Some deviations may be explained by emergency conditions.`
    : '';
  const interpretation = `\n\nInterpretation: These signals indicate a potential anomaly requiring human review. They do not confirm misconduct. Context may partially explain the deviations.`;
  return parts.join('\n\n') + context + interpretation;
}

module.exports = { computeRisk, generateExplanation };
