import { Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import Toolbar from './Toolbar';
import DataTable from './DataTable';
import api from 'utils/api';

function XatlovDalolatnomalar() {
  const [rows, setRows] = useState([]);
  const [paging, setPaging] = useState({
    page: 0,
    pageSize: 15
  });
  const [rowsMeta, setRowsMeta] = useState({ rowCount: 0 });
  const [filters, setFilters] = useState({});
  useEffect(() => {
    api
      .get('/yashovchi-soni-xatlov/get-dalolatnomalar', {
        params: {
          ...paging,
          ...filters
        }
      })
      .then(({ data }) => {
        setRows(data.rows.map((row, i) => ({ ...row, id: i + 1, date: new Date(row.date) })));
        setRowsMeta(data.meta);
      });
  }, [paging]);
  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Toolbar />
        </Grid>
        <Grid item xs={12}>
          <DataTable rows={rows} paging={paging} setPaging={setPaging} rowsMeta={rowsMeta} />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default XatlovDalolatnomalar;
