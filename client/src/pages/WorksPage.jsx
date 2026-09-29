import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ArrowRight,
  Download,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { useRole, ROLES } from '../context/RoleContext';

export default function WorksPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role, roleConfig, roleState, roleDistrict, roleMPId, openActionModal, refreshTrigger } = useRole();

  // Filters state initialized from query params
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [state, setState] = useState(searchParams.get('state') || '');
  const [risk, setRisk] = useState(searchParams.get('risk') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [roleFilterActive, setRoleFilterActive] = useState(role !== 'MINISTRY');

  const [worksData, setWorksData] = useState({ works: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load works when filters change
  const fetchWorks = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        query,
        state: state || (roleFilterActive && role === 'STATE' ? roleState : undefined),
        district: roleFilterActive && (role === 'DISTRICT' || role === 'MP') ? roleDistrict : undefined,
        mp_id: roleFilterActive && role === 'MP' ? roleMPId : undefined,
        risk,
        status,
        category,
        page,
        limit: 15,
      };

      // Filter out empty params
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);

      const res = await api.getWorks(params);
      const list = res.works || res.results || (Array.isArray(res) ? res : []);
      setWorksData({
        ...res,
        works: list,
        results: list,
        total: res.total ?? list.length,
        totalPages: res.totalPages || Math.ceil((res.total ?? list.length) / 15) || 1,
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch works data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRoleFilterActive(role !== 'MINISTRY');
  }, [role]);

  useEffect(() => {
    fetchWorks();
  }, [state, risk, status, category, page, role, roleFilterActive, refreshTrigger]);

  // Sync state with URL search query param if user typed and pressed Enter or submitted
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchWorks();
  };

  const handleResetFilters = () => {
    setQuery('');
    setState('');
    setRisk('');
    setStatus('');
    setCategory('');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(query || state || risk || status || category);

  const statesList = [
    'Karnataka',
    'Uttar Pradesh',
    'Maharashtra',
    'Tamil Nadu',
    'West Bengal',
    'Kerala',
    'Rajasthan'
  ];

  const categoriesList = [
    'Road Construction',
    'Drinking Water Supply',
    'Community Hall',
    'Bridge',
    'School Building',
    'Flood Relief Infrastructure',
    'Cyclone Relief Infrastructure',
    'Irrigation',
    'Drainage',
    'Fishing Harbour',
    'Sanitation',
    'Anganwadi'
  ];

  const worksList = worksData?.works || worksData?.results || [];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">MPLADS Works Explorer</h1>
          <p className="page-subtitle">
            Catalog of sanctioned works, physical progress, financial tracking, and real-time risk scores
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => openActionModal()}
            style={{
              background: role === 'MINISTRY' ? 'var(--risk-critical)' : roleConfig.badgeColor,
              borderColor: role === 'MINISTRY' ? 'var(--risk-critical)' : roleConfig.badgeColor,
              color: '#fff',
              fontWeight: 700,
            }}
          >
            + {roleConfig.actionLabel}
          </button>
          {hasActiveFilters && (
            <button className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
              <RotateCcw size={14} /> Reset Filters
            </button>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                ['WorkKey,Description,State,SanctionedLakhs,ExpenditureLakhs,RiskLevel,RiskScore']
                  .concat(
                    worksList.map(
                      (w) =>
                        `"${w.internal_work_key}","${(w.description || '').replace(/"/g, '""')}","${w.state}",${w.sanctioned_amount_lakh},${w.total_expenditure_lakh},"${w.risk_level}",${w.risk_score}`
                    )
                  )
                  .join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `mplads_works_audit_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Role Filter Status Banner */}
      {role !== 'MINISTRY' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            marginBottom: 16,
            background: 'var(--surface-1)',
            borderLeft: `4px solid ${roleConfig.badgeColor || 'var(--accent)'}`,
            borderRadius: 'var(--radius)',
            border: `1px solid var(--border)`,
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius)',
                background: roleConfig.badgeColor,
                color: '#fff',
              }}
            >
              {roleConfig.badge}
            </span>
            <span style={{ fontSize: '0.84rem' }}>
              {roleFilterActive ? (
                <>
                  Filtered to <strong>{role === 'MP' ? 'Dharwad Constituency (Hon\'ble MP Pralhad Joshi)' : role === 'DISTRICT' ? 'Dharwad District (IDA)' : 'Karnataka State (SNA)'}</strong> ({worksData.total} works)
                </>
              ) : (
                <>
                  Viewing <strong>All India National Works</strong> ({worksData.total} works)
                </>
              )}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setRoleFilterActive(!roleFilterActive)}
          >
            {roleFilterActive ? 'View All India' : `Filter to My ${role === 'MP' ? 'Constituency' : role === 'DISTRICT' ? 'District' : 'State'}`}
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card mb-4" style={{ padding: 16 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: 36, minHeight: 38 }}
              placeholder="Search by ID, keyword, vendor, MP name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select
              className="filter-select"
              value={state}
              onChange={(e) => { setState(e.target.value); setPage(1); }}
            >
              <option value="">All States</option>
              {statesList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={risk}
              onChange={(e) => { setRisk(e.target.value); setPage(1); }}
            >
              <option value="">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="WATCH">Watchlist</option>
              <option value="LOW">Low / Normal</option>
            </select>

            <select
              className="filter-select"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="SANCTIONED">Sanctioned</option>
              <option value="RECOMMENDED">Recommended</option>
            </select>

            <select
              className="filter-select"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {categoriesList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button type="submit" className="btn btn-primary btn-sm">
              <Filter size={14} /> Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="text-sm text-muted">
          Showing <strong>{worksList.length}</strong> of <strong>{worksData.total || worksList.length}</strong> works
          {hasActiveFilters && <span> matching filters</span>}
        </div>
        {worksData.totalPages > 1 && (
          <div className="text-xs text-muted">
            Page {page} of {worksData.totalPages}
          </div>
        )}
      </div>

      {/* Error state */}
      {error && <div className="error-state">{error}</div>}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Work Key</th>
                <th>Work Description & Sector</th>
                <th>State & District</th>
                <th>MP Recommendation</th>
                <th>Sanctioned</th>
                <th>Expended</th>
                <th>Utilization</th>
                <th>Status</th>
                <th>Risk Rating</th>
                <th style={{ textAlign: 'right' }}>Passport</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 48 }}>
                    <div className="loading-spinner" />
                    <p className="text-muted text-sm">Querying works database...</p>
                  </td>
                </tr>
              ) : worksList.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 48 }}>
                    <div className="empty-state">
                      <h3>No works found</h3>
                      <p>Try widening your search terms or clearing selected filters.</p>
                      {hasActiveFilters && (
                        <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={handleResetFilters}>
                          Reset All Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                worksList.map((w) => {
                  const utilPercent = w.sanctioned_amount_lakh > 0
                    ? Math.min(100, Math.round((w.total_expenditure_lakh / w.sanctioned_amount_lakh) * 100))
                    : 0;

                  return (
                    <tr
                      key={w.internal_work_key}
                      onClick={() => navigate(`/works/${w.internal_work_key}`)}
                    >
                      <td className="font-mono text-xs" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                        {w.internal_work_key}
                      </td>
                      <td style={{ maxWidth: 260 }}>
                        <div className="font-bold text-sm truncate" title={w.description}>
                          {w.description}
                        </div>
                        <div className="text-xs text-muted font-mono">
                          {w.category}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm font-bold">{w.district}</div>
                        <div className="text-xs text-muted">{w.state}</div>
                      </td>
                      <td>
                        <div className="text-xs font-bold">{w.mp?.name || 'MP Record'}</div>
                        <div className="text-xs text-muted">{w.mp?.constituency}</div>
                      </td>
                      <td className="num font-bold">
                        ₹{w.sanctioned_amount_lakh}L
                      </td>
                      <td className="num">
                        ₹{w.total_expenditure_lakh}L
                      </td>
                      <td style={{ minWidth: 100 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${utilPercent}%`,
                                height: '100%',
                                background: utilPercent > 90 ? 'var(--risk-critical)' : 'var(--accent)',
                              }}
                            />
                          </div>
                          <span className="num text-xs">{utilPercent}%</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={w.status} />
                      </td>
                      <td>
                        <RiskBadge level={w.risk_level} score={w.risk_score} />
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                          {role === 'DISTRICT' && (
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.72rem', background: 'var(--surface-2)', border: '1px solid var(--border)', fontWeight: 600 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openActionModal('INSPECT', w);
                              }}
                              title="Record physical inspection & verify milestone"
                            >
                              Inspect
                            </button>
                          )}
                          {role === 'STATE' && (
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.72rem', background: 'var(--surface-2)', border: '1px solid var(--border)', fontWeight: 600 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openActionModal('ESCALATE', w);
                              }}
                              title="Escalate delay/anomaly to Central Ministry"
                            >
                              Escalate
                            </button>
                          )}
                          {role === 'MINISTRY' && ['HIGH', 'CRITICAL'].includes(w.risk_level) && (
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.72rem', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--risk-critical)', border: '1px solid var(--risk-critical)', fontWeight: 700 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openActionModal('FREEZE', w);
                              }}
                              title="Freeze disbursement & order forensic audit"
                            >
                              Freeze
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/works/${w.internal_work_key}`);
                            }}
                          >
                            Passport <ArrowRight size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {worksData.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <div className="text-xs text-muted">
              Page {page} of {worksData.totalPages}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= worksData.totalPages}
              onClick={() => setPage((p) => Math.min(worksData.totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
