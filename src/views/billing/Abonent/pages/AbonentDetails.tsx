import InfoChips from '../InfoChips';
import AbonentProfileCard from '../AbonentProfileCard';
import { useAbonentStore } from '../hooks/abonentStore';
import { useAbonentLogic } from '../hooks/useAbonentLogic';
import { Box, Card, Chip, CircularProgress, Grid, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import { CompactKeyValue } from 'ui-component/cards/AbonentCardView';
import { t } from 'i18next';
import { TimelineItem, Timeline, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import { NameHistory } from '../NameHistoryCard';
import { Add, DownloadForOffline, Link, SaveAlt } from '@mui/icons-material';
import { formatPhoneNumber } from 'views/tools/formatters';

function AbonentDetails() {
  const {
    abonentDetails,
    incomeStats,
    balancePredicts,
    hetAbonent,
    cadastrAbonent,
    abonentDetailsHetLoading,
    abonentDetailsCadastrLoading,
    detailsHistory,
    updatePhone
  } = useAbonentStore();
  const { periodEndYear } = useAbonentLogic();

  const balanceToYearEnd = balancePredicts?.balancePredictItems.find((i) => i.period === periodEndYear)?.balanceAmount || null;

  const hetPhone = hetAbonent?.phone || '';
  const displayPhone = hetPhone.length === 12 ? hetPhone.slice(3) : hetPhone;
  const isDifferent = hetPhone && displayPhone !== abonentDetails?.phone;

  const handleClickImportPhone = () => {
    updatePhone(displayPhone);
  };
  const isLoading = !abonentDetails;

  const renderSkeletonRows = (count = 5) =>
    Array.from(new Array(count)).map((_, index) => (
      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
        <Skeleton variant="text" width="30%" height={20} />
        <Skeleton variant="text" width="60%" height={20} />
      </Box>
    ));
  return (
    <>
      {/* 1. InfoChips - Konteyner saqlanadi */}
      {isLoading ? (
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" width="25%" height={80} />
          ))}
        </Box>
      ) : (
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
      )}

      {/* 2. Profile Card */}
      <AbonentProfileCard data={abonentDetails} />

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* 3. HET Abonent Card */}
        <Grid size={4}>
          <Card sx={{ p: 2, boxShadow: '2', height: '100%', minHeight: 300 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t('hetAbonent')}
            </Typography>
            {isLoading || abonentDetailsHetLoading ? (
              renderSkeletonRows(5)
            ) : (
              <CompactKeyValue
                divider
                data={[
                  { key: t('tableHeaders.fullName'), value: hetAbonent?.fullName },
                  {
                    key: t('tableHeaders.phone'),
                    value: (
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {formatPhoneNumber(displayPhone)}
                        {isDifferent && (
                          <Tooltip title={t('buttons.importPhone')}>
                            <IconButton size="small" color="info" onClick={handleClickImportPhone}>
                              <SaveAlt />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Typography>
                    )
                  },
                  { key: t('tableHeaders.cadastralNumber'), value: hetAbonent?.cadastralNumber },
                  { key: t('tableHeaders.address'), value: hetAbonent?.address },
                  { key: t('tableHeaders.pnfl'), value: hetAbonent?.pinfl }
                ]}
              />
            )}
          </Card>
        </Grid>

        {/* 4. Cadastr Card */}
        <Grid size={4}>
          <Card sx={{ p: 2, boxShadow: '2', height: '100%', minHeight: 300 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t('cadastrAbonent')}
            </Typography>
            {isLoading || abonentDetailsCadastrLoading ? (
              renderSkeletonRows(5)
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

        {/* 5. Name History */}
        <Grid size={4}>
          {isLoading ? (
            <Card sx={{ p: 2, height: '100%' }}>
              <Skeleton variant="rectangular" height="100%" />
            </Card>
          ) : (
            <NameHistory
              data={[
                ...detailsHistory,
                {
                  accountNumber: Number(abonentDetails?.accountNumber),
                  fullName: abonentDetails?.fullName || '',
                  date: new Date().toISOString()
                }
              ]}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
}

export default AbonentDetails;
