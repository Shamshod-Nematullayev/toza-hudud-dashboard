import React from 'react';
import ImzolashJoyiBlank from '../ImzolashJoyiBlank';

function GpsBlank() {
  return (
    <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
      <p style={{ textAlign: 'center' }}>
        <b>Tegishli sifatdagi xizmat ko‘rsatilmaganligi va uning oqibatida noreal qarzdorlik vujudga kelganligi to‘g‘risidagi</b>
      </p>
      <p style={{ textAlign: 'center' }}>
        <b>DALOLATNOMA</b>
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

      <p style={{ textIndent: '40px' }}>
        Haqiqatdan ham abonent xonadoniga ______ yil ______ oyidan ______ yil ______ oyi oxirigacha yo‘lning yaroqsizligi sababli tegishli
        sifatdagi xizmat ko‘rsatilmaganligi aniqlandi. Ushbu abonentga bugungi kunda ham xizmat ko‘rsatish imkoniyati mavjud emas.
      </p>

      <p style={{ textIndent: '40px' }}>
        Yuqoridagilarga va GPS ma’lumotlariga muvofiq, ______ yilning ______ oyida hisobga olishning yagona elektron tizimida mazkur abonent
        to‘g‘risidagi ma’lumotlarga tegishli o‘zgartirishlar kiritish hamda qayta hisob-kitob qilishni maqsadga muvofiq deb hisoblaymiz.
      </p>

      <ImzolashJoyiBlank />
    </div>
  );
}

export default GpsBlank;
