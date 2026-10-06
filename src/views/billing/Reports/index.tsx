import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Material-UI
import {
  Box,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  ButtonBase,
  Paper,
  Button,
  useTheme,
  alpha
} from '@mui/material';

// Icons
import {
  SearchOutlined,
  ClearOutlined,
  StarRounded,
  StarBorderRounded,
  TocRounded,
  BarChartRounded,
  GridViewRounded,
  ShowChartRounded,
  ScheduleOutlined,
  ArrowForwardRounded
} from '@mui/icons-material';

// Project imports
import useCustomizationStore from 'store/customizationStore';

export interface IReportItem {
  id: string;
  name: string;
  description: string;
  category: 'nazoratchilar' | 'mahallalar' | 'arizalar';
  categoryLabel: string;
  path: string;
  iconType: 'list' | 'barchart' | 'matrix' | 'trend';
}

const reportItems: IReportItem[] = [
  {
    id: '1',
    name: "Abonent ma'lumotlari",
    description: "Biriktirilgan abonentlar ro'yxati va holati",
    category: 'nazoratchilar',
    categoryLabel: 'Nazoratchilar',
    path: 'xatlov-inspectors',
    iconType: 'list'
  },
  {
    id: '2',
    name: 'Maxsus topshiriqlar',
    description: 'Berilgan topshiriqlar va bajarilishi',
    category: 'nazoratchilar',
    categoryLabel: 'Nazoratchilar',
    path: 'report-special-tasks',
    iconType: 'barchart'
  },
  {
    id: '3',
    name: 'Kunlik reja matritsasi',
    description: 'Har bir nazoratchining kunlik rejasi va natijasi',
    category: 'nazoratchilar',
    categoryLabel: 'Nazoratchilar',
    path: 'report-inspector-plan-matrix',
    iconType: 'matrix'
  },
  {
    id: '4',
    name: 'Mahalla tushumlari',
    description: "Tushumlar nazoratchi va mahalla bo'yicha",
    category: 'nazoratchilar',
    categoryLabel: 'Nazoratchilar',
    path: 'report-mahalla-tushumlar',
    iconType: 'barchart'
  },
  {
    id: '5',
    name: 'Identifikatsiya',
    description: "Mahallalar bo'yicha identifikatsiya qilingan abonentlar",
    category: 'mahallalar',
    categoryLabel: 'Mahallalar',
    path: 'report-identifikatsiya',
    iconType: 'barchart'
  },
  {
    id: '6',
    name: 'Tushumlar tahlili (MFY)',
    description: "Reja va tushumni mahalla hamda to'lov kanallari bo'yicha tahlil qilish",
    category: 'mahallalar',
    categoryLabel: 'Mahallalar',
    path: 'report-mfy-income',
    iconType: 'trend'
  },
  {
    id: '7',
    name: 'Yashovchilar soni',
    description: "Mahalla bo'yicha yashovchilar soni",
    category: 'mahallalar',
    categoryLabel: 'Mahallalar',
    path: 'report-xatlov-odam-soni',
    iconType: 'barchart'
  },
  {
    id: '8',
    name: 'Arizalar hisoboti',
    description: "Kelib tushgan arizalar va ko'rib chiqish holati",
    category: 'arizalar',
    categoryLabel: 'Arizalar',
    path: 'report-petitions',
    iconType: 'list'
  }
];

type CategoryFilter = 'all' | 'favorites' | 'nazoratchilar' | 'mahallalar' | 'arizalar';

const Reports: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { favoriteReports = [], toggleFavoriteReport } = useCustomizationStore();

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string>('1');

  // Counts calculation
  const counts = useMemo(() => {
    return {
      all: reportItems.length,
      favorites: reportItems.filter((item) => favoriteReports.includes(item.id)).length,
      nazoratchilar: reportItems.filter((item) => item.category === 'nazoratchilar').length,
      mahallalar: reportItems.filter((item) => item.category === 'mahallalar').length,
      arizalar: reportItems.filter((item) => item.category === 'arizalar').length
    };
  }, [favoriteReports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reportItems.filter((item) => {
      // Category filter
      if (selectedCategory === 'favorites') {
        if (!favoriteReports.includes(item.id)) return false;
      } else if (selectedCategory !== 'all') {
        if (item.category !== selectedCategory) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.categoryLabel.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [selectedCategory, searchQuery, favoriteReports]);

  // Group reports by category
  const groupedReports = useMemo(() => {
    const groups: { [key: string]: { label: string; items: IReportItem[] } } = {
      nazoratchilar: { label: 'Nazoratchilar', items: [] },
      mahallalar: { label: 'Mahallalar', items: [] },
      arizalar: { label: 'Arizalar', items: [] }
    };

    filteredReports.forEach((item) => {
      if (groups[item.category]) {
        groups[item.category].items.push(item);
      }
    });

    return groups;
  }, [filteredReports]);

  const handleCardClick = (report: IReportItem) => {
    setSelectedReportId(report.id);
  };

  const handleCardDoubleClick = (report: IReportItem) => {
    navigate(`/billing/${report.path}`);
  };

  const renderIcon = (type: IReportItem['iconType']) => {
    const iconColor = theme.palette.primary.main;
    switch (type) {
      case 'list':
        return <TocRounded sx={{ fontSize: 30, color: iconColor }} />;
      case 'barchart':
        return <BarChartRounded sx={{ fontSize: 30, color: iconColor }} />;
      case 'matrix':
        return <GridViewRounded sx={{ fontSize: 30, color: iconColor }} />;
      case 'trend':
        return <ShowChartRounded sx={{ fontSize: 30, color: iconColor }} />;
      default:
        return <BarChartRounded sx={{ fontSize: 30, color: iconColor }} />;
    }
  };

  const navCategories = [
    { key: 'all' as CategoryFilter, label: 'Barchasi', count: counts.all },
    ...(counts.favorites > 0 || selectedCategory === 'favorites'
      ? [{ key: 'favorites' as CategoryFilter, label: 'Sevimlilar', count: counts.favorites, isFavorite: true }]
      : []),
    { key: 'nazoratchilar' as CategoryFilter, label: 'Nazoratchilar', count: counts.nazoratchilar },
    { key: 'mahallalar' as CategoryFilter, label: 'Mahallalar', count: counts.mahallalar },
    { key: 'arizalar' as CategoryFilter, label: 'Arizalar', count: counts.arizalar }
  ];

  return (
    <Box sx={{ width: '100%', py: 1 }}>
      {/* Asosiy 2 ustunli tuzilma */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={4}
        sx={{ alignItems: 'flex-start', width: '100%' }}
      >
        {/* Chap ustun: Toifalar navigatsiyasi */}
        <Box
          sx={{
            width: { xs: '100%', md: 240 },
            flexShrink: 0
          }}
        >
          <Stack spacing={0.8} sx={{ width: '100%' }}>
            {navCategories.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <ButtonBase
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.25,
                    borderRadius: 2,
                    textAlign: 'left',
                    transition: 'all 0.15s ease-in-out',
                    bgcolor: isSelected
                      ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12)
                      : 'transparent',
                    color: isSelected
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                    '&:hover': {
                      bgcolor: isSelected
                        ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.28 : 0.18)
                        : alpha(theme.palette.action.hover, 0.06)
                    }
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    {cat.isFavorite && (
                      <StarRounded sx={{ fontSize: 18, color: '#f59e0b' }} />
                    )}
                    <Typography
                      sx={{
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.95rem',
                        color: 'inherit'
                      }}
                    >
                      {cat.label}
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.875rem',
                      color: isSelected
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary
                    }}
                  >
                    {cat.count}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Stack>
        </Box>

        {/* O'ng ustun: Sarlavha, Qidiruv va Hisobotlar ro'yxati */}
        <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
          {/* Sarlavha va Subtitr */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.2rem' },
                fontWeight: 800,
                color: theme.palette.text.primary,
                letterSpacing: '-0.02em',
                mb: 1
              }}
            >
              Hisobotlar
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.95rem'
              }}
            >
              Hisobotni tanlang, o&apos;ng tomonda uning tarkibi chiqadi. Ochish uchun ikki marta bosing.
            </Typography>
          </Box>

          {/* Qidiruv maydoni */}
          <Box sx={{ mb: 3.5, maxWidth: { xs: '100%', sm: 460 } }}>
            <TextField
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hisobot nomi bo'yicha qidirish"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')} edge="end">
                        <ClearOutlined sx={{ fontSize: 18 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  transition: 'all 0.2s',
                  '& fieldset': {
                    borderColor: theme.palette.divider
                  },
                  '&:hover fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.5)
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                }
              }}
            />
          </Box>

          {/* Hisobotlar kartalari */}
          {filteredReports.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: theme.palette.divider,
                bgcolor: alpha(theme.palette.background.paper, 0.5)
              }}
            >
              <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 1 }}>
                Hech qanday hisobot topilmadi
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Qidiruv so&apos;rovini yoki tanlangan toifani o&apos;zgartirib ko&apos;ring
              </Typography>
            </Paper>
          ) : (
            <Box>
              {(['nazoratchilar', 'mahallalar', 'arizalar'] as const).map((catKey) => {
                const group = groupedReports[catKey];
                if (!group || group.items.length === 0) return null;

                return (
                  <Box key={catKey} sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        fontSize: '0.875rem',
                        mb: 1.5,
                        textTransform: 'capitalize'
                      }}
                    >
                      {group.label}
                    </Typography>

                    <Stack spacing={1.2}>
                      {group.items.map((report) => {
                        const isSelected = selectedReportId === report.id;
                        const isFav = favoriteReports.includes(report.id);

                        return (
                          <Paper
                            key={report.id}
                            elevation={0}
                            onClick={() => handleCardClick(report)}
                            onDoubleClick={() => handleCardDoubleClick(report)}
                            sx={{
                              p: 2,
                              px: 2.5,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: isSelected
                                ? alpha(theme.palette.primary.main, 0.6)
                                : theme.palette.divider,
                              borderLeft: isSelected
                                ? `4px solid ${theme.palette.primary.main}`
                                : '1px solid ' + theme.palette.divider,
                              bgcolor: isSelected
                                ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.03)
                                : theme.palette.background.paper,
                              boxShadow: isSelected
                                ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                                : 'none',
                              transition: 'all 0.15s ease-in-out',
                              '&:hover': {
                                borderColor: theme.palette.primary.main,
                                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.04),
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            {/* Chap tomon: Ikonka + Nomi va Tavsifi */}
                            <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 44,
                                  height: 44,
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
                                  flexShrink: 0
                                }}
                              >
                                {renderIcon(report.iconType)}
                              </Box>

                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.98rem',
                                    color: theme.palette.text.primary,
                                    lineHeight: 1.3
                                  }}
                                >
                                  {report.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.85rem',
                                    mt: 0.3,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {report.description}
                                </Typography>
                              </Box>
                            </Stack>

                            {/* O'ng tomon: Star tugmasi va Ochish tugmasi */}
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', ml: 2, flexShrink: 0 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavoriteReport(report.id);
                                }}
                                sx={{
                                  color: isFav ? '#f59e0b' : theme.palette.text.disabled,
                                  transition: 'transform 0.15s, color 0.15s',
                                  '&:hover': {
                                    transform: 'scale(1.15)',
                                    color: '#f59e0b'
                                  }
                                }}
                                title={isFav ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
                              >
                                {isFav ? (
                                  <StarRounded sx={{ fontSize: 24 }} />
                                ) : (
                                  <StarBorderRounded sx={{ fontSize: 24 }} />
                                )}
                              </IconButton>

                              <Button
                                size="small"
                                variant={isSelected ? 'contained' : 'outlined'}
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/billing/${report.path}`);
                                }}
                                sx={{
                                  display: { xs: 'none', sm: 'inline-flex' },
                                  textTransform: 'none',
                                  borderRadius: 1.5,
                                  fontWeight: 600,
                                  px: 1.8,
                                  py: 0.4,
                                  fontSize: '0.82rem'
                                }}
                              >
                                Ochish
                              </Button>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Avtomatik Telegram hisobotlar boshqaruvi banneri */}
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha(theme.palette.secondary.main, 0.3),
              background: theme.palette.mode === 'dark'
                ? alpha(theme.palette.secondary.dark, 0.25)
                : alpha(theme.palette.secondary.light, 0.35)
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between'
              }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.common.white,
                    display: 'flex',
                    boxShadow: 2
                  }}
                >
                  <ScheduleOutlined fontSize="medium" />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.95rem' }}>
                    Telegram Avtomatik Hisobotlar Boshqaruvi
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.85rem' }}>
                    Rejalashtirilgan yuborish vaqtlari va guruh sozlamalarini boshqaring.
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => navigate('/billing/scheduled-reports')}
                endIcon={<ArrowForwardRounded />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  py: 0.8,
                  borderRadius: 1.5,
                  whiteSpace: 'nowrap'
                }}
              >
                Jadvalni boshqarish
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default Reports;
