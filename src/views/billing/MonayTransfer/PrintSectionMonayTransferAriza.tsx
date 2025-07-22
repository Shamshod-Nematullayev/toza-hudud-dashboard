import { type MutableRefObject } from 'react';
import { IAriza } from 'types/models';
import { ArizaHeading, ArizaTitle, formatName, QRSection } from '../CreateAbonentPetition.jsx/PrintSection';
import { IAbonentData } from '../CreateAbonentPetition.jsx/useStore';

function PrintSectionMonayTransferAriza({
  printComponentRef,
  ariza,
  abonentDetails
}: {
  printComponentRef: MutableRefObject<HTMLDivElement>;
  ariza: IAriza | null;
  abonentDetails: IAbonentData;
}) {
  return (
    <div style={{ fontSize: '16px', textAlign: 'justify' }} ref={printComponentRef}>
      <span style={{ top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
      <ArizaHeading abonentData={abonentDetails} />
      <ArizaTitle type="Pul ko'chirish" />
      <p style={{ textIndent: '40px' }}>
        Men {abonentDetails.mahallaName}da yashovchi {formatName(abonentDetails.fullName)} qattiq maishiy chiqindilar to'lovi uchun
        yaratilgan {abonentDetails.accountNumber} hisob raqamimga elektron to'lovlar orqali o'tkazilgan
        {' ' + ariza?.aktSummasi?.toLocaleString()} so'm pulni quyidagi abonent{ariza.needMonayTransferActs.length > 1 ? 'lar' : ''}ning
        hisob raqamiga o'tkazib berishingizni so'rayman.
      </p>
      <table>
        <tbody>
          {ariza.needMonayTransferActs.map((act, i) => (
            <tr key={act.residentId}>
              <td style={{ width: 50 }}>{i + 1}.</td>
              <td style={{ width: 150 }}>{act.accountNumber}</td>
              <td style={{ width: 300 }}>{formatName(act.fullName)}</td>
              <td style={{ width: 150 }}>{act.amount.toLocaleString()} so'm</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <QRSection ariza={ariza} abonentData={abonentDetails} date={new Date()} />
      </div>
    </div>
  );
}

export default PrintSectionMonayTransferAriza;
