import { useState, useCallback } from 'react';
import { Card, Table, Space, Select, Input, Tag, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCustomerList, useCustomerMapData, useCustomerDealerOptions } from '../../api/customer.api';
import { REGION_OPTIONS } from '../../api/mock/customer.mock';
import { formatDate } from '../../utils/formatters';
import type { CustomerListItem, CustomerListParams } from '../../types/customer.types';
import type { StoreStatus } from '../../types/store.types';
import CustomerEditModal from './CustomerEditModal';

// --- 상태 라벨/색상 ---

const STATUS_CONFIG: Record<StoreStatus, { color: string; label: string }> = {
  ACTIVE: { color: 'green', label: '활성' },
  INACTIVE: { color: 'default', label: '비활성' },
  PENDING: { color: 'gold', label: '대기' },
};

const STATUS_FILTER_OPTIONS = [
  { value: 'ACTIVE', label: '활성' },
  { value: 'INACTIVE', label: '비활성' },
];

// --- 지도 마커 아이콘 ---

function createCustomerMarkerIcon(status: StoreStatus): L.DivIcon {
  const color = status === 'ACTIVE' ? '#52c41a' : '#bfbfbf';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export default function CustomerListPage() {
  // 필터 상태
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StoreStatus | undefined>();
  const [regionFilter, setRegionFilter] = useState<string | undefined>();
  const [dealerFilter, setDealerFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);

  // 모달 상태
  const [editStoreId, setEditStoreId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // API 쿼리 파라미터
  const params: CustomerListParams = {
    search: search || undefined,
    status: statusFilter,
    region: regionFilter,
    dealerId: dealerFilter,
    page,
    pageSize: 20,
  };

  const { data: listData, isLoading } = useCustomerList(params);
  const { data: mapData } = useCustomerMapData();
  const { data: dealerOptions } = useCustomerDealerOptions();

  const customers = listData?.data ?? [];
  const totalCount = listData?.meta?.totalCount ?? 0;
  const mapStores = mapData?.data ?? [];

  const openEdit = useCallback((storeId: number) => {
    setEditStoreId(storeId);
    setModalOpen(true);
  }, []);

  const closeEdit = useCallback(() => {
    setModalOpen(false);
    setEditStoreId(null);
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter(undefined);
    setRegionFilter(undefined);
    setDealerFilter(undefined);
    setPage(1);
  };

  // --- 테이블 컬럼 ---

  const columns: ColumnsType<CustomerListItem> = [
    {
      title: '매장명',
      dataIndex: 'storeName',
      key: 'storeName',
      width: 180,
      sorter: (a, b) => a.storeName.localeCompare(b.storeName),
    },
    {
      title: '점주명',
      dataIndex: 'ownerName',
      key: 'ownerName',
      width: 100,
    },
    {
      title: '주소',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '전화번호',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: '업종',
      dataIndex: 'businessType',
      key: 'businessType',
      width: 100,
    },
    {
      title: '장비 수',
      dataIndex: 'equipmentCount',
      key: 'equipmentCount',
      width: 80,
      align: 'center',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (val: StoreStatus) => {
        const cfg = STATUS_CONFIG[val];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: '담당 대리점',
      dataIndex: 'dealerName',
      key: 'dealerName',
      width: 140,
    },
    {
      title: '등록일',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      width: 120,
      render: (val: string) => formatDate(val),
      sorter: (a, b) =>
        new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime(),
      defaultSortOrder: 'descend',
    },
  ];

  return (
    <div>
      {/* 지도 영역 */}
      <Card title="매장 위치" style={{ marginBottom: 16 }} styles={{ body: { padding: 0 } }}>
        <div style={{ height: 400 }}>
          <MapContainer
            center={[37.5326, 126.9786]}
            zoom={11}
            style={{ height: '100%', width: '100%', borderRadius: '0 0 8px 8px' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapStores.map((store) => (
              <Marker
                key={store.storeId}
                position={[store.latitude, store.longitude]}
                icon={createCustomerMarkerIcon(store.status)}
              >
                <Popup>
                  <div>
                    <strong>{store.storeName}</strong>
                    <br />
                    <span style={{ fontSize: 12 }}>{store.address}</span>
                    <br />
                    <span style={{ fontSize: 12 }}>
                      장비: {store.equipmentCount}대 /{' '}
                      <Tag
                        color={STATUS_CONFIG[store.status].color}
                        style={{ marginRight: 0 }}
                      >
                        {STATUS_CONFIG[store.status].label}
                      </Tag>
                    </span>
                    <br />
                    <a
                      style={{ fontSize: 12, cursor: 'pointer' }}
                      onClick={() => openEdit(store.storeId)}
                    >
                      상세보기
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </Card>

      {/* 고객 목록 테이블 */}
      <Card title="고객 목록">
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="매장명, 점주명 검색"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="상태"
            allowClear
            style={{ width: 120 }}
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val as StoreStatus | undefined);
              setPage(1);
            }}
          />
          <Select
            placeholder="지역"
            allowClear
            style={{ width: 120 }}
            options={REGION_OPTIONS}
            value={regionFilter}
            onChange={(val) => {
              setRegionFilter(val);
              setPage(1);
            }}
          />
          <Select
            placeholder="담당 대리점"
            allowClear
            style={{ width: 160 }}
            options={dealerOptions?.map((d) => ({
              value: d.dealerId,
              label: d.dealerName,
            }))}
            value={dealerFilter}
            onChange={(val) => {
              setDealerFilter(val);
              setPage(1);
            }}
          />
          <Button icon={<ReloadOutlined />} onClick={handleResetFilters}>
            초기화
          </Button>
        </Space>

        <Table<CustomerListItem>
          rowKey="storeId"
          columns={columns}
          dataSource={customers}
          loading={isLoading}
          pagination={{
            current: page,
            total: totalCount,
            pageSize: 20,
            showTotal: (total) => `총 ${total}건`,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
          }}
          size="middle"
          onRow={(record) => ({
            onClick: () => openEdit(record.storeId),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* 수정 모달 */}
      <CustomerEditModal
        storeId={editStoreId}
        open={modalOpen}
        onClose={closeEdit}
      />
    </div>
  );
}
