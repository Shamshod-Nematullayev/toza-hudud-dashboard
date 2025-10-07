import React from 'react';
import ImzolashJoyiBlank from '../ImzolashJoyiBlank';

function VizaBlank() {
  return (
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
        <div>Sana: “____” __________________ 20___ yil</div>
        <div>Hudud: _________________________________</div>
      </div>

      <p>
        <b>Quyidagi manzil bo‘yicha:</b>
      </p>
      <p>MFY nomi: ____________________________________________</p>
      <p>Manzil: ________________________________________________</p>
      <p>Shaxsiy hisob raqami: _________________________________</p>
      <p>
        <b>Abonent: ______________________________________________</b>
      </p>
      <p>
        Abonent xonadonida jami ______ kishi ro‘yxatga olingan. Shundan, mazkur dalolatnomaga xorijga chiqish pasport nusxalari ilova
        qilingan, shu xonadonda yashovchi bo‘lgan shaxsni O‘zbekistonda yashamagan davrlarini kirish-chiqish muhrlariga asosan qayta
        hisob-kitob qilish maqsadga muvofiq deb hisoblaymiz.
      </p>

      <ImzolashJoyiBlank />
    </div>
  );
}

export default VizaBlank;
