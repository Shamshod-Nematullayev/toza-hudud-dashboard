import React from 'react';
import { oylar } from '../PrintSection';
import { IAriza } from 'types/models';
import { IMahalla } from '../useStore';
import { lotinga } from 'helpers/lotinKiril';
import { AbonentDetails } from 'types/billing';
import { QRSection } from '../DocumentComponents/QRSection';
import { ArizaHeading } from '../DocumentComponents/ArizaHeading';
import { ArizaTitle } from '../DocumentComponents/ArizaTitle';
import { ImzoJoyiRow, ImzolashJoyi } from '../DocumentComponents/ImzolashJoyi';
import useCustomizationStore from 'store/customizationStore';

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
  const { customization, company } = useCustomizationStore();

  // Vakillik mantiqini aniqlash
  const isRelative = !!vakil?.fullName;
  const relationText = vakil?.relation ? vakil.relation.toLowerCase() : '';
  const currentApplicant = isRelative ? vakil?.fullName : abonentData?.fullName;

  // Dinamik ariza matni
  const arizaMatni = isRelative
    ? `Shuni yozib ma’lum qilamanki, men fuqaro ${abonentData?.fullName}ning ${relationText} — ${vakil?.fullName} bo'laman. Mazkur xonadonga tegishli ${abonentData?.accountNumber} shaxsiy hisob raqami bo‘yicha onlayn bazaga ma‘lumotlar o‘z vaqtida taqdim etilmaganligi sababli pasport vizalarini taqdim qilyapman.`
    : `Shuni yozib ma’lum qilamanki, mening ${abonentData.accountNumber} hisob raqamim onlayn bazada ma‘lumotlar o‘z vaqtida taqdim etilmaganligi sababli pasport vizalari taqdim qilyapman.`;

  return (
    <>
      {/* 1-SAHIFA: ARIZA */}
      {customization.documentVariantOdamSoni !== 'dalolatnoma' && (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
          <ArizaHeading abonentData={abonentData} vakil={vakil} />
          <br />
          <ArizaTitle type="pasport viza" />
          <br />
          <p style={{ fontWeight: 'bold', lineHeight: '40px', textIndent: '40px' }}>
            {arizaMatni} Ushbu pasport vizalari asosida xonadonimizda istiqomat qiluvchi shaxslarning O‘zbekistonda bo'lmagan davr(lar)ini
            qayta hisob-kitob qilib berishingizni so‘rayman.
          </p>
          <QRSection abonentData={{ ...abonentData, fullName: currentApplicant }} ariza={ariza} date={date} />
        </div>
      )}

      {/* 2-SAHIFA: DALOLATNOMA */}
      {customization.documentVariantOdamSoni !== 'ariza' && (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
            Abonentlar bilan birga istiqomat qiluvchi shaxslar xorijga chiqib kelganligini aniqlash
            <br />
            DALOLATNOMASI
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', lineHeight: '50px' }}>
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
            Manzil: {abonentData.mahallaName} {abonentData.streetName} {abonentData.house.homeNumber}-uy
          </p>
          <p>
            Shaxsiy hisob raqami: <b>{abonentData?.accountNumber}</b>
          </p>

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

          {/* IMZOLAR BO'LIMI */}
          <ImzolashJoyi
            abonentData={{ ...abonentData, fullName: isRelative ? vakil?.fullName : abonentData?.fullName }}
            mahalla={mahalla}
            documentType={'viza'}
          />

          {/* Agar faqat dalolatnoma o'zi bo'lsa, QR kodni oxiriga qo'shamiz */}
          {customization.documentVariantOdamSoni === 'dalolatnoma' && (
            <div style={{ marginTop: '30px' }}>
              <QRSection ariza={ariza} date={date} />
              <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Viza;
