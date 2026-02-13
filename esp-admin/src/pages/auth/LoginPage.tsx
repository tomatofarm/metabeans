import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../stores/authStore';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const authLogin = useAuthStore((s) => s.login);

  const onFinish = async (values: { loginId: string; password: string }) => {
    setLoading(true);
    try {
      const response = await login(values);
      authLogin(response.user, response.accessToken);
      message.success(`${response.user.name}님 환영합니다.`);
      navigate('/dashboard');
    } catch {
      message.error('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 400 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>
              MetaBeans ESP 관제시스템
            </Title>
            <Text type="secondary">관리자 로그인</Text>
          </div>

          <Form name="login" onFinish={onFinish} autoComplete="off" layout="vertical">
            <Form.Item
              name="loginId"
              rules={[{ required: true, message: '아이디를 입력하세요' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="아이디" size="large" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '비밀번호를 입력하세요' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="비밀번호" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                로그인
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              테스트 계정: admin / admin123, dealer / dealer123, hq / hq123, owner / owner123
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}
