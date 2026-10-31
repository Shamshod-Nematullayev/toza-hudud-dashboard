import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import dayjs from 'dayjs';
import api from 'utils/api';
import { PermamentsResponse } from '../Abonent/types';

interface MvdInhabitantsInfoProps {
  // Bo'sh bo'lsa so'rov yuborilmaydi va blok ko'rinmaydi
  cadastr?: string | null;
  inhabitantCnt: number;
  // MVD javobi kelganda doimiy ro'yxatdagilar soni (0 bo'lsa chaqirilmaydi)
  onLoaded?: (permanentCnt: number) => void;
  emptyHint?: string;
}

const formatMvdDate = (value: string) => (dayjs(value).isValid() ? dayjs(value).format('DD.MM.YYYY') : value);

/**
 * MVD (IIB) bo'yicha kadastrda ro'yxatda turganlar soni va "Kimlar?" tugmasi bilan ro'yxati
 */
const MvdInhabitantsInfo: React.FC<MvdInhabitantsInfoProps> = ({
  cadastr,
  inhabitantCnt,
  onLoaded,
  emptyHint = "Kadastrda doimiy ro'yxatda hech kim yo'q, son o'zgartirilmadi"
}) => {
  const theme = useTheme();
  const [data, setData] = useState<PermamentsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showList, setShowList] = useState<boolean>(false);
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  const cad = (cadastr || '').trim();

  useEffect(() => {
    setData(null);
    setError('');
    setShowList(false);
    if (!cad) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    // Kadastr qo'lda yozilayotganda har harfga so'rov ketmasligi uchun
    const timer = setTimeout(async () => {
      try {
        const { data: res } = await api.get<PermamentsResponse>('/abonents/iib-inhabitants', {
          params: { cadastralNumber: cad },
          headers: { 'hide-error': true }
        });
        if (cancelled) return;
        setData(res);
        const permanentCnt = res?.Data?.PermanentPersons?.length ?? 0;
        if (permanentCnt > 0) onLoadedRef.current?.(permanentCnt);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.response?.data?.message || "MVD ma'lumotini olib bo'lmadi");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cad]);

  if (!cad || !(loading || error || data)) return null;

  const permanent = data?.Data?.PermanentPersons || [];
  const temporary = data?.Data?.TemproaryPersons || [];

  return (
    <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed', borderColor: theme.palette.divider }}>
      {loading ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <CircularProgress size={14} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            MVD ma'lumoti yuklanmoqda...
          </Typography>
        </Stack>
      ) : error ? (
        <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
          {error}
        </Typography>
      ) : (
        <>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              MVD bo'yicha doimiy ro'yxatda: <b>{permanent.length} kishi</b>
              {temporary.length > 0 && `, vaqtincha: ${temporary.length}`}
            </Typography>
            {permanent.length + temporary.length > 0 && (
              <Button
                size="small"
                variant="text"
                endIcon={showList ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                onClick={() => setShowList((v) => !v)}
                sx={{ fontSize: '0.72rem', py: 0, fontWeight: 700, textTransform: 'none', whiteSpace: 'nowrap' }}
              >
                {showList ? 'Yashirish' : 'Kimlar?'}
              </Button>
            )}
          </Stack>
          {permanent.length === 0 ? (
            <Typography variant="caption" sx={{ color: theme.palette.warning.main, display: 'block' }}>
              {emptyHint}
            </Typography>
          ) : (
            inhabitantCnt !== permanent.length && (
              <Typography variant="caption" sx={{ color: theme.palette.warning.main, display: 'block' }}>
                Kiritilgan son MVD dagidan farq qiladi
              </Typography>
            )
          )}
          {showList && (
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {[...permanent.map((p) => ({ p, isTemporary: false })), ...temporary.map((p) => ({ p, isTemporary: true }))].map(
                ({ p, isTemporary }, i) => (
                  <Stack
                    key={`${p.Id || p.Pinpp}-${i}`}
                    direction="row"
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      p: 0.8,
                      borderRadius: '6px',
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: theme.palette.divider
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block' }}>
                        {i + 1}. {p.Person}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {[
                          p.DateBirth && `Tug'ilgan: ${formatMvdDate(p.DateBirth)}`,
                          p.RegistrationDate && `Ro'yxatga olingan: ${formatMvdDate(p.RegistrationDate)}`
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </Typography>
                    </Box>
                    {isTemporary && (
                      <Chip label="Vaqtincha" size="small" color="info" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                    )}
                  </Stack>
                )
              )}
            </Stack>
          )}
        </>
      )}
    </Box>
  );
};

export default MvdInhabitantsInfo;
