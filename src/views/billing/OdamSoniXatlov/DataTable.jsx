import { DataGrid, GridToolbarContainer, useGridApiRef, GridToolbarFilterButton } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import odamSoniXatlovStore from './odamSoniXatlovStore';
import api from 'utils/api';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import ToolBar from './ToolBar';
import { lotinga } from 'helpers/lotinKiril';

function DataTable() {
  const {
    rows,
    setRows,
    totalPages,
    total,
    setTotal,
    setTotalPages,
    limit,
    setLimit,
    pageNum,
    setPageNum,
    sort,
    setSort,
    filter,
    setFilter,
    refreshTrigger
  } = odamSoniXatlovStore();
  const [statusOptions, setStatusOptions] = useState([]);
  const [mahallaOptions, setMallaOptions] = useState([]);
  const apiRef = useGridApiRef();

  useEffect(() => {
    api
      .get(`/yashovchi-soni-xatlov`, {
        params: {
          page: pageNum,
          limit,
          ...filter
        }
      })
      .then(({ data }) => {
        setRows(
          data.data.map((row, i) => {
            return {
              id: i + 1,
              _id: row._id,
              abonentId: row.abonentId,
              accountNumber: row.KOD,
              fio: row.fio,
              currentInhabitantCount: row.currentInhabitantCount,
              YASHOVCHILAR: row.YASHOVCHILAR,
              mahallaId: {
                mahallaId: row.mahallaId,
                mahallaName: row.mahallaName
              },
              status: !row.document_id ? 'yangi' : 'xujjat yaratilgan'
            };
          })
        ); // hali buni ustida ishlash kerak to'g'ridan to'g'ri qabul qilmaydi
        setTotalPages(data.meta.totalPages);
        setTotal(data.meta.total);
      });
  }, [limit, pageNum, sort, refreshTrigger, filter]);
  useEffect(() => {
    const uniqueStatuses = [];
    rows.forEach((row) => {
      if (!uniqueStatuses.includes(row.status)) {
        uniqueStatuses.push(row.status);
      }
    });
    setStatusOptions(uniqueStatuses);

    api.get('/yashovchi-soni-xatlov/mahallas').then(({ data }) => {
      setMallaOptions(
        data.data
          .map((mfy) => ({ mahallaId: mfy.mahallaId, mahallaName: lotinga(mfy.mahallaName) }))
          .sort((a, b) => a.mahallaName.localeCompare(b.mahallaName))
      );
    });
  }, [rows]);

  const handleChangeFilterModel = (newModel) => {
    console.log(newModel);
    return;
    if (!newModel.items[0]) {
      setFilter({});
      return;
    }
    switch (newModel.items[0].field) {
      case 'status':
        if (newModel.items[0].value === 'yangi') {
          setFilter({ document_id: { $exists: false } });
        } else if (newModel.items[0].value === 'xujjat yaratilgan') {
          setFilter({ document_id: { $exists: true } });
        }
        break;
      case 'mahallaId':
        setFilter({ mahallaId: newModel.items[0].value });
        break;
    }
  };
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <DataGrid
        columns={[
          {
            field: 'id',
            headerName: '№',
            width: 50,
            filterable: false
          },
          {
            field: 'accountNumber',
            headerName: 'Hisob raqam',
            width: 120,
            sortable: false
          },
          {
            field: 'fio',
            headerName: 'FIO',
            width: 150,
            filterable: false
          },
          {
            field: 'currentInhabitantCount',
            headerName: 'Joriy yashovchilar soni',
            width: 100,
            filterable: false
          },
          {
            field: 'YASHOVCHILAR',
            headerName: 'Aniqlandi',
            width: 100,
            filterable: false
          },
          {
            field: 'mahallaId',
            headerName: 'Manzil',
            width: 100,
            renderCell: (row) => row.value.mahallaName,
            filterOperators: [
              {
                label: 'Mahalla',
                value: 'mahallaFilter',
                InputComponent: ({ item, applyValue }) => (
                  <FormControl variant="standard" fullWidth>
                    <InputLabel variant="standard" htmlFor="mahallaFilter">
                      Mahalla
                    </InputLabel>
                    <Select
                      value={item.value || ''}
                      onChange={(e) => applyValue({ ...item, value: e.target.value })}
                      inputProps={{
                        id: 'mahallaFilter',
                        name: 'mahallaFilter'
                      }}
                    >
                      <MenuItem value="">
                        <em>Select</em>
                      </MenuItem>
                      {mahallaOptions.map((option) => (
                        <MenuItem key={option.mahallaId} value={option.mahallaId}>
                          {option.mahallaName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ),
                getApplyFilterFn: (filterItem) => {
                  if (!filterItem.value) return null;
                  return (params) => params.mahallaId === filterItem.value;
                }
              }
            ]
          },
          {
            field: 'status',
            headerName: 'Status',
            width: 100,
            sortable: false,
            filterable: false,
            label: '',
            filterOperators: [
              {
                label: 'barobar',
                value: 'statusFilter',
                InputComponent: ({ item, applyValue }) => (
                  <FormControl variant="standard" fullWidth>
                    <InputLabel htmlFor="status">Status</InputLabel>
                    <Select
                      value={item.value || ''}
                      onChange={(e) => applyValue({ ...item, value: e.target.value })}
                      inputProps={{
                        id: 'status',
                        name: 'status'
                      }}
                    >
                      <MenuItem value="">
                        <em>Select</em>
                      </MenuItem>
                      {statusOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ),
                getApplyFilterFn: (filterItem) => {
                  if (!filterItem.value) return null;
                  return (params) => params === filterItem.value;
                }
              }
            ]
          }
        ]}
        rows={rows}
        rowCount={total}
        initialState={{
          pagination: {
            paginationModel: { page: pageNum - 1, pageSize: limit }
          }
        }}
        sortingMode="server"
        filterMode="server"
        paginationMode="server"
        onPaginationModelChange={(model) => {
          setPageNum(model.page + 1);
          setLimit(model.pageSize);
        }}
        disableColumnMenu
        disableColumnSorting
        onFilterModelChange={handleChangeFilterModel}
        slots={{
          toolbar: () => (
            <GridToolbarContainer>
              <ToolBar />
              <GridToolbarFilterButton />
            </GridToolbarContainer>
          )
        }}
        sx={{
          height: '80vh',
          width: '100%'
        }}
      />
    </div>
  );
}

export default DataTable;
