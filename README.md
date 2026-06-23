# Thuyết minh tự động đa ngôn ngữ cho phố ẩm thực Vĩnh Khánh

## 1. Giới thiệu

Dự án xây dựng hệ thống hỗ trợ du khách khám phá phố ẩm thực Vĩnh Khánh thông qua bản đồ số, định vị GPS, geofence và thuyết minh tự động đa ngôn ngữ.

Khi người dùng di chuyển đến gần một điểm ẩm thực, hệ thống tự động phát nội dung thuyết minh bằng audio hoặc Text-to-Speech. Hệ thống cũng hỗ trợ quản trị nội dung POI, audio, bản dịch, QR code và thống kê lượt nghe.

## 2. Chức năng chính

* Hiển thị bản đồ các điểm ẩm thực Vĩnh Khánh.
* Theo dõi vị trí người dùng bằng GPS.
* Kích hoạt thuyết minh khi người dùng đi vào vùng geofence của POI.
* Phát audio hoặc Text-to-Speech theo ngôn ngữ người dùng chọn.
* Quản lý dữ liệu POI thông qua trang quản trị.
* Hỗ trợ QR code để mở nhanh nội dung thuyết minh.
* Ghi nhận thống kê lượt nghe và hành vi sử dụng ẩn danh.
* Hỗ trợ hoạt động offline cơ bản thông qua PWA cache.

## 3. Công nghệ sử dụng

### Frontend

* React
* TypeScript
* Vite
* MapLibre GL
* Turf.js
* Zustand
* PWA

### Backend

* ASP.NET Core API
* MongoDB
* Redis
* JWT Authentication
* Docker

### Triển khai

* Docker Compose
* Nginx Reverse Proxy

## 4. Cài đặt và chạy dự án

### Bước 1: Clone source code

```bash
git clone https://github.com/Pe1nt0n/POIVinhKhanhCKy3.git
cd POIVinhKhanhCKy3
```

### Bước 2: Tạo file môi trường

```bash
cp .env.example .env
```

### Bước 3: Chạy bằng Docker

```bash
docker compose up --build
```

Sau khi chạy thành công, mở trình duyệt tại:

```text
http://localhost
```

## 5. Cấu trúc thư mục

```text
POIVinhKhanhCKy3/
├── backend/        # Backend ASP.NET Core API
├── frontend/       # Frontend React PWA
├── ideas/          # Tài liệu ý tưởng, PRD, slide
├── docker-compose.yml
├── .env.example
└── README.md
```

## 6. Định hướng hoàn thiện MVP

Các module cần hoàn thiện:

1. Quản lý dữ liệu POI.
2. Bản đồ và hiển thị điểm thuyết minh.
3. GPS tracking.
4. Geofence Engine.
5. Narration Engine.
6. CMS quản trị nội dung.
7. QR code kích hoạt nội dung.
8. Analytics thống kê lượt nghe.
9. Offline cache.
10. Tài liệu báo cáo và video demo.

## 7. Ghi chú

Dự án đang trong quá trình hoàn thiện MVP phục vụ demo và báo cáo học phần/khóa luận.
