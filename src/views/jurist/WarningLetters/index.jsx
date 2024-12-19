import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import ToolBar from './ToolBar';
import DataTableWarnings from './DataTableWarnings';

function WarningLetters() {
  return (
    <MainCard>
      <ToolBar />
      <DataTableWarnings />
    </MainCard>
  );
}

export default WarningLetters;
