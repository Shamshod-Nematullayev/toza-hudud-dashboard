import { Box, Stack } from '@mui/system';
import React from 'react';
import { useStepperLogic } from './useStepperLogic';
import { aktType, useStore } from '../useStore';
import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { t } from 'i18next';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import RecalculatorAbonent from 'ui-component/cards/RecalculatorAbonent';
import DHJTable from '../DHJTable';

const actsCanChangeInhabitants: aktType[] = ['odam_soni', 'dvaynik', 'death'];

function RecalculateForm() {
  const {
    recalculateType,
    setRecalculateType,
    generalFromDate,
    setGeneralFromDate,
    singleFromDates,
    setSingleFromDates,
    singleTotalSums,
    generalTotalSum
  } = useStepperLogic();
  const { aktType, yashovchiSoniInput, setYashovchiSoniInput, abonentData } = useStore();
  return (
    <Grid container spacing={2} height={'100%'}>
      <Grid item xs={12} md={6} height={'100%'}>
        <Box height={'100%'}>
          {actsCanChangeInhabitants.includes(aktType) ? (
            // Yashovchi soni o'zgaratigan aktlar uchun
            <>
              <TextField
                label={t('tableHeaders.nextInhabitantCount')}
                value={yashovchiSoniInput}
                onChange={(e) => setYashovchiSoniInput(e.target.value)}
              />

              <Box>
                <FormControl sx={{ my: 2 }}>
                  <RadioGroup
                    aria-labelledby="recalculate-type-label"
                    value={recalculateType}
                    onChange={(e) => setRecalculateType(e.target.value as typeof recalculateType)}
                  >
                    <FormLabel id="recalculate-type-label">{t('createAbonentPetitionStepsPage.recalculateType')}</FormLabel>
                    <Stack direction={'row'} spacing={2}>
                      <FormControlLabel control={<Radio />} label={t('createAbonentPetitionStepsPage.general')} value={'general'} />
                      <FormControlLabel control={<Radio />} label={t('createAbonentPetitionStepsPage.single')} value={'single'} />
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </Box>
              {recalculateType && (
                <Box>
                  {recalculateType === 'general' && (
                    <FormControl sx={{ my: 2 }}>
                      <Stack direction={'row'} alignItems={'center'} spacing={2}>
                        <DatePicker
                          views={['year', 'month']}
                          minDate={dayjs('2019-01-01')}
                          maxDate={dayjs()}
                          label={t('recalculator.from')}
                          format="MM.YY"
                          value={generalFromDate}
                          onChange={setGeneralFromDate}
                          sx={{
                            input: {
                              fontSize: '12px'
                            },
                            width: '100%'
                          }}
                          slotProps={{
                            openPickerIcon: {
                              sx: {
                                fontSize: '16px'
                              }
                            }
                          }}
                        />
                        <Typography>{generalTotalSum.summ?.toLocaleString()}</Typography>
                      </Stack>
                    </FormControl>
                  )}
                  <FormControl sx={{ my: 2 }}>
                    {recalculateType === 'single' &&
                      singleFromDates.map((_, index) => (
                        <Stack direction={'row'} alignItems={'center'} spacing={2} key={index}>
                          <DatePicker
                            key={index}
                            views={['year', 'month']}
                            minDate={dayjs('2019-01-01')}
                            maxDate={dayjs()}
                            label={t('recalculator.from')}
                            format="DD.MM.YY"
                            value={_}
                            onChange={(e) => {
                              setSingleFromDates((prev) => prev.map((item, i) => (i === index ? e : item)));
                            }}
                            sx={{
                              input: {
                                fontSize: '12px'
                              },
                              width: '100%',
                              maxWidth: '150px'
                            }}
                            slotProps={{
                              openPickerIcon: {
                                sx: {
                                  fontSize: '16px'
                                }
                              }
                            }}
                          />
                          <Typography>{singleTotalSums[index]?.summ?.toLocaleString()}</Typography>
                        </Stack>
                      ))}
                  </FormControl>
                </Box>
              )}
            </>
          ) : aktType === 'viza' ? (
            // Pasport vizasi yoki boshqa xujjatlari asosida faqat qayta hisob kitob qilinadigan aktlar uchun
            <>
              <RecalculatorAbonent />
            </>
          ) : (
            ''
          )}
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        {/* <DHJTable abonentData={abonentData} /> */}
      </Grid>
    </Grid>
  );
}

export default RecalculateForm;
