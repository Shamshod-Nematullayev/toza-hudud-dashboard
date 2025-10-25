import React, { useEffect, useState } from 'react';
import { useGpsDalolatnomaStore } from './useStore';
import { Button, ButtonGroup, Card, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextareaAutosize } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { t } from 'i18next';

function SideBarGpsCreateGpsDalolatnoma() {
  const {
    cars,
    getCarsFromDB,
    setCurrentCarId,
    currentCarId,
    responsibleCarId,
    setResponsibleCarId,
    date,
    setDate,
    description,
    setDescription,
    clearStore,
    saveDalolatnomaToDB,
    setCurrentCarDriver,
    currentCarDriver,
    responsibleCarDriver,
    setResponsibleCarDriver,
    handlePrint
  } = useGpsDalolatnomaStore();

  useEffect(() => {
    getCarsFromDB();
  }, []);

  useEffect(() => {
    const car = cars.find((c) => c.id === responsibleCarId);
    if (car?.driverIds.length === 1) setResponsibleCarDriver(car.driverIds[0]);
  }, [responsibleCarId]);
  useEffect(() => {
    const car = cars.find((c) => c.id === currentCarId);
    if (car?.driverIds.length === 1) setCurrentCarDriver(car.driverIds[0]);
  }, [currentCarId]);
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
      <DatePicker label={t('tableHeaders.createdDate')} value={date} onChange={setDate} format="DD.MM.YYYY" />
      <FormControl fullWidth sx={{ border: 'none' }}>
        <InputLabel id="responsibleCarId">Mas'ul texnika</InputLabel>
        <Select
          labelId="responsibleCarId"
          value={responsibleCarId}
          onChange={(e) => setResponsibleCarId(Number(e.target.value))}
          label="Mas'ul texnika"
        >
          {cars.map((car) => (
            <MenuItem key={car.id} value={car.id}>
              {car.automobileNumberAndModel}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="responsibleCarDriver">Mas'ul texnika haydovchisi</InputLabel>
        <Select
          labelId="responsibleCarDriver"
          value={responsibleCarDriver?.id}
          onChange={(e) =>
            setResponsibleCarDriver(
              cars.find((c) => c.id === responsibleCarId)?.driverIds.find((d) => d.id === Number(e.target.value)) as {
                fullName: string;
                id: number;
              }
            )
          }
          label="Mas'ul texnika haydovchisi"
        >
          {cars
            .find((c) => c.id === responsibleCarId)
            ?.driverIds.map((driver) => (
              <MenuItem key={driver.id} value={driver.id}>
                {driver.fullName}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="currentCarId" error={Boolean(responsibleCarId && currentCarId == responsibleCarId)}>
          Hozirgi texnika
        </InputLabel>
        <Select
          labelId="currentCarId"
          value={currentCarId}
          onChange={(e) => setCurrentCarId(Number(e.target.value))}
          label="Mas'ul texnika"
          error={Boolean(responsibleCarId && currentCarId == responsibleCarId)}
        >
          {cars.map((car) => (
            <MenuItem key={car.id} value={car.id}>
              {car.automobileNumberAndModel}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="currentCarDriver">Hozirgi texnika haydovchisi</InputLabel>
        <Select
          labelId="currentCarDriver"
          value={currentCarDriver?.id}
          onChange={(e) =>
            setCurrentCarDriver(
              cars.find((c) => c.id === currentCarId)?.driverIds.find((d) => d.id === Number(e.target.value)) as {
                fullName: string;
                id: number;
              }
            )
          }
          label="Hozirgi texnika haydovchisi"
        >
          {cars
            .find((c) => c.id === currentCarId)
            ?.driverIds.map((driver) => (
              <MenuItem key={driver.id} value={driver.id}>
                {driver.fullName}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <TextareaAutosize
        minRows={5}
        style={{ resize: 'none' }}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('tableHeaders.content')}
      />
      <ButtonGroup fullWidth variant="outlined">
        <Button color="error" onClick={clearStore}>
          {t('buttons.clear')}
        </Button>
        <Button endIcon={<CircularProgress size={15} />} onClick={saveDalolatnomaToDB}>
          {t('buttons.create')}
        </Button>
        <Button onClick={handlePrint}>{t('buttons.print')}</Button>
      </ButtonGroup>
    </Card>
  );
}

export default SideBarGpsCreateGpsDalolatnoma;
