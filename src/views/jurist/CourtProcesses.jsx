import { DataGrid } from '@mui/x-data-grid';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import MainCard from 'ui-component/cards/MainCard';

function CourtProcesses() {
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'licshet', headerName: 'licshet', width: 120 },
    { field: 'davo_summa', headerName: 'Davo summasi', width: 100 },
    { field: 'warningDate', headerName: 'Ogohlantirilgan sanasi', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'bildirish_xati', headerName: '', width: 150 },
    { field: 'actions', headerName: 'Actions', width: 100, renderCell: () => <div>Action 1</div> }
  ];
  const [rows, setRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });

  // handlers
  const fetchData = async () => {
    try {
      const { data } = await axios.get('/sudAkts/');
      setRows(data.rows);
    } catch (error) {
      toast.error('Xatolik kuzatildi');
      console.error('Error fetching data:', error);
    }
  };
  return (
    <MainCard>
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
    </MainCard>
  );
}

export default CourtProcesses;
