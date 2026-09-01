import React, { useEffect, useMemo, useRef, useState } from 'react';
import useStore, { IFilters } from './useStore';
import {
  MenuItem,
  Select,
  TextField,
  Button,
  InputLabel,
  FormControl,
  Box,
  Paper,
  Stack,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  RadioGroup,
  Radio,
  Slider,
  Checkbox,
  FormGroup,
  Divider,
  useTheme
} from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import TelegramIcon from '@mui/icons-material/Telegram';
import PrintIcon from '@mui/icons-material/PrintOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import api from 'utils/api';
import { toast } from 'react-toastify';
import GridOn from '@mui/icons-material/GridOn';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import PeopleAltOutlined from '@mui/icons-material/PeopleAltOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import RestartAlt from '@mui/icons-material/RestartAlt';
import TuneOutlined from '@mui/icons-material/TuneOutlined';
import ViewColumnOutlined from '@mui/icons-material/ViewColumnOutlined';
import { toPng } from 'html-to-image';
import { isMobile } from 'react-device-detect';
import MahallaSelection from 'ui-component/MahallaSelection';
import { useTranslation } from 'react-i18next';
import useCustomizationStore, { defaultVisibleColumns, ITableVisibleColumns } from 'store/customizationStore';
import MacroManager from './MacroManager';

interface Props {
  printContentRef: React.RefObject<HTMLDivElement | null>;
  getAbonents: () => void;
  filters: IFilters;
  setFilters: (e: any) => void;
}

export default function Header({ printContentRef, getAbonents, filters, setFilters }: Props) {
  const {
    selectedMahalla,
    setSelectedMahalla,
    abonents,
    mainFunctionsDisabled,
    setMainFunctionsDisabled,
    minSaldo,
    maxSaldo,
    setMinSaldo,
    setMaxSaldo
  } = useStore();

  const { printTableSettings, setPrintTableSettings } = useCustomizationStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const theme = useTheme();
  const { t } = useTranslation();

  const visibleCols: ITableVisibleColumns = printTableSettings?.visibleColumns || defaultVisibleColumns;

  const handleToggleColumn = (colKey: keyof ITableVisibleColumns) => {
    setPrintTableSettings({
      visibleColumns: {
        ...visibleCols,
        [colKey]: !visibleCols[colKey]
      }
    });
  };

  useEffect(() => {
    setMainFunctionsDisabled(abonents.length === 0);
  }, [abonents]);

  // Statistik xulosalar (Summary Metrics)
  const stats = useMemo(() => {
    if (!abonents || abonents.length === 0) {
      return { totalAbonents: 0, totalDebt: 0, totalInhabitants: 0, confirmedEtkCount: 0 };
    }
    const totalAbonents = abonents.length;
    const totalDebt = abonents.reduce((sum, a) => sum + (Number(a.ksaldo) || 0), 0);
    const totalInhabitants = abonents.reduce((sum, a) => sum + (Number(a.inhabitantCnt) || 0), 0);
    const confirmedEtkCount = abonents.filter((a) => a.isElektrKodConfirm).length;

    return { totalAbonents, totalDebt, totalInhabitants, confirmedEtkCount };
  }, [abonents]);

  const printFunc = useReactToPrint({
    pageStyle: `@media print {
      @page {
        margin: 5mm 5mm 5mm 5mm !important;
        size: A4;
      }
      .page {
        page-break-after: always;
      }
      * {
        color: #000;
      }
    }`,
    documentTitle: (abonents[0]?.mahallaName || 'Abonentlar') + '_' + new Date().getTime(),
    contentRef: printContentRef
  });

  const printFunction = () => {
    if (isMobile) {
      document.body.innerHTML = printContentRef.current.innerHTML;
      window.print();
    } else {
      printFunc();
    }
  };

  const handleClickUpdate = () => {
    getAbonents();
  };

  const handleResetFilters = () => {
    setSelectedMahalla('');
    setMinSaldo('');
    setMaxSaldo('');
    setFilters({ identified: '', elektrAccountNumberConfirmed: '' });
    useStore.getState().setAbonents([]);
  };

  const handleClickSendTelegramAsImg = async () => {
    if (abonents.length === 0) {
      return toast.error(t("Abonentlar ro'yxati bo'sh"));
    }

    const rows = document.querySelectorAll('.abonent_rows');
    const maxRowsPerImage = 50;
    const tempContainer = document.createElement('div');
    const images: Blob[] = [];

    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    try {
      toast.info(t('Rasmlar tayyorlanmoqda...'));
      for (let i = 0; i < rows.length; i += maxRowsPerImage) {
        const clonedTable = printContentRef.current.querySelectorAll('table')[1].cloneNode(true) as HTMLElement;
        const tbody = clonedTable.querySelector('tbody') as HTMLElement;

        const rowsToRender = Array.from(rows).slice(i, i + maxRowsPerImage);
        tbody.innerHTML = '';
        rowsToRender.forEach((row) => tbody.appendChild(row.cloneNode(true)));

        const elements = clonedTable.querySelectorAll('*');
        elements.forEach((el: any) => {
          el.style.color = '#000';
        });

        tempContainer.appendChild(clonedTable);
        const dataUrl = await toPng(clonedTable);
        const blob = await (await fetch(dataUrl)).blob();
        images.push(blob);
        tempContainer.innerHTML = '';
      }

      const formData = new FormData();
      images.forEach((blob, index) => {
        formData.append(`image_${index + 1}`, blob, `abonentlar_${index + 1}.png`);
      });

      const { data } = await api.post('/billing/send-abonents-list-to-telegram', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        params: {
          minSaldo,
          maxSaldo,
          mahalla_name: abonents[0]?.mahallaName,
          ...filters
        }
      });

      if (!data.ok) return toast.error(data.message);
      toast.success(t('Barcha rasmlar Telegramga muvaffaqiyatli yuborildi!'));
    } catch (error) {
      console.error('Rasm yuborishda xatolik:', error);
      toast.error(t('Rasm yuborishda xatolik yuz berdi.'));
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  const handleClickExcel = async () => {
    try {
      if (!abonents[0]?.mahallaId) return;
      const response = await api.get('/billing/get-abonents-by-mfy-id/' + abonents[0].mahallaId + '/excel', {
        responseType: 'blob',
        params: {
          minSaldo,
          maxSaldo,
          identified: filters.identified,
          etkStatus: filters.elektrAccountNumberConfirmed
        }
      });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Abonentlar_${abonents[0]?.mahallaName || ''}.xlsx`;
      link.click();
    } catch (err) {
      toast.error(t('Excel yuklab olishda xatolik'));
      console.error(err);
    }
  };

  const columnsList: { key: keyof ITableVisibleColumns; label: string }[] = [
    { key: 'orderNum', label: '№ Tartib raqami' },
    { key: 'accountNumber', label: 'Hisob raqam' },
    { key: 'fullName', label: 'F.I.Sh' },
    { key: 'streetName', label: "Ko'cha" },
    { key: 'homeNumber', label: 'Uy raqami' },
    { key: 'homeIndex', label: 'Uy indeksi' },
    { key: 'flatNumber', label: 'Xonadon' },
    { key: 'inhabitantCnt', label: 'Yashovchilar soni (Y/S)' },
    { key: 'ksaldo', label: 'Qarzdorlik / Saldo' },
    { key: 'lastPayment', label: "Oxirgi to'lov (Summa / Sana)" },
    { key: 'electricityAccountNumber', label: 'Elektr hisob raqam (ETK)' },
    { key: 'phone', label: 'Telefon raqam' }
  ];

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {/* 1-Qator: Xulosa Ko'rsatkichlari (Summary KPI Badges) & Eksport tugmalari */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            pb: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
            {/* Jami abonentlar */}
            <Paper
              elevation={0}
              sx={{
                px: 1.5,
                py: 0.8,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'primary.50',
                border: '1px solid',
                borderColor: 'primary.light'
              }}
            >
              <GroupOutlined color="primary" sx={{ fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1 }}>
                  {t('Jami abonentlar')}
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} color="primary.dark">
                  {stats.totalAbonents} ta
                </Typography>
              </Box>
            </Paper>

            {/* Jami qarzdorlik */}
            <Paper
              elevation={0}
              sx={{
                px: 1.5,
                py: 0.8,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'background.default'
                    : stats.totalDebt > 0
                    ? 'error.50'
                    : stats.totalDebt < 0
                    ? 'success.50'
                    : 'grey.50',
                border: '1px solid',
                borderColor: stats.totalDebt > 0 ? 'error.light' : stats.totalDebt < 0 ? 'success.light' : 'divider'
              }}
            >
              <AccountBalanceWalletOutlined color={stats.totalDebt > 0 ? 'error' : stats.totalDebt < 0 ? 'success' : 'action'} sx={{ fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1 }}>
                  {t('Jami saldo')}
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color={stats.totalDebt > 0 ? 'error.main' : stats.totalDebt < 0 ? 'success.main' : 'text.primary'}
                >
                  {stats.totalDebt.toLocaleString()} so'm
                </Typography>
              </Box>
            </Paper>

            {/* Jami yashovchilar */}
            <Paper
              elevation={0}
              sx={{
                px: 1.5,
                py: 0.8,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'info.50',
                border: '1px solid',
                borderColor: 'info.light'
              }}
            >
              <PeopleAltOutlined color="info" sx={{ fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1 }}>
                  {t('Yashovchilar soni')}
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} color="info.main">
                  {stats.totalInhabitants} kishi
                </Typography>
              </Box>
            </Paper>
          </Stack>

          {/* Asosiy Harakatlar (Makros, Print, Excel, Telegram, Sozlamalar) */}
          <Stack direction="row" spacing={1} sx={{ ml: 'auto', alignItems: 'center' }}>
            {/* Makros Avtomatlashtirish tugmasi */}
            <MacroManager printContentRef={printContentRef} />

            {/* Jadval sozlamalari */}
            <Tooltip title={t('Jadval sozlamalari (Shrift, Ustunlar, Rang)')} arrow>
              <IconButton
                onClick={() => setSettingsOpen(true)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.default'
                }}
              >
                <TuneOutlined fontSize="small" />
              </IconButton>
            </Tooltip>

            <Button
              disabled={mainFunctionsDisabled}
              onClick={printFunction}
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2 }}
            >
              {t('Chop etish')}
            </Button>
            <Button
              disabled={mainFunctionsDisabled}
              onClick={handleClickExcel}
              variant="outlined"
              color="success"
              startIcon={<GridOn />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              {t('Excel')}
            </Button>
            <Button
              disabled={mainFunctionsDisabled}
              onClick={handleClickSendTelegramAsImg}
              variant="outlined"
              color="secondary"
              startIcon={<TelegramIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              {t('Telegram')}
            </Button>
          </Stack>
        </Box>

        {/* 2-Qator: Filtrlar qatori */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1.2fr 1fr 1fr 1fr 1fr auto'
            },
            gap: 1.5,
            alignItems: 'center'
          }}
        >
          {/* Mahalla tanlash */}
          <MahallaSelection
            label={t('Mahalla')}
            size="small"
            selectedMahallaId={selectedMahalla}
            setSelectedMahallaId={setSelectedMahalla}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Saldo dan */}
          <TextField
            size="small"
            label={t('Saldo dan')}
            type="number"
            placeholder="0"
            value={minSaldo}
            onChange={(e) => setMinSaldo(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Saldo gacha */}
          <TextField
            size="small"
            label={t('Saldo gacha')}
            type="number"
            placeholder="0"
            value={maxSaldo}
            onChange={(e) => setMaxSaldo(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Identifikatsiya */}
          <FormControl fullWidth size="small">
            <InputLabel id="identity-label">{t('Identifikatsiya')}</InputLabel>
            <Select
              labelId="identity-label"
              value={filters.identified}
              label={t('Identifikatsiya')}
              onChange={(e) => setFilters({ ...filters, identified: e.target.value })}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">{t('Hammasi')}</MenuItem>
              <MenuItem value={'true'}>{t('Identifikatsiyalangan')}</MenuItem>
              <MenuItem value={'false'}>{t('Identifikatsiyalanmagan')}</MenuItem>
            </Select>
          </FormControl>

          {/* Elektr holati */}
          <FormControl fullWidth size="small">
            <InputLabel id="etk-label">{t('Elektr holati')}</InputLabel>
            <Select
              labelId="etk-label"
              value={filters.elektrAccountNumberConfirmed}
              label={t('Elektr holati')}
              onChange={(e) => setFilters({ ...filters, elektrAccountNumberConfirmed: e.target.value })}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">{t('Hammasi')}</MenuItem>
              <MenuItem value={'true'}>{t('Tasdiqlangan')}</MenuItem>
              <MenuItem value={'false'}>{t('Tasdiqlanmagan')}</MenuItem>
            </Select>
          </FormControl>

          {/* Tugmalar guruhi */}
          <Stack direction="row" spacing={1}>
            <Tooltip title={t('Filtrlarni tozalash')} arrow>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleResetFilters}
                sx={{ minWidth: 40, px: 1, borderRadius: 2 }}
              >
                <RestartAlt fontSize="small" />
              </Button>
            </Tooltip>

            <Button
              onClick={handleClickUpdate}
              variant="contained"
              color="primary"
              startIcon={<SyncOutlinedIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5, whiteSpace: 'nowrap' }}
            >
              {t('Yangilash')}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Jadval Customization Sozlamalari Dialogi */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{t('Jadval ko\'rinishi sozlamalari')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {/* Shrift o'lchami */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t('Shrift o\'lchami')}: <b>{printTableSettings?.fontSize || 12}px</b>
            </Typography>
            <Slider
              value={printTableSettings?.fontSize || 12}
              min={10}
              max={15}
              step={1}
              marks={[
                { value: 10, label: '10px' },
                { value: 12, label: '12px' },
                { value: 14, label: '14px' }
              ]}
              onChange={(_, val) => setPrintTableSettings({ fontSize: val as number })}
            />
          </Box>

          {/* Alifbo tanlovi */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t('Alifbo / Yozuv turi')}
            </Typography>
            <RadioGroup
              row
              value={printTableSettings?.alphabet || 'latin'}
              onChange={(e) => setPrintTableSettings({ alphabet: e.target.value as 'latin' | 'cyrillic' })}
            >
              <FormControlLabel value="latin" control={<Radio size="small" />} label={t('Lotincha (O\'zbek)')} />
              <FormControlLabel value="cyrillic" control={<Radio size="small" />} label={t('Кириллча (Ўзбек)')} />
            </RadioGroup>
          </Box>

          {/* Rang rejimi */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t('Rang rejimi')}
            </Typography>
            <RadioGroup
              row
              value={printTableSettings?.colorMode || 'color'}
              onChange={(e) => setPrintTableSettings({ colorMode: e.target.value as 'color' | 'monochrome' })}
            >
              <FormControlLabel value="color" control={<Radio size="small" />} label={t('Rangli (Qizil/Yashil)')} />
              <FormControlLabel value="monochrome" control={<Radio size="small" />} label={t('Rangsiz (Sof Qora)')} />
            </RadioGroup>
          </Box>

          {/* Qator zichligi */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t('Qator zichligi')}
            </Typography>
            <RadioGroup
              row
              value={printTableSettings?.lineDensity || 'normal'}
              onChange={(e) => setPrintTableSettings({ lineDensity: e.target.value as 'compact' | 'normal' })}
            >
              <FormControlLabel value="compact" control={<Radio size="small" />} label={t('Ixcham (Ko\'proq qator)')} />
              <FormControlLabel value="normal" control={<Radio size="small" />} label={t('Oddiy')} />
            </RadioGroup>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* Ustunlarni boshqarish (Visible Columns) */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <ViewColumnOutlined fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight={700}>
                {t('Jadvalda ko‘rsatiladigan ustunlar')}
              </Typography>
            </Stack>

            <FormGroup sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
              {columnsList.map((col) => (
                <FormControlLabel
                  key={col.key}
                  control={
                    <Checkbox
                      size="small"
                      checked={visibleCols[col.key] !== false}
                      onChange={() => handleToggleColumn(col.key)}
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontSize: '13px' }}>{col.label}</Typography>}
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions sx={{ pb: 1.5, px: 3 }}>
          <Button onClick={() => setSettingsOpen(false)} variant="contained" sx={{ borderRadius: 2 }}>
            {t('Tayyor')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
