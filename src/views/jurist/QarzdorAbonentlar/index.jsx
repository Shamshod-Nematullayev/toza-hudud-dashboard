import { Grid } from '@mui/material';
import React, { useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import SideBar from './SideBar';
import DataTable from './DataTable';

function QarzdorAbonentlar() {
  const [filters, setFilters] = useState({
    balanceFrom: 50000,
    balanceTo: '',
    sudAkt: '',
    warning: ''
  });
  const [refreshState, setRefreshState] = useState(false);
  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={9}>
          <DataTable filters={filters} refreshState={refreshState} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SideBar filters={filters} setFilters={setFilters} setRefreshState={setRefreshState} />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default QarzdorAbonentlar;
