import React from 'react';
import { IAriza } from 'types/models';
import { cancelContractReasons, CancelContractReason, IMahalla } from '../useStore';
import { AbonentDetails } from 'types/billing';
import { B, BlankRow, cyr, formatSum, MahallaBlank2026Page } from './MahallaDalolatnoma2026';
import { ResolvedParticipant } from '../participantResolver';
import dayjs from 'dayjs';

const formatDate = (d?: string) => {
  if (!d) return '';
  const parsed = dayjs(d);
  return parsed.isValid() ? parsed.format('DD.MM.YYYY') : d;
};

/**
 * Shartnomani bekor qilish dalolatnomasi: abonent amalda mavjud emas (mahallada yo'q, noto'g'ri shaxsga ochilgan,
 * takroriy va h.k.). Abonentning o'zi yo'qligi sababli ariza sahifasi yo'q — faqat bitta dalolatnoma (yangi blankada).
 */
function CancelContract({
  ariza,
  abonentData,
  date,
  mahalla,
  asoslantiruvchi,
  participants
}: {
  ariza: IAriza;
  abonentData: AbonentDetails;
  date: Date;
  mahalla: IMahalla;
  asoslantiruvchi?: string;
  participants?: ResolvedParticipant[];
}) {
  const b = ariza?.bekorQilish;
  const sabab = cancelContractReasons[b?.sabab as CancelContractReason] || cancelContractReasons.mahallada_mavjud_emas;
  const inhabitantCnt = b?.inhabitantCnt ?? ariza?.current_prescribed_cnt ?? abonentData?.house?.inhabitantCnt ?? 0;
  const kSaldo = Number(b?.kSaldo ?? abonentData?.balance?.kSaldo ?? 0);
  const saldoText = kSaldo > 0 ? `${formatSum(kSaldo)} сўм қарздорлик` : kSaldo < 0 ? `${formatSum(-kSaldo)} сўм ортиқча тўлов` : "0 сўм";
  const asosText = (b?.asos || asoslantiruvchi || '').trim();
  const cleanAsos = asosText ? cyr(asosText).replace(/\.+$/, '') + '.' : '';

  const rows: BlankRow[] = [
    {
      fio: cyr(abonentData?.fullName || ariza?.fio),
      birth: formatDate(abonentData?.citizen?.birthDate),
      passport: abonentData?.citizen?.passport || '',
      relation: 'Уй эгаси',
      since: '—',
      status: 'Ҳудудда яшамаслиги (аниқланмаганлиги) маълум бўлди'
    }
  ];

  const izoh = (
    <>
      Ўрганиш натижасида ушбу ҳисоб рақами бўйича абонент кўрсатилган манзилда ва маҳалла ҳудудида амалда мавжуд эмаслиги аниқланди.{' '}
      {cleanAsos ? (
        <>
          <B>Асос:</B> {cleanAsos}{' '}
        </>
      ) : null}
      Ҳозирги кунда ушбу ҳисоб рақамида <B>{inhabitantCnt}</B> нафар яшовчи рўйхатда турибди, қолдиқ: <B>{saldoText}</B>.
      Юқоридагиларга асосан абонент билан тузилган маиший чиқиндиларни олиб чиқиб кетиш хизмати шартномасини бекор қилиш,
      яшовчилар сони ва қолдиқни 0 га келтиришни мақсадга мувофиқ деб ҳисоблаймиз.
    </>
  );

  return (
    <MahallaBlank2026Page
      date={date}
      ariza={ariza}
      abonentData={abonentData}
      mahalla={mahalla}
      participants={participants}
      inhabitantCnt={0}
      rows={rows}
      izoh={izoh}
      isCancelContract={true}
    />
  );
}

export default CancelContract;
