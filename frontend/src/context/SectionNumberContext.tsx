import React, { createContext, useContext, useState } from 'react';

interface SectionNumberContextType {
  nextNumber: () => number;
  reset: () => void;
}

const SectionNumberContext = createContext<SectionNumberContextType | undefined>(undefined);

export const SectionNumberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [counter, setCounter] = useState(1);

  const nextNumber = () => {
    const current = counter;
    setCounter(counter + 1);
    return current;
  };

  const reset = () => {
    setCounter(1);
  };

  return (
    <SectionNumberContext.Provider value={{ nextNumber, reset }}>
      {children}
    </SectionNumberContext.Provider>
  );
};

export const useSectionNumber = () => {
  const context = useContext(SectionNumberContext);
  if (!context) {
    throw new Error('useSectionNumber must be used within SectionNumberProvider');
  }
  return context;
};
