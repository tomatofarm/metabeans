import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ChangePasswordPage from '../pages/auth/ChangePasswordPage';
import RegisterPage from '../pages/auth/register/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import EquipmentPage from '../pages/equipment/EquipmentPage';
import ASServicePage from '../pages/as-service/ASServicePage';
import CustomerPage from '../pages/customer/CustomerPage';
import SystemPage from '../pages/system/SystemPage';
import { useAuthStore } from '../stores/authStore';
import type { UserRole } from '../types/auth.types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route path="/register/*" element={<RegisterPage />} />

      {/* Protected routes - all authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/equipment/*" element={<EquipmentPage />} />
          <Route path="/as-service/*" element={<ASServicePage />} />

          {/* ADMIN only routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/customer/*" element={<CustomerPage />} />
            <Route path="/system/*" element={<SystemPage />} />
          </Route>
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
