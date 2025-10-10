import React from 'react';
import ImzolashJoyiBlank from '../ImzolashJoyiBlank';
import { Company } from '..';
import DateLocationHeader from './TimePlaceHeading';

function DeathBlank({ company }: { company: Company }) {
  return (
    <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
      <p style={{ textAlign: 'center' }}>
        <b>Abonentlar bilan birga istiqomat qiluvchi shaxs(lar) vafot etilganligini aniqlash</b>
      </p>
      <p style={{ textAlign: 'center' }}>
        <b>DALOLATNOMASI</b>
      </p>
      <DateLocationHeader company={company} />
      <p>
        <b>Quyidagi manzil bo‘yicha:</b>
      </p>
      <p>MFY nomi: ____________________________________________</p>
      <p>Shaxsiy hisob raqami: 105120____________</p>
      <p>
        <b>Abonent: ______________________________________________</b>
      </p>
      <p>
        Abonent xonadonida jami ______ kishi ro‘yxatga olingan. Mazkur dalolatnomaga o‘lim haqidagi FHDYO dalolatnoma(s)i nusxalari ilova
        qilingan. Shu xonadonda yashovchi bo‘lgan shaxs(lar) sonini ______ kishiga kamaytirish va qayta hisob-kitob qilish maqsadga muvofiq
        deb hisoblaymiz.
      </p>
      <ImzolashJoyiBlank company={company} />
    </div>
  );
}

export default DeathBlank;
