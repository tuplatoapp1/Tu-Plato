import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { UIProvider } from './context/UIContext';
import { DepartmentProvider } from './context/DepartmentContext';
import { PublicMenuProvider } from './context/PublicMenuContext';
import { TipsProvider } from './context/TipsContext';
import { RewardsProvider } from './context/RewardsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import InventoryPage from './pages/InventoryPage';
import MovementsPage from './pages/MovementsPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import RestaurantMenuPage from './pages/RestaurantMenuPage';
import PublicMenuPage from './pages/PublicMenuPage';
import CustomerAuthPage from './pages/CustomerAuthPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import TipsPage from './pages/TipsPage';
import { Toaster } from 'sonner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <AuthProvider>
          <InventoryProvider>
            <UIProvider>
              <DepartmentProvider>
                <PublicMenuProvider>
                  <TipsProvider>
                    <RewardsProvider>
                      <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/public-menu" element={<PublicMenuPage />} />
                        <Route path="/customer-auth" element={<CustomerAuthPage />} />
                        <Route path="/customer-profile" element={<CustomerProfilePage />} />
                        
                        <Route path="/" element={
                          <ProtectedRoute>
                            <Layout />
                          </ProtectedRoute>
                        }>
                          <Route index element={<HomePage />} />
                          <Route path="dashboard" element={<DashboardPage />} />
                          <Route path="menu" element={<RestaurantMenuPage />} />
                          <Route path="inventory" element={<InventoryPage />} />
                          <Route path="inventory/:department" element={<InventoryPage />} />
                          <Route path="movements" element={<MovementsPage />} />
                          <Route path="tips" element={<TipsPage />} />
                          <Route path="settings" element={<SettingsPage />} />
                        </Route>
                      </Routes>
                    </RewardsProvider>
                  </TipsProvider>
                </PublicMenuProvider>
              </DepartmentProvider>
            </UIProvider>
          </InventoryProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
