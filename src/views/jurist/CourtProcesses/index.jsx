import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import MainCard from 'ui-component/cards/MainCard';
import SelectInputComponent from './SelectInputComponent';
const formatDate = (data) => {
  const date = new Date(data);
  return ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear();
};
function CourtProcesses() {
  const columns = [
    { field: 'id', headerName: 'ID', width: 70, filterable: false },
    { field: 'licshet', headerName: 'licshet', width: 120, filterable: false },
    { field: 'davo_summa', headerName: 'Davo summasi', width: 100, align: 'right', filterable: false },
    {
      field: 'warningDate',
      headerName: 'Ogohlantirilgan sanasi',
      width: 150,
      align: 'right',
      renderCell: ({ row }) => formatDate(row.warningDate),
      filterable: false
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      filterOperators: [
        {
          label: 'Tanlash',
          value: 'is',
          getApplyFilterFn: (filterItem) => {
            if (!filterItem.value) {
              return null;
            }
            return ({ value }) => value === filterItem.value;
          },
          InputComponent: (props) => <SelectInputComponent {...props} valueOptions={['yangi', 'jarayonda', 'tugallangan']} />
        }
      ]
    },
    { field: 'bildirish_xati', headerName: 'Bildirgi', width: 150, filterable: false },
    { field: 'actions', headerName: 'Actions', width: 100, renderCell: () => <div>Action 1</div>, filterable: false }
  ];

  // =================================|STATES|===============================================
  const [rows, setRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });
  const [filterModel, setFilterModel] = useState({});
  const [totalRows, setTotalRows] = useState(0);

  // ================================|HANDLE FUNCTIONS|==================================================
  const fetchData = async () => {
    try {
      const { data } = await axios.get('/sudAkts/', { params: paginationModel });
      const rows = data.rows.map((row, i) => ({
        id: i + 1,
        licshet: row.licshet,
        warningDate: row.warningDate,
        status: row.status,
        davo_summa: row.davo_summa
      }));
      setRows(rows);
      setTotalRows(data.total);
    } catch (error) {
      toast.error('Xatolik kuzatildi');
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [paginationModel]);
  return (
    <MainCard contentSX={{ display: 'flex' }}>
      <DataGrid
        checkboxSelection
        rows={rows}
        pageSize={paginationModel.pageSize}
        rowCount={totalRows}
        columns={columns}
        onPaginationModelChange={(newPaginationModel) => {
          setPaginationModel(newPaginationModel);
        }}
        onFilterModelChange={(model) => {
          setFilterModel(model.items[0]);
        }}
        initialState={{ pagination: { paginationModel: { pageSize: paginationModel.pageSize } } }}
        sortingMode="server"
        paginationMode="server"
        filterMode="server"
        sx={{
          height: '70vh',
          '& .MuiDataGrid-footerContainer': {
            flexShrink: 0 // Prevent shrinking of pagination area
          }
        }}
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
