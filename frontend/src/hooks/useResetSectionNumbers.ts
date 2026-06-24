import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSectionNumber } from '../context/SectionNumberContext';

export const useResetSectionNumbers = () => {
  const location = useLocation();
  const { reset } = useSectionNumber();

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
};
