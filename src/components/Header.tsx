import React from 'react';
import { Scroll } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="mb-10 text-center">
      <div className="flex justify-center mb-5">
        <div className="p-4 gradient-teal rounded-2xl shadow-lifted">
          <Scroll className="text-primary-foreground w-8 h-8" />
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
        Legacy AI
      </h1>
      <p className="text-muted-foreground mt-3 text-lg font-light max-w-md mx-auto text-balance">
        Preserve your handwritten notes and documents by converting them to digital text instantly.
      </p>
    </header>
  );
};

export default Header;
