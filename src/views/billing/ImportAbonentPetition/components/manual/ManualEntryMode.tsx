import { Box, Button, Divider, MenuItem, Stack, TextField, Typography, useTheme } from '@mui/material';
import { DeleteOutlined as DeleteOutlinedIcon, Photo, UploadFileOutlined as FileUploadOutlinedIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { t } from 'i18next';
import { hasValidAriza } from '../../hooks/useFindedTableLogic';
import { AdjustmentAlert } from '../ariza/AdjustmentAlert';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import RecalculatorAbonent from 'ui-component/cards/RecalculatorAbonent';
import DHJTable from '../../../CreateAbonentPetition.jsx/DHJTable';

interface ManualEntryModeProps {
  ariza: any;
  setAriza: any;
  abonentData: any;
  yashovchiSoniInput: string;
  setYashovchiSoniInput: (val: string) => void;
  aktSumm: string;
  setAktSumm: (val: string) => void;
  rows: any[];
  manualAccountNumber: string;
  setManualAccountNumber: (val: string) => void;
  loadAbonentByAccountForManual: () => Promise<void>;
  aktType: any;
  setAktType: any;
  photos: string[];
  handlePrimaryButtonClick: (e: any) => Promise<any>;
  handleDeleteButtonClick: () => Promise<any>;
  setOpenPasteImageDialog: (val: boolean) => void;
  adjustmentData: any;
  isLoading: boolean;
  manualActDocumentTypes: any[];
  enteringMode: 'ariza' | 'manual';
}

export function ManualEntryMode({
  ariza,
  setAriza,
  abonentData,
  yashovchiSoniInput,
  setYashovchiSoniInput,
  aktSumm,
  setAktSumm,
  rows,
  manualAccountNumber,
  setManualAccountNumber,
  loadAbonentByAccountForManual,
  aktType,
  setAktType,
  photos,
  handlePrimaryButtonClick,
  handleDeleteButtonClick,
  setOpenPasteImageDialog,
  adjustmentData,
  isLoading,
  manualActDocumentTypes,
  enteringMode
}: ManualEntryModeProps) {
  const theme = useTheme();

  return (
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
          flexWrap: 'wrap'
        }}
      >
        {/* 1. Shaxsiy ma'lumotlar guruhi */}
        <Stack direction="row" spacing={4} sx={{ flex: 1 }}>
          <Box>
            <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('tableHeaders.accountNumber')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {hasValidAriza(ariza)
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
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {hasValidAriza(ariza) ? ariza?.fio || '' : abonentData?.fullName || '—'}
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
                  hasValidAriza(ariza)
                    ? String(ariza.next_prescribed_cnt ?? rows[0]?.yashovchilar_soni ?? '')
                    : yashovchiSoniInput
                }
                onChange={(e) => {
                  const v = e.target.value;
                  if (hasValidAriza(ariza)) {
                    setAriza({ ...ariza, next_prescribed_cnt: v === '' ? null : Number(v) });
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

      <AdjustmentAlert
        adjustmentData={adjustmentData}
        aktSumm={aktSumm}
        onApplyRecommendedSum={setAktSumm}
      />

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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { xs: 'flex-start', sm: 'center', flexWrap: 'nowrap' } }}
        >
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
            sx={{ minWidth: 180 }}
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
            disabled={
              (aktType === 'gps' && photos.length === 0) ||
              (!((ariza?.status === 'yangi' || ariza?.status === 'qabul qilindi') && !isLoading) && enteringMode !== 'manual')
            }
            onClick={handlePrimaryButtonClick}
            sx={{ px: 3 }}
          >
            {t('buttons.submitEntry')}
          </Button>
          {aktType === 'gps' && (
            <Button variant="contained" color="success" onClick={() => setOpenPasteImageDialog(true)}>
              <Photo />
            </Button>
          )}

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
  );
}
