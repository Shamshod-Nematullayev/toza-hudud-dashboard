import { lotinga } from 'helpers/lotinKiril';
import useCustomizationStore from 'store/customizationStore';
import { AbonentDetails } from 'types/billing';
import fullNameToShortName from 'views/tools/fullNameToShortName';

export const ImzoJoyiRow = ({ label, placeholder = '___________', name }: { label?: string; placeholder?: string; name?: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ width: 300 }}>{label}</div>
    <div>{placeholder}</div>
    <div style={{ width: 200 }}>{fullNameToShortName(name || '')}</div>
  </div>
);

interface ImzolashJoyiProps {
  mahalla: any;
  abonentData: AbonentDetails;
  mahalla2?: any;
  documentType: string;
  gpsOperator?: any;
}

export const ImzolashJoyi = ({ mahalla, abonentData, mahalla2, documentType, gpsOperator }: ImzolashJoyiProps) => {
  mahalla = mahalla?.data;
  mahalla2 = mahalla2?.data;
  const { company, user } = useCustomizationStore();
  return (
    <>
      <ImzoJoyiRow label="Fuqaro:" name={abonentData.fullName} />
      <br />

      <ImzoJoyiRow label="Axoli nazoratchisi:" name={lotinga(mahalla?.biriktirilganNazoratchi?.inspector_name)} />
      <br />
      <ImzoJoyiRow label={`${lotinga(mahalla?.name)} MFY raisi:`} name={lotinga(mahalla?.mfy_rais_name)} />

      <br />
      {documentType === 'dvaynik' && mahalla2?.id != mahalla?.id && (
        <ImzoJoyiRow label={`${lotinga(mahalla2?.name)} MFY raisi:`} name={lotinga(mahalla2?.mfy_rais_name)} />
      )}
      {gpsOperator?.fullName && (
        <>
          <ImzoJoyiRow label="GPS kuzatuv xodimi:" name={gpsOperator.fullName} />
          <br />
        </>
      )}
      <ImzoJoyiRow label="Abonentlar bilan ishlash bo‘limi xodimi:" name={company?.billingAdminName} />
      <br />
      <ImzoJoyiRow label={`${company?.name} ${company?.locationName} filial raxbari:`} name={company?.managerName} />
      <p style={{ textAlign: 'left', fontSize: '12px' }}>
        Created: <b>{user?.fullName}</b>
      </p>
    </>
  );
};
