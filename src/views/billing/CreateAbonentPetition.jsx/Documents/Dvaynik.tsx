import { lotinga } from 'helpers/lotinKiril';
import fullNameToShortName from 'views/tools/fullNameToShortName';
import styled from 'styled-components';
import React from 'react';
import { oylar } from '../PrintSection';
import { QRSection } from '../DocumentComponents/QRSection';
import { ArizaHeading } from '../DocumentComponents/ArizaHeading';
import { ArizaTitle } from '../DocumentComponents/ArizaTitle';
import { ImzoJoyiRow, ImzolashJoyi } from '../DocumentComponents/ImzolashJoyi';
import useCustomizationStore from 'store/customizationStore';

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
  nextPrescribedCnt,
  currentPrescribedCnt,
  vakil // Vakillik mantiqi uchun prop
}: {
  date: Date;
  abonentData: any;
  abonentData2: any;
  mahalla: any;
  mahalla2: any;
  documentType: string;
  ariza: any;
  nextPrescribedCnt: number;
  currentPrescribedCnt: number;
  vakil?: {
    relation: string;
    fullName: string;
  };
}) {
  const { customization, company } = useCustomizationStore();

  // Vakillik mantiqini aniqlash
  const isRelative = !!vakil?.fullName;
  const relationText = vakil?.relation ? vakil.relation.toLowerCase() : '';
  const currentApplicant = isRelative ? vakil?.fullName : abonentData?.fullName;

  // Dinamik ariza matni
  const renderArizaText = () => {
    const baseText = `ikkilamchi hisob raqamimni haqiqiy ${abonentData.accountNumber} hisob raqamimga dalolatnoma asosida ikkilamchi hisob-raqamimda to‘lovlar mavjud bo‘lsa, asosiy hisob-raqamga ko‘chirib, ikkilamchi hisob-raqamimni o‘chirib berishingizni so‘rayman.`;

    if (isRelative) {
      return `Shuni yozib ma’lum qilamanki, men fuqaro ${abonentData?.fullName}ning ${relationText} — ${vakil?.fullName} bo'laman. Mazkur xonadonga tegishli ${abonentData2.accountNumber} ${baseText}`;
    }
    return `Shuni yozib ma’lum qilamanki, mening ${abonentData2.accountNumber} ${baseText}`;
  };

  return (
    <>
      {/* 1-SAHIFA: ARIZA */}
      {customization.documentVariantOdamSoni !== 'dalolatnoma' && (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
          <ArizaHeading abonentData={abonentData} vakil={vakil} />
          <ArizaTitle type="ikkilamchi kod" />
          <br />
          <p
            style={{
              fontWeight: 'bold',
              lineHeight: '40px',
              textIndent: '40px'
            }}
          >
            {renderArizaText()}
          </p>
          <QRSection abonentData={{ ...abonentData, fullName: currentApplicant }} ariza={ariza} date={date} />
        </div>
      )}

      {/* 2-SAHIFA: DALOLATNOMA */}
      {customization.documentVariantOdamSoni !== 'ariza' && (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          {customization.documentVariantOdamSoni === 'dalolatnoma' && (
            <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
          )}
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
            Biz quyidagi imzo chekuvchilar, {company?.locationName}, {lotinga(mahalla?.data?.name)} MFY raisi{' '}
            {fullNameToShortName(mahalla?.data?.mfy_rais_name)} , {company?.name} {company?.locationName} aholi nazoratchisi{' '}
            {fullNameToShortName(mahalla?.data?.biriktirilganNazoratchi?.inspector_name)}, Abonentlar bilan ishlash bo‘limi xodimi
            {' ' + fullNameToShortName(company?.billingAdminName)} mazkur dalolatnomani shu haqida tuzdik. MFY ro‘yxatini o‘rganish
            natijasida quyidagi abonent:
          </p>
          <StyledTable>
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
            mablag‘larini haqiqiy hisob raqamga o‘tkazish,{' '}
            {nextPrescribedCnt !== currentPrescribedCnt && <b>yashovchilar sonini {nextPrescribedCnt} kishiga o‘zgartirish,</b>} yagona
            elektron tizimdan ikkilamchi abonentlarni o‘chirishni maqsadga muvofiq deb hisoblaymiz.
          </p>

          {/* IMZOLAR BO'LIMI */}
          <ImzolashJoyi
            mahalla={mahalla}
            abonentData={{ ...abonentData, fullName: currentApplicant }}
            mahalla2={mahalla2}
            documentType={documentType}
          />

          {customization.documentVariantOdamSoni === 'dalolatnoma' && (
            <div style={{ marginTop: '30px' }}>
              <QRSection ariza={ariza} date={date} />
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Dvaynik;
