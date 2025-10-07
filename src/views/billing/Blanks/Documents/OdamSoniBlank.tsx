import React from 'react';
import ImzolashJoyiBlank from '../ImzolashJoyiBlank';

function OdamSoniBlank() {
  return (
    <>
      {/* Variant 1 — yangi abonentlar yoki birga istiqomat qiluvchi shaxslar */}
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
        <p>Jami _______ (____________________) nafar shaxs ______ yil “_____” __________ oyidan buyon birga istiqomat qilishi aniqlandi.</p>
        <p>______________________________________________________________________________________________</p>
        <p>
          Yuqoridagilarga va asoslantiruvchi hujjatlarga muvofiq, ______ yilning ______ oyida hisobga olishning yagona elektron tizimida
          mazkur abonent to‘g‘risidagi ma’lumotlarga tegishli o‘zgartirishlar kiritish hamda to‘lovlarni qayta hisob-kitob qilishni maqsadga
          muvofiq deb hisoblaymiz.
        </p>
        <p>
          *) Asoslantiruvchi hujjatlar (doimiy yoki vaqtincha propiska qilinganligini tasdig‘i, FHDYOning tug‘ilganlik haqidagi yoki boshqa
          ma’lumotlar) mavjud bo‘lsa, ularning nusxalari ilova qilinadi.
        </p>

        <ImzolashJoyiBlank />
      </div>

      {/* Variant 2 — istiqomat qiluvchi shaxslar soni kamaygan yoki ko‘paygan */}
      {/* <div className="page" style={{ fontSize: '16px', textAlign: 'justify' }}>
        <p style={{ textAlign: 'center' }}>
          <b>Abonentlar bilan birga istiqomat qiluvchi shaxslar sonining kamayganligi yoki ko‘payganligini aniqlash</b>
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

        <p style={{ textIndent: '40px' }}>
          Biz quyidagi imzo chekuvchilar, __________________________ viloyat, _________________________ tumani, _________________________
          MFY dagi, _________________________ ko‘chasi, uy ______ kv ______ xonadonida istiqomat qiluvchi fuqaroning pasport ma’lumotlari
          seriya _________ PNFL ____________, xonadonning kadastr raqami ____________, tel raqami ____________.
        </p>

        <p style={{ textIndent: '40px' }}>
          F.I.Sh. ____________________________________________, __________________________ MFY raisi ____________________________,
          __________________________ aholi bo‘lim boshlig‘i ____________________________ mazkur dalolatnomani shu haqida tuzdik.
        </p>

        <p style={{ textIndent: '40px' }}>
          Fuqaro _________________________________________ ning xonadonida oila a’zolari soni yagona elektron tizimda ______ nafar
          ko‘rsatilgan. O‘rganish natijasida esa quyidagilar aniqlandi: ______ yil “_____” __________ oyidan boshlab ______ nafar oila
          a’zolari istiqomat qilishi aniqlandi.
        </p>

        <p style={{ textIndent: '40px' }}>
          Sababli, yagona elektron tizimda qayta hisob-kitob qilish maqsadga muvofiq deb hisoblaymiz. Abonentning shaxsiy hisob raqami:
          ____________________________
        </p>

        <br />
        <p>
          Abonent: ____________________________ <br />
          Nazoratchi: ____________________________ <br />
          Aholi bo‘limi boshlig‘i: ____________________________ <br />
          MFY raisi: ____________________________
        </p>
      </div> */}
    </>
  );
}

export default OdamSoniBlank;
