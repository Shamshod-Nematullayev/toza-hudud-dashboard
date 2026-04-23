import { lotinga } from 'helpers/lotinKiril';
import React from 'react';
import { oylar } from '../PrintSection';
import { QRSection } from '../DocumentComponents/QRSection';
import { ImzoJoyiRow, ImzolashJoyi } from '../DocumentComponents/ImzolashJoyi';
import { ArizaHeading } from '../DocumentComponents/ArizaHeading';
import { ArizaTitle } from '../DocumentComponents/ArizaTitle';
import useCustomizationStore from 'store/customizationStore';

function Gps({
  date,
  mahalla,
  abonentData,
  documentType = 'odam_soni',
  ariza,
  recalculationPeriods,
  muzlatiladi,
  photos,
  vakil // Vakil ma'lumotlari prop sifatida qo'shildi
}: {
  date: Date;
  abonentData: any;
  mahalla: any;
  documentType: string;
  ariza: any;
  recalculationPeriods: any[];
  muzlatiladi: boolean;
  photos: any[];
  vakil?: {
    relation: string;
    fullName: string;
  };
}) {
  const { customization } = useCustomizationStore();

  // Vakillik mantiqini aniqlash
  const isRelative = !!vakil?.fullName;
  const relationText = vakil?.relation ? vakil.relation.toLowerCase() : '';
  const currentApplicant = isRelative ? vakil?.fullName : abonentData?.fullName;

  // Dinamik ariza matni
  const renderArizaText = () => {
    if (isRelative) {
      return `Shuni yozib ma’lum qilamanki, men fuqaro ${abonentData?.fullName}ning ${relationText} — ${vakil?.fullName} bo'laman. Mazkur xonadonga tegishli ${abonentData?.accountNumber} shaxsiy hisob raqami onlayn bazaga noto‘g‘ri hisob-kitob qilingani sababli dalolatnoma taqdim qilyapman.`;
    }
    return `Shuni yozib ma’lum qilamanki, mening ${abonentData.accountNumber} hisob raqamim onlayn bazaga noto‘g‘ri hisob-kitob qilingani sababli dalolatnoma taqdim qilyapman.`;
  };

  return (
    <>
      {/* 1-SAHIFA: ARIZA */}
      {customization.documentVariantOdamSoni !== 'dalolatnoma' && (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
          <ArizaHeading abonentData={abonentData} vakil={vakil} />
          <br />
          <ArizaTitle type="xizmat ko'rsatilmagan" />
          <p
            style={{
              fontWeight: 'bold',
              lineHeight: '40px',
              textIndent: '40px'
            }}
          >
            {renderArizaText()} Ushbu dalolatnoma asosida qayta hisob-kitob qilib berishingizni so‘rayman.
          </p>
          <QRSection ariza={ariza} date={date} abonentData={{ ...abonentData, fullName: currentApplicant }} />
        </div>
      )}

      {/* 2-SAHIFA: DALOLATNOMA */}
      {customization.documentVariantOdamSoni !== 'ariza' && (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          {customization.documentVariantOdamSoni === 'dalolatnoma' && (
            <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
          )}
          <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
            Tegishli sifatdagi xizmat ko‘rsatilmaganligi va uning oqibatida noreal qarzdorlik vujudga kelganligi to‘g‘risidagi
            <br />
            DALOLATNOMA
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
            Manzil: {abonentData?.mahallaName} {abonentData.streetName}
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

          <p style={{ lineHeight: '30px' }}>
            Haqiqatdan ham abonent xonadoniga {new Date(recalculationPeriods[0]?.startDate).getFullYear()} yil{' '}
            {oylar[new Date(recalculationPeriods[0]?.startDate).getMonth()]} oyidan{' '}
            {new Date(recalculationPeriods[0]?.endDate).getFullYear()} yil {oylar[new Date(recalculationPeriods[0]?.endDate).getMonth()]}{' '}
            oyi oxirigacha yo‘lning yaroqsizligi sababli tegishli sifatdagi xizmat ko‘rsatilmaganligi aniqlandi.{' '}
            {muzlatiladi && <>Ushbu abonentga bugungi kunda ham xizmat ko‘rsatish imkoniyati mavjud emas.</>}
          </p>
          <p>
            Yuqoridagilarga va GPS ma’lumotlariga muvofiq, {date.getFullYear()} yilning {lotinga(oylar[date.getMonth()])} oyida hisobga
            olishning yagona elektron tizimida mazkur abonent to‘g‘risidagi ma’lumotlarga tegishli o‘zgartirishlar kiritish hamda qayta
            hisob-kitob qilishni maqsadga muvofiq deb hisoblaymiz.
          </p>

          {/* IMZOLAR BO'LIMI - ImzoJoyiRow orqali tartiblandi */}
          <ImzolashJoyi
            abonentData={{ ...abonentData, fullName: currentApplicant }}
            mahalla={mahalla}
            documentType={documentType}
            gpsOperator={mahalla?.company?.gpsOperator}
            mahalla2={{}}
          />

          {customization.documentVariantOdamSoni === 'dalolatnoma' && (
            <div style={{ marginTop: '20px' }}>
              <QRSection ariza={ariza} date={date} abonentData={{ ...abonentData, fullName: currentApplicant }} />
            </div>
          )}
        </div>
      )}

      {/* 3-SAHIFA: FOTOLAR */}
      {customization.documentVariantOdamSoni !== 'ariza' && photos && photos.length > 0 && (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          <h3>Ilova qilingan fotosuratlar:</h3>
          {photos?.map((photo, index) => <img key={index} src={photo} alt="" width="100%" style={{ marginBottom: '10px' }} />)}
        </div>
      )}
    </>
  );
}

export default Gps;
