import React from 'react';
import { ArizaHeading, ArizaTitle, ImzolashJoyi, oylar, QRSection } from '../PrintSection';
import { IAriza } from 'types/models';
import { IAbonentData, IMahalla } from '../useStore';
import { lotinga } from 'helpers/lotinKiril';

function Death({ ariza, abonentData, date, mahalla }: { ariza: IAriza; abonentData: IAbonentData; date: Date; mahalla: IMahalla }) {
  return (
    <>
      <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
        <span style={{ top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
        <ArizaHeading abonentData={abonentData} />
        <br />
        <ArizaTitle type="oʻlim guvohnomasi" />
        <p
          style={{
            fontWeight: 'bold',
            lineHeight: '40px',
            textIndent: '40px'
          }}
        >
          Shuni yozib ma’lum qilamanki mening {abonentData.accountNumber} hisob raqamim onlayn bazada ma‘lumotlar o‘z vaqtida taqdim
          e‘tilmaganligi sababli, noto‘g‘ri hisob-kitob qilinganligi uchun o‘lim guvohnoma taqdim qilyapman. Ushbu guvohnoma asosida qayta
          hisob-kitob qilib, yashovchi soniga o‘zgartirish kiritib berishingizni so‘rayman.
        </p>

        <QRSection ariza={ariza} date={date} abonentData={abonentData} />
      </div>
      <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
        <p style={{ textAlign: 'center' }}>
          <b>Abonentlar bilan birga istiqomat qiluvchi shaxs(lar) vafot etilganligini aniqlash</b>
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
          Abonent xonadonida jami {abonentData.house.inhabitantCnt} kishi ro'yxatga qo'yilgan. Shundan, mazkur dalolatnomaga o'lim haqidagi
          FHDYOning dalolatnoma(lar)ni nusxalari ilova qilingan, shu xonadonda yashovchi bo'lgan shaxsni yashovchilar sonini{' '}
          {ariza.next_prescribed_cnt} kishiga kamaytirish va qayta hisob-kitob qilish maqsadga muvofiq deb hisoblaymiz.
        </p>
        <ImzolashJoyi abonentData={abonentData} mahalla={mahalla} documentType={'viza'} />
      </div>
    </>
  );
}

export default Death;
