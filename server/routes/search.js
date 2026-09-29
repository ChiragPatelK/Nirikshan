const router = require('express').Router();
const { searchWorks } = require('../services/searchService');

router.get('/', (req, res) => {
  try {
    const { q, state, risk, status, category, mp_id, page = 1, limit = 20 } = req.query;
    const result = searchWorks({ query: q || '', state, risk, status, category, mp_id, page, limit });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
