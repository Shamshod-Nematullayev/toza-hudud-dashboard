import { Card, Chip, Stack, Tooltip, Typography, IconButton } from '@mui/material';
import dayjs from 'dayjs';
import { STATUS_CFG } from '../Debitors/types';
import { useAbonentStore } from './hooks/abonentStore';
import { History as HistoryIcon } from '@mui/icons-material';

export interface AbonentDetailsHistoryRow {
  accountNumber: number;
  date: string;
  fullName: string;
}

interface Props {
  data: AbonentDetailsHistoryRow[];
}

export const NameHistory = ({ data }: Props) => {
  const { abonentDebitorStatus, setOpenTozaMakonHistoryDialog, abonentDetails } = useAbonentStore();

  const contractDateObj = abonentDetails?.contractDate ? dayjs(abonentDetails.contractDate) : null;

  // Filter out any history records dated before the account contract creation date
  const filteredData = data.filter((item) => {
    if (!contractDateObj || !contractDateObj.isValid() || !item.date) return true;
    const itemDate = dayjs(item.date);
    if (!itemDate.isValid()) return true;
    return !itemDate.isBefore(contractDateObj.startOf('day'));
  });

  // eski -> yangi tartibni teskariga o‘giramiz
  const sorted = [...filteredData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const changes = sorted
    .map((item, i) => {
      const prev = sorted[i + 1];
      if (!prev || prev.fullName === item.fullName) return null;

      return {
        from: prev.fullName,
        to: item.fullName,
        date: item.date,
        fromDate: prev.date
      };
    })
    .filter(Boolean);

  console.log(data);
  console.log(changes);

  return (
    <Card sx={{ p: 2, boxShadow: 2 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Ism o'zgarishlari
        </Typography>
        <Tooltip title="Tizimdagi barcha amallar (TozaMakon)">
          <IconButton size="small" color="primary" onClick={() => setOpenTozaMakonHistoryDialog(true)}>
            <HistoryIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <Stack spacing={1.5}>
        {changes.map((c, i) => (
          <Stack key={i} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Chap: o‘zgarish */}
            <Stack direction="row" spacing={1} sx={{ mr: 1, alignItems: 'center' }}>
              <Tooltip title={dayjs(c?.fromDate).format('DD.MM.YYYY')}>
                <Chip
                  label={c?.from}
                  variant="outlined"
                  size="small"
                  sx={{
                    height: 'auto',
                    '& .MuiChip-label': {
                      whiteSpace: 'normal',
                      display: 'block',
                      lineHeight: 1.2,
                      paddingTop: '4px',
                      paddingBottom: '4px'
                    }
                  }}
                />
              </Tooltip>
              <Typography sx={{ fontSize: 14 }}>→</Typography>
              <Chip
                label={c?.to}
                color="primary"
                size="small"
                sx={{
                  height: 'auto',
                  '& .MuiChip-label': {
                    whiteSpace: 'normal',
                    display: 'block',
                    lineHeight: 1.2,
                    paddingTop: '4px',
                    paddingBottom: '4px'
                  }
                }}
              />
            </Stack>

            {/* O‘ng: sana */}
            <Typography sx={{ fontSize: 12 }} color="text.secondary">
              {dayjs(c?.date).format('DD.MM.YYYY')}
            </Typography>
          </Stack>
        ))}
      </Stack>
      {abonentDebitorStatus?.status && (
        <Chip
          label={STATUS_CFG[abonentDebitorStatus.status]?.label}
          color={STATUS_CFG[abonentDebitorStatus.status]?.color}
          variant="outlined"
        />
      )}
    </Card>
  );
};
