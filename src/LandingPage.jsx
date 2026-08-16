import React from 'react';
import { 
  FaSearch, FaClock, FaUserCheck, FaUtensils, FaSpa, FaShoppingBag, 
  FaConciergeBell, FaHome, FaSmile, FaFacebookF, FaInstagram, FaTwitter
} from 'react-icons/fa';

export default function LandingPage({ onNavigateToDeal, onNavigateToExplore }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 cursor-pointer">
          <div className="bg-emerald-700 text-white p-2 rounded-lg font-bold text-lg flex items-center justify-center w-8 h-8">
            V
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">Vendor<span className="text-emerald-700">Hive</span></span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <button className="hover:text-emerald-700 transition">Home</button>
          
          <button onClick={onNavigateToExplore} className="hover:text-emerald-700 transition">
            Explore Map
          </button>
          
          {/* নাম পরিবর্তন করে 'Co-op Deals' করা হয়েছে */}
          <button onClick={onNavigateToDeal} className="hover:text-emerald-700 transition text-emerald-700 font-bold">
            Co-op Deals
          </button>
          <button className="hover:text-emerald-700 transition">About Us</button>
        </div>

        <div className="flex items-center space-x-4 text-sm font-semibold">
          <button className="text-slate-700 hover:text-emerald-700 hidden sm:block">Join as Merchant</button>
          <button className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 transition flex items-center space-x-2">
            <FaUserCheck className="text-xs" />
            <span>My Hive</span>
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-emerald-800 text-white py-16 px-6">
        <div className="max-w-5xl mx-auto text-left">
          <span className="bg-amber-400 text-slate-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-4">
            Collective Partner Promotion
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Discover Local Businesses That Thrive Together
          </h1>
          <p className="text-emerald-100 text-base md:text-lg max-w-2xl mb-8">
            VendorHive unites neighborhood artisans, food makers, and retailers. Shop local, save with cross-promotional neighborhood deals, and support independent creators.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={onNavigateToDeal} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-6 py-3 rounded-lg flex items-center space-x-2 transition shadow-md">
              <span>Explore Deals</span>
              <FaSearch className="text-xs" />
            </button>
            <button className="bg-white hover:bg-slate-100 text-slate-800 font-bold px-6 py-3 rounded-lg border border-slate-200 transition">
              List Your Business
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-b border-slate-200 py-6 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div>
            <div className="text-2xl font-black text-slate-900">1,420+</div>
            <div className="text-xs text-slate-500 font-medium">Verified Independent Merchants</div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">45,000+</div>
            <div className="text-xs text-slate-500 font-medium">Community Deals Redeemed</div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">18 Cities</div>
            <div className="text-xs text-slate-500 font-medium">Local Hive Networks Active</div>
          </div>
        </div>
      </section>

      {/* FEATURED DEALS */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Featured Neighborhood Deals</h2>
            <p className="text-sm text-slate-500">Cross-promotions active today — show support and save</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={onNavigateToDeal} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
            <img src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500" alt="Coffee" className="w-full h-40 object-cover" />
            <div className="p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-700">Linden Coffee Co.</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded">20% OFF</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Free Pastry with any Espresso Flight</h3>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">Spend $15 at Linden Coffee, get a coupon code for 20% off any loaf at Crust Artisan Bakery.</p>
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <FaClock className="text-[10px]" />
                <span>Expires in 3 days</span>
              </div>
            </div>
          </div>

          <div onClick={onNavigateToDeal} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
            <img src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500" alt="Pottery" className="w-full h-40 object-cover" />
            <div className="p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-700">Clay Studio Collective</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded">GOODS GIFT</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Clay Workshop Pass & Mug Deal</h3>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">Buy one introductory wheel class pass, get the second half off.</p>
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <FaClock className="text-[10px]" />
                <span>Expires March 28</span>
              </div>
            </div>
          </div>

          <div onClick={onNavigateToDeal} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
            <img src="https://images.unsplash.com/photo-1608248597260-84381ff24e2c?w=500" alt="Botanicals" className="w-full h-40 object-cover" />
            <div className="p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-700">Sage & Root Botanicals</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded">FREE GIFT</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Complimentary Herbal Hydrosol</h3>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">Spend $35 at Sage & Root and receive a free lavender hydrosol mist.</p>
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <FaClock className="text-[10px]" />
                <span>Expires April 2</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6 text-xs text-center">
        © 2026 VendorHive Collective. All rights reserved.
      </footer>
    </div>
  );
}