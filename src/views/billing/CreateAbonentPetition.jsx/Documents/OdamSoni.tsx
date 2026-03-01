import { lotinga } from 'helpers/lotinKiril';
import { ArizaHeading, ArizaTitle, formatName, ImzoJoyiRow, ImzolashJoyi, oylar, QRSection, raqamlar } from '../PrintSection';
import { Dayjs } from 'dayjs';
import { IAbonentData, IMahalla } from '../useStore';
import useCustomizationStore from 'store/customizationStore';
import fullNameToShortName from 'views/tools/fullNameToShortName';

function OdamSoni({
  date,
  mahalla,
  mahalla2,
  abonentData,
  aniqlanganYashovchiSoni,
  olderPeriod,
  asoslantiruvchi,
  documentType = 'odam_soni',
  ariza
}: {
  date: Date;
  abonentData: IAbonentData;
  aniqlanganYashovchiSoni: number;
  olderPeriod: Dayjs;
  asoslantiruvchi: string;
  mahalla: IMahalla;
  mahalla2: IMahalla;
  documentType: string;
  ariza: any;
}) {
  const { customization } = useCustomizationStore();
  return (
    <>
      <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
        <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
        <ArizaHeading abonentData={abonentData} />
        <br />
        <ArizaTitle type="odam soni" />
        <br />
        <p
          style={{
            fontWeight: 'bold',
            lineHeight: '40px',
            textIndent: '40px'
          }}
        >
          Shuni yozib ma’lum qilamanki mening {abonentData?.accountNumber} hisob raqamim onlayn bazaga noto‘g‘ri hisob-kitob qilingani
          sababli dalolatnoma taqdim qilyapman. Ushbu dalolatnomam asosida qayta hisob-kitob qilib berishingizni so‘rayman.
        </p>
        <QRSection abonentData={abonentData} ariza={ariza} date={date} />
      </div>

      {customization.documentVariantOdamSoni === '1' ? (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify' }}>
          <p style={{ textAlign: 'center' }}>
            <b>
              Abonentlar bo‘yicha o‘zgarishlar to‘g‘risidagi ma’lumotlarga kiritilmagan va ular haqida Sanitar tozalash markaziga taqdim
              etilmagan yangi abonentlar yoki birga istiqomat qiluvchi shaxslar sonini aniqlash
            </b>
          </p>
          <p style={{ textAlign: 'center' }}>
            <b>DALOLATNOMASI</b>
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              lineHeight: '50px'
            }}
          >
            <div>
              "{date.getDate()}" {lotinga(oylar[date.getMonth()])} {date.getFullYear()} yil
            </div>
            <div>{mahalla?.company?.locationName}</div>
          </div>
          <p>
            <b>Quyidagi manzil bo‘yicha:</b>
          </p>
          <p>MFY nomi: {mahalla.data?.name && lotinga(mahalla?.data?.name)}</p>
          <p>
            Manzil: {abonentData.mahallaName} {abonentData.streetName}
          </p>
          <p>Shaxsiy hisob raqami: {abonentData?.accountNumber}</p>
          <p>
            <b>Abonent: {abonentData?.fullName}</b>
          </p>
          <p>
            Jami {aniqlanganYashovchiSoni} ({raqamlar[aniqlanganYashovchiSoni]}) nafar shaxs {olderPeriod.year()} yilning “
            {olderPeriod.date()}” {lotinga(oylar[olderPeriod.month()])} oyidan buyon birga istiqomat qilishi aniqlandi.
          </p>
          <p>{asoslantiruvchi}</p>
          <p>
            Yuqoridagilarga va asoslantiruvchi hujjatlarga muvofiq, {date.getFullYear()} yilning {lotinga(oylar[date.getMonth()])} oyida
            hisobga olishning yagona elektron tizimida mazkur abonent to‘g‘risidagi ma’lumotlarga tegishli o‘zgartirishlar kiritish hamda
            to‘lovlarni qayta hisob-kitob qilishni maqsadga muvofiq deb hisoblaymiz.
          </p>

          <p>
            *) asoslantiruvchi hujjatlar (doimiy yoki vaqtincha propiska qilinganligini tasdig‘i, FHDYOning tug‘ilganlikni qayd etish
            to‘g‘risidagi va boshqa ma’lumotlar) mavjud bo‘lsa ularning nusxalari ilova qilinadi.
          </p>
          <ImzolashJoyi abonentData={abonentData} mahalla={mahalla} mahalla2={mahalla2} documentType={documentType} gpsOperator={{}} />
        </div>
      ) : (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify' }}>
          <p style={{ textAlign: 'center' }}>
            <b>Abonentlar bilan birga istiqomat qiluvchi shaxslar sonini kamayganligi yoki ko'payganligi aniqlash</b>
          </p>
          <p style={{ textAlign: 'center' }}>
            <b>DALOLATNOMASI</b>
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              lineHeight: '50px'
            }}
          >
            <div>
              "{date.getDate()}" {lotinga(oylar[date.getMonth()])} {date.getFullYear()} yil
            </div>
            <div>{mahalla?.company?.locationName}</div>
          </div>
          <p
            style={{
              textAlign: 'justify',
              textIndent: '40px'
            }}
          >
            Biz quyidagi imzo chekuvchilar, Samarqand viloyat {mahalla.company?.locationName}, {lotinga(mahalla?.data?.name)} MFY dagi,{' '}
            {lotinga(abonentData.streetName)} ko'chasi, uy {abonentData.house.homeNumber} kv {abonentData.house.homeIndex} xonadonida
            istiqomat qiluvchi fuqaroning pasport ma'lumotlari seriya {abonentData.citizen.passport} PNFL {abonentData.citizen.pnfl},
            xonadonning kadastr raqami {abonentData.house.cadastralNumber}, tel raqami {abonentData.citizen.phone}
          </p>
          <p style={{ textAlign: 'justify', textIndent: '40px' }}>
            F.I.Sh. {formatName(abonentData.fullName)}, {lotinga(mahalla.data.name)} MFY raisi{' '}
            {fullNameToShortName(mahalla?.data?.mfy_rais_name || '')}, {mahalla.company.name} {mahalla.company.locationName} aholi bo'lim
            boshlig'i {lotinga(fullNameToShortName(mahalla.company.manager.fullName))}lar mazkur dalolatnomani shu haqida tuzdik
          </p>
          <p style={{ textAlign: 'justify', textIndent: '40px' }}>
            Fuqaro {formatName(abonentData.fullName)}ning xonadonida oila a'zolari soni yagona elektron tizimda{' '}
            {abonentData.house.inhabitantCnt} nafar ko'rsatilgan. O'rganish natijasida esa quyidagilar aniqlandi. {olderPeriod.year()} yil «
            {olderPeriod.date()}» {oylar[olderPeriod.month()]}dan boshlab {aniqlanganYashovchiSoni} nafar oila a'zolari istiqomat qilishi
            aniqlandi.
          </p>
          {asoslantiruvchi && <p style={{ textAlign: 'justify', textIndent: '40px' }}>{asoslantiruvchi}</p>}
          <p style={{ textAlign: 'justify', textIndent: '40px' }}>
            {' '}
            Sababli yagona elektron tizimda qayta hisob kitob qilish maqsadga muvofiq deb hisoblaymiz. Abonentnig shaxsiy hisob raqami:{' '}
            {abonentData.accountNumber}
          </p>
          <ImzoJoyiRow label={mahalla.company.name + ' nazoratchisi'} name={mahalla.data.biriktirilganNazoratchi?.inspector_name} />
          <br />
          <ImzoJoyiRow label={"Aholi bo'limi boshlig'i"} name={mahalla.company.manager.fullName} />
          <br />
          <ImzoJoyiRow label={'Abonent'} name={abonentData.fullName} />
          <br />
          <ImzoJoyiRow label={lotinga(mahalla.data.name) + ' MFY raisi'} name={mahalla.data.mfy_rais_name} />
          <br />
        </div>
      )}
    </>
  );
}

export default OdamSoni;
