import { oylar } from '../PrintSection';
import { IAriza } from 'types/models';
import { cancelContractReasons, CancelContractReason, IMahalla } from '../useStore';
import { lotinga } from 'helpers/lotinKiril';
import { AbonentDetails } from 'types/billing';
import { QRSection } from '../DocumentComponents/QRSection';
import { ImzolashJoyi } from '../DocumentComponents/ImzolashJoyi';
import { formatParticipantsText } from '../participantResolver';
import fullNameToShortName from 'views/tools/fullNameToShortName';
import useCustomizationStore from 'store/customizationStore';

/**
 * Shartnomani bekor qilish dalolatnomasi: abonent amalda mavjud emas (mahallada yo'q, noto'g'ri shaxsga ochilgan,
 * takroriy va h.k.). Abonentning o'zi yo'qligi sababli ariza sahifasi yo'q — faqat dalolatnoma.
 */
function CancelContract({
  ariza,
  abonentData,
  date,
  mahalla,
  asoslantiruvchi,
  participants
}: {
  ariza: IAriza;
  abonentData: AbonentDetails;
  date: Date;
  mahalla: IMahalla;
  asoslantiruvchi?: string;
  participants?: any[];
}) {
  const { company, user } = useCustomizationStore();
  const b = ariza.bekorQilish;
  const sabab = cancelContractReasons[b?.sabab as CancelContractReason] || cancelContractReasons.mahallada_mavjud_emas;
  const inhabitantCnt = b?.inhabitantCnt ?? ariza.current_prescribed_cnt ?? abonentData.house?.inhabitantCnt ?? 0;
  const kSaldo = Number(b?.kSaldo ?? abonentData.balance?.kSaldo ?? 0);
  const saldoText = kSaldo > 0 ? `${kSaldo.toLocaleString()} so'm qarzdorlik` : kSaldo < 0 ? `${(-kSaldo).toLocaleString()} so'm ortiqcha to'lov` : "0 so'm";
  // Asos alohida yozilgan bo'lsa, izoh (asoslantiruvchi) sifatida takror chiqmasin
  const izoh = asoslantiruvchi && asoslantiruvchi.trim() !== (b?.asos || '').trim() ? asoslantiruvchi : '';

  return (
    <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
      <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
      <p style={{ textAlign: 'center' }}>
        <b>Abonent bilan tuzilgan shartnomani bekor qilish to'g'risida</b>
      </p>
      <p style={{ textAlign: 'center' }}>
        <b>DALOLATNOMA</b>
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
      <p>MFY nomi: {mahalla.data?.name && lotinga(mahalla?.data?.name)}</p>
      <p>
        Manzil: {abonentData.mahallaName} {abonentData.streetName}
        {abonentData.house?.homeNumber ? `, ${abonentData.house.homeNumber}-uy` : ''}
      </p>
      <p>Shaxsiy hisob raqami: {abonentData?.accountNumber || ariza.licshet}</p>
      <p>
        <b>Abonent: {abonentData?.fullName || ariza.fio}</b>
      </p>
      <p style={{ textAlign: 'justify', textIndent: '40px' }}>
        {participants && participants.length > 0
          ? `Biz quyidagi imzo chekuvchilar: ${formatParticipantsText(participants)}lar mazkur dalolatnomani shu haqida tuzdik.`
          : `Biz quyidagi imzo chekuvchilar: ${lotinga(mahalla.data?.name || '')} MFY raisi ${fullNameToShortName(mahalla?.data?.mfy_rais_name || '')}, Mahalla yettiligi, ${company?.name || ''} ${company?.locationName || ''} aholi bo'lim boshlig'i ${lotinga(fullNameToShortName(ariza?.creatorName || ariza?.creator?.fullName || user?.fullName || company?.billingAdminName))}lar mazkur dalolatnomani shu haqida tuzdik.`}
      </p>
      <p style={{ textIndent: '40px' }}>
        O'rganish natijasida yuqoridagi shaxsiy hisob raqami bo'yicha abonent amalda mavjud emasligi aniqlandi. Sabab:{' '}
        <b>{sabab.toLowerCase()}</b>.
      </p>
      {b?.asos && <p style={{ textIndent: '40px' }}>Asos: {b.asos}</p>}
      <p style={{ textIndent: '40px' }}>
        Hozirgi kunda ushbu hisob raqamida {inhabitantCnt} nafar yashovchi ro'yxatda turibdi, saldo: {saldoText}. Yuqoridagilarga asosan
        abonent bilan tuzilgan maishiy chiqindilarni olib chiqib ketish xizmati shartnomasini bekor qilish, yashovchilar soni va
        saldoni 0 ga keltirish maqsadga muvofiq deb hisoblaymiz.
      </p>
      {izoh && <p style={{ textAlign: 'justify', textIndent: '40px', fontStyle: 'italic' }}>{izoh}</p>}
      <ImzolashJoyi abonentData={abonentData} mahalla={mahalla} documentType={'cancelContract'} ariza={ariza} participants={participants} />
      <div style={{ marginTop: '20px' }}>
        <QRSection ariza={ariza} date={date} />
      </div>
    </div>
  );
}

export default CancelContract;
