import { useRef, useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../abonentStore';
import { t } from 'i18next';
import { Button, DialogActions, FormControl, FormControlLabel, MenuItem, Radio, RadioGroup, Stack, TextField } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { useAbonentLogic } from '../useAbonentLogic';
import { useReactToPrint } from 'react-to-print';
import { reactToPrintDefaultOptions } from 'store/constant';
import { AbonentCardView } from 'ui-component/cards/AbonentCardView';

interface PrintAbonentCardProps {
  open: boolean;
  onClose: () => void;
  // Qaysi identifikator bo'yicha qidirish (residentId yoki accountNo)
  fetchParams: { residentId?: number; accountNumber?: string };
}

function PrintAbonentCard({ open, fetchParams, onClose }: PrintAbonentCardProps) {
  const { documentLanguage, setDocumentLanguage, abonentDetails, cardDetails, getCardDetails, clearCardDetails } = useAbonentStore();

  const [fromPeriod, setFromPeriod] = useState<Dayjs | null>(null);
  const [toPeriod, setToPeriod] = useState<Dayjs | null>(null);

  const [period, setPeriod] = useState(`${abonentDetails?.balance.period}:${abonentDetails?.balance.period}`);
  const startOfYear = dayjs().startOf('year');

  const printSectionRef = useRef<any>(null);
  const printFunction = useReactToPrint({
    ...reactToPrintDefaultOptions,
    contentRef: printSectionRef
  });

  const handleClose = () => {
    onClose();
    clearCardDetails();
  };

  const handleClickPrintButton = async () => {
    if (!cardDetails?.accountNumber) {
      // @ts-ignore
      const periodFrom = period === 'other' ? `${fromPeriod?.get('month') + 1}.${fromPeriod?.get('year')}` : period.split(':')[0];
      // @ts-ignore
      const periodTo = period === 'other' ? `${toPeriod?.get('month') + 1}.${toPeriod?.get('year')}` : period.split(':')[1];
      await getCardDetails({
        lang: documentLanguage,
        periodFrom,
        periodTo,
        residentId: fetchParams.residentId as number,
        accountNumber: fetchParams.accountNumber as string
      });
    } else {
      printFunction();
    }
  };
  return (
    <DraggableDialog
      open={open}
      title={t('buttons.print') + ' ' + t('abonentCardPage.abonentCard')}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          width: '80%', // kenglikni belgilash
          maxWidth: '1200px' // maksimal kenglik
        }
      }}
    >
      {!cardDetails?.accountNumber ? (
        <>
          <Stack direction="row" spacing={1}>
            <TextField
              select
              label={t('language.lang')}
              value={documentLanguage}
              onChange={(e) => setDocumentLanguage(e.target.value as 'UZ' | 'ru')}
            >
              <MenuItem value="UZ">{t('language.uz')}</MenuItem>
              <MenuItem value="ru">{t('language.ru')}</MenuItem>
              <MenuItem value="uz-cyrl">{t('language.uz-cyrl')}</MenuItem>
            </TextField>
            <FormControl>
              <RadioGroup
                row
                sx={{ display: 'flex' }}
                aria-labelledby="abonent-card-period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <FormControlLabel
                  value={`${abonentDetails?.balance.period}:${abonentDetails?.balance.period}`}
                  control={<Radio />}
                  label={t('periodSelection.current')}
                />
                <FormControlLabel
                  value={`${startOfYear.month() + 1}.${startOfYear.year()}:${abonentDetails?.balance.period}`}
                  control={<Radio />}
                  label={t('periodSelection.currentYear')}
                />
                <FormControlLabel
                  value={`01.2019:${abonentDetails?.balance.period}`}
                  control={<Radio />}
                  label={t('periodSelection.allPeriods')}
                />
                <FormControlLabel value={`other`} control={<Radio />} label={t('periodSelection.other')} />
              </RadioGroup>
            </FormControl>
          </Stack>
          {period === 'other' && (
            <Stack direction={'row'} spacing={2} sx={{ mt: 2 }}>
              <DatePicker
                views={['year', 'month']}
                label={t('recalculator.from')}
                value={fromPeriod}
                onChange={(newValue) => setFromPeriod(newValue)}
              />
              <DatePicker
                views={['year', 'month']}
                label={t('recalculator.to')}
                value={toPeriod}
                onChange={(newValue) => setToPeriod(newValue)}
              />
            </Stack>
          )}
        </>
      ) : (
        <AbonentCardView abonentDetails={abonentDetails} cardDetails={cardDetails} t={t} />
      )}
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleClickPrintButton}>
          {t('buttons.print')}
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleClose}>
          {t('buttons.cancel')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default PrintAbonentCard;
