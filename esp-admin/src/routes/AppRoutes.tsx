import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
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

// Role guard: only allows specified roles
function ProtectedRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { role } = useAuthStore();
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

// Simple login page placeholder
function LoginPage() {
  const { login } = useAuthStore();

  const handleDemoLogin = () => {
    login(
      {
        userId: 1,
        loginId: 'admin',
        role: 'ADMIN',
        name: '관리자',
        phone: '010-1234-5678',
        email: 'admin@metabeans.co.kr',
        accountStatus: 'ACTIVE',
        approvedBy: null,
        approvedAt: null,
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      'demo-token',
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f0f2f5',
      }}
    >
      <div
        style={{
          width: 400,
          padding: 40,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ marginBottom: 8 }}>MetaBeans ESP</h1>
        <p style={{ color: '#888', marginBottom: 32 }}>관제시스템 관리툴</p>
        <button
          onClick={handleDemoLogin}
          style={{
            width: '100%',
            padding: '12px 0',
            fontSize: 16,
            background: '#1677ff',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          데모 로그인 (ADMIN)
        </button>
        <p style={{ marginTop: 16, color: '#999', fontSize: 12 }}>
          Phase 1: Mock 데이터 기반 프론트엔드
        </p>
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

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
    </Routes>
  );
}
