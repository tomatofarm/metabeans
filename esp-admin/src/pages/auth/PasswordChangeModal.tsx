import React, { useMemo } from 'react';
import { Modal, Form, Input, Button, Typography, Progress, message } from 'antd';
import {
  LockOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from '@ant-design/icons';
import { usePasswordChange } from '../../api/auth.api';
import type { PasswordChangeRequest } from '../../types/auth.types';

const { Text } = Typography;

interface PasswordChangeModalProps {
  open: boolean;
  onClose: () => void;
}

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: '8자 이상', test: (pw) => pw.length >= 8 },
  { label: '대문자 포함', test: (pw) => /[A-Z]/.test(pw) },
  { label: '숫자 포함', test: (pw) => /[0-9]/.test(pw) },
  { label: '특수문자 포함', test: (pw) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw) },
];

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const passwordChangeMutation = usePasswordChange();
  const newPassword = Form.useWatch('newPassword', form) || '';

  const ruleResults = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(newPassword) })),
    [newPassword]
  );

  const passedCount = ruleResults.filter((r) => r.passed).length;
  const strengthPercent = (passedCount / PASSWORD_RULES.length) * 100;
  const strengthColor =
    passedCount <= 1 ? '#ff4d4f' : passedCount <= 2 ? '#faad14' : passedCount <= 3 ? '#1890ff' : '#52c41a';

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const request: PasswordChangeRequest = {
        loginId: values.loginId,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };
      passwordChangeMutation.mutate(request, {
        onSuccess: (response) => {
          message.success(response.data.message);
          form.resetFields();
          onClose();
        },
        onError: (error: unknown) => {
          const err = error as { error?: { message?: string } };
          message.error(err?.error?.message || '비밀번호 변경에 실패했습니다.');
        },
      });
    });
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={480}
      destroyOnClose
      title={null}
      closable={false}
      styles={{ body: { padding: 0 } }}
    >
      {/* 그라데이션 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerIconWrap}>
            <LockOutlined style={{ fontSize: 20, color: '#faad14' }} />
          </div>
          <div>
            <Text strong style={styles.headerTitle}>
              비밀번호 변경
            </Text>
            <br />
            <Text style={styles.headerSubtitle}>
              보안을 위해 주기적으로 변경해주세요
            </Text>
          </div>
        </div>
        <Button
          type="text"
          onClick={handleClose}
          style={{ color: '#fff', fontSize: 16 }}
        >
          ✕
        </Button>
      </div>

      <div style={{ padding: '24px 24px 16px' }}>
        <Form
          form={form}
          layout="vertical"
          requiredMark
        >
          <Form.Item
            label="아이디"
            name="loginId"
            rules={[{ required: true, message: '아이디를 입력하세요' }]}
          >
            <Input placeholder="아이디를 입력하세요" />
          </Form.Item>

          <Form.Item
            label="현재 비밀번호"
            name="currentPassword"
            rules={[{ required: true, message: '현재 비밀번호를 입력하세요' }]}
          >
            <Input.Password placeholder="현재 비밀번호를 입력하세요" />
          </Form.Item>

          <Form.Item
            label="새 비밀번호"
            name="newPassword"
            rules={[
              { required: true, message: '새 비밀번호를 입력하세요' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const allPassed = PASSWORD_RULES.every((rule) => rule.test(value));
                  if (!allPassed) {
                    return Promise.reject(new Error('비밀번호 규칙을 모두 충족해야 합니다'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password placeholder="새 비밀번호를 입력하세요" />
          </Form.Item>

          {/* 비밀번호 강도 표시 */}
          {newPassword && (
            <div style={{ marginTop: -16, marginBottom: 16 }}>
              <Progress
                percent={strengthPercent}
                showInfo={false}
                strokeColor={strengthColor}
                size="small"
              />
              <div style={styles.rulesGrid}>
                {ruleResults.map((rule) => (
                  <div key={rule.label} style={styles.ruleItem}>
                    {rule.passed ? (
                      <CheckCircleFilled style={{ color: '#52c41a', fontSize: 14 }} />
                    ) : (
                      <CloseCircleFilled style={{ color: '#d9d9d9', fontSize: 14 }} />
                    )}
                    <Text
                      style={{
                        fontSize: 12,
                        color: rule.passed ? '#52c41a' : '#999',
                      }}
                    >
                      {rule.label}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Form.Item
            label="새 비밀번호 확인"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '새 비밀번호를 다시 입력하세요' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('비밀번호가 일치하지 않습니다'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="새 비밀번호를 다시 입력하세요" />
          </Form.Item>
        </Form>
      </div>

      {/* 하단 버튼 */}
      <div style={styles.footer}>
        <Button onClick={handleClose} size="large" style={{ minWidth: 100 }}>
          취소
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
          loading={passwordChangeMutation.isPending}
          style={styles.submitButton}
        >
          비밀번호 변경
        </Button>
      </div>
    </Modal>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: 'linear-gradient(90deg, #5b3cc4 0%, #7c5ce7 100%)',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderRadius: '8px 8px 0 0',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    marginTop: 8,
  },
  ruleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  footer: {
    padding: '12px 24px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
  },
  submitButton: {
    background: 'linear-gradient(90deg, #5b3cc4 0%, #1890ff 100%)',
    border: 'none',
    minWidth: 140,
  },
};

export default PasswordChangeModal;
