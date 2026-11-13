import styled from 'styled-components';
import { lotinga } from 'helpers/lotinKiril';
import fullNameToShortName from 'views/tools/fullNameToShortName';
import useCustomizationStore from 'store/customizationStore';
import { formatName, oylar } from '../PrintSection';
import { QRSection } from '../DocumentComponents/QRSection';
import { ArizaHeading } from '../DocumentComponents/ArizaHeading';
import { ArizaTitle } from '../DocumentComponents/ArizaTitle';
import { ImzolashJoyi } from '../DocumentComponents/ImzolashJoyi';
import type { IKuchirish } from '../useStore';
import { formatParticipantsText } from '../participantResolver';

const StyledTable = styled.table`
  margin: auto;
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 6px 8px;
    border: 1px solid #000;
    font-size: 14px;
  }

  th {
    background-color: #f5f5f5;
    font-weight: bold;
    text-align: center;
  }
`;

const addressOf = (abonent: any, mahalla: any) =>
  [lotinga(mahalla?.data?.name || abonent?.mahallaName || ''), abonent?.streetName, abonent?.house?.homeNumber]
    .filter(Boolean)
    .join(', ');

/** Yashovchi soni ko'chirish: ariza (1-sahifa) va dalolatnoma (2-sahifa). Summalar hujjatga chiqmaydi */
export default function YashovchiKuchirish({
  date,
  ariza,
  abonentData,
  abonentData2,
  mahalla,
  mahalla2,
  vakil,
  asoslantiruvchi,
  participants
}: {
  date: Date;
  ariza: any;
  abonentData: any;
  abonentData2?: any;
  mahalla: any;
  mahalla2?: any;
  vakil?: { relation: string; fullName: string };
  asoslantiruvchi?: string;
  participants?: any[];
}) {
  const { customization, company, user } = useCustomizationStore();
  const k: IKuchirish | undefined = ariza?.kuchirish;
  if (!k) return <p style={{ color: 'red' }}>Arizada ko'chirish ma'lumotlari topilmadi</p>;

  const isRelative = !!vakil?.fullName;
  const applicant = isRelative ? vakil!.fullName : abonentData?.fullName;
  const fromAccount = ariza.licshet || abonentData?.accountNumber;
  const toAccount = k.toLicshet;
  const toName = abonentData2?.accountNumber === toAccount && abonentData2?.fullName ? abonentData2.fullName : k.toFio;
  const who = k.shaxslar ? `${k.shaxslar} (${k.soni} nafar)` : `${k.soni} nafar shaxs`;
  const sabab = (k.sabab || '').toLowerCase();
  const [oyM, oyY] = k.oy.split('.').map(Number);
  const oyText = `${oyY} yil ${lotinga(oylar[oyM - 1] || '').toLowerCase()}`;
  // Ko'chganlardan tashqari xonadondan chiqib ketgan (qabul qiluvchiga qo'shilmaydigan) kishilar
  const kamText = k.kamaytirish
    ? ` Shuningdek, xonadonda ro‘yxatda turgan yana ${k.kamaytirish} nafar shaxs ${(k.kamaytirishSabab || '').toLowerCase()} amalda istiqomat qilmaydi.`
    : '';
  const startedEarlier = new Date(oyY, oyM - 1, 1) < new Date(date.getFullYear(), date.getMonth(), 1);

  const arizaText = isRelative
    ? `Shuni yozib ma’lum qilamanki, men fuqaro ${abonentData?.fullName}ning ${vakil!.relation.toLowerCase()} — ${vakil!.fullName} bo‘laman. ${fromAccount}-sonli hisob raqamli xonadonda ro‘yxatda turgan ${who} ${sabab} ${oyText} oyidan boshlab ${toName} nomidagi ${toAccount}-sonli hisob raqamli xonadonga ko‘chib o‘tdi.${kamText} Shu sababli ${fromAccount}-sonli hisob raqamdagi yashovchilar sonini ${k.fromCurrentCnt} kishidan ${k.fromNextCnt} kishiga kamaytirib, ${toAccount}-sonli hisob raqamdagi yashovchilar sonini ${k.toCurrentCnt} kishidan ${k.toNextCnt} kishiga ko‘paytirib${startedEarlier ? ', ko‘chgan oydan buyon hisob-kitobni qayta ko‘rib' : ''} berishingizni so‘rayman.`
    : `Shuni yozib ma’lum qilamanki, mening ${fromAccount}-sonli hisob raqamli xonadonimda ro‘yxatda turgan ${who} ${sabab} ${oyText} oyidan boshlab ${toName} nomidagi ${toAccount}-sonli hisob raqamli xonadonga ko‘chib o‘tdi.${kamText} Shu sababli hisob raqamimdagi yashovchilar sonini ${k.fromCurrentCnt} kishidan ${k.fromNextCnt} kishiga kamaytirib, ${toAccount}-sonli hisob raqamdagi yashovchilar sonini ${k.toCurrentCnt} kishidan ${k.toNextCnt} kishiga ko‘paytirib${startedEarlier ? ', ko‘chgan oydan buyon hisob-kitobni qayta ko‘rib' : ''} berishingizni so‘rayman.`;

  const rows = [
    {
      title: 'Chiqib ketgan xonadon',
      account: fromAccount,
      name: abonentData?.fullName || ariza.fio,
      address: addressOf(abonentData, mahalla),
      before: k.fromCurrentCnt,
      after: k.fromNextCnt
    },
    {
      title: 'Qabul qilgan xonadon',
      account: toAccount,
      name: toName,
      address: abonentData2?.accountNumber === toAccount ? addressOf(abonentData2, mahalla2) : '',
      before: k.toCurrentCnt,
      after: k.toNextCnt
    }
  ];

  // Ishtirokchilar matni (agar mavjud bo'lsa dinamik, aks holda fallback)
  const activeParticipants = (participants || []).filter((p: any) => !p.isExcluded);
  const hasMahallaStaff = activeParticipants.some((p: any) => p.key === 'mahalla_raisi' || p.key === 'mahalla_yettiligi');

  const renderParticipantsIntro = () => {
    if (activeParticipants.length > 0) {
      const pText = formatParticipantsText(participants);
      const sourceText = hasMahallaStaff
        ? `Joyida o‘rganish va MFY ma’lumotlariga ko‘ra ${who} ${sabab} ${oyText} oyidan boshlab quyidagi xonadonlar o‘rtasida ko‘chib o‘tganligi aniqlandi:`
        : `Murojaat va taqdim etilgan ma’lumotlarni o‘rganish natijasida ${who} ${sabab} ${oyText} oyidan boshlab quyidagi xonadonlar o‘rtasida ko‘chib o‘tganligi aniqlandi:`;

      return `Biz quyidagi imzo chekuvchilar: ${pText}lar mazkur dalolatnomani shu haqida tuzdik. ${sourceText}`;
    }

    const isIchki = ariza?.actTypeKey === 'ichki' || customization.mfyRaisiIshtirok === false;
    if (isIchki) {
      const staffName = fullNameToShortName(ariza?.creatorName || user?.fullName || company?.billingAdminName);
      const managerName = fullNameToShortName(company?.managerName || company?.manager?.fullName);
      const parts = [
        managerName ? `${company?.name || ''} ${company?.locationName || ''} filial rahbari ${managerName}`.trim() : '',
        `Abonentlar bilan ishlash bo‘limi xodimi ${staffName}`,
        `Fuqaro ${formatName(applicant)}`
      ].filter(Boolean);

      return `Biz quyidagi imzo chekuvchilar: ${parts.join(', ')}lar mazkur dalolatnomani shu haqida tuzdik. Murojaat va taqdim etilgan ma’lumotlarni o‘rganish natijasida ${who} ${sabab} ${oyText} oyidan boshlab quyidagi xonadonlar o‘rtasida ko‘chib o‘tganligi aniqlandi:`;
    }

    return `Biz quyidagi imzo chekuvchilar, ${company?.locationName}, ${lotinga(mahalla?.data?.name)} MFY raisi ${fullNameToShortName(
      mahalla?.data?.mfy_rais_name
    )}, Abonentlar bilan ishlash bo‘limi xodimi ${fullNameToShortName(
      ariza?.creatorName || user?.fullName || company?.billingAdminName
    )} mazkur dalolatnomani shu haqida tuzdik. Joyida o‘rganish va MFY ma’lumotlariga ko‘ra ${who} ${sabab} ${oyText} oyidan boshlab quyidagi xonadonlar o‘rtasida ko‘chib o‘tganligi aniqlandi:`;
  };

  return (
    <>
      {/* 1-SAHIFA: ARIZA */}
      {customization.documentVariantOdamSoni !== 'dalolatnoma' && (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
          <ArizaHeading abonentData={abonentData} participants={participants} vakil={vakil} />
          <ArizaTitle type="yashovchi soni ko‘chirish" />
          <br />
          <p style={{ fontWeight: 'bold', lineHeight: '36px', textIndent: '40px' }}>{arizaText}</p>
          <QRSection abonentData={{ ...abonentData, fullName: applicant }} ariza={ariza} date={date} />
        </div>
      )}

      {/* 2-SAHIFA: DALOLATNOMA */}
      {customization.documentVariantOdamSoni !== 'ariza' && (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
          <p style={{ textAlign: 'center', fontSize: '18px', margin: '15px 0 0' }}>
            <b>DALOLATNOMA</b>
          </p>
          <p style={{ textAlign: 'center', margin: '0 0 10px' }}>
            <i>(yashovchi soni ko‘chirish)</i>
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', lineHeight: '40px', marginBottom: '10px' }}>
            <div>
              "{date.getDate()}" {lotinga(oylar[date.getMonth()])} {date.getFullYear()} yil
            </div>
            <div>{mahalla?.company?.locationName}</div>
          </div>
          <p style={{ textIndent: '40px', lineHeight: '28px', marginBottom: '15px', textAlign: 'justify' }}>
            {renderParticipantsIntro()}
          </p>

          <StyledTable>
            <thead>
              <tr>
                <th>Xonadon</th>
                <th>Hisob raqam</th>
                <th>Abonent F.I.Sh.</th>
                <th>Manzil</th>
                <th>Avvalgi soni</th>
                <th>Yangi soni</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.title}>
                  <td>{r.title}</td>
                  <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{r.account}</td>
                  <td>{r.name}</td>
                  <td>{r.address}</td>
                  <td style={{ textAlign: 'center' }}>{r.before}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{r.after}</td>
                </tr>
              ))}
            </tbody>
          </StyledTable>

          {!!k.kamaytirish && (
            <p style={{ textIndent: '40px', marginTop: '12px' }}>
              {k.soni} nafar shaxs {toAccount} hisob raqamiga ko‘chirilib, {fromAccount} hisob raqamida qolgan yana {k.kamaytirish} nafar
              shaxs {(k.kamaytirishSabab || '').toLowerCase()} yashovchilar sonidan chiqariladi (qabul qiluvchiga qo‘shilmaydi).
            </p>
          )}
          {asoslantiruvchi && <p style={{ textIndent: '40px', fontStyle: 'italic', marginTop: '12px' }}>{asoslantiruvchi}</p>}

          <p style={{ textIndent: '40px', lineHeight: '30px', marginTop: '15px', marginBottom: '20px' }}>
            Yuqoridagilarga asosan {oyText} oyidan boshlab {fromAccount} hisob raqamidagi yashovchilar sonini {k.fromNextCnt} kishiga,{' '}
            {toAccount} hisob raqamidagi yashovchilar sonini {k.toNextCnt} kishiga o‘zgartirish
            {startedEarlier ? ' va ko‘chgan oydan buyon ikkala hisob raqam bo‘yicha qayta hisob-kitob qilishni' : 'ni'} maqsadga muvofiq deb
            hisoblaymiz.
          </p>

          <ImzolashJoyi
            mahalla={mahalla}
            abonentData={{ ...abonentData, fullName: applicant }}
            mahalla2={mahalla2}
            documentType="yashovchi_kuchirish"
            ariza={ariza}
            participants={participants}
          />

          <div style={{ marginTop: '20px' }}>
            <QRSection ariza={ariza} date={date} />
          </div>
        </div>
      )}
    </>
  );
}
