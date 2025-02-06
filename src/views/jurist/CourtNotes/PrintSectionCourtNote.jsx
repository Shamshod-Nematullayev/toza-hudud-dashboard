import React, { forwardRef } from 'react';
import useStore from './useStore';
import { kirillga } from 'helpers/lotinKiril';
import styled from 'styled-components';
import { QRCodeCanvas } from 'qrcode.react';
function formatName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const oylar = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];

const PrintSectionCourtNote = forwardRef((props, ref) => {
  const { document, selectedRows, mahallas } = useStore();
  const date = new Date();
  return (
    <div ref={ref} className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
      <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{document.doc_num}</span>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div></div>
        <p
          style={{
            width: 300,
            fontWeight: 'bold',
            textIndent: '40px',
            lineHeight: '20px'
          }}
        >
          "Анваржон бизнес инвест" МЧЖ Каттақўрғон туман филиали раҳбари А.А.Садриддиновга филиал ахоли назоратчиси{' '}
          {kirillga(formatName(document.inspector?.name))} томонидан
        </p>
      </div>
      <p style={{ textAlign: 'center' }}>БИЛДИРИШ ХАТИ</p>
      <p
        style={{
          textIndent: '40px'
        }}
      >
        Ушбу орқали Сизга шуни маълум қиламанки, менга бириктирилган {mahallas.find((mfy) => mfy.id == document.mahallaId).name} МФЙда
        яшовчи юқори қарздорлиги бўлган қуйидаги фуқароларни қарздорлигини суд орқали ундирилишида амалий ёрдам беришингизни сўрайман.
        <table
          style={{
            borderCollapse: 'collapse',
            margin: 'auto'
          }}
          border="1"
        >
          <thead>
            <tr>
              <th style={{ padding: '10px' }}>№</th>
              <th>Ҳисоб рақам</th>
              <th>Ф.И.О.</th>
            </tr>
          </thead>
          <tbody>
            {selectedRows.map((row, i) => {
              return (
                <tr key={row.id}>
                  <td style={{ padding: '5px' }}>{i + 1}</td>
                  <td style={{ padding: '5px 20px 5px 0' }}>{row.accountNumber}</td>
                  <td style={{ padding: '5px 30px 5px 0' }}>{row.fullName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
          "{date.getDate()}" {kirillga(oylar[date.getMonth()])} {date.getFullYear()} йил _______{' '}
          {kirillga(formatName(document.inspector?.name))}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <QRCodeCanvas
            value={`bildirgi_${document._id}_${document.doc_num}`}
            size={150}
            bgColor={'#ffffff'}
            fgColor={'#000000'}
            level={'Q'}
            includeMargin={true}
          />
        </div>
      </p>
    </div>
  );
});
export default PrintSectionCourtNote;
