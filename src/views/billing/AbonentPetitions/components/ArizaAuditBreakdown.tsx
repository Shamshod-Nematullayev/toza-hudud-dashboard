import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
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
  Skeleton,
  useTheme
} from '@mui/material';
import {
  CalculateOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  InfoOutlined,
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
  FactCheckOutlined,
  HistoryEduOutlined,
  WarningAmberOutlined,
  RuleFolderOutlined,
  CompareArrowsOutlined,
  TableChartOutlined,
  SwapHoriz,
  ArrowForward,
  AccountBalanceWalletOutlined,
  PersonRemoveOutlined,
  DeleteOutline,
  CheckCircle,
  Clear,
  Place,
  AddLocationAlt,
  EditLocationAlt,
  Directions,
  AddPhotoAlternateOutlined,
  EditCalendarOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
import BaseMap, { pinIcon } from 'ui-component/map/BaseMap';
import LocationPickerDialog from 'ui-component/map/LocationPickerDialog';
import { Marker } from 'react-leaflet';
import {
  fetchAbonentLocation,
  formatLatLng,
  googleDirectionsUrl,
  googleMapsUrl,
  locationSourceLabels,
  saveAbonentLocation,
  isValidLatLng
} from 'services/abonentLocation';
import AttachedImagesModal from '../../AbonentPetition/AttachedImagesModal';
import PasteImageDialog from '../../AbonentPetition/PasteImageDialog';

/** Kichik rasm prevyusi (Lazy blob yuklovchi) */
const ThumbnailItem = ({ fileId, onClick }: { fileId: string; onClick: () => void }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    api
      .get(`/fetchTelegram/${fileId}`, { responseType: 'blob', headers: { 'hide-error': true } })
      .then((res) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {}
      }
    };
  }, [fileId]);

  return (
    <Box
      onClick={onClick}
      sx={{
        width: 100,
        height: 75,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1.5px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'action.hover',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
          boxShadow: 2
        }
      }}
    >
      {loading ? (
        <CircularProgress size={18} />
      ) : src ? (
        <Box component="img" src={src} alt="Dalolatnoma surati" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <CollectionsOutlined color="action" fontSize="small" />
      )}
    </Box>
  );
};

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
  const navigate = useNavigate();
  const { tariffs } = useTariff();

  const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(initialPdfUrl || null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isUpdatingFromBilling, setIsUpdatingFromBilling] = useState(false);

  // Inspector on-demand interactive calculator dialog
  const [calcOpen, setCalcOpen] = useState(false);
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
        } catch {
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
        } catch {
          // ignore
        } finally {
          setIsLoadingPdf(false);
        }
      }
      setPdfFileUrl(null);
    };
    loadInitialPdf();
  }, [ariza, initialPdfUrl]);

  // Document Type Classification
  const docType = ariza?.document_type || 'odam_soni';
  const isRecalcType = ['odam_soni', 'vafot', 'viza', 'gps'].includes(docType);
  const isGps = docType === 'gps';
  const isDvaynik = docType === 'dvaynik';
  const isMoneyTransfer = ['pul_kuchirish', 'tulov_kuchirish'].includes(docType);
  const isResidentTransfer = docType === 'yashovchi_kuchirish';
  const isCancelContract = docType === 'cancelContract';

  // Photo gallery & Paste modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [pasteImageOpen, setPasteImageOpen] = useState(false);

  // GPS Location & Map Management
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; source?: string } | null>(
    ariza?.location && isValidLatLng(ariza.location.lat, ariza.location.lng) ? ariza.location : null
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  useEffect(() => {
    if (ariza?.location && isValidLatLng(ariza.location.lat, ariza.location.lng)) {
      setCurrentLocation(ariza.location);
      return;
    }
    if (ariza?.abonentId) {
      let cancelled = false;
      setLocationLoading(true);
      fetchAbonentLocation(ariza.abonentId)
        .then((res) => {
          if (!cancelled && res.location && isValidLatLng(res.location.lat, res.location.lng)) {
            setCurrentLocation({ lat: res.location.lat, lng: res.location.lng, source: res.location.source });
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLocationLoading(false);
        });
      return () => {
        cancelled = true;
      };
    } else {
      setCurrentLocation(null);
    }
  }, [ariza]);

  const handleSaveLocation = async (point: { lat: number; lng: number; source?: any; accuracy?: number }) => {
    if (!ariza) return;
    try {
      if (ariza.abonentId) {
        await saveAbonentLocation(ariza.abonentId, point, {
          accountNumber: ariza.licshet,
          fullName: ariza.fullName || ariza.fio,
          mahallaName: ariza.address || ariza.manzil
        });
      }
      setCurrentLocation({ lat: point.lat, lng: point.lng, source: point.source });
      toast.success('Xaritadagi joylashuv muvaffaqiyatli saqlandi');
      if (onReloadList) onReloadList();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Joylashuvni saqlashda xatolik yuz berdi');
    }
  };

  const reasonInfo = useMemo(() => explainCalculationReason(ariza), [ariza]);

  // Recalculation periods
  const rawPeriods: any[] = useMemo(() => {
    if (Array.isArray(ariza?.recalculationPeriods) && ariza.recalculationPeriods.length > 0) {
      return ariza.recalculationPeriods;
    }
    if (Array.isArray(ariza?.bosqichlar) && ariza.bosqichlar.length > 0) {
      return ariza.bosqichlar.map((b: any) => {
        const [fm, fy] = b.from.split('.').map(Number);
        const [tm, ty] = b.to.split('.').map(Number);
        return {
          startDate: new Date(fy, fm - 1, 1),
          endDate: new Date(ty, tm - 1, 1),
          yashovchilar_soni: b.count,
          total: Number(b.amount || 0)
        };
      });
    }
    return [];
  }, [ariza]);

  // AutoAdjust: Faqat akt Tozamakonga kiritilgan bo'lsa va MongoDB da autoAdjust saqlangan bo'lsa ko'rsatiladi
  const autoAdjustInfo = useMemo(() => {
    const isActEntered = Boolean(ariza?.akt_id || ariza?.status === 'akt_kiritilgan' || ariza?.status === 'tasdiqlangan');
    if (!isActEntered || !ariza?.autoAdjust) {
      return null;
    }

    const adj = ariza.autoAdjust;
    const amount = Number(adj.adjustment ?? adj.adjustmentAmount ?? 0);
    if (amount <= 0 && !adj.isAdjusted) {
      return null;
    }

    return {
      isAdjusted: true,
      startPeriod: adj.actMonth || adj.startPeriod || (ariza.sana ? dayjs(ariza.sana).format('MM.YYYY') : ''),
      endPeriod: adj.currentMonth || adj.endPeriod || (ariza.akt_date ? dayjs(ariza.akt_date).format('MM.YYYY') : ''),
      monthsCount: adj.monthsDiff || adj.monthsCount || 1,
      inhabitantsDiff:
        adj.inhabitantDiff || adj.inhabitantsDiff || Number(ariza.current_prescribed_cnt) - Number(ariza.next_prescribed_cnt),
      oldCount: adj.currentInhabitantCount || ariza.current_prescribed_cnt,
      newCount: adj.nextInhabitantCount || ariza.next_prescribed_cnt,
      adjustmentAmount: amount,
      difference: amount
    };
  }, [ariza]);

  // Recalculation total sum
  const recalcTotalSum = useMemo(() => {
    let sum = rawPeriods.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
    if (autoAdjustInfo?.adjustmentAmount) {
      sum += Number(autoAdjustInfo.adjustmentAmount);
    }
    return sum;
  }, [rawPeriods, autoAdjustInfo]);

  const aktAmount = useMemo(() => {
    const raw = ariza?.aktSummCounts?.total ?? ariza?.aktSummasi ?? ariza?.akt_sum;
    return Number(raw || 0);
  }, [ariza]);

  // Warning & Cancellation messages
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
      const c = ariza.actHistory.find((h: any) => h.cancellationConclusion || h.status === 'CANCELLED' || h.action === 'cancelled');
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

  const isActEntered = Boolean(ariza?.akt_id || ariza?.status === 'akt_kiritilgan' || ariza?.status === 'tasdiqlangan');
  const isCancelled = ariza?.status === 'bekor qilindi';
  const isConfirmed = ariza?.status === 'tasdiqlangan';
  const isPrintingThis = printingId === ariza?._id;

  const canEditRecalculation =
    !isCancelled &&
    (['odam_soni', 'viza', 'death', 'vafot', 'cancelContract'].includes(docType) ||
      (Array.isArray(ariza?.recalculationPeriods) && ariza.recalculationPeriods.length > 0));

  const handleEditRecalculation = () => {
    if (!ariza?._id) return;
    navigate(`/billing/createAbonentAriza?editArizaId=${ariza._id}`);
  };

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
      `Akt summasi: ${aktAmount.toLocaleString()} so'm`,
      isCancelled ? `Bekor qilish sababi: ${cancellationText || ariza.canceling_description || '-'}` : '',
      warningMessageText ? `Ogohlantirish: ${warningMessageText}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(summary);
    toast.success('Audit xulosasi nusxalandi!');
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

  // Run on-demand calculator
  const handleRunCalculator = () => {
    if (!calcStartMonth || !calcEndMonth) {
      toast.warn('Boshlanish va tugash oylarini tanlang');
      return;
    }
    const res = calculateTariffBreakdown(calcStartMonth.toDate(), calcEndMonth.toDate(), calcInhabitants, tariffs);
    setCalcResult(res);
  };

  // Helper label for document type
  const docTypeTitle = useMemo(() => {
    switch (docType) {
      case 'vafot':
        return 'Vafot etganlik guvohnomasi';
      case 'odam_soni':
        return 'Aholi soni kamayishi / Qayta hisob';
      case 'dvaynik':
        return 'Ikkilamchi kodni o‘chirish (Dvaynik)';
      case 'pul_kuchirish':
      case 'tulov_kuchirish':
        return 'Mablag‘ ko‘chirish dalolatnomasi';
      case 'yashovchi_kuchirish':
        return 'Yashovchini boshqa manzilga ko‘chirish';
      case 'cancelContract':
        return 'Shartnomani bekor qilish';
      case 'viza':
        return 'Viza (Xorijga chiqish bo‘yicha qayta hisob)';
      case 'gps':
        return 'GPS / Xizmat ko‘rsatilmagan davr';
      default:
        return 'Abonent arizasi';
    }
  }, [docType]);

  const cleanComment = getCleanAsoslantiruvchi(ariza?.comment) || ariza?.comment;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {/* 1. TOP SLEEK HEADER & ACTION COCKPIT */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: isCancelled ? 'error.light' : isConfirmed ? 'success.light' : 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
          >
            {/* Title & Key Tags */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', fontFamily: 'monospace' }}>
                № {ariza?.document_number || '---'}
              </Typography>

              <Chip label={docTypeTitle} color={isDvaynik ? 'secondary' : isMoneyTransfer ? 'info' : 'primary'} sx={{ fontWeight: 700 }} />

              <Chip
                label={
                  isCancelled
                    ? 'Bekor qilingan'
                    : isConfirmed
                      ? 'Tasdiqlangan'
                      : ariza.status === 'akt_kiritilgan'
                        ? 'Akt kiritilgan'
                        : ariza.status || 'Yangi'
                }
                color={isConfirmed ? 'success' : isCancelled ? 'error' : 'primary'}
                sx={{ fontWeight: 700 }}
              />

              {ariza?.licshet && (
                <Tooltip title="Nusxalash uchun bosing">
                  <Chip
                    icon={<ContentCopy sx={{ fontSize: '13px !important' }} />}
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

              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {ariza?.fullName || ariza?.fio || '—'}
              </Typography>
            </Stack>

            {/* Quick Actions */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              {isRecalcType && (
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  startIcon={<CalculateOutlined />}
                  onClick={() => setCalcOpen(true)}
                  sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                >
                  Kalkulyator
                </Button>
              )}

              {/* GPS Map Location Button */}
              {(isGps || currentLocation) && (
                <Button
                  variant="outlined"
                  color={currentLocation ? 'error' : 'warning'}
                  size="small"
                  startIcon={<Place />}
                  onClick={() => setLocationPickerOpen(true)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {currentLocation ? 'Xarita nuqtasi' : 'Xaritada belgilash'}
                </Button>
              )}

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
                startIcon={isUpdatingFromBilling ? <CircularProgress size={14} /> : <RestartAlt />}
                disabled={isUpdatingFromBilling}
                onClick={handleSyncBilling}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Billingdan yangilash
              </Button>

              {canEditRecalculation && (
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  startIcon={<EditCalendarOutlined />}
                  onClick={handleEditRecalculation}
                  sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 1 }}
                >
                  Hisob-kitobni tahrirlash
                </Button>
              )}

              {onPrint && (
                <Button
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={isPrintingThis ? <CircularProgress size={14} /> : <PrintOutlined />}
                  disabled={isPrintingThis}
                  onClick={() => onPrint(ariza._id)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Chop etish
                </Button>
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
                <IconButton size="small" onClick={handleCopyAuditSummary} sx={{ color: 'text.secondary' }}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Warning Banner (Only if warned) */}
          {warningMessageText && (
            <Alert
              severity="warning"
              variant="outlined"
              icon={<WarningAmberOutlined />}
              sx={{ borderRadius: 2, py: 0.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.08)' : '#fffbeb' }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                Viloyat ogohlantirishi {warningDateText ? `(${warningDateText})` : ''}: «{warningMessageText}»
              </Typography>
            </Alert>
          )}

          {/* Cancellation Banner (Only if cancelled) */}
          {isCancelled && (
            <Alert
              severity="error"
              variant="outlined"
              icon={<CancelOutlined />}
              sx={{ borderRadius: 2, py: 0.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2' }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.dark' }}>
                Bekor qilish asosi {cancellationDateText ? `(${cancellationDateText})` : ''}: «
                {cancellationText || ariza?.canceling_description || 'Sabab ko‘rsatilmagan'}»
                {ariza?.akt_id && ` · Tegishli akt: №${ariza.akt_id}`}
              </Typography>
            </Alert>
          )}

          {/* Clean Creator Comment / Reference Document Note */}
          {cleanComment && (
            <Box
              sx={{ px: 1.5, py: 0.8, borderRadius: 1.5, bgcolor: 'action.hover', borderLeft: '3px solid', borderColor: 'primary.main' }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                Asoslantiruvchi dalolatnoma / ariza izohi:
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', fontWeight: 500, color: 'text.primary', mt: 0.2 }}>
                «{cleanComment}»
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* 2. SPLIT LAYOUT: LEFT = TAILORED DOCUMENT CONTENT, RIGHT = EMBEDDED PDF VIEWER */}
      <Grid container spacing={2}>
        {/* ==================== LEFT COLUMN: CONTENT BY DOCUMENT TYPE ==================== */}
        <Grid size={{ xs: 12, lg: 6.5 }}>
          <Stack spacing={2}>
            {/* ----------------- CASE 1: RECALCULATION (odam_soni, vafot, viza, gps) ----------------- */}
            {isRecalcType && (
              <>
                {/* GPS LOCATION & MAP CARD (For GPS petitions or whenever location exists) */}
                {(isGps || currentLocation) && (
                  <Card
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: '1.5px solid',
                      borderColor: currentLocation ? 'error.light' : 'warning.main',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Place color={currentLocation ? 'error' : 'warning'} />
                          <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            GPS ma’lumotlari va xaritadagi xonadon joylashuvi
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                          {currentLocation ? (
                            <>
                              <Chip
                                label={formatLatLng(currentLocation.lat, currentLocation.lng)}
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                              />
                              <Button
                                size="small"
                                startIcon={<OpenInNew fontSize="small" />}
                                href={googleMapsUrl(currentLocation.lat, currentLocation.lng)}
                                target="_blank"
                                rel="noopener"
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                              >
                                Google Maps
                              </Button>
                              <Button
                                size="small"
                                startIcon={<Directions fontSize="small" />}
                                href={googleDirectionsUrl(currentLocation.lat, currentLocation.lng)}
                                target="_blank"
                                rel="noopener"
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                              >
                                Yo‘nalish
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditLocationAlt fontSize="small" />}
                                onClick={() => setLocationPickerOpen(true)}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                              >
                                O‘zgartirish
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              startIcon={<AddLocationAlt fontSize="small" />}
                              onClick={() => setLocationPickerOpen(true)}
                              sx={{ textTransform: 'none', fontWeight: 700 }}
                            >
                              Xaritadan belgilash
                            </Button>
                          )}
                        </Stack>
                      </Box>

                      {locationLoading ? (
                        <Skeleton variant="rounded" height={220} />
                      ) : currentLocation ? (
                        <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                          <BaseMap
                            key={`${currentLocation.lat},${currentLocation.lng}`}
                            center={[currentLocation.lat, currentLocation.lng]}
                            zoom={17}
                            height={220}
                          >
                            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={pinIcon('#d32f2f', 32)} />
                          </BaseMap>
                          <Box
                            sx={{ p: 1, bgcolor: 'action.hover', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                              Koordinata: {formatLatLng(currentLocation.lat, currentLocation.lng)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Manba: {locationSourceLabels[currentLocation.source || ''] || currentLocation.source || 'GPS dalolatnoma'}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1.5px dashed',
                            borderColor: 'warning.main',
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.08)' : '#fffbeb',
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2
                          }}
                        >
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                              Xaritada xonadon joylashuvi belgilanmagan!
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              GPS xizmat ko‘rsatmaganlik dalolatnomasini viloyat tekshiruvidan o‘tkazishda masofani va transport treki bilan
                              solishtirish uchun xonadon nuqtasini belgilang.
                            </Typography>
                          </Stack>
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            startIcon={<AddLocationAlt />}
                            onClick={() => setLocationPickerOpen(true)}
                            sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
                          >
                            Nuqtani belgilash
                          </Button>
                        </Paper>
                      )}
                    </Stack>
                  </Card>
                )}

                {/* ATTACHED PHOTOS CARD (For GPS or whenever photos exist) */}
                {(isGps || (ariza?.tempPhotos || []).length > 0) && (
                  <Card
                    elevation={0}
                    sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
                  >
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <CollectionsOutlined color="primary" />
                          <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            Biriktirilgan dalolatnoma suratlari
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          {(ariza?.tempPhotos || []).length > 0 && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<CollectionsOutlined fontSize="small" />}
                              onClick={() => setImageModalOpen(true)}
                              sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                              Galereyani ochish ({(ariza?.tempPhotos || []).length})
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<AddPhotoAlternateOutlined fontSize="small" />}
                            onClick={() => setPasteImageOpen(true)}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                          >
                            Rasm qo‘shish
                          </Button>
                        </Stack>
                      </Box>

                      {(ariza?.tempPhotos || []).length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                          {(ariza.tempPhotos as string[]).map((photoId, idx) => (
                            <ThumbnailItem key={photoId || idx} fileId={photoId} onClick={() => setImageModalOpen(true)} />
                          ))}
                        </Box>
                      ) : (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1.5px dashed',
                            borderColor: 'divider',
                            bgcolor: 'action.hover',
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Ushbu dalolatnomaga biriktirilgan fotosuratlar mavjud emas (yo‘l yaroqsizligi yoki xizmat ko‘rsatilmaganlik
                            dalili).
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<AddPhotoAlternateOutlined />}
                            onClick={() => setPasteImageOpen(true)}
                            sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
                          >
                            Rasm biriktirish
                          </Button>
                        </Paper>
                      )}
                    </Stack>
                  </Card>
                )}

                {/* Recalculation Periods Table */}
                <Card
                  elevation={0}
                  sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
                >
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <CalendarMonthOutlined color="primary" />
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                          Qayta hisob davrlari va hisoblangan summa
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Chip
                          label={`${rawPeriods.length + (autoAdjustInfo ? 1 : 0)} ta davr`}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 700 }}
                        />
                        {canEditRecalculation && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            startIcon={<EditCalendarOutlined />}
                            onClick={handleEditRecalculation}
                            sx={{ textTransform: 'none', fontWeight: 700 }}
                          >
                            Hisob-kitobni to‘g‘rilash
                          </Button>
                        )}
                      </Stack>
                    </Box>

                    <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.100' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, width: 35 }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Davr oralig‘i</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Qamrab olingan oylar</TableCell>
                            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Aholi soni / Farqi</TableCell>
                            <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Davr summasi</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rawPeriods.map((period, idx) => {
                            const rangeLabel = formatPeriodRange(period);
                            const countVal =
                              period.yashovchilar_soni !== undefined && period.yashovchilar_soni !== null
                                ? `${period.yashovchilar_soni} kishi`
                                : period.yashovchiDelta
                                  ? `${period.yashovchiDelta > 0 ? '+' : ''}${period.yashovchiDelta} kishi`
                                  : '1 kishi';
                            const periodSum = Number(period.total || 0);

                            return (
                              <TableRow key={idx}>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{idx + 1}</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  {period.startDate ? dayjs(period.startDate).format('DD.MM.YYYY') : '—'} —{' '}
                                  {period.endDate ? dayjs(period.endDate).format('DD.MM.YYYY') : '—'}
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{rangeLabel}</TableCell>
                                <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>{countVal}</TableCell>
                                <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                                  {periodSum.toLocaleString()} so'm
                                </TableCell>
                              </TableRow>
                            );
                          })}

                          {/* AutoAdjust Row (Cleanly incorporated into the periods list with distinct badge) */}
                          {autoAdjustInfo && (
                            <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.08)' : '#fffbeb' }}>
                              <TableCell sx={{ fontWeight: 700, color: 'warning.dark' }}>Auto</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: 'warning.dark' }}>
                                {autoAdjustInfo.startPeriod} — {autoAdjustInfo.endPeriod}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={`AutoAdjust (${autoAdjustInfo.monthsCount} oy oraliq)`}
                                  size="small"
                                  color="warning"
                                  sx={{ height: 20, fontSize: '11px', fontWeight: 700 }}
                                />
                              </TableCell>
                              <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: 'success.main' }}>
                                -{autoAdjustInfo.inhabitantsDiff} kishi ({autoAdjustInfo.oldCount} → {autoAdjustInfo.newCount})
                              </TableCell>
                              <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: 'warning.dark' }}>
                                +{Math.abs(Number(autoAdjustInfo.adjustmentAmount || autoAdjustInfo.difference || 0)).toLocaleString()} so'm
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Summary row */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        bgcolor: 'action.hover',
                        borderRadius: 1.5
                      }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          Yashovchilar:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {ariza?.current_prescribed_cnt ?? '—'} → {ariza?.next_prescribed_cnt ?? '—'} kishi
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          Jami summa:
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>
                          {recalcTotalSum.toLocaleString()} so'm
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Card>

                {/* Audit DHJ Table (Showing recalculation impact on resident statements) */}
                <AuditDHJTable ariza={ariza} maxHeight={560} />
              </>
            )}

            {/* ----------------- CASE 2: SECONDARY ACCOUNT REMOVAL (dvaynik) ----------------- */}
            {isDvaynik && (
              <>
                {/* Side-by-side Accounts Comparison */}
                <Card
                  elevation={0}
                  sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Dvaynik: Qoladigan va O‘chadigan hisob raqamlar
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Primary Account (Stays active) */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1.5px solid',
                          borderColor: 'success.main',
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.08)' : '#f0fdf4'
                        }}
                      >
                        <Stack spacing={1}>
                          <Chip
                            label="Qoladigan asosiy hisob raqam"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 800, width: 'fit-content' }}
                          />
                          <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'success.dark' }}>
                            {ariza.licshet}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {ariza.fullName || ariza.fio || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Manzil: {ariza.address || ariza.mahalla || '—'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Yashovchilar: {ariza.current_prescribed_cnt ?? '—'} kishi
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>

                    {/* Secondary Account (Gets deleted / cancelled) */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1.5px solid',
                          borderColor: 'error.main',
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2'
                        }}
                      >
                        <Stack spacing={1}>
                          <Chip
                            label="O‘chadigan / Bekor bo‘luvchi hisob"
                            size="small"
                            color="error"
                            sx={{ fontWeight: 800, width: 'fit-content' }}
                          />
                          <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'error.dark' }}>
                            {ariza.ikkilamchi_licshet || '—'}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {ariza.ikkilamchi_fio || ariza.ikkilamchi_fullName || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Manzil: {ariza.ikkilamchi_manzil || '—'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>
                            Holati:{' '}
                            {isActEntered ? 'Shartnoma bekor qilingan va balans 0 ga keltirilgan' : 'Shartnoma bekor qilinishi kutilmoqda'}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>
                </Card>

                {/* Dvaynik Acts Registry (1-4 acts involved in the removal) */}
                <Card
                  elevation={0}
                  sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
                    {isActEntered
                      ? 'Dvaynik bo‘yicha rasmiylashtirilgan aktlar (1-4 ta akt)'
                      : 'Dvaynik bo‘yicha kutilayotgan / rejalashtirilgan aktlar (1-4 ta akt)'}
                  </Typography>

                  <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.100' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Akt maqsadi / Turi</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Akt ID raqami</TableCell>
                          <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Akt summasi</TableCell>
                          <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Holati</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* 1. Asosiy Dvaynik akti */}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>1. Asosiy ikkilamchi kod dalolatnomasi</TableCell>
                          <TableCell
                            sx={{ fontFamily: 'monospace', fontWeight: 700, color: isActEntered ? 'primary.main' : 'text.secondary' }}
                          >
                            {ariza.akt_id || ariza.aktInfo?.id
                              ? `#${ariza.akt_id || ariza.aktInfo?.id}`
                              : isActEntered
                                ? 'Mavjud emas'
                                : 'Kiritilmagan'}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                            {aktAmount ? `${aktAmount.toLocaleString()} so'm` : "0 so'm"}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            {isCancelled ? (
                              <Chip
                                label="Bekor qilingan"
                                size="small"
                                color="error"
                                sx={{ height: 20, fontSize: '11px', fontWeight: 700 }}
                              />
                            ) : isConfirmed ? (
                              <Chip
                                label="Tasdiqlangan"
                                size="small"
                                color="success"
                                sx={{ height: 20, fontSize: '11px', fontWeight: 700 }}
                              />
                            ) : isActEntered ? (
                              <Chip
                                label="Akt kiritilgan"
                                size="small"
                                color="primary"
                                sx={{ height: 20, fontSize: '11px', fontWeight: 700 }}
                              />
                            ) : (
                              <Chip
                                label="Kutilmoqda"
                                size="small"
                                color="warning"
                                sx={{ height: 20, fontSize: '11px', fontWeight: 700 }}
                              />
                            )}
                          </TableCell>
                        </TableRow>

                        {/* 2. Balansni 0 qilish akti */}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>2. Ikkilamchi hisob balansini 0 qilish akti</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            {ariza.balance_akt_id ? `#${ariza.balance_akt_id}` : isActEntered ? 'Avtomatik' : 'Kutilmoqda'}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                            {isActEntered ? "0 so'm (Balans nollandi)" : "0 so'm (Nollash kutilmoqda)"}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            {isActEntered ? (
                              <Chip label="Bajarildi" size="small" color="success" sx={{ height: 20, fontSize: '11px', fontWeight: 700 }} />
                            ) : isCancelled ? (
                              <Chip label="Bekor qilingan" size="small" color="default" sx={{ height: 20, fontSize: '11px' }} />
                            ) : (
                              <Chip
                                label="Kutilmoqda"
                                size="small"
                                color="default"
                                sx={{ height: 20, fontSize: '11px', fontWeight: 600 }}
                              />
                            )}
                          </TableCell>
                        </TableRow>

                        {/* 3. Pul ko'chirish akti (agar pul ko'chirilgan bo'lsa) */}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>3. Qoldiq mablag‘ni asosiy hisobga o‘tkazish</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>
                            {ariza.transfer_akt_id
                              ? `#${ariza.transfer_akt_id}`
                              : ariza.shouldBeMoneyTransfer
                                ? isActEntered
                                  ? 'Kiritilgan'
                                  : 'Kutilmoqda'
                                : 'Talab etilmadi'}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                            {ariza.shouldBeMoneyTransfer ? `${aktAmount.toLocaleString()} so'm` : '—'}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            {ariza.shouldBeMoneyTransfer ? (
                              isActEntered ? (
                                <Chip
                                  label="O‘tkazildi"
                                  size="small"
                                  color="success"
                                  sx={{ height: 20, fontSize: '11px', fontWeight: 700 }}
                                />
                              ) : isCancelled ? (
                                <Chip label="Bekor qilingan" size="small" color="default" sx={{ height: 20, fontSize: '11px' }} />
                              ) : (
                                <Chip
                                  label="Kutilmoqda"
                                  size="small"
                                  color="warning"
                                  sx={{ height: 20, fontSize: '11px', fontWeight: 600 }}
                                />
                              )
                            ) : (
                              <Chip label="Talab etilmaydi" size="small" variant="outlined" sx={{ height: 20, fontSize: '11px' }} />
                            )}
                          </TableCell>
                        </TableRow>

                        {/* 4. Shartnomani bekor qilish akti */}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>4. Ikkilamchi shartnomani bekor qilish akti</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>
                            {ariza.cancel_contract_akt_id
                              ? `#${ariza.cancel_contract_akt_id}`
                              : isActEntered
                                ? 'Rasmiylashtirilgan'
                                : 'Kutilmoqda'}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>0 so'm</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            {isActEntered ? (
                              <Chip
                                label="Shartnoma yopildi"
                                size="small"
                                color="error"
                                sx={{ height: 20, fontSize: '11px', fontWeight: 700 }}
                              />
                            ) : isCancelled ? (
                              <Chip label="Bekor qilingan" size="small" color="default" sx={{ height: 20, fontSize: '11px' }} />
                            ) : (
                              <Chip
                                label="Kutilmoqda"
                                size="small"
                                color="default"
                                sx={{ height: 20, fontSize: '11px', fontWeight: 600 }}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </>
            )}

            {/* ----------------- CASE 3: MONEY TRANSFER (pul_kuchirish) ----------------- */}
            {isMoneyTransfer && (
              <Card
                elevation={0}
                sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Mablag‘ ko‘chirish yo‘nalishi va aktlari
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {/* From Account */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Chiquvchi hisob raqam (Yechilgan):
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'error.main', my: 0.5 }}>
                        {ariza.licshet}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {ariza.fullName || ariza.fio}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'error.main', mt: 1 }}>
                        -{Math.abs(aktAmount).toLocaleString()} so'm
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* To Account */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Kiruvchi hisob raqam (Tushirilgan):
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'success.main', my: 0.5 }}>
                        {ariza.ikkilamchi_licshet || ariza.target_licshet || '—'}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {ariza.ikkilamchi_fio || ariza.target_fio || '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main', mt: 1 }}>
                        +{Math.abs(aktAmount).toLocaleString()} so'm
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Transfer Acts */}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  {isActEntered
                    ? 'Mablag‘ o‘tkazish bo‘yicha rasmiylashtirilgan aktlar:'
                    : 'Mablag‘ o‘tkazish bo‘yicha kutilayotgan aktlar:'}
                </Typography>
                <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Akt maqsadi</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Akt ID</TableCell>
                        <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Summa</TableCell>
                        <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Holat</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Mablag‘ yechish akti (Debitor/Kreditor kamayishi)</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          {ariza.akt_id || ariza.aktInfo?.id
                            ? `#${ariza.akt_id || ariza.aktInfo?.id}`
                            : isActEntered
                              ? '—'
                              : 'Kiritilmagan'}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'error.main' }}>
                          -{Math.abs(aktAmount).toLocaleString()} so'm
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {isActEntered ? (
                            <Chip label="Bajarildi" size="small" color="success" sx={{ height: 20, fontSize: '11px', fontWeight: 700 }} />
                          ) : isCancelled ? (
                            <Chip label="Bekor qilingan" size="small" color="error" sx={{ height: 20, fontSize: '11px' }} />
                          ) : (
                            <Chip label="Kutilmoqda" size="small" color="warning" sx={{ height: 20, fontSize: '11px', fontWeight: 600 }} />
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Mablag‘ni hisobga olish akti (Qabul qiluvchi abonentda)</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          {ariza.incoming_akt_id ? `#${ariza.incoming_akt_id}` : isActEntered ? 'Avtomatik' : 'Kutilmoqda'}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'success.main' }}>
                          +{Math.abs(aktAmount).toLocaleString()} so'm
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {isActEntered ? (
                            <Chip label="Bajarildi" size="small" color="success" sx={{ height: 20, fontSize: '11px', fontWeight: 700 }} />
                          ) : isCancelled ? (
                            <Chip label="Bekor qilingan" size="small" color="default" sx={{ height: 20, fontSize: '11px' }} />
                          ) : (
                            <Chip label="Kutilmoqda" size="small" color="default" sx={{ height: 20, fontSize: '11px', fontWeight: 600 }} />
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}

            {/* ----------------- CASE 4: RESIDENT TRANSFER (yashovchi_kuchirish) ----------------- */}
            {isResidentTransfer && (
              <Card
                elevation={0}
                sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Yashovchini boshqa hisob raqamga ko‘chirish
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Chiquvchi abonent (Aholi kamayadi):
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'monospace', mt: 0.5 }}>
                        {ariza.licshet}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {ariza.fullName}
                      </Typography>
                      <Chip label={`-${ariza.next_prescribed_cnt ?? 1} kishi`} color="error" size="small" sx={{ mt: 1, fontWeight: 700 }} />
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Kiruvchi abonent (Aholi ko‘payadi):
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'monospace', mt: 0.5 }}>
                        {ariza.ikkilamchi_licshet || '—'}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {ariza.ikkilamchi_fio || '—'}
                      </Typography>
                      <Chip
                        label={`+${ariza.next_prescribed_cnt ?? 1} kishi`}
                        color="success"
                        size="small"
                        sx={{ mt: 1, fontWeight: 700 }}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Card>
            )}

            {/* ----------------- CASE 5: CONTRACT CANCELLATION (cancelContract) ----------------- */}
            {isCancelContract && (
              <Card
                elevation={0}
                sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Shartnomani bekor qilish
                </Typography>
                <Paper
                  elevation={0}
                  sx={{ p: 2, borderRadius: 2, border: '1.5px solid', borderColor: 'error.light', bgcolor: 'background.default' }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Hisob raqami: <b>{ariza.licshet}</b> ({ariza.fullName})
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Bekor qilish asosi: {ariza.canceling_description || cleanComment || 'Ko‘rsatilmagan'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Akt ID:{' '}
                    {ariza.akt_id || ariza.aktInfo?.id ? `#${ariza.akt_id || ariza.aktInfo?.id}` : isActEntered ? '—' : 'Kiritilmagan'} ·
                    Balans: {isActEntered ? "0 so'mga keltirildi" : "Bekor qilinganda 0 so'mga keltiriladi"} · Holati:{' '}
                    {isCancelled ? 'Bekor qilingan' : isActEntered ? 'Shartnoma bekor qilingan' : 'Kutilmoqda'}
                  </Typography>
                </Paper>
              </Card>
            )}
          </Stack>
        </Grid>

        {/* ==================== RIGHT COLUMN: EMBEDDED PDF VIEWER ==================== */}
        <Grid size={{ xs: 12, lg: 5.5 }}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 650,
              height: '100%'
            }}
          >
            {/* PDF Viewer Header */}
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
                  startIcon={isLoadingPdf ? <CircularProgress size={14} color="inherit" /> : <PictureAsPdfOutlined />}
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

                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={<CollectionsOutlined />}
                  onClick={() => setImageModalOpen(true)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Rasmlar ({(ariza?.tempPhotos || []).length})
                </Button>
              </Stack>
            </Box>

            {/* PDF Viewer Container */}
            <Box sx={{ flex: 1, minHeight: 520, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
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

      {/* 3. ON-DEMAND CALCULATOR MODAL (SHOWN ONLY WHEN USER CLICKS "KALKULYATOR") */}
      <Dialog open={calcOpen} onClose={() => setCalcOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <CalculateOutlined color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Qayta hisob-kitob tekshiruv kalkulyatori
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setCalcOpen(false)}>
            <Clear fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Istagan davr va yashovchilar sonini kiritib, qonuniy tariflarga mosligini tekshiring:
          </Typography>

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

          <Button variant="contained" color="primary" onClick={handleRunCalculator} sx={{ fontWeight: 700 }}>
            Hisoblash
          </Button>

          {calcResult && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Hisoblangan jami summa:
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', my: 0.5 }}>
                {calcResult.total.toLocaleString()} so'm
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Qamrab olingan oylar: {calcResult.monthsCount} ta oy · Yashovchilar: {calcResult.inhabitants} kishi
              </Typography>
            </Paper>
          )}

          <Button
            size="small"
            variant="text"
            startIcon={<TableChartOutlined />}
            onClick={() => setShowTariffGuide(true)}
            sx={{ textTransform: 'none', fontWeight: 600, alignSelf: 'flex-start' }}
          >
            Viloyat rasmiy tariflari ma‘lumotnomasi
          </Button>
        </DialogContent>
      </Dialog>

      {/* Historical Tariffs Reference Dialog */}
      <Dialog open={showTariffGuide} onClose={() => setShowTariffGuide(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Viloyat bo‘yicha rasmiy chiqindi tariflari ma‘lumotnomasi</DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Davr</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>1 kishi uchun tarif (oylik)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>2020-yil va undan oldingi davrlar</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>2 000 so'm</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>2021-yil — 2022-yil (31.12.2022 gacha)</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>2 600 so'm</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>2023-yil (01.01.2023 — 31.12.2023)</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>3 500 so'm</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>2024-yil — 2026-yil (joriy tarif)</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                    4 000 so'm
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      {/* 4. ATTACHED IMAGES GALLERY MODAL */}
      <AttachedImagesModal open={imageModalOpen} onClose={() => setImageModalOpen(false)} ariza={ariza} onPhotosUpdated={onReloadList} />

      {/* 5. PASTE / UPLOAD IMAGE DIALOG */}
      <PasteImageDialog open={pasteImageOpen} setOpen={setPasteImageOpen} ariza={ariza} onUploaded={onReloadList} />

      {/* 6. LOCATION PICKER & MAP DIALOG */}
      <LocationPickerDialog
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        initial={currentLocation}
        subtitle={ariza ? `${ariza.licshet} · ${ariza.fullName || ariza.fio}` : ''}
        mahallaId={ariza?.mahallaId}
        residentId={ariza?.abonentId}
        onSave={handleSaveLocation}
      />
    </Box>
  );
};

export default ArizaAuditBreakdown;
