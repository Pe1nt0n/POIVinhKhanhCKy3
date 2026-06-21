# 📋 Product Requirements Document (PRD)

## Hệ Thống Du Lịch Ẩm Thực Quận 4, TP.HCM

### Quan4 Culinary Tourism System — From Scratch

Phiên bản: 1.0 — Ngày: 2026-03-30

Đề tài khóa luận: "Xây dựng hệ thống hướng dẫn du lịch ẩm thực thông minh tại Quận 4, TP.HCM với kiến trúc Modular Monolith và tính năng Offline-First"



## 1. Tổng Quan Sản Phẩm

### 1.1 Mô tả

Hệ thống web PWA (Progressive Web App) hỗ trợ du khách khám phá ẩm thực đặc sắc tại Quận 4, TP.HCM. Ứng dụng cung cấp bản đồ tương tác WebGL, tự động phát hiện và thuyết minh điểm ẩm thực bằng audio theo vị trí thực tế (geofencing), hỗ trợ đa ngôn ngữ với on-demand translation + TTS, và hoạt động offline-first.

### 1.2 Tầm nhìn

Trở thành nền tảng hướng dẫn du lịch ẩm thực thông minh hàng đầu tại Quận 4, kết hợp AI, geolocation, và trải nghiệm offline để du khách có thể khám phá mọi lúc, mọi nơi, bằng mọi ngôn ngữ.

### 1.3 Giá trị cốt lõi

Giá trị

Mô tả

**Context-Aware**

Tự động nhận diện POI gần nhất và thuyết minh theo vị trí thực tế

**Multilingual**

Hỗ trợ 50+ ngôn ngữ qua Edge-TTS + deep-translator, ưu tiên top 5 (`vi/en/zh/ja/ko`)

**Offline-First**

PWA với Service Worker, IndexedDB, PMTiles offline map pack

**AI-Enhanced**

Tự động cải thiện mô tả POI bằng Google Gemini / ProxyPal

**Multi-Role**

3 vai trò: du khách (public), chủ quán (owner), quản trị viên (admin)



## 2. Đối Tượng Người Dùng

### 2.1 Du khách (Public User)

Mô tả: — Khách du lịch hoặc người dân muốn khám phá ẩm thực Q4

Nhu cầu chính: — Duyệt bản đồ, tìm quán ăn gần, nghe thuyết minh tự động, sử dụng offline

Không cần đăng nhập — , consent analytics tùy chọn

### 2.2 Chủ quán (Owner)

Mô tả: — Chủ sở hữu quán ăn/dịch vụ muốn quảng bá trên hệ thống

Nhu cầu chính: — Đăng ký, gửi đề xuất POI, theo dõi KPI, quản lý nội dung POI

Cần đăng ký → admin duyệt → xác minh

### 2.3 Quản trị viên (Admin / Super Admin)

Mô tả: — Người vận hành hệ thống

Nhu cầu chính: — Quản lý POI/users/roles, duyệt submissions, theo dõi analytics, quản lý audio tasks

RBAC + cookie-based auth



## 3. Kiến Trúc Hệ Thống

### 3.1 Tổng quan kiến trúc

graph TB    subgraph "CLIENT — PWA"        A[MapLibre GL WebGL] --> B[Turf.js Client Geo]        C[Service Worker<br/>Workbox + Custom] --> D[IndexedDB Offline]        E[Web Worker<br/>POI Layout Engine]        F[i18next UI Translation]    end    subgraph "BACKEND — FastAPI Modular Monolith"        G[content] --> S[Shared Kernel]        H[audio] --> S        I[admin] --> S        J[localization] --> S        K[ai_advisor] --> S        L[analytics] --> S        M[maps] --> S        N[ui_i18n] --> S    end    subgraph "DATA LAYER"        O[(MongoDB 6.0+<br/>Replica Set)]        P[(Redis<br/>Presence + Rate Limit)]        Q[(MinIO / S3<br/>Object Storage)]    end    A -.-> |HTTPS| G    C -.-> |Cache| D    S --> O    S --> P    S --> Q

### 3.2 Backend — Modular Monolith (backend/app/)

Module

Trạng thái

Files

Endpoint prefix

Mô tả

`content`

✅ Implemented

`router.py`, `service.py`, `schemas.py`, `public_activation.py`

`/api/v1/poi/*`

POI CRUD, load-all, nearby, delta sync, dataset versioning

`audio`

✅ Implemented

`router.py`, `service.py`, `schemas.py`, `task_manager.py`, `task_store.py`

`/api/v1/audio/*`

TTS generation (Edge-TTS), voice catalog, audio task management, pack manifest

`admin`

✅ Implemented

`router.py`, `service.py`, `schemas.py`, `dependencies.py`

`/api/v1/admin/*`, `/api/v1/owner/*`

Auth, user/role/permission management, submissions, audit logs, owner portal

`analytics`

✅ Implemented

`router.py`, `service.py`, `schemas.py`, `store.py`, `worker.py`, `presence_service.py`, `read_service.py`

`/api/v1/analytics/*`

Consent-gated analytics, batch events, presence tracking, read models, aggregation

`ai_advisor`

✅ Implemented

`router.py`, `service.py`, `schemas.py`

`/api/v1/ai/*`

AI enhance description (Gemini/ProxyPal), quota management

`localization`

✅ Implemented

`router.py`, `service.py`, `schemas.py`, `on_demand_service.py`, `rate_limit_service.py`, `warmup_service.py`

`/api/v1/localizations/*`

On-demand translation, warmup, prepare-hotset, rate limiting

`ui_i18n`

✅ Implemented

`router.py`, `service.py`, `source_catalog.py`, `store.py`, `translation_provider.py`

`/api/v1/ui-bundles/*`

Long-tail UI translation bundles

`maps`

✅ Implemented

`router.py`, `service.py`, `schemas.py`

`/api/v1/maps/*`

Offline map pack, manifest, compatibility layer

`geo`

🔲 Planned

`__init__.py`

—

Server-side geo (logic hiện chạy client-side)

`auth_payment`

🔲 Planned

`__init__.py`

—

Thanh toán, voucher

Shared Kernel (backend/app/shared/):

File

Vai trò

`config.py`

Environment config, settings

`database.py`

MongoDB connection, transaction helpers, index management

`media_storage.py`

S3-compatible media storage abstraction

`media_cleanup_jobs.py`

Idempotent media orphan cleanup

`content_dataset_versions.py`

Dataset versioning for delta sync + ETag

`permissions.py`

RBAC permission system

`redis_client.py`

Redis connection for presence/rate-limit

`http_cache.py`

Response cache headers

`request_utils.py`

IP resolution, trusted proxy

`poi_image_storage.py`

POI image upload/management

`weather_service.py`

Weather context for AI

`audio_runtime.py`

Audio file runtime helpers

`runtime_storage.py`

Runtime collection/index preparation

### 3.3 Frontend — React 19 PWA (frontend/src/)

Layer

Files

Vai trò

**Features**

35 files (admin 14, owner 11, public 10)

Admin dashboard/management, Owner portal, Public map app

**Components**

24 files (Common 11, Layout 6, Map 7)

Reusable UI: splash, map, audio player, filters, bottom sheet

**Services**

31 files (8 directories)

GeofenceEngine, NarrationEngine, LocationService, analytics, audio, language, map, offline, repositories

**Store**

5 stores + selectors

`poiStore`, `adminStore`, `mapPackStore`, `offlineBundleStore`, `poiDerivedState` (Zustand)

**Hooks**

5 hooks

`useGeofence`, `useNarration`, `usePWAInstall`, `usePOICacheInvalidationSync`, `usePublicAnalyticsRuntime`

**Workers**

1 worker

`poiLayoutWorker.js` + `poiLayoutEngine.js` — off-thread POI scoring/layout

**i18n**

UiBundleProvider + catalog

Top-5 static, long-tail dynamic, English fallback

**Service Worker**

`sw.js` (23KB)

Custom Workbox: precache, audio cache sharding, pack management, chunk recovery



## 4. Yêu Cầu Chức Năng — Public User

### 4.1 Vòng đời ứng dụng & Startup

ID

Tính năng

Chi tiết

F-USER-01

Khởi động nhanh

Route-level lazy loading, splash screen, SWR cache-first, bootstrap theo `navigator.language`, GPS degrade graceful

F-USER-02

Mở khóa autoplay

Unlock HTML5 audio + TTS sau thao tác chủ động đầu tiên

F-USER-03

Hiển thị trạng thái mạng

`OfflineBanner` — hiển thị online/offline

### 4.2 Tải dữ liệu POI & Cache

ID

Tính năng

Chi tiết

F-USER-04

Load-all POI

SWR: cache-first + background revalidate, delta sync via `updated_after`, `dataset_version` + ETag 304

F-USER-05

Fallback offline

IndexedDB snapshot khi API lỗi/mất mạng

F-USER-06

Auto-sync reconnect

Tự refresh POI khi online lại

F-USER-07

Đồng bộ cache

`serverSyncCursor`/`datasetVersion` per-language, delta upsert + `removed_poi_ids`

### 4.3 Bản đồ & Duyệt POI

ID

Tính năng

Chi tiết

F-USER-08

Interactive WebGL Map

MapLibre GL 5.x, GPS marker, 10 category icons (SVG)

F-USER-10a

Auto-clustering

MapLibre source clustering, bubble count

F-USER-10b

Spider-burst

Radial layout cho POI chồng tọa độ tại max zoom

F-USER-10c

Web Worker layout

Off-thread scoring/spacing/label selection

F-USER-10d

Long-press peek

400ms long-press → preview POI

F-USER-10h

PMTiles protocol

`pmtiles://` cho offline/hybrid mode

F-USER-10i

Offline Map Pack

Full lifecycle: NOT_INSTALLED → DOWNLOADING → VERIFYING → INSTALLED → ACTIVE → STALE/FAILED, SHA-256 integrity, hybrid cloud/offline

F-USER-10j

Highlight POI đang phát

Source B overlay glow + ring, cluster-aware, camera viewport rules

### 4.4 Tìm kiếm, Lọc & Danh sách

ID

Tính năng

Chi tiết

F-USER-11

Tìm theo tên/địa chỉ

Client-side filtering

F-USER-12

Lọc theo danh mục

10 danh mục

F-USER-13

Sắp xếp

Distance, rating, playback relevance

F-USER-13a

Bộ lọc nâng cao

Price range ($, $$, $$$), sort criteria

### 4.5 Geofence & Auto-Narration

ID

Tính năng

Chi tiết

F-USER-14

Phát hiện POI tự động

Reconciliation loop 1s (Turf.js client-side)

F-USER-15

Debounce GPS

Giảm false positive trigger

F-USER-16

Winner selection

Priority-first, distance tie-break; single active narration

F-USER-17

Cooldown/suppression

Chống phát lặp

### 4.6 Audio Pipeline

ID

Tính năng

Chi tiết

F-USER-18

3-tier fallback

Tier 1: static MP3, Tier 2: Cloud TTS (`POST /audio/tts`), Tier 3: Local browser speech

F-USER-20

Pre-emption & resume

Priority-based interrupt, resume support

F-USER-41

Unified audio popup

Single popup, Preparing → Playing states

F-USER-42

Geofence self-heal

Tự phục hồi sau manual stop

### 4.7 Đa ngôn ngữ

ID

Tính năng

Chi tiết

F-USER-26

Hydrate POI theo ngôn ngữ

`load-all?lang={code}`, localized_description/name/audio_url/is_fallback

F-USER-26a

English-ready gate

POI active chỉ public khi EN localization ready

F-USER-26b

UI i18n tách content

Top-5 static bundles + long-tail dynamic via `/ui-bundles/*`

F-USER-28

On-demand translation

`POST /localizations/on-demand` — dịch + TTS runtime

F-USER-32

Splash language selector

Catalog runtime `GET /audio/languages`

F-USER-34

Quick-start English

Vào app ngay bằng English, switch sau

F-USER-35

Switch language prompt

`Switch now` / `Continue English`

F-USER-36a

Hotset-first warmup

Current POI + nearest 2, runtime audio cache

### 4.8 Offline Bundle

ID

Tính năng

Chi tiết

F-USER-53

Audio pack batch download

Worker pool, giới hạn đồng thời, timeout/request

F-USER-54

Atomic switch pack

Manifest version, full sync → activate → cleanup old

F-USER-55

SW read order

Pack cache → runtime cache → network

F-USER-56

Explicit bundle download

User bấm mới tải, không auto-download

### 4.9 Analytics

ID

Tính năng

Chi tiết

F-USER-59

Consent-gated analytics

`anonymous_id` + `session_id` + `page_view_id`, batch from IndexedDB outbox



## 5. Yêu Cầu Chức Năng — Owner

ID

Tính năng

Chi tiết

F-OWNER-01

Đăng ký public

Không cần đăng nhập → `POST /admin/auth/register-owner`

F-OWNER-02

Đăng ký authenticated

User hiện có xin quyền owner

F-OWNER-03

Theo dõi đăng ký

Trạng thái pending/approved/rejected

F-OWNER-04

Dashboard KPI

Tổng POI, views, audio plays, submissions chờ duyệt

F-OWNER-06

Gửi đề xuất POI

Form submission → pending → admin review

F-OWNER-07a

Notification review

Chuông thông báo, trang chi tiết, `admin_note`

F-OWNER-09

Xem POI thuộc sở hữu

Danh sách POI được phân quyền

F-OWNER-10

Cập nhật POI

Submission update → admin approve → apply + queue audio



## 6. Yêu Cầu Chức Năng — Admin

ID

Tính năng

Chi tiết

F-ADMIN-01

Cookie-based auth

JWT + refresh token, httpOnly cookies, bootstrap `/auth/me`

F-ADMIN-03

Dashboard KPI

Animated counters, growth metrics, top POI ranking

F-ADMIN-04

Quản lý POI

CRUD, search, thumbnail, AI enhance, image uploader (max 8, drag-drop)

F-ADMIN-06

Quản lý users

Bảng user với role/status

F-ADMIN-07

Quản lý roles

Role-permission mapping

F-ADMIN-08

Duyệt đăng ký owner

Approve/reject với ghi chú

F-ADMIN-09

Duyệt submissions

Optimistic concurrency (409 Conflict), approve update → queue audio

F-ADMIN-10

Audio tasks

Batch generate đa ngôn ngữ, SSE progress, pause/resume/cancel, Mongo persistence

F-ADMIN-11

AI enhance

Gemini/ProxyPal, role-based quota, multi-key fallback

F-ADMIN-12

Audit logs

Full action history, expandable details



## 7. API Contract — Endpoints Chính

Method

Endpoint

Access

Mô tả

GET

`/api/v1/poi/load-all`

Public

Snapshot POI, `?lang=`, `?updated_after=`, ETag, delta sync

GET

`/api/v1/poi/nearby`

Public

POI gần nhất theo `lat/lng/radius/limit/lang`

POST

`/api/v1/audio/tts`

Public

Synthesize tạm thời, rate-limited

GET

`/api/v1/audio/languages`

Public

Catalog ngôn ngữ nhẹ, startup lane

GET

`/api/v1/audio/pack-manifest`

Public

Manifest offline audio pack

POST

`/api/v1/analytics/collect`

Public (consented)

Batched analytics events

POST

`/api/v1/localizations/on-demand`

Public (rate-limited)

Dịch + TTS on-demand

POST

`/api/v1/localizations/prepare-hotset`

Public

Chuẩn bị hotset nearby POI

GET

`/api/v1/ui-bundles/{locale}`

Public

UI translation bundles

POST

`/api/v1/admin/auth/login`

Public

Admin login (cookie)

GET

`/api/v1/admin/dashboard/stats`

Admin

Analytics read models

POST

`/api/v1/ai/enhance-description`

Admin/Owner verified

AI enhance POI description

GET

`/api/v1/owner/dashboard`

Owner verified

Owner KPI dashboard



## 8. Yêu Cầu Phi Chức Năng

### 8.1 Hiệu năng

Tiêu chí

Yêu cầu

Startup

SWR cache-first, Lighthouse CI assertions (LCP, TBT, CLS)

Map render

WebGL (MapLibre), Web Worker layout, 60fps target

Audio latency

Hotset pre-cache (current + nearest 2), 3-tier fallback

Offline

Service Worker + IndexedDB + PMTiles, pack SHA-256 integrity

Bundle size

Route-level lazy loading, vendor chunking, precache shell tối thiểu

### 8.2 Bảo mật

Tiêu chí

Chi tiết

Auth

JWT + httpOnly cookies, `Secure`+`SameSite`

RBAC

Permission-based access control

Rate limiting

MongoDB shared-state, `30 req/10min/IP`, `TRUSTED_PROXY_CIDRS`

PII

`PII_ENCRYPTION_KEY`, không lưu raw GPS/IP/search text trong analytics

CORS

Exact-origin, cookie-based

Media

Path traversal prevention, extension allowlist, MIME validation

### 8.3 Khả năng mở rộng

Tiêu chí

Chi tiết

Database

MongoDB replica set, transaction support required

Cache/Presence

Redis (presence, rate-limit, coordination)

Media

S3-compatible object storage (MinIO local parity)

Deploy

Docker Compose (dev + prod), Nginx reverse proxy

Monitoring

Sentry SDK (FastAPI)

### 8.4 Khả năng vận hành

Tiêu chí

Chi tiết

DB migrations

`prepare_runtime_storage.py` pre-create indexes/collections

Seed data

`seed_pois_via_admin_api.py` — dùng đúng API flow

Media cutover

`backfill_media_storage.py` — dual-read single-write

Map pack

`publish_map_pack.py` — regenerate manifest/style

Quality gates

`pytest -q` (backend), `npm run verify` (frontend)

Perf benchmark

`npm run perf:benchmark` + `npm run perf:usage`



## 9. Mô Hình Dữ Liệu Chính

### 9.1 POI (Points of Interest)

{  _id: ObjectId,  name: string,  description: string,  category: enum[10 types],  location: { type: "Point", coordinates: [lng, lat] },  address: string,  price_range: "$" | "$$" | "$$$",  rating: number,  priority: number (0 is valid!),  images: string[],  owner_id: ObjectId | null,  is_active: boolean,  activation_requested: boolean,  audio_status: "pending" | "processing" | "done" | "failed",  created_at, updated_at}

### 9.2 POI Localizations

{  poi_id: ObjectId,  lang: string,  description: string (translated),  name: string (translated),  audio_url: string | null,  updated_at}

### 9.3 Audio Tasks (Mongo persist)

{  task_id: string,  poi_id: ObjectId,  status: "queued" | "running" | "paused" | "done" | "failed" | "cancelled",  languages: string[],  progress_percent: number,  heartbeat_at: ISODate,  control_pause_requested, control_cancel_requested,  expires_at (TTL 14 days)}

### 9.4 Analytics (Event-driven)

Collections: analytics_devices, analytics_sessions, analytics_events,             analytics_daily_metrics, analytics_hourly_metrics,             analytics_poi_daily_metrics, analytics_search_daily_metrics,             analytics_identity_links, analytics_jobs



## 10. Trạng Thái Triển Khai

### Module Status

Module

Backend

Frontend

Test Coverage

Content/POI

✅ Full

✅ Full

pytest + Playwright + node tests

Audio/TTS

✅ Full

✅ Full

pytest + node tests

Admin CRUD

✅ Full

✅ Full

pytest

Owner Portal

✅ Full

✅ Full

pytest

Localization

✅ Full

✅ Full

pytest + Playwright

AI Advisor

✅ Full

✅ Full

pytest + Playwright

Analytics

✅ Full

✅ Full

pytest

Maps/Offline

✅ Full

✅ Full

pytest + Playwright

UI i18n

✅ Full

✅ Full

pytest + Playwright

Geo (server)

🔲 Planned

—

—

Auth/Payment

🔲 Planned

—

—



## 11. Góp Ý Cải Thiện

### 🔴 Ưu tiên cao

#

Đề xuất

Lý do

Effort

1

**Hoàn thiện module `geo` server-side**

Geofence hiện chạy hoàn toàn client-side (Turf.js). Có thể thêm server-side geo query (MongoDB `$geoNear`) cho các usecase nearby search nặng, admin analytics theo vùng, và giảm tải client

Medium

2

**Thêm E2E test coverage cho admin/owner flows**

Hiện Playwright chủ yếu cover public user flows. Admin CRUD, owner submit, audit logs chưa có Playwright regression test

Medium

3

**Rate-limit centralization**

`rate_limit_service.py` hiện dùng riêng cho localization. Public TTS cũng cần cùng infra. Nên tách thành shared service dùng chung cho tất cả public endpoints

Low

4

**Auth module `auth_payment` implementation**

Module đã khai báo nhưng rỗng. Cần triển khai tối thiểu: password reset flow, email verification, và có thể OAuth2 cho social login

High

### 🟡 Ưu tiên trung bình

#

Đề xuất

Lý do

Effort

5

**Review & Rating system**

POI hiện có `rating` field nhưng chưa có user-facing review/rating flow. Thêm cho du khách đánh giá sẽ tăng engagement

High

6

**Push Notifications (Web Push)**

Owner nhận notification review qua chuông in-app, nhưng nếu app đang đóng sẽ miss. Web Push sẽ cải thiện UX

Medium

7

**Image optimization pipeline**

POI images hiện upload raw. Nên thêm server-side resize/compress (WebP) + responsive `srcSet` để giảm bandwidth, đặc biệt trên mobile

Medium

8

**Search analytics + recommendations**

`search_executed` events đã thu thập. Nên build recommendation engine từ dữ liệu này (popular searches, trending POI)

Medium

9

**Storybook / Component library**

24 components chưa có documentation riêng. Storybook sẽ giúp maintain UI consistency

Low

10

**CI/CD pipeline**

Repo có quality gates (`pytest`, `npm run verify`) nhưng chưa có GitHub Actions / CI pipeline tự động

Medium

### 🟢 Nice-to-have

#

Đề xuất

Lý do

Effort

11

**Route planning / Itinerary**

Du khách có thể muốn lập lộ trình ăn uống tối ưu qua nhiều POI

High

12

**Social sharing**

Chia sẻ POI yêu thích lên MXH kèm ảnh/review

Low

13

**AR (Augmented Reality) preview**

Hướng camera vào quán → hiện info overlay (WebXR)

Very High

14

**Voucher / Coupon engine**

Module `auth_payment` có thể mở rộng thêm voucher cho owner

Medium

15

**Accessibility (a11y) audit**

Chưa có audit WCAG. Nên kiểm tra screen reader, keyboard navigation, contrast

Low

16

**Export data**

Admin nên có khả năng export POI/analytics ra CSV/Excel

Low

17

**Multi-tenant / Multi-district**

Mở rộng ra các quận khác. Architecture hiện đã modular, chỉ cần parameterize geo boundary

High

### 🛠 Cải thiện kỹ thuật

#

Đề xuất

Chi tiết

18

**TypeScript migration**

Frontend hiện toàn bộ `.js/.jsx`. Thêm TypeScript sẽ giảm runtime bugs đáng kể, đặc biệt cho store/service layer phức tạp

19

**API versioning strategy**

Hiện dùng `/api/v1`. Cần document rõ breaking change policy khi phát triển v2

20

**Caching strategy documentation**

Hệ thống cache rất phức tạp (SW runtime cache, SW pack cache, IndexedDB POI cache, Zustand memory cache, HTTP cache). Cần diagram chính thức

21

**Error boundary UI**

Frontend nên có React Error Boundary cho từng feature area thay vì crash toàn app

22

**Health check endpoint**

Backend nên có `/health` endpoint chuẩn kiểm tra Mongo + Redis + MinIO connectivity

23

**OpenAPI schema export**

FastAPI đã tự generate. Nên dùng để auto-generate TypeScript types cho frontend

24

**Database backup automation**

Checklist có đề cập nhưng chưa có script/cron backup Mongo + Redis



## 12. Điểm Mạnh Của Dự Án

Dự án có nhiều điểm nổi bật so với scope khóa luận thông thường:

Kiến trúc chuyên nghiệp — Modular Monolith rõ ràng, tách biệt router/service/schema, shared kernel

Offline-First PWA hoàn chỉnh — Không chỉ đơn giản cache, mà có full lifecycle: delta sync, pack management, integrity verification, hybrid fallback

Audio pipeline phức tạp — 3-tier fallback, service worker cache sharding per-language, geofence-triggered auto-narration

Multilingual sâu — Không chỉ UI translation, mà content + audio + warmup + hotset + on-demand + fallback chain

Analytics consent-gated — Thiết kế privacy-first với anonymous_id/session_id, consent model, PII protection

Testing portfolio đa dạng — pytest, Playwright, Node.js test runner, LHCI performance benchmarks

Documentation cực chi tiết — FEATURES.md (771 lines), BUSINESS_LOGIC.md (1100 lines), ERRORS.md (1258 lines) — hiếm dự án nào có mức documentation này

Production readiness — Checklist production 330 lines, Docker Compose prod, Nginx config, Sentry, transaction support



## 13. Rủi Ro & Giới Hạn

Rủi ro

Mức độ

Giải pháp

Geofence chỉ client-side

Trung bình

Module `geo` server-side chưa triển khai; client Turf.js phụ thuộc vào accuracy GPS của thiết bị

MongoDB single replica set

Cao (production)

Chưa có sharding strategy; cần plan khi POI scale lên

Edge-TTS dependency

Trung bình

Dịch vụ Microsoft Edge-TTS miễn phí, không có SLA. Nên có fallback provider

No CI/CD

Trung bình

Quality gates thủ công; lỗi có thể lọt nếu dev quên chạy

Frontend size

Thấp

Bundle đã optimize nhưng codebase lớn (~100+ files); maintenance cost tăng dần

PII encryption key rotation

Cao (production)

`PII_ENCRYPTION_KEY` thay đổi sẽ mất dữ liệu đã mã hóa; cần key rotation strategy



Document generated by scanning the entire project codebase: 46 backend modules, 35 frontend features, 31 services, 24 components, 5 stores, 5 hooks, 6 documentation files totaling 4000+ lines.

