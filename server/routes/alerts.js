const router = require('express').Router();
const repo = require('../repositories/demoRepository');

router.get('/', (req, res) => {
  try {
    const works = repo.getWorks();
    const alerts = works
      .filter(w => ['HIGH', 'CRITICAL'].includes(w.risk_level))
      .sort((a, b) => b.risk_score - a.risk_score)
      .map(w => ({
        internal_work_key: w.internal_work_key,
        description: w.description,
        state: w.state,
        district: w.district,
        category: w.category,
        status: w.status,
        risk_level: w.risk_level,
        risk_score: w.risk_score,
        risk_signals: w.risk_signals,
        mp: w.mp,
        sanctioned_amount_lakh: w.sanctioned_amount_lakh,
        total_expenditure_lakh: w.total_expenditure_lakh,
        calamity: w.calamity,
        sanctioned_date: w.sanctioned_date,
        latest_expenditure_date: w.latest_expenditure_date,
      }));
    res.json({ total: alerts.length, alerts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
