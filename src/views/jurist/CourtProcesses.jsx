import { Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import MainCard from 'ui-component/cards/MainCard';

function CourtProcesses() {
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'licshet', headerName: 'licshet', width: 120 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'warningDate', headerName: 'Date', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'actions', headerName: 'Actions', width: 100, renderCell: () => <div>Action 1</div> }
  ];
  const [rows, setRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });

  // handlers
  const fetchData = async () => {
    try {
      const { data } = await axios.get('/sudAkts/');
      data.rows.map((row, i) => ({
        id: i + 1,
        licshet: row.licshet,
        warningDate: row.warningDate,
        date: row.date,
        status: row.status
      }));
      setRows(data.rows);
    } catch (error) {
      toast.error('Xatolik kuzatildi');
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <MainCard contentSX={{ display: 'flex' }}>
      <DataGrid
        checkboxSelection
        rows={rows}
        columns={columns}
        onPaginationModelChange={(newPaginationModel) => {
          setPaginationModel(newPaginationModel);
        }}
        initialState={{ pagination: { paginationModel: { pageSize: paginationModel.pageSize } } }}
        sx={{ height: '70vh' }}
      />
      <div className="tools-container" style={{ margin: '0 25px' }}>
        <Button variant="outlined" color="secondary">
          Ariza chiqorish
        </Button>
      </div>
    </MainCard>
  );
}

export default CourtProcesses;
