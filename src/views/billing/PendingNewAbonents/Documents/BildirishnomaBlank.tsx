import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { INewAbonentItem } from '../types';
import { numberToWordsUz } from '../helpers/numberToWordsUz';

interface BildirishnomaBlankProps {
  item: INewAbonentItem;
  company?: {
    name?: string;
    managerName?: string;
    locationName?: string;
    phone?: string;
  };
  inspectorName?: string;
  debtMonths?: number;
  nSaldo?: number;
  calculatedDebtWords?: string;
  comment?: string;
  qrValue?: string;
  date?: Date;
}

const monthsUz = [
  'январ',
  'феврал',
  'март',
  'апрел',
  'май',
  'июн',
  'июл',
  'август',
  'сентябр',
  'октябр',
  'ноябр',
  'декабр',
];

export const BildirishnomaBlank: React.FC<BildirishnomaBlankProps> = ({
  item,
  company,
  inspectorName = '',
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
        fontSize: '14pt',
        lineHeight: 1.5,
        boxSizing: 'border-box',
        margin: '0 auto',
      }}
    >
      {/* Yuqori o'ng burchak: Rahbarga / Nazoratchidan va QR Code */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <QRCodeCanvas value={effectiveQr} size={95} level="M" />
          <div style={{ fontSize: '9pt', marginTop: '4px', color: '#333' }}>
            № {item.document_number || '---'}
          </div>
        </div>

        <div style={{ width: '55%', textAlign: 'left', marginLeft: 'auto', fontSize: '13pt', lineHeight: 1.4 }}>
          <div><b>{company?.name || 'Қамай Қорасув ЭКОС МЧЖ'}</b></div>
          <div>раҳбари <b>{company?.managerName || 'И.Назаров'}</b>га</div>
          <div style={{ marginTop: '8px' }}>
            назоратчи: <b>{inspectorName || item.inspector_name || '__________________________'}</b>дан
          </div>
        </div>
      </div>

      {/* Hujjat sarlavhasi */}
      <div style={{ textAlign: 'center', marginTop: '25px', marginBottom: '20px' }}>
        <div style={{ fontSize: '17pt', fontWeight: 'bold', letterSpacing: '2px' }}>
          БИЛДИРИШНОМА
        </div>
        <div style={{ fontSize: '12pt', fontStyle: 'italic', marginTop: '4px' }}>
          № {item.document_number ? String(item.document_number).padStart(5, '0') : '______'}
        </div>
      </div>

      {/* Matn qismi */}
      <div style={{ textAlign: 'justify', textIndent: '40px', marginBottom: '16px' }}>
        Мен назоратчи <b>{inspectorName || item.inspector_name || '__________________________'}</b> шуни билдириб ёзаманки,{' '}
        <b>{year}</b> йил «<b>{day}</b>» <b>{month}</b> куни хизмат кўрсатиш ҳудудимга қарашли{' '}
        <b>{item.mahallaName || '__________'}</b> МФЙ, <b>{item.streetName || '__________'}</b> кўчасида яшовчи фуқаро{' '}
        <b>{citizenFullName}</b>нинг хонадонига чиққанимда фуқаро «Тоза ҳудуд» ҳисобида йўқлиги (янги абонент) аниқланди.{' '}
        Хонадонда <b>{item.inhabitant_cnt || 1}</b> нафар фуқаро истиқомат қилиб келмоқда.
      </div>

      <div style={{ textAlign: 'justify', textIndent: '40px', marginBottom: '16px' }}>
        Ушбу фуқарога <b>{effectiveDebtMonths}</b> ойлик жами: <b>{Number(effectiveNSaldo).toLocaleString('uz-UZ')}</b> (
        <i>{words}</i>) сўм қайта ҳисоб-китоб қилинди.
      </div>

      <div style={{ textAlign: 'justify', textIndent: '40px', marginBottom: '25px' }}>
        Ушбу фуқарога корхона томонидан юритилаётган «ТОЗА МАКОН БИЛЛИНГ» дастури орқали янги шахсий ҳисоб рақами очишингизни сўрайман.
      </div>

      {/* Tafsilotlar jadvali / ro'yxati */}
      <div style={{ border: '1px solid #333', padding: '12px 16px', borderRadius: '4px', marginBottom: '30px', fontSize: '12pt' }}>
        <div style={{ marginBottom: '6px' }}>
          <b>• Фуқаронинг паспорт маълумоти:</b> {citizen.passport || '---'}
        </div>
        <div style={{ marginBottom: '6px' }}>
          <b>• Фуқаронинг ЖШШИР маълумоти:</b> {citizen.pnfl || '---'}
        </div>
        <div style={{ marginBottom: '6px' }}>
          <b>• Кадастр рақами:</b> {item.cadastr || 'Мавжуд эмас'}
        </div>
        <div style={{ marginBottom: '6px' }}>
          <b>• Электр ҳисоб рақами:</b> {item.etkCustomerCode ? `${item.etkCustomerCode} (COATO: ${item.etkCaoto || '-'})` : 'Мавжуд эмас'}
        </div>
        <div>
          <b>• Изоҳ:</b> {comment || item.comment || item.description || 'Янги аниқланган абонент'}
        </div>
      </div>

      {/* Imzolar */}
      <div style={{ marginTop: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ width: '46%' }}>
          <div><b>Назоратчи:</b></div>
          <div style={{ borderBottom: '1px solid #000', minHeight: '26px', marginTop: '6px', fontWeight: 'bold' }}>
            {inspectorName || item.inspector_name}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt', color: '#555', marginTop: '2px' }}>
            <span>(Ф.И.Ш)</span>
            <span>(имзо) _________</span>
          </div>
        </div>

        <div style={{ width: '46%' }}>
          <div><b>Корхона раҳбари:</b></div>
          <div style={{ borderBottom: '1px solid #000', minHeight: '26px', marginTop: '6px', fontWeight: 'bold' }}>
            {company?.managerName || '_____________________'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt', color: '#555', marginTop: '2px' }}>
            <span>(Ф.И.Ш)</span>
            <span>(имзо) _________</span>
          </div>
        </div>
      </div>

      {/* Pastki QR kod tasdiq yozuvi */}
      <div style={{ marginTop: '50px', borderTop: '1px dashed #999', paddingTop: '10px', fontSize: '9pt', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
        <span>Hujjat tizim tomonidan avtomatik shakllantirilgan: {effectiveQr}</span>
        <span>Sana: {day}.{String(date.getMonth() + 1).padStart(2, '0')}.{year}</span>
      </div>
    </div>
  );
};

export default BildirishnomaBlank;
