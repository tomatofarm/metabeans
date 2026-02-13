# MetaBeans ESP ê´€ì œì‹œìŠ¤í…œ - ë°ì´í„° êµ¬ì¡° ì •ì˜ì„œ

**ë¬¸ì„œ ë²„ì „**: v3.1  
**ìž‘ì„±ì¼**: 2026-02-13  
**ê·¼ê±° ë¬¸ì„œ** (ìš°ì„ ìˆœìœ„ìˆœ):
1. MQTT Payload 규격_260213.pdf (2026-02-13, **최우선**)
2. MQTT 토픽 구조 변경 및 협의 사항.pdf (2026-02-13, **최우선**)
3. ESP 관리툴_최종피드백_260212.pdf (2026-02-12)
4. MetaBeans_ESP_데이터구조_정의서_v3.0.md (기반)
5. MetaBeans_ESP_관리툴_전체구조_기획서.docx (참조용)

---

## ë³€ê²½ ì´ë ¥

| ë²„ì „ | ë‚ ì§œ | ì£¼ìš” ë³€ê²½ ì‚¬í•­ |
|------|------|--------------|
| v1.0 | 2025-02-04 | ì´ˆê¸° ìž‘ì„± |
| v2.0 | 2025-02-04 | Q&A ê¸°ë°˜ 20ê±´ ìˆ˜ì • ë°˜ì˜ |
| v3.0 | 2026-02-13 | MQTT ê·œê²© 260212 + ìµœì¢…í”¼ë“œë°± 260212 ì „ë©´ ë°˜ì˜ |
| v3.1 | 2026-02-13 | MQTT 규격 260213 + 토픽 구조 변경 협의사항 반영 (댐퍼/시로코팬 자동제어, config 토픽 정의) |

### v3.0 ì£¼ìš” ë³€ê²½ ë‚´ì—­

| # | ë³€ê²½ ëŒ€ìƒ | ë³€ê²½ ë‚´ìš© | ê·¼ê±° |
|---|----------|---------|------|
| 1 | MQTT í† í”½ | ê²Œì´íŠ¸ì›¨ì´ ë‹¨ìœ„ í†µí•© ì„¼ì„œ ë©”ì‹œì§€ êµ¬ì¡° ë„ìž… (controllerë³„ í† í”½ ì œê±°) | MQTT ê·œê²© |
| 2 | MQTT í† í”½ | heartbeat í† í”½ ì œê±° â†’ status í† í”½ìœ¼ë¡œ ëŒ€ì²´ (10ì´ˆ ì£¼ê¸°) | MQTT ê·œê²© |
| 3 | MQTT í† í”½ | alarm í† í”½ ì œê±° â†’ pp_alarm í•„ë“œë¡œ ëŒ€ì²´ | MQTT ê·œê²© |
| 4 | MQTT í† í”½ | config í† í”½ ì¶”ê°€ (ì¶”í›„ ì •ì˜) | MQTT ê·œê²© |
| 5 | MQTT QoS | QoS 2 â†’ QoS 1 (AWS IoT Core QoS 2 ë¯¸ì§€ì›) | MQTT ê·œê²© |
| 6 | MQTT íƒ€ìž„ìŠ¤íƒ¬í”„ | ISO 8601 â†’ Unix epoch (ì´ˆ ë‹¨ìœ„) | MQTT ê·œê²© |
| 7 | sensor ë©”ì‹œì§€ | gateway IAQ + ëª¨ë“  í•˜ìœ„ equipment/controllerë¥¼ í•˜ë‚˜ì˜ ë©”ì‹œì§€ë¡œ í†µí•© | MQTT ê·œê²© |
| 8 | controller í•„ë“œ | blade_angle ì œê±° â†’ damperë¡œ í†µí•©, pp_temp int í™•ì • | MQTT ê·œê²© |
| 9 | controller í•„ë“œ | pp_alarm, inlet_temp, velocity, duct_dp ì¶”ê°€ | MQTT ê·œê²© |
| 10 | controller í•„ë“œ | fan_rpm, error_code ì œê±° | MQTT ê·œê²© |
| 11 | status_flags | Controller 6ë¹„íŠ¸, Gateway 7ë¹„íŠ¸ ë¹„íŠ¸ ì •ì˜ í™•ì • | MQTT ê·œê²© |
| 12 | ì œì–´ ëª…ë ¹ | controller_id ëŒ€ì‹  equipment_id + controller_id ì¡°í•©, ì¼ê´„ ì œì–´ ì§€ì› | MQTT ê·œê²© |
| 13 | ì œì–´ ëŒ€ìƒ | target 1 = ëŒí¼(flo-OAC), target 2 = ì‹œë¡œì½”íŒ¬ (ë¸”ë ˆì´ë“œ ì œê±°) | MQTT ê·œê²© |
| 14 | ê³„ì¸µ êµ¬ì¡° | Equipment ìµœëŒ€ 5ëŒ€/ì¸µ, Controller ìµœëŒ€ 4ëŒ€/Equipment | MQTT ê·œê²© + í”¼ë“œë°± p.50 |
| 15 | equipment | powerpack_count ìµœëŒ€ 16 â†’ ìµœëŒ€ 4 | í”¼ë“œë°± p.50 |
| 16 | cell_types | ë“œë¡­ë‹¤ìš´ ì°¸ì¡° í…Œì´ë¸” ì œê±° â†’ ìˆ˜ë™ ìž…ë ¥(VARCHAR) | í”¼ë“œë°± p.36 |
| 17 | stores | business_typeì— 'ì»¤í”¼ë¡œìŠ¤íŒ…' ì¶”ê°€ | í”¼ë“œë°± p.14, p.19 |
| 18 | user_business_info | ì—…íƒœ/ì—…ì¢… í•„ë“œ ì‚­ì œ | í”¼ë“œë°± p.9, p.15, p.20 |
| 19 | owner_profiles | store_scale(ë§¤ìž¥ ê·œëª¨) ì‚­ì œ | í”¼ë“œë°± p.21 |
| 20 | dealer_profiles | service_regionsì— ì„œìš¸ ë™ë¶€/ì„œë¶€, ê²½ê¸° ë™ë¶€/ì„œë¶€ ì¶”ê°€ | í”¼ë“œë°± p.11 |
| 21 | ì œì–´ | ìš´ì˜ ì‹œê°„ ì„¤ì • ì‚­ì œ (ì „ì›, ë°©í™”ì…”í„°, ì†¡í’ê¸° ëª¨ë‘) | í”¼ë“œë°± p.43~47 |
| 22 | ë°©í™”ì…”í„° | 8ë‹¨ê³„(0~7) ê°œë„ìœ¨ ë§¤í•‘ í™•ì •, ìžë™ì œì–´ ëª©í‘œ í’ëŸ‰ ì¶”ê°€ | í”¼ë“œë°± p.44~45 |
| 23 | A/S | ë°©ë¬¸ í¬ë§ ì¼ì‹œ í•„ë“œ ì¶”ê°€, êµì²´ ë¶€í’ˆ ìƒì„¸(í’ˆëª…/ê°€ê²©/ìˆ˜ëŸ‰) í•„ìˆ˜ | í”¼ë“œë°± p.56, p.59 |
| 24 | A/S | cost â†’ total_parts_cost (ì´ë¶€í’ˆë¹„) ë³€ê²½ | í”¼ë“œë°± p.59 |
| 25 | ê³ ê°í˜„í™© | ê³ ê° ìƒíƒœ í™œì„±/ë¹„í™œì„± êµ¬ë¶„ ì¶”ê°€ | í”¼ë“œë°± p.62 |
| 26 | ê¶Œí•œ | ì—­í• ë³„ ë©”ë‰´ ê¶Œí•œ ì„¸ë¶„í™” (ì‹¤ì‹œê°„ ëª¨ë‹ˆí„°ë§/ì œì–´ í•˜ìœ„ í•­ëª©) | í”¼ë“œë°± p.63 |
| 27 | ê¸°ì¤€ìˆ˜ì¹˜ | ìŠ¤íŒŒí¬ ê¸°ì¤€ ì‹œê°„ íŠœë‹ ë³€ìˆ˜ ì¶”ê°€ | í”¼ë“œë°± p.66 |
| 28 | ëŒ€ì‹œë³´ë“œ | ì‹œìŠ¤í…œ ìƒíƒœ ì‚­ì œ, ë¬¸ì œ ë°œìƒ ì´ìŠˆ í•­ëª© ì •ì˜ | í”¼ë“œë°± p.24, p.33~34 |
| 29 | ëŒ€ì‹œë³´ë“œ | ì‹¤ë‚´ê³µê¸°ì§ˆ ì •ë³´ëŠ” ì´ìŠˆ/ì•Œë¦¼ì— í‘œì‹œ ì•ˆ í•¨ | í”¼ë“œë°± p.33 |
| 30 | ìž¥ë¹„ê´€ë¦¬ | ë‹´ë‹¹ ê¸°ì‚¬ â†’ ë‹´ë‹¹ ëŒ€ë¦¬ì ìœ¼ë¡œ ìˆ˜ì • | í”¼ë“œë°± p.36 |
| 31 | ìž¥ë¹„ê´€ë¦¬ | ì••ë ¥ ì´ë ¥ ì‚­ì œ | í”¼ë“œë°± p.49 |
| 32 | ëª¨ë‹ˆí„°ë§ | í•„í„° ì ê²€ ìƒíƒœ(ì°¨ì••), ë¨¼ì§€ì œê±° ì„±ëŠ¥(PM2.5/PM10) ì§€í‘œ ì¶”ê°€ | í”¼ë“œë°± p.38~39 |
| 33 | ëª¨ë‹ˆí„°ë§ | í†µì‹  ì—°ê²° ìƒíƒœ 30ì´ˆ ê¸°ì¤€ ì˜¤ë¥˜ íŒì • | í”¼ë“œë°± p.38 |
| 34 | gateway | heartbeat ê´€ë ¨ í•„ë“œ ì œê±°, status ê¸°ë°˜ ì—°ê²° íŒì •ìœ¼ë¡œ ë³€ê²½ | MQTT ê·œê²© |
| 35 | ë°ì´í„° ê°±ì‹  | ì„¼ì„œ ë°ì´í„° 10ì´ˆ ì£¼ê¸° í™•ì • (v2.0ì˜ 1ë¶„ ê°„ê²© ì˜¤ë¥˜ ìˆ˜ì •) | MQTT ê·œê²© |

### v3.1 주요 변경 내역 (MQTT 규격 260213 + 토픽 구조 변경 협의)

| # | 변경 대상 | 변경 내용 | 근거 |
|---|----------|---------|------|
| 36 | controller 센서 필드 | `fan_mode` (팬 제어 모드, 0=수동/1=자동) 필드 추가 | MQTT 규격 260213 |
| 37 | controller 센서 필드 | `damper_mode` (댐퍼 제어 모드, 0=수동/1=자동) 필드 추가 | MQTT 규격 260213 |
| 38 | controller 센서 필드 | `fan_speed` 설명 보완: "수동 모드에서만 유의미" 추가 | MQTT 규격 260213 |
| 39 | 제어 명령 (target=1 댐퍼) | action=2 (자동/수동 모드 전환), action=3 (목표 풍량 CMH 설정) 추가 | MQTT 규격 260213 |
| 40 | 제어 명령 (target=2 시로코팬) | action=4 (자동/수동 모드 전환), action=5 (목표 풍속 m/s 설정) 추가 | MQTT 규격 260213 |
| 41 | 제어 명령 value 타입 | int → **number** (int 또는 float), 목표 풍량/풍속은 float | MQTT 규격 260213 |
| 42 | config 토픽 | 페이로드 정의 확정 (sensor_interval_ms, mqtt_interval_ms, ID 변경, WiFi 설정 등) | MQTT 규격 260213 |
| 43 | config/ack 토픽 | config 응답 토픽 추가 (cmd_id, result, reason, needs_reboot) | MQTT 규격 260213 |
| 44 | 토픽 구조 | config/ack 서브토픽 추가 | MQTT 규격 260213 |
| 45 | 안전 오버라이드 | ESTOP/스파크/과온도 알람 시 자동→수동 전환 동작 정의 | MQTT 규격 260213 |
| 46 | 시로코팬 자동 제어 | M100 인버터 내장 PID 활용, 목표 풍속 기반 가/감속 제어 확인 | 토픽 구조 변경 협의 |
| 47 | 댐퍼 자동 제어 | flo-OAC Internal SV 모드 활용, 목표 풍량 기반 자동 개도 조절 확인 | 토픽 구조 변경 협의 |
| 48 | damper_auto_settings | target_velocity 컬럼 추가 (시로코팬 목표 풍속) | MQTT 규격 260213 |
| 49 | 설계 결정 | 제어 모드: 수동 전용 → **자동/수동 전환 지원** | MQTT 규격 260213 |


---

## 1. ì‹œìŠ¤í…œ ê°œìš”

### 1.1 ì´í•´ê´€ê³„ìž ë° ì—­í•  ì •ì˜

| ì—­í•  ì½”ë“œ | ì—­í• ëª… | ì„¤ëª… |
|---------|-------|------|
| `ADMIN` | ë³¸ì‚¬ (ì‹œìŠ¤í…œ ê´€ë¦¬ìž) | ì‹œìŠ¤í…œ ì „ì²´ ê´€ë¦¬, ëª¨ë“  ë§¤ìž¥ ì ‘ê·¼, ê¶Œí•œ ì„¤ì • |
| `DEALER` | ì§€ì‚¬/ëŒ€ë¦¬ì  | ìž¥ë¹„ ì„¤ì¹˜/A/S, ê´€í•  ë§¤ìž¥ ê´€ë¦¬ |
| `HQ` | ë§¤ìž¥ ë³¸ì‚¬ (í”„ëžœì°¨ì´ì¦ˆ ê´€ë¦¬ìž) | ê´€í•  ê°€ë§¹ì  ëª¨ë‹ˆí„°ë§, ìš´ì˜ í‘œì¤€ ì ê²€ |
| `OWNER` | ë§¤ìž¥ ì ì£¼ | ë³¸ì¸ ë§¤ìž¥ ëª¨ë‹ˆí„°ë§, ìž¥ë¹„ ì œì–´, A/S ìš”ì²­ |

### 1.2 í•˜ë“œì›¨ì–´ ê³„ì¸µ êµ¬ì¡° (MQTT ê·œê²© 260212 í™•ì •)

```
Site (ë§¤ìž¥)
  â””â”€â”€ Floor (ì¸µ)
       â””â”€â”€ Gateway (ê²Œì´íŠ¸ì›¨ì´, ì¸µë‹¹ 1ëŒ€) â”€â”€ IAQ ì„¼ì„œ ë‚´ìž¥
            â””â”€â”€ Equipment (ì§‘ì§„ê¸°, ì¸µë‹¹ ìµœëŒ€ 5ëŒ€)
                 â””â”€â”€ Controller (íŒŒì›ŒíŒ©, ì§‘ì§„ê¸°ë‹¹ ìµœëŒ€ 4ëŒ€)
```

**ID í˜•ì‹** (MQTT ê·œê²©):
| ëŒ€ìƒ | íƒ€ìž… | ì˜ˆì‹œ | ì„¤ëª… |
|------|------|------|------|
| site_id | string | "site-001" | ë§¤ìž¥ ì‹ë³„ìž |
| floor_id | string | "1F", "B1" | ì¸µ ì‹ë³„ìž |
| gateway_id | string | "gw-001" | ê²Œì´íŠ¸ì›¨ì´ ì‹ë³„ìž |
| equipment_id | string | "esp-001" | ì§‘ì§„ê¸°(ìž¥ë¹„) ì‹ë³„ìž |
| controller_id | string | "ctrl-001" | ì»¨íŠ¸ë¡¤ëŸ¬(íŒŒì›ŒíŒ©) ì‹ë³„ìž |

> ëª¨ë“  IDëŠ” ë‚´ë¶€ ê³ ìœ ë²ˆí˜¸ë¥¼ ì‚¬ìš©í•˜ë©°, ì„¤ì¹˜ ì‹œ ê° ìž¥ë¹„ì— ì„¤ì •í•©ë‹ˆë‹¤.

### 1.3 ì£¼ìš” ì„¤ê³„ ê²°ì • ì‚¬í•­

| í•­ëª© | v2.0 | v3.0 (ë³€ê²½) | ê·¼ê±° |
|------|------|------------|------|
| MQTT í† í”½ êµ¬ì¡° | controllerë³„ ê°œë³„ í† í”½ | **ê²Œì´íŠ¸ì›¨ì´ ë‹¨ìœ„ í†µí•©** | MQTT ê·œê²© 260212 |
| ì„¼ì„œ ì „ì†¡ ì£¼ê¸° | 1ë¶„ ê°„ê²© | **10ì´ˆ ì£¼ê¸°** | MQTT ê·œê²© 260212 |
| QoS | 2 | **1** (AWS IoT Core ì œì•½) | MQTT ê·œê²© 260212 |
| íƒ€ìž„ìŠ¤íƒ¬í”„ | ISO 8601 | **Unix epoch (ì´ˆ)** | MQTT ê·œê²© 260212 |
| ì•ŒëžŒ ì „ë‹¬ ë°©ì‹ | ë³„ë„ alarm í† í”½ | **pp_alarm í•„ë“œ** | MQTT ê·œê²© 260212 |
| í†µì‹  ìƒíƒœ íŒë³„ | Heartbeat ping/pong | **status í† í”½ (10ì´ˆ ì£¼ê¸°)** | MQTT ê·œê²© 260212 |
| í†µì‹  ì˜¤ë¥˜ íŒì • | heartbeat_interval Ã— 3 | **30ì´ˆ ë¯¸ìˆ˜ì‹ ** | í”¼ë“œë°± p.38 |
| Controller ìµœëŒ€ ìˆ˜ | 16ê°œ/Equipment | **4ê°œ/Equipment** | í”¼ë“œë°± p.50 |
| Equipment ìµœëŒ€ ìˆ˜ | ë¯¸ì •ì˜ | **5ëŒ€/Floor** | MQTT ê·œê²© 260212 |
| ì…€ íƒ€ìž… ìž…ë ¥ | ë“œë¡­ë‹¤ìš´ (ì°¸ì¡° í…Œì´ë¸”) | **ìˆ˜ë™ ìž…ë ¥ (VARCHAR)** | í”¼ë“œë°± p.36 |
| ë°©í™”ì…”í„° ë‹¨ê³„ | 1~8ë‹¨ê³„ | **0~7ë‹¨ê³„ (8ë‹¨ê³„)** | í”¼ë“œë°± p.44 |
| 제어 모드 | 수동 전용 | **자동/수동 전환 지원** (댐퍼: flo-OAC PID, 팬: M100 PID) | MQTT 규격 260213 |
| config 토픽 | 추후 정의 | **페이로드 정의 완료** (런타임 설정 원격 변경) | MQTT 규격 260213 |
| config/ack 토픽 | 미정의 | **응답 토픽 추가** (needs_reboot 포함) | MQTT 규격 260213 |
| pp_spark | 0~99 ì—°ì†ê°’ | 0~99 (ë³€ê²½ ì—†ìŒ) | |
| ëŒ€ë¦¬ì â†”ë§¤ìž¥ ê´€ê³„ | 1:N | 1:N (ë³€ê²½ ì—†ìŒ) | |
| ê¶Œí•œ ëª¨ë¸ | RBAC + ì˜¤ë²„ë¼ì´ë“œ | RBAC + ì˜¤ë²„ë¼ì´ë“œ (ë³€ê²½ ì—†ìŒ) | |
| A/S ë°°ì • | ëŒ€ë¦¬ì  ë‹¨ìœ„ | ëŒ€ë¦¬ì  ë‹¨ìœ„ (ë³€ê²½ ì—†ìŒ) | |

---

## 2. ì‚¬ìš©ìž/ê³„ì • ê´€ë¦¬

### 2.1 users (ì‚¬ìš©ìž ê¸°ë³¸ ì •ë³´)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| user_id | BIGINT (PK, AUTO) | âœ… | ì‚¬ìš©ìž ê³ ìœ  ID |
| login_id | VARCHAR(50) UNIQUE | âœ… | ë¡œê·¸ì¸ ì•„ì´ë”” |
| password_hash | VARCHAR(255) | âœ… | ë¹„ë°€ë²ˆí˜¸ í•´ì‹œ |
| role | ENUM('ADMIN','DEALER','HQ','OWNER') | âœ… | ì‚¬ìš©ìž ì—­í•  |
| name | VARCHAR(50) | âœ… | ë‹´ë‹¹ìžëª… |
| phone | VARCHAR(20) | âœ… | ì—°ë½ì²˜ |
| email | VARCHAR(100) | | ì´ë©”ì¼ (ê¸´ê¸‰ì•ŒëžŒ ë°œì†¡ìš©) |
| account_status | ENUM('PENDING','ACTIVE','SUSPENDED','DELETED') | âœ… | ê³„ì • ìƒíƒœ |
| approved_by | BIGINT (FK â†’ users) | | ìŠ¹ì¸ ì²˜ë¦¬ìž |
| approved_at | DATETIME | | ìŠ¹ì¸ ì¼ì‹œ |
| last_login_at | DATETIME | | ìµœê·¼ ë¡œê·¸ì¸ ì¼ì‹œ |
| created_at | DATETIME | âœ… | ìƒì„± ì¼ì‹œ |
| updated_at | DATETIME | âœ… | ìˆ˜ì • ì¼ì‹œ |

**ë¹„ì¦ˆë‹ˆìŠ¤ ê·œì¹™**:
- íšŒì›ê°€ìž… ì‹œ account_status = 'PENDING' â†’ ê´€ë¦¬ìž ìŠ¹ì¸ í›„ 'ACTIVE'
- ADMIN ê³„ì •ì€ ì¼ë°˜ íšŒì›ê°€ìž… ê²½ë¡œì™€ ì™„ì „ ë¶„ë¦¬

### 2.2 user_business_info (ì‚¬ì—…ìž ì •ë³´)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| user_id | BIGINT (PK, FK â†’ users) | âœ… | ì‚¬ìš©ìž ID |
| business_name | VARCHAR(100) | âœ… | ìƒí˜¸ëª… |
| business_number | VARCHAR(20) | âœ… | ì‚¬ì—…ìžë“±ë¡ë²ˆí˜¸ |
| business_cert_file | VARCHAR(500) | | ì‚¬ì—…ìžë“±ë¡ì¦ íŒŒì¼ ê²½ë¡œ |
| business_cert_verified | BOOLEAN DEFAULT FALSE | | ì‚¬ì—…ìžë“±ë¡ì¦ ì¸ì¦ ì—¬ë¶€ |
| address | VARCHAR(255) | âœ… | ì‚¬ì—…ìž¥ ì£¼ì†Œ |

> **v3.0 ë³€ê²½**: ì—…íƒœ(business_category), ì—…ì¢…(business_sector) í•„ë“œ ì‚­ì œ (í”¼ë“œë°± p.9, p.15, p.20)

### 2.3 dealer_profiles (ëŒ€ë¦¬ì  í”„ë¡œí•„)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| dealer_id | BIGINT (PK, FK â†’ users.user_id) | âœ… | ëŒ€ë¦¬ì  ì‚¬ìš©ìž ID |
| service_regions | JSON | âœ… | ì„œë¹„ìŠ¤ ê°€ëŠ¥ ì§€ì—­ |
| service_regions_detail | JSON | | ìƒì„¸ ì„œë¹„ìŠ¤ ê°€ëŠ¥ ì§€ì—­ ì„¤ì • |
| specialties | JSON | âœ… | ì „ë¬¸ ë¶„ì•¼ |

**service_regions JSON êµ¬ì¡°** (v3.0 í™•ìž¥):
```json
["ì„œìš¸ ë™ë¶€", "ì„œìš¸ ì„œë¶€", "ê²½ê¸° ë™ë¶€", "ê²½ê¸° ì„œë¶€", "ì „ë‚¨", "ì¶©ë¶", ...]
```
> v3.0 ì¶”ê°€ ì§€ì—­: ì„œìš¸ ë™ë¶€, ì„œìš¸ ì„œë¶€, ê²½ê¸° ë™ë¶€, ê²½ê¸° ì„œë¶€ (í”¼ë“œë°± p.11)

**specialties JSON êµ¬ì¡°**:
```json
{
  "new_install": true,
  "repair": true,
  "cleaning": false,
  "transport": true,
  "inspection": false
}
```

### 2.4 hq_profiles (í”„ëžœì°¨ì´ì¦ˆ ë³¸ì‚¬ í”„ë¡œí•„)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| hq_id | BIGINT (PK, FK â†’ users.user_id) | âœ… | ë³¸ì‚¬ ì‚¬ìš©ìž ID |
| brand_name | VARCHAR(100) | âœ… | í”„ëžœì°¨ì´ì¦ˆ ë¸Œëžœë“œëª… |
| hq_name | VARCHAR(100) | âœ… | ë³¸ì‚¬ëª… |
| business_type | VARCHAR(50) | | ì—…ì¢… (ì„ íƒ) |

### 2.5 owner_profiles (ë§¤ìž¥ ì ì£¼ í”„ë¡œí•„)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| owner_id | BIGINT (PK, FK â†’ users.user_id) | âœ… | ì ì£¼ ì‚¬ìš©ìž ID |
| store_id | BIGINT (FK â†’ stores) | | ì†Œìœ  ë§¤ìž¥ ID |

> **v3.0 ë³€ê²½**: store_scale(ë§¤ìž¥ ê·œëª¨) ì‚­ì œ (í”¼ë“œë°± p.21)

---

## 3. ê¶Œí•œ ê´€ë¦¬ (RBAC + ê°œë³„ ì˜¤ë²„ë¼ì´ë“œ)

### 3.1 role_permissions (ì—­í• ë³„ ê¸°ë³¸ ê¶Œí•œ)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| role_permission_id | BIGINT (PK, AUTO) | âœ… | ê¶Œí•œ ID |
| role | ENUM('ADMIN','DEALER','HQ','OWNER') | âœ… | ëŒ€ìƒ ì—­í•  |
| feature_code | VARCHAR(50) | âœ… | ê¸°ëŠ¥ ì½”ë“œ |
| is_allowed | BOOLEAN | âœ… | í—ˆìš© ì—¬ë¶€ |

### 3.2 user_permission_overrides (ê°œë³„ ì‚¬ìš©ìž ê¶Œí•œ ì˜¤ë²„ë¼ì´ë“œ)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| override_id | BIGINT (PK, AUTO) | âœ… | ì˜¤ë²„ë¼ì´ë“œ ID |
| user_id | BIGINT (FK â†’ users) | âœ… | ëŒ€ìƒ ì‚¬ìš©ìž |
| feature_code | VARCHAR(50) | âœ… | ê¸°ëŠ¥ ì½”ë“œ |
| is_allowed | BOOLEAN | âœ… | í—ˆìš© ì—¬ë¶€ |
| reason | VARCHAR(255) | | ë³€ê²½ ì‚¬ìœ  |
| set_by | BIGINT (FK â†’ users) | âœ… | ì„¤ì •í•œ ê´€ë¦¬ìž |
| created_at | DATETIME | âœ… | ì„¤ì • ì¼ì‹œ |

### 3.3 feature_code ì •ì˜ (v3.0 ì„¸ë¶„í™”)

| ì½”ë“œ | ê¸°ëŠ¥ | ADMIN | DEALER | HQ | OWNER |
|------|------|-------|--------|-----|-------|
| `DASHBOARD_STORE_COUNT` | ê°€ë§¹ì  ìˆ˜ ì¡°íšŒ | âœ… | âœ… | âœ… | âŒ |
| `DASHBOARD_AS_REQUEST` | A/S ìš”ì²­ í˜„í™© | âœ… | âœ… | âœ… | âœ… |
| `DASHBOARD_REALTIME_ISSUE` | ì‹¤ì‹œê°„ ë°œìƒ ì´ìŠˆ | âœ… | âœ… | âœ… | âœ… |
| `DASHBOARD_IAQ` | ì‹¤ë‚´ê³µê¸°ì§ˆ ì¡°íšŒ | âœ… | âœ… | âœ… | âœ… |
| `DASHBOARD_OUTDOOR_AIR` | ì‹¤ì™¸ ëŒ€ê¸°ì§ˆ ì¡°íšŒ | âœ… | âœ… | âœ… | âœ… |
| `DASHBOARD_STORE_SEARCH` | ë§¤ìž¥ ê²€ìƒ‰ ë° ì´ë™ | âœ… | âœ… | âœ… | âŒ |
| `MONITOR_BASIC_STATUS` | ìž¥ë¹„ ê¸°ë³¸ ìƒíƒœ ëª¨ë‹ˆí„°ë§ | âœ… | âœ… | âœ… | âœ… |
| `MONITOR_FILTER_STATUS` | í•„í„° ì ê²€ ìƒíƒœ | âœ… | âœ… | âœ… | âœ… |
| `MONITOR_FIRE_SENSOR` | í™”ìž¬ê°ì§€ ì„¼ì„œ | âœ… | âœ… | âœ… | âœ… |
| `MONITOR_ESG` | ESG ì§€í‘œ ì¡°íšŒ | âœ… | âœ… | âœ… | âœ… |
| `MONITOR_BOARD_TEMP` | ë³´ë“œ ì˜¨ë„ | âœ… | âœ… | âœ… | âœ… |
| `MONITOR_SPARK` | ìŠ¤íŒŒí¬ ë°œìƒ | âœ… | âœ… | âœ… | âœ… |
| `CONTROL_POWER` | ì „ì› ì œì–´ | âœ… | ì˜¤ë²„ë¼ì´ë“œ | ì˜¤ë²„ë¼ì´ë“œ | âœ… |
| `CONTROL_DAMPER` | ë°©í™”ì…”í„°(ëŒí¼) ì œì–´ | âœ… | ì˜¤ë²„ë¼ì´ë“œ | ì˜¤ë²„ë¼ì´ë“œ | âœ… |
| `CONTROL_FAN` | ì†¡í’ê¸° íŒ¬ ëª¨í„° ì œì–´ | âœ… | ì˜¤ë²„ë¼ì´ë“œ | ì˜¤ë²„ë¼ì´ë“œ | âœ… |
| `CONTROL_FLOW_TARGET` | 목표 풍량(CMH) 입력 | ✅ | ❌ | ❌ | ❌ |
| `CONTROL_VELOCITY_TARGET` | **v3.1** 목표 풍속(m/s) 입력 | ✅ | ❌ | ❌ | ❌ |
| `EQUIP_REGISTER` | ìž¥ë¹„ ë“±ë¡/ìˆ˜ì •/ì‚­ì œ | âœ… | âœ… | âŒ | âŒ |
| `CUSTOMER_REGISTER` | ê³ ê° ê´€ë¦¬ (ê°œë³„ë§¤ìž¥) | âœ… | âœ…(ë“±ë¡/ìˆ˜ì •) | âŒ | ìˆ˜ì •ë§Œ |
| `CUSTOMER_FRANCHISE_REG` | ê°€ë§¹ì  ê´€ë¦¬ | âœ… | âœ…(ë“±ë¡/ìˆ˜ì •) | ìˆ˜ì •ë§Œ | âŒ |
| `AS_REQUEST` | A/S ì ‘ìˆ˜ ì‹ ì²­ | âœ… | âŒ | âŒ | âœ… |
| `AS_ACCEPT` | A/S ì ‘ìˆ˜ ì²˜ë¦¬ | âœ… | âœ… | âŒ | âŒ |
| `AS_REPORT` | A/S ì™„ë£Œ ë³´ê³ ì„œ ìž‘ì„± | âœ… | âœ… | âŒ | âŒ |
| `USER_MANAGEMENT` | ì‚¬ìš©ìž ê³„ì • ê´€ë¦¬ | âœ… | âŒ | âŒ | âŒ |
| `APPROVAL_MANAGEMENT` | ê°€ìž… ìŠ¹ì¸ ê´€ë¦¬ | âœ… | âŒ | âŒ | âŒ |
| `THRESHOLD_MANAGEMENT` | ê¸°ì¤€ ìˆ˜ì¹˜ ê´€ë¦¬ | âœ… | âŒ | âŒ | âŒ |

> **v3.0 ë³€ê²½**: `DASHBOARD_SYSTEM_STATUS`, `DASHBOARD_USER_STATS` ì‚­ì œ (í”¼ë“œë°± p.24, p.63).
> ëª¨ë‹ˆí„°ë§/ì œì–´ í•˜ìœ„ í•­ëª© ì„¸ë¶„í™” (`MONITOR_*`, `CONTROL_*`). 
> `CONTROL_FLOW_TARGET` ì‹ ê·œ ì¶”ê°€ (ëª©í‘œ í’ëŸ‰ ìž…ë ¥ ê¶Œí•œ, ì‹œìŠ¤í…œê´€ë¦¬ì—ì„œ ì„¤ì •, í”¼ë“œë°± p.44).

---

## 4. ë§¤ìž¥(ì‚¬ì´íŠ¸) ê´€ë¦¬

### 4.1 stores (ë§¤ìž¥ ì •ë³´)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| store_id | BIGINT (PK, AUTO) | âœ… | ë§¤ìž¥ ê³ ìœ  ID |
| site_id | VARCHAR(50) UNIQUE | âœ… | MQTT í† í”½ìš© ì‚¬ì´íŠ¸ ì‹ë³„ìž (ì˜ˆ: "site-001") |
| store_name | VARCHAR(100) | âœ… | ë§¤ìž¥ëª… |
| brand_name | VARCHAR(100) | | í”„ëžœì°¨ì´ì¦ˆ ë¸Œëžœë“œëª… |
| business_type | ENUM('íŠ€ê¹€','êµ½ê¸°','ë³¶ìŒ','ë³µí•©','ì»¤í”¼ë¡œìŠ¤íŒ…') | | ì—…ì¢… |
| address | VARCHAR(255) | âœ… | ë§¤ìž¥ ì£¼ì†Œ |
| latitude | DECIMAL(10,8) | | ìœ„ë„ |
| longitude | DECIMAL(11,8) | | ê²½ë„ |
| region_code | VARCHAR(20) | | ì§€ì—­ ì½”ë“œ (ì‹œ/ë„) |
| district_code | VARCHAR(20) | | ìƒì„¸ ì§€ì—­ ì½”ë“œ (êµ¬/ë™) |
| owner_id | BIGINT (FK â†’ users) | | ë§¤ìž¥ ì ì£¼ ì‚¬ìš©ìž ID |
| hq_id | BIGINT (FK â†’ users) | | ì†Œì† í”„ëžœì°¨ì´ì¦ˆ ë³¸ì‚¬ ID |
| dealer_id | BIGINT (FK â†’ users) | | ë‹´ë‹¹ ëŒ€ë¦¬ì  ID |
| contact_name | VARCHAR(50) | | ë§¤ìž¥ ì—°ë½ ë‹´ë‹¹ìžëª… |
| contact_phone | VARCHAR(20) | | ë§¤ìž¥ ì—°ë½ì²˜ |
| floor_count | INT DEFAULT 1 | | ë§¤ìž¥ ì¸µ ìˆ˜ |
| status | ENUM('ACTIVE','INACTIVE','PENDING') | âœ… | ë§¤ìž¥ ìƒíƒœ |
| registered_by | ENUM('OWNER','DEALER','ADMIN') | âœ… | ë“±ë¡ ë°©ë²• |
| created_at | DATETIME | âœ… | ë“±ë¡ ì¼ì‹œ |
| updated_at | DATETIME | âœ… | ìˆ˜ì • ì¼ì‹œ |

> **v3.0 ë³€ê²½**: business_typeì— 'ì»¤í”¼ë¡œìŠ¤íŒ…' ì¶”ê°€ (í”¼ë“œë°± p.14, p.19). cooking_volume(ì¼ì¼ ì¡°ë¦¬ëŸ‰) ì‚­ì œ.

**ë¹„ì¦ˆë‹ˆìŠ¤ ê·œì¹™**:
- HQ ì†Œì† ë§¤ìž¥ì—ëŠ” dealer_idë¥¼ í• ë‹¹í•˜ì§€ ì•ŠìŒ (hq_idê°€ ìžˆìœ¼ë©´ dealer_id = NULL)
- ë§¤ìž¥ ë“±ë¡: OWNER(ì§ì ‘ë“±ë¡), DEALER(ì„¤ì¹˜ì‹œ), ADMIN(ì ì£¼ ë¯¸ê°€ìž…ì‹œ)

### 4.2 store_floors (ë§¤ìž¥ ì¸µ ì •ë³´)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| floor_id | BIGINT (PK, AUTO) | âœ… | ì¸µ ê³ ìœ  ID |
| store_id | BIGINT (FK â†’ stores) | âœ… | ë§¤ìž¥ ID |
| floor_code | VARCHAR(10) | âœ… | MQTT í† í”½ìš© ì¸µ ì‹ë³„ìž (ì˜ˆ: "1F", "B1") |
| floor_name | VARCHAR(50) | | ì¸µ ëª…ì¹­ (ì˜ˆ: "1ì¸µ ì£¼ë°©") |

---

## 5. ìž¥ë¹„ ê´€ë¦¬

### 5.1 equipment (ì§‘ì§„ìž¥ë¹„ - ESP Device)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| equipment_id | BIGINT (PK, AUTO) | âœ… | ìž¥ë¹„ DB ID |
| equipment_serial | VARCHAR(50) UNIQUE | âœ… | ì§‘ì§„ê¸° ìžì²´ ê³ ìœ ë²ˆí˜¸ (ìˆ˜ë™ ìž…ë ¥) |
| mqtt_equipment_id | VARCHAR(50) UNIQUE | âœ… | MQTTìš© ìž¥ë¹„ ì‹ë³„ìž (ì˜ˆ: "esp-001") |
| store_id | BIGINT (FK â†’ stores) | | ì„¤ì¹˜ ë§¤ìž¥ ID (ì„ íƒ) |
| floor_id | BIGINT (FK â†’ store_floors) | | ì„¤ì¹˜ ì¸µ ID (ì„ íƒ) |
| equipment_name | VARCHAR(100) | | ìž¥ë¹„ëª… (ìˆ˜ë™ ìž…ë ¥) |
| model_id | BIGINT (FK â†’ equipment_models) | | ëª¨ë¸ (ë“œë¡­ë‹¤ìš´ ì„ íƒ) |
| cell_type | VARCHAR(100) | | ì…€ íƒ€ìž… (ìˆ˜ë™ ìž…ë ¥) |
| powerpack_count | INT DEFAULT 1 | | íŒŒì›ŒíŒ© ê°œìˆ˜ (CHECK â‰¤ 4) |
| purchase_date | DATE | | êµ¬ë§¤ì¼ |
| warranty_end_date | DATE | | ë³´ì¦ ê¸°ê°„ ë§Œë£Œì¼ |
| dealer_id | BIGINT (FK â†’ users) | | ë‹´ë‹¹ ëŒ€ë¦¬ì  |
| status | ENUM('NORMAL','INSPECTION','CLEANING','INACTIVE') | âœ… | ìš´ìš© ìƒíƒœ |
| connection_status | ENUM('ONLINE','OFFLINE') DEFAULT 'OFFLINE' | | ì—°ê²° ìƒíƒœ |
| last_seen_at | DATETIME | | ìµœê·¼ í†µì‹  ì‹œê° |
| registered_by | BIGINT (FK â†’ users) | âœ… | ë“±ë¡ìž |
| created_at | DATETIME | âœ… | ë“±ë¡ ì¼ì‹œ |
| updated_at | DATETIME | âœ… | ìˆ˜ì • ì¼ì‹œ |

> **v3.0 ë³€ê²½**:
> - cell_type_id (FK â†’ cell_types) â†’ `cell_type` VARCHAR(100) ìˆ˜ë™ ìž…ë ¥ (í”¼ë“œë°± p.36)
> - powerpack_count CHECK â‰¤ 16 â†’ CHECK â‰¤ 4 (í”¼ë“œë°± p.50)
> - registration_date â†’ `purchase_date` ë³µì› (í”¼ë“œë°± p.50: "êµ¬ë§¤ì¼ í•„ìš”")
> - `mqtt_equipment_id` ì¶”ê°€ (MQTT ê·œê²©ì˜ equipment_id ë§¤í•‘ìš©)
> - `dealer_id` ì¶”ê°€ (ë‹´ë‹¹ ê¸°ì‚¬ â†’ ë‹´ë‹¹ ëŒ€ë¦¬ì , í”¼ë“œë°± p.36)

### 5.2 equipment_models (ìž¥ë¹„ ëª¨ë¸ ì°¸ì¡° í…Œì´ë¸”)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| model_id | BIGINT (PK, AUTO) | âœ… | ëª¨ë¸ ID |
| model_name | VARCHAR(100) | âœ… | ëª¨ë¸ëª… |
| manufacturer | VARCHAR(100) | | ì œì¡°ì‚¬ |
| specifications | JSON | | ì‚¬ì–‘ ì •ë³´ |
| is_active | BOOLEAN DEFAULT TRUE | | í™œì„± ì—¬ë¶€ |
| created_at | DATETIME | âœ… | ë“±ë¡ ì¼ì‹œ |

> **v3.0**: cell_types ì°¸ì¡° í…Œì´ë¸” ì‚­ì œë¨ (ìˆ˜ë™ ìž…ë ¥ìœ¼ë¡œ ë³€ê²½)

### 5.3 gateways (ê²Œì´íŠ¸ì›¨ì´)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| gateway_id | BIGINT (PK, AUTO) | âœ… | ê²Œì´íŠ¸ì›¨ì´ DB ID |
| gw_device_id | VARCHAR(50) UNIQUE | âœ… | MQTT í† í”½ìš© ê²Œì´íŠ¸ì›¨ì´ ID (ì˜ˆ: "gw-001") |
| store_id | BIGINT (FK â†’ stores) | âœ… | ì„¤ì¹˜ ë§¤ìž¥ ID |
| floor_id | BIGINT (FK â†’ store_floors) | âœ… | ì„¤ì¹˜ ì¸µ ID |
| mac_address | VARCHAR(20) | | MAC ì£¼ì†Œ |
| firmware_version | VARCHAR(20) | | íŽŒì›¨ì–´ ë²„ì „ |
| controller_count | INT DEFAULT 0 | | ì—°ê²°ëœ ì»¨íŠ¸ë¡¤ëŸ¬ ìˆ˜ (status ë©”ì‹œì§€ì—ì„œ ê°±ì‹ ) |
| status_flags | INT DEFAULT 0 | | Gateway ìƒíƒœ í”Œëž˜ê·¸ (7ë¹„íŠ¸ ë¹„íŠ¸ë§ˆìŠ¤í¬) |
| connection_status | ENUM('ONLINE','OFFLINE') DEFAULT 'OFFLINE' | | ì—°ê²° ìƒíƒœ |
| last_seen_at | DATETIME | | ìµœê·¼ status ë©”ì‹œì§€ ìˆ˜ì‹  ì‹œê° |
| created_at | DATETIME | âœ… | ë“±ë¡ ì¼ì‹œ |

> **v3.0 ë³€ê²½**:
> - heartbeat_interval, heartbeat_last_received ì‚­ì œ (heartbeat í† í”½ ì—†ìŒ)
> - error_code ì‚­ì œ (MQTT ê·œê²©ì— ì—†ìŒ)
> - ì—°ê²° ìƒíƒœ íŒë³„: last_seen_at ê¸°ì¤€ **30ì´ˆ** ë¯¸ìˆ˜ì‹  ì‹œ OFFLINE (í”¼ë“œë°± p.38)

**Gateway status_flags ë¹„íŠ¸ ì •ì˜** (MQTT ê·œê²© 260212):

| ë¹„íŠ¸ | ì˜ë¯¸ |
|------|------|
| 0 | SEN55 ì •ìƒ (PM, ì˜¨ìŠµë„, VOC, NOx) |
| 1 | SCD40 ì •ìƒ (CO2) |
| 2 | O3 ì„¼ì„œ ì •ìƒ (SEN0321) |
| 3 | CO ì„¼ì„œ ì •ìƒ (SEN0466) |
| 4 | HCHO ì„¼ì„œ ì •ìƒ (SFA30) |
| 5 | 1ê°œ ì´ìƒ ì»¨íŠ¸ë¡¤ëŸ¬ ì—°ê²°ë¨ |
| 6 | íŽ˜ì–´ë§ ëª¨ë“œ |

### 5.4 controllers (ì»¨íŠ¸ë¡¤ëŸ¬ = íŒŒì›ŒíŒ©)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| controller_id | BIGINT (PK, AUTO) | âœ… | ì»¨íŠ¸ë¡¤ëŸ¬ DB ID |
| ctrl_device_id | VARCHAR(50) UNIQUE | âœ… | MQTTìš© ì»¨íŠ¸ë¡¤ëŸ¬ ID (ì˜ˆ: "ctrl-001") |
| equipment_id | BIGINT (FK â†’ equipment) | âœ… | ì†Œì† ìž¥ë¹„ ID |
| gateway_id | BIGINT (FK â†’ gateways) | âœ… | ì—°ê²° ê²Œì´íŠ¸ì›¨ì´ ID |
| status_flags | INT DEFAULT 0 | | Controller ìƒíƒœ í”Œëž˜ê·¸ (6ë¹„íŠ¸ ë¹„íŠ¸ë§ˆìŠ¤í¬) |
| connection_status | ENUM('ONLINE','OFFLINE') DEFAULT 'OFFLINE' | | ì—°ê²° ìƒíƒœ |
| last_seen_at | DATETIME | | ìµœê·¼ ë°ì´í„° ìˆ˜ì‹  ì‹œê° |
| created_at | DATETIME | âœ… | ë“±ë¡ ì¼ì‹œ |

**Controller status_flags ë¹„íŠ¸ ì •ì˜** (MQTT ê·œê²© 260212):

| ë¹„íŠ¸ | ì˜ë¯¸ |
|------|------|
| 0 | íŒŒì›ŒíŒ© RS-485 í†µì‹  ì •ìƒ |
| 1 | SPS30 (PM2.5) ì„¼ì„œ ì •ìƒ |
| 2 | SDP810 (ì°¨ì••) ì„¼ì„œ ì •ìƒ |
| 3 | ìˆ˜ìœ„ ì„¼ì„œ ì •ìƒ |
| 4 | flo-OAC ëŒí¼ ì»¨íŠ¸ë¡¤ëŸ¬ ì •ìƒ |
| 5 | LS M100 ì¸ë²„í„° ì •ìƒ |

> **v3.0**: powerpacks í…Œì´ë¸” ì‚­ì œ. MQTT ê·œê²©ì—ì„œ controller = íŒŒì›ŒíŒ©ì´ë¯€ë¡œ ë³„ë„ í…Œì´ë¸” ë¶ˆí•„ìš”. equipment.powerpack_countë¡œ ê´€ë¦¬.

---

## 6. ì„¼ì„œ ë°ì´í„° (MQTT â†’ DB ì €ìž¥)

### 6.1 MQTT í† í”½ êµ¬ì¡° (v3.0 â€” MQTT ê·œê²© 260212 í™•ì •)

ê²Œì´íŠ¸ì›¨ì´ ë‹¨ìœ„ë¡œ í† í”½ì„ í†µí•©í•©ë‹ˆë‹¤. ëª¨ë“  ì„¼ì„œ/ìƒíƒœ/ì œì–´ê°€ ê²Œì´íŠ¸ì›¨ì´ í† í”½ í•˜ìœ„ì— ìœ„ì¹˜í•©ë‹ˆë‹¤.

```
metabeans/{site_id}/{floor_id}/gateway/{gw_id}/
â”œâ”€â”€ sensor          # í†µí•© ì„¼ì„œ ë°ì´í„° ë°œí–‰ (10ì´ˆ ì£¼ê¸°)
â”œâ”€â”€ status          # ê²Œì´íŠ¸ì›¨ì´ ìƒíƒœ ë°œí–‰ (10ì´ˆ ì£¼ê¸°)
â”œâ”€â”€ control         # ì œì–´ ëª…ë ¹ ìˆ˜ì‹  (êµ¬ë…)
â”œâ”€â”€ control/ack     # ì œì–´ ëª…ë ¹ ì‘ë‹µ ë°œí–‰
â””â”€â”€ config          # 설정 변경 수신 (구독)
└── config/ack      # 설정 변경 응답 발행
```

**MQTT í†µì‹  ì„¤ì •**:

| íŒŒë¼ë¯¸í„° | ê°’ | ë¹„ê³  |
|---------|------|------|
| QoS | **1** (ëª¨ë“  í† í”½) | AWS IoT Core QoS 2 ë¯¸ì§€ì› |
| Retain | **0** (ë¹„í™œì„±, ëª¨ë“  í† í”½) | 10ì´ˆ ì£¼ê¸° ë°œí–‰ìœ¼ë¡œ ë¶ˆí•„ìš” |
| íƒ€ìž„ìŠ¤íƒ¬í”„ | **Unix epoch (ì´ˆ ë‹¨ìœ„)** | ì„œë²„ UTC ì €ìž¥, í´ë¼ì´ì–¸íŠ¸ ë¡œì»¬ ë³€í™˜ |
| í•„ë“œëª… ê·œì¹™ | ì˜ë¬¸ ì†Œë¬¸ìž + snake_case | |
| ì¸ì¦ | Username/Password | AWS IoT Core |
| ì„¼ì„œê°’ ìŠ¤ì¼€ì¼ | ë³€í™˜ ì—†ì´ ê·¸ëŒ€ë¡œ ì‚¬ìš© | íŽŒì›¨ì–´ê°€ ë‚´ë¶€ ìŠ¤ì¼€ì¼ì„ ì‹¤ì œê°’ìœ¼ë¡œ ë³€í™˜ í›„ ì „ì†¡ |

**v3.0ì—ì„œ ì‚­ì œëœ í† í”½**:
- ~~`metabeans/{site_id}/{floor_id}/controller/{ctrl_id}/sensor`~~ â†’ ê²Œì´íŠ¸ì›¨ì´ sensor ë©”ì‹œì§€ì— í†µí•©
- ~~`metabeans/{site_id}/{floor_id}/gateway/{gw_id}/alarm`~~ â†’ pp_alarm í•„ë“œë¡œ ëŒ€ì²´
- ~~`metabeans/{site_id}/{floor_id}/gateway/{gw_id}/heartbeat`~~ â†’ status í† í”½ìœ¼ë¡œ ëŒ€ì²´
- ~~`metabeans/{site_id}/{floor_id}/gateway/{gw_id}/heartbeat/ack`~~ â†’ ì‚­ì œ

**êµ¬ë… íŒ¨í„´ ì˜ˆì‹œ**:
- íŠ¹ì • ë§¤ìž¥ ì „ì²´: `metabeans/site-001/+/gateway/+/#`
- íŠ¹ì • ì¸µ: `metabeans/site-001/1F/gateway/+/sensor`

### 6.2 sensor ë©”ì‹œì§€ êµ¬ì¡°

**í† í”½**: `metabeans/{site_id}/{floor_id}/gateway/{gw_id}/sensor`  
**ì£¼ê¸°**: 10ì´ˆ  
**ë°©í–¥**: Gateway â†’ Cloud

Gateway IAQ ë°ì´í„°ì™€ ëª¨ë“  í•˜ìœ„ equipment/controller ë°ì´í„°ë¥¼ **í•˜ë‚˜ì˜ ë©”ì‹œì§€ë¡œ í†µí•©** ë°œí–‰:

```json
{
  "gateway_id": "gw-001",
  "timestamp": 1234567890,
  "iaq": {
    "pm1_0": 12.5, "pm2_5": 25.0, "pm4_0": 30.0, "pm10": 35.0,
    "temperature": 24.5, "humidity": 65.0,
    "voc_index": 100, "nox_index": 50,
    "co2": 450, "o3": 25, "co": 1.2, "hcho": 30
  },
  "equipments": [
    {
      "equipment_id": "esp-001",
      "controllers": [
        {
          "controller_id": "ctrl-001",
          "timestamp": 1234567885,
          "pm2_5": 25.0, "pm10": 35.0,
          "diff_pressure": 12.0, "oil_level": 50.0,
          "pp_temp": 45, "pp_spark": 0, "pp_power": 1, "pp_alarm": 0,
          "fan_speed": 2, "fan_mode": 0, "damper_mode": 0,
          "flow": 850.0, "damper": 75.0,
          "inlet_temp": 22.5, "velocity": 8.3, "duct_dp": 245.0,
          "status_flags": 63
        }
      ]
    }
  ]
}
```

**íŽ˜ì´ë¡œë“œ í¬ê¸° ì˜ˆìƒ**:

| êµ¬ì„± | ì˜ˆìƒ í¬ê¸° |
|------|---------|
| Gateway IAQë§Œ | ~300 bytes |
| Equipment 1ëŒ€ Ã— Controller 2ëŒ€ | ~600 bytes |
| Equipment 3ëŒ€ Ã— Controller 4ëŒ€ | ~3.5 KB |
| ìµœëŒ€ (Equipment 5ëŒ€ Ã— Controller 4ëŒ€) | ~6 KB |

### 6.3 gateway_sensor_data (ê²Œì´íŠ¸ì›¨ì´ IAQ ì„¼ì„œ ë°ì´í„°)

sensor ë©”ì‹œì§€ì˜ ìµœìƒìœ„ + iaq í•„ë“œë¥¼ ì €ìž¥í•©ë‹ˆë‹¤.

| ì»¬ëŸ¼ëª… | íƒ€ìž… | ë‹¨ìœ„ | ì„¤ëª… |
|--------|------|------|------|
| data_id | BIGINT (PK, AUTO) | - | ë°ì´í„° ID |
| gateway_id | BIGINT (FK â†’ gateways) | - | ê²Œì´íŠ¸ì›¨ì´ ID |
| timestamp | INT UNSIGNED | epochì´ˆ | ë©”ì‹œì§€ ë°œí–‰ ì‹œê°„ |
| received_at | DATETIME | - | ì„œë²„ ìˆ˜ì‹  ì‹œê° |
| pm1_0 | FLOAT | Âµg/mÂ³ | PM1.0 ë†ë„ |
| pm2_5 | FLOAT | Âµg/mÂ³ | PM2.5 ë†ë„ |
| pm4_0 | FLOAT | Âµg/mÂ³ | PM4.0 ë†ë„ |
| pm10 | FLOAT | Âµg/mÂ³ | PM10 ë†ë„ |
| temperature | FLOAT | Â°C | ì˜¨ë„ |
| humidity | FLOAT | % | ìŠµë„ |
| voc_index | INT NULL | - | VOC ì§€ìˆ˜ (1-500, ì›Œë°ì—… ì¤‘ null) |
| nox_index | INT NULL | - | NOx ì§€ìˆ˜ (1-500, ì›Œë°ì—… ì¤‘ null) |
| co2 | INT | ppm | CO2 ë†ë„ |
| o3 | INT | ppb | ì˜¤ì¡´ ë†ë„ |
| co | FLOAT | ppm | ì¼ì‚°í™”íƒ„ì†Œ ë†ë„ |
| hcho | INT | ppb | í¬ë¦„ì•Œë°ížˆë“œ ë†ë„ |

**ì¸ë±ìŠ¤**: `(gateway_id, timestamp)` â€” íŒŒí‹°ì…”ë‹ í‚¤

### 6.4 controller_sensor_data (ì»¨íŠ¸ë¡¤ëŸ¬ ì„¼ì„œ ë°ì´í„°)

sensor ë©”ì‹œì§€ì˜ equipments[].controllers[] í•„ë“œë¥¼ ì €ìž¥í•©ë‹ˆë‹¤.

| ì»¬ëŸ¼ëª… | íƒ€ìž… | ë‹¨ìœ„ | ì„¤ëª… |
|--------|------|------|------|
| data_id | BIGINT (PK, AUTO) | - | ë°ì´í„° ID |
| controller_id | BIGINT (FK â†’ controllers) | - | ì»¨íŠ¸ë¡¤ëŸ¬ DB ID |
| equipment_id | BIGINT (FK â†’ equipment) | - | ì†Œì† ìž¥ë¹„ DB ID |
| gateway_id | BIGINT (FK â†’ gateways) | - | ê²Œì´íŠ¸ì›¨ì´ DB ID |
| timestamp | INT UNSIGNED | epochì´ˆ | ì»¨íŠ¸ë¡¤ëŸ¬ ë°ì´í„° ìˆ˜ì‹  ì‹œê°„ |
| received_at | DATETIME | - | ì„œë²„ ìˆ˜ì‹  ì‹œê° |
| pm2_5 | FLOAT | Âµg/mÂ³ | ë°°ì¶œë¶€ PM2.5 ë†ë„ |
| pm10 | FLOAT | Âµg/mÂ³ | ë°°ì¶œë¶€ PM10 ë†ë„ |
| diff_pressure | FLOAT | Pa | ESP ì§‘ì§„ë¶€ ì°¨ì•• |
| oil_level | FLOAT | % | ì˜¤ì¼ ìˆ˜ìœ„ (0-100) |
| pp_temp | INT | Â°C | íŒŒì›ŒíŒ© ì˜¨ë„ (ì •ìˆ˜) |
| pp_spark | INT | - | ìŠ¤íŒŒí¬ ìˆ˜ì¹˜ (0-99) |
| pp_power | INT | - | ì „ì› ìƒíƒœ (0=OFF, 1=ON) |
| pp_alarm | INT | - | íŒŒì›ŒíŒ© ì•ŒëžŒ (0=ì •ìƒ, 1=ì•ŒëžŒ) |
| fan_speed | INT | - | 팬 속도 단계 (0=OFF, 1=LOW, 2=MID, 3=HIGH), **수동 모드에서만 유의미** |
| fan_mode | INT | - | **v3.1** 팬 제어 모드 (0=수동, 1=자동) |
| damper_mode | INT | - | **v3.1** 댐퍼 제어 모드 (0=수동, 1=자동) |
| flow | FLOAT | CMH | í’ëŸ‰ (flo-OAC í˜„ìž¬ìœ ëŸ‰) |
| damper | FLOAT | % | ëŒí¼ ê°œë„ìœ¨ (0-100) |
| inlet_temp | FLOAT | Â°C | ìœ ìž… ì˜¨ë„ (flo-OAC, -20~50) |
| velocity | FLOAT | m/s | í˜„ìž¬ í’ì† (flo-OAC, 0~20.0) |
| duct_dp | FLOAT | Pa | ë•íŠ¸ ì°¨ì•• (flo-OAC, -49~980) |
| status_flags | INT | - | ì»¨íŠ¸ë¡¤ëŸ¬ ìƒíƒœ í”Œëž˜ê·¸ (6ë¹„íŠ¸) |

> **v3.0 ë³€ê²½**:
> - blade_angle ì‚­ì œ â†’ damperë¡œ í†µí•©
> - fan_rpm ì‚­ì œ (MQTT ê·œê²©ì— ì—†ìŒ)
> - scale_weight ì‚­ì œ (MQTT ê·œê²©ì— ì—†ìŒ, ë³„ë„ ì—°ë™ í•„ìš”ì‹œ ì¶”ê°€)
> - **pp_alarm ì¶”ê°€** (MQTT ê·œê²©: ë³„ë„ alarm í† í”½ ëŒ€ì²´)
> - **inlet_temp, velocity, duct_dp ì¶”ê°€** (flo-OAC ë°ì´í„°)
> - pp_temp íƒ€ìž…: FLOAT â†’ **INT** í™•ì •

**ì¸ë±ìŠ¤**: `(controller_id, timestamp)` â€” íŒŒí‹°ì…”ë‹ í‚¤

### 6.5 status ë©”ì‹œì§€ êµ¬ì¡°

**í† í”½**: `metabeans/{site_id}/{floor_id}/gateway/{gw_id}/status`  
**ì£¼ê¸°**: 10ì´ˆ (sensorì™€ ë™ì‹œ)  
**ë°©í–¥**: Gateway â†’ Cloud

```json
{
  "gateway_id": "gw-001",
  "status_flags": 63,
  "controller_count": 3,
  "timestamp": 1234567890
}
```

> ì„œë²„ëŠ” status ë©”ì‹œì§€ë¥¼ ìˆ˜ì‹ í•  ë•Œë§ˆë‹¤ gateways.last_seen_atì„ ê°±ì‹ í•©ë‹ˆë‹¤. 30ì´ˆ ì´ìƒ ë¯¸ìˆ˜ì‹  ì‹œ connection_status = 'OFFLINE'ìœ¼ë¡œ ì „í™˜í•©ë‹ˆë‹¤ (í”¼ë“œë°± p.38).

### 6.6 IAQ ìƒíƒœ íŒë‹¨ ê¸°ì¤€ (ì†Œí”„íŠ¸ì›¨ì–´ ì—°ì‚°)

| ì¸¡ì • í•­ëª© | ë‹¨ìœ„ | ì¢‹ìŒ (Green) | ë³´í†µ (Yellow) | ë‚˜ì¨ (Red) | í™˜ê²½ë¶€ ê¸°ì¤€ |
|----------|------|-------------|-------------|------------|-----------|
| PM10 | Âµg/mÂ³ | 0~30 | 31~75 | 76+ | ìœ ì§€ê¸°ì¤€: 75~100 |
| PM2.5 | Âµg/mÂ³ | 0~15 | 16~35 | 36+ | ìœ ì§€ê¸°ì¤€: 35~50 |
| CO2 | ppm | 0~700 | 701~1,000 | 1,001+ | ìœ ì§€ê¸°ì¤€: 1,000 |
| HCHO | ppb | 0~30 | 31~81 | 82+ | ìœ ì§€ê¸°ì¤€: 82 |
| CO | ppm | 0~4 | 5~10 | 11+ | ìœ ì§€ê¸°ì¤€: 10 |
| VOC Index | - | ìˆ˜ì¹˜ë§Œ ì¶œë ¥ | | | ìƒëŒ€ ë³€í™” ì§€ìˆ˜ |
| O3 | ppb | ìˆ˜ì¹˜ë§Œ ì¶œë ¥ | | | |

> **v3.0**: ì‹¤ë‚´ê³µê¸°ì§ˆ ì •ë³´ëŠ” ì´ìŠˆ/ì•Œë¦¼ì— í‘œì‹œí•˜ì§€ ì•ŠìŒ (í”¼ë“œë°± p.33). ëŒ€ì‹œë³´ë“œ ì°¸ê³  ë°ì´í„°ë¡œë§Œ í™œìš©.

### 6.7 ìž¥ë¹„ ëª¨ë‹ˆí„°ë§ ì§€í‘œ (v3.0 â€” í”¼ë“œë°± p.38~42)

**íŒŒì›ŒíŒ©(ì»¨íŠ¸ë¡¤ëŸ¬)ë³„ ë°ì´í„°**:

| ì§€í‘œ | í•„ë“œ | ì •ìƒ (Green) | ì£¼ì˜ (Yellow) | ìœ„í—˜ (Red) |
|------|------|-------------|-------------|------------|
| ìž¥ë¹„ ì—°ê²° ìƒíƒœ | last_seen_at | ì—°ê²° | - | ëŠê¹€ (30ì´ˆ ë¯¸ìˆ˜ì‹ ) |
| ì „ì› ìƒíƒœ | pp_power | On (1) | - | Off (0) |
| ë³´ë“œ ì˜¨ë„ | pp_temp | ì •ìƒ | ì£¼ì˜ | ìœ„í—˜ |
| ìŠ¤íŒŒí¬ | pp_spark | ì •ìƒ | ì£¼ì˜ | ìœ„í—˜ |
| PM2.5 | pm2_5 | í‘œì‹œ | - | - |
| PM10 | pm10 | í‘œì‹œ | - | - |

**ìž¥ë¹„(ESP)ë³„ ë°ì´í„°**:

| ì§€í‘œ | í•„ë“œ | ì •ìƒ (Green) | ì£¼ì˜ (Yellow) | ìœ„í—˜ (Red) |
|------|------|-------------|-------------|------------|
| ìœ ìž…ì˜¨ë„ | inlet_temp | ì •ìƒ | 70Â°C ì´ìƒ | 100Â°C ì´ìƒ |
| í’ëŸ‰ | flow | ìˆ˜ì¹˜ í‘œì‹œ | - | - |
| í’ì† | velocity | ìˆ˜ì¹˜ í‘œì‹œ | - | - |
| ë•íŠ¸ ì°¨ì•• | duct_dp | ìˆ˜ì¹˜ í‘œì‹œ | - | - |

**í•„í„° ì ê²€ ìƒíƒœ**: ì •ìƒ(Green) / ì ê²€ í•„ìš”(Yellow)
- ì°¨ì••(diff_pressure) ìˆ˜ì¹˜ í‘œì‹œ
- ìƒíƒœ ë³€ê²½ ì•Œë¦¼ ë©”ì‹œì§€: "í•„í„° ì ê²€ í•„ìš”: ìŠ¤íŒŒí¬ ë°œìƒ ë¶€ìœ„ ë° í•„í„° ì˜¤ì—¼ ìƒíƒœë¥¼ í™•ì¸í•˜ì‹­ì‹œì˜¤."

**ë¨¼ì§€ì œê±° ì„±ëŠ¥**: ì¢‹ìŒ(Green) / ë³´í†µ(Yellow) / ì ê²€ í•„ìš”(Red)
- PM2.5, PM10 ê¸°ì¤€ (êµ¬ì²´ì  ê¸°ì¤€ìˆ˜ì¹˜ëŠ” í‘œì‹œí•˜ì§€ ì•ŠìŒ, í”¼ë“œë°± p.38)

**íìœ  ìˆ˜ì§‘ëŸ‰**: ëžœë¤ ë°ì´í„°(ìž„ì‹œ) â€” ìœ ì¦ í¬ì§‘ëŸ‰ Ã— 2 (í”¼ë“œë°± p.39)

> **v3.0**: ì§€í‘œ ë²”ìœ„ê°€ ì—†ëŠ” ê°’(í’ëŸ‰, í’ì†, ì••ë ¥)ì€ ìˆ˜ì¹˜ë§Œ í‘œì‹œ (í”¼ë“œë°± p.42)

---

## 7. ì•ŒëžŒ/ì•Œë¦¼ ì‹œìŠ¤í…œ

### 7.1 alarm_events (ì•ŒëžŒ ì´ë²¤íŠ¸)

> **v3.0 ë³€ê²½**: MQTT alarm í† í”½ ì‚­ì œë¨. ì•ŒëžŒì€ pp_alarm í•„ë“œ + ì„œë²„ì¸¡ ì—°ì‚°ìœ¼ë¡œ ìƒì„±.

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| alarm_id | BIGINT (PK, AUTO) | âœ… | ì•ŒëžŒ ID |
| store_id | BIGINT (FK â†’ stores) | âœ… | ë°œìƒ ë§¤ìž¥ |
| gateway_id | BIGINT (FK â†’ gateways) | | ë°œìƒ ê²Œì´íŠ¸ì›¨ì´ |
| equipment_id | BIGINT (FK â†’ equipment) | | ë°œìƒ ìž¥ë¹„ |
| controller_id | BIGINT (FK â†’ controllers) | | ë°œìƒ ì»¨íŠ¸ë¡¤ëŸ¬ |
| alarm_type | VARCHAR(50) | âœ… | ì•ŒëžŒ íƒ€ìž… |
| severity | ENUM('YELLOW','RED') | âœ… | ì‹¬ê°ë„ |
| message | VARCHAR(500) | | ì•ŒëžŒ ë©”ì‹œì§€ |
| occurred_at | DATETIME | âœ… | ë°œìƒ ì‹œê° |
| acknowledged_at | DATETIME | | í™•ì¸ ì‹œê° |
| acknowledged_by | BIGINT (FK â†’ users) | | í™•ì¸ìž |
| resolved_at | DATETIME | | í•´ì†Œ ì‹œê° |
| status | ENUM('ACTIVE','ACKNOWLEDGED','RESOLVED') DEFAULT 'ACTIVE' | âœ… | ì•ŒëžŒ ìƒíƒœ |

**alarm_type ì •ì˜ (v3.0 â€” í”¼ë“œë°± p.33~34)**:

| alarm_type | ì§€í‘œ | YELLOW ì¡°ê±´ | RED ì¡°ê±´ |
|-----------|------|------------|---------|
| `COMM_ERROR` | ìž¥ë¹„ ì—°ê²° ìƒíƒœ | ëŠê¹€ 30ì´ˆ ì´ìƒ ì§€ì† | ëŠê¹€ 1ì‹œê°„ ì´ìƒ ì§€ì† |
| `INLET_TEMP_ABNORMAL` | ìœ ìž…ì˜¨ë„ | 70Â°C ì´ìƒ | 100Â°C ì´ìƒ |
| `FILTER_CHECK` | í•„í„° ì ê²€ ìƒíƒœ | ì ê²€ í•„ìš” | - |
| `DUST_REMOVAL_CHECK` | ë¨¼ì§€ì œê±° ì„±ëŠ¥ | - | ì ê²€ í•„ìš” |
| `PP_ALARM` | pp_alarm í•„ë“œ | - | pp_alarm = 1 |

**ëŒ€ì‹œë³´ë“œ í‘œì‹œ ê·œì¹™**:
- **ë¬¸ì œ ë°œìƒ ì´ìŠˆ**: YELLOW + RED ëª¨ë‘ í‘œì‹œ (í”¼ë“œë°± p.33)
- **ê¸´ê¸‰ ì•ŒëžŒ**: REDë§Œ í‘œì‹œ + ê´€ë¦¬ìž ì´ë©”ì¼ ë°œì†¡ (í”¼ë“œë°± p.34)
- **ì‹¤ë‚´ê³µê¸°ì§ˆ**: ì´ìŠˆ/ì•Œë¦¼ì— í‘œì‹œí•˜ì§€ ì•ŠìŒ (í”¼ë“œë°± p.33)

### 7.2 alarm_deletions (ì•ŒëžŒ ì‚­ì œ ì´ë ¥)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| deletion_id | BIGINT (PK, AUTO) | âœ… | ì‚­ì œ ID |
| alarm_id | BIGINT (FK â†’ alarm_events) | âœ… | ëŒ€ìƒ ì•ŒëžŒ |
| deleted_by | BIGINT (FK â†’ users) | âœ… | ì‚­ì œí•œ ì‚¬ìš©ìž |
| deleted_at | DATETIME | âœ… | ì‚­ì œ ì¼ì‹œ |

### 7.3 notification_settings (ì•Œë¦¼ ì„¤ì •)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| setting_id | BIGINT (PK, AUTO) | âœ… | ì„¤ì • ID |
| user_id | BIGINT (FK â†’ users) | âœ… | ì‚¬ìš©ìž ID |
| alarm_type | VARCHAR(50) | âœ… | ì•ŒëžŒ íƒ€ìž… |
| push_enabled | BOOLEAN DEFAULT TRUE | | í‘¸ì‹œ ì•Œë¦¼ |
| sms_enabled | BOOLEAN DEFAULT FALSE | | SMS ì•Œë¦¼ |
| email_enabled | BOOLEAN DEFAULT FALSE | | ì´ë©”ì¼ ì•Œë¦¼ |

---

## 8. ì œì–´ ëª…ë ¹ ë° ì´ë ¥

### 8.1 MQTT ì œì–´ ëª…ë ¹ (v3.0 â€” MQTT ê·œê²© 260212)

**í† í”½**: `metabeans/{site_id}/{floor_id}/gateway/{gw_id}/control`  
**ë°©í–¥**: Cloud â†’ Gateway

**ê°œë³„ ì œì–´**:
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

**ì¼ê´„ ì œì–´** (MQTT ê·œê²©):

| equipment_id | controller_id | ë²”ìœ„ |
|-------------|--------------|------|
| "all" | "all" | ê²Œì´íŠ¸ì›¨ì´ í•˜ìœ„ ì „ì²´ ì»¨íŠ¸ë¡¤ëŸ¬ |
| "esp-001" | "all" | í•´ë‹¹ ì§‘ì§„ê¸° í•˜ìœ„ ì»¨íŠ¸ë¡¤ëŸ¬ë§Œ |
| "esp-001" | "ctrl-001" | íŠ¹ì • ì»¨íŠ¸ë¡¤ëŸ¬ ì§€ì • |

**ì œì–´ ëŒ€ìƒ (target) ë° ì•¡ì…˜ (action)**:

**target=0: íŒŒì›ŒíŒ© (Powerpack)**

| action | value | ì„¤ëª… |
|--------|-------|------|
| 0 | - | íŒŒì›ŒíŒ© OFF |
| 1 | - | íŒŒì›ŒíŒ© ON |
| 2 | - | íŒŒì›ŒíŒ© ë¦¬ì…‹ |

**target=1: ëŒí¼ (Damper / flo-OAC)**

| action | value | ì„¤ëª… |
|--------|-------|------|
| 1 | 0-100 (int) | 댐퍼 개도율 설정 (%, 수동 모드) |
| 2 | 0 또는 1 (int) | **v3.1** 제어 모드 전환 (0=수동, 1=자동) |
| 3 | float (CMH) | **v3.1** 목표 풍량 설정 (자동 모드, 예: 850.0) |

> flo-OAC 하드웨어는 Float 0~100% 연속 제어를 지원. MQTT에서는 정수(0-100)로 전달, 컨트롤러에서 float 변환.
> **v3.1**: action=2로 자동 모드 전환 시 flo-OAC Internal SV 모드 활성화. action=3으로 목표 풍량(CMH) 설정 시 자동 모드가 아니면 자동 전환됨.

**8ë‹¨ê³„ ë§¤í•‘** (í”¼ë“œë°± p.45 â€” ì• í”Œë¦¬ì¼€ì´ì…˜ ë ˆë²¨ì—ì„œ ì²˜ë¦¬):

| ë‹¨ê³„ | ê°œë„ìœ¨ | MQTT value |
|------|-------|-----------|
| 0ë‹¨ê³„ | 0% | 0 |
| 1ë‹¨ê³„ | 10% | 10 |
| 2ë‹¨ê³„ | 25% | 25 |
| 3ë‹¨ê³„ | 40% | 40 |
| 4ë‹¨ê³„ | 60% | 60 |
| 5ë‹¨ê³„ | 75% | 75 |
| 6ë‹¨ê³„ | 90% | 90 |
| 7ë‹¨ê³„ | 100% | 100 |

**target=2: ì‹œë¡œì½”íŒ¬ (Fan)**

| action | value | ì„¤ëª… |
|--------|-------|------|
| 0 | - | íŒ¬ OFF |
| 1 | - | íŒ¬ LOW (í•˜) |
| 2 | - | íŒ¬ MID (ì¤‘) |
| 3 | - | 팬 HIGH (상, 50Hz) |
| 4 | 0 또는 1 (int) | **v3.1** 제어 모드 전환 (0=수동, 1=자동) |
| 5 | float (m/s) | **v3.1** 목표 풍속 설정 (자동 모드, 예: 3.5) |

> **v3.0 ë³€ê²½**: target=1 "ë¸”ë ˆì´ë“œ" â†’ "ëŒí¼(flo-OAC)"ë¡œ ë³€ê²½, ìš´ì˜ ì‹œê°„ ì„¤ì • ì‚­ì œ (í”¼ë“œë°± p.43~47)

> **v3.1 변경**: 
> - target=1 댐퍼: action=2(자동/수동 모드 전환), action=3(목표 풍량 CMH 설정) 추가
> - target=2 시로코팬: action=4(자동/수동 모드 전환), action=5(목표 풍속 m/s 설정) 추가
> - value 타입: int → **number** (int 또는 float, 목표 풍량/풍속은 float)
> - 안전 오버라이드: ESTOP/스파크 감지/과온도 알람 시 자동→수동 전환, fan_mode/damper_mode가 0으로 변경됨

### 8.2 MQTT ì œì–´ ì‘ë‹µ

**í† í”½**: `metabeans/{site_id}/{floor_id}/gateway/{gw_id}/control/ack`  
**ë°©í–¥**: Gateway â†’ Cloud

```json
{
  "cmd_id": "550e8400-e29b-41d4-a716-446655440000",
  "result": "success",
  "reason": ""
}
```

### 8.2.1 config 메시지 구조 (v3.1 — MQTT 규격 260213)

**토픽**: `metabeans/{site_id}/{floor_id}/gateway/{gw_id}/config`  
**방향**: Cloud → Gateway  
게이트웨이의 런타임 설정을 원격으로 변경합니다. **부분 업데이트(partial update)** 지원 — 포함된 필드만 변경됩니다.

```json
{
  "cmd_id": "550e8400-e29b-41d4-a716-446655440002",
  "site_id": "site-001",
  "floor_id": "1F",
  "gateway_id": "gw-002",
  "sensor_interval_ms": 5000,
  "mqtt_interval_ms": 10000,
  "mqtt_broker_uri": "mqtts://new-broker.example.com:8883",
  "wifi_ssid": "NewNetwork",
  "wifi_password": "newpass123",
  "reboot": true
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| cmd_id | string | ✅ | 명령 ID (config/ack 매칭용, UUID 권장) |
| site_id | string | | 매장 ID 변경 (NVS 저장, 재부팅 필요) |
| floor_id | string | | 층 ID 변경 (NVS 저장, 재부팅 필요) |
| gateway_id | string | | 게이트웨이 ID 변경 (NVS 저장, 재부팅 필요) |
| sensor_interval_ms | int | | 센서 폴링 주기 (ms, 1000~60000, 기본 5000) |
| mqtt_interval_ms | int | | MQTT 발행 주기 (ms, 5000~60000, 기본 10000) |
| mqtt_broker_uri | string | | MQTT 브로커 URI (NVS 저장, 재부팅 필요) |
| wifi_ssid | string | | Wi-Fi SSID (NVS 저장, 재부팅 필요) |
| wifi_password | string | | Wi-Fi 비밀번호 (NVS 저장, 재부팅 필요) |
| reboot | bool | | true 시 즉시 재부팅 수행 |

**필드 분류**:
- **즉시 적용** (재부팅 불필요): sensor_interval_ms, mqtt_interval_ms
- **NVS 저장 + 재부팅 필요**: site_id, floor_id, gateway_id, mqtt_broker_uri, wifi_ssid, wifi_password

**유효성 검증**:

| 필드 | 검증 규칙 | 실패 시 |
|------|---------|---------|
| sensor_interval_ms | 1000 ≤ value ≤ 60000 | "fail" + 사유 |
| mqtt_interval_ms | 5000 ≤ value ≤ 60000 | "fail" + 사유 |
| 문자열 필드 | 빈 문자열 불가 | "fail" + 사유 |
| cmd_id 누락 | - | 메시지 무시 (ACK 불가) |

> 재부팅이 필요한 필드가 변경되면: NVS 저장 → config/ack 발행 (needs_reboot: true) → 1초 대기 후 자동 재부팅

### 8.2.2 config/ack 응답 (v3.1 — MQTT 규격 260213)

**토픽**: `metabeans/{site_id}/{floor_id}/gateway/{gw_id}/config/ack`  
**방향**: Gateway → Cloud

```json
{
  "cmd_id": "550e8400-e29b-41d4-a716-446655440002",
  "result": "success",
  "reason": "",
  "needs_reboot": true
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| cmd_id | string | 명령 ID (요청과 매칭) |
| result | string | "success" 또는 "fail" |
| reason | string | 실패 시 사유 (성공 시 빈 문자열) |
| needs_reboot | bool | true이면 ACK 발행 후 자동 재부팅 예정 |

### 8.3 control_commands (ì œì–´ ëª…ë ¹ ì´ë ¥)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| command_id | BIGINT (PK, AUTO) | âœ… | ëª…ë ¹ DB ID |
| cmd_id | VARCHAR(50) UNIQUE | âœ… | MQTT ëª…ë ¹ ID (UUID) |
| store_id | BIGINT (FK â†’ stores) | âœ… | ëŒ€ìƒ ë§¤ìž¥ |
| gateway_id | BIGINT (FK â†’ gateways) | âœ… | ëŒ€ìƒ ê²Œì´íŠ¸ì›¨ì´ |
| equipment_id_mqtt | VARCHAR(50) | âœ… | MQTT equipment_id ("all" ê°€ëŠ¥) |
| controller_id_mqtt | VARCHAR(50) | âœ… | MQTT controller_id ("all" ê°€ëŠ¥) |
| target | INT | âœ… | ì œì–´ ëŒ€ìƒ (0=íŒŒì›ŒíŒ©, 1=ëŒí¼, 2=ì‹œë¡œì½”íŒ¬) |
| action | INT | âœ… | ì•¡ì…˜ ì½”ë“œ |
| value | INT | | ì„¤ì •ê°’ |
| control_mode | ENUM('AUTO','MANUAL') | âœ… | ì œì–´ ë°©ì‹ |
| requested_by | BIGINT (FK â†’ users) | | ìš”ì²­ìž (ìžë™ì¼ ê²½ìš° NULL) |
| result | ENUM('PENDING','SUCCESS','FAIL') DEFAULT 'PENDING' | | ì²˜ë¦¬ ê²°ê³¼ |
| fail_reason | VARCHAR(255) | | ì‹¤íŒ¨ ì‚¬ìœ  |
| requested_at | DATETIME | âœ… | ìš”ì²­ ì‹œê° |
| responded_at | DATETIME | | ì‘ë‹µ ì‹œê° |

> **v3.0 ë³€ê²½**: controller_id FK â†’ `equipment_id_mqtt`, `controller_id_mqtt` VARCHARë¡œ ë³€ê²½ (ì¼ê´„ ì œì–´ "all" ì§€ì›)

### 8.4 damper_auto_settings (ëŒí¼ ìžë™ì œì–´ ì„¤ì •)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| setting_id | BIGINT (PK, AUTO) | âœ… | ì„¤ì • ID |
| equipment_id | BIGINT (FK â†’ equipment) | âœ… | ëŒ€ìƒ ìž¥ë¹„ |
| controller_id | BIGINT (FK â†’ controllers) | | ëŒ€ìƒ ì»¨íŠ¸ë¡¤ëŸ¬ (NULL=ìž¥ë¹„ ì „ì²´) |
| control_mode | ENUM('AUTO','MANUAL') DEFAULT 'AUTO' | âœ… | ì œì–´ ëª¨ë“œ |
| target_flow | FLOAT | | 수동 목표 풍량 (CMH, 댐퍼 자동 제어) |
| target_velocity | FLOAT | | **v3.1** 목표 풍속 (m/s, 시로코팬 자동 제어) |
| fan_control_mode | ENUM('AUTO','MANUAL') DEFAULT 'MANUAL' | | **v3.1** 팬 제어 모드 |
| damper_control_mode | ENUM('AUTO','MANUAL') DEFAULT 'MANUAL' | | **v3.1** 댐퍼 제어 모드 |
| set_by | BIGINT (FK â†’ users) | âœ… | ì„¤ì •ìž |
| updated_at | DATETIME | âœ… | ì„¤ì • ë³€ê²½ ì¼ì‹œ |

> **v3.0 신규** (피드백 p.44): 방화셔터 자동 제어 시 목표 풍량(CMH) 입력. 풍량 입력 권한은 `CONTROL_FLOW_TARGET`으로 관리.
> **v3.1 추가**: `target_velocity` 컬럼 추가 (시로코팬 자동 제어 목표 풍속). `fan_control_mode`, `damper_control_mode` 컬럼 추가.

---

### 8.5 자동 제어 안전 오버라이드 (v3.1 — MQTT 규격 260213)

**안전 오버라이드 동작**:
비상정지(ESTOP), 스파크 감지, 과온도 알람 발생 시 컨트롤러가 자동으로 팬/댐퍼 자동 모드를 해제(수동 전환)합니다.

| 트리거 | 동작 | 확인 방법 |
|--------|------|---------|
| ESTOP (비상정지) | 팬/댐퍼 자동→수동 전환 | fan_mode=0, damper_mode=0 |
| 스파크 감지 | 팬/댐퍼 자동→수동 전환 | fan_mode=0, damper_mode=0 |
| 과온도 알람 | 팬/댐퍼 자동→수동 전환 | fan_mode=0, damper_mode=0 |

**자동→수동 전환 규칙**:
- 모드 전환 명령(댐퍼 action=2 value=0, 팬 action=4 value=0) 전송 시 자동 해제
- 수동 명령(댐퍼 action=1, 팬 action=0~3) 전송 시 자동 모드가 자동 해제
- 안전 오버라이드 발생 시 센서 데이터의 fan_mode, damper_mode 필드가 0으로 변경되어 대시보드에서 확인 가능

**자동 제어 동작 원리**:
- **댐퍼 자동 제어**: flo-OAC 하드웨어가 자체 PID로 댐퍼 개도를 조절. 컨트롤러 펌웨어는 모드 전환(Internal SV 모드 4)과 목표 풍량 전달만 수행.
- **팬 자동 제어**: M100 인버터 내장 PID를 활용. 컨트롤러 펌웨어가 flo-OAC에서 읽은 실측 풍속을 인버터 PID 피드백 레지스터에 주기적으로 전달, 인버터가 목표 풍속과의 오차를 기반으로 주파수를 자동 조절.
- **PID 튜닝**: 팬 PID 게인(P/I/D)은 M100 인버터 파라미터(AP.22~AP.24)로 설정, 현장 환경에 따라 시운전 시 조정 필요.

---

## 9. A/S ê´€ë¦¬

### 9.1 as_requests (A/S ì ‘ìˆ˜)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| request_id | BIGINT (PK, AUTO) | âœ… | ì ‘ìˆ˜ ID |
| store_id | BIGINT (FK â†’ stores) | âœ… | ëŒ€ìƒ ë§¤ìž¥ |
| equipment_id | BIGINT (FK â†’ equipment) | | ëŒ€ìƒ ìž¥ë¹„ |
| requested_by | BIGINT (FK â†’ users) | âœ… | ì ‘ìˆ˜ìž (ë§¤ìž¥ ì ì£¼) |
| issue_type | ENUM('MALFUNCTION','CLEANING','REPLACEMENT','INSPECTION','OTHER') | âœ… | ê³ ìž¥ ìœ í˜• |
| description | TEXT | âœ… | ê³ ìž¥ ë‚´ìš©/ì¦ìƒ |
| preferred_visit_datetime | DATETIME | | ë°©ë¬¸ í¬ë§ ì¼ì‹œ |
| status | ENUM('PENDING','ACCEPTED','ASSIGNED','VISIT_SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED') | âœ… | ì²˜ë¦¬ ìƒíƒœ |
| dealer_id | BIGINT (FK â†’ users) | | ë°°ì • ëŒ€ë¦¬ì  |
| accepted_at | DATETIME | | ì ‘ìˆ˜ ì‹œê° |
| visit_scheduled_datetime | DATETIME | | ë°©ë¬¸ ì˜ˆì • ì¼ì‹œ |
| completed_at | DATETIME | | ì™„ë£Œ ì‹œê° |
| created_at | DATETIME | âœ… | ìƒì„± ì¼ì‹œ |
| updated_at | DATETIME | âœ… | ìˆ˜ì • ì¼ì‹œ |

> **v3.0 ë³€ê²½**: 
> - `preferred_visit_datetime` DATETIMEìœ¼ë¡œ ë³€ê²½ (ë‚ ì§œ+ì‹œê°„ í†µí•©, í”¼ë“œë°± p.56)
> - `visit_scheduled_datetime` DATETIMEìœ¼ë¡œ ë³€ê²½
> - ë°©ë¬¸ ì˜ˆì • ì¼ì‹œ ìœ„ì— ê³ ê° ë°©ë¬¸ í¬ë§ ì¼ì‹œ í‘œì‹œ (UI)
> - ì ‘ìˆ˜ì¼ ë©˜íŠ¸: "ì›í™œí•œ ì„œë¹„ìŠ¤ë¥¼ ìœ„í•´ ì ‘ìˆ˜ì¼ë¡œë¶€í„° 3ì¼~7ì¼ ì´ë‚´ì— ê³ ê° ë°©ë¬¸ ë° ASì²˜ë¦¬ë¥¼ ì§„í–‰í•´ ì£¼ì‹œê¸° ë°”ëžë‹ˆë‹¤." (í”¼ë“œë°± p.56)

### 9.2 as_attachments (A/S ì²¨ë¶€íŒŒì¼)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| attachment_id | BIGINT (PK, AUTO) | âœ… | ì²¨ë¶€íŒŒì¼ ID |
| request_id | BIGINT (FK â†’ as_requests) | âœ… | A/S ì ‘ìˆ˜ ID |
| file_type | ENUM('IMAGE','VIDEO','DOCUMENT') | âœ… | íŒŒì¼ ìœ í˜• |
| file_path | VARCHAR(500) | âœ… | íŒŒì¼ ì €ìž¥ ê²½ë¡œ |
| file_name | VARCHAR(255) | âœ… | ì›ë³¸ íŒŒì¼ëª… |
| uploaded_at | DATETIME | âœ… | ì—…ë¡œë“œ ì¼ì‹œ |

### 9.3 as_reports (A/S ì™„ë£Œ ë³´ê³ ì„œ)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| report_id | BIGINT (PK, AUTO) | âœ… | ë³´ê³ ì„œ ID |
| request_id | BIGINT (FK â†’ as_requests) | âœ… | A/S ì ‘ìˆ˜ ID |
| dealer_id | BIGINT (FK â†’ users) | âœ… | ì²˜ë¦¬ ëŒ€ë¦¬ì  |
| repair_type | ENUM('FILTER_REPLACE','PART_REPLACE','CLEANING','WIRING','OTHER') | âœ… | ìˆ˜ë¦¬ ìœ í˜• |
| repair_description | TEXT | | ìˆ˜ë¦¬ ë‚´ì—­ |
| parts_used | JSON | âœ… | êµì²´ ë¶€í’ˆ ìƒì„¸ (í•„ìˆ˜ ìž…ë ¥) |
| total_parts_cost | DECIMAL(10,2) | | ì´ë¶€í’ˆë¹„ (ì›) |
| created_at | DATETIME | âœ… | ìž‘ì„± ì¼ì‹œ |

**parts_used JSON êµ¬ì¡°** (v3.0 ë³€ê²½ â€” í”¼ë“œë°± p.59):
```json
[
  {"part_name": "í™œì„±íƒ„ í•„í„°", "unit_price": 30000, "quantity": 2},
  {"part_name": "ì „ê·¹íŒ", "unit_price": 50000, "quantity": 1}
]
```
> **v3.0 ë³€ê²½**: 
> - parts_used í•„ìˆ˜ ìž…ë ¥ìœ¼ë¡œ ë³€ê²½, í’ˆëª…/ê°€ê²©/ìˆ˜ëŸ‰ ëª¨ë‘ ê¸°ìž¬ í•„ìˆ˜ (í”¼ë“œë°± p.59)
> - cost â†’ `total_parts_cost` (ì´ë¶€í’ˆë¹„) ë³€ê²½ (í”¼ë“œë°± p.59)

### 9.4 as_report_attachments (ë³´ê³ ì„œ ì²¨ë¶€íŒŒì¼)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| attachment_id | BIGINT (PK, AUTO) | âœ… | ì²¨ë¶€íŒŒì¼ ID |
| report_id | BIGINT (FK â†’ as_reports) | âœ… | ë³´ê³ ì„œ ID |
| file_type | ENUM('IMAGE','VIDEO') | âœ… | íŒŒì¼ ìœ í˜• |
| file_path | VARCHAR(500) | âœ… | íŒŒì¼ ê²½ë¡œ |
| file_name | VARCHAR(255) | âœ… | ì›ë³¸ íŒŒì¼ëª… |
| uploaded_at | DATETIME | âœ… | ì—…ë¡œë“œ ì¼ì‹œ |

---

## 10. ìž¥ë¹„ ì´ë ¥ ê´€ë¦¬

### 10.1 equipment_history (ìž¥ë¹„ ìƒì„¸ ì´ë ¥)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| history_id | BIGINT (PK, AUTO) | âœ… | ì´ë ¥ ID |
| equipment_id | BIGINT (FK â†’ equipment) | âœ… | ìž¥ë¹„ ID |
| description | VARCHAR(500) | âœ… | ë‚´ìš© |
| cost | DECIMAL(10,2) | | ë¹„ìš© |
| as_request_id | BIGINT (FK â†’ as_requests) | | ì—°ê´€ A/S ì ‘ìˆ˜ ID |
| spark_value | INT | | ê°ì§€ ì‹œ ìŠ¤íŒŒí¬ í‰ê· ê°’ |
| pressure_value | FLOAT | | ê°ì§€ ì‹œ ì°¨ì••ê°’ |
| occurred_at | DATETIME | âœ… | ë°œìƒ ì¼ì‹œ |

### 10.2 consumable_schedules (ì†Œëª¨í’ˆ êµì²´ ì£¼ê¸° ì„¤ì •)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| schedule_id | BIGINT (PK, AUTO) | âœ… | ìŠ¤ì¼€ì¤„ ID |
| equipment_id | BIGINT (FK â†’ equipment) | âœ… | ìž¥ë¹„ ID |
| consumable_type | VARCHAR(50) | âœ… | ì†Œëª¨í’ˆ ì¢…ë¥˜ |
| replacement_cycle_days | INT | âœ… | êµì²´ ì£¼ê¸° (ì¼) |
| last_replaced_at | DATE | | ìµœê·¼ êµì²´ì¼ |
| next_due_date | DATE | | ë‹¤ìŒ êµì²´ ì˜ˆì •ì¼ |
| alert_days_before | INT DEFAULT 7 | | ë§Œë£Œ ì „ ì•Œë¦¼ ì¼ìˆ˜ |
| created_at | DATETIME | âœ… | ì„¤ì • ì¼ì‹œ |

---

## 11. ê¸°ì¤€ ìˆ˜ì¹˜ ê´€ë¦¬

### 11.1 cleaning_thresholds (ì²­ì†Œ/í•„í„° íŒë‹¨ ê¸°ì¤€ê°’)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| threshold_id | BIGINT (PK, AUTO) | âœ… | ì„¤ì • ID |
| equipment_id | BIGINT (FK â†’ equipment) | âœ… | ëŒ€ìƒ ìž¥ë¹„ |
| spark_threshold | INT DEFAULT 70 | | ìŠ¤íŒŒí¬ ê¸°ì¤€ê°’ (0~99) |
| spark_time_window | INT DEFAULT 600 | | ìŠ¤íŒŒí¬ ê¸°ì¤€ ì‹œê°„ (ì´ˆ, ê¸°ë³¸ 10ë¶„) |
| pressure_base | FLOAT | | ì°¨ì•• ê¸°ì¤€ê°’ (Pa) |
| pressure_rate | FLOAT DEFAULT 10.0 | | ì°¨ì•• ì¦ê°€ìœ¨ ê¸°ì¤€ (%) |
| set_by | BIGINT (FK â†’ users) | âœ… | ì„¤ì •ìž (ê´€ë¦¬ìž) |
| updated_at | DATETIME | âœ… | ì„¤ì • ë³€ê²½ ì¼ì‹œ |

> **v3.0 ë³€ê²½**: `spark_time_window` ì¶”ê°€ (ìŠ¤íŒŒí¬ ê¸°ì¤€ ì‹œê°„ íŠœë‹ ë³€ìˆ˜, í”¼ë“œë°± p.66)

**ì²­ì†Œ í•„ìš” íŒë‹¨ ìˆ˜ì‹**:
```
ì²­ì†Œí•„ìš” = (ìµœê·¼ spark_time_window ì´ˆ ë™ì•ˆ ìŠ¤íŒŒí¬ í‰ê·  â‰¥ spark_threshold)
         AND (í˜„ìž¬ ì°¨ì•• â‰¥ pressure_base Ã— (1 + pressure_rate / 100))
```

### 11.2 monitoring_thresholds (ëª¨ë‹ˆí„°ë§ ì§€í‘œ ê¸°ì¤€ê°’)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| threshold_id | BIGINT (PK, AUTO) | âœ… | ì„¤ì • ID |
| metric_name | VARCHAR(50) | âœ… | ì§€í‘œëª… (ì˜ˆ: "pp_temp", "inlet_temp") |
| yellow_min | FLOAT | | ì£¼ì˜(Yellow) ìµœì†Œê°’ |
| red_min | FLOAT | | ìœ„í—˜(Red) ìµœì†Œê°’ |
| description | VARCHAR(255) | | ì„¤ëª… |
| set_by | BIGINT (FK â†’ users) | âœ… | ì„¤ì •ìž |
| updated_at | DATETIME | âœ… | ì„¤ì • ì¼ì‹œ |

**ê¸°ë³¸ê°’** (í”¼ë“œë°± p.38~42):

| metric_name | yellow_min | red_min | ë¹„ê³  |
|------------|-----------|---------|------|
| inlet_temp | 70.0 | 100.0 | ìœ ìž…ì˜¨ë„ (Â°C) |
| pp_temp | TBD | TBD | ë³´ë“œì˜¨ë„ (Â°C) |
| pp_spark | TBD | TBD | ìŠ¤íŒŒí¬ (0-99) |

---

## 12. ESG ì§€í‘œ

### 12.1 esg_metrics (ESG ì§€í‘œ ë°ì´í„°)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| metric_id | BIGINT (PK, AUTO) | âœ… | ì§€í‘œ ID |
| store_id | BIGINT (FK â†’ stores) | âœ… | ë§¤ìž¥ ID |
| equipment_id | BIGINT (FK â†’ equipment) | âœ… | ìž¥ë¹„ ID |
| date | DATE | âœ… | ì¸¡ì • ë‚ ì§œ |
| oil_collected_volume | FLOAT | | ìœ ì¦ í¬ì§‘ëŸ‰ (L) |
| waste_oil_collected | FLOAT | | íìœ  ìˆ˜ì§‘ëŸ‰ (L) â€” ìž„ì‹œ: ìœ ì¦ í¬ì§‘ëŸ‰ Ã— 2 |
| total_collected | FLOAT | | í•©ê³„ (L) |
| created_at | DATETIME | âœ… | ìƒì„± ì¼ì‹œ |

> **v3.0**: íìœ  ìˆ˜ì§‘ëŸ‰ì€ ìž„ì‹œë¡œ ìœ ì¦ í¬ì§‘ëŸ‰ Ã— 2 (í”¼ë“œë°± p.39). ì¶”í›„ ì‹¤ì œ IoT ì €ìš¸ ì—°ë™ ì‹œ ë°ì´í„°ì…‹ êµ¬ì¶• í•„ìš”.

---

## 13. ì™¸ë¶€ API ì—°ë™

### 13.1 outdoor_air_quality (ì‹¤ì™¸ ê³µê¸°ì§ˆ ìºì‹œ)

| ì»¬ëŸ¼ëª… | íƒ€ìž… | í•„ìˆ˜ | ì„¤ëª… |
|--------|------|------|------|
| record_id | BIGINT (PK, AUTO) | âœ… | ë ˆì½”ë“œ ID |
| station_name | VARCHAR(100) | âœ… | ì¸¡ì •ì†Œëª… |
| region_code | VARCHAR(20) | âœ… | ì§€ì—­ ì½”ë“œ |
| pm10 | FLOAT | | PM10 (Âµg/mÂ³) |
| pm2_5 | FLOAT | | PM2.5 (Âµg/mÂ³) |
| o3 | FLOAT | | ì˜¤ì¡´ (ppm) |
| co | FLOAT | | ì¼ì‚°í™”íƒ„ì†Œ (ppm) |
| no2 | FLOAT | | ì´ì‚°í™”ì§ˆì†Œ (ppm) |
| so2 | FLOAT | | ì´ì‚°í™”í™© (ppm) |
| overall_index | INT | | í†µí•©ëŒ€ê¸°í™˜ê²½ì§€ìˆ˜ |
| measured_at | DATETIME | âœ… | ì¸¡ì • ì‹œê° |
| fetched_at | DATETIME | âœ… | API ì¡°íšŒ ì‹œê° |

---

## 14. ëŒ€ì‹œë³´ë“œ ì´ìŠˆ/ì•Œë¦¼ ê·œì¹™ (v3.0 â€” í”¼ë“œë°± p.33~34)

### 14.1 ë¬¸ì œ ë°œìƒ ì´ìŠˆ (ì£¼ì˜+ìœ„í—˜ ëª¨ë‘ í‘œì‹œ)

| # | ì´ìŠˆ í•­ëª© | ì§€í‘œ | Yellow ì¡°ê±´ | Red ì¡°ê±´ |
|---|---------|------|------------|---------|
| 1 | í†µì‹  ì—°ê²° ìƒíƒœ ì ê²€ | ìž¥ë¹„ ì—°ê²° ìƒíƒœ | ëŠê¹€ 1ì‹œê°„ ì´ìƒ ì§€ì† | ëŠê¹€ í•˜ë£¨ ì´ìƒ ì§€ì† |
| 2 | ìœ ìž… ì˜¨ë„ ì´ìƒ | ìœ ìž…ì˜¨ë„ (inlet_temp) | 70Â°C ì´ìƒ | 100Â°C ì´ìƒ |
| 3 | í•„í„° ì²­ì†Œ ìƒíƒœ ì ê²€ | í•„í„° ì ê²€ ìƒíƒœ | ì ê²€ í•„ìš” | - |
| 4 | ë¨¼ì§€ì œê±° ì„±ëŠ¥ ì ê²€ | ë¨¼ì§€ì œê±° ì„±ëŠ¥ (PM2.5/PM10) | - | ì ê²€ í•„ìš” |

> â€» ì‹¤ë‚´ê³µê¸°ì§ˆ ì •ë³´ëŠ” ì´ìŠˆ/ì•Œë¦¼ì— í‘œì‹œí•˜ì§€ ì•ŠìŒ

### 14.2 ê¸´ê¸‰ ì•ŒëžŒ (Redë§Œ í‘œì‹œ + ì´ë©”ì¼ ë°œì†¡)

| # | ì´ìŠˆ í•­ëª© | Red ì¡°ê±´ |
|---|---------|---------|
| 1 | í†µì‹  ì—°ê²° ìƒíƒœ | ëŠê¹€ í•˜ë£¨ ì´ìƒ ì§€ì† |
| 2 | ìœ ìž… ì˜¨ë„ ì´ìƒ | 100Â°C ì´ìƒ |

> ê¸´ê¸‰ ì•ŒëžŒ ì‹œ ê´€ë¦¬ìžì—ê²Œ ì´ë©”ì¼ ë°œì†¡ (í”¼ë“œë°± p.34)

### 14.3 ìž¥ë¹„ ìƒ‰ìƒ í‘œì‹œ ê·œì¹™ (í”¼ë“œë°± p.27)

- **íŒŒì›ŒíŒ©(ì»¨íŠ¸ë¡¤ëŸ¬)**: ì£¼ì˜(Yellow)/ìœ„í—˜(Red) ë²”ì£¼ë©´ í•´ë‹¹ ìƒ‰ í‘œì‹œ
- **ìž¥ë¹„(Equipment)**: í•˜ìœ„ íŒŒì›ŒíŒ© ì¤‘ ê°€ìž¥ ë†’ì€ ìƒíƒœìƒ‰ í‘œì‹œ (ì£¼ì˜+ìœ„í—˜ ê³µì¡´ì‹œ Red)
- **ê²Œì´íŠ¸ì›¨ì´/ì¸µ**: í•˜ìœ„ ìž¥ë¹„ë“¤ ì¤‘ ê°€ìž¥ ë†’ì€ ìƒíƒœìƒ‰ í‘œì‹œ
  - ë¬¸ì œ ì—†ìœ¼ë©´ Green + "ì •ìƒ ìš´ì˜"
  - ë¬¸ì œ ìžˆìœ¼ë©´ í•´ë‹¹ ìƒ‰ + "ë¬¸ì œ ë°œìƒ"

---

## 15. ë°ì´í„° ê°±ì‹  ì •ì±…

| ë°ì´í„° ìœ í˜• | ê°±ì‹  ë°©ì‹ | ê°±ì‹  ì£¼ê¸° | ë¹„ê³  |
|-----------|---------|---------|------|
| sensor (IAQ + Controller) | ì‹¤ì‹œê°„ | **10ì´ˆ** | MQTT ê·œê²© í™•ì • |
| status (ê²Œì´íŠ¸ì›¨ì´ ìƒíƒœ) | ì‹¤ì‹œê°„ | **10ì´ˆ** (sensorì™€ ë™ì‹œ) | MQTT ê·œê²© í™•ì • |
| ì‹¤ì™¸ ê³µê¸°ì§ˆ | ì£¼ê¸°ì  ë°°ì¹˜ | Airkorea API ì œê³µ ì£¼ê¸° (1ì‹œê°„) | ì™¸ë¶€ API |
| ì œì–´ ëª…ë ¹/ì‘ë‹µ | ì‹¤ì‹œê°„ | ì¦‰ì‹œ | |
| ì•ŒëžŒ íŒì • | ì„œë²„ ì—°ì‚° | ì„¼ì„œ ë°ì´í„° ìˆ˜ì‹  ì‹œ | pp_alarm + ì„œë²„ ë¡œì§ |
| ESG ì§€í‘œ | ì¼ê°„ ë°°ì¹˜ | 1ì¼ 1íšŒ ì§‘ê³„ | |

---

## 16. ë°ì´í„° ë³´ì¡´ ì •ì±…

| ë°ì´í„° ìœ í˜• | ë³´ì¡´ ê¸°ê°„ | ë¹„ê³  |
|-----------|---------|------|
| gateway_sensor_data | ì›ë³¸ 90ì¼, ì§‘ê³„ 5ë…„ | 10ì´ˆ ì›ë³¸ â†’ 1ì‹œê°„ ì§‘ê³„ |
| controller_sensor_data | ì›ë³¸ 90ì¼, ì§‘ê³„ 5ë…„ | 10ì´ˆ ì›ë³¸ â†’ 1ì‹œê°„ ì§‘ê³„ |
| alarm_events | ì˜êµ¬ | ì´ë ¥ ê´€ë¦¬ í•„ìˆ˜ |
| control_commands | ì˜êµ¬ | ê°ì‚¬ ì¶”ì  í•„ìˆ˜ |
| as_requests / as_reports | ì˜êµ¬ | ìž¥ë¹„ ì´ë ¥ ê´€ë¦¬ |
| equipment_history | ì˜êµ¬ | A/S + ì²­ì†Œìƒíƒœ ì´ë ¥ |

> **v3.0**: ì„¼ì„œ ë°ì´í„° ì›ë³¸ ì£¼ê¸° 1ë¶„ â†’ **10ì´ˆ** ë³€ê²½ì— ë”°ë¼ ì €ìž¥ëŸ‰ 6ë°° ì¦ê°€. ì›ë³¸ 90ì¼ ë³´ì¡´ í›„ 1ì‹œê°„ ì§‘ê³„ë¡œ ì „í™˜.

---

## 17. ì—”í‹°í‹° ê´€ê³„ ìš”ì•½

```
users â”€â”¬â”€ user_business_info (1:1)
       â”œâ”€ dealer_profiles (1:1, role=DEALER)
       â”œâ”€ hq_profiles (1:1, role=HQ)
       â”œâ”€ owner_profiles (1:1, role=OWNER)
       â”œâ”€ role_permissions (N:1, role ê¸°ì¤€)
       â””â”€ user_permission_overrides (1:N)

stores â”€â”¬â”€ store_floors (1:N)
        â”œâ”€ equipment (1:N, ì„ íƒì )
        â”œâ”€ gateways (1:N)
        â”œâ”€ alarm_events (1:N)
        â”œâ”€ as_requests (1:N)
        â””â”€ esg_metrics (1:N)

equipment â”€â”¬â”€ controllers (1:N, ìµœëŒ€ 4)
           â”œâ”€ cleaning_thresholds (1:1)
           â”œâ”€ damper_auto_settings (1:N)
           â”œâ”€ equipment_history (1:N)
           â”œâ”€ consumable_schedules (1:N)
           â””â”€ equipment_models (N:1, FK ì°¸ì¡°)

gateways â”€â”¬â”€ controllers (1:N)
          â””â”€ gateway_sensor_data (1:N, ì‹œê³„ì—´)

controllers â”€â”€â”€ controller_sensor_data (1:N, ì‹œê³„ì—´)

as_requests â”€â”¬â”€ as_attachments (1:N)
             â””â”€ as_reports (1:1)
                  â””â”€ as_report_attachments (1:N)
```

**v3.0 ì‚­ì œëœ í…Œì´ë¸”/ì—”í‹°í‹°**:
- ~~cell_types~~ (ìˆ˜ë™ ìž…ë ¥ìœ¼ë¡œ ë³€ê²½)
- ~~powerpacks~~ (controller = íŒŒì›ŒíŒ©ìœ¼ë¡œ í†µí•©)
- ~~fire_control_history~~ (control_commandsë¡œ í†µí•©)
- ~~power_control_history~~ (control_commandsë¡œ í†µí•©)

---

## 18. MySQL DDL ìš”ì•½ (ì£¼ìš” í…Œì´ë¸”)

```sql
-- ì„¼ì„œ ë°ì´í„° íŒŒí‹°ì…”ë‹ (10ì´ˆ ì£¼ê¸° ëŒ€ì‘)
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
    fan_speed INT, fan_mode INT DEFAULT 0, damper_mode INT DEFAULT 0,
    flow FLOAT, damper FLOAT,
    inlet_temp FLOAT, velocity FLOAT, duct_dp FLOAT,
    status_flags INT DEFAULT 0,
    PRIMARY KEY (data_id, received_at),
    INDEX idx_ctrl_ts (controller_id, timestamp)
) PARTITION BY RANGE (TO_DAYS(received_at)) (
    -- ì¼ë³„ íŒŒí‹°ì…˜ ìžë™ ìƒì„± (ìš´ì˜ ìŠ¤í¬ë¦½íŠ¸)
);

-- ìž¥ë¹„ í…Œì´ë¸” (v3.0 ë°˜ì˜)
CREATE TABLE equipment (
    equipment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    equipment_serial VARCHAR(50) UNIQUE NOT NULL,
    mqtt_equipment_id VARCHAR(50) UNIQUE NOT NULL,
    store_id BIGINT,
    floor_id BIGINT,
    equipment_name VARCHAR(100),
    model_id BIGINT,
    cell_type VARCHAR(100),
    powerpack_count INT DEFAULT 1 CHECK (powerpack_count <= 4),
    purchase_date DATE,
    warranty_end_date DATE,
    dealer_id BIGINT,
    status ENUM('NORMAL','INSPECTION','CLEANING','INACTIVE') NOT NULL DEFAULT 'NORMAL',
    connection_status ENUM('ONLINE','OFFLINE') DEFAULT 'OFFLINE',
    last_seen_at DATETIME,
    registered_by BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(store_id),
    FOREIGN KEY (floor_id) REFERENCES store_floors(floor_id),
    FOREIGN KEY (model_id) REFERENCES equipment_models(model_id),
    FOREIGN KEY (dealer_id) REFERENCES users(user_id),
    FOREIGN KEY (registered_by) REFERENCES users(user_id)
);
```

---

*본 문서는 MQTT Payload 규격_260213.pdf, MQTT 토픽 구조 변경 및 협의 사항.pdf, ESP 관리툴_최종피드백_260212.pdf를 최우선 근거로 작성되었습니다. 개발 진행에 따라 변경될 수 있습니다.*
