import { useState, useEffect } from 'react';
import { Button, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
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

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'primary.light',
        bgcolor: 'primary.lighter'
      }}
    >
      <Stack spacing={1}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.dark' }}>
          ⚠️ Eslatma: O'tgan oylar uchun qo'shimcha hisob aniqlandi
        </Typography>

        <Divider sx={{ my: 0.5 }} />

        <Grid container spacing={1}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">Asl akt summasi:</Typography>
          </Grid>
          <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {Math.abs(originalAmount).toLocaleString()} UZS
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">Akt hisoblangan:</Typography>
          </Grid>
          <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{adjustmentData.actMonth}</Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">Tizimga kiritilmoqda:</Typography>
          </Grid>
          <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{adjustmentData.currentMonth}</Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">Odam soni:</Typography>
          </Grid>
          <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {adjustmentData.nextInhabitantCount !== undefined && adjustmentData.nextInhabitantCount !== null
                ? `${adjustmentData.currentInhabitantCount} → ${adjustmentData.nextInhabitantCount}`
                : "Yashovchi soni o'zgarmaydi"}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">Tarif:</Typography>
          </Grid>
          <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {adjustmentData.tariffRate.toLocaleString()} UZS
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">Qo'shimcha hisob:</Typography>
          </Grid>
          <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
              {adjustmentData.adjustment < 0 ? '+' : '-'}{Math.abs(adjustmentData.adjustment).toLocaleString()} UZS
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 0.5 }} />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Tavsiya etilgan yakuniy summa:</Typography>
          </Grid>
          <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1rem' }}>
              {Math.abs(recommendedSum).toLocaleString()} UZS
            </Typography>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          size="small"
          color={isCurrentlyApplied ? "warning" : "primary"}
          onClick={handleToggle}
          disabled={isLoading}
          sx={{ mt: 1, textTransform: 'none', fontWeight: 600, width: 'fit-content' }}
        >
          {isCurrentlyApplied ? "Dastlabki summaga qaytarish" : "Tavsiya etilgan summani qo'llash"}
        </Button>
      </Stack>
    </Paper>
  );
}
