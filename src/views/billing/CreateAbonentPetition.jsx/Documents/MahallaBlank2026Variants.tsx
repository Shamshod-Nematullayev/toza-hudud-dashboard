import React from 'react';
import dayjs from 'dayjs';
import { ResolvedParticipant } from '../participantResolver';
import { oylar } from '../PrintSection';
import { B, BlankRow, cyr, MahallaBlank2026Page, ownerRow, vakilRow } from './MahallaDalolatnoma2026';

/**
 * Yangi (2026) mahalla blankasining odam soni, pasport viza va o'lim guvohnomasi variantlari.
 * Blanka bir xil; ariza turiga qarab faqat jadval qatorlari va izoh jumlasi o'zgaradi.
 */

type Vakil = { relation?: string; fullName?: string };

interface CommonProps {
  date: Date;
  ariza: any;
  abonentData: any;
  mahalla: any;
  vakil?: Vakil;
  asoslantiruvchi?: string;
  participants?: ResolvedParticipant[];
  showTable?: boolean;
}

const baseRows = (abonentData: any, vakil?: Vakil): BlankRow[] => {
  const rows = [ownerRow(abonentData)];
  const v = vakilRow(vakil);
  if (v && vakil?.fullName !== abonentData?.fullName) rows.push(v);
  return rows;
};

const toNum = (v: any): number | undefined => {
  const n = Number(v);
  return v === '' || v === null || v === undefined || !Number.isFinite(n) ? undefined : n;
};

const Asos = ({ text }: { text?: string }) => (text ? <> {cyr(text)}</> : null);

/** Davr chegaralari: MM.YYYY */
const monthOf = (d: any) => {
  if (!d) return '';
  const x = dayjs(d);
  return x.isValid() ? x.format('MM.YYYY') : '';
};

/** Viza / o'lim: qayta hisob davrlari (kalkulyatordagi davrlar) */
const periodsOf = (recalculationPeriods: any[] | undefined, ariza: any) =>
  ((recalculationPeriods?.length ? recalculationPeriods : ariza?.recalculationPeriods) || [])
    .map((p: any) => ({
      from: monthOf(p.startDate || p.from),
      to: monthOf(p.endDate || p.to),
      delta: Math.abs(Number(p.yashovchiDelta) || 0)
    }))
    .filter((p: any) => p.from);

const davr = (from: string, to?: string) => (to && to !== from ? `${from} ойидан ${to} ойигача` : `${from} ойи`);

export const OYLAR_KIRILL = [
  'Январ',
  'Феврал',
  'Март',
  'Апрел',
  'Май',
  'Июн',
  'Июл',
  'Август',
  'Сентябр',
  'Октябр',
  'Ноябр',
  'Декабр'
];

export interface IOdamSoniStage {
  label: string;
  count: number;
}

export function buildOdamSoniStages(params: {
  currentCnt?: number;
  nextCnt?: number;
  recalculationPeriods?: any[];
  bosqichlar?: { from: string; to: string; count: number; hozirgacha?: boolean }[];
  olderPeriod?: any;
}): IOdamSoniStage[] {
  const { currentCnt, nextCnt, recalculationPeriods, bosqichlar, olderPeriod } = params;

  if (bosqichlar && bosqichlar.length > 0) {
    return bosqichlar.map((b) => ({
      label: b.hozirgacha ? `${b.from} ойидан бошлаб бугунги кунгача` : davr(b.from, b.to),
      count: b.count
    }));
  }

  const periods = (recalculationPeriods || []).filter(
    (p: any) => p && (p.startDate || p.from) && (p.periodType === 'kreditor' || (p.yashovchiDelta && p.yashovchiDelta !== 0))
  );

  if (periods.length > 0 && currentCnt !== undefined) {
    const dateMap = new Map<string, { date: dayjs.Dayjs; delta: number }>();
    for (const p of periods) {
      const dt = dayjs(p.startDate || p.from);
      if (!dt.isValid()) continue;
      const key = dt.format('YYYY-MM-DD');
      const delta = Number(p.yashovchiDelta) || -1;
      const existing = dateMap.get(key);
      if (existing) {
        existing.delta += delta;
      } else {
        dateMap.set(key, { date: dt, delta });
      }
    }

    const sortedChanges = Array.from(dateMap.values()).sort((a, b) => a.date.valueOf() - b.date.valueOf());

    const formatPoint = (d: dayjs.Dayjs) => {
      const oy = OYLAR_KIRILL[d.month()];
      if (d.date() === 1) {
        return `${d.year()} йил ${oy} ойи`;
      }
      return `${d.year()} йил «${d.date()}» ${oy}`;
    };

    const lastEnd = periods.reduce<dayjs.Dayjs | null>((max, p) => {
      const d = dayjs(p.endDate || p.to);
      return d.isValid() && (!max || d.isAfter(max)) ? d : max;
    }, null);
    const isUntilToday = !lastEnd || !lastEnd.isValid() || !lastEnd.isBefore(dayjs().startOf('month'));
    const untilText = isUntilToday
      ? 'бугунги кунгача'
      : (lastEnd.date() === 1 ? `${lastEnd.year()} йил ${OYLAR_KIRILL[lastEnd.month()]} ойигача` : `${lastEnd.year()} йил «${lastEnd.date()}» ${OYLAR_KIRILL[lastEnd.month()]}гача`);

    if (sortedChanges.length > 1) {
      const stages: IOdamSoniStage[] = [];
      let runningCnt = currentCnt;

      for (let i = 0; i < sortedChanges.length; i++) {
        const change = sortedChanges[i];
        runningCnt += change.delta;
        if (i < sortedChanges.length - 1) {
          stages.push({
            label: `${formatPoint(change.date)}дан бошлаб`,
            count: Math.max(runningCnt, 0)
          });
        } else {
          stages.push({
            label: `${formatPoint(change.date)}дан бошлаб ${untilText}`,
            count: nextCnt !== undefined ? nextCnt : Math.max(runningCnt, 0)
          });
        }
      }
      return stages;
    } else if (sortedChanges.length === 1) {
      const change = sortedChanges[0];
      return [
        {
          label: `${formatPoint(change.date)}дан бошлаб ${untilText}`,
          count: nextCnt !== undefined ? nextCnt : Math.max(currentCnt + change.delta, 0)
        }
      ];
    }
  }

  const since = olderPeriod && dayjs(olderPeriod).isValid() ? dayjs(olderPeriod) : null;
  if (since) {
    const oy = OYLAR_KIRILL[since.month()];
    const label = since.date() === 1 ? `${since.year()} йил ${oy} ойидан бошлаб бугунги кунгача` : `${since.year()} йил «${since.date()}» ${oy}дан бошлаб бугунги кунгача`;
    return [
      {
        label,
        count: nextCnt ?? 0
      }
    ];
  }

  if (nextCnt !== undefined) {
    return [{ label: '', count: nextCnt }];
  }

  return [];
}

// ---------------- ODAM SONI ----------------
export function OdamSoniBlank2026({
  aniqlanganYashovchiSoni,
  olderPeriod,
  recalculationPeriods,
  ...props
}: CommonProps & { aniqlanganYashovchiSoni: number | string; olderPeriod?: any; recalculationPeriods?: any[] }) {
  const { ariza, abonentData, vakil, asoslantiruvchi } = props;
  const acc = abonentData?.accountNumber;
  const current = toNum(abonentData?.house?.inhabitantCnt ?? ariza?.current_prescribed_cnt);
  const next = toNum(aniqlanganYashovchiSoni ?? ariza?.next_prescribed_cnt);
  const bosqichlar: { from: string; to: string; count: number; hozirgacha?: boolean }[] = ariza?.bosqichlar?.length ? ariza.bosqichlar : [];

  const stages = buildOdamSoniStages({
    currentCnt: current,
    nextCnt: next,
    recalculationPeriods: recalculationPeriods || ariza?.recalculationPeriods,
    bosqichlar,
    olderPeriod
  });

  const izoh = (
    <>
      {current !== undefined && (
        <>
          Ягона электрон тизимда хонадонда <B>{current}</B> киши кўрсатилган.{' '}
        </>
      )}
      Ўрганиш натижасида{' '}
      {stages.length > 0 ? (
        <>
          {stages.map((st, i) => (
            <React.Fragment key={i}>
              {i > 0 && ', '}
              {st.label ? (
                <>
                  <B>{st.label}</B> <B>{st.count}</B> киши
                </>
              ) : (
                <B>{st.count} киши</B>
              )}
            </React.Fragment>
          ))}{' '}
          истиқомат қилиб келганлиги аниқланди.
        </>
      ) : (
        <><B>{next}</B> киши истиқомат қилиб келганлиги аниқланди.</>
      )}{' '}
      Юқоридагиларга асосан <B>{acc}</B> ҳисоб рақами бўйича яшовчилар сонини <B>{next}</B> кишига ўзгартириш ҳамда тўловларни қайта
      ҳисоб-китоб қилишни мақсадга мувофиқ деб ҳисоблаймиз.
      <Asos text={asoslantiruvchi} />
    </>
  );

  return (
    <MahallaBlank2026Page
      {...props}
      inhabitantCnt={next}
      rows={props.showTable ? baseRows(abonentData, vakil) : []}
      showTable={props.showTable}
      izoh={izoh}
    />
  );
}

// ---------------- PASPORT VIZA ----------------
export function VizaBlank2026({ recalculationPeriods, ...props }: CommonProps & { recalculationPeriods?: any[] }) {
  const { ariza, abonentData, vakil, asoslantiruvchi } = props;
  const acc = abonentData?.accountNumber;
  const current = toNum(abonentData?.house?.inhabitantCnt);
  const periods = periodsOf(recalculationPeriods, ariza);

  const izoh = (
    <>
      {current !== undefined && (
        <>
          Хонадонда <B>{current}</B> киши рўйхатга қўйилган.{' '}
        </>
      )}
      Далолатномага илова қилинган хорижга чиқиш паспорт нусхалари ҳамда кириш-чиқиш муҳрларига асосан хонадонда яшовчи шахсларнинг{' '}
      {periods.length > 0 && (
        <>
          {periods.map((p: any, i: number) => (
            <React.Fragment key={i}>
              {i > 0 && ', '}
              <B>{davr(p.from, p.to)}</B>
              {p.delta > 0 && (
                <>
                  {' '}
                  (<B>{p.delta}</B> киши)
                </>
              )}
            </React.Fragment>
          ))}{' '}
          даврда{' '}
        </>
      )}
      Ўзбекистон ҳудудидан ташқарида бўлганлиги аниқланди. Юқоридагиларга асосан <B>{acc}</B> ҳисоб рақами бўйича ушбу давр(лар) учун
      тўловларни қайта ҳисоб-китоб қилишни мақсадга мувофиқ деб ҳисоблаймиз.
      <Asos text={asoslantiruvchi} />
    </>
  );

  return (
    <MahallaBlank2026Page
      {...props}
      inhabitantCnt={current}
      rows={props.showTable ? baseRows(abonentData, vakil) : []}
      showTable={props.showTable}
      izoh={izoh}
    />
  );
}

// ---------------- O'LIM GUVOHNOMASI ----------------
export function DeathBlank2026({ recalculationPeriods, ...props }: CommonProps & { recalculationPeriods?: any[] }) {
  const { ariza, abonentData, vakil, asoslantiruvchi } = props;
  const acc = abonentData?.accountNumber;
  const current = toNum(abonentData?.house?.inhabitantCnt ?? ariza?.current_prescribed_cnt);
  const next = toNum(ariza?.next_prescribed_cnt);
  const periods = periodsOf(recalculationPeriods, ariza);
  const earliest = periods
    .map((p: any) => p.from)
    .sort((a: string, b: string) => {
      const [am, ay] = a.split('.').map(Number);
      const [bm, by] = b.split('.').map(Number);
      return ay - by || am - bm;
    })[0];

  const izoh = (
    <>
      {current !== undefined && (
        <>
          Хонадонда <B>{current}</B> киши рўйхатга қўйилган.{' '}
        </>
      )}
      Далолатномага илова қилинган ФҲДЁ органининг ўлим ҳақидаги далолатнома нусхасига асосан хонадонда яшовчи шахс
      {earliest && (
        <>
          {' '}
          <B>{earliest}</B> ойидан
        </>
      )}{' '}
      вафот этганлиги аниқланди. Юқоридагиларга асосан <B>{acc}</B> ҳисоб рақами бўйича яшовчилар сонини
      {next !== undefined && (
        <>
          {' '}
          <B>{next}</B> кишига
        </>
      )}{' '}
      камайтириш ва тўловларни қайта ҳисоб-китоб қилишни мақсадга мувофиқ деб ҳисоблаймиз.
      <Asos text={asoslantiruvchi} />
    </>
  );

  return (
    <MahallaBlank2026Page
      {...props}
      inhabitantCnt={next}
      rows={props.showTable ? baseRows(abonentData, vakil) : []}
      showTable={props.showTable}
      izoh={izoh}
    />
  );
}

// ---------------- GPS (TEGISHLI SIFATDAGI XIZMAT KO'RSATILMAGANLIGI) ----------------
export function GpsBlank2026({
  recalculationPeriods,
  muzlatiladi,
  ...props
}: CommonProps & { recalculationPeriods?: any[]; muzlatiladi?: boolean }) {
  const { ariza, abonentData, vakil, asoslantiruvchi } = props;
  const acc = abonentData?.accountNumber;
  const current = toNum(abonentData?.house?.inhabitantCnt);

  const periods =
    recalculationPeriods && recalculationPeriods.length > 0
      ? recalculationPeriods
      : ariza?.recalculationPeriods && ariza?.recalculationPeriods.length > 0
      ? ariza.recalculationPeriods
      : [];

  const period = periods[0];
  const startFmt = period?.startDate ? dayjs(period.startDate).format('DD.MM.YYYY') : '';
  const endFmt = period?.endDate ? dayjs(period.endDate).format('DD.MM.YYYY') : '';

  const izoh = (
    <>
      Ҳақиқатдан ҳам абонент хонадонига{' '}
      {startFmt && endFmt ? (
        <>
          <B>{startFmt}</B> санадан <B>{endFmt}</B> санасигача{' '}
        </>
      ) : periods.length > 0 ? (
        <>
          {periods.map((p: any, i: number) => {
            const f = dayjs(p.startDate || p.from).format('DD.MM.YYYY');
            const t = dayjs(p.endDate || p.to).format('DD.MM.YYYY');
            return (
              <React.Fragment key={i}>
                {i > 0 && ', '}
                <B>{f} — {t}</B>
              </React.Fragment>
            );
          })}{' '}
          даврида{' '}
        </>
      ) : null}
      йўлнинг яроқсизлиги сабабли тегишли сифатдаги хизмат кўрсатилмаганлиги аниқланди.{' '}
      {muzlatiladi && <>Ушбу абонентга бугунги кунда ҳам хизмат кўрсатиш имконияти мавжуд эмас. </>}
      Юқоридагиларга ва GPS маълумотларига мувофиқ, <B>{acc}</B> ҳисоб рақами бўйича ҳисобга олишнинг ягона электрон тизимида тегишли ўзгартиришлар киритиш ҳамда тўловларни қайта ҳисоб-китоб қилишни мақсадга мувофиқ деб ҳисоблаймиз.
      <Asos text={asoslantiruvchi} />
    </>
  );

  return (
    <MahallaBlank2026Page
      {...props}
      inhabitantCnt={current}
      rows={props.showTable ? baseRows(abonentData, vakil) : []}
      showTable={props.showTable}
      izoh={izoh}
    />
  );
}
