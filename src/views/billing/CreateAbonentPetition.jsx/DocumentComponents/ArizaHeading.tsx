import useCustomizationStore from 'store/customizationStore';
import { AbonentDetails } from 'types/billing';
import fullNameToShortName from 'views/tools/fullNameToShortName';
import { lotinga } from 'helpers/lotinKiril';
import { formatName } from '../PrintSection';

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
  participants?: { key: string; isExcluded?: boolean }[];
}

/**
 * Dalolatnomaga rahbar imzosi kerakligini bildiruvchi shartli belgi (uch nuqta).
 * Ataylab izohsiz: faqat xabardor xodimlar tushunadi. Rahbar rezolyutsiya yozadigan
 * yuqori chap burchakda, ariza raqamidan sal ichkarida turadi.
 */
function RahbarMark() {
  return (
    <svg
      width="11"
      height="10"
      viewBox="0 0 11 10"
      aria-hidden="true"
      style={{ position: 'absolute', top: 34, left: 54, opacity: 0.7 }}
    >
      <circle cx="5.5" cy="1.6" r="1.3" fill="#333" />
      <circle cx="1.6" cy="8.4" r="1.3" fill="#333" />
      <circle cx="9.4" cy="8.4" r="1.3" fill="#333" />
    </svg>
  );
}

export function ArizaHeading({ abonentData, vakil, participants }: ArizaHeadingProps) {
  const { company } = useCustomizationStore();
  const needsRahbarSign = !!participants?.some((p) => p.key === 'rahbar' && !p.isExcluded);

  // Vakil borligini tekshirish
  const hasVakil = !!vakil?.fullName;

  // Arizachi qatorini shakllantirish
  const applicantInfo = hasVakil
    ? `fuqaro ${formatName(vakil.fullName)} (${formatName(abonentData.fullName)}ning ${vakil.relation.toLowerCase()})`
    : `fuqaro ${formatName(abonentData.fullName)}`;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {/* Chap tomon bo'sh qoladi, o'ng tomonga ma'lumotlar joylashadi */}
      <div>{needsRahbarSign && <RahbarMark />}</div>
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
