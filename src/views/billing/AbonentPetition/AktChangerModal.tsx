import {
  Alert,
  AlertTitle,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import useArizaStore from './useStore';
import FileInputDrop from 'ui-component/FileInputDrop';
import api from 'utils/api';
import { Calculate, Image, CloudUpload, InsertDriveFile } from '@mui/icons-material';
import {
  useStore,
  buildActDescriptionFromPeriods,
  getCleanAsoslantiruvchi,
  isActCalculationSummary
} from '../CreateAbonentPetition.jsx/useStore';
import useLoaderStore from 'store/loaderStore';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface AktChangerModalProps {
  onClose: () => void;
}

function AktChangerModal({ onClose }: AktChangerModalProps) {
  const { t } = useTranslation();
  const { ariza, setAriza, setAktFileURL, setPasteImgModalOpen } = useArizaStore();
  const { setIsLoading } = useLoaderStore();
  const { recalculationPeriods } = useStore();

  const isDvaynik = ariza?.document_type === 'dvaynik';
  const isCancelContract = ariza?.document_type === 'cancelContract';
  const isContractCancellation = isDvaynik || isCancelContract;

  const [allAmount, setAllAmount] = useState<number>(0);
  const [inhabitant, setInhabitant] = useState<string>('0');
  const [amountWithNDS, setAmountWithNDS] = useState<number>(0);
  const [amountWithoutNDS, setAmountWithoutNDS] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (ariza?.aktInfo) {
      setInhabitant(String(ariza.aktInfo.currentInhabitantCount ?? 0));
      setAmountWithNDS(ariza.aktInfo.amountWithQQS ?? 0);
      setAmountWithoutNDS(ariza.aktInfo.amountWithoutQQS ?? 0);
      const existingDesc = ariza.aktInfo.description ?? '';
      if (isContractCancellation) {
        setDescription(existingDesc || (isDvaynik ? "Ikkilamchi hisob raqamini o'chirish" : 'Kontraktni bekor qilish'));
      } else {
        setDescription(isActCalculationSummary(existingDesc) ? '' : existingDesc);
      }
    } else {
      setInhabitant('0');
      setAmountWithNDS(0);
      setAmountWithoutNDS(0);
      setDescription(isContractCancellation ? (isDvaynik ? "Ikkilamchi hisob raqamini o'chirish" : 'Kontraktni bekor qilish') : '');
    }
  }, [ariza, isContractCancellation, isDvaynik]);

  useEffect(() => {
    setAllAmount((Number(amountWithNDS) || 0) + (Number(amountWithoutNDS) || 0));
  }, [amountWithNDS, amountWithoutNDS]);

  const getDataFromCalc = () => {
    let withNDS = 0;
    let withoutNDS = 0;
    (recalculationPeriods || []).forEach((item: any) => {
      withNDS += Number(item.withQQSTotal) || 0;
      withoutNDS += Number(item.withoutQQSTotal) || 0;
    });
    setAmountWithNDS(withNDS);
    setAmountWithoutNDS(withoutNDS);
    toast.info(t('recalculationDetailPage.calcLoaded', 'Kalkulyator qiymatlari yuklandi'));
  };

  const setFileFunction = (files: FileList | null) => {
    if (files?.[0]) {
      setFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isContractCancellation && !file && !ariza?.aktInfo?.fileId) {
      toast.error(t('messages.fileRequired', 'Iltimos, PDF fayl yuklang'));
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      if (isContractCancellation) {
        formData.append('inhabitantCount', '0');
        formData.append('amountWithQQS', '0');
        formData.append('amountWithoutQQS', '0');
        formData.append('allAmount', '0');
        const defaultDesc = isDvaynik ? "Ikkilamchi hisob raqamini o'chirish" : 'Kontraktni bekor qilish';
        formData.append('description', (description.trim() || ariza?.aktInfo?.description || defaultDesc).slice(0, 250));
      } else {
        const periodsSource = recalculationPeriods?.length ? recalculationPeriods : ariza?.recalculationPeriods;
        const finalDescription =
          description.trim() ||
          getCleanAsoslantiruvchi(ariza?.comment).trim() ||
          buildActDescriptionFromPeriods(periodsSource) ||
          ariza?.aktInfo?.description ||
          'fuqaro arizasi';
        formData.append('inhabitantCount', inhabitant);
        formData.append('amountWithQQS', String(amountWithNDS));
        formData.append('amountWithoutQQS', String(amountWithoutNDS));
        formData.append('allAmount', String(allAmount));
        formData.append('description', finalDescription.slice(0, 250));
      }

      formData.append('photos', JSON.stringify(ariza.tempPhotos || []));
      formData.append('actNumber', String(ariza.document_number || ''));
      if (file) {
        formData.append('file', file);
      }

      const arizaData = (
        await api.put('/arizalar/change-act/' + ariza._id, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      ).data;

      setAriza(arizaData.ariza);

      if (arizaData.ariza?.aktInfo?.fileId) {
        try {
          const base64File = (
            await api.get('/billing/get-file/', {
              params: { file_id: arizaData.ariza.aktInfo.fileId },
              headers: { 'hide-error': true }
            })
          ).data.file;
          setAktFileURL(base64File);
        } catch (err) {}
      }

      toast.success(t('messages.success', 'Muvaffaqiyatli saqlandi'));
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || t('messages.error', 'Xatolik yuz berdi'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth={isContractCancellation ? 'md' : 'sm'} fullWidth>
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>
          {isDvaynik
            ? t('recalculationDetailPage.reActDvaynikTitle', "Ikkilamchi kod aktini yangilash")
            : isCancelContract
            ? t('recalculationDetailPage.reActCancelContractTitle', "Shartnomani bekor qilish aktini yangilash")
            : t('recalculationDetailPage.reActTitle', 'Qayta akt qilish')}
          {ariza?.document_number ? ` (#${ariza.document_number})` : ''}
        </span>
        {isDvaynik && (
          <Chip label="Ikkilamchi kod" color="primary" size="small" variant="filled" sx={{ fontWeight: 700 }} />
        )}
      </DialogTitle>
      <DialogContent dividers>
        {isContractCancellation ? (
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {/* Informational Alert Box */}
            <Alert
              severity="info"
              variant="outlined"
              sx={{
                borderRadius: 2,
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.08)' : '#f0f7ff'),
                borderColor: 'info.light'
              }}
            >
              <AlertTitle sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {isDvaynik
                  ? "Ikkilamchi kodni o‘chirish dalolatnomasi"
                  : "Shartnomani bekor qilish dalolatnomasi"}
              </AlertTitle>
              <Typography variant="body2" sx={{ color: 'text.primary', mb: 1.5 }}>
                {isDvaynik
                  ? "Odam soni va saldoni 0 ga tushirish akti tasdiqlangan (o‘zgartirilmaydi). Shartnomani bekor qilish akti esa yangi holatda turibdi — bu yerda faqat tuzatilgan PDF akt faylini almashtirishingiz kerak."
                  : "Abonent balansi va yashovchilar soni 0 qilingan. Shartnomani bekor qilish aktining faylini (PDF) almashtirishingiz mumkin."}
              </Typography>

              <Divider sx={{ my: 1, borderColor: 'divider' }} />

              <Grid container spacing={1.5} sx={{ pt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Asosiy hisob raqami:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {ariza?.licshet || '-'} {ariza?.fio ? `(${ariza.fio})` : ''}
                  </Typography>
                </Grid>

                {isDvaynik && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Ikkilamchi hisob raqami:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', color: 'error.main' }}>
                      {ariza?.ikkilamchi_licshet || '-'} {ariza?.ikkilamchiFullName ? `(${ariza.ikkilamchiFullName})` : ''}
                    </Typography>
                  </Grid>
                )}

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Bekor qilish akti ID:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    #{ariza?.akt_id || ariza?.aktInfo?.id || '-'}
                  </Typography>
                </Grid>

                {isDvaynik && (
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Balansni 0 qilish akti ID:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                      #{ariza?.balance_akt_id || ariza?.balance_akt_info?.id || '-'}
                    </Typography>
                  </Grid>
                )}

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Akt holati:
                  </Typography>
                  <Chip
                    size="small"
                    label={ariza?.actStatus || ariza?.aktInfo?.actStatus || 'NEW'}
                    color="info"
                    variant="outlined"
                    sx={{ height: 22, fontSize: '0.75rem', fontWeight: 700 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Yashovchilar / Akt summasi:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    0 kishi | 0 so‘m
                  </Typography>
                </Grid>
              </Grid>
            </Alert>

            {/* File Upload Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CloudUpload fontSize="small" color="primary" />
                {t('recalculationDetailPage.uploadCorrectedPdf', 'Tuzatilgan PDF faylni yuklang')}:
              </Typography>
              <Tooltip title={t('recalculationDetailPage.fileDropTooltip', 'Agar fayl yuklamasangiz joriy fayl saqlanadi')}>
                <Card
                  sx={{
                    border: '2px dashed',
                    borderColor: file ? 'primary.main' : 'divider',
                    bgcolor: file ? 'action.hover' : 'background.paper',
                    p: 1.5,
                    borderRadius: 2
                  }}
                >
                  <FileInputDrop setFiles={setFileFunction} />
                  {file && (
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <InsertDriveFile color="primary" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(file.size / 1024).toFixed(1)} KB
                          </Typography>
                        </Box>
                      </Stack>
                      <Button size="small" color="error" onClick={() => setFile(null)}>
                        {t('tableActions.cancel', 'Bekor qilish')}
                      </Button>
                    </Box>
                  )}
                </Card>
              </Tooltip>
            </Box>

            {/* Description */}
            <TextField
              label={t('recalculationDetailPage.actDescription', 'Akt izohi')}
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('recalculationDetailPage.reasonPlaceholder', 'Batafsil izoh yozing...')}
            />
          </Stack>
        ) : (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="number"
                fullWidth
                size="small"
                label={t('recalculationDetailPage.inhabitantCount', 'Yashovchilar soni')}
                value={inhabitant}
                onChange={(e) => setInhabitant(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="number"
                fullWidth
                size="small"
                label={t('tableHeaders.actAmount', 'Jami akt summasi')}
                disabled
                value={allAmount}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="number"
                fullWidth
                size="small"
                label={t('recalculationDetailPage.amountWithoutNDS', 'QQS siz summa')}
                value={amountWithoutNDS}
                onChange={(e) => setAmountWithoutNDS(Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="number"
                fullWidth
                size="small"
                label={t('recalculationDetailPage.amountWithNDS', 'QQS bilan summa')}
                value={amountWithNDS}
                onChange={(e) => setAmountWithNDS(Number(e.target.value))}
              />
            </Grid>
            <Grid size={12}>
              <Tooltip title={t('recalculationDetailPage.fileDropTooltip', 'Agar fayl yuklamasangiz joriy fayl saqlanadi')}>
                <Card sx={{ border: '1px dashed', borderColor: 'divider', p: 1 }}>
                  <FileInputDrop setFiles={setFileFunction} />
                </Card>
              </Tooltip>
            </Grid>
            <Grid size={12}>
              <TextField
                label={t('recalculationDetailPage.actDescription', 'Izoh')}
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('recalculationDetailPage.reasonPlaceholder', 'Batafsil izoh yozing...')}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Stack direction="row" spacing={1} sx={{ mr: 'auto' }}>
          {!isContractCancellation && (
            <Tooltip title={t('recalculationDetailPage.getFromCalc', 'Kalkulyatordagi qiymatlarni olish')}>
              <Button variant="outlined" color="secondary" onClick={getDataFromCalc} startIcon={<Calculate />}>
                {t('recalculationDetailPage.calc', 'Kalkulyator')}
              </Button>
            </Tooltip>
          )}
          <Tooltip title={t('recalculationDetailPage.attachImage', 'Rasmlar biriktirish')}>
            <Badge badgeContent={(ariza?.tempPhotos || []).length} color="error">
              <Button variant="outlined" color="secondary" onClick={() => setPasteImgModalOpen(true)} startIcon={<Image />}>
                {t('recalculationDetailPage.images', 'Rasmlar')}
              </Button>
            </Badge>
          </Tooltip>
        </Stack>

        <Button onClick={onClose} color="inherit">
          {t('tableActions.cancel', 'Bekor qilish')}
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {t('tableActions.save', 'Saqlash')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AktChangerModal;
