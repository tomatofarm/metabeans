import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  ShopOutlined,
  DesktopOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import type { StoreTreeNode } from '../../types/equipment.types';

interface StoreTreeProps {
  stores: StoreTreeNode[];
  onSelectStore?: (storeId: number) => void;
  onSelectEquipment?: (equipmentId: number) => void;
  onSelectController?: (controllerId: number) => void;
}

function buildTreeData(stores: StoreTreeNode[]): DataNode[] {
  return stores.map((store) => ({
    title: store.storeName,
    key: `store-${store.storeId}`,
    icon: <ShopOutlined />,
    children: store.floors.flatMap((floor) =>
      floor.gateways.flatMap((gw) =>
        gw.equipments.map((equip) => ({
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
      ),
    ),
  }));
}

export default function StoreTree({
  stores,
  onSelectStore,
  onSelectEquipment,
  onSelectController,
}: StoreTreeProps) {
  const treeData = buildTreeData(stores);

  const handleSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0]?.toString();
    if (!key) return;

    const [type, id] = key.split('-');
    const numId = parseInt(id ?? '0', 10);

    switch (type) {
      case 'store':
        onSelectStore?.(numId);
        break;
      case 'equipment':
        onSelectEquipment?.(numId);
        break;
      case 'controller':
        onSelectController?.(numId);
        break;
    }
  };

  return <Tree showIcon defaultExpandAll treeData={treeData} onSelect={handleSelect} />;
}
