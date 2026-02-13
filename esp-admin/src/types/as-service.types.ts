export type IssueType = 'MALFUNCTION' | 'CLEANING' | 'REPLACEMENT' | 'INSPECTION' | 'OTHER';

export type ASStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'ASSIGNED'
  | 'VISIT_SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type RepairType = 'FILTER_REPLACE' | 'PART_REPLACE' | 'CLEANING' | 'WIRING' | 'OTHER';

export type ASFileType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

export interface ASRequest {
  requestId: number;
  storeId: number;
  equipmentId: number;
  requestedBy: number;
  issueType: IssueType;
  description: string;
  preferredVisitDatetime: string | null;
  status: ASStatus;
  dealerId: number | null;
  acceptedAt: string | null;
  visitScheduledDatetime: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ASAttachment {
  attachmentId: number;
  requestId: number;
  fileType: ASFileType;
  filePath: string;
  fileName: string;
  uploadedAt: string;
}

export interface ASReportPart {
  partName: string;
  unitPrice: number;
  quantity: number;
}

export interface ASReport {
  reportId: number;
  requestId: number;
  dealerId: number;
  repairType: RepairType;
  repairDescription: string;
  partsUsed: ASReportPart[];
  totalPartsCost: number;
  createdAt: string;
}

export interface ASReportAttachment {
  attachmentId: number;
  reportId: number;
  fileType: 'IMAGE' | 'VIDEO';
  filePath: string;
  fileName: string;
  uploadedAt: string;
}
