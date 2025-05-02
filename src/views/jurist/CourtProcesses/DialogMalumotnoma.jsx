import React, { useRef } from 'react';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import { reactToPrintDefaultOptions } from 'store/constant';

function DialogMalumotnoma({ open, handleClose, data }) {
  const printSectionRef = useRef();
  const handleClickPrintButton = useReactToPrint({
    ...reactToPrintDefaultOptions,
    documentTitle: data.case_number + "ma'lumotnoma",
    contentRef: printSectionRef
  });
  return (
    <Dialog open={open}>
      <DialogContent>
        <section ref={printSectionRef}>
          <h2
            style={{
              textAlign: 'center',
              letterSpacing: '5px'
            }}
          >
            MA’LUMOTNOMA
          </h2>
          <br />
          <p
            style={{
              textIndent: '30px',
              fontSize: 16,
              textAlign: 'justify'
            }}
          >
            Sizga shuni yozib ma’lum qilamizki, <b>{data.hearing_date}</b> yilda Kattaqo‘rg‘on tuman fuqarolik ishlari bo‘yicha tumanlararo
            sudi chiqargan <b>{data.case_number}</b> sonli qarorda qarzdor <b>{}</b>dan <b>{data.claimAmount?.toLocaleString()}.00 so‘m</b>{' '}
            asosiy qarzdorlik undirilishi buyirilgan. Mazkur qarzdor bugungi kunda ushbu asosiy qarzdorlikni to‘liq qoplab berdi. Abonent
            raqami: <b>{data.accountNumber}</b>
          </p>
          <p style={{ fontStyle: 'italic', textIndent: '30px', fontSize: 16 }}>Ma’lumotnoma so‘ralgan joyga taqdim qilish uchun berildi</p>
          <p
            style={{
              textIndent: '30px',
              fontSize: 16,
              textAlign: 'justify',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'end'
            }}
          >
            <div style={{ width: 200 }}>“Anvarjon Biznes Invest” MChJ Kattaqo‘rg‘on tuman filiali raxbari:</div>
            <div>______</div>
            <div>A.Sadriddinov</div>
          </p>
          <p style={{ fontStyle: 'italic', fontSize: 14 }}>Sh.Ne’matullayev</p>
        </section>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Bekor qilish
        </Button>
        <Button variant="contained" onClick={handleClickPrintButton}>
          Chop etish
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DialogMalumotnoma;
