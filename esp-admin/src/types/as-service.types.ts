// A/S 고장 유형
export type IssueType = 'MALFUNCTION' | 'CLEANING' | 'REPLACEMENT' | 'INSPECTION' | 'OTHER';

// A/S 처리 상태 (7단계)
export type ASStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'ASSIGNED'
  | 'VISIT_SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

// 수리 유형
export type RepairType = 'FILTER_REPLACE' | 'PART_REPLACE' | 'CLEANING' | 'WIRING' | 'OTHER';

// 첨부파일 유형
export type FileType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

// A/S 접수 (as_requests 테이블)
export interface ASRequest {
  requestId: number;
  storeId: number;
  equipmentId?: number;
  requestedBy: number;
  issueType: IssueType;
  description: string;
  preferredVisitDatetime?: string;
  status: ASStatus;
  dealerId?: number;
  acceptedAt?: string;
  visitScheduledDatetime?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// A/S 첨부파일 (as_attachments 테이블)
export interface ASAttachment {
  attachmentId: number;
  requestId: number;
  fileType: FileType;
  filePath: string;
  fileName: string;
  uploadedAt: string;
}

// 교체 부품 상세
export interface PartUsed {
  partName: string;
  unitPrice: number;
  quantity: number;
}

// A/S 완료 보고서 (as_reports 테이블)
export interface ASReport {
  reportId: number;
  requestId: number;
  dealerId: number;
  repairType: RepairType;
  repairDescription?: string;
  partsUsed: PartUsed[];
  totalPartsCost?: number;
  createdAt: string;
}

// 보고서 첨부파일 (as_report_attachments 테이블)
export interface ASReportAttachment {
  attachmentId: number;
  reportId: number;
  fileType: 'IMAGE' | 'VIDEO';
  filePath: string;
  fileName: string;
  uploadedAt: string;
}
