import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab
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
  PeopleAltOutlined,
  BusinessOutlined
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
  endDate: ''
};

function SmsWarnings() {
  const [reloadState, setReloadState] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Tab state: 'INDIVIDUAL_DEBT' (Aholi) vs 'ORGANIZATION_DEBT' (Tashkilot)
  const [activeTab, setActiveTab] = useState<'INDIVIDUAL_DEBT' | 'ORGANIZATION_DEBT'>('INDIVIDUAL_DEBT');

  // Filter state
  const [draftFilters, setDraftFilters] = useState(INIT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INIT_FILTERS);

  // Stats state (Yetkazildi, Kutilmoqda, Yetkazilmadi)
  const [stats, setStats] = useState({ sent: 0, pending: 0, failed: 0 });

  // Job progress state & loading
  const [activeJob, setActiveJob] = useState<ActiveJobInfo | null>(null);
  const [jobTriggerLoading, setJobTriggerLoading] = useState(false);
  const [rowRefreshLoading, setRowRefreshLoading] = useState<string | null>(null);

  const refreshData = () => setReloadState((prev) => !prev);

  // Tab almashganda filtrlarni va ma'lumotlarni yangilash
  const handleTabChange = (event: React.SyntheticEvent, newValue: 'INDIVIDUAL_DEBT' | 'ORGANIZATION_DEBT') => {
    setActiveTab(newValue);
    setDraftFilters(INIT_FILTERS);
    setAppliedFilters(INIT_FILTERS);
    refreshData();
  };

  // ─── DataGrid Server Query ──────────────────────────────────
  const { dataGridProps } = useServerDataGrid(
    async ({ page, limit, sortDirection, sortField }) => {
      const { data } = await api.get('/sms-service/warnings', {
        params: {
          page,
          limit,
          sortField,
          sortDirection,
          type: activeTab,
          search: appliedFilters.search || undefined,
          phone: appliedFilters.phone || undefined,
          accountNumber: appliedFilters.accountNumber || undefined,
          status: appliedFilters.status || undefined,
          startDate: appliedFilters.startDate || undefined,
          endDate: appliedFilters.endDate || undefined
        }
      });

      if (data.meta?.stats) {
        setStats(data.meta.stats);
      }

      return {
        meta: data.meta,
        data: data.content
      };
    },
    [],
    25,
    { reloadState, activeTab, appliedFilters }
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
            message: runningJob.message || 'Tekshirilmoqda...'
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

    const endpoint = activeTab === 'ORGANIZATION_DEBT' ? '/sms-service/warnings/organizations/send' : '/sms-service/warnings';

    try {
      const { data } = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
          type: activeTab,
          search: appliedFilters.search || undefined,
          phone: appliedFilters.phone || undefined,
          accountNumber: appliedFilters.accountNumber || undefined,
          status: appliedFilters.status || undefined,
          startDate: appliedFilters.startDate || undefined,
          endDate: appliedFilters.endDate || undefined
        },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filePrefix = activeTab === 'ORGANIZATION_DEBT' ? 'tashkilot_sms' : 'aholi_sms';
      link.setAttribute('download', `${filePrefix}_warnings_${Date.now()}.xlsx`);
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
    if (val === undefined || val === null) return "0 so'm";
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  const isOrg = activeTab === 'ORGANIZATION_DEBT';

  // ─── Columns Definition (Dynamic per Tab) ───────────────────
  const columns: GridColDef[] = useMemo(() => {
    return [
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
          const rowIx = (dataGridProps.rows || []).findIndex((r: any) => r._id === params.row._id);
          return page * pageSize + (rowIx >= 0 ? rowIx + 1 : 1);
        }
      },
      {
        field: isOrg ? 'organizationId' : 'residentId',
        headerName: isOrg ? 'Tashkilot ID' : 'Resident ID',
        width: 130,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({ value }) => (
          <Typography variant="body2" sx={{ fontWeight: 700, color: isOrg ? 'warning.main' : 'primary.main' }}>
            {value || '—'}
          </Typography>
        )
      },
      {
        field: 'accountNumber',
        headerName: isOrg ? 'Tashkilot Hisob Raqami' : 'Chiqindi Hisob Raqami',
        width: 170,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({ value }) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {value || '—'}
          </Typography>
        )
      },
      {
        field: 'phone',
        headerName: 'Telefon raqami',
        width: 160,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({ value }) => <Typography variant="body2">{formatPhone(value)}</Typography>
      },
      {
        field: 'debtAmount',
        headerName: "Qarzdorlik (so'm)",
        width: 150,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({ value }) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
            {formatCurrency(value)}
          </Typography>
        )
      },
      {
        field: 'status',
        headerName: 'SMS Holati',
        width: 150,
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
        }
      },
      {
        field: 'createdAt',
        headerName: 'Yaratilgan sana',
        width: 150,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({ value }) => (
          <Typography variant="caption" color="text.secondary">
            {value ? new Date(value).toLocaleString('uz-UZ') : '—'}
          </Typography>
        )
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
        )
      },
      {
        field: 'actions',
        headerName: 'Amallar',
        width: 90,
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
        )
      }
    ];
  }, [isOrg, dataGridProps.paginationModel?.page, dataGridProps.paginationModel?.pageSize, dataGridProps.rows, rowRefreshLoading]);

  return (
    <MainCard contentSX={{ padding: 1.5 }}>
      <ImportSmsModal
        open={openImportModal}
        mode={isOrg ? 'organization' : 'individual'}
        onClose={() => setOpenImportModal(false)}
        onSave={handleImport}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* 1. COMPACT TOP HEADER & STATS BAR */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{
            justifyContent: 'space-between',
            alignItems: { md: 'center' },
            gap: 1.5,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          {/* Tab Selector */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              minHeight: 38,
              '& .MuiTab-root': { fontWeight: 700, fontSize: '0.875rem', py: 0.5, minHeight: 38 }
            }}
          >
            <Tab icon={<PeopleAltOutlined sx={{ fontSize: 18 }} />} iconPosition="start" label="👨‍👩‍👧‍👦 Aholi" value="INDIVIDUAL_DEBT" />
            <Tab icon={<BusinessOutlined sx={{ fontSize: 18 }} />} iconPosition="start" label="🏢 Tashkilotlar" value="ORGANIZATION_DEBT" />
          </Tabs>

          {/* Mini Statistics Badges & Main Action Buttons */}
          <Stack direction="row" spacing={0.75} sx={{ mr: 1, alignItems: 'center' }}>
            <Chip
              icon={<CheckCircleOutlined sx={{ fontSize: '16px !important' }} />}
              label={`Yetkazildi: ${stats.sent.toLocaleString()}`}
              color="success"
              size="small"
              variant="filled"
              sx={{ fontWeight: 700, fontSize: '0.75rem', height: 26 }}
            />
            <Chip
              icon={<HourglassEmptyOutlined sx={{ fontSize: '16px !important' }} />}
              label={`Kutilmoqda: ${stats.pending.toLocaleString()}`}
              color="warning"
              size="small"
              variant="filled"
              sx={{ fontWeight: 700, fontSize: '0.75rem', height: 26 }}
            />
            <Chip
              icon={<ErrorOutlineOutlined sx={{ fontSize: '16px !important' }} />}
              label={`Yetkazilmadi: ${stats.failed.toLocaleString()}`}
              color="error"
              size="small"
              variant="filled"
              sx={{ fontWeight: 700, fontSize: '0.75rem', height: 26 }}
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <Tooltip title={`Excel faylidan yangi ${isOrg ? 'tashkilotlar' : 'aholi'} ro'yxatini yuklash va SMS yuborish`}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<UploadFileOutlined fontSize="small" />}
                onClick={() => setOpenImportModal(true)}
                disabled={loading}
                sx={{ textTransform: 'none', fontWeight: 600, px: 1.5 }}
              >
                Excel Yuborish
              </Button>
            </Tooltip>

            <Tooltip title={`Joriy ${isOrg ? 'tashkilotlar' : 'aholi'} SMS ogohlantirishlar ro'yxatini Excelga yuklab olish`}>
              <Button
                variant="outlined"
                color="success"
                size="small"
                startIcon={<DownloadOutlined fontSize="small" />}
                onClick={handleClickExport}
                sx={{ textTransform: 'none', fontWeight: 600, px: 1.5 }}
              >
                Excelga Yuklash
              </Button>
            </Tooltip>

            <Tooltip title="Fondagi kutilayotgan SMSlar holatini Eskiz orqali avtomatik tekshirish jobini ishga tushirish">
              <span>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={jobTriggerLoading ? <CircularProgress size={14} color="inherit" /> : <SyncOutlined fontSize="small" />}
                  onClick={handleTriggerJob}
                  disabled={Boolean(activeJob) || jobTriggerLoading}
                  sx={{ textTransform: 'none', fontWeight: 600, px: 1.5 }}
                >
                  Yangilash (Job)
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Live Progress Widget */}
        {activeJob && (
          <Paper
            elevation={0}
            sx={{ p: 1.25, bgcolor: 'secondary.light', border: '1px solid', borderColor: 'secondary.main', borderRadius: 1.5 }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'secondary.dark', fontSize: '0.8rem' }}>
                ⚙️ {activeJob.name}
              </Typography>
              <Chip
                label={`${activeJob.progress}%`}
                size="small"
                color="secondary"
                sx={{ fontWeight: 700, height: 18, fontSize: '0.7rem' }}
              />
            </Stack>
            <LinearProgress
              variant="determinate"
              value={activeJob.progress}
              color="secondary"
              sx={{ height: 5, borderRadius: 2.5, my: 0.5 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {activeJob.message}
            </Typography>
          </Paper>
        )}

        {/* 2. COMPACT INLINE FILTERS TOOLBAR */}
        <Paper
          elevation={0}
          sx={{ p: 1.25, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Hisob raqam yoki Telefon..."
              value={draftFilters.search}
              onChange={(e) => setDraftFilters((p) => ({ ...p, search: e.target.value }))}
              sx={{ minWidth: 200, flex: 1, '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
              slotProps={{
                input: {
                  startAdornment: <SearchOutlined fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                }
              }}
            />

            <TextField
              size="small"
              placeholder="Telefon (masalan: 901234567)"
              value={draftFilters.phone}
              onChange={(e) => setDraftFilters((p) => ({ ...p, phone: e.target.value }))}
              sx={{ minWidth: 150, '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
            />

            <TextField
              size="small"
              placeholder="Hisob raqam"
              value={draftFilters.accountNumber}
              onChange={(e) => setDraftFilters((p) => ({ ...p, accountNumber: e.target.value }))}
              sx={{ minWidth: 130, '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
            />

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ fontSize: '0.85rem' }}>SMS Holati</InputLabel>
              <Select
                value={draftFilters.status}
                label="SMS Holati"
                onChange={(e) => setDraftFilters((p) => ({ ...p, status: e.target.value }))}
                sx={{ fontSize: '0.85rem' }}
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
              label="Dan"
              value={draftFilters.startDate}
              onChange={(e) => setDraftFilters((p) => ({ ...p, startDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 135, '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
            />

            <TextField
              size="small"
              type="date"
              label="Gacha"
              value={draftFilters.endDate}
              onChange={(e) => setDraftFilters((p) => ({ ...p, endDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 135, '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
            />

            <Stack direction="row" spacing={0.75}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleApplyFilters}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Qo'llash
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={handleResetFilters}
                startIcon={<ClearOutlined fontSize="small" />}
                sx={{ textTransform: 'none' }}
              >
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
          rowHeight={48}
          loading={loading}
          sx={{ flex: 1, minHeight: 480, border: 'none' }}
        />
      </Box>
    </MainCard>
  );
}

export default SmsWarnings;
