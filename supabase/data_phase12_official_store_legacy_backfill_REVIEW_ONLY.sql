-- PROPOSED CONTENT BACKFILL ONLY. NOT APPLIED TO PRODUCTION.
-- Product drafts originate from legacy INITIAL_PRODUCTS; marketing drafts are newly authored truthful NOORMEXA platform messages.
-- Verify old product stock, prices, brand authorization, and media rights before EVER activating products.
-- Inserts 36 legacy product drafts (hidden, stock 0) + 4 NEW official editorial drafts (not demo offers).
-- No fixture is made purchasable or publicly advertised automatically.
-- Idempotent: existing rows are never changed; no deletes/updates; reruns safe.
begin;

do $check$
begin
  if not exists (
    select 1 from public.stores
    where id = 'store-noormexa-official'
      and slug = 'noormexa-flagship-direct'
      and is_official is true
      and status = 'approved'
  ) then
    raise exception 'Expected approved official store is missing or changed. No backfill applied.';
  end if;
end
$check$;

with seed as (
  select *
  from jsonb_to_recordset($official_products$
[
  {
    "id": "prod-aurora-headphones",
    "store_id": "store-noormexa-official",
    "name": "سماعات الرأس اللاسلكية الاحترافية NOORMEXA Pro ANC",
    "name_en": "NOORMEXA Pro Wireless ANC Studio Headphones",
    "description": "سماعة عزل ضوضاء فعال متطورة بصوت نقي فائق الدقة (Hi-Res Audio)، بطارية تدوم حتى 55 ساعة عمل متواصل، مع وسائد ميموري فوم مريحة للاستخدام الطويل ودعم Spatial Audio ثلاثي الأبعاد.",
    "description_en": "Active Noise Cancelling studio-grade wireless headphones with 55hr battery life, ultra-plush memory foam earcups, and immersive 3D Spatial Audio.",
    "category_id": "cat-1",
    "category_slug": "electronics",
    "price": 3450,
    "original_price": 4200,
    "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-10T10:00:00Z"
  },
  {
    "id": "prod-chronograph-watch",
    "store_id": "store-noormexa-official",
    "name": "ساعة الكرونوغراف الفاخرة NOORMEXA Royal Sapphire",
    "name_en": "NOORMEXA Royal Sapphire Chronograph Watch",
    "description": "ساعة ميكانيكية أوتوماتيكية راقية مصنوعة من فولاذ مقاوم للصدأ 316L وزجاج ياقوتي مضاد للخدش، مع حركة سويسرية دقيقة ومقاومة للماء حتى 100 متر.",
    "description_en": "Automatic luxury chronograph timepiece engineered with 316L stainless steel, scratch-resistant sapphire crystal glass, and 100m water resistance.",
    "category_id": "cat-5",
    "category_slug": "accessories",
    "price": 6800,
    "original_price": 8500,
    "image_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-11T12:00:00Z"
  },
  {
    "id": "prod-royal-oud-perfume",
    "store_id": "store-noormexa-official",
    "name": "عطر السلطان الملكي (Imperial Oud & Ambergris 100ml)",
    "name_en": "Imperial Oud & Ambergris Eau de Parfum 100ml",
    "description": "توليفة نادرة من دهن العود المعتق، العنبر الحوتي الأبيض، قطرات الورد الطائفي وخشب الصندل العطري لثبات وفوحان يدوم لأكثر من 48 ساعة.",
    "description_en": "An opulent niche blend of aged Cambodian oud, rare white ambergris, Taif rose petals, and warm Mysore sandalwood with intense 48-hour sillage.",
    "category_id": "cat-3",
    "category_slug": "beauty",
    "price": 2890,
    "original_price": 3600,
    "image_url": "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-12T15:00:00Z"
  },
  {
    "id": "prod-cashmere-coat",
    "store_id": "store-noormexa-official",
    "name": "معطف الكشمير والحرير الفاخر بتطريز ذهبي يدوي",
    "name_en": "Hand-Embroidered Cashmere & Silk Luxury Trench",
    "description": "معطف طويل فاخر منسوج من كشمير المونغوليا الصافي بنسبة 100% مع بطانة حريرية ولمسات تطريز خيوط الذهب الخالص المستوحاة من المعمار الأندلسي.",
    "description_en": "Ultra-luxurious full-length tailored trench woven from 100% pure Mongolian cashmere, featuring pure silk lining and artisanal gold filigree stitching.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 5200,
    "original_price": 6400,
    "image_url": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-14T11:00:00Z"
  },
  {
    "id": "prod-titan-smartphone",
    "store_id": "store-noormexa-official",
    "name": "هاتف ذكي فلاجشيب NOORMEXA Titan Ultra 5G (512GB)",
    "name_en": "NOORMEXA Titan Ultra 5G Smartphone 512GB Titanium",
    "description": "هاتف رائد بهيكل من التيتانيوم المصقول، شاشة OLED 120Hz ديناميكية، كاميرا احترافية بدقة 200 ميجابكسل مع تقريب بصري 10x وشحن فائق السرعة 120W.",
    "description_en": "Flagship smartphone featuring aerospace-grade titanium frame, 120Hz Dynamic AMOLED display, 200MP studio triple camera system with 10x optical zoom, and 120W HyperCharge.",
    "category_id": "cat-1",
    "category_slug": "electronics",
    "price": 18900,
    "original_price": 21500,
    "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-14T18:00:00Z"
  },
  {
    "id": "prod-milano-leather-bag",
    "store_id": "store-noormexa-official",
    "name": "حقيبة يد جلد طبيعي إيطالي NOORMEXA Milano Leather",
    "name_en": "NOORMEXA Milano Handcrafted Italian Leather Handbag",
    "description": "حقيبة يد نسائية أيقونية مصنوعة يدويًا في فلورنسا من أجود أنواع جلد العجل الإيطالي المحبب مع إكسسوارات نحاسية مطلية بالذهب عيار 24.",
    "description_en": "Iconic handcrafted leather tote made in Florence from full-grain Italian calfskin, featuring 24K gold-plated solid brass hardware and suede interior.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 4600,
    "original_price": 5800,
    "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-15T09:00:00Z"
  },
  {
    "id": "prod-aviator-sunglasses",
    "store_id": "store-noormexa-official",
    "name": "نظارة شمسية تيتانيوم مستقطبة NOORMEXA Aviator Gold",
    "name_en": "NOORMEXA Titan Aviator Polarized Sunglasses",
    "description": "إطار خفيف الوزن من التيتانيوم الياباني فائق المتانة مع عدسات HD مستقطبة تحمي بنسبة 100% من الأشعة فوق البنفسجية UV400 ومقاومة للخدش والوهج.",
    "description_en": "Ultralight aerospace titanium frame with Japanese HD polarized UV400 lenses offering absolute optical clarity and glare elimination.",
    "category_id": "cat-5",
    "category_slug": "accessories",
    "price": 1850,
    "original_price": 2400,
    "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-15T12:00:00Z"
  },
  {
    "id": "prod-gold-skincare-ritual",
    "store_id": "store-noormexa-official",
    "name": "مجموعة العناية الذهبية 24K وسيروم الإشراق الطبيعي",
    "name_en": "24K Pure Gold & Squalane Radiant Skincare Ritual",
    "description": "روتين عناية مكثف يحتوي على سيروم الذهب الخالص عيار 24 مع حمض الهيالورونيك، خلاصة السكوالان النباتي ومرطب الكولاجين البحري لنضارة فورية وتجديد خلايا البشرة.",
    "description_en": "Luxurious rejuvenation ritual featuring 24K pure gold flakes, botanical squalane serum, and marine collagen moisturizer for luminous firm skin.",
    "category_id": "cat-3",
    "category_slug": "beauty",
    "price": 1950,
    "original_price": 2600,
    "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-15T15:00:00Z"
  },
  {
    "id": "prod-smart-diffuser",
    "store_id": "store-noormexa-official",
    "name": "موزع العطور الذكي من السيراميك الحجري NOORMEXA Aroma",
    "name_en": "NOORMEXA Ultrasonic Stone Ceramic Smart Aroma Diffuser",
    "description": "فواحة عطرية بالموجات فوق الصوتية مصنوعة يدويًا من الحجر الطبيعي والسيراميك مع إضاءة محيطية هادئة، تحكم عبر الهاتف ومؤقت ذكي.",
    "description_en": "Handcrafted natural stone ceramic ultrasonic aromatherapy diffuser with ambient warm LED glow, smart mobile app control, and timer.",
    "category_id": "cat-4",
    "category_slug": "home",
    "price": 1250,
    "original_price": 1600,
    "image_url": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80",
    "free_shipping": false,
    "created_at": "2026-02-15T08:00:00Z"
  },
  {
    "id": "prod-artisan-coffee-set",
    "store_id": "store-noormexa-official",
    "name": "طقم تحضير القهوة المختصة الفاخر من النحاس والخشب الطبيعي",
    "name_en": "Handcrafted Solid Copper & Walnut Artisan Pour-Over Set",
    "description": "طقم متكامل لعشاق القهوة يشمل قمع ترشيح نحاسي مطروق يدويًا، قاعدة من خشب الجوز الأمريكي، إبريق صب بمقياس حرارة ومطحنة حبوب يدوية دقيقة.",
    "description_en": "Master-crafted coffee set featuring a hand-hammered copper dripper, solid American walnut wood stand, gooseneck kettle with thermometer, and precision burr grinder.",
    "category_id": "cat-6",
    "category_slug": "gifts",
    "price": 2100,
    "original_price": 2750,
    "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-16T16:00:00Z"
  },
  {
    "id": "brand-apple-iphone16promax",
    "store_id": "store-noormexa-official",
    "brand_name": "Apple",
    "name": "هاتف Apple iPhone 16 Pro Max سعة 512GB تيتانيوم طبيعي",
    "name_en": "Apple iPhone 16 Pro Max 512GB Natural Titanium",
    "description": "أحدث وأقوى هواتف Apple بشريحة A18 Pro الجبارة، هيكل تيتانيوم من الدرجة الخامسة خفيف وفائق المتانة، زر التحكم في الكاميرا، ونظام كاميرات سينمائي 48MP.",
    "description_en": "Apple flagship with A18 Pro chip, Grade 5 titanium design, Camera Control, 48MP Fusion camera system, and 2-year authorized local warranty.",
    "category_id": "cat-1",
    "category_slug": "electronics",
    "price": 74900,
    "original_price": 79900,
    "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T10:00:00Z"
  },
  {
    "id": "brand-apple-watch-ultra2",
    "store_id": "store-noormexa-official",
    "brand_name": "Apple",
    "name": "ساعة Apple Watch Ultra 2 تيتانيوم أسود 49mm مع حزام Ocean",
    "name_en": "Apple Watch Ultra 2 Black Titanium 49mm with Ocean Band",
    "description": "الساعة الرياضية الاحترافية الأكثر متانة، شاشة بسطوع 3000 nits، نظام GPS دقيق مزدوج التردد، مقاومة للماء حتى عمق 100 متر مع مستشعر الغوص والعمق.",
    "description_en": "The ultimate rugged sports smartwatch with 3000-nit display, dual-frequency precision GPS, and depth gauge up to 40m/100m water resistance.",
    "category_id": "cat-1",
    "category_slug": "electronics",
    "price": 43500,
    "original_price": 47900,
    "image_url": "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=1000&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T11:00:00Z"
  },
  {
    "id": "brand-apple-airpods-pro2",
    "store_id": "store-noormexa-official",
    "brand_name": "Apple",
    "name": "سماعات Apple AirPods Pro (الجيل الثاني) مع علبة MagSafe USB-C",
    "name_en": "Apple AirPods Pro (2nd Gen) with MagSafe Case (USB-C)",
    "description": "إلغاء ضوضاء نشط أقوى بمرتين، نمط شفافية متكيف، صوت مكاني مخصص مع تتبع ديناميكي للرأس، وصوت بدون فقدان بجودة خرافية.",
    "description_en": "Up to 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio with dynamic head tracking, and USB-C MagSafe case.",
    "category_id": "cat-1",
    "category_slug": "electronics",
    "price": 13900,
    "original_price": 15500,
    "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T12:00:00Z"
  },
  {
    "id": "brand-nike-air-jordan1",
    "store_id": "store-noormexa-official",
    "brand_name": "Nike",
    "name": "حذاء Nike Air Jordan 1 Retro High OG 'Chicago Lost & Found' الأصلي",
    "name_en": "Nike Air Jordan 1 Retro High OG 'Chicago' Authentic",
    "description": "الأيقونة الخالدة من علامة Nike و Jordan. جلد طبيعي فاخر بنمط Chicago الكلاسيكي مع بطانة Air المريحة وشهادة الفحص والأصالة.",
    "description_en": "Iconic Air Jordan 1 Retro High OG in signature Chicago colorway. Genuine leather construction with Nike Air cushioning and authenticity verified stamp.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 11800,
    "original_price": 13500,
    "image_url": "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T13:00:00Z"
  },
  {
    "id": "brand-nike-dunk-low",
    "store_id": "store-noormexa-official",
    "brand_name": "Nike",
    "name": "حذاء Nike Dunk Low Retro 'Panda' أسود وأبيض أصلي",
    "name_en": "Nike Dunk Low Retro 'Panda' Black & White Original",
    "description": "الحذاء الأكثر طلبًا عالميًا من نايكي، تصميم كلاسيكي جذاب باللونين الأبيض والأسود يتناسق مع جميع الإطلالات العصرية والرياضية.",
    "description_en": "The universally acclaimed Nike Dunk Low Panda featuring classic two-tone leather overlays, foam midsole, and padded low-cut collar.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 6400,
    "original_price": 7500,
    "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T13:30:00Z"
  },
  {
    "id": "brand-nike-pegasus-41",
    "store_id": "store-noormexa-official",
    "brand_name": "Nike",
    "name": "حذاء الجري Nike Air Zoom Pegasus 41 المتطور بتوسيد ReactX",
    "name_en": "Nike Air Zoom Pegasus 41 Road Running Shoes (ReactX Foam)",
    "description": "حذاء الجري الأسطوري ببطانة ReactX الخارقة التي توفر استرجاع طاقة أعلى بنسبة 13%، مع وحدات Air Zoom مزدوجة للمقدمة والكعب.",
    "description_en": "Responsive cushioning in the Pegasus provides an energized ride for everyday road running, powered by upgraded ReactX foam.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 7200,
    "original_price": 8400,
    "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T13:45:00Z"
  },
  {
    "id": "brand-rolex-submariner-date",
    "store_id": "store-noormexa-official",
    "brand_name": "Rolex",
    "name": "ساعة Rolex Submariner Date فولاذ أويستر ستيل 41mm مع إطار سيراميك Cerachrom أخضر",
    "name_en": "Rolex Submariner Date 41mm Oystersteel Green Cerachrom Bezel",
    "description": "ساعة الغواصين الأيقونية الرائدة في العالم. حركة ميكانيكية ذاتية التعبئة عيار 3235، ميناء أسود مضيء بنظام Chromalight، مقاومة للماء 300 متر، كاملة بالعلبة والضمان الدولي الأخضر.",
    "description_en": "The benchmark among divers' watches. Calibre 3235 automatic movement, green Cerachrom ceramic bezel, 300m waterproofness, full box and international guarantee card.",
    "category_id": "cat-5",
    "category_slug": "watches",
    "price": 495000,
    "original_price": 520000,
    "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T14:00:00Z"
  },
  {
    "id": "brand-rolex-daytona-black",
    "store_id": "store-noormexa-official",
    "brand_name": "Rolex",
    "name": "ساعة Rolex Cosmograph Daytona فولاذ أويستر ستيل 40mm ميناء أسود",
    "name_en": "Rolex Cosmograph Daytona 40mm Oystersteel Black Dial",
    "description": "أسطورة سباقات السيارات الخالدة. كرونوغراف ميكانيكي عيار 4131 فائق الدقة مع مقياس تاكيمتر محفور وإطار سيراكروم أسود مقاوم للخدش.",
    "description_en": "The ultimate racing chronograph watch with Calibre 4131 movement, Cerachrom tachymetric scale bezel, and Oysterlock safety clasp.",
    "category_id": "cat-5",
    "category_slug": "watches",
    "price": 680000,
    "original_price": 720000,
    "image_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T14:15:00Z"
  },
  {
    "id": "brand-dior-sauvage-elixir",
    "store_id": "store-noormexa-official",
    "brand_name": "Dior",
    "name": "عطر Dior Sauvage Elixir فائق التركيز سعة 100 مل أصلي من باريس",
    "name_en": "Dior Sauvage Elixir Parfum Concentré 100ml Genuine",
    "description": "العطر الأكثر رجولية وجاذبية من دار ديور. تركيبة غنية نادرة بالخزامى المصنوعة خصيصاً في نيون، قلب من التوابل الفاخرة وخشب الصندل العطري النبيل.",
    "description_en": "An extraordinarily concentrated fragrance steeped in the iconic freshness of Sauvage with an intoxicating heart of spices, 'tailor-made' lavender, and rich woods.",
    "category_id": "cat-3",
    "category_slug": "perfumes",
    "price": 9400,
    "original_price": 10800,
    "image_url": "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T14:30:00Z"
  },
  {
    "id": "brand-dior-saddle-bag",
    "store_id": "store-noormexa-official",
    "brand_name": "Dior",
    "name": "حقيبة Dior Saddle Bag جلد عجل حبيبي أسود مع إبزيم CD ذهبي",
    "name_en": "Dior Saddle Bag Black Grained Calfskin with Gold CD Hardware",
    "description": "الحقيبة الباريسية الأيقونية بتصميم السرج الكلاسيكي الشهير، مصنوعة يدويًا من جلد العجل المحبب مع مشبك CD ذهبي عتيق وحزام كتف قابل للتعديل.",
    "description_en": "Legendary Dior Saddle silhouette in luxurious grained calfskin with aged gold-finish metal CD signature on strap handles.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 135000,
    "original_price": 148000,
    "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T14:45:00Z"
  },
  {
    "id": "brand-samsung-s24ultra",
    "store_id": "store-noormexa-official",
    "brand_name": "Samsung",
    "name": "هاتف Samsung Galaxy S24 Ultra بالذكاء الاصطناعي Galaxy AI سعة 512GB",
    "name_en": "Samsung Galaxy S24 Ultra 512GB Titanium Gray (Galaxy AI)",
    "description": "الهاتف الرائد المتربع على عرش أندرويد: إطار من التيتانيوم المقاوم للصدمات، قلم S-Pen مدمج، كاميرا 200MP مع تقريب بصري مذهل، وميزات Galaxy AI للترجمة والبحث الفوري.",
    "description_en": "Galaxy S24 Ultra with Snapdragon 8 Gen 3, built-in S-Pen, 200MP camera with Quad Telephoto system, and full Galaxy AI suite.",
    "category_id": "cat-1",
    "category_slug": "electronics",
    "price": 63900,
    "original_price": 68500,
    "image_url": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T15:00:00Z"
  },
  {
    "id": "brand-samsung-zfold6",
    "store_id": "store-noormexa-official",
    "brand_name": "Samsung",
    "name": "هاتف Samsung Galaxy Z Fold 6 5G القابل للطي سعة 512GB فضي",
    "name_en": "Samsung Galaxy Z Fold 6 5G 512GB Silver Shadow",
    "description": "تصميم أنحف وأخف وزناً مع شاشة داخلية عملاقة 7.6 بوصة Dynamic AMOLED 2X تدعم تعدد المهام وقلم S-Pen وإمكانيات Galaxy AI الفورية.",
    "description_en": "Ultra-slim foldable flagship with dual screens, Armour Aluminum hinge, and seamless AI productivity.",
    "category_id": "cat-1",
    "category_slug": "electronics",
    "price": 86900,
    "original_price": 92000,
    "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T15:15:00Z"
  },
  {
    "id": "brand-sony-wh1000xm5",
    "store_id": "store-noormexa-official",
    "brand_name": "Sony",
    "name": "سماعات Sony WH-1000XM5 اللاسلكية الرائدة في عزل الضوضاء",
    "name_en": "Sony WH-1000XM5 Wireless Industry-Leading Noise Cancelling Headphones",
    "description": "قمة هندسة الصوت اليابانية مع معالجين متقدمين و8 ميكروفونات لعزل أي ضجيج محيطي، دعم صوت عالي الدقة Hi-Res Audio و LDAC، وبطارية تدوم حتى 30 ساعة.",
    "description_en": "Industry-leading noise cancellation powered by two processors and 8 microphones. Exceptional Hi-Res Audio wireless performance and 30-hour battery life.",
    "category_id": "cat-1",
    "category_slug": "electronics",
    "price": 16800,
    "original_price": 18900,
    "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T15:30:00Z"
  },
  {
    "id": "brand-sony-ps5-pro",
    "store_id": "store-noormexa-official",
    "brand_name": "Sony",
    "name": "جهاز الألعاب PlayStation 5 Pro سعة 2TB مع تقنية PSSR و 4K 120Hz",
    "name_en": "Sony PlayStation 5 Pro Console Edition 2TB (PSSR AI Upscaling)",
    "description": "أقوى منصة ألعاب في العالم مع معالجة رسومية تفوق بنسبة 45% وتتبع أشعة متطور فائق السرعة مع دعم ألعاب 4K بسرعة 60/120 إطار بالثانية.",
    "description_en": "PlayStation 5 Pro with upgraded GPU, Advanced Ray Tracing, and PlayStation Spectral Super Resolution (PSSR) AI scaling.",
    "category_id": "cat-1",
    "category_slug": "electronics",
    "price": 38900,
    "original_price": 42000,
    "image_url": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T15:45:00Z"
  },
  {
    "id": "brand-chanel-bleu-parfum",
    "store_id": "store-noormexa-official",
    "brand_name": "Chanel",
    "name": "عطر Bleu de Chanel Parfum المركز للرجال سعة 100 مل الأصلي",
    "name_en": "Bleu de Chanel Parfum Pour Homme 100ml Original",
    "description": "العطر الأكثر فخامة وتميزاً، تركيبة خشبية أروماتية آسرة تبرز حضور خشب الصندل الكاليدوني النبيل وأشجار الأرز الجذابة مع لمسات حمضية منعشة.",
    "description_en": "An intensely masculine woody aromatic fragrance blending the fullness of New Caledonian sandalwood with the deep cedar and refreshing citrus accents.",
    "category_id": "cat-3",
    "category_slug": "perfumes",
    "price": 9800,
    "original_price": 11200,
    "image_url": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T16:00:00Z"
  },
  {
    "id": "brand-chanel-classic-flap",
    "store_id": "store-noormexa-official",
    "brand_name": "Chanel",
    "name": "حقيبة Chanel Classic Flap جلد خراف مبطن أسود مع قفل CC ذهبي",
    "name_en": "Chanel Classic Medium Flap Bag Quilted Lambskin with Gold-Tone Metal",
    "description": "الأيقونة الخالدة في تاريخ الموضة الراقية، جلد خراف باريسي ناعم مبطن بغرز الماس وقفل CC الدوار وسلسلة جلدية مدمجة.",
    "description_en": "Timeless luxury staple featuring diamond-quilted lambskin, signature CC turn-lock closure, and interwoven leather-chain strap.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 360000,
    "original_price": 385000,
    "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T16:15:00Z"
  },
  {
    "id": "brand-adidas-samba-og",
    "store_id": "store-noormexa-official",
    "brand_name": "Adidas",
    "name": "حذاء Adidas Samba OG جلد أبيض وأسود ونعل صمغي كلاسيكي",
    "name_en": "Adidas Samba OG Cloud White & Core Black Classic Shoes",
    "description": "الأيقونة الخالدة منذ عقود. يتميز بجزء علوي من الجلد المحبب الفاخر مع طبقة T-Toe من الجلد السويدي الناعم ونعل Gum الأسطوري.",
    "description_en": "Born on the pitch, the Samba is an unmistakable lifestyle icon featuring premium leather upper, suede T-toe overlay, and signature gum rubber sole.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 5200,
    "original_price": 6100,
    "image_url": "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T16:30:00Z"
  },
  {
    "id": "brand-adidas-ultraboost-light",
    "store_id": "store-noormexa-official",
    "brand_name": "Adidas",
    "name": "حذاء الجري Adidas Ultraboost Light فائق الخفة أسود كامل",
    "name_en": "Adidas Ultraboost Light Core Black Running Shoes",
    "description": "أخف حذاء Ultraboost صنعته أديداس على الإطلاق بفضل مادة Light BOOST المتطورة التي توفر طاقة ارتدادية قصوى في كل خطوة.",
    "description_en": "Experience epic energy with the new Ultraboost Light, the lightest Ultraboost ever featuring next-gen Light BOOST midsole cushioning.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 7800,
    "original_price": 9200,
    "image_url": "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T16:45:00Z"
  },
  {
    "id": "brand-gucci-gg-marmont-belt",
    "store_id": "store-noormexa-official",
    "brand_name": "Gucci",
    "name": "حزام Gucci GG Marmont جلد عجل إيطالي أسود ناعم مع إبزيم نحاسي ذهبي",
    "name_en": "Gucci GG Marmont Leather Belt with Shiny Gold-Toned Buckle",
    "description": "حزام غوتشي الإيطالي الفاخر بعرض 4 سم مصنوع من أجود أنواع جلد العجل الإيطالي، مزين بشعار Double G الشهير المطلي بالذهب النحاسي العتيق.",
    "description_en": "Signature 4cm leather belt crafted from smooth black Italian calfskin, finished with the iconic antiqued brass Double G logo buckle.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 18500,
    "original_price": 21000,
    "image_url": "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T17:00:00Z"
  },
  {
    "id": "brand-gucci-marmont-bag",
    "store_id": "store-noormexa-official",
    "brand_name": "Gucci",
    "name": "حقيبة كتف Gucci GG Marmont جلد شيفرون ماتيلاسيه أسود",
    "name_en": "Gucci GG Marmont Small Matelassé Shoulder Bag Black",
    "description": "حقيبة غوتشي الفاخرة المبطنة بنمط الشيفرون المتعرج، مزينة بشعار Double G الذهبي وسلسلة كتف جلدية مريحة وبطانة مايكروفايبر تشبه الجلد المدبوغ.",
    "description_en": "Small GG Marmont chain shoulder bag structured in chevron matelassé leather with a heart on the back and double G hardware.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 95000,
    "original_price": 104000,
    "image_url": "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T17:15:00Z"
  },
  {
    "id": "brand-lv-neverfull-mm",
    "store_id": "store-noormexa-official",
    "brand_name": "Louis Vuitton",
    "name": "حقيبة Louis Vuitton Neverfull MM بنمط Monogram كانفاس الكلاسيكي مع محفظة داخلية",
    "name_en": "Louis Vuitton Neverfull MM Monogram Canvas Tote with Pouch",
    "description": "الحقيبة الأسطورية الأكثر شهرة من لويس فيتون. قماش كانفاس متين مقاوم للماء والخدوش، مقابض وحواف من جلد البقر الطبيعي، ومحفظة قابلة للفصل.",
    "description_en": "The timeless Neverfull MM tote pairs iconic Monogram canvas with natural cowhide leather trim and removable zip pouch.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 112000,
    "original_price": 124000,
    "image_url": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T17:20:00Z"
  },
  {
    "id": "brand-lv-keepall-50",
    "store_id": "store-noormexa-official",
    "brand_name": "Louis Vuitton",
    "name": "حقيبة سفر Louis Vuitton Keepall Bandoulière 50 Monogram Eclipse",
    "name_en": "Louis Vuitton Keepall Bandoulière 50 Monogram Eclipse Duffle Bag",
    "description": "حقيبة السفر الأيقونية الفاخرة للرحلات القصيرة، قماش كانفاس Monogram Eclipse أسود ورمادي أنيق مع قفل وأشرطة كتف جلدية.",
    "description_en": "An icon since 1930, the Keepall 50 is the definitive weekend duffle bag in sleek Monogram Eclipse canvas with padlock and shoulder strap.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 138000,
    "original_price": 152000,
    "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T17:25:00Z"
  },
  {
    "id": "brand-dyson-airwrap-complete",
    "store_id": "store-noormexa-official",
    "brand_name": "Dyson",
    "name": "مصفف الشعر الذكي Dyson Airwrap Multi-Styler Complete Long برتقالي كوبر ونيكل",
    "name_en": "Dyson Airwrap Multi-Styler Complete Long (Copper & Nickel)",
    "description": "تصفيف وتمويج وتجفيف الشعر بالهواء بدون حرارة مفرطة بفضل تأثير كواندا Coanda الهوائي الذكي. مناسب للشعر الطويل والمتوسط ويأتي مع حقيبة تخزين ملكية.",
    "description_en": "Styles, curls, shapes and smooths using the aerodynamic Coanda effect without extreme heat. Comes with re-engineered barrels and storage case.",
    "category_id": "cat-1",
    "category_slug": "electronics",
    "price": 28900,
    "original_price": 32500,
    "image_url": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1000&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T17:30:00Z"
  },
  {
    "id": "brand-dyson-supersonic-nural",
    "store_id": "store-noormexa-official",
    "brand_name": "Dyson",
    "name": "مجفف الشعر الذكي Dyson Supersonic Nural بمستشعرات حماية فروة الرأس",
    "name_en": "Dyson Supersonic Nural Intelligent Hair Dryer (Scalp Protect Mode)",
    "description": "أحدث مجففات دايسون المزودة بشبكة مستشعرات Nural الذكية التي تخفض الحرارة تلقائياً عند الاقتراب من الرأس لحماية صحة فروة الرأس ولمعان الشعر الطبيعي.",
    "description_en": "Auto-adapts to protect scalp health and enhance natural shine with intelligent Nural sensor network.",
    "category_id": "cat-1",
    "category_slug": "electronics",
    "price": 24500,
    "original_price": 27900,
    "image_url": "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1000&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T17:45:00Z"
  },
  {
    "id": "brand-zara-wool-blazer",
    "store_id": "store-noormexa-official",
    "brand_name": "ZARA",
    "name": "بليزر رجالي صوف مهيكل بقصة Slim-Fit كلاسيكية من ZARA",
    "name_en": "ZARA Men's Tailored Wool-Blend Structured Blazer",
    "description": "بليزر أوروبي فاخر مصنوع من مزيج الصوف المعالج، ياقة مسننة، بطانة داخلية حريرية مريحة وأزرار من قرن الثور الأصلي، قصة أنيقة تناسب الإطلالات الرسمية والمسائية.",
    "description_en": "Tailored wool-blend blazer featuring notched lapels, full satin interior lining, front flap pockets, and structured shoulder pads for a sharp European profile.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 3850,
    "original_price": 4600,
    "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T18:00:00Z"
  },
  {
    "id": "brand-zara-silk-dress",
    "store_id": "store-noormexa-official",
    "brand_name": "ZARA",
    "name": "فستان سهرة حرير ميدي بقصة انسيابية ومفتوح الظهر من ZARA Studio",
    "name_en": "ZARA Studio 100% Mulberry Silk Flowy Midi Evening Dress",
    "description": "فستان سهرة راقٍ من تشكيلة ZARA Studio الخاصة، حرير طبيعي نقي 100% بلون زمردي أخاذ، قصة درابيه أنثوية انسيابية وياقة ناعمة.",
    "description_en": "Limited edition ZARA Studio evening dress crafted from pure silk with open back drape detail and elegant fluid movement.",
    "category_id": "cat-2",
    "category_slug": "fashion",
    "price": 4900,
    "original_price": 5800,
    "image_url": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80",
    "free_shipping": true,
    "created_at": "2026-02-18T18:15:00Z"
  }
]
$official_products$::jsonb) as x(
    id text, store_id text, brand_name text, name text, name_en text,
    description text, description_en text, category_id text, category_slug text,
    price numeric, original_price numeric, image_url text,
    free_shipping boolean, created_at timestamptz
  )
)
insert into public.products (
  id, store_id, brand_name, name, name_en, description, description_en,
  category_id, category_slug, price, original_price, image_url,
  stock, status, free_shipping, created_at
)
select
  id, store_id, brand_name, name, name_en, description, description_en,
  category_id, category_slug, price, original_price, image_url,
  0, 'hidden', coalesce(free_shipping,false), coalesce(created_at,now())
from seed
where store_id = 'store-noormexa-official' and price > 0
on conflict (id) do nothing;

with seed as (
  select *
  from jsonb_to_recordset($official_posts$
[
  {
    "id": "noormexa-official-news-2026-01",
    "store_id": "store-noormexa-official",
    "store_name": "متجر نورميكسا الرسمي",
    "title": "NOORMEXA — وجهة واحدة لاكتشاف المتاجر والمنتجات",
    "content": "استكشف أقسام السوق والمتاجر المتاحة من مكان واحد، وتعرّف على المنتجات التي يضيفها التجار بعد اعتماد متاجرهم. تابع المساحات الرسمية لمعرفة المستجدات والمحتوى الجديد أولًا بأول.",
    "image_url": null,
    "promo_code": null,
    "discount_percent": null,
    "featured_product_id": null,
    "is_pinned": true,
    "created_at": null
  },
  {
    "id": "noormexa-official-news-2026-02",
    "store_id": "store-noormexa-official",
    "store_name": "متجر نورميكسا الرسمي",
    "title": "المتجر الرسمي لـNOORMEXA — المصدر المباشر لمستجداتنا",
    "content": "هذه مساحة النشر الرسمية التابعة لمنصة NOORMEXA. نشارك هنا أخبار الخدمات والتحديثات والمحتوى الذي يقدمه فريق المتجر الرسمي، مع فصل واضح بين منشوراتنا ومنشورات المتاجر المستقلة.",
    "image_url": null,
    "promo_code": null,
    "discount_percent": null,
    "featured_product_id": null,
    "is_pinned": false,
    "created_at": null
  },
  {
    "id": "noormexa-official-news-2026-03",
    "store_id": "store-noormexa-official",
    "store_name": "متجر نورميكسا الرسمي",
    "title": "للتجار — أنشئ متجرك ونظّم أعمالك من مساحة واحدة",
    "content": "يتيح NOORMEXA طلب إنشاء متجر داخل المنصة، ومتابعة حالته حتى الاعتماد. بعد تفعيل المتجر، يمكن إدارة الكتالوج والمنشورات والمهام التشغيلية بحسب صلاحيات أعضاء فريق المتجر.",
    "image_url": null,
    "promo_code": null,
    "discount_percent": null,
    "featured_product_id": null,
    "is_pinned": false,
    "created_at": null
  },
  {
    "id": "noormexa-official-news-2026-04",
    "store_id": "store-noormexa-official",
    "store_name": "متجر نورميكسا الرسمي",
    "title": "NOORMEXA على الهاتف والكمبيوتر",
    "content": "تصفّح السوق من هاتفك أو الكمبيوتر، واستخدم ميزة تثبيت الموقع كتطبيق للوصول السريع عندما يدعم جهازك ومتصفحك هذه الميزة. تجربة موحّدة لاستكشاف المتاجر والمحتوى المتاح.",
    "image_url": null,
    "promo_code": null,
    "discount_percent": null,
    "featured_product_id": null,
    "is_pinned": false,
    "created_at": null
  }
]
$official_posts$::jsonb) as x(
    id text, store_id text, store_name text, store_logo text,
    title text, content text, image_url text, promo_code text,
    discount_percent numeric, featured_product_id text,
    is_pinned boolean, created_at timestamptz
  )
)
insert into public.marketing_posts (
  id, store_id, store_name, store_logo, title, content, image_url,
  promo_code, discount_percent, featured_product_id, is_pinned,
  likes_count, views_count, status, created_at
)
select
  id, store_id, store_name, store_logo, title, content, image_url,
  promo_code, discount_percent, featured_product_id, coalesce(is_pinned,false),
  0, 0, 'draft', coalesce(created_at,now())
from seed
where store_id = 'store-noormexa-official'
on conflict (id) do nothing;

commit;

-- EDITORIAL POSTS: four new official platform announcements, with no fake product or offer, status=draft until approved.
-- REVIEW BEFORE PUBLIC RELEASE:
-- Verify catalog, stock/fulfilment, brand rights, images, prices and offer/coupon validity.
-- Owners/Editors should set each legitimate product to active with verified real stock
-- and each approved post to published from the authenticated Store Control Center.
-- Never blindly promote all demo fixtures to public sellable stock.
