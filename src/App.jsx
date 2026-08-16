import React, { useState } from 'react';
import LandingPage from './LandingPage';
import ExplorePage from './ExplorePage';
import DealDetailsPage from './DealDetailsPage';

export default function App() {
  // বর্তমান পেজের স্টেট (ডিফল্টভাবে 'landing')
  const [currentPage, setCurrentPage] = useState('landing');

  return (
    <div>
      {/* ১. ল্যান্ডিং পেজ */}
      {currentPage === 'landing' && (
        <LandingPage 
          onNavigateToExplore={() => setCurrentPage('explore')} 
          onNavigateToDeal={() => setCurrentPage('deal')} 
        />
      )}

      {/* ২. এক্সপ্লোর ম্যাপ পেজ */}
      {currentPage === 'explore' && (
        <ExplorePage 
          onNavigateToHome={() => setCurrentPage('landing')} 
          onNavigateToDeal={() => setCurrentPage('deal')} 
          onSelectVendor={() => setCurrentPage('deal')}
        />
      )}

      {/* ৩. ডিল ডিটেইলস পেজ */}
      {currentPage === 'deal' && (
        <DealDetailsPage 
          onNavigateToHome={() => setCurrentPage('landing')} 
          onNavigateToExplore={() => setCurrentPage('explore')} 
        />
      )}
    </div>
  );
}