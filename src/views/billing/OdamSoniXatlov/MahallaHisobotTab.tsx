import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  alpha,
  useMediaQuery,
  Skeleton,
  Divider
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SimCardDownloadOutlinedIcon from '@mui/icons-material/SimCardDownloadOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import api from 'utils/api';

export interface IMahallaReportRow {
  id: string;
  mahallaId: string;
  mahallaName: string;
  inspectorName: string;
  totalRequests: number;
  pendingRequests: number;
  inDocumentRequests: number;
  confirmedRequests: number;
  canceledRequests: number;
  totalCurrentInhabitants: number;
  totalNewInhabitants: number;
  differenceInhabitants: number;
}

export interface IMahallaReportSummary {
  totalMahallas: number;
  totalRequests: number;
  pendingRequests: number;
  inDocumentRequests: number;
  confirmedRequests: number;
  canceledRequests: number;
  totalCurrentInhabitants: number;
  totalNewInhabitants: number;
  differenceInhabitants: number;
}

interface MahallaHisobotTabProps {
  onSelectMahalla?: (mahallaId: string) => void;
}

export const MahallaHisobotTab: React.FC<MahallaHisobotTabProps> = ({ onSelectMahalla }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<IMahallaReportRow[]>([]);
  const [summary, setSummary] = useState<IMahallaReportSummary>({
    totalMahallas: 0,
    totalRequests: 0,
    pendingRequests: 0,
    inDocumentRequests: 0,
    confirmedRequests: 0,
    canceledRequests: 0,
    totalCurrentInhabitants: 0,
    totalNewInhabitants: 0,
    differenceInhabitants: 0
  });

  // Filters: default to 'pending' as requested by user
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchText, setSearchText] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchText.trim()) params.search = searchText.trim();

      const { data } = await api.get('/yashovchi-soni-xatlov/reports/mahalla-summary', { params });
      if (data && data.ok) {
        setRows(data.data || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Hisobot ma\'lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [statusFilter, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport();
  };

  const handleResetFilters = () => {
    setStatusFilter('pending');
    setSearchText('');
    setStartDate('');
    setEndDate('');
  };

  // Excel (.xlsx) Export
  const handleExportExcel = () => {
    if (!rows.length) {
      return toast.warning('Eksport qilish uchun ma\'lumotlar mavjud emas');
    }

    const exportData = rows.map((r, i) => ({
      '№': i + 1,
      'Mahalla ID': r.mahallaId,
      'Mahalla nomi': r.mahallaName,
      'Biriktirilgan nazoratchi': r.inspectorName,
      'Jami so\'rovlar': r.totalRequests,
      'Kutilmoqda (Pending)': r.pendingRequests,
      'Dalolatnomada': r.inDocumentRequests,
      'Tasdiqlangan': r.confirmedRequests,
      'Bekor qilingan': r.canceledRequests,
      'Joriy aholi soni': r.totalCurrentInhabitants,
      'Yangi aniqlangan aholi': r.totalNewInhabitants,
      'Farq (+/-)': r.differenceInhabitants
    }));

    // Add summary row at the end
    exportData.push({
      '№': 'JAMI:',
      'Mahalla ID': '',
      'Mahalla nomi': `${summary.totalMahallas} ta mahalla`,
      'Biriktirilgan nazoratchi': '',
      'Jami so\'rovlar': summary.totalRequests,
      'Kutilmoqda (Pending)': summary.pendingRequests,
      'Dalolatnomada': summary.inDocumentRequests,
      'Tasdiqlangan': summary.confirmedRequests,
      'Bekor qilingan': summary.canceledRequests,
      'Joriy aholi soni': summary.totalCurrentInhabitants,
      'Yangi aniqlangan aholi': summary.totalNewInhabitants,
      'Farq (+/-)': summary.differenceInhabitants
    } as any);

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mahallalar_Xatlov_Hisoboti');

    const fileName = `xatlov_mahalla_hisoboti_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success('Hisobot Excel faylga muvaffaqiyatli yuklandi');
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'index',
        headerName: '№',
        width: 60,
        renderCell: (params) => {
          const allRowIds = rows.map((r) => r.id);
          const idx = allRowIds.indexOf(params.row.id);
          return idx + 1;
        }
      },
      {
        field: 'mahallaId',
        headerName: 'ID',
        width: 80
      },
      {
        field: 'mahallaName',
        headerName: 'Mahalla nomi',
        minWidth: 180,
        flex: 1.2,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {params.value}
          </Typography>
        )
      },
      {
        field: 'inspectorName',
        headerName: 'Nazoratchi',
        minWidth: 160,
        flex: 1,
        renderCell: (params) => (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {params.value || '-'}
          </Typography>
        )
      },
      {
        field: 'totalRequests',
        headerName: 'Jami so\'rovlar',
        width: 120,
        type: 'number',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {params.value}
          </Typography>
        )
      },
      {
        field: 'pendingRequests',
        headerName: 'Kutilmoqda',
        width: 120,
        type: 'number',
        renderCell: (params) => {
          const val = params.value || 0;
          return val > 0 ? (
            <Chip
              label={val}
              size="small"
              color="warning"
              sx={{ fontWeight: 800, minWidth: 36, height: 24 }}
            />
          ) : (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              0
            </Typography>
          );
        }
      },
      {
        field: 'inDocumentRequests',
        headerName: 'Dalolatnomada',
        width: 120,
        type: 'number',
        renderCell: (params) => {
          const val = params.value || 0;
          return val > 0 ? (
            <Chip
              label={val}
              size="small"
              color="info"
              variant="outlined"
              sx={{ fontWeight: 700, minWidth: 36, height: 24 }}
            />
          ) : (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              0
            </Typography>
          );
        }
      },
      {
        field: 'confirmedRequests',
        headerName: 'Tasdiqlangan',
        width: 120,
        type: 'number',
        renderCell: (params) => {
          const val = params.value || 0;
          return val > 0 ? (
            <Chip
              label={val}
              size="small"
              color="success"
              sx={{ fontWeight: 700, minWidth: 36, height: 24 }}
            />
          ) : (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              0
            </Typography>
          );
        }
      },
      {
        field: 'canceledRequests',
        headerName: 'Bekor qilingan',
        width: 120,
        type: 'number',
        renderCell: (params) => {
          const val = params.value || 0;
          return val > 0 ? (
            <Chip
              label={val}
              size="small"
              color="error"
              variant="outlined"
              sx={{ fontWeight: 600, minWidth: 36, height: 24 }}
            />
          ) : (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              0
            </Typography>
          );
        }
      },
      {
        field: 'differenceInhabitants',
        headerName: 'Aholi farqi (+/-)',
        width: 130,
        type: 'number',
        renderCell: (params) => {
          const diff = params.value || 0;
          const isPositive = diff > 0;
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: isPositive ? 'success.main' : diff < 0 ? 'error.main' : 'text.secondary'
              }}
            >
              {isPositive ? `+${diff}` : diff}
            </Typography>
          );
        }
      },
      {
        field: 'actions',
        headerName: 'Amal',
        width: 130,
        sortable: false,
        renderCell: (params) =>
          onSelectMahalla ? (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              endIcon={<ArrowForwardOutlinedIcon fontSize="small" />}
              onClick={() => onSelectMahalla(params.row.mahallaId)}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                py: 0.3,
                px: 1
              }}
            >
              Xatlov
            </Button>
          ) : null
      }
    ],
    [rows, onSelectMahalla]
  );

  return (
    <Stack spacing={2.5}>
      {/* KPI Cards Summary Header */}
      <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <CardContent sx={{ p: { xs: 1.2, sm: 2 }, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: 36, sm: 44 },
                  height: { xs: 36, sm: 44 },
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1),
                  color: 'primary.main',
                  flexShrink: 0
                }}
              >
                <LocationCityOutlinedIcon fontSize={isMobile ? 'small' : 'medium'} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant={isMobile ? 'subtitle1' : 'h3'} sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {summary.totalRequests}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', fontSize: { xs: '0.68rem', sm: '0.75rem' } }} noWrap>
                  Jami ({summary.totalMahallas} MFY)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.4),
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <CardContent sx={{ p: { xs: 1.2, sm: 2 }, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: 36, sm: 44 },
                  height: { xs: 36, sm: 44 },
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.warning.main, isDark ? 0.2 : 0.1),
                  color: 'warning.main',
                  flexShrink: 0
                }}
              >
                <PendingActionsOutlinedIcon fontSize={isMobile ? 'small' : 'medium'} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant={isMobile ? 'subtitle1' : 'h3'} sx={{ fontWeight: 800, color: 'warning.main' }}>
                  {summary.pendingRequests}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', fontSize: { xs: '0.68rem', sm: '0.75rem' } }} noWrap>
                  Kutilmoqda
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <CardContent sx={{ p: { xs: 1.2, sm: 2 }, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: 36, sm: 44 },
                  height: { xs: 36, sm: 44 },
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.info.main, isDark ? 0.2 : 0.1),
                  color: 'info.main',
                  flexShrink: 0
                }}
              >
                <AssignmentOutlinedIcon fontSize={isMobile ? 'small' : 'medium'} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant={isMobile ? 'subtitle1' : 'h3'} sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {summary.inDocumentRequests}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', fontSize: { xs: '0.68rem', sm: '0.75rem' } }} noWrap>
                  Dalolatnomada
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <CardContent sx={{ p: { xs: 1.2, sm: 2 }, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: 36, sm: 44 },
                  height: { xs: 36, sm: 44 },
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.success.main, isDark ? 0.2 : 0.1),
                  color: 'success.main',
                  flexShrink: 0
                }}
              >
                <CheckCircleOutlinedIcon fontSize={isMobile ? 'small' : 'medium'} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant={isMobile ? 'subtitle1' : 'h3'} sx={{ fontWeight: 800, color: 'success.main' }}>
                  {summary.confirmedRequests}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', fontSize: { xs: '0.68rem', sm: '0.75rem' } }} noWrap>
                  Tasdiqlangan
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 2.4 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <CardContent sx={{ p: { xs: 1.2, sm: 2 }, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: 36, sm: 44 },
                  height: { xs: 36, sm: 44 },
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.secondary?.main || '#7c3aed', isDark ? 0.2 : 0.1),
                  color: theme.palette.secondary?.main || '#7c3aed',
                  flexShrink: 0
                }}
              >
                <GroupAddOutlinedIcon fontSize={isMobile ? 'small' : 'medium'} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant={isMobile ? 'subtitle1' : 'h3'} sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {summary.differenceInhabitants >= 0 ? `+${summary.differenceInhabitants}` : summary.differenceInhabitants}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', fontSize: { xs: '0.68rem', sm: '0.75rem' } }} noWrap>
                  Aholi o'zgarishi
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Toolbar */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1.5,
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Left Side: Status & Search & Dates */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1, alignItems: { xs: 'stretch', sm: 'center' } }}>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
            <InputLabel id="status-select-label">Status bo'yicha</InputLabel>
            <Select
              labelId="status-select-label"
              label="Status bo'yicha"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="pending">
                <em>⏳ Kutilmoqda</em>
              </MenuItem>
              <MenuItem value="all">
                🌐 Barcha statuslar
              </MenuItem>
              <MenuItem value="in_document">
                📑 Dalolatnomada
              </MenuItem>
              <MenuItem value="confirmed">
                ✅ Tasdiqlangan
              </MenuItem>
              <MenuItem value="canceled">
                ❌ Bekor qilingan
              </MenuItem>
            </Select>
          </FormControl>

          {/* Search Form */}
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <TextField
              size="small"
              fullWidth={isMobile}
              placeholder="Mahalla yoki nazoratchi..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                }
              }}
              sx={{ width: { xs: '100%', sm: 220 } }}
            />
            {searchText && (
              <IconButton size="small" onClick={() => { setSearchText(''); fetchReport(); }}>
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Stack>

        {/* Right Side: Refresh & Excel Export */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
          <Tooltip title="Filtrlarni tozalash">
            <Button
              variant="text"
              color="inherit"
              size="small"
              onClick={handleResetFilters}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Tozalash
            </Button>
          </Tooltip>

          <Tooltip title="Yangilash">
            <IconButton color="primary" size="small" onClick={fetchReport} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            color="success"
            size={isMobile ? 'small' : 'medium'}
            startIcon={<SimCardDownloadOutlinedIcon />}
            onClick={handleExportExcel}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            Excelga yuklab olish
          </Button>
        </Stack>
      </Paper>

      {/* Mobil Ko'rinish (Mahalla Hisoboti Kartalari) */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {loading ? (
          <Stack spacing={1.5}>
            {Array.from(new Array(4)).map((_, idx) => (
              <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Skeleton width="60%" height={24} sx={{ mb: 1 }} />
                <Skeleton width="40%" height={18} sx={{ mb: 1 }} />
                <Skeleton width="100%" height={36} />
              </Paper>
            ))}
          </Stack>
        ) : rows.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Hisobot ma'lumotlari topilmadi
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Tanlangan parametrlar bo'yicha ma'lumot mavjud emas
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1.5}>
            {rows.map((row) => (
              <Paper
                key={row.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  borderColor: row.pendingRequests > 0 ? alpha(theme.palette.warning.main, 0.4) : 'divider'
                }}
              >
                <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }} noWrap>
                      {row.mahallaName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Nazoratchi: {row.inspectorName || '—'}
                    </Typography>
                  </Box>

                  {onSelectMahalla && (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowForwardOutlinedIcon />}
                      onClick={() => onSelectMahalla(row.mahallaId)}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', py: 0.4 }}
                    >
                      Xatlov
                    </Button>
                  )}
                </Stack>

                <Divider sx={{ my: 0.8 }} />

                {/* 3 Ustunli statistika */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.68rem' }}>
                      Jami so'rov
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
                      {row.totalRequests}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.68rem' }}>
                      Kutilmoqda
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.85rem', color: row.pendingRequests > 0 ? 'warning.main' : 'text.disabled' }}>
                      {row.pendingRequests}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.68rem' }}>
                      Aholi farqi
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        color: row.differenceInhabitants > 0 ? 'success.main' : row.differenceInhabitants < 0 ? 'error.main' : 'text.secondary'
                      }}
                    >
                      {row.differenceInhabitants >= 0 ? `+${row.differenceInhabitants}` : row.differenceInhabitants}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      {/* Main DataGrid (Desktop) */}
      <Paper
        variant="outlined"
        sx={{
          height: '65vh',
          width: '100%',
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          display: { xs: 'none', md: 'block' }
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 }
            }
          }}
          pageSizeOptions={[15, 25, 50, 100]}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: isDark ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.primary.main, 0.04),
              fontWeight: 700
            }
          }}
        />
      </Paper>
    </Stack>
  );
};

export default MahallaHisobotTab;
