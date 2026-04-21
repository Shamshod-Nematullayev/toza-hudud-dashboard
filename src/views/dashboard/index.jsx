import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { gridSpacing } from 'store/constant';
import RadialChart from './RadialChart';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { Card } from '@mui/material';
import { useTranslation } from 'react-i18next';
import NotariusCheck from 'views/billing/NotariusCheck/NotariusCheck';

const Dashboard = () => {
  const [isLoading, setLoading] = useState(true);
  const [identity, setIdentity] = useState(null);
  const [etkIdentity, setEtkIdentity] = useState(null);
  const [identityProcent, setIdentityProcent] = useState(0);
  const [etkIdentityProcent, setEtkIdentityProcent] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    document.title = 'GreenZone - Dashboard';
    const fetchData = async () => {
      try {
        const identityData = (await api.get('/statistics/identity')).data;
        setIdentity(identityData);

        const etkIdentityData = (await api.get('/statistics/elektrConfirm')).data;
        setEtkIdentity(etkIdentityData);
      } catch (error) {
        toast.error(error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (identity && identity.allAbonentsCount) {
      setIdentityProcent(Math.floor((identity.confirmed / identity.allAbonentsCount) * 100) || 0);
    }
  }, [identity]);

  useEffect(() => {
    if (etkIdentity && etkIdentity.allAbonentsCount) {
      setEtkIdentityProcent(Math.floor((etkIdentity.confirmed / etkIdentity.allAbonentsCount) * 100) || 0);
    }
  }, [etkIdentity]);

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12} lg={6}>
        <Card sx={{ boxShadow: 2 }}>
          <Grid container>
            <Grid item xs={12} md={6}>
              <RadialChart isLoading={isLoading} progress={identityProcent} label={t('dashboard.identified')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RadialChart isLoading={isLoading} progress={etkIdentityProcent} label={t('dashboard.electacityContirmed')} />
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
