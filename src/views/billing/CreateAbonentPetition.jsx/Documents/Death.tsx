import React from 'react';
import { ArizaHeading, ArizaTitle, QRSection } from '../PrintSection';
import { IAriza } from 'types/models';
import { IAbonentData } from '../useStore';

function Death({ ariza, abonentData, date }: { ariza: IAriza; abonentData: IAbonentData; date: Date }) {
  return (
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
  );
}

export default Death;
