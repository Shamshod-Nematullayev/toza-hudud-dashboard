import React, { useState } from 'react';
import { Grid, Paper, Typography, Stack, Button, IconButton, Chip, Tooltip, Box, TextField, MenuItem, Divider } from '@mui/material';
import { Edit, Add as AddIcon, CloudUpload as ImportIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid'; // Yoki sizda qanday bo'lsa
import dayjs from 'dayjs';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import { createCallWarningsService } from 'services/caller.service';
import MahallaSelection from 'ui-component/MahallaSelection';
import SideFilters from './SideFilters';
import { useCallerStore } from './useCallerStore';
import { CreateCallModal } from './modals/CreateCallModal';
import { ImportCallModal } from './modals/ImportCallModal';

// Status ranglari
const statusColors: any = {
  new: 'primary',
  pending: 'warning',
  completed: 'success',
  failed: 'error'
};

const CallRequestAdmin = () => {
  const callerService = createCallWarningsService(api);
  const { filters: callFilters, refreshTrigger, setModal } = useCallerStore();

  // 1. Server DataGrid Hook
  const { dataGridProps } = useServerDataGrid(
    async ({ limit, page, filters, sortDirection, sortField }) => {
      const data = await callerService.getAll({
        page,
        limit,
        sortDirection: sortDirection || undefined,
        sortField: sortField || undefined,
        ...filters,
        ...callFilters,

        priority: filters?.priority === 'all' ? undefined : filters?.priority,
        status: filters?.status === 'all' ? undefined : filters?.status,
        accountNumber: filters?.accountNumber
      });
      return {
        data: data.content, // Odatda content bo'ladi
        meta: data.meta
      };
    },
    [],
    25,
    { refreshTrigger }
  );

  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModal('create', true)}>
              Yangi qo'shish
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ImportIcon />}
              onClick={() => {
                setModal('import', true);
              }}
            >
              Import (Excel)
            </Button>
          </Stack>
        </Grid>
        {/* JADVAL QISMI (Chap tomon - 9/12) */}
        <Grid item xs={12} md={9}>
          <DataGrid
            {...dataGridProps}
            columns={[
              { field: 'accountNumber', headerName: 'Hisob raqam', width: 150 },
              {
                field: 'residentName',
                headerName: 'Abonent',
                width: 250,
                renderCell: (params) => (
                  <Box>
                    <Typography variant="body2">{params.value}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      ID: {params.row.residentId}
                    </Typography>
                  </Box>
                )
              },
              {
                field: 'status',
                headerName: 'Status',
                width: 120,
                renderCell: (params) => (
                  <Chip label={params.value.toUpperCase()} color={statusColors[params.value] || 'default'} size="small" />
                )
              },
              {
                field: 'priority',
                headerName: 'Prioritet',
                width: 120,
                renderCell: (params) => (
                  <Chip label={params.value} variant="outlined" color={params.value === 'high' ? 'error' : 'default'} size="small" />
                )
              },
              { field: 'attemptCount', headerName: 'Urinishlar', width: 100, align: 'center' },
              {
                field: 'updatedAt',
                headerName: "Oxirgi qo'ng'iroq",
                width: 180,
                valueGetter: (params: any) => (params.value ? dayjs(params.value).format('DD.MM.YYYY HH:mm') : '—')
              },
              {
                field: 'actions',
                headerName: 'Amal',
                width: 80,
                sortable: false,
                renderCell: (params) => (
                  <IconButton color="primary" onClick={() => console.log('Edit', params.id)}>
                    <Edit fontSize="medium" />
                  </IconButton>
                )
              }
            ]}
            disableColumnMenu
          />
        </Grid>

        {/* FILTRLAR SIDEBARI (O'ng tomon - 3/12) */}
        <Grid item xs={12} md={3}>
          <SideFilters />
        </Grid>
      </Grid>

      {/* Yangi qo'shish uchun bo'sh modal */}
      <CreateCallModal />
      <ImportCallModal />
      {/* <CreateCallWarningDialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} /> */}
    </MainCard>
  );
};

export default CallRequestAdmin;
