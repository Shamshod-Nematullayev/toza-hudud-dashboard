import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HelpOutlineIcon color="primary" />
        <Typography variant="h4">Debitorlarni Undirish Tizimi — Qo'llanma va Shartlar</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {/* 1. Joblar ketma-ketligi */}
          <Box>
            <Typography variant="h5" color="primary" gutterBottom>
              ⚙️ 1. Ish Jarayonlari Ketma-ketligi (Background Jobs)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tizim 3 ta ketma-ket avtomatlashtirilgan fonda ishlovchi jarayon (job) orqali ishlaydi:
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  🔹 Job 0: TozaMakon Sinxronizatsiyasi (`syncCompanyDebitorsTozamakon`)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  TozaMakon bazasidan qarzdorlarni yuklaydi, yangi debitorlarni boshlang'ich qarz summasi (`initialDebtAmount`) bilan bazaga
                  kiritadi. Qarzdorligi yopilgan abonentlarni `resolved` (hal etilgan) qiladi va qarz summasini 0 qiladi.
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  ⚡ Job 1: HET Elektr Hisob Kodi va Bloklanish Tekshiruvi (`processDebitorsHetAccounts`)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  HET bazasidan elektr hisob kodi (ETK) hamda amaldagi blokirovkalar holatini aniqlaydi. Blokda bo'lgan debitorlarning
                  elektr kodi va telefon raqami avtomatik `confirmed` (tasdiqlangan) deb belgilandi.
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  📱 Job 2: Telefon va SMS Ogohlantirish Ishlovi (`processDebitorsPhoneAndSms`)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Bloklanmagan debitorlar uchun SMS ogohlantirishlar yuboradi va HET/TozaMakon telefon raqamlarini sinovdan o'tkazadi. SMS
                  failed bo'lsa yoki HETda telefon xato bo'lsa, avtomatik TozaMakon telefoniga va `needs_het_sync` statusiga o'tkazadi.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* 2. Operatsion Ish Navbatlari Matrix */}
          <Box>
            <Typography variant="h5" color="primary" gutterBottom>
              📊 2. Operatsion Ish Navbatlari va Statuslar Qoidasi
            </Typography>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" sx={{ cursor: 'pointer', alignItems: 'center' }} spacing={1}>
                  <Chip label="Diqqat talab" color="error" size="small" />
                  <Typography variant="subtitle2">`DATA_NEEDS_ATTENTION`</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  - <b>Elektr kodi yo'q (`hetAccountStatus: 'not_found'`)</b>: HET bazasidan elektr hisob raqami topilmadi.
                  <br />- <b>Telefon kiritilishi kerak (`phoneStatus: 'not_found'`)</b>: HETda ham, TozaMakonda ham ishlaydigan telefon
                  raqam yo'q.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Chip label="SMS Kutilmoqda" color="warning" size="small" />
                  <Typography variant="subtitle2">`SMS_PENDING_WAIT`</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  - <b>SMS yuborildi (`phoneStatus: 'checking'`)</b>: Debitorga SMS ogohlantirish yuborildi, yetkazib berilish va 3-kunlik
                  grace-period kutilmoqda.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Chip label="Uzishga tayyor" color="info" size="small" />
                  <Typography variant="subtitle2">`READY_TO_BLOCK`</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  - <b>100% Bloklashga tayyor (`phoneStatus: 'confirmed'`)</b>: HET va telefon tasdiqlangan, SMS yetkazilgan.
                  <br />- <b>HET Sinxronlash kutilmoqda (`phoneStatus: 'needs_het_sync'`)</b>: Raqam TozaMakonda topildi, lekin HET bazasiga
                  kiritilmagan bo'lganligi uchun avval HET sinxronizatsiya talab qilinadi.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Chip label="Bloklanganlar" color="secondary" size="small" />
                  <Typography variant="subtitle2">`CURRENTLY_BLOCKED`</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  - <b>Amalda bloklangan (`status: 'blocked'`)</b>: HET tizimida elektr energiyasi rasman uzilgan abonementlar.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Divider />

          {/* 3. Premium Endpointlar */}
          <Box>
            <Typography variant="h5" color="primary" gutterBottom>
              💎 3. Premium Tashkilotlar uchun API Endpointlar
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ushbu endpointlar orqali fondagi joblarni dasturiy ravishda ishga tushirish mumkin (Faqat Premium obunadagi tashkilotlar
              uchun):
            </Typography>
            <Stack spacing={0.5} sx={{ fontFamily: 'monospace', fontSize: 12 }}>
              <Typography variant="caption" sx={{ bgcolor: 'action.hover', p: 0.5, borderRadius: 1 }}>
                POST /api/billing/debitors/jobs/trigger-sync — (Job 0: TozaMakon sinxronlash)
              </Typography>
              <Typography variant="caption" sx={{ bgcolor: 'action.hover', p: 0.5, borderRadius: 1 }}>
                POST /api/billing/debitors/jobs/trigger-het-accounts — (Job 1: ETK & Block tekshirish)
              </Typography>
              <Typography variant="caption" sx={{ bgcolor: 'action.hover', p: 0.5, borderRadius: 1 }}>
                POST /api/billing/debitors/jobs/trigger-phone-sms — (Job 2: Telefon & SMS ishlovi)
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Tushunarli (Yopish)
        </Button>
      </DialogActions>
    </Dialog>
  );
};
