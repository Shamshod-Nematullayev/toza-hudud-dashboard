import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';
import {
  TableChartOutlined,
  FilterAltOutlined,
  CheckCircleOutline,
  CompareArrowsOutlined,
  InfoOutlined
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import api from 'utils/api';
import { colors } from 'store/constant';
import { davrToMonth, periodMonthRange } from '../../CreateAbonentPetition.jsx/useStore';
import { useTariff } from 'hooks/useTariff';

interface AuditDHJTableProps {
  ariza: any;
  title?: string;
  maxHeight?: number | string;
}

interface IDhjRow {
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

export const AuditDHJTable: React.FC<AuditDHJTableProps> = ({
  ariza,
  title = "DHJ jadvalida qayta hisobning aks etishi",
  maxHeight = 440
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { tariffs } = useTariff();

  const [rawDhjRows, setRawDhjRows] = useState<IDhjRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(true); // default to showing recalculation preview
  const [onlyRecalculated, setOnlyRecalculated] = useState<boolean>(false);

  // 1. Fetch DHJ data for this resident
  useEffect(() => {
    if (!ariza) return;

    const residentId = ariza.abonentId;
    if (!residentId && !ariza.licshet) {
      setRawDhjRows([]);
      return;
    }

    setIsLoading(true);

    const fetchPromise = residentId
      ? api.get('/billing/get-abonent-dxj-by-id', {
          params: { residentId },
          headers: { 'hide-error': true }
        })
      : api.get(`/billing/get-abonent-data-by-licshet/${ariza.licshet}`).then((r) => {
          const abonent = r.data?.abonentData;
          if (abonent?.id) {
            return api.get('/billing/get-abonent-dxj-by-id', {
              params: { residentId: abonent.id },
              headers: { 'hide-error': true }
            });
          }
          throw new Error('Abonent topilmadi');
        });

    fetchPromise
      .then((res) => {
        const rows = res.data?.rows || [];
        const mapped: IDhjRow[] = rows.map((r: any, idx: number) => ({
          id: idx + 1,
          davr: r.period,
          saldo_n: Number(r.nSaldo || 0),
          nachis: Number(r.accrual || 0),
          saldo_k: Number(r.kSaldo || 0),
          akt: Number(r.actAmount || 0),
          yashovchilar_soni: Number(r.inhabitantCount || r.yashovchilar_soni || 0),
          allPaymentsSum: Number(r.allPaymentsSum || 0)
        }));
        setRawDhjRows(mapped);
      })
      .catch((err) => {
        console.warn('AuditDHJTable: DHJ yuklashda xatolik:', err);
        setRawDhjRows([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [ariza]);

  // 2. Extract recalculation periods from ariza
  const periods: any[] = useMemo(() => {
    if (Array.isArray(ariza?.recalculationPeriods) && ariza.recalculationPeriods.length > 0) {
      return ariza.recalculationPeriods;
    }
    // Agar bosqichlar mavjud bo'lsa
    if (Array.isArray(ariza?.bosqichlar) && ariza.bosqichlar.length > 0) {
      return ariza.bosqichlar.map((b: any, i: number) => {
        const [fm, fy] = b.from.split('.').map(Number);
        const [tm, ty] = b.to.split('.').map(Number);
        return {
          startDate: dayjs(new Date(fy, fm - 1, 1)),
          endDate: dayjs(new Date(ty, tm - 1, 1)),
          yashovchilar_soni: b.count,
          color: colors[i % colors.length]
        };
      });
    }
    return [];
  }, [ariza]);

  // Target inhabitant count after this application
  const verifiedNextInhabitant = useMemo(() => {
    if (ariza?.next_prescribed_cnt !== undefined && ariza?.next_prescribed_cnt !== null) {
      return Number(ariza.next_prescribed_cnt);
    }
    return undefined;
  }, [ariza?.next_prescribed_cnt]);

  // 3. Map each month to its recalculation period & delta
  const marksByMonth = useMemo(() => {
    const map = new Map<string, { color: string; count?: number; delta?: number; periodIndex: number }[]>();
    periods.forEach((period, index) => {
      const range = periodMonthRange(period);
      if (!range) return;
      for (let m = range.from; !m.isAfter(range.to, 'month'); m = m.add(1, 'month')) {
        const key = m.format('M.YYYY');
        const periodDelta =
          period.yashovchiDelta !== undefined
            ? Number(period.yashovchiDelta)
            : period.periodType === 'kreditor'
            ? -1
            : period.periodType === 'debitor'
            ? 1
            : -1;

        map.set(key, [
          ...(map.get(key) || []),
          {
            color: period.color || colors[index % colors.length] || '2196f3',
            count: period.yashovchilar_soni,
            delta: periodDelta,
            periodIndex: index + 1
          }
        ]);
      }
    });
    return map;
  }, [periods]);

  const monthMarks = (davr: string) => {
    const d = davrToMonth(davr);
    return (d && marksByMonth.get(d.format('M.YYYY'))) || [];
  };

  /**
   * Qayta hisob va AutoAdjust kalkulyatsiyasi
   */
  const previewFor = (row: IDhjRow) => {
    const marks = monthMarks(row.davr);
    const d = davrToMonth(row.davr);
    if (!d) return null;
    const oldCount = Number(row.yashovchilar_soni) || 0;

    const y = d.year();
    const m = d.month() + 1;
    const foundTariff = tariffs.find((t) => t.year === y && t.month === m);
    let rate = 4000;
    if (foundTariff) rate = foundTariff.hisoblandi || 4000;
    else if (y < 2021) rate = 2000;
    else if (y < 2023) rate = 2600;
    else if (y === 2023) rate = 3500;

    // 1. Agar rasmiy qayta hisob davri bo'lsa
    if (marks.length > 0) {
      if (ariza?.document_type === 'gps') {
        return { count: oldCount, oldCount, newNachis: 0, diff: Number(row.nachis) || 0, periodIndex: marks[0]?.periodIndex || 1, isAutoAdjust: false };
      }

      // Agar next_prescribed_cnt mavjud bo'lsa, xonadondagi haqiqiy kutilgan yangi son shu!
      let count = oldCount;
      if (verifiedNextInhabitant !== undefined) {
        count = verifiedNextInhabitant;
      } else {
        const delta = marks.reduce((acc, mark) => acc + (Number(mark.delta) || 0), 0);
        count = Math.max(0, oldCount + delta);
      }

      const newNachis = count * rate;
      const diff = (oldCount - count) * rate;

      return {
        count,
        oldCount,
        newNachis,
        diff,
        periodIndex: marks[0]?.periodIndex || 1,
        color: marks[0]?.color || '2196f3',
        isAutoAdjust: false
      };
    }

    // 2. Agar AutoAdjust davriga tushsa (ariza sanasi va akt kiritilgan sana oralig'idagi oylar)
    const arizaDate = ariza?.sana ? dayjs(ariza.sana).startOf('month') : null;
    const aktDate = ariza?.akt_date ? dayjs(ariza.akt_date).startOf('month') : dayjs().startOf('month');

    const isBetweenArizaAndAkt =
      arizaDate &&
      !d.isBefore(arizaDate, 'month') &&
      !d.isAfter(aktDate, 'month') &&
      verifiedNextInhabitant !== undefined &&
      oldCount > verifiedNextInhabitant;

    if (isBetweenArizaAndAkt) {
      const count = verifiedNextInhabitant;
      const newNachis = count * rate;
      const diff = (oldCount - count) * rate;

      return {
        count,
        oldCount,
        newNachis,
        diff,
        periodIndex: 0,
        color: 'f59e0b',
        isAutoAdjust: true
      };
    }

    return null;
  };

  // Filter rows according to user selection
  const displayedRows = useMemo(() => {
    let rows = rawDhjRows;
    if (onlyRecalculated) {
      rows = rows.filter((r) => previewFor(r) !== null);
    }

    const isActAlreadyEntered = Boolean(
      ariza?.akt_id ||
      ariza?.status === 'akt_kiritilgan' ||
      ariza?.status === 'tasdiqlangan'
    );
    const aktTotal = Math.abs(Number(ariza?.aktSummasi) || 0);

    return rows.map((r, i) => {
      const isLatestMonth = i === 0;

      if (isActAlreadyEntered && isLatestMonth && r.akt !== 0) {
        // Akt allaqachon Tozamakonda aks etgan - qo'shimcha qo'shmaymiz, aynan shu ariza akti ekanligini ko'rsatamiz
        return {
          ...r,
          isThisArizaAct: true,
          arizaActId: ariza?.akt_id
        };
      }

      if (showPreview && !isActAlreadyEntered && isLatestMonth && aktTotal > 0) {
        // Yangi kutilayotgan akt simulyatsiyasi (hali tizimga kiritilmagan bo'lsa)
        return {
          ...r,
          akt: -aktTotal,
          saldo_k: r.saldo_k - aktTotal,
          isPreviewNewAct: true
        };
      }

      return r;
    });
  }, [rawDhjRows, onlyRecalculated, showPreview, marksByMonth, ariza, verifiedNextInhabitant]);

  const affectedMonthsCount = useMemo(() => {
    return rawDhjRows.filter((r) => monthMarks(r.davr).length > 0).length;
  }, [rawDhjRows, marksByMonth]);

  const columns: GridColDef[] = [
    {
      field: 'davr',
      headerName: t('tableHeaders.period', 'Davr'),
      width: 110,
      renderCell: (params) => {
        const marks = monthMarks(params.row.davr);
        const hasRecalc = marks.length > 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 1 }}>
            {/* Davr rangi indikatori */}
            <Box
              sx={{
                width: 5,
                height: 24,
                borderRadius: 1,
                bgcolor: hasRecalc ? '#' + (marks[0]?.color || '2196f3') : 'transparent'
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: hasRecalc ? 800 : 500, fontFamily: 'monospace' }}>
              {params.row.davr}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'recalc_status',
      headerName: 'Qayta hisob',
      width: 160,
      renderCell: (params) => {
        const preview = previewFor(params.row);
        if (!preview) {
          return (
            <Typography variant="caption" color="text.disabled">
              —
            </Typography>
          );
        }
        if (preview.isAutoAdjust) {
          return (
            <Tooltip
              title={`AutoAdjust (Kechikkan oy): Ariza va akt oralig‘idagi oy (${preview.oldCount} → ${preview.newCount} kishi) · Qo‘shimcha tuzatish: -${fmt(preview.diff)} so'm`}
              arrow
            >
              <Chip
                label={`AutoAdjust (-${fmt(preview.diff)})`}
                size="small"
                color="warning"
                variant="filled"
                sx={{ height: 22, fontSize: '11px', fontWeight: 800 }}
              />
            </Tooltip>
          );
        }
        return (
          <Tooltip title={`Qayta hisob davri #${preview.periodIndex} (${preview.oldCount} → ${preview.newCount} kishi) · Tafovut: -${fmt(preview.diff)} so'm`} arrow>
            <Chip
              label={`#${preview.periodIndex}-davr (-${fmt(preview.diff)})`}
              size="small"
              sx={{
                height: 22,
                fontSize: '11px',
                fontWeight: 700,
                bgcolor: '#' + (preview.color || '2196f3') + '22',
                color: '#' + (preview.color || '2196f3'),
                border: '1px solid #' + (preview.color || '2196f3')
              }}
            />
          </Tooltip>
        );
      }
    },
    {
      field: 'yashovchilar_soni',
      headerName: t('tableHeaders.inhabitantCount', 'Yashovchi'),
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const preview = previewFor(params.row);
        if (!preview || preview.count === preview.oldCount) {
          return <span style={{ fontWeight: 600 }}>{params.row.yashovchilar_soni}</span>;
        }
        return (
          <Box component="span" sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>
            <Box component="span" sx={{ color: 'text.disabled', textDecoration: 'line-through', mr: 0.5 }}>
              {preview.oldCount}
            </Box>
            <CompareArrowsOutlined sx={{ fontSize: 13, verticalAlign: 'middle', color: 'text.secondary', mx: 0.2 }} />
            <Box component="b" sx={{ color: preview.count < preview.oldCount ? 'success.main' : 'error.main', ml: 0.5 }}>
              {preview.count}
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'nachis',
      headerName: t('tableHeaders.nachis', 'Hisoblandi'),
      type: 'number',
      flex: 1.1,
      minWidth: 110,
      renderCell: (params) => {
        const preview = previewFor(params.row);
        if (!preview) return <span>{fmt(params.row.nachis)} so'm</span>;
        return (
          <Tooltip
            arrow
            title={`${preview.oldCount} kishi o‘rniga ${preview.count} kishi · Farq: ${preview.diff > 0 ? '+' : ''}${fmt(preview.diff)} so'm`}
          >
            <Box sx={{ lineHeight: 1.2, textAlign: 'right' }}>
              <Box
                component="span"
                sx={{
                  fontWeight: 800,
                  color: preview.diff > 0 ? 'success.main' : preview.diff < 0 ? 'error.main' : 'text.primary'
                }}
              >
                {fmt(preview.newNachis)} so'm
              </Box>
              <Box component="span" sx={{ display: 'block', fontSize: '10px', color: 'text.disabled', textDecoration: 'line-through' }}>
                {fmt(params.row.nachis)} so'm
              </Box>
            </Box>
          </Tooltip>
        );
      }
    },
    {
      field: 'saldo_n',
      headerName: t('tableHeaders.nSaldo', 'Boshlang‘ich saldo'),
      type: 'number',
      flex: 1,
      minWidth: 95,
      valueFormatter: (v) => `${fmt(v)} so'm`
    },
    {
      field: 'allPaymentsSum',
      headerName: t('tableHeaders.income', 'Tushum'),
      type: 'number',
      flex: 0.9,
      minWidth: 90,
      valueFormatter: (v) => `${fmt(v)} so'm`
    },
    {
      field: 'akt',
      headerName: 'Akt (Dalolatnoma)',
      width: 175,
      renderCell: (params) => {
        const val = Number(params.row.akt) || 0;
        const isThisAct = params.row.isThisArizaAct;
        const isPreviewNew = params.row.isPreviewNewAct;

        if (isThisAct && val !== 0) {
          return (
            <Tooltip title={`Ushbu arizaning Tozamakondagi rasmiy akti (№${params.row.arizaActId || ariza?.akt_id || ''})`} arrow>
              <Chip
                size="small"
                label={`Akt #${params.row.arizaActId || ariza?.akt_id || ''}: ${fmt(Math.abs(val))} so'm`}
                color="primary"
                variant="filled"
                sx={{ fontWeight: 800, fontSize: '11px', height: 22 }}
              />
            </Tooltip>
          );
        }

        if (isPreviewNew) {
          return (
            <Tooltip title="Ushbu ariza bo‘yicha kutilayotgan akt simulyatsiyasi (hali Tozamakonga kiritilmagan)" arrow>
              <Chip
                size="small"
                label={`Kutilayotgan: ${fmt(Math.abs(val))} so'm`}
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 800, fontSize: '11px', height: 22, borderStyle: 'dashed' }}
              />
            </Tooltip>
          );
        }

        if (val !== 0) {
          return (
            <Tooltip title={`Tozamakonda mavjud boshqa akt: ${fmt(val)} so'm`} arrow>
              <Chip
                size="small"
                label={`Akt: ${fmt(val)} so'm`}
                color="default"
                variant="outlined"
                sx={{ fontSize: '11px', height: 20 }}
              />
            </Tooltip>
          );
        }

        return <span style={{ color: '#aaa' }}>0 so'm</span>;
      }
    },
    {
      field: 'saldo_k',
      headerName: t('tableHeaders.kSaldo', 'Yakuniy saldo'),
      type: 'number',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span
          style={{
            fontWeight: 800,
            color: Number(params.value) > 0 ? '#d32f2f' : '#2e7d32'
          }}
        >
          {fmt(params.value)} so'm
        </span>
      )
    }
  ];

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5
      }}
    >
      {/* Header bar with controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TableChartOutlined color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          {affectedMonthsCount > 0 && (
            <Chip
              label={`${affectedMonthsCount} ta oy qayta hisoblangan`}
              color="primary"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {/* Filter: Only Recalculated Months */}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={onlyRecalculated}
                onChange={(e) => setOnlyRecalculated(e.target.checked)}
              />
            }
            label={
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Faqat qayta hisob oylari
              </Typography>
            }
          />

          {/* Toggle Eye Button for Preview */}
          <Tooltip title={showPreview ? "Asl DHJ holatiga qaytish" : "Qayta hisob natijasi bilan ko‘rish"} arrow>
            <IconButton
              size="small"
              color={showPreview ? 'primary' : 'default'}
              onClick={() => setShowPreview(!showPreview)}
              sx={{
                border: '1px solid',
                borderColor: showPreview ? 'primary.main' : 'divider',
                bgcolor: showPreview ? 'primary.50' : 'background.paper'
              }}
            >
              {showPreview ? <IconEye size={18} /> : <IconEyeClosed size={18} />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Notice info */}
      <Typography variant="caption" color="text.secondary">
        Quyidagi jadvalda har bir oydagi rasmiy harakatlar, yashovchilar soni va qayta hisob kiritilgan oylar rangli belgilar bilan ajratib ko‘rsatilgan:
      </Typography>

      {/* Main Table Container */}
      <Box sx={{ height: maxHeight, width: '100%' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={32} />
          </Box>
        ) : rawDhjRows.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 3
            }}
          >
            <TableChartOutlined sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Ushbu abonent bo‘yicha DHJ ma’lumotlari topilmadi
            </Typography>
          </Box>
        ) : (
          <DataGrid
            columns={columns}
            rows={displayedRows}
            density="compact"
            hideFooter={displayedRows.length <= 15}
            initialState={{
              pagination: { paginationModel: { pageSize: 15 } }
            }}
            pageSizeOptions={[15, 30, 50, 100]}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.100',
                borderBottom: '1px solid',
                borderColor: 'divider',
                fontWeight: 700
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderColor: 'divider'
              }
            }}
          />
        )}
      </Box>
    </Card>
  );
};

export default AuditDHJTable;
