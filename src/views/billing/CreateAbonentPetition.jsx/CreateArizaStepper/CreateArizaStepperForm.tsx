import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Card, FormControl } from '@mui/material';
import { t } from 'i18next';
import { Fragment } from 'react';
import { useStore } from '../useStore';
import { useStepperLogic } from './useStepperLogic';
import MainInfoForm from './MainInfoForm';
import RecalculateForm from './RecalculateForm';

export default function CreateArizaStepperForm() {
  const { activeStep, handleNext, handleBack, handleReset, handleSkip, isStepOptional, isStepSkipped } = useStepperLogic();
  const { aktType } = useStore();

  const steps = [
    {
      label: t('createAbonentPetitionSteps.mainInfo'),
      content: <MainInfoForm />
    },
    {
      label: t('createAbonentPetitionSteps.qaytaHisobKitob'),
      content: <RecalculateForm />
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
              <Button onClick={handleNext} disabled={activeStep === 0 && aktType === null} variant="contained">
                {activeStep === steps.length - 1 ? 'Finish' : t('buttons.next')}
              </Button>
            </Box>
          </Fragment>
        )}
      </Box>
    </Card>
  );
}
