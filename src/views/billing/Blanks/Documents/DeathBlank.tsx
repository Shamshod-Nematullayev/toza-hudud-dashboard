import React from 'react';
import ImzolashJoyiBlank from '../ImzolashJoyiBlank';

function DeathBlank() {
  return (
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
        <div>Sana: “____” __________________ 20___ yil</div>
        <div>Hudud: _________________________________</div>
      </div>
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
      <ImzolashJoyiBlank />
    </div>
  );
}

export default DeathBlank;
