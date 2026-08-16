import React from 'react';
import { 
  FaUserCheck, FaCalendarAlt, FaChevronDown, FaStore, 
  FaUtensils, FaFacebookF, FaInstagram, FaTwitter 
} from 'react-icons/fa';

export default function DealDetailsPage({ onNavigateToHome, onNavigateToExplore }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      
      {/* 1. NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div onClick={onNavigateToHome} className="flex items-center space-x-2 cursor-pointer">
          <div className="bg-emerald-700 text-white p-2 rounded-lg font-bold text-lg flex items-center justify-center w-8 h-8">
            V
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">Vendor<span className="text-emerald-700">Hive</span></span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <button onClick={onNavigateToHome} className="hover:text-emerald-700 transition">
            Home
          </button>
          
          {/* Explore Map বাটনে নেভিগেশন কলব্যাক নিশ্চিত করা হলো */}
          <button onClick={onNavigateToExplore} className="hover:text-emerald-700 transition">
            Explore Map
          </button>
          
          <button className="text-emerald-700 font-bold">
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

      {/* 2. BREADCRUMB */}
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-2 text-xs text-slate-400">
        <span onClick={onNavigateToHome} className="hover:underline cursor-pointer">All Deals</span>
        <span className="mx-2">&rsaquo;</span>
        <span>Food &amp; Drink</span>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-slate-600 font-medium">Linden Coffee Co.</span>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <main className="max-w-6xl mx-auto px-6 py-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: HERO IMAGE & DESCRIPTION */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000" 
              alt="Pastry and Coffee" 
              className="w-full h-[360px] object-cover"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-3">
              About this Cross-Promotion
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Purchase any coffee flight at Linden Coffee, and we'll immediately credit your VendorHive wallet with a 20% discount coupon for Crust Artisan Bakery. It's our way of helping you get local organic bread to match your premium home roasts.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: DEAL DETAILS CARD */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
                20% OFF CO-OP DEAL
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Active</span>
            </div>

            <h1 className="text-xl font-extrabold text-slate-900 mb-6 leading-snug">
              Free Pastry with any Espresso Flight
            </h1>

            <div className="mb-6">
              <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-3">
                PARTICIPATING MERCHANTS
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                    <FaStore />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Linden Coffee Co.</div>
                    <div className="text-[10px] text-slate-400">Initiating Merchant</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 text-xs font-bold">
                    <FaUtensils />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Crust Artisan Bakery</div>
                    <div className="text-[10px] text-slate-400">Redemption Partner</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-500 text-xs mb-6 pt-4 border-t border-slate-100">
              <FaCalendarAlt className="text-emerald-700 text-xs" />
              <span>Valid: Mar 10 - Apr 15, 2026</span>
            </div>

            <button className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 rounded-xl transition shadow-md text-sm">
              Save This Deal
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center cursor-pointer">
              <span className="font-bold text-xs text-slate-800">Terms &amp; Conditions</span>
              <FaChevronDown className="text-slate-400 text-xs" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-3 pt-3 border-t border-slate-100">
              Coupon codes can only be earned with digital receipt uploads or linked co-op cards. Limit 1 coupon per customer per week. Code expires 30 days after issuance.
            </p>
          </div>
        </div>

      </main>

      {/* 4. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 text-xs mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="bg-emerald-600 text-white p-1 rounded font-bold text-sm w-6 h-6 flex items-center justify-center">V</div>
              <span className="font-extrabold text-base text-white">Vendor<span className="text-emerald-500">Hive</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Connecting local creators, merchants, and neighborhood pioneers in a shared ecosystem that thrives together.
            </p>
          </div>

          <div>
            <div className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Explore</div>
            <ul className="space-y-2">
              <li><button onClick={onNavigateToHome} className="hover:text-white transition">Local Directory</button></li>
              <li><button className="hover:text-white transition">Active Deals</button></li>
              <li><button onClick={onNavigateToExplore} className="hover:text-white transition">Map Search</button></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">For Merchants</div>
            <ul className="space-y-2">
              <li><button className="hover:text-white transition">Join the Co-op</button></li>
              <li><button className="hover:text-white transition">Merchant Portal</button></li>
              <li><button className="hover:text-white transition">Co-promotion Tool</button></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Collective</div>
            <ul className="space-y-2">
              <li><button className="hover:text-white transition">Our Story</button></li>
              <li><button className="hover:text-white transition">Co-op Principles</button></li>
              <li><button className="hover:text-white transition">Impact Report</button></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-slate-500">
          <div>© 2026 VendorHive Collective. All rights reserved.</div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button className="hover:text-white"><FaFacebookF /></button>
            <button className="hover:text-white"><FaInstagram /></button>
            <button className="hover:text-white"><FaTwitter /></button>
          </div>
        </div>
      </footer>

    </div>
  );
}