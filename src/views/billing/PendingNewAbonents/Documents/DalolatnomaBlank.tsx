import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { INewAbonentItem } from '../types';
import { numberToWordsUz } from '../helpers/numberToWordsUz';

interface DalolatnomaBlankProps {
  item: INewAbonentItem;
  company?: {
    name?: string;
    managerName?: string;
    locationName?: string;
    phone?: string;
  };
  inspectorName?: string;
  mfyRaisName?: string;
  debtMonths?: number;
  nSaldo?: number;
  calculatedDebtWords?: string;
  comment?: string;
  qrValue?: string;
  date?: Date;
}

const monthsUz = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentyabr',
  'oktyabr',
  'noyabr',
  'dekabr',
];

export const DalolatnomaBlank: React.FC<DalolatnomaBlankProps> = ({
  item,
  company,
  inspectorName = '',
  mfyRaisName = '',
  debtMonths = 0,
  nSaldo = 0,
  calculatedDebtWords = '',
  comment = '',
  qrValue = '',
  date = new Date(),
}) => {
  const citizen = item.citizen || ({} as any);
  const citizenFullName = `${citizen.lastName || ''} ${citizen.firstName || ''} ${citizen.patronymic || ''}`.trim() || item.abonent_name || 'Fuqaro';
  const effectiveDebtMonths = debtMonths ?? item.debtMonths ?? 0;
  const effectiveNSaldo = nSaldo ?? item.nSaldo ?? 0;
  const words = calculatedDebtWords || (effectiveNSaldo ? numberToWordsUz(effectiveNSaldo) : 'Nol');
  const effectiveQr = qrValue || `new_abonent_${item._id}_${item.document_number || 0}`;

  const day = String(date.getDate()).padStart(2, '0');
  const month = monthsUz[date.getMonth()];
  const year = date.getFullYear();

  return (
    <div
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm 20mm 15mm 25mm',
        backgroundColor: '#fff',
        color: '#000',
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: '13pt',
        lineHeight: 1.5,
        boxSizing: 'border-box',
        margin: '0 auto',
      }}
    >
      {/* Yuqori qism: QR kod va Hujjat rekvizitlari */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div style={{ textAlign: 'center' }}>
          <QRCodeCanvas value={effectiveQr} size={90} level="M" />
          <div style={{ fontSize: '9pt', marginTop: '4px', color: '#333' }}>
            № {item.document_number || '---'}
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '11pt', lineHeight: 1.4 }}>
          <div><b>«{company?.name || 'Toza Hudud'}»</b></div>
          <div>{company?.locationName || ''}</div>
          <div style={{ fontStyle: 'italic', marginTop: '4px' }}>
            «TASDIQLAYMAN»<br />
            Korxona rahbari: <b>{company?.managerName || '_____________'}</b><br />
            «____» ____________ {year} y.
          </div>
        </div>
      </div>

      {/* Sarlavha */}
      <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
        <div style={{ fontSize: '16pt', fontWeight: 'bold', letterSpacing: '1px' }}>
          DALOLATNOMA № {item.document_number ? String(item.document_number).padStart(5, '0') : '______'}
        </div>
        <div style={{ fontSize: '11pt', fontStyle: 'italic' }}>
          (Yangi abonent aniqlanganligi va hisob-kitob qilinganligi to‘g‘risida)
        </div>
      </div>

      {/* Sana va Manzil */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontWeight: 'bold' }}>
        <div>«{day}» {month} {year} yil</div>
        <div>{item.mahallaName || 'Mahalla'} hududi</div>
      </div>

      {/* Komissiya tarkibi va bayoni */}
      <div style={{ textAlign: 'justify', textIndent: '30px', marginBottom: '14px' }}>
        Biz kimlar, ushbu dalolatnomani tuzuvchilar — <b>{company?.name || 'Korxona'}</b> hududiy nazoratchisi{' '}
        <b>{inspectorName || item.inspector_name || '__________________________'}</b>,{' '}
        <b>{item.mahallaName}</b> MFY raisi <b>{mfyRaisName || '__________________________'}</b> hamda mazkur xonadon vakili{' '}
        ishtirokida ushbu dalolatnomani tuzdik shul haqidakim:
      </div>

      <div style={{ textAlign: 'justify', textIndent: '30px', marginBottom: '14px' }}>
        {item.mahallaName} MFY, {item.streetName} ko‘chasida joylashgan xonadon ko‘zdan kechirilganda, fuqaro{' '}
        <b>{citizenFullName}</b> amalda istiqomat qilib kelayotganligi, biroq «Toza hudud» billing tizimiga kiritilmaganligi (yangi abonent) aniqlandi.
      </div>

      <div style={{ textAlign: 'justify', textIndent: '30px', marginBottom: '16px' }}>
        Mazkur xonadonda <b>{item.inhabitant_cnt || 1}</b> nafar fuqaro istiqomat qilayotganligi inobatga olinib, fuqaroga{' '}
        <b>{effectiveDebtMonths}</b> oylik to‘lov qayta hisob-kitob qilindi. Hisoblangan umumiy qarzdorlik miqdori:{' '}
        <b>{Number(effectiveNSaldo).toLocaleString('uz-UZ')}</b> (<i>{words}</i>) so‘mni tashkil etadi.
      </div>

      {/* Abonent parametrlari */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '11pt' }}>
        <tbody>
          <tr style={{ border: '1px solid #333' }}>
            <td style={{ padding: '6px 10px', width: '35%', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Fuqaro F.I.SH.</td>
            <td style={{ padding: '6px 10px' }}>{citizenFullName}</td>
          </tr>
          <tr style={{ border: '1px solid #333' }}>
            <td style={{ padding: '6px 10px', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>JSHSHIR</td>
            <td style={{ padding: '6px 10px' }}>{citizen.pnfl || '-'}</td>
          </tr>
          <tr style={{ border: '1px solid #333' }}>
            <td style={{ padding: '6px 10px', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Pasport seriya va raqam</td>
            <td style={{ padding: '6px 10px' }}>{citizen.passport || '-'}</td>
          </tr>
          <tr style={{ border: '1px solid #333' }}>
            <td style={{ padding: '6px 10px', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Kadastr raqami</td>
            <td style={{ padding: '6px 10px' }}>{item.cadastr || 'Mavjud emas'}</td>
          </tr>
          <tr style={{ border: '1px solid #333' }}>
            <td style={{ padding: '6px 10px', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Elektr hisob raqami</td>
            <td style={{ padding: '6px 10px' }}>{item.etkCustomerCode ? `${item.etkCustomerCode} (COATO: ${item.etkCaoto || '-'})` : 'Mavjud emas'}</td>
          </tr>
          <tr style={{ border: '1px solid #333' }}>
            <td style={{ padding: '6px 10px', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Qo‘shimcha izoh</td>
            <td style={{ padding: '6px 10px' }}>{comment || item.comment || item.description || 'Yangi abonent ochish'}</td>
          </tr>
        </tbody>
      </table>

      {/* Imzolar */}
      <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <div><b>MFY Raisi:</b></div>
          <div style={{ borderBottom: '1px solid #000', minHeight: '24px', marginTop: '6px' }}>{mfyRaisName || '__________________'}</div>
          <div style={{ fontSize: '9pt', color: '#555', marginTop: '2px' }}>(imzo)</div>
        </div>

        <div style={{ flex: 1 }}>
          <div><b>Nazoratchi:</b></div>
          <div style={{ borderBottom: '1px solid #000', minHeight: '24px', marginTop: '6px' }}>{inspectorName || item.inspector_name}</div>
          <div style={{ fontSize: '9pt', color: '#555', marginTop: '2px' }}>(imzo)</div>
        </div>

        <div style={{ flex: 1 }}>
          <div><b>Fuqaro (Abonent):</b></div>
          <div style={{ borderBottom: '1px solid #000', minHeight: '24px', marginTop: '6px' }}>{citizenFullName}</div>
          <div style={{ fontSize: '9pt', color: '#555', marginTop: '2px' }}>(imzo)</div>
        </div>
      </div>

      {/* QR kod tasdiq pastki satri */}
      <div style={{ marginTop: '40px', borderTop: '1px dashed #999', paddingTop: '8px', fontSize: '9pt', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
        <span>QR identifikator: {effectiveQr}</span>
        <span>Sana: {day}.{String(date.getMonth() + 1).padStart(2, '0')}.{year}</span>
      </div>
    </div>
  );
};

export default DalolatnomaBlank;
