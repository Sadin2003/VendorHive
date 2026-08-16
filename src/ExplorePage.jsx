import React, { useState } from 'react';
import { 
  FaSearch, FaMapMarkerAlt, FaStar, FaUserCheck, 
  FaFacebookF, FaInstagram, FaTwitter 
} from 'react-icons/fa';

export default function ExplorePage({ onNavigateToHome, onNavigateToDeal, onSelectVendor }) {
  const [openNow, setOpenNow] = useState(true);
  const [hasDeals, setHasDeals] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div onClick={onNavigateToHome} className="flex items-center space-x-2 cursor-pointer">
          <div className="bg-emerald-700 text-white p-2 rounded-lg font-bold text-lg flex items-center justify-center w-8 h-8">V</div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">Vendor<span className="text-emerald-700">Hive</span></span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <button onClick={onNavigateToHome} className="hover:text-emerald-700 transition">Home</button>
          
          <button className="text-emerald-700 font-bold border-b-2 border-emerald-700 pb-1">
            Explore Map
          </button>
          
          {/* Co-op Deals নেভিগেশন ফিক্স করা হয়েছে */}
          <button onClick={onNavigateToDeal} className="hover:text-emerald-700 transition">
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

      {/* SEARCH BAR TOP */}
      <div className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-3 top-3.5 text-slate-400 text-sm" />
            <input 
              type="text" 
              placeholder="Search local shops, pottery, organic..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-emerald-600"
            />
          </div>
          <div className="relative w-full md:w-64">
            <FaMapMarkerAlt className="absolute left-3 top-3.5 text-emerald-700 text-sm" />
            <input 
              type="text" 
              defaultValue="Portland, OR" 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm font-semibold text-slate-700 outline-none"
            />
          </div>
          <select className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none">
            <option>Sort: Nearest</option>
            <option>Sort: Rating</option>
          </select>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
        {/* FILTERS SIDEBAR */}
        <div className="md:col-span-3 bg-white border-r border-slate-200 p-6 space-y-6">
          <h3 className="font-extrabold text-slate-900 text-sm">Filters</h3>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Distance: Within 5 miles</label>
            <input type="range" className="w-full accent-emerald-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-3">Categories</label>
            <div className="space-y-2 text-xs font-medium text-slate-600">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-emerald-700 rounded" />
                <span>Food &amp; Drink</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-emerald-700 rounded" />
                <span>Wellness</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="accent-emerald-700 rounded" />
                <span>Retail &amp; Goods</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Open Now</span>
              <button onClick={() => setOpenNow(!openNow)} className={`w-10 h-5 flex items-center rounded-full p-1 transition ${openNow ? 'bg-emerald-700 justify-end' : 'bg-slate-300 justify-start'}`}>
                <div className="w-3.5 h-3.5 bg-white rounded-full shadow-md"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Has Active Deals</span>
              <button onClick={() => setHasDeals(!hasDeals)} className={`w-10 h-5 flex items-center rounded-full p-1 transition ${hasDeals ? 'bg-emerald-700 justify-end' : 'bg-slate-300 justify-start'}`}>
                <div className="w-3.5 h-3.5 bg-white rounded-full shadow-md"></div>
              </button>
            </div>
          </div>
        </div>

        {/* VENDOR CARDS LIST */}
        <div className="md:col-span-4 p-4 bg-slate-50 space-y-4 overflow-y-auto">
          <div className="text-xs text-slate-500 font-medium">14 vendors found near you</div>

          {/* VENDOR 1 */}
          <div onClick={onNavigateToDeal || onSelectVendor} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition cursor-pointer flex gap-3">
            <img src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200" alt="Linden Coffee" className="w-20 h-20 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">FOOD &amp; DRINK</span>
                <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">2 DEALS</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 truncate">Linden Coffee Co.</h4>
              <div className="flex items-center space-x-1 text-xs text-slate-500 my-1">
                <FaStar className="text-amber-400 text-[10px]" />
                <span className="font-bold text-slate-800 text-[11px]">4.9</span>
                <span className="text-[10px]">&bull; 0.4 miles away</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Recommends Crust Bakery &amp; Clay Collective</p>
            </div>
          </div>

          {/* VENDOR 2 */}
          <div onClick={onNavigateToDeal || onSelectVendor} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition cursor-pointer flex gap-3">
            <img src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200" alt="Clay Studio" className="w-20 h-20 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-teal-700 uppercase">WELLNESS &amp; HOME</span>
                <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">1 DEAL</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 truncate">Clay Studio Collective</h4>
              <div className="flex items-center space-x-1 text-xs text-slate-500 my-1">
                <FaStar className="text-amber-400 text-[10px]" />
                <span className="font-bold text-slate-800 text-[11px]">4.8</span>
                <span className="text-[10px]">&bull; 0.8 miles away</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Co-promoting with Linden Coffee</p>
            </div>
          </div>
        </div>

        {/* MAP VIEW PANEL */}
        <div className="md:col-span-5 bg-emerald-50/40 relative min-h-[400px] border-l border-slate-200 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#047857_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Map Pins - ক্লিক করলে ডিটেইলস পেজে যাবে */}
          <div onClick={onNavigateToDeal} className="absolute top-1/3 left-1/3 bg-emerald-800 text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-lg flex items-center gap-1 cursor-pointer hover:scale-105 transition">
            Linden Coffee
          </div>
          <div onClick={onNavigateToDeal} className="absolute top-1/2 right-1/4 bg-amber-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-lg flex items-center gap-1 cursor-pointer hover:scale-105 transition">
            Clay BOGO Deal
          </div>
          <div onClick={onNavigateToDeal} className="absolute bottom-1/3 left-1/2 bg-emerald-800 text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-lg flex items-center gap-1 cursor-pointer hover:scale-105 transition">
            Sage Botanicals
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="bg-emerald-600 text-white p-1 rounded font-bold text-sm w-6 h-6 flex items-center justify-center">V</div>
              <span className="font-extrabold text-base text-white">Vendor<span className="text-emerald-500">Hive</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed">Connecting local creators, merchants, and neighborhood pioneers in a shared ecosystem that thrives together.</p>
          </div>
          <div>
            <div className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Explore</div>
            <ul className="space-y-2">
              <li><button onClick={onNavigateToHome} className="hover:text-white transition">Local Directory</button></li>
              <li><button onClick={onNavigateToDeal} className="hover:text-white transition">Active Deals</button></li>
              <li><button className="hover:text-white transition">Map Search</button></li>
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
        <div className="max-w-7xl mx-auto border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-slate-500">
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