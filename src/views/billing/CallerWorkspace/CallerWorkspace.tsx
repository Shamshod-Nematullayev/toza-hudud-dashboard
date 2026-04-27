import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  TextField,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Chip,
  Backdrop,
  CircularProgress
} from '@mui/material';
import { CheckCircle as SuccessIcon, Cancel as FailIcon, ErrorOutline as InfoIcon, Message as MessageIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { CallResult, createCallWarningsService, ICallStats, ICallWarning } from 'services/caller.service';
import api from 'utils/api';
import { useAbonentStore } from '../Abonent/abonentStore';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import useCustomizationStore from 'store/customizationStore';
import { kirillga } from 'helpers/lotinKiril';

export const CallerWorkspace: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<ICallWarning | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [note, setNote] = useState('');
  const callerService = createCallWarningsService(api);
  const [balanceYearEnd, setBalanceYearEnd] = useState(0);
  const { getDetails, abonentDetails, getIncomePredicts, balancePredicts } = useAbonentStore();
  const { language } = useCustomizationStore();
  const [todayStats, setTodayStats] = useState<ICallStats>({
    summary: {
      completed: 0,
      rejected: 0,
      totalCalls: 0,
      unanswered: 0,
      uniqueResidents: 0
    },
    timeline: []
  });

  // Skriptlar ro'yxati
  const SCRIPTS = {
    // 1. Yumshoq eslatma (Dastlabki aloqa)
    POLITE: `Assalomu alaykum, ${abonentDetails?.fullName}! Siz bilan maishiy chiqindilarni olib chiqib ketish xizmatidan bog'lanyapmiz. Monitoring natijasida hisobingizda ${abonentDetails?.balance.kSaldo.toLocaleString()} so'm qarzdorlik borligi aniqlandi. To'lovni yaqin orada amalga oshirish imkoningiz bormi?`,

    // 2. Jiddiy talab (Ikkinchi bosqich)
    DEMAND: `Assalomu alaykum, ${abonentDetails?.fullName}. Sizga maishiy chiqindi xizmatidan mavjud ${abonentDetails?.balance.kSaldo.toLocaleString()} so'm qarzdorlik bo'yicha avval ham eslatma berilgan edi. Agarda bugun kun yakuniga qadar to'lov amalga oshirilmasa, qarzdorlik majburiy tartibda undirish uchun tegishli organlarga yuboriladi.`,

    // 3. Rasmiy ogohlantirish (Eng yuqori bosqich - Sizning namunangiz asosida)
    WARNING: `Assalomu alaykum, ${abonentDetails?.fullName} siz bo'lasizmi? Sizning maishiy chiqindi to'lovlaridan ${abonentDetails?.balance.kSaldo.toLocaleString()} so'm qarzdorligingiz mavjud. Agarda 5 ish kuni ichida ushbu qarzdorlik bartaraf etilmasa, amaldagi qonunchilikka asosan elektr energiyasi yetkazib berishga cheklov qo'yilishi haqida rasman ogohlantiramiz.`
  };

  // Umumiy yordamchi funksiya - Tafsilotlarni olish uchun
  const updateAbonentInfo = async (residentId: number) => {
    await getDetails(residentId);
    const periodYearEnd = dayjs().endOf('year').format('MM.YYYY');

    // Yil oxirigacha balansni bashorat qilish uchun
    await getIncomePredicts(residentId, periodYearEnd);

    const balanceYearEnd = useAbonentStore.getState().balancePredicts?.balancePredictItems.find((b) => b.period === periodYearEnd);
    setBalanceYearEnd(balanceYearEnd?.balanceAmount || 0);
  };

  useEffect(() => {
    const fetchSubscriber = async () => {
      if (!id) return;
      setLoading(true);

      try {
        const response = await callerService.claim(id);
        await updateAbonentInfo(response.content.residentId);
        setData(response.content);
      } catch (error: any) {
        const errorMsg = error?.response?.data?.message;
        const content = error?.response?.data?.content;

        // 1-holat: Tugallanmagan vazifa
        if (errorMsg === 'Sizda tugallanmagan vazifa bor') {
          if (content?._id !== id) {
            toast.error(errorMsg);
            navigate(`/billing/caller-warnings/${content._id}`);
          } else {
            await updateAbonentInfo(content.residentId);
            setData(content);
          }
        }
        // 2-holat: Abonent band yoki holati o'zgargan
        else if (errorMsg === "Bu abonent allaqachon band qilingan yoki holati o'zgargan.") {
          await handleGoNext();
        }
        // Qolgan xatoliklar
        else {
          console.error("Ma'lumot olishda xato:", error);
          toast.error(errorMsg || "Noma'lum xatolik");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriber();

    async function fetchStats() {
      const data = await callerService.getDailyStats(dayjs().startOf('day').toISOString(), dayjs().toISOString(), 'daily');

      setTodayStats(data.content);
      callerService.getOperatorStats(dayjs().startOf('month').toISOString(), dayjs().endOf('month').toISOString());
    }
    fetchStats();
  }, [id]);

  // Keyingisiga o'tish logikasini alohida funksiyaga chiqaramiz
  const handleGoNext = async () => {
    try {
      const next = await callerService.getNext();
      const nextId = next.content?._id;

      if (nextId) {
        setNote('');
        navigate(`/caller-warnings/${nextId}`);
      } else {
        toast.success(next.message || "Barcha qo'ng'iroqlar yakunlandi, To'ram!", { autoClose: false });
        navigate('/');
      }
    } catch (error) {
      console.error('Navbatdagi abonentni olishda xato:', error);
    }
  };

  // 2. Natijani saqlash va keyingisiga o'tish
  const handleAction = async (status: CallResult) => {
    try {
      setSubmitting(true);
      const payload = {
        result: status,
        comment: note,
        phoneNumber: abonentDetails?.phone || ''
      };

      await callerService.setResult(id!, payload);
      await handleGoNext();
    } catch (error) {
      console.error('Saqlashda xatolik:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Backdrop open>
        <CircularProgress />
      </Backdrop>
    );
  if (!data) return <Typography>Ma'lumot topilmadi.</Typography>;

  return (
    <Box sx={{ p: 2, bgcolor: 'background.default', transition: '0.3s' }}>
      {/* 1. Header: Statistika (Ranglar va ko'rinish light modeda to'g'rilandi) */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {[
          {
            label: 'Bugun jami',
            val: todayStats.summary.completed + todayStats.summary.rejected + todayStats.summary.unanswered,
            color: 'primary.main',
            bg: 'primary.light'
          },
          { label: 'Muvaffaqiyatli', val: todayStats.summary.completed, color: 'success.dark', bg: 'success.light' },
          { label: "Bog'lanib bo'lmadi", val: todayStats.summary.unanswered, color: 'warning.dark', bg: 'warning.light' },
          { label: "Noto'g'ri raqam", val: todayStats.summary.rejected, color: 'error.main', bg: 'error.light' }
        ].map((stat) => (
          <Grid item xs={6} md={3} key={stat.label}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                textAlign: 'center',
                borderColor: stat.color,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'transparent' : stat.bg),
                opacity: 0.9
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {stat.label}
              </Typography>
              <Typography variant="h5" sx={{ color: stat.color, fontWeight: 800 }}>
                {stat.val}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {/* 2. Main Work Area (70%) */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  {/* Hisob raqami o'qishga qulay bo'lishi uchun bo'shliqlar bilan (4-4-4 formatida) */}
                  <Typography variant="caption" color="secondary" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                    ID: #{abonentDetails?.id} — HISOB RAQAM:{' '}
                    <Typography
                      sx={{ fontSize: '1.2rem', display: 'inline', color: 'text.primary', fontWeight: 'bold', textDecoration: 'underline' }}
                    >
                      {abonentDetails?.accountNumber.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')}
                    </Typography>
                  </Typography>

                  <Typography variant="h3" sx={{ mt: 0.5, fontWeight: 700, color: 'text.primary' }}>
                    {abonentDetails?.fullName}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <b>Tug'ilgan yili:</b> {dayjs(abonentDetails?.citizen.birthDate).get('year')} | <b>Tel:</b> {abonentDetails?.phone}
                  </Typography>

                  {/* Yangi qo'shilgan Manzil qismi */}
                  <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <strong>Manzil:</strong>{' '}
                    {[
                      abonentDetails?.mahallaName + ' MFY',
                      abonentDetails?.streetName + " ko'chasi",
                      abonentDetails?.house.homeNumber + ' uy'
                    ].join(', ')}
                  </Typography>
                </Box>

                {(abonentDetails?.balance.kSaldo || 0) > 0 && (
                  <Chip label="Qarzdor" color="error" variant="filled" sx={{ fontWeight: 'bold' }} />
                )}
              </Box>

              <Grid container spacing={1}>
                <Grid item xs={6} sm={3}>
                  <Alert severity="error" icon={false} sx={{ py: 0.5, textAlign: 'center', border: '1px solid' }}>
                    <Typography variant="h3" sx={{ lineHeight: 1.2 }}>
                      {abonentDetails?.balance.kSaldo.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                      Qarz
                    </Typography>
                  </Alert>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Alert severity="warning" icon={false} sx={{ py: 0.5, textAlign: 'center', border: '1px solid' }}>
                    <Typography variant="h3" sx={{ lineHeight: 1.2 }}>
                      {balanceYearEnd.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                      Yil oxiri
                    </Typography>
                  </Alert>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Alert severity="info" icon={false} sx={{ py: 0.5, textAlign: 'center', border: '1px solid' }}>
                    <Typography variant="h3" sx={{ lineHeight: 1.2 }}>
                      {abonentDetails?.house.inhabitantCnt} kishi
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                      A'zolar
                    </Typography>
                  </Alert>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Alert severity="success" icon={false} sx={{ py: 0.5, textAlign: 'center', border: '1px solid' }}>
                    <Typography variant="h3" sx={{ lineHeight: 1.2 }}>
                      {abonentDetails?.balance.rate}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                      Tarif
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>

            {/* Amallar */}
            <Stack direction="row" spacing={1.5}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                startIcon={<SuccessIcon />}
                onClick={() => handleAction('warned')}
                disabled={submitting}
              >
                To'lovga rozi
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="warning"
                size="large"
                startIcon={<FailIcon />}
                onClick={() => handleAction('unanswered')}
                disabled={submitting}
              >
                Band / Keyinroq
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="large"
                startIcon={<InfoIcon />}
                onClick={() => handleAction('wrongNumber')}
                disabled={submitting}
              >
                Noto'g'ri raqam
              </Button>
            </Stack>

            {/* Optional Note (Sxemadagi izoh joyi) */}
            <TextField
              fullWidth
              multiline
              rows={2}
              margin="normal"
              label="Qo'shimcha izoh (ixtiyoriy)"
              placeholder="Mijoz nima dedi?..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              sx={{ mt: 3 }}
            />
          </Paper>
        </Grid>

        {/* 3. Sidebar (30%) */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            {/* Skriptlar Tabi */}
            <Paper sx={{ p: 1 }}>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
                <Tab label="Muloyim" sx={{ fontSize: '1rem' }} />
                <Tab label="Talab" sx={{ fontSize: '1rem' }} />
                <Tab label="Xatar" sx={{ fontSize: '1rem' }} />
              </Tabs>
              <Box sx={{ p: 2, minHeight: '80px' }}>
                <Typography variant="body1" color="text.primary" sx={{ fontStyle: 'italic', fontSize: '1.9rem' }}>
                  "{' '}
                  {language !== 'uz'
                    ? kirillga(activeTab === 0 ? SCRIPTS.POLITE : activeTab === 1 ? SCRIPTS.DEMAND : SCRIPTS.WARNING)
                    : activeTab === 0
                      ? SCRIPTS.POLITE
                      : activeTab === 1
                        ? SCRIPTS.DEMAND
                        : SCRIPTS.WARNING}
                  "
                </Typography>
              </Box>
            </Paper>

            {/* Tarix: Dayjs va Popper bilan */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                Qo'ng'iroqlar tarixi
              </Typography>
              <List dense sx={{ maxHeight: '180px', overflowY: 'auto' }}>
                {data.calls.map((item, index) => (
                  <ListItem key={index} divider sx={{ px: 0 }}>
                    <ListItemText
                      primary={dayjs(item.date).format('DD.MM.YYYY HH:mm')}
                      secondary={`${t(('callResults.' + item.result) as 'callResults.warned')} - ${item.userId.fullName}`}
                      primaryTypographyProps={{ variant: 'caption', fontWeight: 'bold' }}
                    />
                    <Tooltip title={item.comment} arrow placement="left">
                      <IconButton size="small" color="primary">
                        <MessageIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
