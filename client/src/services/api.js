// API base URL — Vite proxy handles /api in dev
const BASE = '';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getDashboard: (params = {}) => apiFetch('/api/dashboard?' + new URLSearchParams(params)),
  getWorks: (params = {}) => apiFetch('/api/works?' + new URLSearchParams(params)),
  getWork: (id) => apiFetch(`/api/works/${encodeURIComponent(id)}`),
  getAlerts: (params = {}) => apiFetch('/api/alerts?' + new URLSearchParams(params)),
  search: (params = {}) => apiFetch('/api/search?' + new URLSearchParams(params)),
  getStates: () => apiFetch('/api/states'),
  getVendors: () => apiFetch('/api/vendors'),
  getVendor: (id) => apiFetch(`/api/vendors/${id}`),
  chat: (message) => apiFetch('/api/chat', { method: 'POST', body: JSON.stringify({ message }) }),
  importFiles: (formData) => fetch('/api/import', { method: 'POST', body: formData }).then(r => r.json()),
  getImportHistory: () => apiFetch('/api/import/history'),
  getDatasetTypes: () => apiFetch('/api/import/dataset-types'),
  getStatus: () => apiFetch('/api/status'),
  recommendWork: (data) => apiFetch('/api/works/recommend', { method: 'POST', body: JSON.stringify(data) }),
  inspectWork: (id, data) => apiFetch(`/api/works/${encodeURIComponent(id)}/inspect`, { method: 'POST', body: JSON.stringify(data) }),
  escalateWork: (id, data) => apiFetch(`/api/works/${encodeURIComponent(id)}/escalate`, { method: 'POST', body: JSON.stringify(data) }),
  freezeWork: (id, data) => apiFetch(`/api/works/${encodeURIComponent(id)}/freeze`, { method: 'POST', body: JSON.stringify(data) }),
};
