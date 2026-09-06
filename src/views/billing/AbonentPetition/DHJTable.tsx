import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface DHJTableProps {
  rows?: any[];
}

function DHJTable({ rows = [] }: DHJTableProps) {
  const { t } = useTranslation();

  const columns: GridColDef[] = [
    {
      field: 'davr',
      headerName: t('recalculationDetailPage.period', 'Davr'),
      width: 90,
      renderCell: (e) => <span style={{ fontWeight: 600 }}>{e.value}</span>
    },
    {
      field: 'hisoblandi',
      headerName: t('recalculationDetailPage.accrued', 'Hisoblandi'),
      flex: 1,
      minWidth: 100,
      type: 'number',
      renderCell: (e) => <span>{e.value ? Number(e.value).toLocaleString('uz-UZ') : '0'}</span>
    },
    {
      field: 'tushum',
      headerName: t('recalculationDetailPage.payment', 'Tushum'),
      flex: 1,
      minWidth: 95,
      type: 'number',
      renderCell: (e) => <span>{e.value ? Number(e.value).toLocaleString('uz-UZ') : '0'}</span>
    },
    {
      field: 'act',
      headerName: t('recalculationDetailPage.act', 'Akt'),
      flex: 1,
      minWidth: 90,
      type: 'number',
      renderCell: (e) => (
        <span style={{ color: e.value ? 'primary.main' : 'inherit', fontWeight: e.value ? 600 : 400 }}>
          {e.value ? Number(e.value).toLocaleString('uz-UZ') : '0'}
        </span>
      )
    },
    {
      field: 'saldo_oxiri',
      headerName: t('recalculationDetailPage.finalBalance', 'Saldo'),
      flex: 1,
      minWidth: 100,
      type: 'number',

      renderCell: (e) => (
        <span
          style={{
            fontWeight: 600,
            color: Number(e.value) > 0 ? '#d32f2f' : '#2e7d32'
          }}
        >
          {e.value ? Number(e.value).toLocaleString('uz-UZ') : '0'}
        </span>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        hideFooter
        density="compact"
        disableColumnMenu
        disableColumnSorting
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'background.default' : 'grey.50'),
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontWeight: 600
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: 'divider'
          }
        }}
      />
    </Box>
  );
}

export default DHJTable;
