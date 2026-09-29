import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Shield, Bell } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
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
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius)',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--on-accent)',
              fontWeight: 'bold',
            }}
          >
            <Shield size={18} />
          </div>
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.5px' }}>
              NIRIKSHAN AI
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              MoSPI · MPLADS Monitoring
            </div>
          </div>
        </div>
      </div>

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
        <div className="demo-badge">
          <span className="dot" />
          <span>PROTOTYPE DATA · SIH26102</span>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/alerts')}
          title="Active Alerts"
          style={{ padding: '6px 10px', minHeight: '36px' }}
        >
          <Bell size={16} style={{ color: 'var(--risk-high)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Alerts</span>
        </button>

        <div className="user-chip">
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'var(--status-completed)',
            }}
          />
          <span>MoSPI Monitor</span>
        </div>

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
  );
}
