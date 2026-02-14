import { Typography } from 'antd';
import CustomerListPage from './CustomerListPage';

export default function CustomerPage() {
  return (
    <div style={{ padding: '0 0 24px' }}>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>
        고객 현황
      </Typography.Title>
      <CustomerListPage />
    </div>
  );
}
