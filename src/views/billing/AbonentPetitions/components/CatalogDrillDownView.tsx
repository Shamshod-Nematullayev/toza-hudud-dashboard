import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  FileDownloadOutlined,
  NoteAddOutlined,
  SearchOutlined,
  Update,
  UploadFileOutlined,
  VisibilityOutlined,
  MoveToInboxOutlined,
  CancelOutlined,
  PrintOutlined
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import api from 'utils/api';
import { toast } from 'react-toastify';

interface CatalogDrillDownViewProps {
  category: string | null;
  categoryLabel?: string;
  period: string;
  statusFilter: string | null;
  statusLabel?: string;
  onBackToCatalogs: () => void;
  rows: any[];
  total: number;
  pageNum: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading: boolean;
  onSelectAriza: (id: string) => void;
  selectedArizaId: string | null;
  onOpenRejectDialog: (row: any) => void;
  onMoveToInbox: (id: string) => void;
  onPrint: (id: string) => void;
  printingId: string | null;
  onUpdateFromTozamakon: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const renderStatusChip = (status: string) => {
  if (!status) return null;

  let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
  let label = status;

  switch (status) {
    case 'yangi':
      color = 'info';
      label = 'Yangi';
      break;
    case 'qabul qilindi':
      color = 'warning';
      label = 'Qabul qilindi';
      break;
    case 'tasdiqlangan':
      color = 'success';
      label = 'Tasdiqlangan';
      break;
    case 'bekor qilindi':
      color = 'error';
      label = 'Bekor qilingan';
      break;
    case 'akt_kiritilgan':
      color = 'primary';
      label = 'Akt kiritilgan';
      break;
    case 'qayta_akt_kiritilgan':
      color = 'secondary';
      label = 'Qayta akt kiritilgan';
      break;
    case 'keyinroq_kiritiladigan':
      color = 'default';
      label = 'Keyinroq kiritiladigan';
      break;
    default:
      label = status;
  }

  return <Chip label={label} color={color} size="small" variant="filled" sx={{ fontWeight: 600 }} />;
};

const renderActStatusChip = (actStatus: string) => {
  if (!actStatus) return <span>-</span>;

  let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
  let label = actStatus;

  switch (actStatus) {
    case 'NEW':
      color = 'info';
      label = 'Yangi';
      break;
    case 'WARNED':
      color = 'warning';
      label = 'Ogohlantirilgan';
      break;
    case 'CONFIRMED':
    case 'APPROVED':
      color = 'success';
      label = 'Tasdiqlangan';
      break;
    case 'CANCELLED':
    case 'CANCELED':
      color = 'error';
      label = 'Bekor qilindi';
      break;
    default:
      label = actStatus;
  }

  return <Chip label={label} color={color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
};

const CatalogDrillDownView: React.FC<CatalogDrillDownViewProps> = ({
  category,
  categoryLabel,
  period,
  statusFilter,
  statusLabel,
  onBackToCatalogs,
  rows,
  total,
  pageNum,
  limit,
  onPageChange,
  onLimitChange,
  isLoading,
  onSelectAriza,
  selectedArizaId,
  onOpenRejectDialog,
  onMoveToInbox,
  onPrint,
  printingId,
  onUpdateFromTozamakon,
  searchQuery,
  onSearchChange
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  // Excel Export
  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      toast.info(t('messages.exportStarted', 'Excel fayli tayyorlanmoqda...'));

      const fromDate = dayjs(`${period}-01`).startOf('month').toISOString();
      const toDate = dayjs(`${period}-01`).endOf('month').toISOString();

      const params: any = {
        limit: 5000,
        created_from_date: fromDate,
        created_to_date: toDate
      };
      if (category) params.document_type = category;
      if (statusFilter && statusFilter !== 'all') params.ariza_status = statusFilter;

      const res = await api.get('/arizalar', { params });
      const exportItems = res.data?.data || [];

      if (exportItems.length === 0) {
        toast.warning(t('messages.noDataToExport', 'Eksport qilish uchun ma’lumot topilmadi'));
        return;
      }

      const excelData = exportItems.map((item: any, idx: number) => ({
        '№': idx + 1,
        'Hujjat raqami': item.document_number || '-',
        'Hujjat turi': t(`documentTypes.${item.document_type}`, item.document_type || '-'),
        'Hisob raqami': item.licshet || '-',
        'Abonent F.I.Sh': item.fullName || item.fio || '-',
        'Ariza sanasi': item.sana ? dayjs(item.sana).format('YYYY-MM-DD HH:mm') : '-',
        'Akt summasi': item.aktSummasi || 0,
        Holati: item.status || '-',
        'Akt holati': item.actStatus || '-'
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Arizalar');
      const filename = `Arizalar_${category || 'barchasi'}_${period}.xlsx`;
      XLSX.writeFile(wb, filename);

      toast.success(t('messages.exportSuccess', 'Excel fayli muvaffaqiyatli yuklandi'));
    } catch (error) {
      console.error(error);
      toast.error(t('messages.error', 'Eksport qilishda xatolik yuz berdi'));
    } finally {
      setIsExporting(false);
    }
  };

  const columns = useMemo<GridColDef[]>(() => {
    const cols: GridColDef[] = [
      {
        field: 'documentNumber',
        headerName: '№',
        width: 80,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            #{params.row.documentNumber || '-'}
          </Typography>
        )
      },
      {
        field: 'accountNumber',
        headerName: t('tableHeaders.accountNumber', 'Hisob raqam'),
        width: 140,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
            {params.row.accountNumber}
          </Typography>
        )
      },
      {
        field: 'fio',
        headerName: t('tableHeaders.fio', 'Abonent F.I.Sh'),
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
            {params.row.fio || '-'}
          </Typography>
        )
      }
    ];

    // If viewing all categories (global status filter), show Document Type column
    if (!category) {
      cols.push({
        field: 'documentType',
        headerName: t('tableHeaders.documentType', 'Hujjat turi'),
        width: 170
      });
    }

    cols.push(
      {
        field: 'sana',
        headerName: t('tableHeaders.createdDate', 'Sana'),
        width: 120,
        renderCell: (params) => (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {params.row.sana ? dayjs(params.row.sana).format('DD.MM.YYYY') : '-'}
          </Typography>
        )
      },
      {
        field: 'aktSummasi',
        headerName: t('tableHeaders.actAmount', 'Akt summasi'),
        width: 140,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {params.row.aktSummasi ? Number(params.row.aktSummasi).toLocaleString('uz-UZ') + ' so‘m' : '0 so‘m'}
          </Typography>
        )
      },
      {
        field: 'status',
        headerName: t('tableHeaders.status', 'Holati'),
        width: 150,
        renderCell: (params) => renderStatusChip(params.row.status)
      },
      {
        field: 'actStatus',
        headerName: t('tableHeaders.actStatus', 'Akt holati'),
        width: 140,
        renderCell: (params) => renderActStatusChip(params.row.actStatus)
      },
      {
        field: 'actions',
        headerName: t('tableHeaders.actions', 'Amallar'),
        width: 190,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const isPrintingThis = printingId === params.row._id;
          const isCancelDisabled = params.row.status === 'tasdiqlangan' || params.row.status === 'bekor qilindi';
          const isAcceptDisabled = params.row.status !== 'yangi';

          return (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Detail drawer button */}
              <Tooltip title={t('tableActions.viewDetails', 'Batafsil ko‘rish')}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onSelectAriza(params.row._id)}
                  sx={{
                    p: 0.6,
                    backgroundColor: selectedArizaId === params.row._id ? 'primary.lighter' : 'transparent',
                    '&:hover': { backgroundColor: 'primary.lighter' }
                  }}
                >
                  <VisibilityOutlined sx={{ fontSize: 19 }} />
                </IconButton>
              </Tooltip>

              {/* Accept button */}
              <Tooltip title={t('tableActions.accept', 'Qabul qilish')}>
                <span>
                  <IconButton
                    size="small"
                    color="primary"
                    disabled={isAcceptDisabled}
                    onClick={() => onMoveToInbox(params.row._id)}
                    sx={{ p: 0.6, '&:hover': { backgroundColor: 'primary.lighter' } }}
                  >
                    <MoveToInboxOutlined sx={{ fontSize: 19 }} />
                  </IconButton>
                </span>
              </Tooltip>

              {/* Cancel button */}
              <Tooltip title={t('tableActions.cancel', 'Bekor qilish')}>
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={isCancelDisabled}
                    onClick={() => onOpenRejectDialog(params.row)}
                    sx={{ p: 0.6, '&:hover': { backgroundColor: 'error.lighter' } }}
                  >
                    <CancelOutlined sx={{ fontSize: 19 }} />
                  </IconButton>
                </span>
              </Tooltip>

              {/* Print button */}
              <Tooltip title={t('tableActions.print', 'Chop etish')}>
                <span>
                  <IconButton
                    size="small"
                    color="info"
                    disabled={isPrintingThis}
                    onClick={() => onPrint(params.row._id)}
                    sx={{ p: 0.6, '&:hover': { backgroundColor: 'info.lighter' } }}
                  >
                    {isPrintingThis ? <CircularProgress size={17} /> : <PrintOutlined sx={{ fontSize: 19 }} />}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          );
        }
      }
    );

    return cols;
  }, [category, printingId, selectedArizaId, onSelectAriza, onMoveToInbox, onOpenRejectDialog, onPrint, t]);

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Top Action Toolbar */}
      <Box
        sx={{
          px: { xs: 1.2, sm: 1.5 },
          py: 0.8,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1
        }}
      >
        {/* Left Side: Back button + Title */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
            onClick={onBackToCatalogs}
            sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 1.5, py: 0.4, px: 1.2, fontSize: '0.82rem' }}
          >
            {t('buttons.backToCatalogs', 'Kataloglar')}
          </Button>

          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
            {categoryLabel || (statusFilter ? `${statusLabel} arizalari` : 'Barcha arizalar')}
          </Typography>

          <Chip
            label={`${total.toLocaleString('uz-UZ')} ta ariza`}
            size="small"
            color="primary"
            variant="filled"
            sx={{ fontWeight: 600, height: 22, fontSize: '0.75rem' }}
          />
        </Stack>

        {/* Right Side: Actions + Search */}
        <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.8 }}>
          {/* Search Box */}
          <Box component="form" onSubmit={handleSearchSubmit}>
            <TextField
              size="small"
              placeholder={t('searchPlaceholder', 'Hisob raqam yoki №')}
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                if (!e.target.value) {
                  onSearchChange('');
                }
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  sx: { height: 32, fontSize: '0.82rem' }
                }
              }}
              sx={{ width: { xs: 150, sm: 180 } }}
            />
          </Box>

          {/* Excel Export */}
          <Button
            variant="outlined"
            color="success"
            size="small"
            startIcon={isExporting ? <CircularProgress size={14} /> : <FileDownloadOutlined sx={{ fontSize: 16 }} />}
            onClick={handleExportExcel}
            disabled={isExporting || total === 0}
            sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 1.5, py: 0.4, px: 1.2, fontSize: '0.82rem' }}
          >
            {t('buttons.exportExcel', 'Excelga eksport')}
          </Button>

          {/* Ariza qo'shish */}
          <Link to="/billing/createAbonentAriza" style={{ textDecoration: 'none' }}>
            <Button
              color="primary"
              variant="contained"
              size="small"
              startIcon={<NoteAddOutlined sx={{ fontSize: 16 }} />}
              sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 1.5, py: 0.4, px: 1.2, fontSize: '0.82rem' }}
            >
              {t('buttons.add', 'Ariza qo‘shish')}
            </Button>
          </Link>

          {/* Import */}
          <Link to="/billing/importAbonentPetition" style={{ textDecoration: 'none' }}>
            <Button
              color="secondary"
              variant="outlined"
              size="small"
              startIcon={<UploadFileOutlined sx={{ fontSize: 16 }} />}
              sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 1.5, py: 0.4, px: 1.2, fontSize: '0.82rem' }}
            >
              {t('buttons.import', 'Import')}
            </Button>
          </Link>

          {/* Tozamakondan yangilash */}
          <Tooltip
            title={
              statusFilter && statusFilter !== 'all'
                ? `${statusLabel || statusFilter} arizalarini Tozamakondan yangilash`
                : 'Akt kiritilgan arizalarni Tozamakondan yangilash'
            }
          >
            <span>
              <IconButton
                color="info"
                size="small"
                onClick={onUpdateFromTozamakon}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  p: 0.6
                }}
              >
                <Update fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      {/* Full Width DataGrid (Takes 100% of container) */}
      <DataGrid
        columns={columns}
        rows={rows}
        rowCount={total}
        loading={isLoading}
        paginationMode="server"
        filterMode="server"
        disableColumnSorting
        disableColumnMenu
        rowHeight={46}
        columnHeaderHeight={40}
        paginationModel={{ page: Math.max(0, pageNum - 1), pageSize: limit }}
        pageSizeOptions={[10, 25, 50, 100]}
        onPaginationModelChange={(model) => {
          onPageChange(model.page + 1);
          onLimitChange(model.pageSize);
        }}
        onRowClick={(params: GridRowParams) => {
          onSelectAriza(params.row._id);
        }}
        rowSelectionModel={{
          type: 'include',
          ids: new Set(
            selectedArizaId && rows.some((r) => r._id === selectedArizaId)
              ? [rows.findIndex((r) => r._id === selectedArizaId)]
              : []
          )
        }}
        sx={{
          height: 'calc(100vh - 200px)',
          minHeight: 520,
          border: 'none',
          cursor: 'pointer',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontWeight: 700,
            fontSize: '0.82rem'
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 0.5
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover'
          },
          '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: `${theme.palette.primary.main}12`,
            '&:hover': {
              backgroundColor: `${theme.palette.primary.main}1a`
            }
          }
        }}
      />
    </Card>
  );
};

export default CatalogDrillDownView;
