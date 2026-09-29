import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RotateCcw,
  Sparkles,
  Info,
  Clock
} from 'lucide-react';
import { api } from '../services/api';

export default function ImportPage() {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [datasetTypes, setDatasetTypes] = useState([]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const histRes = await api.getImportHistory();
        setHistory(histRes.imports || []);
        const typeRes = await api.getDatasetTypes();
        setDatasetTypes(typeRes.dataset_types || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadMeta();
  }, []);

  const handleFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.name.endsWith('.csv'));
    if (valid.length === 0) {
      setError('Please select valid .CSV files');
      return;
    }
    setError(null);
    setSelectedFiles(valid);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const res = await api.importFiles(formData);
      setUploadResult(res);

      // Refresh history
      const histRes = await api.getImportHistory();
      setHistory(histRes.imports || []);
    } catch (err) {
      setError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const loadSampleDataset = (type) => {
    let sampleCSV = '';
    let sampleName = '';

    if (type === 'works') {
      sampleName = 'sample_mplads_works_upload.csv';
      sampleCSV = `internal_work_key,description,state,district,category,recommended_amount_lakh,sanctioned_amount_lakh,status,mp_id,ida_id
SAMPLE-KA-101,Installation of Solar Streetlights in Ranebennur,Karnataka,Haveri,Renewable Energy,35.0,34.0,ONGOING,MP001,IDA-KA-01
SAMPLE-UP-102,Construction of Community Health Subcenter at Bakshi Ka Talab,Uttar Pradesh,Lucknow,Health & Sanitation,65.0,62.0,ONGOING,MP003,IDA-UP-01
SAMPLE-MH-103,Borewell Drilling and Pipe Laying in Shirur,Maharashtra,Pune,Drinking Water Supply,22.0,22.0,COMPLETED,MP005,IDA-MH-01
SAMPLE-TN-104,Upgradation of Science Lab at Government School Tuticorin,Tamil Nadu,Thoothukudi,School Building,40.0,39.0,ONGOING,MP007,IDA-TN-01`;
    } else {
      sampleName = 'sample_mplads_expenditures_upload.csv';
      sampleCSV = `voucher_id,work_key,date,amount_lakh,vendor_id,description
VOUCH-NEW-01,SAMPLE-KA-101,2025-01-10,12.5,V001,Initial foundation and pole erection
VOUCH-NEW-02,SAMPLE-UP-102,2025-02-15,30.0,V003,Civil brickwork and slab casting
VOUCH-NEW-03,SAMPLE-MH-103,2024-11-20,22.0,V004,Completion of pipeline laying and pump test`;
    }

    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const file = new File([blob], sampleName, { type: 'text/csv' });
    setSelectedFiles([file]);
    setError(null);
    setUploadResult(null);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UploadCloud size={24} style={{ color: 'var(--accent)' }} />
            MPLADS Data Ingestion & Batch Processing
          </h1>
          <p className="page-subtitle">
            Ingest official CSV exports from MoSPI MPLADS portal with real-time schema validation and risk recalculation
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => loadSampleDataset('works')}>
            <Sparkles size={14} /> Sample Works CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => loadSampleDataset('expenditure')}>
            <Sparkles size={14} /> Sample Vouchers CSV
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="card mb-6">
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept=".csv"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <FileSpreadsheet size={48} style={{ color: 'var(--accent)', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 6 }}>
            Drag and drop MPLADS CSV files here, or <span className="highlight">browse</span>
          </h3>
          <p>
            Supports Works catalog, Sanction orders, Expenditure tranches, and Calamity allocation reports
          </p>
        </div>

        {selectedFiles.length > 0 && (
          <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div className="text-xs text-muted" style={{ fontWeight: 700, marginBottom: 8 }}>
              STAGED FOR INGESTION ({selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {selectedFiles.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius)',
                    background: 'var(--surface-2)',
                    fontSize: '0.85rem',
                  }}
                >
                  <span className="font-mono">{f.name}</span>
                  <span className="text-muted">{Math.round(f.size / 1024)} KB</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Parsing & Scoring Anomaly Signals...' : 'Process & Recalculate Risk Engine'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => { setSelectedFiles([]); setUploadResult(null); }}
                disabled={uploading}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-state">{error}</div>}

      {/* Upload Results & What Changed Report */}
      {uploadResult && (
        <div className="card mb-6" style={{ borderLeft: '4px solid var(--risk-low)' }}>
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--risk-low)' }} />
              Ingestion Execution Summary (What Changed)
            </span>
          </div>

          <div className="kpi-grid mb-4">
            <div className="kpi-card">
              <div className="kpi-label">Files Processed</div>
              <div className="kpi-value">{uploadResult.what_changed?.files_processed || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Rows Validated</div>
              <div className="kpi-value">{uploadResult.what_changed?.total_rows || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Valid Entries</div>
              <div className="kpi-value accent">{uploadResult.what_changed?.successful || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Schema Errors</div>
              <div className="kpi-value">{uploadResult.what_changed?.errors || 0}</div>
            </div>
          </div>

          {uploadResult.what_changed?.note && (
            <div style={{ padding: '8px 12px', borderRadius: 'var(--radius)', background: 'var(--surface-2)', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 12 }}>
              <Info size={14} style={{ display: 'inline', marginRight: 4 }} />
              {uploadResult.what_changed.note}
            </div>
          )}

          {uploadResult.results && uploadResult.results.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="text-xs text-muted" style={{ fontWeight: 700, marginBottom: 8 }}>
                PARSED DATASET BREAKDOWN:
              </div>
              {uploadResult.results.map((r, idx) => (
                <div key={idx} className="import-result-row">
                  <div className="font-bold truncate">{r.filename}</div>
                  <div className="text-xs text-muted">{r.dataset_type || 'MPLADS Records'}</div>
                  <div className="num font-bold">{r.row_count || 0} rows</div>
                  <div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 3,
                        background: r.status === 'SUCCESS' ? 'var(--risk-low-bg)' : 'var(--risk-watch-bg)',
                        color: r.status === 'SUCCESS' ? 'var(--risk-low)' : 'var(--risk-watch)',
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Historical Import Log */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={16} /> Batch Audit Ingestion History
          </span>
        </div>

        {history.length === 0 ? (
          <p className="text-muted text-sm">No recorded upload logs yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Dataset Type</th>
                  <th>Rows</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs">{h.filename}</td>
                    <td className="text-xs">{h.dataset_type || 'General'}</td>
                    <td className="num">{h.row_count || 0}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 3,
                          background: 'var(--risk-low-bg)',
                          color: 'var(--risk-low)',
                        }}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="text-xs text-muted font-mono">{h.imported_at?.slice(0, 19).replace('T', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
