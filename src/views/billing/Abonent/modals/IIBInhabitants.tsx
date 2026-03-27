import React, { useEffect, useRef, useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { PermamentsResponse, useAbonentStore } from '../abonentStore';
import { Backdrop, Button, CircularProgress, DialogActions, Typography } from '@mui/material';
import styled from 'styled-components';
import { t } from 'i18next';
import dayjs from 'dayjs';
import { red } from '@mui/material/colors';
import { useReactToPrint } from 'react-to-print';
import { reactToPrintDefaultOptions } from 'store/constant';
import api from 'utils/api';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const StyledTable = styled.table`
  text-align: center;
  border-collapse: collapse;
  margin: 10px auto;
  border-color: ${({ theme }) => theme.colors.colors.primaryMain};
  th,
  td {
    padding: 5px 10px;
  }
`;

function IIBInhabitants() {
  const { openIIBInhabitantsDialog: open, setOpenIIBInhabitantsDialog, getIIBInhabitants, abonentDetails } = useAbonentStore();
  const [details, setDetails] = useState<PermamentsResponse>();
  const [loading, setLoading] = useState(false);

  const handleAddInhabitantsByIIB = async () => {
    // try {
    //   // 1. Yangi PDF hujjat yaratamiz
    //   const pdfDoc = await PDFDocument.create();
    //   const page = pdfDoc.addPage([595.28, 841.89]); // A4 o'lchami
    //   const { width, height } = page.getSize();
    //   // 2. Shrifitni yuklaymiz
    //   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    //   const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    //   // 3. Ma'lumotlarni chizamiz (details ob'ektidan foydalanib)
    //   page.drawText("AHOLINI RO'YXATGA OLISH (IIB)", {
    //     x: 150,
    //     y: height - 50,
    //     size: 18,
    //     font: boldFont,
    //     color: rgb(0, 0, 0)
    //   });
    //   page.drawText(`F.I.O: ${details?.house?.owners[0].name || "Noma'lum"}`, {
    //     x: 50,
    //     y: height - 100,
    //     size: 12,
    //     font: font
    //   });
    //   page.drawText(`Manzil: ${details?.house?.fullAddress || "Ko'rsatilmagan"}`, {
    //     x: 50,
    //     y: height - 120,
    //     size: 12,
    //     font: font
    //   });
    //   // 4. Agar QR kod kerak bo'lsa (qrcode.react orqali olingan rasm bo'lsa)
    //   // QR kodni rasm sifatida embed qilish mumkin (ixtiyoriy)
    //   // 5. PDF-ni saqlaymiz (Uint8Array qaytaradi)
    //   const pdfBytes = await pdfDoc.save();
    //   // 6. Yuklab olish jarayoni
    //   const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    //   const url = URL.createObjectURL(blob);
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.download = 'inhabitants_client.pdf';
    //   document.body.appendChild(link);
    //   link.click();
    //   // Tozalash
    //   document.body.removeChild(link);
    //   URL.revokeObjectURL(url);
    //   console.log("Mening Lordim, PDF qurilmaning o'zida muvaffaqiyatli yaratildi!");
    // } catch (error) {
    //   console.error('Xatolik, mening Lordim:', error);
    // }
  };

  const handleClose = () => {
    setOpenIIBInhabitantsDialog(false);
  };

  const printSectionRef = useRef<any>(null);
  const printFunc = useReactToPrint({
    ...reactToPrintDefaultOptions,
    contentRef: printSectionRef
  });

  useEffect(() => {
    if (open && abonentDetails) {
      setLoading(true);
      (async () => {
        const details = await getIIBInhabitants(abonentDetails.house.cadastralNumber);
        setDetails(details);
        setLoading(false);
      })();
    }
  }, [open]);
  return (
    <DraggableDialog
      open={open}
      title=""
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          width: '80%',
          maxWidth: '1000px',
          overflow: 'hidden'
        }
      }}
    >
      <div className="page" ref={printSectionRef}>
        <Backdrop
          sx={{
            color: '#fff',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: (theme) => theme.zIndex.drawer + 1
          }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Typography variant="h3" align="center">
          Migratsiya va fuqarolikni rasmiylashtirish bosh boshqarmasi (Passport-Viza tizimi) elektron manzil boʻyicha doimiy va vaqtincha
          roʻyxatga olinganlar
        </Typography>
        <StyledTable border={1}>
          <tr>
            <td>{t('tableHeaders.fullName')}</td>
            <td style={{ width: 400 }}>{details?.house?.owners[0].name}</td>
          </tr>
          <tr>
            <td>{t('tableHeaders.address')}</td>
            <td>{details?.house?.fullAddress}</td>
          </tr>
          <tr>
            <td>{t('tableHeaders.cadastralNumber')}</td>
            <td>{details?.house?.cadastralNumber}</td>
          </tr>
          <tr>
            <td>{t('tableHeaders.passport')}</td>
            <td>{details?.house?.owners[0].passport}</td>
          </tr>
          <tr>
            <td>{t('tableHeaders.pnfl')}</td>
            <td>{details?.house?.owners[0].pinfl}</td>
          </tr>
        </StyledTable>
        <StyledTable border={1}>
          <thead>
            <tr>
              <th>{'№'}</th>
              <th>{t('tableHeaders.fullName')}</th>
              <th>{t('tableHeaders.status')}</th>
              <th>{t('tableHeaders.pnfl')}</th>
              <th>{t('tableHeaders.registeredAt')}</th>
              <th>{t('tableHeaders.unregisteredAt')}</th>
              <th>{t('tableHeaders.birthDate')}</th>
              <th>{t('tableHeaders.sex')}</th>
            </tr>
            {details?.Data.PermanentPersons?.map((permament, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{permament.Person}</td>
                <td>{permament.Status === 1 ? "Doimiy ro'yxatdan o'tgan" : "Doimiy ro'yxatdan o'tmagan"}</td>
                <td>{permament.Pinpp}</td>
                <td>{dayjs(permament.RegistrationDate).format('DD.MM.YYYY')}</td>
                <td>{''}</td>
                <td>{permament.DateBirth}</td>
                <td>{permament.Sex === '1' ? 'Erkak' : 'Ayol'}</td>
              </tr>
            ))}
          </thead>
        </StyledTable>
      </div>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          {t('buttons.close')}
        </Button>
        <Button onClick={handleAddInhabitantsByIIB} variant="contained" color="secondary">
          {t('buttons.addToMultipleLivings')}
        </Button>
        <Button onClick={() => printFunc()} variant="contained" color="primary">
          {t('buttons.print')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default IIBInhabitants;
