import { lotinga } from 'helpers/lotinKiril';
import { QRCodeCanvas } from 'qrcode.react';
import React from 'react';
import { ArizaHeading, ArizaTitle, IAbonentData, ImzolashJoyi, oylar, raqamlar } from '../PrintSection';
import { Dayjs } from 'dayjs';
import { IMahalla } from '../useStore';

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
  return (
    <>
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
    </>
  );
}

export default OdamSoni;
