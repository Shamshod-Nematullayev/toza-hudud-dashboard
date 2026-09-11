import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  useTheme,
  alpha,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack,
  FileDownloadOutlined as FileDownloadIcon,
  RefreshOutlined as RefreshIcon,
  SearchOutlined as SearchIcon,
  ClearOutlined as ClearIcon,
  CheckCircle,
  Cancel,
  RadioButtonUnchecked,
  Brightness1
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from 'utils/api';
import MainCard from 'ui-component/cards/MainCard';
import { toast } from 'react-toastify';

export type PlanExecutionStatus = 'bajarildi' | 'bajarilmadi' | 'umuman_ishlanmadi' | 'yakshanba';

interface IDateColumn {
  date: string;
  day: number;
  month: number;
  year: number;
  monthName: string;
  dayOfWeek: number;
  dayName: string;
  isSunday: boolean;
  isToday: boolean;
}

interface IMonthGroup {
  month: number;
  year: number;
  monthName: string;
  count: number;
  colorIndex: number;
}

interface IDayDetail {
  status: PlanExecutionStatus;
  kunlikReja: number;
  bajarilishi: number;
  foiz: number;
  farqi: number;
}

interface IInspectorMatrixRow {
  inspectorId: number;
  inspectorName: string;
  days: Record<string, IDayDetail>;
  totalDays: number;
  bajarildiCount: number;
  bajarilmadiCount: number;
  umumanIshlanmadiCount: number;
  avgFoiz: number;
}

interface IMatrixResponse {
  fromDate: string;
  toDate: string;
  columns: IDateColumn[];
  monthGroups: IMonthGroup[];
  rows: IInspectorMatrixRow[];
}

// Pastel distinct color palettes for month header grouping
const MONTH_PALETTES = [
  { light: '#e0f2fe', dark: '#0c4a6e', textLight: '#0369a1', textDark: '#7dd3fc' }, // Sky
  { light: '#f3e8ff', dark: '#581c87', textLight: '#7e22ce', textDark: '#d8b4fe' }, // Purple
  { light: '#ecfdf5', dark: '#064e3b', textLight: '#047857', textDark: '#6ee7b7' }, // Emerald
  { light: '#fffbeb', dark: '#78350f', textLight: '#b45309', textDark: '#fcd34d' }  // Amber
];

export default function InspectorPlanMatrix() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  // Default from: today, to: today
  const [fromDate, setFromDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [data, setData] = useState<IMatrixResponse | null>(null);

  const fetchMatrix = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      try {
        const res = await api.get('/reports/inspector-daily-plan-matrix', {
          params: {
            fromDate,
            toDate,
            forceRefresh
          }
        });
        if (res.data?.ok && res.data?.data) {
          setData(res.data.data);
        }
      } catch (err: any) {
        console.error('Error fetching plan matrix:', err);
        toast.error(err.response?.data?.message || 'Matritsa hisobotini yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    },
    [fromDate, toDate]
  );

  useEffect(() => {
    fetchMatrix(false);
  }, [fetchMatrix]);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await api.get('/reports/inspector-daily-plan-matrix/excel', {
        params: { fromDate, toDate },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reja_matritsasi_${fromDate}_${toDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel fayl muvaffaqiyatli yuklandi');
    } catch (err: any) {
      console.error('Export error:', err);
      toast.error('Excel yuklashda xatolik yuz berdi');
    } finally {
      setExporting(false);
    }
  };

  // Filter rows by search term
  const filteredRows = useMemo(() => {
    if (!data?.rows) return [];
    if (!search.trim()) return data.rows;
    const q = search.toLowerCase().trim();
    return data.rows.filter((r) => r.inspectorName.toLowerCase().includes(q));
  }, [data?.rows, search]);

  // Overall statistics
  const summaryStats = useMemo(() => {
    if (!data?.rows || data.rows.length === 0) return null;
    const totalInspectors = data.rows.length;
    let totalBajarildi = 0;
    let totalBajarilmadi = 0;
    let totalUmumanIshlanmadi = 0;
    let totalDays = 0;

    for (const r of data.rows) {
      totalBajarildi += r.bajarildiCount;
      totalBajarilmadi += r.bajarilmadiCount;
      totalUmumanIshlanmadi += r.umumanIshlanmadiCount;
      totalDays += r.totalDays;
    }

    const overallPct =
      totalDays > 0 ? Math.round((totalBajarildi / totalDays) * 100 * 10) / 10 : 0;

    return {
      totalInspectors,
      totalBajarildi,
      totalBajarilmadi,
      totalUmumanIshlanmadi,
      overallPct
    };
  }, [data?.rows]);

  return (
    <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5 } }}>
      {/* Top Header */}
      <Box sx={{ mb: 2.5 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between'
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Tooltip title="Orqaga">
              <IconButton
                onClick={() => navigate('/billing/reports')}
                sx={{ border: `1px solid ${theme.palette.divider}` }}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Nazoratchilar: Kunlik reja matritsasi
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Har bir nazoratchining kunbay reja bajarish davomati va monitoringi
              </Typography>
            </Box>
          </Stack>

          {/* Top Actions */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
              onClick={() => fetchMatrix(true)}
              disabled={loading}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Qayta hisoblash
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={exporting ? <CircularProgress size={18} color="inherit" /> : <FileDownloadIcon />}
              onClick={handleExportExcel}
              disabled={exporting || loading}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Excel yuklash
            </Button>
          </Stack>
        </Stack>

        {/* Filter Toolbar */}
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.6) : alpha('#f8fafc', 0.8),
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            sx={{
              alignItems: { xs: 'stretch', lg: 'center' },
              justifyContent: 'space-between'
            }}
          >
            {/* Date Pickers & Search */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
            >
              <TextField
                type="date"
                label="Boshlanish"
                size="small"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true }
                }}
                sx={{ minWidth: 150 }}
              />
              <TextField
                type="date"
                label="Tugash"
                size="small"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true }
                }}
                sx={{ minWidth: 150 }}
              />
              <TextField
                size="small"
                placeholder="Nazoratchi qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearch('')}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }
                }}
                sx={{ minWidth: 200 }}
              />
            </Stack>

            {/* Legend / Holatlar Izohi */}
            <Stack
              direction="row"
              spacing={2}
              sx={{
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1.5,
                p: 1,
                borderRadius: 1.5,
                backgroundColor: isDark ? alpha('#000', 0.2) : '#ffffff',
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>✅</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Bajarildi (&gt;=100%)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>🟥</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Bajarilmadi (&lt;100%)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>⬛️</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Umuman ishlanmadi (0 so'm)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: 0.5,
                    backgroundColor: isDark ? alpha('#fff', 0.1) : '#f1f5f9',
                    border: `1px solid ${theme.palette.divider}`
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Yakshanba
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* KPI Overview Cards */}
      {summaryStats && (
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.7) : '#ffffff'
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                NAZORATCHILAR
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.5 }}>
                {summaryStats.totalInspectors} <Typography component="span" variant="caption">nafar</Typography>
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.7) : '#ffffff'
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                ✅ BAJARILGAN KUNLAR
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main', mt: 0.5 }}>
                {summaryStats.totalBajarildi} <Typography component="span" variant="caption">kun</Typography>
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.7) : '#ffffff'
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main' }}>
                🟥 BAJARILMAGAN KUNLAR
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'error.main', mt: 0.5 }}>
                {summaryStats.totalBajarilmadi} <Typography component="span" variant="caption">kun</Typography>
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.7) : '#ffffff'
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                ⬛️ ISHLANMAGAN KUNLAR
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.5 }}>
                {summaryStats.totalUmumanIshlanmadi} <Typography component="span" variant="caption">kun</Typography>
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Matrix Table */}
      {loading ? (
        <Box sx={{ py: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress color="secondary" />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Kunlik reja matritsasi yuklanmoqda...
          </Typography>
        </Box>
      ) : data?.columns && data.columns.length > 0 ? (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            maxHeight: 'calc(100vh - 280px)',
            overflow: 'auto',
            '&::-webkit-scrollbar': { width: 6, height: 6 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.text.primary, 0.15),
              borderRadius: 3
            }
          }}
        >
          <Table size="small" stickyHeader>
            {/* Two-Level Header: Months on top, Days below */}
            <TableHead>
              {/* Row 1: Months */}
              <TableRow>
                <TableCell
                  rowSpan={2}
                  sx={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 4,
                    width: 45,
                    minWidth: 45,
                    fontWeight: 700,
                    textAlign: 'center',
                    backgroundColor: theme.palette.background.paper,
                    borderRight: `1px solid ${theme.palette.divider}`
                  }}
                >
                  T/r
                </TableCell>
                <TableCell
                  rowSpan={2}
                  sx={{
                    position: 'sticky',
                    left: 45,
                    zIndex: 4,
                    minWidth: 200,
                    fontWeight: 700,
                    backgroundColor: theme.palette.background.paper,
                    borderRight: `2px solid ${theme.palette.divider}`
                  }}
                >
                  Nazoratchi F.I.Sh
                </TableCell>

                {/* Months grouping columns */}
                {data.monthGroups.map((mGroup, idx) => {
                  const palette = MONTH_PALETTES[mGroup.colorIndex % MONTH_PALETTES.length];
                  return (
                    <TableCell
                      key={`${mGroup.year}-${mGroup.month}`}
                      colSpan={mGroup.count}
                      align="center"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        py: 0.75,
                        backgroundColor: isDark ? palette.dark : palette.light,
                        color: isDark ? palette.textDark : palette.textLight,
                        borderRight: `2px solid ${theme.palette.divider}`,
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      {mGroup.monthName} {mGroup.year} ({mGroup.count} kun)
                    </TableCell>
                  );
                })}

                {/* Summary columns */}
                <TableCell
                  rowSpan={2}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    minWidth: 65,
                    backgroundColor: theme.palette.background.paper,
                    borderLeft: `2px solid ${theme.palette.divider}`
                  }}
                >
                  ✅ Reja
                </TableCell>
                <TableCell
                  rowSpan={2}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    minWidth: 65,
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  🟥 Kam
                </TableCell>
                <TableCell
                  rowSpan={2}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    minWidth: 65,
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  ⬛️ Chiqmagan
                </TableCell>
                <TableCell
                  rowSpan={2}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    minWidth: 70,
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  O'rtacha
                </TableCell>
              </TableRow>

              {/* Row 2: Days */}
              <TableRow>
                {data.columns.map((col) => {
                  return (
                    <TableCell
                      key={col.date}
                      align="center"
                      sx={{
                        px: 0.5,
                        py: 0.5,
                        minWidth: 42,
                        maxWidth: 42,
                        backgroundColor: col.isSunday
                          ? isDark
                            ? alpha('#fff', 0.05)
                            : '#f8fafc'
                          : col.isToday
                          ? alpha(theme.palette.secondary.main, 0.15)
                          : theme.palette.background.paper,
                        borderRight: `1px solid ${theme.palette.divider}`,
                        borderBottom: `2px solid ${theme.palette.divider}`
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          color: col.isSunday ? 'text.secondary' : col.isToday ? theme.palette.secondary.main : 'text.primary'
                        }}
                      >
                        {col.day}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          fontSize: '0.62rem',
                          color: col.isSunday ? 'error.main' : 'text.secondary',
                          fontWeight: col.isSunday ? 700 : 500
                        }}
                      >
                        {col.dayName}
                      </Typography>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            {/* Body */}
            <TableBody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row, rIdx) => (
                  <TableRow
                    key={row.inspectorId}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02)
                      }
                    }}
                  >
                    {/* T/r */}
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        textAlign: 'center',
                        fontWeight: 600,
                        color: 'text.secondary',
                        backgroundColor: theme.palette.background.paper,
                        borderRight: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      {rIdx + 1}
                    </TableCell>

                    {/* Inspector Name */}
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 45,
                        zIndex: 2,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        backgroundColor: theme.palette.background.paper,
                        borderRight: `2px solid ${theme.palette.divider}`
                      }}
                    >
                      {row.inspectorName}
                    </TableCell>

                    {/* Date Matrix Cells */}
                    {data.columns.map((col) => {
                      const dayData = row.days[col.date];

                      if (col.isSunday || dayData?.status === 'yakshanba') {
                        return (
                          <TableCell
                            key={col.date}
                            align="center"
                            sx={{
                              p: 0,
                              backgroundColor: isDark ? alpha('#fff', 0.03) : '#f8fafc',
                              borderRight: `1px solid ${theme.palette.divider}`
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                              —
                            </Typography>
                          </TableCell>
                        );
                      }

                      if (!dayData) {
                        return (
                          <TableCell
                            key={col.date}
                            align="center"
                            sx={{ p: 0, borderRight: `1px solid ${theme.palette.divider}` }}
                          >
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                              ?
                            </Typography>
                          </TableCell>
                        );
                      }

                      let icon = '⬛️';
                      let statusText = 'Umuman ishlanmadi (0 so‘m)';
                      if (dayData.status === 'bajarildi') {
                        icon = '✅';
                        statusText = 'Bajarildi';
                      } else if (dayData.status === 'bajarilmadi') {
                        icon = '🟥';
                        statusText = 'Bajarilmadi';
                      }

                      const tooltipContent = (
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {row.inspectorName} ({col.day} {col.monthName})
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Holat: <b>{statusText}</b>
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Kunlik reja: <b>{dayData.kunlikReja.toLocaleString()} so‘m</b>
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Bajarilishi: <b>{dayData.bajarilishi.toLocaleString()} so‘m</b>
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Foiz: <b>{dayData.foiz}%</b>
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Farqi: <b>{dayData.farqi > 0 ? `+${dayData.farqi.toLocaleString()}` : dayData.farqi.toLocaleString()} so‘m</b>
                          </Typography>
                        </Box>
                      );

                      return (
                        <Tooltip key={col.date} title={tooltipContent} arrow enterDelay={150}>
                          <TableCell
                            align="center"
                            sx={{
                              p: 0,
                              cursor: 'pointer',
                              borderRight: `1px solid ${theme.palette.divider}`,
                              backgroundColor: col.isToday ? alpha(theme.palette.secondary.main, 0.06) : 'transparent',
                              '&:hover': {
                                backgroundColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)
                              }
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '0.9rem',
                                lineHeight: 1,
                                display: 'inline-block',
                                userSelect: 'none'
                              }}
                            >
                              {icon}
                            </Typography>
                          </TableCell>
                        </Tooltip>
                      );
                    })}

                    {/* Summary Counters */}
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: 'success.main',
                        backgroundColor: isDark ? alpha(theme.palette.success.main, 0.08) : alpha(theme.palette.success.light, 0.15),
                        borderLeft: `2px solid ${theme.palette.divider}`
                      }}
                    >
                      {row.bajarildiCount}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: 'error.main',
                        backgroundColor: isDark ? alpha(theme.palette.error.main, 0.08) : alpha(theme.palette.error.light, 0.15)
                      }}
                    >
                      {row.bajarilmadiCount}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: 'text.secondary',
                        backgroundColor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.03)
                      }}
                    >
                      {row.umumanIshlanmadiCount}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={`${row.avgFoiz}%`}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          backgroundColor:
                            row.avgFoiz >= 100
                              ? alpha(theme.palette.success.main, 0.15)
                              : row.avgFoiz >= 60
                              ? alpha(theme.palette.warning.main, 0.15)
                              : alpha(theme.palette.error.main, 0.15),
                          color:
                            row.avgFoiz >= 100
                              ? theme.palette.success.main
                              : row.avgFoiz >= 60
                              ? theme.palette.warning.main
                              : theme.palette.error.main
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={data.columns.length + 6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Hech qanday ma'lumot topilmadi
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Tanlangan sana oralig'ida ma'lumotlar mavjud emas
          </Typography>
        </Box>
      )}
    </MainCard>
  );
}
