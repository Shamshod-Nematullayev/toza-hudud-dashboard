import { Button, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import { parseAktSumExpression } from '../../hooks/useFindedTableLogic';

interface AdjustmentAlertProps {
  adjustmentData: any;
  aktSumm: string;
  onApplyRecommendedSum: (sum: string) => void;
}

export function AdjustmentAlert({ adjustmentData, aktSumm, onApplyRecommendedSum }: AdjustmentAlertProps) {
  if (!adjustmentData || adjustmentData.adjustment === 0) return null;

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
              {Math.abs(parseAktSumExpression(aktSumm)).toLocaleString()} UZS
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
              {adjustmentData.currentInhabitantCount} → {adjustmentData.nextInhabitantCount}
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
              {Math.abs(adjustmentData.recommendedSum).toLocaleString()} UZS
            </Typography>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={() => onApplyRecommendedSum(String(adjustmentData.recommendedSum))}
          sx={{ mt: 1, textTransform: 'none', fontWeight: 600, width: 'fit-content' }}
        >
          Tavsiya etilgan summani qo'llash
        </Button>
      </Stack>
    </Paper>
  );
}
