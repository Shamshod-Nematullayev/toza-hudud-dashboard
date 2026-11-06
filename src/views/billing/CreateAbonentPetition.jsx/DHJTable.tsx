import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useMemo, useState } from 'react';
import { davrToMonth, periodMonthRange, useStore } from './useStore';
import api from 'utils/api';
import { alpha, Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { colors } from 'store/constant';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';
import { TableChartOutlined } from '@mui/icons-material';
import { AbonentDetails, IRowDhj } from 'types/billing';
import { CompactKeyValue } from 'ui-component/CompactKeyValue';
import { useLocation } from 'react-router-dom';
import { getTarifElement } from 'ui-component/cards/RecalculatorAbonent';

interface IRow {
  id: number;
  davr: string;
  saldo_n: number;
  nachis: number;
  saldo_k: number;
  akt: number;
  yashovchilar_soni: number;
  allPaymentsSum: number;
}

const fmt = (v: unknown) => (typeof v === 'number' ? v.toLocaleString('ru-RU') : String(v ?? ''));

interface DHJTableProps {
  abonentData: AbonentDetails;
  label?: string;
}

function DHJTable({ abonentData, label }: DHJTableProps) {
  const [rowsDhjTable, setRowsDhjTable] = useState<IRow[]>([]);
  const [rowsPreviewTable, setRowsPreviewTable] = useState<IRow[]>([]);
  const store = useStore();
  const { t } = useTranslation();

  const [show, setShow] = useState(false);

  const location = useLocation();
  const dhjRows = location.state?.dhjRows;

  useEffect(() => {
    if (dhjRows) {
      setRowsDhjTable(dhjRows);
    }
  }, []);

  useEffect(() => {
    if (store.hisoblandiJadval.length === 0) {
      api.get('/billing/get-tariffs').then((res) => {
        const tariffs = res.data.tariffs;
        let result = [
          {
            month: 1,
            year: 2019,
            hisoblandi: 2000,
            withQQS: 2000
          }
        ];
        for (let tariff of tariffs) {
          result.push(
            ...getTarifElement(tariff).filter((row) => result.find((r) => r.month == row.month && r.year == row.year) == undefined)
          );
        }
        store.setHisoblandiJadval(result.sort((r1, r2) => r1.year - r2.year || r1.month - r2.month));
      });
    }
  }, []);

  const handleClickShow = () => {
    setShow(!show);
  };

  useEffect(() => {
    // Agar abonent barcha tashkilotlar bo'yicha tortilgan bo'lsa, DHJ jadvali allaqachon store.rowsDhjTable da to'liq 2019-hozirgacha mavjud
    const isGlobal = label?.includes('Ikkilamchi') ? store.isGlobalAbonent2 : store.isGlobalAbonent;

    if (isGlobal && store.rowsDhjTable.length > 0) {
      setRowsDhjTable(store.rowsDhjTable);
      return;
    }

    if (abonentData.accountNumber && abonentData.id > 0) {
      api
        .get('/billing/get-abonent-dxj-by-id', {
          params: {
            residentId: abonentData.id
          }
        })
        .then(({ data }: { data: { ok: boolean; message: string; rows: IRowDhj[] } }) => {
          if (!data.ok) return toast.error(data.message);
          const mappedRows = data.rows.map((row, i) => ({
            id: i + 1,
            davr: row.period,
            saldo_n: row.nSaldo,
            nachis: row.accrual,
            saldo_k: row.kSaldo,
            akt: row.actAmount,
            yashovchilar_soni: row.inhabitantCount,
            allPaymentsSum: row.allPaymentsSum
          }));
          setRowsDhjTable(mappedRows);
          store.setRowsDhjTable(mappedRows);
        });
    } else {
      setRowsDhjTable([]);
      store.setRowsDhjTable([]);
    }
  }, [abonentData, store.isGlobalAbonent, store.isGlobalAbonent2]);

  useEffect(() => {
    if (show && rowsDhjTable.length) {
      const now = new Date();
      let currentTariff = store.hisoblandiJadval.find((t) => t.year === now.getFullYear() && t.month === now.getMonth() + 1);
      if (!currentTariff && store.hisoblandiJadval.length > 0) {
        currentTariff = store.hisoblandiJadval[store.hisoblandiJadval.length - 1];
      }
      const hisoblandi = currentTariff?.hisoblandi ?? 0;

      const isViza = store.aktType === 'viza';
      const hasInhabitantInput =
        !isViza &&
        store.yashovchiSoniInput !== '' &&
        store.yashovchiSoniInput !== null &&
        store.yashovchiSoniInput !== undefined &&
        !isNaN(Number(store.yashovchiSoniInput));

      const previewYashovchilar = hasInhabitantInput
        ? Number(store.yashovchiSoniInput)
        : (rowsDhjTable[0].yashovchilar_soni ?? abonentData?.house?.inhabitantCnt ?? 0);

      const previewNachis = hasInhabitantInput
        ? Number(store.yashovchiSoniInput) * hisoblandi
        : rowsDhjTable[0].nachis;

      const kSaldo =
        previewNachis +
        rowsDhjTable[0].saldo_n -
        rowsDhjTable[0].allPaymentsSum -
        rowsDhjTable[0].akt -
        store.aktSumma.total;

      setRowsPreviewTable([
        {
          id: 1,
          davr: rowsDhjTable[0].davr,
          saldo_n: rowsDhjTable[0].saldo_n,
          nachis: previewNachis,
          saldo_k: kSaldo,
          akt: -(rowsDhjTable[0].akt + store.aktSumma.total),
          yashovchilar_soni: previewYashovchilar,
          allPaymentsSum: rowsDhjTable[0].allPaymentsSum
        },
        ...rowsDhjTable.slice(1)
      ]);
    } else {
      setRowsPreviewTable(rowsDhjTable);
    }
  }, [
    show,
    rowsDhjTable,
    store.aktType,
    store.yashovchiSoniInput,
    store.aktSumma.total,
    store.hisoblandiJadval,
    abonentData?.house?.inhabitantCnt
  ]);

  // Har oy uchun: qaysi qayta hisob davrlariga tushadi (rang) va qancha kishiga qayta hisoblanadi
  const marksByMonth = useMemo(() => {
    const map = new Map<string, { color: string; count?: number; delta?: number }[]>();
    store.recalculationPeriods.forEach((period, index) => {
      const range = periodMonthRange(period);
      if (!range) return;
      for (let m = range.from; !m.isAfter(range.to, 'month'); m = m.add(1, 'month')) {
        const key = m.format('M.YYYY');
        map.set(key, [
          ...(map.get(key) || []),
          { color: period.color || colors[index % colors.length], count: period.yashovchilar_soni, delta: period.yashovchiDelta }
        ]);
      }
    });
    return map;
  }, [store.recalculationPeriods]);

  const monthMarks = (davr: string) => {
    const d = davrToMonth(davr);
    return (d && marksByMonth.get(d.format('M.YYYY'))) || [];
  };

  /**
   * Qayta hisobdan keyin oy qanday hisoblanishi (oldindan ko'rish):
   * - ko'p bosqichli: davrdagi mutlaq kishi soni;
   * - kalkulyator (oddiy odam soni, viza, o'lim): har davr ±1 kishi, ustma-ust davrlar qo'shiladi;
   * - GPS: oy hisoblanganining hammasi qaytariladi, kishi soni o'zgarmaydi.
   */
  const previewFor = (row: IRow) => {
    const marks = monthMarks(row.davr);
    const d = davrToMonth(row.davr);
    if (!marks.length || !d) return null;
    const oldCount = Number(row.yashovchilar_soni) || 0;

    if (store.aktType === 'gps') {
      return { count: oldCount, oldCount, newNachis: 0, diff: Number(row.nachis) || 0 };
    }

    const tariff = store.hisoblandiJadval.find((r) => r.year === d.year() && r.month === d.month() + 1);
    if (!tariff) return null;
    const absolute = marks.find((m) => m.count !== undefined && m.count !== null);
    const delta = marks.reduce((a, m) => a + (Number(m.delta) || 0), 0);
    if (!absolute && !delta) return null;
    const count = absolute ? Number(absolute.count) : oldCount + delta;
    return { count, oldCount, newNachis: count * tariff.hisoblandi, diff: (oldCount - count) * tariff.hisoblandi };
  };

  if (!abonentData?.accountNumber) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '280px',
          color: 'text.secondary',
          gap: 1.5,
          p: 3
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <TableChartOutlined sx={{ fontSize: 32, color: 'text.disabled' }} />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {t("DHJ ma'lumotlari mavjud emas")}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center' }}>
          {t("DHJ tarixini ko'rish uchun abonent hisob raqamini kiriting")}
        </Typography>
      </Box>
    );
  }

  return (
    <Stack sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Soddalashtirilgan va toza Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 0.5 }}>
        <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
          {label && (
            <Typography
              variant="caption"
              sx={{
                color: label.includes('Ikkilamchi') ? 'warning.main' : 'primary.main',
                fontWeight: 700,
                fontSize: '11px',
                display: 'block',
                mb: 0.2
              }}
            >
              {label}
            </Typography>
          )}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', overflow: 'hidden' }}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{ fontWeight: 700, maxWidth: { xs: '160px', sm: '240px', md: '300px' } }}
              title={abonentData.fullName}
            >
              {abonentData.fullName || '—'}
            </Typography>
            <Chip
              label={abonentData.accountNumber}
              size="small"
              variant="outlined"
              color={label?.includes('Ikkilamchi') ? 'warning' : 'primary'}
              sx={{ fontWeight: 700, fontSize: '11px', height: 20 }}
            />
            {(label?.includes('Ikkilamchi') ? store.isGlobalAbonent2 : store.isGlobalAbonent) && abonentData.companyName && (
              <Chip label={abonentData.companyName} size="small" color="info" sx={{ fontWeight: 700, fontSize: '11px', height: 20 }} />
            )}
          </Stack>
        </Box>

        <Tooltip title={show ? t('Asl holatga qaytish') : t("Kiritilgan o'zgarishlar bilan oldindan ko'rish")} arrow>
          <IconButton
            size="small"
            color={show ? 'secondary' : 'primary'}
            onClick={handleClickShow}
            sx={{
              border: '1px solid',
              borderColor: show ? 'secondary.main' : 'divider',
              bgcolor: show ? 'secondary.50' : 'background.paper',
              p: 0.6
            }}
          >
            {show ? <IconEye size={18} /> : <IconEyeClosed size={18} />}
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          columns={[
            {
              field: 'id',
              headerName: t('tableHeaders.period'),
              flex: 0.9,
              minWidth: 86,
              renderCell: (params) => {
                const marks = monthMarks(params.row.davr);
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 0.75 }}>
                    {/* Qayta hisob davriga tushgan oy chap tomonda davr rangi bilan belgilanadi */}
                    <Box sx={{ display: 'flex', gap: '2px', height: '70%', width: 4 * Math.max(marks.length, 1) }}>
                      {marks.map((m, i) => (
                        <Box key={i} sx={{ width: 4, borderRadius: 1, bgcolor: '#' + m.color }} />
                      ))}
                    </Box>
                    <span>{params.row.davr}</span>
                  </Box>
                );
              }
            },
            { field: 'saldo_n', headerName: t('tableHeaders.nSaldo'), type: 'number', flex: 1, minWidth: 80, valueFormatter: fmt },
            {
              field: 'nachis',
              headerName: t('tableHeaders.nachis'),
              type: 'number',
              flex: 1.2,
              minWidth: 96,
              renderCell: (params) => {
                const preview = previewFor(params.row);
                if (!preview) return fmt(params.row.nachis);
                return (
                  <Tooltip
                    arrow
                    title={`${
                      store.aktType === 'gps' ? 'Xizmat ko\'rsatilmagan oy' : `${preview.oldCount} kishi o'rniga ${preview.count} kishi`
                    } · qayta hisob: ${preview.diff > 0 ? '+' : ''}${fmt(preview.diff)}`}
                  >
                    <Box sx={{ lineHeight: 1.15, textAlign: 'right' }}>
                      <Box component="span" sx={{ fontWeight: 700, color: preview.diff > 0 ? 'success.main' : preview.diff < 0 ? 'error.main' : 'text.primary' }}>
                        {fmt(preview.newNachis)}
                      </Box>
                      <Box component="span" sx={{ display: 'block', fontSize: '10px', color: 'text.disabled', textDecoration: 'line-through' }}>
                        {fmt(params.row.nachis)}
                      </Box>
                    </Box>
                  </Tooltip>
                );
              }
            },
            { field: 'saldo_k', headerName: t('tableHeaders.kSaldo'), type: 'number', flex: 1, minWidth: 80, valueFormatter: fmt },
            { field: 'akt', headerName: t('tableHeaders.act'), type: 'number', flex: 0.8, minWidth: 64, valueFormatter: fmt },
            { field: 'allPaymentsSum', headerName: t('tableHeaders.income'), type: 'number', flex: 1, minWidth: 80, valueFormatter: fmt },
            {
              field: 'yashovchilar_soni',
              headerName: t('tableHeaders.inhabitantCount'),
              width: 84,
              align: 'center',
              headerAlign: 'center',
              renderCell: (params) => {
                const preview = previewFor(params.row);
                if (!preview || preview.count === preview.oldCount) return params.row.yashovchilar_soni;
                return (
                  <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      {preview.oldCount}
                    </Box>
                    {' → '}
                    <Box component="span" sx={{ fontWeight: 700, color: preview.count < preview.oldCount ? 'success.main' : 'error.main' }}>
                      {preview.count}
                    </Box>
                  </Box>
                );
              }
            }
          ]}
          disableColumnFilter
          disableColumnSorting
          disableColumnMenu
          hideFooter
          rows={rowsPreviewTable}
          getRowId={(row) => row.id}
          getRowClassName={(params) => (previewFor(params.row) ? 'recalc-row' : '')}
          sx={{
            width: '100%',
            height: '100%',
            '& .recalc-row': { bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04) }
          }}
        />
      </Box>
    </Stack>
  );
}

export default DHJTable;
