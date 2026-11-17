import React from 'react';
import { QRSection } from '../DocumentComponents/QRSection';
import { ArizaHeading } from '../DocumentComponents/ArizaHeading';
import { ArizaTitle } from '../DocumentComponents/ArizaTitle';
import useCustomizationStore from 'store/customizationStore';
import MahallaDalolatnoma2026 from './MahallaDalolatnoma2026';

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
  asoslantiruvchi,
  dublicateRelation,
  moneyTransferAmount,
  shouldBeMoneyTransfer,
  participants,
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
  asoslantiruvchi?: string;
  dublicateRelation?: string;
  moneyTransferAmount?: number | string;
  shouldBeMoneyTransfer?: boolean;
  participants?: any[];
  useMahalla2026Blank?: boolean;
}) {
  const { customization } = useCustomizationStore();

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

  // Dinamik ariza matni (1-sahifa: abonent murojaati)
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

  return (
    <>
      {/* 1-SAHIFA: ARIZA (Abonent murojaati) */}
      {customization.documentVariantOdamSoni !== 'dalolatnoma' && (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
          <ArizaHeading abonentData={abonentData} participants={participants} vakil={vakil} />
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

      {/* 2-SAHIFA: DALOLATNOMA (Yangi mahalla blankasi) */}
      {customization.documentVariantOdamSoni !== 'ariza' && (
        <MahallaDalolatnoma2026
          date={date}
          ariza={ariza}
          abonentData={abonentData}
          abonentData2={abonentData2}
          mahalla={mahalla}
          nextPrescribedCnt={nextPrescribedCnt}
          currentPrescribedCnt={currentPrescribedCnt}
          dublicateRelation={rel}
          transferAmount={transferAmt}
          isTransferEnabled={isTransferEnabled}
          asoslantiruvchi={asoslantiruvchi}
          participants={participants}
        />
      )}
    </>
  );
}

export default Dvaynik;
