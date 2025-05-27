import React from 'react';
import CalculatorInput from 'ui-component/CalculatorInput';
import DavriyCalculator from './DavriyCalculator';

function Calculators({ act }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        margin: '0 10px'
      }}
    >
      <CalculatorInput sx={{ width: 150 }} label={'Kalkulyator 1'} />
      <CalculatorInput sx={{ width: 150, mt: 1 }} label={'Kalkulyator 2'} />
      <DavriyCalculator act={act} title={'Kalkulyator 3 (davriy)'} />
      <DavriyCalculator act={act} title={'Kalkulyator 4 (davriy)'} />
    </div>
  );
}

export default Calculators;
