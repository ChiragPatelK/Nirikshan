import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Coins,
  Repeat,
  Zap,
  Building
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';

export default function AlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedSignalType, setSelectedSignalType] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getAlerts();
        // data can be array or { alerts: [...] }
        const list = Array.isArray(data) ? data : data.alerts || [];
        setAlerts(list);
        setFilteredAlerts(list);
      } catch (err) {
        setError(err.message || 'Failed to fetch active alerts');
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  useEffect(() => {
    let result = [...alerts];

    if (selectedSeverity !== 'ALL') {
      result = result.filter((a) => a.risk_level === selectedSeverity);
    }

    if (selectedSignalType !== 'ALL') {
      result = result.filter((a) =>
        (a.risk_signals || []).some((s) => s.id === selectedSignalType)
      );
    }

    setFilteredAlerts(result);
  }, [selectedSignalType, selectedSeverity, alerts]);

  const signalFilters = [
    { id: 'ALL', label: 'All Signals' },
    { id: 'COST_DEVIATION', label: 'Cost Escalation' },
    { id: 'PAYMENT_VELOCITY', label: 'Velocity Spike' },
    { id: 'DURATION_EXCESS', label: 'Stalled / Inactive' },
    { id: 'POTENTIAL_DUPLICATE', label: 'Duplicate Flag' },
    { id: 'VENDOR_CONCENTRATION', label: 'Vendor Monopoly' },
    { id: 'LOW_UTILIZATION', label: 'Underutilized' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={24} style={{ color: 'var(--risk-critical)' }} />
            High & Critical Risk Surveillance Queue
          </h1>
          <p className="page-subtitle">
            Prioritized work anomalies detected by statistical threshold breaches and guideline non-compliance
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${selectedSeverity === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedSeverity('ALL')}
          >
            All ({alerts.length})
          </button>
          <button
            className={`btn btn-sm ${selectedSeverity === 'CRITICAL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedSeverity('CRITICAL')}
            style={{ color: 'var(--risk-critical)' }}
          >
            Critical ({alerts.filter((a) => a.risk_level === 'CRITICAL').length})
          </button>
          <button
            className={`btn btn-sm ${selectedSeverity === 'HIGH' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedSeverity('HIGH')}
            style={{ color: 'var(--risk-high)' }}
          >
            High ({alerts.filter((a) => a.risk_level === 'HIGH').length})
          </button>
        </div>
      </div>

      {/* Signal Type Filter Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {signalFilters.map((sig) => (
          <button
            key={sig.id}
            type="button"
            className={`btn btn-sm ${selectedSignalType === sig.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedSignalType(sig.id)}
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            {sig.label}
          </button>
        ))}
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="loading-spinner" />
          <p className="text-muted text-sm">Scanning work database for anomaly patterns...</p>
        </div>
      )}

      {error && <div className="error-state">{error}</div>}

      {/* Alerts Cards List */}
      {!loading && !error && filteredAlerts.length === 0 && (
        <div className="card empty-state">
          <CheckCircle2 size={36} style={{ color: 'var(--risk-low)', marginBottom: 8 }} />
          <h3>No Anomalies Matching Filters</h3>
          <p>No works meet the selected severity or signal criteria.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredAlerts.map((work) => {
          const isCritical = work.risk_level === 'CRITICAL';
          return (
            <div
              key={work.internal_work_key}
              className="card"
              style={{
                borderLeft: `4px solid ${isCritical ? 'var(--risk-critical)' : 'var(--risk-high)'}`,
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: '1 1 500px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className="font-mono text-xs" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                      {work.internal_work_key}
                    </span>
                    <span className="text-xs text-muted">·</span>
                    <span className="text-xs text-muted font-bold">{work.district}, {work.state}</span>
                    <span className="text-xs text-muted">·</span>
                    <StatusBadge status={work.status} />
                  </div>

                  <h3
                    style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 6, cursor: 'pointer' }}
                    onClick={() => navigate(`/works/${work.internal_work_key}`)}
                  >
                    {work.description}
                  </h3>

                  <div className="text-xs text-muted" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span>MP: <strong>{work.mp?.name || 'N/A'}</strong></span>
                    <span>Sanctioned: <strong>₹{work.sanctioned_amount_lakh}L</strong></span>
                    <span>Disbursed: <strong>₹{work.total_expenditure_lakh}L</strong></span>
                    <span>Category: <strong>{work.category}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <RiskBadge level={work.risk_level} score={work.risk_score} />
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/works/${work.internal_work_key}`)}
                  >
                    Open Risk Passport <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Anomaly Signal Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8, marginTop: 12 }}>
                {(work.risk_signals || []).map((sig, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 10,
                      borderRadius: 'var(--radius)',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: sig.severity === 'CRITICAL' ? 'var(--risk-critical)' : 'var(--risk-high)', marginBottom: 2 }}>
                      {sig.label} (+{sig.score} pts)
                    </div>
                    <div className="text-muted text-xs">{sig.description}</div>
                    {sig.calculation && (
                      <div className="font-mono text-xs" style={{ marginTop: 4, opacity: 0.85 }}>
                        {sig.calculation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
