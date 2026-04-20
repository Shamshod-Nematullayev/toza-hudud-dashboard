import React from 'react';
import { oylar } from '../PrintSection';
import { IAriza } from 'types/models';
import { IMahalla } from '../useStore';
import { lotinga } from 'helpers/lotinKiril';
import { AbonentDetails } from 'types/billing';
import { QRSection } from '../DocumentComponents/QRSection';
import { ArizaHeading } from '../DocumentComponents/ArizaHeading';
import { ArizaTitle } from '../DocumentComponents/ArizaTitle';
import { ImzolashJoyi } from '../DocumentComponents/ImzolashJoyi';

interface VizaProps {
  ariza: IAriza;
  abonentData: AbonentDetails;
  date: Date;
  mahalla: IMahalla;
  vakil?: {
    relation: string;
    fullName: string;
  };
}

function Viza({ ariza, abonentData, date, mahalla, vakil }: VizaProps) {
  // Vakillik mantiqini aniqlash
  const isRelative = !!vakil?.fullName;
  const relationText = vakil?.relation ? vakil.relation.toLowerCase() : '';

  // Dinamik ariza matni
  const arizaMatni = isRelative
    ? `Shuni yozib ma’lum qilamanki, men fuqaro ${abonentData?.fullName}ning ${relationText} — ${vakil?.fullName} bo'laman. Mazkur xonadonga tegishli ${abonentData?.accountNumber} shaxsiy hisob raqami bo‘yicha onlayn bazaga ma‘lumotlar o‘z vaqtida taqdim etilmaganligi sababli pasport vizalarini taqdim qilyapman.`
    : `Shuni yozib ma’lum qilamanki, mening ${abonentData.accountNumber} hisob raqamim onlayn bazada ma‘lumotlar o‘z vaqtida taqdim etilmaganligi sababli pasport vizalari taqdim qilyapman.`;

  return (
    <>
      {/* 1-SAHIFA: ARIZA */}
      <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
        <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
        {/* ArizaHeading komponentiga vakil ob'ektini uzatamiz */}
        <ArizaHeading abonentData={abonentData} vakil={vakil} />
        <br />
        <ArizaTitle type="pasport viza" />
        <br />
        <p
          style={{
            fontWeight: 'bold',
            lineHeight: '40px',
            textIndent: '40px'
          }}
        >
          {arizaMatni} Ushbu pasport vizalari asosida xonadonimizda istiqomat qiluvchi shaxslarning O‘zbekistonda bo'lmagan davr(lar)ini
          qayta hisob-kitob qilib berishingizni so‘rayman.
        </p>
        <QRSection abonentData={abonentData} ariza={ariza} date={date} />
      </div>

      {/* 2-SAHIFA: DALOLATNOMA */}
      <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
        <p style={{ textAlign: 'center' }}>
          <b>Abonentlar bilan birga istiqomat qiluvchi shaxslar xorijga chiqib kelganligini aniqlash</b>
        </p>
        <p style={{ textAlign: 'center' }}>
          <b>DALOLATNOMASI</b>
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            lineHeight: '50px'
          }}
        >
          <div>
            "{date.getDate()}" {lotinga(oylar[date.getMonth()])} {date.getFullYear()} yil
          </div>
          <div>{mahalla?.company?.locationName}</div>
        </div>

        <p>
          <b>Quyidagi manzil bo‘yicha:</b>
        </p>
        <p>MFY nomi: {mahalla.data?.name && lotinga(mahalla?.data?.name)}</p>
        <p>
          Manzil: {abonentData.mahallaName} {abonentData.streetName}
        </p>
        <p>Shaxsiy hisob raqami: {abonentData?.accountNumber}</p>

        <p>
          <b>Abonent: {abonentData?.fullName}</b>
        </p>
        {isRelative && (
          <p>
            <b>
              Murojaatchi (Vakil): {vakil?.fullName} ({vakil?.relation})
            </b>
          </p>
        )}

        <p style={{ textIndent: '40px', lineHeight: '30px' }}>
          Abonent xonadonida jami {abonentData.house.inhabitantCnt} kishi ro'yxatga qo'yilgan. Mazkur dalolatnomaga ilova qilingan xorijga
          chiqish pasport nusxalari hamda kirish-chiqish muhrlariga asosan, xonadonda yashovchi shaxslarning O'zbekiston hududidan
          tashqarida bo'lgan davrlarini inobatga olgan holda, yagona elektron tizimda qayta hisob-kitob qilishni maqsadga muvofiq deb
          hisoblaymiz.
        </p>

        <ImzolashJoyi abonentData={{ ...abonentData, fullName: vakil?.fullName || '' }} mahalla={mahalla} documentType={'viza'} />
      </div>
    </>
  );
}

export default Viza;
