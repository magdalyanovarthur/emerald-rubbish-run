import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';
import BottomNav from './BottomNav';
import PageTransition from '@/components/PageTransition';

const MobileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-4 pb-24 overflow-hidden">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              {children}
            </PageTransition>
          </AnimatePresence>
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default MobileLayout;
