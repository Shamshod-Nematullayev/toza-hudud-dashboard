// useStepperLogic.ts
import { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { calculateRevaluation } from 'services/recalculateService';
import { defaultAbonentData, useStore } from '../useStore';
import api from 'utils/api';
import { getTarifElement } from 'ui-component/cards/RecalculatorAbonent';

export const useStepperLogic = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [accountNumber, setAccountNumber] = useState('');
  const [accountNumber2, setAccountNumber2] = useState('');
  const [recalculateType, setRecalculateType] = useState<'general' | 'single'>('general');
  const [generalFromDate, setGeneralFromDate] = useState<Dayjs | null>(null);
  const [singleFromDates, setSingleFromDates] = useState<(Dayjs | null)[]>([]);
  const [generalTotalSum, setGeneralTotalSum] = useState({
    summ: 0,
    withQQS: 0
  });
  const [singleTotalSums, setSingleTotalSums] = useState<{ summ: number; withQQS: number }[]>([]);
  const {
    updateAbonentDataByAccNum,
    abonentData,
    abonentData2,
    setAbonentData2,
    setAbonentData,
    yashovchiSoniInput,
    hisoblandiJadval,
    setHisoblandiJadval
  } = useStore();

  useEffect(() => {
    api.get('/billing/get-tariffs').then((res) => {
      const tariffs = res.data.tariffs;

      let result = [
        {
          month: 1,
          year: 2019,
          hisoblandi: 2000,
          withQQS: 2000
        }
      ];
      for (let tariff of tariffs) {
        result.push(
          ...getTarifElement(tariff).filter((row) => result.find((r) => r.month == row.month && r.year == row.year) == undefined)
        );
      }
      setHisoblandiJadval(result.sort((r1, r2) => r1.year - r2.year || r1.month - r2.month));
    });
  }, []);

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

  useEffect(() => {
    if (recalculateType === 'single') {
      setSingleFromDates([]);
      Array.from({ length: Math.abs(Number(yashovchiSoniInput) - abonentData.house.inhabitantCnt) }).forEach((_, index) => {
        if (index === 0) {
          setSingleFromDates([dayjs().startOf('month')]);
        } else {
          setSingleFromDates((prev) => [...prev, dayjs().startOf('month')]);
        }
      });
    }
  }, [recalculateType, yashovchiSoniInput]);

  useEffect(() => {
    if (recalculateType === 'general' && generalFromDate) {
      const total = calculateRevaluation({
        fromMoon: generalFromDate.month() + 1,
        fromYear: generalFromDate.year(),
        toMoon: dayjs().startOf('month').get('month') + 1,
        toYear: dayjs().year(),
        hisoblandiJadval,
        yashovchilar: (Number(yashovchiSoniInput) - abonentData.house.inhabitantCnt) * -1
      });
      setGeneralTotalSum(total);
    }
  }, [generalFromDate, yashovchiSoniInput]);

  useEffect(() => {
    setSingleTotalSums([]);
    singleFromDates.forEach((date, index) => {
      if (date) {
        const total = calculateRevaluation({
          fromMoon: date.month() + 1,
          fromYear: date.year(),
          toMoon: dayjs().startOf('month').get('month') + 1,
          toYear: dayjs().year(),
          hisoblandiJadval,
          yashovchilar: 1
        });
        console.log(total);
        console.log({
          fromMoon: date.month() + 1,
          fromYear: date.year(),
          toMoon: dayjs().startOf('month').get('month') + 1,
          toYear: dayjs().year(),
          hisoblandiJadval
        });

        setSingleTotalSums((prev) => [...prev, total]);
      }
    });
  }, [singleFromDates]);

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
  return {
    activeStep,
    handleNext,
    handleBack,
    generalTotalSum,
    generalFromDate,
    setGeneralFromDate,
    singleTotalSums,
    singleFromDates,
    setSingleFromDates,
    setActiveStep,
    handleSkip,
    handleReset,
    isStepOptional,
    isStepSkipped,
    setAccountNumber,
    setAccountNumber2,
    recalculateType,
    setRecalculateType,
    accountNumber,
    accountNumber2
  };
};
