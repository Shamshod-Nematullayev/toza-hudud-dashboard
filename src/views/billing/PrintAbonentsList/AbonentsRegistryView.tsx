import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  CircularProgress,
  Skeleton,
  Badge,
  alpha,
  useTheme
} from '@mui/material';
import GridOnIcon from '@mui/icons-material/GridOn';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import BoltIcon from '@mui/icons-material/Bolt';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from 'utils/api';
import useStore from './useStore';
import AbonentsFilterDrawer, {
  IAbonentRegistryFilters,
  initialAbonentRegistryFilters
} from './AbonentsFilterDrawer';
import QuickEditAbonentModal, { IAbonentRegistryItem } from './QuickEditAbonentModal';

type QuickSearchField =
  | 'accountNumber'
  | 'fullName'
  | 'abonentId'
  | 'pinfl'
  | 'cadastralNumber'
  | 'electricityAccountNumber'
  | 'phone';

const quickSearchOptions: { value: QuickSearchField; label: string; placeholder: string }[] = [
  { value: 'accountNumber', label: 'Hisob raqami', placeholder: '105120...' },
  { value: 'fullName', label: 'F.I.Sh', placeholder: 'Ism yoki familiya...' },
  { value: 'abonentId', label: 'Abonent ID', placeholder: '20997924...' },
  { value: 'pinfl', label: 'JShShIR (PINFL)', placeholder: '14 xonali JShShIR...' },
  { value: 'cadastralNumber', label: 'Kadastr raqami', placeholder: '14:...' },
  { value: 'electricityAccountNumber', label: 'Elektr hisob raqami', placeholder: 'Elektr hisob...' },
  { value: 'phone', label: 'Telefon raqami', placeholder: '901234567...' }
];

const filterLabels: Record<keyof IAbonentRegistryFilters, string> = {
  accountNumber: 'Hisob raqam',
  contractNumber: 'Shartnoma',
  abonentId: 'ID',
  pinfl: 'JShShIR',
  passport: 'Pasport',
  cadastralNumber: 'Kadastr',
  mahallaId: 'Mahalla',
  streetId: "Ko'cha ID",
  streetName: "Ko'cha",
  homeNumber: 'Uy',
  homeIndex: 'Uy harfi',
  flatNumber: 'Kv',
  identified: 'Identifikatsiya',
  etkStatus: 'Elektr holati',
  isFrozen: 'Hisob holati',
  inhabitantCnt: 'Yashovchilar',
  electricityAccountNumber: 'Elektr H/R',
  minSaldo: 'Balans (dan)',
  maxSaldo: 'Balans (gacha)',
  fullName: 'F.I.Sh',
  phone: 'Telefon'
};

interface AbonentsRegistryViewProps {
  onSwitchToPrint: (mahallaId?: string | number) => void;
}

export default function AbonentsRegistryView({ onSwitchToPrint }: AbonentsRegistryViewProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { dataSource, mahallas } = useStore();

  const isGreenZone = dataSource === 'greenzone';
  const accentColor = isGreenZone ? theme.palette.success.main : theme.palette.info.main;

  // Jadval ma'lumotlari va sahifalash
  const [rows, setRows] = useState<IAbonentRegistryItem[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [exportingExcel, setExportingExcel] = useState<boolean>(false);

  const [page, setPage] = useState<number>(0); // 0-indexed backend uchun
  const [pageSize, setPageSize] = useState<number>(15);
  const [jumpPageInput, setJumpPageInput] = useState<string>('1');

  // Saralash (Sorting)
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Tezkor qidiruv (Top-right bar)
  const [quickField, setQuickField] = useState<QuickSearchField>('accountNumber');
  const [quickValue, setQuickValue] = useState<string>('');

  // Kengaytirilgan Filter Drawer
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);
  const [draftFilters, setDraftFilters] = useState<IAbonentRegistryFilters>(initialAbonentRegistryFilters);
  const [appliedFilters, setAppliedFilters] = useState<IAbonentRegistryFilters>(initialAbonentRegistryFilters);

  // Tezkor Tahrirlash Modali
  const [editingAbonent, setEditingAbonent] = useState<IAbonentRegistryItem | null>(null);

  // Aktiv filtrlar ro'yxati
  const activeFilterEntries = useMemo(() => {
    return (Object.keys(appliedFilters) as (keyof IAbonentRegistryFilters)[]).filter(
      (k) => appliedFilters[k] !== '' && appliedFilters[k] !== undefined
    );
  }, [appliedFilters]);

  // Backend uchun yakuniy query parametrlarini yig'ish
  const buildQueryParams = useCallback(
    (targetPage = page, targetSize = pageSize, currentApplied = appliedFilters, currentQuickVal = quickValue) => {
      const params: Record<string, any> = {
        source: dataSource,
        allowEmpty: 'true',
        page: targetPage,
        size: targetSize,
        sortBy,
        sortDir
      };

      for (const key of Object.keys(currentApplied) as (keyof IAbonentRegistryFilters)[]) {
        if (currentApplied[key]) {
          params[key] = currentApplied[key];
        }
      }

      if (currentQuickVal.trim()) {
        params[quickField] = currentQuickVal.trim();
      }

      return params;
    },
    [dataSource, page, pageSize, sortBy, sortDir, appliedFilters, quickField, quickValue]
  );

  const fetchAbonents = useCallback(
    async (targetPage = page, targetSize = pageSize, currentApplied = appliedFilters, currentQuickVal = quickValue) => {
      try {
        setLoading(true);
        const params = buildQueryParams(targetPage, targetSize, currentApplied, currentQuickVal);
        const { data } = await api.get('/abonents/tozamakon', { params });
        setRows(Array.isArray(data?.content) ? data.content : []);
        setTotalElements(Number(data?.totalElements || 0));
        setTotalPages(Number(data?.totalPages || 0));
        setJumpPageInput(String(targetPage + 1));
      } catch (err: any) {
        console.error('Abonentlarni yuklashda xatolik:', err);
        toast.error("Abonentlar ro'yxatini yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    },
    [buildQueryParams, page, pageSize, appliedFilters, quickValue]
  );

  // Rejim (greenzone | tozamakon), sahifa, sahifa hajmi yoki saralash o'zgarganda yuklash
  useEffect(() => {
    fetchAbonents(page, pageSize, appliedFilters, quickValue);
  }, [dataSource, page, pageSize, sortBy, sortDir, appliedFilters]);

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchAbonents(0, pageSize, appliedFilters, quickValue);
  };

  const handleClearQuickSearch = () => {
    setQuickValue('');
    setPage(0);
    fetchAbonents(0, pageSize, appliedFilters, '');
  };

  const handleChangeDraftFilter = (key: keyof IAbonentRegistryFilters, value: string) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyDrawerFilters = () => {
    setPage(0);
    setAppliedFilters({ ...draftFilters });
    setFilterDrawerOpen(false);
  };

  const handleResetAllFilters = () => {
    setDraftFilters(initialAbonentRegistryFilters);
    setAppliedFilters(initialAbonentRegistryFilters);
    setQuickValue('');
    setPage(0);
  };

  const handleRemoveSingleFilter = (key: keyof IAbonentRegistryFilters) => {
    const next = { ...appliedFilters, [key]: '' };
    setDraftFilters(next);
    setAppliedFilters(next);
    setPage(0);
  };

  const handleToggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(0);
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpPageInput, 10);
    if (!isNaN(target) && target >= 1 && target <= Math.max(1, totalPages)) {
      setPage(target - 1);
    } else {
      toast.warning(`1 dan ${Math.max(1, totalPages)} gacha sahifa raqamini kiriting`);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      toast.info(
        isGreenZone
          ? 'GreenZone bazasidan Excel tayyorlanmoqda...'
          : 'Toza Makon bazasidan Excel yuklab olinmoqda...'
      );
      const params = buildQueryParams(0, pageSize, appliedFilters, quickValue);
      const response = await api.get('/abonents/export-excel', {
        params,
        responseType: 'blob',
        timeout: 60000 * 10
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const modeLabel = isGreenZone ? 'GreenZone' : 'TozaMakon';
      link.download = `Abonentlar_${modeLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      toast.success('Excel fayl muvaffaqiyatli yuklab olindi!');
    } catch (err) {
      console.error('Excel eksport xatoligi:', err);
      toast.error('Excel yuklab olishda xatolik yuz berdi');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleCopyAccount = (acc: string) => {
    if (!acc) return;
    navigator.clipboard.writeText(acc);
    toast.info(`Hisob raqami nusxalandi: ${acc}`, { autoClose: 1500 });
  };

  const handleSavedAbonent = (updated: IAbonentRegistryItem) => {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
  };

  const formatFilterValueLabel = (key: keyof IAbonentRegistryFilters, val: string) => {
    if (key === 'mahallaId') {
      const found = mahallas.find((m) => String(m.id) === String(val));
      return found ? found.name : val;
    }
    if (key === 'minSaldo' || key === 'maxSaldo') {
      const num = Number(val);
      return !isNaN(num) ? num.toLocaleString('en-US') : val;
    }
    if (key === 'identified') return val === 'true' ? 'Tasdiqlangan' : 'Tasdiqlanmagan';
    if (key === 'etkStatus') return val === 'true' ? 'Tasdiqlangan' : 'Tasdiqlanmagan';
    if (key === 'isFrozen') return val === 'true' ? 'Muzlatilgan' : 'Faol';
    return val;
  };

  const startItem = totalElements === 0 ? 0 : page * pageSize + 1;
  const endItem = Math.min(totalElements, (page + 1) * pageSize);

  return (
    <Box sx={{ position: 'relative' }}>
      {/* O'ng chekkadagi vertikal "Filter" yorlig'i (Toza Makon uslubida tezkor ochish uchun) */}
      {!filterDrawerOpen && (
        <Paper
          elevation={3}
          onClick={() => {
            setDraftFilters(appliedFilters);
            setFilterDrawerOpen(true);
          }}
          sx={{
            position: 'fixed',
            right: 0,
            top: '38%',
            zIndex: 1050,
            cursor: 'pointer',
            py: 1.75,
            px: 0.9,
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderRight: 'none',
            borderColor: accentColor,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.75,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(accentColor, theme.palette.mode === 'dark' ? 0.2 : 0.08),
              pr: 1.4
            }
          }}
        >
          <KeyboardDoubleArrowLeftIcon sx={{ fontSize: 18, color: accentColor }} />
          <Typography
            variant="caption"
            sx={{
              writingMode: 'vertical-rl',
              fontWeight: 700,
              letterSpacing: 1,
              color: 'text.primary'
            }}
          >
            Filter {activeFilterEntries.length > 0 ? `(${activeFilterEntries.length})` : ''}
          </Typography>
        </Paper>
      )}

      {/* 1. Yuqori Amal va Tezkor Qidiruv Paneli */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'space-between' }}
        >
          {/* Chap taraf: Tugmalar va Identifikatsiya tezkor filtri */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant="contained"
              color={isGreenZone ? 'success' : 'info'}
              startIcon={exportingExcel ? <CircularProgress size={16} color="inherit" /> : <GridOnIcon />}
              disabled={exportingExcel}
              onClick={handleExportExcel}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                px: 2
              }}
            >
              Excel yuklab olish
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<PrintOutlinedIcon />}
              onClick={() => onSwitchToPrint(appliedFilters.mahallaId)}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Chop etish (A4 / Makros)
            </Button>

            <Tooltip title="Ro'yxatni yangilash">
              <IconButton
                onClick={() => fetchAbonents(page, pageSize, appliedFilters, quickValue)}
                disabled={loading}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <SyncIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Identifikatsiya holati bo'yicha 1-klikda filtrlash */}
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                p: 0.4,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.100'
              }}
            >
              {[
                { val: '', label: 'Barchasi' },
                { val: 'true', label: '✅ Tasdiqlangan' },
                { val: 'false', label: '❗ Tasdiqlanmagan' }
              ].map((item) => {
                const active = appliedFilters.identified === item.val;
                return (
                  <Button
                    key={item.val || 'all'}
                    size="small"
                    onClick={() => {
                      const next = { ...appliedFilters, identified: item.val };
                      setDraftFilters(next);
                      setAppliedFilters(next);
                      setPage(0);
                    }}
                    sx={{
                      px: 1.25,
                      py: 0.35,
                      minWidth: 'auto',
                      borderRadius: 1.5,
                      fontSize: '0.76rem',
                      fontWeight: active ? 700 : 500,
                      textTransform: 'none',
                      bgcolor: active ? 'background.paper' : 'transparent',
                      color: active ? accentColor : 'text.secondary',
                      boxShadow: active ? 1 : 'none'
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>
          </Stack>

          {/* O'ng taraf: Tezkor Qidiruv + Kengaytirilgan Filter Drawer tugmasi */}
          <Stack
            component="form"
            onSubmit={handleQuickSearchSubmit}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ alignItems: 'center' }}
          >
            <TextField
              select
              size="small"
              value={quickField}
              onChange={(e) => setQuickField(e.target.value as QuickSearchField)}
              sx={{ minWidth: 165 }}
            >
              {quickSearchOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              value={quickValue}
              onChange={(e) => setQuickValue(e.target.value)}
              placeholder={quickSearchOptions.find((o) => o.value === quickField)?.placeholder || 'Qidirish...'}
              sx={{ minWidth: { xs: '100%', sm: 220 } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                      {quickValue && (
                        <IconButton size="small" onClick={handleClearQuickSearch}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small" type="submit" color={isGreenZone ? 'success' : 'info'}>
                        <SearchIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )
                }
              }}
            />

            <Badge badgeContent={activeFilterEntries.length} color={isGreenZone ? 'success' : 'info'}>
              <Button
                variant={activeFilterEntries.length > 0 ? 'contained' : 'outlined'}
                color={isGreenZone ? 'success' : 'info'}
                startIcon={<FilterListIcon />}
                onClick={() => {
                  setDraftFilters(appliedFilters);
                  setFilterDrawerOpen(true);
                }}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Filter
              </Button>
            </Badge>
          </Stack>
        </Stack>

        {/* Aktiv filtrlar qatori */}
        {activeFilterEntries.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 0.75,
              mt: 1.5,
              pt: 1.5,
              borderTop: '1px dashed',
              borderColor: 'divider'
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Faol filtrlar:
            </Typography>
            {activeFilterEntries.map((key) => (
              <Chip
                key={key}
                size="small"
                label={`${filterLabels[key]}: ${formatFilterValueLabel(key, appliedFilters[key])}`}
                onDelete={() => handleRemoveSingleFilter(key)}
                sx={{
                  fontWeight: 600,
                  bgcolor: alpha(accentColor, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                  color: 'text.primary'
                }}
              />
            ))}
            <Button
              size="small"
              color="error"
              onClick={handleResetAllFilters}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
            >
              Tozalash
            </Button>
          </Stack>
        )}
      </Paper>

      {/* 2. Asosiy Abonentlar Jadvali */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        <TableContainer sx={{ maxHeight: 'calc(100vh - 310px)', minHeight: 420 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? alpha(accentColor, 0.16)
                        : alpha(accentColor, 0.08),
                    color: 'text.primary',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    py: 1.4,
                    borderBottom: '2px solid',
                    borderColor: alpha(accentColor, 0.35),
                    whiteSpace: 'nowrap'
                  }
                }}
              >
                <TableCell
                  onClick={() => handleToggleSort('id')}
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <span>ID</span>
                    {sortBy === 'id' &&
                      (sortDir === 'desc' ? (
                        <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                      ))}
                  </Stack>
                </TableCell>

                <TableCell
                  onClick={() => handleToggleSort('fullName')}
                  sx={{ cursor: 'pointer', userSelect: 'none', minWidth: 230 }}
                >
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <span>F.I.Sh</span>
                    {sortBy === 'fullName' &&
                      (sortDir === 'desc' ? (
                        <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                      ))}
                  </Stack>
                </TableCell>

                <TableCell>Hisob raqam</TableCell>
                <TableCell>Mahalla</TableCell>
                <TableCell>Ko&apos;cha</TableCell>
                <TableCell align="center">Uy</TableCell>
                <TableCell align="center">Uy indeksi</TableCell>
                <TableCell align="center">Kv</TableCell>
                <TableCell
                  align="center"
                  onClick={() => handleToggleSort('inhabitantCnt')}
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                    <span>Yashovchilar</span>
                    {sortBy === 'inhabitantCnt' &&
                      (sortDir === 'desc' ? (
                        <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                      ))}
                  </Stack>
                </TableCell>
                <TableCell align="center">IIV bazasidagi yashovchilar</TableCell>
                <TableCell>Elektr energiya H/R</TableCell>
                <TableCell
                  align="right"
                  onClick={() => handleToggleSort('ksaldo')}
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span>Balans (Saldo)</span>
                    {sortBy === 'ksaldo' &&
                      (sortDir === 'desc' ? (
                        <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                      ))}
                  </Stack>
                </TableCell>
                <TableCell align="center">Harakat</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                Array.from({ length: Math.min(pageSize, 12) }).map((_, idx) => (
                  <TableRow key={idx}>
                    {Array.from({ length: 13 }).map((__, cIdx) => (
                      <TableCell key={cIdx} sx={{ py: 1.2 }}>
                        <Skeleton variant="text" width="85%" height={22} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ py: 8 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                      Abonentlar topilmadi
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      Qidiruv shartlarini o&apos;zgartiring yoki filtrlarni tozalab qayta urinib ko&apos;ring.
                    </Typography>
                    {(activeFilterEntries.length > 0 || quickValue) && (
                      <Button variant="outlined" size="small" onClick={handleResetAllFilters}>
                        Filtrlarni tozalash
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const saldo = Number(row.ksaldo || 0);
                  const isDebt = saldo > 0;
                  const inh = Number(row.inhabitantCnt ?? 0);
                  const miaInh = row.miaInhabitantCnt !== null && row.miaInhabitantCnt !== undefined ? Number(row.miaInhabitantCnt) : null;
                  const hasMiaDiff = miaInh !== null && miaInh > inh;

                  return (
                    <TableRow
                      key={row.id || row.accountNumber}
                      hover
                      onDoubleClick={() => navigate(`/abonent/${row.id}/details`)}
                      sx={{
                        cursor: 'pointer',
                        '&:nth-of-type(even)': {
                          bgcolor:
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.common.white, 0.015)
                              : alpha(theme.palette.grey[500], 0.03)
                        }
                      }}
                    >
                      {/* ID */}
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>
                        {row.id}
                      </TableCell>

                      {/* F.I.Sh + Identifikatsiya ikonkasi */}
                      <TableCell>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Tooltip
                            title={
                              row.identified
                                ? `Identifikatsiya qilingan ${row.identifiedDate ? `(${row.identifiedDate})` : ''}`
                                : 'Identifikatsiya qilinmagan'
                            }
                          >
                            {row.identified ? (
                              <CheckCircleIcon sx={{ fontSize: 17, color: 'success.main', flexShrink: 0 }} />
                            ) : (
                              <ErrorIcon sx={{ fontSize: 17, color: 'error.main', flexShrink: 0 }} />
                            )}
                          </Tooltip>
                          <Typography
                            variant="body2"
                            onClick={() => navigate(`/abonent/${row.id}/details`)}
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.82rem',
                              color: 'text.primary',
                              '&:hover': {
                                color: accentColor,
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {row.fullName || '—'}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Hisob raqam */}
                      <TableCell>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <Typography
                            variant="body2"
                            onClick={() => handleCopyAccount(row.accountNumber)}
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              '&:hover': { color: accentColor }
                            }}
                          >
                            {row.accountNumber || '—'}
                          </Typography>
                          {row.accountNumber && (
                            <Tooltip title="Nusxalash">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyAccount(row.accountNumber);
                                }}
                                sx={{ p: 0.25, opacity: 0.6, '&:hover': { opacity: 1 } }}
                              >
                                <ContentCopyIcon sx={{ fontSize: 13 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>

                      {/* Mahalla */}
                      <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {row.mahallaName || '—'}
                      </TableCell>

                      {/* Ko'cha */}
                      <TableCell sx={{ fontSize: '0.8rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.streetName || '—'}
                      </TableCell>

                      {/* Uy */}
                      <TableCell align="center" sx={{ fontSize: '0.8rem' }}>
                        {row.homeNumber ?? '0'}
                      </TableCell>

                      {/* Uy indeksi */}
                      <TableCell align="center" sx={{ fontSize: '0.8rem' }}>
                        {row.homeIndex || ''}
                      </TableCell>

                      {/* Kv */}
                      <TableCell align="center" sx={{ fontSize: '0.8rem' }}>
                        {row.flatNumber || ''}
                      </TableCell>

                      {/* Yashovchilar soni */}
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                        {inh}
                      </TableCell>

                      {/* IIV bazasidagi yashovchilar */}
                      <TableCell align="center">
                        {miaInh !== null && miaInh > 0 ? (
                          <Chip
                            size="small"
                            label={miaInh}
                            color={hasMiaDiff ? 'warning' : 'default'}
                            variant={hasMiaDiff ? 'filled' : 'outlined'}
                            sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }}
                          />
                        ) : (
                          ''
                        )}
                      </TableCell>

                      {/* Elektr energiya hisob raqami */}
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {row.electricityAccountNumber ? (
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <span>{row.electricityAccountNumber}</span>
                            {row.isElektrKodConfirm && (
                              <Tooltip title="Elektr hisob raqami tasdiqlangan">
                                <BoltIcon sx={{ fontSize: 15, color: 'success.main' }} />
                              </Tooltip>
                            )}
                          </Stack>
                        ) : (
                          ''
                        )}
                      </TableCell>

                      {/* Balans (Saldo) */}
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            color: isDebt ? 'error.main' : saldo < 0 ? 'success.main' : 'text.secondary'
                          }}
                        >
                          {saldo.toLocaleString('ru-RU')}
                        </Typography>
                      </TableCell>

                      {/* Harakat tugmalari: 📝 Tahrirlash va >> 360° Profil */}
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                          <Tooltip title="Tezkor tahrirlash">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAbonent(row);
                              }}
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.info.main, 0.4),
                                color: 'info.main',
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.info.main, 0.12)
                                }
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Abonent 360° profiliga o'tish">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/abonent/${row.id}/details`);
                              }}
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.success.main, 0.4),
                                color: 'success.main',
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.success.main, 0.12)
                                }
                              }}
                            >
                              <KeyboardDoubleArrowRightIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 3. Pastki Sahifalash Paneli (Toza Makon uslubida: [15 v] [1] [>]  << < 1 2 3 ... > >>  53776 tadan 1-15) */}
        <Box
          sx={{
            p: 1.5,
            px: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          {/* Chap: Sahifa hajmi va Sahifaga sakrash */}
          <Stack
            component="form"
            onSubmit={handleJumpPage}
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center' }}
          >
            <TextField
              select
              size="small"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              sx={{ width: 78 }}
            >
              {[15, 30, 50, 100].map((sz) => (
                <MenuItem key={sz} value={sz}>
                  {sz}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value.replace(/[^0-9]/g, ''))}
              sx={{ width: 68 }}
              slotProps={{
                htmlInput: {
                  style: { textAlign: 'center', padding: '6px 8px' }
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color={isGreenZone ? 'success' : 'info'}
              sx={{
                minWidth: 38,
                px: 1,
                py: 0.7,
                borderRadius: 1.5
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </Button>
          </Stack>

          {/* O'rta: Pagination raqamlari */}
          <Pagination
            count={Math.max(1, totalPages)}
            page={page + 1}
            onChange={(_, newPage) => setPage(newPage - 1)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
            sx={{
              '& .Mui-selected': {
                bgcolor: `${accentColor} !important`,
                color: 'common.white'
              }
            }}
          />

          {/* O'ng: Jami abonentlar soni */}
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {totalElements.toLocaleString('ru-RU')} tadan {startItem} dan {endItem} gacha
          </Typography>
        </Box>
      </Paper>

      {/* O'ng tomondan chiqadigan Filter Drawer */}
      <AbonentsFilterDrawer
        open={filterDrawerOpen}
        dataSource={dataSource}
        filters={draftFilters}
        onChangeFilter={handleChangeDraftFilter}
        onApply={handleApplyDrawerFilters}
        onReset={() => {
          handleResetAllFilters();
          setFilterDrawerOpen(false);
        }}
        onClose={() => setFilterDrawerOpen(false)}
      />

      {/* Tezkor Tahrirlash Modali */}
      <QuickEditAbonentModal
        open={Boolean(editingAbonent)}
        abonent={editingAbonent}
        dataSource={dataSource}
        mahallas={mahallas}
        onClose={() => setEditingAbonent(null)}
        onSaved={handleSavedAbonent}
        onOpenProfile={(id) => navigate(`/abonent/${id}/details`)}
      />
    </Box>
  );
}
