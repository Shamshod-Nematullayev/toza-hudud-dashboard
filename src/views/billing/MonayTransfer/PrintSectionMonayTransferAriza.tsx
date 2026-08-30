import { type MutableRefObject } from 'react';
import { IAriza } from 'types/models';
import { formatName } from '../CreateAbonentPetition.jsx/PrintSection';
import { AbonentDetails } from 'types/billing';
import { ArizaHeading } from '../CreateAbonentPetition.jsx/DocumentComponents/ArizaHeading';
import { ArizaTitle } from '../CreateAbonentPetition.jsx/DocumentComponents/ArizaTitle';
import { QRSection } from '../CreateAbonentPetition.jsx/DocumentComponents/QRSection';

function PrintSectionMonayTransferAriza({
  printComponentRef,
  ariza,
  abonentDetails,
  debitorDetails,
  transferReason = 'ortiqcha_tulov'
}: {
  printComponentRef: MutableRefObject<HTMLDivElement>;
  ariza: IAriza | null;
  abonentDetails: AbonentDetails;
  debitorDetails?: { accountNumber?: string; fullName?: string; mahallaName?: string };
  transferReason?: 'ortiqcha_tulov' | 'yanglish_tulov';
}) {
  const isYanglishTulov = (ariza?.transferReason || transferReason) === 'yanglish_tulov';
  const debitorAccount = debitorDetails?.accountNumber || ariza?.licshet || abonentDetails?.accountNumber;
  const debitorName = debitorDetails?.fullName || ariza?.fio || abonentDetails?.fullName;

  const creditors = ariza?.needMonayTransferActs || [];
  const isMultiCreditor = creditors.length > 1;

  // Target accounts text for the statement
  const targetAccountsText = isMultiCreditor
    ? `o'zimning tegishli (${creditors.map((c) => c.accountNumber).join(', ')})`
    : `o'zimning ${creditors[0]?.accountNumber || ''}`;

  return (
    <div style={{ fontSize: '16px', textAlign: 'justify', lineHeight: 1.6 }} ref={printComponentRef}>
      <span style={{ top: 0, left: 0, fontWeight: 'bold' }}>{ariza?.document_number}</span>
      <ArizaHeading abonentData={abonentDetails} />
      <ArizaTitle type={isYanglishTulov ? "Yanglishib to'langan mablag'ni ko'chirish" : "Pul ko'chirish"} />

      {isYanglishTulov ? (
        <p style={{ textIndent: '40px', marginTop: '16px', marginBottom: '16px' }}>
          Men {abonentDetails?.mahallaName || ''}da yashovchi fuqaro {formatName(abonentDetails?.fullName)}, qattiq maishiy chiqindilar
          xizmati to'lovi uchun {targetAccountsText} hisob raqami{isMultiCreditor ? 'lari' : ''}ga to'lov qilish jarayonida yanglishib
          (adashib) {debitorAccount} ({formatName(debitorName)}) hisob raqamiga to'lov qilib yuborganman.
          <br />
          <br />
          Ilova qilinayotgan to'lov kvitansiyasi (chek)ga asosan, yanglishib to'langan jami{' '}
          <b>{ariza?.aktSummasi?.toLocaleString()} so'm</b> pul mablag'ini quyidagi to'g'ri hisob raqam
          {isMultiCreditor ? 'lar' : ''}ga ko'chirib (o'tkazib) berishingizni so'rayman.
        </p>
      ) : (
        <p style={{ textIndent: '40px', marginTop: '16px', marginBottom: '16px' }}>
          Men {abonentDetails?.mahallaName || ''}da yashovchi fuqaro {formatName(abonentDetails?.fullName)}, qattiq maishiy chiqindilar to'lovi uchun
          ochilgan {debitorAccount} hisob raqamimga ortiqcha to'langan{' '}
          <b>{ariza?.aktSummasi?.toLocaleString()} so'm</b> pul mablag'ini quyidagi abonent
          {isMultiCreditor ? 'lar' : ''}ning hisob raqamiga o'tkazib berishingizni so'rayman.
        </p>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', marginBottom: '24px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000' }}>
            <th style={{ width: 40, textAlign: 'left', padding: '4px' }}>№</th>
            <th style={{ width: 140, textAlign: 'left', padding: '4px' }}>Hisob raqami</th>
            <th style={{ textAlign: 'left', padding: '4px' }}>Abonent F.I.O</th>
            <th style={{ width: 130, textAlign: 'right', padding: '4px' }}>Summa</th>
          </tr>
        </thead>
        <tbody>
          {creditors.map((act, i) => (
            <tr key={act.residentId || i} style={{ borderBottom: '1px dotted #ccc' }}>
              <td style={{ padding: '6px 4px' }}>{i + 1}.</td>
              <td style={{ padding: '6px 4px', fontWeight: 600 }}>{act.accountNumber}</td>
              <td style={{ padding: '6px 4px' }}>{formatName(act.fullName)}</td>
              <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}>{act.amount.toLocaleString()} so'm</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>{ariza && <QRSection ariza={ariza} abonentData={abonentDetails} date={new Date()} />}</div>
    </div>
  );
}

export default PrintSectionMonayTransferAriza;
