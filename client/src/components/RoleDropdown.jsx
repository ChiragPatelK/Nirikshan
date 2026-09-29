import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Shield, User, Building2, Landmark } from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';

export default function RoleDropdown() {
  const { role, setRole, roleConfig } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (roleKey) => {
    setRole(roleKey);
    setIsOpen(false);
  };

  const roleOptions = [
    {
      key: 'MP',
      name: 'Members of Parliament (MP)',
      jurisdiction: 'Dharwad Constituency · Hon\'ble MP',
      badgeColor: '#0284c7',
      icon: User,
    },
    {
      key: 'DISTRICT',
      name: 'District Authorities (DA / IDA)',
      jurisdiction: 'Dharwad District · Collector / DC',
      badgeColor: '#d97706',
      icon: Landmark,
    },
    {
      key: 'STATE',
      name: 'State Nodal Authorities (SNA)',
      jurisdiction: 'Karnataka State · Planning Dept',
      badgeColor: '#10b981',
      icon: Building2,
    },
    {
      key: 'MINISTRY',
      name: 'The Ministry (MoSPI National)',
      jurisdiction: 'Central Ministry · All India Surveillance',
      badgeColor: '#4f46e5',
      icon: Shield,
    },
  ];

  return (
    <div className="custom-role-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          background: 'var(--surface-2, #1c1f26)',
          color: 'var(--text, #f5f5f2)',
          border: isOpen ? '1px solid var(--accent, #f5b301)' : '1px solid var(--border, #2a2e35)',
          borderRadius: 'var(--radius, 4px)',
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: 700,
          outline: 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: roleConfig.badgeColor || '#4f46e5',
            flexShrink: 0,
          }}
        />
        <span>
          {role === 'MP' && 'Members of Parliament (MP)'}
          {role === 'DISTRICT' && 'District Authorities (DA / IDA)'}
          {role === 'STATE' && 'State Nodal Authorities (SNA)'}
          {role === 'MINISTRY' && 'The Ministry (MoSPI National)'}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: 'var(--muted, #b8bcc4)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Floating Dark Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 290,
            background: 'var(--surface-1, #14161a)',
            border: '1px solid var(--border, #2a2e35)',
            borderRadius: 'var(--radius-lg, 8px)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.1)',
            padding: '6px 0',
            zIndex: 1000,
            animation: 'slideUp 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            style={{
              padding: '6px 14px 8px 14px',
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'var(--muted, #b8bcc4)',
              borderBottom: '1px solid var(--border, #2a2e35)',
              marginBottom: 4,
            }}
          >
            Switch Stakeholder Viewpoint
          </div>

          {roleOptions.map((opt) => {
            const isSelected = role === opt.key;
            const Icon = opt.icon;

            return (
              <div
                key={opt.key}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 14px',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--surface-2, #1c1f26)' : 'transparent',
                  transition: 'background 0.12s ease',
                  borderLeft: isSelected ? `3px solid ${opt.badgeColor}` : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--surface-2, #1c1f26)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 4,
                    background: `${opt.badgeColor}22`,
                    color: opt.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--text, #ffffff)' : 'var(--text, #f5f5f2)',
                    }}
                  >
                    {opt.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--muted, #b8bcc4)',
                      marginTop: 1,
                    }}
                  >
                    {opt.jurisdiction}
                  </div>
                </div>

                {isSelected && (
                  <Check size={14} style={{ color: opt.badgeColor, flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
