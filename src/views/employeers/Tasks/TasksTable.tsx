import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useEffect } from 'react';
import { useTasksStore } from './useTasksStore';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import { Edit } from '@mui/icons-material';
import { Chip, IconButton, Typography } from '@mui/material';

function TasksTable() {
  const { fetchMahallas, fetchTasks, filters, handleOpenEditTaskDialog } = useTasksStore();
  const { dataGridProps, rows, setPaginationModel } = useServerDataGrid(fetchTasks, [], 100, filters);

  const columns: readonly GridColDef<any>[] = [
    {
      field: 'id',
      headerName: '№',
      width: 60,
      renderCell: (row) => row.row.index + 1
    },
    {
      field: 'accountNumber',
      headerName: 'Hisob raqami',
      width: 140,
      renderCell: ({ value }) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{value || '—'}</Typography>
    },
    {
      field: 'fullName',
      headerName: 'F.I.O. Abonent',
      minWidth: 200,
      flex: 1.5,
      renderCell: ({ value }) => <Typography variant="body2">{value || '—'}</Typography>
    },
    {
      field: 'mahallaId',
      headerName: 'MFY / Mahalla',
      minWidth: 160,
      flex: 1
    },
    {
      field: 'nazoratchiName',
      headerName: 'Inspektor',
      minWidth: 160,
      flex: 1
    },
    {
      field: 'type',
      headerName: 'Topshiriq Turi',
      width: 160,
      renderCell: ({ value }) => {
        if (value === 'electricity') {
          return <Chip label="⚡ Elektr Hisob" color="warning" variant="outlined" size="small" sx={{ fontWeight: 600 }} />;
        }
        if (value === 'phone') {
          return <Chip label="📱 Telefon Raqam" color="info" variant="outlined" size="small" sx={{ fontWeight: 600 }} />;
        }
        return <Typography variant="caption">{value || '—'}</Typography>;
      }
    },
    {
      field: 'status',
      headerName: 'Holati',
      width: 160,
      renderCell: ({ value }) => {
        if (value === 'completed' || value === 'Bajarilgan') {
          return <Chip label="✅ Bajarilgan" color="success" size="small" sx={{ fontWeight: 600 }} />;
        }
        if (value === 'in-progress' || value === 'Jarayonda') {
          return <Chip label="⏳ Jarayonda" color="warning" size="small" sx={{ fontWeight: 600 }} />;
        }
        if (value === 'rejected' || value === 'Muvaffaqqiyatsiz yakunlangan') {
          return <Chip label="❌ Muvaffaqiyatsiz" color="error" size="small" sx={{ fontWeight: 600 }} />;
        }
        return <Chip label={value || '—'} size="small" variant="outlined" />;
      }
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: 'Amallar',
      width: 80,
      align: 'center',
      renderCell: (row) => (
        <IconButton color="primary" size="small" onClick={() => handleOpenEditTaskDialog(row.row._id)}>
          <Edit fontSize="small" />
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
      rowHeight={52}
      sx={{ minHeight: 480, border: 'none' }}
    />
  );
}

export default TasksTable;
