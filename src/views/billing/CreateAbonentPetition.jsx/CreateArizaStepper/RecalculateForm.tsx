import { Box, Stack } from '@mui/system';
import React from 'react';
import { useStepperLogic } from './useStepperLogic';
import { aktType, useStore } from '../useStore';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { t } from 'i18next';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

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
  const { aktType, yashovchiSoniInput, setYashovchiSoniInput } = useStore();
  return (
    <Box>
      {actsCanChangeInhabitants.includes(aktType) ? (
        <>
          <TextField
            label={t('tableHeaders.nextInhabitantCount')}
            value={yashovchiSoniInput}
            onChange={(e) => setYashovchiSoniInput(e.target.value)}
          />
        </>
      ) : (
        ''
      )}
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
    </Box>
  );
}

export default RecalculateForm;
