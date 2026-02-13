# MetaBeans ESP ê´€ì œì‹œìŠ¤í…œ â€” REST API ì—”ë“œí¬ì¸íŠ¸ ì„¤ê³„ì„œ

**ë¬¸ì„œ ë²„ì „**: v1.1  
**ìž‘ì„±ì¼**: 2026-02-13  
**ê·¼ê±° ë¬¸ì„œ** (ìš°ì„ ìˆœìœ„ìˆœ):
1. MQTT Payload ê·œê²©_260213.pdf (2026-02-13)
2. MQTT 토픽 구조 변경 및 협의 사항.pdf (2026-02-13)
3. ESP ê´€ë¦¬íˆ´_ìµœì¢…í”¼ë“œë°±_260212.pdf (2026-02-12)
4. MetaBeans_ESP_ë°ì´í„°êµ¬ì¡°_ì •ì˜ì„œ_v3_0.md
5. MetaBeans_ESP_í”„ë¡œì íŠ¸_ì•„í‚¤í…ì²˜_ê¸°ìˆ ìŠ¤íƒ_ì •ì˜ì„œ.md
6. MetaBeans_ESP_ê´€ë¦¬íˆ´_ì „ì²´êµ¬ì¡°_ê¸°íšì„œ.docx

### 변경 이력 (v1.0 → v1.1)

| 구분 | MQTT 260212 | MQTT 260213 | REST API 반영 |
|------|-------------|-------------|---------------|
| 센서 필드 | `fan_speed` | `fan_speed` + `fan_mode` + `damper_mode` 추가 | 5.1 센서 데이터 응답에 `fanMode`, `damperMode` 추가 |
| 댐퍼 제어 | target=1, action=1만 (수동) | action=2 (모드전환), action=3 (목표풍량) 추가 | 6.1 제어 명령 테이블 확장 |
| 팬 제어 | target=2, action=0~3만 (수동) | action=4 (모드전환), action=5 (목표풍속) 추가 | 6.1 제어 명령 테이블 확장 |
| `value` 타입 | `int` | `number` (int 또는 float) | 6.1 Body에서 value 타입 number로 변경 |
| config 토픽 | "추후 정의" | 전체 필드 정의 (sensor_interval, mqtt_interval 등) | 6.6 게이트웨이 원격 설정 API 신규 |
| config/ack 토픽 | 없음 | 신규 추가 (needs_reboot 필드 포함) | 6.7 설정 변경 결과 확인 API 신규 |
| 팬 자동제어 | 없음 | M100 인버터 PID 기반 자동제어 | 6.5 팬 자동제어 설정 API 신규 |


---

## 0. ê³µí†µ ê·œì¹™

### 0.1 Base URL

```
Production : https://api.metabeans.co.kr/api/v1
Development: http://localhost:3000/api/v1
```

### 0.2 ì¸ì¦ ë°©ì‹

| í•­ëª© | ê·œê²© |
|------|------|
| Access Token | JWT, 15ë¶„ ë§Œë£Œ, `Authorization: Bearer {token}` í—¤ë” |
| Refresh Token | JWT, 7ì¼ ë§Œë£Œ, HttpOnly Cookie (`esp_refresh`) |
| JWT Payload | `{ userId, loginId, role, storeIds[] }` |
| ì—­í• (role) | `ADMIN` \| `DEALER` \| `HQ` \| `OWNER` |

### 0.3 ê³µí†µ ì‘ë‹µ í˜•ì‹

**ì„±ê³µ ì‘ë‹µ**
```json
{
  "success": true,
  "data": { ... },
  "meta": {                    // ëª©ë¡ ì¡°íšŒ ì‹œì—ë§Œ
    "page": 1,
    "pageSize": 20,
    "totalCount": 152,
    "totalPages": 8
  }
}
```

**ì—ëŸ¬ ì‘ë‹µ**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_TOKEN_EXPIRED",
    "message": "Access tokenì´ ë§Œë£Œë˜ì—ˆìŠµë‹ˆë‹¤.",
    "details": null
  }
}
```

### 0.4 ê³µí†µ ì—ëŸ¬ ì½”ë“œ

| HTTP | ì½”ë“œ | ì„¤ëª… |
|------|------|------|
| 400 | `VALIDATION_ERROR` | ìž…ë ¥ê°’ ìœ íš¨ì„± ê²€ì¦ ì‹¤íŒ¨ |
| 401 | `AUTH_TOKEN_EXPIRED` | Access Token ë§Œë£Œ |
| 401 | `AUTH_UNAUTHORIZED` | ì¸ì¦ ì‹¤íŒ¨ |
| 403 | `AUTH_FORBIDDEN` | ê¶Œí•œ ì—†ìŒ (ì—­í• /ë°ì´í„° ì ‘ê·¼) |
| 404 | `RESOURCE_NOT_FOUND` | ë¦¬ì†ŒìŠ¤ ì—†ìŒ |
| 409 | `DUPLICATE_RESOURCE` | ì¤‘ë³µ ë¦¬ì†ŒìŠ¤ (ì•„ì´ë””, ì‚¬ì—…ìžë²ˆí˜¸ ë“±) |
| 500 | `INTERNAL_ERROR` | ì„œë²„ ë‚´ë¶€ ì˜¤ë¥˜ |

### 0.5 ê³µí†µ ì¿¼ë¦¬ íŒŒë¼ë¯¸í„° (ëª©ë¡ ì¡°íšŒ)

| íŒŒë¼ë¯¸í„° | íƒ€ìž… | ê¸°ë³¸ê°’ | ì„¤ëª… |
|---------|------|--------|------|
| `page` | number | 1 | íŽ˜ì´ì§€ ë²ˆí˜¸ |
| `pageSize` | number | 20 | íŽ˜ì´ì§€ë‹¹ í•­ëª© ìˆ˜ (max 100) |
| `sortBy` | string | `created_at` | ì •ë ¬ ê¸°ì¤€ ì»¬ëŸ¼ |
| `sortOrder` | string | `desc` | `asc` \| `desc` |
| `search` | string | - | ê²€ìƒ‰ì–´ (ëŒ€ìƒ í•„ë“œëŠ” APIë³„ ì •ì˜) |

### 0.6 ì—­í• ë³„ ë°ì´í„° ì ‘ê·¼ ë²”ìœ„ ê·œì¹™

ì„œë²„ ë¯¸ë“¤ì›¨ì–´ì—ì„œ JWTì˜ `role`ê³¼ `storeIds[]`ë¥¼ ê¸°ë°˜ìœ¼ë¡œ ìžë™ í•„í„°ë§:

| ì—­í•  | ë§¤ìž¥ ì ‘ê·¼ ë²”ìœ„ | íŒë³„ ê¸°ì¤€ |
|------|-------------|----------|
| `ADMIN` | ì „ì²´ ë§¤ìž¥ | ì œí•œ ì—†ìŒ |
| `DEALER` | ê´€í•  ë§¤ìž¥ | `stores.dealer_id = currentUser.userId` |
| `HQ` | ì†Œì† ë§¤ìž¥ | `stores.hq_id = currentUser.userId` |
| `OWNER` | ë³¸ì¸ ë§¤ìž¥ | `stores.owner_id = currentUser.userId` |

### 0.7 íƒ€ìž„ìŠ¤íƒ¬í”„ ê·œì¹™

- **DB ì €ìž¥**: UTC (`DATETIME`)
- **API ì‘ë‹µ**: ISO 8601 (`"2026-02-13T09:30:00Z"`)
- **MQTT ì›ë³¸**: Unix epoch (ì´ˆ ë‹¨ìœ„) â€” MQTT ë¸Œë¦¿ì§€ì—ì„œ ë³€í™˜

---

## 1. ì¸ì¦ (Auth)

> **í™”ë©´**: ESP_ë¡œê·¸ì¸.html, ê° íšŒì›ê°€ìž… HTML

### 1.1 ë¡œê·¸ì¸

```
POST /auth/login
```

**Body**
```json
{
  "loginId": "store_owner_001",
  "password": "secureP@ss123"
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "user": {
      "userId": 1,
      "loginId": "store_owner_001",
      "name": "ê¹€ì ì£¼",
      "role": "OWNER",
      "email": "kim@store.com",
      "phone": "010-1234-5678",
      "storeIds": [101],
      "permissions": ["DASHBOARD_AS_REQUEST", "DASHBOARD_REALTIME_ISSUE", "MONITOR_BASIC_STATUS", "CONTROL_POWER", "CONTROL_DAMPER", "CONTROL_FAN", "AS_REQUEST"]
    }
  }
}
```
- Refresh Tokenì€ `Set-Cookie: esp_refresh=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800`ë¡œ ì „ë‹¬
- `permissions[]`: í•´ë‹¹ ì‚¬ìš©ìžì˜ ìµœì¢… í—ˆìš© feature_code ëª©ë¡ (RBAC + ì˜¤ë²„ë¼ì´ë“œ ë°˜ì˜)

**ë¹„ì¦ˆë‹ˆìŠ¤ ê·œì¹™**:
- `account_status`ê°€ `ACTIVE`ì¸ ê²½ìš°ì—ë§Œ ë¡œê·¸ì¸ í—ˆìš©
- ë¡œê·¸ì¸ ì„±ê³µ ì‹œ `users.last_login_at` ì—…ë°ì´íŠ¸

### 1.2 í† í° ê°±ì‹ 

```
POST /auth/refresh
```
- Cookieì—ì„œ `esp_refresh` ìžë™ ì „ë‹¬
- ìƒˆ Access Token + (ì„ íƒì ) ìƒˆ Refresh Token ë°œê¸‰

**Response 200**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG..."
  }
}
```

### 1.3 ë¡œê·¸ì•„ì›ƒ

```
POST /auth/logout
```
- Refresh Token Cookie ì‚­ì œ
- (ì„ íƒ) ì„œë²„ ì¸¡ í† í° ë¸”ëž™ë¦¬ìŠ¤íŠ¸ ë“±ë¡

### 1.4 ì•„ì´ë”” ì¤‘ë³µ í™•ì¸

```
GET /auth/check-login-id?loginId=new_user_01
```

**Response 200**
```json
{
  "success": true,
  "data": { "available": true }
}
```

### 1.5 ë¹„ë°€ë²ˆí˜¸ ì´ˆê¸°í™” ìš”ì²­

```
POST /auth/password-reset-request
```

**Body**
```json
{
  "loginId": "store_owner_001",
  "name": "ê¹€ì ì£¼",
  "phone": "010-1234-5678"
}
```
- ê´€ë¦¬ìž ìŠ¹ì¸ í›„ ì²˜ë¦¬ (ìµœëŒ€ 24ì‹œê°„ ì†Œìš”)

### 1.6 ë¹„ë°€ë²ˆí˜¸ ë³€ê²½

```
PUT /auth/password
ðŸ”’ ì¸ì¦ í•„ìš”
```

**Body**
```json
{
  "currentPassword": "oldP@ss",
  "newPassword": "newP@ss123"
}
```

---

## 2. íšŒì›ê°€ìž… (Registration)

> **í™”ë©´**: ESP_ë§¤ìž¥ì ì£¼_íšŒì›ê°€ìž….html, ESP_ë§¤ìž¥ë³¸ì‚¬_íšŒì›ê°€ìž….html, ESP_ë³¸ì‚¬_íšŒì›ê°€ìž….html, ESP_ëŒ€ë¦¬ì _íšŒì›ê°€ìž….html

### 2.1 ë§¤ìž¥ ì ì£¼(OWNER) ê°€ìž… â€” 7ë‹¨ê³„

```
POST /registration/owner
```

**Body**
```json
{
  "account": {
    "loginId": "owner_kim",
    "password": "secureP@ss123",
    "name": "ê¹€ì ì£¼",
    "phone": "010-1234-5678",
    "email": "kim@store.com"
  },
  "business": {
    "businessName": "ê¹€ë„¤ì‹ë‹¹",
    "businessNumber": "123-45-67890",
    "address": "ì„œìš¸ì‹œ ê°•ë‚¨êµ¬ ì—­ì‚¼ë™ 123-4"
  },
  "businessCertFile": "(multipart file â€” ì‚¬ì—…ìžë“±ë¡ì¦)",
  "store": {
    "storeName": "ê¹€ë„¤ì‹ë‹¹ ë³¸ì ",
    "address": "ì„œìš¸ì‹œ ê°•ë‚¨êµ¬ ì—­ì‚¼ë™ 123-4",
    "latitude": 37.5012,
    "longitude": 127.0396
  },
  "affiliation": {
    "hqId": null,
    "dealerId": 5
  },
  "termsAgreed": true
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "userId": 25,
    "accountStatus": "PENDING",
    "message": "íšŒì›ê°€ìž…ì´ ì™„ë£Œë˜ì—ˆìŠµë‹ˆë‹¤. ê´€ë¦¬ìž ìŠ¹ì¸ í›„ ë¡œê·¸ì¸ ê°€ëŠ¥í•©ë‹ˆë‹¤."
  }
}
```

### 2.2 ë§¤ìž¥ ë³¸ì‚¬(HQ) ê°€ìž… â€” 5ë‹¨ê³„

```
POST /registration/hq
```

**Body**
```json
{
  "account": {
    "loginId": "hq_bbq",
    "password": "secureP@ss123",
    "name": "ë°•ë³¸ì‚¬",
    "phone": "010-9876-5432",
    "email": "park@bbq.co.kr"
  },
  "business": {
    "businessName": "ë¹„ë¹„í ë³¸ì‚¬",
    "businessNumber": "987-65-43210",
    "address": "ì„œìš¸ì‹œ ì†¡íŒŒêµ¬ ë¬¸ì •ë™ 50"
  },
  "businessCertFile": "(multipart file)",
  "hqProfile": {
    "brandName": "BBQ",
    "hqName": "ë¹„ë¹„í ë³¸ì‚¬"
  },
  "termsAgreed": true
}
```

### 2.3 ë³¸ì‚¬ ì§ì›(ADMIN) ê°€ìž… â€” 2ë‹¨ê³„

```
POST /registration/admin
```

**Body**
```json
{
  "loginId": "admin_lee",
  "password": "secureP@ss123",
  "name": "ì´ê´€ë¦¬",
  "email": "lee@metabeans.com"
}
```
- ADMIN ê³„ì •ì€ ë³„ë„ ìŠ¹ì¸ í”„ë¡œì„¸ìŠ¤ (ê¸°ì¡´ ADMINì´ ì§ì ‘ ìƒì„± ë˜ëŠ” íŠ¹ìˆ˜ ì´ˆëŒ€ì½”ë“œ)

### 2.4 ëŒ€ë¦¬ì (DEALER) ê°€ìž… â€” 6ë‹¨ê³„

```
POST /registration/dealer
```

**Body**
```json
{
  "account": {
    "loginId": "dealer_park",
    "password": "secureP@ss123",
    "name": "ë°•ê¸°ì‚¬",
    "phone": "010-5555-1234",
    "email": "park@dealer.com"
  },
  "business": {
    "businessName": "ì„œìš¸í™˜ê²½ì„¤ë¹„",
    "businessNumber": "456-78-90123",
    "address": "ì„œìš¸ì‹œ ì˜ë“±í¬êµ¬ ë‹¹ì‚°ë™ 100"
  },
  "businessCertFile": "(multipart file)",
  "dealerProfile": {
    "serviceRegions": ["ì„œìš¸ ë™ë¶€", "ì„œìš¸ ì„œë¶€", "ê²½ê¸° ë™ë¶€"],
    "specialties": {
      "newInstall": true,
      "repair": true,
      "cleaning": false,
      "transport": true,
      "inspection": false
    }
  },
  "termsAgreed": true
}
```

### 2.5 ì‚¬ì—…ìžë“±ë¡ë²ˆí˜¸ ê²€ì¦

```
GET /registration/check-business-number?number=123-45-67890
```

### 2.6 í”„ëžœì°¨ì´ì¦ˆ ë³¸ì‚¬ ëª©ë¡ (ê°€ìž… ì‹œ ì„ íƒìš©)

```
GET /registration/hq-list
```

**Response 200**
```json
{
  "success": true,
  "data": [
    { "hqId": 3, "brandName": "BBQ", "hqName": "ë¹„ë¹„í ë³¸ì‚¬" },
    { "hqId": 7, "brandName": "êµì´Œ", "hqName": "êµì´Œì—í”„ì•¤ë¹„" }
  ]
}
```

### 2.7 ëŒ€ë¦¬ì  ëª©ë¡ (ê°€ìž… ì‹œ ì„ íƒìš©)

```
GET /registration/dealer-list?region=ì„œìš¸ ë™ë¶€
```

---

## 3. ëŒ€ì‹œë³´ë“œ (Dashboard)

> **í™”ë©´**: ESP_ë§¤ìž¥ë³¸ì‚¬_ëŒ€ì‹œë³´ë“œ.html (ì—­í• ë³„ ê³µìœ  ë ˆì´ì•„ì›ƒ)

### 3.1 ëŒ€ì‹œë³´ë“œ ìš”ì•½ í†µê³„

```
GET /dashboard/summary
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Response 200** â€” ì—­í• ì— ë”°ë¼ ìžë™ í•„í„°ë§
```json
{
  "success": true,
  "data": {
    "storeCount": 45,
    "activeEquipmentCount": 120,
    "offlineEquipmentCount": 3,
    "asRequestPending": 5,
    "asRequestInProgress": 2,
    "criticalAlarmCount": 1,
    "warningAlarmCount": 8
  }
}
```
- `OWNER`: ë³¸ì¸ ë§¤ìž¥ë§Œ (storeCountëŠ” í•­ìƒ 1)
- `HQ`: ê´€í•  ê°€ë§¹ì ë§Œ
- `DEALER`: ê´€í•  ë§¤ìž¥ë§Œ
- `ADMIN`: ì „ì²´

### 3.2 ì‹¤ì‹œê°„ ë°œìƒ ì´ìŠˆ ëª©ë¡

```
GET /dashboard/issues
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Query Parameters**
| íŒŒë¼ë¯¸í„° | íƒ€ìž… | ì„¤ëª… |
|---------|------|------|
| `severity` | string | `WARNING` \| `CRITICAL` \| ë¯¸ì§€ì •=ì „ì²´ |
| `storeId` | number | íŠ¹ì • ë§¤ìž¥ í•„í„° |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "issueId": 1001,
      "storeId": 101,
      "storeName": "ê¹€ë„¤ì‹ë‹¹ ë³¸ì ",
      "equipmentId": 201,
      "equipmentName": "ESP-001",
      "controllerId": 301,
      "controllerName": "PP-001",
      "issueType": "INLET_TEMP_HIGH",
      "severity": "CRITICAL",
      "currentValue": 105.2,
      "thresholdValue": 100,
      "unit": "Â°C",
      "message": "ìœ ìž… ì˜¨ë„ ì´ìƒ â€” 100Â°C ì´ìƒ",
      "occurredAt": "2026-02-13T09:25:00Z",
      "isResolved": false
    }
  ]
}
```

**ì´ìŠˆ íƒ€ìž… (í”¼ë“œë°± p.33~34)**:

| issueType | ì„¤ëª… | Yellow ì¡°ê±´ | Red ì¡°ê±´ |
|-----------|------|------------|---------|
| `COMM_DISCONNECTED` | í†µì‹  ì—°ê²° ìƒíƒœ ì ê²€ | ëŠê¹€ 1ì‹œê°„ ì´ìƒ | ëŠê¹€ í•˜ë£¨ ì´ìƒ |
| `INLET_TEMP_HIGH` | ìœ ìž… ì˜¨ë„ ì´ìƒ | 70Â°C ì´ìƒ | 100Â°C ì´ìƒ |
| `FILTER_CHECK_NEEDED` | í•„í„° ì²­ì†Œ ìƒíƒœ ì ê²€ | ì ê²€ í•„ìš” | â€” |
| `DUST_REMOVAL_LOW` | ë¨¼ì§€ì œê±° ì„±ëŠ¥ ì ê²€ | â€” | ì ê²€ í•„ìš” |

### 3.3 ê¸´ê¸‰ ì•ŒëžŒ ì¡°íšŒ

```
GET /dashboard/alarms
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```
- Red(CRITICAL)ë§Œ ë°˜í™˜ + ì´ë©”ì¼ ë°œì†¡ ì—¬ë¶€ í¬í•¨

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "alarmId": 5001,
      "storeId": 101,
      "storeName": "ê¹€ë„¤ì‹ë‹¹ ë³¸ì ",
      "issueType": "INLET_TEMP_HIGH",
      "severity": "CRITICAL",
      "currentValue": 105.2,
      "occurredAt": "2026-02-13T09:25:00Z",
      "emailSentAt": "2026-02-13T09:25:05Z",
      "emailRecipients": ["admin@metabeans.com"]
    }
  ]
}
```

### 3.4 ì‹¤ë‚´ ê³µê¸°ì§ˆ(IAQ) í˜„í™©

```
GET /dashboard/iaq?storeId=101
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Response 200** â€” í•´ë‹¹ ë§¤ìž¥ì˜ ìµœì‹  ê²Œì´íŠ¸ì›¨ì´ IAQ ë°ì´í„°
```json
{
  "success": true,
  "data": {
    "storeId": 101,
    "storeName": "ê¹€ë„¤ì‹ë‹¹ ë³¸ì ",
    "gateways": [
      {
        "gatewayId": 10,
        "gwDeviceId": "gw-001",
        "floorName": "1ì¸µ ì£¼ë°©",
        "iaq": {
          "pm1_0": 12.5,
          "pm2_5": 25.0,
          "pm4_0": 30.0,
          "pm10": 35.0,
          "temperature": 24.5,
          "humidity": 65.0,
          "vocIndex": 100,
          "noxIndex": 50,
          "co2": 450,
          "o3": 25,
          "co": 1.2,
          "hcho": 30
        },
        "status": "GOOD",
        "updatedAt": "2026-02-13T09:30:00Z"
      }
    ]
  }
}
```

### 3.5 ì‹¤ì™¸ ëŒ€ê¸°ì§ˆ ì¡°íšŒ

```
GET /dashboard/outdoor-air?storeId=101
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```
- Airkorea API ìºì‹œ ë°ì´í„° (1ì‹œê°„ ê°„ê²© ê°±ì‹ )

**Response 200**
```json
{
  "success": true,
  "data": {
    "stationName": "ê°•ë‚¨êµ¬",
    "pm10": 45.0,
    "pm2_5": 22.0,
    "o3": 0.035,
    "co": 0.5,
    "no2": 0.025,
    "so2": 0.003,
    "overallIndex": 75,
    "grade": "ë³´í†µ",
    "measuredAt": "2026-02-13T09:00:00Z"
  }
}
```

### 3.6 ë§¤ìž¥ íŠ¸ë¦¬ ë°ì´í„° (ì‚¬ì´ë“œë°”)

```
GET /dashboard/store-tree
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Response 200** â€” ì—­í• ì— ë”°ë¼ ìžë™ í•„í„°ë§
```json
{
  "success": true,
  "data": [
    {
      "storeId": 101,
      "storeName": "ê¹€ë„¤ì‹ë‹¹ ë³¸ì ",
      "status": "WARNING",
      "floors": [
        {
          "floorId": 1001,
          "floorCode": "1F",
          "floorName": "1ì¸µ ì£¼ë°©",
          "gateway": {
            "gatewayId": 10,
            "gwDeviceId": "gw-001",
            "connectionStatus": "ONLINE",
            "status": "GOOD"
          },
          "equipments": [
            {
              "equipmentId": 201,
              "equipmentName": "ESP-001",
              "status": "WARNING",
              "connectionStatus": "ONLINE",
              "controllers": [
                {
                  "controllerId": 301,
                  "ctrlDeviceId": "ctrl-001",
                  "status": "WARNING",
                  "connectionStatus": "ONLINE"
                },
                {
                  "controllerId": 302,
                  "ctrlDeviceId": "ctrl-002",
                  "status": "GOOD",
                  "connectionStatus": "ONLINE"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**ìƒíƒœ ì „íŒŒ ê·œì¹™** (í”¼ë“œë°± p.27):
- Controller â†’ Equipment â†’ Floor/Gateway â†’ Store ìˆœìœ¼ë¡œ í•˜ìœ„ ì¤‘ ìµœê³  ìœ„í—˜ë„ ì „íŒŒ
- ë¬¸ì œ ì—†ìœ¼ë©´ `GOOD` + "ì •ìƒ ìš´ì˜", ë¬¸ì œ ìžˆìœ¼ë©´ í•´ë‹¹ ìƒ‰ìƒ + "ë¬¸ì œ ë°œìƒ"

---

## 4. ìž¥ë¹„ ê´€ë¦¬ (Equipment)

> **í™”ë©´**: ESP_ê´€ë¦¬ìž_ìž¥ë¹„ê´€ë¦¬.html (5ê°œ íƒ­)

### 4.1 ìž¥ë¹„ ëª©ë¡ ì¡°íšŒ

```
GET /equipment
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL (ë²”ìœ„ ìžë™ í•„í„°)
```

**Query Parameters**
| íŒŒë¼ë¯¸í„° | íƒ€ìž… | ì„¤ëª… |
|---------|------|------|
| `storeId` | number | ë§¤ìž¥ í•„í„° |
| `floorId` | number | ì¸µ í•„í„° |
| `status` | string | `NORMAL` \| `INSPECTION` \| `CLEANING` \| `INACTIVE` |
| `connectionStatus` | string | `ONLINE` \| `OFFLINE` |
| `search` | string | ìž¥ë¹„ëª…, ì‹œë¦¬ì–¼ ê²€ìƒ‰ |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "equipmentId": 201,
      "equipmentSerial": "MB-ESP-2024-00001",
      "mqttEquipmentId": "esp-001",
      "storeName": "ê¹€ë„¤ì‹ë‹¹ ë³¸ì ",
      "floorName": "1ì¸µ ì£¼ë°©",
      "equipmentName": "ESP-001",
      "modelName": "MB-ESP-5000",
      "cellType": "SUS304 í‰íŒí˜•",
      "powerpackCount": 2,
      "purchaseDate": "2025-06-15",
      "warrantyEndDate": "2027-06-14",
      "dealerName": "ì„œìš¸í™˜ê²½ì„¤ë¹„",
      "status": "NORMAL",
      "connectionStatus": "ONLINE",
      "lastSeenAt": "2026-02-13T09:30:00Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "totalCount": 45, "totalPages": 3 }
}
```

### 4.2 ìž¥ë¹„ ìƒì„¸ ì¡°íšŒ

```
GET /equipment/:equipmentId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "equipmentId": 201,
    "equipmentSerial": "MB-ESP-2024-00001",
    "mqttEquipmentId": "esp-001",
    "store": { "storeId": 101, "storeName": "ê¹€ë„¤ì‹ë‹¹ ë³¸ì ", "siteId": "site-001" },
    "floor": { "floorId": 1001, "floorCode": "1F", "floorName": "1ì¸µ ì£¼ë°©" },
    "equipmentName": "ESP-001",
    "model": { "modelId": 1, "modelName": "MB-ESP-5000", "manufacturer": "MetaBeans" },
    "cellType": "SUS304 í‰íŒí˜•",
    "powerpackCount": 2,
    "purchaseDate": "2025-06-15",
    "warrantyEndDate": "2027-06-14",
    "dealer": { "dealerId": 5, "dealerName": "ì„œìš¸í™˜ê²½ì„¤ë¹„" },
    "status": "NORMAL",
    "connectionStatus": "ONLINE",
    "lastSeenAt": "2026-02-13T09:30:00Z",
    "gateway": {
      "gatewayId": 10,
      "gwDeviceId": "gw-001",
      "connectionStatus": "ONLINE",
      "statusFlags": 63,
      "controllerCount": 2
    },
    "controllers": [
      {
        "controllerId": 301,
        "ctrlDeviceId": "ctrl-001",
        "connectionStatus": "ONLINE",
        "statusFlags": 63,
        "lastSeenAt": "2026-02-13T09:30:00Z"
      },
      {
        "controllerId": 302,
        "ctrlDeviceId": "ctrl-002",
        "connectionStatus": "ONLINE",
        "statusFlags": 63,
        "lastSeenAt": "2026-02-13T09:30:00Z"
      }
    ],
    "cleaningThreshold": {
      "sparkThreshold": 30,
      "sparkTimeWindow": 60,
      "pressureBase": 200,
      "pressureRate": 1.5
    },
    "consumableSchedules": [
      { "partName": "SUS í•„í„°", "intervalDays": 90, "lastReplacedAt": "2025-12-01", "nextDueAt": "2026-03-01" }
    ],
    "registeredBy": { "userId": 5, "name": "ë°•ê¸°ì‚¬" },
    "createdAt": "2025-06-15T10:00:00Z",
    "updatedAt": "2026-01-20T14:30:00Z"
  }
}
```

### 4.3 ìž¥ë¹„ ë“±ë¡

```
POST /equipment
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN, DEALER
```

**Body**
```json
{
  "equipmentSerial": "MB-ESP-2024-00099",
  "mqttEquipmentId": "esp-099",
  "storeId": 101,
  "floorId": 1001,
  "equipmentName": "ESP-099",
  "modelId": 1,
  "cellType": "SUS304 í‰íŒí˜•",
  "powerpackCount": 2,
  "purchaseDate": "2026-02-13",
  "warrantyEndDate": "2028-02-12",
  "dealerId": 5,
  "controllers": [
    { "ctrlDeviceId": "ctrl-001", "gatewayId": 10 },
    { "ctrlDeviceId": "ctrl-002", "gatewayId": 10 }
  ]
}
```

**ë¹„ì¦ˆë‹ˆìŠ¤ ê·œì¹™**:
- `powerpackCount` â‰¤ 4 (í”¼ë“œë°± p.50)
- ìž¥ë¹„ë‹¹ EquipmentëŠ” ì¸µë‹¹ ìµœëŒ€ 5ëŒ€ (MQTT ê·œê²©)
- `cellType`ì€ ìžìœ  ìž…ë ¥ (í”¼ë“œë°± p.36 â€” ë“œë¡­ë‹¤ìš´ ì œê±°)

### 4.4 ìž¥ë¹„ ì •ë³´ ìˆ˜ì •

```
PUT /equipment/:equipmentId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN, DEALER
```

### 4.5 ìž¥ë¹„ ì‚­ì œ

```
DELETE /equipment/:equipmentId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN, DEALER
```

### 4.6 ìž¥ë¹„ ëª¨ë¸ ëª©ë¡ (ë“œë¡­ë‹¤ìš´ìš©)

```
GET /equipment/models
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Response 200**
```json
{
  "success": true,
  "data": [
    { "modelId": 1, "modelName": "MB-ESP-5000", "manufacturer": "MetaBeans", "isActive": true },
    { "modelId": 2, "modelName": "MB-ESP-3000", "manufacturer": "MetaBeans", "isActive": true }
  ]
}
```

---

## 5. ì‹¤ì‹œê°„ ëª¨ë‹ˆí„°ë§ (Monitoring)

> **í™”ë©´**: ESP_ê´€ë¦¬ìž_ìž¥ë¹„ê´€ë¦¬.html â€” íƒ­2: ì‹¤ì‹œê°„ ëª¨ë‹ˆí„°ë§

### 5.1 ìž¥ë¹„ ìµœì‹  ì„¼ì„œ ë°ì´í„° ì¡°íšŒ

```
GET /monitoring/equipment/:equipmentId/latest
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Response 200** â€” MQTT sensor ë©”ì‹œì§€ì—ì„œ íŒŒì‹±í•˜ì—¬ DBì— ì €ìž¥ëœ ìµœì‹  ë°ì´í„°
```json
{
  "success": true,
  "data": {
    "equipmentId": 201,
    "equipmentName": "ESP-001",
    "connectionStatus": "ONLINE",
    "lastSeenAt": "2026-02-13T09:30:00Z",
    "controllers": [
      {
        "controllerId": 301,
        "ctrlDeviceId": "ctrl-001",
        "timestamp": "2026-02-13T09:29:55Z",
        "connectionStatus": "ONLINE",
        "sensorData": {
          "pm2_5": 25.0,
          "pm10": 35.0,
          "diffPressure": 12.0,
          "oilLevel": 50.0,
          "ppTemp": 45,
          "ppSpark": 0,
          "ppPower": 1,
          "ppAlarm": 0,
          "fanSpeed": 2,
          "fanMode": 0,
          "damperMode": 0,
          "flow": 850.0,
          "damper": 75.0,
          "inletTemp": 22.5,
          "velocity": 8.3,
          "ductDp": 245.0,
          "statusFlags": 63
        },
        "statusDetails": {
          "powerpackComm": true,
          "pm25Sensor": true,
          "pressureSensor": true,
          "levelSensor": true,
          "damperController": true,
          "inverter": true
        },
        "alerts": {
          "filterCheckStatus": "GOOD",
          "dustRemovalPerformance": "GOOD",
          "inletTempStatus": "GOOD",
          "commStatus": "GOOD"
        }
      }
    ]
  }
}
```

### 5.2 ì„¼ì„œ ì´ë ¥ ë°ì´í„° (ì°¨íŠ¸ìš©)

```
GET /monitoring/equipment/:equipmentId/history
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Query Parameters**
| íŒŒë¼ë¯¸í„° | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|---------|------|------|------|
| `controllerId` | number | âœ… | ì»¨íŠ¸ë¡¤ëŸ¬ ID |
| `metrics` | string | âœ… | ì¡°íšŒí•  ì§€í‘œ (ì‰¼í‘œ êµ¬ë¶„). ì˜ˆ: `ppTemp,ppSpark,pm2_5` |
| `from` | string | âœ… | ì‹œìž‘ ì‹œê°„ (ISO 8601) |
| `to` | string | âœ… | ì¢…ë£Œ ì‹œê°„ (ISO 8601) |
| `interval` | string | - | ì§‘ê³„ ê°„ê²©: `raw` (10ì´ˆ, ê¸°ë³¸) \| `1m` \| `5m` \| `1h` \| `1d` |

**Response 200**
```json
{
  "success": true,
  "data": {
    "controllerId": 301,
    "interval": "1m",
    "metrics": ["ppTemp", "ppSpark"],
    "dataPoints": [
      { "timestamp": "2026-02-13T09:00:00Z", "ppTemp": 44, "ppSpark": 0 },
      { "timestamp": "2026-02-13T09:01:00Z", "ppTemp": 45, "ppSpark": 2 },
      { "timestamp": "2026-02-13T09:02:00Z", "ppTemp": 45, "ppSpark": 0 }
    ]
  }
}
```

**ë¹„ì¦ˆë‹ˆìŠ¤ ê·œì¹™**:
- `raw` (10ì´ˆ ì›ë³¸): ìµœê·¼ 90ì¼ê¹Œì§€ë§Œ ì¡°íšŒ ê°€ëŠ¥
- 90ì¼ ì´ì „ ë°ì´í„°: 1ì‹œê°„ ì§‘ê³„ë³¸ë§Œ ì œê³µ (5ë…„ ë³´ê´€)
- EChartsì˜ `dataZoom` (í™•ëŒ€/ì¶•ì†Œ) ì§€ì›ì„ ìœ„í•´ ì¶©ë¶„í•œ ë°ì´í„°í¬ì¸íŠ¸ ë°˜í™˜

### 5.3 ê²Œì´íŠ¸ì›¨ì´ IAQ ì´ë ¥ ë°ì´í„°

```
GET /monitoring/gateway/:gatewayId/iaq-history
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Query Parameters**: 5.2ì™€ ë™ì¼ êµ¬ì¡° (`metrics` ì˜ˆ: `pm2_5,co2,temperature,humidity`)

### 5.4 ìž¥ë¹„ ì´ë ¥ (A/S + ì²­ì†Œ + ì œì–´ í†µí•©)

```
GET /monitoring/equipment/:equipmentId/history-log
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Query Parameters**
| íŒŒë¼ë¯¸í„° | íƒ€ìž… | ì„¤ëª… |
|---------|------|------|
| `type` | string | `ALL` \| `AS` \| `CLEANING` \| `CONTROL` \| `ALARM` |
| `from` | string | ì‹œìž‘ì¼ |
| `to` | string | ì¢…ë£Œì¼ |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "historyId": 8001,
      "type": "ALARM",
      "title": "ìŠ¤íŒŒí¬ ê°ì§€ ì•ŒëžŒ",
      "description": "pp_spark ê°’ 45 â€” ê¸°ì¤€ê°’ 30 ì´ˆê³¼",
      "controllerId": 301,
      "controllerName": "PP-001",
      "occurredAt": "2026-02-10T15:30:00Z",
      "resolvedAt": "2026-02-10T15:35:00Z"
    },
    {
      "historyId": 8002,
      "type": "CONTROL",
      "title": "íŒŒì›ŒíŒ© ë¦¬ì…‹",
      "description": "ê´€ë¦¬ìž ì›ê²© ì œì–´ â€” íŒŒì›ŒíŒ© ë¦¬ì…‹ ì‹¤í–‰",
      "performedBy": "ì´ê´€ë¦¬",
      "occurredAt": "2026-02-10T15:36:00Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "totalCount": 15, "totalPages": 1 }
}
```

### 5.5 ESG ì§€í‘œ ì¡°íšŒ

```
GET /monitoring/equipment/:equipmentId/esg
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Query Parameters**: `from`, `to` (ê¸°ê°„)

**Response 200**
```json
{
  "success": true,
  "data": {
    "equipmentId": 201,
    "period": { "from": "2026-01-01", "to": "2026-02-13" },
    "oilCollected": 12.5,
    "oilCollectedUnit": "L",
    "dustReduced": 45.2,
    "dustReducedUnit": "kg",
    "co2Reduced": 120.0,
    "co2ReducedUnit": "kg",
    "operatingHours": 1560,
    "dailyMetrics": [
      { "date": "2026-02-12", "oilCollected": 0.3, "dustReduced": 1.2, "operatingHours": 12 }
    ]
  }
}
```

---

## 6. ìž¥ë¹„ ì œì–´ (Control)

> **í™”ë©´**: ESP_ê´€ë¦¬ìž_ìž¥ë¹„ê´€ë¦¬.html â€” íƒ­4: ìž¥ì¹˜ ì œì–´

### 6.1 ì œì–´ ëª…ë ¹ ì‹¤í–‰

```
POST /control/command
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN(ì „ì²´), DEALER(ì˜¤ë²„ë¼ì´ë“œ), HQ(ì˜¤ë²„ë¼ì´ë“œ), OWNER(ë³¸ì¸)
```

**Body**
```json
{
  "gatewayId": 10,
  "equipmentId": "esp-001",
  "controllerId": "ctrl-001",
  "target": 0,
  "action": 1,
  "value": 0
}
```

**target/action/value ì •ì˜** (MQTT ê·œê²© 260213):

| target | action | value | 설명 |
|--------|--------|-------|------|
| `0` (파워팩) | `0` | — | 파워팩 OFF |
| `0` (파워팩) | `1` | — | 파워팩 ON |
| `0` (파워팩) | `2` | — | 파워팩 리셋 |
| `1` (댐퍼) | `1` | 0-100 (int) | 댐퍼 개도율 설정 (%, 수동 모드) |
| `1` (댐퍼) | `2` | 0 또는 1 (int) | 🆕 제어 모드 전환 (0=수동, 1=자동) |
| `1` (댐퍼) | `3` | float (CMH) | 🆕 목표 풍량 설정 (자동 모드, 예: 850.0) |
| `2` (시로코팬) | `0` | — | 팬 OFF (수동) |
| `2` (시로코팬) | `1` | — | 팬 LOW (수동, 15Hz) |
| `2` (시로코팬) | `2` | — | 팬 MID (수동, 30Hz) |
| `2` (시로코팬) | `3` | — | 팬 HIGH (수동, 50Hz) |
| `2` (시로코팬) | `4` | 0 또는 1 (int) | 🆕 제어 모드 전환 (0=수동, 1=자동) |
| `2` (시로코팬) | `5` | float (m/s) | 🆕 목표 풍속 설정 (자동 모드, 예: 3.5) |

**ì¼ê´„ ì œì–´**:
- `equipmentId: "all"`, `controllerId: "all"` â†’ ê²Œì´íŠ¸ì›¨ì´ í•˜ìœ„ ì „ì²´
- `equipmentId: "esp-001"`, `controllerId: "all"` â†’ í•´ë‹¹ ì§‘ì§„ê¸° í•˜ìœ„ ì „ì²´

**자동 제어 동작 참고** (MQTT 규격 260213):
- **댐퍼 자동 제어**: target=1, action=2로 자동 모드 전환 후 action=3으로 목표 풍량(CMH) 설정. flo-OAC 하드웨어가 자체 PID로 댐퍼 개도를 자동 조절
- **팬 자동 제어**: target=2, action=4로 자동 모드 전환 후 action=5로 목표 풍속(m/s) 설정. M100 인버터 내장 PID가 자동으로 주파수를 가/감속
- **자동→수동 전환**: 모드 전환 명령(value=0) 또는 수동 명령(댐퍼 action=1, 팬 action=0~3) 전송 시 자동 모드 해제
- **안전 오버라이드**: 비상정지(ESTOP), 스파크 감지, 과온도 알람 발생 시 자동으로 수동 모드 전환 (센서 데이터의 `fanMode`, `damperMode` 필드가 0으로 변경)


**Response 200**
```json
{
  "success": true,
  "data": {
    "cmdId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "SENT",
    "message": "ì œì–´ ëª…ë ¹ì´ ì „ì†¡ë˜ì—ˆìŠµë‹ˆë‹¤."
  }
}
```

**ì„œë²„ ë‚´ë¶€ ë™ìž‘**:
1. REST API ìˆ˜ì‹  â†’ UUID cmd_id ìƒì„±
2. MQTT ë¸Œë¦¿ì§€ â†’ `metabeans/{site_id}/{floor_id}/gateway/{gw_id}/control` ë°œí–‰
3. Gateway ACK ìˆ˜ì‹  â†’ DB ì €ìž¥ + (ì„ íƒ) WebSocket/Pollingìœ¼ë¡œ í”„ë¡ íŠ¸ì—”ë“œ ì•Œë¦¼

### 6.2 ì œì–´ ëª…ë ¹ ê²°ê³¼ í™•ì¸

```
GET /control/command/:cmdId/status
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "cmdId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "SUCCESS",
    "result": "success",
    "reason": "",
    "sentAt": "2026-02-13T09:30:00Z",
    "ackedAt": "2026-02-13T09:30:02Z"
  }
}
```

**status ê°’**: `SENT` â†’ `SUCCESS` \| `FAILED` \| `TIMEOUT` (30ì´ˆ ë‚´ ACK ë¯¸ìˆ˜ì‹ )

### 6.3 ì œì–´ ì´ë ¥ ì¡°íšŒ

```
GET /control/history
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Query Parameters**
| íŒŒë¼ë¯¸í„° | íƒ€ìž… | ì„¤ëª… |
|---------|------|------|
| `equipmentId` | number | ìž¥ë¹„ í•„í„° |
| `controllerId` | number | ì»¨íŠ¸ë¡¤ëŸ¬ í•„í„° |
| `target` | number | 0=íŒŒì›ŒíŒ©, 1=ëŒí¼, 2=íŒ¬ |
| `from` | string | ì‹œìž‘ì¼ |
| `to` | string | ì¢…ë£Œì¼ |

### 6.4 ëŒí¼ ìžë™ì œì–´ ì„¤ì • ì¡°íšŒ/ìˆ˜ì •

```
GET /control/equipment/:equipmentId/damper-auto-settings
PUT /control/equipment/:equipmentId/damper-auto-settings
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```

**PUT Body**
```json
{
  "settings": [
    { "step": 0, "openRate": 0,   "description": "ì™„ì „ íì‡„" },
    { "step": 1, "openRate": 14,  "description": "ë‹¨ê³„ 1" },
    { "step": 2, "openRate": 28,  "description": "ë‹¨ê³„ 2" },
    { "step": 3, "openRate": 42,  "description": "ë‹¨ê³„ 3" },
    { "step": 4, "openRate": 57,  "description": "ë‹¨ê³„ 4" },
    { "step": 5, "openRate": 71,  "description": "ë‹¨ê³„ 5" },
    { "step": 6, "openRate": 85,  "description": "ë‹¨ê³„ 6" },
    { "step": 7, "openRate": 100, "description": "ì™„ì „ ê°œë°©" }
  ],
  "targetFlowCmh": 1200
}
```
- 8ë‹¨ê³„(0~7) ê°œë„ìœ¨ ë§¤í•‘ (í”¼ë“œë°± p.44~45)
- `targetFlowCmh`: ëª©í‘œ í’ëŸ‰ (ADMINë§Œ ì„¤ì • ê°€ëŠ¥, `CONTROL_FLOW_TARGET` ê¶Œí•œ)

### 6.5 팬 자동제어 설정 조회/수정

```
GET /control/equipment/:equipmentId/fan-auto-settings
PUT /control/equipment/:equipmentId/fan-auto-settings
🔒 인증 필요 | 역할: ADMIN
```

**PUT Body**
```json
{
  "targetVelocityMs": 8.5,
  "controllerId": "ctrl-001"
}
```
- `targetVelocityMs`: 목표 풍속 (m/s) — M100 인버터 내장 PID가 이 값을 기준으로 팬 속도 자동 조절
- `controllerId`: 대상 컨트롤러 ID (개별 설정)

### 6.6 게이트웨이 원격 설정 (Config)

> **MQTT config 토픽 기반** (260213 신규)

```
POST /control/gateway/:gatewayId/config
🔒 인증 필요 | 역할: ADMIN
```

**Body**
```json
{
  "sensorIntervalMs": 5000,
  "mqttIntervalMs": 10000,
  "siteId": "site-001",
  "floorId": "1F",
  "gatewayId": "gw-002",
  "mqttBrokerUri": "mqtts://new-broker.example.com:8883",
  "wifiSsid": "NewNetwork",
  "wifiPassword": "newpass123",
  "reboot": false
}
```

| 필드 | 타입 | 필수 | 설명 | 재부팅 |
|------|------|------|------|--------|
| `sensorIntervalMs` | int | 선택 | 센서 폴링 주기 (ms, 1000~60000, 기본 5000) | 불필요 |
| `mqttIntervalMs` | int | 선택 | MQTT 발행 주기 (ms, 5000~60000, 기본 10000) | 불필요 |
| `siteId` | string | 선택 | 매장 ID 변경 | 필요 |
| `floorId` | string | 선택 | 층 ID 변경 | 필요 |
| `gatewayId` | string | 선택 | 게이트웨이 ID 변경 | 필요 |
| `mqttBrokerUri` | string | 선택 | MQTT 브로커 URI | 필요 |
| `wifiSsid` | string | 선택 | Wi-Fi SSID | 필요 |
| `wifiPassword` | string | 선택 | Wi-Fi 비밀번호 | 필요 |
| `reboot` | bool | 선택 | true 시 즉시 재부팅 | — |

**Response 200**
```json
{
  "success": true,
  "data": {
    "cmdId": "550e8400-e29b-41d4-a716-446655440002",
    "status": "SENT",
    "message": "설정 변경 명령이 전송되었습니다."
  }
}
```

**서버 내부 동작**:
1. REST API 수신 → UUID cmd_id 생성
2. MQTT 브릿지 → `metabeans/{site_id}/{floor_id}/gateway/{gw_id}/config` 발행
3. Gateway config/ack 수신 → DB 저장 + 프론트엔드 알림
4. `needs_reboot: true`인 경우 게이트웨이가 자동 재부팅 수행

**비즈니스 규칙**:
- 부분 업데이트(partial update) 지원: 포함된 필드만 변경
- 재부팅 필요 필드 변경 시 ACK 후 1초 대기 → 자동 재부팅
- `sensorIntervalMs`, `mqttIntervalMs`는 유효성 검증 실패 시 에러 반환

### 6.7 게이트웨이 설정 변경 결과 확인

```
GET /control/gateway-config/:cmdId/status
🔒 인증 필요 | 역할: ADMIN
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "cmdId": "550e8400-e29b-41d4-a716-446655440002",
    "status": "SUCCESS",
    "result": "success",
    "reason": "",
    "needsReboot": true,
    "sentAt": "2026-02-13T09:30:00Z",
    "ackedAt": "2026-02-13T09:30:02Z"
  }
}
```

---

## 7. A/S ê´€ë¦¬ (After-Service)

> **í™”ë©´**: ESP_ê´€ë¦¬ìž_ASê´€ë¦¬.html (4ê°œ íƒ­: ì•Œë¦¼í˜„í™©, ì ‘ìˆ˜/ì‹ ì²­, ì²˜ë¦¬í˜„í™©, ì™„ë£Œë³´ê³ ì„œ)

### 7.1 A/S ì ‘ìˆ˜ ì‹ ì²­

```
POST /as-service/requests
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN, OWNER
```

**Body** (multipart/form-data)
```json
{
  "storeId": 101,
  "equipmentId": 201,
  "urgency": "HIGH",
  "faultType": "NOISE",
  "symptom": "ì§‘ì§„ê¸° ê°€ë™ ì‹œ ë¹„ì •ìƒ ì†ŒìŒ ë°œìƒ",
  "requestedVisitDate": "2026-02-15",
  "requestedVisitTime": "14:00",
  "contactName": "ê¹€ì ì£¼",
  "contactPhone": "010-1234-5678",
  "attachments": ["(file1)", "(file2)"]
}
```

**urgency**: `HIGH`(ê¸´ê¸‰) \| `NORMAL`(ì¼ë°˜)  
**faultType**: `NOISE`(ì†ŒìŒ) \| `POWER`(ì „ì›) \| `DUST`(ë¨¼ì§€ë°°ì¶œ) \| `OIL`(ì˜¤ì¼ëˆ„ì¶œ) \| `SPARK`(ìŠ¤íŒŒí¬) \| `OTHER`(ê¸°íƒ€)

**Response 201**
```json
{
  "success": true,
  "data": {
    "requestId": 9001,
    "status": "PENDING",
    "assignedDealerId": 5,
    "assignedDealerName": "ì„œìš¸í™˜ê²½ì„¤ë¹„",
    "message": "A/S ì ‘ìˆ˜ê°€ ì™„ë£Œë˜ì—ˆìŠµë‹ˆë‹¤."
  }
}
```

**ë¹„ì¦ˆë‹ˆìŠ¤ ê·œì¹™**: ë§¤ìž¥ì˜ `dealer_id` ê¸°ë°˜ ìžë™ ëŒ€ë¦¬ì  ë°°ì •

### 7.2 A/S ìš”ì²­ ëª©ë¡ ì¡°íšŒ

```
GET /as-service/requests
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Query Parameters**
| íŒŒë¼ë¯¸í„° | íƒ€ìž… | ì„¤ëª… |
|---------|------|------|
| `status` | string | `PENDING` \| `ASSIGNED` \| `IN_PROGRESS` \| `COMPLETED` \| `CANCELLED` |
| `urgency` | string | `HIGH` \| `NORMAL` |
| `storeId` | number | ë§¤ìž¥ í•„í„° |
| `from`, `to` | string | ë‚ ì§œ ë²”ìœ„ |

### 7.3 A/S ìš”ì²­ ìƒì„¸ ì¡°íšŒ

```
GET /as-service/requests/:requestId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "requestId": 9001,
    "store": { "storeId": 101, "storeName": "ê¹€ë„¤ì‹ë‹¹ ë³¸ì " },
    "equipment": { "equipmentId": 201, "equipmentName": "ESP-001" },
    "urgency": "HIGH",
    "faultType": "NOISE",
    "symptom": "ì§‘ì§„ê¸° ê°€ë™ ì‹œ ë¹„ì •ìƒ ì†ŒìŒ ë°œìƒ",
    "requestedVisitDate": "2026-02-15",
    "requestedVisitTime": "14:00",
    "contactName": "ê¹€ì ì£¼",
    "contactPhone": "010-1234-5678",
    "status": "IN_PROGRESS",
    "assignedDealer": { "dealerId": 5, "dealerName": "ì„œìš¸í™˜ê²½ì„¤ë¹„" },
    "attachments": [
      { "attachmentId": 1, "fileName": "photo1.jpg", "fileUrl": "/files/as/9001/photo1.jpg" }
    ],
    "report": null,
    "createdAt": "2026-02-13T10:00:00Z",
    "updatedAt": "2026-02-14T09:00:00Z"
  }
}
```

### 7.4 A/S ìƒíƒœ ë³€ê²½ (ëŒ€ë¦¬ì  ì ‘ìˆ˜/ì²˜ë¦¬)

```
PATCH /as-service/requests/:requestId/status
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN, DEALER
```

**Body**
```json
{
  "status": "IN_PROGRESS",
  "memo": "í˜„ìž¥ ë°©ë¬¸ ì˜ˆì •"
}
```

### 7.5 A/S ì™„ë£Œ ë³´ê³ ì„œ ìž‘ì„±

```
POST /as-service/requests/:requestId/report
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN, DEALER
```

**Body** (multipart/form-data)
```json
{
  "visitDate": "2026-02-15",
  "repairType": "REPAIR",
  "repairDetail": "íŒ¬ ëª¨í„° ë² ì–´ë§ êµì²´, ì§„ë™ ì œê±° í™•ì¸",
  "replacedParts": [
    { "partName": "íŒ¬ ëª¨í„° ë² ì–´ë§", "unitPrice": 25000, "quantity": 2 }
  ],
  "totalPartsCost": 50000,
  "laborCost": 80000,
  "totalCost": 130000,
  "result": "COMPLETED",
  "remarks": "3ê°œì›” í›„ ìž¬ì ê²€ ê¶Œìž¥",
  "attachments": ["(before_photo)", "(after_photo)"]
}
```

**ë¹„ì¦ˆë‹ˆìŠ¤ ê·œì¹™** (í”¼ë“œë°± p.56, p.59):
- `replacedParts` â€” êµì²´ ë¶€í’ˆ ìƒì„¸ (í’ˆëª…/ê°€ê²©/ìˆ˜ëŸ‰) í•„ìˆ˜
- `totalPartsCost` â€” ì´ì „ `cost` í•„ë“œì—ì„œ ë³€ê²½ (í”¼ë“œë°± p.59)
- ë³´ê³ ì„œ ìž‘ì„± ì‹œ ìžë™ìœ¼ë¡œ ìš”ì²­ ìƒíƒœ `COMPLETED`ë¡œ ë³€ê²½

### 7.6 A/S ì™„ë£Œ ë³´ê³ ì„œ ì¡°íšŒ

```
GET /as-service/requests/:requestId/report
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

### 7.7 ì•Œë¦¼ í˜„í™© (A/S ê´€ë ¨ ì•ŒëžŒ ì´ë²¤íŠ¸)

```
GET /as-service/alerts
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Query Parameters**
| íŒŒë¼ë¯¸í„° | íƒ€ìž… | ì„¤ëª… |
|---------|------|------|
| `severity` | string | `WARNING` \| `CRITICAL` |
| `isResolved` | boolean | í•´ê²° ì—¬ë¶€ |
| `storeId` | number | ë§¤ìž¥ í•„í„° |

---

## 8. ê³ ê° í˜„í™© (Customer)

> **í™”ë©´**: ESP_ê´€ë¦¬ìž_ê³ ê°í˜„í™©.html (ì§€ë„ + ëª©ë¡ + íŽ¸ì§‘ íŒì—…)

### 8.1 ë§¤ìž¥(ê³ ê°) ëª©ë¡ ì¡°íšŒ

```
GET /customers/stores
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN, DEALER, HQ
```

**Query Parameters**
| íŒŒë¼ë¯¸í„° | íƒ€ìž… | ì„¤ëª… |
|---------|------|------|
| `status` | string | `ACTIVE` \| `INACTIVE` \| `PENDING` |
| `region` | string | ì§€ì—­ í•„í„° (ì˜ˆ: "ì„œìš¸", "ê²½ê¸°") |
| `hqId` | number | í”„ëžœì°¨ì´ì¦ˆ ë³¸ì‚¬ í•„í„° |
| `dealerId` | number | ëŒ€ë¦¬ì  í•„í„° |
| `search` | string | ë§¤ìž¥ëª…, ì£¼ì†Œ ê²€ìƒ‰ |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "storeId": 101,
      "siteId": "site-001",
      "storeName": "ê¹€ë„¤ì‹ë‹¹ ë³¸ì ",
      "brandName": "BBQ",
      "businessType": "íŠ€ê¹€",
      "address": "ì„œìš¸ì‹œ ê°•ë‚¨êµ¬ ì—­ì‚¼ë™ 123-4",
      "latitude": 37.5012,
      "longitude": 127.0396,
      "ownerName": "ê¹€ì ì£¼",
      "dealerName": "ì„œìš¸í™˜ê²½ì„¤ë¹„",
      "hqName": "ë¹„ë¹„í ë³¸ì‚¬",
      "status": "ACTIVE",
      "equipmentCount": 2,
      "floorCount": 1,
      "createdAt": "2025-06-15T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "totalCount": 45, "totalPages": 3 }
}
```

### 8.2 ë§¤ìž¥(ê³ ê°) ìƒì„¸ ì¡°íšŒ

```
GET /customers/stores/:storeId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN, DEALER, HQ
```

### 8.3 ë§¤ìž¥ ì •ë³´ ìˆ˜ì •

```
PUT /customers/stores/:storeId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN, DEALER(ê´€í• ), OWNER(ë³¸ì¸ â€” ìˆ˜ì •ë§Œ)
```

**Body**
```json
{
  "storeName": "ê¹€ë„¤ì‹ë‹¹ ì—­ì‚¼ì ",
  "businessType": "íŠ€ê¹€",
  "address": "ì„œìš¸ì‹œ ê°•ë‚¨êµ¬ ì—­ì‚¼ë™ 123-4",
  "latitude": 37.5012,
  "longitude": 127.0396,
  "contactName": "ê¹€ì ì£¼",
  "contactPhone": "010-1234-5678",
  "dealerId": 5,
  "hqId": 3,
  "status": "ACTIVE"
}
```

**ë¹„ì¦ˆë‹ˆìŠ¤ ê·œì¹™**: HQ ì†Œì† ë§¤ìž¥ì—ëŠ” `dealerId` ë¯¸í• ë‹¹ (hqIdê°€ ìžˆìœ¼ë©´ dealerId = null)

### 8.4 ë§¤ìž¥ ë“±ë¡ (ì‹ ê·œ)

```
POST /customers/stores
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN, DEALER, OWNER
```

### 8.5 ë§¤ìž¥ ì§€ë„ìš© ì „ì²´ ì¢Œí‘œ ì¡°íšŒ

```
GET /customers/stores/map
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN, DEALER, HQ
```
- ì§€ë„ ë§ˆì»¤ìš© ê²½ëŸ‰ ë°ì´í„° (storeId, storeName, latitude, longitude, status)

### 8.6 ë§¤ìž¥ ì¸µ(Floor) ê´€ë¦¬

```
GET    /customers/stores/:storeId/floors
POST   /customers/stores/:storeId/floors
PUT    /customers/stores/:storeId/floors/:floorId
DELETE /customers/stores/:storeId/floors/:floorId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN, DEALER
```

---

## 9. ì‹œìŠ¤í…œ ê´€ë¦¬ (System)

> **í™”ë©´**: ESP_ì‹œìŠ¤í…œê´€ë¦¬.html (4ê°œ íƒ­: ê¶Œí•œê´€ë¦¬, ê°€ìž…ìŠ¹ì¸, ì‚¬ìš©ìžê´€ë¦¬, ê¸°ì¤€ìˆ˜ì¹˜ê´€ë¦¬)  
> **ì—­í• **: ADMIN ì „ìš©

### 9.1 ê¶Œí•œ ê´€ë¦¬

#### 9.1.1 ì—­í• ë³„ ê¶Œí•œ ë§¤íŠ¸ë¦­ìŠ¤ ì¡°íšŒ

```
GET /system/permissions
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "featureCodes": [
      {
        "featureCode": "DASHBOARD_STORE_COUNT",
        "featureName": "ê°€ë§¹ì  ìˆ˜ ì¡°íšŒ",
        "category": "ëŒ€ì‹œë³´ë“œ",
        "permissions": {
          "ADMIN": true,
          "DEALER": true,
          "HQ": true,
          "OWNER": false
        }
      },
      {
        "featureCode": "CONTROL_POWER",
        "featureName": "ì „ì› ì œì–´",
        "category": "ìž¥ë¹„ ì œì–´",
        "permissions": {
          "ADMIN": true,
          "DEALER": "OVERRIDE",
          "HQ": "OVERRIDE",
          "OWNER": true
        }
      }
    ]
  }
}
```

#### 9.1.2 ì—­í• ë³„ ê¶Œí•œ ìˆ˜ì •

```
PUT /system/permissions
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```

**Body**
```json
{
  "changes": [
    { "role": "DEALER", "featureCode": "CONTROL_POWER", "isAllowed": true },
    { "role": "HQ", "featureCode": "CONTROL_FAN", "isAllowed": false }
  ]
}
```

#### 9.1.3 ê°œë³„ ì‚¬ìš©ìž ê¶Œí•œ ì˜¤ë²„ë¼ì´ë“œ

```
GET /system/permissions/overrides/:userId
POST /system/permissions/overrides/:userId
DELETE /system/permissions/overrides/:userId/:featureCode
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```

**POST Body**
```json
{
  "featureCode": "CONTROL_POWER",
  "isAllowed": true,
  "reason": "A/S ì²˜ë¦¬ë¥¼ ìœ„í•œ ìž„ì‹œ ì œì–´ ê¶Œí•œ ë¶€ì—¬"
}
```

### 9.2 ê°€ìž… ìŠ¹ì¸ ê´€ë¦¬

#### 9.2.1 ëŒ€ê¸° ì¤‘ ê°€ìž… ìš”ì²­ ëª©ë¡

```
GET /system/approvals
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```

**Query Parameters**
| íŒŒë¼ë¯¸í„° | íƒ€ìž… | ì„¤ëª… |
|---------|------|------|
| `role` | string | ì—­í•  í•„í„° |
| `status` | string | `PENDING` (ê¸°ë³¸) \| `ALL` |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "userId": 25,
      "loginId": "owner_kim",
      "name": "ê¹€ì ì£¼",
      "role": "OWNER",
      "phone": "010-1234-5678",
      "businessName": "ê¹€ë„¤ì‹ë‹¹",
      "businessNumber": "123-45-67890",
      "accountStatus": "PENDING",
      "createdAt": "2026-02-12T14:00:00Z"
    }
  ]
}
```

#### 9.2.2 ìŠ¹ì¸/ê±°ë¶€ ì²˜ë¦¬

```
PATCH /system/approvals/:userId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```

**Body**
```json
{
  "action": "APPROVE",
  "reason": ""
}
```
- `action`: `APPROVE` â†’ statusë¥¼ `ACTIVE`ë¡œ ë³€ê²½ \| `REJECT` â†’ statusë¥¼ `DELETED`ë¡œ ë³€ê²½
- `REJECT` ì‹œ `reason` í•„ìˆ˜

### 9.3 ì‚¬ìš©ìž ê´€ë¦¬

#### 9.3.1 ì‚¬ìš©ìž ëª©ë¡ ì¡°íšŒ

```
GET /system/users
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```

**Query Parameters**
| íŒŒë¼ë¯¸í„° | íƒ€ìž… | ì„¤ëª… |
|---------|------|------|
| `role` | string | ì—­í•  í•„í„° |
| `accountStatus` | string | `ACTIVE` \| `SUSPENDED` \| `PENDING` \| `DELETED` |
| `search` | string | ì´ë¦„, ì•„ì´ë””, ì „í™”ë²ˆí˜¸ ê²€ìƒ‰ |

#### 9.3.2 ì‚¬ìš©ìž ìƒì„¸ ì¡°íšŒ

```
GET /system/users/:userId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```
- ê¸°ë³¸ì •ë³´ + ì—­í• ë³„ í”„ë¡œí•„(dealer_profiles/hq_profiles/owner_profiles) + ì‚¬ì—…ìžì •ë³´ + ê¶Œí•œ ì˜¤ë²„ë¼ì´ë“œ ëª©ë¡ í¬í•¨

#### 9.3.3 ì‚¬ìš©ìž ì¶”ê°€ (ê´€ë¦¬ìžê°€ ì§ì ‘)

```
POST /system/users
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```

#### 9.3.4 ì‚¬ìš©ìž ì •ë³´ ìˆ˜ì •

```
PUT /system/users/:userId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```

#### 9.3.5 ê³„ì • ìƒíƒœ ë³€ê²½

```
PATCH /system/users/:userId/status
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```

**Body**
```json
{
  "accountStatus": "SUSPENDED",
  "reason": "ìž¥ê¸° ë¯¸ì‚¬ìš©"
}
```

#### 9.3.6 ì‚¬ìš©ìž ì‚­ì œ

```
DELETE /system/users/:userId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```
- Soft delete (`account_status` â†’ `DELETED`)

### 9.4 ê¸°ì¤€ ìˆ˜ì¹˜ ê´€ë¦¬

#### 9.4.1 ì²­ì†Œ íŒë‹¨ ê¸°ì¤€ê°’ ì¡°íšŒ/ìˆ˜ì •

```
GET /system/thresholds/cleaning
PUT /system/thresholds/cleaning
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```

**PUT Body**
```json
{
  "equipmentId": 201,
  "sparkThreshold": 30,
  "sparkTimeWindow": 60,
  "pressureBase": 200,
  "pressureRate": 1.5
}
```
- `sparkThreshold`: ìŠ¤íŒŒí¬ ê¸°ì¤€ê°’ (0-99)
- `sparkTimeWindow`: ìŠ¤íŒŒí¬ ê¸°ì¤€ ì‹œê°„(ë¶„) íŠœë‹ ë³€ìˆ˜ (í”¼ë“œë°± p.66)
- `pressureBase`: ì°¨ì•• ê¸°ì¤€ê°’ (Pa)
- `pressureRate`: ì°¨ì•• ë³€í™”ìœ¨ ê¸°ì¤€

#### 9.4.2 IAQ ìƒíƒœ ê¸°ì¤€ê°’ ì¡°íšŒ/ìˆ˜ì •

```
GET /system/thresholds/iaq
PUT /system/thresholds/iaq
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```

**PUT Body** â€” 5ë‹¨ê³„ ê¸°ì¤€
```json
{
  "thresholds": [
    {
      "metric": "pm2_5",
      "unit": "Âµg/mÂ³",
      "levels": {
        "GOOD": { "min": 0, "max": 15 },
        "MODERATE": { "min": 15, "max": 35 },
        "BAD": { "min": 35, "max": 75 },
        "VERY_BAD": { "min": 75, "max": 150 },
        "HAZARDOUS": { "min": 150, "max": null }
      }
    }
  ]
}
```

#### 9.4.3 ìž¥ë¹„ ëª¨ë¸ ê´€ë¦¬

```
GET    /system/equipment-models
POST   /system/equipment-models
PUT    /system/equipment-models/:modelId
DELETE /system/equipment-models/:modelId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN
```

---

## 10. ê²Œì´íŠ¸ì›¨ì´ (Gateway)

### 10.1 ê²Œì´íŠ¸ì›¨ì´ ëª©ë¡ ì¡°íšŒ

```
GET /gateways
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL (ë²”ìœ„ ìžë™ í•„í„°)
```

**Query Parameters**: `storeId`, `connectionStatus`

### 10.2 ê²Œì´íŠ¸ì›¨ì´ ìƒì„¸ ì¡°íšŒ

```
GET /gateways/:gatewayId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "gatewayId": 10,
    "gwDeviceId": "gw-001",
    "store": { "storeId": 101, "storeName": "ê¹€ë„¤ì‹ë‹¹ ë³¸ì ", "siteId": "site-001" },
    "floor": { "floorId": 1001, "floorCode": "1F", "floorName": "1ì¸µ ì£¼ë°©" },
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "firmwareVersion": "1.2.3",
    "controllerCount": 3,
    "statusFlags": 63,
    "statusDetails": {
      "sen55": true,
      "scd40": true,
      "o3Sensor": true,
      "coSensor": true,
      "hchoSensor": true,
      "controllerConnected": true,
      "pairingMode": false
    },
    "connectionStatus": "ONLINE",
    "lastSeenAt": "2026-02-13T09:30:00Z"
  }
}
```

### 10.3 ê²Œì´íŠ¸ì›¨ì´ ë“±ë¡

```
POST /gateways
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN, DEALER
```

### 10.4 ê²Œì´íŠ¸ì›¨ì´ ìˆ˜ì •/ì‚­ì œ

```
PUT    /gateways/:gatewayId
DELETE /gateways/:gatewayId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ADMIN, DEALER
```

---

## 11. íŒŒì¼ ì—…ë¡œë“œ (Files)

### 11.1 íŒŒì¼ ì—…ë¡œë“œ (ë²”ìš©)

```
POST /files/upload
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL
Content-Type: multipart/form-data
```

**Body**
| í•„ë“œ | íƒ€ìž… | ì„¤ëª… |
|------|------|------|
| `file` | File | ì—…ë¡œë“œ íŒŒì¼ |
| `category` | string | `BUSINESS_CERT` \| `AS_REQUEST` \| `AS_REPORT` |

**Response 200**
```json
{
  "success": true,
  "data": {
    "fileId": "f-20260213-abc123",
    "fileName": "ì‚¬ì—…ìžë“±ë¡ì¦.jpg",
    "fileUrl": "/files/business-cert/f-20260213-abc123.jpg",
    "fileSize": 245000,
    "mimeType": "image/jpeg"
  }
}
```
- S3 ì—…ë¡œë“œ í›„ URL ë°˜í™˜
- ì´ë¯¸ì§€: ìµœëŒ€ 10MB, ë¬¸ì„œ: ìµœëŒ€ 20MB

### 11.2 íŒŒì¼ ë‹¤ìš´ë¡œë“œ

```
GET /files/:fileId
ðŸ”’ ì¸ì¦ í•„ìš” | ì—­í• : ALL (ì ‘ê·¼ ê¶Œí•œ ê²€ì¦)
```

---

## 12. API ì—”ë“œí¬ì¸íŠ¸ ìš”ì•½í‘œ

### í™”ë©´ â†’ API ë§¤í•‘

| # | í™”ë©´ | ì£¼ìš” API ì—”ë“œí¬ì¸íŠ¸ |
|---|------|------------------|
| 1 | ë¡œê·¸ì¸ | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/password-reset-request` |
| 2 | ë§¤ìž¥ì ì£¼ íšŒì›ê°€ìž… | `POST /registration/owner`, `GET /auth/check-login-id`, `GET /registration/hq-list`, `GET /registration/dealer-list` |
| 3 | ë§¤ìž¥ë³¸ì‚¬ íšŒì›ê°€ìž… | `POST /registration/hq`, `GET /auth/check-login-id` |
| 4 | ë³¸ì‚¬ì§ì› íšŒì›ê°€ìž… | `POST /registration/admin` |
| 5 | ëŒ€ë¦¬ì  íšŒì›ê°€ìž… | `POST /registration/dealer`, `GET /auth/check-login-id` |
| 6 | ëŒ€ì‹œë³´ë“œ | `GET /dashboard/summary`, `GET /dashboard/issues`, `GET /dashboard/alarms`, `GET /dashboard/iaq`, `GET /dashboard/outdoor-air`, `GET /dashboard/store-tree` |
| 7 | ìž¥ë¹„ê´€ë¦¬ â€” ìž¥ë¹„ì •ë³´ | `GET /equipment`, `GET /equipment/:id`, `POST /equipment`, `PUT /equipment/:id`, `DELETE /equipment/:id` |
| 8 | ìž¥ë¹„ê´€ë¦¬ â€” ì‹¤ì‹œê°„ëª¨ë‹ˆí„°ë§ | `GET /monitoring/equipment/:id/latest`, `GET /monitoring/equipment/:id/history`, `GET /monitoring/gateway/:id/iaq-history` |
| 9 | ìž¥ë¹„ê´€ë¦¬ â€” ESG | `GET /monitoring/equipment/:id/esg` |
| 10 | ìž¥ë¹„ê´€ë¦¬ â€” ìž¥ì¹˜ì œì–´ | `POST /control/command`, `GET /control/command/:id/status`, `GET /control/history`, `GET/PUT /control/equipment/:id/damper-auto-settings`, `GET/PUT /control/equipment/:id/fan-auto-settings` |
| 10-2 | 장비관리 — 게이트웨이 설정 | `POST /control/gateway/:id/config`, `GET /control/gateway-config/:id/status` |
| 11 | ìž¥ë¹„ê´€ë¦¬ â€” ì´ë ¥ì¡°íšŒ | `GET /monitoring/equipment/:id/history-log` |
| 12 | A/Sê´€ë¦¬ â€” ì•Œë¦¼í˜„í™© | `GET /as-service/alerts` |
| 13 | A/Sê´€ë¦¬ â€” ì ‘ìˆ˜ì‹ ì²­ | `POST /as-service/requests` |
| 14 | A/Sê´€ë¦¬ â€” ì²˜ë¦¬í˜„í™© | `GET /as-service/requests`, `GET /as-service/requests/:id`, `PATCH /as-service/requests/:id/status` |
| 15 | A/Sê´€ë¦¬ â€” ì™„ë£Œë³´ê³ ì„œ | `POST /as-service/requests/:id/report`, `GET /as-service/requests/:id/report` |
| 16 | ê³ ê°í˜„í™© | `GET /customers/stores`, `GET /customers/stores/map`, `GET/PUT /customers/stores/:id`, `POST /customers/stores` |
| 17 | ì‹œìŠ¤í…œê´€ë¦¬ â€” ê¶Œí•œê´€ë¦¬ | `GET/PUT /system/permissions`, `GET/POST/DELETE /system/permissions/overrides/:userId` |
| 18 | ì‹œìŠ¤í…œê´€ë¦¬ â€” ê°€ìž…ìŠ¹ì¸ | `GET /system/approvals`, `PATCH /system/approvals/:userId` |
| 19 | ì‹œìŠ¤í…œê´€ë¦¬ â€” ì‚¬ìš©ìžê´€ë¦¬ | `GET /system/users`, `GET/PUT/DELETE /system/users/:id`, `PATCH /system/users/:id/status` |
| 20 | ì‹œìŠ¤í…œê´€ë¦¬ â€” ê¸°ì¤€ìˆ˜ì¹˜ | `GET/PUT /system/thresholds/cleaning`, `GET/PUT /system/thresholds/iaq`, `CRUD /system/equipment-models` |

### ì „ì²´ ì—”ë“œí¬ì¸íŠ¸ ìˆ˜

| ë„ë©”ì¸ | GET | POST | PUT | PATCH | DELETE | í•©ê³„ |
|--------|-----|------|-----|-------|--------|------|
| Auth | 2 | 4 | 1 | 0 | 0 | **7** |
| Registration | 3 | 4 | 0 | 0 | 0 | **7** |
| Dashboard | 6 | 0 | 0 | 0 | 0 | **6** |
| Equipment | 3 | 1 | 1 | 0 | 1 | **6** |
| Monitoring | 5 | 0 | 0 | 0 | 0 | **5** |
| Control | 5 | 2 | 2 | 0 | 0 | **9** |
| A/S Service | 4 | 2 | 0 | 1 | 0 | **7** |
| Customer | 5 | 2 | 2 | 0 | 1 | **10** |
| System | 8 | 4 | 4 | 2 | 3 | **21** |
| Gateway | 2 | 1 | 1 | 0 | 1 | **5** |
| Files | 1 | 1 | 0 | 0 | 0 | **2** |
| **í•©ê³„** | **44** | **21** | **11** | **3** | **6** | **85** |

---

## 13. Mock ë°ì´í„° ì „ëžµ (Phase 1)

### 13.1 Mock â†’ API ì „í™˜ íŒ¨í„´

```typescript
// api/equipment.api.ts
import { useQuery } from '@tanstack/react-query';
import { mockGetEquipments } from './mock/equipment.mock';
// Phase 2: import { axiosGetEquipments } from './real/equipment.real';

export const useEquipments = (storeId: string) => {
  return useQuery({
    queryKey: ['equipments', storeId],
    queryFn: () => mockGetEquipments(storeId), // Phase 2: axiosGetEquipments
    staleTime: 30 * 1000,
  });
};
```

### 13.2 Mock ë°ì´í„° íŒŒì¼ êµ¬ì¡°

```
src/api/mock/
â”œâ”€â”€ auth.mock.ts           # ë¡œê·¸ì¸/í† í° Mock
â”œâ”€â”€ dashboard.mock.ts      # ëŒ€ì‹œë³´ë“œ ìš”ì•½/ì´ìŠˆ/IAQ
â”œâ”€â”€ equipment.mock.ts      # ìž¥ë¹„ CRUD Mock
â”œâ”€â”€ monitoring.mock.ts     # ì„¼ì„œ ë°ì´í„°/ì´ë ¥ Mock
â”œâ”€â”€ control.mock.ts        # ì œì–´ ëª…ë ¹ Mock
â”œâ”€â”€ as-service.mock.ts     # A/S ì ‘ìˆ˜/ì²˜ë¦¬/ë³´ê³ ì„œ Mock
â”œâ”€â”€ customer.mock.ts       # ê³ ê° ëª©ë¡/íŽ¸ì§‘ Mock
â”œâ”€â”€ system.mock.ts         # ê¶Œí•œ/ìŠ¹ì¸/ì‚¬ìš©ìž/ê¸°ì¤€ìˆ˜ì¹˜ Mock
â””â”€â”€ common.mock.ts         # ê³µí†µ ì§€ì—°, íŽ˜ì´ì§€ë„¤ì´ì…˜ í—¬í¼
```

### 13.3 Mock ì„¼ì„œ ë°ì´í„° ìƒì„± ê·œì¹™

Mock ë°ì´í„°ëŠ” MQTT Payload ê·œê²©ì— ì •í™•ížˆ ë§žì¶° ìƒì„±:

```typescript
// mock/monitoring.mock.ts â€” ì„¼ì„œ ê°’ ë²”ìœ„
const SENSOR_RANGES = {
  pm2_5:         { min: 5,   max: 80,   decimals: 1 },
  pm10:          { min: 10,  max: 100,  decimals: 1 },
  diffPressure:  { min: 5,   max: 50,   decimals: 1 },
  oilLevel:      { min: 10,  max: 90,   decimals: 1 },
  ppTemp:        { min: 30,  max: 70,   decimals: 0 }, // ì •ìˆ˜
  ppSpark:       { min: 0,   max: 99,   decimals: 0 }, // ì •ìˆ˜ 0-99
  ppPower:       { values: [0, 1] },                    // OFF/ON
  ppAlarm:       { values: [0, 1] },                    // ì •ìƒ/ì•ŒëžŒ
  fanSpeed:      { values: [0, 1, 2, 3] },              // OFF/LOW/MID/HIGH (수동 모드)
  fanMode:       { values: [0, 1] },                     // 0=수동, 1=자동
  damperMode:    { values: [0, 1] },                     // 0=수동, 1=자동
  flow:          { min: 300, max: 1200, decimals: 1 },  // CMH
  damper:        { min: 0,   max: 100,  decimals: 1 },  // %
  inletTemp:     { min: 15,  max: 50,   decimals: 1 },  // Â°C (ì •ìƒ ë²”ìœ„)
  velocity:      { min: 2,   max: 15,   decimals: 1 },  // m/s
  ductDp:        { min: 50,  max: 500,  decimals: 1 },  // Pa
  statusFlags:   { default: 63 },                        // 0b111111 = ëª¨ë‘ ì •ìƒ
};
```

---

*ë³¸ ë¬¸ì„œëŠ” MQTT Payload ê·œê²©_260213.pdf, ESP ê´€ë¦¬íˆ´_ìµœì¢…í”¼ë“œë°±_260212.pdf, MetaBeans_ESP_ë°ì´í„°êµ¬ì¡°_ì •ì˜ì„œ_v3_0.md, MetaBeans_ESP_í”„ë¡œì íŠ¸_ì•„í‚¤í…ì²˜_ê¸°ìˆ ìŠ¤íƒ_ì •ì˜ì„œ.mdë¥¼ ê·¼ê±°ë¡œ ìž‘ì„±ë˜ì—ˆìŠµë‹ˆë‹¤. ê°œë°œ ì§„í–‰ì— ë”°ë¼ ë³€ê²½ë  ìˆ˜ ìžˆìŠµë‹ˆë‹¤.*
