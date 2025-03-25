import React, { useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import DialogForCreateAriza from './DialogForCreateAriza';
import useStore from './useStore';
import ToolsContainer from './ToolsContainer';
import DataTable from './DataTable';
import { Grid } from '@mui/material';
import SideBar from './SideBar';
import DialogMalumotnoma from './DialogMalumotnoma';

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
      <DialogMalumotnoma open={false} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ToolsContainer setShowCreateArizaModal={setShowCreateArizaModal} selectedRows={selectedRows} />
        </Grid>
        <Grid item xs={12} sm={9}>
          <DataTable />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SideBar />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default CourtProcesses;
