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
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as RunJobIcon,
  PlayArrow as PlayArrowIcon,
  DeleteOutlined as DeleteOutlineIcon,
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
  MoveToInbox as MigrateIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  UploadFile as UploadFileIcon,
  FileDownload as FileDownloadIcon,
  Fingerprint as FingerprintIcon,
  Storage as StorageIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Folder as FolderIcon,
  Assessment as AssessmentIcon,
  ArrowBack as ArrowBackIcon,
  TableChart as TableChartIcon,
  CalendarToday as CalendarTodayIcon,
  FilterList as FilterListIcon,
  Clear as ClearFilterIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
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
  jobType: 'mahalla' | 'street' | 'migrate_old_survey' | 'excel_family_import';
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
  excelFilePath?: string;
  fileName?: string;
  token?: string;
  totalMembers?: number;
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
  pinfl?: string;
  phone?: string;
}

interface SavedMahallaAccount {
  _id?: string;
  district_id: number | string;
  mahalla_name: string;
  obl_id?: number | string;
  area_id?: number | string;
  token: string;
  refreshToken?: string;
  pinfl?: string;
  full_name?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'ERROR';
  last_checked_at?: string;
  updatedAt?: string;
}

interface EimzoCertItem {
  disk: string;
  path: string;
  name: string;
  alias: string;
  parsedName?: string;
  pinfl?: string;
  serialNumber?: string;
  validFrom?: string;
  validTo?: string;
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

  // Saqlangan hisoblar va E-IMZO holatlari
  const [savedAccounts, setSavedAccounts] = useState<SavedMahallaAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);
  const [eimzoDialogOpen, setEimzoDialogOpen] = useState<boolean>(false);
  const [eimzoDialogTab, setEimzoDialogTab] = useState<'upload' | 'local'>('upload');
  const [uploadedKeyFile, setUploadedKeyFile] = useState<File | null>(null);
  const [uploadKeyPassword, setUploadKeyPassword] = useState<string>('');
  const [showUploadKeyPassword, setShowUploadKeyPassword] = useState<boolean>(false);
  const [uploadingKeyLogin, setUploadingKeyLogin] = useState<boolean>(false);
  const [eimzoKeys, setEimzoKeys] = useState<EimzoCertItem[]>([]);
  const [loadingEimzoKeys, setLoadingEimzoKeys] = useState<boolean>(false);
  const [selectedEimzoKey, setSelectedEimzoKey] = useState<EimzoCertItem | null>(null);
  const [loggingInEimzo, setLoggingInEimzo] = useState<boolean>(false);
  const [eimzoPassword, setEimzoPassword] = useState<string>(() => localStorage.getItem('online_mahalla_eimzo_password') || '');

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

  // Ko'rinish rejimi: 'card' (kartochka) yoki 'table' (jadval)
  const [viewMode, setViewMode] = useState<'card' | 'table'>(() => {
    return (localStorage.getItem('online_mahalla_view_mode') as 'card' | 'table') || 'card';
  });

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, nextMode: 'card' | 'table' | null) => {
    if (nextMode) {
      setViewMode(nextMode);
      localStorage.setItem('online_mahalla_view_mode', nextMode);
    }
  };

  // Sozlamalar
  const [skipIfOwnerExists, setSkipIfOwnerExists] = useState<boolean>(true);
  const [startingJob, setStartingJob] = useState<boolean>(false);

  // 3. Multi-Job monitoring
  const [allJobs, setAllJobs] = useState<SyncJobStatus[]>([]);
  const [selectedJobDate, setSelectedJobDate] = useState<string>('all'); // 'all' | 'today' | 'yesterday' | 'YYYY-MM-DD'
  const [customJobDate, setCustomJobDate] = useState<string>('');
  const [jobSearchQuery, setJobSearchQuery] = useState<string>('');
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('all');
  const [dateStats, setDateStats] = useState<Record<string, number>>({});
  const [totalInDb, setTotalInDb] = useState<number>(0);

  // Tuman nomlarini erkin kiritish va boshqarish (localStorage)
  const [districtNames, setDistrictNames] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('online_mahalla_district_names');
      return saved ? JSON.parse(saved) : { '1813': "Kattaqo'rg'on tumani" };
    } catch {
      return { '1813': "Kattaqo'rg'on tumani" };
    }
  });
  const [editingDistrictId, setEditingDistrictId] = useState<string | null>(null);
  const [editingDistrictName, setEditingDistrictName] = useState<string>('');

  const handleSaveDistrictName = (aId: string) => {
    if (!aId) return;
    const updated = { ...districtNames, [aId]: editingDistrictName.trim() || `Tuman #${aId}` };
    setDistrictNames(updated);
    localStorage.setItem('online_mahalla_district_names', JSON.stringify(updated));
    setEditingDistrictId(null);
  };

  // Modallar
  const [mahallaConfirmDialogOpen, setMahallaConfirmDialogOpen] = useState<boolean>(false);
  const [migrateConfirmDialogOpen, setMigrateConfirmDialogOpen] = useState<boolean>(false);
  const [streetConfirmDialogOpen, setStreetConfirmDialogOpen] = useState<boolean>(false);
  const [excelImportDialogOpen, setExcelImportDialogOpen] = useState<boolean>(false);
  const [selectedExcelFile, setSelectedExcelFile] = useState<File | null>(null);
  const [uploadingExcel, setUploadingExcel] = useState<boolean>(false);
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

  // ── Sahifa ko'rinishi: Sinxronizatsiya vs Hisobotlar ──
  const [activeView, setActiveView] = useState<'sync' | 'report'>('sync');

  // Mission Control: Pachkalar katalogi navigatsiyasi (Packs -> Items)
  const [selectedMonitorDistrictId, setSelectedMonitorDistrictId] = useState<string | null>(null);

  // ── Online Mahalla Hisobotlari (Survey Homes) ──
  const [selectedReportDistrictId, setSelectedReportDistrictId] = useState<string | null>(null);
  const [selectedReportMahalla, setSelectedReportMahalla] = useState<SavedMahallaAccount | null>(null);
  const [reportStreets, setReportStreets] = useState<StreetItem[]>([]);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);
  const [reportSearch, setReportSearch] = useState<string>('');

  // Qo'lda kiritiladigan hisobot parametrlari
  const [manualReportObl, setManualReportObl] = useState<string>('18');
  const [manualReportArea, setManualReportArea] = useState<string>('1813');
  const [manualReportDist, setManualReportDist] = useState<string>('1813005');
  const [manualReportToken, setManualReportToken] = useState<string>('bac37fef-ba41-4f41-9a26-13b1a9b84938');

  // Mahalla hisobotini yuklash
  const handleOpenMahallaReport = async (account: SavedMahallaAccount) => {
    setSelectedReportMahalla(account);
    setLoadingReport(true);
    try {
      const activeObl = account.obl_id || oblId || '18';
      const activeArea = account.area_id || areaId || '1813';
      const activeDist = account.district_id;
      const activeTok = account.token || token || manualReportToken;

      const res = await api.get('/product-admin/online-mahalla/streets', {
        params: { obl_id: activeObl, area_id: activeArea, district_id: activeDist },
        headers: { 'x-online-mahalla-token': activeTok }
      });
      if (res.data?.success && res.data?.data?.results) {
        setReportStreets(res.data.data.results);
      } else {
        setReportStreets([]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hisobotni yuklashda xatolik yuz berdi');
    } finally {
      setLoadingReport(false);
    }
  };

  // Qo'lda kiritilgan hisobotni ochish
  const handleLoadManualReport = async () => {
    if (!manualReportDist.trim()) {
      toast.warning('Mahalla ID (district_id) ni kiriting!');
      return;
    }
    const syntheticAccount: SavedMahallaAccount = {
      district_id: manualReportDist.trim(),
      mahalla_name: `Mahalla #${manualReportDist.trim()}`,
      obl_id: manualReportObl.trim() || '18',
      area_id: manualReportArea.trim() || '1813',
      token: manualReportToken.trim() || token || 'bac37fef-ba41-4f41-9a26-13b1a9b84938',
      status: 'ACTIVE'
    };
    await handleOpenMahallaReport(syntheticAccount);
  };

  // Hisobot jami hisob-kitoblari (Totals)
  const reportTotals = useMemo(() => {
    let homes_stat_count = 0;
    let homes_surveyed_count = 0;
    let multistory_count = 0;
    let yard_count = 0;
    let dormitory_count = 0;
    let population_stat_count = 0;
    let population_surveyed_count = 0;
    let youth_count = 0;
    let women_count = 0;
    let pensioner_count = 0;
    let defects_count = 0;

    for (const s of reportStreets) {
      homes_stat_count += Number(s.homes_stat_count || 0);
      homes_surveyed_count += Number(s.homes_surveyed_count || 0);
      multistory_count += Number(s.multistory_count || 0);
      yard_count += Number(s.yard_count || 0);
      dormitory_count += Number(s.dormitory_count || 0);
      population_stat_count += Number(s.population_stat_count || 0);
      population_surveyed_count += Number(s.population_surveyed_count || 0);
      youth_count += Number(s.youth_count || 0);
      women_count += Number(s.women_count || 0);
      pensioner_count += Number(s.pensioner_count || 0);
      defects_count += Number(s.defects_count || 0);
    }

    return {
      homes_stat_count,
      homes_surveyed_count,
      multistory_count,
      yard_count,
      dormitory_count,
      population_stat_count,
      population_surveyed_count,
      youth_count,
      women_count,
      pensioner_count,
      defects_count
    };
  }, [reportStreets]);

  // Qidiruv bo'yicha filtrlangan ko'chalar hisoboti
  const filteredReportStreets = useMemo(() => {
    if (!reportSearch.trim()) return reportStreets;
    const q = reportSearch.toLowerCase();
    return reportStreets.filter((s) => s.name?.toLowerCase().includes(q));
  }, [reportStreets, reportSearch]);

  // Excelga eksport qilish
  const handleExportReportExcel = () => {
    if (!reportStreets || reportStreets.length === 0) {
      toast.warning('Eksport qilish uchun ma’lumot yo‘q');
      return;
    }
    const headers = [
      'т/р',
      'Кўча номи',
      'Хонадонлар сони (статистик)',
      'Хонадонлар сони (ҲЁ ўрганган)',
      'Кўп қаватли хонадон',
      'Ҳовли',
      'Ётоқхона',
      'Аҳоли сони (статистик)',
      'Аҳоли сони (ҲЁ ўрганган)',
      'Ёшлар',
      'Аёллар',
      'Пенсия ёшидагилар',
      'Камчиликлар сони'
    ];
    const rows: (string | number)[][] = reportStreets.map((s, idx) => [
      s._rownum || idx + 1,
      s.name,
      s.homes_stat_count ?? '',
      s.homes_surveyed_count ?? '',
      s.multistory_count ?? '',
      s.yard_count ?? '',
      s.dormitory_count ?? '',
      s.population_stat_count ?? '',
      s.population_surveyed_count ?? '',
      s.youth_count ?? '',
      s.women_count ?? '',
      s.pensioner_count ?? '',
      s.defects_count ?? ''
    ]);
    // Jami qatori
    rows.push([
      reportStreets.length,
      'жами',
      reportTotals.homes_stat_count,
      reportTotals.homes_surveyed_count,
      reportTotals.multistory_count,
      reportTotals.yard_count,
      reportTotals.dormitory_count,
      reportTotals.population_stat_count,
      reportTotals.population_surveyed_count,
      reportTotals.youth_count,
      reportTotals.women_count,
      reportTotals.pensioner_count,
      reportTotals.defects_count
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SurveyHomes');
    const fileName = `Survey_Homes_${selectedReportMahalla?.mahalla_name || 'report'}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success('Excel fayli muvaffaqiyatli yuklab olindi!');
  };

  // ── Saqlangan hisoblarni yuklash ──
  const fetchSavedAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const res = await api.get('/product-admin/online-mahalla/accounts');
      if (res.data?.success && Array.isArray(res.data?.accounts)) {
        setSavedAccounts(res.data.accounts);
      }
    } catch (_) {
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchSavedAccounts();
  }, []);

  // E-IMZO kalitlarini yuklash
  const handleOpenEimzoDialog = async () => {
    setEimzoDialogOpen(true);
    setLoadingEimzoKeys(true);
    try {
      const res = await api.get('/product-admin/online-mahalla/eimzo/keys');
      if (res.data?.success && Array.isArray(res.data?.keys)) {
        setEimzoKeys(res.data.keys);
        if (res.data.keys.length > 0) {
          setSelectedEimzoKey(res.data.keys[0]);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'E-IMZO kalitlarini o‘qib bo‘lmadi. E-IMZO dasturi ishlayotganiga ishonch hosil qiling.');
    } finally {
      setLoadingEimzoKeys(false);
    }
  };

  // E-IMZO orqali tizimga kirish
  const handleLoginWithEimzo = async () => {
    if (!selectedEimzoKey) {
      toast.warning('Iltimos, kalitni tanlang!');
      return;
    }
    if (eimzoPassword.trim()) {
      localStorage.setItem('online_mahalla_eimzo_password', eimzoPassword.trim());
    }
    setLoggingInEimzo(true);
    toast.info('E-IMZO orqali avtorizatsiya qilinmoqda...');
    try {
      const res = await api.post('/product-admin/online-mahalla/eimzo/login', {
        cert: selectedEimzoKey,
        password: eimzoPassword.trim() || undefined
      });

      if (res.data?.success && res.data?.token) {
        const newToken = res.data.token;
        const prof = res.data.profile;
        setToken(newToken);
        localStorage.setItem('online_mahalla_token', newToken);

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
          if (prof.district_id) {
            setDistrictId(String(prof.district_id));
            localStorage.setItem('online_mahalla_district_id', String(prof.district_id));
          }
        }

        toast.success(`E-IMZO bilan muvaffaqiyatli kirildi! Mahalla: ${prof?.mahalla_name || 'Aniqlangan'}`);
        setEimzoDialogOpen(false);
        fetchSavedAccounts();
        if (prof) {
          loadStreets(prof, newToken);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'E-IMZO orqali kirishda xatolik yuz berdi');
    } finally {
      setLoggingInEimzo(false);
    }
  };

  // Kalit faylini yuklash orqali tizimga kirish
  const handleUploadAndLoginWithEimzo = async () => {
    if (!uploadedKeyFile) {
      toast.warning('Iltimos, avval .pfx kalit faylini tanlang!');
      return;
    }
    if (!uploadKeyPassword.trim()) {
      toast.warning('Iltimos, kalit parolini kiriting!');
      return;
    }

    setUploadingKeyLogin(true);
    toast.info('Kalit serverga yuklanmoqda va ochilmoqda...');
    try {
      const formData = new FormData();
      formData.append('file', uploadedKeyFile);
      formData.append('password', uploadKeyPassword.trim());

      const res = await api.post('/product-admin/online-mahalla/eimzo/upload-login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data?.token) {
        const newToken = res.data.token;
        const prof = res.data.profile;
        setToken(newToken);
        localStorage.setItem('online_mahalla_token', newToken);

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
          if (prof.district_id) {
            setDistrictId(String(prof.district_id));
            localStorage.setItem('online_mahalla_district_id', String(prof.district_id));
          }
        }

        toast.success(res.data.message || `Kalit yuklandi va muvaffaqiyatli kirildi! (${prof?.mahalla_name || ''})`);
        setEimzoDialogOpen(false);
        setUploadedKeyFile(null);
        setUploadKeyPassword('');
        fetchSavedAccounts();
        if (prof) {
          loadStreets(prof, newToken);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Kalitni yuklash yoki ochishda xatolik yuz berdi');
    } finally {
      setUploadingKeyLogin(false);
    }
  };

  // Saqlangan hisobni tanlash
  const handleSelectAccount = (acc: SavedMahallaAccount) => {
    setToken(acc.token);
    localStorage.setItem('online_mahalla_token', acc.token);

    const prof: UserProfileInfo = {
      mahalla_name: acc.mahalla_name,
      district_id: acc.district_id,
      obl_id: acc.obl_id,
      area_id: acc.area_id,
      full_name: acc.full_name,
      pinfl: acc.pinfl
    };
    setUserProfile(prof);
    localStorage.setItem('online_mahalla_profile', JSON.stringify(prof));

    if (acc.obl_id) {
      setOblId(String(acc.obl_id));
      localStorage.setItem('online_mahalla_obl_id', String(acc.obl_id));
    }
    if (acc.area_id) {
      setAreaId(String(acc.area_id));
      localStorage.setItem('online_mahalla_area_id', String(acc.area_id));
    }
    if (acc.district_id) {
      setDistrictId(String(acc.district_id));
      localStorage.setItem('online_mahalla_district_id', String(acc.district_id));
    }

    toast.success(`«${acc.mahalla_name}» hisobiga ulandi!`);
    loadStreets(prof, acc.token);
  };

  // Saqlangan hisobni o'chirish
  const handleDeleteAccount = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/product-admin/online-mahalla/accounts/${id}`);
      toast.info('Hisob o‘chirildi');
      fetchSavedAccounts();
    } catch (_) {
      toast.error('O‘chirishda xatolik');
    }
  };

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
        token: rawToken,
        password: eimzoPassword.trim() || undefined
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
    const activeDist = customProf?.district_id
      ? String(customProf.district_id)
      : customProf?.mahalla_id
        ? String(customProf.mahalla_id)
        : districtId.trim();

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
  const fetchAllJobs = async (targetDate?: string) => {
    try {
      const activeDate = targetDate !== undefined ? targetDate : selectedJobDate;
      const params: any = {};
      if (activeDate && activeDate !== 'all') {
        params.date = activeDate;
      }
      const res = await api.get('/product-admin/online-mahalla/jobs', { params });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        const sorted = [...res.data.data].sort((a, b) => {
          const timeA = new Date(a.startTime).getTime() || 0;
          const timeB = new Date(b.startTime).getTime() || 0;
          return timeB - timeA;
        });
        setAllJobs(sorted);
        if (res.data?.dateStats) {
          setDateStats(res.data.dateStats);
        }
        if (typeof res.data?.totalInDb === 'number') {
          setTotalInDb(res.data.totalInDb);
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchAllJobs(selectedJobDate);
    const timer = setInterval(() => {
      fetchAllJobs(selectedJobDate);
    }, 3000);
    return () => clearInterval(timer);
  }, [selectedJobDate]);

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
          token: token.trim()
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

  // Excel shablonini yuklab olish
  const handleDownloadExcelTemplate = async () => {
    try {
      const res = await api.get('/product-admin/online-mahalla/template/excel-family', {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'oila_import_shablon.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel shabloni yuklab olindi!');
    } catch (err: any) {
      toast.error('Shablonni yuklab olishda xatolik');
    }
  };

  // Excel oila importini ishga tushirish yoki navbatga qo'yish (Ready to Start)
  const handleStartExcelFamilyImport = async (runImmediately: boolean = false) => {
    if (!selectedExcelFile) {
      toast.warning('Iltimos, avval Excel faylni tanlang!');
      return;
    }
    if (!oblId || !areaId || !districtId) {
      toast.warning('Avval mahalla profilini aniqlang!');
      return;
    }

    try {
      setUploadingExcel(true);
      const formData = new FormData();
      formData.append('file', selectedExcelFile);
      formData.append('obl_id', String(oblId));
      formData.append('area_id', String(areaId));
      formData.append('district_id', String(districtId));
      formData.append('mahalla_name', userProfile?.mahalla_name || `Mahalla #${districtId}`);
      formData.append('company_id', '1144');
      formData.append('run_immediately', runImmediately ? 'true' : 'false');

      const res = await api.post('/product-admin/online-mahalla/import-excel-family', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-online-mahalla-token': token.trim()
        }
      });

      if (res.data?.success && res.data?.jobId) {
        toast.success(
          res.data.message ||
            (runImmediately ? 'Excel bo‘yicha import jobi boshlandi!' : 'Job muvaffaqiyatli tayyorlandi (Boshlashga tayyor)!')
        );
        setExcelImportDialogOpen(false);
        setSelectedExcelFile(null);
        fetchAllJobs();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Excel faylni yuklashda xatolik yuz berdi');
    } finally {
      setUploadingExcel(false);
    }
  };

  // PENDING holatdagi Jobni bitta buyruq bilan ishga tushirish (Run)
  const [startingJobId, setStartingJobId] = useState<string | null>(null);
  const handleStartJob = async (jobId: string) => {
    try {
      setStartingJobId(jobId);
      const res = await api.post(
        `/product-admin/online-mahalla/jobs/${jobId}/start`,
        {},
        {
          headers: {
            'x-online-mahalla-token': token.trim()
          }
        }
      );
      toast.success(res.data?.message || 'Job muvaffaqiyatli ishga tushirildi!');
      fetchAllJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Jobni ishga tushirishda xatolik yuz berdi');
    } finally {
      setStartingJobId(null);
    }
  };

  // Barcha PENDING joblarni bittada ishga tushirish (Run All)
  const [startingAllJobs, setStartingAllJobs] = useState<boolean>(false);
  const handleStartAllPendingJobs = async () => {
    try {
      setStartingAllJobs(true);
      const res = await api.post(
        '/product-admin/online-mahalla/jobs/start-all-pending',
        {},
        {
          headers: {
            'x-online-mahalla-token': token.trim()
          }
        }
      );
      toast.success(res.data?.message || 'Barcha tayyor joblar ishga tushirildi!');
      fetchAllJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Joblarni ishga tushirishda xatolik yuz berdi');
    } finally {
      setStartingAllJobs(false);
    }
  };

  // Jobni o'chirish (Delete)
  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Haqiqatan ham ushbu jobni o‘chirmoqchimisiz?')) return;
    try {
      const res = await api.delete(`/product-admin/online-mahalla/jobs/${jobId}`);
      toast.success(res.data?.message || 'Job muvaffaqiyatli o‘chirildi');
      fetchAllJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Jobni o‘chirishda xatolik');
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

  const selectedStreetObj = useMemo(() => streets.find((s) => String(s.id) === String(selectedStreetId)), [streets, selectedStreetId]);

  // Mission Control: Kunlik va holat/qidiruv bo'yicha filtrlangan joblar
  const filteredJobs = useMemo(() => {
    let result = allJobs;

    if (jobStatusFilter !== 'all') {
      result = result.filter((j) => {
        if (jobStatusFilter === 'FAILED') return j.status === 'FAILED' || j.status === 'CANCELLED';
        return j.status === jobStatusFilter;
      });
    }

    if (jobSearchQuery.trim()) {
      const q = jobSearchQuery.toLowerCase().trim();
      result = result.filter(
        (j) =>
          (j.mahallaName && j.mahallaName.toLowerCase().includes(q)) ||
          (j.streetName && j.streetName.toLowerCase().includes(q)) ||
          (j.id && j.id.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allJobs, jobStatusFilter, jobSearchQuery]);

  const { todayDateStr, yesterdayDateStr, availableOtherDates } = useMemo(() => {
    const nowUzt = new Date(Date.now() + 5 * 60 * 60 * 1000);
    const todayStr = nowUzt.toISOString().slice(0, 10);
    const yestUzt = new Date(Date.now() + 5 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000);
    const yestStr = yestUzt.toISOString().slice(0, 10);

    const otherDates = Object.keys(dateStats)
      .filter((d) => d !== todayStr && d !== yestStr)
      .sort((a, b) => b.localeCompare(a));

    return {
      todayDateStr: todayStr,
      yesterdayDateStr: yestStr,
      availableOtherDates: otherDates
    };
  }, [dateStats]);

  // 3-Bosqich: Barcha joblar statistikasi (Yakunlandi, Jarayonda, Xatolar va h.k.)
  const jobsStats = useMemo(() => {
    let running = 0;
    let completed = 0;
    let failed = 0;
    let cancelled = 0;
    let totalHomesUpdated = 0;
    let totalHomesTarget = 0;
    let totalErrorsCount = 0;

    filteredJobs.forEach((j) => {
      if (j.status === 'RUNNING') running++;
      else if (j.status === 'COMPLETED') completed++;
      else if (j.status === 'CANCELLED') cancelled++;
      else failed++;

      totalHomesUpdated += Number(j.success || 0);
      totalHomesTarget += Number(j.total || 0);
      totalErrorsCount += Number(j.failed || 0);
    });

    return {
      total: filteredJobs.length,
      running,
      completed,
      failed,
      cancelled,
      totalHomesUpdated,
      totalHomesTarget,
      totalErrorsCount
    };
  }, [filteredJobs]);

  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      const timeA = new Date(a.startTime).getTime() || 0;
      const timeB = new Date(b.startTime).getTime() || 0;
      return timeB - timeA;
    });
  }, [filteredJobs]);

  // ── TUMANLAR BO‘YICHA GURUHLANGAN JOBLAR ("PACHKA" MONITORING) ──
  const jobsByDistrict = useMemo(() => {
    const map = new Map<
      string,
      {
        areaId: string;
        districtName: string;
        jobs: SyncJobStatus[];
        stats: {
          totalJobs: number;
          running: number;
          pending: number;
          completed: number;
          failed: number;
          cancelled: number;
          totalHomes: number;
          processedHomes: number;
          successHomes: number;
          familyMembers: number;
          skippedHomes: number;
          noCadastreHomes: number;
          percent: number;
        };
      }
    >();

    for (const job of filteredJobs) {
      const aId = String(job.area_id || 'boshqa');
      if (!map.has(aId)) {
        map.set(aId, {
          areaId: aId,
          districtName: districtNames[aId] || (aId === 'boshqa' ? 'Boshqa / Aniqlanmagan tuman' : `Tuman #${aId}`),
          jobs: [],
          stats: {
            totalJobs: 0,
            running: 0,
            pending: 0,
            completed: 0,
            failed: 0,
            cancelled: 0,
            totalHomes: 0,
            processedHomes: 0,
            successHomes: 0,
            familyMembers: 0,
            skippedHomes: 0,
            noCadastreHomes: 0,
            percent: 0
          }
        });
      }

      const grp = map.get(aId)!;
      grp.jobs.push(job);
      const s = grp.stats;
      s.totalJobs++;
      if (job.status === 'RUNNING') s.running++;
      else if (job.status === 'PENDING') s.pending++;
      else if (job.status === 'COMPLETED') s.completed++;
      else if (job.status === 'CANCELLED') s.cancelled++;
      else s.failed++;

      s.totalHomes += Number(job.total || 0);
      s.processedHomes += Number(job.processed || 0);
      s.successHomes += Number(job.success || 0);
      s.familyMembers += Number(job.familyMembersAdded || 0);
      s.skippedHomes += Number(job.skipped || 0);
      s.noCadastreHomes += Number(job.noCadastre || 0);
    }

    const list = Array.from(map.values());
    list.forEach((g) => {
      g.jobs.sort((a, b) => (new Date(b.startTime).getTime() || 0) - (new Date(a.startTime).getTime() || 0));
      g.stats.percent = g.stats.totalHomes > 0 ? Math.round((g.stats.processedHomes / g.stats.totalHomes) * 100) : 0;
    });

    return list.sort((a, b) => {
      if (b.stats.running !== a.stats.running) return b.stats.running - a.stats.running;
      return b.stats.totalJobs - a.stats.totalJobs;
    });
  }, [filteredJobs, districtNames]);

  // ── TUMANLAR BO‘YICHA GURUHLANGAN BAZADAGI SAQLANGAN MAHALLALAR ──
  const savedAccountsByDistrict = useMemo(() => {
    const map = new Map<
      string,
      {
        areaId: string;
        districtName: string;
        accounts: SavedMahallaAccount[];
      }
    >();

    for (const acc of savedAccounts) {
      const aId = String(acc.area_id || 'boshqa');
      if (!map.has(aId)) {
        map.set(aId, {
          areaId: aId,
          districtName: districtNames[aId] || (aId === 'boshqa' ? 'Boshqa tuman' : `Tuman #${aId}`),
          accounts: []
        });
      }
      map.get(aId)!.accounts.push(acc);
    }

    return Array.from(map.values());
  }, [savedAccounts, districtNames]);

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* ── Bosh Sahifa Sarlavhasi ── */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <StreetIcon sx={{ color: theme.palette.primary.main, fontSize: 30 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                Online-Mahalla Integratsiya Markazi
              </Typography>
              <Chip
                label={activeView === 'sync' ? 'Sinxronizatsiya' : 'Hisobotlar (Survey)'}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 700
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
              Xodim profilini ulang, mahallalarni sinxronizatsiya qiling hamda aholi/xonadonlar statistik hisobotini kuzating.
            </Typography>
          </Box>

          {/* Sahifalar almashinuvi: Sinxronizatsiya vs Hisobotlar */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant={activeView === 'sync' ? 'contained' : 'outlined'}
              color="primary"
              startIcon={<SyncIcon />}
              onClick={() => setActiveView('sync')}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              Sinxronizatsiya & Monitor
            </Button>
            <Button
              variant={activeView === 'report' ? 'contained' : 'outlined'}
              color="primary"
              startIcon={<AssessmentIcon />}
              onClick={() => setActiveView('report')}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              📊 Hisobotlarga o‘tish (Survey Homes)
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── SINXRONIZATSIYA & BOSHQARUV REJIMI ── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeView === 'sync' && (
        <Box>
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
              {/* E-IMZO orqali kirish va Saqlangan hisoblar paneli */}
              <Box sx={{ mb: 2.5 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.05),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.2)
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <FingerprintIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                        E-IMZO Kaliti bilan Tezkor Kirish
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Fizik kalitdan foydalanib, bir klik bilan yangi token oling va bazada saqlang
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<FingerprintIcon />}
                    onClick={handleOpenEimzoDialog}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 2,
                      py: 0.8,
                      boxShadow: 'none'
                    }}
                  >
                    E-IMZO Bilan Kirish
                  </Button>
                </Stack>

                {/* Saqlangan mahallalar hisoblari ro'yxati (Tumanlar kesimida katalog) */}
                {savedAccounts.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                      <StorageIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Bazada Saqlangan Mahallalar Katalogi ({savedAccounts.length} ta mahalla):
                      </Typography>
                    </Stack>

                    <Stack spacing={1.5}>
                      {savedAccountsByDistrict.map((distGroup) => (
                        <Paper
                          key={distGroup.areaId}
                          elevation={0}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: theme.palette.divider,
                            bgcolor: alpha(theme.palette.background.default, 0.5)
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap' }}
                          >
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                              <FolderIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {distGroup.districtName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: 'monospace' }}>
                                (area_id: {distGroup.areaId})
                              </Typography>
                              <Chip
                                label={`${distGroup.accounts.length} ta mahalla`}
                                size="small"
                                sx={{ height: 20, fontSize: '0.72rem', fontWeight: 600 }}
                              />
                              <Tooltip title="Tuman nomini tahrirlash">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingDistrictId(distGroup.areaId);
                                    setEditingDistrictName(distGroup.districtName);
                                  }}
                                  sx={{ p: 0.3 }}
                                >
                                  <EditIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>

                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            {distGroup.accounts.map((acc) => {
                              const isSelected = String(districtId) === String(acc.district_id);
                              return (
                                <Stack
                                  key={acc._id}
                                  direction="row"
                                  spacing={0.3}
                                  sx={{
                                    alignItems: 'center',
                                    border: '1px solid',
                                    borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
                                    borderRadius: 4,
                                    pr: 0.6,
                                    bgcolor: isSelected
                                      ? alpha(theme.palette.primary.main, 0.08)
                                      : alpha(theme.palette.background.paper, 0.8)
                                  }}
                                >
                                  <Chip
                                    label={`${acc.mahalla_name} (${acc.full_name || 'Xodim'})`}
                                    color={isSelected ? 'primary' : 'default'}
                                    variant={isSelected ? 'filled' : 'outlined'}
                                    onClick={() => handleSelectAccount(acc)}
                                    // onDelete={(e) => handleDeleteAccount(acc._id, e)}
                                    // deleteIcon={
                                    //   <Tooltip title="Hisobni o‘chirish">
                                    //     <DeleteIcon fontSize="small" />
                                    //   </Tooltip>
                                    // }
                                    sx={{
                                      fontWeight: isSelected ? 700 : 500,
                                      cursor: 'pointer',
                                      border: 'none',
                                      bgcolor: 'transparent'
                                    }}
                                  />
                                  <Tooltip title="Ushbu mahallaning Survey Homes hisobotini ochish">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveView('report');
                                        setSelectedReportDistrictId(distGroup.areaId);
                                        handleOpenMahallaReport(acc);
                                      }}
                                      sx={{ p: 0.4 }}
                                    >
                                      <AssessmentIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              );
                            })}
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Token kiritish va Ulanish qatori */}
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 5 }}>
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

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="E-IMZO Kalit Paroli"
                    placeholder="Masalan: 19931414"
                    value={eimzoPassword}
                    onChange={(e) => {
                      setEimzoPassword(e.target.value);
                      localStorage.setItem('online_mahalla_eimzo_password', e.target.value);
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <FingerprintIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
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
                    variant="outlined"
                    size="medium"
                    startIcon={checkingToken ? <CircularProgress size={18} color="inherit" /> : <UserIcon />}
                    onClick={handleConnectProfile}
                    disabled={checkingToken || !token.trim()}
                    sx={{ height: 40, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                  >
                    Profilni Aniqlash & Saqlash
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
                        {userProfile.obl_name || `Viloyat #${userProfile.obl_id}`} »{' '}
                        {userProfile.area_name || `Tuman #${userProfile.area_id}`}
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
                  control={<Switch checked={skipIfOwnerExists} onChange={(e) => setSkipIfOwnerExists(e.target.checked)} color="warning" />}
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

              {/* Uch xil ishga tushirish varianti: Card yoki Table ko'rinishi */}
              {viewMode === 'card' ? (
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
                          Barcha <strong>{streets.length} ta ko‘cha</strong> TozaMakon kadastr ma’lumotlari bilan yangilanadi. Eng oxirida{' '}
                          <strong>id: 0</strong> ko‘cha fuzzy biriktiriladi.
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
                          Eski hisobotdagi (1-bosqich) barcha xonadonlar va ularning oila a’zolarini yangi xatlov tizimiga (2-bosqich)
                          to‘liq avtomatik ko‘chiradi. Yangi bazada borlari o‘tkazib yuboriladi (skip).
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

                  {/* VARIANT D: EXCEL BO'YICHA OILA IMPORTI */}
                  <Grid size={{ xs: 12, lg: 6, md: 12 }}>
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
                        borderColor: theme.palette.success.main,
                        bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.08 : 0.03)
                      }}
                    >
                      <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                          <Chip label="Yangi: Excel Oila Import" color="success" size="small" sx={{ fontWeight: 700 }} />
                          <Chip label="Guvohnomali Bolalar" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                          <Chip label="Max 12 a’zo" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        </Stack>

                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                          📊 Excel Bo‘yicha Oila Importi
                        </Typography>

                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                          Excel fayldagi <strong>oila raqami</strong> bo‘yicha guruhlangan fuqarolarni (ota-ona, guvohnomali bolalar, max 12
                          kishi) mahallaning mavjud kadastrli bo‘sh xonadonlariga ketma-ket joylashtiradi.
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1.5}>
                        <Button
                          variant="outlined"
                          color="success"
                          startIcon={<FileDownloadIcon />}
                          onClick={handleDownloadExcelTemplate}
                          sx={{ height: 44, borderRadius: 2, fontWeight: 700, textTransform: 'none', flexShrink: 0 }}
                        >
                          Shablon (.xlsx)
                        </Button>

                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          startIcon={<UploadFileIcon />}
                          onClick={() => setExcelImportDialogOpen(true)}
                          sx={{
                            height: 44,
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(46, 125, 50, 0.35)'
                          }}
                        >
                          Excel Yuklash & Ishga Tushirish
                        </Button>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                /* JADVAL REJIMI (TABLE VIEW) */
                <Paper
                  elevation={0}
                  sx={{ border: '1px solid', borderColor: theme.palette.divider, borderRadius: 2.5, overflow: 'hidden' }}
                >
                  <TableContainer>
                    <Table size="medium">
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.04) }}>
                          <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700, width: 230 }}>Sinxronizatsiya turi</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Tavsifi / Qamrovi</TableCell>
                          <TableCell sx={{ fontWeight: 700, width: 240 }}>Parametr / Tanlov</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, width: 240 }}>
                            Amallar
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Qator 1: Butun Mahalla */}
                        <TableRow hover>
                          <TableCell sx={{ fontWeight: 700 }}>1</TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                                ⚡ Butun Mahalla
                              </Typography>
                              <Stack direction="row" spacing={0.5}>
                                <Chip label="Kadastr / MVD" color="secondary" size="small" sx={{ fontSize: '0.72rem', height: 20 }} />
                                <Chip label="5x Parallel" size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 20 }} />
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Barcha <strong>{streets.length} ta ko‘cha</strong> TozaMakon kadastr ma’lumotlari bilan yangilanadi.
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              Eng oxirida id: 0 ko‘cha fuzzy biriktiriladi.
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={streets.length > 0 ? `${streets.length} ta ko‘cha tayyor` : 'Kutilmoqda'}
                              color={streets.length > 0 ? 'secondary' : 'default'}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              color="secondary"
                              size="small"
                              startIcon={startingJob ? <CircularProgress size={16} color="inherit" /> : <JobIcon fontSize="small" />}
                              onClick={() => setMahallaConfirmDialogOpen(true)}
                              disabled={startingJob || streets.length === 0}
                              sx={{ borderRadius: 1.8, fontWeight: 700, textTransform: 'none' }}
                            >
                              Boshlash ({streets.length})
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Qator 2: Eski hisobot migratsiyasi */}
                        <TableRow hover>
                          <TableCell sx={{ fontWeight: 700 }}>2</TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                                📦 Eski Hisobot Migratsiyasi
                              </Typography>
                              <Stack direction="row" spacing={0.5}>
                                <Chip label="1-bosqich" color="info" size="small" sx={{ fontSize: '0.72rem', height: 20 }} />
                                <Chip label="Avto ko‘chirish" size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 20 }} />
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Eski hisobotdagi (pa_survey) barcha xonadonlar va ularning oila a’zolarini 2-bosqich tizimiga avtomatik
                              ko‘chiradi.
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              Yangi bazada borlari o‘tkazib yuboriladi (skip).
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label="Xonadon + Oila a‘zolari" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              color="info"
                              size="small"
                              startIcon={startingJob ? <CircularProgress size={16} color="inherit" /> : <SyncIcon fontSize="small" />}
                              onClick={() => setMigrateConfirmDialogOpen(true)}
                              disabled={startingJob}
                              sx={{ borderRadius: 1.8, fontWeight: 700, textTransform: 'none' }}
                            >
                              Ko‘chirish
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Qator 3: Bitta ko'chani tanlab ishlash */}
                        <TableRow hover>
                          <TableCell sx={{ fontWeight: 700 }}>3</TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                📍 Bitta Ko‘cha
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                Tanlangan alohida ko‘cha
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <FormControl fullWidth size="small" sx={{ maxWidth: 360 }}>
                              <InputLabel id="select-street-table-label">Ko‘chani tanlang</InputLabel>
                              <Select
                                labelId="select-street-table-label"
                                value={selectedStreetId}
                                label="Ko‘chani tanlang"
                                onChange={(e) => setSelectedStreetId(e.target.value)}
                              >
                                {streets.map((s) => (
                                  <MenuItem key={s.id} value={s.id}>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                                    >
                                      <span>{s.name}</span>
                                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                        {s.homes_stat_count ? `${s.homes_stat_count} ta uy` : ''}
                                      </Typography>
                                    </Stack>
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            {selectedStreetObj ? (
                              <Chip
                                label={`${selectedStreetObj.homes_stat_count || 0} ta uy`}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            ) : (
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                Tanlanmagan
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<RunJobIcon fontSize="small" />}
                                onClick={() => setStreetConfirmDialogOpen(true)}
                                disabled={!selectedStreetId || startingJob}
                                sx={{ borderRadius: 1.8, fontWeight: 700, textTransform: 'none' }}
                              >
                                Run
                              </Button>
                              <Button
                                variant="outlined"
                                color="inherit"
                                size="small"
                                startIcon={<HomeIcon fontSize="small" />}
                                onClick={() => selectedStreetObj && handleOpenHomesDrawer(selectedStreetObj)}
                                disabled={!selectedStreetObj}
                                sx={{ borderRadius: 1.8, textTransform: 'none' }}
                              >
                                Xonadonlar
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>

                        {/* Qator 4: Excel bo'yicha Oila Importi */}
                        <TableRow hover>
                          <TableCell sx={{ fontWeight: 700 }}>4</TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                📊 Excel Oila Importi
                              </Typography>
                              <Stack direction="row" spacing={0.5}>
                                <Chip label="Yangi" color="success" size="small" sx={{ fontSize: '0.72rem', height: 20 }} />
                                <Chip
                                  label="Guvohnomali Bolalar"
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.72rem', height: 20 }}
                                />
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Excel fayldagi <strong>oila raqami</strong> bo‘yicha guruhlangan fuqarolarni mahallaning mavjud kadastrli
                              bo‘sh xonadonlariga ketma-ket joylashtiradi (max 12 kishi).
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              Shablon format: ФИШ, oila raqami, Pasport seriyasi, ПИНФЛ
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              color="success"
                              size="small"
                              startIcon={<FileDownloadIcon fontSize="small" />}
                              onClick={handleDownloadExcelTemplate}
                              sx={{ borderRadius: 1.8, textTransform: 'none', fontWeight: 600 }}
                            >
                              Shablon (.xlsx)
                            </Button>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<UploadFileIcon fontSize="small" />}
                              onClick={() => setExcelImportDialogOpen(true)}
                              disabled={startingJob}
                              sx={{ borderRadius: 1.8, fontWeight: 700, textTransform: 'none' }}
                            >
                              Excel Yuklash
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
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
              {/* ── KUNLIK VA SANALAR BO'YICHA FILTR PANELI ── */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.8,
                  mb: 2.5,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.6) : alpha(theme.palette.primary.main, 0.02)
                }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}
                >
                  {/* Chap tomon: Tezkor sana tugmalari */}
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mr: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        Sana filtri:
                      </Typography>
                    </Stack>

                    {/* Barchasi */}
                    <Chip
                      label={`Barchasi (${totalInDb || allJobs.length})`}
                      color={selectedJobDate === 'all' && !customJobDate ? 'primary' : 'default'}
                      variant={selectedJobDate === 'all' && !customJobDate ? 'filled' : 'outlined'}
                      onClick={() => {
                        setSelectedJobDate('all');
                        setCustomJobDate('');
                      }}
                      clickable
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    />

                    {/* Bugun */}
                    <Chip
                      label={`Bugun (${dateStats[todayDateStr] || 0})`}
                      color={selectedJobDate === 'today' || (selectedJobDate === todayDateStr && !customJobDate) ? 'primary' : 'default'}
                      variant={selectedJobDate === 'today' || (selectedJobDate === todayDateStr && !customJobDate) ? 'filled' : 'outlined'}
                      onClick={() => {
                        setSelectedJobDate('today');
                        setCustomJobDate('');
                      }}
                      clickable
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    />

                    {/* Kecha */}
                    <Chip
                      label={`Kecha (${dateStats[yesterdayDateStr] || 0})`}
                      color={selectedJobDate === 'yesterday' || (selectedJobDate === yesterdayDateStr && !customJobDate) ? 'primary' : 'default'}
                      variant={selectedJobDate === 'yesterday' || (selectedJobDate === yesterdayDateStr && !customJobDate) ? 'filled' : 'outlined'}
                      onClick={() => {
                        setSelectedJobDate('yesterday');
                        setCustomJobDate('');
                      }}
                      clickable
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    />

                    {/* Mavjud boshqa kunlar */}
                    {availableOtherDates.slice(0, 3).map((d) => (
                      <Chip
                        key={d}
                        label={`${d.slice(5)} (${dateStats[d]})`}
                        color={selectedJobDate === d ? 'primary' : 'default'}
                        variant={selectedJobDate === d ? 'filled' : 'outlined'}
                        onClick={() => {
                          setSelectedJobDate(d);
                          setCustomJobDate(d);
                        }}
                        clickable
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                      />
                    ))}

                    {/* Kalendar / Erkin sana tanlash */}
                    <TextField
                      type="date"
                      size="small"
                      value={customJobDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomJobDate(val);
                        if (val) {
                          setSelectedJobDate(val);
                        } else {
                          setSelectedJobDate('all');
                        }
                      }}
                      slotProps={{
                        input: {
                          sx: {
                            height: 32,
                            fontSize: '0.8rem',
                            borderRadius: 2,
                            bgcolor: theme.palette.background.paper
                          }
                        }
                      }}
                    />

                    {(selectedJobDate !== 'all' || customJobDate) && (
                      <Tooltip title="Filtrni tozalash (Barchasini ko'rsatish)">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedJobDate('all');
                            setCustomJobDate('');
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <ClearFilterIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>

                  {/* O'ng tomon: Holat va Qidiruv */}
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    {/* Holat filtri */}
                    <Select
                      size="small"
                      value={jobStatusFilter}
                      onChange={(e) => setJobStatusFilter(e.target.value)}
                      sx={{
                        height: 34,
                        borderRadius: 2,
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        bgcolor: theme.palette.background.paper
                      }}
                    >
                      <MenuItem value="all">Barcha holatlar</MenuItem>
                      <MenuItem value="RUNNING">⚡ Jarayonda</MenuItem>
                      <MenuItem value="COMPLETED">✅ Yakunlangan</MenuItem>
                      <MenuItem value="PENDING">⏳ Boshlashga tayyor</MenuItem>
                      <MenuItem value="FAILED">❌ Xato / Bekor qilingan</MenuItem>
                    </Select>

                    {/* Mahalla / Ko'cha qidirish */}
                    <TextField
                      size="small"
                      placeholder="Mahalla yoki ko‘cha..."
                      value={jobSearchQuery}
                      onChange={(e) => setJobSearchQuery(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                            </InputAdornment>
                          ),
                          sx: {
                            height: 34,
                            fontSize: '0.82rem',
                            borderRadius: 2,
                            bgcolor: theme.palette.background.paper,
                            minWidth: 180
                          }
                        }
                      }}
                    />
                  </Stack>
                </Stack>
              </Paper>

              {filteredJobs.length === 0 ? (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <SyncIcon sx={{ fontSize: 44, color: theme.palette.text.secondary, opacity: 0.5, mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    {selectedJobDate !== 'all' || customJobDate || jobSearchQuery || jobStatusFilter !== 'all'
                      ? 'Tanlangan sana yoki filtr bo‘yicha vazifalar topilmadi'
                      : 'Hozirda faol sinxronizatsiya joblari yo‘q'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.5 }}>
                    {selectedJobDate !== 'all' || customJobDate || jobSearchQuery || jobStatusFilter !== 'all'
                      ? 'Boshqa sanani tanlang yoki filtrni tozalang.'
                      : '2-bosqichdagi "Butun Mahallani Boshlash" tugmasini bosib ishga tushirishingiz mumkin.'}
                  </Typography>
                  {(selectedJobDate !== 'all' || customJobDate || jobSearchQuery || jobStatusFilter !== 'all') && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedJobDate('all');
                        setCustomJobDate('');
                        setJobSearchQuery('');
                        setJobStatusFilter('all');
                      }}
                      sx={{ mt: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                      Barcha joblarni ko‘rsatish
                    </Button>
                  )}
                </Box>
              ) : (
                <>
                  {/* ── JADVAL/KARTA TEPASIDAGI STATISTIKA BLOKI ── */}
                  <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                    {/* 1. Jarayonda */}
                    <Grid size={{ xs: 6, sm: 3, md: 2.4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: jobsStats.running > 0 ? theme.palette.primary.main : theme.palette.divider,
                          bgcolor: alpha(
                            theme.palette.primary.main,
                            jobsStats.running > 0 ? (theme.palette.mode === 'dark' ? 0.15 : 0.06) : 0.02
                          )
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                          <CircularProgress
                            size={12}
                            thickness={6}
                            sx={{
                              color: theme.palette.primary.main,
                              display: jobsStats.running > 0 ? 'inline-block' : 'none'
                            }}
                          />
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                            Jarayonda
                          </Typography>
                        </Stack>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                          {jobsStats.running}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* 2. Yakunlandi */}
                    <Grid size={{ xs: 6, sm: 3, md: 2.4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.12 : 0.04)
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary, fontWeight: 700, display: 'block', mb: 0.5 }}
                        >
                          Yakunlandi
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.success.main }}>
                          {jobsStats.completed}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* 3. Xatolar / Bekor qilingan */}
                    <Grid size={{ xs: 6, sm: 3, md: 2.4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: jobsStats.failed > 0 ? theme.palette.error.main : theme.palette.divider,
                          bgcolor: alpha(
                            theme.palette.error.main,
                            jobsStats.failed > 0 ? (theme.palette.mode === 'dark' ? 0.12 : 0.04) : 0.02
                          )
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary, fontWeight: 700, display: 'block', mb: 0.5 }}
                        >
                          Xato / To‘xtatilgan
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{ fontWeight: 800, color: jobsStats.failed > 0 ? theme.palette.error.main : theme.palette.text.primary }}
                        >
                          {jobsStats.failed + jobsStats.cancelled}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* 4. Yangilangan xonadonlar */}
                    <Grid size={{ xs: 6, sm: 3, md: 2.4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.12 : 0.04)
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary, fontWeight: 700, display: 'block', mb: 0.5 }}
                        >
                          Yangilangan xonadon
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.secondary.main }}>
                          {jobsStats.totalHomesUpdated}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* 5. Jami vazifalar (Jobs) */}
                    <Grid size={{ xs: 12, sm: 12, md: 2.4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          bgcolor: theme.palette.background.default
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary, fontWeight: 700, display: 'block', mb: 0.5 }}
                        >
                          Jami vazifalar (Job)
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>
                          {jobsStats.total}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* ── TUMANLAR KESIMIDA JOBLAR MONITORI (PACKS -> ITEMS KATALOG) ── */}
                  {!selectedMonitorDistrictId ? (
                    /* 1-DARAJA: TUMANLAR PACHKALARI (PACKS VIEW) */
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1.5, fontWeight: 600 }}>
                        Tumanlar pachkalari ro‘yxati (Ochish uchun ustiga bosing):
                      </Typography>
                      <Grid container spacing={2}>
                        {jobsByDistrict.map((districtGroup) => {
                          const s = districtGroup.stats;
                          const isAnyRunning = s.running > 0;

                          return (
                            <Grid size={{ xs: 12, md: 6 }} key={districtGroup.areaId}>
                              <Paper
                                elevation={0}
                                onClick={() => setSelectedMonitorDistrictId(districtGroup.areaId)}
                                sx={{
                                  p: 2.5,
                                  borderRadius: 3,
                                  border: '1.5px solid',
                                  borderColor: isAnyRunning ? theme.palette.primary.main : theme.palette.divider,
                                  bgcolor: theme.palette.background.paper,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.08)',
                                    borderColor: theme.palette.primary.main
                                  }
                                }}
                              >
                                {/* Card Header */}
                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                    <FolderIcon sx={{ color: theme.palette.primary.main, fontSize: 26 }} />
                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                      {districtGroup.districtName}
                                    </Typography>
                                    <Chip
                                      label={`ID: ${districtGroup.areaId}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontWeight: 600, fontSize: '0.72rem', height: 22 }}
                                    />
                                  </Stack>
                                  <Tooltip title="Tuman nomini tahrirlash">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingDistrictId(districtGroup.areaId);
                                        setEditingDistrictName(districtGroup.districtName);
                                      }}
                                      sx={{ p: 0.5, color: theme.palette.text.secondary }}
                                    >
                                      <EditIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>

                                {/* Progress bar */}
                                <Box sx={{ mb: 1.5 }}>
                                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                                      Xonadonlar: {s.processedHomes} / {s.totalHomes}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                      {s.percent}%
                                    </Typography>
                                  </Stack>
                                  <LinearProgress variant="determinate" value={s.percent} sx={{ height: 7, borderRadius: 3.5 }} />
                                </Box>

                                {/* Chips */}
                                <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
                                  {s.running > 0 && (
                                    <Chip
                                      size="small"
                                      color="primary"
                                      icon={<CircularProgress size={12} thickness={6} color="inherit" />}
                                      label={`${s.running} ta jarayonda`}
                                      sx={{ fontWeight: 700 }}
                                    />
                                  )}
                                  {s.pending > 0 && (
                                    <Chip
                                      size="small"
                                      color="warning"
                                      variant="outlined"
                                      icon={<PlayArrowIcon sx={{ fontSize: '14px !important' }} />}
                                      label={`${s.pending} ta tayyor (Run)`}
                                      sx={{ fontWeight: 700 }}
                                    />
                                  )}
                                  <Chip size="small" variant="outlined" label={`Jami: ${s.totalJobs} ta job`} sx={{ fontWeight: 600 }} />
                                  <Chip
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    icon={<SuccessIcon sx={{ fontSize: '14px !important' }} />}
                                    label={`Yangilandi: ${s.successHomes}`}
                                    sx={{ fontWeight: 600 }}
                                  />
                                  {s.familyMembers > 0 && (
                                    <Chip
                                      size="small"
                                      color="secondary"
                                      variant="outlined"
                                      icon={<FamilyIcon sx={{ fontSize: '14px !important' }} />}
                                      label={`Oila: ${s.familyMembers}`}
                                      sx={{ fontWeight: 600 }}
                                    />
                                  )}
                                  {s.failed > 0 && <Chip size="small" color="error" label={`Xato: ${s.failed}`} sx={{ fontWeight: 700 }} />}
                                </Stack>

                                {/* Action Button */}
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  color="primary"
                                  endIcon={<ArrowForwardIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMonitorDistrictId(districtGroup.areaId);
                                  }}
                                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                >
                                  Pachkani ochish (Joblar jadvali) ➔
                                </Button>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  ) : (
                    /* 2-DARAJA: TANLANGAN TUMAN JOBLARI JADVALI (ITEMS VIEW) */
                    (() => {
                      const currentGroup = jobsByDistrict.find((g) => g.areaId === selectedMonitorDistrictId) || jobsByDistrict[0];
                      if (!currentGroup) {
                        return (
                          <Box sx={{ py: 3, textAlign: 'center' }}>
                            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                              Tanlangan tuman topilmadi yoki unda joblar yo‘q.
                            </Typography>
                            <Button
                              variant="outlined"
                              startIcon={<ArrowBackIcon />}
                              onClick={() => setSelectedMonitorDistrictId(null)}
                              sx={{ mt: 1, borderRadius: 2, textTransform: 'none' }}
                            >
                              Barcha tumanlar pachkalariga qaytish
                            </Button>
                          </Box>
                        );
                      }
                      const s = currentGroup.stats;

                      return (
                        <Box>
                          {/* Top Breadcrumb & District Info Bar */}
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              mb: 2,
                              borderRadius: 2.5,
                              border: '1px solid',
                              borderColor: theme.palette.divider,
                              bgcolor: alpha(theme.palette.primary.main, 0.03)
                            }}
                          >
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              spacing={1.5}
                              sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
                            >
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="inherit"
                                  startIcon={<ArrowBackIcon />}
                                  onClick={() => setSelectedMonitorDistrictId(null)}
                                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                >
                                  Barcha tumanlar pachkalari
                                </Button>
                                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                                <FolderIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                  {currentGroup.districtName}
                                </Typography>
                                <Chip
                                  label={`ID: ${currentGroup.areaId}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontWeight: 600, height: 22 }}
                                />
                                <Tooltip title="Tuman nomini tahrirlash">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setEditingDistrictId(currentGroup.areaId);
                                      setEditingDistrictName(currentGroup.districtName);
                                    }}
                                  >
                                    <EditIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>

                              {/* Quick District Badges */}
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                {s.pending > 0 && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={startingAllJobs ? <CircularProgress size={12} color="inherit" /> : <PlayArrowIcon />}
                                    onClick={handleStartAllPendingJobs}
                                    disabled={startingAllJobs}
                                    sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2, mr: 0.5 }}
                                  >
                                    ▶️ Barchasini Boshlash ({s.pending} ta)
                                  </Button>
                                )}
                                {s.pending > 0 && (
                                  <Chip
                                    size="small"
                                    color="warning"
                                    label={`${s.pending} ta tayyor`}
                                    icon={<PlayArrowIcon sx={{ fontSize: '14px !important' }} />}
                                    sx={{ fontWeight: 700 }}
                                  />
                                )}
                                {s.running > 0 && (
                                  <Chip
                                    size="small"
                                    color="primary"
                                    label={`${s.running} ta jarayonda`}
                                    icon={<CircularProgress size={12} thickness={6} color="inherit" />}
                                    sx={{ fontWeight: 700 }}
                                  />
                                )}
                                <Chip size="small" variant="outlined" label={`Jami: ${s.totalJobs} ta job`} sx={{ fontWeight: 600 }} />
                                <Chip
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  label={`Yangilandi: ${s.successHomes}`}
                                  sx={{ fontWeight: 600 }}
                                />
                                {s.familyMembers > 0 && (
                                  <Chip
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                    label={`Oila: ${s.familyMembers}`}
                                    sx={{ fontWeight: 600 }}
                                  />
                                )}
                                {s.failed > 0 && <Chip size="small" color="error" label={`Xato: ${s.failed}`} sx={{ fontWeight: 700 }} />}
                              </Stack>
                            </Stack>
                          </Paper>

                          {/* Joblar Jadvali (Table View) */}
                          <Paper
                            elevation={0}
                            sx={{ border: '1px solid', borderColor: theme.palette.divider, borderRadius: 2.5, overflow: 'hidden' }}
                          >
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Vazifa (Job)</TableCell>
                                    <TableCell sx={{ fontWeight: 700, width: 120 }}>Holat</TableCell>
                                    <TableCell sx={{ fontWeight: 700, width: 200 }}>Progress</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                                      Yangilandi
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                                      Oila
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                                      Skip
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                                      Kadastr yo‘q
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                                      Xatolar
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, width: 110 }}>
                                      Amallar
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {currentGroup.jobs.map((job) => {
                                    const isRunning = job.status === 'RUNNING';
                                    const percent = job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;

                                    return (
                                      <TableRow key={job.id} hover>
                                        <TableCell>
                                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {job.jobType === 'excel_family_import'
                                              ? `📊 Excel Oila Importi (${job.mahallaName || 'Mahalla'})`
                                              : job.jobType === 'migrate_old_survey'
                                                ? `📦 Eski hisobot (${job.mahallaName || 'Mahalla'})`
                                                : job.jobType === 'mahalla'
                                                  ? `🏡 ${job.mahallaName || 'Mahalla'}`
                                                  : `📍 ${job.streetName || 'Ko‘cha'}`}
                                          </Typography>
                                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                                            {(() => {
                                              const jobDate = new Date(job.startTime);
                                              const isToday = jobDate.toDateString() === new Date().toDateString();
                                              const timeStr = jobDate.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
                                              const dateStr = `${jobDate.getDate().toString().padStart(2, '0')}.${(jobDate.getMonth() + 1).toString().padStart(2, '0')}.${jobDate.getFullYear()}`;
                                              return isToday ? `Bugun, ${timeStr}` : `${dateStr}, ${timeStr}`;
                                            })()}
                                            {job.jobType === 'mahalla' && job.currentStreetName ? ` • ${job.currentStreetName}` : ''}
                                          </Typography>
                                        </TableCell>

                                        <TableCell>
                                          <Chip
                                            label={
                                              job.status === 'RUNNING'
                                                ? 'Jarayonda'
                                                : job.status === 'PENDING'
                                                  ? 'Boshlashga tayyor'
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
                                                : job.status === 'PENDING'
                                                  ? 'warning'
                                                  : job.status === 'COMPLETED'
                                                    ? 'success'
                                                    : job.status === 'CANCELLED'
                                                      ? 'default'
                                                      : 'error'
                                            }
                                            icon={job.status === 'PENDING' ? <PlayArrowIcon sx={{ fontSize: '13px !important' }} /> : undefined}
                                            sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                                          />
                                        </TableCell>

                                        <TableCell>
                                          <Stack spacing={0.5}>
                                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
                                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                {job.processed} / {job.total}
                                              </Typography>
                                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                {percent}%
                                              </Typography>
                                            </Stack>
                                            <LinearProgress variant="determinate" value={percent} sx={{ height: 6, borderRadius: 3 }} />
                                          </Stack>
                                        </TableCell>

                                        <TableCell align="center">
                                          <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                            {job.success}
                                          </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                                            {job.familyMembersAdded || 0}
                                          </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                          <Typography variant="body2" sx={{ color: theme.palette.info.main }}>
                                            {job.skipped}
                                          </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                          <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>
                                            {job.noCadastre}
                                          </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                          {job.failed > 0 ? (
                                            <Button
                                              size="small"
                                              color="error"
                                              variant="text"
                                              onClick={() => handleOpenErrors(job)}
                                              sx={{ fontWeight: 700, minWidth: 32, p: 0.2 }}
                                            >
                                              {job.failed} ta
                                            </Button>
                                          ) : (
                                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                              0
                                            </Typography>
                                          )}
                                        </TableCell>

                                        <TableCell align="right">
                                          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                                            {job.status === 'PENDING' && (
                                              <Tooltip title="Ishga tushirish (Run)">
                                                <Button
                                                  size="small"
                                                  variant="contained"
                                                  color="success"
                                                  startIcon={
                                                    startingJobId === job.id ? <CircularProgress size={12} color="inherit" /> : <PlayArrowIcon />
                                                  }
                                                  onClick={() => handleStartJob(job.id)}
                                                  disabled={startingJobId === job.id}
                                                  sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    py: 0.2,
                                                    px: 1,
                                                    minWidth: 'auto',
                                                    fontSize: '0.75rem',
                                                    borderRadius: 1.5
                                                  }}
                                                >
                                                  Run
                                                </Button>
                                              </Tooltip>
                                            )}
                                            {job.errors && job.errors.length > 0 && (
                                              <Tooltip title="Xatolar jurnali">
                                                <IconButton size="small" color="error" onClick={() => handleOpenErrors(job)}>
                                                  <WarningIcon fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                            )}
                                            {isRunning && (
                                              <Tooltip title="To‘xtatish">
                                                <IconButton size="small" color="error" onClick={() => handleCancelJob(job.id)}>
                                                  <StopIcon fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                            )}
                                            <Tooltip title="O‘chirish">
                                              <IconButton size="small" color="default" onClick={() => handleDeleteJob(job.id)}>
                                                <DeleteOutlineIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          </Stack>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Paper>
                        </Box>
                      );
                    })()
                  )}
                </>
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
                          <TableCell align="center" sx={{ fontWeight: 700, width: 45 }}>
                            №
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Ko‘cha nomi</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Xonadonlar
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Hovli
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Amal
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {streets.map((s, idx) => (
                          <TableRow key={s.id || idx} hover>
                            <TableCell align="center">{idx + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {s.name}{' '}
                              {Number(s.id) === 0 ? (
                                <Chip label="id: 0 (Noma’lum)" size="small" color="warning" sx={{ ml: 1, height: 20 }} />
                              ) : (
                                ''
                              )}
                            </TableCell>
                            <TableCell align="center">{s.homes_stat_count || '—'}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                              {s.yard_count || '—'}
                            </TableCell>
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
        </Box>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── ONLINE MAHALLA HISOBOTLARI (SURVEY HOMES) REJIMI ── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeView === 'report' && (
        <Box>
          {/* ── Level 1: Tumanlar katalogi (Packs) ── */}
          {!selectedReportDistrictId && (
            <Box>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  mb: 3,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  borderRadius: 3,
                  bgcolor: theme.palette.background.paper
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}
                >
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      📊 Online Mahalla Hisobotlari (Survey Homes)
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                      Tumanlar va mahallalar kesimidagi xonadonlar va aholi soni statistik hisoboti
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => setActiveView('sync')}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  >
                    ⚡ Sinxronizatsiyaga qaytish
                  </Button>
                </Stack>

                {/* Qo'lda to'g'ridan-to'g'ri ko'rish bloki */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    border: '1px dashed',
                    borderColor: theme.palette.primary.main
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    🎯 Istalgan hudud hisobotini tezkor ochish:
                  </Typography>
                  <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 6, sm: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Viloyat (obl_id)"
                        value={manualReportObl}
                        onChange={(e) => setManualReportObl(e.target.value)}
                        slotProps={{ input: { sx: { borderRadius: 2 } } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Tuman (area_id)"
                        value={manualReportArea}
                        onChange={(e) => setManualReportArea(e.target.value)}
                        slotProps={{ input: { sx: { borderRadius: 2 } } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Mahalla ID (district_id)"
                        value={manualReportDist}
                        onChange={(e) => setManualReportDist(e.target.value)}
                        placeholder="1813005"
                        slotProps={{ input: { sx: { borderRadius: 2 } } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={<AssessmentIcon />}
                        onClick={handleLoadManualReport}
                        sx={{ py: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                      >
                        Hisobot jadvalini ko‘rish
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Paper>

              {/* Tumanlar Pachkalari Grid */}
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                📁 Tumanlar katalogi ({savedAccountsByDistrict.length} ta tuman)
              </Typography>

              <Grid container spacing={2}>
                {savedAccountsByDistrict.map((districtGroup) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={districtGroup.areaId}>
                    <Paper
                      elevation={0}
                      onClick={() => setSelectedReportDistrictId(districtGroup.areaId)}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: '1.5px solid',
                        borderColor: theme.palette.divider,
                        bgcolor: theme.palette.background.paper,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.08)',
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <FolderIcon sx={{ color: theme.palette.primary.main, fontSize: 26 }} />
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {districtGroup.districtName}
                          </Typography>
                        </Stack>
                        <Chip label={`ID: ${districtGroup.areaId}`} size="small" variant="outlined" sx={{ fontWeight: 600, height: 22 }} />
                      </Stack>

                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Ushbu tumanda <strong>{districtGroup.accounts.length} ta</strong> mahalla hisobi saqlangan.
                      </Typography>

                      <Stack direction="row" spacing={0.6} sx={{ flexWrap: 'wrap', gap: 0.6, mb: 2 }}>
                        {districtGroup.accounts.slice(0, 3).map((acc) => (
                          <Chip
                            key={acc.district_id}
                            size="small"
                            label={acc.mahalla_name}
                            variant="outlined"
                            sx={{ fontSize: '0.72rem' }}
                          />
                        ))}
                        {districtGroup.accounts.length > 3 && (
                          <Chip size="small" label={`+${districtGroup.accounts.length - 3} ta`} sx={{ fontSize: '0.72rem' }} />
                        )}
                      </Stack>

                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        endIcon={<ArrowForwardIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReportDistrictId(districtGroup.areaId);
                        }}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                      >
                        Mahallalarni ko‘rish ➔
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* ── Level 2: Tanlangan Tuman Ichidagi Mahallalar (Items) ── */}
          {selectedReportDistrictId && !selectedReportMahalla && (
            <Box>
              {(() => {
                const currentDistrict = savedAccountsByDistrict.find((d) => d.areaId === selectedReportDistrictId) || {
                  areaId: selectedReportDistrictId,
                  districtName: districtNames[selectedReportDistrictId] || `Tuman #${selectedReportDistrictId}`,
                  accounts: []
                };

                return (
                  <Box>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 3,
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        bgcolor: theme.palette.background.paper
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
                      >
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => setSelectedReportDistrictId(null)}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                          >
                            Tumanlar katalogi
                          </Button>
                          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                          <FolderIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                          <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            {currentDistrict.districtName}
                          </Typography>
                          <Chip
                            label={`ID: ${currentDistrict.areaId}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, height: 22 }}
                          />
                        </Stack>
                      </Stack>
                    </Paper>

                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                      🏡 Mahallalar ro‘yxati ({currentDistrict.accounts.length} ta)
                    </Typography>

                    {currentDistrict.accounts.length === 0 ? (
                      <Paper
                        elevation={0}
                        sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: theme.palette.divider, borderRadius: 3 }}
                      >
                        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                          Ushbu tumanga tegishli saqlangan mahallalar topilmadi.
                        </Typography>
                        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setSelectedReportDistrictId(null)}>
                          Orqaga qaytish
                        </Button>
                      </Paper>
                    ) : (
                      <Grid container spacing={2}>
                        {currentDistrict.accounts.map((acc) => (
                          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={acc.district_id}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2.5,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: theme.palette.divider,
                                bgcolor: theme.palette.background.paper,
                                transition: 'all 0.2s',
                                '&:hover': { borderColor: theme.palette.primary.main, boxShadow: 1 }
                              }}
                            >
                              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                                🏡 {acc.mahalla_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1.5 }}>
                                Mahalla ID: <strong>{acc.district_id}</strong>
                                {acc.full_name ? ` • ${acc.full_name}` : ''}
                              </Typography>

                              <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                startIcon={<AssessmentIcon />}
                                onClick={() => handleOpenMahallaReport(acc)}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                              >
                                Hisobot jadvalini ochish
                              </Button>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                );
              })()}
            </Box>
          )}

          {/* ── Level 3: Tanlangan Mahalla Ko'chalar Hisoboti (The Exact Screenshot Table!) ── */}
          {selectedReportMahalla && (
            <Box>
              {/* Navigation & Toolbar Header */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  mb: 2.5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  bgcolor: theme.palette.background.paper
                }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  sx={{ alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', mb: 2 }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => setSelectedReportMahalla(null)}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                      Mahallalar ro‘yxatiga qaytish
                    </Button>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      {selectedReportMahalla.mahalla_name}
                    </Typography>
                    <Chip label={`ID: ${selectedReportMahalla.district_id}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<RefreshIcon />}
                      onClick={() => handleOpenMahallaReport(selectedReportMahalla)}
                      disabled={loadingReport}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                      Yangilash
                    </Button>

                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<FileDownloadIcon />}
                      onClick={handleExportReportExcel}
                      disabled={reportStreets.length === 0}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                      Excel yuklab olish
                    </Button>

                    <Tooltip title="Online-Mahalla rasmiy portalida ochish">
                      <IconButton
                        size="small"
                        color="primary"
                        component="a"
                        href={`https://online-mahalla.uz/tables/survey_homes?_level=4&obl_id=${selectedReportMahalla.obl_id || oblId || '18'}&area_id=${selectedReportMahalla.area_id || areaId || '1813'}&district_id=${selectedReportMahalla.district_id}&_mid=3548`}
                        target="_blank"
                        rel="noreferrer"
                        sx={{ border: '1px solid', borderColor: theme.palette.divider, borderRadius: 2 }}
                      >
                        <ExternalLinkIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>

                {/* Qidiruv */}
                <TextField
                  size="small"
                  placeholder="Ko‘cha nomini qidirish..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2, maxWidth: 320 }
                    }
                  }}
                />
              </Paper>

              {/* Loading Spinner */}
              {loadingReport ? (
                <Paper
                  elevation={0}
                  sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: theme.palette.divider, borderRadius: 3 }}
                >
                  <CircularProgress size={36} sx={{ mb: 1.5 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Online-Mahalladan hisobot ma’lumotlari yuklanmoqda...
                  </Typography>
                </Paper>
              ) : (
                /* ── THE EXACT TABLE FROM THE SCREENSHOT ── */
                <Paper
                  elevation={0}
                  sx={{ border: '1px solid', borderColor: theme.palette.divider, borderRadius: 2.5, overflow: 'hidden' }}
                >
                  <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
                    <Table size="small" stickyHeader sx={{ minWidth: 1050 }}>
                      <TableHead>
                        {/* 1-Qator */}
                        <TableRow>
                          <TableCell
                            rowSpan={2}
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1565c0' : '#1976d2',
                              color: '#fff',
                              fontWeight: 700,
                              borderRight: '1px solid rgba(255,255,255,0.25)',
                              width: 50
                            }}
                          >
                            т/р
                          </TableCell>
                          <TableCell
                            rowSpan={2}
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1565c0' : '#1976d2',
                              color: '#fff',
                              fontWeight: 700,
                              borderRight: '1px solid rgba(255,255,255,0.25)',
                              minWidth: 180
                            }}
                          >
                            Кўча номи
                          </TableCell>
                          <TableCell
                            colSpan={2}
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1565c0' : '#1976d2',
                              color: '#fff',
                              fontWeight: 700,
                              borderRight: '1px solid rgba(255,255,255,0.25)'
                            }}
                          >
                            хонадонлар сони
                          </TableCell>
                          <TableCell
                            colSpan={3}
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1565c0' : '#1976d2',
                              color: '#fff',
                              fontWeight: 700,
                              borderRight: '1px solid rgba(255,255,255,0.25)'
                            }}
                          >
                            шундан
                          </TableCell>
                          <TableCell
                            colSpan={2}
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1565c0' : '#1976d2',
                              color: '#fff',
                              fontWeight: 700,
                              borderRight: '1px solid rgba(255,255,255,0.25)'
                            }}
                          >
                            аҳоли сони
                          </TableCell>
                          <TableCell
                            colSpan={3}
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1565c0' : '#1976d2',
                              color: '#fff',
                              fontWeight: 700,
                              borderRight: '1px solid rgba(255,255,255,0.25)'
                            }}
                          >
                            шундан
                          </TableCell>
                          <TableCell
                            rowSpan={2}
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1565c0' : '#1976d2',
                              color: '#fff',
                              fontWeight: 700,
                              minWidth: 140
                            }}
                          >
                            камчиликлар сони
                          </TableCell>
                        </TableRow>

                        {/* 2-Qator */}
                        <TableRow>
                          <TableCell
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1976d2' : '#2196f3',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '0.74rem',
                              borderRight: '1px solid rgba(255,255,255,0.2)'
                            }}
                          >
                            статистик маълумотлар бўйича
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1976d2' : '#2196f3',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '0.74rem',
                              borderRight: '1px solid rgba(255,255,255,0.2)'
                            }}
                          >
                            ҲЁ томонидан ўрганилган
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1976d2' : '#2196f3',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '0.74rem',
                              borderRight: '1px solid rgba(255,255,255,0.2)'
                            }}
                          >
                            кўп қаватли хонадон
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1976d2' : '#2196f3',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '0.74rem',
                              borderRight: '1px solid rgba(255,255,255,0.2)'
                            }}
                          >
                            ҳовли
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1976d2' : '#2196f3',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '0.74rem',
                              borderRight: '1px solid rgba(255,255,255,0.2)'
                            }}
                          >
                            ётоқхона
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1976d2' : '#2196f3',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '0.74rem',
                              borderRight: '1px solid rgba(255,255,255,0.2)'
                            }}
                          >
                            статистик маълумотлар бўйича
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1976d2' : '#2196f3',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '0.74rem',
                              borderRight: '1px solid rgba(255,255,255,0.2)'
                            }}
                          >
                            ҲЁ томонидан ўрганилган
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1976d2' : '#2196f3',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '0.74rem',
                              borderRight: '1px solid rgba(255,255,255,0.2)'
                            }}
                          >
                            ёшлар
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1976d2' : '#2196f3',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '0.74rem',
                              borderRight: '1px solid rgba(255,255,255,0.2)'
                            }}
                          >
                            аёллар
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              bgcolor: theme.palette.mode === 'dark' ? '#1976d2' : '#2196f3',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '0.74rem',
                              borderRight: '1px solid rgba(255,255,255,0.2)'
                            }}
                          >
                            пенсия ёшидагилар
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {filteredReportStreets.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={13} align="center" sx={{ py: 4, color: theme.palette.text.secondary }}>
                              Ma’lumotlar topilmadi
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredReportStreets.map((row, idx) => (
                            <TableRow
                              key={row.id || idx}
                              hover
                              sx={{ '&:nth-of-type(even)': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}
                            >
                              <TableCell align="center" sx={{ fontWeight: 600 }}>
                                {row._rownum || idx + 1}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>{row.name}</TableCell>
                              <TableCell align="center">{row.homes_stat_count ?? ''}</TableCell>
                              <TableCell align="center">{row.homes_surveyed_count ?? ''}</TableCell>
                              <TableCell align="center">{row.multistory_count ?? ''}</TableCell>
                              <TableCell align="center">{row.yard_count ?? ''}</TableCell>
                              <TableCell align="center">{row.dormitory_count ?? ''}</TableCell>
                              <TableCell align="center">{row.population_stat_count ?? ''}</TableCell>
                              <TableCell align="center">{row.population_surveyed_count ?? ''}</TableCell>
                              <TableCell align="center">{row.youth_count ?? ''}</TableCell>
                              <TableCell align="center">{row.women_count ?? ''}</TableCell>
                              <TableCell align="center">{row.pensioner_count ?? ''}</TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: 700, color: (row.defects_count || 0) > 0 ? theme.palette.error.main : 'inherit' }}
                              >
                                {row.defects_count ?? 0}
                              </TableCell>
                            </TableRow>
                          ))
                        )}

                        {/* ── JAMI (Summary footer row) ── */}
                        {filteredReportStreets.length > 0 && (
                          <TableRow
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              borderTop: '2px solid',
                              borderColor: theme.palette.primary.main
                            }}
                          >
                            <TableCell align="center" sx={{ fontWeight: 800 }}>
                              {reportStreets.length}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 800, textTransform: 'lowercase' }}>жами</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800 }}>
                              {reportTotals.homes_stat_count}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800 }}>
                              {reportTotals.homes_surveyed_count}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800 }}>
                              {reportTotals.multistory_count}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800 }}>
                              {reportTotals.yard_count}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800 }}>
                              {reportTotals.dormitory_count}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800 }}>
                              {reportTotals.population_stat_count}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800 }}>
                              {reportTotals.population_surveyed_count}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800 }}>
                              {reportTotals.youth_count}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800 }}>
                              {reportTotals.women_count}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800 }}>
                              {reportTotals.pensioner_count}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                              {reportTotals.defects_count}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* ── BUTUN MAHALLANI SINXRONLASH TASDIQLASH DIALOGI ── */}
      <Dialog open={mahallaConfirmDialogOpen} onClose={() => setMahallaConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>⚡ Butun Mahallani Sinxronizatsiya Qilish</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Siz <strong>"{userProfile?.mahalla_name || `Mahalla #${districtId}`}"</strong> dagi jami{' '}
            <strong>{streets.length} ta ko‘chani</strong> sinxronizatsiya qilmoqchisiz.
          </Typography>

          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            <strong>Ko‘chalar ketma-ketligi:</strong> Barcha aniq ko‘chalar avval navbatma-navbat to‘liq ishlanadi. Eng oxirida esa{' '}
            <strong>id: 0 (ko‘chasi noma'lum)</strong> xonadonlar bajariladi va fuzzy solishtiruv orqali aniq ko‘chalarga biriktiriladi.
          </Alert>

          <Paper elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: theme.palette.divider, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Mavjud xonadon egalarini o‘tkazib yuborish (Skip):
              </Typography>
              <Chip
                label={skipIfOwnerExists ? 'YOQILGAN' : 'O‘CHIRILGAN'}
                color={skipIfOwnerExists ? 'warning' : 'default'}
                size="small"
                sx={{ fontWeight: 700 }}
              />
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
            Tanlangan <strong>"{userProfile?.mahalla_name || `Mahalla #${districtId}`}"</strong> bo‘yicha eski hisobotdagi (1-bosqich)
            barcha xonadonlar va ularga tegishli aholi yangi xatlov tizimiga ko‘chiriladi.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.08),
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.3),
              borderRadius: 2
            }}
          >
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
              4. <strong>Oila a'zolari</strong>: Yangi ochilgan har bir xonadonga eski hisobotdagi tegishli oila a'zolari birma-bir
              biriktiriladi.
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

      {/* ── EXCEL BO'YICHA OILA IMPORT MODALI ── */}
      <Dialog open={excelImportDialogOpen} onClose={() => !uploadingExcel && setExcelImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.success.main, 0.15),
                color: theme.palette.success.dark,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <UploadFileIcon fontSize="small" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Excel Fayldan Oila Guruhlarini Import Qilish
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
            Mahalla: <strong>"{userProfile?.mahalla_name || `Mahalla #${districtId}`}"</strong>. Faqat kadastri bor mavjud bo‘sh xonadonlar
            ketma-ket to‘ldiriladi. Yangi xonadon ochilmaydi.
          </Typography>

          <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
            <strong>Talablar:</strong> Excel faylda ustunlar quyidagicha bo‘lishi lozim:
            <br />
            1. <code>Аҳолининг ФИШ (тўлиқ)</code>
            <br />
            2. <code>oila raqami</code> (masalan: 600, 601...)
            <br />
            3. <code>Pasport (guvohnoma) seriyasi</code> (masalan: AA8453881, I-SM0296523)
            <br />
            4. <code>ПИНФЛ</code> (14 xonali JSHSHIR — bolalar uchun ham majburiy)
          </Alert>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '2px dashed',
              borderColor: selectedExcelFile ? theme.palette.success.main : theme.palette.divider,
              borderRadius: 2.5,
              textAlign: 'center',
              bgcolor: selectedExcelFile ? alpha(theme.palette.success.main, 0.04) : theme.palette.background.default,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => document.getElementById('excel-file-input')?.click()}
          >
            <input
              id="excel-file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedExcelFile(e.target.files[0]);
                }
              }}
            />

            <UploadFileIcon
              sx={{ fontSize: 44, color: selectedExcelFile ? theme.palette.success.main : theme.palette.text.secondary, mb: 1 }}
            />

            {selectedExcelFile ? (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  {selectedExcelFile.name}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Hajmi: {(selectedExcelFile.size / 1024).toFixed(1)} KB • Boshqa fayl tanlash uchun bosing
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Excel faylni tanlash uchun bu yerga bosing
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Qo‘llab-quvvatlanadi: .xlsx, .xls, .csv
                </Typography>
              </Box>
            )}
          </Paper>

          <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Excel shabloni kerakmi?
            </Typography>
            <Button
              size="small"
              variant="text"
              color="success"
              startIcon={<FileDownloadIcon fontSize="small" />}
              onClick={handleDownloadExcelTemplate}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Namuna shablonni yuklab olish
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={() => setExcelImportDialogOpen(false)} color="inherit" disabled={uploadingExcel}>
            Bekor qilish
          </Button>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={uploadingExcel ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
              onClick={() => handleStartExcelFamilyImport(false)}
              disabled={!selectedExcelFile || uploadingExcel}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              📋 Tayyorlab Qo‘yish (Ready to Start)
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={uploadingExcel ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
              onClick={() => handleStartExcelFamilyImport(true)}
              disabled={!selectedExcelFile || uploadingExcel}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              ⚡ Yuklash va Darhol Boshlash
            </Button>
          </Stack>
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

            <Button
              variant="outlined"
              size="small"
              startIcon={<CopyIcon />}
              onClick={handleCopyErrors}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
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
                  <TableCell align="center" sx={{ fontWeight: 700, width: 45 }}>
                    №
                  </TableCell>
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
                          <TableCell align="center" sx={{ fontWeight: 700, width: 45 }}>
                            №
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Uy</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Kadastr</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Egasi</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>JSHSHIR</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Telefon</TableCell>
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

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── E-IMZO KALITLARINI TANLASH VA KIRISH DIALOGI ── */}
      {/* ─────────────────────────────────────────────────────────── */}
      <Dialog
        open={eimzoDialogOpen}
        onClose={() => !loggingInEimzo && !uploadingKeyLogin && setEimzoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, bgcolor: theme.palette.background.paper }
          }
        }}
      >
        <DialogTitle sx={{ p: 2.5, pb: 1.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <FingerprintIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                E-IMZO Bilan Kirish
              </Typography>
            </Stack>
            <IconButton size="small" onClick={() => setEimzoDialogOpen(false)} disabled={loggingInEimzo || uploadingKeyLogin}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2.5 }}>
          {/* Rejimni tanlash: FileInput orqali yuklash YOKI serverdagi C:\DSKEYS */}
          <Box sx={{ mb: 2.5 }}>
            <ToggleButtonGroup
              value={eimzoDialogTab}
              exclusive
              onChange={(_, val) => val && setEimzoDialogTab(val)}
              fullWidth
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.05),
                p: 0.5,
                borderRadius: 2.5,
                '& .MuiToggleButton-root': {
                  borderRadius: 2,
                  py: 1,
                  fontWeight: 700,
                  textTransform: 'none',
                  border: 'none',
                  '&.Mui-selected': {
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.primary.main,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }
                }
              }}
            >
              <ToggleButton value="upload">
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <UploadFileIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Kalit Faylini Yuklash (.pfx)
                  </Typography>
                </Stack>
              </ToggleButton>
              <ToggleButton value="local">
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <FolderIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Mavjud Kalitlar (C:\DSKEYS)
                  </Typography>
                </Stack>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* ── 1-VARIANT: KALIT FAYLINI BRAUZERDAN YUKLASH ── */}
          {eimzoDialogTab === 'upload' ? (
            <Stack spacing={2}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Kompyuteringizdagi <b>.pfx</b> kalit faylini tanlang va uning parolini kiriting. Server kalitni avtomatik ochadi va yangi
                hisobni bazaga ulaydi.
              </Alert>

              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: uploadedKeyFile ? theme.palette.success.main : theme.palette.divider,
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: uploadedKeyFile
                    ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.15 : 0.04)
                    : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.02),
                  cursor: uploadingKeyLogin ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.05)
                  }
                }}
                onClick={() => !uploadingKeyLogin && document.getElementById('eimzo-key-file-input')?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (uploadingKeyLogin) return;
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const f = e.dataTransfer.files[0];
                    if (f.name.toLowerCase().endsWith('.pfx') || f.name.toLowerCase().endsWith('.key')) {
                      setUploadedKeyFile(f);
                    } else {
                      toast.warning('Faqat .pfx formatdagi elektron kalit fayllari qabul qilinadi');
                    }
                  }
                }}
              >
                <input
                  id="eimzo-key-file-input"
                  type="file"
                  accept=".pfx,.key"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadedKeyFile(e.target.files[0]);
                    }
                  }}
                />
                <UploadFileIcon
                  sx={{
                    fontSize: 48,
                    color: uploadedKeyFile ? theme.palette.success.main : theme.palette.primary.main,
                    mb: 1
                  }}
                />
                {uploadedKeyFile ? (
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      {uploadedKeyFile.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Hajmi: {(uploadedKeyFile.size / 1024).toFixed(1)} KB (Kalit tanlandi)
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedKeyFile(null);
                        }}
                        disabled={uploadingKeyLogin}
                        sx={{ textTransform: 'none', py: 0.2 }}
                      >
                        Boshqa fayl tanlash
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      .pfx kalit faylini shu yerga tashlang yoki bosing
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: 'block' }}>
                      (Fayl serverga yuklanadi va C:\DSKEYS papkasiga avtomatik saqlanadi)
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  type={showUploadKeyPassword ? 'text' : 'password'}
                  label="Kalit Paroli"
                  placeholder="Masalan: 19931414"
                  value={uploadKeyPassword}
                  onChange={(e) => setUploadKeyPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && uploadedKeyFile && uploadKeyPassword.trim() && !uploadingKeyLogin) {
                      handleUploadAndLoginWithEimzo();
                    }
                  }}
                  helperText="Kalit parolini kiriting. Server kalitni avtomatik ochib OnlineMahallaga kiradi."
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowUploadKeyPassword(!showUploadKeyPassword)} edge="end">
                            {showUploadKeyPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2 }
                    }
                  }}
                />
              </Box>

              {uploadingKeyLogin && (
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.3)
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <CircularProgress size={20} color="primary" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Kalit serverga yuklanmoqda va ochilmoqda, iltimos kuting...
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Stack>
          ) : (
            /* ── 2-VARIANT: SERVERDAGI MAVJUD KALITLAR (C:\DSKEYS) ── */
            <Stack spacing={1.5}>
              <Alert severity="info" sx={{ mb: 1.5, borderRadius: 2 }}>
                Serverda (C:\DSKEYS) mavjud elektron kalitlar ro‘yxati. Kalitni tanlab parolini kiriting.
              </Alert>

              {loadingEimzoKeys ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ mt: 1.5, color: theme.palette.text.secondary }}>
                    E-IMZO kalitlari o‘qilmoqda...
                  </Typography>
                </Box>
              ) : eimzoKeys.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <ErrorIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Birorta ham E-IMZO kaliti topilmadi
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                    <code>C:\DSKEYS</code> papkasida .pfx kalit topilmadi. Yuqoridagi <b>Kalit Faylini Yuklash</b> bo‘limidan
                    foydalanishingiz mumkin.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleOpenEimzoDialog}
                    sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
                  >
                    Qayta Qidirish
                  </Button>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary, textTransform: 'uppercase' }}>
                    Mavjud Kalitlar ({eimzoKeys.length} ta):
                  </Typography>
                  {eimzoKeys.map((k) => {
                    const isSelected = selectedEimzoKey?.name === k.name;
                    return (
                      <Paper
                        key={k.name}
                        elevation={0}
                        onClick={() => !loggingInEimzo && setSelectedEimzoKey(k)}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          cursor: loggingInEimzo ? 'default' : 'pointer',
                          border: '2px solid',
                          borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
                          bgcolor: isSelected
                            ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.05)
                            : theme.palette.background.paper,
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: theme.palette.primary.main
                          }
                        }}
                      >
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                          <Box sx={{ mt: 0.3 }}>
                            {isSelected ? (
                              <CheckCircleIcon color="primary" fontSize="small" />
                            ) : (
                              <UncheckedIcon sx={{ color: theme.palette.text.disabled, fontSize: 20 }} />
                            )}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
                              {k.parsedName || k.name}
                            </Typography>
                            {k.pinfl && (
                              <Typography
                                variant="caption"
                                sx={{ display: 'block', color: theme.palette.text.secondary, fontFamily: 'monospace', mt: 0.3 }}
                              >
                                JSHSHIR: {k.pinfl}
                              </Typography>
                            )}
                            <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary, mt: 0.2 }}>
                              Fayl: {k.name}.pfx {k.validTo ? `(Amal qilish muddati: ${k.validTo})` : ''}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    );
                  })}
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="password"
                      label="Kalit Paroli"
                      placeholder="Masalan: 19931414"
                      value={eimzoPassword}
                      onChange={(e) => {
                        setEimzoPassword(e.target.value);
                        localStorage.setItem('online_mahalla_eimzo_password', e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && selectedEimzoKey && !loggingInEimzo) {
                          handleLoginWithEimzo();
                        }
                      }}
                      helperText="Parolni kiritsangiz, dastur E-IMZO darchasini chiqarmasdan o'zi avtomatik kiradi."
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <FingerprintIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 2 }
                        }
                      }}
                    />
                  </Box>
                </Stack>
              )}

              {loggingInEimzo && (
                <Box
                  sx={{
                    mt: 2.5,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.warning.main, 0.3)
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <CircularProgress size={20} color="warning" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      E-IMZO orqali avtorizatsiya jarayoni ketyapti, iltimos kuting...
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, px: 2.5 }}>
          <Button
            variant="outlined"
            onClick={() => setEimzoDialogOpen(false)}
            disabled={loggingInEimzo || uploadingKeyLogin}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Bekor qilish
          </Button>

          {eimzoDialogTab === 'upload' ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={uploadingKeyLogin ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
              onClick={handleUploadAndLoginWithEimzo}
              disabled={uploadingKeyLogin || !uploadedKeyFile || !uploadKeyPassword.trim()}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3 }}
            >
              {uploadingKeyLogin ? 'Yuklanmoqda...' : 'Yuklash va Kirish'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={loggingInEimzo ? <CircularProgress size={16} color="inherit" /> : <FingerprintIcon />}
              onClick={handleLoginWithEimzo}
              disabled={loggingInEimzo || !selectedEimzoKey}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3 }}
            >
              {loggingInEimzo ? 'Kutilmoqda...' : 'Kirish'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Tuman nomini tahrirlash dialogi ── */}
      <Dialog
        open={Boolean(editingDistrictId)}
        onClose={() => setEditingDistrictId(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Tuman nomini belgilash</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            Tuman ID: <strong>{editingDistrictId}</strong>. Monitoring va katalogda ko‘rinadigan tuman nomini kiriting:
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Tuman nomi"
            placeholder="Masalan: Kattaqo‘rg‘on tumani"
            value={editingDistrictName}
            onChange={(e) => setEditingDistrictName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && editingDistrictId) {
                e.preventDefault();
                handleSaveDistrictName(editingDistrictId);
              }
            }}
            slotProps={{
              input: {
                sx: { borderRadius: 2 }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button variant="outlined" onClick={() => setEditingDistrictId(null)} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => editingDistrictId && handleSaveDistrictName(editingDistrictId)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
