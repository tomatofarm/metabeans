import { Layout, Tree, Input, Empty } from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  ShopOutlined,
  HomeOutlined,
  ApiOutlined,
  DesktopOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import { useState, useMemo } from 'react';
import { useUiStore } from '../../stores/uiStore';
import type { StoreTreeNode } from '../../types/equipment.types';
import { mockStoreTree } from '../../api/mock/common.mock';

const { Sider } = Layout;
const { Search } = Input;

function buildTreeData(stores: StoreTreeNode[], searchText: string): DataNode[] {
  const filtered = searchText
    ? stores.filter((s) => s.storeName.toLowerCase().includes(searchText.toLowerCase()))
    : stores;

  return filtered.map((store) => ({
    title: store.storeName,
    key: `store-${store.storeId}`,
    icon: <ShopOutlined />,
    children: store.floors.map((floor) => ({
      title: floor.floorName ?? floor.floorCode,
      key: `floor-${floor.floorId}`,
      icon: <HomeOutlined />,
      children: floor.gateways.map((gw) => ({
        title: gw.gwDeviceId,
        key: `gateway-${gw.gatewayId}`,
        icon: <ApiOutlined />,
        children: gw.equipments.map((equip) => ({
          title: equip.equipmentName ?? equip.mqttEquipmentId,
          key: `equipment-${equip.equipmentId}`,
          icon: <DesktopOutlined />,
          children: equip.controllers.map((ctrl) => ({
            title: ctrl.ctrlDeviceId,
            key: `controller-${ctrl.controllerId}`,
            icon: <ControlOutlined />,
            isLeaf: true,
          })),
        })),
      })),
    })),
  }));
}

export default function Sidebar() {
  const [searchText, setSearchText] = useState('');
  const { sidebarCollapsed, selectStore, selectEquipment, selectController } = useUiStore();

  const treeData = useMemo(() => buildTreeData(mockStoreTree, searchText), [searchText]);

  const handleSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0]?.toString();
    if (!key) return;

    const [type, id] = key.split('-');
    const numId = parseInt(id ?? '0', 10);

    switch (type) {
      case 'store':
        selectStore(numId);
        break;
      case 'equipment':
        selectEquipment(numId);
        break;
      case 'controller':
        selectController(numId);
        break;
    }
  };

  return (
    <Sider
      width={260}
      collapsedWidth={0}
      collapsed={sidebarCollapsed}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        overflow: 'auto',
      }}
    >
      <div style={{ padding: '16px 12px 8px' }}>
        <Search
          placeholder="매장 검색"
          allowClear
          size="small"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      {treeData.length > 0 ? (
        <Tree
          showIcon
          defaultExpandAll
          treeData={treeData}
          onSelect={handleSelect}
          style={{ padding: '0 4px' }}
        />
      ) : (
        <Empty description="매장 없음" style={{ marginTop: 40 }} />
      )}
    </Sider>
  );
}
