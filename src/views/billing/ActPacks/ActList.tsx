import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  FileDownload as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from 'utils/api';
import useCustomizationStore from 'store/customizationStore';
import MainCard from 'ui-component/cards/MainCard';

interface ActItem {
  id: number;
  actNumber: string;
  actStatus: string;
  actType: string;
  amount: number;
  amountWithQQS?: number;
  amountWithoutQQS?: number;
  accountNumber: string;
  residentFullName?: string;
  inhabitantCount?: number;
  oldInhabitantCount?: number;
  fileId?: number | string;
  createdDate?: string;
  period?: string;
  [key: string]: any;
}

const statusMap: Record<string, { label: string; lightBg: string; lightColor: string; darkBg: string; darkColor: string }> = {
  NEW: { label: 'Yangi', lightBg: '#eff6ff', lightColor: '#1d4ed8', darkBg: 'rgba(59, 130, 246, 0.15)', darkColor: '#60a5fa' },
  CONFIRMED: { label: 'Tasdiqlangan', lightBg: '#f0fdf4', lightColor: '#15803d', darkBg: 'rgba(34, 197, 94, 0.15)', darkColor: '#4ade80' },
  REJECTED: { label: 'Bekor qilingan', lightBg: '#fef2f2', lightColor: '#b91c1c', darkBg: 'rgba(239, 68, 68, 0.15)', darkColor: '#f87171' },
  CANCELLED: { label: 'Bekor qilingan', lightBg: '#fef2f2', lightColor: '#b91c1c', darkBg: 'rgba(239, 68, 68, 0.15)', darkColor: '#f87171' }
};

const actTypeMap: Record<string, { label: string; lightColor: string; darkColor: string }> = {
  DEBIT: { label: 'Debitorlik', lightColor: '#c2410c', darkColor: '#fb923c' },
  CREDIT: { label: 'Kreditorlik', lightColor: '#0284c7', darkColor: '#38bdf8' }
};

const ActList: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { packId } = useParams<{ packId: string }>();
  const { company } = useCustomizationStore();

  const [loading, setLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<ActItem[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [actTypeFilter, setActTypeFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  // Pagination
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25
  });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedActToDelete, setSelectedActToDelete] = useState<ActItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Notifications
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchActs = async () => {
    if (!packId) return;
    setLoading(true);
    try {
      const params: Record<string, any> = {
        packId,
        page: paginationModel.page,
        size: paginationModel.pageSize,
        companyId: company?.id
      };
      if (statusFilter) params.status = statusFilter;
      if (actTypeFilter) params.actType = actTypeFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchText.trim()) params.search = searchText.trim();

      const { data } = await api.get('/acts', { params });
      if (data && Array.isArray(data.content)) {
        setRows(data.content);
        setTotalElements(data.totalElements ?? data.content.length);
      } else if (Array.isArray(data)) {
        setRows(data);
        setTotalElements(data.length);
      } else {
        setRows([]);
        setTotalElements(0);
      }
    } catch (err: any) {
      console.error('Error fetching acts:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Aktlarni yuklashda xatolik yuz berdi',
        severity: 'error'
      });
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActs();
  }, [packId, paginationModel.page, paginationModel.pageSize, statusFilter, actTypeFilter, company?.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    fetchActs();
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setActTypeFilter('');
    setStartDate('');
    setEndDate('');
    setSearchText('');
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  // Delete action
  const confirmDelete = async () => {
    if (!selectedActToDelete) return;
    setDeleteLoading(true);
    try {
      const { data } = await api.delete(`/acts/${selectedActToDelete.id}`);
      setSnackbar({
        open: true,
        message: data?.message || "Akt muvaffaqiyatli o'chirildi",
        severity: 'success'
      });
      setDeleteModalOpen(false);
      setSelectedActToDelete(null);
      fetchActs();
    } catch (err: any) {
      console.error('Error deleting act:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Aktni o'chirishda xatolik yuz berdi",
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!rows.length) return;
    const exportData = rows.map((r) => ({
      ID: r.id,
      'Akt raqami': r.actNumber,
      Holat: statusMap[r.actStatus]?.label || r.actStatus,
      Turi: actTypeMap[r.actType]?.label || r.actType,
      Summa: r.amount,
      'QQS bilan': r.amountWithQQS ?? r.amount,
      'QQS siz': r.amountWithoutQQS ?? r.amount,
      'Hisob raqami': r.accountNumber,
      'Abonent F.I.Sh': r.residentFullName || '-',
      'Aholi soni': r.inhabitantCount ?? '-',
      'Eski aholi soni': r.oldInhabitantCount ?? '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Aktlar');
    XLSX.writeFile(wb, `Aktlar_pachka_${packId}.xlsx`);
  };

  // PDF download
  const handleDownloadPdf = (fileId: number | string) => {
    const baseUrl = api.defaults.baseURL || '';
    window.open(`${baseUrl}/acts/pdf?fileId=${fileId}`, '_blank');
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
        renderCell: (params) => (
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
            {params.value}
          </Typography>
        )
      },
      {
        field: 'actNumber',
        headerName: 'Akt raqami',
        width: 130,
        renderCell: (params) => (
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>
            {params.value || '-'}
          </Typography>
        )
      },
      {
        field: 'actStatus',
        headerName: 'Holati',
        width: 130,
        renderCell: (params) => {
          const s = statusMap[params.value];
          const label = s ? s.label : params.value;
          const bg = s ? (isDark ? s.darkBg : s.lightBg) : (isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9');
          const color = s ? (isDark ? s.darkColor : s.lightColor) : 'text.primary';
          return (
            <Chip
              label={label}
              size="small"
              sx={{
                backgroundColor: bg,
                color,
                fontWeight: 600,
                fontSize: '0.75rem',
                borderRadius: '6px'
              }}
            />
          );
        }
      },
      {
        field: 'actType',
        headerName: 'Turi',
        width: 130,
        renderCell: (params) => {
          const t = actTypeMap[params.value];
          const label = t ? t.label : params.value;
          const color = t ? (isDark ? t.darkColor : t.lightColor) : 'text.primary';
          return (
            <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color }}>
              {label}
            </Typography>
          );
        }
      },
      {
        field: 'amount',
        headerName: 'Summasi',
        width: 130,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>
            {Number(params.value || 0).toLocaleString('uz-UZ')}
          </Typography>
        )
      },
      {
        field: 'amountWithQQS',
        headerName: 'QQS bilan',
        width: 130,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            {Number(params.value || params.row.amount || 0).toLocaleString('uz-UZ')}
          </Typography>
        )
      },
      {
        field: 'amountWithoutQQS',
        headerName: 'QQS siz',
        width: 130,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            {Number(params.value || params.row.amount || 0).toLocaleString('uz-UZ')}
          </Typography>
        )
      },
      {
        field: 'accountNumber',
        headerName: 'Hisob raqami',
        width: 140,
        renderCell: (params) => (
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: isDark ? '#38bdf8' : '#0369a1'
            }}
          >
            {params.value}
          </Typography>
        )
      },
      {
        field: 'residentFullName',
        headerName: 'Abonent F.I.Sh',
        flex: 1.5,
        minWidth: 180,
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.primary', fontWeight: 500 }}>
            {params.value || '-'}
          </Typography>
        )
      },
      {
        field: 'inhabitantCount',
        headerName: 'Aholi soni',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.875rem', color: 'text.primary' }}>{params.value ?? '-'}</Typography>
        )
      },
      {
        field: 'oldInhabitantCount',
        headerName: 'Eski aholi',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{params.value ?? '-'}</Typography>
        )
      },
      {
        field: 'actions',
        headerName: 'Amallar',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => {
          const isNew = params.row.actStatus === 'NEW' || params.row.actStatus === 'Yangi';
          return (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
              {params.row.fileId && (
                <Tooltip title="PDF yuklab olish">
                  <IconButton
                    size="small"
                    onClick={() => handleDownloadPdf(params.row.fileId)}
                    sx={{ color: isDark ? '#f87171' : '#dc2626' }}
                  >
                    <PdfIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              {isNew && (
                <Tooltip title="Aktni o'chirish (TozaMakondan va bazadan)">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedActToDelete(params.row);
                      setDeleteModalOpen(true);
                    }}
                    sx={{
                      color: isDark ? '#f87171' : '#ef4444',
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : '#fecaca',
                      borderRadius: '6px',
                      p: '4px',
                      '&:hover': {
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2'
                      }
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          );
        }
      }
    ],
    [isDark]
  );

  return (
    <Box sx={{ width: '100%', p: { xs: 1, md: 2 } }}>
      {/* Top Header Breadcrumbs & Actions */}
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/billing/act-packs')}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              color: 'text.secondary',
              borderColor: 'divider',
              fontWeight: 600,
              '&:hover': { borderColor: 'text.secondary', backgroundColor: 'action.hover' }
            }}
          >
            Ortga
          </Button>
          <Typography sx={{ color: 'text.secondary', fontSize: '1rem', fontWeight: 500 }}>
            Jismoniy abonentlar
          </Typography>
          <Typography sx={{ color: 'text.disabled', fontSize: '1rem' }}>/</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '1rem', fontWeight: 500 }}>
            Aktlar pachkasi #{packId}
          </Typography>
          <Typography sx={{ color: 'text.disabled', fontSize: '1rem' }}>/</Typography>
          <Typography sx={{ color: 'text.primary', fontSize: '1.125rem', fontWeight: 700 }}>
            Aktlar
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<ExcelIcon />}
            onClick={handleExportExcel}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              backgroundColor: isDark ? '#047857' : '#16a34a',
              color: '#ffffff',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': { backgroundColor: isDark ? '#065f46' : '#15803d' }
            }}
          >
            Excel
          </Button>
          <Tooltip title="Yangilash">
            <IconButton
              size="small"
              onClick={fetchActs}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                color: 'text.secondary',
                p: '6px'
              }}
            >
              <RefreshIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Filter Bar */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px',
          backgroundColor: isDark ? 'background.default' : '#ffffff'
        }}
      >
        <Box component="form" onSubmit={handleSearchSubmit}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1.5
            }}
          >
            {/* Status filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: '8px',
                  backgroundColor: 'background.paper',
                  color: 'text.primary',
                  fontSize: '0.875rem'
                }}
              >
                <MenuItem value="">Holat: Barchasi</MenuItem>
                <MenuItem value="NEW">Yangi</MenuItem>
                <MenuItem value="CONFIRMED">Tasdiqlangan</MenuItem>
                <MenuItem value="REJECTED">Bekor qilingan</MenuItem>
              </Select>
            </FormControl>

            {/* Act Type filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={actTypeFilter}
                onChange={(e) => setActTypeFilter(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: '8px',
                  backgroundColor: 'background.paper',
                  color: 'text.primary',
                  fontSize: '0.875rem'
                }}
              >
                <MenuItem value="">Turi: Barchasi</MenuItem>
                <MenuItem value="DEBIT">Debitorlik</MenuItem>
                <MenuItem value="CREDIT">Kreditorlik</MenuItem>
              </Select>
            </FormControl>

            {/* Start Date */}
            <TextField
              size="small"
              type="date"
              label="Boshlanish sanasi"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 170, backgroundColor: 'background.paper' }}
            />

            {/* End Date */}
            <TextField
              size="small"
              type="date"
              label="Tugash sanasi"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 170, backgroundColor: 'background.paper' }}
            />

            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Qidiruv (hisob raqam, ism...)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 0.5 }} />
                }
              }}
              sx={{ width: 220, backgroundColor: 'background.paper' }}
            />

            <Button
              type="submit"
              variant="contained"
              size="small"
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                px: 2,
                py: 0.8,
                backgroundColor: 'primary.main',
                fontWeight: 600,
                boxShadow: 'none'
              }}
            >
              Qidirish
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={handleResetFilters}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                px: 1.5,
                py: 0.8,
                borderColor: 'divider',
                color: 'text.secondary'
              }}
            >
              Tozalash
            </Button>
          </Stack>
        </Box>
      </Card>

      {/* Main Table */}
      <MainCard content={false} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <Box sx={{ width: '100%', height: 600 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            rowCount={totalElements}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[15, 25, 50, 100]}
            disableRowSelectionOnClick
            rowHeight={48}
            sx={{
              border: 'none',
              backgroundColor: 'background.paper',
              color: 'text.primary',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: isDark ? 'background.default' : '#f8fafc',
                borderBottom: '2px solid',
                borderColor: 'divider',
                color: 'text.secondary',
                fontSize: '0.8125rem',
                fontWeight: 700
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                color: 'text.secondary',
                fontWeight: 700
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderColor: 'divider',
                color: 'text.primary'
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc'
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid',
                borderColor: 'divider',
                color: 'text.secondary'
              },
              '& .MuiTablePagination-root': {
                color: 'text.secondary'
              }
            }}
          />
        </Box>
      </MainCard>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => !deleteLoading && setDeleteModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Aktni o'chirishni tasdiqlang
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary', fontSize: '0.925rem', mb: 1 }}>
            Haqiqatan ham ushbu aktni o'chirmoqchimisiz?
          </DialogContentText>
          {selectedActToDelete && (
            <Box
              sx={{
                p: 1.5,
                backgroundColor: 'background.default',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                Akt ID: <b>{selectedActToDelete.id}</b>
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                Hisob raqam: <b>{selectedActToDelete.accountNumber}</b>
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                Abonent: <b>{selectedActToDelete.residentFullName || '-'}</b>
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                Summa: <b>{Number(selectedActToDelete.amount || 0).toLocaleString('uz-UZ')} so'm</b>
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'error.main', mt: 1, fontWeight: 500 }}>
                Ushbu akt TozaMakon tizimidan va lokal ma'lumotlar bazasidan butunlay o'chiriladi.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteModalOpen(false)}
            disabled={deleteLoading}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              backgroundColor: 'error.main',
              fontWeight: 600,
              boxShadow: 'none'
            }}
          >
            {deleteLoading ? "O'chirilmoqda..." : "Ha, o'chirish"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '8px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ActList;
