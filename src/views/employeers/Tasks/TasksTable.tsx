import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { useTasksStore } from './useTasksStore';
import { t } from 'i18next';
import api from 'utils/api';
import { useServerDataGrid } from 'hooks/useServerDataGrid';

function TasksTable() {
  const columns: readonly GridColDef<any>[] = [
    {
      field: 'id',
      headerName: '№',
      width: 50,
      renderCell: (row) => row.row.index + 1
    },
    {
      field: 'accountNumber',
      headerName: t('tableHeaders.accountNumber'),
      flex: 1
    },
    {
      field: 'fullName',
      headerName: t('tableHeaders.fullName'),
      flex: 1
    },
    {
      field: 'mahallaId',
      headerName: t('tableHeaders.mfy'),
      flex: 1
    },
    {
      field: 'nazoratchiName',
      headerName: t('tableHeaders.inspector'),
      flex: 1
    },
    {
      field: 'status',
      headerName: t('tableHeaders.status'),
      flex: 1
    },
    {
      field: 'type',
      headerName: t('taskTypes.type'),
      flex: 1,
      renderCell: (row) => t(('taskTypes.' + row.row.type) as 'taskTypes.type')
    }
  ];
  const { fetchMahallas, fetchTasks, filters } = useTasksStore();
  const { dataGridProps, rows, setPaginationModel } = useServerDataGrid(fetchTasks, [], 100, filters);

  useEffect(() => {
    fetchMahallas();
  }, []);

  return (
    <DataGrid
      rows={rows}
      {...dataGridProps}
      columns={columns}
      onPaginationModelChange={setPaginationModel}
      disableColumnFilter
      disableColumnMenu
    />
  );
}

export default TasksTable;
