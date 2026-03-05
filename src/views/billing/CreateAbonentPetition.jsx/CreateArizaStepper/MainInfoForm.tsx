import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from '@mui/material';
import { Stack } from '@mui/system';
import { t } from 'i18next';
import React from 'react';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import { CompactKeyValue } from 'ui-component/CompactKeyValue';
import { useStepperLogic } from './useStepperLogic';
import { useStore } from '../useStore';
import { documentTypes } from 'store/constant';

function MainInfoForm() {
  const { accountNumber, setAccountNumber, accountNumber2, setAccountNumber2 } = useStepperLogic();
  const { abonentData, abonentData2, aktType, setAktType } = useStore();

  return (
    <Box>
      <FormControl sx={{ my: 2 }}>
        <Stack direction={'row'} spacing={2}>
          <AccountNumberInput
            label={t('createAbonentPetitionPage.accountNumber')}
            value={accountNumber}
            setFunc={setAccountNumber}
            required
          />
          <TextField label={t('tableHeaders.inhabitantCount')} disabled value={abonentData.house.inhabitantCnt} />
        </Stack>
      </FormControl>
      {abonentData.id ? (
        <>
          <CompactKeyValue
            data={[
              { key: t('tableHeaders.fullName'), value: abonentData.fullName },
              { key: t('tableHeaders.mfy'), value: abonentData.mahallaName },
              { key: t('tableHeaders.accountNumber'), value: abonentData.accountNumber },
              { key: t('tableHeaders.kSaldo'), value: abonentData.balance.kSaldo }
            ]}
            xs={3}
          />
          <Box sx={{ my: 2 }}>
            <FormControl required>
              <FormLabel id="akt-type-label">{t('petitionType')}</FormLabel>
              <RadioGroup
                sx={{ flexDirection: 'row' }}
                aria-required
                value={aktType}
                onChange={(e) => setAktType(e.target.value as typeof aktType)}
                aria-labelledby="akt-type-label"
              >
                {documentTypes.map((item) => (
                  <FormControlLabel
                    sx={{ border: '1px solid #ccc', p: '3px 10px', borderRadius: '5px' }}
                    control={<Radio />}
                    value={item}
                    // @ts-ignore
                    label={t(`documentTypes.${item}`)}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        </>
      ) : (
        ''
      )}
      {aktType === 'dvaynik' ? (
        <>
          <FormControl sx={{ my: 2 }}>
            <Stack direction={'row'} spacing={2}>
              <AccountNumberInput
                label={t('createAbonentPetitionPage.dublicateAccountNumber')}
                value={accountNumber2}
                setFunc={setAccountNumber2}
                required
              />
              <TextField label={t('tableHeaders.inhabitantCount')} disabled value={abonentData2.house.inhabitantCnt} />
            </Stack>
          </FormControl>
          {abonentData2.id ? (
            <>
              <CompactKeyValue
                data={[
                  { key: t('tableHeaders.fullName'), value: abonentData2.fullName },
                  { key: t('tableHeaders.mfy'), value: abonentData2.mahallaName },
                  { key: t('tableHeaders.accountNumber'), value: abonentData2.accountNumber },
                  { key: t('tableHeaders.kSaldo'), value: abonentData2.balance.kSaldo }
                ]}
                md={3}
              />
            </>
          ) : (
            ''
          )}
        </>
      ) : (
        ''
      )}
    </Box>
  );
}

export default MainInfoForm;
