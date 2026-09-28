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
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import {
  ArrowForward,
  PeopleAltOutlined,
  SentimentVeryDissatisfiedOutlined,
  FlightTakeoffOutlined,
  ContentCopyOutlined,
  LocationOffOutlined,
  CurrencyExchangeOutlined,
  DoNotDisturbOnOutlined,
  FolderOpenOutlined,
  CheckCircleOutlineOutlined,
  ErrorOutlineOutlined,
  HourglassEmptyOutlined
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PendingActByDocumentType } from '../useStore';

interface CatalogListViewProps {
  byDocumentType: PendingActByDocumentType[];
  onSelectCategory: (categoryKey: string) => void;
  isLoading?: boolean;
}

const DOCUMENT_TYPE_METADATA: Record<string, { title: string; desc: string; icon: React.ReactNode }> = {
  odam_soni: {
    title: "Yashovchi soni o'zgartirish",
    desc: 'Oila a‘zolari sonini oshirish yoki kamaytirish aktlari',
    icon: <PeopleAltOutlined sx={{ color: 'primary.main' }} />
  },
  pul_kuchirish: {
    title: 'Pul ko‘chirish',
    desc: 'Ortiqcha yoki yanglish to‘lovlarni abonentlar aro ko‘chirish',
    icon: <CurrencyExchangeOutlined sx={{ color: 'success.main' }} />
  },
  dvaynik: {
    title: 'Ikkilamchi kod',
    desc: 'Bir xil manzil yoki takroriy abonent hisob raqamlarini yopish',
    icon: <ContentCopyOutlined sx={{ color: 'warning.main' }} />
  },
  cancelContract: {
    title: 'Kontraktni bekor qilish',
    desc: 'Abonent shartnomasini bekor qilish va qoldiqni 0 ga tushirish',
    icon: <DoNotDisturbOnOutlined sx={{ color: 'secondary.main' }} />
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
  gps: {
    title: "Texnika xizmat ko'rsatmagan",
    desc: 'Chiqindi tashish xizmati bajarilmagan davrlar dalolatnomasi',
    icon: <LocationOffOutlined sx={{ color: 'secondary.main' }} />
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
  const theme = useTheme();

  const knownKeys = Object.keys(DOCUMENT_TYPE_METADATA);
  const responseKeys = (byDocumentType || []).map((item) => item._id).filter(Boolean);
  const allKeys = Array.from(new Set([...knownKeys, ...responseKeys]));

  const catalogRows = allKeys.map((key) => {
    const statItem = byDocumentType.find((item) => item._id === key);
    const meta = DOCUMENT_TYPE_METADATA[key] || {
      title: t(`documentTypes.${key}`, key),
      desc: 'Avtomatik kiritiladigan aktlar',
      icon: <FolderOpenOutlined sx={{ color: 'primary.main' }} />
    };

    return {
      documentType: key,
      title: meta.title,
      description: meta.desc,
      icon: meta.icon,
      totalCount: statItem?.count || 0,
      totalAmount: statItem?.totalAmount || 0,
      pendingCount: statItem?.pendingCount || 0,
      processingCount: statItem?.processingCount || 0,
      completedCount: statItem?.completedCount || 0,
      failedCount: statItem?.failedCount || 0
    };
  });

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
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderBottom: '1px solid',
          borderColor: theme.palette.divider,
          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.02)
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Aktlar katalogi bo‘yicha taqsimot
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Kataloglar bo‘yicha kutilayotgan, bajarilgan va xatolik yuz bergan aktlar statistikasi
            </Typography>
          </Box>
        </Stack>
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 750 }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: alpha(theme.palette.action.hover, theme.palette.mode === 'dark' ? 0.1 : 0.4),
                '& th': {
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: theme.palette.text.secondary,
                  py: 1.5
                }
              }}
            >
              <TableCell sx={{ pl: 2.5 }}>Katalog (Akt turi)</TableCell>
              <TableCell align="center">Kutilmoqda</TableCell>
              <TableCell align="center">Kiritilgan</TableCell>
              <TableCell align="center">Xatolik</TableCell>
              <TableCell align="right">Jami soni</TableCell>
              <TableCell align="right">Jami summa</TableCell>
              <TableCell align="center" sx={{ pr: 2.5 }}>
                Amal
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ pl: 2.5 }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Skeleton variant="circular" width={36} height={36} />
                      <Box sx={{ width: '60%' }}>
                        <Skeleton variant="text" width="80%" height={20} />
                        <Skeleton variant="text" width="50%" height={14} />
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="rounded" width={50} height={24} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="rounded" width={50} height={24} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="rounded" width={50} height={24} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={40} height={20} sx={{ ml: 'auto' }} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={70} height={20} sx={{ ml: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              catalogRows.map((cat) => {
                const hasItems = cat.totalCount > 0;

                return (
                  <TableRow
                    key={cat.documentType}
                    hover
                    onClick={() => onSelectCategory(cat.documentType)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.03)
                      },
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    {/* 1. Katalog nomi va tavsifi */}
                    <TableCell sx={{ pl: 2.5 }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 38,
                            height: 38,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                            flexShrink: 0
                          }}
                        >
                          {cat.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                            {cat.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {cat.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* 2. Kutilmoqda */}
                    <TableCell align="center">
                      <Chip
                        icon={<HourglassEmptyOutlined sx={{ fontSize: 14 }} />}
                        label={cat.pendingCount}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                          color: theme.palette.warning.main,
                          opacity: cat.pendingCount > 0 ? 1 : 0.4
                        }}
                      />
                    </TableCell>

                    {/* 3. Kiritilgan */}
                    <TableCell align="center">
                      <Chip
                        icon={<CheckCircleOutlineOutlined sx={{ fontSize: 14 }} />}
                        label={cat.completedCount}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                          color: theme.palette.success.main,
                          opacity: cat.completedCount > 0 ? 1 : 0.4
                        }}
                      />
                    </TableCell>

                    {/* 4. Xatolik */}
                    <TableCell align="center">
                      <Chip
                        icon={<ErrorOutlineOutlined sx={{ fontSize: 14 }} />}
                        label={cat.failedCount}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                          color: theme.palette.error.main,
                          opacity: cat.failedCount > 0 ? 1 : 0.4
                        }}
                      />
                    </TableCell>

                    {/* 5. Jami soni */}
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {cat.totalCount.toLocaleString('uz-UZ')}
                      </Typography>
                    </TableCell>

                    {/* 6. Jami summa */}
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: hasItems ? theme.palette.text.primary : theme.palette.text.secondary
                        }}
                      >
                        {formatCurrency(cat.totalAmount)}
                      </Typography>
                    </TableCell>

                    {/* 7. Kirish tugmasi */}
                    <TableCell align="center" sx={{ pr: 2.5 }}>
                      <Tooltip title="Katalogni ochish">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCategory(cat.documentType);
                          }}
                        >
                          <ArrowForward fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default CatalogListView;
