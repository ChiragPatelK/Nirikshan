import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  AlertTriangle,
  ArrowRight,
  Search,
  ExternalLink,
  Coins,
  FileCheck,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function VendorsPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorDetail, setVendorDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function loadVendors() {
      try {
        setLoading(true);
        const res = await api.getVendors();
        setVendors(res.vendors || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch vendor network');
      } finally {
        setLoading(false);
      }
    }
    loadVendors();
  }, []);

  const handleSelectVendor = async (v) => {
    setSelectedVendor(v);
    try {
      setDetailLoading(true);
      const full = await api.getVendor(v.vendor_id);
      setVendorDetail(full);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.vendor_id.toLowerCase().includes(search.toLowerCase()) ||
    v.type.toLowerCase().includes(search.toLowerCase()) ||
    v.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={24} style={{ color: 'var(--accent)' }} />
            Contractor & Vendor Surveillance Network
          </h1>
          <p className="page-subtitle">
            Cross-district procurement concentration, repeat contract awards, and risk exposure tracking
          </p>
        </div>
        <div style={{ width: 280 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search contractor or trade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="loading-spinner" />
          <p className="text-muted text-sm">Evaluating vendor network concentration indices...</p>
        </div>
      )}

      {error && <div className="error-state">{error}</div>}

      <div className="grid-2-1">
        {/* Vendor Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((v) => {
            const flaggedCount = (v.recent_works || []).filter((w) => ['HIGH', 'CRITICAL'].includes(w.risk_level)).length;
            const isSelected = selectedVendor?.vendor_id === v.vendor_id;

            return (
              <div
                key={v.vendor_id}
                className="card clickable"
                style={{
                  borderColor: isSelected ? 'var(--accent)' : undefined,
                  background: isSelected ? 'var(--surface-2)' : 'var(--surface)',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => handleSelectVendor(v)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="font-mono text-xs" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                      {v.vendor_id}
                    </span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: 2 }}>{v.name}</h3>
                    <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                      {v.type} · Based in {v.state}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {flaggedCount > 0 ? (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius)',
                          background: 'var(--risk-critical-bg)',
                          color: 'var(--risk-critical)',
                        }}
                      >
                        {flaggedCount} Flagged Work{flaggedCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius)',
                          background: 'var(--risk-low-bg)',
                          color: 'var(--risk-low)',
                        }}
                      >
                        Low Exposure
                      </span>
                    )}
                  </div>
                </div>

                {/* Sample recent works list */}
                {v.recent_works && v.recent_works.length > 0 && (
                  <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                    <div className="text-xs text-muted" style={{ fontWeight: 600, marginBottom: 4 }}>
                      Associated Allocations ({v.recent_works.length}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {v.recent_works.map((rw) => (
                        <span
                          key={rw.internal_work_key}
                          style={{
                            fontSize: '0.7rem',
                            fontFamily: 'monospace',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius)',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {rw.internal_work_key} ({rw.risk_level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Vendor Detail Panel */}
        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 'calc(var(--header-h) + 16px)' }}>
          <div className="card-header">
            <span className="card-title">Vendor Audit Profile</span>
          </div>

          {selectedVendor ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <span className="font-mono text-xs" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  {selectedVendor.vendor_id}
                </span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 4 }}>{selectedVendor.name}</h2>
                <p className="text-xs text-muted">{selectedVendor.type} · Jurisdiction: {selectedVendor.state}</p>
              </div>

              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div className="loading-spinner" />
                </div>
              ) : vendorDetail ? (
                <div>
                  <div style={{ padding: 12, borderRadius: 'var(--radius)', background: 'var(--surface-2)', border: '1px solid var(--border)', marginBottom: 16 }}>
                    <div className="text-xs text-muted" style={{ fontWeight: 700 }}>PORTFOLIO SUMMARY</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                      <span className="text-xs">Total Contracts:</span>
                      <span className="num font-bold">{vendorDetail.works?.length || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span className="text-xs">Cumulative Billing:</span>
                      <span className="num font-bold">
                        ₹{Math.round(vendorDetail.works?.reduce((sum, w) => sum + (w.total_expenditure_lakh || 0), 0) || 0)} Lakhs
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-muted" style={{ fontWeight: 700, marginBottom: 8 }}>
                    EXECUTED WORKS & INTEGRITY STATUS:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
                    {(vendorDetail.works || []).map((w) => (
                      <div
                        key={w.internal_work_key}
                        className="clickable"
                        onClick={() => navigate(`/works/${w.internal_work_key}`)}
                        style={{
                          padding: 10,
                          borderRadius: 'var(--radius)',
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span className="font-mono text-xs font-bold" style={{ color: 'var(--accent)' }}>
                            {w.internal_work_key}
                          </span>
                          <RiskBadge level={w.risk_level} score={w.risk_score} showIcon={false} />
                        </div>
                        <div className="text-xs truncate">{w.description}</div>
                        <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                          Sanction: ₹{w.sanctioned_amount_lakh}L · Expended: ₹{w.total_expenditure_lakh}L
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="empty-state">
              <Building2 size={36} style={{ color: 'var(--muted)', margin: '0 auto 12px' }} />
              <h4>Select a Vendor</h4>
              <p className="text-xs">Choose any contractor from the list to audit contract distribution and flag correlations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
