import { Verified } from '@mui/icons-material';
import { Avatar, Divider, Grid, List, ListItem, Stack, Typography } from '@mui/material';
import { forwardRef, ReactNode } from 'react';
import { AbonentDetails } from 'types/billing';
import { AbonentCard } from 'views/billing/Abonent/types';

export const AbonentCardView = forwardRef(
  ({ cardDetails, abonentDetails, t }: { cardDetails: AbonentCard; abonentDetails?: AbonentDetails | null; t: any }, ref: any) => {
    return (
      <div className="page" ref={ref}>
        <Typography variant="h2" sx={{ color: 'success.main', textAlign: 'right' }}>
          {cardDetails.companyName}
        </Typography>
        <Divider sx={{ borderColor: 'success.main' }} />
        <Grid container alignItems={'center'}>
          <Grid item xs={10}>
            <CompactKeyValue
              data={[
                {
                  key: t('tableHeaders.accountNumber'),
                  value: (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 16, fontWeight: 700, border: '1px solid #000', p: '2px 4px ', mr: 1 }}>
                        {cardDetails.accountNumber}
                      </Typography>
                      <Verified />
                    </div>
                  )
                },
                {
                  key: t('tableHeaders.fullName'),
                  value: cardDetails.fullName
                },
                {
                  key: t('tableHeaders.address'),
                  value: [cardDetails.districtName, cardDetails.mahallaName, cardDetails.streetName, cardDetails.flatNumber]
                    .filter(Boolean)
                    .join(', ')
                },
                {
                  key: t('tableHeaders.contractDate'),
                  value: cardDetails.contractDate
                },
                {
                  key: t('tableHeaders.kSaldo'),
                  value: `${(cardDetails.currentKSaldo * -1).toLocaleString()} ${t('uzs')} (${cardDetails.currentKSaldo > 0 ? 'Qarzdor' : 'Haqdor'})`
                },
                {
                  key: t('tableHeaders.period'),
                  value: cardDetails.currentPeriod
                },
                {
                  key: t('tableHeaders.inhabitantCount'),
                  value: cardDetails.inhabitantCnt
                },
                {
                  key: t('tableHeaders.phone'),
                  value: cardDetails.phone
                }
              ]}
            />
          </Grid>
          <Grid item xs={1.5}>
            <Avatar
              variant="rounded"
              src={`data:image/png;base64,${abonentDetails?.citizen.photo}`}
              sx={{
                width: '90%',
                height: 'auto',
                aspectRatio: '1/1.2',
                borderRadius: '12px',
                bgcolor: '#f0f2f5'
              }}
            />
          </Grid>
        </Grid>

        {/* Jadval qismi */}
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>{t('tableHeaders.period')}</th>
              <th>{t('tableHeaders.nSaldo')}</th>
              <th>{t('tableHeaders.nachis')}</th>
              <th>{t('tableHeaders.cashAmount')}</th>
              <th>{t('tableHeaders.q1031Amount')}</th>
              <th>{t('tableHeaders.eMoneyAmount')}</th>
              <th>{t('tableHeaders.munisAmount')}</th>
              <th>{t('tableHeaders.act')}</th>
              <th>{t('tableHeaders.kSaldo')}</th>
              <th>{t('tableHeaders.inhabitantCount')}</th>
            </tr>
          </thead>
          <tbody>
            {cardDetails.balanceDtoList.map((item, i) => (
              <tr key={i} style={{ textAlign: 'center' }}>
                <td style={{ padding: '0px 5px' }}>{item.period}</td>
                <td style={{ padding: '0px 5px' }}>{item.nSaldo.toLocaleString()}</td>
                <td style={{ padding: '0px 5px' }}>{item.accrual.toLocaleString()}</td>
                <td style={{ padding: '0px 5px' }}>{item.cashAmount.toLocaleString()}</td>
                <td style={{ padding: '0px 5px' }}>{item.q1031Amount.toLocaleString()}</td>
                <td style={{ padding: '0px 5px' }}>{item.eMoneyAmount.toLocaleString()}</td>
                <td style={{ padding: '0px 5px' }}>{item.munisAmount.toLocaleString()}</td>
                <td style={{ padding: '0px 5px' }}>{item.actAmount.toLocaleString()}</td>
                <td style={{ padding: '0px 5px' }}>{item.kSaldo.toLocaleString()}</td>
                <td style={{ padding: '0px 5px' }}>{item.inhabitantCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pastki qism (Company details + QR) */}
        <Stack direction={'row'} spacing={2} sx={{ mt: 2 }}>
          <CompactKeyValue
            data={[
              {
                key: t('tableHeaders.company'),
                value: cardDetails.companyName
              },
              {
                key: t('tableHeaders.director'),
                value: cardDetails.companyDirector
              },
              {
                key: t('tableHeaders.phone'),
                value: cardDetails.companyPhone
              },
              {
                key: t('tableHeaders.email'),
                value: cardDetails.companyEmail
              },
              {
                key: t('tableHeaders.bankName'),
                value: cardDetails.companyBankName
              },
              {
                key: t('tableHeaders.STIR'),
                value: cardDetails.companyInn
              },
              {
                key: t('tableHeaders.bankCredentials'),
                value: [cardDetails.companyBankMFO, cardDetails.companyBankAccount].join(', ')
              }
            ]}
          />
          <img src={'data:image/png;base64,' + cardDetails.qrCodeImage} alt="qrCode" />
        </Stack>
      </div>
    );
  }
);

export const CompactKeyValue = ({ data, divider }: { data: { key: string; value: string | number | ReactNode }[]; divider?: boolean }) => {
  return (
    <List>
      {data.map((item, i) => (
        <>
          <ListItem sx={{ py: 0 }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ display: 'inline-block', minWidth: '150px', fontSize: 14 }}>
              {item.key}:
            </Typography>
            <span>
              {typeof item.value === 'string' || typeof item.value === 'number' ? (
                <Typography variant="body2" fontWeight={500} style={{ textOverflow: 'ellipsis' }}>
                  {item.value}
                </Typography>
              ) : (
                item.value
              )}
            </span>
          </ListItem>
          {divider && <Divider />}
        </>
      ))}
    </List>
  );
};
