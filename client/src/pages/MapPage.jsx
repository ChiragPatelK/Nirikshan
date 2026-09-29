import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { MapPin, Filter, ArrowRight, ShieldAlert, Layers } from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';

// District coordinate lookup for geospatial placement
const DISTRICT_COORDS = {
  'Dharwad': [15.4589, 75.0078],
  'Bengaluru Rural': [13.2847, 77.5847],
  'Belagavi': [15.8497, 74.4977],
  'Lucknow': [26.8467, 80.9462],
  'Mainpuri': [27.2344, 79.0270],
  'Pune': [18.5204, 73.8567],
  'Thane': [19.2183, 72.9781],
  'Thoothukudi': [8.7642, 78.1348],
  'The Nilgiris': [11.4102, 76.6950],
  'Nadia': [23.4710, 88.5565],
  'Thiruvananthapuram': [8.5241, 76.9366],
  'Jaipur': [26.9124, 75.7873],
  'Tonk': [26.1664, 75.7885],
};

const STATE_DEFAULTS = {
  'Karnataka': [14.5204, 75.7224],
  'Uttar Pradesh': [27.0, 80.5],
  'Maharashtra': [19.7515, 75.7139],
  'Tamil Nadu': [11.1271, 78.6569],
  'West Bengal': [22.9868, 87.8550],
  'Kerala': [10.8505, 76.2711],
  'Rajasthan': [27.0238, 74.2179],
};

export default function MapPage() {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState(null);

  useEffect(() => {
    async function loadWorks() {
      try {
        setLoading(true);
        const data = await api.getWorks({ limit: 100 });
        const list = data.works || data.results || (Array.isArray(data) ? data : []);
        setWorks(list);
        setFilteredWorks(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWorks();
  }, []);

  useEffect(() => {
    let list = [...works];
    if (selectedRisk !== 'ALL') {
      list = list.filter((w) => w.risk_level === selectedRisk);
    }
    if (selectedState !== 'ALL') {
      list = list.filter((w) => w.state === selectedState);
    }
    setFilteredWorks(list);
  }, [selectedRisk, selectedState, works]);

  // Color mapping based on risk level
  const getMarkerColor = (level) => {
    switch (level) {
      case 'CRITICAL':
        return '#F87171';
      case 'HIGH':
        return '#FB923C';
      case 'WATCH':
        return '#FACC15';
      default:
        return '#4ADE80';
    }
  };

  // Helper to add minor jitter so works in the same district don't completely overlap
  const getCoordsForWork = (work, index) => {
    const base = DISTRICT_COORDS[work.district] || STATE_DEFAULTS[work.state] || [20.5937, 78.9629];
    const angle = (index % 8) * (Math.PI / 4);
    const radius = 0.04 * (Math.floor(index / 8) + 1);
    return [base[0] + Math.cos(angle) * radius, base[1] + Math.sin(angle) * radius];
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={24} style={{ color: 'var(--accent)' }} />
            Geospatial MPLADS Surveillance Map
          </h1>
          <p className="page-subtitle">
            Pan-India district distribution of active allocations and anomalies
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            className="filter-select"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="ALL">All States</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Kerala">Kerala</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>

          <select
            className="filter-select"
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="WATCH">Watchlist Only</option>
            <option value="LOW">Low / Normal</option>
          </select>
        </div>
      </div>

      {/* Map + Detail Panel */}
      <div className="grid-2-1 mb-6">
        {/* Leaflet Map */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ height: 560, width: '100%' }}>
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredWorks.map((work, idx) => {
                const coords = getCoordsForWork(work, idx);
                const color = getMarkerColor(work.risk_level);
                return (
                  <CircleMarker
                    key={work.internal_work_key}
                    center={coords}
                    radius={work.risk_level === 'CRITICAL' ? 10 : work.risk_level === 'HIGH' ? 8 : 6}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.8,
                      weight: 2,
                    }}
                    eventHandlers={{
                      click: () => setSelectedWork(work),
                    }}
                  >
                    <Popup>
                      <div style={{ minWidth: 200, color: '#111' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>
                          {work.internal_work_key}
                        </div>
                        <div style={{ fontSize: '0.8rem', marginBottom: 6 }}>
                          {work.description}
                        </div>
                        <div style={{ fontSize: '0.75rem', marginBottom: 6 }}>
                          <strong>{work.district}, {work.state}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 8 }}>
                          <span>Sanction: <strong>₹{work.sanctioned_amount_lakh}L</strong></span>
                          <span>Score: <strong>{work.risk_score}</strong></span>
                        </div>
                        <button
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            background: '#0A0B0D',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                          onClick={() => navigate(`/works/${work.internal_work_key}`)}
                        >
                          View Risk Passport
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Selected Work / Highlights Drawer */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <span className="card-title">Geographic Inspection Panel</span>
            <span className="text-xs text-muted">{filteredWorks.length} pinned</span>
          </div>

          {selectedWork ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: 12 }}>
                <span className="font-mono text-xs" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  {selectedWork.internal_work_key}
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: 4 }}>
                  {selectedWork.description}
                </h3>
                <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                  {selectedWork.district}, {selectedWork.state} · {selectedWork.category}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <RiskBadge level={selectedWork.risk_level} score={selectedWork.risk_score} />
                <StatusBadge status={selectedWork.status} />
              </div>

              <div style={{ padding: 12, borderRadius: 'var(--radius)', background: 'var(--surface-2)', border: '1px solid var(--border)', marginBottom: 16 }}>
                <div className="text-xs text-muted" style={{ fontWeight: 700 }}>FINANCIAL OUTLAY</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span className="text-sm">Sanctioned:</span>
                  <span className="num font-bold">₹{selectedWork.sanctioned_amount_lakh}L</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span className="text-sm">Expended:</span>
                  <span className="num font-bold">₹{selectedWork.total_expenditure_lakh}L</span>
                </div>
              </div>

              {selectedWork.risk_signals && selectedWork.risk_signals.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div className="text-xs text-muted" style={{ fontWeight: 700, marginBottom: 6 }}>
                    DETECTED SIGNALS
                  </div>
                  {selectedWork.risk_signals.map((sig, i) => (
                    <div key={i} className="text-xs" style={{ padding: '6px 8px', background: 'var(--surface-2)', borderRadius: 4, marginBottom: 4 }}>
                      <strong>{sig.label}:</strong> {sig.description}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 'auto' }}>
                <button
                  className="btn btn-primary w-full"
                  onClick={() => navigate(`/works/${selectedWork.internal_work_key}`)}
                >
                  Open Full Risk Passport <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Layers size={36} style={{ color: 'var(--muted)', margin: '0 auto 12px' }} />
              <h4>Select a Pin on the Map</h4>
              <p className="text-xs">Click any district marker on the map to inspect project financials, risk flags, and MP details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
