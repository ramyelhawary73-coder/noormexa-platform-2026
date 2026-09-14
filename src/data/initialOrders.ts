import type { Order } from "@/types/marketplace";

// Generate realistic simulated reconciliation orders (50 realistic records) for instant out-of-the-box demonstration
export function generateInitialDemoOrders(): Order[] {
  const stores = [
    { id: "store-noormexa-official", name: "متجر نورميكسا الرسمي (NOORMEXA Flagship Direct)" },
    { id: "store-rolex-vip", name: "بوتيك الساعات السويسرية الفاخرة (Geneva Horology)" },
    { id: "store-dior-beauty", name: "دار العطور ومستحضرات التجميل الباريسية (Dior Boutique)" },
    { id: "store-tech-hub", name: "مركز تكنولوجيا المستقبل والأجهزة الذكية (NextGen Electronics)" },
    { id: "store-leather-craft", name: "المشغولات والجلديات الإيطالية الراقية (Milano Atelier)" },
  ];

  const customers = [
    { name: "رامي الهواري", phone: "+20 100 123 4567", city: "القاهرة الجديدة", address: "شارع التسعين الشمالي، كمبوند القطامية ديونز" },
    { name: "محمد سلطان الشامسي", phone: "+971 50 987 6543", city: "دبي", address: "برج خليفة بوليفارد، شقة 1402" },
    { name: "سارة فهد العتيبي", phone: "+966 54 321 8899", city: "الرياض", address: "حي النخيل، شارع الأمير تركي الأول" },
    { name: "عبدالله بن حمد الكواري", phone: "+974 55 123 456", city: "الدوحة", address: "اللؤلؤة، بورتو أرابيا برج 12" },
    { name: "فاطمة الزهراء المنصوري", phone: "+971 52 444 7788", city: "أبوظبي", address: "جزيرة السعديات، فيلا 25" },
    { name: "خالد بن صالح الدوسري", phone: "+966 50 888 1122", city: "جدة", address: "حي الشاطئ، كورنيش جدة الشمالي" },
    { name: "نورهان الشريف", phone: "+20 122 345 6789", city: "الإسكندرية", address: "كفر عبده، شارع أبو قير" },
    { name: "عمر فايز المطيري", phone: "+965 99 112 233", city: "الكويت", address: "منطقة الشويخ الصناعية، قسيمة 15" },
  ];

  const statuses: Order["status"][] = ["delivered", "shipped", "paid", "processing", "pending", "delivered"];
  const paymentMethods: Array<Order["payment_method"]> = ["stripe", "applePayMada", "tabbyTamara", "paypal", "cod"];

  const orders: Order[] = [];
  const baseTime = Date.now() - 30 * 24 * 60 * 60 * 1000; // past 30 days

  for (let i = 1; i <= 50; i++) {
    const store = stores[i % stores.length];
    const customer = customers[i % customers.length];
    const status = statuses[i % statuses.length];
    const paymentMethod = paymentMethods[i % paymentMethods.length];
    const itemSubtotal = 1200 + ((i * 387) % 18500);
    const vat = Math.round(itemSubtotal * 0.14);
    const shipping = (i % 3 === 0) ? 0 : 75;
    const total = itemSubtotal + vat + shipping;
    const commission = Math.round(itemSubtotal * 0.12);
    const orderDate = new Date(baseTime + i * 14 * 60 * 60 * 1000).toISOString();

    orders.push({
      id: `ord-seed-${1000 + i}`,
      orderNumber: `NRX-2026-${100000 + i * 137}`,
      trackingNumber: `TRK-${store.id.slice(6, 10).toUpperCase()}-${800000 + i * 291}`,
      buyer_id: `buyer-${customer.name.slice(0, 3)}`,
      store_id: store.id,
      store_name: store.name,
      subtotal: itemSubtotal,
      discount_amount: (i % 4 === 0) ? 150 : 0,
      shipping_cost: shipping,
      vat_amount: vat,
      total_amount: total,
      commission_amount: commission,
      payment_method: paymentMethod,
      payment_status: status === "pending" ? "pending" : status === "cancelled" ? "failed" : "paid",
      status: status,
      shipping_speed: i % 2 === 0 ? "priority" : "standard",
      shipping_info: {
        fullName: customer.name,
        email: `customer${i}@example.com`,
        phone: customer.phone,
        country: customer.city === "دبي" || customer.city === "أبوظبي" ? "الإمارات" : customer.city === "الرياض" || customer.city === "جدة" ? "المملكة العربية السعودية" : customer.city === "الدوحة" ? "قطر" : customer.city === "الكويت" ? "الكويت" : "مصر",
        city: customer.city,
        address: customer.address,
        postalCode: `${11511 + (i % 100)}`,
      },
      items: [
        {
          id: `item-${1000 + i}`,
          product_id: `prod-${(i % 12) + 1}`,
          product_name: `المنتج الاستراتيجي الفاخر الفئة #${(i % 8) + 1}`,
          quantity: 1 + (i % 3),
          unit_price: Math.round(itemSubtotal / (1 + (i % 3))),
        },
      ],
      created_at: orderDate,
      tracking_steps: [
        {
          status: "placed",
          titleAr: "تم إنشاء وتأكيد الطلب",
          titleEn: "Order Placed & Confirmed",
          timestamp: orderDate,
          completed: true,
          current: status === "pending",
        },
        {
          status: "confirmed",
          titleAr: "جاري التجهيز بالمستودع",
          titleEn: "Processing at Merchant Hub",
          timestamp: orderDate,
          completed: status !== "pending",
          current: status === "processing",
        },
        {
          status: "in_transit",
          titleAr: "خرج للتسليم مع شركة الشحن",
          titleEn: "Out for Delivery",
          timestamp: orderDate,
          completed: status === "shipped" || status === "delivered",
          current: status === "shipped",
        },
        {
          status: "delivered",
          titleAr: "تم التسليم بنجاح للعميل",
          titleEn: "Delivered to Customer",
          timestamp: orderDate,
          completed: status === "delivered",
          current: status === "delivered",
        },
      ],
    });
  }

  return orders;
}
