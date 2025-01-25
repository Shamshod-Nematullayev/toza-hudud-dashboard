import React, { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import styled from 'styled-components';
import { lotinga } from '../../../helpers/lotinKiril';
import { Button, Dialog, DialogActions, DialogContent, FormControl, TextareaAutosize } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import fullNameToShortName from 'views/tools/fullNameToShortName';
import api from 'utils/api';
const StyledTable = styled.table`
  margin: auto;
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 10px;
    border: 1px solid #000;
    text-align: left;
  }
`;
const oylar = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
const raqamlar = ['Nol', 'Bir', 'Ikki', 'Uch', 'To‘rt', 'Besh', 'Olti', 'Yetti', 'Sakkiz', 'To‘qqiz', 'O‘n', 'O‘n bir', 'O‘n ikki'];

function formatName(name) {
  if (!name) return '';
  return name
    .toLowerCase() // Hamma harflarni kichik qilib o'zgartiradi
    .split(' ') // Har bir so'zni bo'lish uchun bo'sh joydan ajratadi
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Har bir so'zning birinchi harfini bosh harf qiladi
    .join(' '); // Ajratilgan so'zlarni bo'sh joy bilan birlashtiradi
}
function formatPhoneNumber(phone) {
  if (!phone) return '';
  const compCode = phone.slice(0, 2);
  const number = phone.slice(2, 9);
  return `+998(${compCode})${number}`;
}
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // Base64 natija
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob); // Blobni o'qish va base64ga aylantirish
  });
};

function renderSwitch({
  date = new Date(),
  abonentData = {},
  abonentData2 = {},
  asoslantiruvchi = '',
  mahalla,
  mahalla2,
  aniqlanganYashovchiSoni,
  documentType = 'odam_soni',
  recalculationPeriods = [],
  ariza,
  muzlatiladi
}) {
  const [olderPeriod, setOlderPeriod] = useState(new Date());
  const [photos, setPhotos] = useState([]);
  useEffect(() => {
    setPhotos([]);
    ariza.photos?.forEach((file_id) => {
      api.get(`/fetchTelegram/${file_id}`, { responseType: 'blob' }).then(async (blob) => {
        const base64 = await blobToBase64(blob.data);
        setPhotos((prev) => [...prev, base64]);
      });
    });
  }, [ariza]);

  useEffect(() => {
    if (recalculationPeriods.length)
      setOlderPeriod(
        new Date(
          recalculationPeriods.reduce((a, b) => (new Date(a.startDate).getTime() > new Date(b.startDate).getTime() ? a : b)).startDate
        )
      );
    else setOlderPeriod(new Date());
  }, [recalculationPeriods]);
  switch (documentType) {
    case 'odam_soni':
      return (
        <>
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
              <div>Kattaqo‘rg‘on tumani</div>
            </div>
            <p>
              <b>Quyidagi manzil bo‘yicha:</b>
            </p>
            <p>MFY nomi: {mahalla.name && lotinga(mahalla?.name)}</p>
            <p>
              Manzil: {abonentData?.mahallaName} {abonentData.streetName}
            </p>
            <p>Shaxsiy hisob raqami: {abonentData?.accountNumber}</p>
            <p>
              <b>Abonent: {abonentData?.fullName}</b>
            </p>
            <p>
              Jami {aniqlanganYashovchiSoni} ({raqamlar[aniqlanganYashovchiSoni]}) nafar shaxs {olderPeriod.getFullYear()} yilning “01”{' '}
              {lotinga(oylar[olderPeriod.getMonth()])} oyidan buyon birga istiqomat qilishi aniqlandi.
            </p>
            <p>
              Yuqoridagilarga va asoslantiruvchi hujjatlarga muvofiq, {date.getFullYear()} yilning {lotinga(oylar[date.getMonth()])} oyida
              hisobga olishning yagona elektron tizimida mazkur abonent to‘g‘risidagi ma’lumotlarga tegishli o‘zgartirishlar kiritish hamda
              to‘lovlarni qayta hisob-kitob qilishni maqsadga muvofiq deb hisoblaymiz.
            </p>
            <p>Asoslantiruvchi hujjatlar*:</p>
            <p>{asoslantiruvchi}</p>

            {asoslantiruvchi.length === 0 ? <p>_______________________________________________________________</p> : ''}
            {asoslantiruvchi.length < 70 ? <p>_______________________________________________________________</p> : ''}

            <p>
              *) asoslantiruvchi hujjatlar (doimiy yoki vaqtincha propiska qilinganligini tasdig‘i, FHDYOning tug‘ilganlikni qayd etish
              to‘g‘risidagi va boshqa ma’lumotlar) mavjud bo‘lsa ularning nusxalari ilova qilinadi.
            </p>
            <ImzolashJoyi abonentData={abonentData} mahalla={mahalla} mahalla2={mahalla2} documentType={documentType} />
          </div>
          <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
            <ArizaHeading abonentData={abonentData} mahalla={mahalla} />
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
            <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
              "{date.getDate()}" {oylar[date.getMonth()]} {date.getFullYear()} йил _______ {abonentData?.fullName}
            </p>
            {!ariza._id ? (
              ''
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <QRCodeCanvas
                  value={`ariza_${ariza._id}_${ariza.document_number}`}
                  size={150}
                  bgColor={'#ffffff'}
                  fgColor={'#000000'}
                  level={'Q'}
                  includeMargin={true}
                />
              </div>
            )}
          </div>
        </>
      );
    case 'dvaynik':
      return (
        <>
          <div className="page" style={{ fontSize: '16px', textAlign: 'justify' }}>
            <p style={{ textAlign: 'center' }}>
              <b>DALOLATNOMA</b>
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
              <div>Kattaqo‘rg‘on tumani</div>
            </div>
            <p
              style={{
                textAlign: 'justify',
                textIndent: '40px'
              }}
            >
              Biz quyidagi imzo chekuvchilar, Samarqand viloyati, Kattakurgon tumani, {lotinga(mahalla.name)} MFY raisi{' '}
              {fullNameToShortName(mahalla.mfy_rais_name)} , “ANVARJON BIZNES INVEST” MCHJ Kattaqo‘rg‘on tuman aholi nazoratchisi{' '}
              {fullNameToShortName(mahalla.biriktirilganNazoratchi?.inspector_name)}, Abonentlar bilan ishlash bo‘limi boshlig‘i
              Sh.Ne’matullayev mazkur dalolatnomani shu haqida tuzdik. MFY ro‘yxatini o‘rganish natijasida kuyidagi abonent
            </p>
            <StyledTable border={1} style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Haqiqiy hisob raqam</th>
                  <th>Abonent F. I. O.</th>
                  <th>Ikkilamchi hisob raqam</th>
                  <th>Abonent F. I. O.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{abonentData.accountNumber}</td>
                  <td>{abonentData.fullName}</td>
                  <td>{abonentData2.accountNumber}</td>
                  <td>{abonentData2.fullName}</td>
                </tr>
              </tbody>
            </StyledTable>
            <p
              style={{
                textAlign: 'justify',
                textIndent: '40px'
              }}
            >
              Ushbu abonentlar ikkilamchi hisob raqam bo‘lganligi sababli yagona elektron tizimda ikkilamchi hisob rakamga tushgan pul
              mablag‘larini haqiqiy hisob raqamga o‘tkazib, ikkilamchi abonentlarni o‘chirishni maqsadga muvofiq deb hisoblaymiz.
            </p>
            <ImzolashJoyi abonentData={abonentData} mahalla={mahalla} mahalla2={mahalla2} />
          </div>
          <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
            <span style={{ top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
            <ArizaHeading mahalla={mahalla} abonentData={abonentData} />
            <ArizaTitle type="ikkilamchi kod" />
            <p
              style={{
                fontWeight: 'bold',
                lineHeight: '40px',
                textIndent: '40px'
              }}
            >
              Shuni yozib ma’lum qilamanki mening {abonentData2.accountNumber} ikkilamchi hisob raqamimni haqiqiy{' '}
              {abonentData.accountNumber} hisob raqamimga dalolatnoma asosida ikkilamchi hisob-raqamimda to‘lovlar mavjud bo‘lsa, asosiy
              hisob-raqamga ko‘chirib, ikkilamchi hisob-raqamimni o‘chirib berishingizni so‘rayman.
            </p>
            <QRSection abonentData={abonentData} ariza={ariza} date={date} />
          </div>
        </>
      );
    case 'viza':
      return (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          <span style={{ top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
          <ArizaHeading mahalla={mahalla} abonentData={abonentData} />
          <br />
          <ArizaTitle type="pasport viza" />
          <br />
          <p
            style={{
              fontWeight: 'bold',
              lineHeight: '40px',
              textIndent: '40px'
            }}
          >
            Shuni yozib ma’lum qilamanki mening <span style={{ textDecoration: 'underline' }}>{abonentData.accountNumber}</span> hisob
            raqamim onlayn bazaga noto‘g‘ri hisob-kitob qilingani sababli pasport vizalari taqdim qilyapman. Ushbu pasport vizalarim asosida
            O‘zbekistonda yashamagan davrimni qayta hisob-kitob qilib berishingizni so‘rayman.
          </p>
          <QRSection abonentData={abonentData} ariza={ariza} date={date} />
        </div>
      );
    case 'death':
      return (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          <span style={{ top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
          <ArizaHeading mahalla={mahalla} abonentData={abonentData} />
          <br />
          <ArizaTitle type="oʻlim guvohnomasi" />
          <p
            style={{
              fontWeight: 'bold',
              lineHeight: '40px',
              textIndent: '40px'
            }}
          >
            Shuni yozib ma’lum qilamanki mening {abonentData.accountNumber} hisob raqamim onlayn bazaga noto‘g‘ri hisob-kitob qilingani
            sababli o‘lim guvohnoma taqdim qilyapman. Ushbu guvohnoma asosida qayta hisob-kitob qilib berishingizni so‘rayman.
          </p>

          <QRSection ariza={ariza} date={date} abonentData={abonentData} />
        </div>
      );
    case 'gps':
      return (
        <>
          <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
            <p style={{ textAlign: 'center' }}>
              <b>Tegishli sifatdagi xizmat ko‘rsatilmaganligi va uning oqibatida noreal qarzdorlik vujudga kelganligi to‘g‘risidagi</b>
            </p>
            <p style={{ textAlign: 'center' }}>
              <b>DALOLATNOMA</b>
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
              <div>Kattaqo‘rg‘on tumani</div>
            </div>
            <p>
              <b>Quyidagi manzil bo‘yicha:</b>
            </p>
            <p>MFY nomi: {mahalla.name && lotinga(mahalla?.name)}</p>
            <p>
              Manzil: {abonentData?.mahallaName} {abonentData.streetName}
            </p>
            <p>Shaxsiy hisob raqami: {abonentData?.accountNumber}</p>
            <p>
              <b>Abonent: {abonentData?.fullName}</b>
            </p>
            <p>
              Haqiqatdan ham abonent xonadoniga {new Date(recalculationPeriods[0]?.startDate).getFullYear()} yil{' '}
              {oylar[new Date(recalculationPeriods[0]?.startDate).getMonth()]} oyidan{' '}
              {new Date(recalculationPeriods[0]?.endDate).getFullYear()} yil {oylar[new Date(recalculationPeriods[0]?.endDate).getMonth()]}{' '}
              gacha yo‘lning yaroqsizligi sababli tegishli sifatdagi xizmat ko‘rsatilmaganligi aniqlandi.{' '}
              {muzlatiladi && <>Ushbu abonentga bugungi kunda ham xizmat ko‘rsatish imkoniyati mavjud emas.</>}
            </p>
            <p>
              Yuqoridagilarga va asoslantiruvchi hujjatlar va GPS ma’lumotlariga muvofiq, {date.getFullYear()} yilning{' '}
              {lotinga(oylar[date.getMonth()])} oyida hisobga olishning yagona elektron tizimida mazkur abonent to‘g‘risidagi ma’lumotlarga
              tegishli o‘zgartirishlar kiritish hamda to‘lovlarni qayta hisob-kitob qilishni maqsadga muvofiq deb hisoblaymiz.
            </p>
            <ImzolashJoyi abonentData={abonentData} mahalla={mahalla} documentType={documentType} />
          </div>
          <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
            <span style={{ top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
            <ArizaHeading mahalla={mahalla} abonentData={abonentData} />
            <br />
            <ArizaTitle type="xizmat ko'rsatilmagan" />
            <p
              style={{
                fontWeight: 'bold',
                lineHeight: '40px',
                textIndent: '40px'
              }}
            >
              Shuni yozib ma’lum qilamanki mening {abonentData.accountNumber} hisob raqamim onlayn bazaga noto‘g‘ri hisob-kitob qilingani
              sababli dalolatnoma taqdim qilayapman. Ushbu dalolatnoma asosida qayta hisob-kitob qilib berishingizni so‘rayman.
            </p>
            <QRSection ariza={ariza} date={date} abonentData={abonentData} />
          </div>
          <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
            <h3>MFY raisi:</h3>
            {photos?.map((photo) => {
              return <img src={photo} alt="" width="100%" />;
            })}
          </div>
        </>
      );
  }
}

const ImzoJoyiRow = ({ label, placeholder = '___________', name }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ width: 300 }}>{label}</div>
    <div>{placeholder}</div>
    <div style={{ width: 200 }}>{fullNameToShortName(name)}</div>
  </div>
);
const ImzolashJoyi = ({ mahalla, abonentData, mahalla2, documentType }) => {
  return (
    <>
      <ImzoJoyiRow label='"Anvarjon biznes invest" MCHJ Kattaqo‘rg‘on tuman filiali raxbari:' name="Sadriddinov Aziz" />
      <ImzoJoyiRow label="Abonentlar bilan ishlash bo‘limi xodimi:" name="Ne’matullayev Shamshod" />
      <br />
      <ImzoJoyiRow label="Axoli nazoratchisi:" name={lotinga(mahalla.biriktirilganNazoratchi?.inspector_name)} />
      <br />
      <ImzoJoyiRow label="Fuqaro:" name={abonentData.fullName} />
      <br />
      <ImzoJoyiRow label={`${lotinga(mahalla.name)} MFY raisi:`} name={lotinga(mahalla.mfy_rais_name)} />

      {documentType === 'dvaynik' && mahalla2.id !== mahalla.id && (
        <ImzoJoyiRow label={`${mahalla.name} MFY raisi:`} name={lotinga(mahalla.mfy_rais_name)} />
      )}
    </>
  );
};

function ArizaHeading({ mahalla, abonentData }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div></div>
      <p
        style={{
          width: 300,
          textAlign: 'justify',
          fontWeight: 'bold',
          textIndent: '40px',
          lineHeight: '30px'
        }}
      >
        Kattaqoʻrgʻon tumani “Anvarjon biznes invest” MChJ rahbari A.A.Sadriddinovga Kattaqoʻrgʻon tuman {lotinga(mahalla.name)} MFY-da
        yashovchi fuqaro {formatName(abonentData.fullName)} tomonidan <br />
        Telefon: {formatPhoneNumber(abonentData.citizen?.phone)}
      </p>
    </div>
  );
}
function ArizaTitle({ type }) {
  return (
    <>
      <h1
        style={{
          textAlign: 'center',
          fontSize: '24px',
          letterSpacing: 5
        }}
      >
        ARIZA
      </h1>
      <p style={{ textAlign: 'center' }}>
        <i>({type})</i>
      </p>
    </>
  );
}

function QRSection({ ariza, date, abonentData }) {
  return (
    <>
      <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
        "{date.getDate()}" {lotinga(oylar[date.getMonth()])} {date.getFullYear()} yil _______ {abonentData.fullName}
      </p>
      {ariza._id && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <QRCodeCanvas
            value={`ariza_${ariza._id}_${ariza.document_number}`}
            size={150}
            bgColor={'#ffffff'}
            fgColor={'#000000'}
            level={'Q'}
            includeMargin={true}
          />
        </div>
      )}
    </>
  );
}

function PrintSection({ show, ariza, setShowPrintSection, ...props }) {
  const componentRef = useRef(null);
  const printFunction = useReactToPrint({
    pageStyle: `@media print {
        @page {
        margin: 15mm 15mm 15mm 25mm;
        size: A4;
        }
        .page {
        page-break-after: always;
        }
    }`,
    documentTitle: 'Printing',
    contentRef: componentRef
  });
  const [comment, setComment] = useState('');

  return (
    <Dialog
      open={show}
      sx={{
        '& .MuiDialog-paper': {
          width: '80%', // kenglikni belgilash
          maxWidth: '800px' // maksimal kenglik
        }
      }}
    >
      <DialogContent style={{ margin: '40px 55px', fontSize: 14 }}>
        <div id="print" ref={componentRef}>
          {renderSwitch({ ...props, asoslantiruvchi: comment, ariza })}
        </div>
      </DialogContent>
      {ariza.document_type === 'odam_soni' && (
        <DialogContent>
          <FormControl fullWidth>
            <TextareaAutosize
              minRows={3}
              placeholder="Qoʻshimcha izohlar uchun"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </FormControl>
        </DialogContent>
      )}

      <DialogActions>
        <Button onClick={() => setShowPrintSection(false)}>Chiqish</Button>
        <Button variant="contained" color="primary" onClick={printFunction}>
          Chop etish
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PrintSection;
