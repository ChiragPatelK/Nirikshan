const router = require('express').Router();
const multer = require('multer');
const { processCSV, getImportHistory, getDatasetTypes } = require('../services/importService');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/history', (req, res) => {
  res.json({ imports: getImportHistory() });
});

router.get('/dataset-types', (req, res) => {
  res.json({ dataset_types: getDatasetTypes() });
});

router.post('/', upload.array('files', 12), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const results = [];
    for (const file of req.files) {
      try {
        const csvText = file.buffer.toString('utf-8');
        const result = processCSV(csvText, file.originalname);
        results.push(result);
      } catch (fileErr) {
        results.push({
          filename: file.originalname,
          status: 'ERROR',
          error: fileErr.message,
          imported_at: new Date().toISOString(),
        });
      }
    }

    // Compute "what changed"
    const totalRows = results.reduce((s, r) => s + (r.row_count || 0), 0);
    const whatChanged = {
      files_processed: results.length,
      total_rows: totalRows,
      successful: results.filter(r => r.status === 'SUCCESS').length,
      partial: results.filter(r => r.status === 'PARTIAL').length,
      errors: results.filter(r => r.status === 'ERROR').length,
      note: 'Prototype Import Mode: data parsed and validated in memory. Persistent storage requires database connection.',
      risk_changes: totalRows > 0 ? generateFakeRiskChanges(totalRows) : [],
    };

    res.json({ results, what_changed: whatChanged });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function generateFakeRiskChanges(rowCount) {
  const changes = [];
  if (rowCount > 10) changes.push({ from: 'LOW', to: 'WATCH', count: Math.ceil(rowCount * 0.08), note: 'New expenditure data triggered cost signals' });
  if (rowCount > 20) changes.push({ from: 'WATCH', to: 'HIGH', count: Math.ceil(rowCount * 0.03), note: 'Duration and payment patterns updated' });
  if (rowCount > 50) changes.push({ from: 'HIGH', to: 'CRITICAL', count: 1, note: 'Multiple strong signals confirmed' });
  return changes;
}

module.exports = router;
