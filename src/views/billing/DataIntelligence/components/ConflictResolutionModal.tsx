import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Chip,
  Paper,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  Alert
} from '@mui/material';
import {
  Close,
  CheckCircle,
  HighlightOffRounded,
  WarningAmberRounded,
  PersonOutlineOutlined,
  FingerprintOutlined,
  HomeWorkOutlined,
  LocationOnOutlined,
  TagOutlined,
  RefreshRounded,
  Search,
  CheckCircleOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { useDataIntelligenceStore } from '../store/useDataIntelligenceStore';
import { searchGreenZoneRealApi } from '../engine/candidateFinder';
import { SERVER_DOMAIN } from 'store/constant';

interface ConflictResolutionModalProps {
  open: boolean;
  onClose: () => void;
  soliqRecord: any | null;
  onResolved: () => void;
}

interface EvaluatedCandidateItem {
  candidate: {
    id?: number | string;
    accountNumber?: string;
    fullName: string;
    pnfl?: string;
    cadastreNumber?: string;
    mahalla?: string;
    street?: string;
    phone?: string;
    source?: string;
  };
  score: number;
  decision: string;
  evidence?: Record<string, any>;
  conflicts?: string[];
  decisionReason?: string;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  open,
  onClose,
  soliqRecord,
  onResolved
}) => {
  const theme = useTheme();
  const { startCandidateSearchForStagingRecord } = useDataIntelligenceStore();

  const [loading, setLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | number | null>(null);
  const [rejectingAll, setRejectingAll] = useState(false);
  const [candidates, setCandidates] = useState<EvaluatedCandidateItem[]>([]);

  const fetchCandidates = useCallback(async () => {
    if (!soliqRecord) return;
    setLoading(true);

    const isProductionDomain = SERVER_DOMAIN.includes('greenzone.uz');

    // 1. Agar backendda /candidates endpointi bo'lsa, so'rov yuboramiz
    try {
      const res = await api.get(`/data-intelligence/soliq-records/${soliqRecord._id}/candidates`);
      if (res.data?.candidates && res.data.candidates.length > 0) {
        const hasCadastre = res.data.candidates.some((c: any) => Boolean(c.candidate?.cadastreNumber));
        // Agar nomzodlarda kadastr mavjud bo'lsa yoki soliq yozuvida kadastr bo'lmasa, darhol qabul qilamiz
        if (hasCadastre || !soliqRecord.cadastreNumber) {
          setCandidates(res.data.candidates);
          setLoading(false);
          return;
        }
      }
    } catch (e: any) {
      console.warn('Candidates endpoint failed, falling back to search API:', e?.message);
    }

    // 2. Fallback: to'g'ridan-to'g'ri searchGreenZoneRealApi orqali TozaMakondan jonli ma'lumotlarni tortish
    try {
      const searchRes = await searchGreenZoneRealApi(
        {
          id: soliqRecord._id,
          fullName: soliqRecord.fullName,
          pnfl: soliqRecord.pnfl,
          cadastreNumber: soliqRecord.cadastreNumber,
          mahalla: soliqRecord.mahalla,
          street: soliqRecord.street,
          phone: soliqRecord.phone
        },
        { maxCandidates: 25 }
      );

      if (searchRes?.candidates && searchRes.candidates.length > 0) {
        const mapped: EvaluatedCandidateItem[] = searchRes.candidates.map((c) => ({
          candidate: {
            id: c.subscriber.id,
            accountNumber: (c.subscriber.accountNumber || String(c.subscriber.id || '')).replace(/^Abonent\s*#?/i, ''),
            fullName: c.subscriber.fullName,
            pnfl: c.subscriber.pnfl,
            cadastreNumber: c.subscriber.cadastreNumber,
            mahalla: c.subscriber.mahalla,
            street: c.subscriber.street,
            phone: c.subscriber.phone,
            source: 'greenzone_db'
          },
          score: c.matchResult.overallScore,
          decision: c.matchResult.categoryLabel,
          decisionReason: c.primaryReason || c.matchResult.summaryExplanation
        }));
        setCandidates(mapped);
      } else {
        setCandidates([]);
      }
    } catch (searchErr: any) {
      toast.error(searchErr?.response?.data?.message || 'Nomzodlarni yuklashda xatolik yuz berdi');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [soliqRecord]);

  useEffect(() => {
    if (open && soliqRecord?._id) {
      fetchCandidates();
    } else {
      setCandidates([]);
      setResolvingId(null);
      setRejectingAll(false);
    }
  }, [open, soliqRecord?._id, fetchCandidates]);

  const handleConfirmCandidate = async (item: EvaluatedCandidateItem) => {
    if (!soliqRecord?._id) return;
    const candId = item.candidate.id || item.candidate.accountNumber || 'item';
    setResolvingId(candId);

    try {
      const res = await api.post(`/data-intelligence/soliq-records/${soliqRecord._id}/resolve-conflict`, {
        action: 'confirm',
        candidate: {
          id: item.candidate.id,
          accountNumber: item.candidate.accountNumber,
          fullName: item.candidate.fullName,
          pinfl: item.candidate.pnfl,
          cadastralNumber: item.candidate.cadastreNumber,
          mahallaName: item.candidate.mahalla,
          score: item.score,
          evidence: item.evidence
        },
        note: `Admin tomonidan #${item.candidate.accountNumber || item.candidate.id} abonent tanlandi va biriktirildi`
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Ziddiyat muvaffaqiyatli yechildi: Abonentga biriktirildi!');
        onResolved();
        onClose();
      } else {
        toast.warning(res.data?.message || 'Amal bajarilmadi');
      }
    } catch (e: any) {
      if (e?.response?.status === 404) {
        toast.warning(
          "Serverda ziddiyatni yechish API si hali yangilanmagan. Mahalliy backend (localhost:5000) yoki serverni yangilang.",
          { autoClose: 7000 }
        );
      } else {
        toast.error(e?.response?.data?.message || 'Tasdiqlashda xatolik yuz berdi');
      }
    } finally {
      setResolvingId(null);
    }
  };

  const handleRejectAll = async () => {
    if (!soliqRecord?._id) return;
    setRejectingAll(true);

    try {
      const res = await api.post(`/data-intelligence/soliq-records/${soliqRecord._id}/resolve-conflict`, {
        action: 'reject_all',
        reason: 'Admin tomonidan mavjud nomzodlar mos kelmadi deb topildi (Topilmadi statusiga o\'tkazildi)'
      });

      if (res.data?.success) {
        toast.info("Yozuv 'Topilmadi' deb belgilandi. Endi yangi abonent kodi ochishingiz mumkin.");
        onResolved();
        onClose();
      } else {
        toast.warning(res.data?.message || 'Amal bajarilmadi');
      }
    } catch (e: any) {
      if (e?.response?.status === 404) {
        toast.warning(
          "Serverda ziddiyatni yechish API si hali yangilanmagan. Mahalliy backend (localhost:5000) yoki serverni yangilang.",
          { autoClose: 7000 }
        );
      } else {
        toast.error(e?.response?.data?.message || 'Xatolik yuz berdi');
      }
    } finally {
      setRejectingAll(false);
    }
  };

  const handleManualSearch = () => {
    if (soliqRecord) {
      startCandidateSearchForStagingRecord({
        id: soliqRecord._id,
        fullName: soliqRecord.fullName,
        pnfl: soliqRecord.pnfl,
        cadastreNumber: soliqRecord.cadastreNumber,
        mahalla: soliqRecord.mahalla,
        street: soliqRecord.street,
        phone: soliqRecord.phone,
        objectType: soliqRecord.objectType,
        source: 'soliq'
      });
      toast.info("Qo'lda qidiruv uchun Candidate Finder ochilmoqda...");
      onClose();
    }
  };

  if (!soliqRecord) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1
          }
        }
      }}
    >
      {/* Dialog Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
              <Chip
                icon={<WarningAmberRounded sx={{ fontSize: 16 }} />}
                label="Ziddiyatni Yechish"
                color="warning"
                size="small"
                sx={{ fontWeight: 700 }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Abonent Mosligini Tasdiqlash
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              AI tizimi bir nechta nomzod yoki ziddiyatli holat aniqlagan. Haqiqiy mos abonentni tanlang yoki rad eting.
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Top Card: Soliq Ma'lumoti */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2.5,
              bgcolor: alpha(theme.palette.warning.main, 0.04),
              borderColor: alpha(theme.palette.warning.main, 0.3)
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Chip label="Soliq Bazasidagi Asl Yozuv" size="small" color="default" sx={{ fontWeight: 700 }} />
                <Typography variant="caption" color="text.secondary">
                  ID: {soliqRecord._id}
                </Typography>
              </Stack>
              {soliqRecord.matchScore !== undefined && (
                <Chip
                  label={`${soliqRecord.matchScore}% Dastlabki Ball`}
                  size="small"
                  color={soliqRecord.matchScore >= 80 ? 'warning' : 'default'}
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 1.5
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonOutlineOutlined sx={{ fontSize: 14 }} /> F.I.Sh (Soliq)
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.2 }}>
                  {soliqRecord.fullName || '—'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FingerprintOutlined sx={{ fontSize: 14 }} /> JShShIR
                </Typography>
                <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 700, mt: 0.2 }}>
                  {soliqRecord.pnfl || 'Mavjud emas'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HomeWorkOutlined sx={{ fontSize: 14 }} /> Kadastr Raqami
                </Typography>
                <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 700, mt: 0.2 }}>
                  {soliqRecord.cadastreNumber || 'Mavjud emas'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnOutlined sx={{ fontSize: 14 }} /> Mahalla & Ko'cha
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.2 }}>
                  {soliqRecord.mahalla || '—'}
                  {soliqRecord.street ? `, ${soliqRecord.street}` : ''}
                </Typography>
              </Box>
            </Box>

            {/* AI Reason explanation */}
            {soliqRecord.auditTrail?.decisionReason && (
              <Alert severity="warning" icon={<WarningAmberRounded />} sx={{ mt: 1.5, py: 0.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  AI izohi: {soliqRecord.auditTrail.decisionReason}
                </Typography>
              </Alert>
            )}
          </Paper>

          {/* Section: Candidate Abonents */}
          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Aniqlangan Nomzod Abonentlar ({candidates.length} ta)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tizim quyidagi abonentlarni eng yaqin deb topdi. Qaysi biri aynan mos kelishini belgilang.
                </Typography>
              </Box>

              <Button
                size="small"
                variant="text"
                startIcon={<RefreshRounded />}
                onClick={fetchCandidates}
                disabled={loading}
                sx={{ textTransform: 'none' }}
              >
                Qayta tekshirish
              </Button>
            </Stack>

            {loading ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={36} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  Nomzodlar solishtirilmoqda va ballar hisoblanmoqda...
                </Typography>
              </Box>
            ) : candidates.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.divider, 0.05), borderRadius: 2.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Mos keluvchi abonent nomzodlari topilmadi
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, mb: 2 }}>
                  Ushbu fuqaro hali tizimda ro'yxatdan o'tmagan bo'lishi mumkin. Yozuvni "Topilmadi" deb belgilab, yangi abonent kodi ochishingiz mumkin.
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<HighlightOffRounded />}
                    onClick={handleRejectAll}
                    disabled={rejectingAll}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Topilmadi deb belgilash
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Search />}
                    onClick={handleManualSearch}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Qo'lda qidirish
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {candidates.map((item, idx) => {
                  const cand = item.candidate;
                  const isCurrentResolving = resolvingId === (cand.id || cand.accountNumber || idx);
                  const isHighMatch = item.score >= 80;

                  return (
                    <Paper
                      key={cand.id || cand.accountNumber || idx}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        borderColor: isHighMatch ? alpha(theme.palette.success.main, 0.4) : theme.palette.divider,
                        bgcolor: isHighMatch ? alpha(theme.palette.success.main, 0.02) : 'background.paper',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: 2,
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      {/* Candidate Header */}
                      <Stack
                        direction="row"
                        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}
                      >
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Chip
                            label={`#${idx + 1}`}
                            size="small"
                            sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.text.primary, 0.08) }}
                          />
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {cand.fullName || '—'}
                          </Typography>
                          {cand.accountNumber && (
                            <Chip
                              icon={<TagOutlined sx={{ fontSize: 14 }} />}
                              label={`Hisob raqam: #${cand.accountNumber}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontWeight: 700 }}
                            />
                          )}
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Chip
                            icon={isHighMatch ? <CheckCircleOutlined sx={{ fontSize: 16 }} /> : <WarningAmberRounded sx={{ fontSize: 16 }} />}
                            label={`${item.score}% Moslik`}
                            color={isHighMatch ? 'success' : item.score >= 50 ? 'warning' : 'default'}
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                          {cand.source && (
                            <Chip
                              label={cand.source === 'greenzone_db' ? 'Lokal baza' : 'TozaMakon'}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Stack>
                      </Stack>

                      {/* Candidate Attributes Grid */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.divider, 0.04)
                        }}
                      >
                        {/* JShShIR */}
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            JShShIR (Abonent)
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              color:
                                cand.pnfl && soliqRecord.pnfl && cand.pnfl === soliqRecord.pnfl
                                  ? 'success.main'
                                  : 'text.primary'
                            }}
                          >
                            {cand.pnfl || 'Mavjud emas'}
                          </Typography>
                        </Box>

                        {/* Kadastr */}
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Kadastr Raqami
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              color:
                                cand.cadastreNumber &&
                                soliqRecord.cadastreNumber &&
                                cand.cadastreNumber === soliqRecord.cadastreNumber
                                  ? 'success.main'
                                  : 'text.primary'
                            }}
                          >
                            {cand.cadastreNumber || 'Mavjud emas'}
                          </Typography>
                        </Box>

                        {/* Mahalla */}
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Mahalla
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {cand.mahalla || '—'}
                          </Typography>
                        </Box>

                        {/* Ko'cha / Manzil */}
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Ko'cha va Manzil
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {cand.street || '—'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Evidence & Decision Reason */}
                      {item.decisionReason && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, px: 0.5 }}>
                          ℹ️ {item.decisionReason}
                        </Typography>
                      )}

                      {/* Action Button */}
                      <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 1.5 }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={isCurrentResolving ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                          onClick={() => handleConfirmCandidate(item)}
                          disabled={Boolean(resolvingId) || rejectingAll}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            fontWeight: 700,
                            px: 2,
                            boxShadow: theme.shadows[1]
                          }}
                        >
                          Ushbu abonentga biriktirish
                        </Button>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>

      {/* Dialog Footer Actions */}
      <DialogActions sx={{ px: 2.5, py: 1.5, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={rejectingAll ? <CircularProgress size={16} color="inherit" /> : <HighlightOffRounded />}
            onClick={handleRejectAll}
            disabled={Boolean(resolvingId) || rejectingAll}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            Hech qaysi biri mos emas (Topilmadi deb belgilash)
          </Button>

          <Button
            variant="text"
            color="primary"
            startIcon={<Search />}
            onClick={handleManualSearch}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Qo'lda qidirish
          </Button>
        </Stack>

        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ textTransform: 'none', borderRadius: 2 }}>
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
};
