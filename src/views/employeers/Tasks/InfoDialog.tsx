import { t } from 'i18next';
import React from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';

function InfoDialog({ openInfoDialog, setOpenInfoDialog }: { openInfoDialog: boolean; setOpenInfoDialog: (open: boolean) => void }) {
  return (
    <DraggableDialog open={openInfoDialog} onClose={() => setOpenInfoDialog(false)} title={t('importAktsPage.info')}>
      <div>
        <h3>📌 Foydalanish tartibi</h3>

        <ol>
          <li>Excel faylni tizimga yuklang.</li>
          <li>
            Excel faylning <b>1-ustuni</b> bo‘yicha ma’lumotlar guruhlanadi.
          </li>
          <li>Har bir guruh alohida jadval ko‘rinishida rasmga aylantiriladi.</li>
          <li>Hosil bo‘lgan rasmlar nazoratchilar Telegram guruhiga yuboriladi.</li>
          <li>Agar topshiriqnoma kiritilgan bo‘lsa, u inspektorlarga alohida xabar sifatida jo‘natiladi.</li>
        </ol>

        <p>⚠️ Eslatma: Excel fayldagi birinchi ustun majburiy bo‘lib, u orqali guruhlash amalga oshiriladi.</p>
      </div>
    </DraggableDialog>
  );
}

export default InfoDialog;
