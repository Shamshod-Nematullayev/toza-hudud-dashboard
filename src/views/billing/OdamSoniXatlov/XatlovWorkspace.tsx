import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import SimCardDownloadOutlinedIcon from '@mui/icons-material/SimCardDownloadOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DoDisturbAltOutlinedIcon from '@mui/icons-material/DoDisturbAltOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { CSVDownload } from 'react-csv';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import MainCard from 'ui-component/cards/MainCard';
import FileInputDrop from 'ui-component/FileInputDrop';
import api from 'utils/api';
import useOdamSoniXatlovStore from './odamSoniXatlovStore';
import AddSingleXatlovModal from './modals/AddSingleXatlovModal';
import ImportXatlovExcelModal from './modals/ImportXatlovExcelModal';
import PrintSection from './PrintSection';
import PreviewDialog from '../XatlovDalolatnomalar/PreviewDialog';
import { getRequestdocumentByIds } from 'services/getRequestdocumentByIds';
import { getXatlovDocumentById } from 'services/getXatlovDocumentById';
import { getMahallaById } from 'services/getMahallaById';
import { extractQRCodeFromPDF } from 'views/tools/extractQRCodeFromPDF';
import { lotinga } from 'helpers/lotinKiril';
import { IMultiplyRequest, IXatlovDocument } from 'types/billing';

const getStatusRequest = (data: IMultiplyRequest) => {
  if (data.isCancel) return 'bekor qilindi';
  if (!data.document_id) return 'yangi';
  if (!data.actId) return 'xujjat yaratilgan';
  if (!data.confirm) return 'akt qilingan';
  return 'yakunlangan';
};

interface XatlovWorkspaceProps {
  defaultTab?: number;
}

export default function XatlovWorkspace({ defaultTab = 0 }: XatlovWorkspaceProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<number>(defaultTab);

  // Store references
  const {
    rows,
    total,
    pagination,
    ui,
    pdfFile,
    dalolatnoma,
    fetchRows,
    updatePagination,
    setLoading,
    toggleRefresh,
    setPrintModal,
    setPdfFile
  } = useOdamSoniXatlovStore();

  // Modals state
  const [openSingleModal, setOpenSingleModal] = useState(false);
  const [openExcelModal, setOpenExcelModal] = useState(false);

  // Tab 0: Abonentlar xatlovi State
  const apiRef = useGridApiRef();
  const [mahallaOptions, setMahallaOptions] = useState<any[]>([]);

  // CSV State
  const [readyToDownload, setReadyToDownload] = useState(false);
  const [csvData, setCsvData] = useState([]);

  // Tab 1: Dalolatnomalar list State
  const [dalolatnomaRows, setDalolatnomaRows] = useState<any[]>([]);
  const [dalolatnomaPaging, setDalolatnomaPaging] = useState({ page: 0, pageSize: 15 });
  const [dalolatnomaMeta, setDalolatnomaMeta] = useState({ rowCount: 0 });
  const [mahallalarList, setMahallalarList] = useState<any[]>([]);

  // Preview Dialog State
  const [currentDocument, setCurrentDocument] = useState<IXatlovDocument>();
  const [requestDocuments, setRequestDocuments] = useState<IMultiplyRequest[]>([]);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);

  // Tab 2: PDF Scanner State
  const [dalolatnomaNumber, setDalolatnomaNumber] = useState('');
  const [uploadingRows, setUploadingRows] = useState<any[]>([]);
  const [clearTrigger, setClearTrigger] = useState(false);

  // Backend Stats State
  const [stats, setStats] = useState({
    totalRequests: 0,
    newRequests: 0,
    totalDocuments: 0,
    activeDocuments: 0
  });

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/yashovchi-soni-xatlov/stats');
      if (data && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Initial Load & Options
  useEffect(() => {
    fetchRows();
    fetchStats();
  }, [pagination.page, pagination.limit, pagination.filter, ui.refreshToggle]);

  useEffect(() => {
    api.get('/yashovchi-soni-xatlov/mahallas').then(({ data }) => {
      const options = (data.data || []).map((mfy: any) => ({
        mahallaId: mfy.mahallaId,
        mahallaName: lotinga(mfy.mahallaName)
      }));
      setMahallaOptions(options);
    });

    api.get('/billing/get-all-active-mfy').then(({ data }) => {
      setMahallalarList(data.data || []);
    });
  }, []);

  // 2. Fetch Dalolatnomalar List (Tab 1)
  const fetchDalolatnomalar = async () => {
    try {
      const { data } = await api.get('/yashovchi-soni-xatlov/get-dalolatnomalar', {
        params: {
          page: dalolatnomaPaging.page,
          pageSize: dalolatnomaPaging.pageSize
        }
      });
      setDalolatnomaRows((data.rows || []).map((row: any, i: number) => ({ ...row, id: i + 1, date: new Date(row.date) })));
      setDalolatnomaMeta(data.meta || { rowCount: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDalolatnomalar();
  }, [dalolatnomaPaging, ui.refreshToggle]);

  // Tab 0 Handlers: Dalolatnoma Yaratish
  const handleCreateDalolatnoma = async () => {
    if (!pagination.filter.mahallaId) {
      return toast.error('Iltimos, avval mahallani tanlang');
    }

    const request_ids = rows.filter((row) => row.status === 'yangi').map((row) => row._id);

    if (request_ids.length < 1) {
      return toast.warning("Tanlangan mahalla bo'yicha yangi (rasmiylashtirilmagan) xatlov yozuvlari topilmadi");
    }

    try {
      setLoading(true);
      const { data: responseData } = await api.post('/yashovchi-soni-xatlov', {
        request_ids,
        mahallaId: pagination.filter.mahallaId
      });

      toast.success(`Dalolatnoma muvaffaqiyatli yaratildi! (№ ${responseData.data.documentNumber})`);

      useOdamSoniXatlovStore.setState((state) => ({
        dalolatnoma: {
          ...state.dalolatnoma,
          data: responseData.data,
          mahalla: responseData.mahalla,
          rows: rows.filter((row) => request_ids.includes(row._id)),
          _id: responseData.data._id,
          documentNumber: responseData.data.documentNumber
        }
      }));

      setPrintModal(true);
      toggleRefresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Hujjat yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Tab 0 Handlers: Excel Download
  const handleDownloadExcel = async () => {
    try {
      const { data } = await api.get('/yashovchi-soni-xatlov', {
        params: {
          limit: 1000,
          ...pagination.filter
        }
      });

      const formatted = data.data.map((row: any, i: number) => ({
        id: i + 1,
        accountNumber: row.KOD,
        fio: row.fio,
        currentInhabitantCount: row.currentInhabitantCount,
        YASHOVCHILAR: row.YASHOVCHILAR,
        mahalla: row.mahallaName,
        status: !row.document_id ? 'yangi' : 'xujjat yaratilgan'
      }));

      setCsvData(formatted);
      setReadyToDownload(true);
      setTimeout(() => setReadyToDownload(false), 2000);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    }
  };

  // Tab 0 Handlers: TozaMakondan yangilash
  const handleClickRefresh = async () => {
    if (rows.length === 0) return;
    setLoading(true);
    let successCount = 0;
    try {
      for (const row of rows) {
        await api.patch(`/yashovchi-soni-xatlov/update-from-tozamakon/${row._id}`, {
          abonentId: row.abonentId
        });
        successCount++;
      }
      toast.success(`${successCount} ta ma'lumot yangilandi`);
      toggleRefresh();
    } catch (error) {
      toast.error('Yangilash jarayonida xatolik');
    } finally {
      setLoading(false);
    }
  };

  // Tab 1 Handlers: Cancel / View / Print Dalolatnoma
  const handleClickCancelDalolatnoma = async (doc: IXatlovDocument) => {
    const reason = prompt(
      `Siz haqiqatan ham ushbu (${doc.documentNumber}) dalolatnomani bekor qilmoqchimisiz? Bekor qilish sababini yozing:`
    );
    if (reason) {
      try {
        await api.put('/yashovchi-soni-xatlov/cancel-document/' + doc._id, {
          cancelDescription: reason
        });
        toast.info('Dalolatnoma bekor qilindi');
        fetchDalolatnomalar();
        toggleRefresh();
      } catch (err) {
        toast.error('Bekor qilishda xatolik');
      }
    }
  };

  const handleClickViewDalolatnoma = async (doc: IXatlovDocument) => {
    setCurrentDocument(doc);
    const reqDocs = await getRequestdocumentByIds(doc.request_ids);
    setRequestDocuments(reqDocs);
    setOpenPreviewDialog(true);
  };

  const handleClickPrintDalolatnoma = async (doc: IXatlovDocument) => {
    const dalolatnomaData = await getXatlovDocumentById(doc._id);
    const reqDocs = await getRequestdocumentByIds(doc.request_ids);
    const mahalla = await getMahallaById(doc.mahallaId.toString());

    useOdamSoniXatlovStore.setState((state) => ({
      dalolatnoma: {
        ...state.dalolatnoma,
        data: dalolatnomaData,
        mahalla: {
          ...mahalla.data,
          biriktirilganNazoratchi: {
            inspector_name: mahalla.data.biriktirilganNazoratchi?.inspector_name || ''
          },
          mfy_rais_name: mahalla.data.mfy_rais_name,
          name: mahalla.data.name
        },
        rows: reqDocs.map((r: any) => ({ ...r, accountNumber: r.KOD.toString() })),
        _id: dalolatnomaData._id,
        documentNumber: dalolatnomaData.documentNumber,
        isPrinting: true
      }
    }));
    setPrintModal(true);
  };

  // Tab 2 Handlers: PDF & Confirmation
  const getDalolatnomaData = async (params: any) => {
    try {
      setLoading(true);
      const { data: response } = await api.get('/yashovchi-soni-xatlov/get-one-dalolatnoma', { params });
      const requestRows = await getRequestdocumentByIds(response.data.request_ids);

      useOdamSoniXatlovStore.setState((state) => ({
        dalolatnoma: {
          ...state.dalolatnoma,
          _id: response.data._id,
          documentNumber: response.data.documentNumber
        }
      }));

      setUploadingRows(
        requestRows.map((item: any, i: number) => ({
          id: i + 1,
          _id: item._id,
          accountNumber: item.KOD,
          fullName: item.fio,
          YASHOVCHILAR: item.YASHOVCHILAR,
          status: getStatusRequest(item),
          isCancel: item.isCancel,
          actId: item.actId,
          abonentId: item.abonentId
        }))
      );
    } catch (error) {
      toast.error(t('errors.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRow = async (_id: string, silent = false) => {
    if (!pdfFile) return toast.error(t('errors.pdfFileRequired'));
    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      if (!silent) setLoading(true);
      await api.put(`/yashovchi-soni-xatlov/confirm/${_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (!silent) await getDalolatnomaData({ _id: dalolatnoma._id });
    } catch (error) {
      if (!silent) toast.error(t('errors.somethingWentWrong'));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleConfirmAll = async () => {
    const targets = uploadingRows.filter((row) => row.status === 'xujjat yaratilgan');
    if (targets.length === 0) return toast.info(t('errors.noDocumentsToConfirm'));

    setLoading(true);
    for (const row of targets) {
      await handleConfirmRow(row._id, true);
    }
    await getDalolatnomaData({ _id: dalolatnoma._id });
    toggleRefresh();
    setLoading(false);
    toast.success(t('successMessages.allDocumentConfirmed'));
  };

  const handleCancelRow = async (_id: string) => {
    await api.put(`/yashovchi-soni-xatlov/${_id}`, { isCancel: true });
    await getDalolatnomaData({ _id: dalolatnoma._id });
  };

  const handleCancelAll = async () => {
    setLoading(true);
    await Promise.all(uploadingRows.map((row) => api.put(`/yashovchi-soni-xatlov/${row._id}`, { isCancel: true })));
    await getDalolatnomaData({ _id: dalolatnoma._id });
    setLoading(false);
  };

  useEffect(() => {
    if (pdfFile) {
      const processQR = async () => {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const data = await extractQRCodeFromPDF(new Uint8Array(arrayBuffer), 'lastPage');
        if (!data.ok) return toast.error(data.message);
        const docId = data.result?.split('_')[1];
        if (docId) await getDalolatnomaData({ _id: docId });
      };
      processQR();
    }
  }, [pdfFile]);

  useEffect(() => {
    setDalolatnomaNumber(dalolatnoma.documentNumber?.toString() || '');
  }, [dalolatnoma.documentNumber]);

  return (
    <MainCard contentSX={{ position: 'relative', padding: 2 }}>
      <PrintSection />

      {/* Modern KPI Stats Bar */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'background.default' }}>
            <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 48, height: 48 }}>
                <GroupOutlinedIcon />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {stats.totalRequests}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Jami xatlov yozuvlari
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'background.default' }}>
            <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main', width: 48, height: 48 }}>
                <PendingActionsOutlinedIcon />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {stats.newRequests}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Yangi (dalolatnomasiz)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'background.default' }}>
            <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.light', color: 'info.main', width: 48, height: 48 }}>
                <AssignmentOutlinedIcon />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {stats.totalDocuments}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Shakllantirilgan Dalolatnomalar
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'background.default' }}>
            <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: 48, height: 48 }}>
                <CheckCircleOutlinedIcon />
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {stats.activeDocuments}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Aktiv Dalolatnomalar
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Navigation Header */}
      <Paper variant="outlined" sx={{ borderRadius: 2, mb: 2, bgcolor: 'background.paper' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="📋 Abonentlar Xatlovi (Yozuvlar)"
            iconPosition="start"
            icon={<GroupOutlinedIcon fontSize="small" />}
            sx={{ fontWeight: 600, py: 1.5 }}
          />
          <Tab
            label="📑 Dalolatnomalar Ro'yxati"
            iconPosition="start"
            icon={<AssignmentOutlinedIcon fontSize="small" />}
            sx={{ fontWeight: 600, py: 1.5 }}
          />
          <Tab
            label="📤 PDF Orqali Tasdiqlash"
            iconPosition="start"
            icon={<CheckCircleOutlinedIcon fontSize="small" />}
            sx={{ fontWeight: 600, py: 1.5 }}
          />
        </Tabs>
      </Paper>

      {/* TAB 0: ABONENTLAR XATLOVI */}
      {activeTab === 0 && (
        <Stack spacing={2}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            {/* Mahalla Filter & Dalolatnoma Creation */}
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 240 }}>
                <InputLabel id="mahalla-select-label">Mahallani tanlang</InputLabel>
                <Select
                  labelId="mahalla-select-label"
                  label="Mahallani tanlang"
                  value={pagination.filter.mahallaId || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updatePagination({
                      filter: val ? { mahallaId: val } : {},
                      page: 1
                    });
                  }}
                >
                  <MenuItem value="">
                    <em>Barcha mahallalar</em>
                  </MenuItem>
                  {mahallaOptions.map((opt: any) => (
                    <MenuItem key={opt.mahallaId} value={opt.mahallaId}>
                      {opt.mahallaName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Badge badgeContent={rows.filter((r) => r.status === 'yangi').length} color="secondary" max={999}>
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={!pagination.filter.mahallaId || rows.filter((r) => r.status === 'yangi').length === 0}
                  startIcon={<NoteAddOutlinedIcon />}
                  onClick={handleCreateDalolatnoma}
                  sx={{ fontWeight: 700 }}
                >
                  Dalolatnoma yaratish
                </Button>
              </Badge>
            </Stack>

            {/* Quick Import & Add Actions */}
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Button variant="contained" color="primary" startIcon={<PersonAddOutlinedIcon />} onClick={() => setOpenSingleModal(true)}>
                Bittalab qo'shish
              </Button>

              <Button variant="outlined" color="primary" startIcon={<FileUploadOutlinedIcon />} onClick={() => setOpenExcelModal(true)}>
                Excel Import
              </Button>

              <Tooltip title="TozaMakondan yangilash">
                <IconButton color="info" onClick={handleClickRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Excelga yuklab olish">
                <IconButton color="success" onClick={handleDownloadExcel}>
                  <SimCardDownloadOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>

          {/* DataGrid Table for Abonent Records */}
          <Paper variant="outlined" sx={{ height: '65vh', width: '100%', borderRadius: 2 }}>
            <DataGrid
              rows={rows}
              columns={[
                { field: 'id', headerName: '№', width: 60 },
                { field: 'accountNumber', headerName: 'Hisob raqam', width: 140 },
                { field: 'fio', headerName: 'F.I.O', width: 220 },
                { field: 'currentInhabitantCount', headerName: 'Joriy soni', width: 110 },
                { field: 'YASHOVCHILAR', headerName: 'Aniqlandi', width: 110 },
                {
                  field: 'mahallaId',
                  headerName: 'Mahalla',
                  width: 200,
                  renderCell: (params: any) => params.value?.mahallaName || '',
                  filterOperators: [
                    {
                      label: 'Mahalla',
                      value: 'mahallaFilter',
                      InputComponent: ({ item, applyValue }: any) => (
                        <FormControl variant="standard" fullWidth>
                          <InputLabel>Mahalla</InputLabel>
                          <Select value={item.value || ''} onChange={(e) => applyValue({ ...item, value: e.target.value })}>
                            <MenuItem value="">
                              <em>Barchasi</em>
                            </MenuItem>
                            {mahallaOptions.map((opt: any) => (
                              <MenuItem key={opt.mahallaId} value={opt.mahallaId}>
                                {opt.mahallaName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ),
                      getApplyFilterFn: (filterItem: any) => {
                        if (!filterItem.value) return null;
                        return (params: any) => params.mahallaId === filterItem.value;
                      }
                    }
                  ]
                },
                {
                  field: 'status',
                  headerName: 'Status',
                  width: 160,
                  renderCell: (params: any) => {
                    const isNew = params.value === 'yangi';
                    return (
                      <Chip
                        label={isNew ? 'Yangi' : 'Xujjat yaratilgan'}
                        color={isNew ? 'warning' : 'success'}
                        size="small"
                        variant="outlined"
                      />
                    );
                  }
                }
              ]}
              rowCount={total}
              loading={ui.loading}
              paginationMode="server"
              filterMode="server"
              sortingMode="server"
              paginationModel={{
                page: pagination.page - 1,
                pageSize: pagination.limit
              }}
              onPaginationModelChange={(model) => {
                updatePagination({
                  page: model.page + 1,
                  limit: model.pageSize
                });
              }}
              onFilterModelChange={(newModel) => {
                if (!newModel.items[0] || !newModel.items[0].value) {
                  updatePagination({ filter: {}, page: 1 });
                  return;
                }
                const { field, value } = newModel.items[0];
                let filterQuery = {};
                if (field === 'status') {
                  filterQuery = { document_id: value === 'yangi' ? { $exists: false } : { $exists: true } };
                } else if (field === 'mahallaId') {
                  filterQuery = { mahallaId: value };
                }
                updatePagination({ filter: filterQuery, page: 1 });
              }}
              apiRef={apiRef}
              sx={{ border: 'none' }}
              disableColumnMenu
            />
          </Paper>
        </Stack>
      )}

      {/* TAB 1: DALOLATNOMALAR RO'YXATI */}
      {activeTab === 1 && (
        <Paper variant="outlined" sx={{ height: '70vh', width: '100%', borderRadius: 2 }}>
          <DataGrid
            columns={[
              { field: 'documentNumber', headerName: '№', width: 70 },
              {
                field: 'mahallaId',
                headerName: 'Mahalla nomi',
                width: 220,
                renderCell: ({ row }) => mahallalarList.find((m) => m.id === row.mahallaId)?.name || row.mahallaId
              },
              {
                field: 'date',
                headerName: 'Yaratilgan sana',
                width: 160,
                valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : '')
              },
              {
                field: 'elements',
                headerName: 'Abonentlar soni',
                width: 140,
                renderCell: ({ row }) => row.request_ids?.length || 0
              },
              {
                field: 'status',
                headerName: 'Holati',
                width: 160,
                renderCell: ({ row }) => (
                  <Chip label={row.isCancel ? 'Bekor qilingan' : 'Aktiv'} color={row.isCancel ? 'error' : 'success'} size="small" />
                )
              },
              {
                field: 'actions',
                headerName: 'Amallar',
                width: 180,
                renderCell: ({ row }) => (
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Bekor qilish">
                      <span>
                        <IconButton size="small" color="error" onClick={() => handleClickCancelDalolatnoma(row)} disabled={row.isCancel}>
                          <DoDisturbAltOutlinedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Ko'rish">
                      <IconButton size="small" color="info" onClick={() => handleClickViewDalolatnoma(row)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chop etish">
                      <IconButton size="small" color="primary" onClick={() => handleClickPrintDalolatnoma(row)}>
                        <PrintIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )
              }
            ]}
            rows={dalolatnomaRows}
            paginationMode="server"
            pageSizeOptions={[15, 30, 50]}
            rowCount={dalolatnomaMeta.rowCount}
            paginationModel={dalolatnomaPaging}
            onPaginationModelChange={(model) => setDalolatnomaPaging(model)}
            sx={{ border: 'none' }}
          />
        </Paper>
      )}

      {/* TAB 2: PDF SCANNER & CONFIRMATION */}
      {activeTab === 2 && (
        <Grid container spacing={2} sx={{ minHeight: '65vh' }}>
          {!pdfFile ? (
            <Grid size={12}>
              <FileInputDrop setFiles={(files) => setPdfFile(files ? files[0] : null)} clearTrigger={clearTrigger} />
            </Grid>
          ) : (
            <>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Dalolatnoma ma'lumotlari:
                    </Typography>

                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        label={t('documentNumber')}
                        value={dalolatnomaNumber}
                        fullWidth
                        onChange={(e) => setDalolatnomaNumber(e.target.value)}
                      />
                      <IconButton
                        sx={{ position: 'absolute', right: 5, top: 10 }}
                        onClick={() => getDalolatnomaData({ documentNumber: dalolatnomaNumber })}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Box>

                    <Button variant="contained" color="success" fullWidth onClick={handleConfirmAll} startIcon={<DoneAllOutlinedIcon />}>
                      {t('buttons.acceptAll')}
                    </Button>

                    <Button variant="outlined" color="error" fullWidth onClick={handleCancelAll} startIcon={<DeleteOutlinedIcon />}>
                      {t('buttons.rejectAll')}
                    </Button>

                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={() => {
                        setPdfFile(null);
                        setUploadingRows([]);
                        setClearTrigger(!clearTrigger);
                      }}
                    >
                      {t('buttons.clear')}
                    </Button>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Paper variant="outlined" sx={{ height: '65vh', width: '100%', borderRadius: 2 }}>
                  <DataGrid
                    rows={uploadingRows}
                    columns={[
                      { field: 'id', headerName: '№', width: 60 },
                      { field: 'accountNumber', headerName: t('tableHeaders.accountNumber'), width: 140 },
                      { field: 'fullName', headerName: t('tableHeaders.fullName'), width: 200 },
                      { field: 'YASHOVCHILAR', headerName: 'Soni', width: 80 },
                      { field: 'status', headerName: t('tableHeaders.status'), width: 140 },
                      {
                        field: 'actions',
                        headerName: t('tableHeaders.actions'),
                        width: 120,
                        renderCell: (params) => (
                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              size="small"
                              color="success"
                              disabled={params.row.isCancel || !!params.row.actId}
                              onClick={() => handleConfirmRow(params.row._id)}
                            >
                              <DoneOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={params.row.isCancel}
                              onClick={() => handleCancelRow(params.row._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )
                      }
                    ]}
                    hideFooter
                    sx={{ border: 'none' }}
                  />
                </Paper>
              </Grid>
            </>
          )}
        </Grid>
      )}

      {/* CSV Hidden Downloader */}
      {readyToDownload && <CSVDownload data={csvData} filename={`xatlov_${new Date().toLocaleDateString()}.csv`} target="_blank" />}

      {/* Shared Modals */}
      <AddSingleXatlovModal open={openSingleModal} onClose={() => setOpenSingleModal(false)} />
      <ImportXatlovExcelModal open={openExcelModal} onClose={() => setOpenExcelModal(false)} />
      {openPreviewDialog && currentDocument && (
        <PreviewDialog document={currentDocument} requestDocuments={requestDocuments} setOpen={setOpenPreviewDialog} />
      )}
    </MainCard>
  );
}
