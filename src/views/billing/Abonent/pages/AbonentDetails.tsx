import InfoChips from '../InfoChips';
import AbonentProfileCard from '../AbonentProfileCard';
import { useAbonentStore } from '../abonentStore';
import { useAbonentLogic } from '../useAbonentLogic';
import { Card, Grid, Typography } from '@mui/material';
import { CompactKeyValue } from '../modals/PrintAbonentCard';
import { t } from 'i18next';
import { useEffect } from 'react';

function AbonentDetails() {
  const {
    abonentDetails,
    incomeStats,
    balancePredicts,
    hetAbonent,
    getHetAbonent,
    setHetAbonent,
    fetchCadastrAbonent,
    cadastrAbonent,
    fetchBlockReport
  } = useAbonentStore();
  const { residentId } = useAbonentLogic();
  const { periodEndYear } = useAbonentLogic();
  useEffect(() => {
    if (abonentDetails && abonentDetails.electricityCoato && abonentDetails.electricityAccountNumber) {
      try {
        getHetAbonent({ coato: abonentDetails.electricityCoato, personalAccount: abonentDetails.electricityAccountNumber }).then((res) => {
          if ('personalAccount' in res) setHetAbonent(res);
          else setHetAbonent(undefined);
        });
      } catch (error) {}
    }
    try {
      if (abonentDetails?.id && abonentDetails.house.cadastralNumber) {
        fetchCadastrAbonent(abonentDetails.house.cadastralNumber);
      }
    } catch (error) {}
    try {
      fetchBlockReport(residentId);
    } catch (error) {}
  }, [residentId, abonentDetails?.id]);

  return (
    <>
      {abonentDetails && (
        <>
          <InfoChips
            {...{
              balance: abonentDetails?.balance.kSaldo * -1,
              balanceToYearEnd: (balancePredicts?.balancePredictItems.find((i) => i.period === periodEndYear)?.balanceAmount || 0) * -1,
              calculated: abonentDetails?.balance.accrual,
              inhabitantCount: abonentDetails?.house.inhabitantCnt,
              registeredInhabitants: abonentDetails.house.miaInhabitantCnt || 0,
              payments: incomeStats.find((i) => i.period === abonentDetails?.balance.period)?.income || 0,
              period: abonentDetails?.balance.period,
              tariff: Number(abonentDetails?.balance.rate)
            }}
          />
          <AbonentProfileCard data={{ photo: '', ...abonentDetails }} />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <Card sx={{ p: 2, boxShadow: '2' }}>
                <Typography variant="h6">{t('hetAbonent')}</Typography>
                <CompactKeyValue
                  divider
                  data={[
                    { key: t('tableHeaders.fullName'), value: hetAbonent?.fullName },
                    { key: t('tableHeaders.phone'), value: hetAbonent?.phone },
                    { key: t('tableHeaders.cadastralNumber'), value: hetAbonent?.cadastralNumber },
                    { key: t('tableHeaders.address'), value: hetAbonent?.address },
                    { key: t('tableHeaders.pnfl'), value: hetAbonent?.pinfl }
                  ]}
                />
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ p: 2, boxShadow: '2', height: '100%' }}>
                <Typography variant="h6">{t('cadastrAbonent')}</Typography>
                <CompactKeyValue
                  divider
                  data={[
                    { key: t('tableHeaders.fullName'), value: cadastrAbonent?.owners[0]?.name },
                    { key: t('tableHeaders.inn'), value: cadastrAbonent?.owners[0]?.inn },
                    { key: t('tableHeaders.cadastralNumber'), value: cadastrAbonent?.cadastralNumber },
                    { key: t('tableHeaders.address'), value: cadastrAbonent?.fullAddress },
                    { key: t('tableHeaders.pnfl'), value: cadastrAbonent?.owners[0]?.pinfl }
                  ]}
                />
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}

export default AbonentDetails;
