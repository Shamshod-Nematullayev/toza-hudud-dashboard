import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
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
  useTheme,
  alpha,
  Alert,
  CircularProgress,
  Drawer,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as RunJobIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircleOutlined as SuccessIcon,
  ErrorOutlineOutlined as ErrorIcon,
  HomeOutlined as HomeIcon,
  LocationCityOutlined as StreetIcon,
  PeopleOutlineOutlined as PeopleIcon,
  AssignmentOutlined as DefectIcon,
  OpenInNew as ExternalLinkIcon,
  Bolt as JobIcon,
  Layers as SyncIcon,
  VpnKeyOutlined as KeyIcon,
  VisibilityOutlined as VisibilityIcon,
  VisibilityOffOutlined as VisibilityOffIcon,
  SaveOutlined as SaveIcon,
  VerifiedOutlined as VerifiedIcon,
  Group as FamilyIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import api from 'utils/api';
import { toast } from 'react-toastify';

interface StreetItem {
  id: number;
  name: string;
  homes_stat_count: number | null;
  population_stat_count: number | null;
  homes_surveyed_count: number;
  multistory_count: number;
  yard_count: number;
  dormitory_count: number;
  population_surveyed_count: number;
  youth_count: number;
  women_count: number;
  pensioner_count: number;
  defects_count: number;
  _rownum: number;
}

interface HomeItem {
  id: number;
  home_num: string;
  cadaster_number: string;
  full_name: string;
  mobile_phone: string;
  pinfl: string;
  ownership_type: string;
  survey_date: string;
  next_link: string;
  defects_info?: {
    type: string;
    value: string;
  };
}

interface SyncJobStatus {
  id: string;
  streetId: number | string;
  streetName?: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  total: number;
  processed: number;
  success: number;
  skipped: number;
  noCadastre: number;
  failed: number;
  familyMembersAdded?: number;
  currentCadaster?: string;
  errors: { id: number; cadaster: string; error: string }[];
  startTime: string;
  endTime?: string;
}

interface FamilyMemberItem {
  id: number;
  section?: number;
  full_name: string;
  relationship: string;
  birth_date: string;
  pinfl: number | string;
  phone?: string | null;
  survey_uuid: string;
}

const RELATIONSHIP_OPTIONS = [
  { id: 1, name: 'Отаси' },
  { id: 2, name: 'Онаси' },
  { id: 7, name: 'Турмуш ўртоғи' },
  { id: 4, name: 'Акаси' },
  { id: 3, name: 'Опаси' },
  { id: 6, name: 'Укаси' },
  { id: 5, name: 'Синглиси' },
  { id: 9, name: 'Ўғли' },
  { id: 8, name: 'Қизи' },
  { id: 15, name: 'Набира' },
  { id: 12, name: 'Келини' },
  { id: 14, name: 'Куёви' },
  { id: 10, name: 'Қайнотаси' },
  { id: 11, name: 'Қайнонаси' },
  { id: 13, name: 'Бошқа' }
];

export default function OnlineMahallaSync() {
  const theme = useTheme();

  // Filter parametrlari (localStorage dan olinadi, default bo'sh)
  const [oblId, setOblId] = useState<string>(() => {
    return localStorage.getItem('online_mahalla_obl_id') || '';
  });
  const [areaId, setAreaId] = useState<string>(() => {
    return localStorage.getItem('online_mahalla_area_id') || '';
  });
  const [districtId, setDistrictId] = useState<string>(() => {
    return localStorage.getItem('online_mahalla_district_id') || '';
  });

  // Token boshqaruvi (default qiymatsiz)
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('online_mahalla_token') || '';
  });
  const [showToken, setShowToken] = useState<boolean>(false);
  const [checkingToken, setCheckingToken] = useState<boolean>(false);
  const [tokenStatus, setTokenStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  // Ko'chalar ro'yxati
  const [streets, setStreets] = useState<StreetItem[]>([]);
  const [loadingStreets, setLoadingStreets] = useState<boolean>(false);

  // Tanlangan ko'cha va uning xonadonlari
  const [selectedStreet, setSelectedStreet] = useState<StreetItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [homes, setHomes] = useState<HomeItem[]>([]);
  const [loadingHomes, setLoadingHomes] = useState<boolean>(false);
  const [homeSearch, setHomeSearch] = useState<string>('');

  // Job holati
  const [currentJob, setCurrentJob] = useState<SyncJobStatus | null>(null);
  const [startingJob, setStartingJob] = useState<boolean>(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [syncMode, setSyncMode] = useState<'all' | 'owner_only' | 'family_only'>('all');

  // Oila a'zolari modali
  const [familyDialogOpen, setFamilyDialogOpen] = useState<boolean>(false);
  const [selectedHomeForFamily, setSelectedHomeForFamily] = useState<HomeItem | null>(null);
  const [surveyUuid, setSurveyUuid] = useState<string>('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberItem[]>([]);
  const [loadingFamily, setLoadingFamily] = useState<boolean>(false);

  // Yangi a'zo qo'shish formasi
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState<boolean>(false);
  const [newMemberFullName, setNewMemberFullName] = useState<string>('');
  const [newMemberPinfl, setNewMemberPinfl] = useState<string>('');
  const [newMemberDocSerial, setNewMemberDocSerial] = useState<string>('AA');
  const [newMemberDocNumber, setNewMemberDocNumber] = useState<string>('');
  const [newMemberBirthDate, setNewMemberBirthDate] = useState<string>('');
  const [newMemberRelationship, setNewMemberRelationship] = useState<number>(7);
  const [newMemberPhone, setNewMemberPhone] = useState<string>('');
  const [submittingMember, setSubmittingMember] = useState<boolean>(false);

  // Tokenni tekshirish
  const handleCheckToken = async () => {
    const rawToken = token.trim();
    if (!rawToken) {
      toast.warning('Token kiritilmagan!');
      return;
    }
    if (!oblId.trim() || !areaId.trim() || !districtId.trim()) {
      toast.warning('Tokenni tekshirish uchun Viloyat ID, Tuman ID va Mahalla ID lari ham kiritilishi shart!');
      return;
    }
    setCheckingToken(true);
    try {
      // 1-urinish: Backend API orqali tekshirish
      const res = await api.post('/product-admin/online-mahalla/check-token', {
        token: rawToken,
        obl_id: Number(oblId),
        area_id: Number(areaId),
        district_id: Number(districtId)
      });
      if (res.data?.success) {
        setTokenStatus('valid');
        toast.success('Token faol va to‘g‘ri! (200 OK)');
        return;
      }
      throw new Error(res.data?.message || 'Token yaroqsiz');
    } catch (backendErr: any) {
      console.warn('Backend orqali tekshirib bo‘lmadi, bevosita Online-Mahalla API ga so‘rov yuborilmoqda...', backendErr);
      try {
        // 2-urinish: Brauzer orqali to‘g‘ridan-to‘g‘ri Online-Mahalla API ga tekshirish (Kafolatlangan fallback)
        const directRes = await fetch(
          `https://api.online-mahalla.uz/api/v1/survey_homes/cache/street?obl_id=${oblId.trim()}&area_id=${areaId.trim()}&district_id=${districtId.trim()}`,
          {
            method: 'GET',
            headers: {
              authorization: `Bearer ${rawToken}`,
              'ngrok-skip-browser-warning': '1',
              accept: 'application/json, text/plain, */*'
            }
          }
        );

        if (directRes.status === 200) {
          setTokenStatus('valid');
          toast.success('Token faol va to‘g‘ri! (Online-Mahalla 200 OK)');
        } else if (directRes.status === 401 || directRes.status === 403) {
          setTokenStatus('invalid');
          toast.error('Token yaroqsiz yoki muddati tugagan! (401 Unauthorized)');
        } else {
          setTokenStatus('invalid');
          toast.error(`Token xatosi: HTTP ${directRes.status}`);
        }
      } catch (directErr: any) {
        setTokenStatus('invalid');
        toast.error(backendErr?.response?.data?.message || directErr?.message || 'Tokenni tekshirishda xatolik yuz berdi!');
      }
    } finally {
      setCheckingToken(false);
    }
  };

  // Sozlamalarni saqlash
  const handleSaveSettings = () => {
    if (!token.trim()) {
      toast.warning('Token bo‘sh bo‘lishi mumkin emas');
      return;
    }
    localStorage.setItem('online_mahalla_token', token.trim());
    if (oblId.trim()) localStorage.setItem('online_mahalla_obl_id', oblId.trim());
    if (areaId.trim()) localStorage.setItem('online_mahalla_area_id', areaId.trim());
    if (districtId.trim()) localStorage.setItem('online_mahalla_district_id', districtId.trim());
    toast.success('Sozlamalar brauzerda muvaffaqiyatli saqlandi!');
    if (oblId.trim() && areaId.trim() && districtId.trim()) {
      fetchStreets();
    }
  };

  // 1. Ko'chalarni yuklash
  const fetchStreets = async () => {
    if (!oblId.trim() || !areaId.trim() || !districtId.trim()) {
      setStreets([]);
      return;
    }
    if (!token.trim()) {
      toast.warning('Online-Mahalla tokenini kiriting');
      return;
    }
    try {
      setLoadingStreets(true);
      const res = await api.get('/product-admin/online-mahalla/streets', {
        params: { obl_id: oblId.trim(), area_id: areaId.trim(), district_id: districtId.trim() },
        headers: { 'x-online-mahalla-token': token.trim() }
      });
      if (res.data?.success && res.data?.data?.results) {
        setStreets(res.data.data.results);
      } else {
        setStreets([]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Qishloqlar ro‘yxatini yuklashda xatolik');
    } finally {
      setLoadingStreets(false);
    }
  };

  useEffect(() => {
    if (oblId.trim() && areaId.trim() && districtId.trim() && token.trim()) {
      fetchStreets();
    }
  }, [oblId, areaId, districtId]);

  // 2. Tanlangan ko'cha xonadonlarini yuklash
  const fetchHomes = async (street: StreetItem) => {
    try {
      setLoadingHomes(true);
      const res = await api.get('/product-admin/online-mahalla/homes', {
        params: {
          obl_id: oblId,
          area_id: areaId,
          district_id: districtId,
          street_id: street.id,
          size: 200
        },
        headers: { 'x-online-mahalla-token': token.trim() }
      });
      if (res.data?.success && res.data?.data?.results) {
        setHomes(res.data.data.results);
      } else {
        setHomes([]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xonadonlar ro‘yxatini yuklashda xatolik');
    } finally {
      setLoadingHomes(false);
    }
  };

  const handleOpenStreet = (street: StreetItem) => {
    setSelectedStreet(street);
    setDrawerOpen(true);
    setHomeSearch('');
    fetchHomes(street);
  };

  // 2.1. Xonadon oila a'zolari oynasini ochish
  const handleOpenFamilyDialog = async (home: HomeItem) => {
    setSelectedHomeForFamily(home);
    setFamilyDialogOpen(true);
    setFamilyMembers([]);
    setLoadingFamily(true);
    try {
      // Xonadon survey_uuid ni olish uchun form GET qilamiz
      const formRes = await fetch(
        `https://api.online-mahalla.uz/web/v1/forms/survey_homes/${home.id}?obl_id=${oblId}&area_id=${areaId}&district_id=${districtId}&street_id=${selectedStreet?.id}`,
        {
          headers: {
            authorization: `Bearer ${token.trim()}`,
            'ngrok-skip-browser-warning': '1',
            accept: 'application/json, text/plain, */*',
            'accept-language': 'la'
          }
        }
      );
      const formData = await formRes.json();
      const uuid = formData?.formData?.survey_uuid;
      setSurveyUuid(uuid || '');

      if (uuid) {
        // Backend orqali yoki to'g'ridan-to'g'ri oila a'zolarini olish
        const memRes = await api.get('/product-admin/online-mahalla/family-members', {
          params: { survey_uuid: uuid },
          headers: { 'x-online-mahalla-token': token.trim() }
        });
        if (memRes.data?.success && memRes.data?.data) {
          setFamilyMembers(memRes.data.data);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Oila a‘zolari ro‘yxatini yuklashda xatolik');
    } finally {
      setLoadingFamily(false);
    }
  };

  // Yangi oila a'zosini qo'shish
  const handleAddMemberSubmit = async () => {
    if (!newMemberFullName.trim() || !newMemberPinfl.trim()) {
      toast.warning('F.I.Sh va JSHSHIR kiritilishi shart!');
      return;
    }
    if (!surveyUuid || !selectedHomeForFamily) {
      toast.error('Xonadon ma‘lumotlari topilmadi');
      return;
    }

    try {
      setSubmittingMember(true);
      const payload = {
        owner_pinfl: selectedHomeForFamily.pinfl,
        obl_id: Number(oblId),
        area_id: Number(areaId),
        district_id: Number(districtId),
        street_id: selectedStreet?.id,
        survey_uuid: surveyUuid,
        document_type: 1,
        doc_serial: newMemberDocSerial.trim().toUpperCase() || 'AA',
        doc_number: newMemberDocNumber.trim(),
        birth_date: newMemberBirthDate.trim(),
        full_name: newMemberFullName.trim(),
        pinfl: newMemberPinfl.trim(),
        address: '',
        phone: newMemberPhone.trim(),
        relationship: newMemberRelationship,
        study_level_id: 4
      };

      const res = await api.post('/product-admin/online-mahalla/family-members', payload, {
        headers: { 'x-online-mahalla-token': token.trim() }
      });

      if (res.data?.success) {
        toast.success('Oila a‘zosi muvaffaqiyatli qo‘shildi!');
        setAddMemberDialogOpen(false);
        // Formani tozalash
        setNewMemberFullName('');
        setNewMemberPinfl('');
        setNewMemberDocSerial('AA');
        setNewMemberDocNumber('');
        setNewMemberBirthDate('');
        setNewMemberPhone('');
        // Qayta yuklash
        if (selectedHomeForFamily) {
          handleOpenFamilyDialog(selectedHomeForFamily);
        }
      } else {
        toast.error(res.data?.message || 'Qo‘shishda xatolik yuz berdi');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Oila a‘zosini qo‘shishda xatolik');
    } finally {
      setSubmittingMember(false);
    }
  };

  // 3. Jobni ishga tushirish (Sinxronizatsiya)
  const handleRunSyncJob = async () => {
    if (!selectedStreet) return;
    try {
      setStartingJob(true);
      setConfirmDialogOpen(false);
      const res = await api.post(
        '/product-admin/online-mahalla/sync-street',
        {
          obl_id: Number(oblId),
          area_id: Number(areaId),
          district_id: Number(districtId),
          street_id: selectedStreet.id,
          street_name: selectedStreet.name,
          company_id: 1144,
          token: token.trim(),
          sync_mode: syncMode
        },
        {
          headers: { 'x-online-mahalla-token': token.trim() }
        }
      );

      if (res.data?.success && res.data?.jobId) {
        toast.success(`Job ishga tushirildi! ID: ${res.data.jobId}`);
        // Dastlabki job holati
        setCurrentJob({
          id: res.data.jobId,
          streetId: selectedStreet.id,
          streetName: selectedStreet.name,
          status: 'RUNNING',
          total: homes.length,
          processed: 0,
          success: 0,
          skipped: 0,
          noCadastre: 0,
          failed: 0,
          errors: [],
          startTime: new Date().toISOString()
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Jobni ishga tushirishda xatolik');
    } finally {
      setStartingJob(false);
    }
  };

  // 4. Job holatini tekshirib turish (Polling)
  useEffect(() => {
    if (!currentJob || currentJob.status === 'COMPLETED' || currentJob.status === 'FAILED') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/product-admin/online-mahalla/jobs/${currentJob.id}`);
        if (res.data?.success && res.data?.data) {
          const updated = res.data.data;
          setCurrentJob(updated);

          if (updated.status === 'COMPLETED') {
            toast.success(`Job yakunlandi! ${updated.success} ta xonadon yangilandi.`);
            if (selectedStreet) {
              fetchHomes(selectedStreet);
            }
          } else if (updated.status === 'FAILED') {
            toast.error('Job xatolik bilan yakunlandi.');
          }
        }
      } catch (err) {
        console.error('Job status check error:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [currentJob, selectedStreet]);

  // Filtrlangan xonadonlar
  const filteredHomes = useMemo(() => {
    if (!homeSearch.trim()) return homes;
    const q = homeSearch.toLowerCase();
    return homes.filter(
      (h) =>
        (h.full_name && h.full_name.toLowerCase().includes(q)) ||
        (h.cadaster_number && h.cadaster_number.toLowerCase().includes(q)) ||
        (h.home_num && String(h.home_num).includes(q)) ||
        (h.pinfl && String(h.pinfl).includes(q))
    );
  }, [homes, homeSearch]);

  // Statistik hisoblash (Jami)
  const totalStats = useMemo(() => {
    return streets.reduce(
      (acc, s) => {
        acc.homes_stat += Number(s.homes_stat_count || 0);
        acc.homes_surveyed += Number(s.homes_surveyed_count || 0);
        acc.multistory += Number(s.multistory_count || 0);
        acc.yard += Number(s.yard_count || 0);
        acc.dormitory += Number(s.dormitory_count || 0);
        acc.population_stat += Number(s.population_stat_count || 0);
        acc.population_surveyed += Number(s.population_surveyed_count || 0);
        acc.youth += Number(s.youth_count || 0);
        acc.women += Number(s.women_count || 0);
        acc.pensioner += Number(s.pensioner_count || 0);
        acc.defects += Number(s.defects_count || 0);
        return acc;
      },
      {
        homes_stat: 0,
        homes_surveyed: 0,
        multistory: 0,
        yard: 0,
        dormitory: 0,
        population_stat: 0,
        population_surveyed: 0,
        youth: 0,
        women: 0,
        pensioner: 0,
        defects: 0
      }
    );
  }, [streets]);

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
      {/* ── Bosh Sarlavha va Kartochka ── */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <StreetIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Online-Mahalla Integratsiyasi
            </Typography>
            <Chip
              label="Product Admin"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.secondary.main, 0.12),
                color: theme.palette.secondary.main,
                fontWeight: 600
              }}
            />
          </Stack>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
            Mahalla qishloqlari xatlov statistikasi va kadastr egalarini TozaMakon bilan avtomatik moslashtirish
          </Typography>
        </Box>

        {/* ── Token boshqaruvi: Input, Tekshirish, Saqlash va Yangilash ── */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <TextField
            size="small"
            type={showToken ? 'text' : 'password'}
            placeholder="Online-Mahalla Bearer token..."
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setTokenStatus('idle');
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowToken(!showToken)}>
                      {showToken ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, height: 38, width: { xs: 200, sm: 260, md: 320 } }
              }
            }}
          />

          <Button
            variant="outlined"
            color={tokenStatus === 'valid' ? 'success' : tokenStatus === 'invalid' ? 'error' : 'primary'}
            startIcon={
              checkingToken ? (
                <CircularProgress size={16} color="inherit" />
              ) : tokenStatus === 'valid' ? (
                <SuccessIcon />
              ) : tokenStatus === 'invalid' ? (
                <ErrorIcon />
              ) : (
                <VerifiedIcon />
              )
            }
            onClick={handleCheckToken}
            disabled={checkingToken}
            sx={{ borderRadius: 2, height: 38, textTransform: 'none', fontWeight: 600 }}
          >
            {tokenStatus === 'valid' ? 'To‘g‘ri' : tokenStatus === 'invalid' ? 'Xato' : 'Tekshirish'}
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            sx={{ borderRadius: 2, height: 38, textTransform: 'none', fontWeight: 600 }}
          >
            Saqlash
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchStreets}
            disabled={loadingStreets}
            sx={{ borderRadius: 2, height: 38, textTransform: 'none', fontWeight: 600 }}
          >
            Yangilash
          </Button>
        </Stack>
      </Stack>

      {(!oblId.trim() || !areaId.trim() || !districtId.trim() || !token.trim()) && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Online-Mahalla ma&apos;lumotlarini yuklash va sinxronizatsiya qilish uchun yuqoridagi <strong>Token</strong>, hamda <strong>Viloyat ID</strong>, <strong>Tuman ID</strong> va <strong>Mahalla ID</strong> raqamlarini kiriting va <strong>Saqlash</strong> tugmasini bosing.
        </Alert>
      )}

      {/* ── Filterlar Paneli ── */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: '1px solid',
          borderColor: theme.palette.divider,
          bgcolor: theme.palette.background.paper,
          borderRadius: 2.5
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Viloyat ID (obl_id)"
                value={oblId}
                onChange={(e) => setOblId(e.target.value)}
                slotProps={{ input: { sx: { borderRadius: 2 } } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Tuman ID (area_id)"
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                slotProps={{ input: { sx: { borderRadius: 2 } } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Mahalla ID (district_id)"
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                slotProps={{ input: { sx: { borderRadius: 2 } } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button fullWidth variant="contained" onClick={fetchStreets} disabled={loadingStreets} sx={{ borderRadius: 2, height: 40 }}>
                Qishloqlarni Yuklash
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── Qishloqlar Statistik Jadvali (Foydalanuvchi taqdim etgan ko'rinish) ── */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: theme.palette.divider,
          bgcolor: theme.palette.background.paper,
          borderRadius: 2.5,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: theme.palette.divider }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Mahalla qishloqlari / ko‘chalari (Jami: {streets.length} ta)
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Qishloq nomiga yoki tugmaga bosib, xonadonlar ro‘yxatini ko‘rishingiz va sinxronizatsiya qilishingiz mumkin
            </Typography>
          </Stack>
        </Box>

        {loadingStreets && <LinearProgress />}

        <TableContainer sx={{ maxHeight: 650 }}>
          <Table stickyHeader size="small">
            <TableHead>
              {/* Yuqori sarlavha qatori */}
              <TableRow>
                <TableCell
                  rowSpan={2}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    borderRight: '1px solid',
                    borderColor: theme.palette.divider,
                    width: 50
                  }}
                >
                  T/r
                </TableCell>
                <TableCell
                  rowSpan={2}
                  sx={{
                    fontWeight: 700,
                    borderRight: '1px solid',
                    borderColor: theme.palette.divider,
                    minWidth: 160
                  }}
                >
                  Ko‘cha nomi
                </TableCell>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    borderRight: '1px solid',
                    borderColor: theme.palette.divider,
                    bgcolor: alpha(theme.palette.primary.main, 0.04)
                  }}
                >
                  Xonadonlar soni
                </TableCell>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    borderRight: '1px solid',
                    borderColor: theme.palette.divider,
                    bgcolor: alpha(theme.palette.info.main, 0.04)
                  }}
                >
                  Aholi soni
                </TableCell>
                <TableCell
                  rowSpan={2}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    borderRight: '1px solid',
                    borderColor: theme.palette.divider,
                    minWidth: 120
                  }}
                >
                  Kamchiliklar soni
                </TableCell>
                <TableCell rowSpan={2} align="center" sx={{ fontWeight: 700, minWidth: 140 }}>
                  Amallar
                </TableCell>
              </TableRow>

              {/* Ikkinchi darajali sarlavha qatori */}
              <TableRow>
                {/* Xonadonlar soni bo'linishi */}
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    bgcolor: alpha(theme.palette.primary.main, 0.04)
                  }}
                >
                  Statistik ma'lumotlar bo'yicha
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    bgcolor: alpha(theme.palette.primary.main, 0.04)
                  }}
                >
                  Ko‘p qavatli xonadon
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    bgcolor: alpha(theme.palette.primary.main, 0.04)
                  }}
                >
                  Hovli
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    borderRight: '1px solid',
                    borderColor: theme.palette.divider,
                    bgcolor: alpha(theme.palette.primary.main, 0.04)
                  }}
                >
                  Yotoqxona
                </TableCell>

                {/* Aholi soni bo'linishi */}
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    bgcolor: alpha(theme.palette.info.main, 0.04)
                  }}
                >
                  Statistik ma'lumotlar bo'yicha
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    bgcolor: alpha(theme.palette.info.main, 0.04)
                  }}
                >
                  HY tomonidan o'rganilgan
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    bgcolor: alpha(theme.palette.info.main, 0.04)
                  }}
                >
                  Yoshlar
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    bgcolor: alpha(theme.palette.info.main, 0.04)
                  }}
                >
                  Ayollar
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    borderRight: '1px solid',
                    borderColor: theme.palette.divider,
                    bgcolor: alpha(theme.palette.info.main, 0.04)
                  }}
                >
                  Pensiya yoshidagilar
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {streets.map((s, idx) => (
                <TableRow
                  key={s.id || idx}
                  hover
                  sx={{
                    cursor: 'pointer',
                    '&:last-child td, &:last-child th': { borderBottom: 0 }
                  }}
                  onClick={() => handleOpenStreet(s)}
                >
                  <TableCell align="center" sx={{ borderRight: '1px solid', borderColor: theme.palette.divider }}>
                    {idx + 1}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      borderRight: '1px solid',
                      borderColor: theme.palette.divider,
                      textDecoration: 'underline'
                    }}
                  >
                    {s.name}
                  </TableCell>

                  {/* Xonadonlar */}
                  <TableCell align="center">{s.homes_stat_count ?? '—'}</TableCell>
                  <TableCell align="center">{s.multistory_count || '—'}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                    {s.yard_count || '—'}
                  </TableCell>
                  <TableCell align="center" sx={{ borderRight: '1px solid', borderColor: theme.palette.divider }}>
                    {s.dormitory_count || '—'}
                  </TableCell>

                  {/* Aholi */}
                  <TableCell align="center">{s.population_stat_count ?? '—'}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    {s.population_surveyed_count || '—'}
                  </TableCell>
                  <TableCell align="center">{s.youth_count || '—'}</TableCell>
                  <TableCell align="center">{s.women_count || '—'}</TableCell>
                  <TableCell align="center" sx={{ borderRight: '1px solid', borderColor: theme.palette.divider }}>
                    {s.pensioner_count || '—'}
                  </TableCell>

                  {/* Kamchiliklar */}
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      color: s.defects_count > 0 ? theme.palette.error.main : theme.palette.text.secondary,
                      borderRight: '1px solid',
                      borderColor: theme.palette.divider
                    }}
                  >
                    {s.defects_count}
                  </TableCell>

                  {/* Harakatlar */}
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<HomeIcon />}
                      onClick={() => handleOpenStreet(s)}
                      sx={{ borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}
                    >
                      Xonadonlar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* Jami qatori */}
              {streets.length > 0 && (
                <TableRow
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    fontWeight: 700
                  }}
                >
                  <TableCell align="center" sx={{ fontWeight: 700, borderRight: '1px solid', borderColor: theme.palette.divider }}>
                    ∑
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, borderRight: '1px solid', borderColor: theme.palette.divider }}>Жами</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    {totalStats.homes_stat}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    {totalStats.multistory || '0'}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    {totalStats.yard}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, borderRight: '1px solid', borderColor: theme.palette.divider }}>
                    {totalStats.dormitory || '0'}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    {totalStats.population_stat}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    {totalStats.population_surveyed}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    {totalStats.youth}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    {totalStats.women}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, borderRight: '1px solid', borderColor: theme.palette.divider }}>
                    {totalStats.pensioner}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: theme.palette.error.main, borderRight: '1px solid', borderColor: theme.palette.divider }}
                  >
                    {totalStats.defects}
                  </TableCell>
                  <TableCell align="center">—</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ── Qishloq Xonadonlari Modali / Draweri (Detail & Job Run) ── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 850, md: 1050 },
              p: 0,
              bgcolor: theme.palette.background.default
            }
          }
        }}
      >
        {selectedStreet && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer Header */}
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid',
                borderColor: theme.palette.divider,
                bgcolor: theme.palette.background.paper
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <HomeIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {selectedStreet.name} qishlog‘i
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Street ID: {selectedStreet.id} | Jami xonadonlar: {homes.length} ta
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  {/* Jobni run qiladigan asosiy tugma */}
                  <Button
                    variant="contained"
                    color="secondary"
                    size="medium"
                    startIcon={startingJob ? <CircularProgress size={18} color="inherit" /> : <JobIcon />}
                    onClick={() => setConfirmDialogOpen(true)}
                    disabled={startingJob || currentJob?.status === 'RUNNING'}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    Jobni Run Qilish (Sinxronizatsiya)
                  </Button>

                  <IconButton onClick={() => setDrawerOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </Stack>

              {/* Real-time Job Status Paneli */}
              {currentJob && currentJob.streetId === selectedStreet.id && (
                <Card
                  elevation={0}
                  sx={{
                    mt: 1.5,
                    p: 2,
                    border: '1px solid',
                    borderColor:
                      currentJob.status === 'RUNNING'
                        ? theme.palette.primary.main
                        : currentJob.status === 'COMPLETED'
                          ? theme.palette.success.main
                          : theme.palette.divider,
                    bgcolor: alpha(currentJob.status === 'RUNNING' ? theme.palette.primary.main : theme.palette.success.main, 0.05),
                    borderRadius: 2
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <SyncIcon
                        sx={{
                          animation: currentJob.status === 'RUNNING' ? 'spin 1.5s linear infinite' : 'none',
                          '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } }
                        }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Sinxronizatsiya Holati: {currentJob.status}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {currentJob.processed} / {currentJob.total} ta (
                      {currentJob.total > 0 ? Math.round((currentJob.processed / currentJob.total) * 100) : 0}
                      %)
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={currentJob.total > 0 ? (currentJob.processed / currentJob.total) * 100 : 0}
                    sx={{ height: 8, borderRadius: 4, mb: 1.5 }}
                  />

                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Chip size="small" color="secondary" variant="outlined" label="⚡ 5x Parallel" sx={{ fontWeight: 700 }} />
                    <Chip size="small" color="success" icon={<SuccessIcon />} label={`Yangilandi: ${currentJob.success}`} />
                    <Chip size="small" color="info" label={`O'tkazildi (mos): ${currentJob.skipped}`} />
                    <Chip size="small" color="warning" label={`Kadastr yo'q: ${currentJob.noCadastre}`} />
                    <Chip size="small" color="error" icon={<ErrorIcon />} label={`Xatolar: ${currentJob.failed}`} />
                    {currentJob.currentCadaster && (
                      <Chip size="small" variant="outlined" label={`Hozirgi: ${currentJob.currentCadaster}`} />
                    )}
                  </Stack>
                </Card>
              )}

              {/* Qidiruv paneli */}
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Xonadon egasi F.I.Sh, Kadastr raqami, yoki uy raqami bo‘yicha qidirish..."
                  value={homeSearch}
                  onChange={(e) => setHomeSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2 }
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Xonadonlar jadvali */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {loadingHomes ? (
                <Stack spacing={2} sx={{ alignItems: 'center', py: 6 }}>
                  <CircularProgress size={36} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Qishloq xonadonlari yuklanmoqda...
                  </Typography>
                </Stack>
              ) : (
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    borderRadius: 2
                  }}
                >
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: theme.palette.background.paper }}>
                          <TableCell align="center" sx={{ fontWeight: 700, width: 45 }}>
                            №
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Uy raqami</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Kadastr raqami</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Egasi (F.I.Sh)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>JSHSHIR</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Telefon</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Mulk turi</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Sana</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Havola
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredHomes.map((h, i) => (
                          <TableRow key={h.id || i} hover>
                            <TableCell align="center">{i + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{h.home_num || '—'}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{h.cadaster_number || '—'}</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>{h.full_name || '—'}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{h.pinfl || '—'}</TableCell>
                            <TableCell>{h.mobile_phone || '—'}</TableCell>
                            <TableCell>
                              <Chip
                                label={h.ownership_type || 'шахсий'}
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 22,
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  color: theme.palette.success.main
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h.survey_date || '—'}</TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center' }}>
                                <Tooltip title="Oila a‘zolari ro‘yxati va qo‘shish">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenFamilyDialog(h)}
                                  >
                                    <FamilyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {h.next_link && (
                                  <Tooltip title="Online-Mahalla formasini ochish">
                                    <IconButton
                                      size="small"
                                      component="a"
                                      href={`https://online-mahalla.uz/${h.next_link}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <ExternalLinkIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}

                        {filteredHomes.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Xonadonlar topilmadi
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              )}
            </Box>
          </Box>
        )}
      </Drawer>

      {/* ── Jobni boshlash tasdiqlash dialogi ── */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Sinxronizatsiya Jobini ishga tushirish</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Siz <strong>"{selectedStreet?.name}"</strong> qishlog‘idagi jami <strong>{homes.length} ta</strong> xonadonni TozaMakon
            ma’lumotlari asosida Online-Mahalla tizimida yangilamoqchisiz.
          </Typography>

          {/* Sinxronizatsiya rejimi tanlovi */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              border: '1px solid',
              borderColor: theme.palette.divider,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderRadius: 2
            }}
          >
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
                Sinxronizatsiya Rejimini Tanlang:
              </FormLabel>
              <RadioGroup
                value={syncMode}
                onChange={(e) => setSyncMode(e.target.value as 'all' | 'owner_only' | 'family_only')}
              >
                <FormControlLabel
                  value="all"
                  control={<Radio size="small" />}
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Barchasini (Xonadon egasi + Oila a‘zolari)
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Egasi kiritiladi (allaqachon to‘g‘ri bo‘lsa tashlab ketiladi), so‘ngra oila a‘zolari MVD bo‘yicha qo‘shiladi.
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  value="family_only"
                  control={<Radio size="small" />}
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Faqat oila a‘zolarini biriktirish
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Xonadon egasiga tegmaydi, faqat MVD bo‘yicha kiritilmagan oila a‘zolarini biriktiradi (borlari tashlab ketiladi).
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  value="owner_only"
                  control={<Radio size="small" />}
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Faqat xonadon egasini yangilash
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Faqat xonadon egasi ma‘lumotlari va parametrlarini (Hovli, Shaxsiy, Propiska) yangilaydi.
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Paper>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Har bir xonadonga quyidagi parametrlar avtomatik o‘rnatiladi:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>
                <strong>Haqiqiy egasi:</strong> TozaMakon kadastr egasi (F.I.Sh, JSHSHIR, Pasport)
              </li>
              <li>
                <strong>Xonadon turi:</strong> <code>home_type: 2</code> (Ҳовли)
              </li>
              <li>
                <strong>Mulk turi:</strong> <code>property_type: 1</code> (Жисмоний шахс)
              </li>
              <li>
                <strong>Mulkiy mansublik:</strong> <code>ownership: 1</code> (Шахсий)
              </li>
              <li>
                <strong>Ro‘yxatga olinganlik:</strong> MVD so‘rovi bo‘yicha (1: доимий / 2: вақтинча)
              </li>
              <li>
                <strong>Ma’lumoti:</strong> <code>study_level_id: 4</code> (Ўрта)
              </li>
              <li>
                <strong>Pasport manzili:</strong> IIV MVD so‘rovi qaytargan rasmiy propiska manzili
              </li>
              <li>
                <strong>Oila a‘zolari:</strong> Har bir xonadonga faqat 1 ta turmush o‘rtog‘i, qolganlar yoshiga ko‘ra (ota, ona, o‘g‘il, qiz, nabira, aka-uka, opa-singil)
              </li>
            </ul>
          </Alert>

          <Box sx={{ mt: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip size="small" color="secondary" label="⚡ Tezlik: Parallel 5 tadan xonadon" sx={{ fontWeight: 700 }} />
          </Box>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Jarayon fon rejimida amalga oshiriladi va real-time holatini ko‘rib turishingiz mumkin.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Bekor qilish
          </Button>
          <Button variant="contained" color="secondary" startIcon={<RunJobIcon />} onClick={handleRunSyncJob} disabled={startingJob}>
            Ha, Jobni Boshlash
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Oila a'zolari modali ── */}
      <Dialog
        open={familyDialogOpen}
        onClose={() => setFamilyDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <FamilyIcon color="primary" />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Xonadon oila a‘zolari ({selectedHomeForFamily?.full_name || '—'})
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Uy №{selectedHomeForFamily?.home_num} | Kadastr: {selectedHomeForFamily?.cadaster_number}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => setAddMemberDialogOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              A‘zo qo‘shish
            </Button>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2 }}>
          {loadingFamily ? (
            <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Oila a‘zolari yuklanmoqda...
              </Typography>
            </Stack>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: theme.palette.divider }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.background.paper }}>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 45 }}>№</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>F.I.Sh</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Qarindoshligi</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tug‘ilgan sana</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>JSHSHIR</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Telefon</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {familyMembers.map((m, idx) => (
                    <TableRow key={m.id || idx} hover>
                      <TableCell align="center">{idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{m.full_name || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={m.relationship || '—'}
                          size="small"
                          color={
                            String(m.relationship).toLowerCase().includes('эгаси')
                              ? 'primary'
                              : String(m.relationship).toLowerCase().includes('ўртоғи')
                                ? 'secondary'
                                : 'default'
                          }
                          sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{m.birth_date || '—'}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{m.pinfl || '—'}</TableCell>
                      <TableCell>{m.phone || '—'}</TableCell>
                    </TableRow>
                  ))}

                  {familyMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Ushbu xonadonda kiritilgan oila a‘zolari mavjud emas
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setFamilyDialogOpen(false)} color="inherit">
            Yopish
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Yangi oila a'zosi qo'shish modali ── */}
      <Dialog
        open={addMemberDialogOpen}
        onClose={() => setAddMemberDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Yangi oila a‘zosini biriktirish</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="F.I.Sh"
              fullWidth
              size="small"
              value={newMemberFullName}
              onChange={(e) => setNewMemberFullName(e.target.value)}
              placeholder="Masalan: KARIMOV ANVAR..."
              required
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="JSHSHIR (PINFL)"
                  fullWidth
                  size="small"
                  value={newMemberPinfl}
                  onChange={(e) => setNewMemberPinfl(e.target.value)}
                  placeholder="14 xonali raqam"
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Tug‘ilgan sana"
                  fullWidth
                  size="small"
                  type="date"
                  value={newMemberBirthDate}
                  onChange={(e) => setNewMemberBirthDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <TextField
                  label="Seriya"
                  fullWidth
                  size="small"
                  value={newMemberDocSerial}
                  onChange={(e) => setNewMemberDocSerial(e.target.value.toUpperCase())}
                  placeholder="AA"
                />
              </Grid>
              <Grid size={{ xs: 8 }}>
                <TextField
                  label="Hujjat raqami"
                  fullWidth
                  size="small"
                  value={newMemberDocNumber}
                  onChange={(e) => setNewMemberDocNumber(e.target.value)}
                  placeholder="1234567"
                />
              </Grid>
            </Grid>

            <FormControl fullWidth size="small">
              <InputLabel id="relationship-select-label">Qarindoshligi</InputLabel>
              <Select
                labelId="relationship-select-label"
                value={newMemberRelationship}
                label="Qarindoshligi"
                onChange={(e) => setNewMemberRelationship(Number(e.target.value))}
              >
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <MenuItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Telefon raqami"
              fullWidth
              size="small"
              value={newMemberPhone}
              onChange={(e) => setNewMemberPhone(e.target.value)}
              placeholder="998901234567"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddMemberDialogOpen(false)} color="inherit" disabled={submittingMember}>
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddMemberSubmit}
            disabled={submittingMember}
            startIcon={submittingMember ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
          >
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
