using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quan4CulinaryTourism.Api.Common.Models;
using Quan4CulinaryTourism.Api.Modules.Content.Entities;
using Quan4CulinaryTourism.Api.Modules.Content.Services;

namespace Quan4CulinaryTourism.Api.Modules.Seeding.Controllers;

[ApiController]
[Route("api/v1/seeding")]
public class SeederController : ControllerBase
{
    private readonly PoiService _poiService;
    private readonly PoiLocalizationService _localizationService;
    private readonly IWebHostEnvironment _env;

    public SeederController(
        PoiService poiService, 
        PoiLocalizationService localizationService, 
        IWebHostEnvironment env)
    {
        _poiService = poiService;
        _localizationService = localizationService;
        _env = env;
    }

    [HttpPost("vinh-khanh")]
    [AllowAnonymous]
    public async Task<IActionResult> SeedVinhKhanh()
    {
        var pois = new List<(
            string Cat, double Lat, double Lng, 
            List<(string Lang, string Name, string Desc, string AudioText)> Localizations
        )>
        {
            (
                "Hải sản", 10.7601, 106.6975,
                new List<(string, string, string, string)> {
                    ("vi", "Ốc Oanh Vĩnh Khánh", "Quán Ốc Oanh là điểm đến cực kỳ nổi tiếng tại phố ẩm thực Vĩnh Khánh. Quán nổi bật với hải sản tươi sống, đặc biệt là càng ghẹ rang muối ớt và ốc hương nướng mắm nhĩ.", "Chào mừng bạn đến với Quán Ốc Oanh Vĩnh Khánh. Nơi đây là thiên đường hải sản đường phố. Món ăn nổi tiếng nhất ở đây là càng ghẹ rang muối ớt siêu cay và ốc hương nướng mắm nhĩ thơm lừng."),
                    ("en", "Oanh Snail Seafood", "Oanh Snail is a highly famous destination on Vinh Khanh food street. The restaurant stands out with fresh seafood, especially chili salt roasted crab claws and grilled sweet snails.", "Welcome to Oanh Snail Seafood. This is a street food paradise. The most famous dishes here are super spicy roasted crab claws and fragrant grilled sweet snails. Pick a seat and enjoy!"),
                    ("zh", "Oanh 海鲜店", "Oanh 海鲜店是永庆美食街上非常著名的景点。该餐厅以新鲜的海鲜而闻名，尤其是椒盐烤蟹钳和烤香螺。", "欢迎来到 Oanh 海鲜店。这里是街头美食的天堂。最著名的菜肴是超辣烤蟹钳和香烤海螺。找个座位好好享受吧！"),
                    ("ja", "オアン海鮮カタツムリ", "オアン海鮮は、ビンカン美食街で非常に有名な場所です。新鮮なシーフード、特にカニ爪のチリソルト焼きや甘貝のグリルが際立っています。", "オアン海鮮へようこそ。ここは屋台のシーフード天国です。最も有名な料理は、超スパイシーなカニ爪のローストと香り高い甘貝のグリルです。席に座って楽しんでください！"),
                    ("ko", "오안 해산물", "오안 해산물은 빈칸 먹자골목에서 매우 유명한 곳입니다. 신선한 해산물, 특히 칠리 소금에 구운 게발톱과 달콤한 달팽이 구이가 눈에 띕니다.", "오안 해산물에 오신 것을 환영합니다. 이곳은 길거리 해산물의 천국입니다. 가장 유명한 요리는 매콤한 게발톱 구이와 향긋한 달팽이 구이입니다. 자리에 앉아 즐겨보세요!"),
                    ("fr", "Fruits de Mer Oanh", "Le restaurant Oanh est une destination très célèbre dans la rue gastronomique Vinh Khanh. Il se distingue par ses fruits de mer frais, en particulier les pinces de crabe grillées au sel de piment et les escargots doux grillés.", "Bienvenue au restaurant Oanh. C'est un paradis de la cuisine de rue. Les plats les plus célèbres ici sont les pinces de crabe grillées super épicées et les escargots doux grillés. Prenez place et savourez !")
                }
            ),
            (
                "Ăn vặt", 10.7610, 106.6980,
                new List<(string, string, string, string)> {
                    ("vi", "Phá Lấu Bò Cô Thảo", "Quán phá lấu lâu đời, nước dùng béo ngậy vị cốt dừa, chấm bánh mì cực ngon.", "Phá Lấu Bò Cô Thảo đã có mặt ở Vĩnh Khánh từ rất lâu. Nước dùng phá lấu được nấu với nước cốt dừa thơm béo, ăn kèm bánh mì nóng giòn."),
                    ("en", "Miss Thao's Beef Offal", "A long-standing beef offal stew shop, rich coconut milk broth, served with delicious bread.", "Miss Thao's Beef Offal has been in Vinh Khanh for a long time. The broth is cooked with fragrant coconut milk, served with hot crispy bread."),
                    ("zh", "Thao 阿姨牛杂", "历史悠久的牛杂汤店，浓郁的椰奶汤，搭配美味的面包。", "Thao 阿姨牛杂在永庆美食街已经很长时间了。汤头是用香浓的椰奶熬制的，搭配热脆的面包。"),
                    ("ja", "タオおばさんの牛モツ煮", "老舗の牛モツ煮込み店。濃厚なココナッツミルクのスープで、美味しいパンと一緒に提供されます。", "タオおばさんの牛モツ煮は、ビンカンで長い歴史があります。スープは香り高いココナッツミルクで煮込まれ、熱々のサクサクしたパンと一緒に提供されます。"),
                    ("ko", "타오 아주머니의 소 내장 스튜", "전통 있는 소 내장 스튜 가게. 진한 코코넛 밀크 국물과 맛있는 빵이 제공됩니다.", "타오 아주머니의 소 내장 스튜는 빈칸에 오랫동안 자리 잡고 있습니다. 향긋한 코코넛 밀크로 끓인 국물과 따뜻하고 바삭한 빵이 함께 제공됩니다."),
                    ("fr", "Le ragoût d'abats de boeuf de Mme Thao", "Un restaurant de ragoût d'abats de bœuf de longue date, avec un bouillon de lait de coco riche, servi avec du pain délicieux.", "Le ragoût de Mme Thao est à Vinh Khanh depuis longtemps. Le bouillon est cuisiné avec du lait de coco parfumé, servi avec du pain chaud et croustillant.")
                }
            ),
            (
                "Ăn vặt", 10.7595, 106.6968,
                new List<(string, string, string, string)> {
                    ("vi", "Súp Cua Hằng", "Súp cua óc heo trứng bắc thảo siêu đầy đặn, nóng hổi. Quán mở từ chiều đến khuya.", "Súp Cua Hằng nổi bật với món súp đặc sánh, ngọt thanh từ xương hầm, có óc heo béo ngậy và trứng bắc thảo thơm lừng."),
                    ("en", "Hang's Crab Soup", "Super full and hot crab soup with pig brain and century egg. Open from afternoon till late night.", "Hang's Crab Soup features a thick, sweet bone broth soup with rich pig brain and fragrant century egg."),
                    ("zh", "Hang 蟹肉汤", "超丰盛的热蟹肉汤，配猪脑和皮蛋。从下午营业到深夜。", "Hang 蟹肉汤以浓郁甜美的骨头汤底、浓郁的猪脑和香喷喷的皮蛋为特色。"),
                    ("ja", "ハンのカニスープ", "豚の脳とピータンが入った、具だくさんで熱々のカニスープ。午後から深夜まで営業しています。", "ハンのカニスープは、豚の脳と香り高いピータンが入った、とろみのある甘い骨スープが特徴です。"),
                    ("ko", "항의 게살 수프", "돼지 뇌와 피단이 들어간 아주 푸짐하고 뜨거운 게살 수프. 오후부터 늦은 밤까지 영업합니다.", "항의 게살 수프는 진하고 달콤한 뼈 국물에 고소한 돼지 뇌와 향긋한 피단이 특징입니다."),
                    ("fr", "Soupe de crabe de Hang", "Soupe de crabe super copieuse et chaude avec cervelle de porc et œuf de cent ans. Ouvert de l'après-midi jusqu'à tard dans la nuit.", "La soupe de crabe de Hang se caractérise par un bouillon d'os épais et doux, avec une riche cervelle de porc et un œuf de cent ans parfumé.")
                }
            )
        };

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var poiImgDir = Path.Combine(webRoot, "media", "pois");
        var audioDir = Path.Combine(webRoot, "media", "audio");
        Directory.CreateDirectory(poiImgDir);
        Directory.CreateDirectory(audioDir);

        using var client = new HttpClient();
        client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");

        var createdCount = 0;
        foreach (var item in pois)
        {
            // Tải ảnh random từ Picsum
            string imgFileName = $"seed_{Guid.NewGuid():N}.jpg";
            string imgPath = Path.Combine(poiImgDir, imgFileName);
            try {
                var imgBytes = await client.GetByteArrayAsync("https://picsum.photos/800/600");
                await System.IO.File.WriteAllBytesAsync(imgPath, imgBytes);
            } catch { /* ignore */ }

            var viLoc = item.Localizations.FirstOrDefault(l => l.Lang == "vi");

            // Tạo POI
            var poi = new Poi
            {
                Name = viLoc.Name ?? "Unknown",
                Category = item.Cat,
                Description = viLoc.Desc ?? "",
                Address = "Đường Vĩnh Khánh, Phường 8, Quận 4, TP.HCM",
                Location = new MongoDB.Driver.GeoJsonObjectModel.GeoJsonPoint<MongoDB.Driver.GeoJsonObjectModel.GeoJson2DGeographicCoordinates>(
                    new MongoDB.Driver.GeoJsonObjectModel.GeoJson2DGeographicCoordinates(item.Lng, item.Lat)
                ),
                Images = new List<string> { $"/media/pois/{imgFileName}" },
                IsActive = true,
                Rating = 4.5,
                RatingCount = 10,
                OwnerId = MongoDB.Bson.ObjectId.GenerateNewId().ToString()
            };
            await _poiService.CreateAsync(poi);

            foreach (var locItem in item.Localizations)
            {
                // Tải Audio TTS
                string audioFileName = $"seed_{Guid.NewGuid():N}_{locItem.Lang}.mp3";
                string audioPath = Path.Combine(audioDir, audioFileName);
                string audioUrl = null;
                try {
                    var ttsUrl = $"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl={locItem.Lang}&q={Uri.EscapeDataString(locItem.AudioText)}";
                    var audioBytes = await client.GetByteArrayAsync(ttsUrl);
                    await System.IO.File.WriteAllBytesAsync(audioPath, audioBytes);
                    audioUrl = $"/media/audio/{audioFileName}";
                } catch { /* ignore */ }

                // Thêm Localization cho Audio
                var loc = new PoiLocalization
                {
                    PoiId = poi.Id,
                    Lang = locItem.Lang,
                    Name = locItem.Name,
                    Description = locItem.Desc,
                    AudioUrl = audioUrl
                };
                await _localizationService.UpsertLocalizationAsync(loc);
            }

            createdCount++;
        }

        return Ok(ApiResponse.Ok($"Đã tạo thành công {createdCount} POI mẫu khu Vĩnh Khánh (kèm ảnh và Audio thực tế)."));
    }
}
