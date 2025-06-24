import { lotinga } from 'helpers/lotinKiril';
import React from 'react';
import fullNameToShortName from 'views/tools/fullNameToShortName';
import styled from 'styled-components';
import { ArizaHeading, ArizaTitle, ImzolashJoyi, oylar, QRSection } from '../PrintSection';

const StyledTable = styled.table`
  margin: auto;
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 10px;
    border: 1px solid #000;
    text-align: left;
  }
`;

function Dvaynik({
  date,
  mahalla,
  mahalla2,
  abonentData,
  abonentData2,
  documentType = 'odam_soni',
  ariza,
  company
}: {
  date: Date;
  abonentData: any;
  abonentData2: any;
  mahalla: any;
  mahalla2: any;
  documentType: string;
  ariza: any;
  company: any;
}) {
  return (
    <>
      <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
        <span style={{ top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
        <ArizaHeading mahalla={mahalla} abonentData={abonentData} />
        <ArizaTitle type="ikkilamchi kod" />
        <p
          style={{
            fontWeight: 'bold',
            lineHeight: '40px',
            textIndent: '40px'
          }}
        >
          Shuni yozib ma’lum qilamanki mening {abonentData2.accountNumber} ikkilamchi hisob raqamimni haqiqiy {abonentData.accountNumber}{' '}
          hisob raqamimga dalolatnoma asosida ikkilamchi hisob-raqamimda to‘lovlar mavjud bo‘lsa, asosiy hisob-raqamga ko‘chirib, ikkilamchi
          hisob-raqamimni o‘chirib berishingizni so‘rayman.
        </p>
        <QRSection abonentData={abonentData} ariza={ariza} date={date} />
      </div>
      <div className="page" style={{ fontSize: '16px', textAlign: 'justify' }}>
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
          <div>
            "{date.getDate()}" {lotinga(oylar[date.getMonth()])} {date.getFullYear()} yil
          </div>
          <div>{mahalla?.company?.locationName}</div>
        </div>
        <p
          style={{
            textAlign: 'justify',
            textIndent: '40px'
          }}
        >
          Biz quyidagi imzo chekuvchilar, Samarqand viloyati, {company?.locationName}, {lotinga(mahalla?.data?.name)} MFY raisi{' '}
          {fullNameToShortName(mahalla?.data?.mfy_rais_name)} , {company?.name} {company?.locationName} aholi nazoratchisi{' '}
          {fullNameToShortName(mahalla?.data?.biriktirilganNazoratchi?.inspector_name)}, Abonentlar bilan ishlash bo‘limi xodimi
          {' ' + fullNameToShortName(company?.billingAdminName)} mazkur dalolatnomani shu haqida tuzdik. MFY ro‘yxatini o‘rganish natijasida
          quyidagi abonent
        </p>
        <StyledTable border={1} style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Haqiqiy hisob raqam</th>
              <th>Abonent F. I. O.</th>
              <th>Ikkilamchi hisob raqam</th>
              <th>Abonent F. I. O.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{abonentData.accountNumber}</td>
              <td>{abonentData.fullName}</td>
              <td>{abonentData2.accountNumber}</td>
              <td>{abonentData2.fullName}</td>
            </tr>
          </tbody>
        </StyledTable>
        <p
          style={{
            textAlign: 'justify',
            textIndent: '40px'
          }}
        >
          Ushbu abonentlar ikkilamchi hisob raqam bo‘lganligi sababli yagona elektron tizimda ikkilamchi hisob rakamga tushgan pul
          mablag‘larini haqiqiy hisob raqamga o‘tkazib, ikkilamchi abonentlarni o‘chirishni maqsadga muvofiq deb hisoblaymiz.
        </p>
        <ImzolashJoyi documentType={documentType} abonentData={abonentData} mahalla={mahalla} mahalla2={mahalla2} gpsOperator={{}} />
      </div>
    </>
  );
}

export default Dvaynik;
