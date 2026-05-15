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
import { ReactNode, useCallback, useEffect, useRef } from 'react';
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
import { CloudUpload, Keyboard, PictureAsPdfOutlined, SearchOffOutlined } from '@mui/icons-material';
import RecalculatorAbonent from 'ui-component/cards/RecalculatorAbonent';
import { hasValidAriza, IRow, useFindedTableLogic } from './hooks/useFindedTableLogic';
import { AnimatePresence, motion } from 'framer-motion';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import DHJTable from '../CreateAbonentPetition.jsx/DHJTable';
import { NameHistory } from '../Abonent/NameHistoryCard';
import useLoaderStore from 'store/loaderStore';

function FindedDataTable() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { ariza, setAriza, setShowDialog, ui, pdfFiles, currentFile, enteringMode, setEnteringMode } = useStore();
  const { yashovchiSoniInput, setYashovchiSoniInput, aktType, setAktType, abonentData, recalculationPeriods, setRecalculationPeriods } =
    useRecalculatorStore();

  const manualActDocumentTypes = documentTypes.filter((dt) => dt !== 'pul_kuchirish' && dt !== 'dvaynik');
  manualActDocumentTypes.push('cancelContract');

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

  if (!currentFile?.blob)
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
          p: 4
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

  return (
    <AnimatePresence>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>{page}</Box>
    </AnimatePresence>
  );
}

// <>
//   <Box
//     display="flex"
//     alignItems="center"
//     justifyContent="space-between"
//     gap={2}
//     sx={{
//       p: 2,
//       borderRadius: 3,
//       backgroundColor: 'background.paper',
//       boxShadow: 2,
//       flex: 0
//     }}
//   ></Box>
//   {/* LEFT SECTION */}
//   <Box display="flex" alignItems="center" gap={1.5}>
//     <IconButton ref={btnRef} onClick={handleClickRefreshButton}>
//       <RefreshOutlinedIcon />
//     </IconButton>

//     <TextField
//       size="small"
//       disabled={inputDisabled}
//       name="licshet_input"
//       placeholder={t('documentNumber')}
//       value={arizaNumberInput}
//       onChange={(e) => setArizaNumberInput(e.target.value)}
//       sx={{ maxWidth: 100 }}
//     />

//   </Box>
//   {/* CENTER SECTION */}
//   <Box display="flex" alignItems="center" gap={1.5} sx={{ textWrap: 'nowrap' }}>
//     <Button
//       variant="contained"
//       startIcon={<FileUploadOutlinedIcon />}
//       disabled={!((ariza?.status === 'yangi' || ariza?.status === 'qabul qilindi') && !isLoading) && !manualEditing}
//       onClick={handlePrimaryButtonClick}
//       sx={{ px: 3 }}
//     >
//       {t('buttons.submitEntry')}
//     </Button>

//     <Button variant="outlined" color="secondary" startIcon={<DeleteOutlinedIcon />} onClick={handleDeleteButtonClick}>
//       {t('buttons.remove')}
//     </Button>

//     <Button
//       variant="outlined"
//       color="error"
//       startIcon={<Cancel />}
//       onClick={() => setShowDialog(true)}
//       disabled={ariza?.status !== 'yangi' || isLoading}
//     >
//       {t('buttons.cancel')}
//     </Button>
//   </Box>
//   {/* RIGHT SECTION */}
//   <IconButton onClick={() => setShowSpoiler(!showSpoiler)} disabled={!rows.length}>
//     {showSpoiler ? <Visibility /> : <VisibilityOff />}
//   </IconButton>
//   <Box sx={{ flex: 0, mt: 2 }}>
//     <CompactKeyValue
//       data={[
//         {
//           key: t('tableHeaders.accountNumber'),
//           value: hasValidAriza(ariza as IAriza | null)
//             ? ariza?.document_type === 'dvaynik'
//               ? `${ariza?.licshet} : ${ariza?.ikkilamchi_licshet}`
//               : ariza?.licshet || ''
//             : abonentData?.accountNumber || '—'
//         },
//         {
//           key: t('tableHeaders.fullName'),
//           value: hasValidAriza(ariza as IAriza | null) ? ariza?.fio || '' : abonentData?.fullName || '—'
//         },
//         {
//           key: t('tableHeaders.inhabitantCount'),
//           value: (
//             <input
//               type="number"
//               min={1}
//               style={{
//                 background: 'none',
//                 outline: 'none',
//                 border: 'none',
//                 color: theme.colors.darkTextPrimary,
//                 textAlign: 'right',
//                 maxWidth: '100px'
//               }}
//               value={
//                 hasValidAriza(ariza as IAriza | null)
//                   ? String((ariza as IAriza).next_prescribed_cnt ?? rows[0]?.yashovchilar_soni ?? '')
//                   : yashovchiSoniInput
//               }
//               onChange={(e) => {
//                 const v = e.target.value;
//                 if (hasValidAriza(ariza as IAriza | null)) {
//                   setAriza({ ...(ariza as IAriza), next_prescribed_cnt: v === '' ? (null as any) : Number(v) });
//                 } else {
//                   setYashovchiSoniInput(v);
//                 }
//               }}
//             />
//           )
//         },
//         { key: t('tableHeaders.createdDate'), value: ariza?.sana ? new Date(ariza.sana).toLocaleDateString() : '' },
//         { key: t('tableHeaders.status'), value: ariza?.status || '' },
//         {
//           key: t('createAbonentPetitionPage.actAmount'),
//           value: (
//             <input
//               type="text"
//               style={{
//                 background: 'none',
//                 outline: 'none',
//                 border: 'none',
//                 color: theme.colors.darkTextPrimary,
//                 textAlign: 'right',
//                 maxWidth: '100px'
//               }}
//               value={aktSumm}
//               onChange={(e) => setAktSumm(e.target.value)}
//             />
//           )
//         }
//       ]}
//     />
//   </Box>

//   {manualEditing && !hasValidAriza(ariza as IAriza | null) && (
//     <motion.div
//       style={{ flex: 1 }}
//       initial={{ y: -80, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       exit={{ y: -80, opacity: 0 }}
//       transition={{ duration: 0.3 }}
//     >
//       <Box
//         sx={{
//           mt: 2,
//           p: 2,
//           borderRadius: 2,
//           bgcolor: 'action.hover',
//           border: '1px solid',
//           borderColor: 'divider',
//           maxHeight: 300,
//           overflow: 'auto'
//         }}
//       >
//         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} flexWrap="wrap">
//           <AccountNumberInput
//             size="small"
//             label={t('tableHeaders.accountNumber')}
//             value={manualAccountNumber}
//             setFunc={setManualAccountNumber}
//             sx={{ minWidth: 160 }}
//           />
//           <Button variant="contained" color="secondary" onClick={() => void loadAbonentByAccountForManual()}>
//             Yuklash
//           </Button>
//           <TextField
//             select
//             label={t('tableHeaders.documentType')}
//             value={aktType ?? ''}
//             onChange={(e) => setAktType((e.target.value || null) as typeof aktType)}
//             size="small"
//             sx={{ minWidth: 220 }}
//           >
//             <MenuItem value="">
//               <em>Tanlanmagan</em>
//             </MenuItem>
//             {manualActDocumentTypes.map((dt) => (
//               <MenuItem key={dt} value={dt}>
//                 {(t as (k: string) => string)(`documentTypes.${dt}`)}
//               </MenuItem>
//             ))}
//           </TextField>
//           {abonentData?.fullName ? (
//             <Typography variant="body2" color="text.secondary">
//               {abonentData.fullName} (ID: {abonentData.id})
//             </Typography>
//           ) : null}
//         </Stack>
//         {aktType && aktType !== 'cancelContract' && <RecalculatorAbonent />}
//       </Box>
//     </motion.div>
//   )}

//   <Tabs value={tabIndex} onChange={handleTabChange} sx={{ flex: 0 }}>
//     <Tab label="Asosiy jadval" />
//     {ariza?.document_type === 'dvaynik' && (
//       <Tooltip title="Ikkilamchi hisob raqam jadvali">
//         <Tab label="Qo'shimcha jadval" />
//       </Tooltip>
//     )}
//   </Tabs>

//   {/* Tab Panels */}
//   <Box sx={{ mt: 2, height: '200px', flex: 1 }}>
//     {tabIndex === 0 && (
//       <>
//         {manualEditing ? (
//           <DHJTable abonentData={abonentData} />
//         ) : (
//           <DataGrid
//             columns={columns}
//             disableColumnFilter
//             disableColumnSorting
//             hideFooter
//             rows={showSpoiler && rowAfterAkt ? [rowAfterAkt as IRow, ...rows.slice(1)] : rows}
//             style={{ margin: '0 auto', height: '100%' }}
//             getRowId={(row) => row.id}
//           />
//         )}
//       </>
//     )}
//     {tabIndex === 1 && (
//       <DataGrid
//         columns={columns}
//         disableColumnFilter
//         disableColumnSorting
//         hideFooter
//         rows={showSpoiler && rowAfterAkt ? [rowAfterAkt as IRow, ...rowsDublicate.slice(1)] : rowsDublicate}
//         style={{ margin: '0 auto', height: '100%' }}
//         getRowId={(row) => row.id}
//       />
//       // <DHJTable abonentData={abonentData} />
//     )}
//   </Box>
// </>
export default FindedDataTable;
