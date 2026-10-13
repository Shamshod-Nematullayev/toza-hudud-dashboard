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
  Switch,
  FormControlLabel,
  Collapse
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
  OpenInNew as ExternalLinkIcon,
  Bolt as JobIcon,
  Layers as SyncIcon,
  VpnKeyOutlined as KeyIcon,
  VisibilityOutlined as VisibilityIcon,
  VisibilityOffOutlined as VisibilityOffIcon,
  Group as FamilyIcon,
  PersonAdd as PersonAddIcon,
  StopCircleOutlined as StopIcon,
  DeleteSweepOutlined as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
  AccountCircle as UserIcon,
  LocationOn as LocationIcon,
  WarningAmber as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  MoveToInbox as MigrateIcon
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

interface JobErrorInfo {
  id: number;
  cadaster: string;
  streetName?: string;
  houseNum?: string;
  ownerName?: string;
  error: string;
  timestamp: string;
}

interface StreetSyncProgress {
  streetId: number | string;
  streetName: string;
  total: number;
  processed: number;
  success: number;
  skipped: number;
  noCadastre: number;
  failed: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
}

interface SyncJobStatus {
  id: string;
  jobType: 'mahalla' | 'street' | 'migrate_old_survey';
  mahallaName?: string;
  obl_id?: number | string;
  area_id?: number | string;
  district_id?: number | string;
  streetId?: number | string;
  streetName?: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  currentStreetIndex?: number;
  currentStreetName?: string;
  totalStreets?: number;
  completedStreets?: number;
  streetsProgress?: StreetSyncProgress[];
  total: number;
  processed: number;
  success: number;
  skipped: number;
  noCadastre: number;
  failed: number;
  familyMembersAdded?: number;
  currentCadaster?: string;
  errors: JobErrorInfo[];
  startTime: string;
  endTime?: string;
  cancelled?: boolean;
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

interface UserProfileInfo {
  id?: number | string;
  full_name?: string;
  username?: string;
  obl_id?: number | string;
  obl_name?: string;
  area_id?: number | string;
  area_name?: string;
  district_id?: number | string;
  mahalla_id?: number | string;
  mahalla_name?: string;
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

  // 1. Token va profil holati
  const [token, setToken] = useState<string>(() => localStorage.getItem('online_mahalla_token') || '');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [checkingToken, setCheckingToken] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfileInfo | null>(() => {
    try {
      const saved = localStorage.getItem('online_mahalla_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ID parametrlar
  const [oblId, setOblId] = useState<string>(() => localStorage.getItem('online_mahalla_obl_id') || '');
  const [areaId, setAreaId] = useState<string>(() => localStorage.getItem('online_mahalla_area_id') || '');
  const [districtId, setDistrictId] = useState<string>(() => localStorage.getItem('online_mahalla_district_id') || '');
  const [showManualIds, setShowManualIds] = useState<boolean>(false);

  // 2. Ko'chalar ro'yxati va tanlangan ko'cha
  const [streets, setStreets] = useState<StreetItem[]>([]);
  const [loadingStreets, setLoadingStreets] = useState<boolean>(false);
  const [selectedStreetId, setSelectedStreetId] = useState<number | string>('');
  const [showStreetsTable, setShowStreetsTable] = useState<boolean>(false);

  // Sozlamalar
  const [skipIfOwnerExists, setSkipIfOwnerExists] = useState<boolean>(true);
  const [startingJob, setStartingJob] = useState<boolean>(false);

  // 3. Multi-Job monitoring
  const [allJobs, setAllJobs] = useState<SyncJobStatus[]>([]);

  // Modallar
  const [mahallaConfirmDialogOpen, setMahallaConfirmDialogOpen] = useState<boolean>(false);
  const [migrateConfirmDialogOpen, setMigrateConfirmDialogOpen] = useState<boolean>(false);
  const [streetConfirmDialogOpen, setStreetConfirmDialogOpen] = useState<boolean>(false);
  const [errorsDialogOpen, setErrorsDialogOpen] = useState<boolean>(false);
  const [selectedJobForErrors, setSelectedJobForErrors] = useState<SyncJobStatus | null>(null);
  const [errorSearchQuery, setErrorSearchQuery] = useState<string>('');

  // Xonadonlar draweri
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedStreet, setSelectedStreet] = useState<StreetItem | null>(null);
  const [homes, setHomes] = useState<HomeItem[]>([]);
  const [loadingHomes, setLoadingHomes] = useState<boolean>(false);
  const [homeSearch, setHomeSearch] = useState<string>('');

  // Oila a'zolari
  const [familyDialogOpen, setFamilyDialogOpen] = useState<boolean>(false);
  const [selectedHomeForFamily, setSelectedHomeForFamily] = useState<HomeItem | null>(null);
  const [surveyUuid, setSurveyUuid] = useState<string>('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberItem[]>([]);
  const [loadingFamily, setLoadingFamily] = useState<boolean>(false);

  // Yangi a'zo qo'shish
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState<boolean>(false);
  const [newMemberFullName, setNewMemberFullName] = useState<string>('');
  const [newMemberPinfl, setNewMemberPinfl] = useState<string>('');
  const [newMemberDocSerial, setNewMemberDocSerial] = useState<string>('AA');
  const [newMemberDocNumber, setNewMemberDocNumber] = useState<string>('');
  const [newMemberBirthDate, setNewMemberBirthDate] = useState<string>('');
  const [newMemberRelationship, setNewMemberRelationship] = useState<number>(7);
  const [newMemberPhone, setNewMemberPhone] = useState<string>('');
  const [submittingMember, setSubmittingMember] = useState<boolean>(false);

  // ── QADAM 1: Token orqali profilni avtomatik aniqlash ──
  const handleConnectProfile = async () => {
    const rawToken = token.trim();
    if (!rawToken) {
      toast.warning('Iltimos, Online-Mahalla tokenini kiriting!');
      return;
    }

    setCheckingToken(true);
    try {
      const res = await api.post('/product-admin/online-mahalla/check-token', {
        token: rawToken
      });

      if (res.data?.success) {
        const prof = res.data?.profile;
        if (prof) {
          setUserProfile(prof);
          localStorage.setItem('online_mahalla_profile', JSON.stringify(prof));
          if (prof.obl_id) {
            setOblId(String(prof.obl_id));
            localStorage.setItem('online_mahalla_obl_id', String(prof.obl_id));
          }
          if (prof.area_id) {
            setAreaId(String(prof.area_id));
            localStorage.setItem('online_mahalla_area_id', String(prof.area_id));
          }
          if (prof.district_id || prof.mahalla_id) {
            const mId = String(prof.district_id || prof.mahalla_id);
            setDistrictId(mId);
            localStorage.setItem('online_mahalla_district_id', mId);
          }
        }
        localStorage.setItem('online_mahalla_token', rawToken);
        toast.success(`Ulanish muvaffaqiyatli! Mahalla: ${prof?.mahalla_name || 'Aniqlangan'}`);

        // Ko'chalarni avtomatik tortib olish
        loadStreets(prof, rawToken);
      } else {
        throw new Error(res.data?.message || 'Token yaroqsiz');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Token yaroqsiz yoki muddati tugagan!');
    } finally {
      setCheckingToken(false);
    }
  };

  // Ko'chalarni yuklash
  const loadStreets = async (customProf?: UserProfileInfo, customToken?: string) => {
    const activeToken = customToken || token.trim();
    const activeObl = customProf?.obl_id ? String(customProf.obl_id) : oblId.trim();
    const activeArea = customProf?.area_id ? String(customProf.area_id) : areaId.trim();
    const activeDist = customProf?.district_id ? String(customProf.district_id) : (customProf?.mahalla_id ? String(customProf.mahalla_id) : districtId.trim());

    if (!activeObl || !activeArea || !activeDist || !activeToken) {
      return;
    }

    try {
      setLoadingStreets(true);
      const res = await api.get('/product-admin/online-mahalla/streets', {
        params: { obl_id: activeObl, area_id: activeArea, district_id: activeDist },
        headers: { 'x-online-mahalla-token': activeToken }
      });
      if (res.data?.success && res.data?.data?.results) {
        setStreets(res.data.data.results);
        if (res.data.data.results.length > 0 && !selectedStreetId) {
          setSelectedStreetId(res.data.data.results[0].id);
        }
      } else {
        setStreets([]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ko‘chalar ro‘yxatini yuklashda xatolik');
    } finally {
      setLoadingStreets(false);
    }
  };

  useEffect(() => {
    if (oblId && areaId && districtId && token) {
      loadStreets();
    }
  }, [oblId, areaId, districtId]);

  // ── QADAM 2: Multi-Job monitoringni doimiy yangilash ──
  const fetchAllJobs = async () => {
    try {
      const res = await api.get('/product-admin/online-mahalla/jobs');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setAllJobs(res.data.data);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchAllJobs();
    const timer = setInterval(fetchAllJobs, 2500);
    return () => clearInterval(timer);
  }, []);

  // Butun mahallani boshlash
  const handleStartMahallaSync = async () => {
    if (!oblId || !areaId || !districtId) {
      toast.warning('Avval mahalla profilini aniqlang!');
      return;
    }
    try {
      setStartingJob(true);
      setMahallaConfirmDialogOpen(false);
      const res = await api.post(
        '/product-admin/online-mahalla/sync-mahalla',
        {
          obl_id: Number(oblId),
          area_id: Number(areaId),
          district_id: Number(districtId),
          mahalla_name: userProfile?.mahalla_name || `Mahalla #${districtId}`,
          company_id: 1144,
          token: token.trim(),
          sync_mode: 'owner_only',
          skip_if_owner_exists: skipIfOwnerExists,
          concurrency: 5
        },
        {
          headers: { 'x-online-mahalla-token': token.trim() }
        }
      );

      if (res.data?.success && res.data?.jobId) {
        toast.success(`⚡ Mahalla sinxronizatsiyasi boshlandi! (Job ID: ${res.data.jobId})`);
        fetchAllJobs();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Jobni boshlashda xatolik');
    } finally {
      setStartingJob(false);
    }
  };

  // Eski hisobotdan (pa_survey -> survey_homes) ko'chirish jobini boshlash
  const handleStartMigrateOldSurvey = async () => {
    if (!oblId || !areaId || !districtId) {
      toast.warning('Avval mahalla profilini aniqlang!');
      return;
    }
    try {
      setStartingJob(true);
      setMigrateConfirmDialogOpen(false);
      const res = await api.post(
        '/product-admin/online-mahalla/migrate-old-survey',
        {
          obl_id: Number(oblId),
          area_id: Number(areaId),
          district_id: Number(districtId),
          mahalla_name: userProfile?.mahalla_name || `Mahalla #${districtId}`,
          company_id: 1144,
          token: token.trim(),
        },
        {
          headers: { 'x-online-mahalla-token': token.trim() }
        }
      );

      if (res.data?.success && res.data?.jobId) {
        toast.success(`📦 Eski hisobotdan ko‘chirish boshlandi! (Job ID: ${res.data.jobId})`);
        fetchAllJobs();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Migratsiyani boshlashda xatolik');
    } finally {
      setStartingJob(false);
    }
  };

  // Bitta ko'chani boshlash
  const handleStartStreetSync = async () => {
    const curStreet = streets.find((s) => String(s.id) === String(selectedStreetId));
    if (!curStreet) {
      toast.warning('Ko‘cha tanlanmagan!');
      return;
    }
    try {
      setStartingJob(true);
      setStreetConfirmDialogOpen(false);
      const res = await api.post(
        '/product-admin/online-mahalla/sync-street',
        {
          obl_id: Number(oblId),
          area_id: Number(areaId),
          district_id: Number(districtId),
          street_id: curStreet.id,
          street_name: curStreet.name,
          company_id: 1144,
          token: token.trim(),
          sync_mode: 'owner_only',
          skip_if_owner_exists: skipIfOwnerExists,
          concurrency: 5
        },
        {
          headers: { 'x-online-mahalla-token': token.trim() }
        }
      );

      if (res.data?.success && res.data?.jobId) {
        toast.success(`Ko‘cha sinxronizatsiyasi boshlandi! (Job ID: ${res.data.jobId})`);
        fetchAllJobs();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Jobni boshlashda xatolik');
    } finally {
      setStartingJob(false);
    }
  };

  // Jobni to'xtatish
  const handleCancelJob = async (jobId: string) => {
    try {
      const res = await api.post(`/product-admin/online-mahalla/jobs/${jobId}/cancel`);
      if (res.data?.success) {
        toast.info('Job to‘xtatildi');
        fetchAllJobs();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  // Tugallanganlarni tozalash
  const handleClearFinishedJobs = async () => {
    try {
      const res = await api.delete('/product-admin/online-mahalla/jobs/clear');
      if (res.data?.success) {
        toast.success(res.data.message || 'Tarix tozalandi');
        fetchAllJobs();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  // Xonadonlar jadvalini ochish (Drawer)
  const handleOpenHomesDrawer = async (street: StreetItem) => {
    setSelectedStreet(street);
    setDrawerOpen(true);
    setHomeSearch('');
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
      toast.error(err.response?.data?.message || 'Xonadonlarni yuklashda xatolik');
    } finally {
      setLoadingHomes(false);
    }
  };

  // Xatolar dialogi
  const handleOpenErrors = (job: SyncJobStatus) => {
    setSelectedJobForErrors(job);
    setErrorSearchQuery('');
    setErrorsDialogOpen(true);
  };

  const filteredErrors = useMemo(() => {
    if (!selectedJobForErrors?.errors) return [];
    if (!errorSearchQuery.trim()) return selectedJobForErrors.errors;
    const q = errorSearchQuery.toLowerCase();
    return selectedJobForErrors.errors.filter(
      (e) =>
        e.cadaster?.toLowerCase().includes(q) ||
        e.streetName?.toLowerCase().includes(q) ||
        e.ownerName?.toLowerCase().includes(q) ||
        e.error?.toLowerCase().includes(q)
    );
  }, [selectedJobForErrors, errorSearchQuery]);

  const handleCopyErrors = () => {
    if (!selectedJobForErrors?.errors || selectedJobForErrors.errors.length === 0) return;
    const text = selectedJobForErrors.errors
      .map(
        (e, i) =>
          `${i + 1}. Ko‘cha: ${e.streetName || '—'} | Uy: ${e.houseNum || '—'} | Kadastr: ${e.cadaster} | Egasi: ${
            e.ownerName || '—'
          } | Sabab: ${e.error}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Xatoliklar nusxalandi!');
  };

  // Xonadonlarni qidirish
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

  const selectedStreetObj = useMemo(
    () => streets.find((s) => String(s.id) === String(selectedStreetId)),
    [streets, selectedStreetId]
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* ── Bosh Sahifa Sarlavhasi ── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <StreetIcon sx={{ color: theme.palette.primary.main, fontSize: 30 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            Online-Mahalla Integratsiya Markazi
          </Typography>
          <Chip
            label="Sodda 3-Bosqich"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 700
            }}
          />
        </Stack>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
          Xodim profilini bir marta ulang, butun mahallani yoki alohida ko‘chalarni ketma-ket parallel sinxronizatsiya qiling.
        </Typography>
      </Box>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── 1-BOSQICH: TOKEN & MAHALLANI ANIQLASH ── */}
      {/* ─────────────────────────────────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: '1px solid',
          borderColor: userProfile ? alpha(theme.palette.success.main, 0.3) : theme.palette.divider,
          borderRadius: 3,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: theme.palette.divider,
            bgcolor: alpha(userProfile ? theme.palette.success.main : theme.palette.primary.main, 0.04)
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: userProfile ? theme.palette.success.main : theme.palette.primary.main,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                1
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Online-Mahalla Xodimini Ulanishi
              </Typography>
            </Stack>

            {userProfile && (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />}
                label="Mahalla Aniqlangan"
                color="success"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Stack>
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          {/* Token kiritish va Ulanish qatori */}
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                size="small"
                type={showToken ? 'text' : 'password'}
                label="Online-Mahalla Bearer Tokeni"
                placeholder="Tokenni shu yerga kiriting..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
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
                    sx: { borderRadius: 2 }
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Button
                fullWidth
                variant="contained"
                size="medium"
                startIcon={checkingToken ? <CircularProgress size={18} color="inherit" /> : <UserIcon />}
                onClick={handleConnectProfile}
                disabled={checkingToken || !token.trim()}
                sx={{ height: 40, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
              >
                Profilni Aniqlash & Yuklash
              </Button>
            </Grid>
          </Grid>

          {/* Aniqlangan profil kartochkasi */}
          {userProfile && (
            <Paper
              elevation={0}
              sx={{
                mt: 2.5,
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha(theme.palette.success.main, 0.25),
                bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.08 : 0.03)
              }}
            >
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                    Mas'ul Xodim:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {userProfile.full_name || userProfile.username || 'Noma’lum'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                    Viloyat & Tuman:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {userProfile.obl_name || `Viloyat #${userProfile.obl_id}`} » {userProfile.area_name || `Tuman #${userProfile.area_id}`}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                    Biriktirilgan Mahalla:
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      {userProfile.mahalla_name || `Mahalla #${userProfile.district_id}`}
                    </Typography>
                    <Chip label={`ID: ${userProfile.district_id || districtId}`} size="small" variant="outlined" />
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Qo'lda ID larni tahrirlash (kerak bo'lsa ochiladi) */}
          <Box sx={{ mt: 1.5 }}>
            <Button
              size="small"
              color="inherit"
              onClick={() => setShowManualIds(!showManualIds)}
              endIcon={showManualIds ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              sx={{ fontSize: '0.75rem', textTransform: 'none', color: theme.palette.text.secondary }}
            >
              {showManualIds ? 'Qo‘lda kiritishni yashirish' : 'ID raqamlarini qo‘lda o‘zgartirish (qo‘shimcha)'}
            </Button>

            <Collapse in={showManualIds}>
              <Box sx={{ mt: 1, p: 2, border: '1px dashed', borderColor: theme.palette.divider, borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Viloyat ID (obl_id)"
                      value={oblId}
                      onChange={(e) => setOblId(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Tuman ID (area_id)"
                      value={areaId}
                      onChange={(e) => setAreaId(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Mahalla ID (district_id)"
                      value={districtId}
                      onChange={(e) => setDistrictId(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Box>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── 2-BOSQICH: ISHGA TUSHIRISH (SINXRONIZATSIYA TANLOVI) ── */}
      {/* ─────────────────────────────────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: 3,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: theme.palette.divider,
            bgcolor: alpha(theme.palette.secondary.main, 0.04)
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: theme.palette.secondary.main,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                2
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Sinxronizatsiyani Ishga Tushirish
              </Typography>
            </Stack>

            <Chip
              label={streets.length > 0 ? `${streets.length} ta ko‘cha tayyor` : 'Ko‘chalar kutilmoqda'}
              size="small"
              color={streets.length > 0 ? 'secondary' : 'default'}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          {/* Umumiy sozlama: Skip switch */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: skipIfOwnerExists ? alpha(theme.palette.warning.main, 0.3) : theme.palette.divider,
              bgcolor: skipIfOwnerExists
                ? alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.1 : 0.04)
                : theme.palette.background.paper
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={skipIfOwnerExists}
                  onChange={(e) => setSkipIfOwnerExists(e.target.checked)}
                  color="warning"
                />
              }
              label={
                <Box sx={{ ml: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Xonadon egasi kiritilgan bo‘lsa, tashlab ketish (Skip) — Tavsiya etiladi
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    14 xonali PINFL yoki rasmiy pasporti bor xonadonlarga ortiqcha so‘rov qilmaydi, faqat bo‘sh xonadonlarni to‘ldiradi.
                  </Typography>
                </Box>
              }
              sx={{ m: 0 }}
            />
          </Paper>

          {/* Uch xil ishga tushirish varianti (Kartochkalar) */}
          <Grid container spacing={2.5}>
            {/* VARIANT A: BUTUN MAHALLA (KADASTR / TOZAMAKON) */}
            <Grid size={{ xs: 12, lg: 4, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 2.5,
                  border: '2px solid',
                  borderColor: theme.palette.secondary.main,
                  bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.08 : 0.02)
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    <Chip label="Kadastr / MVD" color="secondary" size="small" sx={{ fontWeight: 700 }} />
                    <Chip label="5x Parallel" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  </Stack>

                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    ⚡ Butun Mahallani Avtomatik Sinxron Qilish
                  </Typography>

                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    Barcha <strong>{streets.length} ta ko‘cha</strong> TozaMakon kadastr ma’lumotlari bilan yangilanadi. Eng oxirida <strong>id: 0</strong> ko‘cha fuzzy biriktiriladi.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={startingJob ? <CircularProgress size={20} color="inherit" /> : <JobIcon />}
                  onClick={() => setMahallaConfirmDialogOpen(true)}
                  disabled={startingJob || streets.length === 0}
                  sx={{
                    height: 46,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(156, 39, 176, 0.35)'
                  }}
                >
                  Barcha Ko‘chalarni Boshlash
                </Button>
              </Paper>
            </Grid>

            {/* VARIANT B: ESKI HISOBOTDAN KO'CHIRISH (PA_SURVEY -> SURVEY_HOMES) */}
            <Grid size={{ xs: 12, lg: 4, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 2.5,
                  border: '2px solid',
                  borderColor: theme.palette.info.main,
                  bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.08 : 0.02)
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    <Chip label="Eski hisobot (pa_survey)" color="info" size="small" sx={{ fontWeight: 700 }} />
                    <Chip label="Xonadon + Oila" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  </Stack>

                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    📦 Eski Hisobotdan Ko‘chirish (Migratsiya)
                  </Typography>

                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    Eski hisobotdagi (1-bosqich) barcha xonadonlar va ularning oila a’zolarini yangi xatlov tizimiga (2-bosqich) to‘liq avtomatik ko‘chiradi. Yangi bazada borlari o‘tkazib yuboriladi (skip).
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="info"
                  size="large"
                  startIcon={startingJob ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
                  onClick={() => setMigrateConfirmDialogOpen(true)}
                  disabled={startingJob}
                  sx={{
                    height: 46,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(2, 136, 209, 0.35)'
                  }}
                >
                  Eski Hisobotni Ko‘chirish
                </Button>
              </Paper>
            </Grid>

            {/* VARIANT C: BITTA KO'CHANI TANLAB ISHLASH */}
            <Grid size={{ xs: 12, lg: 4, md: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  bgcolor: theme.palette.background.paper
                }}
              >
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    📍 Bitta Ko‘chani Tanlab Ishlash
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    Faqat bitta aniq ko‘cha xonadonlarini sinxronlash yoki ko‘rish uchun.
                  </Typography>

                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel id="select-street-label">Ko‘chani tanlang</InputLabel>
                    <Select
                      labelId="select-street-label"
                      value={selectedStreetId}
                      label="Ko‘chani tanlang"
                      onChange={(e) => setSelectedStreetId(e.target.value)}
                    >
                      {streets.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name} {Number(s.id) === 0 ? '(Noma’lum id: 0)' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Stack direction="row" spacing={1.5}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RunJobIcon />}
                    onClick={() => setStreetConfirmDialogOpen(true)}
                    disabled={!selectedStreetId || startingJob}
                    sx={{ height: 42, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                  >
                    Shu Ko‘chani Run Qilish
                  </Button>

                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<HomeIcon />}
                    onClick={() => selectedStreetObj && handleOpenHomesDrawer(selectedStreetObj)}
                    disabled={!selectedStreetObj}
                    sx={{ height: 42, borderRadius: 2, textTransform: 'none', minWidth: 110 }}
                  >
                    Xonadonlar
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── 3-BOSQICH: JONLI PROGRESS MONITORI & XATOLAR JURNALI ── */}
      {/* ─────────────────────────────────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: 3,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: theme.palette.divider,
            bgcolor: alpha(theme.palette.primary.main, 0.04)
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                3
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Jonli Sinxronizatsiya Monitori (Mission Control)
              </Typography>
            </Stack>

            {allJobs.length > 0 && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<ClearIcon fontSize="small" />}
                onClick={handleClearFinishedJobs}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Tugallanganlarni tozalash
              </Button>
            )}
          </Stack>
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          {allJobs.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <SyncIcon sx={{ fontSize: 44, color: theme.palette.text.secondary, opacity: 0.5, mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                Hozirda faol sinxronizatsiya joblari yo‘q
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.5 }}>
                2-bosqichdagi "Butun Mahallani Boshlash" tugmasini bosib ishga tushirishingiz mumkin.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {allJobs.map((job) => {
                const isRunning = job.status === 'RUNNING';
                const percent = job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;
                const streetsPercent =
                  job.totalStreets && job.totalStreets > 0
                    ? Math.round(((job.completedStreets || 0) / job.totalStreets) * 100)
                    : 0;

                return (
                  <Grid size={{ xs: 12, md: allJobs.length === 1 ? 12 : 6 }} key={job.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: isRunning
                          ? theme.palette.primary.main
                          : job.status === 'COMPLETED'
                            ? theme.palette.success.main
                            : theme.palette.divider,
                        bgcolor: alpha(
                          isRunning ? theme.palette.primary.main : job.status === 'COMPLETED' ? theme.palette.success.main : theme.palette.background.default,
                          0.03
                        )
                      }}
                    >
                      {/* Job Header */}
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {job.jobType === 'migrate_old_survey'
                              ? `📦 Eski hisobot migratsiyasi (${job.mahallaName || 'Mahalla'})`
                              : job.jobType === 'mahalla'
                                ? `🏡 ${job.mahallaName || 'Mahalla'}`
                                : `📍 ${job.streetName || 'Ko‘cha'}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Boshlandi: {new Date(job.startTime).toLocaleTimeString('uz-UZ')}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Chip
                            label={
                              job.status === 'RUNNING'
                                ? 'Jarayonda...'
                                : job.status === 'COMPLETED'
                                  ? 'Yakunlandi'
                                  : job.status === 'CANCELLED'
                                    ? 'To‘xtatilgan'
                                    : 'Xato'
                            }
                            size="small"
                            color={
                              job.status === 'RUNNING'
                                ? 'primary'
                                : job.status === 'COMPLETED'
                                  ? 'success'
                                  : job.status === 'CANCELLED'
                                    ? 'default'
                                    : 'error'
                            }
                            sx={{ fontWeight: 700 }}
                          />

                          {isRunning && (
                            <Tooltip title="Jobni to‘xtatish">
                              <IconButton size="small" color="error" onClick={() => handleCancelJob(job.id)}>
                                <StopIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Stack>

                      {/* Mahalla turi bo'lsa: Ko'chalar progressi */}
                      {job.jobType === 'mahalla' && job.totalStreets && job.totalStreets > 0 && (
                        <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(theme.palette.secondary.main, 0.05), borderRadius: 2 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                              Joriy ko‘cha: {job.currentStreetName || 'Boshlanmoqda...'}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {job.completedStreets || 0} / {job.totalStreets} ko‘cha ({streetsPercent}%)
                            </Typography>
                          </Stack>
                          <LinearProgress variant="determinate" color="secondary" value={streetsPercent} sx={{ height: 6, borderRadius: 3 }} />
                        </Box>
                      )}

                      {/* Xonadonlar progress bari */}
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Xonadonlar: {job.processed} / {job.total} ta
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {percent}%
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={percent} sx={{ height: 8, borderRadius: 4, mb: 2 }} />

                      {/* Metrikalar: Chip lar */}
                      <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
                        <Chip
                          size="small"
                          color="success"
                          icon={<SuccessIcon />}
                          label={job.jobType === 'migrate_old_survey' ? `Qo‘shildi: ${job.success}` : `Yangilandi: ${job.success}`}
                          sx={{ fontWeight: 600 }}
                        />
                        {Boolean(job.familyMembersAdded && job.familyMembersAdded > 0) && (
                          <Chip
                            size="small"
                            color="secondary"
                            label={`Oila a‘zolari: ${job.familyMembersAdded} ta`}
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                        <Chip size="small" color="info" label={`O‘tkazildi: ${job.skipped}`} sx={{ fontWeight: 600 }} />
                        <Chip size="small" color="warning" label={`Kadastr yo‘q: ${job.noCadastre}`} sx={{ fontWeight: 600 }} />
                        <Chip
                          size="small"
                          color={job.failed > 0 ? 'error' : 'default'}
                          icon={job.failed > 0 ? <ErrorIcon /> : undefined}
                          label={`Xatolar: ${job.failed}`}
                          sx={{ fontWeight: job.failed > 0 ? 700 : 400 }}
                        />
                      </Stack>

                      {/* Xatolarni ko'rish tugmasi */}
                      {job.errors && job.errors.length > 0 && (
                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<WarningIcon />}
                          onClick={() => handleOpenErrors(job)}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, py: 0.6 }}
                        >
                          Xatolar ro‘yxatini ko‘rish ({job.errors.length} ta xato)
                        </Button>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* ── Pastki qism: Mahalla ko'chalari to'liq ma'lumotnomasi (ixtiyoriy) ── */}
      {streets.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Button
            size="small"
            color="inherit"
            onClick={() => setShowStreetsTable(!showStreetsTable)}
            endIcon={showStreetsTable ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            sx={{ textTransform: 'none', color: theme.palette.text.secondary }}
          >
            {showStreetsTable ? 'Ko‘chalar statistik jadvalini yashirish' : 'Mahallaning barcha ko‘chalari to‘liq jadvalini ko‘rish'}
          </Button>

          <Collapse in={showStreetsTable}>
            <Card elevation={0} sx={{ mt: 1.5, border: '1px solid', borderColor: theme.palette.divider, borderRadius: 2.5 }}>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: 700, width: 45 }}>№</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ko‘cha nomi</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Xonadonlar</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Hovli</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Amal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {streets.map((s, idx) => (
                      <TableRow key={s.id || idx} hover>
                        <TableCell align="center">{idx + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {s.name} {Number(s.id) === 0 ? <Chip label="id: 0 (Noma’lum)" size="small" color="warning" sx={{ ml: 1, height: 20 }} /> : ''}
                        </TableCell>
                        <TableCell align="center">{s.homes_stat_count || '—'}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, color: theme.palette.success.main }}>{s.yard_count || '—'}</TableCell>
                        <TableCell align="center">
                          <Button size="small" variant="text" onClick={() => handleOpenHomesDrawer(s)}>
                            Xonadonlar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Collapse>
        </Box>
      )}

      {/* ── BUTUN MAHALLANI SINXRONLASH TASDIQLASH DIALOGI ── */}
      <Dialog
        open={mahallaConfirmDialogOpen}
        onClose={() => setMahallaConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          ⚡ Butun Mahallani Sinxronizatsiya Qilish
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Siz <strong>"{userProfile?.mahalla_name || `Mahalla #${districtId}`}"</strong> dagi jami <strong>{streets.length} ta ko‘chani</strong> sinxronizatsiya qilmoqchisiz.
          </Typography>

          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            <strong>Ko‘chalar ketma-ketligi:</strong> Barcha aniq ko‘chalar avval navbatma-navbat to‘liq ishlanadi. Eng oxirida esa <strong>id: 0 (ko‘chasi noma'lum)</strong> xonadonlar bajariladi va fuzzy solishtiruv orqali aniq ko‘chalarga biriktiriladi.
          </Alert>

          <Paper elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: theme.palette.divider, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Mavjud xonadon egalarini o‘tkazib yuborish (Skip):
              </Typography>
              <Chip label={skipIfOwnerExists ? 'YOQILGAN' : 'O‘CHIRILGAN'} color={skipIfOwnerExists ? 'warning' : 'default'} size="small" sx={{ fontWeight: 700 }} />
            </Stack>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMahallaConfirmDialogOpen(false)} color="inherit">
            Bekor qilish
          </Button>
          <Button variant="contained" color="secondary" startIcon={<RunJobIcon />} onClick={handleStartMahallaSync} disabled={startingJob}>
            Ha, Boshlash
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── ESKI HISOBOTDAN MIGRATSIYA TASDIQLASH DIALOGI ── */}
      <Dialog open={migrateConfirmDialogOpen} onClose={() => setMigrateConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.warning.main, 0.15),
                color: theme.palette.warning.dark,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MigrateIcon fontSize="small" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Eski Hisobotdan Ko‘chirish (Migratsiya)
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Tanlangan <strong>"{userProfile?.mahalla_name || `Mahalla #${districtId}`}"</strong> bo‘yicha eski hisobotdagi (1-bosqich) barcha xonadonlar va ularga tegishli aholi yangi xatlov tizimiga ko‘chiriladi.
          </Typography>

          <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.08), border: '1px solid', borderColor: alpha(theme.palette.warning.main, 0.3), borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.warning.dark, mb: 1 }}>
              Jarayon qanday amalga oshiriladi:
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 0.5 }}>
              1. <strong>Eski hisobot bazasi</strong>: Barcha xonadonlar (table 49) va aholi (table 50) to‘liq o‘qiladi.
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 0.5 }}>
              2. <strong>Dublikatlardan himoya</strong>: Yangi tizimda allaqachon mavjud xonadonlar o‘tkazib yuboriladi (skip).
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 0.5 }}>
              3. <strong>Ko‘chalar moslashuvi</strong>: Ko‘cha nomlari avtomatik fuzzy-matching orqali yangi tizim ID lariga ulanadi.
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
              4. <strong>Oila a'zolari</strong>: Yangi ochilgan har bir xonadonga eski hisobotdagi tegishli oila a'zolari birma-bir biriktiriladi.
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMigrateConfirmDialogOpen(false)} color="inherit">
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<MigrateIcon />}
            onClick={handleStartMigrateOldSurvey}
            disabled={startingJob}
            sx={{ fontWeight: 700 }}
          >
            Ha, Ko‘chirishni Boshlash
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── BITTA KO'CHA UCHUN TASDIQLASH DIALOGI ── */}
      <Dialog open={streetConfirmDialogOpen} onClose={() => setStreetConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Ko‘cha Sinxronizatsiyasini Boshlash</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">
            Tanlangan <strong>"{selectedStreetObj?.name}"</strong> ko‘chasidagi xonadonlarni sinxronizatsiya qilishni tasdiqlaysizmi?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStreetConfirmDialogOpen(false)} color="inherit">
            Bekor qilish
          </Button>
          <Button variant="contained" color="primary" onClick={handleStartStreetSync} disabled={startingJob}>
            Boshlash
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── XATOLAR JURNALI MODALI ── */}
      <Dialog open={errorsDialogOpen} onClose={() => setErrorsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <ErrorIcon color="error" />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Xatoliklar Jurnali ({selectedJobForErrors?.errors.length || 0} ta)
              </Typography>
            </Stack>

            <Button variant="outlined" size="small" startIcon={<CopyIcon />} onClick={handleCopyErrors} sx={{ borderRadius: 2, textTransform: 'none' }}>
              Ro‘yxatni Nusxalash
            </Button>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Kadastr, ko‘cha, xonadon egasi yoki xato bo‘yicha qidirish..."
            value={errorSearchQuery}
            onChange={(e) => setErrorSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, mb: 2 }
              }
            }}
          />

          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 450, border: '1px solid', borderColor: theme.palette.divider }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.background.paper }}>
                  <TableCell align="center" sx={{ fontWeight: 700, width: 45 }}>№</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ko‘cha</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Uy</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Kadastr raqami</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Egasi</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Xatolik sababi</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Vaqt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredErrors.map((err, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell align="center">{idx + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{err.streetName || '—'}</TableCell>
                    <TableCell>{err.houseNum || '—'}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{err.cadaster}</TableCell>
                    <TableCell>{err.ownerName || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={err.error}
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ fontSize: '0.72rem', height: 'auto', py: 0.3 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{err.timestamp}</TableCell>
                  </TableRow>
                ))}

                {filteredErrors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Xatoliklar topilmadi
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setErrorsDialogOpen(false)} color="inherit">
            Yopish
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── XONADONLAR DRAWERI ── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 850, md: 1050 },
              bgcolor: theme.palette.background.default
            }
          }
        }}
      >
        {selectedStreet && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: theme.palette.divider, bgcolor: theme.palette.background.paper }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {selectedStreet.name} ko‘chasi
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Jami xonadonlar: {homes.length} ta
                  </Typography>
                </Box>
                <IconButton onClick={() => setDrawerOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>

              <TextField
                fullWidth
                size="small"
                placeholder="Xonadon egasi, kadastr yoki uy raqami bo‘yicha qidirish..."
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

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {loadingHomes ? (
                <Stack spacing={2} sx={{ alignItems: 'center', py: 6 }}>
                  <CircularProgress size={36} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Yuklanmoqda...
                  </Typography>
                </Stack>
              ) : (
                <Card elevation={0} sx={{ border: '1px solid', borderColor: theme.palette.divider, borderRadius: 2 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: theme.palette.background.paper }}>
                          <TableCell align="center" sx={{ fontWeight: 700, width: 45 }}>№</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Uy</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Kadastr</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Egasi</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>JSHSHIR</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Telefon</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Sana</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>Havola</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredHomes.map((h, i) => (
                          <TableRow key={h.id || i} hover>
                            <TableCell align="center">{i + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{h.home_num || '—'}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{h.cadaster_number || '—'}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{h.full_name || '—'}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{h.pinfl || '—'}</TableCell>
                            <TableCell>{h.mobile_phone || '—'}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{h.survey_date || '—'}</TableCell>
                            <TableCell align="center">
                              {h.next_link && (
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={`https://online-mahalla.uz/${h.next_link}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <ExternalLinkIcon fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              )}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
