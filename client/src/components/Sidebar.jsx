import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  MapPin,
  Building2,
  BarChart3,
  UploadCloud,
  BotMessageSquare,
  FileText,
  Info
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/works', label: 'Works Explorer', icon: FolderKanban },
    { to: '/alerts', label: 'Flagged Alerts', icon: AlertTriangle, highlight: true },
    { to: '/map', label: 'Geospatial Map', icon: MapPin },
    { to: '/vendors', label: 'Vendor Network', icon: Building2 },
    { to: '/states', label: 'State Efficiency', icon: BarChart3 },
    { to: '/import', label: 'Data Ingestion', icon: UploadCloud },
    { to: '/chat', label: 'NIRIKSHAN Assistant', icon: BotMessageSquare, badge: 'AI' },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <h2>NIRIKSHAN AI</h2>
        <p>Explainable MPLADS Audit</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon
                size={18}
                style={{
                  color: item.highlight ? 'var(--risk-high)' : undefined,
                }}
              />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 5px',
                    borderRadius: 'var(--radius)',
                    background: 'var(--accent)',
                    color: 'var(--on-accent)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="nav-divider" />

        <div style={{ padding: '8px 12px', fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4, fontWeight: 600 }}>
            <Info size={14} />
            <span>Audit Principles</span>
          </div>
          <p style={{ margin: 0 }}>
            Flags represent anomalies for field verification, not accusations. All decisions are explainable.
          </p>
        </div>
      </nav>

      <div className="sidebar-bottom">
        <div
          style={{
            padding: '10px 12px',
            borderTop: '1px solid var(--border)',
            fontSize: '0.7rem',
            color: 'var(--muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <div><strong>MoSPI Prototype</strong> v1.0</div>
          <div>Smart India Hackathon 2024</div>
        </div>
      </div>
    </aside>
  );
}
