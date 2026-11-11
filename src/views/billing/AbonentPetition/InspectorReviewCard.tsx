import React from 'react';
import { Alert, AlertTitle, Box, Chip, Link, Stack, Typography } from '@mui/material';
import { PlaceOutlined } from '@mui/icons-material';
import dayjs from 'dayjs';
import { IArizaInspectorConfirmation, IArizaInspectorReview } from 'types/models';

const REASON_LABELS: Record<IArizaInspectorReview['reason'], string> = {
  soxta_manzil: 'Abonent soxta manzil ko‘rsatgan',
  yashovchi_notogri: 'Yashovchi soni noto‘g‘ri',
  dvaynik_izoh: 'Ikkilamchi kod noto‘g‘ri'
};

function formatMeters(m?: number) {
  if (m === undefined || m === null) return '';
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

/** Hudud nazoratchisi Telegram bot orqali bildirgan e'tiroz (arizani bekor qilgan yoki akt kiritilgandan keyin e'tiroz) */
const InspectorReviewCard: React.FC<{
  review?: IArizaInspectorReview | null;
  confirmation?: IArizaInspectorConfirmation | null;
}> = ({ review, confirmation }) => {
  if (!review && confirmation) {
    return (
      <Alert severity="success" variant="outlined" sx={{ borderRadius: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Nazoratchi arizani to‘g‘ri deb tasdiqlagan
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {confirmation.inspectorName || '-'}, {dayjs(confirmation.createdAt).format('DD.MM.YYYY HH:mm')}
        </Typography>
      </Alert>
    );
  }
  if (!review) return null;
  const cancelled = review.status === 'bekor_qilindi';
  const loc = review.actualLocation;

  return (
    <Alert severity={cancelled ? 'error' : 'warning'} variant="outlined" sx={{ borderRadius: 2 }}>
      <AlertTitle sx={{ fontWeight: 700 }}>
        {cancelled ? 'Nazoratchi arizani bekor qilgan' : 'Nazoratchi e‘tirozi (akt kiritilgan — qaror sizda)'}
      </AlertTitle>
      <Stack spacing={0.75}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip size="small" label={REASON_LABELS[review.reason] || review.reason} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {review.inspectorName || '-'}, {dayjs(review.createdAt).format('DD.MM.YYYY HH:mm')}
          </Typography>
        </Stack>

        {loc && (
          <Typography variant="body2">
            Haqiqiy uy joylashuvi:{' '}
            <Link
              href={`https://maps.google.com/?q=${loc.lat},${loc.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, fontWeight: 600 }}
            >
              <PlaceOutlined fontSize="inherit" />
              {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
            </Link>
            {loc.distanceMeters !== undefined && ` (arizadagi nuqtadan ${formatMeters(loc.distanceMeters)})`}
          </Typography>
        )}

        {review.reason === 'yashovchi_notogri' && (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Amalda yashovchilar: {review.actualInhabitantCnt ?? '-'} kishi
            </Typography>
            {!!review.actualInhabitants?.length && (
              <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
                {review.actualInhabitants.map((name) => (
                  <Typography component="li" variant="body2" key={name}>
                    {name}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        )}

        {review.comment && <Typography variant="body2">Izoh: {review.comment}</Typography>}
      </Stack>
    </Alert>
  );
};

export default InspectorReviewCard;
