import React from 'react';
import dayjs from 'dayjs';
import { QRCodeCanvas } from 'qrcode.react';
import { kirillga } from 'helpers/lotinKiril';
import fullNameToShortName from 'views/tools/fullNameToShortName';
import useCustomizationStore from 'store/customizationStore';
import { oylar } from '../PrintSection';
import { ResolvedParticipant } from '../participantResolver';

/** Yangi (2026) mahalla dalolatnoma blankasi uchun dalolatnoma turi kaliti (backend bilan bir xil) */
export const MAHALLA_2026_ACT_TYPE_KEY = 'mahalla_2026';

const LINE = '1px solid #000';

/** Blankadagi "______" joyi: qiymat bo'lsa tagiga chizilgan qalin matn, bo'lmasa bo'sh chiziq */
function Field({ value, minWidth = 90, bold = true }: { value?: React.ReactNode; minWidth?: number; bold?: boolean }) {
  const empty = value === undefined || value === null || value === '';
  return (
    <span
      style={{
        display: 'inline-block',
        minWidth,
        borderBottom: LINE,
        padding: '0 4px',
        lineHeight: 1.15,
        textAlign: 'center',
        fontWeight: bold ? 'bold' : 'normal'
      }}
    >
      {empty ? ' ' : value}
    </span>
  );
}

const formatSum = (n: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n).replace(/ | /g, ' ');

const formatDate = (d?: string) => {
  if (!d) return '';
  const parsed = dayjs(d);
  return parsed.isValid() ? parsed.format('DD.MM.YYYY') : d;
};

const cyr = (s?: string | null) => (s ? kirillga(String(s)) : '');
const cyrShort = (s?: string | null) => (s ? kirillga(fullNameToShortName(s)) : '');

/** "Kattaqo'rg'on tumani" kabi joy nomida tuman/shahar so'zi bo'lmasa qo'shib qo'yadi */
const withDistrictWord = (loc?: string) => {
  if (!loc) return '';
  const c = cyr(loc);
  return /туман|шаҳар|шахар/i.test(c) ? c : `${c} тумани`;
};

// Blankadagi imzo chekuvchilar tartibi va mahalla yettiligi rollari
const ROLES: { id: string; title: string; ids: string[] }[] = [
  { id: 'rais', title: 'МФЙ раиси', ids: ['mahalla_raisi', 'yettilik_mahalla_raisi'] },
  { id: 'hokim', title: 'Ҳоким ёрдамчиси', ids: ['yettilik_hokim_yordamchisi'] },
  { id: 'xotin', title: 'Хотин-қизлар фаоли', ids: ['yettilik_xotin_qizlar_faoli'] },
  { id: 'yoshlar', title: 'Ёшлар етакчиси', ids: ['yettilik_yoshlar_yetakchisi'] },
  { id: 'profilaktika', title: 'Профилактика инспектори', ids: ['yettilik_profilaktika_inspektori'] },
  { id: 'ijtimoiy', title: 'Ижтимоий ходим', ids: ['yettilik_ijtimoiy_xodim'] },
  { id: 'soliq', title: 'Солиқ инспектори', ids: ['yettilik_soliq_inspektori'] },
  { id: 'uy', title: 'Уй (кўча) бошқарувчиси', ids: [] },
  { id: 'korxona', title: 'ходими', ids: ['billing_staff'] }
];

interface Props {
  date: Date;
  ariza: any;
  abonentData: any;
  abonentData2: any;
  mahalla: any;
  nextPrescribedCnt: number;
  currentPrescribedCnt: number;
  dublicateRelation?: string;
  transferAmount: number;
  isTransferEnabled: boolean;
  asoslantiruvchi?: string;
  participants?: ResolvedParticipant[];
}

/**
 * Ikkilamchi hisob raqam bo'yicha mahalla dalolatnomasi — 2026-yilgi yangi blanka
 * (VMning 06.02.2019 yildagi 95-sonli qarori asosidagi shakl). Blanka matni kirillda.
 */
export default function MahallaDalolatnoma2026({
  date,
  ariza,
  abonentData,
  abonentData2,
  mahalla,
  nextPrescribedCnt,
  currentPrescribedCnt,
  dublicateRelation,
  transferAmount,
  isTransferEnabled,
  asoslantiruvchi,
  participants = []
}: Props) {
  const { company } = useCustomizationStore();
  const mahallaData = mahalla?.data || mahalla;
  const location = company?.locationName || mahalla?.company?.locationName;
  const companyName = company?.name || mahalla?.company?.name;

  const acc1 = abonentData?.accountNumber;
  const acc2 = abonentData2?.accountNumber;
  const name1 = cyr(abonentData?.fullName);
  const name2 = cyr(abonentData2?.fullName);
  const rel = cyr((dublicateRelation || '').toLowerCase());
  const sameName = !!abonentData?.fullName && abonentData?.fullName === abonentData2?.fullName;
  const inhabitantCnt = nextPrescribedCnt ?? abonentData?.house?.inhabitantCnt;

  // Ishtirokchilar: blankadagi rollarga joylash; qolganlari "... лар иштирокида" qatoriga
  const active = participants.filter((p) => !p.isExcluded);
  const usedIds = new Set<string>();
  const roleName = (ids: string[]) => {
    const p = active.find((x) => ids.includes(x.id));
    if (p) usedIds.add(p.id);
    return p?.name || '';
  };
  const roles = ROLES.map((r) => ({ ...r, name: roleName(r.ids) }));
  const korxonaTitle = `“${cyr(companyName) || 'корхона номи'}” ходими`;
  const extra = active.filter((p) => !usedIds.has(p.id));

  const day = date.getDate();
  const month = kirillga(oylar[date.getMonth()]);
  const year = date.getFullYear();

  // ---- Izoh: qarindoshlik va ko'chiriladigan summalar bilan avtomatik jumla ----
  const B = ({ children }: { children: React.ReactNode }) => <b>{children}</b>;
  const izoh = (
    <>
      Ушбу хонадонда{' '}
      {sameName ? (
        <>
          <B>{name1}</B> номига <B>{acc1}</B>-сонли асосий (тўлов) ҳисоб рақами ҳамда <B>{acc2}</B>-сонли иккиламчи ҳисоб рақами очилганлиги
          аниқланди.
        </>
      ) : (
        <>
          уй эгаси <B>{name1}</B> номидаги <B>{acc1}</B>-сонли асосий (тўлов) ҳисоб рақамидан ташқари,{' '}
          {rel ? (
            <>
              унинг <B>{rel}</B>{' '}
            </>
          ) : null}
          <B>{name2}</B> номига очилган <B>{acc2}</B>-сонли иккиламчи ҳисоб рақами мавжудлиги аниқланди.
        </>
      )}{' '}
      {isTransferEnabled && transferAmount > 0 ? (
        <>
          Иккиламчи <B>{acc2}</B> ҳисоб рақамига тўланган жами <B>{formatSum(transferAmount)} сўм</B> тўловларни асосий <B>{acc1}</B> ҳисоб
          рақамига кўчириш,{' '}
        </>
      ) : isTransferEnabled ? (
        <>
          Иккиламчи ҳисоб рақамига тўланган тўловлар мавжуд бўлса, уларни асосий <B>{acc1}</B> ҳисоб рақамига кўчириш,{' '}
        </>
      ) : (
        <>Иккиламчи ҳисоб рақамида тўловлар мавжуд бўлмаганлиги сабабли тўлов кўчирмасдан, </>
      )}
      {nextPrescribedCnt !== undefined && nextPrescribedCnt !== null && nextPrescribedCnt !== currentPrescribedCnt && (
        <>
          яшовчилар сонини <B>{currentPrescribedCnt}</B> кишидан <B>{nextPrescribedCnt}</B> кишига тўғрилаш,{' '}
        </>
      )}
      иккиламчи <B>{acc2}</B> ҳисоб рақамини ягона электрон биллинг тизимидан ўчиришни мақсадга мувофиқ деб ҳисоблаймиз.
      {asoslantiruvchi ? <> {cyr(asoslantiruvchi)}</> : null}
    </>
  );

  // ---- Jadval qatorlari ----
  type Row = { fio: string; birth: string; passport: string; relation: string; status: string };
  const rows: Row[] = [
    {
      fio: name1,
      birth: formatDate(abonentData?.citizen?.birthDate),
      passport: abonentData?.citizen?.passport || '',
      relation: 'Уй эгаси',
      status: 'Яшайди'
    }
  ];
  if (!sameName && abonentData2?.fullName) {
    rows.push({
      fio: name2,
      birth: formatDate(abonentData2?.citizen?.birthDate),
      passport: abonentData2?.citizen?.passport || '',
      relation: rel ? rel.charAt(0).toUpperCase() + rel.slice(1) : '',
      status: `Яшайди (иккиламчи ҳ/р ${acc2})`
    });
  }
  const totalRows = Math.min(Math.max(Number(inhabitantCnt) || 0, rows.length, 4), 8);
  while (rows.length < totalRows) rows.push({ fio: '', birth: '', passport: '', relation: '', status: '' });

  const cell: React.CSSProperties = { border: LINE, padding: '2px 4px', verticalAlign: 'middle', height: 22, textAlign: 'left' };
  const head: React.CSSProperties = { ...cell, background: '#f2f2f2', textAlign: 'center', fontWeight: 'normal', fontSize: 12 };

  return (
    <div
      className="page"
      style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '14px', lineHeight: 1.45, color: '#000', textAlign: 'justify' }}
    >
      {/* Sarlavha: hisob raqamlar va qaror */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 13 }}>
        <div style={{ lineHeight: 2 }}>
          <div>
            <Field value={acc1} minWidth={130} /> тўлов ҳисоб рақами
          </div>
          <div>
            <Field value={acc2} minWidth={130} /> иккиламчи ҳисоб рақами
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ border: LINE, padding: '2px 8px', textAlign: 'center', fontSize: 12, lineHeight: 1.3 }}>
            Ўз.Р ВМнинг 06.02.2019 йилдаги
            <br />
            95-сонли қарори асосида
          </div>
          {ariza?.document_number ? <div style={{ fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>№ {ariza.document_number}</div> : null}
        </div>
      </div>

      <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16, letterSpacing: 4, margin: '10px 0 6px' }}>Д А Л О Л А Т Н О М А</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: 8 }}>
        <span>
          <Field value={withDistrictWord(location)} minWidth={140} />
        </span>
        <span>
          «{day}» {month} {year} йил
        </span>
      </div>

      {/* Ishtirokchilar */}
      <p style={{ textIndent: 40, margin: '0 0 4px' }}>
        Бизлар қуйида имзо чекувчилар “<b>{cyr(mahallaData?.name)}</b>” МФЙ раиси <Field value={cyrShort(roles[0].name)} />,{' '}
        {roles.slice(1, 8).map((r) => (
          <React.Fragment key={r.id}>
            {r.title} <Field value={cyrShort(r.name)} />,{' '}
          </React.Fragment>
        ))}
        {korxonaTitle} <Field value={cyrShort(roles[8].name)} />
        {extra.length > 0 && (
          <>
            ,{' '}
            {extra.map((p, i) => (
              <React.Fragment key={p.id}>
                {cyr(p.label.replace(/:$/, ''))} <Field value={cyrShort(p.name)} />
                {i < extra.length - 1 ? ', ' : ''}
              </React.Fragment>
            ))}
          </>
        )}{' '}
        лар иштирокида туздик.
      </p>

      {/* Manzil */}
      <p style={{ textIndent: 40, margin: '0 0 8px' }}>
        <Field value={withDistrictWord(location)} minWidth={120} /> “<b>{cyr(mahallaData?.name || abonentData?.mahallaName)}</b>” МФЙ{' '}
        <Field value={cyr(abonentData?.streetName)} minWidth={110} /> қишлоқ (кўча){' '}
        <Field value={abonentData?.house?.homeNumber} minWidth={40} /> уйда бугунги кунда <Field value={inhabitantCnt} minWidth={30} /> киши
        яшайди. Уй кадастри № <Field value={abonentData?.house?.cadastralNumber} minWidth={150} /> ЖШИР{' '}
        <Field value={abonentData?.citizen?.pnfl} minWidth={140} /> <Field value={name1} minWidth={200} /> номида бўлиб қуйидагилар
        истиқомат қилади. <b>Электр энергия ҳисоб рақами</b> <Field value={abonentData?.electricityAccountNumber} minWidth={110} />
      </p>

      {/* Yashovchilar jadvali */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, lineHeight: 1.2 }}>
        <thead>
          <tr>
            <th style={{ ...head, width: '4%' }}>№</th>
            <th style={{ ...head, width: '24%' }}>Ф.И.Ш</th>
            <th style={{ ...head, width: '11%' }}>Туғилган вақти</th>
            <th style={{ ...head, width: '13%' }}>Паспорт маълумотлари</th>
            <th style={{ ...head, width: '12%' }}>Уй эгасига қариндош-лиги</th>
            <th style={{ ...head, width: '11%' }}>Қачондан яшаб келмоқда</th>
            <th style={{ ...head, width: '25%' }}>
              Ҳар бир шахс тўғрисида яшаётганлиги ёки яшамаётганлиги{' '}
              <i>(кўчиб кетган, уйни сотиб кетган, вафот этганлиги ва ҳакозалар кўрсатилиши шарт)</i>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ ...cell, textAlign: 'center' }}>{r.fio ? i + 1 : ''}</td>
              <td style={{ ...cell, fontWeight: 'bold' }}>{r.fio}</td>
              <td style={{ ...cell, textAlign: 'center' }}>{r.birth}</td>
              <td style={{ ...cell, textAlign: 'center' }}>{r.passport}</td>
              <td style={{ ...cell, textAlign: 'center', fontWeight: 'bold' }}>{r.relation}</td>
              <td style={cell}></td>
              <td style={cell}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Izoh */}
      <p style={{ margin: '8px 0 6px', textIndent: 0 }}>
        <span style={{ textDecoration: 'underline' }}>Изоҳ:</span> {izoh}
      </p>

      {/* Imzolar */}
      <p style={{ textAlign: 'center', margin: '6px 0 4px' }}>Юқоридагиларни тасдиқлаб имзо чекувчилар:</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24, rowGap: 6, fontSize: 13.5 }}>
        {[...roles.slice(0, 7), { ...roles[8], title: korxonaTitle }].map((r) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ whiteSpace: 'nowrap' }}>{r.title}:</span>
            <span style={{ flex: 1, borderBottom: LINE, textAlign: 'right', fontWeight: 'bold', paddingRight: 4, minHeight: 18 }}>
              {cyrShort(r.name)}
            </span>
          </div>
        ))}
        {extra.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ whiteSpace: 'nowrap' }}>{cyr(p.label)}</span>
            <span style={{ flex: 1, borderBottom: LINE, textAlign: 'right', fontWeight: 'bold', paddingRight: 4, minHeight: 18 }}>
              {cyrShort(p.name)}
            </span>
          </div>
        ))}
      </div>

      {/* Abonent imzosi va QR */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ borderBottom: LINE, fontWeight: 'bold', minHeight: 20, paddingLeft: 4 }}>
            {name1}
            {abonentData?.phone ? `, ${abonentData.phone}` : ''}
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, fontStyle: 'italic' }}>(Абонент Ф.И.Ш. имзоси ва телефон рақами)</div>
        </div>
        {ariza?._id && (
          <QRCodeCanvas
            value={`ariza_${ariza._id}_${ariza.document_number}`}
            size={96}
            bgColor="#ffffff"
            fgColor="#000000"
            level="Q"
            includeMargin={true}
          />
        )}
      </div>
    </div>
  );
}
