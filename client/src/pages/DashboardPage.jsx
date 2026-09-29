import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Coins,
  TrendingUp,
  FileCheck,
  Building,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { api } from '../services/api';
import KPICard from '../components/KPICard';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <div className="loading-spinner" />
        <p className="text-muted text-sm">Aggregating national MPLADS monitoring signals...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container">
        <div className="error-state">
          <strong>Error loading dashboard:</strong> {error}
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const kpis = data.kpis || {};
  const totalWorks = kpis.total_works ?? data.totalWorks ?? 0;
  const totalSanctioned = kpis.total_sanctioned_lakh ?? data.totalSanctioned ?? 0;
  const totalExpenditure = kpis.total_expenditure_lakh ?? data.totalExpenditure ?? 0;
  const ongoingWorks = kpis.ongoing_works ?? data.ongoingWorks ?? 0;
  const completedWorks = kpis.completed_works ?? data.completedWorks ?? 0;
  const riskDist = data.risk_distribution || data.riskDist || {};
  const priorityReviews = data.priority_alerts || data.priorityReviews || [];
  const stateIntelligence = Array.isArray(data.state_intelligence)
    ? data.state_intelligence
    : Object.values(data.stateMap || {});
  const expenditureTrend = data.expenditure_trend || data.expenditureTrend || [];

  const totalFlagged = (riskDist.HIGH || 0) + (riskDist.CRITICAL || 0);
  const utilization = totalSanctioned > 0
    ? Math.round((totalExpenditure / totalSanctioned) * 1000) / 10
    : 0;

  // Format state intelligence for Recharts
  const stateChartData = stateIntelligence
    .sort((a, b) => (b.total || 0) - (a.total || 0))
    .slice(0, 8)
    .map((s) => ({
      name: s.state,
      Total: s.total || 0,
      Critical: s.critical || 0,
      High: s.high_risk || 0,
      ExpenditureCr: Math.round(((s.expenditure || 0) / 100) * 10) / 10,
    }));

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Executive Monitoring Overview</h1>
          <p className="page-subtitle">
            AI-powered explainable risk surveillance for Ministry of Statistics & Programme Implementation
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>
            <RefreshCw size={14} /> Refresh Stream
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/chat')}>
            <Bot size={14} /> Ask NIRIKSHAN AI
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="kpi-grid">
        <KPICard
          label="Total Works Tracked"
          value={totalWorks}
          sub={`${ongoingWorks} Ongoing · ${completedWorks} Completed`}
          icon={FileCheck}
          onClick={() => navigate('/works')}
        />
        <KPICard
          label="Sanctioned Outlay"
          value={`₹${Math.round(totalSanctioned).toLocaleString()} L`}
          sub="Cumulative recommended"
          icon={Coins}
        />
        <KPICard
          label="Total Expenditure"
          value={`₹${Math.round(totalExpenditure).toLocaleString()} L`}
          sub={`${utilization}% Capital Utilization`}
          icon={TrendingUp}
        />
        <KPICard
          label="Urgent Flags"
          value={totalFlagged}
          sub={`${riskDist.CRITICAL || 0} Critical · ${riskDist.HIGH || 0} High`}
          variant="risk-critical"
          icon={ShieldAlert}
          onClick={() => navigate('/alerts')}
        />
      </div>

      {/* Risk Distribution Summary Strip */}
      <div className="card mb-6">
        <div className="card-header">
          <span className="card-title">Risk Scoring Portfolio Breakdown</span>
          <span className="text-xs text-muted">Rules calibrated against MoSPI 2023 Guidelines</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          <div
            className="clickable"
            style={{
              padding: 12,
              borderRadius: 'var(--radius)',
              background: 'var(--risk-critical-bg)',
              border: '1px solid var(--risk-critical)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/works?risk=CRITICAL')}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--risk-critical)' }}>CRITICAL RISK</div>
            <div style={{ fontFamily: 'Oswald', fontSize: '1.75rem', fontWeight: 700, color: 'var(--risk-critical)' }}>
              {riskDist.CRITICAL || 0}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Multiple high anomalies</div>
          </div>

          <div
            className="clickable"
            style={{
              padding: 12,
              borderRadius: 'var(--radius)',
              background: 'var(--risk-high-bg)',
              border: '1px solid var(--risk-high)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/works?risk=HIGH')}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--risk-high)' }}>HIGH RISK</div>
            <div style={{ fontFamily: 'Oswald', fontSize: '1.75rem', fontWeight: 700, color: 'var(--risk-high)' }}>
              {riskDist.HIGH || 0}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Significant deviation / velocity</div>
          </div>

          <div
            className="clickable"
            style={{
              padding: 12,
              borderRadius: 'var(--radius)',
              background: 'var(--risk-watch-bg)',
              border: '1px solid var(--risk-watch)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/works?risk=WATCH')}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--risk-watch)' }}>WATCHLIST</div>
            <div style={{ fontFamily: 'Oswald', fontSize: '1.75rem', fontWeight: 700, color: 'var(--risk-watch)' }}>
              {riskDist.WATCH || 0}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Mild delays / single flag</div>
          </div>

          <div
            className="clickable"
            style={{
              padding: 12,
              borderRadius: 'var(--radius)',
              background: 'var(--risk-low-bg)',
              border: '1px solid var(--risk-low)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/works?risk=LOW')}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--risk-low)' }}>LOW / NORMAL</div>
            <div style={{ fontFamily: 'Oswald', fontSize: '1.75rem', fontWeight: 700, color: 'var(--risk-low)' }}>
              {riskDist.LOW || 0}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Conforms to benchmarks</div>
          </div>
        </div>

        {/* Visual proportional bar */}
        <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${((riskDist.CRITICAL || 0) / (totalWorks || 1)) * 100}%`, background: 'var(--risk-critical)' }} title="Critical" />
          <div style={{ width: `${((riskDist.HIGH || 0) / (totalWorks || 1)) * 100}%`, background: 'var(--risk-high)' }} title="High" />
          <div style={{ width: `${((riskDist.WATCH || 0) / (totalWorks || 1)) * 100}%`, background: 'var(--risk-watch)' }} title="Watch" />
          <div style={{ width: `${((riskDist.LOW || 0) / (totalWorks || 1)) * 100}%`, background: 'var(--risk-low)' }} title="Low" />
        </div>
      </div>

      {/* Two Column Visual Analytics */}
      <div className="grid-2 mb-6">
        {/* State-wise risk concentration */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">State-Level Workload & Risk Volume</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/states')}>
              View All States <ArrowRight size={13} />
            </button>
          </div>
          <div className="chart-container-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={11} angle={-25} textAnchor="end" />
                <YAxis stroke="var(--muted)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    borderRadius: 4,
                    color: 'var(--text)',
                    fontSize: '0.8rem',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Bar dataKey="Total" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="High" fill="var(--risk-high)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Critical" fill="var(--risk-critical)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenditure trend */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Disbursement & Expenditure Trend</span>
            <span className="text-xs text-muted">Monthly billing velocity (₹ Lakhs)</span>
          </div>
          <div className="chart-container-lg">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expenditureTrend} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="expGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted)" fontSize={11} angle={-25} textAnchor="end" />
                <YAxis stroke="var(--muted)" fontSize={11} />
                <Tooltip
                  formatter={(val) => [`₹${val} Lakhs`, 'Expenditure']}
                  contentStyle={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    borderRadius: 4,
                    color: 'var(--text)',
                    fontSize: '0.8rem',
                  }}
                />
                <Area type="monotone" dataKey="amount" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#expGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Attention Review Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={16} style={{ color: 'var(--risk-critical)' }} />
              High Priority Attention Queue
            </span>
            <p className="text-xs text-muted" style={{ marginTop: 2 }}>
              Ranked by composite anomaly severity index. Click any entry to inspect its Work Risk Passport.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/alerts')}>
            Inspect All Flags ({totalFlagged})
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Work Key</th>
                <th>Description & Location</th>
                <th>MP & IDA</th>
                <th>Sanctioned</th>
                <th>Disbursed</th>
                <th>Risk Score</th>
                <th>Identified Signals</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {priorityReviews.map((w) => (
                <tr key={w.internal_work_key} onClick={() => navigate(`/works/${w.internal_work_key}`)}>
                  <td className="font-mono text-xs" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    {w.internal_work_key}
                  </td>
                  <td style={{ maxWidth: 280 }}>
                    <div className="font-bold text-sm truncate" title={w.description}>
                      {w.description}
                    </div>
                    <div className="text-xs text-muted">
                      {w.district}, {w.state} · <span className="font-mono">{w.category}</span>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm font-bold">{w.mp?.name || 'MP Record'}</div>
                    <div className="text-xs text-muted">{w.mp?.constituency} ({w.mp?.party})</div>
                  </td>
                  <td className="num font-bold">
                    ₹{w.sanctioned_amount_lakh}L
                  </td>
                  <td className="num">
                    ₹{w.total_expenditure_lakh}L
                  </td>
                  <td>
                    <RiskBadge level={w.risk_level} score={w.risk_score} />
                  </td>
                  <td style={{ maxWidth: 220 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(w.risk_signals || []).slice(0, 2).map((sig, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.68rem',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius)',
                            background: 'var(--surface-2)',
                            border: '1px solid var(--border)',
                            color: 'var(--text)',
                          }}
                          title={sig.description}
                        >
                          {sig.label}
                        </span>
                      ))}
                      {(w.risk_signals || []).length > 2 && (
                        <span className="text-xs text-muted">
                          +{w.risk_signals.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/works/${w.internal_work_key}`);
                      }}
                    >
                      Passport <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
