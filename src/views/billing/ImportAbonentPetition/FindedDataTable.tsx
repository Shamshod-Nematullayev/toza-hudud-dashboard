import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import useStore from './hooks/useStore';
import FileUploadOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import Visibility from '@mui/icons-material/VisibilityOutlined';
import VisibilityOff from '@mui/icons-material/VisibilityOffOutlined';
import Cancel from '@mui/icons-material/CancelOutlined';
import ChooseArizaPopper from './ChooseArizaPopper';
import { useTranslation } from 'react-i18next';
import { documentTypes } from 'store/constant';
import { useStore as useRecalculatorStore } from '../CreateAbonentPetition.jsx/useStore';
import { IAriza } from 'types/models';
import { CompactKeyValue } from 'ui-component/CompactKeyValue';
import { Close, CloudUpload, Delete, Keyboard, PictureAsPdfOutlined, SearchOffOutlined, UploadFileOutlined } from '@mui/icons-material';
import RecalculatorAbonent from 'ui-component/cards/RecalculatorAbonent';
import { hasValidAriza, IRow, useFindedTableLogic } from './hooks/useFindedTableLogic';
import { AnimatePresence, motion } from 'framer-motion';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import DHJTable from '../CreateAbonentPetition.jsx/DHJTable';
import { NameHistory } from '../Abonent/NameHistoryCard';
import useLoaderStore from 'store/loaderStore';
import { useUiStore } from './hooks/useUiStore';

function FindedDataTable() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { ariza, setAriza, setShowDialog, ui, pdfFiles, currentFile, enteringMode, setEnteringMode } = useStore();
  const { yashovchiSoniInput, setYashovchiSoniInput, aktType, setAktType, abonentData, recalculationPeriods, setRecalculationPeriods } =
    useRecalculatorStore();

  const manualActDocumentTypes = documentTypes.filter((dt) => dt !== 'pul_kuchirish' && dt !== 'dvaynik');
  manualActDocumentTypes.push('cancelContract');
  // const [showSpoiler, setShowSpoiler] = useState(false);
  const {
    handleClickRefreshButton,
    handleDeleteButtonClick,
    handlePrimaryButtonClick,
    handleTabChange,
    tabIndex,
    inputDisabled,
    arizaNumberInput,
    setArizaNumberInput,
    setShowSpoiler,
    showSpoiler,
    rowAfterAkt,
    aktSumm,
    setAktSumm,
    manualEditing,
    setManualEditing,
    rows,
    rowsDublicate,
    manualAccountNumber,
    setManualAccountNumber,
    loadAbonentByAccountForManual
  } = useFindedTableLogic();
  const { isLoading } = useLoaderStore();
  const { pdfFileLoading } = useUiStore();

  const btnRef = useRef(null);

  useEffect(() => {
    setAktSumm(recalculationPeriods.reduce((a, b) => a + b.total, 0).toString());
  }, [recalculationPeriods]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: '№', width: 10 },
    { field: 'davr', headerName: t('tableHeaders.period') },
    { field: 'saldo_n', headerName: t('tableHeaders.nSaldo'), type: 'number' },
    { field: 'nachis', headerName: t('tableHeaders.nachis'), type: 'number' },
    { field: 'allPaymentsSum', headerName: t('tableHeaders.allPaymentsSum'), type: 'number' },
    { field: 'saldo_k', headerName: t('tableHeaders.kSaldo'), type: 'number', flex: 1 },
    { field: 'akt', headerName: t('tableHeaders.act'), type: 'number' },
    { field: 'yashovchilar_soni', headerName: t('tableHeaders.inhabitantCount'), type: 'number', width: 10 }
  ];

  let page: ReactNode = null;

  if (pdfFiles.length === 0) {
    return;
  }

  if (!currentFile?.blob || pdfFileLoading)
    page = (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          p: 4,
          minHeight: 'calc(100vh - 130px)'
        }}
      >
        {/* Chapga yo'naltiruvchi dinamik ko'prik (Pulse Ring) */}
        <Box
          sx={{
            position: 'absolute',
            left: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, -15, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4
              }}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.main
              }}
            />
          ))}
        </Box>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', zIndex: 3 }}
        >
          <Stack alignItems="center" spacing={3}>
            {/* Markaziy Ramz */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'primary.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
                boxShadow: `0 0 20px ${theme.palette.primary.light}`
              }}
            >
              <PictureAsPdfOutlined sx={{ fontSize: 40 }} />
            </Box>

            {/* Matnli muloqot */}
            <Box>
              <Typography variant="h4" fontWeight="600" color="text.primary" gutterBottom>
                {t('Fayl tanlanmagan')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300, mx: 'auto' }}>
                {t('Davom etish uchun chap tomondagi ro‘yxatdan kerakli faylni tanlang')}
              </Typography>
            </Box>

            {/* Harakatga chorlovchi tugma yoki ishora */}
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Box
                sx={{
                  py: 0.5,
                  px: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}
              >
                {t('Kutilmoqda')}
              </Box>
            </motion.div>
          </Stack>
        </motion.div>

        {/* Fon uchun xira bezak (Background Decor) */}
        <Box
          sx={{
            position: 'absolute',
            right: -50,
            bottom: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            zIndex: 1
          }}
        />
      </Box>
    );

  if (currentFile && !ariza) {
    page = (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          p: 4
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: 450 }}
        >
          <Stack spacing={4} alignItems="center">
            {/* Skanerlash xatosi ramzi */}
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'error.lighter',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'error.main'
                }}
              >
                <SearchOffOutlined sx={{ fontSize: 50 }} />
              </Box>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  border: `2px solid ${theme.palette.error.main}`
                }}
              />
            </Box>

            <Box textAlign="center">
              <Typography variant="h3" fontWeight="700" color="text.primary" gutterBottom>
                {t('Hujjat topilmadi')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('QR kodni o‘qib bo‘lmadi yoki ma’lumot bazada mavjud emas. Iltimos, raqamni o‘zingiz kiriting.')}
              </Typography>
            </Box>

            {/* Qidiruv Formasi */}
            <Box sx={{ width: '100%', p: 3, borderRadius: 3, bgcolor: 'action.hover' }}>
              <Stack spacing={2.5}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleClickRefreshButton();
                  }}
                >
                  <TextField
                    fullWidth
                    label={t('documentNumber')}
                    variant="outlined"
                    value={arizaNumberInput}
                    onChange={(e) => setArizaNumberInput(e.target.value)}
                    autoFocus
                    placeholder="Masalan: 123456"
                    InputProps={{
                      endAdornment: (
                        <IconButton color="primary" onClick={handleClickRefreshButton}>
                          <RefreshOutlinedIcon />
                        </IconButton>
                      )
                    }}
                    ref={btnRef}
                  />
                </form>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={!arizaNumberInput || isLoading}
                  onClick={() => {
                    handleClickRefreshButton();
                  }}
                  sx={{ py: 1.5, fontWeight: 600 }}
                >
                  {t('Raqam bo‘yicha qidirish')}
                </Button>
                <ChooseArizaPopper
                  anchorEl={btnRef.current}
                  open={ui.arizaChooseDialog}
                  handleClose={() => useStore.setState({ ui: { ...ui, arizaChooseDialog: false } })}
                />

                <Divider>
                  <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase' }}>
                    {t('yoki')}
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  startIcon={<Keyboard />}
                  onClick={() => {
                    setManualEditing(true);
                    setEnteringMode('manual');
                  }}
                  sx={{ py: 1.2 }}
                >
                  {t('Qo‘lda kiritish rejimiga o‘tish')}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </motion.div>
      </Box>
    );
  }

  if (enteringMode === 'manual') {
    page = (
      <>
        <motion.div
          style={{ flex: 1 }}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              p: 2,
              mt: 2,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              flexWrap: 'wrap' // Kichik ekranlar uchun moslashuvchanlik
            }}
          >
            {/* 1. Shaxsiy ma'lumotlar guruhi */}
            <Stack direction="row" spacing={4} sx={{ flex: 1 }}>
              <Box>
                <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  {t('tableHeaders.accountNumber')}
                </Typography>
                <Typography variant="h5" fontWeight="700">
                  {hasValidAriza(ariza as IAriza | null)
                    ? ariza?.document_type === 'dvaynik'
                      ? `${ariza?.licshet} : ${ariza?.ikkilamchi_licshet}`
                      : ariza?.licshet || ''
                    : abonentData?.accountNumber || '—'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  {t('tableHeaders.fullName')}
                </Typography>
                <Typography variant="h5" fontWeight="600" sx={{ color: 'primary.main' }}>
                  {hasValidAriza(ariza as IAriza | null) ? ariza?.fio || '' : abonentData?.fullName || '—'}
                </Typography>
              </Box>
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* 2. O'zgartiriladigan qiymatlar guruhi */}
            <Stack direction="row" spacing={3}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  {t('tableHeaders.inhabitantCount')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                  <input
                    type="number"
                    min={1}
                    style={{
                      background: theme.palette.action.hover,
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      width: '60px',
                      textAlign: 'center',
                      color: theme.palette.primary.main,
                      outline: 'none'
                    }}
                    value={
                      hasValidAriza(ariza as IAriza | null)
                        ? String((ariza as IAriza).next_prescribed_cnt ?? rows[0]?.yashovchilar_soni ?? '')
                        : yashovchiSoniInput
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (hasValidAriza(ariza as IAriza | null)) {
                        setAriza({ ...(ariza as IAriza), next_prescribed_cnt: v === '' ? (null as any) : Number(v) });
                      } else {
                        setYashovchiSoniInput(v);
                      }
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  {t('createAbonentPetitionPage.actAmount')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <input
                    type="text"
                    style={{
                      background: theme.palette.action.hover,
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      width: '120px',
                      textAlign: 'right',
                      color: theme.palette.error.main,
                      outline: 'none'
                    }}
                    value={aktSumm}
                    onChange={(e) => setAktSumm(e.target.value)}
                  />

                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 600 }}>
                    UZS
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
              maxHeight: 500,
              overflow: 'auto'
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} flexWrap="nowrap">
              <AccountNumberInput
                size="small"
                label={t('tableHeaders.accountNumber')}
                value={manualAccountNumber}
                setFunc={setManualAccountNumber}
                sx={{ minWidth: 160 }}
              />
              <Button variant="contained" color="secondary" onClick={() => void loadAbonentByAccountForManual()}>
                Yuklash
              </Button>
              <TextField
                select
                label={t('tableHeaders.documentType')}
                value={aktType ?? ''}
                onChange={(e) => setAktType((e.target.value || null) as typeof aktType)}
                size="small"
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">
                  <em>Tanlanmagan</em>
                </MenuItem>
                {manualActDocumentTypes.map((dt) => (
                  <MenuItem key={dt} value={dt}>
                    {(t as (k: string) => string)(`documentTypes.${dt}`)}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                startIcon={<FileUploadOutlinedIcon />}
                disabled={!((ariza?.status === 'yangi' || ariza?.status === 'qabul qilindi') && !isLoading) && enteringMode !== 'manual'}
                onClick={handlePrimaryButtonClick}
                sx={{ px: 3 }}
              >
                {t('buttons.submitEntry')}
              </Button>

              <Button variant="outlined" color="secondary" onClick={handleDeleteButtonClick}>
                <DeleteOutlinedIcon />
              </Button>
            </Stack>
            {aktType && aktType !== 'cancelContract' && <RecalculatorAbonent />}
          </Box>
          <div style={{ height: '500px' }}>
            <DHJTable abonentData={abonentData} />
          </div>
        </motion.div>
      </>
    );
  }

  if (enteringMode === 'ariza' && ariza) {
    page = (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* 1. Yuqori Ma'lumotlar Qismi */}
        <Box sx={{ p: 1 }}>
          {[
            { label: 'Hisob raqami', value: ariza?.licshet || '—' },
            { label: 'F.I.Sh', value: ariza?.fio || '—' },
            { label: 'Yashovchilar soni', value: ariza?.next_prescribed_cnt ?? rows[0]?.yashovchilar_soni ?? '0' },
            { label: 'Yaratilgan sana', value: ariza?.sana ? new Date(ariza.sana).toLocaleDateString() : '—' }
          ].map((item, index) => (
            <Stack key={index} direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="body2" fontWeight="700">
                {item.value}
              </Typography>
            </Stack>
          ))}

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Holat
            </Typography>
            <Box
              sx={{
                px: 1.5,
                py: 0.2,
                borderRadius: 5,
                fontSize: '0.75rem',
                fontWeight: 600,
                bgcolor: 'primary.main',
                color: 'primary.contrastText'
              }}
            >
              {ariza?.status || 'yangi'}
            </Box>
          </Stack>

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Akt summa
            </Typography>
            <Typography variant="body2" fontWeight="700" sx={{ borderBottom: '1px dotted', borderColor: 'divider' }}>
              {Number(aktSumm).toLocaleString()}
            </Typography>
          </Stack>
        </Box>

        {/* 3. Jadval */}

        <Box sx={{ height: '55vh', width: '100%' }}>
          <Stack direction="row" justifyContent={'space-between'} spacing={1} sx={{ mb: 1 }}>
            <Tabs value={tabIndex} onChange={handleTabChange} sx={{ minHeight: 40, mb: '5px' }}>
              <Tab label="Asosiy jadval" sx={{ textTransform: 'none' }} />
              <Tab label="Qo'shimcha" sx={{ textTransform: 'none' }} />
            </Tabs>
            <IconButton onClick={() => setShowSpoiler(!showSpoiler)}>{showSpoiler ? <Visibility /> : <VisibilityOff />}</IconButton>
          </Stack>
          <DataGrid
            rows={rows}
            columns={columns}
            hideFooter
            density="compact"
            disableColumnMenu
            getRowId={(row) => row.id}
            sx={{ height: '90%' }}
          />
        </Box>

        {/* 4. Pastki Tugmalar */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            startIcon={<UploadFileOutlined />}
            sx={{ flex: 1, py: 1.2 }}
            variant="contained"
            color="primary"
            onClick={handlePrimaryButtonClick}
            disabled={!((ariza?.status === 'yangi' || ariza?.status === 'qabul qilindi') && !isLoading)}
          >
            {t('buttons.submitEntry')}
          </Button>
          <Button startIcon={<Close />} sx={{ flex: 0.5, py: 1.2 }} variant="contained" color="error" onClick={() => setShowDialog(true)}>
            {t('buttons.cancel')}
          </Button>
          <Button sx={{ flex: 0.2, py: 1.2 }} variant="contained" color="secondary" onClick={handleDeleteButtonClick}>
            <Delete />
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <AnimatePresence>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>{page}</Box>
    </AnimatePresence>
  );
}

export default FindedDataTable;
