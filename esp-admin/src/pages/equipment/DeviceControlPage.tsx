import { useState } from 'react';
import { Tabs, Empty } from 'antd';
import { PoweroffOutlined, ControlOutlined, SwapOutlined } from '@ant-design/icons';
import { useUiStore } from '../../stores/uiStore';
import ControlPowerPage from './ControlPowerPage';
import ControlDamperPage from './ControlDamperPage';
import ControlFanPage from './ControlFanPage';

export default function DeviceControlPage() {
  const selectedEquipmentId = useUiStore((s) => s.selectedEquipmentId);
  const [activeTab, setActiveTab] = useState('power');

  if (!selectedEquipmentId) {
    return <Empty description="좌측 트리에서 장비를 선택하세요" />;
  }

  const tabItems = [
    {
      key: 'power',
      label: (
        <span>
          <PoweroffOutlined /> 전원 제어
        </span>
      ),
      children: <ControlPowerPage />,
    },
    {
      key: 'damper',
      label: (
        <span>
          <ControlOutlined /> 방화셔터(댐퍼)
        </span>
      ),
      children: <ControlDamperPage />,
    },
    {
      key: 'fan',
      label: (
        <span>
          <SwapOutlined /> 송풍기(팬)
        </span>
      ),
      children: <ControlFanPage />,
    },
  ];

  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={tabItems}
      type="card"
    />
  );
}
