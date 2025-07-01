import React, { useEffect, useState } from 'react';
import useStore from './useStore';
import { kirillga } from 'helpers/lotinKiril';
import { formatName } from '../CreateAbonentPetition.jsx/PrintSection';

function PrintSection({ printContentRef }) {
  const date = new Date();
  const { abonents } = useStore();
  const [company, setCompany] = useState({});

  useEffect(() => {
    setCompany(JSON.parse(localStorage.getItem('company')));
  }, []);
  return (
    <div ref={printContentRef}>
      <table>
        <tbody>
          <tr>
            <td colSpan={7}>
              <i>Oliy Ong</i>
            </td>
          </tr>
          <tr>
            <td style={{ fontSize: 16 }} colSpan={7}>
              Сана: {date.getDate()}.{date.getMonth() + 1}.{date.getFullYear()}
            </td>
          </tr>
          <tr>
            <td style={{ fontSize: 16 }} colSpan={7}>
              {kirillga(company?.locationName || '')} / {company?.name}
            </td>
          </tr>
          <tr>
            <td style={{ fontSize: 16 }} colSpan={7}>
              Махалла: {abonents[0]?.mahallaName}
            </td>
          </tr>
        </tbody>
      </table>
      <table>
        <thead>
          <tr className="abonent_rows_head" style={{ border: '1px solid black' }}>
            <th>№</th>
            <th>Лицавой</th>
            <th style={{ width: '180px' }}>ФИО</th>
            {/* <th>Кўча</th> */}
            <th>Я/с</th>
            <th>Қарздор</th>
            <th colSpan={2}>Охирги тўлов</th>
            <th>ЭТК</th>
            <th>Телефон</th>
          </tr>
        </thead>
        <tbody>
          {/* Asosiy abonentlar ma'lumotlari yoziladigan joy */}
          {abonents.map((abonent, i) => (
            <tr className="abonent_rows" style={{ border: '1px solid black' }} key={abonent.id}>
              <td style={{ textAlign: 'center' }}>{i + 1}</td>
              <td>{abonent.accountNumber}</td>
              <td>{formatName(abonent.fullName.length < 30 ? abonent.fullName : abonent.fullName.slice(0, 30) + '..')}</td>
              {/* <td>{abonent.streetName}</td> */}
              <td style={{ textAlign: 'center' }}>{abonent.inhabitantCnt}</td>
              <td style={{ textAlign: 'right' }}>{Math.floor(Number(abonent.ksaldo)).toLocaleString()}</td>
              <td style={{ textAlign: 'right' }}>{abonent.lastPaymentAmount}</td>
              <td>{String(abonent.lastPayDate).split('T')[0]}</td>
              <td
                style={{
                  textDecoration: abonent.isElektrKodConfirm ? 'line-through' : 'none'
                }}
              >
                {abonent.electricityAccountNumber}
              </td>
              <td>{abonent.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PrintSection;
