import { useState, useEffect } from 'react';

const useScrollPastThreshold = (threshold: number = 100): boolean => {
  const [hasScrolledPastThreshold, setHasScrolledPastThreshold] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setHasScrolledPastThreshold(true);
      } else {
        setHasScrolledPastThreshold(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return hasScrolledPastThreshold;
};

export default useScrollPastThreshold;
