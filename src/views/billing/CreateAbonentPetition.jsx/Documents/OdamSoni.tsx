import { lotinga } from 'helpers/lotinKiril';
import { QRCodeCanvas } from 'qrcode.react';
import React from 'react';
import { ArizaHeading, ArizaTitle, ImzolashJoyi, oylar, raqamlar } from '../PrintSection';
import { Dayjs } from 'dayjs';
import { IAbonentData, IMahalla } from '../useStore';
import useCustomizationStore from 'store/customizationStore';
import fullNameToShortName from 'views/tools/fullNameToShortName';

function OdamSoni({
  date,
  mahalla,
  mahalla2,
  abonentData,
  aniqlanganYashovchiSoni,
  olderPeriod,
  asoslantiruvchi,
  documentType = 'odam_soni',
  ariza
}: {
  date: Date;
  abonentData: IAbonentData;
  aniqlanganYashovchiSoni: number;
  olderPeriod: Dayjs;
  asoslantiruvchi: string;
  mahalla: IMahalla;
  mahalla2: IMahalla;
  documentType: string;
  ariza: any;
}) {
  const { customization } = useCustomizationStore();
  return (
    <>
      <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
        <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
        <ArizaHeading abonentData={abonentData} mahalla={mahalla} />
        <br />
        <ArizaTitle type="odam soni" />
        <br />
        <p
          style={{
            fontWeight: 'bold',
            lineHeight: '40px',
            textIndent: '40px'
          }}
        >
          Shuni yozib ma’lum qilamanki mening {abonentData?.accountNumber} hisob raqamim onlayn bazaga noto‘g‘ri hisob-kitob qilingani
          sababli dalolatnoma taqdim qilyapman. Ushbu dalolatnomam asosida qayta hisob-kitob qilib berishingizni so‘rayman.
        </p>
        <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
          "{date.getDate()}" {oylar[date.getMonth()]} {date.getFullYear()} йил _______ {abonentData?.fullName}
        </p>
        {!ariza._id ? (
          ''
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <QRCodeCanvas
              value={`ariza_${ariza._id}_${ariza.document_number}`}
              size={150}
              bgColor={'#ffffff'}
              fgColor={'#000000'}
              level={'Q'}
              includeMargin={true}
            />
          </div>
        )}
      </div>

      {customization.documentVariantOdamSoni === '1' ? (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify' }}>
          <p style={{ textAlign: 'center' }}>
            <b>
              Abonentlar bo‘yicha o‘zgarishlar to‘g‘risidagi ma’lumotlarga kiritilmagan va ular haqida Sanitar tozalash markaziga taqdim
              etilmagan yangi abonentlar yoki birga istiqomat qiluvchi shaxslar sonini aniqlash
            </b>
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
          <p>
            Jami {aniqlanganYashovchiSoni} ({raqamlar[aniqlanganYashovchiSoni]}) nafar shaxs {olderPeriod.year()} yilning “
            {olderPeriod.date()}” {lotinga(oylar[olderPeriod.month()])} oyidan buyon birga istiqomat qilishi aniqlandi.
          </p>
          <p>{asoslantiruvchi}</p>
          <p>
            Yuqoridagilarga va asoslantiruvchi hujjatlarga muvofiq, {date.getFullYear()} yilning {lotinga(oylar[date.getMonth()])} oyida
            hisobga olishning yagona elektron tizimida mazkur abonent to‘g‘risidagi ma’lumotlarga tegishli o‘zgartirishlar kiritish hamda
            to‘lovlarni qayta hisob-kitob qilishni maqsadga muvofiq deb hisoblaymiz.
          </p>

          <p>
            *) asoslantiruvchi hujjatlar (doimiy yoki vaqtincha propiska qilinganligini tasdig‘i, FHDYOning tug‘ilganlikni qayd etish
            to‘g‘risidagi va boshqa ma’lumotlar) mavjud bo‘lsa ularning nusxalari ilova qilinadi.
          </p>
          <ImzolashJoyi abonentData={abonentData} mahalla={mahalla} mahalla2={mahalla2} documentType={documentType} gpsOperator={{}} />
        </div>
      ) : (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify' }}>
          <p style={{ textAlign: 'center' }}>
            <b>Abonentlar bilan birga istiqomat qiluvchi shaxslar sonini kamayganligi yoki ko'payganligi aniqlash</b>
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
          <p
            style={{
              textAlign: 'justify',
              textIndent: '40px'
            }}
          >
            Biz quyidagi imzo chekuvchilar, Samarqand viloyat {mahalla.company?.locationName}, {lotinga(mahalla?.data?.name)} MFY dagi,{' '}
            {abonentData.streetName} ko'chasi, uy {abonentData.house.homeNumber} raisi {fullNameToShortName(mahalla?.data?.mfy_rais_name)},{' '}
            {mahalla?.company?.name} {mahalla.company?.locationName} aholi nazoratchisi{' '}
            {fullNameToShortName(mahalla?.data?.biriktirilganNazoratchi?.inspector_name)}, Abonentlar bilan ishlash bo‘limi xodimi
            {' ' + fullNameToShortName(mahalla.company?.billingAdminName)} mazkur dalolatnomani shu haqida tuzdik. MFY ro‘yxatini o‘rganish
            natijasida quyidagi abonent
          </p>
        </div>
      )}
    </>
  );
}

export default OdamSoni;
