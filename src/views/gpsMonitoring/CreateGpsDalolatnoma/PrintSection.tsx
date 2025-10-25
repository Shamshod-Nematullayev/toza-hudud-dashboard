import { TextareaAutosize } from '@mui/material';
import { Dayjs } from 'dayjs';
import React from 'react';
import useCustomizationStore from 'store/customizationStore';
import { IAutomobile } from 'types/billing';
import EditableTypography from 'ui-component/EditableTypography';
import { Company } from 'views/billing/Blanks';
import { ImzoJoyiRow, oylar } from 'views/billing/CreateAbonentPetition.jsx/PrintSection';
import fullNameToShortName from 'views/tools/fullNameToShortName';

function PrintSection({
  company,
  date,
  responsibleCar,
  responsibleCarDriverName,
  currentCar,
  currentCarDriverName,
  mfyName
}: {
  company: Company;
  date: Dayjs | null;
  responsibleCar?: IAutomobile;
  responsibleCarDriverName?: string;
  currentCar?: IAutomobile;
  currentCarDriverName?: string;
  mfyName?: string;
}) {
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>DALOLATNOMA</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: 300 }}>
          {date ? (
            <>
              “{date.date()}” {oylar[date.month()]} {date.year()} yil
            </>
          ) : (
            <>“____” _________ 20__ yil</>
          )}
        </div>
        <span>{company.locationName}</span>
      </div>
      <p style={{ textAlign: 'justify' }}>
        <EditableTypography>
          {'        '}Bizlar kim ushbu dalolatnomani tuzib imzo chekuvchilar {company.name} {company.locationName} filiali rahbari{' '}
          {fullNameToShortName(company.managerName)} filial GPS operatori {fullNameToShortName(company.gpsOperatorName)} davlat raqami{' '}
          {responsibleCar?.automobileNumber} bo'lgan maxsus texnika "___" _________ 20__ yil grafik bo'yicha {mfyName}ga kirmaganligi
          sababli davlat raqami {currentCar?.automobileNumber} bo'lgan maxsus texnika {mfyName}ni grafik bo'yicha tozalab oldi.
        </EditableTypography>
      </p>
      <p>Dalolatnoma to'g'ri deb imzo chekuvchilar:</p>
      <ImzoJoyiRow label={`${company.name} ${company.locationName} filiali rahbari:`} name={company.managerName} />
      <ImzoJoyiRow label="Filial GPS operatori:" name={company.gpsOperatorName} />
      <ImzoJoyiRow
        label={`${responsibleCar?.automobileNumberAndModel} haydovchisi:`}
        name={responsibleCarDriverName?.split(' ').reverse().join(' ')}
      />
      <ImzoJoyiRow
        label={`${currentCar?.automobileNumberAndModel} haydovchisi:`}
        name={currentCarDriverName?.split(' ').reverse().join(' ')}
      />
    </div>
  );
}

export default PrintSection;
