# NOORMEXA — Global E-Commerce Marketplace

سوق إلكتروني (Marketplace) يجمع المتسوقين والبائعين والمتاجر والمعلنين في مكان واحد، مبني بـ **Next.js 16** و **Supabase** و **Tailwind CSS v4**.

---

## 1. التقنيات المستخدمة

| التقنية | الاستخدام |
|---|---|
| Next.js 16 (App Router + Turbopack) | إطار العمل الأساسي |
| TypeScript | لغة البرمجة |
| Tailwind CSS v4 | التصميم |
| Supabase | قاعدة البيانات + تسجيل الدخول/الحساب (Auth) |
| lucide-react | الأيقونات |
| Vercel | الاستضافة والنشر |

---

## 2. تشغيل المشروع محليًا

```bash
# 1. تثبيت الحزم
npm install

# 2. انسخ ملف متغيرات البيئة وحط فيه بيانات Supabase (خطوة 3 تحت)
cp .env.example .env.local

# 3. شغّل المشروع
npm run dev
```

المشروع هيفتح على `http://localhost:3000`

---

## 3. إعداد مشروع Supabase من الصفر

### أ. إنشاء المشروع
1. روح على [supabase.com](https://supabase.com) وسجل دخول.
2. اعمل **New Project**.
3. اختار اسم للمشروع وباسورد لقاعدة البيانات (احفظه فى مكان آمن).
4. اختار المنطقة (Region) الأقرب لجمهورك، واستنى دقيقة لحد ما المشروع يتجهز.

### ب. إنشاء الجداول (Database Schema)
1. من القائمة الجانبية، افتح **SQL Editor**.
2. اعمل **New Query**.
3. افتح ملف `supabase/schema.sql` الموجود جوه المشروع، وانسخ محتواه كامل، والصقه فى المحرر.
4. دوس **Run**.
5. اعمل **New Query** تانية، وكرر نفس الخطوة مع ملف `supabase/schema_phase2_marketplace.sql` (لازم تشغل schema.sql الأول قبل ده).
6. بعد ما تسجل حساب لنفسك فى الموقع، ارجع لـ SQL Editor ونفذ السطر ده (غيّر الإيميل بإيميلك):
   ```sql
   update public.profiles set is_admin = true where email = 'your-email@example.com';
   ```
   ده اللي هيديك صلاحية "مالك المنصة" لما نبني لوحة التحكم فى المرحلة الجاية.

الكود الأول هينشئلك جدول `profiles` (بيانات المستخدمين: متسوق/بائع/متجر/معلن)، والكود التاني هينشئ `categories` و`stores` و`products` و`orders` — الأساس الحقيقي للسوق (بدل الموقع التعريفي بس) — مع كل قواعد الحماية (Row Level Security) اللازمة.

### ج. تفعيل تسجيل الدخول بالبريد الإلكتروني
1. من القائمة الجانبية: **Authentication > Providers**.
2. تأكد إن **Email** مفعّل.
3. (اختياري للاختبار السريع) لو عايز تجرب التسجيل بسرعة من غير ما تستنى إيميل تأكيد: **Authentication > Providers > Email > Confirm email** ممكن توقفه مؤقتًا. يفضّل ترجعه تاني قبل ما توديه للمستخدمين الحقيقيين.

### د. الحصول على مفاتيح الربط
1. من القائمة الجانبية: **Project Settings > API**.
2. هتلاقي:
   - **Project URL** → ده اللي هتحطه فى `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → ده اللي هتحطه فى `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 4. متغيرات البيئة

### محليًا
افتح ملف `.env.local` (اللي عملته بنسخ `.env.example`) وحط فيه القيم الحقيقية:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here

# اختياري - المساعد الذكي (راجع قسم 9) - Gemini مجاني
GEMINI_API_KEY=
```

### على Vercel
1. من مشروعك على Vercel: **Settings > Environment Variables**.
2. ضيف نفس المتغيرات والقيم اللي فوق (`GEMINI_API_KEY` اختياري ومجاني، سيبه فاضي لو مش عايز تفعّل الشات دلوقتي).
3. اختار البيئات الثلاثة: Production, Preview, Development.
4. بعد الإضافة، اعمل **Redeploy** للمشروع عشان القيم تتفعّل.

---

## 5. رفع المشروع على مستودع GitHub جديد

```bash
cd noormexa-platform
git init
git add .
git commit -m "Initial commit - NOORMEXA platform"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

> **مهم:** ملف `.gitignore` موجود بالفعل فى المشروع، وهو اللي بيمنع رفع `node_modules` و `.env.local` (اللي فيه مفاتيحك السرية) على GitHub بالغلط.

---

## 6. ربط المستودع بـ Vercel

1. من [vercel.com](https://vercel.com): **Add New > Project**.
2. اختار المستودع اللي رفعته على GitHub.
3. Vercel هيكتشف إنه مشروع Next.js تلقائيًا (مفيش إعدادات إضافية مطلوبة).
4. **قبل** ما تعمل Deploy، ضيف متغيرات البيئة (خطوة 4 فوق).
5. دوس **Deploy**.

---

## 7. بنية المشروع

```
src/
├── app/
│   ├── layout.tsx        # الهيكل العام (Navbar + Footer + الخطوط)
│   ├── page.tsx          # الصفحة الرئيسية
│   ├── globals.css       # كل الأنماط + متغيرات الألوان
│   └── auth/page.tsx     # صفحة تسجيل الدخول / إنشاء حساب
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── landing/HeroImageSlider.tsx
├── context/
│   ├── AuthContext.tsx   # حالة المستخدم المسجل دخوله
│   └── ThemeContext.tsx  # الوضع الليلي/النهاري
└── lib/
    └── supabaseClient.ts # الاتصال بـ Supabase

supabase/
└── schema.sql            # سكريبت إنشاء قاعدة البيانات
```

---

## 8. الهوية البصرية

| العنصر | القيمة |
|---|---|
| Deep Navy | `#0B1322` |
| Champagne Gold | `#D4AF37` |
| Warm Ivory | `#F6F2E9` |
| Charcoal | `#1C1C1E` |
| خط العناوين (إنجليزي) | Montserrat |
| الخط العربي | Cairo |

أصول الشعار (الأيقونة بمقاسات مختلفة، النسخ الأفقية) موجودة فى `public/` و `public/brand/`.

---

## 9. خارطة الطريق (4 مراحل) — كلها مكتملة ✅

- **✅ المرحلة 1 — الهوية والواجهة**: شعار عالي الجودة، ألوان وخطوط رسمية، صفحة رئيسية بأقسام حقيقية (أدوار، تصنيفات، أرقام وثقة، خطط اشتراك، أسئلة شائعة).
- **✅ المرحلة 2 — بنية تحتية حقيقية**: جداول `categories` / `stores` / `products` / `orders` (فى `supabase/schema_phase2_marketplace.sql`)، صفحات ديناميكية فعلية (`/category/[slug]`, `/store/[slug]`, `/product/[id]`)، ولوحة تحكم للبائع على `/dashboard` (إنشاء متجر + إضافة/إخفاء/حذف منتجات). المتاجر الجديدة دلوقتي بتتسجل بحالة "قيد المراجعة" فعليًا لحد ما توافق عليها من لوحة المالك.
- **✅ المرحلة 3 — لوحة تحكم المالك**: صفحة `/admin` (محمية بعمود `is_admin`) فيها: إحصائيات شاملة (متاجر، منتجات، طلبات، أرباح العمولة)، جدول كامل لإدارة المتاجر (موافقة/إيقاف، تعديل نسبة العمولة، تغيير الباقة)، وإدارة التصنيفات (إضافة/حذف).
- **✅ المرحلة 4 — المساعد الذكي**: شات بوت عائم فى كل صفحات الموقع، بيفرّق بين وضع "متسوق" و"بائع"، مبني على Google Gemini (مجاني) مع دعم التبديل لـ Anthropic Claude لاحقًا. **لازم تضيف `GEMINI_API_KEY`** (تفاصيل تحت) عشان يشتغل، وإلا هيظهر رسالة "غير مفعّل" بدل ما يكسر الموقع.

### تفعيل المساعد الذكي

**الخيار الموصى به للبداية (مجاني تمامًا) — Google Gemini:**
1. ادخل [aistudio.google.com/apikey](https://aistudio.google.com/apikey) بحساب Google، ودوس **Create API key** — من غير بطاقة ائتمان.
2. ضيف `GEMINI_API_KEY` بالقيمة دي فى `.env.local` محليًا، وفى إعدادات Vercel للنشر.
3. المتغير `GEMINI_MODEL` اختياري (افتراضيًا `gemini-3.5-flash-lite` المجاني).
4. **حد الاستخدام المجاني**: حوالي 1000-1500 رسالة يوميًا — أكتر من كافي لمرحلة الاختبار والإطلاق الأولي. لو الموقع كبر وحابب تشغّل بدون حدود، وقتها تفعّل الفوترة من نفس حساب Google.
5. ملحوظة خصوصية: على الباقة المجانية، جوجل ممكن تستخدم محتوى المحادثات لتحسين نماذجها — مش مشكلة فى مرحلة التجربة، لكن اعرفها.

**بديل مدفوع لاحقًا (Anthropic Claude)** — لو حبيت جودة أعلى أو خصوصية أكتر مستقبلًا:
1. اعمل مفتاح من [console.anthropic.com](https://console.anthropic.com) (فيه تكلفة استخدام من أول مفتاح).
2. ضيف `ANTHROPIC_API_KEY` بدل (أو مع) `GEMINI_API_KEY`.
3. لو الاتنين المفتاحين موجودين مع بعض، الموقع هيفضّل **Gemini** تلقائيًا. لو عايز تجبره يستخدم Anthropic، امسح `GEMINI_API_KEY` بس.

## 10. نقاط تقنية إضافية للمستقبل

- ربط نظام دفع فعلي (مثل Stripe أو Paymob للسوق المصري/العربي) بدل تسجيل الطلبات يدويًا.
- سلة شراء حقيقية (Cart) وصفحة Checkout كاملة.
- إشعارات بريدية للبائع عند وصول طلب جديد، وللمتسوق عند تحديث حالة طلبه.
- ترقية المساعد الذكي ليقترح منتجات حقيقية من قاعدة البيانات مباشرة (Function calling / RAG).

