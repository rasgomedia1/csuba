import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSectionNumber } from '../context/SectionNumberContext';

export const useResetSectionNumbers = () => {
  const location = useLocation();
  const { reset } = useSectionNumber();

  useEffect(() => {
    reset();
  }, [location.pathname, reset]);
};
