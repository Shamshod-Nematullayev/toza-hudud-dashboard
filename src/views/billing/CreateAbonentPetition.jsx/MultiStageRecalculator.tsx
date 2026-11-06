import { useEffect, useMemo } from 'react';
import { Alert, Box, Button, IconButton, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { AddCircleOutlined, DeleteOutlineOutlined } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { colors } from 'store/constant';
import {
  calcStagePeriod,
  emptyStage,
  getDhjFirstMonth,
  getLastClosedMonth,
  IRecalculationPeriod,
  isCurrentStage,
  IStageInput,
  stageCount,
  useStore,
  validateStages
} from './useStore';

/** Bosqich rangi: DHJ jadvalidagi belgi va o'ng tomondagi ro'yxat bilan bir xil */
export const stageColor = (index: number) => colors[index % colors.length];

/**
 * Odam soni arizasi: "shu davrda N kishi, keyingi davrda M kishi, ..." ko'rinishidagi ko'p bosqichli qayta hisob.
 * Summa avtomatik hisoblanadi; joriy oygacha boradigan bosqich soni — formadagi yangi yashovchi soni.
 */
export default function MultiStageRecalculator() {
  const { stages, setStages, yashovchiSoniInput, setYashovchiSoniInput, rowsDhjTable, hisoblandiJadval, setRecalculationPeriods, setAktSumma } =
    useStore();

  const dhjFirstMonth = useMemo(() => getDhjFirstMonth(rowsDhjTable), [rowsDhjTable]);
  const minMonth = dhjFirstMonth ?? dayjs('2019-01-01');
  const currentMonth = dayjs().startOf('month');
  const lastClosedMonth = getLastClosedMonth();
  const errors = validateStages(stages, yashovchiSoniInput, dhjFirstMonth);

  // Har bosqich uchun qayta hisob davri (faqat yopilgan oylar; joriy oy yangi son bilan o'zi hisoblanadi)
  const periods = useMemo(
    () =>
      stages.map((stage, i): IRecalculationPeriod | null => {
        if (errors[i] || !stage.from || !stage.to || stage.from.isAfter(lastClosedMonth, 'month')) return null;
        const to = stage.to.isAfter(lastClosedMonth, 'month') ? lastClosedMonth : stage.to;
        const period = calcStagePeriod(rowsDhjTable, hisoblandiJadval, stage.from, to, Number(stageCount(stage, yashovchiSoniInput)));
        return period && { ...period, color: stageColor(i) };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stages, yashovchiSoniInput, rowsDhjTable, hisoblandiJadval, errors.join('|')]
  );

  useEffect(() => {
    // Biror bosqichda xato bo'lsa (masalan davrlar kesishsa) summa yozilmaydi
    const valid = errors.some(Boolean) ? [] : (periods.filter(Boolean) as IRecalculationPeriod[]);
    setRecalculationPeriods(valid);
    setAktSumma({
      total: valid.reduce((a, p) => a + p.total, 0),
      totalWithQQS: valid.reduce((a, p) => a + p.withQQSTotal, 0),
      withoutQQSTotal: valid.reduce((a, p) => a + p.withoutQQSTotal, 0)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periods]);

  const updateStage = (index: number, patch: Partial<IStageInput>) => setStages(stages.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const addStage = () => {
    // Yangi bosqich oxirgi bosqichdan keyingi oydan hozirgacha taklif qilinadi
    const lastTo = stages.reduce<dayjs.Dayjs | null>((max, s) => (s.to?.isValid() && (!max || s.to.isAfter(max)) ? s.to : max), null);
    const from = lastTo ? lastTo.add(1, 'month').startOf('month') : null;
    setStages([...stages, { ...emptyStage(), from: from && !from.isAfter(currentMonth) ? from : null, to: currentMonth }]);
  };

  const noClosedMonths = dhjFirstMonth ? dhjFirstMonth.isAfter(lastClosedMonth, 'month') : false;

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1 }}>
      <Stack spacing={0.75} sx={{ maxHeight: 230, overflowY: 'auto', pt: 0.75, pr: 0.5 }}>
        {stages.map((stage, i) => {
          const isCurrent = isCurrentStage(stage);
          const period = periods[i];
          const hasError = !!errors[i];
          // Davr xatosi (kesishish, tartib) sana maydonlarini qizil qiladi; undefined — MUI ning min/max tekshiruvi ishlayveradi
          const dateError = hasError && !errors[i]!.includes('yashovchi') ? true : undefined;
          return (
            <Box key={i}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Tooltip title={`${i + 1}-bosqich`} arrow>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      flexShrink: 0,
                      borderRadius: '50%',
                      bgcolor: '#' + stageColor(i),
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textShadow: '0 0 2px rgba(0,0,0,.6)'
                    }}
                  >
                    {i + 1}
                  </Box>
                </Tooltip>
                <DatePicker
                  views={['year', 'month']}
                  format="MM.YYYY"
                  label="Dan (oy)"
                  minDate={minMonth}
                  maxDate={currentMonth}
                  value={stage.from}
                  onChange={(v) => updateStage(i, { from: v })}
                  slotProps={{ textField: { size: 'small', fullWidth: true, error: dateError } }}
                />
                <DatePicker
                  views={['year', 'month']}
                  format="MM.YYYY"
                  label={isCurrent ? 'Gacha (hozirgacha)' : 'Gacha (oy)'}
                  minDate={stage.from?.isValid() && stage.from.isAfter(minMonth) ? stage.from : minMonth}
                  maxDate={currentMonth}
                  value={stage.to}
                  onChange={(v) => updateStage(i, { to: v })}
                  slotProps={{ textField: { size: 'small', fullWidth: true, error: dateError } }}
                />
                <TextField
                  size="small"
                  type="number"
                  label={isCurrent ? 'Kishi (yangi)' : 'Kishi soni'}
                  value={stageCount(stage, yashovchiSoniInput)}
                  onChange={(e) => (isCurrent ? setYashovchiSoniInput(e.target.value) : updateStage(i, { count: e.target.value }))}
                  slotProps={{ htmlInput: { min: 0 } }}
                  sx={{ width: 110, flexShrink: 0 }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    width: 96,
                    flexShrink: 0,
                    textAlign: 'right',
                    fontWeight: 700,
                    color: !period ? 'text.disabled' : period.total >= 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {period ? `${period.total > 0 ? '+' : ''}${period.total.toLocaleString()}` : '—'}
                </Typography>
                <IconButton size="small" color="error" disabled={stages.length === 1} onClick={() => setStages(stages.filter((_, j) => j !== i))}>
                  <DeleteOutlineOutlined fontSize="small" />
                </IconButton>
              </Stack>
              {hasError && (
                <Typography variant="caption" color="error.main" sx={{ display: 'block', pl: 4.5, fontWeight: 600 }}>
                  {errors[i]}
                </Typography>
              )}
            </Box>
          );
        })}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.75 }}>
        <Button size="small" startIcon={<AddCircleOutlined />} onClick={addStage} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Bosqich qo'shish
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          Kam kishi yashagan davr — qarz kamayadi (+), ko'p kishi yashagan davr — qarz qo'shiladi (−). Joriy oy qayta hisoblanmaydi, u yangi
          son bilan hisoblanadi.
        </Typography>
      </Stack>

      {noClosedMonths && (
        <Alert severity="info" sx={{ py: 0, mt: 0.5 }}>
          Abonent {dhjFirstMonth?.format('MM.YYYY')} da ochilgan: qayta hisoblanadigan o'tgan oy yo'q.
        </Alert>
      )}
    </Paper>
  );
}
