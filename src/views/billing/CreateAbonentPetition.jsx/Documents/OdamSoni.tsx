import { lotinga } from 'helpers/lotinKiril';
import { formatName, oylar, raqamlar } from '../PrintSection';
import { Dayjs } from 'dayjs';
import { IMahalla } from '../useStore';
import useCustomizationStore from 'store/customizationStore';
import fullNameToShortName from 'views/tools/fullNameToShortName';
import { AbonentDetails } from 'types/billing';
import { QRSection } from '../DocumentComponents/QRSection';
import { ImzoJoyiRow } from '../DocumentComponents/ImzolashJoyi';
import { ArizaTitle } from '../DocumentComponents/ArizaTitle';
import { ArizaHeading } from '../DocumentComponents/ArizaHeading';

function OdamSoni({
  date,
  mahalla,
  mahalla2,
  abonentData,
  aniqlanganYashovchiSoni,
  olderPeriod,
  asoslantiruvchi,
  documentType = 'odam_soni',
  ariza,
  relation,
  relationFullName
}: {
  date: Date;
  abonentData: AbonentDetails;
  aniqlanganYashovchiSoni: number;
  olderPeriod: Dayjs;
  asoslantiruvchi: string;
  mahalla: IMahalla;
  mahalla2: IMahalla;
  documentType: string;
  ariza: any;
  relation?: string;
  relationFullName?: string;
}) {
  let { customization, company } = useCustomizationStore();
  // Dinamik mantiqiy o'zgaruvchilar
  const isRelative = !!relation && !!relationFullName;
  const currentApplicant = isRelative ? relationFullName : abonentData?.fullName;
  const relationText = relation ? relation.toLowerCase() : '';

  // Ariza matni - vakillik holatiga qarab o'zgaradi
  const renderArizaText = () => {
    if (isRelative) {
      return `Shuni yozib ma’lum qilamanki, men fuqaro ${abonentData?.fullName}ning ${relationText} — ${relationFullName} bo'laman. Mazkur xonadonga tegishli ${abonentData?.accountNumber} shaxsiy hisob raqami onlayn bazaga noto‘g‘ri hisob-kitob qilingani sababli ushbu dalolatnomani taqdim qilyapman.`;
    }
    return `Shuni yozib ma’lum qilamanki, mening ${abonentData?.accountNumber} hisob raqamim onlayn bazaga noto‘g‘ri hisob-kitob qilingani sababli dalolatnoma taqdim qilyapman.`;
  };
  return (
    <>
      {/* 1-SAHIFA: ARIZA */}
      {customization.documentVariantOdamSoni !== 'dalolatnoma' && (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
          <ArizaHeading abonentData={abonentData} vakil={relation ? { relation, fullName: relationFullName || '' } : undefined} />
          <br />
          <ArizaTitle type="odam soni" />
          <br />
          <p style={{ fontWeight: 'bold', lineHeight: '40px', textIndent: '40px' }}>
            {renderArizaText()} Ushbu dalolatnomam asosida qayta hisob-kitob qilib berishingizni so‘rayman.
          </p>
          <QRSection
            abonentData={{ ...abonentData, fullName: isRelative ? relationFullName : abonentData?.fullName }}
            ariza={ariza}
            date={date}
          />
        </div>
      )}

      {/* 2-SAHIFA: DALOLATNOMA */}
      {customization.documentVariantOdamSoni !== 'ariza' && (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          <p style={{ textAlign: 'center', width: '70%', margin: '0 auto' }}>
            <b>
              Abonentlar bo‘yicha o‘zgarishlar to‘g‘risidagi ma’lumotlarga kiritilmagan va ular haqida Sanitar tozalash markaziga taqdim
              etilmagan yangi abonentlar yoki birga istiqomat qiluvchi shaxslar sonini aniqlash
            </b>
          </p>
          <p style={{ textAlign: 'center' }}>
            <b>DALOLATNOMASI</b>
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', lineHeight: '50px' }}>
            <div>
              "{date.getDate()}" {lotinga(oylar[date.getMonth()])} {date.getFullYear()} yil
            </div>
            <div>{mahalla?.company?.locationName}</div>
          </div>

          <p>
            <b>Quyidagi manzil bo‘yicha:</b>
          </p>
          <p>
            Manzil: {abonentData.mahallaName} {abonentData.streetName} {abonentData.house.homeNumber} uy {abonentData.house.homeIndex}{' '}
            xonadon
          </p>
          <p>
            Shaxsiy hisob raqami: <b>{abonentData?.accountNumber}</b>
          </p>
          <p>
            <b>Abonent: {abonentData?.fullName}</b>
          </p>
          {isRelative && (
            <p>
              <b>
                Murojaatchi (Vakil): {relationFullName} ({relation})
              </b>
            </p>
          )}
          <p>
            Jami {aniqlanganYashovchiSoni} ({raqamlar[aniqlanganYashovchiSoni]}) nafar shaxs {olderPeriod.year()} yilning “
            {olderPeriod.date()}” {lotinga(oylar[olderPeriod.month()])} oyidan buyon birga istiqomat qilishi aniqlandi.
          </p>

          <p style={{ textAlign: 'justify', textIndent: '40px' }}>
            Fuqoro {formatName(isRelative ? relationFullName : abonentData?.fullName)}, {lotinga(mahalla.data.name)} MFY raisi{' '}
            {fullNameToShortName(mahalla?.data?.mfy_rais_name || '')}, {company.name} {company.locationName} aholi bo'lim boshlig'i{' '}
            {lotinga(fullNameToShortName(company.billingAdminName))}lar mazkur dalolatnomani shu haqida tuzdik.
          </p>
          <p style={{ textAlign: 'justify', textIndent: '40px' }}>
            Fuqaro {formatName(abonentData.fullName)}ning xonadonida oila a'zolari soni yagona elektron tizimda{' '}
            {abonentData.house.inhabitantCnt} nafar ko'rsatilgan. O'rganish natijasida {olderPeriod.year()} yil «{olderPeriod.date()}»{' '}
            {oylar[olderPeriod.month()]}dan boshlab {aniqlanganYashovchiSoni} nafar oila a'zolari istiqomat qilishi aniqlandi.
          </p>
          {asoslantiruvchi && <p style={{ textAlign: 'justify', textIndent: '40px', fontStyle: 'italic' }}>{asoslantiruvchi}</p>}

          <p>
            Yuqoridagilarga va asoslantiruvchi hujjatlarga muvofiq, hisobga olishning yagona elektron tizimida mazkur abonent to‘g‘risidagi
            ma’lumotlarga tegishli o‘zgartirishlar kiritish hamda to‘lovlarni qayta hisob-kitob qilishni maqsadga muvofiq deb hisoblaymiz.
          </p>

          {/* IMZOLAR BO'LIMI */}
          <div style={{ marginTop: '20px' }}>
            <ImzoJoyiRow label={isRelative ? `Abonent vakili (${relation})` : 'Abonent'} name={currentApplicant} />
            <br />
            <ImzoJoyiRow label={lotinga(mahalla.data.name) + ' MFY raisi'} name={mahalla.data.mfy_rais_name} />
            <br />
            <ImzoJoyiRow label={'Aholi nazoratchisi'} name={mahalla.data.biriktirilganNazoratchi?.inspector_name} />
            <br />
            <ImzoJoyiRow label={"Aholi bo'limi xodimi"} name={company.billingAdminName} />
            <br />
            <ImzoJoyiRow label={company.name + '  boshlig`i'} name={company.managerName} />
          </div>
          <br />
          <br />
          <br />
          {customization.documentVariantOdamSoni === 'dalolatnoma' && (
            <>
              <QRSection ariza={ariza} date={date} />
              <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default OdamSoni;
