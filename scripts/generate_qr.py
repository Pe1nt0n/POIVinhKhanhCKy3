import os
import qrcode

# SỬA IP NÀY THÀNH IP MÁY CỦA BẠN
BASE_URL = "http://192.168.1.33"

QR_ITEMS = [
    {
        "filename": "qr_intro.png",
        "title": "Cổng phố ẩm thực Vĩnh Khánh",
        "url": f"{BASE_URL}/audio/poi_intro_vi.mp3"
    },
    {
        "filename": "qr_seafood.png",
        "title": "Khu ốc Vĩnh Khánh",
        "url": f"{BASE_URL}/audio/poi_seafood_vi.mp3"
    },
    {
        "filename": "qr_streetfood.png",
        "title": "Điểm ăn vặt Vĩnh Khánh",
        "url": f"{BASE_URL}/audio/poi_streetfood_vi.mp3"
    },
    {
        "filename": "qr_intro_default.png",
        "title": "Thuyết minh tổng quan Vĩnh Khánh",
        "url": f"{BASE_URL}/audio/vk_intro.mp3"
    }
]

OUTPUT_DIR = "frontend/public/qr"
os.makedirs(OUTPUT_DIR, exist_ok=True)

for item in QR_ITEMS:
    img = qrcode.make(item["url"])
    output_path = os.path.join(OUTPUT_DIR, item["filename"])
    img.save(output_path)

    print(f"Created: {output_path}")
    print(f"Title: {item['title']}")
    print(f"URL: {item['url']}")
    print("---")
