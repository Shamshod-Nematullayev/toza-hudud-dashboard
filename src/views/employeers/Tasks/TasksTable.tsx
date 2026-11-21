import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useEffect } from 'react';
import { useTasksStore } from './useTasksStore';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import { AttachFile, DoDisturbOnOutlined, Edit, PictureAsPdfOutlined } from '@mui/icons-material';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import useCustomizationStore from 'store/customizationStore';
import api from 'utils/api';
import { toast } from 'react-toastify';

function TasksTable() {
  const {
    fetchMahallas,
    fetchTasks,
    filters,
    setFilters,
    mahallalar,
    setAccountNumber,
    setFullName,
    setMahallaId,
    setType,
    setNazoratchiId,
    setStatus,
    handleOpenEditTaskDialog,
    handleOpenRejectDialog
  } = useTasksStore();
  const { dataGridProps, rows, setPaginationModel } = useServerDataGrid(fetchTasks, [], 100, filters);
  const { user } = useCustomizationStore();

  const userRoles = user?.roles || [];
  const canReject = userRoles.some((r: string) => ['admin', 'billing', 'stm', 'rahbar', 'product_admin'].includes(r));

  const mimeToExt: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp'
  };

  const handleViewDocument = async (fileId: string) => {
    try {
      const res = await api.get(`/fetchTelegram/${fileId}`, { responseType: 'blob' });
      const rawType = String(res.headers['content-type'] || 'application/pdf');
      const contentType = rawType.split(';')[0].trim().toLowerCase();

      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      const ext = mimeToExt[contentType] || 'pdf';
      const link = document.createElement('a');
      link.href = url;
      link.download = `hujjat.${ext}`;
      link.click();

      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err: any) {
      console.error('[handleViewDocument] error:', err);
      toast.error('Hujjatni yuklab olishda xatolik yuz berdi');
    }
  };

  const columns: readonly GridColDef<any>[] = [
    {
      field: 'rowNumber',
      headerName: '№',
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const page = dataGridProps.paginationModel?.page ?? 0;
        const pageSize = dataGridProps.paginationModel?.pageSize ?? 100;
        return (
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {page * pageSize + (params.row?.index ?? 0) + 1}
          </Typography>
        );
      }
    },
    {
      field: 'accountNumber',
      headerName: 'Hisob raqami',
      width: 140,
      sortable: true,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {value || '—'}
        </Typography>
      )
    },
    {
      field: 'fullName',
      headerName: 'F.I.O. Abonent',
      minWidth: 200,
      flex: 1.5,
      sortable: true,
      renderCell: ({ value }) => <Typography variant="body2">{value || '—'}</Typography>
    },
    {
      field: 'mahallaId',
      headerName: 'MFY / Mahalla',
      minWidth: 160,
      flex: 1,
      sortable: false
    },
    {
      field: 'nazoratchiName',
      headerName: 'Inspektor',
      minWidth: 160,
      flex: 1,
      sortable: true
    },
    {
      field: 'type',
      headerName: 'Topshiriq Turi',
      width: 160,
      sortable: true,
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
      width: 175,
      sortable: true,
      renderCell: ({ value, row }) => {
        if (value === 'completed' || value === 'Bajarilgan') {
          return <Chip label="✅ Bajarilgan" color="success" size="small" sx={{ fontWeight: 600 }} />;
        }
        if (value === 'checking' || value === 'Tekshirilmoqda') {
          return <Chip label="🔍 Tekshirilmoqda" color="info" size="small" sx={{ fontWeight: 600 }} />;
        }
        if (value === 'in-progress' || value === 'Jarayonda') {
          return <Chip label="⏳ Jarayonda" color="warning" size="small" sx={{ fontWeight: 600 }} />;
        }
        if (value === 'rejected' || value === 'Muvaffaqqiyatsiz yakunlangan' || value === "Bajarib bo'lmaydi") {
          const reasonText = row?.rejectedReasonType
            ? row?.rejectedReason && row?.rejectedReason !== row?.rejectedReasonType
              ? `${row.rejectedReasonType} (${row.rejectedReason})`
              : row.rejectedReasonType
            : row?.rejectedReason || row?.purpose;
          return (
            <Tooltip title={reasonText ? `Asos: ${reasonText}` : "Bajarib bo'lmaydi"} arrow>
              <Chip label="❌ Bajarib bo'lmaydi" color="error" size="small" sx={{ fontWeight: 600 }} />
            </Tooltip>
          );
        }
        return <Chip label={value || '—'} size="small" variant="outlined" />;
      }
    },
    {
      field: 'fileId',
      headerName: 'Asoslovchi hujjat',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: ({ row }) => {
        if (!row.fileId) {
          return (
            <Typography variant="caption" color="text.secondary">
              —
            </Typography>
          );
        }
        return (
          <Tooltip title="Telegramdagi asoslovchi PDF hujjatni yuklab olish" arrow>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<PictureAsPdfOutlined sx={{ fontSize: 16 }} />}
              onClick={() => handleViewDocument(row.fileId)}
              sx={{ textTransform: 'none', py: 0.25, px: 1, fontSize: '0.75rem', borderRadius: 1.5 }}
            >
              PDF hujjat
            </Button>
          </Tooltip>
        );
      }
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: 'Amallar',
      width: 110,
      align: 'center',
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          {canReject && row.row.type === 'electricity' && row.row.status !== 'rejected' && (
            <Tooltip title="Bajarib bo'lmaydi deb yakunlash" arrow>
              <IconButton color="error" size="small" onClick={() => handleOpenRejectDialog(row.row)}>
                <DoDisturbOnOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Tahrirlash" arrow>
            <IconButton color="primary" size="small" onClick={() => handleOpenEditTaskDialog(row.row._id)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  useEffect(() => {
    fetchMahallas();
  }, []);

  const hasActiveFilters = Boolean(
    filters.accountNumber ||
    filters.fullName ||
    filters.mahallaId ||
    filters.type ||
    filters.nazoratchi_id ||
    filters.status
  );

  const getMahallaLabel = (id?: number) => {
    if (!id) return '';
    const found = mahallalar.find((m) => m.id === id);
    return found ? found.name : `MFY: ${id}`;
  };

  const getStatusLabel = (st?: string) => {
    if (st === 'completed') return 'Bajarilgan';
    if (st === 'checking') return 'Tekshirilmoqda';
    if (st === 'in-progress') return 'Jarayonda';
    if (st === 'rejected') return "Bajarib bo'lmaydi";
    return st || '';
  };

  const clearSingleFilter = (key: keyof typeof filters) => {
    const nextFilters = { ...filters };
    delete nextFilters[key];
    if (key === 'accountNumber') setAccountNumber('');
    if (key === 'fullName') setFullName('');
    if (key === 'mahallaId') setMahallaId('');
    if (key === 'type') setType('');
    if (key === 'nazoratchi_id') setNazoratchiId('');
    if (key === 'status') setStatus('');
    setFilters(nextFilters);
  };

  const clearAllFilters = () => {
    setAccountNumber('');
    setFullName('');
    setMahallaId('');
    setType('');
    setNazoratchiId('');
    setStatus('');
    setFilters({});
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {hasActiveFilters && (
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Faol filtrlar:
          </Typography>
          {filters.accountNumber && (
            <Chip
              size="small"
              label={`Hisob: ${filters.accountNumber}`}
              onDelete={() => clearSingleFilter('accountNumber')}
              color="primary"
              variant="outlined"
            />
          )}
          {filters.fullName && (
            <Chip
              size="small"
              label={`F.I.O: ${filters.fullName}`}
              onDelete={() => clearSingleFilter('fullName')}
              color="primary"
              variant="outlined"
            />
          )}
          {filters.mahallaId && (
            <Chip
              size="small"
              label={`MFY: ${getMahallaLabel(filters.mahallaId)}`}
              onDelete={() => clearSingleFilter('mahallaId')}
              color="primary"
              variant="outlined"
            />
          )}
          {filters.type && (
            <Chip
              size="small"
              label={`Turi: ${filters.type === 'electricity' ? '⚡ Elektr' : '📱 Telefon'}`}
              onDelete={() => clearSingleFilter('type')}
              color="warning"
              variant="outlined"
            />
          )}
          {filters.status && (
            <Chip
              size="small"
              label={`Holat: ${getStatusLabel(filters.status)}`}
              onDelete={() => clearSingleFilter('status')}
              color="info"
              variant="outlined"
            />
          )}
          {filters.nazoratchi_id && (
            <Chip
              size="small"
              label={`Inspektor ID: ${filters.nazoratchi_id}`}
              onDelete={() => clearSingleFilter('nazoratchi_id')}
              color="secondary"
              variant="outlined"
            />
          )}
          <Button
            size="small"
            color="error"
            onClick={clearAllFilters}
            sx={{ fontSize: '0.75rem', py: 0.25, px: 1, minWidth: 'auto', textTransform: 'none' }}
          >
            Barchasini tozalash
          </Button>
        </Stack>
      )}

      <DataGrid
        rows={rows}
        getRowId={(row) => row._id || row.id}
        {...dataGridProps}
        columns={columns}
        onPaginationModelChange={setPaginationModel}
        disableColumnFilter
        disableColumnMenu
        rowHeight={52}
        sx={{ minHeight: 480, border: 'none' }}
      />
    </Box>
  );
}

export default TasksTable;
