import React from 'react';
import { Box, Card, CardActionArea, Grid, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import {
  ListAltOutlined,
  HourglassEmptyOutlined,
  AssignmentTurnedInOutlined,
  CheckCircleOutlineOutlined,
  CancelOutlined
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export interface StatusCardData {
  id: string; // 'all' | 'pending' | 'akt_kiritilgan' | 'tasdiqlangan' | 'bekor qilindi'
  title: string;
  count: number;
  totalSumma: number;
  color: string;
  icon: React.ReactNode;
}

interface KanbanStatusCardsProps {
  summary: any;
  activeStatus: string | null;
  onStatusClick: (statusId: string) => void;
  isLoading?: boolean;
}

const formatCurrency = (val: number | undefined | null): string => {
  if (!val) return '0 so‘m';
  return `${Number(val).toLocaleString('uz-UZ')} so‘m`;
};

const KanbanStatusCards: React.FC<KanbanStatusCardsProps> = ({
  summary,
  activeStatus,
  onStatusClick,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const cards: StatusCardData[] = [
    {
      id: 'all',
      title: t('statusCards.all', 'Barchasi'),
      count: summary?.totalCount || 0,
      totalSumma: summary?.totalAktSummasi || 0,
      color: theme.palette.primary.main,
      icon: <ListAltOutlined sx={{ fontSize: 20 }} />
    },
    {
      id: 'pending',
      title: t('statusCards.pending', 'Kutilmoqda'),
      count: summary?.inProgressCount || 0,
      totalSumma: summary?.inProgressSumma || 0,
      color: theme.palette.warning.main,
      icon: <HourglassEmptyOutlined sx={{ fontSize: 20 }} />
    },
    {
      id: 'akt_kiritilgan',
      title: t('statusCards.actEntered', 'Akt kiritilgan'),
      count: summary?.aktKiritilganCount || 0,
      totalSumma: summary?.aktKiritilganSumma || 0,
      color: theme.palette.info.main,
      icon: <AssignmentTurnedInOutlined sx={{ fontSize: 20 }} />
    },
    {
      id: 'tasdiqlangan',
      title: t('statusCards.confirmed', 'Tasdiqlangan'),
      count: summary?.confirmedCount || 0,
      totalSumma: summary?.confirmedSumma || 0,
      color: theme.palette.success.main,
      icon: <CheckCircleOutlineOutlined sx={{ fontSize: 20 }} />
    },
    {
      id: 'bekor qilindi',
      title: t('statusCards.cancelled', 'Bekor qilingan'),
      count: summary?.canceledCount || 0,
      totalSumma: summary?.canceledSumma || 0,
      color: theme.palette.error.main,
      icon: <CancelOutlined sx={{ fontSize: 20 }} />
    }
  ];

  return (
    <Grid container spacing={1}>
      {cards.map((card) => {
        const isSelected = activeStatus === card.id || (!activeStatus && card.id === 'all');

        return (
          <Grid
            key={card.id}
            size={{
              xs: 6,
              sm: 4,
              md: 2.4
            }}
          >
            <Card
              sx={{
                border: '1.5px solid',
                borderColor: isSelected ? card.color : 'divider',
                borderRadius: 2,
                boxShadow: isSelected ? `0 2px 8px 0 ${card.color}25` : 'none',
                backgroundColor: isSelected ? `${card.color}08` : 'background.paper',
                transition: 'all 0.15s ease-in-out',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: card.color,
                  boxShadow: `0 3px 10px 0 ${card.color}20`
                }
              }}
            >
              {isSelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    backgroundColor: card.color
                  }}
                />
              )}

              <CardActionArea
                onClick={() => onStatusClick(card.id)}
                sx={{
                  px: 1.2,
                  py: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 58
                }}
              >
                <Stack direction="row" spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
                  {/* Status Icon */}
                  <Box
                    sx={{
                      p: 0.6,
                      borderRadius: 1.2,
                      backgroundColor: `${card.color}15`,
                      color: card.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {card.icon}
                  </Box>

                  {/* Text Details */}
                  {isLoading ? (
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="50%" height={16} />
                      <Skeleton variant="text" width="80%" height={14} />
                    </Box>
                  ) : (
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 0.5
                        }}
                      >
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{
                            fontWeight: 600,
                            color: isSelected ? card.color : 'text.secondary',
                            fontSize: '0.78rem'
                          }}
                        >
                          {card.title}
                        </Typography>

                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                            fontSize: '0.95rem',
                            lineHeight: 1
                          }}
                        >
                          {card.count.toLocaleString('uz-UZ')}
                        </Typography>
                      </Stack>

                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          fontWeight: 500,
                          color: isSelected ? card.color : 'text.secondary',
                          display: 'block',
                          fontSize: '0.72rem',
                          mt: 0.2
                        }}
                      >
                        {formatCurrency(card.totalSumma)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default KanbanStatusCards;
