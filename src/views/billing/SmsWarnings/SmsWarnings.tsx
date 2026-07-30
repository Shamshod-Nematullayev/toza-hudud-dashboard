import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  UploadFileOutlined,
  DownloadOutlined,
  SyncOutlined,
  RefreshOutlined,
  SearchOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  ErrorOutlineOutlined,
  HourglassEmptyOutlined,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import ImportSmsModal from './ImportSmsModal';
import { toast } from 'react-toastify';

interface ActiveJobInfo {
  name: string;
  progress: number;
  message: string;
}

const INIT_FILTERS = {
  search: '',
  phone: '',
  accountNumber: '',
  status: '',
  startDate: '',
  endDate: '',
};

function SmsWarnings() {
  const [reloadState, setReloadState] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [draftFilters, setDraftFilters] = useState(INIT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INIT_FILTERS);

  // Job progress state & loading
  const [activeJob, setActiveJob] = useState<ActiveJobInfo | null>(null);
  const [jobTriggerLoading, setJobTriggerLoading] = useState(false);
  const [rowRefreshLoading, setRowRefreshLoading] = useState<string | null>(null);

  const refreshData = () => setReloadState((prev) => !prev);

  // ─── DataGrid Server Query ──────────────────────────────────
  const { dataGridProps } = useServerDataGrid(
    async ({ page, limit, sortDirection, sortField }) => {
      const { data } = await api.get('/sms-service/warnings', {
        params: {
          page,
          limit,
          sortField,
          sortDirection,
          search: appliedFilters.search || undefined,
          phone: appliedFilters.phone || undefined,
          accountNumber: appliedFilters.accountNumber || undefined,
          status: appliedFilters.status || undefined,
          startDate: appliedFilters.startDate || undefined,
          endDate: appliedFilters.endDate || undefined,
        },
      });
      return {
        meta: data.meta,
        data: data.content,
      };
    },
    [appliedFilters],
    25,
    { reloadState }
  );

  // ─── Poll Job Progress ──────────────────────────────────────
  const fetchJobProgress = useCallback(async () => {
    try {
      const { data } = await api.get('/sms-service/job-progress');
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        const runningJob = data.data[0];
        if (runningJob && typeof runningJob.progress === 'number' && runningJob.progress >= 0 && runningJob.progress <= 100) {
          setActiveJob({
            name: runningJob.name || 'SMS Holatlarini Yangilash',
            progress: runningJob.progress,
            message: runningJob.message || 'Tekshirilmoqda...',
          });
          if (runningJob.progress === 100) {
            setTimeout(() => {
              setActiveJob(null);
              setReloadState((prev) => !prev);
            }, 3000);
          }
        } else {
          setActiveJob(null);
        }
      } else {
        setActiveJob(null);
      }
    } catch (err) {
      // Ignore poll error
    }
  }, []);

  useEffect(() => {
    fetchJobProgress();
    const interval = setInterval(fetchJobProgress, 3000);
    return () => clearInterval(interval);
  }, [fetchJobProgress]);

  // ─── Handlers ───────────────────────────────────────────────
  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    refreshData();
  };

  const handleResetFilters = () => {
    setDraftFilters(INIT_FILTERS);
    setAppliedFilters(INIT_FILTERS);
    refreshData();
  };

  // Import Handler
  const handleImport = async (excelFile: File) => {
    const formData = new FormData();
    formData.append('file', excelFile);
    setLoading(true);
    try {
      const { data } = await api.post('/sms-service/warnings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(data.message || 'SMS yuborish muvaffaqiyatli yakunlandi!');
      refreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Fayl yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Export Handler
  const handleClickExport = async () => {
    try {
      const response = await api.get('/sms-service/warnings/export', {
        params: {
          search: appliedFilters.search || undefined,
          phone: appliedFilters.phone || undefined,
          accountNumber: appliedFilters.accountNumber || undefined,
          status: appliedFilters.status || undefined,
          startDate: appliedFilters.startDate || undefined,
          endDate: appliedFilters.endDate || undefined,
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sms_warnings_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Excel yuklab olishda xatolik yuz berdi');
    }
  };

  // Trigger Overall Status Job Handler
  const handleTriggerJob = async () => {
    setJobTriggerLoading(true);
    try {
      const { data } = await api.post('/sms-service/trigger-job');
      toast.success(data.message || 'SMS holatlarini yangilash jobi ishga tushirildi!');
      fetchJobProgress();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Job ishga tushirishda xatolik yuz berdi');
    } finally {
      setJobTriggerLoading(false);
    }
  };

  // Single SMS Status Refresh ("odinochniy")
  const handleRefreshSingleSms = async (id: string) => {
    setRowRefreshLoading(id);
    try {
      const { data } = await api.post(`/sms-service/warnings/${id}/check-status`);
      toast.success(data.message || 'SMS holati yangilandi!');
      refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'SMS holatini tekshirishda xatolik');
    } finally {
      setRowRefreshLoading(null);
    }
  };

  // ─── Formatters ─────────────────────────────────────────────
  const formatPhone = (p: string | number) => {
    if (!p) return '—';
    const str = String(p);
    const clean = str.length === 12 ? str.slice(3) : str;
    if (clean.length === 9) {
      return `+998 (${clean.slice(0, 2)}) ${clean.slice(2, 5)}-${clean.slice(5, 7)}-${clean.slice(7, 9)}`;
    }
    return str;
  };

  const formatCurrency = (val: number) => {
    if (val === undefined || val === null) return '0 so\'m';
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  // ─── Columns Definition ─────────────────────────────────────
  const columns: GridColDef[] = [
    {
      field: 'order_number',
      headerName: '№',
      width: 50,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const page = dataGridProps.paginationModel?.page || 0;
        const pageSize = dataGridProps.paginationModel?.pageSize || 25;
        const rowIx = dataGridProps.rows.findIndex((r) => r._id === params.row._id);
        return page * pageSize + (rowIx >= 0 ? rowIx + 1 : 1);
      },
    },
    {
      field: 'accountNumber',
      headerName: 'Hisob raqam',
      width: 160,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ value }) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{value || '—'}</Typography>,
    },
    {
      field: 'phone',
      headerName: 'Telefon raqami',
      width: 170,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ value }) => <Typography variant="body2">{formatPhone(value)}</Typography>,
    },
    {
      field: 'debtAmount',
      headerName: "Qarzdorlik (so'm)",
      width: 160,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
          {formatCurrency(value)}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'SMS Holati',
      width: 160,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ value }) => {
        if (value === 'sent') {
          return <Chip label="✅ Yetkazildi" color="success" size="small" variant="filled" sx={{ fontWeight: 600 }} />;
        }
        if (value === 'failed') {
          return <Chip label="❌ Xatolik" color="error" size="small" variant="filled" sx={{ fontWeight: 600 }} />;
        }
        return <Chip label="⏳ Kutilmoqda" color="warning" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      },
    },
    {
      field: 'createdAt',
      headerName: 'Yaratilgan sana',
      width: 160,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ value }) => (
        <Typography variant="caption" color="text.secondary">
          {value ? new Date(value).toLocaleString('uz-UZ') : '—'}
        </Typography>
      ),
    },
    {
      field: 'message',
      headerName: 'Xabarnoma matni / Tafsilot',
      flex: 1,
      minWidth: 200,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ value, row }) => (
        <Typography variant="caption" color={row.status === 'failed' ? 'error.main' : 'text.secondary'} noWrap>
          {value || row.errorMessage || '—'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Amallar',
      width: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Tooltip title="Eskiz provayderidan holatni yakka tartibda yangilash">
          <span>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleRefreshSingleSms(row._id)}
              disabled={rowRefreshLoading === row._id}
            >
              {rowRefreshLoading === row._id ? <CircularProgress size={16} /> : <RefreshOutlined fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>
      ),
    },
  ];

  return (
    <MainCard contentSX={{ padding: 0 }}>
      <ImportSmsModal open={openImportModal} onClose={() => setOpenImportModal(false)} onSave={handleImport} />

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* 1. SAHIFA HEADER BO'LIMI VA ASOSIY AMALLAR */}
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              📩 SMS Ogohlantirishlar Boshqaruvi
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Debitorlarga yuborilgan va kutilayotgan SMS xabarnomalar monitoringi hamda holatlarini boshqarish
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <Tooltip title="Excel faylidan yangi debitorlar ro'yxatini yuklash va SMS yuborish">
              <Button
                variant="contained"
                color="primary"
                startIcon={<UploadFileOutlined />}
                onClick={() => setOpenImportModal(true)}
                disabled={loading}
              >
                Excel Orqali SMS Yuborish
              </Button>
            </Tooltip>

            <Tooltip title="Joriy filtrdagi barcha SMS ogohlantirishlar ro'yxatini Excel fayliga yuklab olish">
              <Button
                variant="outlined"
                color="success"
                startIcon={<DownloadOutlined />}
                onClick={handleClickExport}
              >
                Excelga Yuklash
              </Button>
            </Tooltip>

            <Tooltip title="Fondagi kutilayotgan barcha SMSlar holatini Eskiz orqali avtomatik tekshirish jobini ishga tushirish">
              <span>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={jobTriggerLoading ? <CircularProgress size={16} color="inherit" /> : <SyncOutlined />}
                  onClick={handleTriggerJob}
                  disabled={Boolean(activeJob) || jobTriggerLoading}
                >
                  SMS Holatlarini Yangilash (Job)
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Live Progress Widget */}
        {activeJob && (
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'secondary.light', border: '1px solid', borderColor: 'secondary.main', borderRadius: 2 }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'secondary.dark' }}>
                ⚙️ {activeJob.name}
              </Typography>

              <Chip label={`${activeJob.progress}%`} size="small" color="secondary" sx={{ fontWeight: 700, height: 20 }} />
            </Stack>
            <LinearProgress variant="determinate" value={activeJob.progress} color="secondary" sx={{ height: 6, borderRadius: 3, my: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {activeJob.message}
            </Typography>
          </Paper>
        )}

        {/* 2. FILTRLAR TOOLBAR BO'LIMI */}
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 1, display: 'block', mb: 1.5 }}>
            🔍 FILTRLAR VA QIDIRUV
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="F.I.O, Hisob raqam yoki Telefon..."
              value={draftFilters.search}
              onChange={(e) => setDraftFilters((p) => ({ ...p, search: e.target.value }))}
              sx={{ minWidth: 220, flex: 1 }}
              slotProps={{
                input: {
                  startAdornment: <SearchOutlined fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />,
                },
              }}
            />

            <TextField
              size="small"
              placeholder="Telefon (masalan: 901234567)"
              value={draftFilters.phone}
              onChange={(e) => setDraftFilters((p) => ({ ...p, phone: e.target.value }))}
              sx={{ minWidth: 160 }}
            />

            <TextField
              size="small"
              placeholder="Hisob raqam"
              value={draftFilters.accountNumber}
              onChange={(e) => setDraftFilters((p) => ({ ...p, accountNumber: e.target.value }))}
              sx={{ minWidth: 140 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>SMS Holati</InputLabel>
              <Select
                value={draftFilters.status}
                label="SMS Holati"
                onChange={(e) => setDraftFilters((p) => ({ ...p, status: e.target.value }))}
              >
                <MenuItem value="">Barchasi</MenuItem>
                <MenuItem value="pending">⏳ Kutilmoqda</MenuItem>
                <MenuItem value="sent">✅ Yetkazildi</MenuItem>
                <MenuItem value="failed">❌ Xatolik</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="date"
              label="Dan (Sana)"
              value={draftFilters.startDate}
              onChange={(e) => setDraftFilters((p) => ({ ...p, startDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 145 }}
            />

            <TextField
              size="small"
              type="date"
              label="Gacha (Sana)"
              value={draftFilters.endDate}
              onChange={(e) => setDraftFilters((p) => ({ ...p, endDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 145 }}
            />

            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="primary" size="small" onClick={handleApplyFilters}>
                Qo'llash
              </Button>
              <Button variant="outlined" color="inherit" size="small" onClick={handleResetFilters} startIcon={<ClearOutlined />}>
                Tozala
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* 3. DATAGRID JADVALI */}
        <DataGrid
          {...dataGridProps}
          columns={columns}
          getRowId={(row) => row._id || row.id}
          rowHeight={52}
          loading={loading}
          sx={{ flex: 1, minHeight: 450, border: 'none' }}
        />
      </Box>
    </MainCard>
  );
}

export default SmsWarnings;
