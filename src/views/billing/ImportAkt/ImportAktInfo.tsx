import { Dialog, DialogTitle } from '@mui/material';
import { t } from 'i18next';
import React from 'react';

function ImportAktInfo({ handleClose, open }: { handleClose: () => void; open: boolean }) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{t('importAktsPage.infoTitle')}</DialogTitle>
      <p>Ushbu qo‘llanma orqali tizimga aktlarni import qilish jarayoni batafsil tushuntiriladi.</p>

      <h2>1. Sahifa elementlari va ularning vazifalari</h2>
      <p>Saytda aktlarni import qilish uchun 4 ta input mavjud:</p>

      <h3>1.1. Akt pachkalarini tanlash (Selection Input)</h3>
      <ul>
        <li>Bu input orqali aktlar joylashtiriladigan pachka tanlanadi.</li>
        <li>Tanlash ro‘yxatida mavjud pachka nomlari va ularning yaratilgan sanalari ko‘rsatilgan.</li>
        <li>Agar akt pachkasi allaqachon tanlangan bo‘lsa, 2-input avtomatik yashiriladi.</li>
      </ul>

      <h3>1.2. Akt pachka turini tanlash (Selection Input)</h3>
      <ul>
        <li>Bu input faqat 1-inputda yangi pachka tanlanganda ko‘rinadi.</li>
        <li>Pachka turi tanlangan holda, tizim avtomatik ushbu turdagi yangi pachkani yaratadi va aktlar shu pachkaga joylanadi.</li>
        <li>Agar 1-inputda mavjud pachka tanlangan bo‘lsa, bu input avtomatik yashiriladi.</li>
      </ul>

      <h3>1.3. PDF faylni yuklash (File Input)</h3>
      <ul>
        <li>Ushbu inputga asoslantiruvchi hujjat sifatida PDF fayl yuklanadi.</li>
        <li>Har bir aktga PDF fayl avtomatik biriktiriladi.</li>
      </ul>

      <h3>1.4. Excel faylni yuklash (File Input)</h3>
      <ul>
        <li>Bu inputga import qilinadigan aktlarning ma’lumotlari joylashtirilgan Excel fayl yuklanadi.</li>
        <li>Excel fayl shabloni sahifada joylashgan “Shablonni yuklash” tugmasi orqali olinishi mumkin.</li>
        <li className="note">Shablonning birinchi qatori o‘zgartirilmasligi kerak. Ma’lumotlar ikkinchi qatordan boshlab kiritiladi.</li>
        <li className="warning">
          Bir import jarayonida tavsiya etilgan maksimal aktlar soni: <strong>300 tadan ortiq bo‘lmasligi kerak</strong>.
        </li>
      </ul>

      <h2>2. Import qilish tartibi</h2>
      <ol>
        <li>1-input orqali akt pachkasini tanlash yoki yangi pachka yaratish.</li>
        <li>Agar kerak bo‘lsa, 2-input orqali pachka turini tanlash.</li>
        <li>3-input orqali asoslantiruvchi PDF faylni yuklash.</li>
        <li>4-input orqali Excel faylni yuklash.</li>
        <li>“Import” tugmasini bosib jarayonni yakunlash.</li>
      </ol>
    </Dialog>
  );
}

export default ImportAktInfo;
