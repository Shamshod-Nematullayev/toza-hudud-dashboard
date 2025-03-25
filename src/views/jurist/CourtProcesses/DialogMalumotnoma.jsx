import React, { useRef } from 'react';
import { Dialog, DialogContent } from '@mui/material';

function DialogMalumotnoma({ open, handleClose }) {
  const printSectionRef = useRef();
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
            Sizga shuni yozib ma’lum qilamizki, <b>23.03.2024</b> yilda Kattaqo‘rg‘on tuman fuqarolik ishlari bo‘yicha tumanlararo sudi
            chiqargan <b>2-1402-2403/4831</b> sonli qarorda qarzdor <b>Mitanov Sattor Boboraximovich</b>dan <b>400 864.00 so‘m</b> asosiy
            qarzdorlik undirilishi buyirilgan. Mazkur qarzdor bugungi kunda ushbu asosiy qarzdorlikni to‘liq qoplab berdi. Abonent raqami:{' '}
            <b>105120500110</b>
          </p>
          <p style={{ fontStyle: 'italic', textIndent: '30px', fontSize: 16 }}>Ma’lumotnoma so‘ralgan joyga taqdim qilish uchun berildi</p>
          <p
            style={{
              textIndent: '30px',
              fontSize: 16,
              textAlign: 'justify',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ width: 200 }}>“Anvarjon Biznes Invest” MChJ Kattaqo‘rg‘on tuman filiali raxbari:</div>
            <div>______</div>
            <div>A.Sadriddinov</div>
          </p>
          <p style={{ fontStyle: 'italic', fontSize: 14 }}>Sh.Ne’matullayev</p>
        </section>
      </DialogContent>
    </Dialog>
  );
}

export default DialogMalumotnoma;
