import React, { ReactNode, useRef, useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../abonentStore';
import { t } from 'i18next';
import {
  Avatar,
  Button,
  DialogActions,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { useAbonentLogic } from '../useAbonentLogic';
import { useReactToPrint } from 'react-to-print';
import { reactToPrintDefaultOptions } from 'store/constant';
import { Box } from '@mui/system';
import { Verified } from '@mui/icons-material';

function PrintAbonentCard() {
  const {
    openPrintAbonentcardState,
    setOpenPrintAbonentcardState,
    documentLanguage,
    setDocumentLanguage,
    abonentDetails,
    cardDetails,
    getCardDetails,
    clearCardDetails
  } = useAbonentStore();
  const { residentId } = useAbonentLogic();

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
    setOpenPrintAbonentcardState(false);
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
        residentId
      });
    } else {
      printFunction();
    }
  };
  return (
    <DraggableDialog
      open={openPrintAbonentcardState}
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
        <div className="page" ref={printSectionRef}>
          <Typography
            variant="h2"
            sx={{
              color: 'success.main',
              textAlign: 'right'
            }}
          >
            {cardDetails.companyName}
          </Typography>
          <Divider sx={{ borderColor: 'success.main' }} />
          <Grid container alignItems={'center'}>
            <Grid item xs={10}>
              <CompactKeyValue
                data={[
                  {
                    key: t('tableHeaders.accountNumber'),
                    value: (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, border: '1px solid #000', p: '2px 4px ', mr: 1 }}>
                          {cardDetails.accountNumber}
                        </Typography>
                        <Verified />
                      </div>
                    )
                  },
                  {
                    key: t('tableHeaders.fullName'),
                    value: cardDetails.fullName
                  },
                  {
                    key: t('tableHeaders.address'),
                    value: [cardDetails.districtName, cardDetails.mahallaName, cardDetails.streetName, cardDetails.flatNumber]
                      .filter(Boolean)
                      .join(', ')
                  },
                  {
                    key: t('tableHeaders.contractDate'),
                    value: cardDetails.contractDate
                  },
                  {
                    key: t('tableHeaders.kSaldo'),
                    value: `${(cardDetails.currentKSaldo * -1).toLocaleString()} ${t('uzs')} (${cardDetails.currentKSaldo > 0 ? 'Qarzdor' : 'Haqdor'})`
                  },
                  {
                    key: t('tableHeaders.period'),
                    value: cardDetails.currentPeriod
                  },
                  {
                    key: t('tableHeaders.inhabitantCount'),
                    value: cardDetails.inhabitantCnt
                  },
                  {
                    key: t('tableHeaders.phone'),
                    value: cardDetails.phone
                  }
                ]}
              />
            </Grid>
            <Grid item xs={1.5}>
              <Avatar
                variant="rounded"
                src={`data:image/png;base64,${abonentDetails?.citizen.photo}`}
                sx={{
                  width: '90%',
                  height: 'auto',
                  aspectRatio: '1/1.2',
                  borderRadius: '12px',
                  bgcolor: '#f0f2f5'
                }}
              />
            </Grid>
          </Grid>
          <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>{t('tableHeaders.period')}</th>
                <th>{t('tableHeaders.nSaldo')}</th>
                <th>{t('tableHeaders.nachis')}</th>
                <th>{t('tableHeaders.cashAmount')}</th>
                <th>{t('tableHeaders.q1031Amount')}</th>
                <th>{t('tableHeaders.eMoneyAmount')}</th>
                <th>{t('tableHeaders.munisAmount')}</th>
                <th>{t('tableHeaders.act')}</th>
                <th>{t('tableHeaders.kSaldo')}</th>
                <th>{t('tableHeaders.inhabitantCount')}</th>
              </tr>
            </thead>
            <tbody>
              {cardDetails.balanceDtoList.map((item, i) => (
                <tr key={i} style={{ textAlign: 'center' }}>
                  <td style={{ padding: '0px 5px' }}>{item.period}</td>
                  <td style={{ padding: '0px 5px' }}>{item.nSaldo.toLocaleString()}</td>
                  <td style={{ padding: '0px 5px' }}>{item.accrual.toLocaleString()}</td>
                  <td style={{ padding: '0px 5px' }}>{item.cashAmount.toLocaleString()}</td>
                  <td style={{ padding: '0px 5px' }}>{item.q1031Amount.toLocaleString()}</td>
                  <td style={{ padding: '0px 5px' }}>{item.eMoneyAmount.toLocaleString()}</td>
                  <td style={{ padding: '0px 5px' }}>{item.munisAmount.toLocaleString()}</td>
                  <td style={{ padding: '0px 5px' }}>{item.actAmount.toLocaleString()}</td>
                  <td style={{ padding: '0px 5px' }}>{item.kSaldo.toLocaleString()}</td>
                  <td style={{ padding: '0px 5px' }}>{item.inhabitantCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Stack direction={'row'} spacing={2} sx={{ mt: 2 }}>
            <CompactKeyValue
              data={[
                {
                  key: t('tableHeaders.company'),
                  value: cardDetails.companyName
                },
                {
                  key: t('tableHeaders.director'),
                  value: cardDetails.companyDirector
                },
                {
                  key: t('tableHeaders.phone'),
                  value: cardDetails.companyPhone
                },
                {
                  key: t('tableHeaders.email'),
                  value: cardDetails.companyEmail
                },
                {
                  key: t('tableHeaders.bankName'),
                  value: cardDetails.companyBankName
                },
                {
                  key: t('tableHeaders.STIR'),
                  value: cardDetails.companyInn
                },
                {
                  key: t('tableHeaders.bankCredentials'),
                  value: [cardDetails.companyBankMFO, cardDetails.companyBankAccount].join(', ')
                }
              ]}
            />
            <img src={'data:image/png;base64,' + cardDetails.qrCodeImage} alt="qrCode" />
          </Stack>
        </div>
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

export const CompactKeyValue = ({ data, divider }: { data: { key: string; value: string | number | ReactNode }[]; divider?: boolean }) => {
  return (
    <List>
      {data.map((item, i) => (
        <>
          <ListItem sx={{ py: 0 }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ display: 'inline-block', minWidth: '150px', fontSize: 14 }}>
              {item.key}:
            </Typography>
            <span>
              {typeof item.value === 'string' || typeof item.value === 'number' ? (
                <Typography variant="body2" fontWeight={500} style={{ textOverflow: 'ellipsis' }}>
                  {item.value}
                </Typography>
              ) : (
                item.value
              )}
            </span>
          </ListItem>
          {divider && <Divider />}
        </>
      ))}
    </List>
  );
};
