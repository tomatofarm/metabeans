import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/pages/auth/LoginPage';
import type { UserRole } from '@/types/auth.types';

// Lazy-loaded page placeholders (will be replaced with actual pages)
function PlaceholderPage({ name }: { name: string }) {
  return (
    <div style={{ padding: 24 }}>
      <h2>{name}</h2>
      <p>이 페이지는 개발 예정입니다.</p>
    </div>
  );
}

// Auth guard: redirects to login if not authenticated
function RequireAuth() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// Public-only guard: redirects to dashboard if already authenticated
function PublicOnlyRoute() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

// Role guard: only allows specified roles
function ProtectedRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { role } = useAuthStore();
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes (login only when not authenticated) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          {/* Dashboard - all roles */}
          <Route path="/dashboard" element={<PlaceholderPage name="대시보드" />} />

          {/* Equipment management - all roles */}
          <Route path="/equipment">
            <Route index element={<PlaceholderPage name="장비관리 - 장비정보" />} />
            <Route path="monitoring" element={<PlaceholderPage name="장비관리 - 실시간 모니터링" />} />
            <Route path="control" element={<PlaceholderPage name="장비관리 - 장치 제어" />} />
            <Route path="history" element={<PlaceholderPage name="장비관리 - 이력 조회" />} />
            <Route path="register" element={<PlaceholderPage name="장비관리 - 장비 등록" />} />
          </Route>

          {/* A/S management - all roles */}
          <Route path="/as-service">
            <Route index element={<PlaceholderPage name="A/S관리 - 알림" />} />
            <Route path="request" element={<PlaceholderPage name="A/S관리 - 접수" />} />
            <Route path="status" element={<PlaceholderPage name="A/S관리 - 처리" />} />
            <Route path="report" element={<PlaceholderPage name="A/S관리 - 보고서" />} />
          </Route>

          {/* Customer management - ADMIN only */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/customer">
              <Route index element={<PlaceholderPage name="고객현황 - 목록" />} />
              <Route path="edit/:id" element={<PlaceholderPage name="고객현황 - 수정" />} />
            </Route>
          </Route>

          {/* System management - ADMIN only */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/system">
              <Route index element={<PlaceholderPage name="시스템관리 - 권한" />} />
              <Route path="approval" element={<PlaceholderPage name="시스템관리 - 승인" />} />
              <Route path="users" element={<PlaceholderPage name="시스템관리 - 사용자" />} />
              <Route path="thresholds" element={<PlaceholderPage name="시스템관리 - 기준수치" />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Catch-all redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
