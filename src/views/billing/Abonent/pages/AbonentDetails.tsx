import InfoChips from '../InfoChips';
import AbonentProfileCard from '../AbonentProfileCard';
import { useAbonentStore } from '../abonentStore';
import { useAbonentLogic } from '../useAbonentLogic';
import { Card, CircularProgress, Grid, Typography } from '@mui/material';
import { CompactKeyValue } from 'ui-component/cards/AbonentCardView';
import { t } from 'i18next';

function AbonentDetails() {
  const {
    abonentDetails,
    incomeStats,
    balancePredicts,
    hetAbonent,
    cadastrAbonent,
    abonentDetailsHetLoading,
    abonentDetailsCadastrLoading
  } = useAbonentStore();
  const { periodEndYear } = useAbonentLogic();

  const balanceToYearEnd = balancePredicts?.balancePredictItems.find((i) => i.period === periodEndYear)?.balanceAmount || null;

  return (
    <>
      {abonentDetails && (
        <>
          <InfoChips
            {...{
              balance: abonentDetails?.balance.kSaldo * -1,
              balanceToYearEnd: balanceToYearEnd !== null ? balanceToYearEnd * -1 : null,
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
                {abonentDetailsHetLoading ? (
                  <CircularProgress />
                ) : (
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
                )}
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ p: 2, boxShadow: '2', height: '100%' }}>
                <Typography variant="h6">{t('cadastrAbonent')}</Typography>
                {abonentDetailsCadastrLoading ? (
                  <CircularProgress />
                ) : (
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
                )}
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}

export default AbonentDetails;
