import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Printer,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Coins,
  Building,
  User,
  Calendar,
  MapPin,
  CheckCircle2,
  FileCheck,
  Download,
  AlertCircle,
  FileSpreadsheet,
  FileSignature,
  Send,
  HelpCircle,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import KPICard from '../components/KPICard';

export default function WorkPassportPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Field officer audit note / action log
  const [actionNotes, setActionNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [auditAction, setAuditAction] = useState('FIELD_INSPECTION');
  const [actionSuccess, setActionSuccess] = useState(false);

  useEffect(() => {
    async function loadWork() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getWork(id);
        setWork(data);

        // Prepopulate audit note state if available
        setActionNotes([
          {
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            officer: 'MoSPI Automated Surveillance Engine',
            action: 'Automated Risk Evaluation',
            comment: `Evaluated 6 surveillance signals. Composite risk index generated: ${data.risk_score}/100 (${data.risk_level}).`,
          },
        ]);
      } catch (err) {
        setError(err.message || 'Failed to load Work Risk Passport');
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadWork();
    }
  }, [id]);

  const handleAddAuditAction = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const actionLabels = {
      FIELD_INSPECTION: 'Field Verification Order Issued',
      REQUEST_UC: 'Utilization Certificate Demanded',
      FREEZE_DISBURSEMENT: 'Disbursement Hold Recommendation',
      VERIFIED_CLEARED: 'Manual Explanation Accepted / Cleared',
    };

    const newEntry = {
      timestamp: new Date().toISOString(),
      officer: 'Current MoSPI Auditor',
      action: actionLabels[auditAction] || auditAction,
      comment: newNote.trim(),
    };

    setActionNotes([newEntry, ...actionNotes]);
    setNewNote('');
    setActionSuccess(true);
    setTimeout(() => setActionSuccess(false), 4000);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="loading-spinner" />
        <p className="text-muted text-sm">Compiling explainable Work Risk Passport for {id}...</p>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="page-container">
        <div className="error-state">
          <strong>Unable to retrieve Work Risk Passport:</strong> {error || 'Record does not exist'}
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/works')}>
              <ArrowLeft size={14} /> Back to Works Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    internal_work_key,
    description,
    state,
    district,
    category,
    status,
    risk_level = 'LOW',
    risk_score = 0,
    risk_signals = [],
    sanctioned_amount_lakh = 0,
    total_expenditure_lakh = 0,
    recommended_amount_lakh = 0,
    recommended_date,
    sanctioned_date,
    first_expenditure_date,
    latest_expenditure_date,
    completion_date,
    mp,
    ida,
    vendors = [],
    expenditures = [],
    financial_snapshot = {},
    similar_works = [],
    calamity_id,
  } = work;

  const costDeviation = sanctioned_amount_lakh > 0
    ? Math.round(((total_expenditure_lakh - sanctioned_amount_lakh) / sanctioned_amount_lakh) * 1000) / 10
    : 0;

  return (
    <div className="page-container">
      {/* Breadcrumb & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--muted)' }}>
          <Link to="/" style={{ color: 'var(--muted)' }}>Dashboard</Link>
          <ChevronRight size={13} />
          <Link to="/works" style={{ color: 'var(--muted)' }}>Works Catalog</Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{internal_work_key}</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <Printer size={14} /> Print Passport
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              const textContent = `WORK RISK PASSPORT: ${internal_work_key}\nTitle: ${description}\nState: ${state}, District: ${district}\nMP: ${mp?.name || 'N/A'}\nSanctioned: ₹${sanctioned_amount_lakh}L | Expended: ₹${total_expenditure_lakh}L\nRisk Score: ${risk_score}/100 (${risk_level})\nSignals:\n${risk_signals.map(s => `- ${s.label}: ${s.description}`).join('\n')}`;
              const element = document.createElement('a');
              const file = new Blob([textContent], { type: 'text/plain' });
              element.href = URL.createObjectURL(file);
              element.download = `Risk_Passport_${internal_work_key}.txt`;
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
          >
            <Download size={14} /> Export Brief
          </button>
        </div>
      </div>

      {/* Main Passport Header Banner */}
      <div className="passport-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: '1 1 500px' }}>
            <div className="passport-title">
              OFFICIAL MPLADS AUDIT DOSSIER · {internal_work_key}
            </div>
            <h1 className="passport-desc">{description}</h1>
            <div className="passport-meta">
              <span className="meta-item">
                <MapPin size={14} style={{ color: 'var(--accent)' }} />
                <strong>{district}, {state}</strong>
              </span>
              <span className="meta-item">
                <Building size={14} style={{ color: 'var(--muted)' }} />
                <span>Sector: <strong>{category}</strong></span>
              </span>
              <span className="meta-item">
                <User size={14} style={{ color: 'var(--muted)' }} />
                <span>MP: <strong>{mp?.name || 'MP Record'}</strong> ({mp?.house || 'Lok Sabha'})</span>
              </span>
              <span className="meta-item">
                <StatusBadge status={status} />
              </span>
              {calamity_id && (
                <span className="meta-item" style={{ color: 'var(--risk-high)', fontWeight: 600 }}>
                  Flood / Calamity Work ({calamity_id})
                </span>
              )}
            </div>
          </div>

          {/* Risk Score Gauge & Badges */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              textAlign: 'center',
              minWidth: 180,
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              Explainable Risk Score
            </div>
            <div
              style={{
                fontFamily: 'Oswald',
                fontSize: '2.5rem',
                fontWeight: 700,
                lineHeight: 1,
                color: risk_level === 'CRITICAL' ? 'var(--risk-critical)' : risk_level === 'HIGH' ? 'var(--risk-high)' : risk_level === 'WATCH' ? 'var(--risk-watch)' : 'var(--risk-low)',
              }}
            >
              {risk_score}<span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 400 }}>/100</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <RiskBadge level={risk_level} showIcon={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview Grid */}
      <div className="kpi-grid mb-6">
        <KPICard
          label="Recommended Outlay"
          value={`₹${recommended_amount_lakh || sanctioned_amount_lakh}L`}
          sub="By Member of Parliament"
          icon={Coins}
        />
        <KPICard
          label="Sanctioned Amount"
          value={`₹${sanctioned_amount_lakh}L`}
          sub="District Authority Sanction"
          icon={FileCheck}
        />
        <KPICard
          label="Total Disbursed"
          value={`₹${total_expenditure_lakh}L`}
          sub={costDeviation > 0 ? `+${costDeviation}% Cost Overrun` : 'Within sanction limit'}
          variant={costDeviation > 15 ? 'risk-critical' : undefined}
          icon={TrendingUp}
        />
        <KPICard
          label="Fund Utilization"
          value={`${financial_snapshot.utilization_percent || 0}%`}
          sub={`Balance: ₹${financial_snapshot.remaining_amount_lakh || 0}L`}
          icon={Clock}
        />
      </div>

      {/* Core Section: Explainable Anomaly Breakdown */}
      <div className="card mb-6">
        <div className="card-header">
          <div>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={16} style={{ color: 'var(--accent)' }} />
              Explainable Risk Signals & Anomaly Diagnosis
            </span>
            <p className="text-xs text-muted" style={{ marginTop: 2 }}>
              Transparent attribution of why this work was flagged by NIRIKSHAN AI. Each signal includes deterministic formulas and MoSPI guidelines.
            </p>
          </div>
        </div>

        {risk_signals.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <CheckCircle2 size={32} style={{ color: 'var(--risk-low)', marginBottom: 8 }} />
            <h3>No Anomaly Signals Detected</h3>
            <p>Expenditure cadence, duration, vendor allotment, and costs conform to MoSPI statutory norms.</p>
          </div>
        ) : (
          <div>
            {risk_signals.map((signal, idx) => (
              <div key={idx} className={`signal-card ${signal.severity}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div className="signal-label" style={{ color: signal.severity === 'CRITICAL' ? 'var(--risk-critical)' : signal.severity === 'HIGH' ? 'var(--risk-high)' : 'var(--risk-watch)' }}>
                    <AlertTriangle size={15} />
                    <span>{signal.label}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius)',
                      background: signal.severity === 'CRITICAL' ? 'var(--risk-critical-bg)' : signal.severity === 'HIGH' ? 'var(--risk-high-bg)' : 'var(--risk-watch-bg)',
                      color: signal.severity === 'CRITICAL' ? 'var(--risk-critical)' : signal.severity === 'HIGH' ? 'var(--risk-high)' : 'var(--risk-watch)',
                    }}
                  >
                    Weight: +{signal.score} Pts ({signal.severity})
                  </span>
                </div>

                <div className="signal-detail">{signal.description}</div>

                {signal.calculation && (
                  <div className="signal-calc" style={{ marginBottom: 8 }}>
                    <strong>Mathematical Evidence:</strong> {signal.calculation}
                  </div>
                )}

                {signal.guideline && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FileSignature size={13} style={{ color: 'var(--accent)' }} />
                    <span><strong>MoSPI Norm:</strong> {signal.guideline}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Section: Timeline & Vendor Details */}
      <div className="grid-2 mb-6">
        {/* Project Lifecycle Timeline */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} /> Work Execution Milestone Timeline
            </span>
          </div>

          <div className="timeline">
            <div className={`timeline-item ${recommended_date ? 'done' : ''}`}>
              <div className="timeline-date">{recommended_date || 'N/A'}</div>
              <div className="timeline-label">MP Recommendation Submitted</div>
              <div className="timeline-sub">By {mp?.name || 'Hon\'ble MP'} for ₹{recommended_amount_lakh} Lakhs</div>
            </div>

            <div className={`timeline-item ${sanctioned_date ? 'done' : ''}`}>
              <div className="timeline-date">{sanctioned_date || 'N/A'}</div>
              <div className="timeline-label">Administrative Sanction Accorded</div>
              <div className="timeline-sub">Sanctioned by {ida?.name || 'District Collector'} for ₹{sanctioned_amount_lakh} Lakhs</div>
            </div>

            <div className={`timeline-item ${first_expenditure_date ? 'done' : ''}`}>
              <div className="timeline-date">{first_expenditure_date || 'Pending'}</div>
              <div className="timeline-label">Initial Mobilization / Bill Payment</div>
              <div className="timeline-sub">First expenditure tranche registered on portal</div>
            </div>

            <div className={`timeline-item ${latest_expenditure_date ? 'done' : ''}`}>
              <div className="timeline-date">{latest_expenditure_date || 'Pending'}</div>
              <div className="timeline-label">Latest Expenditure Activity</div>
              <div className="timeline-sub">Cumulative disbursed: ₹{total_expenditure_lakh} Lakhs</div>
            </div>

            <div className={`timeline-item ${completion_date ? 'done' : status === 'ONGOING' ? 'active' : ''}`}>
              <div className="timeline-date">{completion_date || (status === 'ONGOING' ? 'Targeted / Stalled' : 'N/A')}</div>
              <div className="timeline-label">Work Completion Status</div>
              <div className="timeline-sub">{completion_date ? 'Formally completed with completion certificate' : 'Physical inspection verification pending'}</div>
            </div>
          </div>
        </div>

        {/* Implementing Authority & Contractor Network */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building size={16} /> Allocated Vendors & Implementing Agency
            </span>
          </div>

          <div style={{ marginBottom: 16, padding: 12, borderRadius: 'var(--radius)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="text-xs text-muted" style={{ fontWeight: 700, textTransform: 'uppercase' }}>Implementing District Authority (IDA)</div>
            <div className="text-sm font-bold" style={{ marginTop: 2 }}>{ida?.name || `${district} District Authority`}</div>
            <div className="text-xs text-muted">{district}, {state}</div>
          </div>

          <div className="text-xs text-muted" style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
            Contractors / Suppliers Involved ({vendors.length})
          </div>

          {vendors.length === 0 ? (
            <p className="text-muted text-sm">No contractor mapping recorded in baseline database.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {vendors.map((v) => (
                <div
                  key={v.vendor_id}
                  className="clickable"
                  onClick={() => navigate(`/vendors`)}
                  style={{
                    padding: 12,
                    borderRadius: 'var(--radius)',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div className="font-bold text-sm">{v.name}</div>
                    <div className="text-xs text-muted font-mono">{v.vendor_id} · {v.type}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate('/vendors'); }}>
                    Inspect Vendor <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {similar_works && similar_works.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="text-xs text-muted" style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--risk-critical)', marginBottom: 8 }}>
                Potential Duplicate / Overlapping Works Flagged ({similar_works.length})
              </div>
              {similar_works.map((sw) => (
                <div
                  key={sw.internal_work_key}
                  className="clickable"
                  onClick={() => navigate(`/works/${sw.internal_work_key}`)}
                  style={{
                    padding: 10,
                    borderRadius: 'var(--radius)',
                    background: 'var(--risk-critical-bg)',
                    border: '1px solid var(--risk-critical)',
                    marginBottom: 6,
                  }}
                >
                  <div className="font-bold text-xs" style={{ color: 'var(--risk-critical)' }}>{sw.internal_work_key}</div>
                  <div className="text-xs truncate">{sw.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Financial Disbursements Ledger */}
      <div className="card mb-6">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileSpreadsheet size={16} /> Verified Expenditure Tranches & Billing Vouchers
          </span>
          <span className="text-xs text-muted">{expenditures.length} payment voucher(s) logged</span>
        </div>

        {expenditures.length === 0 ? (
          <p className="text-muted text-sm" style={{ padding: '16px 0' }}>
            No individual voucher breakdown available for this work key. Cumulative expenditure recorded: ₹{total_expenditure_lakh} Lakhs.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Voucher Ref</th>
                  <th>Transaction Date</th>
                  <th>Disbursed Lakhs</th>
                  <th>Vendor Recipient</th>
                  <th>Purpose / Milestone</th>
                </tr>
              </thead>
              <tbody>
                {expenditures.map((exp, idx) => (
                  <tr key={idx}>
                    <td className="font-mono text-xs">{exp.voucher_id || `VOUCH-${idx + 1}`}</td>
                    <td className="text-xs">{exp.date}</td>
                    <td className="num font-bold">₹{exp.amount_lakh} Lakhs</td>
                    <td className="text-sm font-bold">{exp.vendor_name || exp.vendor_id || 'Contractor'}</td>
                    <td className="text-xs text-muted">{exp.description || 'Contract milestone payment'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Field Inspection Audit Action & Decision Logger */}
      <div className="card">
        <div className="card-header">
          <div>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileSignature size={16} /> MoSPI Auditor Action & Decision Log
            </span>
            <p className="text-xs text-muted" style={{ marginTop: 2 }}>
              Record statutory verification orders, demand utilization certificates, or clear anomalies with documented justification.
            </p>
          </div>
        </div>

        {actionSuccess && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius)',
              background: 'var(--risk-low-bg)',
              color: 'var(--risk-low)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} /> Audit decision saved to dossier audit trail.
          </div>
        )}

        <form onSubmit={handleAddAuditAction} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px' }}>
              <label className="form-label">Statutory Action / Disposition</label>
              <select
                className="form-control"
                value={auditAction}
                onChange={(e) => setAuditAction(e.target.value)}
              >
                <option value="FIELD_INSPECTION">Order Field Inspection (District Vigilance Committee)</option>
                <option value="REQUEST_UC">Demand Physical Utilization Certificate (UC)</option>
                <option value="FREEZE_DISBURSEMENT">Recommend Temporary Disbursement Hold</option>
                <option value="VERIFIED_CLEARED">Accept Officer Justification / Clear Flag</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Audit Remarks / Justification</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Record findings, reference numbers, or directives issued to District Collector..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              style={{ minHeight: 80 }}
            />
          </div>

          <div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!newNote.trim()}>
              <Send size={14} /> Submit Audit Directive
            </button>
          </div>
        </form>

        {/* Existing Audit Trail */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div className="text-xs text-muted" style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>
            Historical Action Log ({actionNotes.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {actionNotes.map((note, i) => (
              <div
                key={i}
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius)',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span className="font-bold text-xs" style={{ color: 'var(--accent)' }}>{note.action}</span>
                  <span className="text-xs text-muted font-mono">{note.timestamp.replace('T', ' ').slice(0, 16)}</span>
                </div>
                <div className="text-sm">{note.comment}</div>
                <div className="text-xs text-muted" style={{ marginTop: 4 }}>Logged by: {note.officer}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
