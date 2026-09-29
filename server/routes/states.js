const router = require('express').Router();
const repo = require('../repositories/demoRepository');

router.get('/', (req, res) => {
  try {
    const works = repo.getWorks();
    const stateMap = {};
    works.forEach(w => {
      if (!stateMap[w.state]) {
        stateMap[w.state] = { state: w.state, total: 0, ongoing: 0, completed: 0, recommended: 0, sanctioned: 0, expenditure: 0, high_risk: 0, critical: 0, watch: 0, low: 0 };
      }
      stateMap[w.state].total++;
      stateMap[w.state].expenditure += w.total_expenditure_lakh || 0;
      if (w.status === 'ONGOING') stateMap[w.state].ongoing++;
      if (w.status === 'COMPLETED') stateMap[w.state].completed++;
      if (w.status === 'RECOMMENDED') stateMap[w.state].recommended++;
      if (w.status === 'SANCTIONED') stateMap[w.state].sanctioned++;
      if (w.risk_level === 'HIGH') stateMap[w.state].high_risk++;
      if (w.risk_level === 'CRITICAL') stateMap[w.state].critical++;
      if (w.risk_level === 'WATCH') stateMap[w.state].watch++;
      if (w.risk_level === 'LOW') stateMap[w.state].low++;
    });
    const states = Object.values(stateMap).map(s => ({ ...s, expenditure: Math.round(s.expenditure * 100) / 100 }));
    res.json({ states });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
