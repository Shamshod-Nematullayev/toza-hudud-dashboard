import React, { useEffect, useState } from 'react';
import { DataGrid, GridToolbarContainer, useGridApiRef } from '@mui/x-data-grid';
import { FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip } from '@mui/material';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';

import useOdamSoniXatlovStore from './odamSoniXatlovStore'; // Store importi
import api from 'utils/api';
import XatlovActionsToolbar from './XatlovActionsToolbar';
import { lotinga } from 'helpers/lotinKiril';

function XatlovTable() {
  const apiRef = useGridApiRef();
  const [mahallaOptions, setMahallaOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState(['yangi', 'xujjat yaratilgan']);

  // Store'dan kerakli qiymatlar va actionlarni olish
  const { rows, total, pagination, ui, fetchRows, updatePagination } = useOdamSoniXatlovStore();

  // 1. Ma'lumotlarni yuklash (Fetch)
  useEffect(() => {
    fetchRows();
  }, [pagination.page, pagination.limit, pagination.filter, ui.refreshToggle]);

  // 2. Mahalla variantlarini yuklash
  useEffect(() => {
    api.get('/yashovchi-soni-xatlov/mahallas').then(({ data }) => {
      const options = data.data.map((mfy: any) => ({
        mahallaId: mfy.mahallaId,
        mahallaName: lotinga(mfy.mahallaName)
      }));
      setMahallaOptions(options);
    });
  }, []);

  // Filter o'zgarganda store'ni yangilash
  const handleChangeFilterModel = (newModel: any) => {
    if (!newModel.items[0] || !newModel.items[0].value) {
      updatePagination({ filter: {}, page: 1 });
      return;
    }

    const { field, value } = newModel.items[0];
    let filterQuery = {};

    switch (field) {
      case 'status':
        filterQuery = {
          document_id: value === 'yangi' ? { $exists: false } : { $exists: true }
        };
        break;
      case 'mahallaId':
        filterQuery = { mahallaId: value };
        break;
      default:
        filterQuery = {};
    }

    updatePagination({ filter: filterQuery, page: 1 });
  };

  const columns = [
    { field: 'id', headerName: '№', width: 60, filterable: false },
    { field: 'accountNumber', headerName: 'Hisob raqam', width: 130, filterable: false },
    { field: 'fio', headerName: 'F.I.O', width: 200, filterable: false },
    { field: 'currentInhabitantCount', headerName: 'Joriy soni', width: 120, filterable: false },
    { field: 'YASHOVCHILAR', headerName: 'Aniqlandi', width: 100, filterable: false },
    {
      field: 'mahallaId',
      headerName: 'Manzil',
      width: 180,
      renderCell: (params: any) => params.value?.mahallaName || '',
      filterOperators: [
        {
          label: 'Mahalla',
          value: 'mahallaFilter',
          InputComponent: ({ item, applyValue }: any) => (
            <FormControl variant="standard" fullWidth>
              <InputLabel>Mahalla</InputLabel>
              <Select value={item.value || ''} onChange={(e) => applyValue({ ...item, value: e.target.value })}>
                <MenuItem value="">
                  <em>Barchasi</em>
                </MenuItem>
                {mahallaOptions.map((opt: any) => (
                  <MenuItem key={opt.mahallaId} value={opt.mahallaId}>
                    {opt.mahallaName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ),
          getApplyFilterFn: (filterItem: any) => {
            if (!filterItem.value) return null;
            return (params: any) => params.mahallaId === filterItem.value;
          }
        }
      ]
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      filterOperators: [
        {
          label: 'Saralash',
          value: 'statusFilter',
          InputComponent: ({ item, applyValue }: any) => (
            <FormControl variant="standard" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={item.value || ''} onChange={(e) => applyValue({ ...item, value: e.target.value })}>
                <MenuItem value="">
                  <em>Barchasi</em>
                </MenuItem>
                {statusOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ),
          getApplyFilterFn: (filterItem: any) => {
            if (!filterItem.value) return null;
            return (params: any) => params === filterItem.value;
          }
        }
      ]
    }
  ];

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={total}
        loading={ui.loading}
        paginationMode="server"
        filterMode="server"
        sortingMode="server"
        paginationModel={{
          page: pagination.page - 1,
          pageSize: pagination.limit
        }}
        onPaginationModelChange={(model) => {
          updatePagination({
            page: model.page + 1,
            limit: model.pageSize
          });
        }}
        onFilterModelChange={handleChangeFilterModel}
        apiRef={apiRef}
        slots={{
          toolbar: () => (
            <GridToolbarContainer>
              <XatlovActionsToolbar />
              <Tooltip title="Filtrlash paneli">
                <IconButton onClick={() => apiRef.current.showFilterPanel()} color="primary">
                  <FilterListOutlinedIcon />
                </IconButton>
              </Tooltip>
            </GridToolbarContainer>
          )
        }}
        sx={{
          '& .MuiDataGrid-filterFormOperatorInput': { display: 'none' },
          border: 'none',
          backgroundColor: 'background.paper'
        }}
        disableColumnMenu
        disableColumnSorting
      />
    </div>
  );
}

export default XatlovTable;
