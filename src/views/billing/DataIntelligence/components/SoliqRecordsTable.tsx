import React, { useEffect, useState } from 'react';
import {
  Card,
  Box,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Chip,
  Tabs,
  Tab,
  Button,
  useTheme,
  alpha,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search,
  CheckCircleOutlineOutlined,
  WarningAmberRounded,
  HighlightOffRounded,
  HourglassEmptyRounded,
  CompareArrows,
  RefreshRounded,
  GroupOutlined,
  PersonAddAlt1Outlined,
  BadgeOutlined,
  FileDownloadOutlined,
  FilterAltOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { useDataIntelligenceStore } from '../store/useDataIntelligenceStore';
import { CodeOpeningPreparationModal } from './CodeOpeningPreparationModal';
import { ConflictResolutionModal } from './ConflictResolutionModal';
import { ExternalRegistryItem, getGroupColor, getGroupLabel } from './RegistryManagerModal';

export interface SoliqRecordsTableProps {
  fixedRegistryId?: string;
  fixedRegistryName?: string;
  onRefreshParentStats?: () => void;
  activeStatusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  refreshTrigger?: number;
  onStatsUpdate?: (stats: { total: number; matched: number; conflict: number; unmatched: number; pending: number }) => void;
}

export const SoliqRecordsTable: React.FC<SoliqRecordsTableProps> = ({
  fixedRegistryId,
  fixedRegistryName,
  onRefreshParentStats,
  activeStatusFilter,
  onStatusFilterChange,
  refreshTrigger,
  onStatsUpdate
}) => {
  const theme = useTheme();
  const { startCandidateSearchForStagingRecord } = useDataIntelligenceStore();

  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [statusFilter, setStatusFilter] = useState(activeStatusFilter || 'all');
  const [sourceGroupFilter, setSourceGroupFilter] = useState<string>('all');
  const [mvdStatusFilter, setMvdStatusFilter] = useState<string>('all');
  const [selectedRegistryId, setSelectedRegistryId] = useState<string>(fixedRegistryId || 'all');

  useEffect(() => {
    if (activeStatusFilter !== undefined && activeStatusFilter !== statusFilter) {
      setStatusFilter(activeStatusFilter);
      setPage(0);
    }
  }, [activeStatusFilter]);
  const [registries, setRegistries] = useState<ExternalRegistryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedRecordForCodeOpening, setSelectedRecordForCodeOpening] = useState<any | null>(null);
  const [selectedRecordForConflict, setSelectedRecordForConflict] = useState<any | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    matched: 0,
    conflict: 0,
    unmatched: 0
  });

  const loadRegistries = async () => {
    if (fixedRegistryId) return;
    try {
      const res = await api.get('/data-intelligence/registries', { params: { limit: 100 } });
      if (res.data?.ok) {
        setRegistries(res.data.data || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (fixedRegistryId) {
      setSelectedRegistryId(fixedRegistryId);
    } else {
      loadRegistries();
    }
  }, [fixedRegistryId]);

  const fetchRecords = async (
    targetPage = page,
    targetStatus = statusFilter,
    targetSearch = searchQuery,
    targetGroup = sourceGroupFilter,
    targetRegId = fixedRegistryId || selectedRegistryId,
    targetMvdStatus = mvdStatusFilter
  ) => {
    setLoading(true);
    try {
      const res = await api.get('/data-intelligence/soliq-records', {
        params: {
          page: targetPage + 1,
          limit: rowsPerPage,
          status: targetStatus !== 'all' ? targetStatus : undefined,
          search: targetSearch.trim() || undefined,
          sourceGroup: targetGroup !== 'all' ? targetGroup : undefined,
          listId: (fixedRegistryId || (targetRegId !== 'all' ? targetRegId : undefined)),
          mvdStatus: targetMvdStatus !== 'all' ? targetMvdStatus : undefined
        }
      });

      if (res.data?.ok) {
        setRecords(res.data.data || []);
        setTotal(res.data.meta?.total || 0);
        if (res.data.statistics) {
          setStats(res.data.statistics);
          if (onStatsUpdate) {
            onStatsUpdate(res.data.statistics);
          }
        }
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(page, statusFilter, searchQuery, sourceGroupFilter, selectedRegistryId, mvdStatusFilter);
  }, [page, rowsPerPage, statusFilter, sourceGroupFilter, selectedRegistryId, mvdStatusFilter, refreshTrigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchRecords(0, statusFilter, searchQuery, sourceGroupFilter, selectedRegistryId, mvdStatusFilter);
  };

  const handleTabChange = (_: React.SyntheticEvent, newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(0);
    if (onStatusFilterChange) {
      onStatusFilterChange(newStatus);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await api.get('/data-intelligence/soliq-records/export-excel', {
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          sourceGroup: sourceGroupFilter !== 'all' ? sourceGroupFilter : undefined,
          listId: (fixedRegistryId || (selectedRegistryId !== 'all' ? selectedRegistryId : undefined)),
          mvdStatus: mvdStatusFilter !== 'all' ? mvdStatusFilter : undefined
        },
        responseType: 'blob'
      });

      const statusLabels: Record<string, string> = {
        matched: 'Mos_kelganlar',
        conflict: 'Ziddiyatlilar',
        unmatched: 'Topilmaganlar',
        pending: 'Kutilayotganlar',
        all: 'Barchasi'
      };
      const filterLabel = statusLabels[statusFilter] || 'Barchasi';
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `Soliq_yozuvlari_${filterLabel}_${dateStr}.xlsx`;

      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success(`Excel fayli muvaffaqiyatli yuklab olindi (${filterLabel.replace('_', ' ')})`);
    } catch (err: any) {
      console.error('Error exporting excel:', err);
      toast.error('Excel faylini yuklab olishda xatolik yuz berdi');
    } finally {
      setExporting(false);
    }
  };

  const handleInspectRecord = (rec: any) => {
    startCandidateSearchForStagingRecord({
      id: rec._id,
      fullName: rec.fullName,
      pnfl: rec.pnfl,
      cadastreNumber: rec.cadastreNumber,
      mahalla: rec.mahalla,
      street: rec.street,
      phone: rec.phone,
      objectType: rec.objectType,
      source: 'soliq'
    });
  };

  const getStatusBadge = (row: any) => {
    const status = row?.status;
    const score = row?.matchScore;
    switch (status) {
      case 'matched':
        return (
          <Tooltip title="Moslik ma'lumotlarini ko'rish">
            <Chip
              icon={<CheckCircleOutlineOutlined sx={{ fontSize: 16 }} />}
              label={`${score || 85}% Mos keldi`}
              color="success"
              size="small"
              clickable
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRecordForConflict(row);
              }}
              sx={{ fontWeight: 600, cursor: 'pointer' }}
            />
          </Tooltip>
        );
      case 'conflict':
        return (
          <Tooltip title="Ziddiyatni ko'rish va yechish uchun bosing">
            <Chip
              icon={<WarningAmberRounded sx={{ fontSize: 16 }} />}
              label={`${score || 50}% Ziddiyatli`}
              color="warning"
              size="small"
              clickable
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRecordForConflict(row);
              }}
              sx={{ fontWeight: 700, cursor: 'pointer', boxShadow: 1 }}
            />
          </Tooltip>
        );
      case 'unmatched':
        return (
          <Tooltip title="Nomzodlarni ko'rish yoki yangi abonent ochish">
            <Chip
              icon={<HighlightOffRounded sx={{ fontSize: 16 }} />}
              label="Topilmadi (Yangi)"
              color="error"
              size="small"
              clickable
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRecordForConflict(row);
              }}
              sx={{ fontWeight: 600, cursor: 'pointer' }}
            />
          </Tooltip>
        );
      case 'pending':
      default:
        return (
          <Chip
            icon={<HourglassEmptyRounded sx={{ fontSize: 16 }} />}
            label="Kutilmoqda"
            color="default"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
    }
  };

  return (
    <>
      <Card sx={{ borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, mt: 3 }}>
        {/* Table Header & Filters */}
        <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: `1px solid ${theme.palette.divider}` }}>
          {/* Faqat Global ko'rinishda (barcha ro'yxatlar bo'yicha bo'lsa) Sarlavha va Guruh filtrlarini ko'rsatish */}
          {!fixedRegistryId && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Tashqi Bazalar va Ro'yxatlar Yozuvlari ({stats.total} ta)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Soliq, Elektr, Kadastr va boshqa tashqi manbalar yozuvlari hamda GreenZone solishtirish natijalari
                </Typography>
              </Box>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  mb: 2,
                  flexWrap: 'wrap',
                  gap: 1.5
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mr: 0.5 }}>
                    Guruh:
                  </Typography>
                  {[
                    { id: 'all', label: 'Barchasi' },
                    { id: 'soliq', label: 'Soliq' },
                    { id: 'elektr', label: 'Elektr' },
                    { id: 'kadastr', label: 'Kadastr' },
                    { id: 'mib', label: 'MIB' },
                    { id: 'gaz', label: 'Gaz' },
                    { id: 'boshqa', label: 'Boshqa' }
                  ].map((g) => (
                    <Chip
                      key={g.id}
                      label={g.label}
                      clickable
                      color={sourceGroupFilter === g.id ? 'primary' : 'default'}
                      variant={sourceGroupFilter === g.id ? 'filled' : 'outlined'}
                      size="small"
                      onClick={() => {
                        setSourceGroupFilter(g.id);
                        setPage(0);
                      }}
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Stack>

                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel id="records-table-reg-select-label">Ro'yxat bo'yicha</InputLabel>
                  <Select
                    labelId="records-table-reg-select-label"
                    value={selectedRegistryId}
                    label="Ro'yxat bo'yicha"
                    onChange={(e) => {
                      setSelectedRegistryId(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="all">Barcha ro'yxatlar</MenuItem>
                    {registries.map((reg) => (
                      <MenuItem key={reg._id} value={reg._id}>
                        {reg.name} ({reg.group?.toUpperCase()})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </>
          )}

          {/* Asosiy qator: Chapda Status Tablari va O'ngda Flex bo'lib Qidiruv + Excelga Eksport */}
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1.5}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', lg: 'center' },
              mb: 1.2
            }}
          >
            {/* Status Filter Tabs */}
            <Tabs
              value={statusFilter}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 38,
                flexShrink: 1,
                '& .MuiTab-root': {
                  minHeight: 38,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  py: 0.5,
                  px: 1.5
                }
              }}
            >
              <Tab value="all" label={`Barchasi (${stats.total})`} />
              <Tab value="matched" label={`🟢 Mos kelganlar (${stats.matched})`} />
              <Tab value="conflict" label={`🟠 Ziddiyatlilar (${stats.conflict})`} />
              <Tab value="unmatched" label={`🔴 Topilmaganlar (${stats.unmatched})`} />
              <Tab value="pending" label={`⏳ Kutilmoqda (${stats.pending})`} />
            </Tabs>

            {/* Qidiruv + Excelga Eksport */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                flexShrink: 0,
                justifyContent: { xs: 'flex-start', sm: 'flex-end' }
              }}
            >
              <Box component="form" onSubmit={handleSearchSubmit} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <TextField
                  size="small"
                  placeholder="F.I.Sh, JShShIR, Kadastr..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: { xs: '100%', sm: 220 } }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Box>

              {!fixedRegistryId && (
                <IconButton size="small" onClick={() => fetchRecords()} title="Jadvalni yangilash">
                  <RefreshRounded fontSize="small" />
                </IconButton>
              )}

              {/* Excel Download Button */}
              <Tooltip title={`Filtrlangan (${statusFilter === 'all' ? 'Barchasi' : statusFilter}) yozuvlarni Excel fayl qilib yuklab olish`}>
                <span>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <FileDownloadOutlined />}
                    onClick={handleExportExcel}
                    disabled={exporting || stats.total === 0}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      px: 1.6,
                      py: 0.6,
                      whiteSpace: 'nowrap',
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.06)
                      }
                    }}
                  >
                    {exporting ? 'Yuklanmoqda...' : 'Excelga eksport'}
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Stack>

          {/* MVD Propiska Filter Chips */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              flexWrap: 'wrap',
              pt: 1.2,
              borderTop: `1px dashed ${alpha(theme.palette.divider, 0.6)}`
            }}
          >
            <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mr: 0.5 }}>
              <GroupOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem' }}>
                MVD Odam soni:
              </Typography>
            </Stack>
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'with_mvd', label: '👥 Propiska bor (>0 kishi)' },
              { id: 'zero_mvd', label: "⭕ 0 kishi (propiska yo'q)" },
              { id: 'without_mvd', label: '⏳ Tekshirilmagan' }
            ].map((m) => (
              <Chip
                key={m.id}
                label={m.label}
                clickable
                color={mvdStatusFilter === m.id ? 'secondary' : 'default'}
                variant={mvdStatusFilter === m.id ? 'filled' : 'outlined'}
                size="small"
                onClick={() => {
                  setMvdStatusFilter(m.id);
                  setPage(0);
                }}
                sx={{
                  fontWeight: mvdStatusFilter === m.id ? 700 : 500,
                  fontSize: '0.78rem'
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Table Content */}
        <TableContainer sx={{ minHeight: 320 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: alpha(theme.palette.divider, 0.04) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Guruh / Ro'yxat</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>F.I.Sh</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>JShShIR / Kadastr</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mahalla & Manzil</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>MVD Propiska / Odam Soni</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mos Kelgan GreenZone</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Amallar
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Ma'lumotlar yuklanmoqda...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Yozuvlar topilmadi
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Excel fayl yuklang yoki qidiruv filtrlarini o'zgartiring
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((row, idx) => (
                  <TableRow key={row._id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>

                    {/* Guruh va Ro'yxat */}
                    <TableCell>
                      <Chip
                        label={getGroupLabel(row.sourceGroup || (row.listId && typeof row.listId === 'object' ? row.listId.group : 'soliq'))}
                        color={getGroupColor(row.sourceGroup || (row.listId && typeof row.listId === 'object' ? row.listId.group : 'soliq'))}
                        size="small"
                        sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, mb: 0.5 }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          maxWidth: 130,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {row.listId && typeof row.listId === 'object' ? row.listId.name : 'Asosiy'}
                      </Typography>
                    </TableCell>

                    {/* FIO */}
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {row.fullName || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.objectType || 'Aholi'}
                      </Typography>
                    </TableCell>

                    {/* PNFL & Cadastre */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {row.pnfl || '—'}
                      </Typography>
                      {row.cadastreNumber && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'monospace' }}>
                          {row.cadastreNumber}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Mahalla & Street */}
                    <TableCell>
                      <Typography variant="body2">{row.mahalla || '—'}</Typography>
                      {row.street && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {row.street}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(row)}</TableCell>

                    {/* MVD Propiska / Suggested People Count */}
                    <TableCell>
                      {row.cadastreNumber ? (
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          {row.suggestedPeopleCount !== undefined && row.suggestedPeopleCount > 0 ? (
                            <Tooltip title="MVD Propiska ma'lumotlari va a'zolarni ko'rish">
                              <Chip
                                icon={<GroupOutlined sx={{ fontSize: 15 }} />}
                                label={`${row.suggestedPeopleCount} kishi`}
                                color="success"
                                size="small"
                                onClick={() => setSelectedRecordForCodeOpening(row)}
                                clickable
                                sx={{ fontWeight: 700, cursor: 'pointer' }}
                              />
                            </Tooltip>
                          ) : row.mvdEnrichedAt ? (
                            <Tooltip title="MVD bo'yicha propiskada odam yo'q (0 kishi). Ko'rish uchun bosing">
                              <Chip
                                icon={<GroupOutlined sx={{ fontSize: 15 }} />}
                                label="0 kishi"
                                color="default"
                                size="small"
                                onClick={() => setSelectedRecordForCodeOpening(row)}
                                clickable
                                sx={{ fontWeight: 600, cursor: 'pointer' }}
                              />
                            </Tooltip>
                          ) : (
                            <Button
                              size="small"
                              variant="text"
                              color="secondary"
                              startIcon={<GroupOutlined sx={{ fontSize: 16 }} />}
                              onClick={() => setSelectedRecordForCodeOpening(row)}
                              sx={{ textTransform: 'none', fontSize: '0.75rem', p: 0.5 }}
                            >
                              MVD Propiska
                            </Button>
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          Kadastr yo'q
                        </Typography>
                      )}
                    </TableCell>

                    {/* Matched GreenZone Abonent */}
                    <TableCell>
                      {row.matchedAbonent ? (
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {row.matchedAbonent.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.matchedAbonent.accountNumber ? `#${row.matchedAbonent.accountNumber}` : ''} •{' '}
                            {row.matchedAbonent.mahallaName || ''}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          Mos abonent topilmagan
                        </Typography>
                      )}
                    </TableCell>

                    {/* Action */}
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        {row.status === 'conflict' ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            startIcon={<WarningAmberRounded />}
                            onClick={() => setSelectedRecordForConflict(row)}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: '0.72rem', px: 1.5 }}
                          >
                            Ziddiyatni yechish
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<CompareArrows />}
                            onClick={() => setSelectedRecordForConflict(row)}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: '0.72rem', px: 1.5 }}
                          >
                            Nomzodlar
                          </Button>
                        )}

                        {row.status !== 'matched' && row.cadastreNumber && (
                          <Tooltip title="Kadastr va MVD ma'lumotlari bilan yangi abonent kodini ochish">
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              startIcon={<PersonAddAlt1Outlined />}
                              onClick={() => setSelectedRecordForCodeOpening(row)}
                              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: '0.72rem', px: 1.5 }}
                            >
                              Kod ochish
                            </Button>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Qatorlar soni:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} / jami: ${count !== -1 ? count : `${to} dan ortiq`}`}
        />
      </Card>

      {/* Code Opening & MVD Propiska Preparation Modal */}
      <CodeOpeningPreparationModal
        open={Boolean(selectedRecordForCodeOpening)}
        onClose={() => setSelectedRecordForCodeOpening(null)}
        soliqRecord={selectedRecordForCodeOpening}
        onSaved={() => {
          fetchRecords();
          onRefreshParentStats?.();
        }}
      />

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        open={Boolean(selectedRecordForConflict)}
        onClose={() => setSelectedRecordForConflict(null)}
        soliqRecord={selectedRecordForConflict}
        onResolved={() => {
          fetchRecords();
          onRefreshParentStats?.();
        }}
      />
    </>
  );
};
