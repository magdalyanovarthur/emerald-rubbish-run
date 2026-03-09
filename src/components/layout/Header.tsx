import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import logo from '@/assets/logo.png';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-2">
        <img src={logo} alt="ЧистоВынос" className="w-9 h-9" />
        <div>
          <h1 className="text-sm font-bold leading-tight text-foreground">ЧистоВынос</h1>
          <p className="text-[10px] text-muted-foreground leading-tight">Самара</p>
        </div>
      </div>
      <button
        onClick={toggleTheme}
        className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center transition-colors hover:bg-accent"
      >
        {theme === 'light' ? <Moon className="w-4 h-4 text-foreground" /> : <Sun className="w-4 h-4 text-foreground" />}
      </button>
    </header>
  );
};

export default Header;
