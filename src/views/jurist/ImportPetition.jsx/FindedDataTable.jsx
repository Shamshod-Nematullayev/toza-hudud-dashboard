import { FormControl, ListItem, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { List } from 'immutable';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

function FindedDataTable() {
  const [rows, setRows] = useState([]);
  const [licshetInput, setLicshetInput] = useState('');

  // Fetch data from API or any other source
  const fetchData = async () => {
    try {
      const { data } = await axios.get('/sudAkts/search-by-licshet', { params: { licshet: licshetInput } });
      if (data.rows.length < 1) {
        toast.info('No results found');
        return;
      }
      const rows = data.rows.map((row, i) => {
        return {
          id: i,
          ...row,
          warningDate: new Date(row.warningDate)
        };
      });
      setRows(rows);
    } catch (err) {
      toast.error("Couldn't fetch data");
      console.error(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <FormControl>
          <TextField
            fullWidth
            variant="outlined"
            name="licshet_input"
            placeholder="Search by licshet"
            value={licshetInput}
            onChange={(e) => setLicshetInput(e.target.value)}
          />
        </FormControl>
      </form>

      <DataGrid
        columns={[
          { field: 'id', headerName: 't/r', width: 10 },
          { field: 'licshet', headerName: 'Licshet', width: 120 },
          { field: 'fio', headerName: 'F. I. Sh.', width: 250 },
          { field: 'davo_summa', headerName: 'Davo Summasi', type: 'number', width: 80 },
          { field: 'warningDate', headerName: 'Ogohlantirilgan Sanasi', type: 'date', width: 100 }
          //   { field: 'actions', headerName: 'Harakatlar' }
        ]}
        disableColumnFilter
        disableColumnSorting
        hideFooter
        rows={rows}
        style={{ margin: '25px auto', height: '30vh' }}
      />
    </div>
  );
}

export default FindedDataTable;
