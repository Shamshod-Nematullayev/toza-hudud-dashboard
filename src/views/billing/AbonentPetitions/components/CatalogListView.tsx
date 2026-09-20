import React from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import {
  ArrowForward,
  PeopleAltOutlined,
  SentimentVeryDissatisfiedOutlined,
  FlightTakeoffOutlined,
  ContentCopyOutlined,
  LocationOffOutlined,
  CurrencyExchangeOutlined,
  DescriptionOutlined,
  FolderOpenOutlined
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export interface CatalogRowData {
  documentType: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  totalCount: number;
  pendingCount: number;
  aktKiritilganCount: number;
  confirmedCount: number;
  canceledCount: number;
  totalSumma: number;
}

interface CatalogListViewProps {
  byDocumentType: any[];
  onSelectCategory: (categoryKey: string) => void;
  isLoading?: boolean;
}

const DOCUMENT_TYPE_METADATA: Record<string, { title: string; desc: string; icon: React.ReactNode }> = {
  odam_soni: {
    title: "Yashovchi soni o'zgartirish",
    desc: 'Oila a‘zolari sonini oshirish yoki kamaytirish',
    icon: <PeopleAltOutlined sx={{ color: 'primary.main' }} />
  },
  death: {
    title: "O'lim guvohnomasi",
    desc: 'Vafot etgan shaxslarni abonent kartasidan chiqarish',
    icon: <SentimentVeryDissatisfiedOutlined sx={{ color: 'error.main' }} />
  },
  viza: {
    title: 'Pasport viza kirdi-chiqdi',
    desc: 'Chet elga vaqtincha yoki doimiy chiqib ketganlar',
    icon: <FlightTakeoffOutlined sx={{ color: 'info.main' }} />
  },
  dvaynik: {
    title: 'Ikkilamchi kod',
    desc: 'Bir xil manzil yoki takroriy abonent hisob raqamlari',
    icon: <ContentCopyOutlined sx={{ color: 'warning.main' }} />
  },
  gps: {
    title: "Texnika xizmat ko'rsatmagan",
    desc: 'Chiqindi tashish xizmati bajarilmagan davrlar',
    icon: <LocationOffOutlined sx={{ color: 'secondary.main' }} />
  },
  pul_kuchirish: {
    title: 'Pul ko‘chirish',
    desc: 'Noto‘g‘ri yoki ortiqcha to‘langan mablag‘ni ko‘chirish',
    icon: <CurrencyExchangeOutlined sx={{ color: 'success.main' }} />
  }
};

const formatCurrency = (val: number | undefined | null): string => {
  if (!val) return '0 so‘m';
  return `${Number(val).toLocaleString('uz-UZ')} so‘m`;
};

const CatalogListView: React.FC<CatalogListViewProps> = ({
  byDocumentType = [],
  onSelectCategory,
  isLoading = false
}) => {
  const { t } = useTranslation();

  // Combine known metadata with response stats
  const knownKeys = Object.keys(DOCUMENT_TYPE_METADATA);
  const responseKeys = (byDocumentType || []).map((item) => item._id).filter(Boolean);
  const allKeys = Array.from(new Set([...knownKeys, ...responseKeys]));

  const catalogRows: CatalogRowData[] = allKeys.map((key) => {
    const meta = DOCUMENT_TYPE_METADATA[key] || {
      title: t(`documentTypes.${key}`, key),
      desc: 'Boshqa turdagi arizalar',
      icon: <DescriptionOutlined sx={{ color: 'text.secondary' }} />
    };

    const stat = (byDocumentType || []).find((item) => item._id === key);

    return {
      documentType: key,
      title: meta.title,
      description: meta.desc,
      icon: meta.icon,
      totalCount: stat?.count || 0,
      pendingCount: stat?.pendingCount || 0,
      aktKiritilganCount: stat?.aktKiritilganCount || 0,
      confirmedCount: stat?.confirmedCount || 0,
      canceledCount: stat?.canceledCount || 0,
      totalSumma: stat?.totalSumma || 0
    };
  });

  // Calculate totals
  const totalAllCount = catalogRows.reduce((acc, row) => acc + row.totalCount, 0);
  const totalPending = catalogRows.reduce((acc, row) => acc + row.pendingCount, 0);
  const totalAkt = catalogRows.reduce((acc, row) => acc + row.aktKiritilganCount, 0);
  const totalConfirmed = catalogRows.reduce((acc, row) => acc + row.confirmedCount, 0);
  const totalCanceled = catalogRows.reduce((acc, row) => acc + row.canceledCount, 0);
  const totalSum = catalogRows.reduce((acc, row) => acc + row.totalSumma, 0);

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
      <Box
        sx={{
          px: 1.5,
          py: 0.8,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <FolderOpenOutlined color="primary" fontSize="small" />
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
            {t('recalculationPage.catalogsTitle', 'Hujjat turlari (Kataloglar)')}
          </Typography>
          <Chip
            label={`${catalogRows.length} ta katalog`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, height: 22, fontSize: '0.75rem' }}
          />
        </Stack>

        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {t('recalculationPage.catalogHint', 'Arizalarni ko‘rish va qayta ishlash uchun tegishli qatorni tanlang')}
        </Typography>
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 700 }} size="small">
          <TableHead sx={{ backgroundColor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, py: 1, fontSize: '0.82rem' }}>
                {t('tableHeaders.documentType', 'Hujjat turi')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, py: 1, fontSize: '0.82rem' }}>
                {t('tableHeaders.totalCount', 'Jami arizalar')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, py: 1, fontSize: '0.82rem' }}>
                {t('tableHeaders.pending', 'Kutilmoqda (Yangi)')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, py: 1, fontSize: '0.82rem' }}>
                {t('tableHeaders.actEntered', 'Akt kiritilgan')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, py: 1, fontSize: '0.82rem' }}>
                {t('tableHeaders.confirmedCanceled', 'Tasdiqlangan / Bekor')}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 1, fontSize: '0.82rem' }}>
                {t('tableHeaders.totalSum', 'Jami hisoblangan summa')}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, py: 1, width: 120, fontSize: '0.82rem' }}>
                {t('tableHeaders.actions', 'Amal')}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton variant="text" width="70%" height={24} />
                    <Skeleton variant="text" width="40%" height={16} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="text" width={40} height={24} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="text" width={40} height={24} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="text" width={40} height={24} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="text" width={60} height={24} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={80} height={24} sx={{ ml: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="rectangular" width={80} height={32} sx={{ mx: 'auto', borderRadius: 1 }} />
                  </TableCell>
                </TableRow>
              ))
            ) : catalogRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {t('recalculationPage.noCatalogs', 'Ushbu davrda arizalar mavjud emas')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              catalogRows.map((row) => (
                <TableRow
                  key={row.documentType}
                  hover
                  onClick={() => onSelectCategory(row.documentType)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  {/* Hujjat turi */}
                  <TableCell sx={{ py: 0.8 }}>
                    <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          p: 0.6,
                          borderRadius: 1.5,
                          backgroundColor: 'grey.100',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {row.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem' }}>
                          {row.title}
                        </Typography>
                        {row.description && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.72rem' }}>
                            {row.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Jami arizalar */}
                  <TableCell align="center">
                    <Chip
                      label={row.totalCount}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: 'grey.200',
                        color: 'text.primary',
                        minWidth: 36
                      }}
                    />
                  </TableCell>

                  {/* Kutilmoqda */}
                  <TableCell align="center">
                    <Chip
                      label={row.pendingCount}
                      size="small"
                      color={row.pendingCount > 0 ? 'warning' : 'default'}
                      variant={row.pendingCount > 0 ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600, minWidth: 36 }}
                    />
                  </TableCell>

                  {/* Akt kiritilgan */}
                  <TableCell align="center">
                    <Chip
                      label={row.aktKiritilganCount}
                      size="small"
                      color={row.aktKiritilganCount > 0 ? 'info' : 'default'}
                      variant={row.aktKiritilganCount > 0 ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600, minWidth: 36 }}
                    />
                  </TableCell>

                  {/* Tasdiqlangan / Bekor qilingan */}
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                      <Tooltip title="Tasdiqlangan">
                        <Chip
                          label={row.confirmedCount}
                          size="small"
                          color="success"
                          variant="filled"
                          sx={{ fontWeight: 600, minWidth: 30 }}
                        />
                      </Tooltip>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        /
                      </Typography>
                      <Tooltip title="Bekor qilingan">
                        <Chip
                          label={row.canceledCount}
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ fontWeight: 600, minWidth: 30 }}
                        />
                      </Tooltip>
                    </Stack>
                  </TableCell>

                  {/* Jami hisoblangan summa */}
                  <TableCell align="right">
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {formatCurrency(row.totalSumma)}
                    </Typography>
                  </TableCell>

                  {/* Amal */}
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                      onClick={() => onSelectCategory(row.documentType)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 1.5,
                        px: 1.5
                      }}
                    >
                      {t('buttons.open', 'Ochish')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

          {/* Table Summary Footer */}
          {!isLoading && catalogRows.length > 0 && (
            <TableHead sx={{ backgroundColor: 'grey.100', borderTop: '2px solid', borderColor: 'divider' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, py: 1.5 }}>
                  {t('tableHeaders.total', 'Jami davr bo‘yicha')}
                </TableCell>
                <TableCell align="center">
                  <Chip label={totalAllCount} size="small" color="primary" sx={{ fontWeight: 800 }} />
                </TableCell>
                <TableCell align="center">
                  <Chip label={totalPending} size="small" color="warning" sx={{ fontWeight: 800 }} />
                </TableCell>
                <TableCell align="center">
                  <Chip label={totalAkt} size="small" color="info" sx={{ fontWeight: 800 }} />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Chip label={totalConfirmed} size="small" color="success" sx={{ fontWeight: 800 }} />
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      /
                    </Typography>
                    <Chip label={totalCanceled} size="small" color="error" variant="outlined" sx={{ fontWeight: 800 }} />
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {formatCurrency(totalSum)}
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
          )}
        </Table>
      </TableContainer>
    </Card>
  );
};

export default CatalogListView;
