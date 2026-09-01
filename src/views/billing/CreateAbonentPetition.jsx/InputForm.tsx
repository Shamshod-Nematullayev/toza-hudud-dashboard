import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  AccountCircle,
  AddPhotoAlternate,
  ArrowForward,
  Badge,
  CheckCircleOutline,
  CreditCard,
  DeleteOutline,
  DirectionsCar,
  Group,
  Home,
  LocationOn,
  Person,
  PersonAdd,
  PersonRemove,
  RestartAlt,
  ScreenRotationAlt,
  Send,
  WarningAmber
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { aktType, defaultAbonentData, useStore } from './useStore';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import { documentTypes } from 'store/constant';

export default function InputForm() {
  const {
    aktType,
    setAktType,
    abonentData,
    setAbonentData,
    abonentData2,
    setAbonentData2,
    recalculationPeriods,
    setRecalculationPeriods,
    yashovchiSoniInput,
    setYashovchiSoniInput,
    setPasteImageDialogOpen,
    images,
    muzlatiladi,
    setMuzlatiladi,
    setImages,
    aktSumma,
    setAktSumma,
    createAriza,
    updateAbonentDataByAccNum,
    getAutoMobile,
    autoMobile,
    shouldBeMoneyTransfer,
    setShouldBeMoneyTransfer,
    setAbonentCardOpenState,
    setGlobalAbonentAccountNumber
  } = useStore();

  const theme = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const abonentInputData = location.state?.abonentData;

  const [accountNumber, setAccountNumber] = useState('');
  const [accountNumber2, setAccountNumber2] = useState('');
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [isLoadingMain, setIsLoadingMain] = useState(false);
  const [isLoadingDublicate, setIsLoadingDublicate] = useState(false);

  useEffect(() => {
    if (abonentInputData) {
      setAccountNumber(abonentInputData.accountNumber || '');
    }
  }, []);

  useEffect(() => {
    if (muzlatiladi && aktType === 'gps') {
      setYashovchiSoniInput(0);
      return;
    }
    if (aktType === 'death') {
      const current = abonentData?.house?.inhabitantCnt || 0;
      setYashovchiSoniInput(Math.max(0, current - 1));
    } else if (aktType === 'odam_soni' || aktType === 'dvaynik') {
      setYashovchiSoniInput(abonentData?.house?.inhabitantCnt ?? '');
    }
  }, [aktType, abonentData, muzlatiladi]);

  useEffect(() => {
    if (accountNumber.length === 12) {
      setIsLoadingMain(true);
      updateAbonentDataByAccNum(accountNumber, 'main');
      setTimeout(() => setIsLoadingMain(false), 500);
    } else {
      if (abonentData.accountNumber) setAbonentData(defaultAbonentData);
    }
  }, [accountNumber]);

  useEffect(() => {
    if (accountNumber2.length === 12) {
      setIsLoadingDublicate(true);
      updateAbonentDataByAccNum(accountNumber2, 'dublicate');
      setTimeout(() => setIsLoadingDublicate(false), 500);
    } else {
      if (abonentData2.accountNumber) setAbonentData2(defaultAbonentData);
    }
  }, [accountNumber2]);

  useEffect(() => {
    if (aktType === 'gps' && abonentData.mahallaId) {
      getAutoMobile(abonentData.mahallaId);
    }
  }, [abonentData.mahallaId, aktType]);

  const handleClearConfirmed = () => {
    setAccountNumber('');
    setAccountNumber2('');
    setAbonentData(defaultAbonentData);
    setAbonentData2(defaultAbonentData);
    setYashovchiSoniInput('');
    setAktSumma({ total: 0, totalWithQQS: 0, withoutQQSTotal: 0 });
    setRecalculationPeriods([]);
    setImages([]);
    setAktType(null);
    setClearConfirmOpen(false);
  };

  const handleSwapIconButtonClick = () => {
    const temp = accountNumber;
    setAccountNumber(accountNumber2);
    setAccountNumber2(temp);
  };

  const handleOpenAbonentCard = (accNum: string) => {
    if (!accNum) return;
    setGlobalAbonentAccountNumber(accNum);
    setAbonentCardOpenState(true);
  };

  // Tekshiruv holati
  const isCreateDisabled =
    !abonentData.accountNumber ||
    !aktType ||
    (aktType === 'dvaynik' && !abonentData2.accountNumber) ||
    (aktType === 'gps' && images.length === 0);

  const getCreateDisabledReason = () => {
    if (!abonentData.accountNumber) return t("Avval asosiy hisob raqamini kiriting");
    if (!aktType) return t("Hujjat turini tanlang");
    if (aktType === 'dvaynik' && !abonentData2.accountNumber) return t("Ikkilamchi hisob raqamini kiriting");
    if (aktType === 'gps' && images.length === 0) return t("GPS arizasi uchun kamida bitta rasm biriktiring");
    return '';
  };

  return (
    <Card
      elevation={2}
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        height: '100%',
        overflowY: 'auto'
      }}
    >
      {/* 1. Sarlavha va Tozalash */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Badge color="primary" variant="dot" invisible={!abonentData.accountNumber}>
            <CreditCard color="primary" />
          </Badge>
          <Typography variant="h4" fontWeight={700}>
            {t('Ariza shakllantirish')}
          </Typography>
        </Stack>
        <Tooltip title={t("Barcha maydonlarni tozalash")}>
          <Button
            size="small"
            color="error"
            variant="text"
            startIcon={<RestartAlt fontSize="small" />}
            onClick={() => setClearConfirmOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('buttons.clear')}
          </Button>
        </Tooltip>
      </Box>

      <Divider />

      {/* 2. Asosiy Abonent qidirish (Hisob raqam) */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, mb: 1, display: 'block' }}>
          1. {t('Asosiy Abonent')}
        </Typography>
        <AccountNumberInput
          label={t('createAbonentPetitionPage.accountNumber')}
          value={accountNumber}
          setFunc={setAccountNumber}
        />

        {/* Abonent ma'lumotlari mini-kartochkasi */}
        {abonentData.accountNumber && (
          <Paper
            elevation={0}
            sx={{
              mt: 1.5,
              p: 1.75,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'primary.light',
              bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'primary.50'
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="primary.dark">
                    {abonentData.fullName || '—'}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary', mt: 0.2 }}>
                    <LocationOn sx={{ fontSize: 14 }} />
                    <Typography variant="caption">
                      {abonentData.mahallaName}, {abonentData.streetName} {abonentData.house?.homeNumber ? `№${abonentData.house.homeNumber}` : ''}
                    </Typography>
                  </Stack>
                </Box>
                <Tooltip title={t("Abonent kartasini chop etish / ko'rish")}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenAbonentCard(abonentData.accountNumber)}
                    sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
                  >
                    <AccountCircle fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  size="small"
                  icon={<Group sx={{ fontSize: '14px !important' }} />}
                  label={`${abonentData.house?.inhabitantCnt || 0} nafar yashovchi`}
                  color="info"
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: '12px' }}
                />
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    {t('Saldo')}:
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color={(abonentData.balance?.kSaldo || 0) < 0 ? 'error.main' : 'success.main'}
                  >
                    {(abonentData.balance?.kSaldo || 0).toLocaleString()} so'm
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        )}
      </Box>

      {/* 3. Hujjat turi tanlash */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, mb: 1, display: 'block' }}>
          2. {t('Hujjat parametri')}
        </Typography>
        <FormControl fullWidth size="medium">
          <InputLabel>{t('tableHeaders.documentType')}</InputLabel>
          <Select
            label={t('tableHeaders.documentType')}
            value={aktType || ''}
            onChange={(e) => setAktType(e.target.value as aktType)}
            sx={{ borderRadius: 2 }}
          >
            {documentTypes.map((item) => (
              <MenuItem key={item} value={item}>
                {t(`documentTypes.${item}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 4. Dinamik maydonlar (Hujjat turiga bog'liq) */}
      {aktType && (
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'action.hover' }}>
          <Stack spacing={2}>
            {/* Odam soni / Vafot holati */}
            {(aktType === 'odam_soni' || aktType === 'death') && (
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  fullWidth
                  type="number"
                  label={t('createAbonentPetitionPage.inhabitantCnt')}
                  value={yashovchiSoniInput}
                  disabled={aktType === 'death'}
                  onChange={(e) => {
                    if (!isNaN(Number(e.target.value))) {
                      setYashovchiSoniInput(e.target.value);
                    }
                  }}
                  helperText={
                    aktType === 'death'
                      ? t("Vafot etganligi sababli 1 kishi avtomatik kamaytiriladi")
                      : `Hozirgi: ${abonentData?.house?.inhabitantCnt || 0} kishi`
                  }
                  sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                />
              </Stack>
            )}

            {/* Dvoynik holati */}
            {aktType === 'dvaynik' && (
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <AccountNumberInput
                      label={t('createAbonentPetitionPage.dublicateAccountNumber')}
                      value={accountNumber2}
                      setFunc={setAccountNumber2}
                    />
                  </Box>
                  <Tooltip title={t("Hisob raqamlarni almashtirish (Swap)")}>
                    <IconButton
                      onClick={handleSwapIconButtonClick}
                      color="primary"
                      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                    >
                      <ScreenRotationAlt />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Ikkilamchi abonent ma'lumotlari */}
                {abonentData2.accountNumber && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'warning.light',
                      bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'warning.50'
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} color="warning.dark">
                      Ikkilamchi: {abonentData2.fullName || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {abonentData2.mahallaName}, {abonentData2.streetName} | {abonentData2.house?.inhabitantCnt || 0} kishi
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color={(abonentData2.balance?.kSaldo || 0) < 0 ? 'error.main' : 'success.main'}
                    >
                      Saldo: {(abonentData2.balance?.kSaldo || 0).toLocaleString()} so'm
                    </Typography>
                  </Paper>
                )}

                <FormControlLabel
                  control={
                    <Switch
                      checked={shouldBeMoneyTransfer}
                      onChange={(e) => setShouldBeMoneyTransfer(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      {t("Ikkilamchi hisobdagi to'lovlarni asosiyga ko'chirish")}
                    </Typography>
                  }
                />
              </Stack>
            )}

            {/* GPS monitoring holati */}
            {aktType === 'gps' && (
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={muzlatiladi}
                      onChange={(e) => setMuzlatiladi(e.target.checked)}
                      color="warning"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      {t("Muzlatish (Hozirda ham xizmat ko'rsatilmaydi)")}
                    </Typography>
                  }
                />

                {autoMobile && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.2,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <DirectionsCar color="action" fontSize="small" />
                    <Typography variant="caption" fontWeight={600}>
                      {t("Biriktirilgan mashina")}: {autoMobile.name}
                    </Typography>
                  </Paper>
                )}

                <Button
                  fullWidth
                  variant={images.length > 0 ? 'contained' : 'outlined'}
                  color={images.length > 0 ? 'success' : 'primary'}
                  startIcon={<AddPhotoAlternate />}
                  onClick={() => setPasteImageDialogOpen(true)}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  {images.length > 0
                    ? `${t('Rasmlar biriktirildi')} (${images.length})`
                    : t('buttons.addImage')}
                </Button>
              </Stack>
            )}

            {/* Akt summasi indikatori */}
            {aktType !== 'dvaynik' && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {t('createAbonentPetitionPage.actAmount')}:
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color={aktSumma.total < 0 ? 'error.main' : aktSumma.total > 0 ? 'success.main' : 'text.primary'}
                >
                  {aktSumma.total.toLocaleString()} so'm
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      )}

      {/* 5. Asosiy Yaratish Tugmasi (Sticky Bottom) */}
      <Box sx={{ mt: 'auto', pt: 1 }}>
        <Tooltip title={isCreateDisabled ? getCreateDisabledReason() : ''} arrow placement="top">
          <span>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={isCreateDisabled}
              onClick={createAriza}
              startIcon={<Send />}
              sx={{
                py: 1.4,
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '15px',
                textTransform: 'none',
                boxShadow: theme.shadows[4]
              }}
            >
              {t('Arizani shakllantirish')}
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Tozalashni tasdiqlash dialogi */}
      <Dialog open={clearConfirmOpen} onClose={() => setClearConfirmOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmber color="warning" />
          {t("Formani tozalashni xohlaysizmi?")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("Kiritilgan barcha hisob-kitoblar, tanlangan davrlar va rasmlar bekor qilinadi.")}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setClearConfirmOpen(false)} color="inherit">
            {t('Bekor qilish')}
          </Button>
          <Button onClick={handleClearConfirmed} color="error" variant="contained">
            {t('Ha, tozalash')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
