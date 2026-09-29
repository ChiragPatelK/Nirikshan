import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Shield, Bell, PlusCircle, Building2, MapPin, Award, ShieldAlert } from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { role, setRole, roleConfig, openActionModal } = useRole();
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('nirikshan-theme', nextTheme);
    setTheme(nextTheme);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/works?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      {/* Official Government Top Bar */}
      <div className="gov-top-strip">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 18px', fontSize: '0.72rem', color: 'var(--muted)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, letterSpacing: '0.5px', color: '#f59e0b' }}>GOI</span>
            <span>Ministry of Statistics and Programme Implementation · Government of India</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>MPLADS Portal v1.0</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>Active Role: <strong style={{ color: roleConfig.badgeColor }}>{roleConfig.name}</strong></span>
          </div>
        </div>
      </div>

      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius)',
                background: roleConfig.badgeColor || 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                transition: 'background 0.2s',
              }}
            >
              <Shield size={19} />
            </div>
            <div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                NIRIKSHAN AI
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                MPLADS Surveillance Portal
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <form className="header-search" onSubmit={handleSearchSubmit}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search works, MPs, vendors, districts, IDAs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search MPLADS works"
          />
        </form>

        <div className="header-right">
          {/* 4 Roles Switcher Selector */}
          <div className="role-selector-wrap" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)' }}>Role:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="role-dropdown-select"
              style={{
                padding: '5px 10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--surface-1)',
                color: 'var(--text)',
                cursor: 'pointer',
              }}
            >
              <option value="MP">Members of Parliament (MP)</option>
              <option value="DISTRICT">District Authorities (DA / IDA)</option>
              <option value="STATE">State Nodal Authorities (SNA)</option>
              <option value="MINISTRY">The Ministry (MoSPI National)</option>
            </select>
          </div>

          {/* Role Action Button */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => openActionModal()}
            title={roleConfig.actionDescription}
            style={{
              padding: '6px 12px',
              fontSize: '0.76rem',
              fontWeight: 700,
              gap: 6,
              background: role === 'MINISTRY' ? 'var(--risk-critical)' : roleConfig.badgeColor,
              borderColor: role === 'MINISTRY' ? 'var(--risk-critical)' : roleConfig.badgeColor,
              color: '#fff',
            }}
          >
            <PlusCircle size={15} />
            <span>{roleConfig.actionLabel}</span>
          </button>

          {/* Active Jurisdiction Chip */}
          <div
            className="jurisdiction-chip"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 8px',
              borderRadius: 'var(--radius)',
              background: 'var(--surface-2)',
              fontSize: '0.72rem',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
            title={roleConfig.authorityTitle}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: roleConfig.badgeColor || 'var(--accent)',
              }}
            />
            <span style={{ fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {role === 'MP' && 'Dharwad (MP001)'}
              {role === 'DISTRICT' && 'Dharwad Dist.'}
              {role === 'STATE' && 'Karnataka'}
              {role === 'MINISTRY' && 'All India (National)'}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/alerts')}
            title="Active Alerts"
            style={{ padding: '6px 8px', minHeight: '34px' }}
          >
            <Bell size={16} style={{ color: 'var(--risk-high)' }} />
          </button>

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>
    </>
  );
}
