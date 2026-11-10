import { useState, useEffect, useRef } from 'react';
import { Box, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { parseAktSumExpression } from '../../hooks/useFindedTableLogic';
import useLoaderStore from 'store/loaderStore';

interface AdjustmentAlertProps {
  adjustmentData: any;
  aktSumm: string;
  onApplyRecommendedSum: (sum: string) => void;
}

export function AdjustmentAlert({ adjustmentData, aktSumm, onApplyRecommendedSum }: AdjustmentAlertProps) {
  const { isLoading } = useLoaderStore();
  const [baseSum, setBaseSum] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState<boolean>(true);
  const autoAppliedRef = useRef<string>('');

  const residentId = adjustmentData?.residentId;
  const arizaId = adjustmentData?.arizaId;
  const autoAppliedKey = `${residentId}_${arizaId}_${adjustmentData?.recommendedSum}_${adjustmentData?.adjustment}`;

  // Default holatda tavsiya etilgan summani avtomatik qo'llash (insoniy omil xatolarini oldini olish uchun)
  useEffect(() => {
    if (!adjustmentData || adjustmentData.adjustment === 0) {
      autoAppliedRef.current = '';
      setIsApplied(false);
      setBaseSum(null);
      return;
    }

    if (autoAppliedRef.current !== autoAppliedKey) {
      autoAppliedRef.current = autoAppliedKey;
      const original =
        adjustmentData.baseAmount !== undefined ? String(adjustmentData.baseAmount) : aktSumm;
      setBaseSum(original);
      setIsApplied(true);
      onApplyRecommendedSum(String(adjustmentData.recommendedSum));
    }
  }, [autoAppliedKey, adjustmentData, onApplyRecommendedSum]);

  if (!adjustmentData || adjustmentData.adjustment === 0) return null;

  const recommendedSum = Number(adjustmentData.recommendedSum);
  const originalAmount =
    adjustmentData.baseAmount !== undefined
      ? Number(adjustmentData.baseAmount)
      : baseSum !== null
        ? parseAktSumExpression(baseSum)
        : parseAktSumExpression(aktSumm);
  const currentAktSumNum = parseAktSumExpression(aktSumm);
  const isCurrentlyApplied = isApplied || currentAktSumNum === recommendedSum;

  const handleToggle = () => {
    if (isCurrentlyApplied) {
      // Dastlabki summaga qaytarish
      const restore = baseSum !== null ? baseSum : String(originalAmount);
      setIsApplied(false);
      onApplyRecommendedSum(restore);
    } else {
      // Tavsiya etilgan summani qayta qo'llash
      setIsApplied(true);
      onApplyRecommendedSum(String(recommendedSum));
    }
  };

  const hasInhabitantChange =
    adjustmentData.nextInhabitantCount !== undefined &&
    adjustmentData.nextInhabitantCount !== null &&
    Number(adjustmentData.nextInhabitantCount) !== Number(adjustmentData.currentInhabitantCount);

  const details: { label: string; value: string; color?: string }[] = [
    { label: 'Asl akt summasi', value: `${Math.abs(originalAmount).toLocaleString()} UZS` },
    { label: 'Akt oyi → kiritish', value: `${adjustmentData.actMonth} → ${adjustmentData.currentMonth}` },
    {
      label: 'Odam soni',
      value: hasInhabitantChange
        ? `${adjustmentData.currentInhabitantCount} → ${adjustmentData.nextInhabitantCount}`
        : "O'zgarmaydi"
    },
    { label: 'Tarif', value: `${adjustmentData.tariffRate.toLocaleString()} UZS` },
    {
      label: "Qo'shimcha hisob",
      value: `${adjustmentData.adjustment < 0 ? '+' : '-'}${Math.abs(adjustmentData.adjustment).toLocaleString()} UZS`,
      color: 'error.main'
    }
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        mx: 1,
        px: 1.5,
        py: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: isCurrentlyApplied ? 'success.light' : 'warning.light',
        bgcolor: isCurrentlyApplied ? 'success.lighter' : 'warning.lighter'
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: isCurrentlyApplied ? 'success.dark' : 'warning.dark' }}>
          ⚠️ Kechikkan davr uchun qo'shimcha hisob aniqlandi
        </Typography>
        <Chip
          size="small"
          label={isCurrentlyApplied ? "Tavsiya etilgan summa qo'llandi" : 'Dastlabki summa saqlandi'}
          color={isCurrentlyApplied ? 'success' : 'default'}
          sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }}
        />
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', columnGap: 1.5, rowGap: 0.5 }}>
        {details.map((d) => (
          <Box key={d.label} sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
              {d.label}
            </Typography>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: d.color }}>
              {d.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 0.75 }} />

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Tavsiya qilingan yakuniy summa:{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>
            {Math.abs(recommendedSum).toLocaleString()} UZS
          </Box>
        </Typography>
        <Button
          variant="contained"
          size="small"
          color={isCurrentlyApplied ? 'warning' : 'primary'}
          onClick={handleToggle}
          disabled={isLoading}
          sx={{ textTransform: 'none', fontWeight: 600, py: 0.25 }}
        >
          {isCurrentlyApplied ? 'Dastlabki summaga qaytarish' : "Tavsiya etilgan summani qo'llash"}
        </Button>
      </Stack>
    </Paper>
  );
}
