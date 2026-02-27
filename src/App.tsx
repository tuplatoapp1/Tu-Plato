import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { UIProvider } from './context/UIContext';
import { DepartmentProvider } from './context/DepartmentContext';
import { PublicMenuProvider } from './context/PublicMenuContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import InventoryPage from './pages/InventoryPage';
import MovementsPage from './pages/MovementsPage';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import RestaurantMenuPage from './pages/RestaurantMenuPage';
import PublicMenuPage from './pages/PublicMenuPage';

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
      <BrowserRouter>
        <AuthProvider>
          <InventoryProvider>
            <UIProvider>
              <DepartmentProvider>
                <PublicMenuProvider>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/public-menu" element={<PublicMenuPage />} />
                    
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<HomePage />} />
                      <Route path="menu" element={<RestaurantMenuPage />} />
                      <Route path="inventory" element={<InventoryPage />} />
                      <Route path="movements" element={<MovementsPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Route>
                  </Routes>
                </PublicMenuProvider>
              </DepartmentProvider>
            </UIProvider>
          </InventoryProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
