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

/** Yangi blankada chiqadigan ariza turlari; qolganlari eski ko'rinishda qoladi */
export const MAHALLA_2026_DOCUMENT_TYPES = ['dvaynik', 'odam_soni', 'viza', 'death', 'cancelContract'];

const LINE = '1px solid #000';

/** Blankadagi "______" joyi: qiymat bo'lsa tagiga chizilgan qalin matn, bo'lmasa bo'sh chiziq */
function Field({ value, minWidth = 90, bold = true }: { value?: React.ReactNode; minWidth?: number; bold?: boolean }) {
  const empty = value === undefined || value === null || value === '';
  return (
    <span
      style={{
        display: 'inline-block',
        minWidth: empty ? minWidth : undefined,
        textIndent: 0,
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

export const formatSum = (n: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n).replace(/ | /g, ' ');

const formatDate = (d?: string) => {
  if (!d) return '';
  const parsed = dayjs(d);
  return parsed.isValid() ? parsed.format('DD.MM.YYYY') : d;
};

export const cyr = (s?: string | null) => (s ? kirillga(String(s)) : '');
const cyrShort = (s?: string | null) => (s ? kirillga(fullNameToShortName(s)) : '');

/** "Kattaqo'rg'on tumani" kabi joy nomida tuman/shahar so'zi bo'lmasa qo'shib qo'yadi */
const withDistrictWord = (loc?: string) => {
  if (!loc) return '';
  const c = cyr(loc);
  return /туман|шаҳар|шахар/i.test(c) ? c : `${c} тумани`;
};

// Blankadagi imzo chekuvchilar tartibi: faqat belgilangan 5 lavozim
export const getMahalla2026Roles = (isCancelContract?: boolean) => {
  if (isCancelContract) {
    // Mahallada mavjud emas: 1. Mahalla raisi, 2. Aholi nazoratchisi, 3. Profilaktika inspektori, 4. Yoshlar yetakchisi, 5. Korxona xodimi
    return [
      { id: 'rais', title: 'МФЙ раиси', ids: ['mahalla_raisi', 'yettilik_mahalla_raisi'] },
      { id: 'aholi_nazoratchisi', title: 'Аҳоли назоратчиси', ids: ['aholi_nazoratchisi'] },
      { id: 'profilaktika', title: 'Профилактика инспектори', ids: ['yettilik_profilaktika_inspektori', 'profilaktika_inspektori'] },
      { id: 'yoshlar', title: 'Ёшлар етакчиси', ids: ['yettilik_yoshlar_yetakchisi', 'yoshlar_yetakchisi'] },
      { id: 'korxona', title: 'ходими', ids: ['billing_staff'] }
    ];
  }
  // Boshqa mahalla dalolatnomalari: 1. Mahalla raisi, 2. Profilaktika inspektori, 3. Yoshlar yetakchisi, 4. Korxona xodimi (fuqaroning o'zi pastki alohida imzo blokida)
  return [
    { id: 'rais', title: 'МФЙ раиси', ids: ['mahalla_raisi', 'yettilik_mahalla_raisi'] },
    { id: 'profilaktika', title: 'Профилактика инспектори', ids: ['yettilik_profilaktika_inspektori', 'profilaktika_inspektori'] },
    { id: 'yoshlar', title: 'Ёшлар етакчиси', ids: ['yettilik_yoshlar_yetakchisi', 'yoshlar_yetakchisi'] },
    { id: 'korxona', title: 'ходими', ids: ['billing_staff'] }
  ];
};

export type BlankRow = { fio: string; birth?: string; passport?: string; relation?: string; since?: string; status?: string };

export const B = ({ children }: { children: React.ReactNode }) => <b>{children}</b>;

/** Abonent qatori (jadvalning birinchi qatori) */
export const ownerRow = (abonentData: any): BlankRow => ({
  fio: cyr(abonentData?.fullName),
  birth: formatDate(abonentData?.citizen?.birthDate),
  passport: abonentData?.citizen?.passport || '',
  relation: 'Абонент',
  since: '—',
  status: ''
});

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

/** Murojaat qilgan vakil (abonentning qarindoshi) qatori */
export const vakilRow = (vakil?: { relation?: string; fullName?: string }): BlankRow | null =>
  vakil?.relation && vakil?.fullName
    ? { fio: cyr(vakil.fullName), relation: capitalize(cyr(vakil.relation.toLowerCase())), since: '—', status: '' }
    : null;

interface PageProps {
  date: Date;
  ariza: any;
  abonentData: any;
  mahalla: any;
  participants?: ResolvedParticipant[];
  /** Faqat ikkilamchi hisob raqam dalolatnomasida */
  secondaryAccount?: string;
  /** "бугунги кунда ___ киши яшайди" */
  inhabitantCnt?: number | string;
  rows?: BlankRow[];
  izoh: React.ReactNode;
  /** Shartnomani bekor qilish (mahallada mavjud emas) dalolatnomasi */
  isCancelContract?: boolean;
  /** Jadvalni ko'rsatish yoki yashirish */
  showTable?: boolean;
}

/**
 * Mahalla dalolatnomasining 2026-yilgi yangi blankasi (VMning 06.02.2019 yildagi 95-sonli qarori
 * asosidagi shakl). Blanka matni kirillda; ariza turiga qarab faqat jadval va izoh o'zgaradi.
 */
export function MahallaBlank2026Page({
  date,
  ariza,
  abonentData,
  mahalla,
  participants = [],
  secondaryAccount,
  inhabitantCnt,
  rows = [],
  izoh,
  isCancelContract,
  showTable
}: PageProps) {
  const { company } = useCustomizationStore();
  const mahallaData = mahalla?.data || mahalla;
  const location = company?.locationName || mahalla?.company?.locationName;
  const companyName = company?.name || mahalla?.company?.name;

  const acc1 = abonentData?.accountNumber;
  const acc2 = secondaryAccount;
  const name1 = cyr(abonentData?.fullName);
  const hasTable = showTable !== false && Array.isArray(rows) && rows.length > 0;

  // Ishtirokchilar: blankadagi rollarga joylash; qolganlari "... лар иштирокида" qatoriga
  const active = participants.filter((p) => !p.isExcluded);
  const usedIds = new Set<string>();
  const roleName = (ids: string[]) => {
    const p = active.find((x) => ids.includes(x.id));
    if (p) usedIds.add(p.id);
    return p?.name || '';
  };
  const roles = getMahalla2026Roles(isCancelContract).map((r) => ({ ...r, name: roleName(r.ids) }));
  const korxonaTitle = `“${cyr(companyName) || 'корхона номи'}” ходими`;

  // Mahalla raisi va mas'ullar blankada har doim lavozim sifatida turadi
  const isExcludedRole = (ids: string[]) =>
    ids.length > 0 && ids.some((id) => participants.some((p) => p.id === id && p.isExcluded));

  const signers = roles
    .filter((r) => !isExcludedRole(r.ids))
    .map((r) => (r.id === 'korxona' ? { ...r, title: korxonaTitle } : r));

  const day = date.getDate();
  const month = kirillga(oylar[date.getMonth()]);
  const year = date.getFullYear();

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
          {acc2 ? (
            <div>
              <Field value={acc2} minWidth={130} /> иккиламчи ҳисоб рақами
            </div>
          ) : null}
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

      {/* Ishtirokchilar: Mahalla dalolatnomalarida belgilangan 5 kishi ishtirok etadi */}
      <p style={{ textIndent: 40, margin: '0 0 4px', textAlign: 'left' }}>
        Бизлар қуйида имзо чекувчилар “<b>{cyr(mahallaData?.name)}</b>” МФЙ{' '}
        {signers.map((r, i) => {
          const isMahalla = r.id !== 'korxona';
          return (
            <React.Fragment key={r.id}>
              {r.id === 'rais' ? 'раиси' : r.title}
              {!isMahalla && r.name ? <> <Field value={cyrShort(r.name)} /></> : null}
              {i < signers.length - 1 ? ', ' : ' '}
            </React.Fragment>
          );
        })}
        {!isCancelContract && name1 ? <>, фуқаро <Field value={name1} /></> : null} лар иштирокида туздик.
      </p>

      {/* Manzil va abonent ma'lumotlari */}
      {isCancelContract ? (
        <p style={{ textIndent: 40, margin: '0 0 8px', textAlign: 'left' }}>
          <Field value={withDistrictWord(location)} minWidth={120} /> “<b>{cyr(mahallaData?.name || abonentData?.mahallaName)}</b>” МФЙ{' '}
          <Field value={cyr(abonentData?.streetName)} minWidth={110} /> қишлоқ (кўча){' '}
          <Field value={abonentData?.house?.homeNumber} minWidth={40} /> уй манзили бўйича Уй кадастри №{' '}
          <Field value={abonentData?.house?.cadastralNumber} minWidth={150} />, абонент{' '}
          <Field value={name1} minWidth={200} /> (ЖШИР <Field value={abonentData?.citizen?.pnfl} minWidth={140} />) номидаги ҳисоб рақами бўйича
          ушбу абонент кўрсатилган манзилда ва маҳалла ҳудудида амалда мавжуд эмаслиги (аниқланмаганлиги) маълум бўлди.
        </p>
      ) : (
        <p style={{ textIndent: 40, margin: '0 0 8px', textAlign: 'left' }}>
          <Field value={withDistrictWord(location)} minWidth={120} /> “<b>{cyr(mahallaData?.name || abonentData?.mahallaName)}</b>” МФЙ{' '}
          <Field value={cyr(abonentData?.streetName)} minWidth={110} /> қишлоқ (кўча){' '}
          <Field value={abonentData?.house?.homeNumber} minWidth={40} /> уйда бугунги кунда <Field value={inhabitantCnt} minWidth={30} /> киши
          яшайди. Уй кадастри № <Field value={abonentData?.house?.cadastralNumber} minWidth={150} />, абонент{' '}
          <Field value={name1} minWidth={200} /> (ЖШИР <Field value={abonentData?.citizen?.pnfl} minWidth={140} />).{' '}
          <b>Электр энергия ҳисоб рақами</b> <Field value={abonentData?.electricityAccountNumber} minWidth={110} />.
          {hasTable ? ' Қуйидагилар рўйхатда кўрсатилган:' : ''}
        </p>
      )}

      {/* Yashovchilar jadvali (faqat zarur hollarda ko'rsatiladi) */}
      {hasTable && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, lineHeight: 1.2 }}>
          <thead>
            <tr>
              <th style={{ ...head, width: '4%' }}>№</th>
              <th style={{ ...head, width: '24%' }}>Ф.И.Ш</th>
              <th style={{ ...head, width: '11%' }}>Туғилган вақти</th>
              <th style={{ ...head, width: '13%' }}>Паспорт маълумотлари</th>
              <th style={{ ...head, width: '12%' }}>Қариндош-лиги</th>
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
                <td style={{ ...cell, textAlign: 'center' }}>{i + 1}</td>
                <td style={{ ...cell, fontWeight: 'bold' }}>{r.fio}</td>
                <td style={{ ...cell, textAlign: 'center' }}>{r.birth}</td>
                <td style={{ ...cell, textAlign: 'center' }}>{r.passport}</td>
                <td style={{ ...cell, textAlign: 'center', fontWeight: 'bold' }}>{r.relation}</td>
                <td style={{ ...cell, textAlign: 'center' }}>{r.since}</td>
                <td style={{ ...cell, fontSize: 11 }}>{r.status || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Izoh */}
      <p style={{ margin: '8px 0 6px', textIndent: 0 }}>
        <span style={{ textDecoration: 'underline' }}>Изоҳ:</span> {izoh}
      </p>

      {/* Imzolar */}
      <p style={{ textAlign: 'center', margin: '6px 0 4px' }}>Юқоридагиларни тасдиқлаб имзо чекувчилар:</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24, rowGap: 6, fontSize: 13.5 }}>
        {signers.map((r) => {
          const isMahalla = r.id !== 'korxona';
          return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <span style={{ whiteSpace: 'nowrap', paddingTop: 2 }}>{r.title}:</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', borderBottom: LINE, minHeight: 18 }} />
                {!isMahalla && r.name ? (
                  <span style={{ fontSize: 11, fontStyle: 'italic', fontWeight: 'bold', minHeight: 14, marginTop: 1 }}>
                    ({cyrShort(r.name)})
                  </span>
                ) : r.name ? (
                  <span style={{ fontSize: 11, fontStyle: 'italic', minHeight: 14, marginTop: 1 }}>
                    ({cyrShort(r.name)})
                  </span>
                ) : (
                  <span style={{ fontSize: 11, minHeight: 14 }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Abonent imzosi va QR */}
      {!isCancelContract ? (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: 14 }}>
          <div style={{ flex: 1 }}>
            {/* Imzo chap tomonda, F.I.Sh. va telefon o'ngda — imzo QR kodga tegmasligi uchun */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, borderBottom: LINE, minHeight: 34 }}>
              <span style={{ flex: 1, fontSize: 12, color: '#555', paddingLeft: 4 }}>Имзо:</span>
              <span style={{ fontWeight: 'bold', textAlign: 'right', paddingRight: 4 }}>
                {name1}
                {abonentData?.phone ? `, ${abonentData.phone}` : ''}
              </span>
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, fontStyle: 'italic' }}>(Абонент (фуқаро) Ф.И.Ш. имзоси ва телефон рақами)</div>
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
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
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
      )}
    </div>
  );
}

interface DvaynikProps {
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
  showTable?: boolean;
}

/** Ikkilamchi hisob raqam (dvaynik) dalolatnomasi — yangi blankada */
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
  participants = [],
  showTable = false
}: DvaynikProps) {
  const acc1 = abonentData?.accountNumber;
  const acc2 = abonentData2?.accountNumber;
  const name1 = cyr(abonentData?.fullName);
  const name2 = cyr(abonentData2?.fullName);
  const rel = cyr((dublicateRelation || '').toLowerCase());
  const sameName = !!abonentData?.fullName && abonentData?.fullName === abonentData2?.fullName;
  const inhabitantCnt = nextPrescribedCnt ?? abonentData?.house?.inhabitantCnt;

  // ---- Izoh: qarindoshlik va ko'chiriladigan summalar bilan avtomatik jumla ----
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
          <B>{name1}</B> номидаги <B>{acc1}</B>-сонли асосий (тўлов) ҳисоб рақамидан ташқари,{' '}
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
  const rows: BlankRow[] = showTable ? [ownerRow(abonentData)] : [];
  if (showTable && !sameName && abonentData2?.fullName) {
    rows.push({
      fio: name2,
      birth: formatDate(abonentData2?.citizen?.birthDate),
      passport: abonentData2?.citizen?.passport || '',
      relation: rel ? rel.charAt(0).toUpperCase() + rel.slice(1) : '',
      status: ''
    });
  }

  return (
    <MahallaBlank2026Page
      date={date}
      ariza={ariza}
      abonentData={abonentData}
      mahalla={mahalla}
      participants={participants}
      secondaryAccount={acc2}
      inhabitantCnt={inhabitantCnt}
      rows={rows}
      izoh={izoh}
      showTable={showTable}
    />
  );
}
