import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ConfirmModalProps {
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export function showConfirmModal({
  title,
  content,
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '취소',
  danger = false,
}: ConfirmModalProps) {
  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText: confirmText,
    cancelText,
    okButtonProps: danger ? { danger: true } : undefined,
    onOk: onConfirm,
    onCancel,
  });
}
