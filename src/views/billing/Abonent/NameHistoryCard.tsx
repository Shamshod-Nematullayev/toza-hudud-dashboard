import { Card, Chip, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

export interface AbonentDetailsHistoryRow {
  accountNumber: number;
  date: string;
  fullName: string;
}

interface Props {
  data: AbonentDetailsHistoryRow[];
}

export const NameHistory = ({ data }: Props) => {
  // eski -> yangi tartibni teskariga o‘giramiz
  const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const changes = sorted
    .map((item, i) => {
      const prev = sorted[i + 1];
      if (!prev || prev.fullName === item.fullName) return null;

      return {
        from: prev.fullName,
        to: item.fullName,
        date: item.date
      };
    })
    .filter(Boolean);

  console.log(data);
  console.log(changes);

  return (
    <Card sx={{ p: 2, boxShadow: 2 }}>
      <Stack spacing={1.5}>
        {changes.map((c, i) => (
          <Stack key={i} direction="row" alignItems="center" justifyContent="space-between">
            {/* Chap: o‘zgarish */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip label={c?.from} variant="outlined" size="small" />
              <Typography fontSize={14}>→</Typography>
              <Chip label={c?.to} color="primary" size="small" />
            </Stack>

            {/* O‘ng: sana */}
            <Typography fontSize={12} color="text.secondary">
              {dayjs(c?.date).format('DD.MM.YYYY')}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
};
