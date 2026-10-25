import React from 'react';
import { lotinga } from 'helpers/lotinKiril';
import useCustomizationStore from 'store/customizationStore';
import { AbonentDetails } from 'types/billing';
import fullNameToShortName from 'views/tools/fullNameToShortName';
import { ResolvedParticipant } from '../participantResolver';

export const ImzoJoyiRow = ({ label, placeholder = '___________', name }: { label?: string; placeholder?: string; name?: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ width: 320 }}>{label}</div>
    <div>{placeholder}</div>
    <div style={{ width: 220, textAlign: 'right' }}>{fullNameToShortName(name || '')}</div>
  </div>
);

interface ImzolashJoyiProps {
  mahalla?: any;
  abonentData?: AbonentDetails;
  mahalla2?: any;
  documentType?: string;
  gpsOperator?: any;
  creatorName?: string;
  ariza?: any;
  participants?: ResolvedParticipant[];
}

export const ImzolashJoyi = ({
  mahalla,
  abonentData,
  mahalla2,
  documentType,
  gpsOperator,
  creatorName,
  ariza,
  participants
}: ImzolashJoyiProps) => {
  const { company, user, customization } = useCustomizationStore();

  // 1. Agar ariza'da snapshot bo'lsa yoki participants prop orqali uzatilgan bo'lsa
  const snapshotList = participants || ariza?.participantsSnapshot;

  if (snapshotList && Array.isArray(snapshotList) && snapshotList.length > 0) {
    const activeList = snapshotList
      .filter((p: any) => !p.isExcluded)
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

    return (
      <>
        {activeList.map((p: any, idx: number) => (
          <React.Fragment key={p.id || idx}>
            <ImzoJoyiRow label={p.label} name={p.name} />
            <br />
          </React.Fragment>
        ))}
        {documentType === 'dvaynik' && mahalla2?.data?.id && mahalla?.data?.id && mahalla2.data.id != mahalla.data.id && (
          <>
            <ImzoJoyiRow
              label={`${lotinga(mahalla2.data.name)} MFY raisi:`}
              name={lotinga(mahalla2.data.mfy_rais_name)}
            />
            <br />
          </>
        )}
        <p style={{ textAlign: 'left', fontSize: '12px' }}>
          Created: <b>{user?.fullName || ariza?.creatorName}</b>
        </p>
      </>
    );
  }

  // 2. Aks holda (eski dalolatnomalar uchun backward compatible fallback)
  mahalla = mahalla?.data || mahalla;
  mahalla2 = mahalla2?.data || mahalla2;
  const fuqaroIshtirok = customization.fuqaroIshtirok ?? true;
  const billingStaffName =
    creatorName || ariza?.creatorName || ariza?.creator?.fullName || user?.fullName || company?.billingAdminName;

  return (
    <>
      {customization.boshliqIshtirokida && (
        <>
          <ImzoJoyiRow label={`${company?.name} ${company?.locationName} filial raxbari:`} name={company?.managerName} />
          <br />
        </>
      )}
      <ImzoJoyiRow label="Abonentlar bilan ishlash bo‘limi xodimi:" name={billingStaffName} />
      <br />
      {gpsOperator?.fullName && (
        <>
          <ImzoJoyiRow label="GPS kuzatuv xodimi:" name={gpsOperator.fullName} />
          <br />
        </>
      )}
      <ImzoJoyiRow label="Axoli nazoratchisi:" name={lotinga(mahalla?.biriktirilganNazoratchi?.inspector_name)} />
      <br />
      {customization.mfyRaisiIshtirok && (
        <>
          <ImzoJoyiRow label={`${lotinga(mahalla?.name)} MFY raisi:`} name={lotinga(mahalla?.mfy_rais_name)} />
          <br />
          {documentType === 'dvaynik' && mahalla2?.id != mahalla?.id && (
            <>
              <ImzoJoyiRow label={`${lotinga(mahalla2?.name)} MFY raisi:`} name={lotinga(mahalla2?.mfy_rais_name)} />
              <br />
            </>
          )}
        </>
      )}
      {fuqaroIshtirok && abonentData && (
        <>
          <ImzoJoyiRow label="Fuqaro:" name={abonentData.fullName} />
          <br />
        </>
      )}
      <p style={{ textAlign: 'left', fontSize: '12px' }}>
        Created: <b>{user?.fullName}</b>
      </p>
    </>
  );
};
