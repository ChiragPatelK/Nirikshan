// ============================================================
// Chat Service — Data-grounded AI assistant
// ============================================================
const repo = require('../repositories/demoRepository');

// Intent classifier
function classifyIntent(message) {
  const m = message.toLowerCase();
  if (m.match(/high.risk|critical|flagged|alert|anomal/)) return 'HIGH_RISK';
  if (m.match(/expend|spent|payment|amount|cost/)) return 'EXPENDITURE';
  if (m.match(/vendor|contractor|supplier/)) return 'VENDOR';
  if (m.match(/why.*(flag|risk)|reason|signal|explain/)) return 'EXPLAIN';
  if (m.match(/ongoing|incomplete|in.progress|long duration/)) return 'ONGOING';
  if (m.match(/complet/)) return 'COMPLETED';
  if (m.match(/state|karnataka|maharashtra|uttar pradesh|tamil.?nadu|west.?bengal|kerala|rajasthan/)) return 'STATE';
  if (m.match(/mp|member|parliament|minister|joshi|suresh|rajnath|dimple|sule|shinde|kanimozhi|raja|brien|moitra|tharoor|muraleedharan|yadav|pilot|irani/)) return 'MP';
  if (m.match(/total|summary|overview|dashboard|statistic/)) return 'SUMMARY';
  if (m.match(/duplic|similar/)) return 'DUPLICATE';
  if (m.match(/calamit|flood|cyclone|drought|disaster/)) return 'CALAMITY';
  return 'GENERAL';
}

function extractState(message) {
  const m = message.toLowerCase();
  const states = {
    karnataka: 'Karnataka', maharashtra: 'Maharashtra',
    'uttar pradesh': 'Uttar Pradesh', 'tamil nadu': 'Tamil Nadu',
    'west bengal': 'West Bengal', kerala: 'Kerala', rajasthan: 'Rajasthan',
  };
  for (const [k, v] of Object.entries(states)) {
    if (m.includes(k)) return v;
  }
  return null;
}

function extractMP(message) {
  const m = message.toLowerCase();
  const mps = repo.getMPs();
  for (const mp of mps) {
    const nameParts = mp.name.toLowerCase().split(' ');
    if (nameParts.some(part => part.length > 3 && m.includes(part))) return mp;
  }
  return null;
}

function formatWorkBrief(w) {
  return `• ${w.description} (${w.state}, ${w.category}) — ${w.risk_level} risk, ₹${(w.total_expenditure_lakh||0).toFixed(1)}L spent of ₹${(w.sanctioned_amount_lakh||0).toFixed(1)}L sanctioned [${w.status}]`;
}

function processChat(message) {
  const works = repo.getWorks();
  const intent = classifyIntent(message);
  const state = extractState(message);
  const mp = extractMP(message);

  let answer = '';
  let data = null;

  switch (intent) {
    case 'HIGH_RISK': {
      let filtered = works.filter(w => ['HIGH','CRITICAL'].includes(w.risk_level));
      if (state) filtered = filtered.filter(w => w.state === state);
      if (mp) filtered = filtered.filter(w => w.mp_id === mp.mp_id);
      if (filtered.length === 0) {
        answer = state ? `No high-risk or critical works found in ${state} in the current dataset.` : 'No high-risk or critical works found in the current dataset.';
      } else {
        const label = state ? ` in ${state}` : '';
        answer = `Found ${filtered.length} high-risk or critical work(s)${label}:\n\n${filtered.map(formatWorkBrief).join('\n')}`;
        data = filtered.slice(0, 10);
      }
      break;
    }

    case 'EXPENDITURE': {
      let filtered = works.filter(w => w.total_expenditure_lakh > 0);
      if (state) filtered = filtered.filter(w => w.state === state);
      const sorted = filtered.sort((a, b) => b.total_expenditure_lakh - a.total_expenditure_lakh);
      const top = sorted.slice(0, 5);
      const total = filtered.reduce((s, w) => s + w.total_expenditure_lakh, 0);
      answer = `Total expenditure${state ? ` in ${state}` : ''}: ₹${total.toFixed(1)}L across ${filtered.length} works.\n\nTop 5 by expenditure:\n${top.map(w => `• ${w.description} — ₹${w.total_expenditure_lakh.toFixed(1)}L`).join('\n')}`;
      data = top;
      break;
    }

    case 'VENDOR': {
      const vendors = repo.getVendors();
      const riskVendors = vendors.filter(v => v.risk_flag || v.flagged_works_count > 0);
      if (riskVendors.length === 0) {
        answer = 'No vendors with flagged works found in the current dataset.';
      } else {
        answer = `Vendors appearing in multiple flagged works:\n\n${riskVendors.map(v => `• ${v.name} (${v.state}) — ${v.works_count} works, ${v.flagged_works_count} flagged, ₹${v.total_amount_lakh.toFixed(1)}L total`).join('\n')}`;
        data = riskVendors;
      }
      break;
    }

    case 'EXPLAIN': {
      const m2 = message.toLowerCase();
      const matchedWork = works.find(w =>
        m2.includes(w.internal_work_key.toLowerCase()) ||
        m2.includes((w.description || '').toLowerCase().substring(0, 20))
      );
      if (matchedWork && matchedWork.risk_signals && matchedWork.risk_signals.length > 0) {
        answer = `Risk explanation for: ${matchedWork.description}\n\nRisk level: ${matchedWork.risk_level}\n\n${matchedWork.risk_explanation}`;
        data = matchedWork;
      } else {
        const highRisk = works.filter(w => ['HIGH','CRITICAL'].includes(w.risk_level));
        if (state) {
          const stateWorks = highRisk.filter(w => w.state === state);
          if (stateWorks.length > 0) {
            const w = stateWorks[0];
            answer = `Here is why a flagged work in ${state} was flagged:\n\n"${w.description}"\nRisk: ${w.risk_level}\n\n${w.risk_explanation}`;
            data = w;
          } else {
            answer = `No flagged works found in ${state} to explain.`;
          }
        } else {
          const w = highRisk[0];
          if (w) {
            answer = `Here is why a high-risk work was flagged:\n\n"${w.description}"\nRisk: ${w.risk_level}\n\n${w.risk_explanation}`;
            data = w;
          } else {
            answer = 'No flagged works found in the current dataset to explain.';
          }
        }
      }
      break;
    }

    case 'ONGOING': {
      let filtered = works.filter(w => w.status === 'ONGOING');
      if (state) filtered = filtered.filter(w => w.state === state);
      // Sort by duration (longest first)
      const TODAY = new Date('2026-09-28');
      const sorted = filtered.sort((a, b) => {
        const da = a.sanctioned_date ? (TODAY - new Date(a.sanctioned_date)) : 0;
        const db = b.sanctioned_date ? (TODAY - new Date(b.sanctioned_date)) : 0;
        return db - da;
      });
      answer = `Found ${filtered.length} ongoing work(s)${state ? ` in ${state}` : ''}. Longest running:\n\n${sorted.slice(0,5).map(w => {
        const months = w.sanctioned_date ? Math.round((TODAY - new Date(w.sanctioned_date)) / (1000*60*60*24*30)) : '?';
        return `• ${w.description} — ${months} months since sanction, ${w.risk_level} risk`;
      }).join('\n')}`;
      data = sorted.slice(0, 10);
      break;
    }

    case 'COMPLETED': {
      let filtered = works.filter(w => w.status === 'COMPLETED');
      if (state) filtered = filtered.filter(w => w.state === state);
      const total = filtered.reduce((s, w) => s + (w.total_expenditure_lakh || 0), 0);
      answer = `${filtered.length} completed works${state ? ` in ${state}` : ''} with total expenditure of ₹${total.toFixed(1)}L.`;
      data = filtered.slice(0, 10);
      break;
    }

    case 'STATE': {
      const targetState = state;
      if (!targetState) { answer = 'Please specify a state name.'; break; }
      const stateWorks = works.filter(w => w.state === targetState);
      const high = stateWorks.filter(w => ['HIGH','CRITICAL'].includes(w.risk_level)).length;
      const watch = stateWorks.filter(w => w.risk_level === 'WATCH').length;
      const totalExp = stateWorks.reduce((s, w) => s + (w.total_expenditure_lakh || 0), 0);
      answer = `${targetState} summary:\n• Total works: ${stateWorks.length}\n• High/Critical risk: ${high}\n• Watch: ${watch}\n• Total expenditure: ₹${totalExp.toFixed(1)}L\n• Completed: ${stateWorks.filter(w=>w.status==='COMPLETED').length}\n• Ongoing: ${stateWorks.filter(w=>w.status==='ONGOING').length}`;
      data = stateWorks;
      break;
    }

    case 'MP': {
      const targetMP = mp;
      if (!targetMP) { answer = 'Please specify the MP name more clearly.'; break; }
      const mpWorks = works.filter(w => w.mp_id === targetMP.mp_id);
      const high = mpWorks.filter(w => ['HIGH','CRITICAL'].includes(w.risk_level)).length;
      const totalExp = mpWorks.reduce((s, w) => s + (w.total_expenditure_lakh || 0), 0);
      answer = `Works for ${targetMP.name} (${targetMP.constituency}, ${targetMP.state}):\n• Total works: ${mpWorks.length}\n• High/Critical risk: ${high}\n• Total expenditure: ₹${totalExp.toFixed(1)}L\n\nRecent works:\n${mpWorks.slice(0,5).map(formatWorkBrief).join('\n')}`;
      data = mpWorks;
      break;
    }

    case 'SUMMARY': {
      const totalWorks = works.length;
      const totalExp = works.reduce((s, w) => s + (w.total_expenditure_lakh || 0), 0);
      const totalSanc = works.reduce((s, w) => s + (w.sanctioned_amount_lakh || 0), 0);
      const critical = works.filter(w => w.risk_level === 'CRITICAL').length;
      const high = works.filter(w => w.risk_level === 'HIGH').length;
      const watch = works.filter(w => w.risk_level === 'WATCH').length;
      answer = `NIRIKSHAN AI — Demo Dataset Summary\n\n• Total works: ${totalWorks}\n• Total sanctioned: ₹${totalSanc.toFixed(1)}L\n• Total expenditure: ₹${totalExp.toFixed(1)}L\n• Completed: ${works.filter(w=>w.status==='COMPLETED').length}\n• Ongoing: ${works.filter(w=>w.status==='ONGOING').length}\n• Critical risk: ${critical}\n• High risk: ${high}\n• Watch: ${watch}\n• Low risk: ${works.filter(w=>w.risk_level==='LOW').length}`;
      break;
    }

    case 'DUPLICATE': {
      const dups = works.filter(w => w.risk_signals && w.risk_signals.some(s => s.id === 'POTENTIAL_DUPLICATE'));
      if (dups.length === 0) { answer = 'No potential duplicate works detected in the current dataset.'; break; }
      answer = `Found ${dups.length} work(s) with potential duplicate signals:\n\n${dups.map(formatWorkBrief).join('\n')}`;
      data = dups;
      break;
    }

    case 'CALAMITY': {
      let filtered = works.filter(w => w.calamity_id);
      if (state) filtered = filtered.filter(w => w.state === state);
      answer = `Found ${filtered.length} calamity-related works${state ? ` in ${state}` : ''}:\n\n${filtered.map(w => `• ${w.description} (${w.state}) — ${w.calamity ? w.calamity.type : 'Calamity'}, ₹${(w.total_expenditure_lakh||0).toFixed(1)}L, ${w.risk_level} risk`).join('\n')}`;
      data = filtered;
      break;
    }

    default: {
      answer = `I searched the MPLADS demo dataset but couldn't find enough specific information to answer your question.\n\nYou can try asking:\n• "Show high-risk works in Karnataka"\n• "Which vendors appear in flagged works?"\n• "Show ongoing works with long durations"\n• "Summarize works for Pralhad Venkatesh Joshi"\n• "Total expenditure in Maharashtra"`;
    }
  }

  return { answer, data, intent, explanation_type: 'RISK_ENGINE' };
}

module.exports = { processChat };
