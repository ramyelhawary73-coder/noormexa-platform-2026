/**
 * AOSA (أوسا) - Autonomous E-commerce & Merchant Agent Core
 * Specialized intelligent knowledge base & action engine for NOORMEXA platform.
 * Works seamlessly both server-side and client-side with zero dependencies.
 */

export interface AgentAction {
  label: string;
  href: string;
  type?: "link" | "query";
  query?: string;
}

export interface AgentResponse {
  reply: string;
  actions?: AgentAction[];
  source?: "gemini" | "aosa_core";
  isReadOnly?: boolean;
  readOnlyReason?: "missing_key" | "invalid_key" | "network_fallback" | null;
  readOnlyNotice?: string;
}

function getRawAosaResponse(
  q: string,
  role: "buyer" | "seller",
  lang: "ar" | "en"
): { reply: string; actions?: AgentAction[] } {
  // Check for write/mutation requests that cannot be directly committed in read-only mode
  const isWriteRequest =
    q.includes("احذف") ||
    q.includes("مسح") ||
    q.includes("حذف") ||
    q.includes("تعديل") ||
    q.includes("عدل") ||
    q.includes("غير") ||
    q.includes("تغيير") ||
    q.includes("ادفع لي") ||
    q.includes("شراء تلقائي") ||
    q.includes("قاعدة البيانات") ||
    q.includes("delete") ||
    q.includes("remove") ||
    q.includes("change password") ||
    q.includes("modify database") ||
    q.includes("write to db") ||
    q.includes("update my");

  if (isWriteRequest) {
    if (lang === "ar") {
      return {
        reply: `🔒 **تنبيه أمان وخصوصية (وضع القراءة والاستفسار):**
أعمل حالياً بنظام **القراءة والاستفسار الذكي المستقل (Smart Read-Only Mode)**. حرصاً على سرية وأمان بياناتك المالية والشخصية، لا يمكن لأوسا تعديل السجلات أو تنفيذ المعاملات البنكية نيابة عنك بشكل مباشر وتلقائي.

يمكنك إتمام هذا الإجراء بأمان وسرية تامة بنفسك عبر الروابط المباشرة التالية:`,
        actions: [
          { label: "إدارة وتعديل الطلبات 📦", href: "/orders" },
          { label: "سلة المشتريات وإتمام الطلب 🛒", href: "/checkout" },
          { label: "لوحة تحكم البائع 🏪", href: "/seller/dashboard" },
        ],
      };
    } else {
      return {
        reply: `🔒 **Security Notice (Smart Read-Only Mode):**
I am operating in **Smart Read-Only Mode**. To ensure maximum safety for your sensitive financial and personal data, I cannot execute direct database mutations or automated transactions on your behalf.

You can safely and securely complete this action directly via the verified platform links below:`,
        actions: [
          { label: "Manage Orders 📦", href: "/orders" },
          { label: "Checkout & Payments 🛒", href: "/checkout" },
          { label: "Seller Dashboard 🏪", href: "/seller/dashboard" },
        ],
      };
    }
  }

  // Inquiry about read-only mode or agent status
  if (
    q.includes("وضع القراءة") ||
    q.includes("read only") ||
    q.includes("readonly") ||
    q.includes("حالة الاتصال") ||
    q.includes("connection status")
  ) {
    if (lang === "ar") {
      return {
        reply: `🛡️ **حالة عمل أوسا (AOSA) - وضع القراءة الذكي:**
أنا أعمل حالياً في **وضع القراءة والاستفسار الذكي المستقل (Autonomous Read-Only Mode)**.
تم تصميم هذا النظام لضمان استمرارية الخدمة بنسبة 100% حتى في حال غياب أو عدم صلاحية مفتاح Google API الخارجي أو حدوث ضغط على خوادم الذكاء الاصطناعي السحابية.

✅ **ما يمكنك القيام به بحرية تامة:**
• البحث في كتالوج المنتجات وتصنيفاتها (إلكترونيات، أزياء، عطور، وساعات).
• الاستفسار عن الشحن السريع ومواعيد التوصيل في السعودية ومصر والإمارات.
• معرفة خيارات الدفع والتقسيط عبر تمارا وتابي ومدى والدفع عند الاستلام.
• تتبع الطلبات والاستعلام عن سياسة الإرجاع والضمان الذهبي 14 يوماً.
• استشارات بدء المتاجر، الباقات، ونظام العمولات للبائعين.`,
        actions: [
          { label: "تصفح السوق 🛍️", href: "/marketplace" },
          { label: "خيارات الشحن والتوصيل 🚚", href: "/orders" },
        ],
      };
    } else {
      return {
        reply: `🛡️ **AOSA System Status - Smart Read-Only Mode:**
I am currently operating in **Autonomous Read-Only Mode**.
This robust fallback engine was engineered to ensure zero downtime even if the external Google API key is missing, invalid, or experiencing temporary cloud service spikes.

✅ **Available Capabilities (Zero Latency):**
• Discover products & categories (Tech, Luxury Fashion, Perfumes, Watches, Home).
• Inquire about express delivery & logistics across KSA, Egypt, and UAE.
• Explore secure payments & 4-month installment plans (Tamara, Tabby, Mada, COD).
• Track orders and review the 100% authenticity guarantee & 14-day returns.
• Access seller guides, merchant tiers, and fee structures.`,
        actions: [
          { label: "Browse Marketplace 🛍️", href: "/marketplace" },
          { label: "Track Shipments 🚚", href: "/orders" },
        ],
      };
    }
  }

  // Arabic responses for Buyers
  if (lang === "ar" && role === "buyer") {
    // Shipping / Delivery
    if (
      q.includes("شحن") ||
      q.includes("توصيل") ||
      q.includes("تتبع") ||
      q.includes("شحنة") ||
      q.includes("مندوب") ||
      q.includes("ارامكس") ||
      q.includes("سمسا") ||
      q.includes("وقت التوصيل") ||
      q.includes("الشحن السريع")
    ) {
      return {
        reply: `أهلاً بك! في **نورميكسا (NOORMEXA)** نوفر لك منظومة لوجستية ذكية وفائقة السرعة:

🚀 **التوصيل الفوري (نفس اليوم):** متاح داخل المدن الرئيسية (الرياض، جدة، القاهرة، الجيزة، ودبي) للطلبات المقدمة قبل الساعة 2 ظهراً عبر أسطول نورمكسا المباشر.
🚚 **الشحن السريع للمدن الأخرى:** يستغرق من 1 إلى 3 أيام عمل كحد أقصى بالتعاون مع شركائنا المعتمدين (سمسا SMSA، أرامكس Aramex، و DHL).
📍 **التتبع اللحظي:** بمجرد تأكيد طلبك، ستحصل على رقم بوليصة تتبع (AWB) يمكنك من متابعة خط سير الشحنة لحظة بلحظة حتى باب منزلك.
🎁 **شحن مجاني:** عند وصول سلة مشترياتك للحد الأدنى المحدد في بلدك، يتم تفعيل الشحن المجاني تلقائياً.`,
        actions: [
          { label: "تتبع طلباتي الحالية 📦", href: "/orders" },
          { label: "تصفح العروض والمنتجات 🛍️", href: "/marketplace" },
        ],
      };
    }

    // Payment methods / Installment
    if (
      q.includes("دفع") ||
      q.includes("طرق الدفع") ||
      q.includes("فيزا") ||
      q.includes("مدى") ||
      q.includes("تقسيط") ||
      q.includes("تابي") ||
      q.includes("تمارا") ||
      q.includes("كاش") ||
      q.includes("عند الاستلام") ||
      q.includes("ابل باي") ||
      q.includes("apple pay") ||
      q.includes("paymob") ||
      q.includes("stripe")
    ) {
      return {
        reply: `طرق الدفع في **NOORMEXA** مرنة ومحمية بنظام أمان مشفر 100%:

💳 **البطاقات البنكية المباشرة:** نقبل بطاقات مدى (Mada)، فيزا (Visa)، وماستركارد (Mastercard) بأعلى معايير التشفير المصرفي.
📱 **المحافظ الرقمية السريعة:** الدفع بنقرة واحدة عبر **Apple Pay** وتطبيقات الدفع المعتمدة.
⏳ **التقسيط المريح بدون فوائد:** قسّم فاتورتك على 4 دفعات ميسرة بدون أي فوائد إضافية عبر **تمارا (Tamara)** أو **تابي (Tabby)**.
💵 **الدفع عند الاستلام (COD):** متاح في معظم المناطق لتتمكن من معاينة طلبك قبل الدفع للمندوب.
🛡️ **حماية المشتري (Escrow):** أموالك تبقى في حساب أمان مالي ولا يتم تسليمها للتاجر إلا بعد تأكيد استلامك للمنتج ومطابقته للمواصفات.`,
        actions: [
          { label: "متابعة الشراء في السلة 🛒", href: "/cart" },
          { label: "صفحة إتمام الطلب 💳", href: "/checkout" },
        ],
      };
    }

    // Guarantee & Return policy
    if (
      q.includes("ضمان") ||
      q.includes("استرجاع") ||
      q.includes("ارجاع") ||
      q.includes("استبدال") ||
      q.includes("اصلي") ||
      q.includes("أصلي") ||
      q.includes("تقليد") ||
      q.includes("سياسة")
    ) {
      return {
        reply: `تسوقك في **NOORMEXA** محمي بضمان ذهبي شامل:

✨ **ضمان الأصالة 100%:** جميع المنتجات والعطور والأجهزة الإلكترونية المعروضة تخضع لتدقيق صارم ونضمن أنها أصلية وجديدة تماماً.
🔄 **إرجاع واستبدال مرن خلال 14 يوماً:** إذا لم يناسبك المنتج أو كان به أي عيب مصنعي، يمكنك طلب الإرجاع بكل بساطة واسترداد كامل أموالك دون أي تعقيد.
📦 **معاينة عند الاستلام:** يتيح لك مندوب الشحن التأكد من سلامة الصندوق والشحنة قبل إتمام الاستلام.`,
        actions: [
          { label: "تصفح الماركات الموثوقة 🌟", href: "/marketplace" },
          { label: "تواصل مع الدعم الفني 🎧", href: "/contact" },
        ],
      };
    }

    // Categories and product suggestions
    if (
      q.includes("منتج") ||
      q.includes("عطور") ||
      q.includes("ساعات") ||
      q.includes("جوال") ||
      q.includes("هاتف") ||
      q.includes("ايفون") ||
      q.includes("ملابس") ||
      q.includes("ازياء") ||
      q.includes("أزياء") ||
      q.includes("سيارات") ||
      q.includes("رياضة") ||
      q.includes("قسم") ||
      q.includes("تصنيف") ||
      q.includes("خصم") ||
      q.includes("عروض")
    ) {
      return {
        reply: `لدينا تشكيلة مميزة ومحدثة يومياً في سوق **NOORMEXA** لأبرز الماركات العالمية:

📱 **الإلكترونيات الذكية:** أحدث هواتف آبل، سامسونج، لابتوبات قيمنق، وسماعات عازلة للضوضاء.
💎 **العطور والساعات الفاخرة:** عطور شرقية وغربية نيش أصلية 100% وساعات سويسرية مع شهادات ضمان.
👗 **الأزياء والإكسسوارات:** أحدث صيحات الموضة العالمية من أرقى دور الأزياء والأحذية الرياضية.
🏠 **مستلزمات المنزل والمطبخ الذكي:** أجهزة كهربائية مبتكرة وديكورات عصرية راقية.
🚗 **إكسسوارات السيارات ومستلزمات الرياضة:** منتجات عالية الجودة مع شحن سريع.

ما هو المنتج المحدد أو الميزانية التي ترغب بالبحث عنها وسأساعدك فوراً؟`,
        actions: [
          { label: "تصفح كافة الأقسام 🛍️", href: "/marketplace" },
          { label: "مشاهدة ريلز المنتجات 🎬", href: "/" },
        ],
      };
    }

    // Support / Contact
    if (
      q.includes("تواصل") ||
      q.includes("دعم") ||
      q.includes("رقم") ||
      q.includes("خدمة العملاء") ||
      q.includes("شكوى") ||
      q.includes("ايميل") ||
      q.includes("واتساب")
    ) {
      return {
        reply: `يسعدنا دائماً خدمتك! فريق دعم **NOORMEXA** متواجد على مدار 24 ساعة للإجابة على أي استفسار أو حل أي مشكلة:

💬 **المحادثة الفورية:** يمكنك الحديث معي في أي وقت هنا.
📩 **البريد الإلكتروني المباشر:** support@noormexa.com
📞 **مركز الاتصال وواتساب:** متاح في صفحة التواصل لخدمة العملاء في السعودية ومصر والإمارات.`,
        actions: [{ label: "صفحة الدعم والتواصل 💬", href: "/contact" }],
      };
    }

    // Default polite shopping greeting/fallback
    return {
      reply: `مرحباً بك! أنا **أوسا (AOSA)**، رفيقتكِ الذكية في منصة **NOORMEXA** ✨

أنا هنا لمساعدتك في كل خطوة:
• البحث عن أفضل المنتجات والعروض الحصرية
• الإجابة عن خيارات الدفع والتقسيط (تمارا وتابي ومدى)
• متابعة الشحن والتوصيل السريع لنفس اليوم
• سياسات الإرجاع وحماية المشتري الموثوقة

كيف يمكنني مساعدتك الآن؟`,
      actions: [
        { label: "تصفح سوق نورمكسا 🛍️", href: "/marketplace" },
        { label: "عروض وتخفيضات اليوم 🔥", href: "/?filter=deals" },
      ],
    };
  }

  // Arabic responses for Sellers
  if (lang === "ar" && role === "seller") {
    // Open a store / register
    if (
      q.includes("متجر") ||
      q.includes("افتح متجر") ||
      q.includes("تسجيل") ||
      q.includes("بائع") ||
      q.includes("كيف ابيع") ||
      q.includes("خطوات") ||
      q.includes("تاجر")
    ) {
      return {
        reply: `أهلاً بك في مجتمع تجار **NOORMEXA**! بدء البيع وفتح متجرك الاحترافي يتم في دقائق معدودة:

1️⃣ **إنشاء حساب متجر:** اضغط على "فتح متجر جديد" واملأ بيانات متجرك الأساسية (الاسم، الشعار، ونبذة عن نشاطك).
2️⃣ **توثيق المتجر:** يمكنك البدء كفرد موثق (بوثيقة عمل حر) أو شركة بسجل تجاري معتمد.
3️⃣ **رفع المنتجات:** أضف صور منتجاتك، الأسعار، والمخزون، وسأساعدك في كتابة أوصاف تسويقية احترافية لزيادة المبيعات!
4️⃣ **استقبال الطلبات والأرباح:** يتم توجيه الطلبات إليك مباشرة، ويتولى مناديب نورمكسا استلام الشحنة وتوصيلها للعميل، وتُحول أرباحك لحسابك البنكي دورياً.`,
        actions: [
          { label: "تسجيل متجر جديد الآن 🚀", href: "/seller/register" },
          { label: "لوحة تحكم البائع 📊", href: "/seller/dashboard" },
        ],
      };
    }

    // Product description / marketing
    if (
      q.includes("وصف") ||
      q.includes("تسويق") ||
      q.includes("عنوان") ||
      q.includes("اكتب") ||
      q.includes("كتابة") ||
      q.includes("مبيعات") ||
      q.includes("اعلان") ||
      q.includes("ريلز") ||
      q.includes("ترويج")
    ) {
      return {
        reply: `بصفتي مستشارتك التسويقية الذكية في **NOORMEXA**، إليك المعادلة الذهبية لمضاعفة مبيعات منتجك:

✍️ **العنوان الجذاب:** ابدأ باسم الماركة + نوع المنتج + الميزة الرئيسية (مثال: *"ساعة رجالية فاخرة مقاومة للماء مع سوار جلدي طبيعي"*).
🎯 **نقاط البيع الفريدة (Bullets):** اذكر 3 إلى 5 فوائد مباشرة تجيب على سؤال العميل: *"ماذا سأستفيد؟"*.
📸 **الصور والفيديو:** استخدم صوراً واضحة بإضاءة طبيعية وخلفية نقية، وارفع مقطع ريلز قصير (Reels) للمنتج يوضح استخدامه العملي لزيادة نسبة الشراء بأكثر من 300%.
⭐ **العرض الترويجي:** أضف كود خصم ترحيبي أو شحن مجاني للقطع الإضافية لتحفيز الطلب الفوري.

أخبرني باسم منتجك ومواصفاته وسأصيغ لك وصفاً جاهزاً للنسخ واللصق فوراً!`,
        actions: [
          { label: "لوحة تحكم البائع 🏪", href: "/seller/dashboard" },
          { label: "نشر فيديو ريلز للمنتج 🎬", href: "/seller/dashboard" },
        ],
      };
    }

    // Commissions / Merchant tiers
    if (
      q.includes("عمولة") ||
      q.includes("نسبة") ||
      q.includes("باقة") ||
      q.includes("باقات") ||
      q.includes("اشتراك") ||
      q.includes("فلوس") ||
      q.includes("رسوم") ||
      q.includes("ارباح")
    ) {
      return {
        reply: `في **NOORMEXA** نوفر نظام باقات وعمولات تنافسي يدعم نمو تجارتك:

🟢 **الباقة الأساسية (Free Starter):** مجانية تماماً وبدون أي اشتراك شهري، مع عمولة بيع رمزية ومرنة تُقتطع فقط عند إتمام البيع بنجاح.
🔵 **باقة التاجر المحترف (Pro Merchant):** عمولة مخفضة جداً، تقارير وتحليلات مبيعات متقدمة، وأولوية في الظهور داخل محركات بحث المنصة.
🟡 **باقة الشركات والعلامات الكبرى (Enterprise Flagship):** شارة التوثيق الذهبية، مدير حساب تجاري مخصص، وحملات ترويجية مستمرة في الصفحة الرئيسية وسلايدر الإعلانات.
💳 **تحويل الأرباح:** يتم تحويل مستحقاتك وأرباحك لحسابك البنكي أو محفظتك بشكل دوري وشفاف عبر لوحة التحكم.`,
        actions: [
          { label: "استعراض باقات المتاجر 📈", href: "/seller/dashboard" },
          { label: "سحب وإدارة الأرباح 💼", href: "/seller/dashboard" },
        ],
      };
    }

    // Default seller response
    return {
      reply: `مرحباً بك يا بطل! أنا **أوسا (AOSA)**، مستشارتكِ الذكية لتمكين التجارة في **NOORMEXA** 💼

أنا هنا لمساعدتك في:
• كتابة عناوين وأوصاف تسويقية احترافية ترفع المبيعات
• تسعير منتجاتك وتحسين صورها وتنسيق متجرك
• شرح نظام العمولات والباقات الترويجية
• إطلاق حملات ريلز فيديو ممولة لمنتجاتك

كيف أستطيع دعم متجرك اليوم؟`,
      actions: [
        { label: "لوحة تحكم التاجر 🏪", href: "/seller/dashboard" },
        { label: "إضافة منتج جديد ➕", href: "/seller/dashboard" },
      ],
    };
  }

  // English fallback for Buyers
  if (role === "buyer") {
    return {
      reply: `Welcome to **NOORMEXA**! I am **AOSA**, your smart shopping companion ✨

Here to assist you anytime with:
• Fast express delivery (same-day in major cities & 1-3 days regional)
• Safe & flexible payments: Mada, Apple Pay, Visa/Mastercard, Tamara & Tabby installments, Cash on Delivery
• 100% Authenticity guarantee & easy 14-day return policy
• Finding the best trending deals across Electronics, Fashion, Perfumes & Living

How can I help you today?`,
      actions: [
        { label: "Browse Marketplace 🛍️", href: "/marketplace" },
        { label: "Track Your Order 📦", href: "/orders" },
      ],
    };
  }

  // English fallback for Sellers
  return {
    reply: `Hello merchant! I am **AOSA**, your dedicated business and commerce advisor on **NOORMEXA** 💼

Ready to help you:
• Set up and optimize your storefront
• Write high-converting, professional product descriptions
• Scale with sponsored video reels and promotional banners
• Explain merchant fee tiers and seamless payout management

What would you like to achieve today?`,
    actions: [
      { label: "Open Store 🚀", href: "/seller/register" },
      { label: "Seller Dashboard 📊", href: "/seller/dashboard" },
    ],
  };
}

export function generateAosaResponse(
  userQuery: string,
  role: "buyer" | "seller" = "buyer",
  lang: "ar" | "en" = "ar",
  readOnlyReason?: "missing_key" | "invalid_key" | "network_fallback" | null
): AgentResponse {
  const q = (userQuery || "").toLowerCase().trim();
  const raw = getRawAosaResponse(q, role, lang);

  return {
    ...raw,
    source: "aosa_core",
    isReadOnly: true,
    readOnlyReason: readOnlyReason ?? null,
    readOnlyNotice:
      lang === "ar"
        ? "وضع القراءة والاستفسار الذكي: تصفح المنتجات والشحن والدفع متاح بالكامل"
        : "Smart Read-Only Mode: Catalog, shipping & payments fully available",
  };
}
