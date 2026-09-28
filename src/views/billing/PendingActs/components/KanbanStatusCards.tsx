import React from 'react';
import { Box, Card, CardActionArea, Grid, Skeleton, Stack, Typography, useTheme, alpha } from '@mui/material';
import {
  ListAltOutlined,
  HourglassEmptyOutlined,
  SyncOutlined,
  CheckCircleOutlineOutlined,
  ErrorOutlineOutlined
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PendingActSummary } from '../useStore';

export interface StatusCardData {
  id: string; // 'all' | 'pending' | 'processing' | 'completed' | 'failed'
  title: string;
  count: number;
  totalSumma: number;
  color: string;
  icon: React.ReactNode;
}

interface KanbanStatusCardsProps {
  summary?: PendingActSummary | null;
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
      title: 'Barchasi',
      count: summary?.totalCount || 0,
      totalSumma: summary?.totalAmount || 0,
      color: theme.palette.primary.main,
      icon: <ListAltOutlined sx={{ fontSize: 20 }} />
    },
    {
      id: 'pending',
      title: 'Kutilmoqda',
      count: summary?.pendingCount || 0,
      totalSumma: summary?.pendingAmount || 0,
      color: theme.palette.warning.main,
      icon: <HourglassEmptyOutlined sx={{ fontSize: 20 }} />
    },
    {
      id: 'processing',
      title: 'Jarayonda',
      count: summary?.processingCount || 0,
      totalSumma: summary?.processingAmount || 0,
      color: theme.palette.info.main,
      icon: <SyncOutlined sx={{ fontSize: 20 }} />
    },
    {
      id: 'completed',
      title: 'Kiritilgan',
      count: summary?.completedCount || 0,
      totalSumma: summary?.completedAmount || 0,
      color: theme.palette.success.main,
      icon: <CheckCircleOutlineOutlined sx={{ fontSize: 20 }} />
    },
    {
      id: 'failed',
      title: 'Xatolik',
      count: summary?.failedCount || 0,
      totalSumma: summary?.failedAmount || 0,
      color: theme.palette.error.main,
      icon: <ErrorOutlineOutlined sx={{ fontSize: 20 }} />
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
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1.5px solid',
                borderColor: isSelected ? card.color : theme.palette.divider,
                bgcolor: isSelected
                  ? alpha(card.color, theme.palette.mode === 'dark' ? 0.15 : 0.05)
                  : theme.palette.background.paper,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: card.color,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(card.color, 0.15)}`
                }
              }}
            >
              <CardActionArea
                onClick={() => onStatusClick(card.id)}
                sx={{
                  p: { xs: 1.25, sm: 1.5 },
                  height: '100%'
                }}
              >
                <Stack spacing={0.75}>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: isSelected ? card.color : theme.palette.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: 1.5,
                        bgcolor: alpha(card.color, theme.palette.mode === 'dark' ? 0.25 : 0.1),
                        color: card.color
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Stack>

                  {isLoading ? (
                    <>
                      <Skeleton variant="text" width="60%" height={32} />
                      <Skeleton variant="text" width="80%" height={16} />
                    </>
                  ) : (
                    <>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          color: isSelected ? card.color : theme.palette.text.primary,
                          lineHeight: 1.1
                        }}
                      >
                        {card.count.toLocaleString('uz-UZ')}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {formatCurrency(card.totalSumma)}
                      </Typography>
                    </>
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
