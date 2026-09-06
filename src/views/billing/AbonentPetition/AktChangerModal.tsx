import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Tooltip
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import useArizaStore from './useStore';
import FileInputDrop from 'ui-component/FileInputDrop';
import api from 'utils/api';
import { Calculate, Image } from '@mui/icons-material';
import { useStore } from '../CreateAbonentPetition.jsx/useStore';
import useLoaderStore from 'store/loaderStore';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface AktChangerModalProps {
  onClose: () => void;
}

function AktChangerModal({ onClose }: AktChangerModalProps) {
  const { t } = useTranslation();
  const { ariza, setAriza, setPasteImgModalOpen } = useArizaStore();
  const { setIsLoading } = useLoaderStore();
  const { recalculationPeriods } = useStore();

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
      setDescription(ariza.aktInfo.description ?? '');
    } else {
      setInhabitant('0');
      setAmountWithNDS(0);
      setAmountWithoutNDS(0);
      setDescription('');
    }
  }, [ariza]);

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
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('inhabitantCount', inhabitant);
      formData.append('amountWithQQS', String(amountWithNDS));
      formData.append('amountWithoutQQS', String(amountWithoutNDS));
      formData.append('allAmount', String(allAmount));
      formData.append('description', description);
      formData.append('photos', JSON.stringify(ariza.tempPhotos || []));
      formData.append('actNumber', ariza.document_number);
      if (file) {
        formData.append('file', file);
      }
      const arizaData = (
        await api.put('/arizalar/change-act/' + ariza._id, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      ).data;
      setAriza(arizaData.ariza);
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
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {t('recalculationDetailPage.reActTitle', 'Qayta akt qilish')} {ariza?.document_number ? `(#${ariza.document_number})` : ''}
      </DialogTitle>
      <DialogContent dividers>
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
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Stack direction="row" spacing={1} sx={{ mr: 'auto' }}>
          <Tooltip title={t('recalculationDetailPage.getFromCalc', 'Kalkulyatordagi qiymatlarni olish')}>
            <Button variant="outlined" color="secondary" onClick={getDataFromCalc} startIcon={<Calculate />}>
              {t('recalculationDetailPage.calc', 'Kalkulyator')}
            </Button>
          </Tooltip>
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
