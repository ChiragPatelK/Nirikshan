import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Coins,
  FileCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { api } from '../services/api';

export default function StatesPage() {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStates() {
      try {
        setLoading(true);
        const res = await api.getStates();
        setStates(res.states || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch state analytics');
      } finally {
        setLoading(false);
      }
    }
    loadStates();
  }, []);

  const chartData = states.map((s) => ({
    name: s.state,
    Total: s.total,
    Completed: s.completed,
    Ongoing: s.ongoing,
    Flagged: (s.high_risk || 0) + (s.critical || 0),
    ExpenditureLakhs: Math.round(s.expenditure),
  }));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={24} style={{ color: 'var(--accent)' }} />
          Inter-State MPLADS Implementation & Risk Diagnostics
        </h1>
        <p className="page-subtitle">
          Benchmarking implementation velocity, expenditure efficiency, and anomaly concentrations across State IDAs
        </p>
      </div>

      {loading && (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="loading-spinner" />
          <p className="text-muted text-sm">Aggregating state-level performance indices...</p>
        </div>
      )}

      {error && <div className="error-state">{error}</div>}

      {/* Recharts State Comparative Bar Chart */}
      <div className="card mb-6">
        <div className="card-header">
          <span className="card-title">Completed vs Ongoing vs Flagged Works by State</span>
        </div>
        <div className="chart-container-lg">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--muted)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  borderRadius: 4,
                  color: 'var(--text)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
              <Bar dataKey="Completed" fill="var(--risk-low)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ongoing" fill="var(--status-ongoing)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Flagged" fill="var(--risk-critical)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* State Implementation Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>State / Territory</th>
                <th>Total Works</th>
                <th>Completed</th>
                <th>Ongoing</th>
                <th>Completion Rate</th>
                <th>Total Expended (₹ L)</th>
                <th>Critical / High Risk</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {states.map((s) => {
                const completionRate = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
                const totalFlagged = (s.high_risk || 0) + (s.critical || 0);

                return (
                  <tr
                    key={s.state}
                    onClick={() => navigate(`/works?state=${encodeURIComponent(s.state)}`)}
                  >
                    <td className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                      {s.state}
                    </td>
                    <td className="num font-bold">{s.total}</td>
                    <td className="num">{s.completed}</td>
                    <td className="num">{s.ongoing}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${completionRate}%`,
                              height: '100%',
                              background: 'var(--accent)',
                            }}
                          />
                        </div>
                        <span className="num text-xs">{completionRate}%</span>
                      </div>
                    </td>
                    <td className="num font-bold">
                      ₹{Math.round(s.expenditure).toLocaleString()}L
                    </td>
                    <td>
                      {totalFlagged > 0 ? (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius)',
                            background: 'var(--risk-critical-bg)',
                            color: 'var(--risk-critical)',
                          }}
                        >
                          {totalFlagged} Flagged ({s.critical} Critical)
                        </span>
                      ) : (
                        <span className="text-xs text-muted">0 Flags</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/works?state=${encodeURIComponent(s.state)}`);
                        }}
                      >
                        Inspect Works <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
