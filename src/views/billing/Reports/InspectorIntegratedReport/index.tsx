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
  Chip,
  CircularProgress,
  IconButton,
  useTheme,
  alpha,
  Tooltip,
  InputAdornment,
  Collapse
} from '@mui/material';
import {
  ArrowBack,
  FileDownloadOutlined as FileDownloadIcon,
  RefreshOutlined as RefreshIcon,
  SearchOutlined as SearchIcon,
  ClearOutlined as ClearIcon,
  ContentCopyOutlined as CopyIcon,
  TuneOutlined as FilterSettingsIcon,
  CheckCircleOutlined,
  AssignmentTurnedIn,
  AttachMoney,
  PersonOutlined,
  EventBusy
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from 'utils/api';
import MainCard from 'ui-component/cards/MainCard';
import { toast } from 'react-toastify';

export interface IDateColumn {
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

export interface IMonthGroup {
  month: number;
  year: number;
  monthName: string;
  count: number;
  colorIndex: number;
}

export interface IIntegratedDayDetail {
  status: 'bajarildi' | 'bajarilmadi' | 'umuman_ishlanmadi' | 'yakshanba';
  pass: boolean;
  reason: string;
  kunlikReja: number;
  bajarilishi: number;
  foiz: number;
  tasks: number;
  isAbsent: boolean;
}

export interface IIntegratedInspectorRow {
  inspectorId: number;
  inspectorName: string;
  days: Record<string, IIntegratedDayDetail>;
  totalDays: number;
  okDays: number;
  failDays: number;
  absentDays: number;
  totalTushum: number;
  totalTasks: number;
  grade: 'Аъло' | 'Яхши' | 'Ўртача' | 'Суст' | 'Балласт';
  gradeColor: string;
}

export interface IIntegratedResponse {
  fromDate: string;
  toDate: string;
  rules: {
    minTasksNoIncome: number;
    minTasksWithIncome: number;
    incomeThreshold: number;
  };
  summary: {
    totalInspectors: number;
    grandTushum: number;
    grandTasks: number;
    grandOkDays: number;
    grandAbsentDays: number;
  };
  columns: IDateColumn[];
  monthGroups: IMonthGroup[];
  rows: IIntegratedInspectorRow[];
  topLeaders: IIntegratedInspectorRow[];
  criticalList: IIntegratedInspectorRow[];
}

const MONTH_PALETTES = [
  { light: '#e0f2fe', dark: '#0c4a6e', textLight: '#0369a1', textDark: '#7dd3fc' },
  { light: '#f3e8ff', dark: '#581c87', textLight: '#7e22ce', textDark: '#d8b4fe' },
  { light: '#ecfdf5', dark: '#064e3b', textLight: '#047857', textDark: '#6ee7b7' },
  { light: '#fffbeb', dark: '#78350f', textLight: '#b45309', textDark: '#fcd34d' }
];

export default function InspectorIntegratedReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  // Default date: Last 7 days
  const [fromDate, setFromDate] = useState<string>(dayjs().subtract(6, 'day').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'leaders' | 'passed' | 'critical'>('all');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Evaluation Rule Thresholds
  const [minTasksNoIncome, setMinTasksNoIncome] = useState<number>(30);
  const [minTasksWithIncome, setMinTasksWithIncome] = useState<number>(20);
  const [incomeThreshold, setIncomeThreshold] = useState<number>(500000);

  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [data, setData] = useState<IIntegratedResponse | null>(null);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      try {
        const res = await api.get('/reports/inspector-integrated-analysis', {
          params: {
            fromDate,
            toDate,
            forceRefresh,
            minTasksNoIncome,
            minTasksWithIncome,
            incomeThreshold
          }
        });
        if (res.data?.ok && res.data?.data) {
          setData(res.data.data);
        }
      } catch (err: any) {
        console.error('Error fetching integrated analysis:', err);
        toast.error(err.response?.data?.error || 'Hisobotni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    },
    [fromDate, toDate, minTasksNoIncome, minTasksWithIncome, incomeThreshold]
  );

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Excel export
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await api.get('/reports/inspector-integrated-analysis/excel', {
        params: {
          fromDate,
          toDate,
          minTasksNoIncome,
          minTasksWithIncome,
          incomeThreshold
        },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Nazoratchilar_kompleks_tahlili_${fromDate}_${toDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel hisobot muvaffaqiyatli yuklab olindi');
    } catch (err: any) {
      console.error('Export error:', err);
      toast.error('Excel faylini yuklashda xatolik');
    } finally {
      setExporting(false);
    }
  };

  // Copy Telegram Formatted Report
  const handleCopyTelegramReport = () => {
    if (!data) return;

    const leadersText = data.topLeaders
      .slice(0, 5)
      .map(
        (l, i) =>
          `${i + 1}. ${l.inspectorName} — ${(l.totalTushum / 1e6).toFixed(1)} млн сўм (${l.okDays} кун ўтди) | ${l.totalTasks} та топшириқ`
      )
      .join('\n');

    const criticalText = data.criticalList
      .slice(0, 5)
      .map((c) => `• ${c.inspectorName} — ${c.absentDays} кун чиқмаган | ${c.totalTasks} та топшириқ`)
      .join('\n');

    const text = `📊 НАЗОРАТЧИЛАРНИНГ КОМПЛЕКС ҲИСОБОТИ (${dayjs(data.fromDate).format('DD.MM.YYYY')} – ${dayjs(data.toDate).format('DD.MM.YYYY')})

Талабларга асосан:
• Кунлик режа бажарилса — 100%+ қабул қилинди;
• Тушум 0 бўлганда камида ${data.rules.minTasksNoIncome} та махсус топшириқ шарт;
• Тушум ${Math.round(data.rules.incomeThreshold / 1000)} минг сўмдан ошганда камида ${data.rules.minTasksWithIncome} та топшириқ шарт.

Умумий натижалар:
💰 Жами тушум: ${(data.summary.grandTushum / 1e6).toFixed(1)} млн сўм
📋 Бажарилган махсус топшириқлар: ${data.summary.grandTasks} та
👥 Қабул қилинган иш кунлари: ${data.summary.grandOkDays} кишилик кун
⏳ Бой берилган кунлар: ${data.summary.grandAbsentDays} кишилик кун

🏆 ЭНГ ЯХШИ ТОП НАЗОРАТЧИЛАР:
${leadersText}

🚨 ИНТИЗОМИЙ ЧОРА КЎРИЛАДИГАНЛАР (ҚИЗИЛ РЎЙХАТ):
${criticalText}

Батафсил маълумот GreenZone биллинг тизими ҳисоботлар бўлимида.`;

    navigator.clipboard.writeText(text);
    toast.success('Телеграм ҳисобот матни нусхаланди!');
  };

  // Format money helper
  const fmtMoney = (n: number) => {
    if (!n || n === 0) return '0 сўм';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)} млн`;
    if (n >= 1000) return `${Math.round(n / 1000)} минг`;
    return `${n} сўм`;
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!data?.rows) return [];
    let list = [...data.rows];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.inspectorName.toLowerCase().includes(q));
    }

    // Tab filter
    if (activeTab === 'leaders') {
      list = list.filter((r) => r.grade === 'Аъло' || r.grade === 'Яхши');
    } else if (activeTab === 'passed') {
      list = list.filter((r) => r.okDays >= 1);
    } else if (activeTab === 'critical') {
      list = list.filter((r) => r.okDays === 0);
    }

    return list;
  }, [data?.rows, search, activeTab]);

  return (
    <MainCard content={false} sx={{ border: 'none', background: 'transparent' }}>
      {/* Top Header Card */}
      <Card
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(15, 23, 42, 0.06)',
          border: '1px solid',
          borderColor: isDark ? 'divider' : '#e2e8f0',
          background: isDark ? alpha(theme.palette.background.paper, 0.8) : '#ffffff'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={() => navigate('/billing/reports')} sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : '#f1f5f9' }} size="small">
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                Назоратчилар комплекс таҳлили
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                Тушум ва бажарилган махсус топшириқлар кесимида кунбай интеграциялашган баҳолаш
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <Button
              variant="outlined"
              color="primary"
              size="medium"
              startIcon={<FilterSettingsIcon />}
              onClick={() => setShowSettings(!showSettings)}
              sx={{ borderRadius: 2 }}
            >
              Қоидалар созламаси
            </Button>
            <Button
              variant="outlined"
              color="info"
              size="medium"
              startIcon={<CopyIcon />}
              onClick={handleCopyTelegramReport}
              disabled={!data}
              sx={{ borderRadius: 2 }}
            >
              Телеграм матни
            </Button>
            <Button
              variant="outlined"
              color="success"
              size="medium"
              startIcon={exporting ? <CircularProgress size={18} /> : <FileDownloadIcon />}
              onClick={handleExportExcel}
              disabled={exporting || !data}
              sx={{ borderRadius: 2 }}
            >
              Excel
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
              onClick={() => fetchData(true)}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              Янгилаш
            </Button>
          </Box>
        </Box>

        {/* Collapsible Threshold Settings */}
        <Collapse in={showSettings}>
          <Box sx={{ mt: 2.5, pt: 2.5, borderTop: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5 }}>
              ⚙️ Баҳолаш қоидалари ва чегаралар:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Тушум чиқмаганда минимал топшириқ"
                  value={minTasksNoIncome}
                  onChange={(e) => setMinTasksNoIncome(Number(e.target.value))}
                  helperText="Тушум 0 сўм бўлганда ўтиш учун керакли топшириқ"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Тушум чегараси (сўм)"
                  value={incomeThreshold}
                  onChange={(e) => setIncomeThreshold(Number(e.target.value))}
                  helperText="Етарли тушум деб баҳоланувчи минимал сумма"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Чегарадан ошганда минимал топшириқ"
                  value={minTasksWithIncome}
                  onChange={(e) => setMinTasksWithIncome(Number(e.target.value))}
                  helperText="Тушум чегарадан юқори бўлганда талаб этилувчи топшириқ"
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Filter Controls Bar */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: isDark ? 'divider' : '#f1f5f9' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Бошланиш санаси"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Тугаш санаси"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Назоратчи Ф.И.Ш. бўйича қидириш..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />
            </Grid>
          </Grid>

          {/* Quick Date Range Buttons & Category Tabs */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 1.5, mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant={fromDate === dayjs().subtract(6, 'day').format('YYYY-MM-DD') && toDate === dayjs().format('YYYY-MM-DD') ? 'contained' : 'outlined'}
                onClick={() => {
                  setFromDate(dayjs().subtract(6, 'day').format('YYYY-MM-DD'));
                  setToDate(dayjs().format('YYYY-MM-DD'));
                }}
              >
                Сўнгги 7 кун
              </Button>
              <Button
                size="small"
                variant={fromDate === dayjs().format('YYYY-MM-DD') && toDate === dayjs().format('YYYY-MM-DD') ? 'contained' : 'outlined'}
                onClick={() => {
                  setFromDate(dayjs().format('YYYY-MM-DD'));
                  setToDate(dayjs().format('YYYY-MM-DD'));
                }}
              >
                Бугун
              </Button>
              <Button
                size="small"
                variant={fromDate === dayjs().startOf('month').format('YYYY-MM-DD') && toDate === dayjs().format('YYYY-MM-DD') ? 'contained' : 'outlined'}
                onClick={() => {
                  setFromDate(dayjs().startOf('month').format('YYYY-MM-DD'));
                  setToDate(dayjs().format('YYYY-MM-DD'));
                }}
              >
                Шу ой
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Барчаси (${data?.rows?.length || 0})`}
                clickable
                color={activeTab === 'all' ? 'primary' : 'default'}
                variant={activeTab === 'all' ? 'filled' : 'outlined'}
                onClick={() => setActiveTab('all')}
              />
              <Chip
                label={`⭐ Етакчилар (${data?.rows?.filter((r) => r.grade === 'Аъло' || r.grade === 'Яхши').length || 0})`}
                clickable
                color={activeTab === 'leaders' ? 'success' : 'default'}
                variant={activeTab === 'leaders' ? 'filled' : 'outlined'}
                onClick={() => setActiveTab('leaders')}
              />
              <Chip
                label={`Бажарганлар (${data?.rows?.filter((r) => r.okDays >= 1).length || 0})`}
                clickable
                color={activeTab === 'passed' ? 'info' : 'default'}
                variant={activeTab === 'passed' ? 'filled' : 'outlined'}
                onClick={() => setActiveTab('passed')}
              />
              <Chip
                label={`🚨 Қизил рўйхат (${data?.rows?.filter((r) => r.okDays === 0).length || 0})`}
                clickable
                color={activeTab === 'critical' ? 'error' : 'default'}
                variant={activeTab === 'critical' ? 'filled' : 'outlined'}
                onClick={() => setActiveTab('critical')}
              />
            </Box>
          </Box>
        </Box>
      </Card>

      {/* KPI Summary Cards */}
      {data && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              sx={{
                p: 2.2,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: isDark ? 'divider' : '#e2e8f0',
                background: isDark ? alpha(theme.palette.background.paper, 0.8) : '#ffffff'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Жами тушум
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#0284c7', mt: 0.5 }}>
                    {(data.summary.grandTushum / 1e6).toFixed(1)} млн
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha('#0284c7', 0.1) }}>
                  <AttachMoney sx={{ color: '#0284c7' }} />
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              sx={{
                p: 2.2,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: isDark ? 'divider' : '#e2e8f0',
                background: isDark ? alpha(theme.palette.background.paper, 0.8) : '#ffffff'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Махсус топшириқлар
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#8b5cf6', mt: 0.5 }}>
                    {data.summary.grandTasks} та
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha('#8b5cf6', 0.1) }}>
                  <AssignmentTurnedIn sx={{ color: '#8b5cf6' }} />
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              sx={{
                p: 2.2,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: isDark ? 'divider' : '#e2e8f0',
                background: isDark ? alpha(theme.palette.background.paper, 0.8) : '#ffffff'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Қабул кунлар
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#10b981', mt: 0.5 }}>
                    {data.summary.grandOkDays} кун
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha('#10b981', 0.1) }}>
                  <CheckCircleOutlined sx={{ color: '#10b981' }} />
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              sx={{
                p: 2.2,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: isDark ? 'divider' : '#fecdd3',
                background: isDark ? alpha(theme.palette.background.paper, 0.8) : '#ffffff'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#be123c', textTransform: 'uppercase' }}>
                    Бой берилган
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#be123c', mt: 0.5 }}>
                    {data.summary.grandAbsentDays} кун
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha('#be123c', 0.1) }}>
                  <EventBusy sx={{ color: '#be123c' }} />
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              sx={{
                p: 2.2,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: isDark ? 'divider' : '#e2e8f0',
                background: isDark ? alpha(theme.palette.background.paper, 0.8) : '#ffffff'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Назоратчилар
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#475569', mt: 0.5 }}>
                    {data.summary.totalInspectors} нафар
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha('#64748b', 0.1) }}>
                  <PersonOutlined sx={{ color: '#64748b' }} />
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Matrix Table */}
      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: isDark ? 'divider' : '#cbd5e1',
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(15, 23, 42, 0.06)',
          overflow: 'hidden',
          background: isDark ? theme.palette.background.paper : '#ffffff'
        }}
      >
        <TableContainer sx={{ maxHeight: 720 }}>
          <Table stickyHeader size="small">
            <TableHead>
              {/* Row 1: Month Groups */}
              <TableRow>
                <TableCell
                  rowSpan={2}
                  sx={{
                    width: 50,
                    bgcolor: '#0f172a',
                    color: '#f8fafc',
                    fontWeight: 700,
                    fontSize: 13,
                    borderRight: '1px solid #334155',
                    textAlign: 'center',
                    zIndex: 10
                  }}
                >
                  Т/р
                </TableCell>
                <TableCell
                  rowSpan={2}
                  sx={{
                    minWidth: 220,
                    maxWidth: 260,
                    bgcolor: '#0f172a',
                    color: '#f8fafc',
                    fontWeight: 700,
                    fontSize: 13,
                    borderRight: '1px solid #334155',
                    zIndex: 10
                  }}
                >
                  Назоратчи Ф.И.Ш.
                </TableCell>

                {data?.monthGroups.map((mg, i) => {
                  const pal = MONTH_PALETTES[mg.colorIndex % MONTH_PALETTES.length];
                  return (
                    <TableCell
                      key={`mg-${i}`}
                      colSpan={mg.count}
                      align="center"
                      sx={{
                        bgcolor: isDark ? pal.dark : pal.light,
                        color: isDark ? pal.textDark : pal.textLight,
                        fontWeight: 700,
                        fontSize: 13,
                        borderRight: '1px solid #334155',
                        py: 0.8
                      }}
                    >
                      {mg.monthName} {mg.year}
                    </TableCell>
                  );
                })}

                <TableCell
                  rowSpan={2}
                  align="center"
                  sx={{ width: 65, bgcolor: '#0f172a', color: '#4ade80', fontWeight: 700, fontSize: 13, borderRight: '1px solid #334155', zIndex: 10 }}
                >
                  Ўтди
                </TableCell>
                <TableCell
                  rowSpan={2}
                  align="center"
                  sx={{ width: 65, bgcolor: '#0f172a', color: '#f87171', fontWeight: 700, fontSize: 13, borderRight: '1px solid #334155', zIndex: 10 }}
                >
                  Ўтмади
                </TableCell>
                <TableCell
                  rowSpan={2}
                  align="center"
                  sx={{ width: 65, bgcolor: '#0f172a', color: '#94a3b8', fontWeight: 700, fontSize: 13, borderRight: '1px solid #334155', zIndex: 10 }}
                >
                  Келмаган
                </TableCell>
                <TableCell
                  rowSpan={2}
                  align="right"
                  sx={{ width: 120, bgcolor: '#0f172a', color: '#fde047', fontWeight: 700, fontSize: 13, borderRight: '1px solid #334155', zIndex: 10 }}
                >
                  Жами тушум
                </TableCell>
                <TableCell
                  rowSpan={2}
                  align="center"
                  sx={{ width: 75, bgcolor: '#0f172a', color: '#c084fc', fontWeight: 700, fontSize: 13, borderRight: '1px solid #334155', zIndex: 10 }}
                >
                  Жами топ
                </TableCell>
                <TableCell
                  rowSpan={2}
                  align="center"
                  sx={{ width: 80, bgcolor: '#0f172a', color: '#f8fafc', fontWeight: 700, fontSize: 13, zIndex: 10 }}
                >
                  Баҳо
                </TableCell>
              </TableRow>

              {/* Row 2: Days */}
              <TableRow>
                {data?.columns.map((col) => (
                  <TableCell
                    key={col.date}
                    align="center"
                    sx={{
                      minWidth: 120,
                      bgcolor: col.isSunday ? (isDark ? '#1e293b' : '#f1f5f9') : isDark ? '#0f172a' : '#1e293b',
                      color: col.isSunday ? '#94a3b8' : '#38bdf8',
                      fontWeight: 700,
                      fontSize: 12,
                      borderRight: '1px solid #334155',
                      py: 0.8
                    }}
                  >
                    {col.day} ({col.dayName})
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={25} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={36} />
                    <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
                      Интеграциялашган ҳисобот маълумотлари таҳлил қилинмоқда...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={25} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      Танланган давр бўйича маълумот топилмади
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row, idx) => (
                  <TableRow
                    key={row.inspectorId}
                    hover
                    sx={{
                      bgcolor: idx % 2 === 0 ? (isDark ? alpha('#fff', 0.02) : '#ffffff') : isDark ? alpha('#fff', 0.04) : '#f8fafc',
                      '&:hover': {
                        bgcolor: isDark ? alpha('#fff', 0.08) : '#f1f5f9'
                      }
                    }}
                  >
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', borderRight: '1px solid', borderColor: 'divider' }}>
                      {idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', borderRight: '1px solid', borderColor: 'divider' }}>
                      {row.inspectorName}
                    </TableCell>

                    {/* Day Cells */}
                    {data?.columns.map((col) => {
                      const d = row.days[col.date];

                      if (col.isSunday) {
                        return (
                          <TableCell
                            key={col.date}
                            align="center"
                            sx={{ bgcolor: isDark ? alpha('#000', 0.2) : '#f8fafc', color: '#94a3b8', fontSize: 11, borderRight: '1px solid', borderColor: 'divider' }}
                          >
                            Якшанба
                          </TableCell>
                        );
                      }

                      let cellBg = isDark ? alpha('#ef4444', 0.15) : '#fee2e2';
                      let cellBorder = isDark ? alpha('#ef4444', 0.3) : '#fca5a5';
                      let tushumColor = isDark ? '#f87171' : '#991b1b';
                      let taskColor = isDark ? '#fca5a5' : '#b91c1c';
                      let tushumText = d ? fmtMoney(d.bajarilishi) : '0 сўм';
                      let taskText = d?.tasks ? `✗ ${d.tasks} та топ` : '✗ 0 топ';

                      if (d?.pass) {
                        cellBg = isDark ? alpha('#10b981', 0.15) : '#dcfce7';
                        cellBorder = isDark ? alpha('#10b981', 0.3) : '#86efac';
                        tushumColor = isDark ? '#34d399' : '#14532d';
                        taskColor = isDark ? '#6ee7b7' : '#166534';
                        taskText = d.tasks > 0 ? `✓ ${d.tasks} та топ` : `✓ Режа 100%`;
                      } else if (d?.isAbsent) {
                        cellBg = isDark ? alpha('#64748b', 0.1) : '#f1f5f9';
                        cellBorder = isDark ? alpha('#64748b', 0.2) : '#cbd5e1';
                        tushumColor = '#94a3b8';
                        taskColor = '#64748b';
                        tushumText = '0 сўм';
                        taskText = '— 0 топ';
                      }

                      return (
                        <TableCell
                          key={col.date}
                          align="center"
                          sx={{ p: 0.8, borderRight: '1px solid', borderColor: 'divider' }}
                        >
                          <Tooltip title={d?.reason || ''} arrow placement="top">
                            <Box
                              sx={{
                                py: 0.6,
                                px: 1,
                                borderRadius: 1.5,
                                bgcolor: cellBg,
                                border: '1px solid',
                                borderColor: cellBorder,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 700, color: tushumColor, fontSize: 12 }}>
                                {tushumText}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: taskColor, fontSize: 10 }}>
                                {taskText}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>
                      );
                    })}

                    {/* Summary columns */}
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#16a34a', fontSize: 14, borderRight: '1px solid', borderColor: 'divider' }}>
                      {row.okDays}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#dc2626', fontSize: 14, borderRight: '1px solid', borderColor: 'divider' }}>
                      {row.failDays}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#64748b', fontSize: 14, borderRight: '1px solid', borderColor: 'divider' }}>
                      {row.absentDays}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#0369a1', fontSize: 13, borderRight: '1px solid', borderColor: 'divider' }}>
                      {fmtMoney(row.totalTushum)}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#7c3aed', fontSize: 14, borderRight: '1px solid', borderColor: 'divider' }}>
                      {row.totalTasks}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.grade}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          bgcolor: alpha(row.gradeColor, 0.12),
                          color: row.gradeColor,
                          border: '1px solid',
                          borderColor: alpha(row.gradeColor, 0.3)
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table Footer info */}
        <Box sx={{ p: 2, bgcolor: isDark ? '#0f172a' : '#f8fafc', borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              💡 Изоҳ: Ҳар бир кунлик катакчада кунлик тушум суммаси ҳамда бажарилган махсус топшириқлар сони кўрсатилган. Катак устига сичқончани олиб борсангиз, баҳолаш сабабини кўришингиз мумкин.
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Кўрсатилмоқда: {filteredRows.length} нафар назоратчи
            </Typography>
          </Box>
        </Box>
      </Card>
    </MainCard>
  );
}
