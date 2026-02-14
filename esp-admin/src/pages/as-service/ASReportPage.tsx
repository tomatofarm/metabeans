import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Image,
  Spin,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useASReport, useASDetail } from '../../api/as-service.api';
import { formatDateTime, formatDate } from '../../utils/formatters';
import { AS_STATUS_LABELS, AS_STATUS_COLORS } from '../../utils/constants';
import type { PartUsed, RepairType } from '../../types/as-service.types';

const { Title, Text } = Typography;

const REPAIR_TYPE_LABELS: Record<RepairType, string> = {
  FILTER_REPLACE: '필터 교체',
  PART_REPLACE: '부품 교체',
  CLEANING: '청소',
  WIRING: '배선 작업',
  OTHER: '기타',
};

const RESULT_LABELS: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: '완료', color: 'green' },
  PARTIAL: { label: '부분완료', color: 'orange' },
  REVISIT_NEEDED: { label: '재방문필요', color: 'red' },
};

interface ASReportPageProps {
  requestId: number;
  onBack: () => void;
}

export default function ASReportPage({ requestId, onBack }: ASReportPageProps) {
  const navigate = useNavigate();
  const { data: reportData, isLoading: reportLoading } = useASReport(requestId);
  const { data: detailData, isLoading: detailLoading } = useASDetail(requestId);

  const report = reportData?.data;
  const detail = detailData?.data;

  if (reportLoading || detailLoading) {
    return (
      <Card>
        <Spin />
      </Card>
    );
  }

  if (!report) {
    return (
      <Card>
        <Text type="secondary">보고서 정보를 찾을 수 없습니다.</Text>
        <br />
        <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ marginTop: 16 }}>
          돌아가기
        </Button>
      </Card>
    );
  }

  const partsColumns = [
    {
      title: '품명',
      dataIndex: 'partName',
      key: 'partName',
      width: 200,
    },
    {
      title: '가격 (원)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '소계',
      key: 'subtotal',
      width: 150,
      render: (_: unknown, record: PartUsed) =>
        (record.unitPrice * record.quantity).toLocaleString() + '원',
    },
  ];

  const resultInfo = RESULT_LABELS[report.result] ?? { label: report.result, color: 'default' };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          돌아가기
        </Button>
      </Space>

      <Card title="A/S 완료 보고서" style={{ marginBottom: 16 }}>
        {/* 연결된 A/S 신청 정보 요약 */}
        {detail && (
          <>
            <Descriptions
              column={{ xs: 1, sm: 2 }}
              bordered
              size="small"
              title="A/S 신청 정보"
            >
              <Descriptions.Item label="접수번호">
                AS-{detail.createdAt ? new Date(detail.createdAt).toISOString().slice(0, 10).replace(/-/g, '') : ''}-{String(detail.requestId).slice(-3).padStart(3, '0')}
              </Descriptions.Item>
              <Descriptions.Item label="상태">
                <Tag color={AS_STATUS_COLORS[detail.status] ?? 'default'}>
                  {AS_STATUS_LABELS[detail.status] ?? detail.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="매장명">{detail.store.storeName}</Descriptions.Item>
              <Descriptions.Item label="장비명">{detail.equipment.equipmentName}</Descriptions.Item>
            </Descriptions>
            <Divider />
          </>
        )}

        {/* 보고서 상세 */}
        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
          <Descriptions.Item label="방문일">
            {formatDate(report.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="처리 결과">
            <Tag color={resultInfo.color}>{resultInfo.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="수리 유형">
            {REPAIR_TYPE_LABELS[report.repairType] ?? report.repairType}
          </Descriptions.Item>
          <Descriptions.Item label="보고서 작성일">
            {formatDateTime(report.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="처리 내용" span={2}>
            {report.repairDescription ?? '-'}
          </Descriptions.Item>
          {report.remarks && (
            <Descriptions.Item label="비고" span={2}>
              {report.remarks}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 교체 부품 상세 */}
      <Card title="교체 부품 상세" style={{ marginBottom: 16 }}>
        <Table
          rowKey="partName"
          columns={partsColumns}
          dataSource={report.partsUsed}
          pagination={false}
          size="small"
          summary={() => {
            const totalParts = report.totalPartsCost ?? 0;
            const laborCost = report.laborCost ?? 0;
            const totalCost = report.totalCost ?? totalParts + laborCost;
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong>부품 합계</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>{totalParts.toLocaleString()}원</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                {laborCost > 0 && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>공임비</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong>{laborCost.toLocaleString()}원</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong style={{ fontSize: 16 }}>총 비용</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong type="danger" style={{ fontSize: 16 }}>
                      {totalCost.toLocaleString()}원
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>

      {/* 첨부 사진 */}
      {report.attachments && report.attachments.length > 0 && (
        <Card title="첨부 사진" style={{ marginBottom: 16 }}>
          <Image.PreviewGroup>
            <Space wrap>
              {report.attachments.map((att) => (
                <div key={att.attachmentId} style={{ textAlign: 'center' }}>
                  <Image
                    width={150}
                    height={150}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                    src={att.filePath}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAAb0lEQVR4nO3BAQ0AAADCoPd/aLMAQIgBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGBuEfAAASEaU3QAAAAASUVORK5CYII="
                    alt={att.fileName}
                  />
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {att.fileName}
                    </Text>
                  </div>
                </div>
              ))}
            </Space>
          </Image.PreviewGroup>
        </Card>
      )}

      {/* A/S 신청 버튼 (하단) */}
      <Card>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            돌아가기
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              if (detail) {
                const params = new URLSearchParams();
                params.set('storeId', String(detail.store.storeId));
                params.set('equipmentId', String(detail.equipment.equipmentId));
                navigate(`/as-service/request?${params.toString()}`);
              } else {
                navigate('/as-service/request');
              }
            }}
          >
            A/S 신청
          </Button>
        </Space>
      </Card>
    </div>
  );
}
