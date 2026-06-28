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
            ),
            (
                "Ăn vặt", 10.7602, 106.6972,
                new List<(string, string, string, string)> {
                    ("vi", "Bánh Tráng Nướng Đà Lạt", "Bánh tráng nướng giòn rụm với đủ loại topping như xúc xích, phô mai, mỡ hành. Hương vị Đà Lạt giữa lòng Sài Gòn.", "Bánh tráng nướng Đà Lạt là món ăn vặt không thể bỏ qua. Chiếc bánh giòn tan với phô mai béo ngậy và mỡ hành thơm lừng chắc chắn sẽ làm bạn hài lòng."),
                    ("en", "Da Lat Grilled Rice Paper", "Crispy grilled rice paper with various toppings like sausage, cheese, and scallion oil. Da Lat flavor in the heart of Saigon.", "Da Lat Grilled Rice Paper is a must-try snack. The crispy rice paper with rich cheese and fragrant scallion oil will surely satisfy you."),
                    ("zh", "大叻烤米纸", "酥脆的烤米纸，配有香肠、奶酪和葱油等各种配料。西贡中心的大叻风味。", "大叻烤米纸是必尝的小吃。酥脆的米纸配上浓郁的奶酪和香喷喷的葱油，一定会让您满意。"),
                    ("ja", "ダラット焼きライスペーパー", "ソーセージ、チーズ、ネギ油など、さまざまなトッピングをのせたサクサクの焼きライスペーパー。サイゴンの中心にあるダラットの味。", "ダラットの焼きライスペーパーは必見のスナックです。濃厚なチーズと香り高いネギ油を使ったサクサクのライスペーパーは、きっとあなたを満足させるでしょう。"),
                    ("ko", "달랏 구운 라이스 페이퍼", "소시지, 치즈, 파 기름 등 다양한 토핑이 올라간 바삭한 구운 라이스 페이퍼. 사이공 중심부의 달랏 맛.", "달랏 구운 라이스 페이퍼는 꼭 맛봐야 할 간식입니다. 풍부한 치즈와 향긋한 파 기름이 들어간 바삭한 라이스 페이퍼가 분명 여러분을 만족시킬 것입니다."),
                    ("fr", "Papier de Riz Grillé de Da Lat", "Papier de riz grillé croustillant avec diverses garnitures comme des saucisses, du fromage et de l'huile de ciboule. La saveur de Da Lat au cœur de Saigon.", "Le papier de riz grillé de Da Lat est une collation incontournable. Le papier de riz croustillant avec du fromage riche et de l'huile de ciboule parfumée vous satisfera sûrement.")
                }
            ),
            (
                "Món Nước", 10.7598, 106.6965,
                new List<(string, string, string, string)> {
                    ("vi", "Bún Bò Huế Chú Há", "Tô bún bò đậm đà hương vị miền Trung, thịt bò mềm, chả cua dai ngon và nước dùng cay nồng đặc trưng.", "Chào mừng đến với Bún Bò Huế Chú Há. Nước dùng được hầm từ xương bò nhiều giờ liền, kết hợp với mắm ruốc tạo nên hương vị khó quên."),
                    ("en", "Uncle Ha's Hue Beef Noodle", "A bowl of rich Central region flavor beef noodle, tender beef, chewy crab paste, and signature spicy broth.", "Welcome to Uncle Ha's Hue Beef Noodle. The broth is simmered from beef bones for hours, combined with shrimp paste to create an unforgettable flavor."),
                    ("zh", "Ha 叔顺化牛肉面", "一碗浓郁的充满中部风味的牛肉面，牛肉鲜嫩，蟹膏有嚼劲，还有招牌的辛辣肉汤。", "欢迎来到 Ha 叔的顺化牛肉面。肉汤是用牛骨熬制数小时而成的，加入虾酱，创造出令人难忘的风味。"),
                    ("ja", "ハおじさんのフエ風牛肉麺", "中部地方の風味が豊かな牛肉麺。柔らかい牛肉、歯ごたえのあるカニペースト、そして特徴的なスパイシーなスープが特徴です。", "ハおじさんのフエ風牛肉麺へようこそ。スープは牛骨から何時間も煮込まれ、エビペーストと組み合わされて忘れられない風味を作り出しています。"),
                    ("ko", "하 삼촌의 후에 쇠고기 국수", "중부 지방의 풍미가 가득한 쇠고기 국수 한 그릇, 부드러운 쇠고기, 쫄깃한 게 페이스트, 특유의 매콤한 국물.", "하 삼촌의 후에 쇠고기 국수에 오신 것을 환영합니다. 소뼈를 몇 시간 동안 푹 고아 만든 육수에 새우 페이스트를 더해 잊을 수 없는 맛을 선사합니다."),
                    ("fr", "Nouilles au Boeuf Hue de l'Oncle Ha", "Un bol de nouilles au bœuf riches en saveurs de la région centrale, bœuf tendre, pâte de crabe moelleuse et bouillon épicé emblématique.", "Bienvenue aux Nouilles au Boeuf Hue de l'Oncle Ha. Le bouillon est mijoté à partir d'os de bœuf pendant des heures, combiné à de la pâte de crevettes pour créer une saveur inoubliable.")
                }
            ),
            (
                "Tráng miệng", 10.7612, 106.6982,
                new List<(string, string, string, string)> {
                    ("vi", "Chè Thái Ý Phương", "Quán chè sầu riêng nổi tiếng nhất khu vực. Ly chè Thái ngập tràn các loại thạch, mít, nhãn và sầu riêng béo ngậy.", "Nếu bạn là tín đồ của đồ ngọt, Chè Thái Ý Phương là điểm đến lý tưởng. Sầu riêng tươi ngon kết hợp cùng sữa béo và thạch dai giòn sần sật."),
                    ("en", "Y Phuong Thai Sweet Soup", "The most famous durian sweet soup shop in the area. A glass full of various jellies, jackfruit, longan, and rich durian.", "If you have a sweet tooth, Y Phuong Thai Sweet Soup is the ideal destination. Fresh durian combined with rich milk and chewy jellies."),
                    ("zh", "Y Phuong 泰式甜汤", "该地区最著名的榴莲甜汤店。一杯装满各种果冻、菠萝蜜、龙眼和浓郁榴莲的甜汤。", "如果您喜欢吃甜食，Y Phuong 泰式甜汤是理想的目的地。新鲜榴莲与浓郁的牛奶和耐嚼的果冻完美结合。"),
                    ("ja", "イ・フオン タイ風チェー", "この地域で最も有名なドリアンチェーの店。ゼリー、ジャックフルーツ、リュウガン、濃厚なドリアンがたっぷり入ったグラス。", "甘党の方には、イ・フオンのタイ風チェーが理想的な目的地です。新鮮なドリアンに、濃厚なミルクと歯ごたえのあるゼリーを組み合わせました。"),
                    ("ko", "이 프엉 태국식 디저트", "이 지역에서 가장 유명한 두리안 디저트 가게. 다양한 젤리, 잭프루트, 용안, 그리고 풍부한 두리안이 가득 담긴 한 잔.", "단 것을 좋아한다면 이 프엉 태국식 디저트가 이상적인 목적지입니다. 신선한 두리안과 진한 우유, 쫄깃한 젤리가 어우러져 있습니다."),
                    ("fr", "Soupe Sucrée Thaïlandaise Y Phuong", "Le magasin de soupe sucrée au durian le plus célèbre de la région. Un verre rempli de diverses gelées, jacquier, longane et durian riche.", "Si vous avez la dent sucrée, la Soupe Sucrée Thaïlandaise Y Phuong est la destination idéale. Du durian frais combiné à du lait riche et des gelées moelleuses.")
                }
            ),
            (
                "Lẩu", 10.7590, 106.6978,
                new List<(string, string, string, string)> {
                    ("vi", "Lẩu Gà Lá É Phú Yên", "Món lẩu đặc sản Phú Yên với nước dùng thanh ngọt, thịt gà dai ngon và lá é thơm lừng đặc trưng.", "Trong không khí mát mẻ của buổi tối, một nồi lẩu gà lá é sôi sùng sục sẽ làm ấm bụng bất kỳ ai. Lá é khi nhúng vào lẩu có vị the mát rất đặc biệt."),
                    ("en", "Phu Yen Basil Chicken Hotpot", "Phu Yen specialty hotpot with sweet clear broth, chewy chicken, and signature fragrant basil leaves.", "In the cool evening air, a boiling pot of basil chicken hotpot will warm anyone's stomach. The basil leaves have a very special minty taste when dipped in the hotpot."),
                    ("zh", "富安罗勒鸡肉火锅", "富安特色火锅，清甜的肉汤，鲜嫩有嚼劲的鸡肉，还有招牌的香罗勒叶。", "在凉爽的傍晚，一锅热气腾腾的罗勒鸡肉火锅能温暖任何人的胃。罗勒叶在火锅里涮过之后，会有一种非常特别的薄荷味。"),
                    ("ja", "フーイエン風バジルチキン鍋", "フーイエン名物の鍋。甘くて透き通ったスープ、歯ごたえのある鶏肉、そして特徴的な香り高いバジルの葉が特徴です。", "涼しい夜風の中、沸騰したバジルチキン鍋は誰の胃も温めてくれます。バジルの葉は、鍋に浸すと非常に特別なミントの味がします。"),
                    ("ko", "푸옌 바질 치킨 훠궈", "달콤하고 맑은 국물, 쫄깃한 닭고기, 특유의 향긋한 바질 잎이 어우러진 푸옌 특산품 훠궈.", "서늘한 저녁 공기 속에서 끓는 바질 치킨 훠궈 한 냄비는 누구의 위장이든 따뜻하게 해줄 것입니다. 바질 잎은 훠궈에 담그면 매우 특별한 민트 맛이 납니다."),
                    ("fr", "Fondue au Poulet et Basilic de Phu Yen", "Fondue de spécialité de Phu Yen avec un bouillon clair et doux, du poulet moelleux et des feuilles de basilic parfumées emblématiques.", "Dans l'air frais du soir, une marmite bouillante de fondue au poulet et au basilic réchauffera l'estomac de quiconque. Les feuilles de basilic ont un goût mentholé très spécial lorsqu'elles sont trempées dans la fondue.")
                }
            ),
            (
                "Món Nhật", 10.7608, 106.6960,
                new List<(string, string, string, string)> {
                    ("vi", "Sushi Vỉa Hè Chú Mười", "Quán sushi bình dân nhưng chất lượng không thua kém nhà hàng. Cá hồi tươi rói, các cuộn maki đa dạng và giá cả cực kỳ sinh viên.", "Sushi Chú Mười mang ẩm thực Nhật Bản đến gần hơn với người dân Sài Gòn. Mặc dù là quán vỉa hè, nhưng mọi nguyên liệu đều được chuẩn bị rất kỹ lưỡng và sạch sẽ."),
                    ("en", "Uncle Muoi's Street Sushi", "An affordable sushi stall with restaurant-like quality. Fresh salmon, various maki rolls, and very student-friendly prices.", "Uncle Muoi's Sushi brings Japanese cuisine closer to Saigon locals. Although it's a street stall, all ingredients are prepared very carefully and cleanly."),
                    ("zh", "Muoi 叔的街头寿司", "一个价格实惠但质量不亚于餐厅的寿司摊。新鲜的鲑鱼，各种寿司卷，价格对学生非常友好。", "Muoi 叔的寿司让日本料理更贴近西贡当地人。虽然是一个路边摊，但所有的原料都准备得非常仔细和干净。"),
                    ("ja", "ムオイおじさんの屋台寿司", "レストラン並みの品質で手頃な価格の寿司屋台。新鮮なサーモン、さまざまな巻き寿司、そして学生にとても優しい価格。", "ムオイおじさんの寿司は、日本料理をサイゴンの地元の人々に身近なものにします。屋台ですが、すべての食材は非常に丁寧に清潔に準備されています。"),
                    ("ko", "무오이 삼촌의 길거리 초밥", "레스토랑 수준의 품질을 자랑하는 저렴한 초밥 노점. 신선한 연어, 다양한 마키 롤, 학생들에게 매우 친근한 가격.", "무오이 삼촌의 초밥은 일본 요리를 사이공 현지인들에게 더 가깝게 다가갈 수 있게 해줍니다. 노점이긴 하지만 모든 재료가 매우 신중하고 청결하게 준비됩니다."),
                    ("fr", "Sushi de Rue de l'Oncle Muoi", "Un stand de sushis abordable avec une qualité de restaurant. Du saumon frais, divers rouleaux maki et des prix très abordables pour les étudiants.", "Le Sushi de l'Oncle Muoi rapproche la cuisine japonaise des habitants de Saigon. Bien qu'il s'agisse d'un stand de rue, tous les ingrédients sont préparés très soigneusement et proprement.")
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
