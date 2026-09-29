import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import WorksPage from './pages/WorksPage';
import WorkPassportPage from './pages/WorkPassportPage';
import AlertsPage from './pages/AlertsPage';
import MapPage from './pages/MapPage';
import VendorsPage from './pages/VendorsPage';
import StatesPage from './pages/StatesPage';
import ImportPage from './pages/ImportPage';
import ChatPage from './pages/ChatPage';
import ErrorBoundary from './components/ErrorBoundary';
import { RoleProvider } from './context/RoleContext';
import RoleActionModal from './components/RoleActionModal';

export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <div className="app-shell">
          {/* Top Navigation Bar */}
          <Navbar />

          {/* Left Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="app-main">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/works" element={<WorksPage />} />
                <Route path="/works/:id" element={<WorkPassportPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/vendors" element={<VendorsPage />} />
                <Route path="/states" element={<StatesPage />} />
                <Route path="/import" element={<ImportPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>

          {/* Interactive Role Action Modal */}
          <RoleActionModal />
        </div>
      </BrowserRouter>
    </RoleProvider>
  );
}
