import React from 'react';

const SHOW_SECTION_NUMBERS = true; // Cambiar a false para ocultar

interface SectionNumberProps {
  number: number;
  className?: string;
}

export const SectionNumber: React.FC<SectionNumberProps> = ({ number, className = '' }) => {
  if (!SHOW_SECTION_NUMBERS) return null;

  return (
    <div
      className={`absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${className}`}
      style={{ zIndex: 10 }}
    >
      {number}
    </div>
  );
};
