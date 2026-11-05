import { useState, useEffect } from 'react';
import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
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
  const [isApplied, setIsApplied] = useState<boolean>(false);

  // Abonent yoki ariza o'zgarganda state larni reset qilish
  const residentId = adjustmentData?.residentId;
  const arizaId = adjustmentData?.arizaId;
  useEffect(() => {
    setIsApplied(false);
    setBaseSum(null);
  }, [residentId, arizaId]);

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
      setBaseSum(null);
      onApplyRecommendedSum(restore);
    } else {
      // Tavsiya etilgan summani qo'llash
      setBaseSum(aktSumm);
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
        borderColor: 'primary.light',
        bgcolor: 'primary.lighter'
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.dark', display: 'block', mb: 0.5 }}>
        ⚠️ O'tgan oylar uchun qo'shimcha hisob aniqlandi
      </Typography>

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
          Tavsiya:{' '}
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
