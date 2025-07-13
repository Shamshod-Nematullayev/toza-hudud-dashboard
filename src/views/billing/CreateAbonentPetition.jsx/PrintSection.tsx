import React, { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import styled from 'styled-components';
import { lotinga } from '../../../helpers/lotinKiril';
import { Button, Dialog, DialogActions, DialogContent, FormControl, InputLabel, MenuItem, Select, TextareaAutosize } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import fullNameToShortName from 'views/tools/fullNameToShortName';
import api from 'utils/api';
import { reactToPrintDefaultOptions } from 'store/constant';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import OdamSoni from './Documents/OdamSoni';
import Dvaynik from './Documents/Dvaynik';
import Gps from './Documents/Gps';
import { IAbonentData, IMahalla } from './useStore';
import useCustomizationStore from 'store/customizationStore';
export const oylar = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
export const raqamlar = ['Nol', 'Bir', 'Ikki', 'Uch', 'To‘rt', 'Besh', 'Olti', 'Yetti', 'Sakkiz', 'To‘qqiz', 'O‘n', 'O‘n bir', 'O‘n ikki'];

export function formatName(name) {
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

function PrintSection({
  show,
  ariza,
  setShowPrintSection,
  abonentData,
  abonentData2,
  aniqlanganYashovchiSoni,
  documentType,
  muzlatiladi,
  mahalla,
  mahalla2,
  recalculationPeriods
}: {
  show: boolean;
  ariza: any;
  setShowPrintSection: any;
  abonentData: IAbonentData;
  abonentData2: IAbonentData;
  muzlatiladi: boolean;
  aniqlanganYashovchiSoni: number;
  documentType: string;
  mahalla: IMahalla;
  mahalla2: IMahalla;
  recalculationPeriods: any[];
}) {
  const [olderPeriod, setOlderPeriod] = useState(dayjs());
  const { documentVariantOdamSoni, setCustomization } = useCustomizationStore();

  const setDocumentVariantOdamSone = (e: '1' | '2') => setCustomization({ documentVariantOdamSoni: e });

  const componentRef = useRef(null);
  const printFunction = useReactToPrint({
    ...reactToPrintDefaultOptions,
    documentTitle: ariza.document_number,
    contentRef: componentRef
  });
  const [comment, setComment] = useState(ariza.comment || '');
  const { t } = useTranslation();
  const handleClose = () => {
    setShowPrintSection(false);
    if (ariza.document_type === 'odam_soni' && comment.length > 0) {
      api.patch('/arizalar/' + ariza._id, { comment });
    }
  };
  return (
    <Dialog
      open={show}
      sx={{
        '& .MuiDialog-paper': {
          width: '80%', // kenglikni belgilash
          maxWidth: '800px' // maksimal kenglik
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setShowPrintSection(false);
        }
      }}
    >
      <DialogContent style={{ margin: '40px 55px', fontSize: 14 }}>
        <div id="print" ref={componentRef}>
          {renderSwitch({
            abonentData,
            abonentData2,
            mahalla,
            mahalla2,
            aniqlanganYashovchiSoni,
            recalculationPeriods,
            documentType: ariza.document_type,
            date: ariza.date,
            muzlatiladi,
            asoslantiruvchi: comment,
            ariza,
            olderPeriod,
            setOlderPeriod
          })}
        </div>
      </DialogContent>
      {ariza.document_type === 'odam_soni' && (
        <DialogContent sx={{ height: 200, display: 'flex' }}>
          <FormControl fullWidth sx={{ width: '200px' }}>
            <InputLabel id="dument-variant-select-label">Variant</InputLabel>
            <Select
              labelId="dument-variant-select-label"
              id="document-variant-select"
              label="Variant"
              value={documentVariantOdamSoni}
              onChange={(e) => setDocumentVariantOdamSone(e.target.value)}
            >
              <MenuItem value="1">Variant 1</MenuItem>
              <MenuItem value="2">Variant 2</MenuItem>
            </Select>
          </FormControl>
          <DatePicker value={olderPeriod} onChange={(newValue) => setOlderPeriod(newValue)} label="dan boshlab" format="DD.MM.YY" />
          <FormControl fullWidth>
            <TextareaAutosize
              minRows={3}
              placeholder={t('createAbonentPetitionPage.Qoʻshimcha izohlar uchun')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </FormControl>
        </DialogContent>
      )}

      <DialogActions>
        <Button onClick={handleClose}>{t('buttons.close')}</Button>
        <Button variant="contained" color="primary" onClick={() => printFunction()}>
          {t('buttons.print')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function renderSwitch({
  date = new Date(),
  abonentData,
  abonentData2,
  asoslantiruvchi = '',
  mahalla,
  mahalla2,
  aniqlanganYashovchiSoni,
  documentType = 'odam_soni',
  recalculationPeriods,
  ariza,
  muzlatiladi,
  olderPeriod,
  setOlderPeriod
}: {
  date: Date;
  abonentData: IAbonentData;
  abonentData2: IAbonentData;
  asoslantiruvchi: string;
  mahalla: IMahalla;
  mahalla2: IMahalla;
  aniqlanganYashovchiSoni: number;
  documentType: string;
  recalculationPeriods: any[];
  ariza: any;
  muzlatiladi: any;
  olderPeriod: any;
  setOlderPeriod: any;
}) {
  const [photos, setPhotos] = useState([]);
  const company = JSON.parse(localStorage.getItem('company'));
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
    if (recalculationPeriods?.length) {
      const latestPeriod = recalculationPeriods.reduce((a, b) => {
        const aTime = new Date(a.startDate).getTime();
        const bTime = new Date(b.startDate).getTime();
        return aTime > bTime ? a : b;
      });

      if (latestPeriod?.startDate) {
        setOlderPeriod(dayjs(latestPeriod.startDate));
      }
    } else {
      setOlderPeriod(dayjs());
    }
  }, [recalculationPeriods]);

  switch (documentType) {
    case 'odam_soni':
      return (
        <OdamSoni
          abonentData={abonentData}
          aniqlanganYashovchiSoni={aniqlanganYashovchiSoni}
          olderPeriod={olderPeriod}
          ariza={ariza}
          asoslantiruvchi={asoslantiruvchi}
          mahalla={mahalla}
          mahalla2={mahalla2}
          date={date}
          documentType="odam_soni"
        />
      );
    case 'dvaynik':
      return (
        <Dvaynik
          abonentData={abonentData}
          mahalla={mahalla}
          date={date}
          documentType="dvaynik"
          ariza={ariza}
          company={company}
          abonentData2={abonentData2}
          mahalla2={mahalla2}
        />
      );
    case 'viza':
      return (
        <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
          <span style={{ top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
          <ArizaHeading abonentData={abonentData} />
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
          <ArizaHeading abonentData={abonentData} />
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
        <Gps
          abonentData={abonentData}
          mahalla={mahalla}
          date={date}
          documentType="gps"
          ariza={ariza}
          recalculationPeriods={recalculationPeriods}
          muzlatiladi={muzlatiladi}
          photos={photos}
        />
      );
  }
}

export const ImzoJoyiRow = ({ label, placeholder = '___________', name }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ width: 300 }}>{label}</div>
    <div>{placeholder}</div>
    <div style={{ width: 200 }}>{fullNameToShortName(name)}</div>
  </div>
);
export const ImzolashJoyi = ({ mahalla, abonentData, mahalla2, documentType, gpsOperator }) => {
  const company = mahalla?.company;
  mahalla = mahalla?.data;
  mahalla2 = mahalla2?.data;
  return (
    <>
      <ImzoJoyiRow label={`${company?.name} ${company?.locationName} filial raxbari:`} name={company?.manager.fullName} />
      <ImzoJoyiRow label="Abonentlar bilan ishlash bo‘limi xodimi:" name={company?.billingAdmin?.fullName} />
      <br />
      {gpsOperator?.fullName && (
        <>
          <ImzoJoyiRow label="GPS kuzatuv xodimi:" name={gpsOperator.fullName} />
          <br />
        </>
      )}

      <ImzoJoyiRow label="Axoli nazoratchisi:" name={lotinga(mahalla?.biriktirilganNazoratchi?.inspector_name)} />
      <br />
      <ImzoJoyiRow label="Fuqaro:" name={abonentData.fullName} />
      <br />
      <ImzoJoyiRow label={`${lotinga(mahalla?.name)} MFY raisi:`} name={lotinga(mahalla?.mfy_rais_name)} />

      {documentType === 'dvaynik' && mahalla2?.id != mahalla?.id && (
        <ImzoJoyiRow label={`${lotinga(mahalla2?.name)} MFY raisi:`} name={lotinga(mahalla2?.mfy_rais_name)} />
      )}
    </>
  );
};

export function ArizaHeading({ abonentData }: { abonentData: IAbonentData }) {
  const company = JSON.parse(localStorage.getItem('company'));
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
        {company?.locationName} {company?.name} rahbari {fullNameToShortName(company?.managerName)}ga {company?.locationName}{' '}
        {lotinga(abonentData.mahallaName)}da yashovchi fuqaro {formatName(abonentData.fullName)} tomonidan <br />
        Telefon: {formatPhoneNumber(abonentData.citizen?.phone)}
      </p>
    </div>
  );
}
export function ArizaTitle({ type }) {
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

export function QRSection({ ariza, date, abonentData }) {
  return (
    <>
      <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
        "{date.getDate()}" {lotinga(oylar[date.getMonth()])} {date.getFullYear()} yil _______ {formatName(abonentData.fullName)}
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

export default PrintSection;
