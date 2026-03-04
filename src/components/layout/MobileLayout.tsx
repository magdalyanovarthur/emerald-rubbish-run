import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

const MobileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-4 pb-24 animate-fade-in">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default MobileLayout;
