import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  SearchOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  Refresh,
  FilterAltOutlined,
  CalendarMonth,
  ReceiptLongOutlined,
  ChevronLeft,
  ChevronRight,
  Clear,
  FactCheckOutlined,
  HistoryEduOutlined,
  AssignmentTurnedInOutlined,
  ErrorOutlineOutlined,
  RuleFolderOutlined
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from 'utils/api';
import ArizaAuditBreakdown from './ArizaAuditBreakdown';
import { formatPeriodLabel } from './PeriodHeader';

interface ViloyatTekshiruviViewProps {
  period: string;
  onPeriodChange: (p: string) => void;
  onOpenRejectDialog: (row: any) => void;
  onMoveToInbox: (id: string) => void;
  onPrint: (id: string) => void;
  printingId: string | null;
  onReload: () => void;
  onOpenActChanger?: () => void;
  onOpenImageModal?: () => void;
  selectedIdFromUrl?: string | null;
  onSelectId?: (id: string | null) => void;
}

const STATUS_FILTERS = [
  { id: 'all', label: 'Barchasi', color: 'default' },
  { id: 'tasdiqlangan', label: 'Tasdiqlangan', color: 'success', icon: CheckCircleOutlined },
  { id: 'bekor qilindi', label: 'Bekor qilingan', color: 'error', icon: CancelOutlined },
  { id: 'akt_kiritilgan', label: 'Akt kiritilgan', color: 'primary', icon: FactCheckOutlined },
  { id: 'yangi', label: 'Yangi / Kutilmoqda', color: 'warning', icon: HistoryEduOutlined }
];

export const ViloyatTekshiruviView: React.FC<ViloyatTekshiruviViewProps> = ({
  period,
  onPeriodChange,
  onOpenRejectDialog,
  onMoveToInbox,
  onPrint,
  printingId,
  onReload,
  onOpenActChanger,
  onOpenImageModal,
  selectedIdFromUrl,
  onSelectId
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all');
  const [selectedAriza, setSelectedAriza] = useState<any>(null);
  const [selectedArizaId, setSelectedArizaId] = useState<string | null>(selectedIdFromUrl || null);

  const [listRows, setListRows] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);

  // Sync selected ariza ID if changed externally
  useEffect(() => {
    if (selectedIdFromUrl && selectedIdFromUrl !== selectedArizaId) {
      setSelectedArizaId(selectedIdFromUrl);
    }
  }, [selectedIdFromUrl]);

  // Agar tanlangan ariza ro'yxatda (masalan boshqa oylik filtrda) bo'lmasa, uni ro'yxat boshiga qo'shib ko'rsatamiz
  const displayedList = useMemo(() => {
    if (selectedAriza && selectedAriza._id && !listRows.some((r) => r._id === selectedAriza._id)) {
      return [selectedAriza, ...listRows];
    }
    return listRows;
  }, [selectedAriza, listRows]);

  // Fetch arizalar list for the audit panel
  const fetchList = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const params: any = {
        page,
        limit,
        sortField: 'sana',
        sortDirection: 'desc'
      };

      if (period !== 'all' && !searchQuery.trim()) {
        params.created_from_date = dayjs(`${period}-01`).startOf('month').toISOString();
        params.created_to_date = dayjs(`${period}-01`).endOf('month').toISOString();
      }

      if (activeStatus !== 'all') {
        params.ariza_status = activeStatus;
      }

      if (docTypeFilter !== 'all') {
        params.document_type = docTypeFilter;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get('/arizalar', { params });
      const data = res.data?.data || [];
      const total = res.data?.meta?.total || 0;

      setListRows(data);
      setTotalCount(total);

      // Auto-select first item if none selected or if selected item not in current list
      if (data.length > 0 && !selectedArizaId) {
        setSelectedArizaId(data[0]._id);
        if (onSelectId) onSelectId(data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching audit arizas:', err);
      toast.error('Arizalar ro‘yxatini yuklashda xatolik yuz berdi');
    } finally {
      setIsLoadingList(false);
    }
  }, [page, limit, period, activeStatus, docTypeFilter, searchQuery, selectedArizaId, onSelectId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Fetch full details of the currently selected Ariza
  const fetchArizaDetail = useCallback(async (id: string) => {
    setIsLoadingDetail(true);
    setPdfBase64(null);
    try {
      const res = await api.get(`/arizalar/${id}`);
      const arizaData = res.data?.ariza;
      setSelectedAriza(arizaData);

      // Fetch PDF
      if (arizaData?.aktInfo?.fileId) {
        try {
          const fileRes = await api.get('/billing/get-file/', {
            params: { file_id: arizaData.aktInfo.fileId },
            headers: { 'hide-error': true }
          });
          setPdfBase64(fileRes.data?.file || null);
        } catch {
          setPdfBase64(null);
        }
      }
    } catch (err) {
      console.error('Error loading ariza detail:', err);
      toast.error('Ariza tafsilotlarini yuklashda xatolik');
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (selectedArizaId) {
      fetchArizaDetail(selectedArizaId);
    } else {
      setSelectedAriza(null);
      setPdfBase64(null);
    }
  }, [selectedArizaId, fetchArizaDetail]);

  const handleSelectAriza = (item: any) => {
    setSelectedArizaId(item._id);
    if (onSelectId) onSelectId(item._id);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchList();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  const handleReload = () => {
    fetchList();
    if (selectedArizaId) fetchArizaDetail(selectedArizaId);
    onReload();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* AUDIT TOP TOOLBAR & FILTER BAR */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50'
        }}
      >
        <Stack spacing={1.5}>
          {/* Row 1: Title, Period selector, Search & Reload */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <FactCheckOutlined color="primary" sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  Viloyat tekshiruvi & Audit ekspertizasi
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tekshirilgan, tasdiqlangan, bekor qilingan va muammoli arizalarni tahlil qilish, qachondan qanday hisoblanganini aniqlash UI
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Period Selector Quick Button */}
              <Tooltip title="Davrni o‘zgartirish">
                <Chip
                  icon={<CalendarMonth sx={{ fontSize: '16px !important' }} />}
                  label={formatPeriodLabel(period)}
                  onClick={() => onPeriodChange(period === 'all' ? dayjs().format('YYYY-MM') : 'all')}
                  variant="outlined"
                  color="primary"
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
              </Tooltip>

              {/* Live Search Input */}
              <Box component="form" onSubmit={handleSearchSubmit} sx={{ width: { xs: '100%', sm: 260 } }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Hisob raqam, ariza № yoki F.I.Sh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlined fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={handleClearSearch}>
                            <Clear fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null
                    }
                  }}
                />
              </Box>

              <Tooltip title="Yangilash">
                <IconButton color="primary" onClick={handleReload}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Row 2: Status Filter Chips & Category Dropdown */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
          >
            <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', gap: 0.8 }}>
              {STATUS_FILTERS.map((s) => {
                const isSelected = activeStatus === s.id;
                const IconComponent = s.icon;
                return (
                  <Chip
                    key={s.id}
                    icon={IconComponent ? <IconComponent sx={{ fontSize: '15px !important' }} /> : undefined}
                    label={s.label}
                    color={s.color as any}
                    variant={isSelected ? 'filled' : 'outlined'}
                    onClick={() => {
                      setActiveStatus(s.id);
                      setPage(1);
                    }}
                    sx={{
                      fontWeight: 700,
                      cursor: 'pointer',
                      px: 0.5,
                      '&:hover': { opacity: 0.9 }
                    }}
                  />
                );
              })}
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Jami: <b>{totalCount}</b> ta ariza
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* MAIN TWO-COLUMN AUDIT COCKPIT */}
      <Grid container spacing={2}>
        {/* LEFT COLUMN: LIST OF AUDITED ARIZAS */}
        <Grid size={{ xs: 12, md: 4.5, lg: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              height: 'calc(100vh - 220px)',
              minHeight: 600,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}>
                Arizalar reestri
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {listRows.length} ko‘rsatilmoqda
              </Typography>
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            {/* List Body */}
            <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {isLoadingList ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : displayedList.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 250,
                    textAlign: 'center',
                    p: 2,
                    color: 'text.disabled'
                  }}
                >
                  <ReceiptLongOutlined sx={{ fontSize: 44, mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Arizalar topilmadi
                  </Typography>
                  <Typography variant="caption">Tanlangan filtrlar bo‘yicha ariza mavjud emas</Typography>
                </Box>
              ) : (
                displayedList.map((row) => {
                  const isSelected = selectedArizaId === row._id;
                  const isRowCancelled = row.status === 'bekor qilindi';
                  const isRowConfirmed = row.status === 'tasdiqlangan';
                  const periodsCount = Array.isArray(row.recalculationPeriods) ? row.recalculationPeriods.length : 0;
                  const actId = row.akt_id || row.aktInfo?.id;
                  const historyCount = Array.isArray(row.actHistory) ? row.actHistory.length : 0;

                  return (
                    <Paper
                      key={row._id}
                      elevation={0}
                      onClick={() => handleSelectAriza(row)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : isRowCancelled ? 'error.light' : 'divider',
                        bgcolor: isSelected
                          ? theme.palette.mode === 'dark'
                            ? 'action.selected'
                            : 'primary.50'
                          : 'background.paper',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          boxShadow: 2
                        }
                      }}
                    >
                      <Stack spacing={0.8}>
                        {/* Top: Doc # & Status & Akt ID */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                              #{row.document_number || '---'}
                            </Typography>
                            {actId && (
                              <Chip
                                label={`Akt #${actId}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ height: 18, fontSize: '10px', fontWeight: 700 }}
                              />
                            )}
                            {historyCount > 0 && (
                              <Chip
                                label={`+${historyCount} akt`}
                                size="small"
                                color="warning"
                                variant="filled"
                                sx={{ height: 18, fontSize: '10px', fontWeight: 800, px: 0.2 }}
                              />
                            )}
                          </Stack>

                          <Chip
                            label={
                              isRowCancelled
                                ? 'Bekor qilingan'
                                : isRowConfirmed
                                ? 'Tasdiqlangan'
                                : row.status === 'akt_kiritilgan'
                                ? 'Akt kiritilgan'
                                : row.status
                            }
                            size="small"
                            color={isRowConfirmed ? 'success' : isRowCancelled ? 'error' : 'primary'}
                            sx={{ height: 20, fontSize: '11px', fontWeight: 700 }}
                          />
                        </Box>

                        {/* FIO & Licshet */}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
                            {row.fullName || row.fio || '—'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontWeight: 600 }}>
                            {row.licshet || '—'}
                          </Typography>
                        </Box>

                        {/* Cancellation reason snippet if cancelled */}
                        {isRowCancelled && row.canceling_description && (
                          <Box
                            sx={{
                              p: 0.8,
                              borderRadius: 1,
                              bgcolor: theme.palette.mode === 'dark' ? 'error.900' : 'error.50',
                              border: '1px dashed',
                              borderColor: 'error.light'
                            }}
                          >
                            <Typography variant="caption" color="error.dark" sx={{ fontWeight: 600, display: 'block' }} noWrap>
                              Sabab: {row.canceling_description}
                            </Typography>
                          </Box>
                        )}

                        {/* Bottom: Date & Amount & Periods */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                          <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {row.sana ? dayjs(row.sana).format('DD.MM.YYYY') : '—'}
                            </Typography>

                            {periodsCount > 0 && (
                              <Chip
                                label={`${periodsCount} davr`}
                                size="small"
                                variant="outlined"
                                sx={{ height: 18, fontSize: '10px', fontWeight: 700 }}
                              />
                            )}
                          </Stack>

                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'monospace' }}>
                            {Number(row.aktSummasi || 0).toLocaleString()} so'm
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })
              )}
            </Box>

            {/* Pagination Controls */}
            {totalCount > limit && (
              <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={Math.ceil(totalCount / limit)}
                  page={page}
                  onChange={(_, p) => setPage(p)}
                  size="small"
                  color="primary"
                />
              </Box>
            )}
          </Card>
        </Grid>

        {/* RIGHT COLUMN: COMPLETE AUDIT & VERIFICATION COCKPIT */}
        <Grid size={{ xs: 12, md: 7.5, lg: 8 }}>
          <Box sx={{ height: 'calc(100vh - 220px)', minHeight: 600, overflowY: 'auto', pr: 0.5 }}>
            {isLoadingDetail ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
              </Box>
            ) : !selectedAriza ? (
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 400,
                  p: 4,
                  borderRadius: 3,
                  border: '2px dashed',
                  borderColor: 'divider',
                  textAlign: 'center',
                  bgcolor: 'background.paper'
                }}
              >
                <RuleFolderOutlined sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Tekshirish uchun arizani tanlang
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450 }}>
                  Chap tomondagi ro‘yxatdan istalgan arizani bosing yoki hisob raqam bo‘yicha qidiring. Nega mana bunday hisob-kitob bo‘lgani,
                  qayta hisob davrlari, formula va hujjat fayllari shu yerda ochiladi.
                </Typography>
              </Paper>
            ) : (
              <ArizaAuditBreakdown
                ariza={selectedAriza}
                aktFileURL={pdfBase64}
                onOpenRejectDialog={onOpenRejectDialog}
                onMoveToInbox={onMoveToInbox}
                onPrint={onPrint}
                printingId={printingId}
                onReloadList={handleReload}
                onOpenActChanger={onOpenActChanger}
                onOpenImageModal={onOpenImageModal}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViloyatTekshiruviView;
