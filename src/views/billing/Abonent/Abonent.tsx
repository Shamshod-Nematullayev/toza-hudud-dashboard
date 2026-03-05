import React from 'react';
import { useParams } from 'react-router-dom';
import AbonentTools from './AbonentTools';
import { useAbonentLogic } from './useAbonentLogic';

function Abonent() {
  return (
    <div>
      <AbonentTools />
      Abonents
    </div>
  );
}

export default Abonent;
