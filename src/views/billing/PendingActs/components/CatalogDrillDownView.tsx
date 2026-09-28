import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import {
  ArrowBack,
  FileDownloadOutlined,
  SearchOutlined,
  Replay,
  VisibilityOutlined,
  EditOutlined,
  DeleteOutlined,
  OpenInNew,
  PictureAsPdfOutlined,
  ErrorOutlineOutlined,
  HourglassEmptyOutlined,
  CheckCircleOutlineOutlined,
  SyncOutlined
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

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
  onSelectAct: (id: string) => void;
  selectedActId: string | null;
  onRetry: (id: string) => void;
  onBulkRetry: () => void;
  onEdit: (act: any) => void;
  onDelete: (id: string, hasAriza: boolean) => void;
  onViewFile: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const renderStatusChip = (status: string) => {
  let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
  let label = status;
  let icon = <HourglassEmptyOutlined sx={{ fontSize: 14 }} />;

  switch (status) {
    case 'pending':
      color = 'warning';
      label = 'Kutilmoqda';
      icon = <HourglassEmptyOutlined sx={{ fontSize: 14 }} />;
      break;
    case 'processing':
      color = 'info';
      label = 'Jarayonda';
      icon = <SyncOutlined sx={{ fontSize: 14 }} />;
      break;
    case 'completed':
      color = 'success';
      label = 'Kiritilgan';
      icon = <CheckCircleOutlineOutlined sx={{ fontSize: 14 }} />;
      break;
    case 'failed':
      color = 'error';
      label = 'Xatolik';
      icon = <ErrorOutlineOutlined sx={{ fontSize: 14 }} />;
      break;
    default:
      label = status || '-';
  }

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      size="small"
      variant="filled"
      sx={{ fontWeight: 700, fontSize: '0.75rem' }}
    />
  );
};

const formatCurrency = (val: number | undefined | null): string => {
  if (!val) return '0 so‘m';
  return `${Number(val).toLocaleString('uz-UZ')} so‘m`;
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
  onSelectAct,
  selectedActId,
  onRetry,
  onBulkRetry,
  onEdit,
  onDelete,
  onViewFile,
  searchQuery,
  onSearchChange
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Excel eksport
  const handleExportExcel = () => {
    const dataToExport = rows.map((r, i) => ({
      '№': (pageNum - 1) * limit + i + 1,
      'Hisob raqam': r.accountNumber,
      'Hujjat turi': r.document_type,
      'Summa': r.actAmount,
      'Yashovchilar soni': r.next_inhabitant_count ?? '-',
      'Holat': r.status,
      'Ariza raqami': r.ariza?.document_number || '-',
      'Ariza egasi': r.ariza?.fio || '-',
      'Izoh': r.description || '-',
      'Oxirgi xatolik': r.lastError || '-',
      'Sana': dayjs(r.createdAt).format('DD.MM.YYYY HH:mm')
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kutilayotgan aktlar');
    XLSX.writeFile(wb, `Kutilayotgan_aktlar_${category || 'barchasi'}_${period}.xlsx`);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'index',
        headerName: '№',
        width: 60,
        sortable: false,
        renderCell: (params) => {
          const rowIndex = rows.findIndex((r) => r._id === params.row._id);
          return (
            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
              {(pageNum - 1) * limit + (rowIndex >= 0 ? rowIndex + 1 : 1)}
            </Typography>
          );
        }
      },
      {
        field: 'accountNumber',
        headerName: 'Hisob raqam',
        minWidth: 140,
        flex: 1,
        renderCell: (params) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              fontFamily: 'monospace',
              color: theme.palette.primary.main,
              letterSpacing: '0.03em'
            }}
          >
            {params.value}
          </Typography>
        )
      },
      {
        field: 'document_type',
        headerName: 'Hujjat turi',
        minWidth: 150,
        flex: 1,
        renderCell: (params) => (
          <Chip
            label={t(`documentTypes.${params.value}`, params.value)}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
        )
      },
      {
        field: 'actAmount',
        headerName: 'Summa',
        minWidth: 130,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {formatCurrency(params.value)}
          </Typography>
        )
      },
      {
        field: 'next_inhabitant_count',
        headerName: 'Odam soni',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value !== null && params.value !== undefined ? params.value : '-'}
          </Typography>
        )
      },
      {
        field: 'status',
        headerName: 'Holat',
        minWidth: 130,
        renderCell: (params) => renderStatusChip(params.value)
      },
      {
        field: 'ariza',
        headerName: 'Ariza',
        minWidth: 130,
        renderCell: (params) => {
          const ariza = params.row.ariza;
          if (!ariza) {
            return (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Mavjud emas
              </Typography>
            );
          }
          return (
            <Tooltip title={ariza.fio ? `Arizachi: ${ariza.fio}` : 'Arizani ko‘rish'}>
              <Chip
                label={`№ ${ariza.document_number || 'A'}`}
                size="small"
                color="info"
                variant="outlined"
                icon={<OpenInNew sx={{ fontSize: 13 }} />}
                sx={{ fontWeight: 700, cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAct(params.row._id);
                }}
              />
            </Tooltip>
          );
        }
      },
      {
        field: 'lastError',
        headerName: 'Xatolik / Sabab',
        minWidth: 180,
        flex: 1.5,
        renderCell: (params) => {
          if (!params.value) {
            return (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                -
              </Typography>
            );
          }
          return (
            <Tooltip title={params.value}>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.error.main,
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 240
                }}
              >
                {params.value}
              </Typography>
            </Tooltip>
          );
        }
      },
      {
        field: 'createdAt',
        headerName: 'Sana',
        minWidth: 140,
        renderCell: (params) => (
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            {dayjs(params.value).format('DD.MM.YYYY HH:mm')}
          </Typography>
        )
      },
      {
        field: 'actions',
        headerName: 'Amallar',
        width: 170,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
            {/* Qayta kiritish */}
            <Tooltip title="Qayta urinish">
              <IconButton
                size="small"
                color="warning"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry(params.row._id);
                }}
                disabled={params.row.status === 'processing'}
              >
                <Replay fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Faylni ko'rish */}
            <Tooltip title="PDF faylni ochish">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewFile(params.row._id);
                }}
              >
                <PictureAsPdfOutlined fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Tahrirlash */}
            <Tooltip title="Tahrirlash">
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(params.row);
                }}
              >
                <EditOutlined fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* O'chirish */}
            <Tooltip title="O‘chirish">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(params.row._id, Boolean(params.row.ariza_id));
                }}
              >
                <DeleteOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [limit, onEdit, onDelete, onRetry, onSelectAct, onViewFile, pageNum, rows, t, theme]
  );

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: theme.palette.divider,
        bgcolor: theme.palette.background.paper,
        overflow: 'hidden'
      }}
    >
      {/* Yuqori boshqaruv paneli */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderBottom: '1px solid',
          borderColor: theme.palette.divider,
          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.02)
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}
        >
          {/* Chap: Qaytish tugmasi va nom */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBack />}
              onClick={onBackToCatalogs}
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary
              }}
            >
              Kataloglar
            </Button>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {categoryLabel || 'Barcha aktlar'}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Jami {total} ta akt topildi
              </Typography>
            </Box>
          </Stack>

          {/* O'ng: Qidiruv, Ommaviy qayta urinish va Eksport */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Hisob raqam yoki izoh..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  )
                }
              }}
              sx={{ width: { xs: '100%', sm: 220 } }}
            />

            <Button
              variant="contained"
              color="warning"
              size="small"
              startIcon={<Replay />}
              onClick={onBulkRetry}
              sx={{ fontWeight: 700, textTransform: 'none', px: 1.5 }}
            >
              Ommaviy qayta urinish
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadOutlined />}
              onClick={handleExportExcel}
              disabled={rows.length === 0}
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary
              }}
            >
              Excel
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Asosiy DataGrid jadvali */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          getRowId={(row) => row._id}
          columns={columns}
          loading={isLoading}
          rowCount={total}
          paginationMode="server"
          paginationModel={{
            page: pageNum - 1,
            pageSize: limit
          }}
          onPaginationModelChange={(model) => {
            onPageChange(model.page + 1);
            onLimitChange(model.pageSize);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
          disableRowSelectionOnClick
          onRowClick={(params: GridRowParams) => onSelectAct(params.row._id)}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: alpha(theme.palette.action.hover, theme.palette.mode === 'dark' ? 0.1 : 0.4),
              borderBottom: '1px solid',
              borderColor: theme.palette.divider,
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            },
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.03)
              }
            }
          }}
        />
      </Box>
    </Card>
  );
};

export default CatalogDrillDownView;
