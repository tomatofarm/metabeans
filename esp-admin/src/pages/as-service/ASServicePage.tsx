import { Tabs, Button, Typography, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import ASAlertListPage from './ASAlertListPage';
import ASRequestPage from './ASRequestPage';

const { Title, Text } = Typography;

function ASStatusPlaceholder() {
  return (
    <Card>
      <Text type="secondary">
        A/S 처리 현황 화면은 Phase 1 순서 10에서 구현됩니다.
      </Text>
    </Card>
  );
}

function ASReportPlaceholder() {
  return (
    <Card>
      <Text type="secondary">
        A/S 완료 보고서 화면은 Phase 1 순서 10에서 구현됩니다.
      </Text>
    </Card>
  );
}

function ASServiceTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname.includes('/as-service/request')) return 'request';
    if (location.pathname.includes('/as-service/status')) return 'status';
    if (location.pathname.includes('/as-service/report')) return 'report';
    return 'alerts';
  };

  const handleTabChange = (key: string) => {
    switch (key) {
      case 'alerts':
        navigate('/as-service');
        break;
      case 'request':
        navigate('/as-service/request');
        break;
      case 'status':
        navigate('/as-service/status');
        break;
      case 'report':
        navigate('/as-service/report');
        break;
    }
  };

  const tabItems = [
    { key: 'alerts', label: '알림 현황' },
    { key: 'request', label: 'A/S 신청' },
    { key: 'status', label: '처리 현황' },
    { key: 'report', label: '완료 보고서' },
  ];

  const activeTab = getActiveTab();

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          A/S 관리
        </Title>
        {activeTab !== 'request' && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/as-service/request')}
          >
            A/S 신청
          </Button>
        )}
      </div>
      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />
      {activeTab === 'alerts' && <ASAlertListPage />}
      {activeTab === 'request' && <ASRequestPage />}
      {activeTab === 'status' && <ASStatusPlaceholder />}
      {activeTab === 'report' && <ASReportPlaceholder />}
    </div>
  );
}

export default function ASServicePage() {
  return (
    <Routes>
      <Route path="*" element={<ASServiceTabs />} />
    </Routes>
  );
}
