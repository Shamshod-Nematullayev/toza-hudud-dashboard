import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Pause from '@mui/icons-material/Pause';
import Stop from '@mui/icons-material/Stop';
import SmartToyOutlined from '@mui/icons-material/SmartToyOutlined';
import TelegramIcon from '@mui/icons-material/Telegram';
import GridOn from '@mui/icons-material/GridOn';
import Close from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from 'utils/api';
import useStore, { IFilters, IMahallaItem } from './useStore';
import { toPng } from 'html-to-image';

import { lotinga, kirillga } from 'helpers/lotinKiril';
import { formatName } from '../CreateAbonentPetition.jsx/PrintSection';
import useCustomizationStore, { defaultVisibleColumns } from 'store/customizationStore';

interface MacroManagerProps {
  printContentRef: React.RefObject<HTMLDivElement | null>;
}

export default function MacroManager({ printContentRef }: MacroManagerProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { mahallas, minSaldo, maxSaldo } = useStore();

  // Dialog & Widget holatlari
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Makros sozlamalari
  const [selectedMahallaIds, setSelectedMahallaIds] = useState<number[]>([]);
  const [macroAction, setMacroAction] = useState<'excel' | 'telegram'>('excel');
  const [macroMinSaldo, setMacroMinSaldo] = useState<string | number>(minSaldo || '');
  const [macroMaxSaldo, setMacroMaxSaldo] = useState<string | number>(maxSaldo || '');
  const [macroFilters, setMacroFilters] = useState<IFilters>({
    identified: '',
    elektrAccountNumberConfirmed: ''
  });

  // Jarayon holati
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentMahallaName, setCurrentMahallaName] = useState<string>('');
  const [statusLog, setStatusLog] = useState<{ id: number; name: string; status: 'success' | 'error'; message?: string }[]>([]);

  // Boshqaruv Reflari
  const isCancelledRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);

  // Dastlabki barcha mahallalarni tanlash
  useEffect(() => {
    if (mahallas.length > 0 && selectedMahallaIds.length === 0) {
      setSelectedMahallaIds(mahallas.map((m) => Number(m.id)));
    }
  }, [mahallas]);

  const handleSelectAllMahallas = () => {
    if (selectedMahallaIds.length === mahallas.length) {
      setSelectedMahallaIds([]);
    } else {
      setSelectedMahallaIds(mahallas.map((m) => Number(m.id)));
    }
  };

  const handleToggleMahalla = (id: number) => {
    setSelectedMahallaIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // 1 ta mahalla uchun Excel yuklash
  const processExcelForMahalla = async (mahallaId: number, mahallaName: string) => {
    const response = await api.get('/billing/get-abonents-by-mfy-id/' + mahallaId + '/excel', {
      responseType: 'blob',
      params: {
        minSaldo: macroMinSaldo,
        maxSaldo: macroMaxSaldo,
        identified: macroFilters.identified,
        etkStatus: macroFilters.elektrAccountNumberConfirmed
      }
    });
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Abonentlar_${mahallaName}.xlsx`;
    link.click();
  };

  // HTML jadvaldan Telegram uchun rasmlar generatsiya qilish
  const generateImagesForAbonents = async (abonentList: any[], mfyName: string): Promise<Blob[]> => {
    const { company, printTableSettings } = useCustomizationStore.getState();
    const isCyrillic = printTableSettings?.alphabet === 'cyrillic';
    const isMonochrome = printTableSettings?.colorMode === 'monochrome';
    const isCompact = printTableSettings?.lineDensity === 'compact';
    const visibleCols = printTableSettings?.visibleColumns || defaultVisibleColumns;
    const fontSize = printTableSettings?.fontSize || 13;
    const cellPadding = isCompact ? '3px 4px' : '5px 6px';

    const convertTxt = (text: any) => {
      if (!text && text !== 0) return '—';
      const str = String(text);
      return isCyrillic ? kirillga(str) : lotinga(str);
    };

    const formatAccNum = (accNum: string) => {
      if (!accNum) return '—';
      const clean = accNum.replace(/\s+/g, '');
      if (clean.length >= 12) {
        return `${clean.slice(0, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
      }
      return clean;
    };

    const maxRowsPerImage = 50;
    const images: Blob[] = [];

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '1000px';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.padding = '16px';
    tempContainer.style.color = '#000000';
    tempContainer.style.fontFamily = 'Roboto, sans-serif';
    document.body.appendChild(tempContainer);

    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;

    try {
      for (let i = 0; i < abonentList.length; i += maxRowsPerImage) {
        const slice = abonentList.slice(i, i + maxRowsPerImage);
        const partNum = Math.floor(i / maxRowsPerImage) + 1;
        const totalParts = Math.ceil(abonentList.length / maxRowsPerImage);

        let tableHtml = `
          <div style="background:#fff; color:#000; padding:12px; width:960px; box-sizing:border-box;">
            <table style="width:100%; border-collapse:collapse; margin-bottom:8px; font-size:12px;">
              <tbody>
                <tr>
                  <td style="font-size:11px; font-style:italic; color:#555;"><i>GreenZone ish boshqaruv tizimi</i></td>
                  <td style="text-align:right; font-size:12px; font-weight:bold;">${isCyrillic ? 'Сана' : 'Sana'}: ${dateStr}</td>
                </tr>
                <tr>
                  <td colspan="2" style="font-size:14px; font-weight:bold; padding-top:4px;">
                    ${convertTxt(company?.locationName || '')} / ${convertTxt(company?.name || '')}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="font-size:13px; font-weight:600; padding-top:2px;">
                    ${isCyrillic ? 'Маҳалла' : 'Mahalla'}: ${convertTxt(mfyName)} (${isCyrillic ? 'Жами' : 'Jami'}: ${abonentList.length} ${isCyrillic ? 'та абонент' : 'ta abonent'}${totalParts > 1 ? `, ${partNum}-${isCyrillic ? 'қисм' : 'qism'}` : ''})
                  </td>
                </tr>
              </tbody>
            </table>

            <table style="width:100%; border-collapse:collapse; font-size:${fontSize}px; table-layout:auto;">
              <thead>
                <tr style="background-color:#f0f0f0; border:1px solid #000; text-align:center; font-weight:bold;">
                  ${visibleCols.orderNum !== false ? `<th style="padding:${cellPadding}; border:1px solid #000; width:28px;">№</th>` : ''}
                  ${visibleCols.accountNumber !== false ? `<th style="padding:${cellPadding}; border:1px solid #000; white-space:nowrap;">${isCyrillic ? 'Ҳисоб рақам' : 'Hisob raqam'}</th>` : ''}
                  ${visibleCols.fullName !== false ? `<th style="padding:${cellPadding}; border:1px solid #000; max-width:230px;">${isCyrillic ? 'Ф.И.Ш' : 'F.I.Sh'}</th>` : ''}
                  ${visibleCols.streetName !== false ? `<th style="padding:${cellPadding}; border:1px solid #000; max-width:85px;">${isCyrillic ? 'Кўча' : 'Ko‘cha'}</th>` : ''}
                  ${visibleCols.homeNumber !== false ? `<th style="padding:${cellPadding}; border:1px solid #000; width:30px;">${isCyrillic ? 'Уй' : 'Uy'}</th>` : ''}
                  ${visibleCols.homeIndex !== false ? `<th style="padding:${cellPadding}; border:1px solid #000; width:30px;">${isCyrillic ? 'Индекс' : 'Indeks'}</th>` : ''}
                  ${visibleCols.flatNumber !== false ? `<th style="padding:${cellPadding}; border:1px solid #000; width:32px;">${isCyrillic ? 'Хонадон' : 'Xonadon'}</th>` : ''}
                  ${visibleCols.inhabitantCnt !== false ? `<th style="padding:${cellPadding}; border:1px solid #000; width:28px;">${isCyrillic ? 'Я' : 'Y'}</th>` : ''}
                  ${visibleCols.ksaldo !== false ? `<th style="padding:${cellPadding}; border:1px solid #000; white-space:nowrap;">${isCyrillic ? 'Қарздорлик' : 'Qarzdorlik'}</th>` : ''}
                  ${visibleCols.lastPayment !== false ? `
                    <th style="padding:${cellPadding}; border:1px solid #000; white-space:nowrap;">${isCyrillic ? 'Охирги тўлов' : 'Oxirgi to‘lov'}</th>
                    <th style="padding:${cellPadding}; border:1px solid #000; white-space:nowrap;">${isCyrillic ? 'Сана' : 'Sana'}</th>
                  ` : ''}
                  ${visibleCols.electricityAccountNumber !== false ? `<th style="padding:${cellPadding}; border:1px solid #000; white-space:nowrap;">${isCyrillic ? 'ЭТК' : 'ETK'}</th>` : ''}
                  ${visibleCols.phone !== false ? `<th style="padding:${cellPadding}; border:1px solid #000; white-space:nowrap;">${isCyrillic ? 'Телефон' : 'Telefon'}</th>` : ''}
                </tr>
              </thead>
              <tbody>
        `;

        slice.forEach((abonent: any, idx: number) => {
          const rowNum = i + idx + 1;
          const ksaldoNum = Number(abonent.ksaldo) || 0;
          const debtColor = !isMonochrome ? (ksaldoNum > 0 ? '#d32f2f' : ksaldoNum < 0 ? '#2e7d32' : '#000') : '#000';
          const isIdentified = Boolean(abonent.identified) || abonent.isIdentified === '✅';
          const shortName = abonent.fullName ? (abonent.fullName.length < 30 ? abonent.fullName : abonent.fullName.slice(0, 30) + '..') : '—';
          const bg = idx % 2 === 0 ? '#fff' : '#fafafa';

          tableHtml += `
            <tr style="background-color:${bg}; border:1px solid #000; font-size:${fontSize}px;">
              ${visibleCols.orderNum !== false ? `<td style="text-align:center; padding:${cellPadding}; border:1px solid #000;">${rowNum}</td>` : ''}
              ${visibleCols.accountNumber !== false ? `<td style="text-align:center; padding:${cellPadding}; border:1px solid #000; font-weight:bold; white-space:nowrap;">${formatAccNum(abonent.accountNumber)}</td>` : ''}
              ${visibleCols.fullName !== false ? `
                <td style="padding:${cellPadding}; border:1px solid #000; font-weight:500; max-width:230px; white-space:nowrap; overflow:hidden;">
                  ${convertTxt(formatName(shortName))} ${!isIdentified ? '⚠️' : ''}
                </td>
              ` : ''}
              ${visibleCols.streetName !== false ? `<td style="padding:${cellPadding}; border:1px solid #000; max-width:85px; white-space:nowrap; overflow:hidden;">${convertTxt(abonent.streetName || '—')}</td>` : ''}
              ${visibleCols.homeNumber !== false ? `<td style="text-align:center; padding:${cellPadding}; border:1px solid #000;">${abonent.homeNumber || ''}</td>` : ''}
              ${visibleCols.homeIndex !== false ? `<td style="text-align:center; padding:${cellPadding}; border:1px solid #000;">${abonent.homeIndex || ''}</td>` : ''}
              ${visibleCols.flatNumber !== false ? `<td style="text-align:center; padding:${cellPadding}; border:1px solid #000;">${abonent.flatNumber || ''}</td>` : ''}
              ${visibleCols.inhabitantCnt !== false ? `<td style="text-align:center; font-weight:bold; padding:${cellPadding}; border:1px solid #000;">${abonent.inhabitantCnt ?? 0}</td>` : ''}
              ${visibleCols.ksaldo !== false ? `<td style="text-align:right; font-weight:bold; color:${debtColor}; padding:${cellPadding}; border:1px solid #000; white-space:nowrap;">${Math.floor(ksaldoNum).toLocaleString()}</td>` : ''}
              ${visibleCols.lastPayment !== false ? `
                <td style="text-align:right; padding:${cellPadding}; border:1px solid #000; white-space:nowrap;">${abonent.lastPaymentAmount ? Number(abonent.lastPaymentAmount).toLocaleString() : '—'}</td>
                <td style="text-align:center; padding:${cellPadding}; border:1px solid #000; white-space:nowrap;">${abonent.lastPayDate ? String(abonent.lastPayDate).split('T')[0] : '—'}</td>
              ` : ''}
              ${visibleCols.electricityAccountNumber !== false ? `<td style="text-align:center; padding:${cellPadding}; border:1px solid #000; white-space:nowrap;">${abonent.electricityAccountNumber || '—'}</td>` : ''}
              ${visibleCols.phone !== false ? `<td style="text-align:center; padding:${cellPadding}; border:1px solid #000; white-space:nowrap;">${abonent.phone || '—'}</td>` : ''}
            </tr>
          `;
        });

        tableHtml += `
              </tbody>
            </table>
          </div>
        `;

        tempContainer.innerHTML = tableHtml;
        const elem = tempContainer.firstElementChild as HTMLElement;
        const dataUrl = await toPng(elem, { backgroundColor: '#ffffff' });
        const blob = await (await fetch(dataUrl)).blob();
        images.push(blob);
        tempContainer.innerHTML = '';
      }
    } finally {
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    }

    return images;
  };

  // 1 ta mahalla uchun Telegramga yuborish
  const processTelegramForMahalla = async (mahallaId: number, mahallaName: string) => {
    // 1. Abonentlarni olish
    const { data } = await api.get('/billing/get-abonents-by-mfy-id/' + mahallaId, {
      params: {
        minSaldo: macroMinSaldo,
        maxSaldo: macroMaxSaldo,
        identified: macroFilters.identified,
        etkStatus: macroFilters.elektrAccountNumberConfirmed
      }
    });

    if (!data.ok || !data.data || data.data.length === 0) {
      return; // Bo'sh bo'lsa o'tkazib yuborish
    }

    // 2. Rasmlarni generatsiya qilish
    const images = await generateImagesForAbonents(data.data, mahallaName);
    if (images.length === 0) return;

    const formData = new FormData();
    images.forEach((blob, index) => {
      formData.append(`image_${index + 1}`, blob, `abonentlar_${mahallaName}_${index + 1}.png`);
    });

    // 3. Backend endpoint orqali jo'natish
    await api.post('/billing/send-abonents-list-to-telegram', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: {
        minSaldo: macroMinSaldo,
        maxSaldo: macroMaxSaldo,
        mahalla_name: mahallaName,
        mahallaId,
        identified: macroFilters.identified,
        elektrAccountNumberConfirmed: macroFilters.elektrAccountNumberConfirmed
      }
    });
  };

  // Makrosni ishga tushirish
  const handleStartMacro = async () => {
    if (selectedMahallaIds.length === 0) {
      return toast.warning(t('Hech bo‘lmaganda 1 ta mahalla tanlang'));
    }

    setDialogOpen(false);
    setIsRunning(true);
    setIsPaused(false);
    isCancelledRef.current = false;
    isPausedRef.current = false;
    setCurrentIndex(0);
    setStatusLog([]);

    const targetList = mahallas.filter((m) => selectedMahallaIds.includes(Number(m.id)));

    for (let i = 0; i < targetList.length; i++) {
      // Bekor qilingan bo'lsa to'xtatish
      if (isCancelledRef.current) break;

      // Pauzada bo'lsa kutish
      while (isPausedRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (isCancelledRef.current) break;
      }
      if (isCancelledRef.current) break;

      const currentMfy = targetList[i];
      setCurrentIndex(i + 1);
      setCurrentMahallaName(currentMfy.name);

      try {
        if (macroAction === 'excel') {
          await processExcelForMahalla(Number(currentMfy.id), currentMfy.name);
        } else {
          await processTelegramForMahalla(Number(currentMfy.id), currentMfy.name);
        }

        setStatusLog((prev) => [...prev, { id: Number(currentMfy.id), name: currentMfy.name, status: 'success' }]);
      } catch (err: any) {
        console.error(`Makros xatolik (${currentMfy.name}):`, err);
        setStatusLog((prev) => [
          ...prev,
          { id: Number(currentMfy.id), name: currentMfy.name, status: 'error', message: err.message }
        ]);
      }

      // Kichik interval (serverni zo'riqtirmaslik uchun)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Tugagach
    setIsRunning(false);
    setDialogOpen(true); // Yakuniy hisobot uchun yana dialog ochiladi
    toast.success(t('Makros amali yakunlandi!'));
  };

  // Pauza / Davom ettirish
  const handleTogglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
  };

  // To'xtatish (Stop)
  const handleStop = () => {
    isCancelledRef.current = true;
    setIsRunning(false);
    setIsPaused(false);
    setDialogOpen(true);
    toast.info(t('Makros to‘xtatildi'));
  };

  const totalSelected = selectedMahallaIds.length;
  const progressPercent = totalSelected > 0 ? Math.round((currentIndex / totalSelected) * 100) : 0;

  return (
    <>
      {/* Makrosni boshlash tugmasi */}
      <Tooltip title={t('Avtomatlashtirilgan Makros (Batch Automation)')} arrow>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<SmartToyOutlined />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {t('Makros')}
        </Button>
      </Tooltip>

      {/* Makros Sozlamalari va Hisobot Dialogi */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <SmartToyOutlined color="secondary" />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {t('Abonentlar Makrosi')}
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setDialogOpen(false)}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {/* Agar avvalgi natijalar bo'lsa (Hisobot bloki) */}
          {statusLog.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                {t('Oxirgi makros hisoboti')}:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('Jami qayta ishlangan')}: <b>{statusLog.length} ta</b> (
                <span style={{ color: '#2e7d32' }}>
                  {statusLog.filter((s) => s.status === 'success').length} {t('muvaffaqiyatli')}
                </span>
                {statusLog.some((s) => s.status === 'error') && (
                  <span style={{ color: '#d32f2f', marginLeft: '6px' }}>
                    {statusLog.filter((s) => s.status === 'error').length} {t('xatolik')}
                  </span>
                )}
                )
              </Typography>
            </Paper>
          )}

          {/* 1. Bajariladigan Amal */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
              1. {t('Bajariladigan amalni tanlang')}
            </Typography>
            <RadioGroup row value={macroAction} onChange={(e) => setMacroAction(e.target.value as 'excel' | 'telegram')}>
              <FormControlLabel
                value="excel"
                control={<Radio size="small" color="success" />}
                label={
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <GridOn fontSize="small" color="success" />
                    <span>{t("Excel faylga yuklash")}</span>
                  </Stack>
                }
              />
              <FormControlLabel
                value="telegram"
                control={<Radio size="small" color="secondary" />}
                label={
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <TelegramIcon fontSize="small" color="secondary" />
                    <span>{t('Telegramga rasm qilib yuborish')}</span>
                  </Stack>
                }
              />
            </RadioGroup>
          </Box>

          {/* 2. Filtr parametrlari */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
              2. {t('Filtr parametrlari')}
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  size="small"
                  label={t('Saldo dan')}
                  type="number"
                  placeholder="0"
                  value={macroMinSaldo}
                  onChange={(e) => setMacroMinSaldo(e.target.value)}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  size="small"
                  label={t('Saldo gacha')}
                  type="number"
                  placeholder="0"
                  value={macroMaxSaldo}
                  onChange={(e) => setMacroMaxSaldo(e.target.value)}
                />
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="macro-ident-label">{t('Identifikatsiya')}</InputLabel>
                  <Select
                    labelId="macro-ident-label"
                    value={macroFilters.identified}
                    label={t('Identifikatsiya')}
                    onChange={(e) => setMacroFilters({ ...macroFilters, identified: e.target.value })}
                  >
                    <MenuItem value="">{t('Hammasi')}</MenuItem>
                    <MenuItem value={'true'}>{t('Identifikatsiyalangan')}</MenuItem>
                    <MenuItem value={'false'}>{t('Identifikatsiyalanmagan')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="macro-etk-label">{t('Elektr holati')}</InputLabel>
                  <Select
                    labelId="macro-etk-label"
                    value={macroFilters.elektrAccountNumberConfirmed}
                    label={t('Elektr holati')}
                    onChange={(e) =>
                      setMacroFilters({ ...macroFilters, elektrAccountNumberConfirmed: e.target.value })
                    }
                  >
                    <MenuItem value="">{t('Hammasi')}</MenuItem>
                    <MenuItem value={'true'}>{t('Tasdiqlangan')}</MenuItem>
                    <MenuItem value={'false'}>{t('Tasdiqlanmagan')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* 3. Mahallalar tanlovi */}
          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                3. {t('Mahallalar ro‘yxati')} ({selectedMahallaIds.length} / {mahallas.length})
              </Typography>
              <Button size="small" onClick={handleSelectAllMahallas} sx={{ textTransform: 'none' }}>
                {selectedMahallaIds.length === mahallas.length ? t('Barchasini bekor qilish') : t('Barchasini tanlash')}
              </Button>
            </Stack>

            <Paper
              variant="outlined"
              sx={{
                maxHeight: 180,
                overflowY: 'auto',
                p: 0.5,
                borderRadius: 2
              }}
            >
              <List dense disablePadding>
                {mahallas.map((mfy) => {
                  const isChecked = selectedMahallaIds.includes(Number(mfy.id));
                  return (
                    <ListItem key={mfy.id} disablePadding>
                      <ListItemButton onClick={() => handleToggleMahalla(Number(mfy.id))} sx={{ py: 0.3, px: 1, borderRadius: 1 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Checkbox edge="start" checked={isChecked} tabIndex={-1} disableRipple size="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="body2" sx={{ fontWeight: isChecked ? 600 : 400 }}>{mfy.name}</Typography>}
                          secondary={mfy.inspectorName ? <Typography variant="caption" color="text.secondary">{mfy.inspectorName}</Typography> : null}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            {t('Bekor qilish')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PlayArrow />}
            onClick={handleStartMacro}
            disabled={selectedMahallaIds.length === 0}
            sx={{ px: 3, borderRadius: 2 }}
          >
            {t('Makrosni ishga tushirish')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Suzib yuruvchi Mini Floating Widget (Progress Widget) */}
      {isRunning && (
        <Card
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 340,
            zIndex: 9999,
            borderRadius: 3,
            p: 2,
            border: '2px solid',
            borderColor: 'secondary.main',
            bgcolor: 'background.paper',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
          }}
        >
          <Stack spacing={1.5}>
            {/* Header */}
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <SmartToyOutlined color="secondary" sx={{ fontSize: 22 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {t('Makros bajarilmoqda...')}
                </Typography>
              </Stack>
              <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 700 }}>
                {progressPercent}%
              </Typography>
            </Stack>

            {/* Progress bar */}
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              color="secondary"
              sx={{ height: 8, borderRadius: 4 }}
            />

            {/* Joriy mahalla */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {t('Jarayon')}: <b>{currentIndex} / {totalSelected}</b> mahalla
              </Typography>
              <Typography variant="body2" noWrap sx={{ color: 'text.primary', mt: 0.2, fontWeight: 700 }}>
                📍 {currentMahallaName || t('Yuklanmoqda...')}
              </Typography>
            </Box>

            {/* Boshqaruv tugmalari (Play / Pause, Stop) */}
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              <Tooltip title={isPaused ? t('Davom ettirish') : t('Pauza')} arrow>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleTogglePause}
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  {isPaused ? <PlayArrow /> : <Pause />}
                </IconButton>
              </Tooltip>

              <Tooltip title={t('To‘xtatish')} arrow>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<Stop />}
                  onClick={handleStop}
                  sx={{ borderRadius: 2, textTransform: 'none', px: 2 }}
                >
                  {t('To‘xtatish')}
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        </Card>
      )}
    </>
  );
}
