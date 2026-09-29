import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import GlobalSearchModal from './components/GlobalSearchModal';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PriorityCenterPage from './pages/PriorityCenterPage';
import CustomersPage from './pages/CustomersPage';
import Customer360Page from './pages/Customer360Page';
import RelationshipRadarPage from './pages/RelationshipRadarPage';
import LeadsPage from './pages/LeadsPage';
import SalesPipelinePage from './pages/SalesPipelinePage';
import FollowupCenterPage from './pages/FollowupCenterPage';
import SegmentationPage from './pages/SegmentationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import KYCCompliancePage from './pages/KYCCompliancePage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import SettingsPage from './pages/SettingsPage';
import { Loader2 } from 'lucide-react';

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Authenticating FinSight 360 Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onOpenSearch={() => setSearchOpen(true)}
          />

          <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/priority-center" element={<PriorityCenterPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<Customer360Page />} />
            <Route path="/radar" element={<RelationshipRadarPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/pipeline" element={<SalesPipelinePage />} />
            <Route path="/followups" element={<FollowupCenterPage />} />
            <Route path="/segments" element={<SegmentationPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/kyc" element={<KYCCompliancePage />} />
            <Route path="/products" element={<ProductCatalogPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
