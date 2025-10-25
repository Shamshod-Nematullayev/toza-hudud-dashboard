import { Grid } from '@mui/material';
import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import PrintSection from './PrintSection';
import SideBarGpsCreateGpsDalolatnoma from './SideBarGpsCreateGpsDalolatnoma';
import { useGpsDalolatnomaStore } from './useStore';
import { Company } from 'views/billing/Blanks';

function CreateGpsDalolatnoma() {
  const { date, cars, responsibleCarId, currentCarId, currentCarDriver, responsibleCarDriver, description, document } =
    useGpsDalolatnomaStore();
  const company = JSON.parse(localStorage.getItem('company') as string) as Company;
  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={9}>
          <PrintSection
            company={company}
            date={date}
            responsibleCar={cars.find((c) => c.id === responsibleCarId)}
            responsibleCarDriverName={responsibleCarDriver?.fullName}
            currentCar={cars.find((c) => c.id === currentCarId)}
            currentCarDriverName={currentCarDriver?.fullName}
          />
        </Grid>
        <Grid item xs={3}>
          <SideBarGpsCreateGpsDalolatnoma />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default CreateGpsDalolatnoma;
