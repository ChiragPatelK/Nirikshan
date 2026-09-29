import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, ArrowRight, Upload, MapPin, Building2, User } from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';
import { api } from '../services/api';

export default function RoleActionModal() {
  const { actionModal, closeActionModal, role, roleConfig, triggerRefresh } = useRole();
  const { isOpen, type, targetWork } = actionModal;

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // MP Recommend Form State
  const [recTitle, setRecTitle] = useState('');
  const [recCategory, setRecCategory] = useState('Drinking Water');
  const [recAmount, setRecAmount] = useState('25');
  const [recPanchayat, setRecPanchayat] = useState('Navalgund Gram Panchayat');
  const [recDesc, setRecDesc] = useState('Installation of 10,000 LPD solar-powered RO water purification facility for rural residents.');

  // DA Inspect Form State
  const [workKey, setWorkKey] = useState('');
  const [inspectorName, setInspectorName] = useState('Er. S. Patil (AEE, PWD Dharwad)');
  const [progressPercent, setProgressPercent] = useState('65');
  const [geotagVerified, setGeotagVerified] = useState(true);
  const [inspectionRemarks, setInspectionRemarks] = useState('Physical work matches technical estimates. Foundations and civil brickwork completed satisfactorily.');

  // SNA Escalate Form State
  const [escalateReason, setEscalateReason] = useState('Execution delayed by >120 days beyond sanction timeline');
  const [escalateNotes, setEscalateNotes] = useState('District implementing agency reports vendor delay. Requesting Ministry direction on contract re-tendering.');

  // Ministry Freeze Form State
  const [freezeReason, setFreezeReason] = useState('Critical anomaly detected: High similarity split-tender pattern');
  const [orderedBy, setOrderedBy] = useState('MoSPI Central Oversight & Vigilance Cell');

  useEffect(() => {
    if (targetWork) {
      setWorkKey(targetWork.internal_work_key || '');
    } else if (!workKey) {
      setWorkKey('IWK-KA-001');
    }
    setSuccessMsg('');
    setErrorMsg('');
  }, [isOpen, targetWork]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (type === 'RECOMMEND') {
        const res = await api.recommendWork({
          title: recTitle || 'MP Community Development Project',
          description: recDesc,
          category: recCategory,
          state: roleConfig.defaultState || 'Karnataka',
          district: roleConfig.defaultDistrict || 'Dharwad',
          mp_id: roleConfig.defaultMPId || 'MP001',
          recommended_amount_lakh: Number(recAmount) || 25,
          gram_panchayat: recPanchayat,
        });
        setSuccessMsg(res.message || 'Work recommendation successfully logged!');
      } else if (type === 'INSPECT') {
        const res = await api.inspectWork(workKey || 'IWK-KA-001', {
          inspector_name: inspectorName,
          physical_progress_percent: Number(progressPercent),
          geotag_verified: geotagVerified,
          remarks: inspectionRemarks,
        });
        setSuccessMsg(res.message || 'Physical verification certified!');
      } else if (type === 'ESCALATE') {
        const res = await api.escalateWork(workKey || 'IWK-KA-001', {
          reason: escalateReason,
          notes: escalateNotes,
          escalated_by: 'State Nodal Officer (Karnataka)',
        });
        setSuccessMsg(res.message || 'Work escalated to Central Ministry!');
      } else if (type === 'FREEZE') {
        const res = await api.freezeWork(workKey || 'IWK-KA-001', {
          reason: freezeReason,
          ordered_by: orderedBy,
        });
        setSuccessMsg(res.message || 'Forensic audit notice issued and funds frozen!');
      }

      triggerRefresh();
      setTimeout(() => {
        closeActionModal();
      }, 1600);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit action. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeActionModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: roleConfig.badgeColor || 'var(--accent)',
                  color: '#fff',
                }}
              >
                {roleConfig.badge}
              </span>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
                {type === 'RECOMMEND' && 'Recommend Community Development Work'}
                {type === 'INSPECT' && 'Record Physical Inspection & Geotag Verification'}
                {type === 'ESCALATE' && 'Escalate Work Anomaly to Central Ministry'}
                {type === 'FREEZE' && 'Order Forensic Audit & Freeze Disbursements'}
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
              Authorized action for: <strong>{roleConfig.name}</strong> ({roleConfig.authorityTitle})
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={closeActionModal} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Success / Error Message */}
        {successMsg && (
          <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.15)', borderLeft: '4px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center', gap: 8, margin: '12px 16px 0 16px', borderRadius: 4 }}>
            <CheckCircle size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', borderLeft: '4px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8, margin: '12px 16px 0 16px', borderRadius: 4 }}>
            <AlertTriangle size={18} />
            <span style={{ fontSize: '0.85rem' }}>{errorMsg}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
          {/* ================= MP RECOMMEND WORK FORM ================= */}
          {type === 'RECOMMEND' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="text-xs font-bold text-muted">Constituency & State</label>
                  <input
                    type="text"
                    disabled
                    value="Dharwad (Karnataka) — MP001"
                    className="form-control"
                    style={{ background: 'var(--surface-2)', opacity: 0.8 }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted">Work Category</label>
                  <select
                    className="form-control"
                    value={recCategory}
                    onChange={(e) => setRecCategory(e.target.value)}
                  >
                    <option value="Drinking Water">Drinking Water & RO Plants</option>
                    <option value="Road Construction">Road Construction & Bridges</option>
                    <option value="Education">Education, Schools & Anganwadis</option>
                    <option value="Healthcare">Healthcare Facilities & Clinics</option>
                    <option value="Sanitation">Sanitation, Drainage & Waste</option>
                    <option value="Community Hall">Community Hall & Public Infrastructure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted">Work Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar RO Drinking Water Station at Navalgund"
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="text-xs font-bold text-muted">Recommended Outlay (₹ in Lakhs)</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={recAmount}
                    onChange={(e) => setRecAmount(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted">Gram Panchayat / Locality</label>
                  <input
                    type="text"
                    required
                    value={recPanchayat}
                    onChange={(e) => setRecPanchayat(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted">Detailed Public Justification</label>
                <textarea
                  rows={3}
                  className="form-control"
                  value={recDesc}
                  onChange={(e) => setRecDesc(e.target.value)}
                  placeholder="Describe public necessity, estimated beneficiaries, and scope..."
                />
              </div>
            </div>
          )}

          {/* ================= DA INSPECT WORK FORM ================= */}
          {type === 'INSPECT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="text-xs font-bold text-muted">Work Key / Identifier</label>
                <input
                  type="text"
                  required
                  value={workKey}
                  onChange={(e) => setWorkKey(e.target.value)}
                  className="form-control"
                  placeholder="e.g. WRK-KA-001"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
                <div>
                  <label className="text-xs font-bold text-muted">Inspecting Officer Name & Designation</label>
                  <input
                    type="text"
                    required
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted">Physical Progress (%)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={progressPercent}
                      onChange={(e) => setProgressPercent(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontWeight: 700, minWidth: 42 }}>{progressPercent}%</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="geotag-check"
                  checked={geotagVerified}
                  onChange={(e) => setGeotagVerified(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <label htmlFor="geotag-check" style={{ fontSize: '0.82rem', cursor: 'pointer' }}>
                  <strong>Geotag Coordinates Verified:</strong> Inspection photos match surveyed GPS boundary coordinates.
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-muted">Inspection Findings & Certification Remarks</label>
                <textarea
                  rows={3}
                  className="form-control"
                  value={inspectionRemarks}
                  onChange={(e) => setInspectionRemarks(e.target.value)}
                  placeholder="Record structural measurements, materials quality, and milestone status..."
                />
              </div>
            </div>
          )}

          {/* ================= SNA ESCALATE FORM ================= */}
          {type === 'ESCALATE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="text-xs font-bold text-muted">Work Key to Escalate</label>
                <input
                  type="text"
                  required
                  value={workKey}
                  onChange={(e) => setWorkKey(e.target.value)}
                  className="form-control"
                  placeholder="e.g. WRK-KA-001"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted">Primary Reason for Escalation</label>
                <select
                  className="form-control"
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                >
                  <option value="Execution delayed by >120 days beyond sanction timeline">Severe Delay (&gt;120 days)</option>
                  <option value="Cost escalation exceeding sanctioned limits without revision approval">Unauthorized Cost Overrun</option>
                  <option value="Critical vendor cartel or split-tender pattern flagged by AI">Vendor Concentration / Cartel Risk</option>
                  <option value="Inter-district or inter-agency boundary dispute">Inter-Agency Bottleneck</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted">State Nodal Authority Observations</label>
                <textarea
                  rows={3}
                  className="form-control"
                  value={escalateNotes}
                  onChange={(e) => setEscalateNotes(e.target.value)}
                  placeholder="Detail state-level review findings and requested MoSPI directive..."
                />
              </div>
            </div>
          )}

          {/* ================= MINISTRY FREEZE FORM ================= */}
          {type === 'FREEZE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.12)', borderLeft: '4px solid var(--risk-critical)', borderRadius: 4 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--risk-critical)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={16} /> Statutory Central Freeze Notice
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text)', marginTop: 4 }}>
                  Invoking MoSPI MPLADS Surveillance Guidelines Rule 12.3: Freezes further installment release pending Central forensic audit.
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted">Target Work Key</label>
                <input
                  type="text"
                  required
                  value={workKey}
                  onChange={(e) => setWorkKey(e.target.value)}
                  className="form-control"
                  placeholder="e.g. WRK-KA-001"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted">Forensic Audit Grounds</label>
                <select
                  className="form-control"
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                >
                  <option value="Critical anomaly detected: High similarity split-tender pattern">Split-Tender Cluster Anomaly</option>
                  <option value="Duplicate work specification in same Gram Panchayat within 24 months">Potential Duplicate Asset Sanction</option>
                  <option value="Expenditure recorded with missing milestone verification geotags">Missing Geotag & Physical Evidence</option>
                  <option value="Vendor debarment flag triggered by Central Vigilance Commission">Vendor Debarment / Sanction Violation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted">Authorized By</label>
                <input
                  type="text"
                  required
                  value={orderedBy}
                  onChange={(e) => setOrderedBy(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={closeActionModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading}
              style={{
                background: type === 'FREEZE' ? 'var(--risk-critical)' : undefined,
                borderColor: type === 'FREEZE' ? 'var(--risk-critical)' : undefined,
              }}
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  {type === 'RECOMMEND' && 'Submit Recommendation'}
                  {type === 'INSPECT' && 'Certify Inspection & Progress'}
                  {type === 'ESCALATE' && 'Escalate to Ministry'}
                  {type === 'FREEZE' && 'Issue Freeze & Audit Order'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
