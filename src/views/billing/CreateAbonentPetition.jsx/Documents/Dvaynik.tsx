import { lotinga } from 'helpers/lotinKiril';
import fullNameToShortName from 'views/tools/fullNameToShortName';
import styled from 'styled-components';
import React from 'react';
import { oylar } from '../PrintSection';
import { QRSection } from '../DocumentComponents/QRSection';
import { ArizaHeading } from '../DocumentComponents/ArizaHeading';
import { ArizaTitle } from '../DocumentComponents/ArizaTitle';
import { ImzolashJoyi } from '../DocumentComponents/ImzolashJoyi';
import useCustomizationStore from 'store/customizationStore';

const StyledTable = styled.table`
  margin: auto;
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 8px 10px;
    border: 1px solid #000;
    text-align: left;
    font-size: 14px;
  }

  th {
    background-color: #f5f5f5;
    font-weight: bold;
    text-align: center;
  }
`;

function Dvaynik({
  date,
  mahalla,
  mahalla2,
  abonentData,
  abonentData2,
  documentType = 'dvaynik',
  ariza,
  nextPrescribedCnt,
  currentPrescribedCnt,
  vakil,
  dublicateRelation,
  moneyTransferAmount,
  shouldBeMoneyTransfer
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
  dublicateRelation?: string;
  moneyTransferAmount?: number | string;
  shouldBeMoneyTransfer?: boolean;
}) {
  const { customization, company } = useCustomizationStore();

  // Vakillik mantiqini aniqlash
  const isRelative = !!vakil?.fullName;
  const relationText = vakil?.relation ? vakil.relation.toLowerCase() : '';
  const currentApplicant = isRelative ? vakil?.fullName : abonentData?.fullName;

  // Dvoynikdagi qarindoshlik / aloqadorlik (ariza yoki prop orqali)
  const rel = dublicateRelation || ariza?.dublicateRelation || '';
  const transferAmt = moneyTransferAmount !== undefined ? Number(moneyTransferAmount) : (ariza?.moneyTransferAmount ? Number(ariza.moneyTransferAmount) : 0);
  const isTransferEnabled = shouldBeMoneyTransfer !== undefined ? shouldBeMoneyTransfer : (ariza?.shouldBeMoneyTransfer ?? true);

  // 1-Qoida: Ismlar har xil bo'lsa qarindoshlik
  const hasDifferentNames = abonentData?.fullName && abonentData2?.fullName && abonentData.fullName !== abonentData2.fullName;

  // Dinamik ariza matni (1-sahifa)
  const renderArizaText = () => {
    let moneyText = '';
    if (isTransferEnabled && transferAmt > 0) {
      moneyText = `ikkilamchi hisob raqamimga to‘langan jami ${transferAmt.toLocaleString()} so‘m to‘lovlarni asosiy ${abonentData.accountNumber} hisob raqamimga ko‘chirib, `;
    } else if (isTransferEnabled) {
      moneyText = `ikkilamchi hisob raqamimga to‘langan to‘lovlar mavjud bo‘lsa, asosiy hisob raqamimga ko‘chirib, `;
    }

    const relationClause = rel ? ` (o‘zaro ${rel.toLowerCase()})` : '';

    if (isRelative) {
      return `Shuni yozib ma’lum qilamanki, men fuqaro ${abonentData?.fullName}ning ${relationText} — ${vakil?.fullName} bo‘laman. Mazkur xonadonga tegishli ${abonentData2?.fullName}${relationClause} nomidagi ${abonentData2.accountNumber}-sonli ikkilamchi hisob raqamni haqiqiy ${abonentData.accountNumber}-sonli asosiy hisob raqamimga dalolatnoma asosida birlashtirib, ${moneyText}ikkilamchi hisob raqamni yagona elektron billing tizimidan o‘chirib berishingizni so‘rayman.`;
    }

    if (hasDifferentNames && rel) {
      return `Shuni yozib ma’lum qilamanki, biz fuqaro ${abonentData?.fullName} va ${abonentData2?.fullName} (${rel.toLowerCase()}) bitta xonadonda istiqomat qilamiz. Xonadonimizga tegishli ${abonentData2.accountNumber}-sonli ikkilamchi hisob raqamni haqiqiy ${abonentData.accountNumber}-sonli asosiy hisob raqamga dalolatnoma asosida birlashtirib, ${moneyText}ikkilamchi hisob raqamni yagona billing tizimidan o‘chirib berishingizni so‘rayman.`;
    }

    return `Shuni yozib ma’lum qilamanki, mening nomimdagi ${abonentData2.accountNumber}-sonli ikkilamchi hisob raqamimni haqiqiy ${abonentData.accountNumber}-sonli asosiy hisob raqamimga dalolatnoma asosida birlashtirib, ${moneyText}ikkilamchi hisob raqamimni yagona billing tizimidan o‘chirib berishingizni so‘rayman.`;
  };

  // Dinamik dalolatnoma xulosa matni (2-sahifa)
  const renderDalolatnomaConclusion = () => {
    let transferClause = '';
    if (isTransferEnabled && transferAmt > 0) {
      transferClause = `yagona elektron tizimda ikkilamchi (${abonentData2.accountNumber}) hisob raqamiga to‘langan jami ${transferAmt.toLocaleString()} so‘m miqdoridagi to‘lovlarni haqiqiy (${abonentData.accountNumber}) hisob raqamga o‘tkazish (ko‘chirish), `;
    } else if (isTransferEnabled) {
      transferClause = `yagona elektron tizimda ikkilamchi hisob raqamga tushgan to‘lovlarni haqiqiy hisob raqamga o‘tkazish, `;
    } else {
      transferClause = `ikkilamchi hisob raqamda to‘lovlar mavjud bo‘lmaganligi sababli to‘lov ko‘chirishsiz, `;
    }

    const inhabitantClause =
      nextPrescribedCnt !== currentPrescribedCnt ? `yashovchilar sonini ${nextPrescribedCnt} kishiga to‘g‘rilash, ` : '';

    return `Ushbu abonentlar bitta xonadonga tegishli ${rel ? `(o‘zaro ${rel.toLowerCase()}) ` : ''}ikkilamchi hisob raqam bo‘lganligi sababli, ${transferClause}${inhabitantClause}yagona elektron axborot tizimidan ikkilamchi (${abonentData2.accountNumber}) hisob raqamli abonentni butunlay o‘chirishni maqsadga muvofiq deb hisoblaymiz.`;
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
              lineHeight: '36px',
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
          <p style={{ textAlign: 'center', fontSize: '18px', margin: '15px 0' }}>
            <b>DALOLATNOMA</b>
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              lineHeight: '40px',
              marginBottom: '10px'
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
              textIndent: '40px',
              lineHeight: '28px',
              marginBottom: '15px'
            }}
          >
            Biz quyidagi imzo chekuvchilar, {company?.locationName}, {lotinga(mahalla?.data?.name)} MFY raisi{' '}
            {fullNameToShortName(mahalla?.data?.mfy_rais_name)}, {company?.name} {company?.locationName} aholi nazoratchisi{' '}
            {fullNameToShortName(mahalla?.data?.biriktirilganNazoratchi?.inspector_name)}, Abonentlar bilan ishlash bo‘limi xodimi
            {' ' + fullNameToShortName(company?.billingAdminName)} mazkur dalolatnomani shu haqida tuzdik. MFY ro‘yxatini o‘rganish
            natijasida quyidagi abonentlar bitta xonadonga tegishli ekanligi aniqlandi:
          </p>

          <StyledTable>
            <thead>
              <tr>
                <th>Haqiqiy hisob raqam</th>
                <th>Asosiy abonent F.I.Sh.</th>
                <th>Ikkilamchi hisob raqam</th>
                <th>Ikkilamchi abonent F.I.Sh.</th>
                {rel && <th>Aloqasi / Qarindoshlik</th>}
                {isTransferEnabled && transferAmt > 0 && <th>Ko‘chiriladigan to‘lovlar summasi</th>}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{abonentData.accountNumber}</td>
                <td>{abonentData.fullName}</td>
                <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{abonentData2.accountNumber}</td>
                <td>{abonentData2.fullName}</td>
                {rel && <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{rel}</td>}
                {isTransferEnabled && transferAmt > 0 && (
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{transferAmt.toLocaleString()} so‘m</td>
                )}
              </tr>
            </tbody>
          </StyledTable>

          <p
            style={{
              textAlign: 'justify',
              textIndent: '40px',
              lineHeight: '30px',
              marginTop: '15px',
              marginBottom: '20px'
            }}
          >
            {renderDalolatnomaConclusion()}
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
