import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
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
  Badge,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  AccountCircle,
  AddPhotoAlternate,
  ArrowForward,
  CheckCircleOutlined as CheckCircleOutline,
  CreditCard,
  DeleteOutlined as DeleteOutline,
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
  WarningAmber,
  Public as PublicIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { aktType, defaultAbonentData, dublicateRelations, useStore } from './useStore';
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
    searchAllAccountsAbonent,
    isGlobalAbonent,
    isGlobalAbonent2,
    notFoundInCompanyMain,
    notFoundInCompanyDublicate,
    isSearchingGlobalMain,
    isSearchingGlobalDublicate,
    getAutoMobile,
    autoMobile,
    shouldBeMoneyTransfer,
    setShouldBeMoneyTransfer,
    dublicateRelation,
    setDublicateRelation,
    moneyTransferAmount,
    setMoneyTransferAmount,
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
    isGlobalAbonent ||
    (aktType === 'dvaynik' && !abonentData2.accountNumber) ||
    (aktType === 'dvaynik' && isGlobalAbonent2) ||
    (aktType === 'gps' && images.length === 0);

  const getCreateDisabledReason = (): string => {
    if (isGlobalAbonent) return t("Boshqa tashkilot abonenti uchun ariza shakllantirish mumkin emas (faqat ma'lumot uchun ko'rish va chop etish mumkin)");
    if (aktType === 'dvaynik' && isGlobalAbonent2) return t("Ikkilamchi abonent boshqa tashkilotga tegishli");
    if (!abonentData.accountNumber) return t("Avval asosiy hisob raqamini kiriting") || '';
    if (!aktType) return t("Hujjat turini tanlang") || '';
    if (aktType === 'dvaynik' && !abonentData2.accountNumber) return t("Ikkilamchi hisob raqamini kiriting") || '';
    if (aktType === 'gps' && images.length === 0) return t("GPS arizasi uchun kamida bitta rasm biriktiring") || '';
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
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Badge color="primary" variant="dot" invisible={!abonentData.accountNumber}>
            <CreditCard color="primary" />
          </Badge>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
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

        {/* Agar joriy tashkilotda topilmasa, O'zbekiston bo'ylab izlash tugmasi */}
        {notFoundInCompanyMain && accountNumber.length === 12 && !abonentData.accountNumber && (
          <Paper
            elevation={0}
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'warning.main',
              bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'warning.50'
            }}
          >
            <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              ⚠️ Ushbu hisob raqam joriy tashkilot bazasida topilmadi.
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              size="small"
              disabled={isSearchingGlobalMain}
              onClick={() => searchAllAccountsAbonent(accountNumber, 'main')}
              startIcon={isSearchingGlobalMain ? <CircularProgress size={14} color="inherit" /> : <PublicIcon />}
              sx={{
                fontWeight: 700,
                fontSize: '12px',
                textTransform: 'none',
                borderRadius: 1.5
              }}
            >
              {isSearchingGlobalMain ? "O'zbekiston bo'ylab izlanmoqda..." : "O'zbekiston bo'ylab izlash"}
            </Button>
          </Paper>
        )}

        {/* Abonent ma'lumotlari mini-kartochkasi */}
        {abonentData.accountNumber && (
          <Paper
            elevation={0}
            sx={{
              mt: 1.5,
              p: 1.75,
              borderRadius: 2,
              border: '1px solid',
              borderColor: isGlobalAbonent ? 'info.main' : 'primary.light',
              bgcolor: theme.palette.mode === 'dark' ? 'background.default' : isGlobalAbonent ? 'info.50' : 'primary.50'
            }}
          >
            <Stack spacing={1}>
              {/* Boshqa tashkilotga tegishli ekanligi haqida belgi */}
              {isGlobalAbonent && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Chip
                    size="small"
                    icon={<BusinessIcon sx={{ fontSize: '14px !important' }} />}
                    label={abonentData.companyName || "Boshqa tashkilot"}
                    color="info"
                    sx={{ fontWeight: 700, fontSize: '11px', height: 22 }}
                  />
                  <Typography variant="caption" color="info.dark" sx={{ fontWeight: 600, fontSize: '11px' }}>
                    (Faqat ma'lumot uchun)
                  </Typography>
                </Stack>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isGlobalAbonent ? 'info.dark' : 'primary.dark' }}>
                    {abonentData.fullName || '—'}
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary', mt: 0.2 }}>
                    <LocationOn sx={{ fontSize: 14 }} />
                    <Typography variant="caption">
                      {abonentData.mahallaName}, {abonentData.streetName} {abonentData.house?.homeNumber ? `№${abonentData.house.homeNumber}` : ''}
                    </Typography>
                  </Stack>
                </Box>
                <Tooltip title={t("Abonent kartasini chop etish / ko'rish")}>
                  <IconButton
                    size="small"
                    color={isGlobalAbonent ? 'info' : 'primary'}
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
                  color={isGlobalAbonent ? 'default' : 'info'}
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: '12px' }}
                />
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('Saldo')}:
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: (abonentData.balance?.kSaldo || 0) < 0 ? 'error.main' : 'success.main'
                    }}
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
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
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

                {/* Agar ikkilamchi hisob joriy tashkilotda topilmasa, O'zbekiston bo'ylab izlash */}
                {notFoundInCompanyDublicate && accountNumber2.length === 12 && !abonentData2.accountNumber && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'warning.main',
                      bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'warning.50'
                    }}
                  >
                    <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                      ⚠️ Ikkilamchi hisob raqam joriy tashkilotda topilmadi.
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="warning"
                      size="small"
                      disabled={isSearchingGlobalDublicate}
                      onClick={() => searchAllAccountsAbonent(accountNumber2, 'dublicate')}
                      startIcon={isSearchingGlobalDublicate ? <CircularProgress size={14} color="inherit" /> : <PublicIcon />}
                      sx={{
                        fontWeight: 700,
                        fontSize: '12px',
                        textTransform: 'none',
                        borderRadius: 1.5
                      }}
                    >
                      {isSearchingGlobalDublicate ? "O'zbekiston bo'ylab izlanmoqda..." : "O'zbekiston bo'ylab izlash"}
                    </Button>
                  </Paper>
                )}

                {/* Ikkilamchi abonent ma'lumotlari */}
                {abonentData2.accountNumber && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: isGlobalAbonent2 ? 'info.main' : 'warning.light',
                      bgcolor: theme.palette.mode === 'dark' ? 'background.default' : isGlobalAbonent2 ? 'info.50' : 'warning.50'
                    }}
                  >
                    {isGlobalAbonent2 && (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                        <Chip
                          size="small"
                          icon={<BusinessIcon sx={{ fontSize: '14px !important' }} />}
                          label={abonentData2.companyName || "Boshqa tashkilot"}
                          color="info"
                          sx={{ fontWeight: 700, fontSize: '11px', height: 20 }}
                        />
                        <Typography variant="caption" color="info.dark" sx={{ fontWeight: 600, fontSize: '10.5px' }}>
                          (Boshqa tashkilot)
                        </Typography>
                      </Stack>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isGlobalAbonent2 ? 'info.dark' : 'warning.dark' }}>
                          Ikkilamchi: {abonentData2.fullName || '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {abonentData2.mahallaName}, {abonentData2.streetName} | {abonentData2.house?.inhabitantCnt || 0} kishi
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: (abonentData2.balance?.kSaldo || 0) < 0 ? 'error.main' : 'success.main'
                          }}
                        >
                          Saldo: {(abonentData2.balance?.kSaldo || 0).toLocaleString()} so'm
                        </Typography>
                      </Box>
                      <Tooltip title={t("Abonent kartasini chop etish / ko'rish")}>
                        <IconButton
                          size="small"
                          color={isGlobalAbonent2 ? 'info' : 'warning'}
                          onClick={() => handleOpenAbonentCard(abonentData2.accountNumber)}
                          sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
                        >
                          <AccountCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                )}

                {/* 1-Qoida: Familiyalar har xil bo'lsa qarindoshlik / aloqadorlikni tanlash */}
                {abonentData2.accountNumber && (
                  <Box sx={{ mt: 0.5 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="dublicate-relation-label">{t("Abonentlar o'rtasidagi qarindoshlik / aloqa")}</InputLabel>
                      <Select
                        labelId="dublicate-relation-label"
                        value={dublicateRelation || ''}
                        label={t("Abonentlar o'rtasidagi qarindoshlik / aloqa")}
                        onChange={(e) => setDublicateRelation(e.target.value)}
                        sx={{ borderRadius: 1.5, bgcolor: 'background.paper' }}
                      >
                        {dublicateRelations.map((rel) => (
                          <MenuItem key={rel} value={rel}>
                            {rel}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {abonentData.fullName && abonentData2.fullName && abonentData.fullName !== abonentData2.fullName && !dublicateRelation && (
                      <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5, fontSize: '11px', fontWeight: 600 }}>
                        ⚠️ Ism-familiyalar turlicha. Qonuniy dalolatnoma uchun aloqadorlikni tanlash tavsiya etiladi.
                      </Typography>
                    )}
                  </Box>
                )}

                {/* 2-Qoida: To'lovlarni ko'chirish va summa kiritish */}
                <Box sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: 'background.paper' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={shouldBeMoneyTransfer}
                        onChange={(e) => setShouldBeMoneyTransfer(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {t("Ikkilamchi hisobdagi to'lovlarni asosiyga ko'chirish")}
                      </Typography>
                    }
                  />

                  {shouldBeMoneyTransfer && (
                    <Box sx={{ mt: 1.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label={t("Ko'chiriladigan to'lovlar summasi (so'm)")}
                        value={moneyTransferAmount}
                        onChange={(e) => setMoneyTransferAmount(e.target.value)}
                        placeholder="0"
                        helperText={t("Ikkilamchi hisob raqamiga to'langan barcha to'lovlarning umumiy yig'indisi")}
                        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                      />
                    </Box>
                  )}
                </Box>
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
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
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
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {t('createAbonentPetitionPage.actAmount')}:
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    color: aktSumma.total < 0 ? 'error.main' : aktSumma.total > 0 ? 'success.main' : 'text.primary'
                  }}
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
