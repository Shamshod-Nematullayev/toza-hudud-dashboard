import React from 'react';
import useStore from './useStore';

function PrintSection({ printContentRef }) {
  const date = new Date();
  const { abonents } = useStore();
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
              Каттақўрғон туман / "ANVARJON BIZNES INVEST" MCHJ
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
            <th>ФИО</th>
            <th>Кўча</th>
            <th>Я/с</th>
            <th>Қарздор</th>
            <th colSpan={2}>Охирги тўлов</th>
            <th>ЭТК</th>
          </tr>
        </thead>
        <tbody>
          {/* Asosiy abonentlar ma'lumotlari yoziladigan joy */}
          {abonents.map((abonent, i) => (
            <tr className="abonent_rows" style={{ border: '1px solid black' }} key={abonent.id}>
              <td style={{ textAlign: 'center' }}>{i + 1}</td>
              <td>{abonent.accountNumber}</td>
              <td>{abonent.fullName.length < 30 ? abonent.fullName : abonent.fullName.slice(0, 30) + '..'}</td>
              <td>{abonent.streetName}</td>
              <td style={{ textAlign: 'center' }}>{abonent.inhabitantCnt}</td>
              <td style={{ textAlign: 'right' }}>{Math.floor(Number(abonent.ksaldo)).toLocaleString()}</td>
              <td style={{ textAlign: 'right' }}>{abonent.lastPaymentAmount}</td>
              <td>{abonent.lastPayDate}</td>
              <td
                style={{
                  textDecoration: abonent.isElektrKodConfirm ? 'line-through' : 'none'
                }}
              >
                {abonent.electricityAccountNumber}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PrintSection;
