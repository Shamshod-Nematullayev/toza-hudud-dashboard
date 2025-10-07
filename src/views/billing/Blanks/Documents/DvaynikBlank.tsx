import React from 'react';
import ImzolashJoyiBlank from '../ImzolashJoyiBlank';

function DvaynikBlank() {
  return (
    <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
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

      <p style={{ textIndent: '40px' }}>
        Biz quyidagi imzo chekuvchilar, _________________________________ viloyati, _________________________________ tumani,
        __________________________ MFY raisi ____________________________, __________________________ aholi nazoratchisi
        ____________________________, Abonentlar bilan ishlash bo‘limi xodimi ____________________________ mazkur dalolatnomani shu haqida
        tuzdik. MFY ro‘yxatini o‘rganish natijasida quyidagi abonent:
      </p>

      <table style={{ borderCollapse: 'collapse', width: '100%', margin: '20px auto' }} border={1}>
        <thead>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #000' }}>Haqiqiy hisob raqam</th>
            <th style={{ padding: '10px', border: '1px solid #000' }}>Abonent F. I. O.</th>
            <th style={{ padding: '10px', border: '1px solid #000' }}>Ikkilamchi hisob raqam</th>
            <th style={{ padding: '10px', border: '1px solid #000' }}>Abonent F. I. O.</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px', border: '1px solid #000' }}>________________________</td>
            <td style={{ padding: '10px', border: '1px solid #000' }}>________________________</td>
            <td style={{ padding: '10px', border: '1px solid #000' }}>________________________</td>
            <td style={{ padding: '10px', border: '1px solid #000' }}>________________________</td>
          </tr>
        </tbody>
      </table>

      <p style={{ textIndent: '40px' }}>
        Ushbu abonent(lar) ikkilamchi hisob raqam bo‘lganligi sababli, yagona elektron tizimda ikkilamchi hisob raqamga tushgan pul
        mablag‘larini haqiqiy hisob raqamga o‘tkazib, ikkilamchi abonentlarni o‘chirishni maqsadga muvofiq deb hisoblaymiz.
      </p>

      <ImzolashJoyiBlank />
    </div>
  );
}

export default DvaynikBlank;
