import { useEffect, useMemo, useState } from 'react';
import { alpha, Autocomplete, Box, Chip, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ArrowForward, GroupOutlined, PersonOutlineOutlined } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import api from 'utils/api';
import { colors } from 'store/constant';
import DHJTable from './DHJTable';
import {
  calcDeltaPeriod,
  dhjRow,
  getDhjFirstMonth,
  getLastClosedMonth,
  IRecalculationPeriod,
  kuchirishSabablari,
  useStore
} from './useStore';

const FROM_COLOR = colors[0];
const TO_COLOR = colors[2];

const fmt = (v: number) => `${v > 0 ? '+' : ''}${v.toLocaleString('ru-RU')} so'm`;

/** Formadagi maydonlar: kishi soni, sabab, kim ko'chdi, qachon ko'chdi */
export function InhabitantTransferFields() {
  const { kuchirish, setKuchirish, abonentData, rowsDhjTable } = useStore();
  const fromCurrent = Number(abonentData?.house?.inhabitantCnt) || 0;
  const soni = Number(kuchirish.soni);
  const soniError = kuchirish.soni !== '' && (!Number.isInteger(soni) || soni < 1 || (!!abonentData.accountNumber && soni > fromCurrent));
  const validSoniField = Number.isInteger(soni) && soni >= 1;
  const kam = Number(kuchirish.kamaytirish) || 0;
  const kamError =
    kuchirish.kamaytirish !== '' &&
    (!Number.isInteger(Number(kuchirish.kamaytirish)) || kam < 0 || (!!abonentData.accountNumber && (validSoniField ? soni : 0) + kam > fromCurrent));
  const minMonth = getDhjFirstMonth(rowsDhjTable) ?? dayjs('2019-01-01');

  return (
    <Stack spacing={1.5}>
      {/* Ustun tor: maydonlar ustma-ust, oq fon faqat input qutisida (helper matn ostida emas) */}
      <TextField
        fullWidth
        type="number"
        label="Ko'chiriladigan kishi soni"
        value={kuchirish.soni}
        onChange={(e) => setKuchirish({ soni: e.target.value })}
        error={soniError}
        helperText={abonentData.accountNumber ? `Asosiy abonentda: ${fromCurrent} kishi` : undefined}
        slotProps={{ htmlInput: { min: 1 } }}
        sx={{ '& .MuiInputBase-root': { bgcolor: 'background.paper' } }}
      />
      <DatePicker
        views={['year', 'month']}
        format="MM.YYYY"
        label="Ko'chgan oy"
        minDate={minMonth}
        maxDate={dayjs()}
        value={kuchirish.oy}
        onChange={(v) => setKuchirish({ oy: v })}
        slotProps={{
          textField: {
            fullWidth: true,
            helperText: kuchirish.oy?.isBefore(dayjs(), 'month') ? "O'tgan oylar qayta hisoblanadi" : 'Joriy oydan boshlab',
            sx: { '& .MuiPickersInputBase-root, & .MuiInputBase-root': { bgcolor: 'background.paper' } }
          }
        }}
      />

      <Autocomplete
        freeSolo
        options={[...kuchirishSabablari]}
        value={kuchirish.sabab}
        onInputChange={(_, v) => setKuchirish({ sabab: v })}
        renderInput={(params) => <TextField {...params} label="Ko'chirish sababi" sx={{ bgcolor: 'background.paper', borderRadius: 1 }} />}
      />
      <TextField
        fullWidth
        type="number"
        label="Qolganlardan chiqarib tashlanadi (ixtiyoriy)"
        value={kuchirish.kamaytirish}
        onChange={(e) => setKuchirish({ kamaytirish: e.target.value })}
        error={kamError}
        helperText={
          kam > 0 && validSoniField
            ? `Asosiy abonentda ${fromCurrent} → ${Math.max(0, fromCurrent - soni - kam)} kishi qoladi`
            : "Boshqa joyga ketgan, qabul qiluvchiga qo'shilmaydigan kishilar"
        }
        slotProps={{ htmlInput: { min: 0 } }}
        sx={{ '& .MuiInputBase-root': { bgcolor: 'background.paper' } }}
      />
      {kam > 0 && (
        <TextField
          fullWidth
          label="Chiqarib tashlash sababi"
          value={kuchirish.kamaytirishSabab}
          onChange={(e) => setKuchirish({ kamaytirishSabab: e.target.value })}
          error={!kuchirish.kamaytirishSabab.trim()}
          slotProps={{ htmlInput: { maxLength: 300 } }}
          sx={{ '& .MuiInputBase-root': { bgcolor: 'background.paper' } }}
        />
      )}
      <TextField
        label="Ko'chgan shaxs(lar) F.I.Sh (ixtiyoriy)"
        placeholder="Masalan: Karimova Dilnoza Akmal qizi"
        value={kuchirish.shaxslar}
        onChange={(e) => setKuchirish({ shaxslar: e.target.value })}
        slotProps={{ htmlInput: { maxLength: 300 } }}
        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
      />
    </Stack>
  );
}

function SideCard({
  title,
  color,
  account,
  name,
  current,
  next,
  total
}: {
  title: string;
  color: string;
  account?: string;
  name?: string;
  current: number;
  next: number;
  total: number;
}) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 0,
        p: 1.25,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: `4px solid #${color}`,
        bgcolor: 'background.paper'
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
        {title}
      </Typography>
      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
        {account || '—'}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
        {name || 'Hisob raqamini kiriting'}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.75, justifyContent: 'space-between' }}>
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            fontWeight: 700,
            fontSize: '13px',
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08)
          }}
        >
          <Box component="span" sx={{ color: 'text.disabled' }}>
            {account ? current : '—'}
          </Box>
          {' → '}
          <Box component="span" sx={{ color: next < current ? 'success.main' : 'error.main' }}>
            {account ? next : '—'}
          </Box>{' '}
          kishi
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 700, color: total > 0 ? 'success.main' : total < 0 ? 'error.main' : 'text.secondary' }}>
          {total ? fmt(total) : "qayta hisob yo'q"}
        </Typography>
      </Stack>
    </Paper>
  );
}

/**
 * Markaziy panel: ikki abonentdagi o'zgarish (A −N, B +N), qayta hisob summasi va ikkala DHJ jadvali.
 * Hisob-kitob shu yerda bajariladi: asosiy abonentniki store.recalculationPeriods/aktSumma ga, qabul qiluvchiniki kuchirish ga yoziladi.
 */
export function InhabitantTransferSummary() {
  const {
    abonentData,
    abonentData2,
    kuchirish,
    setKuchirish,
    rowsDhjTable,
    hisoblandiJadval,
    setRecalculationPeriods,
    setAktSumma,
    setYashovchiSoniInput
  } = useStore();
  const [tab, setTab] = useState<'from' | 'to'>('from');
  const [toRows, setToRows] = useState<dhjRow[]>([]);

  useEffect(() => {
    setToRows([]);
    if (!abonentData2?.id || abonentData2.id <= 0) return;
    let cancelled = false;
    api.get('/billing/get-abonent-dxj-by-id', { params: { residentId: abonentData2.id } }).then(({ data }) => {
      if (cancelled || !data?.ok) return;
      setToRows(
        data.rows.map((row: any, i: number) => ({
          id: i + 1,
          davr: row.period,
          saldo_n: row.nSaldo,
          nachis: row.accrual,
          saldo_k: row.kSaldo,
          akt: row.actAmount,
          yashovchilar_soni: row.inhabitantCount,
          allPaymentsSum: row.allPaymentsSum
        }))
      );
    });
    return () => {
      cancelled = true;
    };
  }, [abonentData2?.id]);

  const soni = Number(kuchirish.soni);
  const validSoni = Number.isInteger(soni) && soni >= 1;
  const fromCurrent = Number(abonentData?.house?.inhabitantCnt) || 0;
  const toCurrent = Number(abonentData2?.house?.inhabitantCnt) || 0;
  const kam = Math.max(0, Math.floor(Number(kuchirish.kamaytirish) || 0));
  // Asosiydan ko'chganlar + chiqarib tashlanganlar ayriladi; qabul qiluvchiga faqat ko'chganlar qo'shiladi
  const fromDelta = validSoni ? soni + kam : 0;
  const fromNext = validSoni ? Math.max(0, fromCurrent - fromDelta) : fromCurrent;
  const toNext = validSoni ? toCurrent + soni : toCurrent;

  // Ko'chgan oydan oxirgi yopilgan oygacha: asosiyda −N, qabul qiluvchida +N kishi. Joriy oy yangi son bilan hisoblanadi
  const { fromPeriod, toPeriod } = useMemo(() => {
    const lastClosed = getLastClosedMonth();
    const oy = kuchirish.oy;
    if (!validSoni || !oy?.isValid() || oy.isAfter(lastClosed, 'month') || !hisoblandiJadval.length)
      return { fromPeriod: null, toPeriod: null };
    const from = abonentData.accountNumber ? calcDeltaPeriod(rowsDhjTable, hisoblandiJadval, oy, lastClosed, -fromDelta) : null;
    const to = abonentData2.accountNumber ? calcDeltaPeriod(toRows, hisoblandiJadval, oy, lastClosed, soni) : null;
    return {
      fromPeriod: from && ({ ...from, color: FROM_COLOR } as IRecalculationPeriod),
      toPeriod: to && ({ ...to, color: TO_COLOR } as IRecalculationPeriod)
    };
  }, [kuchirish.oy, soni, fromDelta, validSoni, rowsDhjTable, toRows, hisoblandiJadval, abonentData.accountNumber, abonentData2.accountNumber]);

  useEffect(() => {
    setRecalculationPeriods(fromPeriod ? [fromPeriod] : []);
    setAktSumma({
      total: fromPeriod?.total || 0,
      totalWithQQS: fromPeriod?.withQQSTotal || 0,
      withoutQQSTotal: fromPeriod?.withoutQQSTotal || 0
    });
    setKuchirish({
      toPeriods: toPeriod ? [toPeriod] : [],
      toAktSumma: {
        total: toPeriod?.total || 0,
        totalWithQQS: toPeriod?.withQQSTotal || 0,
        withoutQQSTotal: toPeriod?.withoutQQSTotal || 0
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromPeriod, toPeriod]);

  useEffect(() => {
    if (abonentData.accountNumber) setYashovchiSoniInput(fromNext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromNext, abonentData.accountNumber]);

  return (
    <Stack spacing={1} sx={{ height: '100%', minHeight: 0 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: 'stretch', flexShrink: 0 }}>
        <SideCard
          title={`Chiqib ketadi · −${validSoni ? soni : '?'}${kam ? ` (+${kam} chiqariladi)` : ''}`}
          color={FROM_COLOR}
          account={abonentData.accountNumber}
          name={abonentData.fullName}
          current={fromCurrent}
          next={fromNext}
          total={fromPeriod?.total || 0}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
          <ArrowForward />
        </Box>
        <SideCard
          title={`Qabul qiladi · +${validSoni ? soni : '?'}`}
          color={TO_COLOR}
          account={abonentData2.accountNumber}
          name={abonentData2.fullName}
          current={toCurrent}
          next={toNext}
          total={toPeriod?.total || 0}
        />
      </Stack>
      {kuchirish.oy?.isValid() && (
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
          {kuchirish.oy.isAfter(getLastClosedMonth(), 'month')
            ? "Ko'chish joriy oydan: o'tgan oylar qayta hisoblanmaydi, ikkala abonent shu oydan yangi son bilan hisoblanadi."
            : `${kuchirish.oy.format('MM.YYYY')} – ${getLastClosedMonth().format('MM.YYYY')} oylari qayta hisoblanadi: chiqib ketgan xonadonda qarz kamayadi, qabul qilgan xonadonda qarz qo'shiladi. Joriy oy yangi son bilan hisoblanadi.`}
        </Typography>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 34 }}>
          <Tab
            value="from"
            icon={<PersonOutlineOutlined fontSize="small" />}
            iconPosition="start"
            label={`1. Chiqib ketadi${abonentData.accountNumber ? ` · ${abonentData.accountNumber}` : ''}`}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '12px', minHeight: 34, py: 0.3 }}
          />
          <Tab
            value="to"
            icon={<GroupOutlined fontSize="small" />}
            iconPosition="start"
            label={`2. Qabul qiladi${abonentData2.accountNumber ? ` · ${abonentData2.accountNumber}` : ''}`}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '12px', minHeight: 34, py: 0.3 }}
          />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {/* Ikkala jadval ham doim yuklangan: asosiy jadval store.rowsDhjTable ni to'ldiradi, qayta hisob unga tayanadi */}
        <Box sx={{ height: '100%', display: tab === 'from' ? 'block' : 'none' }}>
          <DHJTable abonentData={abonentData} />
        </Box>
        <Box sx={{ height: '100%', display: tab === 'to' ? 'block' : 'none' }}>
          <DHJTable
            abonentData={abonentData2}
            label="Qabul qiluvchi"
            preview={{ periods: kuchirish.toPeriods, inhabitant: toNext, aktTotal: kuchirish.toAktSumma.total }}
          />
        </Box>
      </Box>
      {!abonentData2.accountNumber && (
        <Chip size="small" color="warning" label="Qabul qiluvchi hisob raqamini chap tomonda kiriting" sx={{ alignSelf: 'flex-start' }} />
      )}
    </Stack>
  );
}
