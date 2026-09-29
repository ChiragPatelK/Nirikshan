const router = require('express').Router();
const repo = require('../repositories/demoRepository');
const { searchWorks } = require('../services/searchService');

// GET /api/works — list with filters & pagination
router.get('/', (req, res) => {
  try {
    const { query, state, district, risk, status, category, mp_id, page = 1, limit = 20 } = req.query;
    const result = searchWorks({ query, state, district, risk, status, category, mp_id, page, limit });
    res.json({
      ...result,
      works: result.results || [],
      totalPages: Math.ceil((result.total || 0) / (Number(limit) || 20)) || 1,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/works/:id — work detail (Risk Passport)
router.get('/:id', (req, res) => {
  try {
    const works = repo.getWorks();
    const work = works.find(w => w.internal_work_key === req.params.id);
    if (!work) return res.status(404).json({ error: 'Work not found', id: req.params.id });

    const expenditures = repo.getExpenditures().filter(e => e.work_key === req.params.id);
    const riskHistory = (repo.getRiskHistory() || {})[req.params.id] || [];

    // Vendor details
    const allVendors = repo.getVendors();
    const workVendors = allVendors.filter(v => work.vendor_ids.includes(v.vendor_id));

    // Similar works (potential duplicates)
    const similarKeys = work.risk_signals
      ? work.risk_signals.filter(s => s.id === 'POTENTIAL_DUPLICATE').flatMap(s => s.similar_keys || [])
      : [];
    const similarWorks = works.filter(w => similarKeys.includes(w.internal_work_key)).map(w => ({
      internal_work_key: w.internal_work_key, description: w.description, state: w.state, category: w.category, risk_level: w.risk_level,
    }));

    // Financial snapshot
    const remaining = (work.sanctioned_amount_lakh || 0) - (work.total_expenditure_lakh || 0);
    const utilization = work.sanctioned_amount_lakh
      ? Math.round((work.total_expenditure_lakh / work.sanctioned_amount_lakh) * 1000) / 10
      : 0;

    res.json({
      ...work,
      expenditures,
      risk_history: riskHistory,
      vendors: workVendors,
      similar_works: similarWorks,
      financial_snapshot: {
        recommended_amount_lakh: work.recommended_amount_lakh,
        sanctioned_amount_lakh: work.sanctioned_amount_lakh,
        total_expenditure_lakh: work.total_expenditure_lakh,
        remaining_amount_lakh: Math.round(remaining * 100) / 100,
        utilization_percent: utilization,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/works/recommend — MP Work Recommendation
router.post('/recommend', (req, res) => {
  try {
    const {
      title,
      description,
      category = 'Road Construction',
      state = 'Karnataka',
      district = 'Dharwad',
      mp_id = 'MP001',
      recommended_amount_lakh = 25,
      gram_panchayat = 'Gram Panchayat Hall',
    } = req.body;

    const newId = `WRK-MP-${Date.now().toString().slice(-4)}`;
    const nowStr = new Date().toISOString().split('T')[0];

    const newWork = {
      internal_work_key: newId,
      official_work_id: `MPLADS/REC/${newId}`,
      description: title ? `${title}: ${description || ''}` : (description || 'Community Development Work'),
      category,
      state,
      district,
      mp_id,
      ida_id: 'IDA-KA-01',
      recommended_date: nowStr,
      recommended_amount_lakh: Number(recommended_amount_lakh),
      sanctioned_date: null,
      sanctioned_amount_lakh: 0,
      total_expenditure_lakh: 0,
      status: 'RECOMMENDED',
      vendor_ids: [],
      gram_panchayat,
      risk_level: 'LOW',
      risk_score: 12,
      risk_signals: [{
        id: 'NEW_RECOMMENDATION',
        name: 'New Recommendation',
        severity: 'LOW',
        description: 'Newly recommended work by Hon\'ble MP pending District scrutiny and sanctioning.',
      }],
    };

    repo.appendWorks([newWork]);
    res.status(201).json({ success: true, message: 'Work successfully recommended by Member of Parliament', work: newWork });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/works/:id/inspect — District Authority Physical Inspection & Milestone Verification
router.post('/:id/inspect', (req, res) => {
  try {
    const works = repo.getWorks();
    const work = works.find(w => w.internal_work_key === req.params.id);
    if (!work) return res.status(404).json({ error: 'Work not found' });

    const {
      inspector_name = 'Assistant Executive Engineer',
      physical_progress_percent = 50,
      geotag_verified = true,
      remarks = 'Field physical verification completed.',
    } = req.body;

    const nowStr = new Date().toISOString().split('T')[0];
    work.last_inspected_date = nowStr;
    work.physical_progress_percent = Number(physical_progress_percent);
    work.inspection_verified = Boolean(geotag_verified);
    work.inspection_remarks = remarks;
    work.inspected_by = inspector_name;

    if (!work.risk_signals) work.risk_signals = [];
    work.risk_signals.unshift({
      id: 'INSPECTION_RECORDED',
      name: 'Physical Inspection Certified',
      severity: 'LOW',
      description: `Inspected by ${inspector_name} on ${nowStr}. Progress certified at ${physical_progress_percent}%. Geotag status: ${geotag_verified ? 'Verified' : 'Pending'}. Remarks: ${remarks}`,
    });

    res.json({ success: true, message: 'District physical inspection and milestone verified', work });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/works/:id/escalate — State Nodal Authority Escalation
router.post('/:id/escalate', (req, res) => {
  try {
    const works = repo.getWorks();
    const work = works.find(w => w.internal_work_key === req.params.id);
    if (!work) return res.status(404).json({ error: 'Work not found' });

    const { reason = 'Implementation bottleneck / delay', notes = '', escalated_by = 'State Nodal Officer' } = req.body;
    const nowStr = new Date().toISOString().split('T')[0];

    work.escalation_status = 'ESCALATED_TO_MINISTRY';
    work.escalated_date = nowStr;
    work.escalation_reason = reason;

    if (!work.risk_signals) work.risk_signals = [];
    work.risk_signals.unshift({
      id: 'STATE_ESCALATION',
      name: 'Escalated by State Nodal Authority',
      severity: 'HIGH',
      description: `Escalated on ${nowStr} by ${escalated_by}: ${reason}. ${notes}`,
    });

    res.json({ success: true, message: 'Work escalated to Central Ministry (MoSPI)', work });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/works/:id/freeze — Ministry Forensic Audit & Fund Freeze
router.post('/:id/freeze', (req, res) => {
  try {
    const works = repo.getWorks();
    const work = works.find(w => w.internal_work_key === req.params.id);
    if (!work) return res.status(404).json({ error: 'Work not found' });

    const { reason = 'Forensic audit notice issued', ordered_by = 'MoSPI Central Vigilance Directorate' } = req.body;
    const nowStr = new Date().toISOString().split('T')[0];

    work.status = 'FROZEN_FOR_AUDIT';
    work.audit_freeze_date = nowStr;
    work.audit_freeze_reason = reason;
    work.risk_level = 'CRITICAL';
    work.risk_score = Math.max(work.risk_score || 0, 95);

    if (!work.risk_signals) work.risk_signals = [];
    work.risk_signals.unshift({
      id: 'MINISTRY_AUDIT_FREEZE',
      name: 'Ministry Forensic Audit & Sanction Freeze',
      severity: 'CRITICAL',
      description: `Issued on ${nowStr} by ${ordered_by}. Reason: ${reason}. All further fund releases suspended.`,
    });

    res.json({ success: true, message: 'Forensic audit initiated and disbursements frozen by Ministry', work });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
