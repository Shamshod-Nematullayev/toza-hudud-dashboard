import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { useTasksStore } from './useTasksStore';
import { t } from 'i18next';
import api from 'utils/api';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import { Edit } from '@mui/icons-material';
import { IconButton } from '@mui/material';

function TasksTable() {
  const { fetchMahallas, fetchTasks, filters, openEditTaskDialog, handleOpenEditTaskDialog } = useTasksStore();
  const { dataGridProps, rows, setPaginationModel } = useServerDataGrid(fetchTasks, [], 100, filters);

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
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: t('tableHeaders.actions'),
      flex: 1,
      renderCell: (row) => (
        <IconButton color="primary" onClick={() => handleOpenEditTaskDialog(row.row._id)}>
          <Edit />
        </IconButton>
      )
    }
  ];

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
