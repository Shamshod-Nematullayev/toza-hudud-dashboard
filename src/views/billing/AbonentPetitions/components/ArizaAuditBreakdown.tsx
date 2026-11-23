import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
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
  CalculateOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  InfoOutlined,
  ExpandMore,
  ExpandLess,
  PictureAsPdfOutlined,
  ContentCopy,
  OpenInNew,
  CalendarMonthOutlined,
  GroupOutlined,
  ReceiptLongOutlined,
  PublishedWithChanges,
  RestartAlt,
  MoveToInboxOutlined,
  PrintOutlined,
  CollectionsOutlined,
  DifferenceOutlined,
  FactCheckOutlined,
  HistoryEduOutlined,
  WarningAmberOutlined,
  RuleFolderOutlined,
  CompareArrowsOutlined,
  TableChartOutlined
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from 'utils/api';
import PDFViewer from '../../AbonentPetition/PDFViewer';
import { getCleanAsoslantiruvchi } from '../../CreateAbonentPetition.jsx/useStore';
import { calculateTariffBreakdown, explainCalculationReason, formatPeriodRange, CalculationAuditResult } from '../utils/arizaAuditUtils';
import { useTariff } from 'hooks/useTariff';
import AuditDHJTable from './AuditDHJTable';

interface ArizaAuditBreakdownProps {
  ariza: any;
  aktFileURL?: string | null;
  onOpenRejectDialog?: (row: any) => void;
  onMoveToInbox?: (id: string) => void;
  onPrint?: (id: string) => void;
  printingId?: string | null;
  onReloadList?: () => void;
  onOpenActChanger?: () => void;
  onOpenImageModal?: () => void;
  compact?: boolean;
}

export const ArizaAuditBreakdown: React.FC<ArizaAuditBreakdownProps> = ({
  ariza,
  aktFileURL: initialPdfUrl,
  onOpenRejectDialog,
  onMoveToInbox,
  onPrint,
  printingId,
  onReloadList,
  onOpenActChanger,
  onOpenImageModal,
  compact = false
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { tariffs } = useTariff();

  const [expandedPeriods, setExpandedPeriods] = useState<Record<number, boolean>>({});
  const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(initialPdfUrl || null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isUpdatingFromBilling, setIsUpdatingFromBilling] = useState(false);

  // Inspector interactive checking calculator state
  const [calcStartMonth, setCalcStartMonth] = useState<Dayjs | null>(null);
  const [calcEndMonth, setCalcEndMonth] = useState<Dayjs | null>(dayjs());
  const [calcInhabitants, setCalcInhabitants] = useState<number>(1);
  const [calcResult, setCalcResult] = useState<CalculationAuditResult | null>(null);
  const [showTariffGuide, setShowTariffGuide] = useState(false);

  // Manual or automatic PDF fetcher from Tozamakon
  const handleFetchPdf = async () => {
    setIsLoadingPdf(true);
    try {
      let fileId = ariza?.aktInfo?.fileId || ariza?.fileId;
      if (fileId) {
        const cleanFileId = fileId.includes('*') ? fileId.split('*').pop() : fileId;
        const res = await api.get('/billing/get-file/', {
          params: { file_id: cleanFileId },
          headers: { 'hide-error': true }
        });
        if (res.data?.file) {
          setPdfFileUrl(res.data.file);
          toast.success('PDF fayl muvaffaqiyatli yuklandi');
          return;
        }
      }
      if (ariza?.akt_id) {
        const res = await api.get(`/billing/get-act-file/${ariza.akt_id}`);
        if (res.data?.file) {
          setPdfFileUrl(res.data.file);
          toast.success('Fayl Tozamakon tizimidan muvaffaqiyatli yuklandi');
          return;
        }
      }
      toast.warn('Tozamakonda ushbu arizaga/aktga biriktirilgan fayl topilmadi');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Faylni yuklashda xatolik yuz berdi');
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Initialize PDF if not passed but fileId or akt_id is present
  useEffect(() => {
    if (initialPdfUrl) {
      setPdfFileUrl(initialPdfUrl);
      return;
    }
    const loadInitialPdf = async () => {
      let fileId = ariza?.aktInfo?.fileId || ariza?.fileId;
      if (fileId) {
        setIsLoadingPdf(true);
        try {
          const cleanFileId = fileId.includes('*') ? fileId.split('*').pop() : fileId;
          const res = await api.get('/billing/get-file/', {
            params: { file_id: cleanFileId },
            headers: { 'hide-error': true }
          });
          if (res.data?.file) {
            setPdfFileUrl(res.data.file);
            return;
          }
        } catch (e) {
          // ignore fallback to act file
        } finally {
          setIsLoadingPdf(false);
        }
      }
      if (ariza?.akt_id) {
        setIsLoadingPdf(true);
        try {
          const res = await api.get(`/billing/get-act-file/${ariza.akt_id}`);
          if (res.data?.file) {
            setPdfFileUrl(res.data.file);
            return;
          }
        } catch (e) {
          // ignore
        } finally {
          setIsLoadingPdf(false);
        }
      }
      setPdfFileUrl(null);
    };
    loadInitialPdf();
  }, [ariza, initialPdfUrl]);

  // Set default calculator values from first recalculation period if available
  useEffect(() => {
    if (ariza?.recalculationPeriods && ariza.recalculationPeriods.length > 0) {
      const firstP = ariza.recalculationPeriods[0];
      if (firstP.startDate) setCalcStartMonth(dayjs(firstP.startDate));
      if (firstP.endDate) setCalcEndMonth(dayjs(firstP.endDate));
      if (firstP.yashovchilar_soni) {
        setCalcInhabitants(firstP.yashovchilar_soni);
      } else if (firstP.yashovchiDelta) {
        setCalcInhabitants(Math.abs(firstP.yashovchiDelta));
      }
    } else if (ariza?.sana) {
      setCalcStartMonth(dayjs(ariza.sana).subtract(1, 'year'));
      setCalcEndMonth(dayjs(ariza.sana));
    }
  }, [ariza]);

  // Recalculate on calculator input change
  useEffect(() => {
    if (!calcStartMonth || !calcEndMonth || calcInhabitants <= 0) {
      setCalcResult(null);
      return;
    }
    const res = calculateTariffBreakdown(calcStartMonth, calcEndMonth, calcInhabitants, tariffs);
    setCalcResult(res);
  }, [calcStartMonth, calcEndMonth, calcInhabitants, tariffs]);

  const togglePeriodExpand = (idx: number) => {
    setExpandedPeriods((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const reasonInfo = useMemo(() => explainCalculationReason(ariza), [ariza]);

  const rawPeriods: any[] = useMemo(() => {
    return Array.isArray(ariza?.recalculationPeriods) ? ariza.recalculationPeriods : [];
  }, [ariza]);

  // Sum up recalculation periods
  const recalcTotalSum = useMemo(() => {
    return rawPeriods.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
  }, [rawPeriods]);

  // Total amount from the registered Akt
  const aktAmount = useMemo(() => {
    if (ariza?.aktSummasi !== undefined && ariza?.aktSummasi !== null) {
      return Number(ariza.aktSummasi);
    }
    if (ariza?.aktInfo?.amount !== undefined && ariza?.aktInfo?.amount !== null) {
      return Number(ariza.aktInfo.amount);
    }
    return 0;
  }, [ariza]);

  // Check discrepancy between recalculated periods sum and akt amount
  const discrepancy = useMemo(() => {
    if (rawPeriods.length === 0) return { hasDiscrepancy: false, diff: 0 };
    const diff = Math.abs(recalcTotalSum) - Math.abs(aktAmount);
    return {
      hasDiscrepancy: Math.abs(diff) > 5, // tolerant to 5 sums rounding
      diff: Math.abs(recalcTotalSum) - Math.abs(aktAmount)
    };
  }, [rawPeriods, recalcTotalSum, aktAmount]);

  const handleCopyLicshet = () => {
    if (!ariza?.licshet) return;
    navigator.clipboard.writeText(ariza.licshet);
    toast.success(`Hisob raqami nusxalandi: ${ariza.licshet}`);
  };

  const handleCopyAuditSummary = () => {
    if (!ariza) return;
    const summary = [
      `VILOYAT TEKSHIRUVI VA AUDIT XULOSASI:`,
      `Ariza №: ${ariza.document_number || '-'}`,
      `Hisob raqami: ${ariza.licshet || '-'}`,
      `F.I.Sh: ${ariza.fullName || ariza.fio || '-'}`,
      `Status: ${ariza.status || '-'}`,
      `Hujjat turi: ${ariza.document_type || '-'}`,
      `Sabab: ${reasonInfo.headline}`,
      `Yashovchilar: ${ariza.current_prescribed_cnt ?? '-'} -> ${ariza.next_prescribed_cnt ?? '-'} kishi`,
      ariza.status === 'bekor qilindi' ? `Bekor qilish sababi: ${ariza.canceling_description || '-'}` : '',
      `Akt summasi: ${aktAmount.toLocaleString()} so'm`,
      `Qayta hisob summasi: ${recalcTotalSum.toLocaleString()} so'm`,
      `Tafovut: ${discrepancy.hasDiscrepancy ? `Mavjud (${discrepancy.diff.toLocaleString()} so'm)` : `Mavjud emas (Mos)`}`
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(summary);
    toast.success('Audit xulosasi klipbordga nusxalandi!');
  };

  const handleSyncBilling = async () => {
    if (!ariza?._id) return;
    try {
      setIsUpdatingFromBilling(true);
      await api.put(`/arizalar/update-from-billing/${ariza._id}`);
      toast.success('Billing tizimidan yangilandi!');
      if (onReloadList) onReloadList();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Yangilashda xatolik yuz berdi');
    } finally {
      setIsUpdatingFromBilling(false);
    }
  };

  const warningMessageText = useMemo(() => {
    if (ariza?.aktInfo?.warningMessage) return ariza.aktInfo.warningMessage;
    if (ariza?.warningMessage) return ariza.warningMessage;
    if (ariza?.warning_comment) return ariza.warning_comment;
    if (Array.isArray(ariza?.actHistory)) {
      const w = ariza.actHistory.find((h: any) => h.warningMessage || h.status === 'WARNED');
      if (w?.warningMessage) return w.warningMessage;
      if (w?.reason) return w.reason;
    }
    return null;
  }, [ariza]);

  const warningDateText = useMemo(() => {
    const d = ariza?.aktInfo?.warningDate || ariza?.warningDate;
    return d ? dayjs(d).format('DD.MM.YYYY') : null;
  }, [ariza]);

  const cancellationText = useMemo(() => {
    if (ariza?.canceling_description) return ariza.canceling_description;
    if (ariza?.cancellationConclusion) return ariza.cancellationConclusion;
    if (ariza?.aktInfo?.cancellationReason) return ariza.aktInfo.cancellationReason;
    if (Array.isArray(ariza?.actHistory)) {
      const c = ariza.actHistory.find(
        (h: any) => h.cancellationConclusion || h.status === 'CANCELLED' || h.action === 'cancelled'
      );
      if (c?.cancellationConclusion) return c.cancellationConclusion;
      if (c?.reason) return c.reason;
      if (c?.description) return c.description;
    }
    return null;
  }, [ariza]);

  const cancellationDateText = useMemo(() => {
    const d = ariza?.canceling_date || ariza?.updatedAt;
    return d ? dayjs(d).format('DD.MM.YYYY') : null;
  }, [ariza]);

  const autoAdjustInfo = useMemo(() => {
    if (ariza?.autoAdjust && (ariza.autoAdjust.isAdjusted || ariza.autoAdjust.adjustmentAmount)) {
      return ariza.autoAdjust;
    }
    const arizaDate = ariza?.sana ? dayjs(ariza.sana).startOf('month') : null;
    const aktDate = ariza?.akt_date
      ? dayjs(ariza.akt_date).startOf('month')
      : ariza?.aktInfo?.createdAt
      ? dayjs(ariza.aktInfo.createdAt).startOf('month')
      : ariza?.createdAt
      ? dayjs(ariza.createdAt).startOf('month')
      : null;

    const currentCount = Number(ariza?.current_prescribed_cnt ?? 0);
    const nextCount = Number(ariza?.next_prescribed_cnt ?? 0);

    if (arizaDate && aktDate && aktDate.diff(arizaDate, 'month') >= 1 && currentCount > nextCount) {
      const monthsDiff = aktDate.diff(arizaDate, 'month');
      const diffPeople = currentCount - nextCount;
      const rate = 8000;
      const adjustAmount = monthsDiff * diffPeople * rate;
      return {
        isAdjusted: true,
        startPeriod: arizaDate.format('MM.YYYY'),
        endPeriod: aktDate.format('MM.YYYY'),
        monthsCount: monthsDiff,
        inhabitantsDiff: diffPeople,
        oldCount: currentCount,
        newCount: nextCount,
        adjustmentAmount: adjustAmount,
        difference: adjustAmount
      };
    }
    return null;
  }, [ariza]);

  const isWarned = Boolean(warningMessageText || ariza?.actStatus === 'WARNED');
  const isCancelled = ariza?.status === 'bekor qilindi' || Boolean(cancellationText);
  const isConfirmed = ariza?.status === 'tasdiqlangan';
  const isPrintingThis = printingId === ariza?._id;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 1. TOP HEADER & ACTION COCKPIT */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50'
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', fontFamily: 'monospace' }}>
              #{ariza?.document_number || '---'}
            </Typography>

            {ariza?.status && (
              <Chip
                label={
                  isCancelled
                    ? 'Bekor qilingan'
                    : isConfirmed
                      ? 'Tasdiqlangan'
                      : ariza.status === 'akt_kiritilgan'
                        ? 'Akt kiritilgan'
                        : ariza.status
                }
                color={isConfirmed ? 'success' : isCancelled ? 'error' : 'primary'}
                sx={{ fontWeight: 700, fontSize: '0.85rem' }}
              />
            )}

            {ariza?.licshet && (
              <Tooltip title="Nusxalash uchun bosing">
                <Chip
                  icon={<ContentCopy sx={{ fontSize: '14px !important' }} />}
                  label={ariza.licshet}
                  onClick={handleCopyLicshet}
                  variant="outlined"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                />
              </Tooltip>
            )}

            <Chip label={reasonInfo.badgeLabel} size="small" color={reasonInfo.color} variant="outlined" sx={{ fontWeight: 600 }} />
          </Stack>

          {/* Quick Problem Resolution Buttons */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            {onMoveToInbox && ariza?.status === 'yangi' && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<MoveToInboxOutlined />}
                onClick={() => onMoveToInbox(ariza._id)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Qabul qilish
              </Button>
            )}

            {onOpenActChanger && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<PublishedWithChanges />}
                onClick={onOpenActChanger}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Akt biriktirish
              </Button>
            )}

            <Button
              variant="outlined"
              color="success"
              size="small"
              startIcon={isUpdatingFromBilling ? <CircularProgress size={16} /> : <RestartAlt />}
              disabled={isUpdatingFromBilling}
              onClick={handleSyncBilling}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Billingdan tasdiqlash
            </Button>

            {onPrint && (
              <Tooltip title="Ekspertiza / Ariza varaqasini chop etish">
                <Button
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={isPrintingThis ? <CircularProgress size={16} /> : <PrintOutlined />}
                  disabled={isPrintingThis}
                  onClick={() => onPrint(ariza._id)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Chop etish
                </Button>
              </Tooltip>
            )}

            {onOpenRejectDialog && !isCancelled && !isConfirmed && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CancelOutlined />}
                onClick={() => onOpenRejectDialog(ariza)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Bekor qilish
              </Button>
            )}

            <Tooltip title="Audit xulosasini klipbordga nusxalash">
              <Button
                variant="text"
                color="inherit"
                size="small"
                startIcon={<ContentCopy />}
                onClick={handleCopyAuditSummary}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
              >
                Nusxalash
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* 2. NEGA BUNDAY HISOB-KITOB BO'LGAN (CALCULATION RATIONALE & AUDIT BASIS) */}
      <Card
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: isCancelled ? 'error.light' : isConfirmed ? 'success.light' : 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <RuleFolderOutlined color="primary" />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Nega mana bunday hisob-kitob bo‘lgan? (Asos va sabablar)
              </Typography>
            </Stack>

            {discrepancy.hasDiscrepancy ? (
              <Chip
                label={`Tafovut bor: ${discrepancy.diff.toLocaleString()} so'm`}
                color="warning"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            ) : rawPeriods.length > 0 ? (
              <Chip
                icon={<CheckCircleOutlined sx={{ fontSize: '16px !important' }} />}
                label="Summalar 100% mos"
                color="success"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            ) : null}
          </Box>

          {/* Status Alert Banner */}
          {isCancelled && (
            <Alert severity="error" variant="filled" icon={<CancelOutlined fontSize="inherit" />} sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                Ushbu ariza bekor qilingan!
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Bekor qilish sababi: {ariza?.canceling_description || 'Sabab ko‘rsatilmagan'}
              </Typography>
              {ariza?.akt_id && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.9 }}>
                  Tegishli akt (№ {ariza.akt_id}) Tozamakon tizimida ham bekor qilingan holda saqlangan.
                </Typography>
              )}
            </Alert>
          )}

          {isConfirmed && (
            <Alert severity="success" variant="filled" icon={<CheckCircleOutlined fontSize="inherit" />} sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Ariza tekshirilgan va tasdiqlangan
              </Typography>
              <Typography variant="body2">
                Ushbu hisob-kitob viloyat / tuman mutaxassisi tomonidan tasdiqlangan va Tozamakon hisobida aks ettirilgan.
              </Typography>
            </Alert>
          )}

          {/* Core Reasoning Grid */}
          <Grid container spacing={2}>
            {/* Reason Explanation */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'primary.50',
                  border: '1px solid',
                  borderColor: 'primary.light'
                }}
              >
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>
                  Hisob-kitob mazmuni va huquqiy asosi
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                  {reasonInfo.headline}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {reasonInfo.details}
                </Typography>

                {getCleanAsoslantiruvchi(ariza?.comment) && (
                  <Box
                    sx={{ mt: 1.5, p: 1.2, borderRadius: 1.5, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider' }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                      Asoslantiruvchi dalolatnoma / izoh matni:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontStyle: 'italic', mt: 0.3 }}>
                      «{getCleanAsoslantiruvchi(ariza?.comment)}»
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Inhabitants & Metrics */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Aholi va akt parametrlari
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    F.I.Sh:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {ariza?.fullName || ariza?.fio || '-'}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Yashovchilar o‘zgarishi:
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {ariza?.current_prescribed_cnt ?? '—'} kishi
                    </Typography>
                    <CompareArrowsOutlined fontSize="small" sx={{ color: 'text.disabled' }} />
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {ariza?.next_prescribed_cnt ?? '—'} kishi
                    </Typography>
                  </Stack>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Akt sanasi:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {ariza.aktInfo?.createdAt
                      ? dayjs(ariza.aktInfo?.createdAt).format('DD.MM.YYYY')
                      : dayjs(ariza?.sana).format('DD.MM.YYYY') || '—'}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Rasmiy akt summasi:
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: aktAmount < 0 ? 'error.main' : aktAmount > 0 ? 'success.main' : 'text.primary'
                    }}
                  >
                    {aktAmount.toLocaleString()} so'm
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Card>

      {/* 2.1. TIZIMLI MANTIQIY NAVBATMA-NAVBAT XULOSA VA IZOHLAR JURNALI */}
      <Card
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: isCancelled ? 'error.light' : isWarned ? 'warning.light' : 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <FactCheckOutlined color={isCancelled ? 'error' : isWarned ? 'warning' : 'primary'} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Viloyat xulosalari, ogohlantirishlar va bekor qilish jurnali
              </Typography>
            </Stack>
            <Chip
              label="Tizimli mantiqiy ketma-ketlikda"
              size="small"
              variant="outlined"
              color={isCancelled ? 'error' : isWarned ? 'warning' : 'primary'}
              sx={{ fontWeight: 700 }}
            />
          </Box>

          <Stack spacing={1.5}>
            {/* 1. ARIZA BOSHLANG'ICH ASOSI VA YARATUVCHI IZOHI */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50'
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                <Chip label="1-Bosqich: Ariza asosi" size="small" color="primary" sx={{ fontWeight: 700, height: 22 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {ariza?.sana ? dayjs(ariza.sana).format('DD.MM.YYYY') : 'Sana ko‘rsatilmagan'} · {ariza?.creator?.fullName || ariza?.creator?.username || 'Tuman mutaxassisi'}
                </Typography>
              </Stack>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                Hujjat turi: {ariza?.document_type || '—'} · Sabab: {reasonInfo.headline}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                {getCleanAsoslantiruvchi(ariza?.comment) || ariza?.comment || 'Yaratish vaqtida qo‘shimcha izoh qoldirilmagan.'}
              </Typography>
            </Paper>

            {/* 2. OGOHLANTIRISH XABARI (AGAR MAVJUD BO'LSA) */}
            {warningMessageText && (
              <Alert
                severity="warning"
                variant="outlined"
                icon={<WarningAmberOutlined fontSize="inherit" />}
                sx={{
                  borderRadius: 2,
                  borderWidth: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.08)' : '#fffbeb'
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'warning.dark' }}>
                    Viloyat ogohlantirish xabari va sababi
                  </Typography>
                  {warningDateText && (
                    <Chip label={warningDateText} size="small" color="warning" sx={{ height: 20, fontWeight: 700, fontSize: '11px' }} />
                  )}
                  {ariza?.aktInfo?.id && (
                    <Chip label={`Akt №${ariza.aktInfo.id}`} size="small" variant="outlined" color="warning" sx={{ height: 20, fontWeight: 700, fontSize: '11px' }} />
                  )}
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5, fontSize: '0.95rem' }}>
                  «{warningMessageText}»
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Ushbu ogohlantirish viloyat boshqarmasi / audit xizmati tomonidan belgilangan va hisob-kitobni qayta ko‘rib chiqish talab etiladi.
                </Typography>
              </Alert>
            )}

            {/* 3. BEKOR QILISH IZOHI VA XULOSASI (AGAR BEKOR QILINGAN BO'LSA) */}
            {(isCancelled || cancellationText) && (
              <Alert
                severity="error"
                variant="outlined"
                icon={<CancelOutlined fontSize="inherit" />}
                sx={{
                  borderRadius: 2,
                  borderWidth: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2'
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'error.dark' }}>
                    Viloyat / Tuman tomonidan bekor qilish asosi va rasmiy xulosasi
                  </Typography>
                  {cancellationDateText && (
                    <Chip label={cancellationDateText} size="small" color="error" sx={{ height: 20, fontWeight: 700, fontSize: '11px' }} />
                  )}
                  {ariza?.akt_id && (
                    <Chip label={`Akt №${ariza.akt_id}`} size="small" color="error" sx={{ height: 20, fontWeight: 700, fontSize: '11px' }} />
                  )}
                </Stack>
                <Typography variant="body1" sx={{ fontWeight: 800, color: 'error.main', mb: 0.5 }}>
                  «{cancellationText || ariza?.canceling_description || 'Bekor qilish sababi ko‘rsatilmagan'}»
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Ushbu ariza va unga biriktirilgan akt rasman bekor qilingan hamda Tozamakon billing tizimida bekor qilingan sifatida saqlangan.
                </Typography>
              </Alert>
            )}

            {/* 4. VILOYAT INSPEKTORI / EKSPERT XULOSASI (AGAR MAVJUD BO'LSA) */}
            {ariza?.inspectorReview && (
              <Alert
                severity="info"
                variant="outlined"
                icon={<FactCheckOutlined fontSize="inherit" />}
                sx={{ borderRadius: 2 }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Viloyat bosh inspektori ekspertiza xulosasi
                  </Typography>
                  {ariza.inspectorReview.inspectorName && (
                    <Chip label={ariza.inspectorReview.inspectorName} size="small" color="info" sx={{ height: 20, fontWeight: 700, fontSize: '11px' }} />
                  )}
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Xulosa: {ariza.inspectorReview.conclusion || 'Tekshirildi'}
                </Typography>
                {ariza.inspectorReview.comment && (
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    «{ariza.inspectorReview.comment}»
                  </Typography>
                )}
              </Alert>
            )}
          </Stack>
        </Stack>
      </Card>

      {/* 2.2. AUTOADJUST (KECHIKKAN OYLAR BO‘YICHA AVTOMATIK QO‘SHIMCHA HISOB) */}
      {autoAdjustInfo && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            border: '1.5px dashed',
            borderColor: 'warning.main',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.08)' : '#fffbeb'
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <PublishedWithChanges color="warning" />
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.dark' }}>
                  AutoAdjust: Kechikkan oylar bo‘yicha avtomatik qo‘shimcha hisob
                </Typography>
              </Stack>
              <Chip label="MongoDB va DHJ da aks etgan" color="warning" size="small" sx={{ fontWeight: 700 }} />
            </Stack>

            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              Ariza yaratilgan sana ({autoAdjustInfo.startPeriod || '—'}) va akt rasmiylashtirilgan sana ({autoAdjustInfo.endPeriod || '—'}) o‘rtasida kechikish yuzaga kelganligi sababli, oraliq davr ({autoAdjustInfo.monthsCount || 1} ta oy) uchun aholi soni {autoAdjustInfo.oldCount ?? ariza?.current_prescribed_cnt ?? '—'} nafardan {autoAdjustInfo.newCount ?? ariza?.next_prescribed_cnt ?? '—'} nafarga avtomatik kamaytirilib, qo‘shimcha kompensatsiya hisoblangan.
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                    Oraliq tuzatish davri:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.main', mt: 0.3 }}>
                    {autoAdjustInfo.startPeriod || '—'} → {autoAdjustInfo.endPeriod || '—'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                    Yashovchilar soni farqi:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.main', mt: 0.3 }}>
                    {autoAdjustInfo.oldCount ?? ariza?.current_prescribed_cnt ?? '—'} → {autoAdjustInfo.newCount ?? ariza?.next_prescribed_cnt ?? '—'} (-{autoAdjustInfo.inhabitantsDiff ?? 0} kishi)
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                    Qo‘shimcha hisob (AutoAdjust):
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'warning.dark', mt: 0.3 }}>
                    +{Math.abs(Number(autoAdjustInfo.adjustmentAmount || autoAdjustInfo.difference || 0)).toLocaleString()} so'm
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                    DHJ jadvalida ko‘rinishi:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.3 }}>
                    AutoAdjust qatori sifatida
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        </Paper>
      )}

      {/* 2.5. DALOLATNOMALAR (AKTLAR) TARIXI VA ID RAQAMLARI REESTRI */}
      {(() => {
        const currentActId = ariza?.akt_id || ariza?.aktInfo?.id;
        const balanceActId = ariza?.balance_akt_id;
        const pachkaId = ariza?.akt_pachka_id || ariza?.aktInfo?.actPackId;
        const actHistory: any[] = Array.isArray(ariza?.actHistory) ? ariza.actHistory : [];
        const hasAnyAct = Boolean(currentActId || balanceActId || actHistory.length > 0);

        if (!hasAnyAct) return null;

        const hasWarnedOrCancelled =
          ariza?.actStatus === 'WARNED' ||
          ariza?.actStatus === 'CANCELLED' ||
          ariza?.actStatus === 'CONFIRMED_CANCELLED' ||
          ariza?.actStatus === 'REJECTED' ||
          ariza?.actStatus === 'MISSING' ||
          actHistory.some(
            (h) =>
              h.status === 'WARNED' ||
              h.status === 'CANCELLED' ||
              h.status === 'CONFIRMED_CANCELLED' ||
              h.status === 'REJECTED' ||
              h.status === 'DELETED' ||
              h.status === 'MISSING'
          );

        return (
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: hasWarnedOrCancelled ? 'warning.main' : 'divider',
              bgcolor: 'background.paper'
            }}
          >
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <HistoryEduOutlined color={hasWarnedOrCancelled ? 'warning' : 'primary'} />
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Dalolatnomalar (Aktlar) Tarixi va ID Raqamlari Reestri
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  {hasWarnedOrCancelled && (
                    <Chip
                      icon={<WarningAmberOutlined sx={{ fontSize: '16px !important' }} />}
                      label="Ogohlantirish / Bekor qilingan akt bor"
                      color="warning"
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  )}
                  <Chip
                    label={`Jami: ${actHistory.length + (currentActId ? 1 : 0)} ta akt qaydi`}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                Ushbu ariza yuzasidan Tozamakon tizimida rasmiylashtirilgan, viloyat tomonidan ogohlantirilgan, bekor qilingan yoki
                o‘chirilgan har bir akt ID raqami kelgusidagi tekshiruvlar va audit uchun to‘liq saqlanadi.
              </Typography>

              {/* Quick Summary Grid */}
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'primary.light',
                      bgcolor: theme.palette.mode === 'dark' ? 'primary.900' : '#f0f9ff'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                      Joriy asosiy akt ID:
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.main' }}>
                        {currentActId ? `#${currentActId}` : 'Mavjud emas'}
                      </Typography>
                      {currentActId && (
                        <Tooltip title="Nusxalash">
                          <IconButton
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(String(currentActId));
                              toast.info(`Akt #${currentActId} nusxalandi`);
                            }}
                            sx={{ p: 0.3 }}
                          >
                            <ContentCopy sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.default'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                      Akt holati (Status):
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        size="small"
                        label={ariza?.actStatus || ariza?.status || 'Noma‘lum'}
                        color={
                          ariza?.actStatus === 'CONFIRMED' || ariza?.status === 'tasdiqlangan'
                            ? 'success'
                            : ariza?.actStatus === 'CANCELLED' ||
                                ariza?.actStatus === 'CONFIRMED_CANCELLED' ||
                                ariza?.status === 'bekor qilindi'
                              ? 'error'
                              : ariza?.actStatus === 'WARNED'
                                ? 'warning'
                                : 'info'
                        }
                        sx={{ fontWeight: 700, height: 24 }}
                      />
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.default'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                      Pachka ID:
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'monospace', mt: 0.5 }}>
                      {pachkaId ? `#${pachkaId}` : '—'}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.default'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                      Balans / Qo‘shimcha akt ID:
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'monospace', mt: 0.5 }}>
                      {balanceActId ? `#${balanceActId}` : '—'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Warning box if there are warned/cancelled acts in history */}
              {hasWarnedOrCancelled && (
                <Alert severity="warning" icon={<WarningAmberOutlined />} sx={{ borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.3 }}>
                    Viloyat tekshiruvi: Akt bekor qilingan, ogohlantirish berilgan yoki o‘chirilgan
                  </Typography>
                  <Typography variant="body2">
                    Ushbu ariza bo‘yicha avval kiritilgan aktlar viloyat mutaxassislari tomonidan bekor qilingan, ogohlantirilgan yoki
                    tahrirlangan bo‘lishi mumkin. Quyidagi jurnalda har bir aktning ID raqami, summasi va sabablari saqlanmoqda.
                  </Typography>
                </Alert>
              )}

              {/* Act History Table */}
              {actHistory.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.100' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, width: 40 }}>№</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 140 }}>Akt ID</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 130 }}>Sana / Vaqt</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 130 }}>Amal turi</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 130 }}>Holati (Status)</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 120 }}>Summasi</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Sabab / Xulosa / Izoh</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 140 }}>Mas'ul shaxs</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {actHistory.map((hist: any, idx: number) => {
                        const hActId = hist.actId || hist.id;
                        const hStatus = hist.status || hist.actStatus || '—';
                        const isCanc =
                          hStatus === 'CANCELLED' || hStatus === 'CONFIRMED_CANCELLED' || hStatus === 'REJECTED' || hStatus === 'DELETED';
                        const isWarn = hStatus === 'WARNED';
                        const isConf = hStatus === 'CONFIRMED' || hStatus === 'APPROVED';

                        return (
                          <TableRow
                            key={idx}
                            hover
                            sx={{
                              bgcolor: isCanc
                                ? theme.palette.mode === 'dark'
                                  ? 'rgba(239, 68, 68, 0.08)'
                                  : 'rgba(254, 242, 242, 0.6)'
                                : isWarn
                                  ? theme.palette.mode === 'dark'
                                    ? 'rgba(245, 158, 11, 0.08)'
                                    : 'rgba(254, 252, 232, 0.6)'
                                  : 'inherit'
                            }}
                          >
                            <TableCell sx={{ color: 'text.secondary' }}>{idx + 1}</TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 800,
                                    fontFamily: 'monospace',
                                    color: hActId ? 'primary.main' : 'text.disabled'
                                  }}
                                >
                                  {hActId ? `#${hActId}` : '—'}
                                </Typography>
                                {hActId && (
                                  <Tooltip title="Nusxalash">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        navigator.clipboard.writeText(String(hActId));
                                        toast.info(`Akt #${hActId} nusxalandi`);
                                      }}
                                      sx={{ p: 0.2 }}
                                    >
                                      <ContentCopy sx={{ fontSize: 13 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ fontSize: '12px' }}>
                              {hist.date
                                ? dayjs(hist.date).format('DD.MM.YYYY HH:mm')
                                : hist.createdAt
                                  ? dayjs(hist.createdAt).format('DD.MM.YYYY HH:mm')
                                  : '—'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={
                                  hist.action === 'CREATED'
                                    ? 'Yaratildi'
                                    : hist.action === 'UPDATED'
                                      ? 'Tahrirlandi'
                                      : hist.action === 'REPLACED' || hist.action === 'REPLACED_WITH_NEW_ACT'
                                        ? 'Almashtirildi'
                                        : hist.action === 'CANCELLED' || hist.action === 'CANCELLED_WITH_ACT'
                                          ? 'Bekor qilindi'
                                          : hist.action === 'DELETED' || hist.action === 'DELETED_UNCONFIRMED'
                                            ? "O'chirildi"
                                            : hist.action === 'CONFIRMED'
                                              ? 'Tasdiqlandi'
                                              : hist.action || 'Harakat'
                                }
                                color={isCanc ? 'error' : isWarn ? 'warning' : isConf ? 'success' : 'default'}
                                variant="outlined"
                                sx={{ fontWeight: 600, fontSize: '11px', height: 22 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={hStatus}
                                color={isConf ? 'success' : isCanc ? 'error' : isWarn ? 'warning' : 'info'}
                                sx={{ fontWeight: 700, fontSize: '11px', height: 22 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                              {hist.amount !== undefined ? `${Number(hist.amount).toLocaleString()} so'm` : '—'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '12px' }}>
                              <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 500 }}>
                                {hist.reason ||
                                  hist.cancellationConclusion ||
                                  hist.warningMessage ||
                                  hist.conclusion ||
                                  hist.description ||
                                  '—'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: '12px', color: 'text.secondary' }}>
                              {hist.user || hist.userName || hist.creatorName || 'Tizim'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <InfoOutlined color="info" />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Ushbu ariza uchun hozirda 1 ta joriy akt (ID: <b>#{currentActId}</b>) biriktirilgan. Tarixda bekor qilingan yoki
                    o‘chirilgan qo‘shimcha aktlar qayd etilmagan. Kelgusida viloyat tomonidan o‘zgartirilsa yoki bekor qilinsa, ushbu
                    ro‘yxatda avtomatik saqlanib boradi.
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Card>
        );
      })()}

      {/* 3. QACHONDAN QANDAY HISOBLANGAN (RECALCULATION PERIODS & TARIFF BREAKDOWN) */}
      <Card elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <CalendarMonthOutlined color="primary" />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Qachondan qanday hisoblangan (Qayta hisob davrlari)
              </Typography>
            </Stack>

            <Chip
              label={`${rawPeriods.length} ta hisoblangan davr`}
              size="small"
              color={rawPeriods.length > 0 ? 'primary' : 'default'}
              sx={{ fontWeight: 700 }}
            />
          </Box>

          {rawPeriods.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Ushbu arizada alohida davriy intervallar (recalculation periods) qayd etilmagan.
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                Bunday holatda jami hisob-kitob to‘g‘riligini quyidagi «Tekshiruv kalkulyatori» orqali oson tekshirishingiz mumkin.
              </Typography>
            </Alert>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.100' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: 45 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Davr oralig‘i (Sana)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Qamrab olingan oylar</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Yashovchi soni / Farqi</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>QQS bilan</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Jami davr summasi</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center', width: 90 }}>Formula</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rawPeriods.map((period, idx) => {
                    const sDate = period.startDate ? dayjs(period.startDate).format('DD.MM.YYYY') : '—';
                    const eDate = period.endDate ? dayjs(period.endDate).format('DD.MM.YYYY') : '—';
                    const rangeLabel = formatPeriodRange(period);
                    const isExpanded = Boolean(expandedPeriods[idx]);
                    const countVal =
                      period.yashovchilar_soni !== undefined && period.yashovchilar_soni !== null
                        ? `${period.yashovchilar_soni} kishi`
                        : period.yashovchiDelta
                          ? `${period.yashovchiDelta > 0 ? '+' : ''}${period.yashovchiDelta} kishi`
                          : '1 kishi';

                    // Calculate live breakdown formula for this period
                    const breakdown = calculateTariffBreakdown(
                      period.startDate,
                      period.endDate,
                      Math.abs(period.yashovchilar_soni || period.yashovchiDelta || 1),
                      tariffs
                    );

                    return (
                      <React.Fragment key={idx}>
                        <TableRow hover sx={{ '& > *': { borderBottom: isExpanded ? 'unset' : undefined } }}>
                          <TableCell sx={{ fontWeight: 700 }}>{idx + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {sDate} — {eDate}
                          </TableCell>
                          <TableCell>
                            <Chip label={rangeLabel} size="small" variant="outlined" sx={{ fontWeight: 600, fontFamily: 'monospace' }} />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', fontWeight: 700 }}>{countVal}</TableCell>
                          <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                            {Number(period.withQQSTotal || 0).toLocaleString()} so'm
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: 'right',
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              color: period.total < 0 ? 'error.main' : 'success.main'
                            }}
                          >
                            {Number(period.total || 0).toLocaleString()} so'm
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Tooltip title="Hisoblash formulasini ochish">
                              <IconButton size="small" onClick={() => togglePeriodExpand(idx)}>
                                {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>

                        {/* Collapsible formula details */}
                        <TableRow>
                          <TableCell colSpan={7} sx={{ p: 0, bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50' }}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box sx={{ p: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                                  #{idx + 1}-davr uchun oylik tarif va formula tafsiloti:
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1.5, color: 'text.secondary' }}>
                                  {breakdown.formulaSummary}
                                </Typography>

                                {breakdown.items.length > 0 && (
                                  <Table
                                    size="small"
                                    sx={{
                                      maxWidth: 650,
                                      bgcolor: 'background.paper',
                                      borderRadius: 1.5,
                                      border: '1px solid',
                                      borderColor: 'divider'
                                    }}
                                  >
                                    <TableHead>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Yil / Davr</TableCell>
                                        <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Oylar soni</TableCell>
                                        <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Oylik tarif</TableCell>
                                        <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Oraliq summa</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {breakdown.items.map((it, iIdx) => (
                                        <TableRow key={iIdx}>
                                          <TableCell>
                                            {it.year}-yil ({String(it.fromMonth).padStart(2, '0')}-{String(it.toMonth).padStart(2, '0')}{' '}
                                            oylar)
                                          </TableCell>
                                          <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>{it.monthsCount} oy</TableCell>
                                          <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                                            {it.rate.toLocaleString()} so'm
                                          </TableCell>
                                          <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                                            {it.subtotal.toLocaleString()} so'm
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                )}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Recalculation summary block */}
          {rawPeriods.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Davrlar bo‘yicha jami hisoblangan summa:
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: recalcTotalSum < 0 ? 'error.main' : 'success.main' }}>
                {recalcTotalSum.toLocaleString()} so'm
              </Typography>
            </Paper>
          )}
        </Stack>
      </Card>

      {/* DHJ JADVALIDA QAYTA HISOBLARNING AKS ETISHI (XUDDI ARIZA YARATILAYOTGANDAGI KABI) */}
      <AuditDHJTable ariza={ariza} />

      {/* 4. SPLIT SECTION: VERIFICATION CALCULATOR & EMBEDDED DOCUMENT VIEWER */}
      <Grid container spacing={2}>
        {/* Left: Additional Calculation Tools (Qo'shimcha hisob kitob qulayliklari) */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <CalculateOutlined color="primary" />
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Qo‘shimcha hisob-kitob va tekshiruv kalkulyatori
                  </Typography>
                </Stack>

                <Tooltip title="Viloyat rasmiy tariflari jadvali">
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<TableChartOutlined />}
                    onClick={() => setShowTariffGuide(true)}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Tariflar
                  </Button>
                </Tooltip>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Istagan davr va yashovchilar sonini kiritib, arizadagi hisob-kitob qonuniy tariflarga mosligini darhol tekshiring:
              </Typography>

              {/* Calculator Inputs */}
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    views={['year', 'month']}
                    format="MM.YYYY"
                    label="Boshlanish oyi"
                    value={calcStartMonth}
                    onChange={(val) => setCalcStartMonth(val)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    views={['year', 'month']}
                    format="MM.YYYY"
                    label="Tugash oyi"
                    value={calcEndMonth}
                    onChange={(val) => setCalcEndMonth(val)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    label="Aholi soni (kishi)"
                    value={calcInhabitants}
                    onChange={(e) => setCalcInhabitants(Math.max(1, Number(e.target.value) || 1))}
                  />
                </Grid>
              </Grid>

              {/* Calculator Live Output Card */}
              {calcResult && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'primary.light',
                    bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'primary.50'
                  }}
                >
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 800, color: 'primary.main' }}>
                    Tekshiruv natijasi ({calcResult.monthsCount} oy davomida)
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.dark', my: 0.5 }}>
                    {calcResult.total.toLocaleString()} so'm
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                    QQS bilan: {calcResult.totalWithQQS.toLocaleString()} so'm
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Hisoblash formulasi:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '12px', color: 'text.primary' }}>
                    {calcResult.formulaSummary}
                  </Typography>

                  {/* Comparison with Ariza amount */}
                  <Box sx={{ mt: 1.5, p: 1, borderRadius: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Arizadagi summa bilan taqqoslash:
                      </Typography>
                      {Math.abs(calcResult.total) === Math.abs(aktAmount) ? (
                        <Chip
                          icon={<CheckCircleOutlined sx={{ fontSize: '14px !important' }} />}
                          label="100% Mos keldi"
                          color="success"
                          size="small"
                          sx={{ height: 22, fontWeight: 700 }}
                        />
                      ) : (
                        <Chip
                          label={`Farq: ${(Math.abs(calcResult.total) - Math.abs(aktAmount)).toLocaleString()} so'm`}
                          color="warning"
                          size="small"
                          sx={{ height: 22, fontWeight: 700 }}
                        />
                      )}
                    </Stack>
                  </Box>
                </Paper>
              )}
            </Stack>
          </Card>
        </Grid>

        {/* Right: Embedded Document / PDF Viewer (Xujjat faylini ko'rsa bo'ladigan) */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              minHeight: 480,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <PictureAsPdfOutlined color="primary" />
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Biriktirilgan hujjat va PDF fayl
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant={pdfFileUrl ? 'outlined' : 'contained'}
                  color="primary"
                  startIcon={isLoadingPdf ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfOutlined />}
                  onClick={handleFetchPdf}
                  disabled={isLoadingPdf}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {isLoadingPdf ? 'Yuklanmoqda...' : pdfFileUrl ? 'Qayta yuklash' : 'Tozamakondan PDF faylni ochish'}
                </Button>

                {pdfFileUrl && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={<OpenInNew />}
                    onClick={() => {
                      const win = window.open();
                      if (win) {
                        win.document.write(
                          `<iframe src="${pdfFileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                        );
                      }
                    }}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Yangi oynada
                  </Button>
                )}

                {onOpenImageModal && (ariza?.tempPhotos || []).length > 0 && (
                  <Tooltip title="Ilova qilingan barcha fotosuratlarni ko‘rish">
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      startIcon={<CollectionsOutlined />}
                      onClick={onOpenImageModal}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Rasmlar ({(ariza?.tempPhotos || []).length})
                    </Button>
                  </Tooltip>
                )}
              </Stack>
            </Box>

            {/* PDF Viewer Box */}
            <Box sx={{ flex: 1, minHeight: 450, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
              {isLoadingPdf ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 350 }}>
                  <CircularProgress size={36} />
                </Box>
              ) : (
                <PDFViewer base64String={pdfFileUrl} onFetchPdf={handleFetchPdf} isLoading={isLoadingPdf} />
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Historical Tariffs Reference Dialog */}
      <Dialog open={showTariffGuide} onClose={() => setShowTariffGuide(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Viloyat bo‘yicha rasmiy chiqindi tariflari ma‘lumotnomasi</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Quyida GreenZone billing tizimida tasdiqlangan va qayta hisob-kitoblar uchun qo‘llaniladigan oylik tariflar jadvali keltirilgan:
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Davr</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>1 kishi uchun tarif (oylik)</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>QQS bilan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>2024-yil — hozirgacha</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 700 }}>4,000 so'm</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>4,000 so'm</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2023-yil (Yanvar - Dekabr)</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 700 }}>3,500 so'm</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>3,500 so'm</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2021-yil — 2022-yil</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 700 }}>2,600 so'm</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>2,600 so'm</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2019-yil — 2020-yil</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 700 }}>2,000 so'm</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>2,000 so'm</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ArizaAuditBreakdown;
