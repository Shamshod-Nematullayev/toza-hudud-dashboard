import React from 'react';
import ImzolashJoyiBlank from '../ImzolashJoyiBlank';
import { Company } from '..';
import DateLocationHeader from './TimePlaceHeading';
import fullNameToShortName from 'views/tools/fullNameToShortName';

function DvaynikBlank({ company }: { company: Company }) {
  return (
    <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
      <p style={{ textAlign: 'center' }}>
        <b>DALOLATNOMA</b>
      </p>

      <DateLocationHeader company={company} />

      <p style={{ textIndent: '40px' }}>
        Biz quyidagi imzo chekuvchilar, Samarqand viloyati, {company.locationName}, __________________________ MFY raisi
        ____________________________, aholi nazoratchisi ____________________________, Abonentlar bilan ishlash bo‘limi xodimi
        {' ' + fullNameToShortName(company.billingAdminName)} mazkur dalolatnomani shu haqida tuzdik. MFY ro‘yxatini o‘rganish natijasida
        quyidagi abonent:
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

      <ImzolashJoyiBlank company={company} />
    </div>
  );
}

export default DvaynikBlank;
