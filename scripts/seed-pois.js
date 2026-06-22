const now = new Date();

const poiNames = [
  "Cổng phố ẩm thực Vĩnh Khánh",
  "Khu ốc Vĩnh Khánh",
  "Điểm hải sản Vĩnh Khánh",
  "Điểm ăn vặt Vĩnh Khánh",
  "Điểm cơm tấm đêm",
  "Điểm chè và nước giải khát",
  "Điểm check-in phố ẩm thực",
  "Trạm QR Khánh Hội"
];

// Xóa dữ liệu mẫu cũ nếu đã seed trước đó
db.pois.deleteMany({
  name: { $in: poiNames }
});

db.pois.insertMany([
  {
    name: "Cổng phố ẩm thực Vĩnh Khánh",
    description: "Đây là điểm bắt đầu hành trình khám phá phố ẩm thực Vĩnh Khánh, nơi tập trung nhiều hàng quán ăn uống đặc trưng về đêm.",
    category: "intro",
    location: {
      type: "Point",
      coordinates: [106.70590, 10.75990]
    },
    address: "Đường Vĩnh Khánh, Quận 4, TP.HCM",
    price_range: "$",
    rating: 4.5,
    priority: 10,
    images: [],
    owner_id: null,
    is_active: true,
    activation_requested: false,
    audio_status: "ready",
    created_at: now,
    updated_at: now
  },
  {
    name: "Khu ốc Vĩnh Khánh",
    description: "Khu vực nổi bật với nhiều món ốc, hải sản và các món ăn đường phố, phù hợp cho nhóm bạn và khách du lịch muốn trải nghiệm ẩm thực địa phương.",
    category: "seafood",
    location: {
      type: "Point",
      coordinates: [106.70630, 10.76020]
    },
    address: "Khu ốc đường Vĩnh Khánh, Quận 4",
    price_range: "$$",
    rating: 4.6,
    priority: 9,
    images: [],
    owner_id: null,
    is_active: true,
    activation_requested: false,
    audio_status: "ready",
    created_at: now,
    updated_at: now
  },
  {
    name: "Điểm hải sản Vĩnh Khánh",
    description: "Điểm thuyết minh giới thiệu nhóm món hải sản phổ biến tại phố ẩm thực Vĩnh Khánh như nghêu, sò, ốc, tôm và các món nướng.",
    category: "seafood",
    location: {
      type: "Point",
      coordinates: [106.70670, 10.76055]
    },
    address: "Đường Vĩnh Khánh, Quận 4",
    price_range: "$$",
    rating: 4.4,
    priority: 8,
    images: [],
    owner_id: null,
    is_active: true,
    activation_requested: false,
    audio_status: "ready",
    created_at: now,
    updated_at: now
  },
  {
    name: "Điểm ăn vặt Vĩnh Khánh",
    description: "Khu vực gợi ý các món ăn vặt, đồ chiên, xiên que, bánh tráng và thức uống phù hợp với học sinh, sinh viên và khách tham quan.",
    category: "street_food",
    location: {
      type: "Point",
      coordinates: [106.70710, 10.76085]
    },
    address: "Đường Vĩnh Khánh, Quận 4",
    price_range: "$",
    rating: 4.3,
    priority: 7,
    images: [],
    owner_id: null,
    is_active: true,
    activation_requested: false,
    audio_status: "ready",
    created_at: now,
    updated_at: now
  },
  {
    name: "Điểm cơm tấm đêm",
    description: "Điểm giới thiệu nhóm món ăn no phổ biến về đêm tại khu Vĩnh Khánh, phù hợp với người dùng muốn tìm bữa ăn nhanh, dễ tiếp cận.",
    category: "rice",
    location: {
      type: "Point",
      coordinates: [106.70555, 10.76040]
    },
    address: "Khu vực gần phố ẩm thực Vĩnh Khánh",
    price_range: "$",
    rating: 4.2,
    priority: 6,
    images: [],
    owner_id: null,
    is_active: true,
    activation_requested: false,
    audio_status: "ready",
    created_at: now,
    updated_at: now
  },
  {
    name: "Điểm chè và nước giải khát",
    description: "Điểm dừng chân cho người dùng sau khi trải nghiệm các món chính, giới thiệu các món chè, sinh tố, trà tắc và nước giải khát.",
    category: "drink",
    location: {
      type: "Point",
      coordinates: [106.70605, 10.76105]
    },
    address: "Đường Vĩnh Khánh, Quận 4",
    price_range: "$",
    rating: 4.1,
    priority: 5,
    images: [],
    owner_id: null,
    is_active: true,
    activation_requested: false,
    audio_status: "ready",
    created_at: now,
    updated_at: now
  },
  {
    name: "Điểm check-in phố ẩm thực",
    description: "Khu vực phù hợp để người dùng dừng lại, chụp ảnh và bắt đầu nghe phần giới thiệu tổng quan về phố ẩm thực Vĩnh Khánh.",
    category: "checkin",
    location: {
      type: "Point",
      coordinates: [106.70575, 10.76125]
    },
    address: "Phố ẩm thực Vĩnh Khánh, Quận 4",
    price_range: "$",
    rating: 4.0,
    priority: 4,
    images: [],
    owner_id: null,
    is_active: true,
    activation_requested: false,
    audio_status: "ready",
    created_at: now,
    updated_at: now
  },
  {
    name: "Trạm QR Khánh Hội",
    description: "Điểm QR gợi ý dành cho người dùng không bật GPS. Khi quét mã QR, người dùng có thể nghe ngay nội dung giới thiệu khu ẩm thực.",
    category: "qr_station",
    location: {
      type: "Point",
      coordinates: [106.70490, 10.75965]
    },
    address: "Khu vực Khánh Hội, Quận 4",
    price_range: "$",
    rating: 4.0,
    priority: 3,
    images: [],
    owner_id: null,
    is_active: true,
    activation_requested: false,
    audio_status: "ready",
    created_at: now,
    updated_at: now
  }
]);

// Tạo index không gian để API nearby hoạt động
db.pois.createIndex({
  location: "2dsphere"
});

// Tăng version dữ liệu để API load-all cập nhật ETag/dataset_version
db.dataset_versions.updateOne(
  { _id: "pois" },
  {
    $inc: { version: 1 },
    $set: { last_updated: now }
  },
  { upsert: true }
);

print("Seeded Vinh Khanh POIs successfully.");