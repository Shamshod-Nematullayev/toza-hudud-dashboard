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
  TablePagination,
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
  AccordionDetails,
  Tabs,
  Tab,
  Badge,
  ButtonBase,
  Slider,
  SpeedDialIcon
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
  Clear as ClearFilterIcon,
  SwapHoriz as SwapHorizIcon,
  Check as CheckIcon,
  UnfoldMore as UnfoldMoreIcon,
  UnfoldLess as UnfoldLessIcon,
  Tune as TuneIcon,
  AutoAwesome as AutoAwesomeIcon,
  AccountBalanceWallet as WalletIcon,
  Paid as PaidIcon,
  ReceiptLong as ReceiptIcon,
  MonetizationOn as MonetizationOnIcon,
  History as HistoryIcon,
  Build as BuildIcon,
  Bookmark as BookmarkIcon,
  Save as SaveIcon,
  Psychology as SmartIcon,
  Work as WorkIcon,
  CreditCard as CreditCardIcon,
  BusinessCenter as BusinessCenterIcon,
  School as SchoolIcon,
  LocalGasStation as GasIcon,
  WaterDrop as WaterDropIcon,
  Opacity as OpacityIcon,
  CleaningServices as SewerageIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import api from 'utils/api';
import { buildTranslitRegexSource, createSearchMatcher } from 'utils/translitSearch';
import SmartSurveyHomesDialog from './SmartSurveyHomesDialog';
import { toast } from 'react-toastify';
import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid';

export interface MahallaBillingItem {
  district_id: number | string;
  mahalla_name: string;
  area_id?: number | string;
  area_name?: string;
  obl_id?: number | string;
  status: 'ACTIVE' | 'EXPIRED' | 'ERROR';
  balance: number;
  total_paid: number;
  total_charged: number;
  jobsCount: number;
  totalProcessedHomes: number;
  totalSuccessHomes: number;
  totalFamilyMembers: number;
  updatedAt?: string;
}

export interface BillingSummaryData {
  totalMahallas: number;
  totalPrepaid: number;
  totalDebt: number;
  totalPaid: number;
  totalCharged: number;
  totalJobs: number;
  totalProcessedHomes: number;
}

export interface BillingTransactionItem {
  _id: string;
  district_id: number | string;
  mahalla_name: string;
  area_id?: number | string;
  type: 'PAYMENT' | 'SERVICE_CHARGE';
  amount: number;
  balance_before: number;
  balance_after: number;
  comment?: string;
  createdAt: string;
}

export interface SurveyEmploymentSettings {
  refreshGovDatabases: boolean;
  preserveOfficialSector: boolean;
  kindergartenPercent: number;
  unofficialWorkerPercent: number;
  selfEmployedPercent: number;
  unemployedPercent: number;
  studentPercent: number;
  mode?: 'standard' | 'burgansoy' | string;
  pensionerMode?: '4.2' | '4.7';
  skipWorkingAge?: boolean; // Mehnat yoshidagilarga umuman teginilmaydi
}

export interface SurveySocioEconomicSettings {
  incomeByResidents?: boolean; // Oylik daromad yashovchilar soniga ko'ra (5 gacha: 3-5 mln, 6+: 10 mln dan yuqori)
  preserveExistingIncome?: boolean; // Daromad avval kiritilgan bo'lsa teginilmaydi
  hasDebtPercent: number;
  debtTypes: {
    bankCreditPercent: number;
    microloanPercent: number;
    mortgagePercent: number;
    relativesPercent: number;
    otherPercent: number;
  };
  debtCausesShortage: {
    yesPercent: number;
    noPercent: number;
    partiallyPercent: number;
  };
  overduePaymentPercent: number;
  incomeSources: {
    salaryPercent: number;
    pensionPercent: number;
    businessPercent: number;
    agriculturePercent: number;
    seasonalPercent: number;
    remittancePercent: number;
    otherPercent: number;
  };
  monthlyIncomes: {
    under1mPercent: number;
    from1mTo3mPercent: number;
    from3mTo5mPercent: number;
    from5mTo10mPercent: number;
    above10mPercent: number;
  };
}

export interface SurveyInfrastructureSettings {
  electricityMode?: number;
  gasMode?: number;
  drinkingWaterMode?: number;
  irrigationWaterMode?: number;
  sewerageMode?: number;
  electricity: {
    goodPercent: number;
    satisfactoryPercent: number;
    unsatisfactoryPercent: number;
  };
  gas: {
    naturalPercent: number;
    cylinderPercent: number;
    nonePercent: number;
  };
  drinkingWater: {
    centralPercent: number;
    wellSpringPercent: number;
    deliveredPercent: number;
  };
}

export interface SurveyBusinessWishSettings {
  hasNeedPercent: number; // 0..100 (Masalan 18% ehtiyoji bor, 82% ehtiyoj yo'q)
  directions: {
    servicesPercent: number; // 1: Xizmat ko'rsatish
    onlineBusinessPercent: number; // 2: Onlayn biznes
    productionPercent: number; // 3: Kichik ishlab chiqarish
    agriculturePercent: number; // 4: Qishloq xo'jaligi
  };
  supportTypes: {
    creditPercent: number; // 1: Kredit
    subsidyPercent: number; // 2: Ссуда / Субсидия
    landPercent: number; // 3: Ер майдони
    buildingPercent: number; // 4: Бўш бино-иншоот
    otherPercent: number; // 5: Бошқа
  };
  creditAmounts: {
    under50mPercent: number; // 1: 50 млн. сўмгача
    from50mTo100mPercent: number; // 2: 50 млн сўмдан 100 млн сўмгача
    from100mTo500mPercent: number; // 3: 100 млн сўмдан 500 млн сўмгача
    from500mTo1bPercent: number; // 4: 500 млн сўмдан 1 млрд сўмгача
    above1bPercent: number; // 5: 1 млрд сўмдан юқори
  };
  subsidyTypes: {
    equipmentPercent: number; // 1: асбоб-ускуна харид қилиш учун
    greenhousePercent: number; // 2: иссиқхона барпо этиш учун
    cooperativePercent: number; // 3: кооператив аъзоси бўлиш учун
    otherPercent: number; // 4: бошқалар
  };
}

export interface SurveyEmploymentWishesSettings {
  hasNeedPercent: number; // 0..100 (0% ehtiyoj bor => 100% "Меҳнатга ва касб-ҳунарга бўлган эхтиёж йўқ")
}

export interface SurveyActiveModules {
  employment?: boolean;
  employmentWishes?: boolean;
  businessWishes?: boolean;
  socioEconomic?: boolean;
  infrastructure?: boolean;
}

export interface SurveySettings {
  modules?: SurveyActiveModules;
  employment: SurveyEmploymentSettings;
  employmentWishes?: SurveyEmploymentWishesSettings;
  businessWishes?: SurveyBusinessWishSettings;
  socioEconomic: SurveySocioEconomicSettings;
  infrastructure: SurveyInfrastructureSettings;
}

export interface SurveyPresetItem {
  _id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  districtId?: string | number;
  settings: SurveySettings;
  createdAt?: string;
  updatedAt?: string;
}

type SmartSectionKey = keyof SurveyActiveModules;

const SMART_SECTIONS: Array<{ key: SmartSectionKey; icon: string; title: string }> = [
  { key: 'employment', icon: '💼', title: 'Bandlik va ta’lim' },
  { key: 'employmentWishes', icon: '🛠️', title: 'Kasb-hunar ehtiyoji' },
  { key: 'businessWishes', icon: '🏪', title: 'Tadbirkorlik ehtiyoji' },
  { key: 'socioEconomic', icon: '💰', title: 'Daromad va qarzdorlik' },
  { key: 'infrastructure', icon: '🏠', title: 'Infratuzilma' }
];

const DEFAULT_SMART_SETTINGS: SurveySettings = {
  modules: {
    employment: true,
    employmentWishes: true,
    businessWishes: true,
    socioEconomic: false,
    infrastructure: true
  },
  employment: {
    mode: 'burgansoy',
    refreshGovDatabases: true,
    preserveOfficialSector: true,
    kindergartenPercent: 95,
    unofficialWorkerPercent: 0,
    selfEmployedPercent: 0,
    unemployedPercent: 100,
    studentPercent: 0,
    pensionerMode: '4.2'
  },
  employmentWishes: {
    hasNeedPercent: 0
  },
  businessWishes: {
    hasNeedPercent: 18,
    directions: {
      servicesPercent: 35,
      onlineBusinessPercent: 10,
      productionPercent: 20,
      agriculturePercent: 35
    },
    supportTypes: {
      creditPercent: 65,
      subsidyPercent: 25,
      landPercent: 5,
      buildingPercent: 3,
      otherPercent: 2
    },
    creditAmounts: {
      under50mPercent: 60,
      from50mTo100mPercent: 30,
      from100mTo500mPercent: 8,
      from500mTo1bPercent: 1,
      above1bPercent: 1
    },
    subsidyTypes: {
      equipmentPercent: 65,
      greenhousePercent: 25,
      cooperativePercent: 7,
      otherPercent: 3
    }
  },
  socioEconomic: {
    hasDebtPercent: 15,
    debtTypes: {
      bankCreditPercent: 80,
      microloanPercent: 10,
      mortgagePercent: 5,
      relativesPercent: 3,
      otherPercent: 2
    },
    debtCausesShortage: {
      yesPercent: 15,
      noPercent: 70,
      partiallyPercent: 15
    },
    overduePaymentPercent: 5,
    incomeSources: {
      salaryPercent: 30,
      pensionPercent: 15,
      businessPercent: 5,
      agriculturePercent: 42,
      seasonalPercent: 4,
      remittancePercent: 2,
      otherPercent: 2
    },
    monthlyIncomes: {
      under1mPercent: 5,
      from1mTo3mPercent: 50,
      from3mTo5mPercent: 32,
      from5mTo10mPercent: 10,
      above10mPercent: 3
    }
  },
  infrastructure: {
    electricityMode: 1,
    gasMode: 0,
    drinkingWaterMode: 1,
    irrigationWaterMode: 1,
    sewerageMode: 0,
    electricity: {
      goodPercent: 90,
      satisfactoryPercent: 10,
      unsatisfactoryPercent: 0
    },
    gas: {
      naturalPercent: 70,
      cylinderPercent: 30,
      nonePercent: 0
    },
    drinkingWater: {
      centralPercent: 80,
      wellSpringPercent: 15,
      deliveredPercent: 5
    }
  }
};

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
  jobType: 'mahalla' | 'street' | 'migrate_old_survey' | 'excel_family_import' | 'smart_survey_fill';
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
  surveyHomesUpdated?: number;
  employmentUpdated?: number;
  businessWishesUpdated?: number;
  surveyedHomeIds?: (number | string)[];
  surveyedHomes?: Array<{ id: number | string; homeNum?: string; ownerName?: string; streetName?: string }>;
  reportSummary?: any;
  surveySettings?: any;
  presetName?: string;
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
  area_name?: string;
  token: string;
  refreshToken?: string;
  pinfl?: string;
  full_name?: string;
  phone?: string;
  key_filename?: string;
  key_path?: string;
  balance?: number;
  total_paid?: number;
  total_charged?: number;
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
  const [selectedJobDate, setSelectedJobDate] = useState<string>('today'); // 'all' | 'today' | 'yesterday' | 'YYYY-MM-DD'
  const [customJobDate, setCustomJobDate] = useState<string>('');
  const [jobSearchQuery, setJobSearchQuery] = useState<string>('');
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('all');
  const [dateStats, setDateStats] = useState<Record<string, number>>({});
  const [totalInDb, setTotalInDb] = useState<number>(0);

  // Samarqand viloyati tumanlari standart nomlari
  const DEFAULT_DISTRICT_NAMES: Record<string, string> = {
    '1801': 'Samarqand shahri',
    '1802': 'Kattaqo‘rg‘on shahri',
    '1809': 'Bulung‘ur tumani',
    '1811': 'Jomboy tumani',
    '1812': 'Ishtixon tumani',
    '1813': 'Kattaqo‘rg‘on tumani',
    '1814': 'Qo‘shrabot tumani',
    '1815': 'Oqdaryo tumani',
    '1816': 'Payariq tumani',
    '1817': 'Paxtachi tumani',
    '1818': 'Pastdarg‘om tumani',
    '1819': 'Toyloq tumani',
    '1820': 'Samarqand tumani',
    '1821': 'Nurobod tumani',
    '1822': 'Urgut tumani'
  };

  // Tuman nomlarini erkin kiritish va boshqarish (localStorage)
  const [districtNames, setDistrictNames] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('online_mahalla_district_names');
      const parsed = saved ? JSON.parse(saved) : {};
      return { ...DEFAULT_DISTRICT_NAMES, ...parsed };
    } catch {
      return DEFAULT_DISTRICT_NAMES;
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

  // Hisobot modali
  const [reportDialogOpen, setReportDialogOpen] = useState<boolean>(false);
  const [selectedJobForReport, setSelectedJobForReport] = useState<SyncJobStatus | null>(null);
  const [selectedJobForHomeIds, setSelectedJobForHomeIds] = useState<SyncJobStatus | null>(null);

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

  // ── Sahifa Tablari: Imzolar & Ulanish vs Ishga tushirish vs Monitoring vs Hisobotlar vs Moliya ──
  type MainTab = 'accounts' | 'launch' | 'monitor' | 'report' | 'billing';
  const [activeTab, setActiveTab] = useState<MainTab>('accounts');
  const activeView = activeTab === 'report' ? 'report' : 'sync';
  const setActiveView = (view: 'sync' | 'report') => {
    setActiveTab(view === 'report' ? 'report' : 'launch');
  };

  // ── Imzolar va Mahallalar Katalogi uchun qidiruv va filtrlash holatlari ──
  const [mahallaSearchQuery, setMahallaSearchQuery] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedDistricts, setExpandedDistricts] = useState<Record<string, boolean>>({});

  // ── DataGrid Server Mode holatlari ──
  const [paginatedAccounts, setPaginatedAccounts] = useState<SavedMahallaAccount[]>([]);
  const [totalAccountsCount, setTotalAccountsCount] = useState<number>(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'updatedAt', sort: 'desc' }]);

  const handleToggleDistrict = (areaId: string) => {
    setExpandedDistricts((prev) => ({
      ...prev,
      [areaId]: !prev[areaId]
    }));
  };

  const handleToggleAllDistricts = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    for (const d of savedAccountsByDistrict) {
      next[d.areaId] = expand;
    }
    setExpandedDistricts(next);
  };

  // ── Moliya & Balans (Accounting & Billing) holatlari ──
  const [billingList, setBillingList] = useState<MahallaBillingItem[]>([]);
  const [billingSummary, setBillingSummary] = useState<BillingSummaryData | null>(null);
  const [loadingBilling, setLoadingBilling] = useState<boolean>(false);
  const [billingSearchQuery, setBillingSearchQuery] = useState<string>('');
  const [billingDistrictFilter, setBillingDistrictFilter] = useState<string>('all');
  const [billingStatusFilter, setBillingStatusFilter] = useState<'ALL' | 'DEBT' | 'PREPAID' | 'ZERO'>('ALL');
  const [billingPage, setBillingPage] = useState<number>(0);
  const [billingRowsPerPage, setBillingRowsPerPage] = useState<number>(25);

  // To'lov qabul qilish modali
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [selectedBillingMahalla, setSelectedBillingMahalla] = useState<MahallaBillingItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentComment, setPaymentComment] = useState<string>('');

  // Xizmat kiritish modali
  const [serviceChargeDialogOpen, setServiceChargeDialogOpen] = useState<boolean>(false);
  const [serviceAmount, setServiceAmount] = useState<string>('');
  const [serviceComment, setServiceComment] = useState<string>('');
  const [submittingBilling, setSubmittingBilling] = useState<boolean>(false);

  // Tranzaksiyalar tarixi modali
  const [historyDialogOpen, setHistoryDialogOpen] = useState<boolean>(false);
  const [historyTransactions, setHistoryTransactions] = useState<BillingTransactionItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Tumanlarni avto-nomlash holatlari
  const [autoNamingDistrictId, setAutoNamingDistrictId] = useState<string | null>(null);
  const [autoNamingAll, setAutoNamingAll] = useState<boolean>(false);

  // Moliya ma'lumotlarini yuklash
  const fetchBillingSummary = async () => {
    try {
      setLoadingBilling(true);
      const res = await api.get('/product-admin/online-mahalla/billing/summary');
      if (res.data?.success && res.data?.data) {
        setBillingList(res.data.data.mahallas || []);
        setBillingSummary(res.data.data.summary || null);
      }
    } catch (err: any) {
      console.error('fetchBillingSummary error:', err);
    } finally {
      setLoadingBilling(false);
    }
  };

  // To'lov yoki xizmat kiritish
  const handleSaveBillingTransaction = async (type: 'PAYMENT' | 'SERVICE_CHARGE') => {
    if (!selectedBillingMahalla) return;
    const rawAmount = type === 'PAYMENT' ? paymentAmount : serviceAmount;
    const comment = type === 'PAYMENT' ? paymentComment : serviceComment;
    const numAmount = Number(rawAmount.replace(/[\s,]+/g, ''));

    if (isNaN(numAmount) || numAmount <= 0) {
      toast.warning('Iltimos, to‘g‘ri musbat summa kiriting!');
      return;
    }

    try {
      setSubmittingBilling(true);
      const res = await api.post('/product-admin/online-mahalla/billing/transaction', {
        district_id: selectedBillingMahalla.district_id,
        type,
        amount: numAmount,
        comment: comment.trim()
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Muvaffaqiyatli saqlandi');
        setPaymentDialogOpen(false);
        setServiceChargeDialogOpen(false);
        setPaymentAmount('');
        setPaymentComment('');
        setServiceAmount('');
        setServiceComment('');
        fetchBillingSummary();
        fetchSavedAccounts();
      } else {
        toast.error(res.data?.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Server xatosi');
    } finally {
      setSubmittingBilling(false);
    }
  };

  // Tranzaksiyalar tarixini yuklash
  const handleOpenBillingHistory = async (mahalla: MahallaBillingItem) => {
    setSelectedBillingMahalla(mahalla);
    setHistoryDialogOpen(true);
    try {
      setLoadingHistory(true);
      const res = await api.get('/product-admin/online-mahalla/billing/transactions', {
        params: { district_id: mahalla.district_id, limit: 100 }
      });
      if (res.data?.success) {
        setHistoryTransactions(res.data.data || []);
      }
    } catch (err: any) {
      toast.error('Tranzaksiyalar tarixini yuklashda xatolik');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Tuman nomini avtomatik aniqlash (bitta tuman)
  const handleAutoNameDistrict = async (areaId: string) => {
    if (!areaId) return;
    try {
      setAutoNamingDistrictId(areaId);
      const res = await api.post('/product-admin/online-mahalla/district/auto-name', { area_id: areaId });
      if (res.data?.success && res.data?.districtName) {
        const realName = res.data.districtName;
        const updated = { ...districtNames, [areaId]: realName };
        setDistrictNames(updated);
        localStorage.setItem('online_mahalla_district_names', JSON.stringify(updated));
        toast.success(`Tuman nomi avtomatik aniqlandi: ${realName}`);
        fetchSavedAccounts();
      } else {
        toast.error(res.data?.message || 'Tuman nomini aniqlab bo‘lmadi');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Tuman nomini aniqlashda xatolik');
    } finally {
      setAutoNamingDistrictId(null);
    }
  };

  // Barcha tumanlarni ketma-ket avtomatik nomlash
  const handleAutoNameAllDistricts = async () => {
    try {
      setAutoNamingAll(true);
      let successCount = 0;
      const currentNames = { ...districtNames };

      for (const distGroup of savedAccountsByDistrict) {
        const currentName = currentNames[distGroup.areaId] || '';
        if (!currentName || currentName.startsWith('Tuman #') || currentName.includes('Aniqlanmagan')) {
          try {
            const res = await api.post('/product-admin/online-mahalla/district/auto-name', { area_id: distGroup.areaId });
            if (res.data?.success && res.data?.districtName) {
              currentNames[distGroup.areaId] = res.data.districtName;
              successCount++;
            }
          } catch (_) {}
        }
      }

      setDistrictNames(currentNames);
      localStorage.setItem('online_mahalla_district_names', JSON.stringify(currentNames));
      if (successCount > 0) {
        toast.success(`${successCount} ta tuman nomi avtomatik aniqlandi va saqlandi!`);
      } else {
        toast.info('Barcha tumanlar allaqachon nomlangan');
      }
      fetchSavedAccounts();
    } catch (err: any) {
      toast.error('Barcha tumanlarni nomlashda xatolik');
    } finally {
      setAutoNamingAll(false);
    }
  };

  // Moliyadan to'g'ridan-to'g'ri Job Ishga tushirishga o'tish
  const handleLaunchJobFromBilling = (mahalla: MahallaBillingItem) => {
    const acc = savedAccounts.find((a) => String(a.district_id) === String(mahalla.district_id));
    if (acc) {
      handleSelectAccount(acc);
    } else {
      setDistrictId(String(mahalla.district_id));
    }
    setActiveTab('launch');
    toast.info(`«${mahalla.mahalla_name}» tanlandi. Ishga tushirishga o‘tildi.`);
  };

  // ── SMART XATLOV VA PRESETLAR (FOIZLAR ASOSIDA TO'LDIRISH) ──
  const [surveyPresets, setSurveyPresets] = useState<SurveyPresetItem[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [loadingPresets, setLoadingPresets] = useState<boolean>(false);
  const [smartSettings, setSmartSettings] = useState<SurveySettings>(DEFAULT_SMART_SETTINGS);
  const [smartSection, setSmartSection] = useState<SmartSectionKey>('employment');

  // Bo'limlar menyusidagi qisqa tavsif (bo'lim ochilmasdan asosiy sozlamani ko'rish uchun)
  const smartSectionSummary = useMemo<Record<SmartSectionKey, string>>(() => {
    const emp = smartSettings.employment;
    const se = smartSettings.socioEconomic;
    const inf = smartSettings.infrastructure;
    const yn = (v?: number) => (v === undefined ? '—' : v === 1 ? 'Ha' : 'Yo‘q');
    const pension = (emp.pensionerMode ?? '4.2') === '4.7' ? '4.7 izoh' : '4.2.2';
    return {
      employment: [
        emp.skipWorkingAge
          ? 'Mehnat yoshi: tegilmaydi'
          : emp.mode === 'burgansoy'
            ? 'Burgansoy rejimi'
            : `Norasmiy ${emp.unofficialWorkerPercent}% · Ishsiz ${emp.unemployedPercent}%`,
        `Nafaqa: ${pension}`
      ].join(' · '),
      employmentWishes: `Ehtiyoj bor: ${smartSettings.employmentWishes?.hasNeedPercent ?? 0}%`,
      businessWishes: `Ehtiyoj bor: ${smartSettings.businessWishes?.hasNeedPercent ?? 0}%`,
      socioEconomic: [
        `Qarz: ${se.hasDebtPercent}%`,
        se.incomeByResidents ? 'daromad yashovchilar soniga ko‘ra' : 'daromad foizlar bo‘yicha',
        se.preserveExistingIncome ? 'mavjudi saqlanadi' : ''
      ]
        .filter(Boolean)
        .join(' · '),
      infrastructure: `Elektr ${yn(inf.electricityMode)} · Gaz ${yn(inf.gasMode)} · Suv ${yn(inf.drinkingWaterMode)}`
    };
  }, [smartSettings]);
  const [savePresetDialogOpen, setSavePresetDialogOpen] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newPresetDescription, setNewPresetDescription] = useState<string>('');
  const [savingPreset, setSavingPreset] = useState<boolean>(false);
  const [smartConfirmDialogOpen, setSmartConfirmDialogOpen] = useState<boolean>(false);
  const [smartTargetScope, setSmartTargetScope] = useState<'street' | 'mahalla'>('street');
  const [startingSmartJob, setStartingSmartJob] = useState<boolean>(false);
  const [smartSkipProcessed, setSmartSkipProcessed] = useState<boolean>(true);

  // Shablonlarni serverdan yuklash
  const fetchSurveyPresets = async () => {
    try {
      setLoadingPresets(true);
      const res = await api.get('/product-admin/online-mahalla/survey-presets');
      if (res.data?.success && Array.isArray(res.data?.presets)) {
        setSurveyPresets(res.data.presets);
        const defaultOne = res.data.presets.find((p: any) => p.isDefault) || res.data.presets[0];
        if (defaultOne) {
          setSelectedPresetId((prev) => prev || defaultOne._id);
          setSmartSettings((prev) => (prev === DEFAULT_SMART_SETTINGS ? defaultOne.settings : prev));
        }
      }
    } catch (err: any) {
      console.error('fetchSurveyPresets error:', err);
    } finally {
      setLoadingPresets(false);
    }
  };

  // Presetni tanlaganda sozlamalarni darhol shaklga yuklash
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === 'custom') return;
    const found = surveyPresets.find((p) => p._id === presetId);
    if (found && found.settings) {
      setSmartSettings(JSON.parse(JSON.stringify(found.settings)));
      toast.info(`«${found.name}» shabloni yuklandi`);
    }
  };

  // Yangi shablon sifatida saqlash
  const handleSavePreset = async () => {
    if (!newPresetName.trim()) {
      toast.warning('Iltimos, shablon nomini kiriting!');
      return;
    }
    try {
      setSavingPreset(true);
      const res = await api.post('/product-admin/online-mahalla/survey-presets', {
        name: newPresetName.trim(),
        description: newPresetDescription.trim(),
        settings: smartSettings
      });
      if (res.data?.success && res.data?.preset) {
        toast.success(`«${newPresetName}» shabloni muvaffaqiyatli saqlandi!`);
        setSavePresetDialogOpen(false);
        setNewPresetName('');
        setNewPresetDescription('');
        await fetchSurveyPresets();
        setSelectedPresetId(res.data.preset._id);
      }
    } catch (err: any) {
      toast.error('Shablonni saqlashda xatolik: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingPreset(false);
    }
  };

  // Shablonni o'chirish
  const handleDeletePreset = async (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Haqiqatan ham ushbu shablonni o‘chirmoqchimisiz?')) return;
    try {
      await api.delete(`/product-admin/online-mahalla/survey-presets/${presetId}`);
      toast.info('Shablon o‘chirildi');
      fetchSurveyPresets();
    } catch (err: any) {
      toast.error('O‘chirishda xatolik: ' + (err.response?.data?.message || err.message));
    }
  };

  // Smart Xatlov jobini ishga tushirish (Ko'cha yoki Mahalla)
  const handleStartSmartSurveyJob = async () => {
    try {
      setStartingSmartJob(true);
      setSmartConfirmDialogOpen(false);
      const activePreset = surveyPresets.find((p) => p._id === selectedPresetId);
      const endpoint =
        smartTargetScope === 'street'
          ? '/product-admin/online-mahalla/jobs/smart-survey/street'
          : '/product-admin/online-mahalla/jobs/smart-survey/mahalla';

      const payload: any = {
        obl_id: oblId,
        area_id: areaId,
        district_id: districtId,
        mahalla_name: userProfile?.mahalla_name,
        settings: smartSettings,
        preset_name: activePreset?.name || 'Maxsus sozlama',
        skip_processed: smartSkipProcessed
      };

      if (smartTargetScope === 'street') {
        payload.street_id = selectedStreetId;
        payload.street_name = selectedStreetObj?.name;
      }

      const res = await api.post(endpoint, payload, {
        headers: { 'x-online-mahalla-token': token.trim() }
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Smart Xatlov jobi muvaffaqiyatli ishga tushirildi!');
        setActiveTab('monitor');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Jobni ishga tushirishda xatolik');
    } finally {
      setStartingSmartJob(false);
    }
  };

  // Filtrlangan moliya ro'yxati
  const filteredBillingList = useMemo(() => {
    const q = billingSearchQuery.trim();
    const match = createSearchMatcher(q);
    return billingList.filter((item) => {
      if (billingDistrictFilter !== 'all' && String(item.area_id) !== String(billingDistrictFilter)) {
        return false;
      }
      if (billingStatusFilter === 'DEBT' && item.balance >= 0) return false;
      if (billingStatusFilter === 'PREPAID' && item.balance <= 0) return false;
      if (billingStatusFilter === 'ZERO' && item.balance !== 0) return false;

      if (q) {
        return match(item.mahalla_name) || match(item.district_id) || match(item.area_name || districtNames[String(item.area_id)]);
      }
      return true;
    });
  }, [billingList, billingSearchQuery, billingDistrictFilter, billingStatusFilter, districtNames]);

  // Filtr o'zgarganda birinchi sahifaga qaytish
  useEffect(() => {
    setBillingPage(0);
  }, [billingSearchQuery, billingDistrictFilter, billingStatusFilter]);

  // Faqat joriy sahifadagi qatorlar chiziladi (hammasini birdan chizish sahifani qotiradi)
  const pagedBillingList = useMemo(() => {
    const start = billingPage * billingRowsPerPage;
    return filteredBillingList.slice(start, start + billingRowsPerPage);
  }, [filteredBillingList, billingPage, billingRowsPerPage]);

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
    const match = createSearchMatcher(reportSearch);
    return reportStreets.filter((s) => match(s.name));
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

  // ── Saqlangan hisoblarni yuklash (Server Mode Pagination & Sorting) ──
  const fetchSavedAccounts = async (
    page = paginationModel.page,
    pageSize = paginationModel.pageSize,
    search = mahallaSearchQuery,
    district = districtFilter,
    status = statusFilter,
    sort = sortModel
  ) => {
    try {
      setLoadingAccounts(true);
      const params: any = {
        page,
        pageSize
      };
      if (search && search.trim()) params.search = buildTranslitRegexSource(search.trim());
      if (district && district !== 'all') params.area_id = district;
      if (status && status !== 'all') params.status = status;
      if (sort && sort.length > 0) {
        params.sortField = sort[0].field;
        params.sortOrder = sort[0].sort || 'desc';
      }

      const res = await api.get('/product-admin/online-mahalla/accounts', { params });
      if (res.data?.success && Array.isArray(res.data?.accounts)) {
        setPaginatedAccounts(res.data.accounts);
        setTotalAccountsCount(typeof res.data.total === 'number' ? res.data.total : res.data.accounts.length);
      }
    } catch (_) {
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Tumanlar dropdowni uchun barcha hisoblarni bir marta olish
  const fetchAllSavedAccountsForFilter = async () => {
    try {
      const res = await api.get('/product-admin/online-mahalla/accounts', { params: { all: 'true' } });
      if (res.data?.success && Array.isArray(res.data?.accounts)) {
        setSavedAccounts(res.data.accounts);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchSavedAccounts(0, paginationModel.pageSize, '', 'all', 'all', sortModel);
    fetchAllSavedAccountsForFilter();
    fetchBillingSummary();
    fetchSurveyPresets();
  }, []);

  // Qidiruv yoki filter o'zgarganda birinchi sahifadan yangilash
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSavedAccounts(0, paginationModel.pageSize, mahallaSearchQuery, districtFilter, statusFilter, sortModel);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 300);
    return () => clearTimeout(handler);
  }, [mahallaSearchQuery, districtFilter, statusFilter]);

  // Sahifa yoki Sort o'zgarganda yuklash
  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
    fetchSavedAccounts(newModel.page, newModel.pageSize, mahallaSearchQuery, districtFilter, statusFilter, sortModel);
  };

  const handleSortModelChange = (newSort: GridSortModel) => {
    setSortModel(newSort);
    fetchSavedAccounts(paginationModel.page, paginationModel.pageSize, mahallaSearchQuery, districtFilter, statusFilter, newSort);
  };

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchBillingSummary();
    }
  }, [activeTab]);

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
    if (activeTab === 'monitor') {
      fetchAllJobs(selectedJobDate);
      const timer = setInterval(() => {
        fetchAllJobs(selectedJobDate);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [activeTab, selectedJobDate]);

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
    const match = createSearchMatcher(errorSearchQuery);
    return selectedJobForErrors.errors.filter((e) => match(e.cadaster) || match(e.streetName) || match(e.ownerName) || match(e.error));
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

  // Job natijalari hisoboti
  const handleOpenReport = (job: SyncJobStatus) => {
    setSelectedJobForReport(job);
    setReportDialogOpen(true);
  };

  const handleExportJobReportExcel = (job: SyncJobStatus) => {
    if (!job) return;
    const wb = XLSX.utils.book_new();
    const sum = job.reportSummary || {};
    const emp = sum.employment || {};
    const bus = sum.businessWishes || {};
    const se = sum.socioEconomic || {};
    const inc = se.monthlyIncomes || {};
    const inf = sum.infrastructure || {};

    // 1-sheet: Umumiy Xulosa (Summary)
    const summaryData = [
      ['ONLINE MAHALLA - SMART XATLOV HISOBOTI', ''],
      ['Mahalla:', job.mahallaName || ''],
      ['Ko‘cha:', job.streetName || 'Barcha ko‘chalar'],
      ['Job ID:', job.id],
      ['Holati:', job.status],
      ['Shablon (Preset):', job.presetName || 'Standart'],
      ['Boshlangan vaqti:', job.startTime ? new Date(job.startTime).toLocaleString('uz-UZ') : ''],
      ['Tugallangan vaqti:', job.endTime ? new Date(job.endTime).toLocaleString('uz-UZ') : '—'],
      ['', ''],
      ['ASOSIY KO‘RSATKICHLAR', 'SONI'],
      ['Jami rejalashtirilgan xonadonlar', job.total || 0],
      ['Ko‘rib chiqilgan xonadonlar', job.processed || 0],
      ['Muvaffaqiyatli xatlovdan o‘tkazilgan xonadonlar', job.surveyHomesUpdated || job.success || 0],
      ['O‘tkazib yuborilgan xonadonlar', job.skipped || 0],
      ['Xatoliklar soni', job.failed || 0],
      ['Bandligi shakllantirilgan fuqarolar', job.employmentUpdated || 0],
      ['Tadbirkorlik & ko‘mak shakllantirilgan fuqarolar', job.businessWishesUpdated || 0],
      ['', ''],
      ['BANDLIK VA TA‘LIM TAQSIMOTI', 'FUQAROLAR SONI'],
      ['Rasmiy band (davlat bazasidan saqlangan)', emp.officialPreserved || 0],
      ['O‘zini o‘zi band qilgan (tomorqa / xizmat)', emp.selfEmployed || 0],
      ['Norasmiy yollanma ishchi', emp.unofficialWorker || 0],
      ['Maktab o‘quvchilari (7-17 yosh)', emp.schoolStudent || 0],
      ['Bog‘cha tarbiyalanuvchisi (3-6 yosh)', emp.kindergarten || 0],
      ['Ona tarbiyasida (0-2 yosh)', emp.motherCare || 0],
      ['Talabalar (OTM, kollej, texnikum)', emp.student || 0],
      ['Nafaqaxo‘rlar (keksalar)', emp.pensioner || 0],
      ['Ishsiz fuqarolar', emp.unemployed || 0],
      ['', ''],
      ['TADBIRKORLIK VA MOLIYAVIY KO‘MAK (TAB 6)', 'FUQAROLAR SONI'],
      ['Tadbirkorlik istagi bildirilganlar', bus.hasNeed || 0],
      ['Imtiyozli kredit so‘raganlar', bus.credit || 0],
      ['Subsidiya yoki ssuda so‘raganlar', bus.subsidy || 0],
      ['Ehtiyoj yo‘q deb belgilanganlar', bus.noNeed || 0],
      ['', ''],
      ['DAROMAD VA KREDIT QARZDORLIGI', 'XONADONLAR SONI'],
      ['Kredit qarzdorligi yo‘q', se.noDebtCount || 0],
      ['Kredit qarzdorligi mavjud', se.hasDebtCount || 0],
      ['1 mln so‘mgacha daromad', inc.under1m || 0],
      ['1 - 3 mln so‘m', inc.from1mTo3m || 0],
      ['3 - 5 mln so‘m', inc.from3mTo5m || 0],
      ['5 - 10 mln so‘m', inc.from5mTo10m || 0],
      ['10 mln so‘mdan yuqori', inc.above10m || 0],
      ['', ''],
      ['INFRATUZILMA VA KOMMUNIKATSIYA', 'XONADONLAR SONI'],
      ['Tabiiy gaz tarmog‘i', inf.gasNatural || 0],
      ['Suyultirilgan gaz (ballon)', inf.gasCylinder || 0],
      ['Markaziy ichimlik suvi', inf.waterCentral || 0],
      ['Quduq yoki boshqa manba', inf.waterWell || 0]
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 52 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Xatlov_Hisoboti');

    if (job.errors && job.errors.length > 0) {
      const errorHeaders = ['ID', 'Kadastr', 'Ko‘cha', 'Uy raqami', 'Egasi', 'Xatolik matni', 'Vaqti'];
      const errorRows = job.errors.map((err) => [
        err.id,
        err.cadaster,
        err.streetName || '',
        err.houseNum || '',
        err.ownerName || '',
        err.error,
        err.timestamp
      ]);
      const wsErrors = XLSX.utils.aoa_to_sheet([errorHeaders, ...errorRows]);
      wsErrors['!cols'] = [{ wch: 10 }, { wch: 22 }, { wch: 20 }, { wch: 10 }, { wch: 25 }, { wch: 45 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsErrors, 'Xatoliklar');
    }

    const safeMahalla = (job.mahallaName || 'Mahalla').replace(/[/\\?%*:|"<>]/g, '_');
    const safeStreet = (job.streetName || 'Hammasi').replace(/[/\\?%*:|"<>]/g, '_');
    const fileName = `Hisobot_${safeMahalla}_${safeStreet}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success('Excel hisobot yuklab olindi!');
  };

  // Xonadonlarni qidirish
  const filteredHomes = useMemo(() => {
    if (!homeSearch.trim()) return homes;
    const match = createSearchMatcher(homeSearch);
    return homes.filter((h) => match(h.full_name) || match(h.cadaster_number) || match(h.home_num) || match(h.pinfl));
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
      const match = createSearchMatcher(jobSearchQuery);
      result = result.filter((j) => match(j.mahallaName) || match(j.streetName) || match(j.id));
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

  // ── Qidiruv va tuman filtri bo'yicha saralangan mahallalar ──
  const filteredSavedAccountsByDistrict = useMemo(() => {
    const q = mahallaSearchQuery.trim();
    const match = createSearchMatcher(q);

    return savedAccountsByDistrict
      .filter((distGroup) => {
        if (districtFilter !== 'all' && distGroup.areaId !== districtFilter) {
          return false;
        }
        return true;
      })
      .map((distGroup) => {
        if (!q) return distGroup;

        const matchDistrict = match(distGroup.districtName) || match(distGroup.areaId);

        if (matchDistrict) return distGroup;

        const matchingAccounts = distGroup.accounts.filter((acc) => {
          return match(acc.mahalla_name) || match(acc.full_name) || match(acc.district_id) || match(acc.pinfl);
        });

        return {
          ...distGroup,
          accounts: matchingAccounts
        };
      })
      .filter((distGroup) => distGroup.accounts.length > 0);
  }, [savedAccountsByDistrict, mahallaSearchQuery, districtFilter]);

  const totalMatchingMahallas = useMemo(() => {
    return filteredSavedAccountsByDistrict.reduce((acc, d) => acc + d.accounts.length, 0);
  }, [filteredSavedAccountsByDistrict]);

  const isDistrictExpanded = (areaId: string) => {
    if (mahallaSearchQuery.trim() !== '') return true;
    if (expandedDistricts[areaId] !== undefined) return expandedDistricts[areaId];
    const hasSelected = String(areaId) === String(userProfile?.area_id || areaId);
    return hasSelected || savedAccountsByDistrict.length <= 2;
  };

  // ── DataGrid Ustunlari (Server Mode Pagination & Sorting) ──
  const accountColumns: GridColDef[] = useMemo(
    () => [
      {
        field: 'mahalla_name',
        headerName: "Mahalla Nomi & Mas'ul",
        minWidth: 260,
        flex: 1.3,
        renderCell: (params) => {
          const row = params.row as SavedMahallaAccount;
          const isSelected = String(districtId) === String(row.district_id);
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  {row.mahalla_name}
                </Typography>
                {isSelected && (
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: '0.8rem !important' }} />}
                    label="Ulangan"
                    color="success"
                    size="small"
                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 800 }}
                  />
                )}
              </Stack>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Mas'ul: {row.full_name || 'Xodim'} {row.phone ? `• ${row.phone}` : ''}
              </Typography>
            </Box>
          );
        }
      },
      {
        field: 'district_id',
        headerName: 'Mahalla ID',
        width: 130,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={`ID: ${params.value}`}
              size="small"
              sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace' }}
            />
          </Box>
        )
      },
      {
        field: 'area_name',
        headerName: 'Tuman / Hudud',
        minWidth: 200,
        flex: 1,
        renderCell: (params) => {
          const row = params.row as SavedMahallaAccount;
          const dName = row.area_name || (row.area_id ? districtNames[String(row.area_id)] : '') || `Tuman #${row.area_id || ''}`;
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                {dName}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: 'monospace' }}>
                area_id: {row.area_id}
              </Typography>
            </Box>
          );
        }
      },
      {
        field: 'status',
        headerName: 'Holati',
        width: 130,
        renderCell: (params) => {
          const status = String(params.value || 'ACTIVE').toUpperCase();
          if (status === 'ACTIVE') {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: '0.8rem !important' }} />}
                  label="Faol"
                  color="success"
                  size="small"
                  sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                />
              </Box>
            );
          }
          if (status === 'EXPIRED') {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Chip
                  icon={<WarningIcon sx={{ fontSize: '0.8rem !important' }} />}
                  label="Muddati o‘tgan"
                  color="warning"
                  size="small"
                  sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                />
              </Box>
            );
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Chip
                icon={<ErrorIcon sx={{ fontSize: '0.8rem !important' }} />}
                label="Xatolik"
                color="error"
                size="small"
                sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
              />
            </Box>
          );
        }
      },
      {
        field: 'key_filename',
        headerName: 'E-IMZO Kalit & PINFL',
        minWidth: 190,
        flex: 0.9,
        renderCell: (params) => {
          const row = params.row as SavedMahallaAccount;
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                <KeyIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {row.key_filename || (row.key_path ? 'Kalit mavjud' : 'Token')}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: 'monospace' }}>
                PINFL: {row.pinfl || '—'}
              </Typography>
            </Box>
          );
        }
      },
      {
        field: 'balance',
        headerName: 'Balans',
        width: 170,
        renderCell: (params) => {
          const balance = Number(params.value || 0);
          if (balance > 0) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Chip
                  label={`+${balance.toLocaleString()} so'm`}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    color: theme.palette.success.main,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.success.main, 0.3)
                  }}
                />
              </Box>
            );
          }
          if (balance < 0) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Chip
                  label={`${balance.toLocaleString()} so'm`}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    bgcolor: alpha(theme.palette.error.main, 0.12),
                    color: theme.palette.error.main,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.error.main, 0.3)
                  }}
                />
              </Box>
            );
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Chip
                label="0 so'm"
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  bgcolor: alpha(theme.palette.text.primary, 0.05),
                  color: theme.palette.text.primary,
                  border: '1px solid',
                  borderColor: theme.palette.divider
                }}
              />
            </Box>
          );
        }
      },
      {
        field: 'actions',
        headerName: 'Amallar',
        minWidth: 320,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const row = params.row as SavedMahallaAccount;
          const isSelected = String(districtId) === String(row.district_id);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                {isSelected ? (
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                    sx={{ height: 28, textTransform: 'none', fontWeight: 800, fontSize: '0.74rem', px: 1.2 }}
                  >
                    Ulangan
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleSelectAccount(row)}
                    sx={{ height: 28, textTransform: 'none', fontWeight: 700, fontSize: '0.74rem', px: 1.2 }}
                  >
                    Ulanish
                  </Button>
                )}

                <Tooltip title="Tuman nomini avtomatik aniqlash (Avtonomlash)">
                  <span>
                    <IconButton
                      size="small"
                      color="primary"
                      disabled={autoNamingDistrictId === String(row.area_id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (row.area_id) handleAutoNameDistrict(String(row.area_id));
                      }}
                      sx={{ p: 0.5, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.3) }}
                    >
                      {autoNamingDistrictId === String(row.area_id) ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <AutoAwesomeIcon sx={{ fontSize: 15 }} />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="Ushbu mahalla bo'yicha Sinxronizatsiyani ishga tushirish">
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon sx={{ fontSize: 14 }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAccount(row);
                      setActiveTab('launch');
                      toast.info(`«${row.mahalla_name}» tanlandi. Ishga tushirishga o‘tildi.`);
                    }}
                    sx={{ height: 28, textTransform: 'none', fontWeight: 700, fontSize: '0.74rem', px: 1.2, boxShadow: 'none' }}
                  >
                    Job
                  </Button>
                </Tooltip>

                <Tooltip title="Survey hisoboti">
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('report');
                      if (row.area_id) setSelectedReportDistrictId(String(row.area_id));
                      handleOpenMahallaReport(row);
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <AssessmentIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Hisobni o‘chirish">
                  <IconButton size="small" color="error" onClick={(e) => row._id && handleDeleteAccount(row._id, e)} sx={{ p: 0.5 }}>
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          );
        }
      }
    ],
    [districtId, theme, districtNames, autoNamingDistrictId]
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* ── Bosh Sahifa Sarlavhasi ── */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <StreetIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
              Online-Mahalla Integratsiya Markazi
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.2 }}>
              Xodim profillari, E-IMZO kalitlari, avtomatik sinxronizatsiya va jonli monitoring markazi
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ── Tab Bar in Header ── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 52,
              fontWeight: 700,
              fontSize: '0.92rem',
              textTransform: 'none',
              px: { xs: 2, sm: 3 }
            }
          }}
        >
          <Tab
            value="accounts"
            icon={<FingerprintIcon />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <span>1. Imzolar & Ulanish</span>
                <Chip label={`${savedAccounts.length} ta`} size="small" sx={{ height: 20, fontSize: '0.72rem', fontWeight: 700 }} />
              </Stack>
            }
          />
          <Tab
            value="launch"
            icon={<PlayArrowIcon />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <span>2. Ishga Tushirish</span>
                {streets.length > 0 && (
                  <Chip
                    label={`${streets.length} ta ko‘cha`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.72rem', fontWeight: 700 }}
                  />
                )}
              </Stack>
            }
          />
          <Tab
            value="monitor"
            icon={<JobIcon />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <span>3. Jonli Monitor</span>
                {jobsStats.running > 0 ? (
                  <Chip
                    label={`${jobsStats.running} faol`}
                    size="small"
                    color="warning"
                    sx={{ height: 20, fontSize: '0.72rem', fontWeight: 800 }}
                  />
                ) : (
                  <Chip label={`${jobsStats.total} job`} size="small" sx={{ height: 20, fontSize: '0.72rem', fontWeight: 600 }} />
                )}
              </Stack>
            }
          />
          <Tab
            value="report"
            icon={<AssessmentIcon />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <span>4. Survey Hisobotlar</span>
                {totalInDb > 0 && <Chip label={`${totalInDb}`} size="small" sx={{ height: 20, fontSize: '0.72rem', fontWeight: 600 }} />}
              </Stack>
            }
          />
          <Tab
            value="billing"
            icon={<WalletIcon />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <span>5. Moliya & Balans</span>
                {billingSummary && billingSummary.totalDebt > 0 ? (
                  <Chip
                    label={`-${billingSummary.totalDebt.toLocaleString()} so'm qarz`}
                    size="small"
                    color="error"
                    sx={{ height: 20, fontSize: '0.72rem', fontWeight: 800 }}
                  />
                ) : (
                  <Chip label={`${billingList.length} ta`} size="small" sx={{ height: 20, fontSize: '0.72rem', fontWeight: 600 }} />
                )}
              </Stack>
            }
          />
        </Tabs>
      </Box>

      {/* ── Tanlangan Mahalla (Active Mahalla) Sticky / Quick Banner ── */}
      {districtId && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 1.5,
            px: 2,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: userProfile ? alpha(theme.palette.success.main, 0.4) : alpha(theme.palette.primary.main, 0.3),
            bgcolor: userProfile
              ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.1 : 0.04)
              : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.03),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 24 }} />
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  {userProfile?.mahalla_name ||
                    savedAccounts.find((a) => String(a.district_id) === String(districtId))?.mahalla_name ||
                    `Mahalla #${districtId}`}
                </Typography>
                <Chip label={`ID: ${districtId}`} size="small" variant="outlined" sx={{ fontWeight: 700, height: 22 }} />
                {userProfile?.area_name && (
                  <Chip
                    label={userProfile.area_name}
                    size="small"
                    sx={{
                      height: 22,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: theme.palette.primary.main,
                      fontWeight: 700
                    }}
                  />
                )}
              </Stack>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Mas'ul: <b>{userProfile?.full_name || 'Aniqlanmagan'}</b> • Ko'chalar: <b>{streets.length} ta tayyor</b>
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {activeTab !== 'launch' && (
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={() => setActiveTab('launch')}
                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
              >
                Sinxronizatsiyaga O'tish
              </Button>
            )}
            {activeTab !== 'accounts' && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<SwapHorizIcon />}
                onClick={() => setActiveTab('accounts')}
                sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
              >
                Mahallani O'zgartirish
              </Button>
            )}
          </Stack>
        </Paper>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── TAB 1: IMZOLAR VA XODIMNI ULANISHI ── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === 'accounts' && (
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

                {/* Saqlangan Mahallalar & Imzolar Jadvali (DataGrid Server Mode) */}
                <Box sx={{ mt: 3 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                      <TableChartIcon sx={{ fontSize: 22, color: theme.palette.primary.main }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Saqlangan Mahallalar & Imzolar Jadvali
                      </Typography>
                      <Chip
                        label={`${totalAccountsCount} ta mahalla`}
                        size="small"
                        color="primary"
                        sx={{ height: 24, fontSize: '0.75rem', fontWeight: 800 }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        disabled={autoNamingAll}
                        startIcon={
                          autoNamingAll ? <CircularProgress size={13} color="inherit" /> : <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                        }
                        onClick={handleAutoNameAllDistricts}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.8rem' }}
                      >
                        {autoNamingAll ? 'Tumanlar nomlanmoqda...' : 'Barcha tumanlarni avtonomlash'}
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                        onClick={() => {
                          fetchSavedAccounts();
                          fetchAllSavedAccountsForFilter();
                        }}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                      >
                        Yangilash
                      </Button>
                    </Stack>
                  </Stack>

                  {/* 🔍 Qidiruv va Filtr Paneli */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                      bgcolor: alpha(theme.palette.background.default, 0.6)
                    }}
                  >
                    <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                      {/* Qidiruv maydoni */}
                      <Grid size={{ xs: 12, md: 5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Mahalla nomi, mas'ul F.I.SH, ID yoki PINFL..."
                          value={mahallaSearchQuery}
                          onChange={(e) => setMahallaSearchQuery(e.target.value)}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                                </InputAdornment>
                              ),
                              endAdornment: mahallaSearchQuery ? (
                                <InputAdornment position="end">
                                  <IconButton size="small" onClick={() => setMahallaSearchQuery('')}>
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </InputAdornment>
                              ) : null,
                              sx: { borderRadius: 2, bgcolor: theme.palette.background.paper }
                            }
                          }}
                        />
                      </Grid>

                      {/* Tuman bo'yicha filtr */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="district-filter-label">Tuman bo'yicha saralash</InputLabel>
                          <Select
                            labelId="district-filter-label"
                            label="Tuman bo'yicha saralash"
                            value={districtFilter}
                            onChange={(e) => setDistrictFilter(e.target.value)}
                            sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper }}
                          >
                            <MenuItem value="all">
                              <em>Barcha tumanlar ({savedAccounts.length} ta mahalla)</em>
                            </MenuItem>
                            {savedAccountsByDistrict.map((d) => (
                              <MenuItem key={d.areaId} value={d.areaId}>
                                {d.districtName} ({d.accounts.length} ta)
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Holati bo'yicha filtr */}
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="status-filter-label">Holati bo'yicha</InputLabel>
                          <Select
                            labelId="status-filter-label"
                            label="Holati bo'yicha"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper }}
                          >
                            <MenuItem value="all">Barchasi</MenuItem>
                            <MenuItem value="ACTIVE">Faol (Active)</MenuItem>
                            <MenuItem value="EXPIRED">Muddati o‘tgan</MenuItem>
                            <MenuItem value="ERROR">Xatolik</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    {/* Faol filtr holati va tozalash */}
                    {(mahallaSearchQuery || districtFilter !== 'all' || statusFilter !== 'all') && (
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1.5, flexWrap: 'wrap' }}>
                        <FilterListIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          Filtrlangan natija: {totalAccountsCount} ta mahalla
                        </Typography>
                        <Button
                          size="small"
                          color="secondary"
                          onClick={() => {
                            setMahallaSearchQuery('');
                            setDistrictFilter('all');
                            setStatusFilter('all');
                          }}
                          sx={{ fontSize: '0.72rem', textTransform: 'none', py: 0, px: 1, ml: 1 }}
                        >
                          Filtrni tozalash
                        </Button>
                      </Stack>
                    )}
                  </Paper>

                  {/* 📊 DataGrid Jadvali */}
                  <Paper
                    elevation={0}
                    sx={{
                      width: '100%',
                      minHeight: 520,
                      borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                      bgcolor: theme.palette.background.paper,
                      overflow: 'hidden'
                    }}
                  >
                    <DataGrid
                      rows={paginatedAccounts}
                      columns={accountColumns}
                      getRowId={(row) => String(row._id || row.district_id)}
                      rowCount={totalAccountsCount}
                      loading={loadingAccounts}
                      paginationMode="server"
                      paginationModel={paginationModel}
                      onPaginationModelChange={handlePaginationModelChange}
                      pageSizeOptions={[10, 25, 50, 100]}
                      sortingMode="server"
                      sortModel={sortModel}
                      onSortModelChange={handleSortModelChange}
                      disableRowSelectionOnClick
                      rowHeight={64}
                      sx={{
                        border: 'none',
                        minHeight: 480,
                        '& .MuiDataGrid-columnHeaders': {
                          bgcolor: alpha(theme.palette.background.default, 0.7),
                          borderBottom: '1px solid',
                          borderColor: theme.palette.divider,
                          fontWeight: 700
                        },
                        '& .MuiDataGrid-row:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04)
                        },
                        '& .MuiDataGrid-cell': {
                          borderColor: alpha(theme.palette.divider, 0.6)
                        }
                      }}
                    />
                  </Paper>
                </Box>
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
        </Box>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── TAB 2: SINXRONIZATSIYANI ISHGA TUSHIRISH ── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === 'launch' && (
        <Box>
          {!districtId && (
            <Alert
              severity="warning"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setActiveTab('accounts')}
                  sx={{ fontWeight: 700, textTransform: 'none' }}
                >
                  Mahallani Tanlash
                </Button>
              }
              sx={{ mb: 3, borderRadius: 2 }}
            >
              Hozirda hech qanday mahalla tanlanmagan. Sinxronizatsiyani ishga tushirish uchun avval 1-tabdan kerakli mahallani tanlang.
            </Alert>
          )}

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

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 🧠 SMART XATLOV — FOIZLAR VA EHTIMOLLIKLAR ASOSIDA TO'LDIRISH */}
          {/* ══════════════════════════════════════════════════════════ */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              border: '2px solid',
              borderColor: alpha(theme.palette.primary.main, 0.4),
              borderRadius: 3,
              bgcolor: theme.palette.background.paper,
              overflow: 'hidden',
              boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(33, 150, 243, 0.08)'
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid',
                borderColor: theme.palette.divider,
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.04)
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between' }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.palette.primary.main
                    }}
                  >
                    <SmartIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Smart Xatlov (Foizlar va Ehtimolliklar Asosida To‘ldirish)
                      </Typography>
                      <Chip label="Smart AI Engine" color="primary" size="small" sx={{ height: 22, fontWeight: 700, fontSize: '0.7rem' }} />
                    </Stack>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.3 }}>
                      Soliq va pensiya bazalaridan yangilash, fuqarolar yoshiga ko‘ra bandlik, kredit qarzdorligi va infratuzilmani foizlar
                      asosida to‘ldiradi.
                    </Typography>
                  </Box>
                </Stack>

                {/* Preset Tanlash va Saqlash boshqaruvi */}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 230 }}>
                    <InputLabel id="survey-preset-select-label">Tanlangan Shablon (Preset)</InputLabel>
                    <Select
                      labelId="survey-preset-select-label"
                      label="Tanlangan Shablon (Preset)"
                      value={selectedPresetId}
                      onChange={(e) => handleSelectPreset(e.target.value)}
                      sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper, fontWeight: 700 }}
                    >
                      {surveyPresets.map((p) => (
                        <MenuItem key={p._id} value={p._id}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span>{p.name}</span>
                            {p.isDefault && <Chip label="Standart" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />}
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Tooltip title="Joriy sozlamalarni yangi shablon sifatida saqlash">
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
                      onClick={() => {
                        setNewPresetName('');
                        setNewPresetDescription('');
                        setSavePresetDialogOpen(true);
                      }}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, height: 40 }}
                    >
                      Shablon Saqlash
                    </Button>
                  </Tooltip>

                  {selectedPresetId && !surveyPresets.find((p) => p._id === selectedPresetId)?.isDefault && (
                    <Tooltip title="Ushbu maxsus shablonni o‘chirish">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => handleDeletePreset(selectedPresetId, e)}
                        sx={{ border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.3) }}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Stack>
            </Box>

            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '270px minmax(0, 1fr)' },
                  gap: 2.5,
                  alignItems: 'start'
                }}
              >
                {/* Bo'limlar menyusi: faqat tanlangan bo'lim sozlamalari ko'rsatiladi */}
                <Paper
                  elevation={0}
                  sx={{
                    position: { md: 'sticky' },
                    top: { md: 88 },
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    overflow: 'hidden'
                  }}
                >
                  {SMART_SECTIONS.map((sec) => {
                    const enabled = smartSettings.modules?.[sec.key] !== false;
                    const active = smartSection === sec.key;
                    return (
                      <ButtonBase
                        key={sec.key}
                        onClick={() => setSmartSection(sec.key)}
                        sx={{
                          display: 'flex',
                          width: '100%',
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          alignItems: 'flex-start',
                          gap: 1.25,
                          px: 1.75,
                          py: 1.4,
                          borderLeft: '3px solid',
                          borderLeftColor: active ? theme.palette.primary.main : 'transparent',
                          borderBottom: '1px solid',
                          borderBottomColor: theme.palette.divider,
                          bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, active ? 0.1 : 0.04) }
                        }}
                      >
                        <Box sx={{ fontSize: 20, lineHeight: 1.2, opacity: enabled ? 1 : 0.4 }}>{sec.icon}</Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: active ? 800 : 700, color: enabled ? 'text.primary' : 'text.disabled' }}
                            >
                              {sec.title}
                            </Typography>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                flexShrink: 0,
                                bgcolor: enabled ? theme.palette.success.main : theme.palette.grey[400]
                              }}
                            />
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', color: theme.palette.text.secondary, lineHeight: 1.35, mt: 0.25 }}
                          >
                            {enabled ? smartSectionSummary[sec.key] : 'O‘chirilgan — teginilmaydi'}
                          </Typography>
                        </Box>
                      </ButtonBase>
                    );
                  })}
                </Paper>

                <Box sx={{ minWidth: 0 }}>
                  {/* 1-BO'LIM: BANDLIK VA TA'LIM (HAR BIR FUQARO KESIMIDA) */}
                  {smartSection === 'employment' && (
                    <Box>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          height: '100%',
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          bgcolor: alpha(theme.palette.background.default, 0.5)
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <WorkIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                              1. 💼 Bandlik va Ta'lim
                            </Typography>
                          </Stack>
                          <Tooltip
                            title={smartSettings.modules?.employment !== false ? "Ushbu bo'limni o'chirish" : "Ushbu bo'limni yoqish"}
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  checked={smartSettings.modules?.employment !== false}
                                  onChange={(e) =>
                                    setSmartSettings((prev) => ({
                                      ...prev,
                                      modules: { ...prev.modules, employment: e.target.checked }
                                    }))
                                  }
                                  color="primary"
                                />
                              }
                              label={
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 800,
                                    color: smartSettings.modules?.employment !== false ? 'primary.main' : 'text.disabled'
                                  }}
                                >
                                  {smartSettings.modules?.employment !== false ? 'FAOL' : "O'CHIRILGAN"}
                                </Typography>
                              }
                              sx={{ m: 0 }}
                            />
                          </Tooltip>
                        </Stack>

                        <Box
                          sx={{
                            opacity: smartSettings.modules?.employment !== false ? 1 : 0.45,
                            pointerEvents: smartSettings.modules?.employment !== false ? 'auto' : 'none',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Stack spacing={2}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                border: '1px solid',
                                borderColor: smartSettings.employment.skipWorkingAge ? theme.palette.warning.main : theme.palette.divider
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={smartSettings.employment.skipWorkingAge === true}
                                    onChange={(e) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        employment: { ...prev.employment, skipWorkingAge: e.target.checked }
                                      }))
                                    }
                                    color="warning"
                                  />
                                }
                                label={
                                  <Box sx={{ ml: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                      Mehnat yoshidagilarning bandlik holatiga tegilmasin
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                      18 yoshdan pensiya yoshigacha (erkak 59, ayol 54) bo‘lganlarning bandlik holati o‘zgartirilmaydi.
                                      Kasb-hunar va tadbirkorlik ehtiyoji hamma a’zo uchun to‘ldiriladi
                                    </Typography>
                                  </Box>
                                }
                                sx={{ m: 0 }}
                              />
                            </Paper>

                            {smartSettings.employment.mode === 'burgansoy' && !smartSettings.employment.skipWorkingAge && (
                              <Alert severity="info" sx={{ borderRadius: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                  ⭐ Burgansoy Maxsus Shablon Rejimi:
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, lineHeight: 1.5 }}>
                                  • Mehnat yoshidagi erkaklar: <b>4.7 "qishloq xo‘jalik ishlari bilan band"</b>
                                  <br />• 50–54 yoshli ayollar: <b>4.7 "uy bekasi"</b>
                                  <br />• 18–49 yoshli ayollar: <b>4.7 "qishloq xo‘jalik ishlari bilan band"</b>
                                  <br />• 7–17 yosh o‘quvchilar: <b>4.4 (maktab/litsey)</b>
                                  <br />• Go‘daklar (0–2): <b>4.6 (ona tarbiyasi)</b>, Bog‘cha (3–6): <b>4.5 (bog‘cha)</b>
                                  <br />• Nafaqaxo‘rlar:{' '}
                                  <b>
                                    {(smartSettings.employment.pensionerMode ?? '4.2') === '4.7'
                                      ? '4.7 (Izoh: "Nafaqada")'
                                      : '4.2 (nafaqada)'}
                                  </b>
                                  <br />• <b>Tadbirkorlik (YaTT) belgilanmaydi.</b>
                                </Typography>
                              </Alert>
                            )}
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                border: '1px solid',
                                borderColor: theme.palette.divider
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={smartSettings.employment.refreshGovDatabases}
                                    onChange={(e) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        employment: { ...prev.employment, refreshGovDatabases: e.target.checked }
                                      }))
                                    }
                                    color="primary"
                                  />
                                }
                                label={
                                  <Box sx={{ ml: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                      Davlat bazalaridan yangilash (Refresh)
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                      Soliq, pensiya va boshqa bazalardan eng so'nggi ma'lumotlarni tortadi
                                    </Typography>
                                  </Box>
                                }
                                sx={{ m: 0 }}
                              />
                            </Paper>

                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                border: '1px solid',
                                borderColor: theme.palette.divider
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={smartSettings.employment.preserveOfficialSector}
                                    onChange={(e) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        employment: { ...prev.employment, preserveOfficialSector: e.target.checked }
                                      }))
                                    }
                                    color="success"
                                  />
                                }
                                label={
                                  <Box sx={{ ml: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                      Rasmiy bandlarni saqlab qolish
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                      Rasmiy ishlovchilarning tashkiloti va STIRi saqlanadi, teginilmaydi
                                    </Typography>
                                  </Box>
                                }
                                sx={{ m: 0 }}
                              />
                            </Paper>

                            {/* Bog'cha yoshidagi bolalar (3-6 yosh) */}
                            <Box>
                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  3 – 6 yosh: Bog‘cha tarbiyalanuvchisi
                                </Typography>
                                <Chip
                                  label={`${smartSettings.employment.kindergartenPercent}%`}
                                  color="primary"
                                  size="small"
                                  sx={{ fontWeight: 800, height: 22 }}
                                />
                              </Stack>
                              <Slider
                                value={smartSettings.employment.kindergartenPercent}
                                onChange={(_, v) =>
                                  setSmartSettings((prev) => ({
                                    ...prev,
                                    employment: { ...prev.employment, kindergartenPercent: v as number }
                                  }))
                                }
                                min={0}
                                max={100}
                                size="small"
                              />
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                Qolgan {100 - smartSettings.employment.kindergartenPercent}% bolalar «Она тарбиясида» deb belgilanadi
                              </Typography>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            {/* Mehnatga layoqatli aholi taqsimoti */}
                            <Box
                              sx={{
                                opacity: smartSettings.employment.skipWorkingAge ? 0.4 : 1,
                                pointerEvents: smartSettings.employment.skipWorkingAge ? 'none' : 'auto'
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.primary.main, mb: 1 }}>
                                Mehnatga layoqatli aholi taqsimoti (18–59 yosh erkak, 18–54 yosh ayol):
                              </Typography>

                              <Stack spacing={1.5}>
                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      Норасмий ёлланма ишчи
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                      {smartSettings.employment.unofficialWorkerPercent}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.employment.unofficialWorkerPercent}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        employment: { ...prev.employment, unofficialWorkerPercent: v as number }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                    color="secondary"
                                  />
                                </Box>

                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      Ўзини ўзи банд қилган (Томорқа, хизмат)
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                      {smartSettings.employment.selfEmployedPercent}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.employment.selfEmployedPercent}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        employment: { ...prev.employment, selfEmployedPercent: v as number }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                    color="info"
                                  />
                                </Box>

                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      Ишсиз (Иш топа олмаган)
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                      {smartSettings.employment.unemployedPercent}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.employment.unemployedPercent}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        employment: { ...prev.employment, unemployedPercent: v as number }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                    color="warning"
                                  />
                                </Box>
                              </Stack>
                            </Box>

                            {/* Nafaqadagi fuqarolarni belgilash uslubi (1-uslub: 4.2.2 / 2-uslub: 4.7) */}
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                border: '1.5px solid',
                                borderColor:
                                  (smartSettings.employment.pensionerMode ?? '4.2') === '4.7'
                                    ? theme.palette.secondary.main
                                    : theme.palette.primary.main
                              }}
                            >
                              <Stack spacing={1}>
                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                                    🧓 Nafaqadagilar (Erkak 60+, Ayol 55+):
                                  </Typography>
                                  <Chip
                                    label={
                                      (smartSettings.employment.pensionerMode ?? '4.2') === '4.7'
                                        ? '4.7 (Izoh uslubi)'
                                        : '4.2 (Standart uslub)'
                                    }
                                    size="small"
                                    color={(smartSettings.employment.pensionerMode ?? '4.2') === '4.7' ? 'secondary' : 'primary'}
                                    sx={{ fontWeight: 800, height: 22, fontSize: '0.72rem' }}
                                  />
                                </Stack>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                  Online Mahalla shaklida qaysi uslubda belgilansin:
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    fullWidth
                                    size="small"
                                    variant={(smartSettings.employment.pensionerMode ?? '4.2') === '4.2' ? 'contained' : 'outlined'}
                                    color="primary"
                                    onClick={() =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        employment: { ...prev.employment, pensionerMode: '4.2' }
                                      }))
                                    }
                                    sx={{
                                      py: 0.6,
                                      fontSize: '0.73rem',
                                      fontWeight: 800,
                                      borderRadius: 1.5,
                                      textTransform: 'none'
                                    }}
                                  >
                                    1-uslub: 4.2.2 (Нафақада)
                                  </Button>
                                  <Button
                                    fullWidth
                                    size="small"
                                    variant={(smartSettings.employment.pensionerMode ?? '4.2') === '4.7' ? 'contained' : 'outlined'}
                                    color="secondary"
                                    onClick={() =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        employment: { ...prev.employment, pensionerMode: '4.7' }
                                      }))
                                    }
                                    sx={{
                                      py: 0.6,
                                      fontSize: '0.73rem',
                                      fontWeight: 800,
                                      borderRadius: 1.5,
                                      textTransform: 'none'
                                    }}
                                  >
                                    2-uslub: 4.7 Izoh ("Nafaqada")
                                  </Button>
                                </Stack>
                              </Stack>
                            </Paper>

                            {/* Avtomatik qat'iy qoidalar badges */}
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.info.main, 0.08),
                                border: '1px dashed',
                                borderColor: alpha(theme.palette.info.main, 0.3)
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700, display: 'block', mb: 0.5, color: theme.palette.info.main }}
                              >
                                Avtomatik qat'iy qoidalar:
                              </Typography>
                              <Stack direction="row" spacing={0.6} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                <Chip
                                  label="0–2 yosh: 100% Ona tarbiyasida"
                                  size="small"
                                  sx={{ height: 20, fontSize: '0.68rem', bgcolor: theme.palette.background.paper }}
                                />
                                <Chip
                                  label="7–17 yosh: 100% Maktab o‘quvchisi"
                                  size="small"
                                  sx={{ height: 20, fontSize: '0.68rem', bgcolor: theme.palette.background.paper }}
                                />
                                <Chip
                                  label={
                                    (smartSettings.employment.pensionerMode ?? '4.2') === '4.7'
                                      ? 'Keksalar: 4.7 ("Nafaqada")'
                                      : 'Keksalar: 4.2 (Nafaqada)'
                                  }
                                  size="small"
                                  sx={{ height: 20, fontSize: '0.68rem', bgcolor: theme.palette.background.paper }}
                                />
                              </Stack>
                            </Paper>

                            {/* Faoliyat sohalari aralashmasi haqida tushuntirish */}
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                border: '1px dashed',
                                borderColor: alpha(theme.palette.secondary.main, 0.3)
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 800, color: theme.palette.secondary.main, display: 'block', mb: 0.5 }}
                              >
                                🎲 Tizim sohalarni tabiiy proporsiyada aralashtiradi:
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem', display: 'block' }}
                              >
                                • <b>Norasmiy ishchilar:</b> Qurilish, ta'mir, yuk tashish, qishloq xo'jaligi, kunlik ishchi va maishiy
                                xizmatlar avtomatik aralashtiriladi.
                                <br />• <b>O'zini o'zi band qilganlar:</b> Dehqonchilik (tomorqa), chorvachilik, issiqxona, usta, kosib,
                                tikuvchi, sartarosh, santexnik kabi sohalar fuqarolarga tabiiy taqsimlanadi.
                              </Typography>
                            </Paper>
                          </Stack>
                        </Box>
                      </Paper>
                    </Box>
                  )}

                  {/* 2-BO'LIM: MEHNAT VA KASB-HUNARGA BO'LGAN EHTIYOJ (TAB 54434) */}
                  {smartSection === 'employmentWishes' && (
                    <Box>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          height: '100%',
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          bgcolor: alpha(theme.palette.background.default, 0.5)
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <SchoolIcon sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                              2. 🎓 Kasb-hunarga Ehtiyoj
                            </Typography>
                          </Stack>
                          <Tooltip
                            title={smartSettings.modules?.employmentWishes !== false ? "Ushbu bo'limni o'chirish" : "Ushbu bo'limni yoqish"}
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  checked={smartSettings.modules?.employmentWishes !== false}
                                  onChange={(e) =>
                                    setSmartSettings((prev) => ({
                                      ...prev,
                                      modules: { ...prev.modules, employmentWishes: e.target.checked }
                                    }))
                                  }
                                  color="secondary"
                                />
                              }
                              label={
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 800,
                                    color: smartSettings.modules?.employmentWishes !== false ? 'secondary.main' : 'text.disabled'
                                  }}
                                >
                                  {smartSettings.modules?.employmentWishes !== false ? 'FAOL' : "O'CHIRILGAN"}
                                </Typography>
                              }
                              sx={{ m: 0 }}
                            />
                          </Tooltip>
                        </Stack>

                        <Box
                          sx={{
                            opacity: smartSettings.modules?.employmentWishes !== false ? 1 : 0.45,
                            pointerEvents: smartSettings.modules?.employmentWishes !== false ? 'auto' : 'none',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Stack spacing={2}>
                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                ⭐ 100% Ehtiyoj yo‘q qoidasi:
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                Online Mahalla tizimidagi 54434-tab bo‘yicha har bir fuqaroga{' '}
                                <b>«Меҳнатга ва касб-ҳунарга бўлган эҳтиёж йўқ»</b> deb to‘ldiriladi.
                              </Typography>
                              <Box sx={{ mt: 1, pl: 1, borderLeft: '2px solid', borderColor: theme.palette.success.main }}>
                                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.73rem' }}>
                                  • Ишлаш истаги: <b>Меҳнатга ва касб-ҳунарга эҳтиёж йўқ (7)</b>
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.73rem' }}>
                                  • Касб-ҳунар ўқиш: <b>Меҳнатга ва касб-ҳунарга эҳтиёж йўқ (6)</b>
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.73rem' }}>
                                  • Хорижий тил ўқиш: <b>Меҳнатга ва касб-ҳунарга эҳтиёж йўқ (7)</b>
                                </Typography>
                              </Box>
                            </Alert>

                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: theme.palette.divider,
                                bgcolor: theme.palette.background.paper
                              }}
                            >
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  Ehtiyoj holati:
                                </Typography>
                                <Chip label="100% Эҳтиёж йўқ" color="success" size="small" sx={{ fontWeight: 800 }} />
                              </Stack>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block' }}>
                                Burgansoy shabloni bo‘yicha barcha fuqarolar uchun yangi ish, kasb-hunar va chet tili o‘rganishga ehtiyoj
                                yo‘q qilib belgilanadi.
                              </Typography>
                            </Paper>
                          </Stack>
                        </Box>
                      </Paper>
                    </Box>
                  )}

                  {/* 3-BO'LIM: TADBIRKORLIK VA MOLIYAVIY KO'MAKKA BO'LGAN EHTIYOJ */}
                  {smartSection === 'businessWishes' && (
                    <Box>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          height: '100%',
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          bgcolor: alpha(theme.palette.background.default, 0.5)
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <BusinessCenterIcon sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                              3. 🚀 Tadbirkorlik & Ko‘mak
                            </Typography>
                          </Stack>
                          <Tooltip
                            title={smartSettings.modules?.businessWishes !== false ? "Ushbu bo'limni o'chirish" : "Ushbu bo'limni yoqish"}
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  checked={smartSettings.modules?.businessWishes !== false}
                                  onChange={(e) =>
                                    setSmartSettings((prev) => ({
                                      ...prev,
                                      modules: { ...prev.modules, businessWishes: e.target.checked }
                                    }))
                                  }
                                  color="secondary"
                                />
                              }
                              label={
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 800,
                                    color: smartSettings.modules?.businessWishes !== false ? 'secondary.main' : 'text.disabled'
                                  }}
                                >
                                  {smartSettings.modules?.businessWishes !== false ? 'FAOL' : "O'CHIRILGAN"}
                                </Typography>
                              }
                              sx={{ m: 0 }}
                            />
                          </Tooltip>
                        </Stack>

                        <Box
                          sx={{
                            opacity: smartSettings.modules?.businessWishes !== false ? 1 : 0.45,
                            pointerEvents: smartSettings.modules?.businessWishes !== false ? 'auto' : 'none',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Stack spacing={2}>
                            {/* Ehtiyoji bor fuqarolar foizi */}
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                border: '1px solid',
                                borderColor: theme.palette.divider
                              }}
                            >
                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                  Tadbirkorlikka ehtiyoji / istagi bor:
                                </Typography>
                                <Chip
                                  label={`${smartSettings.businessWishes?.hasNeedPercent ?? 18}% BOR`}
                                  color={(smartSettings.businessWishes?.hasNeedPercent ?? 18) > 0 ? 'secondary' : 'default'}
                                  size="small"
                                  sx={{ fontWeight: 800 }}
                                />
                              </Stack>
                              <Slider
                                value={smartSettings.businessWishes?.hasNeedPercent ?? 18}
                                onChange={(_, v) =>
                                  setSmartSettings((prev) => ({
                                    ...prev,
                                    businessWishes: {
                                      ...(prev.businessWishes || DEFAULT_SMART_SETTINGS.businessWishes!),
                                      hasNeedPercent: v as number
                                    }
                                  }))
                                }
                                min={0}
                                max={100}
                                size="small"
                                color="secondary"
                              />
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                Qolgan {100 - (smartSettings.businessWishes?.hasNeedPercent ?? 18)}% fuqaroga «Тадбиркорликка бўлган эҳтиёж
                                йўқ» deb belgilanadi
                              </Typography>
                            </Paper>

                            {/* Qaysi yo'nalishda istak bor */}
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 800, color: theme.palette.text.secondary, display: 'block', mb: 1 }}
                              >
                                Qaysi yo‘nalishda istak bor (% taqsimoti):
                              </Typography>
                              <Stack spacing={1}>
                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">Хизмат кўрсатиш</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.businessWishes?.directions?.servicesPercent ?? 35}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.businessWishes?.directions?.servicesPercent ?? 35}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        businessWishes: {
                                          ...(prev.businessWishes || DEFAULT_SMART_SETTINGS.businessWishes!),
                                          directions: {
                                            ...(prev.businessWishes?.directions || DEFAULT_SMART_SETTINGS.businessWishes!.directions),
                                            servicesPercent: v as number
                                          }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                  />
                                </Box>

                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">Қишлоқ хўжалиги</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.businessWishes?.directions?.agriculturePercent ?? 35}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.businessWishes?.directions?.agriculturePercent ?? 35}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        businessWishes: {
                                          ...(prev.businessWishes || DEFAULT_SMART_SETTINGS.businessWishes!),
                                          directions: {
                                            ...(prev.businessWishes?.directions || DEFAULT_SMART_SETTINGS.businessWishes!.directions),
                                            agriculturePercent: v as number
                                          }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                    color="success"
                                  />
                                </Box>

                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">Кичик ишлаб чиқариш</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.businessWishes?.directions?.productionPercent ?? 20}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.businessWishes?.directions?.productionPercent ?? 20}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        businessWishes: {
                                          ...(prev.businessWishes || DEFAULT_SMART_SETTINGS.businessWishes!),
                                          directions: {
                                            ...(prev.businessWishes?.directions || DEFAULT_SMART_SETTINGS.businessWishes!.directions),
                                            productionPercent: v as number
                                          }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                  />
                                </Box>

                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">Онлайн бизнес</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.businessWishes?.directions?.onlineBusinessPercent ?? 10}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.businessWishes?.directions?.onlineBusinessPercent ?? 10}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        businessWishes: {
                                          ...(prev.businessWishes || DEFAULT_SMART_SETTINGS.businessWishes!),
                                          directions: {
                                            ...(prev.businessWishes?.directions || DEFAULT_SMART_SETTINGS.businessWishes!.directions),
                                            onlineBusinessPercent: v as number
                                          }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                    color="info"
                                  />
                                </Box>
                              </Stack>
                            </Box>

                            <Divider sx={{ my: 0.5 }} />

                            {/* Qanday ko'mak kerak */}
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 800, color: theme.palette.text.secondary, display: 'block', mb: 1 }}
                              >
                                Kerakli ko‘mak turi (%):
                              </Typography>
                              <Stack spacing={1}>
                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">Кредит маблағи</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.businessWishes?.supportTypes?.creditPercent ?? 65}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.businessWishes?.supportTypes?.creditPercent ?? 65}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        businessWishes: {
                                          ...(prev.businessWishes || DEFAULT_SMART_SETTINGS.businessWishes!),
                                          supportTypes: {
                                            ...(prev.businessWishes?.supportTypes || DEFAULT_SMART_SETTINGS.businessWishes!.supportTypes),
                                            creditPercent: v as number
                                          }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                    color="warning"
                                  />
                                </Box>

                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">Ссуда / Субсидия</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.businessWishes?.supportTypes?.subsidyPercent ?? 25}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.businessWishes?.supportTypes?.subsidyPercent ?? 25}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        businessWishes: {
                                          ...(prev.businessWishes || DEFAULT_SMART_SETTINGS.businessWishes!),
                                          supportTypes: {
                                            ...(prev.businessWishes?.supportTypes || DEFAULT_SMART_SETTINGS.businessWishes!.supportTypes),
                                            subsidyPercent: v as number
                                          }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                    color="success"
                                  />
                                </Box>
                              </Stack>
                            </Box>

                            {/* Tushuntirish box */}
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                border: '1px dashed',
                                borderColor: alpha(theme.palette.secondary.main, 0.3)
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 800, color: theme.palette.secondary.main, display: 'block', mb: 0.5 }}
                              >
                                💡 Davlat Standarti (TAB 6):
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem', display: 'block' }}
                              >
                                Kredit so‘rovlariga 50 mln gacha, 50–100 mln so‘m; subsidiyaga esa asbob-uskuna xaridi va issiqxona qurish
                                taqsimlanadi. Ehtiyoj yo‘q fuqarolarga avtomatik «Эҳтиёж йўқ» belgilanadi.
                              </Typography>
                            </Paper>
                          </Stack>
                        </Box>
                      </Paper>
                    </Box>
                  )}

                  {/* 4-BO'LIM: IJTIMOIY-IQTISODIY VA KREDIT QARZDORLIGI */}
                  {smartSection === 'socioEconomic' && (
                    <Box>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          height: '100%',
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          bgcolor: alpha(theme.palette.background.default, 0.5)
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <CreditCardIcon sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                              4. 💳 Kredit & Ijtimoiy Holat
                            </Typography>
                          </Stack>
                          <Tooltip
                            title={smartSettings.modules?.socioEconomic !== false ? "Ushbu bo'limni o'chirish" : "Ushbu bo'limni yoqish"}
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  checked={smartSettings.modules?.socioEconomic !== false}
                                  onChange={(e) =>
                                    setSmartSettings((prev) => ({
                                      ...prev,
                                      modules: { ...prev.modules, socioEconomic: e.target.checked }
                                    }))
                                  }
                                  color="warning"
                                />
                              }
                              label={
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 800,
                                    color: smartSettings.modules?.socioEconomic !== false ? 'warning.main' : 'text.disabled'
                                  }}
                                >
                                  {smartSettings.modules?.socioEconomic !== false ? 'FAOL' : "O'CHIRILGAN"}
                                </Typography>
                              }
                              sx={{ m: 0 }}
                            />
                          </Tooltip>
                        </Stack>

                        <Box
                          sx={{
                            opacity: smartSettings.modules?.socioEconomic !== false ? 1 : 0.45,
                            pointerEvents: smartSettings.modules?.socioEconomic !== false ? 'auto' : 'none',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Stack spacing={2}>
                            {/* Kredit qarzdorligi bor foizi */}
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                border: '1px solid',
                                borderColor: theme.palette.divider
                              }}
                            >
                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                  Kredit qarzdorligi bor xonadonlar:
                                </Typography>
                                <Chip
                                  label={`${smartSettings.socioEconomic.hasDebtPercent}% BOR`}
                                  color={smartSettings.socioEconomic.hasDebtPercent > 0 ? 'warning' : 'default'}
                                  size="small"
                                  sx={{ fontWeight: 800 }}
                                />
                              </Stack>
                              <Slider
                                value={smartSettings.socioEconomic.hasDebtPercent}
                                onChange={(_, v) =>
                                  setSmartSettings((prev) => ({
                                    ...prev,
                                    socioEconomic: { ...prev.socioEconomic, hasDebtPercent: v as number }
                                  }))
                                }
                                min={0}
                                max={100}
                                color="warning"
                              />
                              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                  0% (Barchasi qarz yo'q)
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                  {100 - smartSettings.socioEconomic.hasDebtPercent}% Qarz yo‘q (Йўқ)
                                </Typography>
                              </Stack>
                            </Paper>

                            {/* Qarz turlari */}
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 800, color: theme.palette.text.secondary, display: 'block', mb: 1 }}
                              >
                                Qarz turlari taqsimoti (agar kredit mavjud bo'lsa):
                              </Typography>
                              <Stack spacing={1}>
                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">Bank krediti</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.socioEconomic.debtTypes.bankCreditPercent}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.socioEconomic.debtTypes.bankCreditPercent}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        socioEconomic: {
                                          ...prev.socioEconomic,
                                          debtTypes: { ...prev.socioEconomic.debtTypes, bankCreditPercent: v as number }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                  />
                                </Box>

                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">Ipoteka / Lizing</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.socioEconomic.debtTypes.mortgagePercent}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.socioEconomic.debtTypes.mortgagePercent}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        socioEconomic: {
                                          ...prev.socioEconomic,
                                          debtTypes: { ...prev.socioEconomic.debtTypes, mortgagePercent: v as number }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                  />
                                </Box>
                              </Stack>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                border: '1px solid',
                                borderColor: smartSettings.socioEconomic.incomeByResidents
                                  ? theme.palette.primary.main
                                  : theme.palette.divider
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={smartSettings.socioEconomic.incomeByResidents === true}
                                    onChange={(e) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        socioEconomic: { ...prev.socioEconomic, incomeByResidents: e.target.checked }
                                      }))
                                    }
                                    color="primary"
                                  />
                                }
                                label={
                                  <Box sx={{ ml: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                      Oylik daromad yashovchilar soniga qarab
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                      5 kishigacha — 3–5 mln so‘m, 6 va undan ko‘p — 10 mln so‘mdan yuqori
                                    </Typography>
                                  </Box>
                                }
                                sx={{ m: 0 }}
                              />
                            </Paper>

                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                border: '1px solid',
                                borderColor: smartSettings.socioEconomic.preserveExistingIncome
                                  ? theme.palette.success.main
                                  : theme.palette.divider
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={smartSettings.socioEconomic.preserveExistingIncome === true}
                                    onChange={(e) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        socioEconomic: { ...prev.socioEconomic, preserveExistingIncome: e.target.checked }
                                      }))
                                    }
                                    color="success"
                                  />
                                }
                                label={
                                  <Box sx={{ ml: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                      Avval kiritilgan daromadga tegilmasin
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                      Daromad manbai yoki oylik daromad to‘ldirilgan xonadonlarda mavjud qiymat saqlanadi
                                    </Typography>
                                  </Box>
                                }
                                sx={{ m: 0 }}
                              />
                            </Paper>

                            {/* Asosiy daromad manbai */}
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 800, color: theme.palette.text.secondary, display: 'block', mb: 1 }}
                              >
                                Xonadonning asosiy daromad manbai taqsimoti:
                              </Typography>
                              <Stack spacing={1}>
                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">Ish haqi</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.socioEconomic.incomeSources.salaryPercent}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.socioEconomic.incomeSources.salaryPercent}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        socioEconomic: {
                                          ...prev.socioEconomic,
                                          incomeSources: { ...prev.socioEconomic.incomeSources, salaryPercent: v as number }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                  />
                                </Box>

                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">Tomorqa va qishloq xo‘jaligi</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.socioEconomic.incomeSources.agriculturePercent}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.socioEconomic.incomeSources.agriculturePercent}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        socioEconomic: {
                                          ...prev.socioEconomic,
                                          incomeSources: { ...prev.socioEconomic.incomeSources, agriculturePercent: v as number }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                    color="success"
                                  />
                                </Box>
                              </Stack>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            {/* Bir oylik daromad miqdori taqsimoti */}
                            <Box
                              sx={{
                                opacity: smartSettings.socioEconomic.incomeByResidents ? 0.4 : 1,
                                pointerEvents: smartSettings.socioEconomic.incomeByResidents ? 'none' : 'auto'
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 800, color: theme.palette.text.secondary, display: 'block', mb: 1 }}
                              >
                                Bir oylik daromad miqdori taqsimoti (%):
                              </Typography>
                              <Stack spacing={1}>
                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">1 млн сўмгача (month_income_id: 1)</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.socioEconomic.monthlyIncomes?.under1mPercent ?? 5}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.socioEconomic.monthlyIncomes?.under1mPercent ?? 5}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        socioEconomic: {
                                          ...prev.socioEconomic,
                                          monthlyIncomes: {
                                            ...(prev.socioEconomic.monthlyIncomes || DEFAULT_SMART_SETTINGS.socioEconomic.monthlyIncomes),
                                            under1mPercent: v as number
                                          }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                    color="warning"
                                  />
                                </Box>

                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">1 – 3 млн сўм (month_income_id: 2)</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.socioEconomic.monthlyIncomes?.from1mTo3mPercent ?? 50}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.socioEconomic.monthlyIncomes?.from1mTo3mPercent ?? 50}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        socioEconomic: {
                                          ...prev.socioEconomic,
                                          monthlyIncomes: {
                                            ...(prev.socioEconomic.monthlyIncomes || DEFAULT_SMART_SETTINGS.socioEconomic.monthlyIncomes),
                                            from1mTo3mPercent: v as number
                                          }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                    color="primary"
                                  />
                                </Box>

                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">3 – 5 млн сўм (month_income_id: 3)</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.socioEconomic.monthlyIncomes?.from3mTo5mPercent ?? 32}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.socioEconomic.monthlyIncomes?.from3mTo5mPercent ?? 32}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        socioEconomic: {
                                          ...prev.socioEconomic,
                                          monthlyIncomes: {
                                            ...(prev.socioEconomic.monthlyIncomes || DEFAULT_SMART_SETTINGS.socioEconomic.monthlyIncomes),
                                            from3mTo5mPercent: v as number
                                          }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                    color="success"
                                  />
                                </Box>

                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">5 – 10 млн сўм (month_income_id: 4)</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.socioEconomic.monthlyIncomes?.from5mTo10mPercent ?? 10}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.socioEconomic.monthlyIncomes?.from5mTo10mPercent ?? 10}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        socioEconomic: {
                                          ...prev.socioEconomic,
                                          monthlyIncomes: {
                                            ...(prev.socioEconomic.monthlyIncomes || DEFAULT_SMART_SETTINGS.socioEconomic.monthlyIncomes),
                                            from5mTo10mPercent: v as number
                                          }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                    color="info"
                                  />
                                </Box>

                                <Box>
                                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="caption">10 млн сўмдан юқори (month_income_id: 5)</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                      {smartSettings.socioEconomic.monthlyIncomes?.above10mPercent ?? 3}%
                                    </Typography>
                                  </Stack>
                                  <Slider
                                    value={smartSettings.socioEconomic.monthlyIncomes?.above10mPercent ?? 3}
                                    onChange={(_, v) =>
                                      setSmartSettings((prev) => ({
                                        ...prev,
                                        socioEconomic: {
                                          ...prev.socioEconomic,
                                          monthlyIncomes: {
                                            ...(prev.socioEconomic.monthlyIncomes || DEFAULT_SMART_SETTINGS.socioEconomic.monthlyIncomes),
                                            above10mPercent: v as number
                                          }
                                        }
                                      }))
                                    }
                                    min={0}
                                    max={100}
                                    size="small"
                                    color="secondary"
                                  />
                                </Box>
                              </Stack>
                            </Box>

                            {/* Daromad miqdori bo'yicha tushuntirish */}
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.warning.main, 0.08),
                                border: '1px dashed',
                                borderColor: alpha(theme.palette.warning.main, 0.3)
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 800, color: theme.palette.warning.main, display: 'block', mb: 0.5 }}
                              >
                                ℹ️ Daromad miqdori oraliqlari (Davlat standarti):
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem', display: 'block' }}
                              >
                                Online Mahalla tizimida oylik daromad aniq so'mda emas, balki rasmiy toifalar (1 mln gacha, 1–3 mln, 3–5
                                mln, 5–10 mln, 10+ mln) shaklida qabul qilinadi. Siz belgilagan foizlar shu oraliqlarga ehtimollik bo'yicha
                                taqsimlanadi.
                              </Typography>
                            </Paper>
                          </Stack>
                        </Box>
                      </Paper>
                    </Box>
                  )}

                  {/* 5-BO'LIM: INFRATUZILMA (XONADON TA'MINOTI - TAB 54602) */}
                  {smartSection === 'infrastructure' && (
                    <Box>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          height: '100%',
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          bgcolor: alpha(theme.palette.background.default, 0.5)
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <JobIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                              5. 💡 Infratuzilma (Xonadon Ta'minoti)
                            </Typography>
                          </Stack>
                          <Tooltip
                            title={smartSettings.modules?.infrastructure !== false ? "Ushbu bo'limni o'chirish" : "Ushbu bo'limni yoqish"}
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  checked={smartSettings.modules?.infrastructure !== false}
                                  onChange={(e) =>
                                    setSmartSettings((prev) => ({
                                      ...prev,
                                      modules: { ...prev.modules, infrastructure: e.target.checked }
                                    }))
                                  }
                                  color="success"
                                />
                              }
                              label={
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 800,
                                    color: smartSettings.modules?.infrastructure !== false ? 'success.main' : 'text.disabled'
                                  }}
                                >
                                  {smartSettings.modules?.infrastructure !== false ? 'FAOL' : "O'CHIRILGAN"}
                                </Typography>
                              }
                              sx={{ m: 0 }}
                            />
                          </Tooltip>
                        </Stack>

                        <Box
                          sx={{
                            opacity: smartSettings.modules?.infrastructure !== false ? 1 : 0.45,
                            pointerEvents: smartSettings.modules?.infrastructure !== false ? 'auto' : 'none',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Stack spacing={1.5}>
                            <Alert severity={smartSettings.employment.mode === 'burgansoy' ? 'info' : 'success'} sx={{ borderRadius: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                {smartSettings.employment.mode === 'burgansoy'
                                  ? '⭐ Burgansoy Infratuzilma Qoidasi:'
                                  : '💡 Xonadon Infratuzilma Ko‘rsatkichlari (TAB 54602):'}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                1. Elektr: <b>{(smartSettings.infrastructure.electricityMode ?? 1) === 1 ? 'Ҳа (1)' : 'Йўқ (0)'}</b> | 2.
                                Tabiiy gaz:{' '}
                                <b style={{ color: (smartSettings.infrastructure.gasMode ?? 0) === 0 ? '#d32f2f' : '#2e7d32' }}>
                                  {(smartSettings.infrastructure.gasMode ?? 0) === 1 ? 'Ҳа (1)' : 'Йўқ (0)'}
                                </b>
                                <br />
                                3. Ichimlik suvi:{' '}
                                <b>{(smartSettings.infrastructure.drinkingWaterMode ?? 1) === 1 ? 'Ҳа (1)' : 'Йўқ (0)'}</b> | 4. Sug‘orish
                                suvi: <b>{(smartSettings.infrastructure.irrigationWaterMode ?? 1) === 1 ? 'Ҳа (1)' : 'Йўқ (0)'}</b>
                                <br />
                                5. Kanalizatsiya: <b>{(smartSettings.infrastructure.sewerageMode ?? 0) === 1 ? 'Ҳа (1)' : 'Йўқ (0)'}</b>
                              </Typography>
                            </Alert>

                            {/* 1. Elektr energiyasi */}
                            <Box
                              sx={{
                                p: 1.25,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                border: '1px solid',
                                borderColor: theme.palette.divider,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1
                              }}
                            >
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                                <JobIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                  1. Elektr energiyasi mavjudmi?
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                                <Button
                                  size="small"
                                  variant={(smartSettings.infrastructure.electricityMode ?? 1) === 1 ? 'contained' : 'outlined'}
                                  color="success"
                                  onClick={() =>
                                    setSmartSettings((prev) => ({
                                      ...prev,
                                      infrastructure: { ...prev.infrastructure, electricityMode: 1 }
                                    }))
                                  }
                                  sx={{ minWidth: 55, py: 0.3, px: 1, fontSize: '0.75rem', fontWeight: 700, borderRadius: 1.5 }}
                                >
                                  Ҳа
                                </Button>
                                <Button
                                  size="small"
                                  variant={(smartSettings.infrastructure.electricityMode ?? 1) === 0 ? 'contained' : 'outlined'}
                                  color="error"
                                  onClick={() =>
                                    setSmartSettings((prev) => ({
                                      ...prev,
                                      infrastructure: { ...prev.infrastructure, electricityMode: 0 }
                                    }))
                                  }
                                  sx={{ minWidth: 55, py: 0.3, px: 1, fontSize: '0.75rem', fontWeight: 700, borderRadius: 1.5 }}
                                >
                                  Йўқ
                                </Button>
                              </Stack>
                            </Box>

                            {/* 2. Tabiiy gaz */}
                            <Box
                              sx={{
                                p: 1.25,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                border: '1px solid',
                                borderColor:
                                  (smartSettings.infrastructure.gasMode ?? 0) === 0
                                    ? alpha(theme.palette.error.main, 0.4)
                                    : theme.palette.divider,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1
                              }}
                            >
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                                <GasIcon sx={{ color: 'error.main', fontSize: 20 }} />
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                    2. Xonadonda tabiiy gaz mavjudmi?
                                  </Typography>
                                  {(smartSettings.infrastructure.gasMode ?? 0) === 0 && (
                                    <Typography
                                      variant="caption"
                                      sx={{ color: 'error.main', fontWeight: 800, display: 'block', fontSize: '0.72rem' }}
                                    >
                                      • Tabiiy gaz: Йўқ (0) qilib kiritiladi
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                              <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                                <Button
                                  size="small"
                                  variant={(smartSettings.infrastructure.gasMode ?? 0) === 1 ? 'contained' : 'outlined'}
                                  color="success"
                                  onClick={() =>
                                    setSmartSettings((prev) => ({ ...prev, infrastructure: { ...prev.infrastructure, gasMode: 1 } }))
                                  }
                                  sx={{ minWidth: 55, py: 0.3, px: 1, fontSize: '0.75rem', fontWeight: 700, borderRadius: 1.5 }}
                                >
                                  Ҳа
                                </Button>
                                <Button
                                  size="small"
                                  variant={(smartSettings.infrastructure.gasMode ?? 0) === 0 ? 'contained' : 'outlined'}
                                  color="error"
                                  onClick={() =>
                                    setSmartSettings((prev) => ({ ...prev, infrastructure: { ...prev.infrastructure, gasMode: 0 } }))
                                  }
                                  sx={{ minWidth: 55, py: 0.3, px: 1, fontSize: '0.75rem', fontWeight: 700, borderRadius: 1.5 }}
                                >
                                  Йўқ
                                </Button>
                              </Stack>
                            </Box>

                            {/* 3. Ichimlik suvi */}
                            <Box
                              sx={{
                                p: 1.25,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                border: '1px solid',
                                borderColor: theme.palette.divider,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1
                              }}
                            >
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                                <WaterDropIcon sx={{ color: 'info.main', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                  3. Ichimlik suvi mavjudmi?
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                                <Button
                                  size="small"
                                  variant={(smartSettings.infrastructure.drinkingWaterMode ?? 1) === 1 ? 'contained' : 'outlined'}
                                  color="success"
                                  onClick={() =>
                                    setSmartSettings((prev) => ({
                                      ...prev,
                                      infrastructure: { ...prev.infrastructure, drinkingWaterMode: 1 }
                                    }))
                                  }
                                  sx={{ minWidth: 55, py: 0.3, px: 1, fontSize: '0.75rem', fontWeight: 700, borderRadius: 1.5 }}
                                >
                                  Ҳа
                                </Button>
                                <Button
                                  size="small"
                                  variant={(smartSettings.infrastructure.drinkingWaterMode ?? 1) === 0 ? 'contained' : 'outlined'}
                                  color="error"
                                  onClick={() =>
                                    setSmartSettings((prev) => ({
                                      ...prev,
                                      infrastructure: { ...prev.infrastructure, drinkingWaterMode: 0 }
                                    }))
                                  }
                                  sx={{ minWidth: 55, py: 0.3, px: 1, fontSize: '0.75rem', fontWeight: 700, borderRadius: 1.5 }}
                                >
                                  Йўқ
                                </Button>
                              </Stack>
                            </Box>

                            {/* 4. Sug'orish suvi */}
                            <Box
                              sx={{
                                p: 1.25,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                border: '1px solid',
                                borderColor: theme.palette.divider,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1
                              }}
                            >
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                                <OpacityIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                  4. Sug‘orish (oqova) suvi mavjudmi?
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                                <Button
                                  size="small"
                                  variant={(smartSettings.infrastructure.irrigationWaterMode ?? 1) === 1 ? 'contained' : 'outlined'}
                                  color="success"
                                  onClick={() =>
                                    setSmartSettings((prev) => ({
                                      ...prev,
                                      infrastructure: { ...prev.infrastructure, irrigationWaterMode: 1 }
                                    }))
                                  }
                                  sx={{ minWidth: 55, py: 0.3, px: 1, fontSize: '0.75rem', fontWeight: 700, borderRadius: 1.5 }}
                                >
                                  Ҳа
                                </Button>
                                <Button
                                  size="small"
                                  variant={(smartSettings.infrastructure.irrigationWaterMode ?? 1) === 0 ? 'contained' : 'outlined'}
                                  color="error"
                                  onClick={() =>
                                    setSmartSettings((prev) => ({
                                      ...prev,
                                      infrastructure: { ...prev.infrastructure, irrigationWaterMode: 0 }
                                    }))
                                  }
                                  sx={{ minWidth: 55, py: 0.3, px: 1, fontSize: '0.75rem', fontWeight: 700, borderRadius: 1.5 }}
                                >
                                  Йўқ
                                </Button>
                              </Stack>
                            </Box>

                            {/* 5. Kanalizatsiya */}
                            <Box
                              sx={{
                                p: 1.25,
                                borderRadius: 2,
                                bgcolor: theme.palette.background.paper,
                                border: '1px solid',
                                borderColor: theme.palette.divider,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1
                              }}
                            >
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                                <SewerageIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                  5. Kanalizatsiya tizimi mavjudmi?
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                                <Button
                                  size="small"
                                  variant={(smartSettings.infrastructure.sewerageMode ?? 0) === 1 ? 'contained' : 'outlined'}
                                  color="success"
                                  onClick={() =>
                                    setSmartSettings((prev) => ({ ...prev, infrastructure: { ...prev.infrastructure, sewerageMode: 1 } }))
                                  }
                                  sx={{ minWidth: 55, py: 0.3, px: 1, fontSize: '0.75rem', fontWeight: 700, borderRadius: 1.5 }}
                                >
                                  Ҳа
                                </Button>
                                <Button
                                  size="small"
                                  variant={(smartSettings.infrastructure.sewerageMode ?? 0) === 0 ? 'contained' : 'outlined'}
                                  color="error"
                                  onClick={() =>
                                    setSmartSettings((prev) => ({ ...prev, infrastructure: { ...prev.infrastructure, sewerageMode: 0 } }))
                                  }
                                  sx={{ minWidth: 55, py: 0.3, px: 1, fontSize: '0.75rem', fontWeight: 700, borderRadius: 1.5 }}
                                >
                                  Йўқ
                                </Button>
                              </Stack>
                            </Box>
                          </Stack>
                        </Box>
                      </Paper>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Action tugmalari va Ishga tushirish paneli (pastda doim ko'rinib turadi) */}
              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: 2,
                  position: 'sticky',
                  bottom: 12,
                  zIndex: 3,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.35),
                  bgcolor: theme.palette.background.paper,
                  boxShadow: theme.palette.mode === 'dark' ? '0 6px 24px rgba(0,0,0,0.55)' : '0 6px 24px rgba(33, 150, 243, 0.18)'
                }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      🚀 Smart Xatlovni Ishga Tushirish
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Qo‘llanilayotgan Shablon: <b>{surveyPresets.find((p) => p._id === selectedPresetId)?.name || 'Maxsus sozlama'}</b> |
                      Server xavfsiz va bir tekis sur'atda to‘ldiriladi.
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="large"
                      disabled={startingSmartJob || !selectedStreetId}
                      onClick={() => {
                        setSmartTargetScope('street');
                        setSmartConfirmDialogOpen(true);
                      }}
                      startIcon={<PlayArrowIcon />}
                      sx={{ height: 46, borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 3 }}
                    >
                      {selectedStreetObj ? `«${selectedStreetObj.name}» ko‘chasini to‘ldirish` : 'Tanlangan ko‘chani to‘ldirish'}
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={startingSmartJob || !districtId}
                      onClick={() => {
                        setSmartTargetScope('mahalla');
                        setSmartConfirmDialogOpen(true);
                      }}
                      startIcon={startingSmartJob ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                      sx={{
                        height: 46,
                        borderRadius: 2,
                        fontWeight: 800,
                        textTransform: 'none',
                        px: 3,
                        boxShadow: '0 4px 16px rgba(25, 118, 210, 0.35)'
                      }}
                    >
                      ⚡ Barcha Mahallani To‘ldirish ({streets.length} ta ko‘cha)
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── TAB 3: JONLI PROGRESS MONITORI (MISSION CONTROL) ── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === 'monitor' && (
        <Box>
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
                  bgcolor:
                    theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.6) : alpha(theme.palette.primary.main, 0.02)
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
                      color={
                        selectedJobDate === 'yesterday' || (selectedJobDate === yesterdayDateStr && !customJobDate) ? 'primary' : 'default'
                      }
                      variant={
                        selectedJobDate === 'yesterday' || (selectedJobDate === yesterdayDateStr && !customJobDate) ? 'filled' : 'outlined'
                      }
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
                                              : job.jobType === 'smart_survey_fill'
                                                ? `⚡ Smart Xatlov (${job.mahallaName || 'Mahalla'}${job.streetName ? ` • ${job.streetName}` : ''})`
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
                                            icon={
                                              job.status === 'PENDING' ? <PlayArrowIcon sx={{ fontSize: '13px !important' }} /> : undefined
                                            }
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
                                          {job.jobType === 'smart_survey_fill' && job.surveyedHomeIds?.length ? (
                                            <Tooltip title="Xatlov qilingan xonadonlar ID ro‘yxati">
                                              <Button
                                                size="small"
                                                color="success"
                                                variant="text"
                                                onClick={() => setSelectedJobForHomeIds(job)}
                                                sx={{ fontWeight: 700, minWidth: 32, p: 0.2 }}
                                              >
                                                {job.success}
                                              </Button>
                                            </Tooltip>
                                          ) : (
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                              {job.success}
                                            </Typography>
                                          )}
                                        </TableCell>

                                        <TableCell align="center">
                                          {job.jobType === 'smart_survey_fill' ? (
                                            <Tooltip
                                              title={`Bandlik: ${job.employmentUpdated || 0} ta | Tadbirkorlik: ${job.businessWishesUpdated || 0} ta`}
                                            >
                                              <Chip
                                                size="small"
                                                label={`${(job.employmentUpdated || 0) + (job.businessWishesUpdated || 0)} ta`}
                                                color="info"
                                                variant="outlined"
                                                sx={{ fontWeight: 700, fontSize: '0.72rem', height: 20 }}
                                              />
                                            </Tooltip>
                                          ) : (
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                                              {job.familyMembersAdded || 0}
                                            </Typography>
                                          )}
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
                                                    startingJobId === job.id ? (
                                                      <CircularProgress size={12} color="inherit" />
                                                    ) : (
                                                      <PlayArrowIcon />
                                                    )
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
                                            {Boolean(job.jobType === 'smart_survey_fill' || job.reportSummary) && (
                                              <Tooltip title="Batafsil xatlov hisoboti">
                                                <IconButton
                                                  size="small"
                                                  color="primary"
                                                  onClick={() => handleOpenReport(job)}
                                                  sx={{
                                                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                                                    '&:hover': {
                                                      bgcolor: alpha(
                                                        theme.palette.primary.main,
                                                        theme.palette.mode === 'dark' ? 0.35 : 0.16
                                                      )
                                                    }
                                                  }}
                                                >
                                                  <AssessmentIcon fontSize="small" />
                                                </IconButton>
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

      {/* ── TAB 5: MOLIYA VA BALANS (ACCOUNTING & BILLING) ── */}
      {activeTab === 'billing' && (
        <Box>
          {/* ── KPI Summary Cards ── */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* 1. Jami Tushum (To'lovlar) */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.03)
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      color: theme.palette.primary.main,
                      display: 'flex'
                    }}
                  >
                    <PaidIcon />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                      Jami Tushum (To'langan)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                      {(billingSummary?.totalPaid || 0).toLocaleString()} so'm
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* 2. Bajarilgan Xizmatlar */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.08 : 0.03)
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.secondary.main, 0.15),
                      color: theme.palette.secondary.main,
                      display: 'flex'
                    }}
                  >
                    <BuildIcon />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                      Ko'rsatilgan Xizmatlar
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.secondary.main }}>
                      {(billingSummary?.totalCharged || 0).toLocaleString()} so'm
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* 3. Mijozlar Haqdorligi (Oldindan to'lov) - YASHIL */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.success.main, 0.4),
                  bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.12 : 0.05)
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.success.main, 0.2),
                      color: theme.palette.success.main,
                      display: 'flex'
                    }}
                  >
                    <CheckCircleIcon />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 800 }}>
                      Mijoz Haqdorligi (Prepaid)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.success.main }}>
                      +{(billingSummary?.totalPrepaid || 0).toLocaleString()} so'm
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* 4. Mijozlar Qarzdorligi - QIZIL */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.error.main, 0.4),
                  bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.12 : 0.05)
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.error.main, 0.2),
                      color: theme.palette.error.main,
                      display: 'flex'
                    }}
                  >
                    <ErrorIcon />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.error.main, fontWeight: 800 }}>
                      Mijoz Qarzdorligi (Qarz)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.error.main }}>
                      -{(billingSummary?.totalDebt || 0).toLocaleString()} so'm
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* 5. Umumiy Ishlar Yig'indisi */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  bgcolor: theme.palette.background.paper
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.15),
                      color: theme.palette.info.main,
                      display: 'flex'
                    }}
                  >
                    <JobIcon />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                      Bajarilgan Ishlar
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                      {billingSummary?.totalJobs || 0} ta job • {(billingSummary?.totalProcessedHomes || 0).toLocaleString()} xonadon
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* ── Search & Filter Controls ── */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: theme.palette.divider,
              bgcolor: theme.palette.background.paper
            }}
          >
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              {/* Qidiruv */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Mahalla nomi yoki ID raqami bo'yicha qidirish..."
                  value={billingSearchQuery}
                  onChange={(e) => setBillingSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: billingSearchQuery ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setBillingSearchQuery('')}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                      sx: { borderRadius: 2 }
                    }
                  }}
                />
              </Grid>

              {/* Tuman filtri */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="billing-district-label">Tuman bo'yicha</InputLabel>
                  <Select
                    labelId="billing-district-label"
                    label="Tuman bo'yicha"
                    value={billingDistrictFilter}
                    onChange={(e) => setBillingDistrictFilter(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">
                      <em>Barcha tumanlar</em>
                    </MenuItem>
                    {savedAccountsByDistrict.map((d) => (
                      <MenuItem key={d.areaId} value={d.areaId}>
                        {d.districtName} ({d.accounts.length} ta)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Balans holati filtri */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ToggleButtonGroup
                  value={billingStatusFilter}
                  exclusive
                  onChange={(_, val) => val && setBillingStatusFilter(val)}
                  size="small"
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  <ToggleButton value="ALL" sx={{ fontWeight: 700, textTransform: 'none', px: 1 }}>
                    Barchasi ({billingList.length})
                  </ToggleButton>
                  <ToggleButton
                    value="DEBT"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 1,
                      color: billingStatusFilter === 'DEBT' ? undefined : theme.palette.error.main
                    }}
                  >
                    🔴 Qarzdorlar ({billingList.filter((m) => m.balance < 0).length})
                  </ToggleButton>
                  <ToggleButton
                    value="PREPAID"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 1,
                      color: billingStatusFilter === 'PREPAID' ? undefined : theme.palette.success.main
                    }}
                  >
                    🟢 Haqdorlar ({billingList.filter((m) => m.balance > 0).length})
                  </ToggleButton>
                  <ToggleButton value="ZERO" sx={{ fontWeight: 700, textTransform: 'none', px: 1 }}>
                    ⚫ 0 Balans
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              {/* Yangilash tugmasi */}
              <Grid size={{ xs: 12, md: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={fetchBillingSummary}
                  disabled={loadingBilling}
                  sx={{ height: 40, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                  {loadingBilling ? <CircularProgress size={18} /> : <RefreshIcon />}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* ── Mahallalar Moliya Jadvali ── */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: theme.palette.divider,
              overflow: 'hidden',
              bgcolor: theme.palette.background.paper
            }}
          >
            {loadingBilling ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <CircularProgress size={36} sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Moliya va hisob-kitob ma'lumotlari yuklanmoqda...
                </Typography>
              </Box>
            ) : filteredBillingList.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <WalletIcon sx={{ fontSize: 44, color: theme.palette.text.secondary, mb: 1.5 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Hech qanday mahalla topilmadi
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                  Qidiruv so'zini yoki filtr parametrlarini o'zgartirib ko'ring.
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: '72vh' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, width: 50, bgcolor: theme.palette.background.default }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 800, bgcolor: theme.palette.background.default }}>Mahalla & Hudud</TableCell>
                      <TableCell sx={{ fontWeight: 800, bgcolor: theme.palette.background.default }}>
                        Bajarilgan Ishlar Yig'indisi
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, bgcolor: theme.palette.background.default, textAlign: 'right' }}>
                        Jami To'langan
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, bgcolor: theme.palette.background.default, textAlign: 'right' }}>
                        Xizmat Narxi
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, bgcolor: theme.palette.background.default, textAlign: 'center' }}>
                        Sof Balans (Holati)
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, bgcolor: theme.palette.background.default, textAlign: 'center', width: 260 }}>
                        Amallar
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedBillingList.map((item, idx) => {
                      const balance = Number(item.balance || 0);
                      const isPrepaid = balance > 0;
                      const isDebt = balance < 0;
                      const districtName =
                        item.area_name || (item.area_id ? districtNames[String(item.area_id)] : '') || 'Tuman aniqlanmagan';

                      return (
                        <TableRow
                          key={String(item.district_id)}
                          hover
                          sx={{
                            bgcolor: isDebt
                              ? alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.05 : 0.02)
                              : isPrepaid
                                ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.05 : 0.02)
                                : undefined,
                            '&:last-child td, &:last-child th': { border: 0 }
                          }}
                        >
                          <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                            {billingPage * billingRowsPerPage + idx + 1}
                          </TableCell>

                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                              {item.mahalla_name}
                            </Typography>
                            <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mt: 0.4, flexWrap: 'wrap' }}>
                              <Chip
                                label={`ID: ${item.district_id}`}
                                size="small"
                                sx={{ height: 18, fontSize: '0.68rem', fontFamily: 'monospace' }}
                              />
                              <Chip
                                label={districtName}
                                size="small"
                                variant="outlined"
                                sx={{ height: 18, fontSize: '0.68rem', fontWeight: 600 }}
                              />
                            </Stack>
                          </TableCell>

                          {/* Bajarilgan ishlar yig'indisi */}
                          <TableCell>
                            {item.jobsCount > 0 ? (
                              <Stack spacing={0.5}>
                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                  <Chip
                                    icon={<JobIcon sx={{ fontSize: '0.8rem !important' }} />}
                                    label={`${item.jobsCount} ta job`}
                                    size="small"
                                    color="primary"
                                    sx={{ height: 20, fontSize: '0.72rem', fontWeight: 700 }}
                                  />
                                  <Chip
                                    icon={<HomeIcon sx={{ fontSize: '0.8rem !important' }} />}
                                    label={`${item.totalProcessedHomes} xonadon (${item.totalSuccessHomes} muvaffaqiyatli)`}
                                    size="small"
                                    sx={{ height: 20, fontSize: '0.72rem', fontWeight: 600 }}
                                  />
                                </Stack>
                                {item.totalFamilyMembers > 0 && (
                                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                    👨‍👩‍👧‍👦 {item.totalFamilyMembers.toLocaleString()} ta oila a'zosi
                                  </Typography>
                                )}
                              </Stack>
                            ) : (
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                                Hali job bajarilmagan
                              </Typography>
                            )}
                          </TableCell>

                          {/* Jami To'langan */}
                          <TableCell sx={{ textAlign: 'right', fontWeight: 700, color: theme.palette.text.primary }}>
                            {Number(item.total_paid || 0).toLocaleString()} so'm
                          </TableCell>

                          {/* Jami Xizmat ko'rsatilgan */}
                          <TableCell sx={{ textAlign: 'right', fontWeight: 700, color: theme.palette.text.secondary }}>
                            {Number(item.total_charged || 0).toLocaleString()} so'm
                          </TableCell>

                          {/* Sof Balans (Ranglar bo'yicha qat'iy qoida) */}
                          <TableCell sx={{ textAlign: 'center' }}>
                            {isPrepaid ? (
                              <Chip
                                label={`+${balance.toLocaleString()} so'm (Haqdor)`}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.75rem',
                                  bgcolor: alpha(theme.palette.success.main, 0.14),
                                  color: theme.palette.success.main,
                                  border: '1px solid',
                                  borderColor: alpha(theme.palette.success.main, 0.35)
                                }}
                              />
                            ) : isDebt ? (
                              <Chip
                                label={`${balance.toLocaleString()} so'm (Qarzdor)`}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.75rem',
                                  bgcolor: alpha(theme.palette.error.main, 0.14),
                                  color: theme.palette.error.main,
                                  border: '1px solid',
                                  borderColor: alpha(theme.palette.error.main, 0.35)
                                }}
                              />
                            ) : (
                              <Chip
                                label="0 so'm (Hisoblashgan)"
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  bgcolor: alpha(theme.palette.text.primary, 0.06),
                                  color: theme.palette.text.primary,
                                  border: '1px solid',
                                  borderColor: theme.palette.divider
                                }}
                              />
                            )}
                          </TableCell>

                          {/* Amallar */}
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                              <Tooltip title="To'lov qabul qilish (Balansni oshirish)">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  startIcon={<PaidIcon sx={{ fontSize: 14 }} />}
                                  onClick={() => {
                                    setSelectedBillingMahalla(item);
                                    setPaymentAmount('');
                                    setPaymentComment('');
                                    setPaymentDialogOpen(true);
                                  }}
                                  sx={{ borderRadius: 1.5, py: 0.3, px: 1, textTransform: 'none', fontWeight: 700, fontSize: '0.74rem' }}
                                >
                                  To'lov
                                </Button>
                              </Tooltip>

                              <Tooltip title="Xizmat kiritish (Haqdorlikdan kamaytirish)">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  startIcon={<BuildIcon sx={{ fontSize: 14 }} />}
                                  onClick={() => {
                                    setSelectedBillingMahalla(item);
                                    setServiceAmount('');
                                    setServiceComment('');
                                    setServiceChargeDialogOpen(true);
                                  }}
                                  sx={{ borderRadius: 1.5, py: 0.3, px: 1, textTransform: 'none', fontWeight: 700, fontSize: '0.74rem' }}
                                >
                                  Xizmat
                                </Button>
                              </Tooltip>

                              <Tooltip title="Tranzaksiyalar tarixi">
                                <IconButton size="small" onClick={() => handleOpenBillingHistory(item)} sx={{ p: 0.5 }}>
                                  <HistoryIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Ushbu mahalla bo'yicha Sinxronizatsiyani ishga tushirish">
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  startIcon={<PlayArrowIcon sx={{ fontSize: 14 }} />}
                                  onClick={() => handleLaunchJobFromBilling(item)}
                                  sx={{
                                    borderRadius: 1.5,
                                    py: 0.3,
                                    px: 1.2,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.74rem',
                                    boxShadow: 'none'
                                  }}
                                >
                                  Job
                                </Button>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {!loadingBilling && filteredBillingList.length > 0 && (
              <TablePagination
                component="div"
                count={filteredBillingList.length}
                page={Math.min(billingPage, Math.max(0, Math.ceil(filteredBillingList.length / billingRowsPerPage) - 1))}
                onPageChange={(_, p) => setBillingPage(p)}
                rowsPerPage={billingRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setBillingRowsPerPage(parseInt(e.target.value, 10));
                  setBillingPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
                labelRowsPerPage="Sahifada:"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
              />
            )}
          </Paper>
        </Box>
      )}

      {/* ── TO'LOV QABUL QILISH DIALOGI ── */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => !submittingBilling && setPaymentDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>💵 To‘lov Qabul Qilish</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
            {selectedBillingMahalla?.mahalla_name}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 2 }}>
            Joriy balans: <b>{Number(selectedBillingMahalla?.balance || 0).toLocaleString()} so'm</b> • ID:{' '}
            {selectedBillingMahalla?.district_id}
          </Typography>

          <TextField
            autoFocus
            fullWidth
            size="small"
            label="To'lov summasi (so'm)"
            placeholder="Masalan: 1000000"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            slotProps={{
              input: {
                sx: { borderRadius: 2, mb: 1.5, fontWeight: 700, fontSize: '1.05rem' }
              }
            }}
          />

          {/* Tezkor summalar */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
            {[500000, 1000000, 2000000, 5000000].map((amt) => (
              <Chip
                key={amt}
                label={`+${amt.toLocaleString()}`}
                clickable
                onClick={() => setPaymentAmount(String(amt))}
                size="small"
                variant="outlined"
                color="success"
                sx={{ fontWeight: 700, borderRadius: 1.5 }}
              />
            ))}
          </Stack>

          <TextField
            fullWidth
            size="small"
            label="To'lov izohi / maqsadi"
            placeholder="Masalan: Bank o'tkazmasi orqali, avans to'lovi"
            value={paymentComment}
            onChange={(e) => setPaymentComment(e.target.value)}
            multiline
            rows={2}
            slotProps={{
              input: {
                sx: { borderRadius: 2 }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setPaymentDialogOpen(false)}
            disabled={submittingBilling}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleSaveBillingTransaction('PAYMENT')}
            disabled={submittingBilling || !paymentAmount}
            startIcon={submittingBilling ? <CircularProgress size={16} color="inherit" /> : <PaidIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, px: 3 }}
          >
            {submittingBilling ? 'Saqlanmoqda...' : 'To‘lovni Qabul Qilish'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── XIZMAT KIRITISH (HAQDORLIKDAN YECHISH) DIALOGI ── */}
      <Dialog
        open={serviceChargeDialogOpen}
        onClose={() => !submittingBilling && setServiceChargeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>🛠 Ko‘rsatilgan Xizmat Narxini Kiritish</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
            {selectedBillingMahalla?.mahalla_name}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 2 }}>
            Joriy balans: <b>{Number(selectedBillingMahalla?.balance || 0).toLocaleString()} so'm</b> (bu summa haqdorlikdan kamaytiriladi)
          </Typography>

          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Xizmat narxi (so'm)"
            placeholder="Masalan: 500000"
            value={serviceAmount}
            onChange={(e) => setServiceAmount(e.target.value)}
            slotProps={{
              input: {
                sx: { borderRadius: 2, mb: 1.5, fontWeight: 700, fontSize: '1.05rem' }
              }
            }}
          />

          {/* Tezkor summalar */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
            {[300000, 500000, 1000000, 2000000].map((amt) => (
              <Chip
                key={amt}
                label={`${amt.toLocaleString()}`}
                clickable
                onClick={() => setServiceAmount(String(amt))}
                size="small"
                variant="outlined"
                color="warning"
                sx={{ fontWeight: 700, borderRadius: 1.5 }}
              />
            ))}
          </Stack>

          <TextField
            fullWidth
            size="small"
            label="Ko'rsatilgan xizmat tavsifi"
            placeholder="Masalan: 1200 ta xonadon to'liq sinxronizatsiya qilindi"
            value={serviceComment}
            onChange={(e) => setServiceComment(e.target.value)}
            multiline
            rows={2}
            slotProps={{
              input: {
                sx: { borderRadius: 2 }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setServiceChargeDialogOpen(false)}
            disabled={submittingBilling}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => handleSaveBillingTransaction('SERVICE_CHARGE')}
            disabled={submittingBilling || !serviceAmount}
            startIcon={submittingBilling ? <CircularProgress size={16} color="inherit" /> : <BuildIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, px: 3 }}
          >
            {submittingBilling ? 'Saqlanmoqda...' : 'Xizmatni Qayd Etish'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── TRANZAKSIYALAR TARIXI DIALOGI ── */}
      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <HistoryIcon color="primary" />
              <span>Tranzaksiyalar Tarixi — {selectedBillingMahalla?.mahalla_name}</span>
            </Stack>
            <IconButton size="small" onClick={() => setHistoryDialogOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          {loadingHistory ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={30} sx={{ mb: 1.5 }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Tranzaksiyalar tarixi yuklanmoqda...
              </Typography>
            </Box>
          ) : historyTransactions.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <ReceiptIcon sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Hali tranzaksiyalar mavjud emas
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Ushbu mahalla bo'yicha to'lov yoki xizmat qayd qilinganida tarix shu yerda ko'rinadi.
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Sana & Vaqt</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Amal Turi</TableCell>
                    <TableCell sx={{ fontWeight: 800, textAlign: 'right' }}>Summa</TableCell>
                    <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>Balans O'zgarishi</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Izoh</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyTransactions.map((tx) => {
                    const isPayment = tx.type === 'PAYMENT';
                    return (
                      <TableRow key={tx._id} hover>
                        <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.secondary }}>
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString('uz-UZ') : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={
                              isPayment ? (
                                <PaidIcon sx={{ fontSize: '0.85rem !important' }} />
                              ) : (
                                <BuildIcon sx={{ fontSize: '0.85rem !important' }} />
                              )
                            }
                            label={isPayment ? "To'lov qabul qilindi" : "Xizmat ko'rsatildi"}
                            size="small"
                            color={isPayment ? 'success' : 'warning'}
                            sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: 'right',
                            fontWeight: 800,
                            color: isPayment ? theme.palette.success.main : theme.palette.warning.main
                          }}
                        >
                          {isPayment ? '+' : '-'}
                          {Number(tx.amount || 0).toLocaleString()} so'm
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                          {Number(tx.balance_before || 0).toLocaleString()} ➔ {Number(tx.balance_after || 0).toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', color: theme.palette.text.primary }}>
                          {tx.comment || <span style={{ opacity: 0.5 }}>—</span>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setHistoryDialogOpen(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Yopish
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── TAB 4: ONLINE MAHALLA HISOBOTLARI (SURVEY HOMES) REJIMI ── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === 'report' && (
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

      {/* ── XATLOV QILINGAN XONADONLAR RO'YXATI VA FORMALARI ── */}
      <SmartSurveyHomesDialog job={selectedJobForHomeIds} token={token} onClose={() => setSelectedJobForHomeIds(null)} />

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

      {/* ── XATLOV HISOBOTI MODALI ── */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: theme.palette.background.paper,
              borderRadius: 3,
              border: '1px solid',
              borderColor: theme.palette.divider
            }
          }
        }}
      >
        {selectedJobForReport && (
          <>
            <DialogTitle sx={{ p: 2.5, pb: 1.5, borderBottom: '1px solid', borderColor: theme.palette.divider }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                      color: theme.palette.primary.main
                    }}
                  >
                    <AssessmentIcon fontSize="medium" />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      📊 Xatlov Natijalari Bo‘yicha Hisobot
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.3 }}>
                      {selectedJobForReport.mahallaName || 'Mahalla'} • {selectedJobForReport.streetName || 'Barcha ko‘chalar kesimida'} •{' '}
                      <Typography component="span" variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        ID: {selectedJobForReport.id}
                      </Typography>
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => setReportDialogOpen(false)} size="small" color="inherit">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
              {(() => {
                const rep = selectedJobForReport.reportSummary || {};
                const emp = rep.employment || {};
                const bus = rep.businessWishes || {};
                const se = rep.socioEconomic || {};
                const inc = se.monthlyIncomes || {};
                const inf = rep.infrastructure || {};

                const totalEmp =
                  (emp.officialPreserved || 0) +
                  (emp.selfEmployed || 0) +
                  (emp.unofficialWorker || 0) +
                  (emp.schoolStudent || 0) +
                  (emp.kindergarten || 0) +
                  (emp.motherCare || 0) +
                  (emp.student || 0) +
                  (emp.pensioner || 0) +
                  (emp.unemployed || 0);

                const totalBus = (bus.hasNeed || 0) + (bus.noNeed || 0);

                const totalDebtHomes = (se.noDebtCount || 0) + (se.hasDebtCount || 0);

                return (
                  <Stack spacing={2.5}>
                    {/* Yuqori ma'lumotlar va Excel tugmasi */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: theme.palette.background.paper,
                        border: '1px solid',
                        borderColor: theme.palette.divider
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
                      >
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                          <Chip
                            label={
                              selectedJobForReport.status === 'COMPLETED'
                                ? 'Yakunlandi'
                                : selectedJobForReport.status === 'RUNNING'
                                  ? 'Bajarilmoqda'
                                  : selectedJobForReport.status === 'CANCELLED'
                                    ? 'To‘xtatilgan'
                                    : 'Xato'
                            }
                            color={
                              selectedJobForReport.status === 'COMPLETED'
                                ? 'success'
                                : selectedJobForReport.status === 'RUNNING'
                                  ? 'primary'
                                  : 'default'
                            }
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                          {selectedJobForReport.presetName && (
                            <Chip
                              label={`Shablon: ${selectedJobForReport.presetName}`}
                              variant="outlined"
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Boshlandi:{' '}
                            {selectedJobForReport.startTime ? new Date(selectedJobForReport.startTime).toLocaleString('uz-UZ') : '—'}
                          </Typography>
                          {selectedJobForReport.endTime && (
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              • Tugadi: {new Date(selectedJobForReport.endTime).toLocaleTimeString('uz-UZ')}
                            </Typography>
                          )}
                        </Stack>

                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<FileDownloadIcon />}
                          onClick={() => handleExportJobReportExcel(selectedJobForReport)}
                          sx={{ textTransform: 'none', fontWeight: 700, px: 2, borderRadius: 2 }}
                        >
                          Excel (.xlsx) Hisobotni Yuklab Olish
                        </Button>
                      </Stack>
                    </Paper>

                    {/* Asosiy xulosa metrikalari */}
                    <Grid container spacing={1.5}>
                      <Grid item xs={6} sm={4} md={2}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            textAlign: 'center',
                            bgcolor: theme.palette.background.paper,
                            border: '1px solid',
                            borderColor: theme.palette.divider
                          }}
                        >
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            Jami Xonadonlar
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                            {selectedJobForReport.total || rep.totalHomes || 0}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            textAlign: 'center',
                            bgcolor: theme.palette.background.paper,
                            border: '1px solid',
                            borderColor: theme.palette.divider
                          }}
                        >
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            Ko‘rib Chiqildi
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                            {selectedJobForReport.processed || 0}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            textAlign: 'center',
                            bgcolor: theme.palette.background.paper,
                            border: '1px solid',
                            borderColor: theme.palette.divider
                          }}
                        >
                          <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                            Muvaffaqiyatli
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.success.main, mt: 0.5 }}>
                            {selectedJobForReport.surveyHomesUpdated || selectedJobForReport.success || 0}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            textAlign: 'center',
                            bgcolor: theme.palette.background.paper,
                            border: '1px solid',
                            borderColor: theme.palette.divider
                          }}
                        >
                          <Typography variant="caption" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                            Bandlik Belgilandi
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.info.main, mt: 0.5 }}>
                            {selectedJobForReport.employmentUpdated || totalEmp}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            textAlign: 'center',
                            bgcolor: theme.palette.background.paper,
                            border: '1px solid',
                            borderColor: theme.palette.divider
                          }}
                        >
                          <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                            Biznes & Ko‘mak
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.warning.main, mt: 0.5 }}>
                            {selectedJobForReport.businessWishesUpdated || totalBus}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            textAlign: 'center',
                            bgcolor: theme.palette.background.paper,
                            border: '1px solid',
                            borderColor: theme.palette.divider
                          }}
                        >
                          <Typography variant="caption" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                            Xatoliklar
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.error.main, mt: 0.5 }}>
                            {selectedJobForReport.failed || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* 4 ta To'liq Blok Grid */}
                    <Grid container spacing={2}>
                      {/* 1. BANDLIK VA TA'LIM STATISTIKASI */}
                      <Grid item xs={12} md={6}>
                        <Card
                          elevation={0}
                          sx={{
                            height: '100%',
                            borderRadius: 2.5,
                            bgcolor: theme.palette.background.paper,
                            border: '1px solid',
                            borderColor: theme.palette.divider
                          }}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: theme.palette.primary.main
                                }}
                              />
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                💼 Bandlik va Ta‘lim Taqsimoti
                              </Typography>
                            </Stack>

                            <Stack spacing={1.2}>
                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  🏢 Rasmiy band (bazasidagi saqlangan):
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {emp.officialPreserved || 0} ta
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  🌱 O‘zini o‘zi band qilgan (tomorqa / xizmat):
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                  {emp.selfEmployed || 0} ta
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  🔨 Norasmiy yollanma ishchi:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {emp.unofficialWorker || 0} ta
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  🎒 Maktab o‘quvchilari (7-17 yosh):
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {emp.schoolStudent || 0} ta
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  🧸 Bog‘cha tarbiyalanuvchisi (3-6 yosh):
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {emp.kindergarten || 0} ta
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  🤱 Ona tarbiyasida (0-2 yosh):
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {emp.motherCare || 0} ta
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  🎓 Talabalar (OTM, litsey, texnikum):
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {emp.student || 0} ta
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  👴 Nafaqaxo‘rlar (keksalar):
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {emp.pensioner || 0} ta
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  🔍 Ishsiz fuqarolar:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                                  {emp.unemployed || 0} ta
                                </Typography>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* 2. TADBIRKORLIK VA MOLIYAVIY KO'MAK */}
                      <Grid item xs={12} md={6}>
                        <Card
                          elevation={0}
                          sx={{
                            height: '100%',
                            borderRadius: 2.5,
                            bgcolor: theme.palette.background.paper,
                            border: '1px solid',
                            borderColor: theme.palette.divider
                          }}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: theme.palette.secondary.main
                                }}
                              />
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                💡 Tadbirkorlik va Moliyaviy Ko‘mak (Tab 6)
                              </Typography>
                            </Stack>

                            <Stack spacing={1.5}>
                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  ✨ Tadbirkorlik istagi bildirilgan fuqarolar:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                  {bus.hasNeed || 0} ta
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  💳 Imtiyozli kredit so‘raganlar:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                                  {bus.credit || 0} ta
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  🎁 Subsidiya / Ssuda so‘raganlar:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                  {bus.subsidy || 0} ta
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  ⚪ Ehtiyoj yo‘q deb belgilanganlar:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {bus.noNeed || 0} ta
                                </Typography>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* 3. DAROMAD VA KREDIT QARZDORLIGI */}
                      <Grid item xs={12} md={6}>
                        <Card
                          elevation={0}
                          sx={{
                            height: '100%',
                            borderRadius: 2.5,
                            bgcolor: theme.palette.background.paper,
                            border: '1px solid',
                            borderColor: theme.palette.divider
                          }}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: theme.palette.info.main
                                }}
                              />
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                💰 Daromad Toifalari va Kredit Qarzdorligi
                              </Typography>
                            </Stack>

                            <Stack spacing={1.2}>
                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  ✅ Kredit qarzdorligi yo‘q:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                  {se.noDebtCount || 0} xonadon{' '}
                                  {totalDebtHomes > 0 ? `(${Math.round(((se.noDebtCount || 0) / totalDebtHomes) * 100)}%)` : ''}
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  ⚠️ Kredit qarzdorligi mavjud:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                                  {se.hasDebtCount || 0} xonadon{' '}
                                  {totalDebtHomes > 0 ? `(${Math.round(((se.hasDebtCount || 0) / totalDebtHomes) * 100)}%)` : ''}
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  💵 1 mln so‘mgacha daromad:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {inc.under1m || 0} xonadon
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  💵 1 mln – 3 mln so‘m:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {inc.from1mTo3m || 0} xonadon
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  💵 3 mln – 5 mln so‘m:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {inc.from3mTo5m || 0} xonadon
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  💵 5 mln – 10 mln so‘m:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {inc.from5mTo10m || 0} xonadon
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  💵 10 mln so‘mdan yuqori:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {inc.above10m || 0} xonadon
                                </Typography>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* 4. INFRATUZILMA VA KOMMUNIKATSIYA */}
                      <Grid item xs={12} md={6}>
                        <Card
                          elevation={0}
                          sx={{
                            height: '100%',
                            borderRadius: 2.5,
                            bgcolor: theme.palette.background.paper,
                            border: '1px solid',
                            borderColor: theme.palette.divider
                          }}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: theme.palette.warning.main
                                }}
                              />
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                🏠 Infratuzilma va Ta‘minot
                              </Typography>
                            </Stack>

                            <Stack spacing={1.5}>
                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  🔥 Tabiiy gaz tarmog‘i:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                  {inf.gasNatural || 0} xonadon
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  🛢️ Suyultirilgan gaz (ballon):
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {inf.gasCylinder || 0} xonadon
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  💧 Markaziy ichimlik suvi tarmog‘i:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                                  {inf.waterCentral || 0} xonadon
                                </Typography>
                              </Stack>
                              <Divider />

                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  🏞️ Xususiy quduq yoki boshqa manba:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {inf.waterWell || 0} xonadon
                                </Typography>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Agar xatoliklar mavjud bo'lsa, pastda tezkor havola */}
                    {selectedJobForReport.errors && selectedJobForReport.errors.length > 0 && (
                      <Alert
                        severity="error"
                        action={
                          <Button
                            color="inherit"
                            size="small"
                            onClick={() => {
                              setReportDialogOpen(false);
                              handleOpenErrors(selectedJobForReport);
                            }}
                          >
                            Xatolarni Ko‘rish
                          </Button>
                        }
                        sx={{ borderRadius: 2 }}
                      >
                        Ushbu jobda jami {selectedJobForReport.errors.length} ta xonadonda xatolik yoki cheklov qayd etilgan.
                      </Alert>
                    )}
                  </Stack>
                );
              })()}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: theme.palette.divider }}>
              <Button
                variant="outlined"
                color="success"
                startIcon={<FileDownloadIcon />}
                onClick={() => handleExportJobReportExcel(selectedJobForReport)}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Excel Yuklab Olish
              </Button>
              <Button onClick={() => setReportDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
                Yopish
              </Button>
            </DialogActions>
          </>
        )}
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

      {/* ── SMART XATLOV SHABLONINI SAQLASH DIALOGI ── */}
      <Dialog
        open={savePresetDialogOpen}
        onClose={() => setSavePresetDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <SaveIcon color="primary" />
            <span>Yangi Shablon Saqlash</span>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            Joriy slayder va foiz qiymatlarini kelgusida bir tugma bilan qo'llash uchun shablon sifatida saqlang:
          </Typography>
          <Stack spacing={2}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              label="Shablon Nomi *"
              placeholder="Masalan: Paxtakor mahallasi maxsus"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
            />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Tavsif (ixtiyoriy)"
              placeholder="Masalan: Norasmiy ishchilar ko'p hududlar uchun"
              value={newPresetDescription}
              onChange={(e) => setNewPresetDescription(e.target.value)}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button variant="outlined" onClick={() => setSavePresetDialogOpen(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={savingPreset || !newPresetName.trim()}
            onClick={handleSavePreset}
            startIcon={savingPreset ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {savingPreset ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── SMART XATLOV ISHGA TUSHIRISH TASDIQLASH DIALOGI ── */}
      <Dialog
        open={smartConfirmDialogOpen}
        onClose={() => setSmartConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <AutoAwesomeIcon color="primary" />
            <span>Smart Xatlovni Ishga Tushirish</span>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Haqiqatan ham quyidagi parametrlar bilan Smart Xatlov jobini boshlamoqchimisiz?
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
              mb: 2
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: theme.palette.primary.main }}>
              Qamrov:{' '}
              {smartTargetScope === 'mahalla'
                ? `Barcha Mahalla (${streets.length} ta ko'cha)`
                : `Tanlangan ko'cha (${selectedStreet?.name || selectedStreetId})`}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              • Mahalla ID: <b>{districtId}</b>
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', mt: 0.5 }}>
              • Qo'llanilayotgan Shablon: <b>{surveyPresets.find((p) => p._id === selectedPresetId)?.name || 'Maxsus sozlamalar'}</b>
            </Typography>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: theme.palette.divider, mb: 2 }}>
            <FormControlLabel
              control={<Switch checked={smartSkipProcessed} onChange={(e) => setSmartSkipProcessed(e.target.checked)} />}
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Bajarilganlarni tashlab o‘tish
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Avvalgi Smart Xatlov joblarida to‘ldirilgan xonadonlar qayta ishlanmaydi, job kelgan joyidan davom etadi
                  </Typography>
                </Box>
              }
              sx={{ m: 0, alignItems: 'flex-start', '& .MuiSwitch-root': { mt: -0.5 } }}
            />
          </Paper>

          <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 1 }}>
            FAOL BO'LIMLAR:
          </Typography>
          <Stack spacing={1}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                borderRadius: 1.5,
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: theme.palette.divider
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  💼 1. Bandlik va Ta'lim
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                  Nafaqaxo‘rlar:{' '}
                  {(smartSettings.employment.pensionerMode ?? '4.2') === '4.7' ? '4.7 Izoh ("Nafaqada")' : '4.2.2 Ishsiz (Нафақада)'}
                </Typography>
              </Box>
              <Chip
                label={smartSettings.modules?.employment !== false ? 'FAOL (Ishga tushadi)' : "O'CHIRILGAN (Tegilmaydi)"}
                size="small"
                color={smartSettings.modules?.employment !== false ? 'success' : 'default'}
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                borderRadius: 1.5,
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: theme.palette.divider
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                🎓 2. Kasb-hunarga Ehtiyoj
              </Typography>
              <Chip
                label={smartSettings.modules?.employmentWishes !== false ? 'FAOL (100% Ehtiyoj yo‘q)' : "O'CHIRILGAN (Tegilmaydi)"}
                size="small"
                color={smartSettings.modules?.employmentWishes !== false ? 'success' : 'default'}
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                borderRadius: 1.5,
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: theme.palette.divider
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                🚀 3. Tadbirkorlik & Ko‘mak
              </Typography>
              <Chip
                label={smartSettings.modules?.businessWishes !== false ? 'FAOL (Ishga tushadi)' : "O'CHIRILGAN (Tegilmaydi)"}
                size="small"
                color={smartSettings.modules?.businessWishes !== false ? 'secondary' : 'default'}
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                borderRadius: 1.5,
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: theme.palette.divider
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                💳 4. Kredit & Ijtimoiy Holat
              </Typography>
              <Chip
                label={smartSettings.modules?.socioEconomic !== false ? 'FAOL (Ishga tushadi)' : "O'CHIRILGAN (Tegilmaydi)"}
                size="small"
                color={smartSettings.modules?.socioEconomic !== false ? 'success' : 'default'}
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                borderRadius: 1.5,
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: theme.palette.divider
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                💡 5. Infratuzilma
              </Typography>
              <Chip
                label={smartSettings.modules?.infrastructure !== false ? 'FAOL (Ishga tushadi)' : "O'CHIRILGAN (Tegilmaydi)"}
                size="small"
                color={smartSettings.modules?.infrastructure !== false ? 'success' : 'default'}
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </Stack>

          {smartSettings.modules?.employment === false &&
            smartSettings.modules?.employmentWishes === false &&
            smartSettings.modules?.businessWishes === false &&
            smartSettings.modules?.socioEconomic === false &&
            smartSettings.modules?.infrastructure === false && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                Diqqat! Barcha bo'limlar o'chirilgan. Kamida 1 ta bo'limni faol qiling!
              </Alert>
            )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button variant="outlined" onClick={() => setSmartConfirmDialogOpen(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={
              startingSmartJob ||
              (smartSettings.modules?.employment === false &&
                smartSettings.modules?.employmentWishes === false &&
                smartSettings.modules?.businessWishes === false &&
                smartSettings.modules?.socioEconomic === false &&
                smartSettings.modules?.infrastructure === false)
            }
            onClick={handleStartSmartSurveyJob}
            startIcon={startingSmartJob ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {startingSmartJob ? 'Ishga tushirilmoqda...' : 'Tasdiqlash va Ishga Tushirish'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
