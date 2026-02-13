# MetaBeans ESP 관제시스템 관리툴

## 프로젝트 개요

음식점 주방 배기 장비(ESP 정전식 집진기)를 IoT 기반으로 원격 모니터링·제어하는 웹 관리 플랫폼.
약 200개 매장 대상, 4개 역할(ADMIN, DEALER, HQ, OWNER) 지원.

- **현재 Phase**: Phase 1 — 프론트엔드 목업 (Mock 데이터 기반)
- **산출물**: React 컴포넌트(.tsx), Mock 데이터, 공통 컴포넌트, 타입 정의
- **인수 대상**: 고블린게임즈 개발팀 (Phase 2에서 백엔드 연동)

## 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React | 18.x |
| 빌드 | Vite | 5.x |
| 언어 | TypeScript | 5.x |
| 라우팅 | React Router | v6 |
| 상태관리 (클라이언트) | Zustand | 4.x |
| 상태관리 (서버) | TanStack Query | 5.x |
| UI 컴포넌트 | Ant Design | 5.x |
| 차트 | Apache ECharts + echarts-for-react | 5.x |
| HTTP | Axios | 1.x |
| 날짜 | dayjs | 1.x |
| 지도 | Leaflet + react-leaflet | 4.x |
| 아이콘 | @ant-design/icons | 5.x |

> Ant Design은 Table, Tree, Form, Steps, Tabs, DatePicker 등 관리툴에 최적화된 컴포넌트를 제공한다.
> ECharts는 마우스 스크롤 확대/축소(dataZoom), 실시간 스트리밍(appendData), 복합 차트를 네이티브 지원한다.

## 필수 참조 문서

**개발 전 반드시 해당 화면과 관련된 문서를 읽고 시작할 것.**

| 문서 | 경로 | 용도 |
|------|------|------|
| 아키텍처/기술스택 정의서 | `docs/MetaBeans_ESP_프로젝트_아키텍처_기술스택_정의서.md` | 전체 아키텍처, 폴더 구조, 기술 선택 근거, Mock→API 전환 패턴 |
| 데이터구조 정의서 v3.0 | `docs/MetaBeans_ESP_데이터구조_정의서_v3_0.md` | DB 스키마(테이블/컬럼), 엔티티 관계, MQTT 메시지 구조, 비즈니스 규칙 |
| REST API 설계서 v1.0 | `docs/MetaBeans_ESP_REST_API_엔드포인트_설계서_v1_0.md` | 81개 API 엔드포인트 명세, 요청/응답 구조, 에러 코드 |
| MQTT 프로토콜 설계서 v1.0 | `docs/MetaBeans_ESP_MQTT_통신_프로토콜_설계서_v1_0.md` | MQTT 토픽, 페이로드 파싱, 알람 판정, 30초 타임아웃, 제어 ACK |
| 최종 피드백 (PDF) | `docs/ESP_관리툴_최종피드백_260212.pdf` | UI 수정사항, 화면별 피드백 (최우선 반영) |

## 프로젝트 디렉토리 구조

```
esp-admin/
├── src/
│   ├── api/                        # API 호출 레이어
│   │   ├── mock/                   # Mock 데이터 및 핸들러
│   │   │   ├── auth.mock.ts
│   │   │   ├── dashboard.mock.ts
│   │   │   ├── equipment.mock.ts
│   │   │   ├── monitoring.mock.ts
│   │   │   ├── control.mock.ts
│   │   │   ├── as-service.mock.ts
│   │   │   ├── customer.mock.ts
│   │   │   ├── system.mock.ts
│   │   │   └── common.mock.ts
│   │   ├── auth.api.ts             # TanStack Query 훅 (Phase 2에서 queryFn만 교체)
│   │   ├── dashboard.api.ts
│   │   ├── equipment.api.ts
│   │   ├── monitoring.api.ts
│   │   ├── control.api.ts
│   │   ├── as-service.api.ts
│   │   ├── customer.api.ts
│   │   └── system.api.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx       # 전체 레이아웃 (헤더 + 사이드바 + 콘텐츠)
│   │   │   ├── Header.tsx          # 상단 네비게이션 (5개 메뉴)
│   │   │   ├── Sidebar.tsx         # 좌측 매장-장비 트리
│   │   │   └── RoleBadge.tsx       # 역할 배지
│   │   ├── common/
│   │   │   ├── StatusTag.tsx       # Green/Yellow/Red 상태 태그
│   │   │   ├── StoreTree.tsx       # 매장>장비>파워팩 트리 (Ant Design Tree)
│   │   │   ├── AirQualityCard.tsx  # IAQ 카드
│   │   │   ├── SensorGauge.tsx     # 센서 게이지
│   │   │   └── ConfirmModal.tsx    # 확인 모달
│   │   └── charts/
│   │       ├── BoardTempChart.tsx  # 보드온도 라인차트
│   │       ├── SparkChart.tsx      # 스파크 산점도
│   │       └── TimeSeriesChart.tsx # 범용 시계열 (확대/축소)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useRole.ts              # 역할 기반 권한 체크
│   │   ├── useSensorData.ts
│   │   └── useEquipmentTree.ts
│   │
│   ├── pages/
│   │   ├── auth/                   # 로그인 + 회원가입 4종
│   │   ├── dashboard/              # 대시보드 (역할별 4종 + 긴급알람)
│   │   ├── equipment/              # 장비관리 (정보/모니터링/제어/이력/등록)
│   │   ├── as-service/             # A/S관리 (알림/접수/처리/보고서)
│   │   ├── customer/               # 고객현황 (목록/수정)
│   │   └── system/                 # 시스템관리 (권한/승인/사용자/기준수치)
│   │
│   ├── stores/                     # Zustand 스토어
│   │   ├── authStore.ts            # 로그인 상태, JWT 토큰, 역할
│   │   ├── uiStore.ts              # 사이드바, 선택된 매장/장비
│   │   └── alertStore.ts           # 긴급알람 상태
│   │
│   ├── types/                      # TypeScript 타입 정의
│   │   ├── auth.types.ts
│   │   ├── store.types.ts
│   │   ├── equipment.types.ts
│   │   ├── sensor.types.ts
│   │   ├── as-service.types.ts
│   │   ├── control.types.ts
│   │   └── system.types.ts
│   │
│   ├── utils/
│   │   ├── constants.ts            # 상태 색상, IAQ 범위, 제어 코드
│   │   ├── statusHelper.ts         # Green/Yellow/Red 판정 로직
│   │   ├── roleHelper.ts           # 역할별 메뉴/권한 헬퍼
│   │   └── formatters.ts           # 날짜, 숫자 포맷
│   │
│   ├── routes/
│   │   └── AppRoutes.tsx           # 전체 라우팅 (역할별 가드 포함)
│   │
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 사용자 역할 및 접근 범위

| 역할 | 코드 | 사용 환경 | 접근 범위 |
|------|------|----------|----------|
| 시스템 관리자 | `ADMIN` | PC | 전체 매장, 모든 기능 |
| 대리점 | `DEALER` | PC/태블릿 | 관할 매장(`stores.dealer_id`), 장비등록/A/S |
| 매장 본사 | `HQ` | PC | 소속 매장(`stores.hq_id`), 모니터링 위주 |
| 매장 점주 | `OWNER` | PC/태블릿 | 본인 매장(`stores.owner_id`), 제어/A/S신청 |

**역할별 메뉴 접근**:
```
ADMIN:  대시보드, 장비관리, A/S관리, 고객현황, 시스템관리
DEALER: 대시보드, 장비관리, A/S관리
HQ:     대시보드, 장비관리, A/S관리
OWNER:  대시보드, 장비관리, A/S관리
```

**고객현황/시스템관리는 ADMIN 전용**. DEALER/HQ/OWNER는 접근 불가.

## 장비 계층 구조 (MQTT 기준)

```
Site(매장) → Floor(층) → Gateway(게이트웨이, 층당 1대)
                              → Equipment(집진기, 최대 5대/층)
                                    → Controller(파워팩, 최대 4대/집진기)
```

- Gateway에 IAQ 센서 내장 (PM2.5, CO2, VOC, 온습도 등)
- Controller = 파워팩 (powerpacks 테이블은 v3.0에서 삭제, controller로 통합)

## 핵심 설계 규칙

### 상태 색상 체계 (Green/Yellow/Red)

```typescript
const STATUS_COLORS = {
  GOOD:    { color: '#52c41a', label: '정상',  level: 'green'  },
  WARNING: { color: '#faad14', label: '주의',  level: 'yellow' },
  DANGER:  { color: '#ff4d4f', label: '위험',  level: 'red'    },
} as const;
```

### 상태 전파 규칙 (피드백 p.27)

하위 항목 중 가장 높은 위험도가 상위로 전파:
- Controller(파워팩) 상태 → Equipment(장비) 상태 → Site(매장) 상태
- 하위에 Yellow + Red → 상위는 Red
- 하위에 Green + Yellow → 상위는 Yellow
- 모두 Green → Green

### 대시보드 이슈 항목 (피드백 p.33~34)

**문제 발생 이슈** (주의+위험 모두 표시):
1. 통신 연결 상태 점검 — Yellow: 끊김 1시간 이상, Red: 끊김 하루 이상
2. 유입 온도 이상 — Yellow: 70°C 이상, Red: 100°C 이상
3. 필터 청소 상태 점검 — Yellow: 점검 필요
4. 먼지제거 성능 점검 — Red: 점검 필요

**긴급 알람** (Red만, 이메일 발송): 통신 끊김 하루 이상, 유입 온도 100°C 이상

> ※ 실내공기질 정보는 이슈/알림에 표시하지 않음

### Mock → API 전환 패턴

```typescript
// api/equipment.api.ts
import { useQuery } from '@tanstack/react-query';
import { mockGetEquipments } from './mock/equipment.mock';
// Phase 2: import { axiosGetEquipments } from './real/equipment.real';

export const useEquipments = (storeId: string) => {
  return useQuery({
    queryKey: ['equipments', storeId],
    queryFn: () => mockGetEquipments(storeId),  // Phase 2: axiosGetEquipments
    staleTime: 30 * 1000,
  });
};
```

> 핵심: `queryFn`만 교체하면 컴포넌트 코드 변경 없이 실제 API 연동 완료.

### 역할별 라우팅

```typescript
const roleMenuMap = {
  ADMIN:  ['dashboard', 'equipment', 'as-service', 'customer', 'system'],
  DEALER: ['dashboard', 'equipment', 'as-service'],
  HQ:     ['dashboard', 'equipment', 'as-service'],
  OWNER:  ['dashboard', 'equipment', 'as-service'],
};

// ProtectedRoute로 역할별 접근 제어
<Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
  <Route path="/system/*" element={<SystemPages />} />
</Route>
```

## MQTT 통신 규격 요약

| 항목 | 규격 |
|------|------|
| 프로토콜 | MQTT v3.1.1 (AWS IoT Core) |
| QoS | 1 (모든 토픽) |
| Retain | 0 (비활성) |
| 센서 데이터 주기 | **10초** (sensor + status 동시 발행) |
| 통신 오류 판정 | **30초** 미수신 시 OFFLINE (Red) |
| 타임스탬프 | Unix epoch (초), 서버 UTC 저장, 클라이언트 로컬 변환 |

**토픽 구조**:
```
metabeans/{site_id}/{floor_id}/gateway/{gw_id}/
├── sensor          # 통합 센서 데이터 (10초, GW→Cloud)
├── status          # GW 상태 (10초, GW→Cloud)
├── control         # 제어 명령 (Cloud→GW)
├── control/ack     # 제어 응답 (GW→Cloud)
└── config          # 설정 변경 (추후 정의)
```

**sensor 메시지**: Gateway IAQ + 하위 equipment/controller 전체를 하나로 통합 발행.

**제어 target 코드**:
- 0 = 파워팩 (action: 0=OFF, 1=ON, 2=리셋)
- 1 = 댐퍼(flo-OAC) (action: 1, value: 0-100%)
- 2 = 시로코팬 (action: 0=OFF, 1=LOW, 2=MID, 3=HIGH)

**일괄 제어**: equipment_id="all" + controller_id="all"로 전체 제어 가능.

## REST API 규격 요약

- **Base URL**: `https://api.metabeans.co.kr/api/v1` (Dev: `localhost:3000/api/v1`)
- **인증**: JWT Access Token (15분) + Refresh Token (7일, HttpOnly Cookie)
- **JWT Payload**: `{ userId, loginId, role, storeIds[] }`
- **총 81개 엔드포인트**: Auth(7), Registration(7), Dashboard(6), Equipment(6), Monitoring(5), Control(5), A/S(7), Customer(10), System(21), Gateway(5), Files(2)

**공통 응답 형식**:
```json
{ "success": true, "data": { ... }, "meta": { "page": 1, "pageSize": 20, "totalCount": 152 } }
```

**역할별 자동 필터링**: 서버에서 JWT의 role + storeIds 기반으로 접근 가능 데이터만 반환.

## 주요 DB 테이블 요약 (v3.0)

**사용자 관리**: users, user_business_info, dealer_profiles, hq_profiles, owner_profiles
**권한**: role_permissions, user_permission_overrides (RBAC + 개별 오버라이드, 24개 feature_code)
**매장**: stores, store_floors
**장비**: equipment, equipment_models, gateways, controllers
**센서 데이터**: gateway_sensor_data(IAQ), controller_sensor_data(파워팩) — 일별 파티션, 원본 90일 보관
**A/S**: as_requests(7단계 상태), as_reports, as_attachments, as_report_attachments
**제어**: control_commands (영구 보관, cmd_id로 ACK 매칭)
**알람**: alarm_events (영구 보관)
**기타**: cleaning_thresholds, damper_auto_settings, consumable_schedules, esg_metrics, outdoor_air_quality

## v3.0 주요 변경사항 (피드백 반영)

개발 시 반드시 아래 변경사항을 확인하고 반영할 것:

1. **Controller = 파워팩** (powerpacks 테이블 삭제, 최대 4대/장비)
2. **Equipment 최대 5대/층** (기존 무제한에서 변경)
3. **cell_type**: 드롭다운 → 수동 입력(VARCHAR)
4. **업태/업종 필드 삭제** (user_business_info에서 제거)
5. **매장 규모(store_scale) 삭제** (owner_profiles)
6. **업종에 '커피로스팅' 추가** (stores.business_type)
7. **서비스 가능 지역 확장**: 서울 동부/서부, 경기 동부/서부 추가
8. **센서 주기**: 1분 → **10초**
9. **통신 오류 판정**: heartbeat 기반 → **30초 미수신** (status 토픽)
10. **방화셔터**: 8단계(0~7) 개도율, 자동제어 목표 풍량 추가
11. **운영 시간 설정 삭제** (전원, 방화셔터, 송풍기 모두)
12. **A/S 방문 희망 일시 필드 추가**, 교체 부품 상세(품명/가격/수량) 필수
13. **고객 상태**: 활성/비활성 구분 추가
14. **대시보드**: 시스템 상태 삭제, 이슈 항목 4가지로 재정의
15. **담당 기사 → 담당 대리점**으로 수정
16. **압력 이력 삭제**

## 명령어

```bash
npm run dev       # 개발 서버 (Vite HMR)
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 검사
npm run preview   # 빌드 미리보기
```

## 개발 진행 순서

| 순서 | 작업 | 산출물 |
|:---:|------|--------|
| 0 | 프로젝트 초기 세팅 + 공통 컴포넌트 | AppLayout, Header, Sidebar, StatusTag, StoreTree |
| 1 | 로그인 | LoginPage.tsx + authStore |
| 2 | 회원가입 4종 | Owner/HQ/Admin/Dealer RegisterPage |
| 3 | 대시보드 (ADMIN) | 전체/개별매장/장비별 + 긴급알람 |
| 4 | 대시보드 (DEALER/HQ/OWNER) | 역할별 대시보드 |
| 5 | 장비관리 — 장비정보 | EquipmentInfoPage + 등록/수정 |
| 6 | 장비관리 — 실시간 모니터링 | RealtimeMonitorPage (ECharts) |
| 7 | 장비관리 — 장치 제어 | ControlPower/Damper/Fan Page |
| 8 | 장비관리 — 이력 조회 | HistoryPage |
| 9 | A/S관리 — 알림/접수 | ASAlertListPage, ASRequestPage |
| 10 | A/S관리 — 처리/보고서 | ASStatusPage, ASReportPage |
| 11 | 고객 현황 | CustomerListPage + 지도 + 편집 |
| 12 | 시스템관리 4탭 | 권한/승인/사용자/기준수치 |

## 중요 주의사항

- PC/태블릿 우선 설계 (모바일 앱은 별도 프로젝트)
- 한국어 UI, 한국 비즈니스 용어 사용 (업종, 사업자등록번호, 대리점 등)
- 타입 정의는 데이터구조 정의서의 테이블/컬럼명을 그대로 반영 (camelCase 변환)
- API 설계서의 엔드포인트를 Mock 서비스 함수명으로 1:1 매핑
- Mock 데이터는 MQTT Payload 규격의 필드명/타입/범위에 정확히 맞춰 생성
- 피드백 PDF의 수정사항을 UI에 빠짐없이 반영
- 새 화면 개발 시 반드시 `docs/` 폴더의 관련 문서를 먼저 읽고 시작
- 컴포넌트 크기가 300줄 이상이면 하위 컴포넌트로 분리
- 기존에 만든 컴포넌트/타입/유틸이 있으면 반드시 재사용 (중복 생성 금지)
