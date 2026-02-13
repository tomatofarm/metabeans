export type BusinessType = '튀김' | '굽기' | '볶음' | '복합' | '커피로스팅';

export type StoreStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export type RegisteredBy = 'OWNER' | 'DEALER' | 'ADMIN';

export interface Store {
  storeId: number;
  siteId: string;
  storeName: string;
  brandName: string | null;
  businessType: BusinessType;
  address: string;
  latitude: number;
  longitude: number;
  regionCode: string;
  districtCode: string;
  ownerId: number | null;
  hqId: number | null;
  dealerId: number | null;
  contactName: string;
  contactPhone: string;
  floorCount: number;
  status: StoreStatus;
  registeredBy: RegisteredBy;
  createdAt: string;
  updatedAt: string;
}

export interface StoreFloor {
  floorId: number;
  storeId: number;
  floorCode: string;
  floorName: string;
}
