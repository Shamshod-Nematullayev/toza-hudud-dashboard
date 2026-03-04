import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Card, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack, TextField } from '@mui/material';
import { t } from 'i18next';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import { Fragment, useEffect, useState } from 'react';
import { aktType, defaultAbonentData, useStore } from './useStore';
import { CompactKeyValue } from 'ui-component/CompactKeyValue';
import { documentTypes } from 'store/constant';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

const actsCanChangeInhabitants: aktType[] = ['odam_soni', 'dvaynik', 'death'];

export default function CreateArizaStepperForm() {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [accountNumber, setAccountNumber] = useState('');
  const [accountNumber2, setAccountNumber2] = useState('');
  const [recalculateType, setRecalculateType] = useState<'general' | 'single'>('general');
  const {
    updateAbonentDataByAccNum,
    abonentData,
    abonentData2,
    setAbonentData2,
    setAbonentData,
    aktType,
    setAktType,
    yashovchiSoniInput,
    setYashovchiSoniInput
  } = useStore();

  useEffect(() => {
    if (accountNumber.length === 12) {
      updateAbonentDataByAccNum(accountNumber, 'main');
    } else {
      if (abonentData.accountNumber) setAbonentData(defaultAbonentData);
    }
  }, [accountNumber]);
  useEffect(() => {
    if (accountNumber2.length === 12) {
      updateAbonentDataByAccNum(accountNumber2, 'dublicate');
    } else {
      if (abonentData2.accountNumber) setAbonentData2(defaultAbonentData);
    }
  }, [accountNumber2]);

  const isStepOptional = (step: number) => {
    return step === 1;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const steps = [
    {
      label: t('createAbonentPetitionSteps.mainInfo'),
      content: (
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
      )
    },
    {
      label: t('createAbonentPetitionSteps.qaytaHisobKitob'),
      content: (
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
                    //   value={startDate}
                    //   onChange={setStartDate}
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
                  <Typography>{12345}</Typography>
                </Stack>
              </FormControl>
            )}
            <FormControl sx={{ my: 2 }}>
              {recalculateType === 'single' &&
                Array.from({ length: Math.abs(Number(yashovchiSoniInput) - abonentData.house.inhabitantCnt) }).map((_, index) => (
                  <DatePicker
                    key={index}
                    views={['year', 'month']}
                    minDate={dayjs('2019-01-01')}
                    maxDate={dayjs()}
                    label={t('recalculator.from')}
                    format="DD.MM.YY"
                    //   value={startDate}
                    //   onChange={setStartDate}
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
                ))}
            </FormControl>
          </Box>
        </Box>
      )
    },
    {
      label: t('createAbonentPetitionSteps.finally'),
      content: <FormControl>Nimadir 3</FormControl>
    }
  ];

  return (
    <Card sx={{ p: 2, boxShadow: '5', mt: 2 }}>
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep}>
          {steps.map(({ label }, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: {
              optional?: React.ReactNode;
            } = {};
            if (isStepOptional(index)) {
              labelProps.optional = <Typography variant="caption">{t('optional')}</Typography>;
            }
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === steps.length ? (
          <Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>All steps completed - you&apos;re finished</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleReset}>Reset</Button>
            </Box>
          </Fragment>
        ) : (
          <Fragment>
            {steps[activeStep].content}
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                {t('buttons.back')}
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              {isStepOptional(activeStep) && (
                <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                  {t('buttons.skip')}
                </Button>
              )}
              <Button onClick={handleNext} disabled={activeStep === 0 && aktType === null}>
                {activeStep === steps.length - 1 ? 'Finish' : t('buttons.next')}
              </Button>
            </Box>
          </Fragment>
        )}
      </Box>
    </Card>
  );
}
