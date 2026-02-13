import { Tree, Empty } from 'antd';
import {
  ShopOutlined,
  HomeOutlined,
  ApiOutlined,
  DesktopOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { useUIStore } from '@/stores/uiStore';
import type { EquipmentTreeSite } from '@/types/equipment.types';
import type { StatusLevel } from '@/utils/constants';

const STATUS_ICON_STYLE: Record<StatusLevel, React.CSSProperties> = {
  green: {},
  yellow: { color: '#faad14' },
  red: { color: '#ff4d4f' },
};

function getStatusIcon(status: StatusLevel) {
  if (status === 'red') return <ExclamationCircleOutlined style={STATUS_ICON_STYLE.red} />;
  if (status === 'yellow') return <WarningOutlined style={STATUS_ICON_STYLE.yellow} />;
  return null;
}

function buildTreeData(sites: EquipmentTreeSite[]): DataNode[] {
  return sites.map((site) => ({
    key: `store-${site.storeId}`,
    title: (
      <span>
        {site.storeName} {getStatusIcon(site.status)}
      </span>
    ),
    icon: <ShopOutlined />,
    children: site.floors.map((floor) => ({
      key: `floor-${floor.floorId}`,
      title: floor.floorName,
      icon: <HomeOutlined />,
      children: floor.gateways.map((gw) => ({
        key: `gw-${gw.gatewayId}`,
        title: gw.gwDeviceId,
        icon: <ApiOutlined style={gw.connectionStatus === 'OFFLINE' ? { color: '#ff4d4f' } : {}} />,
        children: gw.equipments.map((eq) => ({
          key: `eq-${eq.equipmentId}`,
          title: (
            <span>
              {eq.equipmentName} {getStatusIcon(eq.status)}
            </span>
          ),
          icon: <DesktopOutlined />,
          children: eq.controllers.map((ctrl) => ({
            key: `ctrl-${ctrl.controllerId}`,
            title: (
              <span>
                {ctrl.ctrlDeviceId} {getStatusIcon(ctrl.status)}
              </span>
            ),
            icon: (
              <ThunderboltOutlined
                style={ctrl.connectionStatus === 'OFFLINE' ? { color: '#ff4d4f' } : {}}
              />
            ),
            isLeaf: true,
          })),
        })),
      })),
    })),
  }));
}

interface StoreTreeProps {
  data?: EquipmentTreeSite[];
}

export function StoreTree({ data = [] }: StoreTreeProps) {
  const { selectStore, selectEquipment, selectController } = useUIStore();

  const treeData = buildTreeData(data);

  if (treeData.length === 0) {
    return <Empty description="매장 데이터 없음" style={{ marginTop: 40 }} />;
  }

  const handleSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0]?.toString();
    if (!key) return;

    if (key.startsWith('store-')) {
      selectStore(Number(key.replace('store-', '')));
    } else if (key.startsWith('eq-')) {
      selectEquipment(Number(key.replace('eq-', '')));
    } else if (key.startsWith('ctrl-')) {
      selectController(Number(key.replace('ctrl-', '')));
    }
  };

  return (
    <Tree
      showIcon
      defaultExpandAll
      treeData={treeData}
      onSelect={handleSelect}
      style={{ padding: '0 8px' }}
    />
  );
}
