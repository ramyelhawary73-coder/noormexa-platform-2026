import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X, 
  Globe, 
  ShieldCheck, 
  Truck, 
  ChevronDown, 
  Flame 
} from 'lucide-react';

export default function Navbar({ 
  cartCount = 0, 
  wishlistCount = 0, 
  onOpenCart = () => {}, 
  onOpenAuth = () => {} 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('AR');
  const [searchQuery, setSearchQuery] = useState('');

  // مراقبة النزول في الصفحة لجعل الهيدر زجاجي وأنيق
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300 font-sans">
      
      {/* 1. الشريط الإعلاني العلوي (Top Announcement Bar) */}
      <div className="bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-950 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="hidden md:flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Flame size={14} className="animate-pulse" /> عروض الصيف الكبرى 2026: خصومات تصل إلى 70%
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Truck size={14} /> شحن مجاني للطلبات فوق 50$
            </span>
          </div>

          <div className="w-full md:w-auto flex justify-between md:justify-end items-center gap-4 text-slate-200">
            <div className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>ضمان أصلي 100%</span>
            </div>
            
            {/* مبدل العملة واللغة */}
            <div className="flex items-center gap-3 border-r border-slate-700 pr-3 mr-1">
              <button 
                onClick={() => setSelectedLang(selectedLang === 'AR' ? 'EN' : 'AR')}
                className="hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <Globe size={13} />
                <span>{selectedLang}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. شريط التصفح الرئيسي (Main Navigation) */}
      <div className={`transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/90 backdrop-blur-md shadow-lg shadow-black/20 border-b border-slate-800 py-3' 
          : 'bg-slate-900 border-b border-slate-800/80 py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* الشعار (Logo) */}
            <div className="flex items-center gap-3">
              <a href="#" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                  N
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                    NOORMEXA<span className="text-amber-500 text-sm font-bold ml-1">.2026</span>
                  </span>
                  <span className="text-[10px] text-slate-400 tracking-widest uppercase font-medium">Global Marketplace</span>
                </div>
              </a>
            </div>

            {/* محرك البحث المتقدم (Smart Search Bar) */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-6">
              <div className="relative w-full">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن المنتجات، الماركات، الفئات..."
                  className="w-full bg-slate-800/80 text-white placeholder-slate-400 text-sm rounded-full pl-4 pr-12 py-2.5 border border-slate-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center hover:bg-amber-400 transition-colors shadow-md">
                  <Search size={16} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* الأزرار التفاعلية (Actions: User, Wishlist, Cart) */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* زر الحساب */}
              <button 
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <User size={16} />
                </div>
                <div className="text-right hidden xl:block">
                  <p className="text-[10px] text-slate-400 leading-tight">مرحباً بك</p>
                  <p className="text-xs font-bold text-white">تسجيل الدخول</p>
                </div>
              </button>

              {/* المفضلة */}
              <button className="relative p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* سلة التسوق (Cart Button) */}
              <button 
                onClick={onOpenCart}
                className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <div className="relative">
                  <ShoppingBag size={20} className="stroke-[2.2]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-slate-950 text-amber-400 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-amber-500">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-sm">السلة</span>
              </button>

              {/* زر قائمة الهاتف */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

            </div>
          </div>

          {/* محرك البحث للشاشات الصغيرة */}
          <div className="mt-3 lg:hidden">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="ابحث عن المنتجات..."
                className="w-full bg-slate-800 text-white text-xs rounded-xl px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-amber-500"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. شريط التصنيفات السريعة (Categories Navigation Bar) */}
      <nav className="bg-slate-950/95 border-b border-slate-800 text-xs hidden lg:block text-slate-300">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-8 py-2.5 font-medium">
            <a href="#all" className="flex items-center gap-1.5 text-amber-400 font-bold hover:text-amber-300">
              <Menu size={16} /> جميع التصنيفات
            </a>
            <a href="#electronics" className="hover:text-white transition-colors">إلكترونيات وهواتف</a>
            <a href="#fashion" className="hover:text-white transition-colors">أزياء وموضة</a>
            <a href="#home" className="hover:text-white transition-colors">المنزل والمعيشة</a>
            <a href="#beauty" className="hover:text-white transition-colors">العناية والجمال</a>
            <a href="#deals" className="text-rose-400 font-semibold hover:text-rose-300 flex items-center gap-1">
              🔥 عروض اليوم
            </a>
          </div>
          <div className="text-slate-400">
            خدمة العملاء: <span className="text-amber-400 font-bold dir-ltr">+1 (800) 2026-NXM</span>
          </div>
        </div>
      </nav>

      {/* 4. قائمة الهاتف المنسدلة (Mobile Menu) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-6 py-6 space-y-4 animate-in slide-in-from-top text-right">
          <p className="text-xs font-bold text-slate-400 uppercase">التصنيفات</p>
          <a href="#all" className="block text-slate-200 hover:text-amber-400 py-1 font-semibold">🔥 جميع العروض</a>
          <a href="#electronics" className="block text-slate-200 hover:text-amber-400 py-1">📱 إلكترونيات</a>
          <a href="#fashion" className="block text-slate-200 hover:text-amber-400 py-1">👗 أزياء</a>
          <a href="#home" className="block text-slate-200 hover:text-amber-400 py-1">🏠 المنزل</a>
          <div className="pt-4 border-t border-slate-800 flex justify-between">
            <button onClick={onOpenAuth} className="text-amber-400 font-bold text-sm">تسجيل الدخول / إنشاء حساب</button>
            <button className="text-slate-400 text-sm">العربية (SAR)</button>
          </div>
        </div>
      )}

    </header>
  );
}
