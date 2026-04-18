import useCustomizationStore from 'store/customizationStore';
import { AbonentDetails } from 'types/billing';
import { formatName } from '../PrintSection';
import fullNameToShortName from 'views/tools/fullNameToShortName';
import { lotinga } from 'helpers/lotinKiril';

/**
 * Format phone number to "+998(xx xxxxxx" format.
 * If phone number is empty, return empty string.
 * @param {string} phone - phone number to be formatted.
 * @returns {string} - formatted phone number.
 */
function formatPhoneNumber(phone: string) {
  if (!phone) return '';
  const compCode = phone.slice(0, 2);
  const number = phone.slice(2, 9);
  return `+998(${compCode})${number}`;
}

interface Vakil {
  relation: string;
  fullName: string;
}
interface ArizaHeadingProps {
  abonentData: AbonentDetails;
  vakil?: Vakil;
}
export function ArizaHeading({ abonentData, vakil }: ArizaHeadingProps) {
  const { company } = useCustomizationStore();

  // Vakil borligini tekshirish
  const hasVakil = !!vakil?.fullName;

  // Arizachi qatorini shakllantirish
  const applicantInfo = hasVakil
    ? `fuqaro ${formatName(vakil.fullName)} (${formatName(abonentData.fullName)}ning ${vakil.relation.toLowerCase()})`
    : `fuqaro ${formatName(abonentData.fullName)}`;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {/* Chap tomon bo'sh qoladi, o'ng tomonga ma'lumotlar joylashadi */}
      <div></div>
      <p
        style={{
          width: 320,
          textAlign: 'justify',
          fontWeight: 'bold',
          textIndent: '40px',
          lineHeight: '24px',
          fontSize: '14px'
        }}
      >
        {company?.locationName} {company?.name} rahbari {fullNameToShortName(company?.managerName)}ga
        <br />
        {company?.locationName} {lotinga(abonentData.mahallaName)}da yashovchi {applicantInfo} tomonidan
        <br />
        <br />
        Telefon: {formatPhoneNumber(abonentData.phone || '')}
      </p>
    </div>
  );
}
