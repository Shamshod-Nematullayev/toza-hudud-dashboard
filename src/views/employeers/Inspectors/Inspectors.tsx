import { confirmDialog } from 'ui-component/ConfirmDialog';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Button,
  ButtonGroup,
  Chip,
  Grid,
  IconButton,
  List,
  ListItem,
  Switch,
  Typography,
  useMediaQuery,
  Box,
  Theme,
  Tooltip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

// Icons
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import TelegramIcon from '@mui/icons-material/Telegram';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PauseCircleOutlinedIcon from '@mui/icons-material/PauseCircleOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

// Internal Imports
import MainCard from 'ui-component/cards/MainCard';
import useCustomizationStore from 'store/customizationStore';
import ModalChoose from '../ModalChoose';
import AddInspectorModal from '../AddInspectorModal';
import ConnectTelegramModal from '../ConnectTelegramModal';
import EditInspectorNameModal from './EditInspectorNameModal';
import api from 'utils/api';

// --- INTERFACES & TYPES ---
interface Mahalla {
  id: number;
  name: string;
  reja: number;
  biriktirilganNazoratchi: {
    inspactor_id: number | null;
  };
}

interface AttachedMahalla {
  mfy_id: number;
  mfy_name: string;
}

interface InspectorRow {
  _id?: string;
  id: number;
  name: string;
  phone?: string | null;
  activ: boolean;
  biriktirilgan: AttachedMahalla[];
  telegram_id?: number[];
  hasTelegram?: boolean;
  telegramUsername?: string | null;
  telegramLinkedAt?: string | null;
  [key: string]: any; // Dinamik mfy_X kalitlari uchun
}

type ChoiceMethod = 'inspector' | 'mfy' | null;

interface ApiResponse {
  rows: InspectorRow[];
  mahallalar: Mahalla[];
}

function Inspectors(): React.JSX.Element {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t } = useTranslation();
  const { customization, user } = useCustomizationStore();
  const isAdmin = Boolean(user?.roles?.includes('admin') || user?.roles?.includes('product_admin'));
  const isXsUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  // State Management
  const [mahallalar, setMahallalar] = useState<Mahalla[]>([]);
  const [rows, setRows] = useState<InspectorRow[]>([]);
  const [maxMahallaCount, setMaxMahallaCount] = useState<number>(0);

  const [activeInspector, setActiveInspector] = useState<number | null>(null);
  const [activeMFY, setActiveMFY] = useState<number | null>(null);
  const [choosingMethod, setChoosingMethod] = useState<ChoiceMethod>(null);
  const [forChoose, setForChoose] = useState<any[]>([]);

  // Modals State
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openCreateInspectorModal, setOpenCreateInspectorModal] = useState<boolean>(false);
  const [openConnectTelegramModal, setOpenConnectTelegramModal] = useState<boolean>(false);
  const [selectedInspectorForTelegram, setSelectedInspectorForTelegram] = useState<InspectorRow | null>(null);
  const [openEditNameModal, setOpenEditNameModal] = useState<boolean>(false);
  const [selectedInspectorForEdit, setSelectedInspectorForEdit] = useState<InspectorRow | null>(null);

  // Search & Export State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const isExportMenuOpen = Boolean(exportAnchorEl);

  const handleOpenExportMenu = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
  };

  // Qidiruv bo'yicha filtrlangan qatorlar
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      const nameMatch = row.name?.toLowerCase().includes(q);
      const idMatch = String(row.id).includes(q);
      const phoneMatch = row.phone ? String(row.phone).toLowerCase().includes(q) : false;
      const tgMatch = row.telegramUsername ? row.telegramUsername.toLowerCase().includes(q) : false;
      const mahallaMatch = row.biriktirilgan?.some((m) => m.mfy_name?.toLowerCase().includes(q));
      return nameMatch || idMatch || phoneMatch || tgMatch || mahallaMatch;
    });
  }, [rows, searchQuery]);

  // Statistika hisobi
  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.activ).length;
    const inactive = total - active;
    const withTelegram = rows.filter(
      (r) => r.hasTelegram || (r.telegram_id && r.telegram_id.length > 0 && r.telegram_id[0])
    ).length;
    const freeMahallas = mahallalar.filter((m) => !m.biriktirilganNazoratchi?.inspactor_id).length;
    return { total, active, inactive, withTelegram, freeMahallas };
  }, [rows, mahallalar]);

  // Excelga eksport qilish funksiyasi
  const handleExportToExcel = (mode: 'all' | 'active' | 'inactive' | 'filtered' | 'unassigned' = 'all') => {
    handleCloseExportMenu();

    let targetRows = rows;
    let titlePrefix = 'Nazoratchilar_Hisoboti';

    if (mode === 'active') {
      targetRows = rows.filter((r) => r.activ);
      titlePrefix = 'Faol_Nazoratchilar';
    } else if (mode === 'inactive') {
      targetRows = rows.filter((r) => !r.activ);
      titlePrefix = 'Nofaol_Nazoratchilar';
    } else if (mode === 'filtered') {
      targetRows = filteredRows;
      titlePrefix = 'Filtrlangan_Nazoratchilar';
    } else if (mode === 'unassigned') {
      titlePrefix = 'Biriktirilmagan_Mahallalar';
    }

    if (mode !== 'unassigned' && targetRows.length === 0) {
      toast.warning('Eksport qilish uchun ma’lumot topilmadi');
      return;
    }

    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().slice(0, 10);

    // 1-VARAQ: Nazoratchilar jadvali
    if (mode !== 'unassigned') {
      const dynamicMaxMfy = Math.max(0, ...targetRows.map((r) => (r.biriktirilgan || []).length));

      const headers = [
        'Т/р',
        'ID',
        'F.I.SH',
        'Telefon raqami',
        'Holati',
        'Telegram',
        'Telegram foydalanuvchi nomi',
        'Telegramga ulangan sana',
        'Biriktirilgan mahallalar soni',
        'Biriktirilgan mahallalar (barchasi)'
      ];

      for (let i = 0; i < dynamicMaxMfy; i++) {
        headers.push(`Mahalla ${i + 1}`);
      }

      const dataRows = targetRows.map((row, idx) => {
        const attached = row.biriktirilgan || [];
        const mfyNames = attached.map((m) => m.mfy_name).join(', ');
        const isLinked = Boolean(
          row.hasTelegram || (row.telegram_id && row.telegram_id.length > 0 && row.telegram_id[0])
        );
        const tgUsername = row.telegramUsername
          ? `@${row.telegramUsername.replace(/^@/, '')}`
          : row.telegram_id?.[0]
          ? String(row.telegram_id[0])
          : '—';
        const tgLinkedAt = row.telegramLinkedAt
          ? new Date(row.telegramLinkedAt).toLocaleDateString('uz-UZ')
          : '—';
        const phone = row.phone || '—';

        const r: (string | number)[] = [
          idx + 1,
          row.id,
          row.name,
          phone,
          row.activ ? 'Faol' : 'Nofaol',
          isLinked ? 'Ulangan' : 'Ulanmagan',
          tgUsername,
          tgLinkedAt,
          attached.length,
          mfyNames || '—'
        ];

        for (let i = 0; i < dynamicMaxMfy; i++) {
          r.push(attached[i] ? attached[i].mfy_name : '');
        }

        return r;
      });

      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

      // Ustun kengliklarini avtomatik moslash
      const colWidths = headers.map((header, colIndex) => {
        let maxLen = header.length;
        dataRows.forEach((row) => {
          const val = row[colIndex];
          if (val !== undefined && val !== null) {
            const strLen = String(val).length;
            if (strLen > maxLen) maxLen = strLen;
          }
        });
        return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
      });
      ws['!cols'] = colWidths;

      const sheetName =
        mode === 'active'
          ? 'Faol nazoratchilar'
          : mode === 'inactive'
          ? 'Nofaol nazoratchilar'
          : mode === 'filtered'
          ? 'Filtrlangan nazoratchilar'
          : 'Nazoratchilar';

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    // 2-VARAQ: Biriktirilmagan bo'sh mahallalar
    if (mode === 'all' || mode === 'unassigned') {
      const freeMahallas = mahallalar.filter((mfy) => !mfy.biriktirilganNazoratchi?.inspactor_id);
      const freeHeaders = ['Т/р', 'Mahalla ID', 'Mahalla nomi', 'Reja ko‘rsatkichi', 'Holati'];
      const freeDataRows = freeMahallas.map((mfy, idx) => [
        idx + 1,
        mfy.id,
        mfy.name,
        mfy.reja || 0,
        'Nazoratchi biriktirilmagan'
      ]);

      const wsFree = XLSX.utils.aoa_to_sheet([freeHeaders, ...freeDataRows]);
      const freeColWidths = freeHeaders.map((header, colIndex) => {
        let maxLen = header.length;
        freeDataRows.forEach((row) => {
          const val = row[colIndex];
          if (val !== undefined && val !== null) {
            const strLen = String(val).length;
            if (strLen > maxLen) maxLen = strLen;
          }
        });
        return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
      });
      wsFree['!cols'] = freeColWidths;

      XLSX.utils.book_append_sheet(wb, wsFree, 'Bo‘sh mahallalar');
    }

    // 3-VARAQ: Umumiy statistika
    if (mode === 'all') {
      const totalInspectors = rows.length;
      const activeInspectors = rows.filter((r) => r.activ).length;
      const inactiveInspectors = rows.filter((r) => !r.activ).length;
      const telegramLinked = rows.filter(
        (r) => r.hasTelegram || (r.telegram_id && r.telegram_id.length > 0 && r.telegram_id[0])
      ).length;
      const totalMahallas = mahallalar.length;
      const assignedMahallas = mahallalar.filter((m) => m.biriktirilganNazoratchi?.inspactor_id).length;
      const unassignedMahallas = mahallalar.filter((m) => !m.biriktirilganNazoratchi?.inspactor_id).length;

      const statsData = [
        ['Ko‘rsatkich', 'Qiymat'],
        ['Jami nazoratchilar soni', totalInspectors],
        ['Faol nazoratchilar', activeInspectors],
        ['Nofaol (faolsizlantirilgan) nazoratchilar', inactiveInspectors],
        ['Telegram botga ulangan nazoratchilar', telegramLinked],
        ['Telegram botga ulanmagan nazoratchilar', totalInspectors - telegramLinked],
        ['Jami mahallalar soni', totalMahallas],
        ['Nazoratchi biriktirilgan mahallalar', assignedMahallas],
        ['Bo‘sh (biriktirilmagan) mahallalar', unassignedMahallas],
        ['Hisobot shakllantirilgan sana', new Date().toLocaleString('uz-UZ')]
      ];

      const wsStats = XLSX.utils.aoa_to_sheet(statsData);
      wsStats['!cols'] = [{ wch: 40 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, wsStats, 'Umumiy statistika');
    }

    const fileName = `${titlePrefix}_${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success('Excel fayli muvaffaqiyatli yuklab olindi!');
  };

  // API Data Fetching
  const updateData = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse>('/inspectors');
      let maxCount = 0;

      // Dinamik ustunlar uchun eng ko'p mahalla biriktirilgan nazoratchini aniqlaymiz
      const processedRows = res.data.rows.map((row) => {
        const attached = row.biriktirilgan || [];
        if (attached.length > maxCount) {
          maxCount = attached.length;
        }

        const dynamicRow: InspectorRow = {
          _id: row._id,
          id: row.id,
          name: row.name,
          phone: (row as any).phone || null,
          activ: row.activ,
          biriktirilgan: attached,
          telegram_id: row.telegram_id || [],
          hasTelegram: row.hasTelegram ?? Boolean(row.telegram_id && row.telegram_id.length > 0 && row.telegram_id[0]),
          telegramUsername: row.telegramUsername || null,
          telegramLinkedAt: row.telegramLinkedAt || null
        };

        // Dinamik ravishda mfy_0, mfy_1, mfy_2... kalitlarini yuklaymiz
        attached.forEach((mfy, index) => {
          dynamicRow[`mfy_${index}`] = mfy;
        });

        return dynamicRow;
      });

      // Agar kelajakda yangi mahalla qo'shish uchun bo'sh joy kerak bo'lsa, har doim kamida +1 ustun joy qoldiramiz
      setMaxMahallaCount(maxCount + 1);
      setRows(processedRows);
      setMahallalar(res.data.mahallalar);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('errors.fetchDataFailed') || 'Ma’lumotlarni yuklashda xatolik yuz berdi');
    }
  }, [t]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  // Handlers
  const handleDelete = async (mfy_id: number) => {
    try {
      const { data } = await api.post<{ ok: boolean; message: string }>(`/inspectors/unset-inspector-to-mfy/${mfy_id}`);

      if (!data.ok) return toast.error(data.message);

      updateData();
      toast.success(data.message);
    } catch (error) {
      console.error(error);
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleClickSwitch = async (id: number) => {
    try {
      const targetRow = rows.find((row) => row.id === id);
      if (!targetRow) return;

      const currentStatus = targetRow.activ;
      if (currentStatus) {
        if (
          !(await confirmDialog({
            message: 'Nazoratchini faolsizlantirishni tasdiqlaysizmi?',
            confirmText: 'Faolsizlantirish',
            color: 'warning'
          }))
        ) {
          return;
        }
      }

      await api.post(`/inspectors/set-inspector-inactive/${id}`, {
        inactive: !currentStatus
      });

      setRows((prevRows) => prevRows.map((row) => (row.id === id ? { ...row, activ: !row.activ } : row)));
      toast.success(t('messages.statusUpdated') || 'Status muvaffaqiyatli o‘zgartirildi');
    } catch (error) {
      console.error(error);
      toast.error('Statusni o‘zgartirishda xatolik');
    }
  };

  const openChooseModal = ({ type, focus }: { type: 'inspector' | 'mfy'; focus: number }) => {
    if (type === 'inspector') {
      setForChoose(rows);
      setActiveMFY(focus);
    } else {
      // Bo'sh mahallalarni filterlash
      const freeMahallas = mahallalar.filter((mfy) => mfy.reja > 0 && mfy.biriktirilganNazoratchi?.inspactor_id === null);
      setForChoose(freeMahallas);
      setActiveInspector(focus);
    }
    setChoosingMethod(type);
    setOpenAddModal(true);
  };

  // Dinamik Mahalla Rendering funksiyasi
  const renderMahallaCell = (mfy: AttachedMahalla | undefined, inspectorId: number) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', height: '100%' }}>
        {mfy ? (
          <>
            <IconButton size="small" onClick={() => handleDelete(mfy.mfy_id)}>
              <DeleteIcon sx={{ color: isDark ? 'error.light' : 'error.main' }} />
            </IconButton>
            <Typography variant="body2" noWrap>
              {mfy.mfy_name}
            </Typography>
          </>
        ) : (
          <IconButton size="small" onClick={() => openChooseModal({ type: 'mfy', focus: inspectorId })}>
            <AddCircleIcon sx={{ color: isDark ? 'success.200' : 'success.main' }} />
          </IconButton>
        )}
      </Box>
    );
  };

  const handleOpenConnectTelegram = (inspector?: InspectorRow) => {
    setSelectedInspectorForTelegram(inspector || null);
    setOpenConnectTelegramModal(true);
  };

  const handleCloseConnectTelegram = () => {
    setOpenConnectTelegramModal(false);
    setSelectedInspectorForTelegram(null);
  };

  // Dinamik Ustunlar (Columns) Arxitekturasi
  const columns = useMemo<GridColDef<InspectorRow>[]>(() => {
    const baseColumns: GridColDef<InspectorRow>[] = [
      { field: 'id', headerName: 'ID', width: 70 },
      {
        field: 'name',
        headerName: t('tableHeaders.fullName'),
        flex: 2,
        minWidth: 180,
        renderCell: (params: GridRenderCellParams<InspectorRow>) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {params.row.name}
            </Typography>
            {isAdmin && (
              <Tooltip title={t('tooltips.editName') || 'Ismni tahrirlash'}>
                <IconButton
                  size="small"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setSelectedInspectorForEdit(params.row);
                    setOpenEditNameModal(true);
                  }}
                  sx={{
                    color: 'text.secondary',
                    p: 0.5,
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  <EditIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )
      },
      {
        field: 'telegram',
        headerName: 'Telegram',
        width: 140,
        sortable: false,
        renderCell: (params: GridRenderCellParams<InspectorRow>) => {
          const isLinked = Boolean(
            params.row.hasTelegram || (params.row.telegram_id && params.row.telegram_id.length > 0)
          );
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                icon={<TelegramIcon sx={{ fontSize: '18px !important' }} />}
                label={isLinked ? 'Ulangan' : 'Ulash'}
                color={isLinked ? 'success' : 'primary'}
                size="small"
                variant={isLinked ? 'filled' : 'outlined'}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleOpenConnectTelegram(params.row);
                }}
                sx={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': { opacity: 0.85 }
                }}
              />
            </Box>
          );
        }
      }
    ];

    // Cheksiz (N ta) mahallalar uchun ustunlarni loop orqali dinamik yaratamiz
    for (let i = 0; i < maxMahallaCount; i++) {
      baseColumns.push({
        field: `mfy_${i}`,
        headerName: `${t('tableHeaders.mfy')} ${i + 1}`,
        flex: 1.2,
        minWidth: 150,
        sortable: false,
        renderCell: (params: GridRenderCellParams<InspectorRow>) => {
          const mfyData = params.row[`mfy_${i}`] as AttachedMahalla | undefined;
          return renderMahallaCell(mfyData, params.row.id);
        }
      });
    }

    // Status ustunini oxiriga qo'shamiz
    baseColumns.push({
      field: 'activ',
      headerName: t('tableHeaders.status'),
      width: 90,
      sortable: false,
      renderCell: (params: GridRenderCellParams<InspectorRow>) => (
        <Switch checked={params.row.activ} onChange={() => handleClickSwitch(params.row.id)} size="small" />
      )
    });

    return baseColumns;
  }, [maxMahallaCount, t, isDark, rows, isAdmin]);

  return (
    <MainCard contentSX={{ height: '100%' }}>
      {openCreateInspectorModal && <AddInspectorModal setOpenCreateInspectorModal={setOpenCreateInspectorModal} setInspectors={setRows} />}
      {openConnectTelegramModal && (
        <ConnectTelegramModal
          setOpenConnectTelegramModal={setOpenConnectTelegramModal}
          onClose={handleCloseConnectTelegram}
          inspectors={rows}
          selectedInspector={selectedInspectorForTelegram}
          onSuccess={updateData}
        />
      )}
      {openEditNameModal && selectedInspectorForEdit && (
        <EditInspectorNameModal
          open={openEditNameModal}
          inspector={selectedInspectorForEdit}
          onClose={() => {
            setOpenEditNameModal(false);
            setSelectedInspectorForEdit(null);
          }}
          onSuccess={() => {
            updateData();
          }}
        />
      )}
      <ModalChoose
        activeInspector={activeInspector}
        activeMFY={activeMFY}
        choosingMethod={choosingMethod}
        openAddModal={openAddModal}
        setOpenAddModal={setOpenAddModal}
        forChoose={forChoose}
        updateData={updateData}
      />

      <Grid container spacing={2}>
        {/* Actions panel */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            }}
          >
            {/* Asosiy harakat tugmalari */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button
                color="success"
                onClick={() => setOpenCreateInspectorModal(true)}
                variant="contained"
                startIcon={<AddOutlinedIcon />}
              >
                {t('tableActions.add')}
              </Button>
              <Button
                color="primary"
                onClick={() => handleOpenConnectTelegram()}
                variant="contained"
                startIcon={<TelegramIcon />}
              >
                {isXsUp && t('tableActions.connectTelegramAccount')}
              </Button>

              {/* Excelga eksport ButtonGroup (Split button) */}
              <ButtonGroup
                variant="contained"
                color="success"
                sx={{
                  boxShadow: 2,
                  '& .MuiButton-root': {
                    textTransform: 'none',
                    fontWeight: 600
                  }
                }}
              >
                <Tooltip title="Barcha nazoratchilar va mahallalar ro‘yxatini to‘liq Excel faylga yuklab olish">
                  <Button
                    startIcon={<FileDownloadIcon />}
                    onClick={() => handleExportToExcel('all')}
                  >
                    Excel yuklab olish
                  </Button>
                </Tooltip>
                <Tooltip title="Eksport parametrlarini tanlash">
                  <Button
                    size="small"
                    onClick={handleOpenExportMenu}
                    sx={{ px: 0.75 }}
                  >
                    <ArrowDropDownIcon />
                  </Button>
                </Tooltip>
              </ButtonGroup>

              {/* Eksport menyusi */}
              <Menu
                anchorEl={exportAnchorEl}
                open={isExportMenuOpen}
                onClose={handleCloseExportMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{
                  paper: {
                    sx: {
                      minWidth: 290,
                      boxShadow: 4,
                      borderRadius: 2,
                      p: 0.5
                    }
                  }
                }}
              >
                <MenuItem onClick={() => handleExportToExcel('all')} sx={{ py: 1, borderRadius: 1 }}>
                  <ListItemIcon>
                    <TableChartOutlinedIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Barcha nazoratchilar (To‘liq hisobot)</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary">{`Jami: ${stats.total} ta nazoratchi (3 ta varaqda)`}</Typography>}
                  />
                </MenuItem>

                {searchQuery.trim() && (
                  <MenuItem onClick={() => handleExportToExcel('filtered')} sx={{ py: 1, borderRadius: 1 }}>
                    <ListItemIcon>
                      <FilterAltOutlinedIcon color="info" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Qidiruv natijalarini yuklash</Typography>}
                      secondary={<Typography variant="caption" color="text.secondary">{`Topilgan: ${filteredRows.length} ta nazoratchi`}</Typography>}
                    />
                  </MenuItem>
                )}

                <MenuItem onClick={() => handleExportToExcel('active')} sx={{ py: 1, borderRadius: 1 }}>
                  <ListItemIcon>
                    <CheckCircleOutlinedIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2">Faqat faol nazoratchilar</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary">{`${stats.active} ta faol nazoratchi`}</Typography>}
                  />
                </MenuItem>

                <MenuItem onClick={() => handleExportToExcel('inactive')} sx={{ py: 1, borderRadius: 1 }}>
                  <ListItemIcon>
                    <PauseCircleOutlinedIcon color="warning" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2">Faqat nofaol nazoratchilar</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary">{`${stats.inactive} ta faolsizlantirilgan`}</Typography>}
                  />
                </MenuItem>

                <Divider sx={{ my: 0.5 }} />

                <MenuItem onClick={() => handleExportToExcel('unassigned')} sx={{ py: 1, borderRadius: 1 }}>
                  <ListItemIcon>
                    <LocationCityOutlinedIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2">Faqat biriktirilmagan mahallalar</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary">{`${stats.freeMahallas} ta bo‘sh mahalla`}</Typography>}
                  />
                </MenuItem>
              </Menu>
            </Box>

            {/* Qidiruv filtri */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="F.I.SH yoki mahalla bo‘yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  minWidth: { xs: 200, sm: 270 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery('')} edge="end">
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }
                }}
              />
              {searchQuery && (
                <Chip
                  size="small"
                  color="info"
                  variant="outlined"
                  label={`${filteredRows.length} / ${rows.length}`}
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>
          </Box>
        </Grid>

        {/* Bo'sh Mahallalar Ro'yxati (Chap tomon) */}
        <Grid size={{ xs: 0, sm: 2.5 }} sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Box sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography sx={{ fontWeight: '700', mb: 1, px: 1 }}>{t('inspectorsPage.freeMahallas')}</Typography>
            <List sx={{ height: 'calc(100vh - 270px)', overflow: 'auto' }}>
              {mahallalar
                .filter((mfy) => mfy.reja > 0 && !mfy.biriktirilganNazoratchi?.inspactor_id)
                .map((item) => (
                  <ListItem
                    key={item.id}
                    disablePadding
                    sx={{ py: 0.5, px: 1, borderBottom: '1px dashed', borderColor: 'divider' }}
                    secondaryAction={
                      <IconButton edge="end" size="small" onClick={() => openChooseModal({ type: 'inspector', focus: item.id })}>
                        <PersonAddAltIcon sx={{ color: isDark ? 'success.200' : 'success.main' }} />
                      </IconButton>
                    }
                  >
                    <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>
                      {item.name}
                    </Typography>
                  </ListItem>
                ))}
            </List>
          </Box>
        </Grid>

        {/* Asosiy DataGrid (Markaz) */}
        <Grid size={{ xs: 12, sm: 7 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 }
              }
            }}
            sx={{
              height: 'calc(100vh - 250px)',
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center'
              }
            }}
            disableRowSelectionOnClick
          />
        </Grid>

        {/* Biriktirilgan Mahallalar Ro'yxati (O'ng tomon) */}
        <Grid size={{ xs: 0, sm: 2.5 }} sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Box sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography sx={{ fontWeight: '700', mb: 1, px: 1 }}>{t('inspectorsPage.notFreeMahallas')}</Typography>
            <List sx={{ height: 'calc(100vh - 270px)', overflow: 'auto' }}>
              {mahallalar
                .filter((mfy) => mfy.reja > 0 && mfy.biriktirilganNazoratchi?.inspactor_id !== null)
                .map((item) => (
                  <ListItem
                    key={item.id}
                    disablePadding
                    sx={{ py: 0.5, px: 1, borderBottom: '1px dashed', borderColor: 'divider' }}
                    secondaryAction={
                      <IconButton edge="end" size="small" onClick={() => handleDelete(item.id)}>
                        <DeleteIcon sx={{ color: isDark ? 'error.light' : 'error.main' }} />
                      </IconButton>
                    }
                  >
                    <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>
                      {item.name}
                    </Typography>
                  </ListItem>
                ))}
            </List>
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default Inspectors;
