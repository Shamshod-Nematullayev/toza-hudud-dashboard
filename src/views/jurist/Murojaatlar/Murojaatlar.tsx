import React, { useEffect, useMemo, useState } from 'react';
import { Grid } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import SideBar from './MurojaatlarSideBar';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import api from 'utils/api';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Formik, FormikHelpers } from 'formik';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { InspectorOption, MurojaatFormValues, MurojaatRow } from './types';
import { CloseMurojaatDialog } from './modals/CloseMurojaatDialog';
import { EditMurojaatDialog } from './modals/EditMurojaatDialog';
import { CreateMurojaatDialog } from './modals/CreateMurojaatDialog';
import useCustomizationStore from 'store/customizationStore';

function Murojaatlar() {
  const [filters, setFilters] = useState<Record<string, any>>({
    status: 'open'
  });
  const [inspectors, setInspectors] = useState<InspectorOption[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  const [selectedRow, setSelectedRow] = useState<MurojaatRow | null>(null);

  const [createFile, setCreateFile] = useState<File | null>(null);
  const [closeFile, setCloseFile] = useState<File | null>(null);

  const { mahallalar } = useCustomizationStore();

  useEffect(() => {
    const loadInspectors = async () => {
      const res = await api.get('/inspectors');
      setInspectors(res.data.rows ?? []);
    };

    loadInspectors();
  }, []);

  const { dataGridProps } = useServerDataGrid(
    async ({ limit, page, filters }) => {
      const { data } = await api.get('/murojaatlar', {
        params: {
          page,
          size: limit,
          ...filters
        }
      });

      return {
        data: data.data,
        meta: {
          page: data.meta.page,
          limit: data.meta.size,
          total: data.meta.total
        }
      };
    },
    [],
    25,
    {
      ...filters,
      refreshKey
    }
  );

  const refreshTable = () => setRefreshKey((prev) => prev + 1);

  const openCreate = () => {
    setCreateFile(null);
    setCreateOpen(true);
  };

  const openEdit = (row: MurojaatRow) => {
    setSelectedRow(row);
    setEditOpen(true);
  };

  const openClose = (row: MurojaatRow) => {
    setSelectedRow(row);
    setCloseFile(null);
    setCloseOpen(true);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'mahallaId',
        headerName: 'Mahalla ID',
        width: 120,
        valueFormatter: (value) => mahallalar.find((m) => m.id == value)?.name
      },
      {
        field: 'residentId',
        headerName: 'Resident ID',
        width: 140,
        valueFormatter: (value) => (value ? value : '-')
      },
      {
        field: 'fileName',
        headerName: 'Fayl nomi',
        flex: 1,
        minWidth: 220
      },
      {
        field: 'assignedTo',
        headerName: 'Inspektor',
        width: 220,
        renderCell: (params) => {
          const value = params.row.assignedTo;
          if (!value) return '-';
          if (typeof value === 'string') return value;
          return value.name ?? '-';
        }
      },
      {
        field: 'status',
        headerName: 'Holati',
        width: 130,
        renderCell: (params) => (params.value === 'closed' ? '🟢 Yopiq' : '🔴 Ochiq')
      },
      {
        field: 'dueDate',
        headerName: 'Muddat',
        width: 150,
        renderCell: (params) => (params.value ? dayjs(params.value).format('DD.MM.YYYY') : '-')
      },
      {
        field: 'actions',
        headerName: 'Amallar',
        width: 160,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => {
          const row = params.row as MurojaatRow;

          return (
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={() => openEdit(row)}>
                <EditIcon fontSize="small" />
              </IconButton>

              {row.status === 'open' && (
                <IconButton size="small" onClick={() => openClose(row)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}

              <IconButton
                size="small"
                onClick={async () => {
                  const ok = window.confirm('Shu murojaatni o‘chirasizmi?');
                  if (!ok) return;

                  await api.delete(`/murojaatlar/${row._id}`);
                  refreshTable();
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          );
        }
      }
    ],
    []
  );

  return (
    <MainCard>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}
      >
        <Typography variant="h5">Murojaatlar</Typography>

        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Yangi murojaat
        </Button>
      </Box>

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <SideBar setFilters={setFilters} employees={inspectors.map((i) => ({ id: i._id, name: i.name }))} />
        </Grid>

        <Grid size={{ xs: 12, sm: 9 }}>
          <DataGrid
            columns={columns}
            disableColumnMenu
            filterMode="server"
            sortingMode="server"
            getRowId={(row) => row._id}
            sx={{ height: '100%' }}
            {...dataGridProps}
          />
        </Grid>
      </Grid>

      <CreateMurojaatDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        inspectors={inspectors}
        onSuccess={() => {
          setCreateOpen(false);
          refreshTable();
        }}
        file={createFile}
        setFile={setCreateFile}
      />

      <EditMurojaatDialog
        open={editOpen}
        row={selectedRow}
        inspectors={inspectors}
        onClose={() => {
          setEditOpen(false);
          setSelectedRow(null);
        }}
        onSuccess={() => {
          setEditOpen(false);
          setSelectedRow(null);
          refreshTable();
        }}
      />

      <CloseMurojaatDialog
        open={closeOpen}
        row={selectedRow}
        onClose={() => {
          setCloseOpen(false);
          setSelectedRow(null);
          setCloseFile(null);
        }}
        onSuccess={() => {
          setCloseOpen(false);
          setSelectedRow(null);
          setCloseFile(null);
          refreshTable();
        }}
        file={closeFile}
        setFile={setCloseFile}
      />
    </MainCard>
  );
}

export default Murojaatlar;
