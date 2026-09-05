import React from 'react';
import {
  Box,
  Card,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  PlaylistAddCheck,
  DeleteOutlineOutlined,
  CalendarToday,
  ReceiptLongOutlined
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useStore } from './useStore';
import { colors } from 'store/constant';

export default function RecalculationPeriodsList() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { recalculationPeriods, setRecalculationPeriods, aktSumma } = useStore();

  const deleteItem = (index: number) => {
    setRecalculationPeriods(recalculationPeriods.filter((_, i) => i !== index));
  };

  const totalSum = aktSumma.total;
  const isPositive = totalSum >= 0;

  return (
    <Card
      id="tour-recalc-list"
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        p: 2,
        bgcolor: 'background.paper'
      }}
    >
      {/* Sarlavha */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <PlaylistAddCheck color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('Qo‘shilgan davrlar')}
          </Typography>
        </Stack>
        <Chip
          label={recalculationPeriods.length}
          size="small"
          color="primary"
          sx={{ fontWeight: 700, height: 22 }}
        />
      </Box>

      {/* Jami summa bloki */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: totalSum !== 0 ? (isPositive ? 'success.light' : 'error.light') : 'divider',
          bgcolor:
            totalSum !== 0
              ? theme.palette.mode === 'dark'
                ? 'background.default'
                : isPositive
                  ? 'success.50'
                  : 'error.50'
              : 'action.hover'
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '10px' }}>
          {t('Jami hisoblangan summa')}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: totalSum !== 0 ? (isPositive ? 'success.main' : 'error.main') : 'text.primary',
            mt: 0.2
          }}
        >
          {totalSum.toLocaleString()} so'm
        </Typography>
      </Paper>

      <Divider sx={{ mb: 1.5 }} />

      {/* Davrlar ro'yxati */}
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
        {recalculationPeriods.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '70%',
              textAlign: 'center',
              color: 'text.disabled',
              p: 2,
              gap: 1
            }}
          >
            <ReceiptLongOutlined sx={{ fontSize: 44, color: 'text.disabled' }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {t('Hozircha davrlar qo‘shilmagan')}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {t('Sanalarni tanlab, Debitor yoki Kreditor tugmasini bosing')}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.2}>
            {recalculationPeriods.map((period, idx) => {
              const startFormatted = dayjs()
                .set('year', period.startDate?.year())
                .set('month', period.startDate?.date() > 20 ? period.startDate?.month() + 1 : period.startDate?.month())
                .format('MM.YYYY');
              const endFormatted = dayjs()
                .set('year', period.endDate?.year())
                .set('month', period.endDate?.date() > 15 ? period.endDate?.month() : period.endDate?.month() - 1)
                .format('MM.YYYY');

              const isItemPositive = period.total >= 0;

              return (
                <Paper
                  key={idx}
                  elevation={0}
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[2],
                      borderColor: 'primary.light'
                    }
                  }}
                >
                  <Stack spacing={0.8}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: '#' + (colors[idx] || '2196f3')
                          }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          #{idx + 1}
                        </Typography>
                      </Stack>

                      <Tooltip title={t("buttons.clear")}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteItem(idx)}
                          sx={{ p: 0.3, '&:hover': { bgcolor: 'error.50' } }}
                        >
                          <DeleteOutlineOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 13, color: 'text.disabled' }} />
                      <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 600 }}>
                        {startFormatted} — {endFormatted}
                      </Typography>
                    </Stack>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Summa:
                      </Typography>
                      <Chip
                        label={`${isItemPositive ? '+' : ''}${period.total.toLocaleString()} so'm`}
                        size="small"
                        color={isItemPositive ? 'success' : 'error'}
                        variant="outlined"
                        sx={{
                          fontWeight: 700,
                          fontSize: '11px',
                          height: 22,
                          bgcolor: isItemPositive ? 'success.lighter' : 'error.lighter'
                        }}
                      />
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Card>
  );
}
