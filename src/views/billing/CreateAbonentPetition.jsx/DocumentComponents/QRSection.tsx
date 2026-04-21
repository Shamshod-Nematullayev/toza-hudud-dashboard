import { QRCodeCanvas } from 'qrcode.react';
import { formatName, oylar } from '../PrintSection';
import { AbonentDetails } from 'types/billing';
import { IAriza } from 'types/models';

export function QRSection({ ariza, date = new Date(), abonentData }: { ariza: IAriza; date: Date; abonentData: AbonentDetails }) {
  return (
    <>
      {/* <div style={{ fontWeight: 'bold', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        "{date.getDate()}" {oylar[date.getMonth()]} {date.getFullYear()} йил <b>{formatName(abonentData?.fullName)}</b>{' '}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <span>__________________</span>
          <span>(Imzo)</span>
        </div>
      </div> */}
      {ariza._id && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <QRCodeCanvas
            value={`ariza_${ariza._id}_${ariza.document_number}`}
            size={150}
            bgColor={'#ffffff'}
            fgColor={'#000000'}
            level={'Q'}
            includeMargin={true}
          />
        </div>
      )}
    </>
  );
}
