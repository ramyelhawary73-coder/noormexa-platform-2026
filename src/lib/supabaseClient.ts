import { createClient } from '@supabase/supabase-js';
import type { Product, Shipment, Store } from '@/types/marketplace';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qiqvmsjjgwdsievkrhly.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_lmZdv208iUvYZmi_P-A07Q_ss1Bvn2g';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'placeholder-anon-key'
);

// خط الاتصال السحابي الموحد لقاعدة بيانات منصة NOORMEXA مع دعم العزل السحابي لكل متجر
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/**
 * Multi-Tenant Store Cloud Workspace Services
 * توفير عزل سحابي كامل ومستقل لكل متجر في Supabase
 */
export const storeCloudServices = {
  /**
   * تهيئة وتخصيص مساحة سحابية مستقلة للمتجر الجديد في Supabase
   */
  async provisionStoreWorkspace(store: Store) {
    if (!isSupabaseConfigured) return { success: true, localOnly: true };
    try {
      // 1. تسجيل أو تحديث بيانات المتجر في جدول المتاجر
      const { data, error } = await supabase
        .from('stores')
        .upsert(
          {
            id: store.id,
            owner_id: store.owner_id,
            name: store.name,
            slug: store.slug,
            description: store.description,
            country: store.country,
            plan: store.plan,
            status: store.status,
            is_verified: store.is_verified,
            commission_rate: store.commission_rate,
            logo_url: store.logo_url,
            banner_url: store.banner_url,
            bank_name: store.bank_name,
            iban: store.iban,
            cr_number: store.cr_number,
            tax_number: store.tax_number,
            contact_email: store.contact_email,
            contact_phone: store.contact_phone,
            created_at: store.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.warn('Supabase store provisioning warning:', error.message);
      }
      return { success: !error, data };
    } catch (err) {
      console.error('Error provisioning store in Supabase:', err);
      return { success: false, error: err };
    }
  },

  /**
   * جلب كافة بيانات المتجر المعزولة سحابياً حصراً
   */
  async fetchStoreIsolatedData(storeId: string) {
    if (!isSupabaseConfigured) return null;
    try {
      const [productsRes, shipmentsRes, ordersRes, postsRes] = await Promise.all([
        supabase.from('products').select('*').eq('store_id', storeId),
        supabase.from('shipments').select('*').eq('store_id', storeId),
        supabase.from('orders').select('*').eq('store_id', storeId),
        supabase.from('marketing_posts').select('*').eq('store_id', storeId),
      ]);

      return {
        products: productsRes.data || [],
        shipments: shipmentsRes.data || [],
        orders: ordersRes.data || [],
        marketingPosts: postsRes.data || [],
      };
    } catch (err) {
      console.error('Error fetching isolated store data:', err);
      return null;
    }
  },

  /**
   * مزامنة منتج جديد أو معدل خاص بمتجر محدد
   */
  async syncStoreProduct(storeId: string, product: Product) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('products').upsert({
        id: product.id,
        store_id: storeId,
        brand_name: product.brand_name || '',
        name: product.name,
        name_en: product.name_en || product.name,
        description: product.description,
        description_en: product.description_en || '',
        category_id: product.category_id,
        category_slug: product.category_slug || '',
        price: product.price,
        original_price: product.original_price,
        image_url: product.image_url,
        stock: product.stock,
        status: product.status,
        free_shipping: product.free_shipping,
        created_at: product.created_at,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Error syncing store product:', err);
    }
  },

  /**
   * مزامنة وحفظ بوليصة شحن خاصة بالمتجر
   */
  async syncStoreShipment(storeId: string, shipment: Shipment) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('shipments').upsert({
        id: shipment.id,
        store_id: storeId,
        store_name: shipment.storeName,
        awb_number: shipment.awbNumber,
        carrier_id: shipment.carrierId,
        carrier_name: shipment.carrierName,
        carrier_logo: shipment.carrierLogo,
        order_id: shipment.orderId,
        recipient_name: shipment.recipientName,
        recipient_phone: shipment.recipientPhone,
        recipient_city: shipment.recipientCity,
        recipient_country: shipment.recipientCountry,
        recipient_address: shipment.recipientAddress,
        items_list: shipment.itemsList,
        package_weight_kg: shipment.packageWeightKg,
        declared_value: shipment.declaredValue,
        payment_type: shipment.paymentType,
        cod_amount: shipment.codAmount || 0,
        status: shipment.status,
        delivery_otp: shipment.deliveryOtp,
        driver_name: shipment.driverName,
        driver_phone: shipment.driverPhone,
        driver_vehicle: shipment.driverVehicle,
        checkpoints: shipment.checkpoints,
        created_at: shipment.created_at,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Error syncing store shipment:', err);
    }
  },

  /**
   * تحديث حالة شحنة المتجر في السحابة
   */
  async updateStoreShipmentStatus(storeId: string, shipmentId: string, status: string) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase
        .from('shipments')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipmentId)
        .eq('store_id', storeId);
    } catch (err) {
      console.warn('Error updating store shipment status in Supabase:', err);
    }
  },
};

