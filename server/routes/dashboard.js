const router = require('express').Router();
const repo = require('../repositories/demoRepository');

router.get('/', (req, res) => {
  try {
    const { role, state, district, mp_id } = req.query;
    let works = repo.getWorks();

    // Contextual filtering based on role/jurisdiction
    if (role === 'MP' || mp_id) {
      const targetMP = mp_id || 'MP001';
      works = works.filter(w => w.mp_id === targetMP || (w.mp && w.mp.mp_id === targetMP));
    } else if (role === 'DISTRICT' || district) {
      const targetDistrict = (district || 'Dharwad').toLowerCase();
      works = works.filter(w => (w.district || '').toLowerCase() === targetDistrict);
    } else if (role === 'STATE' || state) {
      const targetState = (state || 'Karnataka').toLowerCase();
      works = works.filter(w => (w.state || '').toLowerCase() === targetState);
    }

    const totalWorks = works.length;
    const totalSanctioned = works.reduce((s, w) => s + (w.sanctioned_amount_lakh || 0), 0);
    const totalExpenditure = works.reduce((s, w) => s + (w.total_expenditure_lakh || 0), 0);
    const ongoingWorks = works.filter(w => w.status === 'ONGOING').length;
    const completedWorks = works.filter(w => w.status === 'COMPLETED').length;

    const riskDist = { LOW: 0, WATCH: 0, HIGH: 0, CRITICAL: 0 };
    works.forEach(w => { if (riskDist[w.risk_level] !== undefined) riskDist[w.risk_level]++; });

    const priorityReviews = works
      .filter(w => ['HIGH', 'CRITICAL'].includes(w.risk_level))
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 10)
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
      }));

    // State intelligence
    const stateMap = {};
    works.forEach(w => {
      if (!stateMap[w.state]) stateMap[w.state] = { state: w.state, total: 0, high_risk: 0, critical: 0, expenditure: 0, ongoing: 0, completed: 0 };
      stateMap[w.state].total++;
      stateMap[w.state].expenditure += w.total_expenditure_lakh || 0;
      if (w.risk_level === 'HIGH') stateMap[w.state].high_risk++;
      if (w.risk_level === 'CRITICAL') stateMap[w.state].critical++;
      if (w.status === 'ONGOING') stateMap[w.state].ongoing++;
      if (w.status === 'COMPLETED') stateMap[w.state].completed++;
    });

    // Expenditure by month (last 24 months)
    const byMonth = {};
    works.forEach(w => {
      if (!w.latest_expenditure_date) return;
      const key = w.latest_expenditure_date.substring(0, 7);
      if (!byMonth[key]) byMonth[key] = 0;
      byMonth[key] += w.total_expenditure_lakh || 0;
    });
    const expenditureTrend = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-24)
      .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }));

    // Works sanctioned by year
    const byYear = {};
    works.forEach(w => {
      if (!w.sanctioned_date) return;
      const year = w.sanctioned_date.substring(0, 4);
      if (!byYear[year]) byYear[year] = 0;
      byYear[year]++;
    });
    const sanctionTrend = Object.entries(byYear).sort(([a],[b])=>a.localeCompare(b)).map(([year,count])=>({year,count}));

    // Category breakdown
    const catMap = {};
    works.forEach(w => {
      if (!catMap[w.category]) catMap[w.category] = { category: w.category, count: 0, expenditure: 0, high_risk: 0 };
      catMap[w.category].count++;
      catMap[w.category].expenditure += w.total_expenditure_lakh || 0;
      if (['HIGH','CRITICAL'].includes(w.risk_level)) catMap[w.category].high_risk++;
    });

    res.json({
      kpis: {
        total_works: totalWorks,
        total_sanctioned_lakh: Math.round(totalSanctioned * 100) / 100,
        total_expenditure_lakh: Math.round(totalExpenditure * 100) / 100,
        ongoing_works: ongoingWorks,
        completed_works: completedWorks,
        priority_reviews: priorityReviews.length,
        watch_count: riskDist.WATCH,
      },
      risk_distribution: riskDist,
      priority_alerts: priorityReviews,
      state_intelligence: Object.values(stateMap).map(s => ({ ...s, expenditure: Math.round(s.expenditure * 100) / 100 })),
      expenditure_trend: expenditureTrend,
      sanction_trend: sanctionTrend,
      category_breakdown: Object.values(catMap).map(c => ({ ...c, expenditure: Math.round(c.expenditure * 100) / 100 })),
      mode: 'DEMO',
      last_updated: new Date().toISOString(),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Dashboard data unavailable', detail: e.message });
  }
});

module.exports = router;
