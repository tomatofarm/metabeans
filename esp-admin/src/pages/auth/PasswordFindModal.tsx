import React from 'react';
import { Modal, Form, Input, Button, Alert, Row, Col, Typography, message } from 'antd';
import { KeyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { usePasswordFind } from '../../api/auth.api';
import type { PasswordResetRequest } from '../../types/auth.types';

const { Text } = Typography;

interface PasswordFindModalProps {
  open: boolean;
  onClose: () => void;
}

const PasswordFindModal: React.FC<PasswordFindModalProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const passwordFindMutation = usePasswordFind();

  const handleSubmit = () => {
    form.validateFields().then((values: PasswordResetRequest) => {
      passwordFindMutation.mutate(values, {
        onSuccess: (response) => {
          message.success(response.data.message);
          form.resetFields();
          onClose();
        },
        onError: (error: unknown) => {
          const err = error as { error?: { message?: string } };
          message.error(err?.error?.message || '요청에 실패했습니다.');
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
      width={520}
      destroyOnClose
      title={null}
      closable={false}
      styles={{ body: { padding: 0 } }}
    >
      {/* 그라데이션 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerIconWrap}>
            <KeyOutlined style={{ fontSize: 20, color: '#faad14' }} />
          </div>
          <div>
            <Text strong style={styles.headerTitle}>
              비밀번호 초기화 요청
            </Text>
            <br />
            <Text style={styles.headerSubtitle}>
              관리자에게 암호 리셋을 요청합니다
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
        {/* 안내 배너 */}
        <Alert
          icon={<InfoCircleOutlined />}
          type="info"
          showIcon
          message={
            <div>
              <div>비밀번호 초기화는 관리자 승인 후 처리됩니다.</div>
              <div>등록된 연락처로 임시 비밀번호가 전달됩니다.</div>
            </div>
          }
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          requiredMark
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="아이디"
                name="loginId"
                rules={[{ required: true, message: '아이디를 입력하세요' }]}
              >
                <Input placeholder="가입 시 등록한 아이디" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="이름"
                name="name"
                rules={[{ required: true, message: '이름을 입력하세요' }]}
              >
                <Input placeholder="이름을 입력하세요" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="연락처"
            name="phone"
            rules={[{ required: true, message: '연락처를 입력하세요' }]}
          >
            <Input placeholder="010-0000-0000" />
          </Form.Item>

          <Form.Item
            label="이메일"
            name="email"
          >
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Form.Item
            label="요청 사유"
            name="reason"
          >
            <Input.TextArea
              placeholder="비밀번호 초기화 요청 사유를 간단히 입력해주세요 (선택)"
              rows={3}
            />
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
          loading={passwordFindMutation.isPending}
          style={styles.submitButton}
        >
          초기화 요청
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
  footer: {
    padding: '12px 24px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
  },
  submitButton: {
    background: 'linear-gradient(90deg, #5b3cc4 0%, #1890ff 100%)',
    border: 'none',
    minWidth: 120,
  },
};

export default PasswordFindModal;
