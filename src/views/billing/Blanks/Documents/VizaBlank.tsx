import ImzolashJoyiBlank from '../ImzolashJoyiBlank';
import { Company } from '..';
import DateLocationHeader from './TimePlaceHeading';

function VizaBlank({ company }: { company: Company }) {
  return (
    <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
      <p style={{ textAlign: 'center' }}>
        <b>Abonentlar bilan birga istiqomat qiluvchi shaxslar xorijga chiqib kelganligini aniqlash</b>
      </p>
      <p style={{ textAlign: 'center' }}>
        <b>DALOLATNOMASI</b>
      </p>

      <DateLocationHeader company={company} />

      <p>
        <b>Quyidagi manzil bo‘yicha:</b>
      </p>
      <p>MFY nomi: ____________________________________________</p>
      <p>Manzil: ________________________________________________</p>
      <p>Shaxsiy hisob raqami: _________________________________</p>
      <p>
        <b>Abonent: ______________________________________________</b>
      </p>
      <p>
        Abonent xonadonida jami ______ kishi ro‘yxatga olingan. Shundan, mazkur dalolatnomaga xorijga chiqish pasport nusxalari ilova
        qilingan, shu xonadonda yashovchi bo‘lgan shaxsni O‘zbekistonda yashamagan davrlarini kirish-chiqish muhrlariga asosan qayta
        hisob-kitob qilish maqsadga muvofiq deb hisoblaymiz.
      </p>

      <ImzolashJoyiBlank company={company} />
    </div>
  );
}

export default VizaBlank;
