// ============================================================
// Search Service
// ============================================================
const repo = require('../repositories/demoRepository');

function searchWorks({ query = '', state, risk, status, category, mp_id, page = 1, limit = 20 }) {
  let works = repo.getWorks();
  const q = query.toLowerCase().trim();

  if (q) {
    works = works.filter(w => {
      return (
        (w.description || '').toLowerCase().includes(q) ||
        (w.internal_work_key || '').toLowerCase().includes(q) ||
        (w.official_work_id || '').toLowerCase().includes(q) ||
        (w.state || '').toLowerCase().includes(q) ||
        (w.district || '').toLowerCase().includes(q) ||
        (w.category || '').toLowerCase().includes(q) ||
        (w.status || '').toLowerCase().includes(q) ||
        (w.mp && w.mp.name && w.mp.name.toLowerCase().includes(q)) ||
        (w.mp && w.mp.constituency && w.mp.constituency.toLowerCase().includes(q)) ||
        (w.ida && w.ida.name && w.ida.name.toLowerCase().includes(q)) ||
        (w.vendor_ids || []).some(vid => vid.toLowerCase().includes(q)) ||
        (w.recommended_date || '').includes(q) ||
        (w.sanctioned_date || '').includes(q) ||
        String(w.sanctioned_amount_lakh || '').includes(q) ||
        String(w.total_expenditure_lakh || '').includes(q)
      );
    });
  }

  if (state) works = works.filter(w => w.state === state);
  if (risk) works = works.filter(w => w.risk_level === risk);
  if (status) works = works.filter(w => w.status === status);
  if (category) works = works.filter(w => w.category === category);
  if (mp_id) works = works.filter(w => w.mp_id === mp_id);

  const total = works.length;
  const start = (page - 1) * limit;
  const paginated = works.slice(start, start + limit);

  return { total, page: Number(page), limit: Number(limit), results: paginated };
}

module.exports = { searchWorks };
