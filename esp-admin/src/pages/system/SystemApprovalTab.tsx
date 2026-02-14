import { useState } from 'react';
import { Table, Button, Tag, Modal, Input, message, Space, Spin, Typography, Divider } from 'antd';
import { CheckOutlined, CloseOutlined, KeyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  usePendingApprovals,
  useApproveUser,
  useRejectUser,
  usePasswordResetRequests,
  useApprovePasswordReset,
} from '../../api/system.api';
import type { PendingApproval, PasswordResetRequestItem } from '../../types/system.types';
import { ROLE_CONFIG } from '../../utils/constants';

const { Text, Title } = Typography;
const { TextArea } = Input;

export default function SystemApprovalTab() {
  const { data: approvalResponse, isLoading: approvalsLoading } = usePendingApprovals();
  const { data: resetResponse, isLoading: resetsLoading } = usePasswordResetRequests();
  const approveMutation = useApproveUser();
  const rejectMutation = useRejectUser();
  const resetMutation = useApprovePasswordReset();

  const [rejectModal, setRejectModal] = useState<{ open: boolean; userId: number | null }>({
    open: false,
    userId: null,
  });
  const [rejectReason, setRejectReason] = useState('');

  const approvals = approvalResponse?.data ?? [];
  const resetRequests = resetResponse?.data ?? [];

  const handleApprove = async (userId: number) => {
    try {
      await approveMutation.mutateAsync(userId);
      message.success('승인이 완료되었습니다.');
    } catch {
      message.error('승인 처리에 실패했습니다.');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.userId) return;
    if (!rejectReason.trim()) {
      message.warning('반려 사유를 입력해주세요.');
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        userId: rejectModal.userId,
        reason: rejectReason,
      });
      message.success('반려 처리가 완료되었습니다.');
      setRejectModal({ open: false, userId: null });
      setRejectReason('');
    } catch {
      message.error('반려 처리에 실패했습니다.');
    }
  };

  const handlePasswordReset = async (requestId: number) => {
    try {
      const result = await resetMutation.mutateAsync(requestId);
      Modal.success({
        title: '비밀번호 초기화 완료',
        content: (
          <div>
            <p>임시 비밀번호가 발급되었습니다.</p>
            <p>
              <Text strong copyable>
                {result.data.tempPassword}
              </Text>
            </p>
          </div>
        ),
      });
    } catch {
      message.error('비밀번호 초기화에 실패했습니다.');
    }
  };

  const approvalColumns: ColumnsType<PendingApproval> = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '아이디',
      dataIndex: 'loginId',
      key: 'loginId',
      width: 130,
    },
    {
      title: '역할',
      dataIndex: 'role',
      key: 'role',
      width: 110,
      render: (role: string) => (
        <Tag color={ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]?.color}>
          {ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]?.label ?? role}
        </Tag>
      ),
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
    },
    {
      title: '전화번호',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: '상호명',
      dataIndex: 'businessName',
      key: 'businessName',
      width: 150,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '사업자등록번호',
      dataIndex: 'businessNumber',
      key: 'businessNumber',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: '신청일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '액션',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record.userId)}
            loading={approveMutation.isPending}
          >
            승인
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={() => setRejectModal({ open: true, userId: record.userId })}
          >
            반려
          </Button>
        </Space>
      ),
    },
  ];

  const resetColumns: ColumnsType<PasswordResetRequestItem> = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '아이디',
      dataIndex: 'loginId',
      key: 'loginId',
      width: 130,
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '요청일시',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 160,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '액션',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<KeyOutlined />}
          onClick={() => handlePasswordReset(record.requestId)}
          loading={resetMutation.isPending}
        >
          초기화 승인
        </Button>
      ),
    },
  ];

  if (approvalsLoading || resetsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={5}>가입 승인 대기 ({approvals.length}건)</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        회원가입 신청 후 승인 대기 중인 사용자 목록입니다.
      </Text>
      <Table
        columns={approvalColumns}
        dataSource={approvals}
        rowKey="userId"
        pagination={false}
        bordered
        size="middle"
        scroll={{ x: 1200 }}
        locale={{ emptyText: '승인 대기 중인 요청이 없습니다.' }}
      />

      <Divider />

      <Title level={5}>비밀번호 초기화 요청 ({resetRequests.length}건)</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        비밀번호 초기화를 요청한 사용자 목록입니다. 승인 시 임시 비밀번호가 발급됩니다.
      </Text>
      <Table
        columns={resetColumns}
        dataSource={resetRequests}
        rowKey="requestId"
        pagination={false}
        bordered
        size="middle"
        scroll={{ x: 700 }}
        locale={{ emptyText: '비밀번호 초기화 요청이 없습니다.' }}
      />

      <Modal
        title="가입 반려"
        open={rejectModal.open}
        onOk={handleRejectConfirm}
        onCancel={() => {
          setRejectModal({ open: false, userId: null });
          setRejectReason('');
        }}
        okText="반려 확인"
        cancelText="취소"
        okButtonProps={{ danger: true, loading: rejectMutation.isPending }}
      >
        <p>반려 사유를 입력해주세요.</p>
        <TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="반려 사유를 입력하세요..."
        />
      </Modal>
    </div>
  );
}
