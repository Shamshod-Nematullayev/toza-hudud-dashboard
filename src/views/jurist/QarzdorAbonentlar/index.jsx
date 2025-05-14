import { Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import SideBar from './SideBar';
import DataTable from './DataTable';
import api from 'utils/api';

function QarzdorAbonentlar() {
  const [filters, setFilters] = useState({
    balanceFrom: 50000,
    balanceTo: '',
    sudAkt: '',
    warning: '',
    mahalla: ''
  });
  const [refreshState, setRefreshState] = useState(false);
  const [lastUpdateDate, setLastUpdateDate] = useState(null);
  useEffect(() => {
    api.get('/statistics/lastUpdateDateAbonentsSaldo').then((res) => {
      setLastUpdateDate(new Date(res.data.lastUpdateDate));
    });
  }, []);
  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={9}>
          <DataTable filters={filters} refreshState={refreshState} lastUpdateDate={lastUpdateDate} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SideBar filters={filters} setFilters={setFilters} setRefreshState={setRefreshState} />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default QarzdorAbonentlar;
