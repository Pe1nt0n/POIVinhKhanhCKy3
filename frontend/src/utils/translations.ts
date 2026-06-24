export const translations = {
  vi: {
    foodCourt: "Khu Ẩm Thực Vĩnh Khánh",
    poisLoaded: "POIs",
    scanQr: "Quét QR Ngay",
    backToMap: "Quay lại Bản đồ",
    loading: "Đang tải thông tin địa điểm...",
    discoveryPoint: "Điểm khám phá",
    playingAudio: "Đang phát thuyết minh...",
    tapToListen: "Nhấn để nghe thuyết minh",
    noAudio: "Điểm này hiện chưa có âm thanh thuyết minh.",
    rateThisPlace: "Đánh giá địa điểm này",
    thanksForRating: "Cảm ơn bạn đã đánh giá {0} sao!",
    mockGps: "Mock GPS (Geofencing Test)",
    teleport: "Teleport"
  },
  en: {
    foodCourt: "Vinh Khanh Food Court",
    poisLoaded: "POIs",
    scanQr: "Scan QR Now",
    backToMap: "Back to Map",
    loading: "Loading place information...",
    discoveryPoint: "Discovery Point",
    playingAudio: "Playing audio...",
    tapToListen: "Tap to listen",
    noAudio: "This place doesn't have audio yet.",
    rateThisPlace: "Rate this place",
    thanksForRating: "Thank you for rating {0} stars!",
    mockGps: "Mock GPS (Geofencing Test)",
    teleport: "Teleport"
  },
  zh: {
    foodCourt: "永庆美食街",
    poisLoaded: "地标",
    scanQr: "立即扫码",
    backToMap: "返回地图",
    loading: "正在加载地点信息...",
    discoveryPoint: "探索点",
    playingAudio: "正在播放语音讲解...",
    tapToListen: "点击收听语音讲解",
    noAudio: "该地点暂无语音讲解。",
    rateThisPlace: "评价此地点",
    thanksForRating: "感谢您的 {0} 星评价！",
    mockGps: "模拟GPS",
    teleport: "传送"
  },
  ja: {
    foodCourt: "ビンカイン フードコート",
    poisLoaded: "スポット",
    scanQr: "今すぐQRをスキャン",
    backToMap: "マップに戻る",
    loading: "場所の情報を読み込んでいます...",
    discoveryPoint: "ディスカバリーポイント",
    playingAudio: "音声ガイドを再生中...",
    tapToListen: "タップして音声ガイドを聞く",
    noAudio: "この場所にはまだ音声ガイドがありません。",
    rateThisPlace: "この場所を評価する",
    thanksForRating: "{0}つ星の評価をありがとうございます！",
    mockGps: "GPSシミュレーション",
    teleport: "テレポート"
  },
  ko: {
    foodCourt: "빈칸 푸드코트",
    poisLoaded: "장소",
    scanQr: "QR 스캔하기",
    backToMap: "지도로 돌아가기",
    loading: "장소 정보를 불러오는 중...",
    discoveryPoint: "디스커버리 포인트",
    playingAudio: "오디오 가이드 재생 중...",
    tapToListen: "오디오 가이드 듣기",
    noAudio: "이 장소에는 아직 오디오 가이드가 없습니다.",
    rateThisPlace: "이 장소 평가하기",
    thanksForRating: "{0}점 평가 감사합니다!",
    mockGps: "가상 GPS",
    teleport: "순간이동"
  },
  fr: {
    foodCourt: "Aire de restauration Vinh Khanh",
    poisLoaded: "Lieux",
    scanQr: "Scanner le QR",
    backToMap: "Retour à la carte",
    loading: "Chargement des informations...",
    discoveryPoint: "Point de découverte",
    playingAudio: "Lecture de l'audio...",
    tapToListen: "Appuyez pour écouter l'audio",
    noAudio: "Ce lieu n'a pas encore d'audio.",
    rateThisPlace: "Évaluer ce lieu",
    thanksForRating: "Merci pour votre évaluation de {0} étoiles !",
    mockGps: "Mock GPS",
    teleport: "Téléporter"
  }
};

export type LanguageCode = keyof typeof translations;

export const t = (lang: string, key: keyof typeof translations['vi'], ...args: string[]) => {
  const languageDict = translations[lang as LanguageCode] || translations['vi'];
  let text = languageDict[key] || translations['vi'][key] || key;
  args.forEach((arg, index) => {
    text = text.replace(`{${index}}`, arg);
  });
  return text;
};
