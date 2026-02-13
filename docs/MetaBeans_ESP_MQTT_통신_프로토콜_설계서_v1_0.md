# MetaBeans ESP — MQTT 통신 프로토콜 설계서 v1.0

> **프롬프트 D-1**: MQTT Payload 처리 및 백엔드 연동  
> **작성일**: 2026-02-13  
> **근거 문서**: MQTT_Payload_규격_260212.pdf, ESP_관리툴_최종피드백_260212.pdf, MetaBeans_ESP_데이터구조_정의서_v3_0.md, MetaBeans_ESP_프로젝트_아키텍처_기술스택_정의서.md

---

## 목차

1. [개요 및 아키텍처](#1-개요-및-아키텍처)
2. [MQTT 기본 설정](#2-mqtt-기본-설정)
3. [토픽 구조 설계](#3-토픽-구조-설계)
4. [Payload 구조 및 파싱 로직](#4-payload-구조-및-파싱-로직)
5. [AWS IoT Core → 백엔드 데이터 파이프라인](#5-aws-iot-core--백엔드-데이터-파이프라인)
6. [센서 데이터 → DB 저장 로직](#6-센서-데이터--db-저장-로직)
7. [통신 오류 감지 로직 (30초 타임아웃)](#7-통신-오류-감지-로직-30초-타임아웃)
8. [제어 명령 발행 및 ACK 처리](#8-제어-명령-발행-및-ack-처리)
9. [알람 이벤트 생성 로직](#9-알람-이벤트-생성-로직)
10. [데이터 보존 및 집계 정책](#10-데이터-보존-및-집계-정책)
11. [구현 파일 구조 및 모듈 명세](#11-구현-파일-구조-및-모듈-명세)
12. [테스트 전략](#12-테스트-전략)

---

## 1. 개요 및 아키텍처

### 1.1 시스템 구성

```
┌─────────────────────────────────────────────────────────────┐
│                      DEVICE LAYER                           │
│                                                             │
│   파워팩(ESP32)  ──WiFi──▶  게이트웨이(층별 1대)            │
│   (컨트롤러)                 (IAQ 센서 내장)                │
│                                                             │
│   장비 계층:                                                │
│   Site(매장) → Floor(층) → Gateway → Equipment → Controller│
└──────────────────────────────┬──────────────────────────────┘
                               │ MQTT v3.1.1 (WiFi → Internet)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   AWS IoT Core (MQTT Broker)                │
│                                                             │
│   - QoS 1 (모든 토픽)                                      │
│   - Retain 0 (비활성)                                      │
│   - 10초 주기 센서+상태 발행                                │
│   - IoT Rule Engine → Lambda/직접 연동                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER                            │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │           MQTT 브릿지 서비스 (mqtt.service.ts)       │   │
│   │                                                     │   │
│   │   mqtt.js 클라이언트                                │   │
│   │   ├── sensor 토픽 구독 → 파싱 → DB 저장             │   │
│   │   ├── status 토픽 구독 → 게이트웨이 상태 갱신       │   │
│   │   ├── control/ack 구독 → 제어 결과 업데이트          │   │
│   │   └── 30초 타임아웃 감지 → 통신 오류 처리            │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │           REST API (Express)                         │   │
│   │                                                     │   │
│   │   POST /control/command → MQTT publish              │   │
│   │   GET  /monitoring/*/latest → latest sensor cache   │   │
│   │   GET  /monitoring/*/history → DB 조회              │   │
│   └─────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│   MySQL 8.0 (Amazon RDS)                                    │
│   - gateway_sensor_data (IAQ, 월별 파티션)                  │
│   - controller_sensor_data (파워팩, 일별 파티션)            │
│   - alarm_events (영구 보관)                                │
│   - control_commands (영구 보관)                            │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 데이터 흐름

```
[Upstream — 센서 → 서버]
파워팩(ESP32) ─WiFi→ 게이트웨이 ─WiFi→ AWS IoT Core ─→ MQTT 브릿지 ─→ MySQL
                                                                      ─→ 인메모리 캐시 (latest)
                                                                      ─→ 알람 판정 로직

[Downstream — 제어 명령]
프론트엔드 ─REST→ Express API ─→ MQTT 브릿지 ─→ AWS IoT Core ─→ 게이트웨이 ─→ 파워팩
                               ←── control/ack ←──────────────────────────────────┘
```

### 1.3 장비 계층 및 수량 제한

```
Site (매장)
└── Floor (층)                    — 매장당 N개 층
    └── Gateway (게이트웨이)      — 층당 1대 (IAQ 센서 내장)
        └── Equipment (집진기)    — 게이트웨이당 최대 5대
            └── Controller (파워팩) — 집진기당 최대 4대
```

| 계층 | 수량 제한 | ID 형식 | 예시 |
|------|---------|---------|------|
| Site | 무제한 (~200개 매장) | string | `"site-001"` |
| Floor | 매장당 N개 | string | `"1F"`, `"B1"` |
| Gateway | 층당 1대 | string | `"gw-001"` |
| Equipment | 게이트웨이당 최대 5대 | string | `"esp-001"` |
| Controller | 집진기당 최대 4대 | string | `"ctrl-001"` |

> **ID 할당 방식**: 모든 ID는 내부 고유번호를 사용하며, 설치 시 각 장비에 펌웨어 설정. MQTT로 수신되는 ID를 그대로 DB에서 사용 (별도 매칭 불필요).

---

## 2. MQTT 기본 설정

### 2.1 프로토콜 설정

| 항목 | 설정값 | 비고 |
|------|-------|------|
| **프로토콜** | MQTT v3.1.1 | AWS IoT Core 지원 버전 |
| **QoS** | 1 (모든 토픽) | AWS IoT Core는 QoS 2 미지원 |
| **Retain** | 0 (비활성) | 10초 주기 발행으로 Retain 불필요 |
| **센서 발행 주기** | 10초 | sensor + status 동시 발행 |
| **통신 오류 판정** | 30초 미수신 | 피드백 p.38 기준 |
| **타임스탬프** | Unix epoch (초 단위) | 서버 UTC 저장, 클라이언트 로컬 변환 |
| **페이로드 인코딩** | UTF-8 JSON | |
| **최대 페이로드** | ~6KB (실측) | MQTT 128KB 한도 대비 충분 |

### 2.2 페이로드 크기 예상

| 구성 | 예상 크기 |
|------|---------|
| Gateway IAQ만 | ~300 bytes |
| Equipment 1대 × Controller 2대 | ~600 bytes |
| Equipment 3대 × Controller 4대 | ~3.5 KB |
| **최대 (Equipment 5대 × Controller 4대)** | **~6 KB** |

### 2.3 AWS IoT Core 연결 설정

```typescript
// src/config/mqtt.ts

export const mqttConfig = {
  // AWS IoT Core 엔드포인트
  endpoint: process.env.AWS_IOT_ENDPOINT,  // e.g., "a1b2c3d4e5f6g7-ats.iot.ap-northeast-2.amazonaws.com"
  region: 'ap-northeast-2',                // 서울 리전
  
  // 인증: X.509 클라이언트 인증서 (AWS IoT Thing)
  certPath: process.env.AWS_IOT_CERT_PATH,
  keyPath: process.env.AWS_IOT_KEY_PATH,
  caPath: process.env.AWS_IOT_CA_PATH,
  
  // 클라이언트 설정
  clientId: `esp-backend-${process.env.NODE_ENV}-${process.env.INSTANCE_ID || '001'}`,
  keepalive: 60,            // 초
  reconnectPeriod: 5000,    // 5초 후 재연결
  connectTimeout: 30000,    // 30초 연결 타임아웃
  
  // QoS 설정
  defaultQoS: 1 as const,
  
  // 구독 토픽 패턴
  subscribeTopics: [
    'metabeans/+/+/gateway/+/sensor',       // 모든 매장 센서 데이터
    'metabeans/+/+/gateway/+/status',       // 모든 게이트웨이 상태
    'metabeans/+/+/gateway/+/control/ack',  // 제어 명령 응답
  ],
};
```

### 2.4 센서 값 스케일 규칙

```
모든 MQTT 페이로드 값은 변환 없이 그대로 사용.
펌웨어가 내부 스케일을 실제 값으로 변환한 뒤 전송.
서버/클라이언트에서 별도 스케일 연산 불필요.
```

---

## 3. 토픽 구조 설계

### 3.1 토픽 트리

```
metabeans/{site_id}/{floor_id}/gateway/{gw_id}/
├── sensor          # 통합 센서 데이터 발행 (10초 주기)
│                   # 방향: Gateway → Cloud
│                   # IAQ + 모든 equipment/controller 데이터 통합
│
├── status          # 게이트웨이 상태 발행 (10초 주기, sensor와 동시)
│                   # 방향: Gateway → Cloud
│                   # status_flags(7비트) + controller_count
│
├── control         # 제어 명령 수신
│                   # 방향: Cloud → Gateway
│                   # 파워팩 전원, 댐퍼 개도율, 팬 속도
│
├── control/ack     # 제어 명령 응답 발행
│                   # 방향: Gateway → Cloud
│                   # cmd_id 매칭으로 성공/실패 확인
│
└── config          # 설정 변경 수신 (추후 정의)
                    # 방향: Cloud → Gateway
```

### 3.2 토픽 예시

```
# 센서 데이터 발행
metabeans/site-001/1F/gateway/gw-001/sensor

# 제어 명령 수신
metabeans/site-001/1F/gateway/gw-001/control

# 제어 응답 발행
metabeans/site-001/1F/gateway/gw-001/control/ack
```

### 3.3 구독 패턴

| 패턴 | 설명 | 사용처 |
|------|------|--------|
| `metabeans/+/+/gateway/+/sensor` | 모든 매장 센서 데이터 | 백엔드 브릿지 서비스 |
| `metabeans/+/+/gateway/+/status` | 모든 게이트웨이 상태 | 백엔드 브릿지 서비스 |
| `metabeans/+/+/gateway/+/control/ack` | 모든 제어 응답 | 백엔드 브릿지 서비스 |
| `metabeans/site-001/+/gateway/+/#` | 특정 매장 전체 | 디버깅/모니터링 |
| `metabeans/site-001/1F/gateway/+/sensor` | 특정 층 센서 | 디버깅/모니터링 |

### 3.4 토픽에서 메타데이터 추출

```typescript
// src/utils/topicParser.ts

interface TopicMeta {
  siteId: string;
  floorId: string;
  gatewayId: string;
  messageType: 'sensor' | 'status' | 'control_ack';
}

/**
 * MQTT 토픽 문자열에서 메타데이터 추출
 * 
 * 토픽 형식: metabeans/{site_id}/{floor_id}/gateway/{gw_id}/{type}
 * 예: "metabeans/site-001/1F/gateway/gw-001/sensor"
 */
export function parseTopic(topic: string): TopicMeta | null {
  const parts = topic.split('/');
  
  // 최소 6 세그먼트: metabeans / site_id / floor_id / gateway / gw_id / type
  if (parts.length < 6 || parts[0] !== 'metabeans' || parts[3] !== 'gateway') {
    return null;
  }
  
  const typeSegment = parts.slice(5).join('/');  // "control/ack" 대응
  let messageType: TopicMeta['messageType'];
  
  switch (typeSegment) {
    case 'sensor':      messageType = 'sensor'; break;
    case 'status':      messageType = 'status'; break;
    case 'control/ack': messageType = 'control_ack'; break;
    default: return null;
  }
  
  return {
    siteId: parts[1],
    floorId: parts[2],
    gatewayId: parts[4],
    messageType,
  };
}
```

---

## 4. Payload 구조 및 파싱 로직

### 4.1 sensor 메시지 — 통합 센서 데이터

**토픽**: `metabeans/{site_id}/{floor_id}/gateway/{gw_id}/sensor`  
**주기**: 10초  
**방향**: Gateway → Cloud

게이트웨이 IAQ 데이터 + 모든 하위 equipment/controller 데이터를 **하나의 메시지로 통합** 발행.

```json
{
  "gateway_id": "gw-001",
  "timestamp": 1234567890,
  "iaq": {
    "pm1_0": 12.5,
    "pm2_5": 25.0,
    "pm4_0": 30.0,
    "pm10": 35.0,
    "temperature": 24.5,
    "humidity": 65.0,
    "voc_index": 100,
    "nox_index": 50,
    "co2": 450,
    "o3": 25,
    "co": 1.2,
    "hcho": 30
  },
  "equipments": [
    {
      "equipment_id": "esp-001",
      "controllers": [
        {
          "controller_id": "ctrl-001",
          "timestamp": 1234567885,
          "pm2_5": 25.0,
          "pm10": 35.0,
          "diff_pressure": 12.0,
          "oil_level": 50.0,
          "pp_temp": 45,
          "pp_spark": 0,
          "pp_power": 1,
          "pp_alarm": 0,
          "fan_speed": 2,
          "flow": 850.0,
          "damper": 75.0,
          "inlet_temp": 22.5,
          "velocity": 8.3,
          "duct_dp": 245.0,
          "status_flags": 63
        }
      ]
    }
  ]
}
```

#### 4.1.1 iaq 필드 (게이트웨이 IAQ)

| 필드 | 타입 | 단위 | 설명 |
|------|------|------|------|
| pm1_0 | float | µg/m³ | PM1.0 농도 |
| pm2_5 | float | µg/m³ | PM2.5 농도 |
| pm4_0 | float | µg/m³ | PM4.0 농도 |
| pm10 | float | µg/m³ | PM10 농도 |
| temperature | float | °C | 온도 |
| humidity | float | % | 습도 |
| voc_index | int \| null | - | VOC 지수 (1-500), 워밍업 중 null |
| nox_index | int \| null | - | NOx 지수 (1-500), 워밍업 중 null |
| co2 | int | ppm | CO2 농도 |
| o3 | int | ppb | 오존 농도 |
| co | float | ppm | 일산화탄소 농도 |
| hcho | int | ppb | 포름알데히드 농도 |

#### 4.1.2 controllers[] 필드 (파워팩 센서)

| 필드 | 타입 | 단위 | 설명 |
|------|------|------|------|
| controller_id | string | - | 컨트롤러 ID |
| timestamp | int | epoch초 | 게이트웨이가 해당 컨트롤러 데이터를 마지막으로 수신한 시간 |
| pm2_5 | float | µg/m³ | 배출부 PM2.5 농도 |
| pm10 | float | µg/m³ | 배출부 PM10 농도 |
| diff_pressure | float | Pa | ESP 집진부 차압 |
| oil_level | float | % | 오일 수위 (0-100) |
| pp_temp | int | °C | 파워팩 온도 (**정수**, x10 스케일 아님) |
| pp_spark | int | - | 스파크 수치 (0-99) |
| pp_power | int | - | 전원 상태 (0=OFF, 1=ON) |
| pp_alarm | int | - | 파워팩 알람 (0=정상, 1=알람) |
| fan_speed | int | - | 팬 속도 (0=OFF, 1=LOW, 2=MID, 3=HIGH) |
| flow | float | CMH | 풍량 (flo-OAC 현재유량) |
| damper | float | % | 댐퍼 개도율 (flo-OAC Damper_FB 피드백, 0-100) |
| inlet_temp | float | °C | 유입 온도 (flo-OAC T_act, -20~50) |
| velocity | float | m/s | 현재 풍속 (flo-OAC V_act, 0~20.0) |
| duct_dp | float | Pa | 덕트 차압 (flo-OAC DP_Pv, -49~980) |
| status_flags | int | - | 상태 플래그 (비트마스크, 6비트) |

#### 4.1.3 Controller status_flags 비트 정의 (6비트)

| 비트 | 의미 | 0 = 이상 | 1 = 정상 |
|------|------|---------|---------|
| 0 | 파워팩 RS-485 통신 | RS-485 통신 실패 | RS-485 통신 정상 |
| 1 | SPS30 (PM2.5) 센서 | PM2.5 센서 이상 | PM2.5 센서 정상 |
| 2 | SDP810 (차압) 센서 | 차압 센서 이상 | 차압 센서 정상 |
| 3 | 수위 센서 | 수위 센서 이상 | 수위 센서 정상 |
| 4 | flo-OAC 댐퍼 컨트롤러 | 댐퍼 컨트롤러 이상 | 댐퍼 컨트롤러 정상 |
| 5 | LS M100 인버터 | 인버터 이상 | 인버터 정상 |

> **63 = 0b111111 = 모든 센서 정상**

```typescript
// status_flags 파싱 유틸리티
export function parseControllerStatusFlags(flags: number) {
  return {
    rs485Ok:       Boolean(flags & 0b000001),  // bit 0
    sps30Ok:       Boolean(flags & 0b000010),  // bit 1
    sdp810Ok:      Boolean(flags & 0b000100),  // bit 2
    waterLevelOk:  Boolean(flags & 0b001000),  // bit 3
    floOacOk:      Boolean(flags & 0b010000),  // bit 4
    inverterOk:    Boolean(flags & 0b100000),  // bit 5
    allOk:         flags === 63,
  };
}
```

### 4.2 status 메시지 — 게이트웨이 상태

**토픽**: `metabeans/{site_id}/{floor_id}/gateway/{gw_id}/status`  
**주기**: 10초 (sensor와 동시)  
**방향**: Gateway → Cloud

```json
{
  "gateway_id": "gw-001",
  "status_flags": 63,
  "controller_count": 3,
  "timestamp": 1234567890
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| gateway_id | string | 게이트웨이 ID |
| status_flags | int | 상태 플래그 (7비트 비트마스크) |
| controller_count | int | 현재 연결된 컨트롤러 수 |
| timestamp | int | 발행 시간 (Unix epoch, 초) |

#### Gateway status_flags 비트 정의 (7비트)

| 비트 | 의미 | 0 = 이상 | 1 = 정상 |
|------|------|---------|---------|
| 0 | SEN55 센서 | PM/온습도/VOC/NOx 센서 이상 | 정상 |
| 1 | SCD40 센서 | CO2 센서 이상 | 정상 |
| 2 | O3 센서 (SEN0321) | 오존 센서 이상 | 정상 |
| 3 | CO 센서 (SEN0466) | CO 센서 이상 | 정상 |
| 4 | HCHO 센서 (SFA30) | HCHO 센서 이상 | 정상 |
| 5 | 컨트롤러 연결 | 연결된 컨트롤러 없음 | 1개 이상 연결됨 |
| 6 | 페어링 모드 | 일반 모드 | 페어링 모드 진입 |

> **63 = 0b0111111 = 모든 센서 정상 + 컨트롤러 연결됨 + 일반 모드**

```typescript
export function parseGatewayStatusFlags(flags: number) {
  return {
    sen55Ok:            Boolean(flags & 0b0000001),  // bit 0
    scd40Ok:            Boolean(flags & 0b0000010),  // bit 1
    o3Ok:               Boolean(flags & 0b0000100),  // bit 2
    coOk:               Boolean(flags & 0b0001000),  // bit 3
    hchoOk:             Boolean(flags & 0b0010000),  // bit 4
    controllerConnected: Boolean(flags & 0b0100000),  // bit 5
    pairingMode:         Boolean(flags & 0b1000000),  // bit 6
  };
}
```

### 4.3 control 메시지 — 제어 명령

**토픽**: `metabeans/{site_id}/{floor_id}/gateway/{gw_id}/control`  
**방향**: Cloud → Gateway

```json
{
  "cmd_id": "550e8400-e29b-41d4-a716-446655440000",
  "equipment_id": "esp-001",
  "controller_id": "ctrl-001",
  "target": 0,
  "action": 1,
  "value": 0
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| cmd_id | string | ✅ | UUID, ACK 매칭용 |
| equipment_id | string | ✅ | 대상 집진기 (`"all"` = 전체) |
| controller_id | string | ✅ | 대상 컨트롤러 (`"all"` = 전체) |
| target | int | ✅ | 제어 대상 (0=파워팩, 1=댐퍼, 2=시로코팬) |
| action | int | ✅ | 액션 코드 |
| value | int | | 설정값 (댐퍼 개도율 등) |

### 4.4 control/ack 메시지 — 제어 응답

**토픽**: `metabeans/{site_id}/{floor_id}/gateway/{gw_id}/control/ack`  
**방향**: Gateway → Cloud

```json
{
  "cmd_id": "550e8400-e29b-41d4-a716-446655440000",
  "result": "success",
  "reason": ""
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| cmd_id | string | 명령 ID (요청 cmd_id와 매칭) |
| result | string | `"success"` 또는 `"fail"` |
| reason | string | 실패 시 사유 (성공 시 빈 문자열) |

### 4.5 Zod 검증 스키마

```typescript
// src/validators/mqtt.validator.ts
import { z } from 'zod';

// ── IAQ 필드 ──
const IaqSchema = z.object({
  pm1_0: z.number(),
  pm2_5: z.number(),
  pm4_0: z.number(),
  pm10: z.number(),
  temperature: z.number(),
  humidity: z.number(),
  voc_index: z.number().int().min(1).max(500).nullable(),
  nox_index: z.number().int().min(1).max(500).nullable(),
  co2: z.number().int(),
  o3: z.number().int(),
  co: z.number(),
  hcho: z.number().int(),
});

// ── 컨트롤러 센서 데이터 ──
const ControllerDataSchema = z.object({
  controller_id: z.string(),
  timestamp: z.number().int(),
  pm2_5: z.number(),
  pm10: z.number(),
  diff_pressure: z.number(),
  oil_level: z.number().min(0).max(100),
  pp_temp: z.number().int(),
  pp_spark: z.number().int().min(0).max(99),
  pp_power: z.literal(0).or(z.literal(1)),
  pp_alarm: z.literal(0).or(z.literal(1)),
  fan_speed: z.number().int().min(0).max(3),
  flow: z.number(),
  damper: z.number().min(0).max(100),
  inlet_temp: z.number(),
  velocity: z.number(),
  duct_dp: z.number(),
  status_flags: z.number().int().min(0).max(63),
});

// ── Equipment 컨테이너 ──
const EquipmentDataSchema = z.object({
  equipment_id: z.string(),
  controllers: z.array(ControllerDataSchema).min(1).max(4),
});

// ── 통합 sensor 메시지 ──
export const SensorMessageSchema = z.object({
  gateway_id: z.string(),
  timestamp: z.number().int(),
  iaq: IaqSchema,
  equipments: z.array(EquipmentDataSchema).min(0).max(5),
});

// ── status 메시지 ──
export const StatusMessageSchema = z.object({
  gateway_id: z.string(),
  status_flags: z.number().int().min(0).max(127),  // 7비트
  controller_count: z.number().int().min(0),
  timestamp: z.number().int(),
});

// ── control/ack 메시지 ──
export const ControlAckSchema = z.object({
  cmd_id: z.string().uuid(),
  result: z.enum(['success', 'fail']),
  reason: z.string(),
});

// 타입 추출
export type SensorMessage = z.infer<typeof SensorMessageSchema>;
export type StatusMessage = z.infer<typeof StatusMessageSchema>;
export type ControlAck = z.infer<typeof ControlAckSchema>;
```

---

## 5. AWS IoT Core → 백엔드 데이터 파이프라인

### 5.1 연결 방식: 직접 MQTT 클라이언트

```
AWS IoT Core ←── mqtt.js (Node.js) ──→ Express 백엔드 (동일 프로세스)
```

> **선정 사유**: 200개 매장 규모에서 Lambda 비용 대비 직접 연결이 경제적. mqtt.js는 AWS IoT Core 연동 검증된 라이브러리.

### 5.2 MQTT 브릿지 서비스 구현

```typescript
// src/services/mqtt.service.ts

import * as mqtt from 'mqtt';
import { mqttConfig } from '../config/mqtt';
import { parseTopic } from '../utils/topicParser';
import { SensorMessageSchema, StatusMessageSchema, ControlAckSchema } from '../validators/mqtt.validator';
import { sensorService } from './sensor.service';
import { connectionMonitor } from './connection-monitor.service';
import { controlService } from './control.service';
import { logger } from '../utils/logger';

class MqttBridgeService {
  private client: mqtt.MqttClient | null = null;

  /**
   * MQTT 브릿지 시작
   * - AWS IoT Core 연결
   * - 토픽 구독
   * - 메시지 핸들러 등록
   */
  async start(): Promise<void> {
    this.client = mqtt.connect(mqttConfig.endpoint, {
      cert: fs.readFileSync(mqttConfig.certPath),
      key: fs.readFileSync(mqttConfig.keyPath),
      ca: fs.readFileSync(mqttConfig.caPath),
      clientId: mqttConfig.clientId,
      keepalive: mqttConfig.keepalive,
      reconnectPeriod: mqttConfig.reconnectPeriod,
      connectTimeout: mqttConfig.connectTimeout,
      protocol: 'mqtts',
    });

    this.client.on('connect', () => {
      logger.info('[MQTT] Connected to AWS IoT Core');
      
      // 토픽 구독
      for (const topic of mqttConfig.subscribeTopics) {
        this.client!.subscribe(topic, { qos: mqttConfig.defaultQoS }, (err) => {
          if (err) logger.error(`[MQTT] Subscribe failed: ${topic}`, err);
          else logger.info(`[MQTT] Subscribed: ${topic}`);
        });
      }
    });

    this.client.on('message', this.handleMessage.bind(this));
    this.client.on('error', (err) => logger.error('[MQTT] Error:', err));
    this.client.on('reconnect', () => logger.warn('[MQTT] Reconnecting...'));
    this.client.on('offline', () => logger.warn('[MQTT] Client offline'));
  }

  /**
   * 메시지 라우터
   * 토픽에서 메시지 타입을 판별하여 적절한 핸들러로 분배
   */
  private async handleMessage(topic: string, payload: Buffer): Promise<void> {
    const meta = parseTopic(topic);
    if (!meta) {
      logger.warn(`[MQTT] Unknown topic: ${topic}`);
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(payload.toString('utf-8'));
    } catch (e) {
      logger.error(`[MQTT] Invalid JSON on ${topic}`);
      return;
    }

    try {
      switch (meta.messageType) {
        case 'sensor':
          await this.handleSensorMessage(meta, parsed);
          break;
        case 'status':
          await this.handleStatusMessage(meta, parsed);
          break;
        case 'control_ack':
          await this.handleControlAck(parsed);
          break;
      }
    } catch (err) {
      logger.error(`[MQTT] Handler error on ${topic}:`, err);
    }
  }

  /**
   * sensor 메시지 처리
   * 1. Zod 검증
   * 2. 토픽 메타 vs payload gateway_id 일치 확인
   * 3. IAQ 데이터 → gateway_sensor_data 저장
   * 4. 컨트롤러 데이터 → controller_sensor_data 저장 (루프)
   * 5. 인메모리 latest 캐시 갱신
   * 6. 알람 판정 로직 실행
   * 7. 통신 타임아웃 타이머 리셋
   */
  private async handleSensorMessage(meta: TopicMeta, raw: unknown): Promise<void> {
    const result = SensorMessageSchema.safeParse(raw);
    if (!result.success) {
      logger.warn(`[MQTT] Invalid sensor payload from ${meta.gatewayId}:`, result.error.issues);
      return;
    }
    const msg = result.data;

    // 토픽 ↔ payload 일관성 검증
    if (msg.gateway_id !== meta.gatewayId) {
      logger.warn(`[MQTT] gateway_id mismatch: topic=${meta.gatewayId}, payload=${msg.gateway_id}`);
    }

    // DB 저장 + 캐시 갱신 + 알람 판정
    await sensorService.processSensorMessage(meta, msg);

    // 통신 타임아웃 타이머 리셋
    connectionMonitor.resetTimer(meta.gatewayId);
  }

  /**
   * status 메시지 처리
   * 1. Zod 검증
   * 2. gateways.last_seen_at 갱신
   * 3. gateways.status_flags, controller_count 업데이트
   * 4. 통신 타임아웃 타이머 리셋
   */
  private async handleStatusMessage(meta: TopicMeta, raw: unknown): Promise<void> {
    const result = StatusMessageSchema.safeParse(raw);
    if (!result.success) {
      logger.warn(`[MQTT] Invalid status payload from ${meta.gatewayId}`);
      return;
    }
    const msg = result.data;

    await sensorService.processStatusMessage(meta, msg);
    connectionMonitor.resetTimer(meta.gatewayId);
  }

  /**
   * control/ack 메시지 처리
   * 1. Zod 검증
   * 2. control_commands 테이블에서 cmd_id로 조회
   * 3. result → SUCCESS/FAIL 업데이트
   * 4. responded_at 기록
   */
  private async handleControlAck(raw: unknown): Promise<void> {
    const result = ControlAckSchema.safeParse(raw);
    if (!result.success) {
      logger.warn('[MQTT] Invalid control/ack payload');
      return;
    }
    
    await controlService.processAck(result.data);
  }

  /**
   * 제어 명령 MQTT 발행
   * REST API에서 호출
   */
  async publishControl(
    siteId: string,
    floorId: string,
    gatewayId: string,
    payload: object,
  ): Promise<void> {
    const topic = `metabeans/${siteId}/${floorId}/gateway/${gatewayId}/control`;
    
    return new Promise((resolve, reject) => {
      this.client!.publish(
        topic,
        JSON.stringify(payload),
        { qos: mqttConfig.defaultQoS },
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });
  }

  async stop(): Promise<void> {
    if (this.client) {
      this.client.end(true);
      logger.info('[MQTT] Disconnected');
    }
  }
}

export const mqttBridge = new MqttBridgeService();
```

### 5.3 메시지 처리 흐름도

```
sensor 메시지 수신
    │
    ├── 1. JSON 파싱
    ├── 2. Zod 스키마 검증
    ├── 3. 토픽 ↔ payload gateway_id 일치 확인
    │
    ├── 4. [병렬] gateway_sensor_data INSERT (IAQ)
    ├── 5. [병렬] controller_sensor_data INSERT (each controller)
    ├── 6. [병렬] 인메모리 latest 캐시 갱신
    ├── 7. [병렬] 알람 판정 (pp_alarm, pp_temp, inlet_temp, diff_pressure)
    │
    └── 8. 통신 타임아웃 타이머 리셋 (해당 gateway)

status 메시지 수신
    │
    ├── 1. JSON 파싱 + Zod 검증
    ├── 2. gateways 테이블 UPDATE (status_flags, controller_count, last_seen_at)
    └── 3. 통신 타임아웃 타이머 리셋

control/ack 메시지 수신
    │
    ├── 1. JSON 파싱 + Zod 검증
    ├── 2. control_commands에서 cmd_id로 조회
    ├── 3. result → PENDING → SUCCESS/FAIL 업데이트
    └── 4. responded_at = NOW() 기록
```

---

## 6. 센서 데이터 → DB 저장 로직

### 6.1 저장 대상 테이블

| 메시지 부분 | 저장 테이블 | 파티션 | 인덱스 |
|-----------|-----------|--------|--------|
| iaq (게이트웨이 IAQ) | `gateway_sensor_data` | 월별 (received_at) | `(gateway_id, timestamp)` |
| controllers[] (파워팩) | `controller_sensor_data` | **일별** (received_at) | `(controller_id, timestamp)` |

> **파티션 전략**: controller_sensor_data는 10초 주기 × 최대 200매장 × 5장비 × 4컨트롤러 = **초당 최대 400건**으로 일별 파티션 적용. gateway_sensor_data는 매장당 1건/10초로 월별 파티션 충분.

### 6.2 센서 데이터 저장 서비스

```typescript
// src/services/sensor.service.ts

import { PrismaClient } from '@prisma/client';
import { SensorMessage, StatusMessage } from '../validators/mqtt.validator';
import { alertService } from './alert.service';
import { latestCache } from './latest-cache.service';

const prisma = new PrismaClient();

class SensorService {
  
  /**
   * sensor 메시지 처리 (핵심 로직)
   * 
   * 10초 주기로 호출되므로 성능이 중요.
   * Promise.all로 병렬 처리하여 처리 시간 최소화.
   */
  async processSensorMessage(meta: TopicMeta, msg: SensorMessage): Promise<void> {
    const now = new Date();
    
    // DB에서 gateway의 내부 ID 조회 (캐시 활용)
    const gatewayDbId = await this.resolveGatewayDbId(msg.gateway_id);
    if (!gatewayDbId) {
      logger.warn(`[Sensor] Unknown gateway: ${msg.gateway_id}`);
      return;
    }

    const promises: Promise<void>[] = [];

    // ── 1. IAQ 데이터 저장 ──
    promises.push(this.saveGatewaySensorData(gatewayDbId, msg, now));

    // ── 2. 컨트롤러 데이터 저장 (각 equipment → 각 controller) ──
    for (const equip of msg.equipments) {
      for (const ctrl of equip.controllers) {
        promises.push(
          this.saveControllerSensorData(gatewayDbId, equip.equipment_id, ctrl, now)
        );
      }
    }

    // ── 3. 인메모리 latest 캐시 갱신 ──
    promises.push(latestCache.update(msg.gateway_id, msg));

    // ── 4. 알람 판정 ──
    promises.push(alertService.evaluateSensorAlarms(meta, msg));

    // ── 5. gateways.last_seen_at 갱신 ──
    promises.push(this.updateGatewayLastSeen(gatewayDbId, now));

    await Promise.all(promises);
  }

  /**
   * gateway_sensor_data INSERT
   */
  private async saveGatewaySensorData(
    gatewayDbId: number,
    msg: SensorMessage,
    receivedAt: Date,
  ): Promise<void> {
    await prisma.gateway_sensor_data.create({
      data: {
        gateway_id: gatewayDbId,
        timestamp: msg.timestamp,
        received_at: receivedAt,
        pm1_0: msg.iaq.pm1_0,
        pm2_5: msg.iaq.pm2_5,
        pm4_0: msg.iaq.pm4_0,
        pm10: msg.iaq.pm10,
        temperature: msg.iaq.temperature,
        humidity: msg.iaq.humidity,
        voc_index: msg.iaq.voc_index,
        nox_index: msg.iaq.nox_index,
        co2: msg.iaq.co2,
        o3: msg.iaq.o3,
        co: msg.iaq.co,
        hcho: msg.iaq.hcho,
      },
    });
  }

  /**
   * controller_sensor_data INSERT
   * 
   * MQTT equipment_id → DB equipment.mqtt_equipment_id 매칭
   * MQTT controller_id → DB controllers.mqtt_controller_id 매칭
   */
  private async saveControllerSensorData(
    gatewayDbId: number,
    mqttEquipmentId: string,
    ctrl: ControllerData,
    receivedAt: Date,
  ): Promise<void> {
    // ID 매핑 캐시 활용
    const ids = await this.resolveControllerIds(mqttEquipmentId, ctrl.controller_id);
    if (!ids) return;

    await prisma.controller_sensor_data.create({
      data: {
        controller_id: ids.controllerDbId,
        equipment_id: ids.equipmentDbId,
        gateway_id: gatewayDbId,
        timestamp: ctrl.timestamp,
        received_at: receivedAt,
        pm2_5: ctrl.pm2_5,
        pm10: ctrl.pm10,
        diff_pressure: ctrl.diff_pressure,
        oil_level: ctrl.oil_level,
        pp_temp: ctrl.pp_temp,
        pp_spark: ctrl.pp_spark,
        pp_power: ctrl.pp_power,
        pp_alarm: ctrl.pp_alarm,
        fan_speed: ctrl.fan_speed,
        flow: ctrl.flow,
        damper: ctrl.damper,
        inlet_temp: ctrl.inlet_temp,
        velocity: ctrl.velocity,
        duct_dp: ctrl.duct_dp,
        status_flags: ctrl.status_flags,
      },
    });
  }

  // ── ID 매핑 캐시 ──
  // MQTT ID (string) ↔ DB ID (BIGINT) 변환
  // 서버 시작 시 전체 로드, 장비 등록/삭제 시 갱신
  private idCache = new Map<string, number>();  // mqttId → dbId

  async resolveGatewayDbId(mqttGatewayId: string): Promise<number | null> {
    const cacheKey = `gw:${mqttGatewayId}`;
    if (this.idCache.has(cacheKey)) return this.idCache.get(cacheKey)!;

    const gw = await prisma.gateways.findFirst({
      where: { mqtt_gateway_id: mqttGatewayId },
      select: { gateway_id: true },
    });
    if (gw) this.idCache.set(cacheKey, gw.gateway_id);
    return gw?.gateway_id ?? null;
  }

  async resolveControllerIds(mqttEquipmentId: string, mqttControllerId: string) {
    const cacheKey = `ctrl:${mqttEquipmentId}:${mqttControllerId}`;
    if (this.idCache.has(cacheKey)) {
      // 캐시에서 복합 ID 복원
      return JSON.parse(this.idCache.get(cacheKey) as any);
    }

    const ctrl = await prisma.controllers.findFirst({
      where: {
        mqtt_controller_id: mqttControllerId,
        equipment: { mqtt_equipment_id: mqttEquipmentId },
      },
      select: {
        controller_id: true,
        equipment_id: true,
      },
    });
    
    if (ctrl) {
      const result = { controllerDbId: ctrl.controller_id, equipmentDbId: ctrl.equipment_id };
      this.idCache.set(cacheKey, JSON.stringify(result) as any);
      return result;
    }
    return null;
  }

  /**
   * gateways.last_seen_at + connection_status 갱신
   */
  private async updateGatewayLastSeen(gatewayDbId: number, now: Date): Promise<void> {
    await prisma.gateways.update({
      where: { gateway_id: gatewayDbId },
      data: {
        last_seen_at: now,
        connection_status: 'ONLINE',
      },
    });
  }

  /**
   * status 메시지 처리
   */
  async processStatusMessage(meta: TopicMeta, msg: StatusMessage): Promise<void> {
    const gatewayDbId = await this.resolveGatewayDbId(msg.gateway_id);
    if (!gatewayDbId) return;

    await prisma.gateways.update({
      where: { gateway_id: gatewayDbId },
      data: {
        status_flags: msg.status_flags,
        controller_count: msg.controller_count,
        last_seen_at: new Date(),
        connection_status: 'ONLINE',
      },
    });
  }
}

export const sensorService = new SensorService();
```

### 6.3 인메모리 Latest 캐시

```typescript
// src/services/latest-cache.service.ts

/**
 * 최신 센서 데이터 인메모리 캐시
 * 
 * REST API의 GET /monitoring/equipment/:id/latest 요청 시
 * DB 조회 없이 캐시에서 즉시 응답.
 * 
 * 키: gateway_id (MQTT ID)
 * 값: 마지막 수신한 전체 sensor 메시지
 */
class LatestCacheService {
  // gateway_id → 전체 sensor 메시지
  private cache = new Map<string, SensorMessage>();
  
  // controller별 최신 데이터 (빠른 조회용)
  // "equipment_id:controller_id" → controller 데이터
  private controllerCache = new Map<string, ControllerData & { equipment_id: string }>();

  async update(gatewayId: string, msg: SensorMessage): Promise<void> {
    this.cache.set(gatewayId, msg);
    
    for (const equip of msg.equipments) {
      for (const ctrl of equip.controllers) {
        const key = `${equip.equipment_id}:${ctrl.controller_id}`;
        this.controllerCache.set(key, { ...ctrl, equipment_id: equip.equipment_id });
      }
    }
  }

  getByGateway(gatewayId: string): SensorMessage | undefined {
    return this.cache.get(gatewayId);
  }

  getByController(equipmentId: string, controllerId: string) {
    return this.controllerCache.get(`${equipmentId}:${controllerId}`);
  }

  getAllForEquipment(equipmentId: string) {
    const results: Array<ControllerData & { equipment_id: string }> = [];
    for (const [key, val] of this.controllerCache) {
      if (key.startsWith(`${equipmentId}:`)) results.push(val);
    }
    return results;
  }
}

export const latestCache = new LatestCacheService();
```

### 6.4 MySQL DDL (파티셔닝)

```sql
-- controller_sensor_data: 일별 파티션 (10초 주기, 고빈도)
CREATE TABLE controller_sensor_data (
    data_id BIGINT AUTO_INCREMENT,
    controller_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    gateway_id BIGINT NOT NULL,
    timestamp INT UNSIGNED NOT NULL,
    received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pm2_5 FLOAT, pm10 FLOAT,
    diff_pressure FLOAT, oil_level FLOAT,
    pp_temp INT, pp_spark INT,
    pp_power INT, pp_alarm INT,
    fan_speed INT, flow FLOAT, damper FLOAT,
    inlet_temp FLOAT, velocity FLOAT, duct_dp FLOAT,
    status_flags INT DEFAULT 0,
    PRIMARY KEY (data_id, received_at),
    INDEX idx_ctrl_ts (controller_id, timestamp)
) PARTITION BY RANGE (TO_DAYS(received_at)) (
    -- 파티션 자동 생성 스크립트로 관리 (일별)
    -- 예: p_20260213 VALUES LESS THAN (TO_DAYS('2026-02-14'))
);

-- gateway_sensor_data: 월별 파티션 (매장당 1건/10초, 중빈도)
CREATE TABLE gateway_sensor_data (
    data_id BIGINT AUTO_INCREMENT,
    gateway_id BIGINT NOT NULL,
    timestamp INT UNSIGNED NOT NULL,
    received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pm1_0 FLOAT, pm2_5 FLOAT, pm4_0 FLOAT, pm10 FLOAT,
    temperature FLOAT, humidity FLOAT,
    voc_index INT NULL, nox_index INT NULL,
    co2 INT, o3 INT, co FLOAT, hcho INT,
    PRIMARY KEY (data_id, received_at),
    INDEX idx_gw_ts (gateway_id, timestamp)
) PARTITION BY RANGE (TO_DAYS(received_at)) (
    -- 월별 파티션
    -- 예: p_202602 VALUES LESS THAN (TO_DAYS('2026-03-01'))
);
```

### 6.5 저장 볼륨 예상 (200매장 기준)

| 항목 | 계산 | 일간 건수 | 일간 용량 |
|------|------|---------|---------|
| gateway_sensor_data | 200매장 × 평균 1.5층 × 8,640건/일(10초) | ~259만 건 | ~800MB |
| controller_sensor_data | 200매장 × 1.5층 × 3장비 × 2파워팩 × 8,640건/일 | ~1,555만 건 | ~6GB |

> 90일 원본 보관 시 controller_sensor_data ~540GB → 파티션 DROP으로 관리. 1시간 집계본은 5년 보관.

---

## 7. 통신 오류 감지 로직 (30초 타임아웃)

### 7.1 요구사항 (피드백 p.38)

```
- 데이터 전송 주기: 10초 간격
- 30초 동안 서버로 데이터가 전달되지 않았을 때 통신 오류로 판단
- 마지막 통신 시간 및 연결 상태 표시
- 연결(Green) / 끊김(Red) 2단계
```

### 7.2 구현 설계

```typescript
// src/services/connection-monitor.service.ts

import { PrismaClient } from '@prisma/client';
import { alertService } from './alert.service';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

const TIMEOUT_MS = 30_000;           // 30초
const CHECK_INTERVAL_MS = 5_000;     // 5초마다 전체 타이머 확인

interface GatewayTimer {
  gatewayDbId: number;
  mqttGatewayId: string;
  storeId: number;
  lastSeenAt: number;             // Date.now() 기준 밀리초
  isOnline: boolean;
}

class ConnectionMonitorService {
  private timers = new Map<string, GatewayTimer>();  // mqttGatewayId → timer
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * 서비스 시작
   * 1. DB에서 모든 게이트웨이 로드
   * 2. 주기적 타임아웃 체크 시작
   */
  async start(): Promise<void> {
    // 모든 게이트웨이 로드
    const gateways = await prisma.gateways.findMany({
      select: {
        gateway_id: true,
        mqtt_gateway_id: true,
        store_id: true,
        last_seen_at: true,
        connection_status: true,
      },
    });

    for (const gw of gateways) {
      this.timers.set(gw.mqtt_gateway_id, {
        gatewayDbId: gw.gateway_id,
        mqttGatewayId: gw.mqtt_gateway_id,
        storeId: gw.store_id,
        lastSeenAt: gw.last_seen_at ? gw.last_seen_at.getTime() : 0,
        isOnline: gw.connection_status === 'ONLINE',
      });
    }

    // 5초마다 전체 타이머 확인
    this.intervalId = setInterval(() => this.checkAllTimers(), CHECK_INTERVAL_MS);
    logger.info(`[ConnMon] Started monitoring ${this.timers.size} gateways`);
  }

  /**
   * sensor/status 메시지 수신 시 호출
   * 해당 게이트웨이 타이머 리셋 + ONLINE 전환
   */
  resetTimer(mqttGatewayId: string): void {
    const timer = this.timers.get(mqttGatewayId);
    if (!timer) return;

    const wasOffline = !timer.isOnline;
    timer.lastSeenAt = Date.now();
    timer.isOnline = true;

    // OFFLINE → ONLINE 전환 시 알람 해소
    if (wasOffline) {
      this.handleOnlineTransition(timer);
    }
  }

  /**
   * 전체 타이머 확인 (5초 간격 실행)
   * 30초 이상 미수신 게이트웨이 → OFFLINE 전환
   */
  private async checkAllTimers(): Promise<void> {
    const now = Date.now();
    const offlineThreshold = now - TIMEOUT_MS;

    for (const [gatewayId, timer] of this.timers) {
      if (timer.isOnline && timer.lastSeenAt < offlineThreshold) {
        await this.handleOfflineTransition(timer);
      }
    }
  }

  /**
   * ONLINE → OFFLINE 전환 처리
   */
  private async handleOfflineTransition(timer: GatewayTimer): Promise<void> {
    timer.isOnline = false;
    
    logger.warn(
      `[ConnMon] Gateway OFFLINE: ${timer.mqttGatewayId} ` +
      `(last seen: ${new Date(timer.lastSeenAt).toISOString()})`
    );

    // 1. DB 상태 업데이트
    await prisma.gateways.update({
      where: { gateway_id: timer.gatewayDbId },
      data: { connection_status: 'OFFLINE' },
    });

    // 2. 하위 equipment 전체 OFFLINE 전환
    await prisma.equipment.updateMany({
      where: {
        floor: {
          gateways: { some: { gateway_id: timer.gatewayDbId } },
        },
      },
      data: { connection_status: 'OFFLINE' },
    });

    // 3. COMM_ERROR 알람 생성 (severity: YELLOW)
    await alertService.createAlarm({
      storeId: timer.storeId,
      gatewayId: timer.gatewayDbId,
      alarmType: 'COMM_ERROR',
      severity: 'YELLOW',
      message: `게이트웨이 통신 끊김: ${timer.mqttGatewayId} (마지막 통신: ${new Date(timer.lastSeenAt).toLocaleString('ko-KR')})`,
    });
  }

  /**
   * OFFLINE → ONLINE 전환 처리
   */
  private async handleOnlineTransition(timer: GatewayTimer): Promise<void> {
    logger.info(`[ConnMon] Gateway ONLINE: ${timer.mqttGatewayId}`);

    // 1. DB 상태 업데이트
    await prisma.gateways.update({
      where: { gateway_id: timer.gatewayDbId },
      data: { connection_status: 'ONLINE' },
    });

    // 2. 하위 equipment ONLINE 전환
    await prisma.equipment.updateMany({
      where: {
        floor: {
          gateways: { some: { gateway_id: timer.gatewayDbId } },
        },
      },
      data: { connection_status: 'ONLINE' },
    });

    // 3. COMM_ERROR 알람 자동 해소
    await alertService.resolveAlarm({
      gatewayId: timer.gatewayDbId,
      alarmType: 'COMM_ERROR',
    });
  }

  /**
   * 게이트웨이 등록/삭제 시 모니터링 목록 갱신
   */
  addGateway(gw: { gatewayDbId: number; mqttGatewayId: string; storeId: number }): void {
    this.timers.set(gw.mqttGatewayId, {
      ...gw,
      lastSeenAt: 0,
      isOnline: false,
    });
  }

  removeGateway(mqttGatewayId: string): void {
    this.timers.delete(mqttGatewayId);
  }

  stop(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}

export const connectionMonitor = new ConnectionMonitorService();
```

### 7.3 통신 상태 전파 규칙 (피드백 p.38)

```
게이트웨이 OFFLINE 발생 시:
  Gateway: connection_status = 'OFFLINE'
    └── 하위 Equipment 전체: connection_status = 'OFFLINE'
        └── (Controller는 DB에 별도 connection_status 없음,
             controller.timestamp으로 개별 판단)

게이트웨이 ONLINE 복구 시:
  Gateway: connection_status = 'ONLINE'
    └── 하위 Equipment 전체: connection_status = 'ONLINE'

개별 컨트롤러 통신 이상 판단:
  sensor 메시지 내 controller.timestamp과 gateway.timestamp 비교
  차이 > 30초 → 해당 컨트롤러 개별 통신 이상 (프론트엔드 판정)
```

---

## 8. 제어 명령 발행 및 ACK 처리

### 8.1 제어 대상 및 액션 정의

**target=0: 파워팩 (Powerpack)**

| action | value | 설명 | 권한 |
|--------|-------|------|------|
| 0 | - | 파워팩 OFF | ADMIN, OWNER (본인매장) |
| 1 | - | 파워팩 ON | ADMIN, OWNER (본인매장) |
| 2 | - | 파워팩 리셋 | ADMIN |

**target=1: 댐퍼 (Damper / flo-OAC)**

| action | value | 설명 | 권한 |
|--------|-------|------|------|
| 1 | 0-100 | 댐퍼 개도율 설정 (%, 수동 모드) | ADMIN, OWNER |

> flo-OAC 하드웨어는 Float 0~100% 연속 제어 지원. MQTT에서는 정수(0-100)로 전달, 컨트롤러에서 float 변환.

**8단계 매핑** (피드백 p.45 — 애플리케이션 레벨 처리):

| 단계 | 개도율 | MQTT value |
|------|-------|-----------|
| 0단계 | 0% | 0 |
| 1단계 | 10% | 10 |
| 2단계 | 25% | 25 |
| 3단계 | 40% | 40 |
| 4단계 | 60% | 60 |
| 5단계 | 75% | 75 |
| 6단계 | 90% | 90 |
| 7단계 | 100% | 100 |

**target=2: 시로코팬 (Fan)**

| action | value | 설명 | 권한 |
|--------|-------|------|------|
| 0 | - | 팬 OFF | ADMIN, OWNER |
| 1 | - | 팬 LOW (하) | ADMIN, OWNER |
| 2 | - | 팬 MID (중) | ADMIN, OWNER |
| 3 | - | 팬 HIGH (상) | ADMIN, OWNER |

### 8.2 일괄 제어 범위

| equipment_id | controller_id | 범위 |
|-------------|---------------|------|
| `"all"` | `"all"` | 게이트웨이 하위 전체 컨트롤러 |
| `"esp-001"` | `"all"` | 해당 집진기 하위 컨트롤러만 |
| `"esp-001"` | `"ctrl-001"` | 특정 컨트롤러 지정 |

### 8.3 제어 명령 서비스

```typescript
// src/services/control.service.ts

import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { mqttBridge } from './mqtt.service';
import { ControlAck } from '../validators/mqtt.validator';

const prisma = new PrismaClient();
const ACK_TIMEOUT_MS = 10_000;  // 10초 ACK 대기 타임아웃

// 대기 중인 ACK 콜백
const pendingAcks = new Map<string, {
  resolve: (ack: ControlAck) => void;
  reject: (err: Error) => void;
  timeoutId: NodeJS.Timeout;
}>();

class ControlService {
  
  /**
   * 제어 명령 발행 (REST API → MQTT)
   * 
   * 1. UUID 생성
   * 2. control_commands 테이블 INSERT (PENDING)
   * 3. MQTT publish
   * 4. ACK 대기 (10초 타임아웃)
   * 5. 결과 반환
   */
  async sendCommand(params: {
    storeId: number;
    gatewayDbId: number;
    siteId: string;       // MQTT 토픽용
    floorId: string;      // MQTT 토픽용
    gatewayMqttId: string;
    equipmentId: string;  // MQTT ID ("all" 가능)
    controllerId: string; // MQTT ID ("all" 가능)
    target: 0 | 1 | 2;
    action: number;
    value?: number;
    controlMode: 'AUTO' | 'MANUAL';
    requestedBy: number | null;  // 자동이면 null
  }): Promise<{ cmdId: string; result: 'SUCCESS' | 'FAIL' | 'TIMEOUT'; reason?: string }> {
    
    const cmdId = uuidv4();

    // ── 1. DB 기록 (PENDING) ──
    await prisma.control_commands.create({
      data: {
        cmd_id: cmdId,
        store_id: params.storeId,
        gateway_id: params.gatewayDbId,
        equipment_id_mqtt: params.equipmentId,
        controller_id_mqtt: params.controllerId,
        target: params.target,
        action: params.action,
        value: params.value ?? null,
        control_mode: params.controlMode,
        requested_by: params.requestedBy,
        result: 'PENDING',
        requested_at: new Date(),
      },
    });

    // ── 2. MQTT Payload 구성 ──
    const mqttPayload = {
      cmd_id: cmdId,
      equipment_id: params.equipmentId,
      controller_id: params.controllerId,
      target: params.target,
      action: params.action,
      value: params.value ?? 0,
    };

    // ── 3. MQTT 발행 ──
    await mqttBridge.publishControl(
      params.siteId,
      params.floorId,
      params.gatewayMqttId,
      mqttPayload,
    );

    // ── 4. ACK 대기 (10초) ──
    try {
      const ack = await this.waitForAck(cmdId);
      
      // ── 5. DB 업데이트 (SUCCESS/FAIL) ──
      await prisma.control_commands.update({
        where: { cmd_id: cmdId },
        data: {
          result: ack.result === 'success' ? 'SUCCESS' : 'FAIL',
          fail_reason: ack.reason || null,
          responded_at: new Date(),
        },
      });

      return {
        cmdId,
        result: ack.result === 'success' ? 'SUCCESS' : 'FAIL',
        reason: ack.reason || undefined,
      };
    } catch (err) {
      // ── 타임아웃 ──
      await prisma.control_commands.update({
        where: { cmd_id: cmdId },
        data: {
          result: 'FAIL',
          fail_reason: 'ACK_TIMEOUT',
          responded_at: new Date(),
        },
      });

      return { cmdId, result: 'TIMEOUT', reason: 'ACK_TIMEOUT' };
    }
  }

  /**
   * ACK 대기 Promise
   */
  private waitForAck(cmdId: string): Promise<ControlAck> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        pendingAcks.delete(cmdId);
        reject(new Error('ACK_TIMEOUT'));
      }, ACK_TIMEOUT_MS);

      pendingAcks.set(cmdId, { resolve, reject, timeoutId });
    });
  }

  /**
   * control/ack 메시지 수신 시 호출 (mqttBridge에서 호출)
   */
  async processAck(ack: ControlAck): Promise<void> {
    const pending = pendingAcks.get(ack.cmd_id);
    
    if (pending) {
      // 실시간 대기 중인 요청 → Promise resolve
      clearTimeout(pending.timeoutId);
      pendingAcks.delete(ack.cmd_id);
      pending.resolve(ack);
    } else {
      // 대기 종료 후 뒤늦게 도착한 ACK → DB 직접 업데이트
      await prisma.control_commands.updateMany({
        where: { cmd_id: ack.cmd_id, result: 'PENDING' },
        data: {
          result: ack.result === 'success' ? 'SUCCESS' : 'FAIL',
          fail_reason: ack.reason || null,
          responded_at: new Date(),
        },
      });
    }
  }
}

export const controlService = new ControlService();
```

### 8.4 제어 명령 시퀀스

```
클라이언트                 REST API              MQTT 브릿지           AWS IoT Core          게이트웨이
    │                        │                      │                     │                     │
    │ POST /control/command  │                      │                     │                     │
    │ ─────────────────────► │                      │                     │                     │
    │                        │ control_commands      │                     │                     │
    │                        │ INSERT (PENDING)     │                     │                     │
    │                        │ ─────────────────►   │                     │                     │
    │                        │                      │ MQTT publish        │                     │
    │                        │                      │ .../control         │                     │
    │                        │                      │ ────────────────►   │ ──────────────────► │
    │                        │                      │                     │                     │
    │                        │                      │                     │ ◄────────────────── │
    │                        │                      │ ◄────────────────── │ control/ack         │
    │                        │                      │ processAck()        │                     │
    │                        │ ◄─────────────────── │                     │                     │
    │                        │ UPDATE (SUCCESS)     │                     │                     │
    │ ◄───────────────────── │                      │                     │                     │
    │ { cmdId, result }      │                      │                     │                     │
```

---

## 9. 알람 이벤트 생성 로직

### 9.1 알람 소스 (v3.0 — 피드백 p.33~34)

> MQTT alarm 토픽은 삭제됨. 알람은 `pp_alarm` 필드 + **서버측 연산**으로 생성.

| alarm_type | 감지 소스 | YELLOW 조건 | RED 조건 |
|-----------|---------|------------|---------|
| `COMM_ERROR` | 30초 미수신 | 끊김 30초 이상 | 끊김 1시간 이상 |
| `INLET_TEMP_ABNORMAL` | controller.inlet_temp | 70°C 이상 | 100°C 이상 |
| `FILTER_CHECK` | 서버측 차압 연산 | diff_pressure > 기준 | - |
| `DUST_REMOVAL_CHECK` | 서버측 PM 연산 | - | 점검 필요 |
| `PP_ALARM` | controller.pp_alarm | - | pp_alarm = 1 |

### 9.2 알람 판정 서비스

```typescript
// src/services/alert.service.ts

class AlertService {
  /**
   * sensor 메시지 수신 시 알람 판정
   * 각 컨트롤러 데이터를 순회하며 임계값 초과 여부 확인
   */
  async evaluateSensorAlarms(meta: TopicMeta, msg: SensorMessage): Promise<void> {
    for (const equip of msg.equipments) {
      for (const ctrl of equip.controllers) {
        // 1. pp_alarm 필드 체크 (하드웨어 알람)
        if (ctrl.pp_alarm === 1) {
          await this.createOrUpdateAlarm({
            storeId: /* resolve from meta.siteId */,
            equipmentMqttId: equip.equipment_id,
            controllerMqttId: ctrl.controller_id,
            alarmType: 'PP_ALARM',
            severity: 'RED',
            message: `파워팩 알람 발생: ${equip.equipment_id}/${ctrl.controller_id}`,
          });
        }

        // 2. 유입 온도 체크
        if (ctrl.inlet_temp >= 100) {
          await this.createOrUpdateAlarm({
            alarmType: 'INLET_TEMP_ABNORMAL',
            severity: 'RED',
            message: `유입 온도 위험: ${ctrl.inlet_temp}°C (${equip.equipment_id}/${ctrl.controller_id})`,
          });
        } else if (ctrl.inlet_temp >= 70) {
          await this.createOrUpdateAlarm({
            alarmType: 'INLET_TEMP_ABNORMAL',
            severity: 'YELLOW',
            message: `유입 온도 주의: ${ctrl.inlet_temp}°C (${equip.equipment_id}/${ctrl.controller_id})`,
          });
        }

        // 3. 필터 점검 상태 (cleaning_thresholds 기준 비교)
        await this.evaluateFilterCheck(equip.equipment_id, ctrl);

        // 4. 먼지 제거 성능 체크
        await this.evaluateDustRemoval(equip.equipment_id, ctrl);
      }
    }
  }

  /**
   * 중복 알람 방지
   * 같은 장비 + 같은 alarmType의 ACTIVE 알람이 이미 있으면 건너뜀
   */
  private async createOrUpdateAlarm(params: CreateAlarmParams): Promise<void> {
    const existing = await prisma.alarm_events.findFirst({
      where: {
        equipment_id: params.equipmentDbId,
        controller_id: params.controllerDbId,
        alarm_type: params.alarmType,
        status: 'ACTIVE',
      },
    });

    if (existing) {
      // severity 상승 시에만 업데이트
      if (params.severity === 'RED' && existing.severity === 'YELLOW') {
        await prisma.alarm_events.update({
          where: { alarm_id: existing.alarm_id },
          data: { severity: 'RED', message: params.message },
        });
      }
      return;
    }

    await prisma.alarm_events.create({
      data: {
        store_id: params.storeId,
        gateway_id: params.gatewayDbId,
        equipment_id: params.equipmentDbId,
        controller_id: params.controllerDbId,
        alarm_type: params.alarmType,
        severity: params.severity,
        message: params.message,
        occurred_at: new Date(),
        status: 'ACTIVE',
      },
    });

    // RED 알람 → 관리자 이메일 발송 (피드백 p.34)
    if (params.severity === 'RED') {
      await this.sendAdminEmail(params);
    }
  }

  /**
   * 알람 자동 해소
   */
  async resolveAlarm(params: { gatewayId?: number; equipmentId?: number; alarmType: string }): Promise<void> {
    await prisma.alarm_events.updateMany({
      where: {
        ...(params.gatewayId && { gateway_id: params.gatewayId }),
        ...(params.equipmentId && { equipment_id: params.equipmentId }),
        alarm_type: params.alarmType,
        status: { in: ['ACTIVE', 'ACKNOWLEDGED'] },
      },
      data: {
        status: 'RESOLVED',
        resolved_at: new Date(),
      },
    });
  }
}

export const alertService = new AlertService();
```

### 9.3 대시보드 표시 규칙 (피드백 p.33~34)

```
문제 발생 이슈 (대시보드 카드):
  → YELLOW + RED 모두 표시
  → 알람 유형: COMM_ERROR, INLET_TEMP_ABNORMAL, FILTER_CHECK, DUST_REMOVAL_CHECK, PP_ALARM

긴급 알람 (대시보드 별도 섹션):
  → RED만 표시
  → 관리자에게 이메일 자동 발송

실내공기질 (IAQ):
  → 이슈/알림에 표시하지 않음 (피드백 p.33)
  → 대시보드 참고 데이터로만 활용
```

---

## 10. 데이터 보존 및 집계 정책

### 10.1 보존 기간

| 데이터 유형 | 원본 보존 | 집계 보존 | 비고 |
|-----------|---------|---------|------|
| gateway_sensor_data | 90일 | 5년 (1시간 집계) | 월별 파티션 |
| controller_sensor_data | 90일 | 5년 (1시간 집계) | 일별 파티션 |
| alarm_events | 영구 | - | 이력 관리 필수 |
| control_commands | 영구 | - | 감사 추적 필수 |
| equipment_history | 영구 | - | A/S + 청소 이력 |

### 10.2 집계 배치 (1시간 단위)

```typescript
// src/jobs/aggregate-sensor-data.ts
// 매 시간 실행 (cron: "0 * * * *")

/**
 * 원본 데이터 → 1시간 집계
 * 
 * controller_sensor_data_hourly 테이블에 저장
 * 각 필드별 min/max/avg/count 계산
 */
async function aggregateControllerData(): Promise<void> {
  const hourAgo = new Date(Date.now() - 3600_000);
  
  await prisma.$executeRaw`
    INSERT INTO controller_sensor_data_hourly 
      (controller_id, equipment_id, hour_start,
       pm2_5_avg, pm2_5_min, pm2_5_max,
       pp_temp_avg, pp_temp_min, pp_temp_max,
       pp_spark_max, diff_pressure_avg,
       flow_avg, damper_avg,
       inlet_temp_avg, inlet_temp_max,
       velocity_avg, duct_dp_avg,
       data_count)
    SELECT 
      controller_id, equipment_id,
      DATE_FORMAT(received_at, '%Y-%m-%d %H:00:00'),
      AVG(pm2_5), MIN(pm2_5), MAX(pm2_5),
      AVG(pp_temp), MIN(pp_temp), MAX(pp_temp),
      MAX(pp_spark), AVG(diff_pressure),
      AVG(flow), AVG(damper),
      AVG(inlet_temp), MAX(inlet_temp),
      AVG(velocity), AVG(duct_dp),
      COUNT(*)
    FROM controller_sensor_data
    WHERE received_at >= DATE_FORMAT(${hourAgo}, '%Y-%m-%d %H:00:00')
      AND received_at < DATE_FORMAT(NOW(), '%Y-%m-%d %H:00:00')
    GROUP BY controller_id, equipment_id,
             DATE_FORMAT(received_at, '%Y-%m-%d %H:00:00')
  `;
}
```

### 10.3 파티션 관리 스크립트

```sql
-- 일별 파티션 추가 (매일 자동 실행)
-- cron: "0 0 * * *"
ALTER TABLE controller_sensor_data 
  ADD PARTITION (PARTITION p_20260214 VALUES LESS THAN (TO_DAYS('2026-02-15')));

-- 90일 이상 원본 파티션 삭제 (매일 자동 실행)
ALTER TABLE controller_sensor_data 
  DROP PARTITION p_20251116;
```

---

## 11. 구현 파일 구조 및 모듈 명세

```
esp-api/src/
├── config/
│   ├── mqtt.ts                    # AWS IoT Core 연결 설정
│   ├── database.ts                # MySQL/Prisma 설정
│   └── jwt.ts                     # JWT 설정
│
├── services/
│   ├── mqtt.service.ts            # MQTT 브릿지 (연결/구독/발행/라우팅)
│   ├── sensor.service.ts          # 센서 데이터 파싱/저장/캐시
│   ├── control.service.ts         # 제어 명령 발행/ACK 처리
│   ├── alert.service.ts           # 알람 판정/생성/해소/이메일
│   ├── connection-monitor.service.ts  # 30초 타임아웃 감지
│   └── latest-cache.service.ts    # 인메모리 최신 데이터 캐시
│
├── validators/
│   └── mqtt.validator.ts          # Zod 스키마 (sensor/status/ack)
│
├── utils/
│   ├── topicParser.ts             # 토픽 문자열 파싱
│   ├── statusFlags.ts             # status_flags 비트 파싱 유틸리티
│   └── logger.ts                  # 로깅
│
├── jobs/
│   ├── aggregate-sensor-data.ts   # 1시간 집계 배치
│   ├── partition-manager.ts       # 파티션 생성/삭제
│   └── comm-error-escalation.ts   # COMM_ERROR YELLOW→RED 에스컬레이션 (1시간)
│
└── prisma/
    └── schema.prisma              # DB 스키마
```

### 모듈 의존성 관계

```
mqtt.service.ts (진입점)
  ├── topicParser.ts
  ├── mqtt.validator.ts
  │
  ├── sensor.service.ts
  │   ├── latest-cache.service.ts
  │   └── alert.service.ts
  │
  ├── control.service.ts
  │
  └── connection-monitor.service.ts
      └── alert.service.ts
```

---

## 12. 테스트 전략

### 12.1 단위 테스트

| 모듈 | 테스트 항목 |
|------|-----------|
| `topicParser.ts` | 정상 토픽 파싱, 비정상 토픽 null 반환, control/ack 복합 세그먼트 |
| `mqtt.validator.ts` | 정상 payload 통과, 필드 누락 거부, voc_index null 허용, status_flags 범위 |
| `statusFlags.ts` | 63 = 모든 정상, 0 = 모든 이상, 개별 비트 확인 |
| `alert.service.ts` | pp_alarm=1 → RED 알람 생성, 중복 알람 방지, severity 상승 |
| `connection-monitor.service.ts` | 30초 타임아웃 → OFFLINE, resetTimer → ONLINE 복구 |

### 12.2 통합 테스트

| 시나리오 | 검증 항목 |
|---------|---------|
| sensor 메시지 수신 → DB 저장 | gateway_sensor_data + controller_sensor_data 각각 INSERT 확인 |
| control 명령 → ACK 수신 | control_commands PENDING → SUCCESS 전이 |
| ACK 미수신 (10초) | control_commands PENDING → FAIL (ACK_TIMEOUT) |
| 30초 미수신 → 통신 오류 | gateways.connection_status = OFFLINE, COMM_ERROR 알람 생성 |
| 통신 복구 | ONLINE 전환, COMM_ERROR 알람 RESOLVED |
| 일괄 제어 ("all") | MQTT payload에 equipment_id="all" 포함 확인 |

### 12.3 Mock 센서 데이터 범위 (프론트엔드 Phase 1 호환)

| 필드 | 범위 | 타입 |
|------|------|------|
| pp_temp | 30-70 | int |
| pp_spark | 0-99 | int |
| pp_power | 0 \| 1 | int |
| pp_alarm | 0 \| 1 | int |
| pm2_5 | 5-80 | float |
| diff_pressure | 5-50 | float |
| oil_level | 10-90 | float |
| flow | 300-1200 | float (CMH) |
| damper | 0-100 | float (%) |
| fan_speed | 0 \| 1 \| 2 \| 3 | int |
| inlet_temp | 15-50 | float (°C) |
| velocity | 2-15 | float (m/s) |
| duct_dp | 50-500 | float (Pa) |
| status_flags | 0-63 | int (6비트) |

---

## 부록 A. 변경 이력 대응표

| MQTT 규격 변경 (260212) | 본 문서 반영 위치 |
|------------------------|-----------------|
| controller 필드에 flo-OAC inlet_temp, velocity, duct_dp 추가 | 섹션 4.1.2, 6.2, DDL |
| 통합 센서 메시지 구조 도입 | 섹션 4.1 전체 |
| blade_angle 제거 → damper 통합 | 섹션 4.1.2 (damper 필드) |
| 알람 토픽 제거 → pp_alarm 필드로 전달 | 섹션 9.1 (서버측 알람 생성) |
| status_flags 재설계 (GW 7비트/Ctrl 6비트) | 섹션 4.1.3, 4.2 |
| ID 문자열 통일, 일괄 제어 "all" 보완 | 섹션 8.2 |
| pp_temp 타입 int 명확화 | 섹션 4.1.2 (int, x10 스케일 아님) |
| QoS 1 / Retain 0 확정 | 섹션 2.1 |

## 부록 B. REST API ↔ MQTT 연동 포인트

| REST API 엔드포인트 | MQTT 연동 | 설명 |
|--------------------|----------|------|
| `POST /control/command` | → MQTT publish `.../control` | 제어 명령 발행 |
| `GET /control/command/:cmdId/status` | control/ack 수신 결과 조회 | ACK 상태 폴링 |
| `GET /monitoring/equipment/:id/latest` | 인메모리 latest 캐시 | 실시간 센서값 |
| `GET /monitoring/equipment/:id/history` | controller_sensor_data 조회 | 이력 차트 데이터 |
| `GET /monitoring/gateway/:id/iaq-history` | gateway_sensor_data 조회 | IAQ 이력 |
| `GET /dashboard/issues` | alarm_events 조회 | MQTT 기반 알람 목록 |
| `GET /dashboard/store-tree` | connection_status 포함 | 통신 상태 반영 트리 |

---

*본 문서는 MQTT_Payload_규격_260212.pdf, ESP_관리툴_최종피드백_260212.pdf, MetaBeans_ESP_데이터구조_정의서_v3_0.md, MetaBeans_ESP_프로젝트_아키텍처_기술스택_정의서.md를 기반으로 작성되었습니다.*
