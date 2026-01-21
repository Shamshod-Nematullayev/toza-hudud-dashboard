import { useAnimationFrame } from 'framer-motion';
import React, { useEffect } from 'react';
import { useVisitGrafikStore } from './useVisitGrafikStore';

function VisitGrafik() {
  const { fetchVisitGrafik } = useVisitGrafikStore();
  useEffect(() => {
    fetchVisitGrafik();
  }, []);
  return <div>VisitGrafik</div>;
}

export default VisitGrafik;
