// ============================================================
// Import Service — CSV parsing, validation, preview
// ============================================================
const Papa = require('papaparse');
const repo = require('../repositories/demoRepository');

const DATASET_TYPES = [
  { id: 'LS_ALLOCATED', label: 'Lok Sabha — Allocated Limit for MPs', keywords: ['allocated','lok sabha','limit'], house: 'Lok Sabha' },
  { id: 'RS_ALLOCATED', label: 'Rajya Sabha — Allocated Limit for MPs', keywords: ['allocated','rajya sabha','limit'], house: 'Rajya Sabha' },
  { id: 'LS_CALAMITY', label: 'Lok Sabha — Amount Consented for Calamity', keywords: ['calamity','consented','lok'], house: 'Lok Sabha' },
  { id: 'RS_CALAMITY', label: 'Rajya Sabha — Amount Consented for Calamity', keywords: ['calamity','consented','rajya'], house: 'Rajya Sabha' },
  { id: 'LS_RECOMMENDED', label: 'Lok Sabha — Works Recommended', keywords: ['recommended','lok sabha','work'], house: 'Lok Sabha' },
  { id: 'RS_RECOMMENDED', label: 'Rajya Sabha — Works Recommended', keywords: ['recommended','rajya sabha','work'], house: 'Rajya Sabha' },
  { id: 'LS_SANCTIONED', label: 'Lok Sabha — Works Sanctioned', keywords: ['sanctioned','lok sabha'], house: 'Lok Sabha' },
  { id: 'RS_SANCTIONED', label: 'Rajya Sabha — Works Sanctioned', keywords: ['sanctioned','rajya sabha'], house: 'Rajya Sabha' },
  { id: 'LS_COMPLETED', label: 'Lok Sabha — Works Completed', keywords: ['completed','lok sabha'], house: 'Lok Sabha' },
  { id: 'RS_COMPLETED', label: 'Rajya Sabha — Works Completed', keywords: ['completed','rajya sabha'], house: 'Rajya Sabha' },
  { id: 'LS_EXPENDITURE', label: 'Lok Sabha — Expenditure on Works', keywords: ['expenditure','lok sabha'], house: 'Lok Sabha' },
  { id: 'RS_EXPENDITURE', label: 'Rajya Sabha — Expenditure on Works', keywords: ['expenditure','rajya sabha'], house: 'Rajya Sabha' },
];

// Track import history in-memory
const importHistory = [];

function detectDatasetType(filename, headers) {
  const combined = (filename + ' ' + (headers || []).join(' ')).toLowerCase();
  for (const dt of DATASET_TYPES) {
    const matchCount = dt.keywords.filter(k => combined.includes(k)).length;
    if (matchCount >= 2) return dt;
  }
  // Fallback by filename pattern
  if (combined.includes('recommend')) return DATASET_TYPES.find(d => d.id === 'LS_RECOMMENDED');
  if (combined.includes('sanction')) return DATASET_TYPES.find(d => d.id === 'LS_SANCTIONED');
  if (combined.includes('complet')) return DATASET_TYPES.find(d => d.id === 'LS_COMPLETED');
  if (combined.includes('expend')) return DATASET_TYPES.find(d => d.id === 'LS_EXPENDITURE');
  if (combined.includes('calamit')) return DATASET_TYPES.find(d => d.id === 'LS_CALAMITY');
  if (combined.includes('alloc')) return DATASET_TYPES.find(d => d.id === 'LS_ALLOCATED');
  return null;
}

function validateRow(row, type) {
  const errors = [];
  const warn = [];
  // Basic validation rules
  if (type && type.id.includes('RECOMMENDED')) {
    if (!row['Work Name'] && !row['Description'] && !row['Work Description']) warn.push('Missing work description');
    if (!row['State'] && !row['State Name']) warn.push('Missing state');
  }
  if (type && type.id.includes('EXPENDITURE')) {
    const amt = parseFloat(row['Amount'] || row['Expenditure'] || row['Amount (in Lakh)'] || 0);
    if (isNaN(amt) || amt < 0) errors.push('Invalid expenditure amount');
  }
  return { errors, warnings: warn };
}

function processCSV(csvText, filename) {
  const parsed = Papa.parse(csvText.trim(), { header: true, skipEmptyLines: true });
  const headers = parsed.meta.fields || [];
  const rows = parsed.data || [];
  const type = detectDatasetType(filename, headers);

  let errorCount = 0;
  let warnCount = 0;
  const rowResults = rows.slice(0, 5).map((row, i) => {
    const v = validateRow(row, type);
    errorCount += v.errors.length;
    warnCount += v.warnings.length;
    return { row: i + 1, errors: v.errors, warnings: v.warnings };
  });

  const importId = `IMP-${Date.now()}`;
  const record = {
    import_id: importId,
    filename,
    dataset_type: type ? type.label : 'Unknown dataset type',
    dataset_type_id: type ? type.id : null,
    row_count: rows.length,
    column_count: headers.length,
    headers,
    status: errorCount > 0 ? 'PARTIAL' : 'SUCCESS',
    errors: errorCount,
    warnings: warnCount,
    validation_results: rowResults,
    imported_at: new Date().toISOString(),
    mode: 'PROTOTYPE_IMPORT',
    preview: rows.slice(0, 3),
  };

  importHistory.unshift(record);
  if (importHistory.length > 50) importHistory.pop();

  return record;
}

function getImportHistory() { return importHistory; }
function getDatasetTypes() { return DATASET_TYPES; }

module.exports = { processCSV, getImportHistory, getDatasetTypes };
