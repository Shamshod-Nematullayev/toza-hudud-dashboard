import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { t } from 'i18next';
import React from 'react';

function ImportAktInfo({ handleClose, open }: { handleClose: () => void; open: boolean }) {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{t('importAktsPage.infoTitle')}</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Ushbu qo‘llanma orqali tizimga aktlarni import qilish jarayoni batafsil tushuntiriladi.
        </Typography>

        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            1. Sahifa elementlari va ularning vazifalari
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Saytda aktlarni import qilish uchun 4 ta asosiy qadam mavjud:
          </Typography>

          <Box sx={{ pl: 2, mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              1.1. Akt pachkalarini tanlash (Selection Input)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Bu input orqali aktlar joylashtiriladigan mavjud pachka tanlanadi.
              <br />
              • Tanlash ro‘yxatida mavjud pachka nomlari va ularning yaratilgan sanalari ko‘rsatilgan.
              <br />• Agar akt pachkasi allaqachon tanlangan bo‘lsa, yangi pachka turi inputi yashiriladi.
            </Typography>
          </Box>

          <Box sx={{ pl: 2, mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              1.2. Akt pachka turini tanlash (Selection Input)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Bu input mavjud pachka tanlanmagan taqdirda yangi pachka yaratish uchun ko‘rinadi.
              <br />• Pachka turi tanlansa, tizim avtomatik ushbu turdagi yangi pachkani yaratib, aktlarni shu pachkaga biriktiradi.
            </Typography>
          </Box>

          <Box sx={{ pl: 2, mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              1.3. PDF faylni yuklash (File Input)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Ushbu bo‘limga asoslantiruvchi hujjat sifatida PDF fayl yuklanadi.
              <br />• Har bir import qilingan aktga ushbu PDF fayl biriktiriladi.
            </Typography>
          </Box>

          <Box sx={{ pl: 2, mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              1.4. Excel faylni yuklash (File Input)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Bu bo‘limga import qilinadigan aktlarning ma’lumotlari joylashtirilgan Excel fayl yuklanadi.
              <br />
              • Excel fayl shabloni sahifadagi “Shablonni yuklash” tugmasi orqali olinishi mumkin.
              <br />
              • <strong>Diqqat:</strong> Shablonning birinchi qatori o‘zgartirilmasligi kerak. Ma’lumotlar 2-qatordan boshlab
              kiritiladi.
              <br />• Bir import jarayonida tavsiya etilgan maksimal aktlar soni: <strong>300 tadan ortiq bo‘lmasligi kerak</strong>.
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            2. Import qilish tartibi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            1. Akt pachkasini tanlash yoki yangi pachka turini tanlash.
            <br />
            2. Asoslantiruvchi PDF faylni tizimga kiritish va serverga yuklanishini kutish.
            <br />
            3. Shablon asosida tayyorlangan Excel faylini tanlash.
            <br />
            4. “Aktlarni kiritish” tugmasini bosib jarayonni yakunlash.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" onClick={handleClose}>
          Tushundim
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImportAktInfo;
