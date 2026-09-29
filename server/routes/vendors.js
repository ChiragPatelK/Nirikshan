const router = require('express').Router();
const repo = require('../repositories/demoRepository');

router.get('/', (req, res) => {
  try {
    const vendors = repo.getVendors();
    const works = repo.getWorks();
    const enriched = vendors.map(v => {
      const vWorks = works.filter(w => w.vendor_ids.includes(v.vendor_id));
      return {
        ...v,
        recent_works: vWorks.slice(0, 5).map(w => ({
          internal_work_key: w.internal_work_key,
          description: w.description,
          state: w.state,
          risk_level: w.risk_level,
          total_expenditure_lakh: w.total_expenditure_lakh,
        })),
      };
    });
    res.json({ total: enriched.length, vendors: enriched });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const vendors = repo.getVendors();
    const vendor = vendors.find(v => v.vendor_id === req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    const works = repo.getWorks().filter(w => w.vendor_ids.includes(req.params.id));
    const expenditures = repo.getExpenditures().filter(e => e.vendor_id === req.params.id);
    res.json({ ...vendor, works, expenditures });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
