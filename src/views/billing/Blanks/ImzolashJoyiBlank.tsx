import fullNameToShortName from 'views/tools/fullNameToShortName';
import { Company } from '.';

export const ImzolashJoyiBlank = ({ company }: { company: Company }) => {
  return (
    <>
      <div style={{ lineHeight: '30px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <b>Fuqaro:</b> ______________________________
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <b>{company.name} filial rahbari:</b> {fullNameToShortName(company.managerName)}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <b>Abonentlar bilan ishlash bo‘limi xodimi:</b> {fullNameToShortName(company.billingAdminName)}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <b>GPS kuzatuv xodimi:</b> {fullNameToShortName(company.gpsOperatorName)}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <b>Aholi nazoratchisi:</b> ______________________________
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <b>__________________ MFY raisi:</b> ______________________________
        </div>
      </div>
    </>
  );
};

export default ImzolashJoyiBlank;
