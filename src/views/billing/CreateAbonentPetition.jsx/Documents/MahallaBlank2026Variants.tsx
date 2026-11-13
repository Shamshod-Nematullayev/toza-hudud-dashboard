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

// ---------------- ODAM SONI ----------------
export function OdamSoniBlank2026({
  aniqlanganYashovchiSoni,
  olderPeriod,
  ...props
}: CommonProps & { aniqlanganYashovchiSoni: number | string; olderPeriod?: any }) {
  const { ariza, abonentData, vakil, asoslantiruvchi } = props;
  const acc = abonentData?.accountNumber;
  const current = toNum(abonentData?.house?.inhabitantCnt ?? ariza?.current_prescribed_cnt);
  const next = toNum(aniqlanganYashovchiSoni ?? ariza?.next_prescribed_cnt);
  const bosqichlar: { from: string; to: string; count: number; hozirgacha?: boolean }[] = ariza?.bosqichlar?.length ? ariza.bosqichlar : [];
  const since = olderPeriod && dayjs(olderPeriod).isValid() ? dayjs(olderPeriod) : null;

  const izoh = (
    <>
      {current !== undefined && (
        <>
          Ягона электрон тизимда хонадонда <B>{current}</B> киши кўрсатилган.{' '}
        </>
      )}
      Ўрганиш натижасида{' '}
      {bosqichlar.length > 0 ? (
        <>
          {bosqichlar.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && ', '}
              <B>{b.hozirgacha ? `${b.from} ойидан бошлаб` : davr(b.from, b.to)}</B> <B>{b.count}</B> киши
            </React.Fragment>
          ))}{' '}
          истиқомат қилиши аниқланди.
        </>
      ) : (
        <>
          {since && (
            <>
              <B>
                {since.year()} йил «{since.date()}» {cyr(oylar[since.month()])}
              </B>
              дан бошлаб{' '}
            </>
          )}
          <B>{next}</B> киши истиқомат қилиши аниқланди.
        </>
      )}{' '}
      Юқоридагиларга асосан <B>{acc}</B> ҳисоб рақами бўйича яшовчилар сонини <B>{next}</B> кишига ўзгартириш ҳамда тўловларни қайта
      ҳисоб-китоб қилишни мақсадга мувофиқ деб ҳисоблаймиз.
      <Asos text={asoslantiruvchi} />
    </>
  );

  return <MahallaBlank2026Page {...props} inhabitantCnt={next} rows={baseRows(abonentData, vakil)} izoh={izoh} />;
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

  return <MahallaBlank2026Page {...props} inhabitantCnt={current} rows={baseRows(abonentData, vakil)} izoh={izoh} />;
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

  return <MahallaBlank2026Page {...props} inhabitantCnt={next} rows={baseRows(abonentData, vakil)} izoh={izoh} />;
}
