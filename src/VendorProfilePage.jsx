import React from 'react';
import { 
  FaStar, FaCheckCircle, FaUserCheck, FaPhone, 
  FaGlobe, FaMapMarkerAlt, FaClock, FaFacebookF, FaInstagram, FaTwitter 
} from 'react-icons/fa';

export default function VendorProfilePage({ onNavigateToHome, onNavigateToExplore }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div onClick={onNavigateToHome} className="flex items-center space-x-2 cursor-pointer">
          <div className="bg-emerald-700 text-white p-2 rounded-lg font-bold text-lg flex items-center justify-center w-8 h-8">V</div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">Vendor<span className="text-emerald-700">Hive</span></span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <button onClick={onNavigateToHome} className="hover:text-emerald-700 transition">Home</button>
          <button onClick={onNavigateToExplore} className="hover:text-emerald-700 transition">Explore Map</button>
          <a href="#" className="hover:text-emerald-700 transition">Co-op Deals</a>
          <a href="#" className="hover:text-emerald-700 transition">About Us</a>
        </div>

        <div className="flex items-center space-x-4 text-sm font-semibold">
          <a href="#" className="text-slate-700 hover:text-emerald-700 hidden sm:block">Join as Merchant</a>
          <button className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 transition flex items-center space-x-2">
            <FaUserCheck className="text-xs" />
            <span>My Hive</span>
          </button>
        </div>
      </nav>

      {/* HERO BANNER SECTION */}
      <div className="relative bg-slate-900 text-white">
        <img 
          src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600" 
          alt="Vendor Banner" 
          className="w-full h-64 object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        
        <div className="max-w-6xl mx-auto px-6 relative -mt-20 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-end space-x-4">
            <img 
              src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200" 
              alt="Logo" 
              className="w-24 h-24 rounded-full border-4 border-white object-cover bg-white shadow-lg"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">Linden Coffee Co.</h1>
                <FaCheckCircle className="text-emerald-400 text-base" />
              </div>
              <div className="flex items-center space-x-3 text-xs mt-1">
                <span className="text-slate-300">Food &amp; Drink</span>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <FaStar className="text-amber-400" /> 4.9 (184 reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-300 font-medium">1,240 Supporters</span>
            <button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl transition text-xs shadow-md">
              Follow Hive
            </button>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 flex space-x-8 text-xs font-bold text-slate-500">
          <button className="py-3 text-emerald-700 border-b-2 border-emerald-700">About</button>
          <button className="py-3 hover:text-slate-800">Active Deals (2)</button>
          <button className="py-3 hover:text-slate-800">Reviews (184)</button>
        </div>
      </div>

      {/* MAIN CONTENT SECTION */}
      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-base mb-3">About the Merchant</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Linden Coffee Co. has been roasting heirloom, direct-trade single origin beans in the heart of Portland since 2019. We believe in sustainable supply chains and neighborhood integration. Our co-op partners include Crust Artisan Bakery and Clay Studio Collective.
            </p>
            
            <h4 className="font-bold text-slate-900 text-xs mb-3">Photos</h4>
            <div className="grid grid-cols-3 gap-3">
              <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400" alt="Gallery 1" className="rounded-xl h-24 w-full object-cover" />
              <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400" alt="Gallery 2" className="rounded-xl h-24 w-full object-cover" />
              <img src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400" alt="Gallery 3" className="rounded-xl h-24 w-full object-cover" />
            </div>
          </div>

          {/* Active Co-op Deals */}
          <div>
            <h3 className="font-extrabold text-slate-900 text-base mb-4">Active Co-op Deals</h3>
            
            <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-amber-100 text-amber-800 p-3 rounded-xl font-black text-center min-w-[60px]">
                  <div className="text-sm">20%</div>
                  <div className="text-[9px] uppercase">OFF</div>
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">Free Pastry with any Espresso Flight</h4>
                  <p className="text-slate-400 text-[10px] mt-0.5">Get a free local pastry. Spent at Linden, valid for redemption at Crust Bakery.</p>
                </div>
              </div>
              <button className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition">
                Save Deal
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STORE DETAILS */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm mb-2">Store Details</h3>

            <div className="flex items-center space-x-3 text-xs text-slate-600">
              <FaPhone className="text-emerald-700" />
              <span>(503) 555-0142</span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-emerald-700 font-medium">
              <FaGlobe />
              <a href="#" className="hover:underline">lindencoffeepdx.com</a>
            </div>

            <div className="flex items-start space-x-3 text-xs text-slate-600">
              <FaMapMarkerAlt className="text-emerald-700 mt-0.5" />
              <div>
                <div>742 SE Hawthorne Blvd</div>
                <div className="text-slate-400 text-[10px]">Portland, OR 97214</div>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs text-slate-600">
              <FaClock className="text-emerald-700 mt-0.5" />
              <div>
                <div>Mon - Fri: 7:00 AM - 4:00 PM</div>
                <div>Sat - Sun: 8:00 AM - 6:00 PM</div>
              </div>
            </div>

            {/* MAP IMAGE */}
            <div className="rounded-xl overflow-hidden border border-slate-100 pt-2">
              <img 
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400" 
                alt="Store Location Map" 
                className="w-full h-32 object-cover" 
              />
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 text-xs mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
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
              <li><a href="#" className="hover:text-white transition">Local Directory</a></li>
              <li><a href="#" className="hover:text-white transition">Active Deals</a></li>
              <li><a href="#" className="hover:text-white transition">Map Search</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">For Merchants</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Join the Co-op</a></li>
              <li><a href="#" className="hover:text-white transition">Merchant Portal</a></li>
              <li><a href="#" className="hover:text-white transition">Co-promotion Tool</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Collective</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition">Co-op Principles</a></li>
              <li><a href="#" className="hover:text-white transition">Impact Report</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-slate-500">
          <div>© 2026 VendorHive Collective. All rights reserved.</div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white"><FaFacebookF /></a>
            <a href="#" className="hover:text-white"><FaInstagram /></a>
            <a href="#" className="hover:text-white"><FaTwitter /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}