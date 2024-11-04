import React, { useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import DialogForCreateAriza from './DialogForCreateAriza';
import useStore from './useStore';
import ToolsContainer from './ToolsContainer';
import DataTable from './DataTable';

function CourtProcesses() {
  // =================================|STATES|===============================================
  const { selectedRows } = useStore();
  const [showCreateArizaModal, setShowCreateArizaModal] = useState(false);

  const handleCloseModal = () => {
    setShowCreateArizaModal(false);
  };

  return (
    <MainCard contentSX={{ display: 'flex' }}>
      <DialogForCreateAriza showCreateArizaModal={showCreateArizaModal} handleCloseModal={handleCloseModal} />
      <ToolsContainer setShowCreateArizaModal={setShowCreateArizaModal} selectedRows={selectedRows} />
      <DataTable />
    </MainCard>
  );
}

export default CourtProcesses;
