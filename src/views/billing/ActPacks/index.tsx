import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
  TextField,
  useTheme
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  FileDownload as ExcelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalOffer as TagIcon,
  KeyboardDoubleArrowRight as ArrowRightIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import api from 'utils/api';
import useCustomizationStore from 'store/customizationStore';
import MainCard from 'ui-component/cards/MainCard';

interface ActPackItem {
  id: number;
  name: string;
  companyName: string;
  companyId: number;
  packType: string;
  isActive: boolean;
  createdUserName: string;
  creatorFullName?: string;
  creatorName?: string;
  actsCount: number;
  actsAmount: number;
  creditActsCount: number;
  creditActsAmount: number;
  checkedCount?: number;
  notCheckedCount?: number;
  createdDate?: string;
  [key: string]: any;
}

const packTypeDisplayMap: Record<string, { label: string; lightColor: string; darkColor: string }> = {
  INVENTORY: { label: "Odam sonini o'zgartirish", lightColor: '#0284c7', darkColor: '#38bdf8' },
  odam_soni: { label: "Odam sonini o'zgartirish", lightColor: '#0284c7', darkColor: '#38bdf8' },
  viza: { label: "Odam sonini o'zgartirish", lightColor: '#0284c7', darkColor: '#38bdf8' },
  death: { label: "Odam sonini o'zgartirish", lightColor: '#0284c7', darkColor: '#38bdf8' },
  CANCEL_CONTRACT: { label: 'Shartnoma bekor qilish', lightColor: '#dc2626', darkColor: '#f87171' },
  dvaynik: { label: 'Shartnoma bekor qilish', lightColor: '#dc2626', darkColor: '#f87171' },
  SIMPLE: { label: "To'lov kelib tushmagan", lightColor: '#16a34a', darkColor: '#4ade80' },
  pul_kuchirish: { label: "To'lov kelib tushmagan", lightColor: '#16a34a', darkColor: '#4ade80' }
};

const ActPacks: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { company } = useCustomizationStore();

  const [period, setPeriod] = useState<string>(dayjs().format('MM.YYYY'));
  const [rows, setRows] = useState<ActPackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | string>(company?.id || '');

  // Fetch companies list
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await api.get('/auth/companies');
        if (data?.ok && data.companies) {
          setCompanies(data.companies);
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch act packs
  const fetchPacks = async () => {
    setLoading(true);
    try {
      const targetCompany = selectedCompanyId || company?.id;
      const { data } = await api.get('/acts/packs', {
        params: {
          period,
          companyId: targetCompany
        }
      });
      if (Array.isArray(data)) {
        setRows(data);
      } else if (data?.content) {
        setRows(data.content);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error('Error fetching act packs:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, [period, selectedCompanyId]);

  // Excel export
  const handleExportExcel = () => {
    if (!rows.length) return;
    const exportData = rows.map((r) => ({
      ID: r.id,
      Nomi: r.name,
      'Korxona nomi': r.companyName || company?.name,
      'Pachka turi': packTypeDisplayMap[r.packType]?.label || r.packType,
      Holat: r.isActive ? 'Faol' : 'Nofaol',
      'Foydalanuvchi F.I.Sh': r.createdUserName || r.creatorFullName || r.creatorName || '-',
      'Aktlar soni': r.actsCount,
      'Aktlar summasi': r.actsAmount,
      Kreditorlik: r.creditActsCount,
      'Kreditorlik (Summa)': r.creditActsAmount
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Aktlar pachkasi');
    XLSX.writeFile(wb, `Aktlar_pachkasi_${period}.xlsx`);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
        renderCell: (params) => (
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
            {params.value}
          </Typography>
        )
      },
      {
        field: 'name',
        headerName: 'Nomi',
        flex: 1.2,
        minWidth: 150,
        renderCell: (params) => (
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>
            {params.value}
          </Typography>
        )
      },
      {
        field: 'companyName',
        headerName: 'Korxona nomi',
        flex: 1.5,
        minWidth: 200,
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
            {params.value || company?.name || '-'}
          </Typography>
        )
      },
      {
        field: 'packType',
        headerName: 'Pachka turi',
        flex: 1.3,
        minWidth: 160,
        renderCell: (params) => {
          const info = packTypeDisplayMap[params.value];
          const label = info ? info.label : params.value;
          const color = info ? (isDark ? info.darkColor : info.lightColor) : (isDark ? '#38bdf8' : '#0284c7');
          return (
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color }}>
              {label}
            </Typography>
          );
        }
      },
      {
        field: 'isActive',
        headerName: 'Holat',
        width: 80,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) =>
          params.value ? (
            <CheckCircleIcon sx={{ color: isDark ? '#4ade80' : '#16a34a', fontSize: 20 }} />
          ) : (
            <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>-</Typography>
          )
      },
      {
        field: 'createdUserName',
        headerName: 'Foydalanuvchi F.I.Sh',
        flex: 1.2,
        minWidth: 150,
        renderCell: (params) => {
          const userName = params.value || params.row.creatorFullName || params.row.creatorName || '-';
          return (
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.primary' }}>
              {userName}
            </Typography>
          );
        }
      },
      {
        field: 'actsCount',
        headerName: 'Aktlar soni',
        width: 100,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
            {params.value ?? 0}
          </Typography>
        )
      },
      {
        field: 'actsAmount',
        headerName: 'Aktlar summasi',
        width: 140,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
            {Number(params.value || 0).toLocaleString('uz-UZ')}
          </Typography>
        )
      },
      {
        field: 'creditActsCount',
        headerName: 'Kreditorlik',
        width: 100,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            {params.value ?? 0}
          </Typography>
        )
      },
      {
        field: 'creditActsAmount',
        headerName: 'Kreditorlik (Summa)',
        width: 150,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
            {Number(params.value || 0).toLocaleString('uz-UZ')}
          </Typography>
        )
      },
      {
        field: 'actions',
        headerName: 'Harakat',
        width: 170,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
            <Tooltip title="Tahrirlash">
              <IconButton size="small" sx={{ color: isDark ? '#38bdf8' : '#0284c7' }}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="O'chirish">
              <IconButton size="small" sx={{ color: isDark ? '#f87171' : '#dc2626' }}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Teg">
              <IconButton size="small" sx={{ color: isDark ? '#fbbf24' : '#f59e0b' }}>
                <TagIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ichiga kirish / Aktlar ro'yxati">
              <IconButton
                size="small"
                onClick={() => navigate(`/billing/act-packs/${params.row.id}`)}
                sx={{
                  color: isDark ? '#4ade80' : '#16a34a',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(74, 222, 128, 0.4)' : '#bbf7d0',
                  borderRadius: '6px',
                  p: '4px',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(74, 222, 128, 0.1)' : '#f0fdf4'
                  }
                }}
              >
                <ArrowRightIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [company, navigate, isDark]
  );

  return (
    <Box sx={{ width: '100%', p: { xs: 1, md: 2 } }}>
      {/* Top Header Breadcrumbs & Details */}
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '1rem', fontWeight: 500 }}>
            Jismoniy abonentlar
          </Typography>
          <Typography sx={{ color: 'text.disabled', fontSize: '1rem' }}>/</Typography>
          <Typography sx={{ color: 'text.primary', fontSize: '1.125rem', fontWeight: 700 }}>
            Aktlar pachkasi
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>
            Joriy davr: {period}
          </Typography>
          <Card
            variant="outlined"
            sx={{
              px: 1.5,
              py: 0.5,
              backgroundColor: 'background.paper',
              borderColor: 'divider'
            }}
          >
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary' }}>
              {company?.name || 'ANVARJON BIZNES INVEST Kattaqo‘rg‘on tumani'}
            </Typography>
          </Card>
        </Stack>
      </Stack>

      {/* Main Container Card */}
      <MainCard content={false} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        {/* Toolbar */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: isDark ? 'background.default' : '#fafafa'
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            {/* + Qo'shish Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: isDark ? '#15803d' : '#16a34a',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                borderRadius: '6px',
                px: 2,
                '&:hover': { backgroundColor: isDark ? '#166534' : '#15803d' }
              }}
            >
              Qo‘shish
            </Button>

            {/* Korxona Select */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: '6px',
                  backgroundColor: 'background.paper',
                  color: 'text.primary',
                  fontSize: '0.875rem'
                }}
              >
                <MenuItem value="">Korxonani tanlang</MenuItem>
                {companies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Davr (Period) Input */}
            <TextField
              size="small"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="MM.YYYY"
              sx={{ width: 130, backgroundColor: 'background.paper', borderRadius: '6px' }}
              slotProps={{
                input: {
                  sx: { fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }
                }
              }}
            />

            {/* Excel Export Button */}
            <Button
              variant="contained"
              startIcon={<ExcelIcon />}
              onClick={handleExportExcel}
              sx={{
                backgroundColor: isDark ? '#047857' : '#059669',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                borderRadius: '6px',
                px: 2,
                '&:hover': { backgroundColor: isDark ? '#065f46' : '#047857' }
              }}
            >
              Excel
            </Button>

            {/* Refresh Button */}
            <Tooltip title="Yangilash">
              <IconButton onClick={fetchPacks} disabled={loading} size="small" sx={{ color: 'text.secondary' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* DataGrid */}
        <Box sx={{ width: '100%', minHeight: 400 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[20, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 50, page: 0 } }
            }}
            sx={{
              border: 'none',
              backgroundColor: 'background.paper',
              color: 'text.primary',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: isDark ? 'background.default' : '#f8fafc',
                borderBottom: '2px solid',
                borderColor: 'divider',
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: 'text.secondary'
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                color: 'text.secondary',
                fontWeight: 700
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderColor: 'divider',
                fontSize: '0.875rem',
                color: 'text.primary'
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc'
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid',
                borderColor: 'divider',
                color: 'text.secondary'
              },
              '& .MuiTablePagination-root': {
                color: 'text.secondary'
              }
            }}
          />
        </Box>
      </MainCard>
    </Box>
  );
};

export default ActPacks;
