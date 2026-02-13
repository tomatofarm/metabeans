import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Divider, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  BarChartOutlined,
  BellOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../api/auth.api';
import { useAuthStore } from '../../stores/authStore';
import type { LoginRequest } from '../../types/auth.types';
import PasswordFindModal from './PasswordFindModal';
import PasswordChangeModal from './PasswordChangeModal';

const { Title, Text, Link } = Typography;

const FEATURES = [
  {
    icon: <BarChartOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
    title: '실시간 모니터링',
    desc: '장비 상태를 한눈에 확인',
  },
  {
    icon: <BellOutlined style={{ fontSize: 24, color: '#faad14' }} />,
    title: '스마트 알림',
    desc: '이상 감지 시 즉시 알림',
  },
  {
    icon: <SettingOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
    title: 'A/S 관리',
    desc: '체계적인 유지보수 관리',
  },
  {
    icon: <FileTextOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
    title: 'ESG 리포트',
    desc: '환경 성과 데이터 분석',
  },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const login = useAuthStore((s) => s.login);
  const [passwordFindOpen, setPasswordFindOpen] = useState(false);
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);

  const onFinish = (values: LoginRequest) => {
    loginMutation.mutate(values, {
      onSuccess: (response) => {
        login(response.data.user, response.data.accessToken);
        message.success(`${response.data.user.name}님, 환영합니다.`);
        navigate('/dashboard');
      },
      onError: (error: unknown) => {
        const err = error as { error?: { message?: string } };
        message.error(err?.error?.message || '로그인에 실패했습니다.');
      },
    });
  };

  return (
    <div style={styles.container}>
      {/* 좌측 브랜딩 패널 */}
      <div style={styles.brandPanel}>
        <div style={styles.brandContent}>
          <div style={styles.logoCircle}>
            <span style={styles.logoText}>M</span>
          </div>
          <Title level={2} style={styles.brandTitle}>
            MetaBeans
          </Title>
          <Text style={styles.brandSubtitle}>ESP 관제 시스템</Text>

          <div style={styles.featureList}>
            {FEATURES.map((f) => (
              <div key={f.title} style={styles.featureItem}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <div>
                  <Text strong style={styles.featureTitle}>
                    {f.title}
                  </Text>
                  <br />
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 우측 로그인 폼 패널 */}
      <div style={styles.formPanel}>
        <div style={styles.formContainer}>
          <Title level={3} style={{ marginBottom: 4 }}>
            로그인
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>
            계정 정보를 입력해주세요
          </Text>

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              label="아이디"
              name="loginId"
              rules={[{ required: true, message: '아이디를 입력하세요' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                placeholder="아이디를 입력하세요"
              />
            </Form.Item>

            <Form.Item
              label="비밀번호"
              name="password"
              rules={[{ required: true, message: '비밀번호를 입력하세요' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#faad14' }} />}
                placeholder="비밀번호를 입력하세요"
              />
            </Form.Item>

            <div style={styles.optionsRow}>
              <Checkbox>로그인 상태 유지</Checkbox>
              <Link onClick={() => setPasswordFindOpen(true)}>
                비밀번호 찾기
              </Link>
            </div>

            <Form.Item style={{ marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loginMutation.isPending}
                style={styles.loginButton}
              >
                로그인
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>또는</Divider>

          <Text
            type="secondary"
            style={{ display: 'block', textAlign: 'center', marginBottom: 12 }}
          >
            아직 계정이 없으신가요?
          </Text>
          <Button
            block
            size="large"
            onClick={() => navigate('/register')}
            style={{ marginBottom: 12 }}
          >
            회원가입
          </Button>

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Link onClick={() => setPasswordChangeOpen(true)}>
              비밀번호 변경
            </Link>
          </div>

          <div style={styles.footer}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              &copy; 2025 MetaBeans. All rights reserved.
            </Text>
          </div>
        </div>
      </div>

      <PasswordFindModal
        open={passwordFindOpen}
        onClose={() => setPasswordFindOpen(false)}
      />
      <PasswordChangeModal
        open={passwordChangeOpen}
        onClose={() => setPasswordChangeOpen(false)}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#fff',
  },
  brandPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #2d1b69 0%, #5b3cc4 50%, #7c5ce7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    position: 'relative',
    overflow: 'hidden',
  },
  brandContent: {
    textAlign: 'center' as const,
    zIndex: 1,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 24px rgba(255, 107, 53, 0.4)',
  },
  logoText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 700,
  },
  brandTitle: {
    color: '#fff',
    marginBottom: 4,
  },
  brandSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  featureList: {
    marginTop: 48,
    textAlign: 'left' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 24,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureTitle: {
    color: '#fff',
    fontSize: 14,
  },
  featureDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  formPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loginButton: {
    background: 'linear-gradient(90deg, #5b3cc4 0%, #1890ff 100%)',
    border: 'none',
    height: 48,
    fontSize: 16,
    fontWeight: 600,
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: 48,
  },
};

export default LoginPage;
