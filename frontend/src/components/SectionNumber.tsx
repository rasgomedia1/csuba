import React from 'react';
import { useSectionNumber } from '../context/SectionNumberContext';

const SHOW_SECTION_NUMBERS = true; // Cambiar a false para ocultar

interface SectionNumberProps {
  className?: string;
}

export const SectionNumber: React.FC<SectionNumberProps> = ({ className = '' }) => {
  const { nextNumber } = useSectionNumber();

  if (!SHOW_SECTION_NUMBERS) return null;

  const number = nextNumber();

  return (
    <div
      className={`absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${className}`}
      style={{ zIndex: 10 }}
    >
      {number}
    </div>
  );
};
