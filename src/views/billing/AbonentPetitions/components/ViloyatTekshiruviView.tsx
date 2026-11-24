import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  RuleFolderOutlined,
  OpenInNew,
  AccountCircleOutlined
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

const DOC_TYPES = [
  { id: 'all', label: 'Barcha turlar' },
  { id: 'odam_soni', label: 'Odam soni kamayishi' },
  { id: 'vafot', label: 'Vafot etganlik' },
  { id: 'dvaynik', label: 'Ikkilamchi kod (Dvaynik)' },
  { id: 'pul_kuchirish', label: 'Pul ko‘chirish' },
  { id: 'yashovchi_kuchirish', label: 'Yashovchini ko‘chirish' },
  { id: 'cancelContract', label: 'Shartnomani bekor qilish' },
  { id: 'viza', label: 'Viza (Xorijga chiqish)' },
  { id: 'gps', label: 'GPS / Xizmat ko‘rsatilmagan' }
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

  const [openSearchModal, setOpenSearchModal] = useState<boolean>(false);
  const [modalSearchInput, setModalSearchInput] = useState<string>('');
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

  // Sync selected ariza ID if changed externally from URL
  useEffect(() => {
    if (selectedIdFromUrl && selectedIdFromUrl !== selectedArizaId) {
      setSelectedArizaId(selectedIdFromUrl);
    }
  }, [selectedIdFromUrl]);

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

      if (period !== 'all' && !modalSearchInput.trim()) {
        params.created_from_date = dayjs(`${period}-01`).startOf('month').toISOString();
        params.created_to_date = dayjs(`${period}-01`).endOf('month').toISOString();
      }

      if (activeStatus !== 'all') {
        params.ariza_status = activeStatus;
      }

      if (docTypeFilter !== 'all') {
        params.document_type = docTypeFilter;
      }

      if (modalSearchInput.trim()) {
        params.search = modalSearchInput.trim();
      }

      const res = await api.get('/arizalar', { params });
      const data = res.data?.data || [];
      const total = res.data?.meta?.total || 0;

      setListRows(data);
      setTotalCount(total);

      // Auto-select first item if none selected
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
  }, [page, limit, period, activeStatus, docTypeFilter, modalSearchInput, selectedArizaId, onSelectId]);

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
          const cleanFileId = arizaData.aktInfo.fileId.includes('*')
            ? arizaData.aktInfo.fileId.split('*').pop()
            : arizaData.aktInfo.fileId;
          const fileRes = await api.get('/billing/get-file/', {
            params: { file_id: cleanFileId },
            headers: { 'hide-error': true }
          });
          setPdfBase64(fileRes.data?.file || null);
        } catch {
          setPdfBase64(null);
        }
      } else if (arizaData?.akt_id) {
        try {
          const actFileRes = await api.get(`/billing/get-act-file/${arizaData.akt_id}`);
          setPdfBase64(actFileRes.data?.file || null);
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
    setSelectedAriza(item);
    if (onSelectId) onSelectId(item._id);
    setOpenSearchModal(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchList();
  };

  // If user hits enter on a search with 1 match: directly select it and close modal
  const handleInputKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsLoadingList(true);
      try {
        const params: any = {
          page: 1,
          limit: 15,
          search: modalSearchInput.trim()
        };
        const res = await api.get('/arizalar', { params });
        const results = res.data?.data || [];
        setListRows(results);
        setTotalCount(res.data?.meta?.total || 0);

        if (results.length === 1) {
          handleSelectAriza(results[0]);
          toast.success(`Ariza topildi: #${results[0].document_number || results[0].licshet}`);
        }
      } finally {
        setIsLoadingList(false);
      }
    }
  };

  const handleClearSearch = () => {
    setModalSearchInput('');
    setPage(1);
  };

  const handleReload = () => {
    fetchList();
    if (selectedArizaId) fetchArizaDetail(selectedArizaId);
    onReload();
  };

  // Index of current ariza in listRows for stepping
  const currentIndex = useMemo(() => {
    if (!selectedArizaId) return -1;
    return listRows.findIndex((r) => r._id === selectedArizaId);
  }, [selectedArizaId, listRows]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prev = listRows[currentIndex - 1];
      setSelectedArizaId(prev._id);
      if (onSelectId) onSelectId(prev._id);
    }
  };

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < listRows.length - 1) {
      const next = listRows[currentIndex + 1];
      setSelectedArizaId(next._id);
      if (onSelectId) onSelectId(next._id);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {/* 1. TOP SLEEK AUDIT BAR (FULL WIDTH, NO LEFT SIDEBAR CLUTTER) */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50'
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
          {/* Active Ariza Key Attributes */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <FactCheckOutlined color="primary" sx={{ fontSize: 24 }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Viloyat tekshiruvi
              </Typography>
            </Stack>

            {selectedAriza && (
              <>
                <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />
                <Chip
                  label={`№ ${selectedAriza.document_number || '---'}`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 800, fontFamily: 'monospace', height: 26 }}
                />
                <Chip
                  label={`Hisob: ${selectedAriza.licshet || '---'}`}
                  sx={{ fontWeight: 700, fontFamily: 'monospace', height: 26 }}
                />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {selectedAriza.fullName || selectedAriza.fio || '—'}
                </Typography>
                <Chip
                  label={
                    selectedAriza.status === 'bekor qilindi'
                      ? 'Bekor qilingan'
                      : selectedAriza.status === 'tasdiqlangan'
                      ? 'Tasdiqlangan'
                      : selectedAriza.status === 'akt_kiritilgan'
                      ? 'Akt kiritilgan'
                      : selectedAriza.status || 'Yangi'
                  }
                  color={
                    selectedAriza.status === 'tasdiqlangan'
                      ? 'success'
                      : selectedAriza.status === 'bekor qilindi'
                      ? 'error'
                      : 'primary'
                  }
                  size="small"
                  sx={{ fontWeight: 700, height: 24 }}
                />
              </>
            )}
          </Stack>

          {/* Stepping & Fast Search Modal Trigger */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {/* Previous / Next Ariza Steppers */}
            <Tooltip title="Oldingi arizaga o‘tish">
              <span>
                <IconButton size="small" onClick={handlePrev} disabled={currentIndex <= 0}>
                  <ChevronLeft />
                </IconButton>
              </span>
            </Tooltip>
            {currentIndex >= 0 && (
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 45, textAlign: 'center' }}>
                {currentIndex + 1} / {listRows.length}
              </Typography>
            )}
            <Tooltip title="Keyingi arizaga o‘tish">
              <span>
                <IconButton size="small" onClick={handleNext} disabled={currentIndex < 0 || currentIndex >= listRows.length - 1}>
                  <ChevronRight />
                </IconButton>
              </span>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto', mx: 0.5 }} />

            {/* Fast Search Modal Button */}
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<SearchOutlined />}
              onClick={() => setOpenSearchModal(true)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              Arizani qidirish
            </Button>

            <Tooltip title="Ro‘yxatni yangilash">
              <IconButton size="small" color="primary" onClick={handleReload}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* 2. FULL WIDTH AUDIT DISPLAY (NO WASTED COLUMNS) */}
      <Box sx={{ width: '100%', minHeight: 650 }}>
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
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mb: 2.5 }}>
              Arizani qidirish oynasini oching va hisob raqam, ariza raqami yoki F.I.Sh bo‘yicha qidiring.
            </Typography>
            <Button
              variant="contained"
              startIcon={<SearchOutlined />}
              onClick={() => setOpenSearchModal(true)}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Qidirish oynasini ochish
            </Button>
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

      {/* 3. MODAL: SEARCH & SELECT ARIZA DIALOG */}
      <Dialog
        open={openSearchModal}
        onClose={() => setOpenSearchModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 0.5 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <SearchOutlined color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Arizani qidirish va tanlash
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setOpenSearchModal(false)}>
            <Clear fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Search Input Bar */}
          <Box component="form" onSubmit={handleSearchSubmit}>
            <TextField
              autoFocus
              fullWidth
              size="medium"
              placeholder="Hisob raqam, ariza raqami yoki F.I.Sh yozing va Enter bosing..."
              value={modalSearchInput}
              onChange={(e) => setModalSearchInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: modalSearchInput ? (
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

          {/* Quick Filters */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, flexWrap: 'wrap', gap: 1 }}>
            {/* Status chips */}
            <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', gap: 0.8 }}>
              {STATUS_FILTERS.map((s) => {
                const isSelected = activeStatus === s.id;
                return (
                  <Chip
                    key={s.id}
                    label={s.label}
                    color={s.color as any}
                    variant={isSelected ? 'filled' : 'outlined'}
                    onClick={() => {
                      setActiveStatus(s.id);
                      setPage(1);
                    }}
                    sx={{ fontWeight: 700, cursor: 'pointer' }}
                  />
                );
              })}
            </Stack>

            {/* Document Type Dropdown */}
            <Select
              size="small"
              value={docTypeFilter}
              onChange={(e) => {
                setDocTypeFilter(e.target.value);
                setPage(1);
              }}
              sx={{ minWidth: 170, fontSize: '13px' }}
            >
              {DOC_TYPES.map((dt) => (
                <MenuItem key={dt.id} value={dt.id}>
                  {dt.label}
                </MenuItem>
              ))}
            </Select>
          </Stack>

          {/* Results Table */}
          <Box sx={{ minHeight: 320, maxHeight: 420, overflowY: 'auto' }}>
            {isLoadingList ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
                <CircularProgress size={32} />
              </Box>
            ) : listRows.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 260, color: 'text.secondary' }}>
                <ReceiptLongOutlined sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Hech qanday ariza topilmadi</Typography>
                <Typography variant="caption">Qidiruv so‘zini o‘zgartiring yoki filtrlarni tozalang</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Ariza №</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Hisob raqam</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>F.I.Sh</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Hujjat turi</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Holati</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Akt summasi</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Tanlash</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {listRows.map((row) => {
                      const isCurrent = row._id === selectedArizaId;
                      const isRowCancelled = row.status === 'bekor qilindi';
                      const isRowConfirmed = row.status === 'tasdiqlangan';
                      const sum = Number(row.aktSummCounts?.total ?? row.aktSummasi ?? 0);

                      return (
                        <TableRow
                          key={row._id}
                          hover
                          onClick={() => handleSelectAriza(row)}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: isCurrent ? 'action.selected' : 'inherit'
                          }}
                        >
                          <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                            #{row.document_number || '---'}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            {row.licshet}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {row.fullName || row.fio || '—'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.document_type || 'odam_soni'}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '11px', height: 20, fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={isRowCancelled ? 'Bekor qilingan' : isRowConfirmed ? 'Tasdiqlangan' : row.status}
                              size="small"
                              color={isRowConfirmed ? 'success' : isRowCancelled ? 'error' : 'default'}
                              sx={{ fontSize: '11px', height: 20, fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                            {sum.toLocaleString()} so'm
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Button
                              size="small"
                              variant={isCurrent ? 'contained' : 'outlined'}
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAriza(row);
                              }}
                              sx={{ textTransform: 'none', fontSize: '11px', height: 24, px: 1.2 }}
                            >
                              {isCurrent ? 'Ochiq' : 'Ochish'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Pagination in Modal */}
          {totalCount > limit && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Jami: <b>{totalCount}</b> ta ariza
              </Typography>
              <Pagination
                count={Math.ceil(totalCount / limit)}
                page={page}
                onChange={(_, p) => setPage(p)}
                size="small"
                color="primary"
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ViloyatTekshiruviView;
