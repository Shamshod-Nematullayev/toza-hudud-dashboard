import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
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
  Stack,
  Collapse,
  Tooltip,
  InputAdornment,
  useTheme,
  alpha,
  ButtonBase
} from '@mui/material';
import {
  ArrowBack,
  FileDownloadOutlined as FileDownloadIcon,
  RefreshOutlined as RefreshIcon,
  SearchOutlined as SearchIcon,
  ClearOutlined as ClearIcon,
  BadgeOutlined as PinflIcon,
  BoltOutlined as ElectricIcon,
  GroupAddOutlined as InhabitantsIcon,
  PersonAddAlt1Outlined as NewAbonentIcon,
  PhoneIphoneOutlined as PhoneIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  CalendarMonthOutlined as CalendarIcon,
  PeopleOutlined as PeopleIcon,
  SyncOutlined as SyncIcon,
  FilterListOutlined as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from 'utils/api';
import { toast } from 'react-toastify';

export interface IDailyBreakdownItem {
  date: string;
  shaxsniTasdiqlash: number;
  elektrKodi: number;
  xatlovOdamSoni: number;
  yangiAbonent: number;
  phone: number;
  street: number;
  total: number;
}

export interface IInspectorBotStatRow {
  _id: string;
  id: number;
  name: string;
  phone: string;
  activ: boolean;
  isXatlovchi: boolean;
  shaxsniTasdiqlash: number;
  elektrKodi: number;
  xatlovOdamSoni: number;
  yangiAbonent: number;
  phoneCount: number;
  streetCount: number;
  total: number;
  activeDaysCount: number;
  daily: IDailyBreakdownItem[];
}

export interface IDailyTimelineInspector {
  inspectorId: number;
  inspectorName: string;
  shaxsniTasdiqlash: number;
  elektrKodi: number;
  xatlovOdamSoni: number;
  yangiAbonent: number;
  phone: number;
  street: number;
  total: number;
}

export interface IDailyTimelineGroup {
  date: string;
  shaxsniTasdiqlash: number;
  elektrKodi: number;
  xatlovOdamSoni: number;
  yangiAbonent: number;
  phone: number;
  street: number;
  total: number;
  inspectors: IDailyTimelineInspector[];
}

export interface IReportSummary {
  totalInspectors: number;
  activeInspectorsInPeriod: number;
  shaxsniTasdiqlash: number;
  elektrKodi: number;
  xatlovOdamSoni: number;
  yangiAbonent: number;
  phoneCount: number;
  streetCount: number;
  total: number;
}

export interface IInspectorBotReportResponse {
  ok: boolean;
  fromDate: string | null;
  toDate: string | null;
  summary: IReportSummary;
  rows: IInspectorBotStatRow[];
  dailyTimeline: IDailyTimelineGroup[];
  count: number;
}

type SortField = 'total' | 'shaxsniTasdiqlash' | 'elektrKodi' | 'xatlovOdamSoni' | 'yangiAbonent' | 'phoneCount' | 'name';
type ViewMode = 'inspectors' | 'daily';
type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom';

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = dayjs(dateStr);
  return d.isValid() ? d.format('DD.MM.YYYY') : dateStr;
}

export default function NazoratchilarXatlov() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const todayStr = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [activePreset, setActivePreset] = useState<DatePreset>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyWithActivity, setOnlyWithActivity] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('inspectors');
  const [sortBy, setSortBy] = useState<SortField>('total');
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [reportData, setReportData] = useState<IInspectorBotReportResponse | null>(null);

  const categoryConfig = useMemo(
    () => [
      {
        key: 'shaxsniTasdiqlash' as const,
        label: 'Shaxsini tasdiqlash',
        shortLabel: 'JSHSHIR / Pasport',
        unitLabel: 'shaxsni tasdiqlash',
        color: theme.palette.primary.main,
        icon: <PinflIcon fontSize="small" />
      },
      {
        key: 'elektrKodi' as const,
        label: 'Elektr kodi (HET)',
        shortLabel: 'Svet / ETK kodi',
        unitLabel: 'svet (elektr kodi)',
        color: theme.palette.warning.main,
        icon: <ElectricIcon fontSize="small" />
      },
      {
        key: 'xatlovOdamSoni' as const,
        label: "Yashovchi sonini ko'paytirish",
        shortLabel: 'Yashovchi soni',
        unitLabel: 'yashovchi soni',
        color: theme.palette.info.main,
        icon: <InhabitantsIcon fontSize="small" />
      },
      {
        key: 'yangiAbonent' as const,
        label: 'Yangi abonent ochish',
        shortLabel: 'Yangi abonent',
        unitLabel: 'yangi abonent',
        color: theme.palette.success.main,
        icon: <NewAbonentIcon fontSize="small" />
      },
      {
        key: 'phoneCount' as const,
        label: 'Telefon raqami',
        shortLabel: 'Telefon ulash',
        unitLabel: 'telefon',
        color: theme.palette.secondary.main,
        icon: <PhoneIcon fontSize="small" />
      }
    ],
    [theme.palette]
  );

  const fetchReport = useCallback(
    async (forceSync = false) => {
      if (forceSync) {
        setSyncing(true);
      } else {
        setLoading(true);
      }
      try {
        const params: Record<string, string> = {};
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        if (forceSync) params.forceSync = 'true';

        const { data } = await api.get('/reports/confirmed-abonentdata-by-inspectors', { params });
        setReportData(data);
        if (forceSync) {
          toast.success("Tarixiy so'rovlar asosida kunlik ko'rsatkichlar yangilandi");
        }
      } catch (err) {
        console.error('Error loading inspector bot report:', err);
        toast.error("Hisobot ma'lumotlarini yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
        setSyncing(false);
      }
    },
    [fromDate, toDate]
  );

  useEffect(() => {
    fetchReport(false);
  }, [fetchReport]);

  const handlePresetChange = (preset: DatePreset) => {
    setActivePreset(preset);
    const now = dayjs();
    if (preset === 'today') {
      const d = now.format('YYYY-MM-DD');
      setFromDate(d);
      setToDate(d);
    } else if (preset === 'yesterday') {
      const d = now.subtract(1, 'day').format('YYYY-MM-DD');
      setFromDate(d);
      setToDate(d);
    } else if (preset === 'week') {
      setFromDate(now.subtract(6, 'day').format('YYYY-MM-DD'));
      setToDate(now.format('YYYY-MM-DD'));
    } else if (preset === 'month') {
      setFromDate(now.startOf('month').format('YYYY-MM-DD'));
      setToDate(now.format('YYYY-MM-DD'));
    } else if (preset === 'all') {
      setFromDate('');
      setToDate('');
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params: Record<string, string> = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const { data } = await api.get('/reports/confirmed-abonentdata-by-inspectors/excel', {
        params,
        responseType: 'blob'
      });
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nazoratchilar_bot_hisoboti_${fromDate || 'barchasi'}_${toDate || 'barchasi'}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel hisoboti yuklab olindi');
    } catch (error) {
      console.error(error);
      toast.error('Excel faylini yuklab olishda xatolik');
    } finally {
      setExporting(false);
    }
  };

  const toggleExpandRow = (inspectorId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [inspectorId]: !prev[inspectorId]
    }));
  };

  const filteredAndSortedRows = useMemo(() => {
    const rawRows = reportData?.rows || [];
    const q = searchQuery.trim().toLowerCase();

    const filtered = rawRows.filter((row) => {
      if (onlyWithActivity && (row.total || 0) <= 0) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        String(row.id).includes(q) ||
        (row.phone && row.phone.toLowerCase().includes(q))
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      const valA = Number(a[sortBy] || 0);
      const valB = Number(b[sortBy] || 0);
      if (valB !== valA) return valB - valA;
      if ((b.total || 0) !== (a.total || 0)) return (b.total || 0) - (a.total || 0);
      return a.name.localeCompare(b.name);
    });
  }, [reportData?.rows, searchQuery, onlyWithActivity, sortBy]);

  const filteredTimeline = useMemo(() => {
    const timeline = reportData?.dailyTimeline || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return timeline;

    return timeline
      .map((dayGroup) => {
        const matchedInspectors = dayGroup.inspectors.filter(
          (ins) =>
            ins.inspectorName.toLowerCase().includes(q) ||
            String(ins.inspectorId).includes(q)
        );
        if (matchedInspectors.length === 0) return null;
        return {
          ...dayGroup,
          inspectors: matchedInspectors
        };
      })
      .filter(Boolean) as IDailyTimelineGroup[];
  }, [reportData?.dailyTimeline, searchQuery]);

  const summary: IReportSummary = useMemo(() => {
    if (reportData?.summary) return reportData.summary;
    const rows = reportData?.rows || [];
    return {
      totalInspectors: rows.length,
      activeInspectorsInPeriod: rows.filter((r) => (r.total || 0) > 0).length,
      shaxsniTasdiqlash: rows.reduce((s, r) => s + (r.shaxsniTasdiqlash || 0), 0),
      elektrKodi: rows.reduce((s, r) => s + (r.elektrKodi || 0), 0),
      xatlovOdamSoni: rows.reduce((s, r) => s + (r.xatlovOdamSoni || 0), 0),
      yangiAbonent: rows.reduce((s, r) => s + (r.yangiAbonent || 0), 0),
      phoneCount: rows.reduce((s, r) => s + (r.phoneCount || 0), 0),
      streetCount: rows.reduce((s, r) => s + (r.streetCount || 0), 0),
      total: rows.reduce((s, r) => s + (r.total || 0), 0)
    };
  }, [reportData]);

  // Kunlik satr uchun "1 ta telefon, 5 ta svet..." ko'rinishidagi tavsif
  const renderDailyChips = (item: {
    shaxsniTasdiqlash: number;
    elektrKodi: number;
    xatlovOdamSoni: number;
    yangiAbonent: number;
    phone: number;
    street?: number;
  }) => {
    const parts: Array<{ label: string; count: number; color: string }> = [
      { label: 'shaxsni tasdiqlash', count: item.shaxsniTasdiqlash, color: theme.palette.primary.main },
      { label: 'elektr kodi (svet)', count: item.elektrKodi, color: theme.palette.warning.main },
      { label: 'yashovchi soni', count: item.xatlovOdamSoni, color: theme.palette.info.main },
      { label: 'yangi abonent', count: item.yangiAbonent, color: theme.palette.success.main },
      { label: 'telefon', count: item.phone, color: theme.palette.secondary.main }
    ].filter((p) => p.count > 0);

    return (
      <Stack direction="row" spacing={0.8} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
        {parts.map((p) => (
          <Box
            key={p.label}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              px: 1,
              py: 0.3,
              borderRadius: 1.2,
              bgcolor: alpha(p.color, isDark ? 0.18 : 0.09),
              border: '1px solid',
              borderColor: alpha(p.color, isDark ? 0.35 : 0.22)
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: p.color }}>
              {p.count} ta
            </Typography>
            <Typography sx={{ fontWeight: 500, fontSize: '0.76rem', color: theme.palette.text.primary }}>
              {p.label}
            </Typography>
          </Box>
        ))}
      </Stack>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pb: 5 }}>
      {/* Yuqori sarlavha va asosiy amallar */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2.5,
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between' }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate('/billing/reports')}
              sx={{
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2,
                color: theme.palette.text.primary
              }}
            >
              <ArrowBack fontSize="small" />
            </IconButton>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-0.01em' }}>
                  Nazoratchilarning Telegram bot orqali ma&apos;lumot kiritish hisoboti
                </Typography>
                <Chip
                  size="small"
                  label="Tezkor kunlik hisoblagich"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    bgcolor: alpha(theme.palette.success.main, isDark ? 0.2 : 0.1),
                    color: theme.palette.success.main
                  }}
                />
              </Stack>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.4 }}>
                Har bir nazoratchi bot orqali kiritgan shaxsni tasdiqlash, elektr kodi, yashovchi soni, yangi abonent va telefon ma&apos;lumotlari kunlik kesimda
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <Tooltip title="Tarixiy so'rovlardan kunlik hisoblagichni qayta tekshirish va sinxronlash">
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={syncing ? <CircularProgress size={15} color="inherit" /> : <SyncIcon />}
                disabled={syncing || loading}
                onClick={() => fetchReport(true)}
                sx={{ borderRadius: 1.8, textTransform: 'none', fontWeight: 600 }}
              >
                Sinxronlash
              </Button>
            </Tooltip>

            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              disabled={loading}
              onClick={() => fetchReport(false)}
              sx={{ borderRadius: 1.8, textTransform: 'none', fontWeight: 600 }}
            >
              Yangilash
            </Button>

            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={exporting ? <CircularProgress size={15} color="inherit" /> : <FileDownloadIcon />}
              disabled={exporting || loading}
              onClick={handleExportExcel}
              sx={{ borderRadius: 1.8, textTransform: 'none', fontWeight: 700, px: 2 }}
            >
              Excel yuklab olish
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* 5 ta yo'nalish bo'yicha interaktiv ko'rsatkich kartalari + Jami */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(6, 1fr)'
          },
          gap: 1.5
        }}
      >
        {/* Jami kiritilgan */}
        <ButtonBase
          onClick={() => setSortBy('total')}
          sx={{
            display: 'block',
            textAlign: 'left',
            borderRadius: 2.5,
            overflow: 'hidden'
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: '100%',
              borderRadius: 2.5,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: sortBy === 'total' ? theme.palette.primary.main : theme.palette.divider,
              borderLeft: `4px solid ${theme.palette.text.primary}`,
              transition: 'all 0.15s ease'
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: theme.palette.text.secondary }}>
                JAMI KIRITILGAN
              </Typography>
              <PeopleIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
            </Stack>
            <Typography sx={{ fontSize: '1.65rem', fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.15 }}>
              {summary.total.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mt: 0.6 }}>
              Faol nazoratchilar: <b>{summary.activeInspectorsInPeriod}</b> / {summary.totalInspectors}
            </Typography>
          </Paper>
        </ButtonBase>

        {categoryConfig.map((cat) => {
          const count = Number(summary[cat.key] || 0);
          const pct = summary.total > 0 ? Math.round((count / summary.total) * 1000) / 10 : 0;
          const isSelectedSort = sortBy === cat.key;

          return (
            <ButtonBase
              key={cat.key}
              onClick={() => setSortBy(cat.key)}
              sx={{
                display: 'block',
                textAlign: 'left',
                borderRadius: 2.5,
                overflow: 'hidden'
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: 2.5,
                  bgcolor: isSelectedSort
                    ? alpha(cat.color, isDark ? 0.14 : 0.05)
                    : theme.palette.background.paper,
                  border: '1px solid',
                  borderColor: isSelectedSort ? cat.color : theme.palette.divider,
                  borderLeft: `4px solid ${cat.color}`,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: cat.color
                  }
                }}
              >
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                      lineHeight: 1.2
                    }}
                  >
                    {cat.label}
                  </Typography>
                  <Box
                    sx={{
                      p: 0.6,
                      borderRadius: 1.5,
                      display: 'flex',
                      bgcolor: alpha(cat.color, isDark ? 0.2 : 0.1),
                      color: cat.color
                    }}
                  >
                    {cat.icon}
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: '1.65rem', fontWeight: 800, color: cat.color, lineHeight: 1.15 }}>
                  {count.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mt: 0.6 }}>
                  Ulushi: <b>{pct}%</b> ({cat.shortLabel})
                </Typography>
              </Paper>
            </ButtonBase>
          );
        })}
      </Box>

      {/* Filtrlar va Ko'rinish rejimi paneli */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2.5,
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider
        }}
      >
        <Stack spacing={2}>
          {/* 1-qator: Tezkor sana tugmalari + Sana tanlagichlar + Ko'rinish rejimi */}
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'space-between' }}
          >
            {/* Tezkor davrlar va sanalar */}
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
              {(
                [
                  { id: 'today', label: 'Bugun' },
                  { id: 'yesterday', label: 'Kecha' },
                  { id: 'week', label: 'Oxirgi 7 kun' },
                  { id: 'month', label: 'Shu oy' },
                  { id: 'all', label: 'Barcha vaqt' }
                ] as Array<{ id: DatePreset; label: string }>
              ).map((preset) => {
                const active = activePreset === preset.id;
                return (
                  <Chip
                    key={preset.id}
                    label={preset.label}
                    onClick={() => handlePresetChange(preset.id)}
                    sx={{
                      fontWeight: active ? 700 : 500,
                      borderRadius: 1.5,
                      bgcolor: active
                        ? alpha(theme.palette.primary.main, isDark ? 0.25 : 0.12)
                        : alpha(theme.palette.text.primary, isDark ? 0.06 : 0.04),
                      color: active ? theme.palette.primary.main : theme.palette.text.primary,
                      border: '1px solid',
                      borderColor: active ? theme.palette.primary.main : 'transparent'
                    }}
                  />
                );
              })}

              <TextField
                type="date"
                size="small"
                label="Dan"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setActivePreset('custom');
                }}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: toDate || todayStr } }}
                sx={{ width: 150 }}
              />

              <TextField
                type="date"
                size="small"
                label="Gacha"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setActivePreset('custom');
                }}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: fromDate || undefined, max: todayStr } }}
                sx={{ width: 150 }}
              />

              {(fromDate || toDate) && (
                <Tooltip title="Sana filtrini tozalash">
                  <IconButton size="small" onClick={() => handlePresetChange('all')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            {/* Qidiruv va ko'rinish rejimi */}
            <Stack direction="row" spacing={1.2} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Nazoratchi F.I.O yoki ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: { xs: '100%', sm: 240 } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }
                }}
              />

              <Chip
                icon={<FilterIcon fontSize="small" />}
                label="Faqat kiritganlar"
                onClick={() => setOnlyWithActivity((prev) => !prev)}
                sx={{
                  fontWeight: onlyWithActivity ? 700 : 500,
                  borderRadius: 1.5,
                  bgcolor: onlyWithActivity
                    ? alpha(theme.palette.success.main, isDark ? 0.22 : 0.12)
                    : 'transparent',
                  color: onlyWithActivity ? theme.palette.success.main : theme.palette.text.secondary,
                  border: '1px solid',
                  borderColor: onlyWithActivity ? theme.palette.success.main : theme.palette.divider
                }}
              />

              {/* Rejim almashtirgich: Nazoratchilar kesimida vs Kunlik kesimda */}
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 0.4,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.text.primary, isDark ? 0.08 : 0.05),
                  border: '1px solid',
                  borderColor: theme.palette.divider
                }}
              >
                <Button
                  size="small"
                  onClick={() => setViewMode('inspectors')}
                  startIcon={<PeopleIcon fontSize="small" />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: viewMode === 'inspectors' ? 700 : 500,
                    borderRadius: 1.5,
                    px: 1.5,
                    py: 0.5,
                    bgcolor: viewMode === 'inspectors' ? theme.palette.background.paper : 'transparent',
                    color: viewMode === 'inspectors' ? theme.palette.primary.main : theme.palette.text.secondary,
                    boxShadow: viewMode === 'inspectors' ? 1 : 'none'
                  }}
                >
                  Nazoratchilar kesimida
                </Button>
                <Button
                  size="small"
                  onClick={() => setViewMode('daily')}
                  startIcon={<CalendarIcon fontSize="small" />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: viewMode === 'daily' ? 700 : 500,
                    borderRadius: 1.5,
                    px: 1.5,
                    py: 0.5,
                    bgcolor: viewMode === 'daily' ? theme.palette.background.paper : 'transparent',
                    color: viewMode === 'daily' ? theme.palette.primary.main : theme.palette.text.secondary,
                    boxShadow: viewMode === 'daily' ? 1 : 'none'
                  }}
                >
                  Kunlik xronologiya
                </Button>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* Asosiy ma'lumotlar qismi */}
      {loading ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 2.5,
            bgcolor: theme.palette.background.paper,
            border: '1px solid',
            borderColor: theme.palette.divider,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <CircularProgress size={36} />
          <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            Nazoratchilar kunlik ma&apos;lumotlari yuklanmoqda...
          </Typography>
        </Paper>
      ) : viewMode === 'inspectors' ? (
        /* 1-REJIM: NAZORATCHILAR KESIMIDA JADVAL (Qator bosilganda kunlik tafsilot ochiladi) */
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2.5,
            bgcolor: theme.palette.background.paper,
            border: '1px solid',
            borderColor: theme.palette.divider,
            overflow: 'hidden'
          }}
        >
          <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 48, fontWeight: 700, bgcolor: theme.palette.background.paper }}>#</TableCell>
                  <TableCell
                    onClick={() => setSortBy('name')}
                    sx={{
                      fontWeight: 700,
                      cursor: 'pointer',
                      bgcolor: theme.palette.background.paper,
                      minWidth: 220
                    }}
                  >
                    Nazoratchi F.I.O
                  </TableCell>
                  <TableCell
                    align="right"
                    onClick={() => setSortBy('shaxsniTasdiqlash')}
                    sx={{
                      fontWeight: 700,
                      cursor: 'pointer',
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.primary.main
                    }}
                  >
                    Shaxsini tasdiqlash
                  </TableCell>
                  <TableCell
                    align="right"
                    onClick={() => setSortBy('elektrKodi')}
                    sx={{
                      fontWeight: 700,
                      cursor: 'pointer',
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.warning.main
                    }}
                  >
                    Elektr kodi (Svet)
                  </TableCell>
                  <TableCell
                    align="right"
                    onClick={() => setSortBy('xatlovOdamSoni')}
                    sx={{
                      fontWeight: 700,
                      cursor: 'pointer',
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.info.main
                    }}
                  >
                    Yashovchi soni
                  </TableCell>
                  <TableCell
                    align="right"
                    onClick={() => setSortBy('yangiAbonent')}
                    sx={{
                      fontWeight: 700,
                      cursor: 'pointer',
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.success.main
                    }}
                  >
                    Yangi abonent
                  </TableCell>
                  <TableCell
                    align="right"
                    onClick={() => setSortBy('phoneCount')}
                    sx={{
                      fontWeight: 700,
                      cursor: 'pointer',
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.secondary.main
                    }}
                  >
                    Telefon raqami
                  </TableCell>
                  <TableCell
                    align="right"
                    onClick={() => setSortBy('total')}
                    sx={{ fontWeight: 800, cursor: 'pointer', bgcolor: theme.palette.background.paper }}
                  >
                    Jami kiritilgan
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.background.paper, minWidth: 170 }}>
                    Kiritilgan ma&apos;lumotlar tarkibi
                  </TableCell>
                  <TableCell align="center" sx={{ width: 64, fontWeight: 700, bgcolor: theme.palette.background.paper }}>
                    Kunlik
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                      <Typography sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                        Tanlangan shartlar bo&apos;yicha nazoratchi ma&apos;lumotlari topilmadi
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedRows.map((row, index) => {
                    const isExpanded = Boolean(expandedRows[row.id]);
                    const hasDaily = row.daily && row.daily.length > 0;
                    const rowTotal = row.total || 0;

                    return (
                      <React.Fragment key={row._id || row.id}>
                        <TableRow
                          hover
                          onClick={() => hasDaily && toggleExpandRow(row.id)}
                          sx={{
                            cursor: hasDaily ? 'pointer' : 'default',
                            bgcolor: isExpanded
                              ? alpha(theme.palette.primary.main, isDark ? 0.08 : 0.03)
                              : 'inherit'
                          }}
                        >
                          <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                              <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: theme.palette.text.primary }}>
                                  {row.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                  ID: {row.id} {row.phone ? `• ${row.phone}` : ''}
                                  {row.activeDaysCount > 0 ? ` • ${row.activeDaysCount} kun faol` : ''}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          {/* 1. Shaxsini tasdiqlash */}
                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight: row.shaxsniTasdiqlash > 0 ? 700 : 400,
                                color: row.shaxsniTasdiqlash > 0 ? theme.palette.primary.main : theme.palette.text.disabled
                              }}
                            >
                              {(row.shaxsniTasdiqlash || 0).toLocaleString()}
                            </Typography>
                          </TableCell>

                          {/* 2. Elektr kodi */}
                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight: row.elektrKodi > 0 ? 700 : 400,
                                color: row.elektrKodi > 0 ? theme.palette.warning.main : theme.palette.text.disabled
                              }}
                            >
                              {(row.elektrKodi || 0).toLocaleString()}
                            </Typography>
                          </TableCell>

                          {/* 3. Yashovchi sonini ko'paytirish */}
                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight: row.xatlovOdamSoni > 0 ? 700 : 400,
                                color: row.xatlovOdamSoni > 0 ? theme.palette.info.main : theme.palette.text.disabled
                              }}
                            >
                              {(row.xatlovOdamSoni || 0).toLocaleString()}
                            </Typography>
                          </TableCell>

                          {/* 4. Yangi abonent ochish */}
                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight: row.yangiAbonent > 0 ? 700 : 400,
                                color: row.yangiAbonent > 0 ? theme.palette.success.main : theme.palette.text.disabled
                              }}
                            >
                              {(row.yangiAbonent || 0).toLocaleString()}
                            </Typography>
                          </TableCell>

                          {/* 5. Telefon raqami */}
                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight: row.phoneCount > 0 ? 700 : 400,
                                color: row.phoneCount > 0 ? theme.palette.secondary.main : theme.palette.text.disabled
                              }}
                            >
                              {(row.phoneCount || 0).toLocaleString()}
                            </Typography>
                          </TableCell>

                          {/* Jami */}
                          <TableCell align="right">
                            <Chip
                              size="small"
                              label={rowTotal.toLocaleString()}
                              sx={{
                                fontWeight: 800,
                                minWidth: 48,
                                bgcolor:
                                  rowTotal > 0
                                    ? alpha(theme.palette.primary.main, isDark ? 0.22 : 0.1)
                                    : alpha(theme.palette.text.disabled, 0.1),
                                color: rowTotal > 0 ? theme.palette.primary.main : theme.palette.text.secondary
                              }}
                            />
                          </TableCell>

                          {/* Tarkib ulushi (Proportional stacked bar) */}
                          <TableCell>
                            {rowTotal > 0 ? (
                              <Box
                                sx={{
                                  display: 'flex',
                                  width: '100%',
                                  height: 8,
                                  borderRadius: 4,
                                  overflow: 'hidden',
                                  bgcolor: alpha(theme.palette.text.disabled, 0.15)
                                }}
                              >
                                {categoryConfig.map((cat) => {
                                  const val = Number(row[cat.key] || 0);
                                  if (val <= 0) return null;
                                  const widthPct = (val / rowTotal) * 100;
                                  return (
                                    <Tooltip key={cat.key} title={`${cat.label}: ${val} ta`}>
                                      <Box
                                        sx={{
                                          width: `${widthPct}%`,
                                          bgcolor: cat.color,
                                          height: '100%'
                                        }}
                                      />
                                    </Tooltip>
                                  );
                                })}
                              </Box>
                            ) : (
                              <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                                Kiritilmagan
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell align="center">
                            {hasDaily ? (
                              <IconButton size="small">
                                {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                              </IconButton>
                            ) : (
                              <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                                -
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>

                        {/* Kunlik kesimdagi ichki jadval */}
                        {hasDaily && (
                          <TableRow>
                            <TableCell colSpan={10} sx={{ p: 0, borderBottom: isExpanded ? undefined : 'none' }}>
                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box
                                  sx={{
                                    p: 2,
                                    pl: { xs: 2, md: 6 },
                                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.05 : 0.02),
                                    borderTop: '1px dashed',
                                    borderColor: theme.palette.divider
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: '0.84rem',
                                      color: theme.palette.text.primary,
                                      mb: 1.2
                                    }}
                                  >
                                    {row.name} — Kunlik ma&apos;lumot kiritish tarixi ({row.daily.length} kun):
                                  </Typography>
                                  <Stack spacing={1}>
                                    {row.daily.map((dayItem) => (
                                      <Paper
                                        key={dayItem.date}
                                        elevation={0}
                                        sx={{
                                          p: 1.2,
                                          px: 1.8,
                                          borderRadius: 1.8,
                                          bgcolor: theme.palette.background.paper,
                                          border: '1px solid',
                                          borderColor: theme.palette.divider,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          flexWrap: 'wrap',
                                          gap: 1.5
                                        }}
                                      >
                                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                          <Chip
                                            size="small"
                                            icon={<CalendarIcon fontSize="small" />}
                                            label={formatDisplayDate(dayItem.date)}
                                            sx={{ fontWeight: 700 }}
                                          />
                                          {renderDailyChips(dayItem)}
                                        </Stack>

                                        <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: theme.palette.text.primary }}>
                                          Jami: {dayItem.total} ta
                                        </Typography>
                                      </Paper>
                                    ))}
                                  </Stack>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}

                {/* Jami yakuniy qator */}
                {filteredAndSortedRows.length > 0 && (
                  <TableRow
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.06),
                      '& td': { fontWeight: 800, borderTop: `2px solid ${theme.palette.divider}` }
                    }}
                  >
                    <TableCell />
                    <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                      JAMI ({filteredAndSortedRows.length} nafar nazoratchi)
                    </TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.primary.main }}>
                      {filteredAndSortedRows.reduce((s, r) => s + (r.shaxsniTasdiqlash || 0), 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.warning.main }}>
                      {filteredAndSortedRows.reduce((s, r) => s + (r.elektrKodi || 0), 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.info.main }}>
                      {filteredAndSortedRows.reduce((s, r) => s + (r.xatlovOdamSoni || 0), 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.success.main }}>
                      {filteredAndSortedRows.reduce((s, r) => s + (r.yangiAbonent || 0), 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.secondary.main }}>
                      {filteredAndSortedRows.reduce((s, r) => s + (r.phoneCount || 0), 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.text.primary }}>
                      {filteredAndSortedRows.reduce((s, r) => s + (r.total || 0), 0).toLocaleString()}
                    </TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        /* 2-REJIM: KUNLIK XRONOLOGIYA (Kunlar va nazoratchilar kesimida: "A nazoratchi 1 ta telefon, 5 ta svet...") */
        <Stack spacing={2}>
          {filteredTimeline.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 2.5,
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: theme.palette.divider
              }}
            >
              <Typography sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                Tanlangan davr bo&apos;yicha kunlik ma&apos;lumotlar topilmadi
              </Typography>
            </Paper>
          ) : (
            filteredTimeline.map((dayGroup) => (
              <Paper
                key={dayGroup.date}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  bgcolor: theme.palette.background.paper,
                  border: '1px solid',
                  borderColor: theme.palette.divider
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    pb: 1.5,
                    mb: 2,
                    borderBottom: '1px solid',
                    borderColor: theme.palette.divider
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Chip
                      icon={<CalendarIcon fontSize="small" />}
                      label={formatDisplayDate(dayGroup.date)}
                      color="primary"
                      sx={{ fontWeight: 800, fontSize: '0.88rem' }}
                    />
                    <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: theme.palette.text.secondary }}>
                      {dayGroup.inspectors.length} nafar nazoratchi ma&apos;lumot kiritdi
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    {renderDailyChips(dayGroup)}
                    <Chip
                      label={`Jami: ${dayGroup.total} ta`}
                      sx={{
                        fontWeight: 800,
                        bgcolor: alpha(theme.palette.primary.main, isDark ? 0.22 : 0.1),
                        color: theme.palette.primary.main
                      }}
                    />
                  </Stack>
                </Stack>

                <Stack spacing={1}>
                  {dayGroup.inspectors.map((ins, i) => (
                    <Box
                      key={`${dayGroup.date}_${ins.inspectorId}`}
                      sx={{
                        p: 1.25,
                        px: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.text.primary, isDark ? 0.03 : 0.015),
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1.5
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 220 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: theme.palette.text.secondary, width: 24 }}>
                          {i + 1}.
                        </Typography>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: theme.palette.text.primary }}>
                            {ins.inspectorName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            ID: {ins.inspectorId}
                          </Typography>
                        </Box>
                      </Stack>

                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                        {renderDailyChips(ins)}
                      </Box>

                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: theme.palette.text.primary }}>
                        Jami: {ins.total} ta
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            ))
          )}
        </Stack>
      )}
    </Box>
  );
}
