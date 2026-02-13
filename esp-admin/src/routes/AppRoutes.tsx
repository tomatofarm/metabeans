import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';

/** 대시보드 임시 페이지 (Phase 3에서 구현) */
const DashboardPlaceholder: React.FC = () => (
  <div style={{ padding: 24 }}>
    <h2>대시보드</h2>
    <p>로그인 성공! 대시보드는 다음 단계에서 구현됩니다.</p>
  </div>
);

/** 인증 필요 라우트 가드 */
const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

/** 비인증 전용 라우트 (로그인 상태에서 /login 접근 시 대시보드로) */
const PublicOnlyRoute: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 비인증 전용 */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* 인증 필요 */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
        </Route>
      </Route>

      {/* 기본 리다이렉트 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
