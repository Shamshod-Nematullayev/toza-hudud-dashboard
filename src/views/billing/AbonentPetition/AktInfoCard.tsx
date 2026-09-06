import { Card, CardContent, Typography, Box, Divider, Chip, Stack } from '@mui/material';
import { format } from 'date-fns';
import useArizaStore from './useStore';
import { actStatusOptions } from 'store/constant';
import { useTranslation } from 'react-i18next';

export default function AktInfoCard() {
  const { t } = useTranslation();
  const { ariza } = useArizaStore();

  const getActStatusChip = (statusVal?: string) => {
    if (!statusVal) return <Typography color="text.secondary">-</Typography>;
    const opt = actStatusOptions.find((status) => status.value === statusVal);
    const label = opt ? opt.label : statusVal;

    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    if (statusVal === 'CONFIRMED') color = 'success';
    else if (statusVal === 'CANCELLED' || statusVal.includes('CANCEL')) color = 'error';
    else if (statusVal === 'WARNED') color = 'warning';
    else if (statusVal === 'NEW') color = 'info';

    return <Chip label={label} color={color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
  };

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: 'none',
        height: '100%',
        overflowY: 'auto'
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1.5 }}>
          {t('recalculationDetailPage.actDetails', 'Akt ma‘lumotlari')}
        </Typography>

        <Stack spacing={1.2}>
          <InfoRow label={t('tableHeaders.accountNumber', 'Hisob raqami:')} value={ariza.licshet || '-'} isMonospace />
          <InfoRow label={t('tableHeaders.actStatus', 'Holati:')} customComponent={getActStatusChip(ariza.actStatus)} />
          <InfoRow
            label={t('recalculationDetailPage.inhabitantsAmount', 'Yashovchilar / Summa:')}
            value={`${ariza.aktInfo?.currentInhabitantCount ?? ariza.next_prescribed_cnt ?? 0} kishi | ${
              ariza.aktSummasi ? Number(ariza.aktSummasi).toLocaleString('uz-UZ') + ' so‘m' : '0 so‘m'
            }`}
          />
          {ariza.aktInfo?.description && (
            <InfoRow label={t('recalculationDetailPage.actDescription', 'Akt izohi:')} value={ariza.aktInfo.description} />
          )}
          {ariza.aktInfo?.warningConclusion && (
            <InfoRow
              label={t('recalculationDetailPage.warningReason', 'Ogohlantirish sababi:')}
              value={`${ariza.aktInfo.warningConclusion} ${
                ariza.aktInfo.warnedByFullName ? `@${ariza.aktInfo.warnedByFullName}` : ''
              }`}
            />
          )}
          {ariza.aktInfo?.cancellationConclusion && (
            <InfoRow
              label={t('recalculationDetailPage.cancelReason', 'Bekor qilish sababi:')}
              value={`${ariza.aktInfo.cancellationConclusion} ${
                ariza.aktInfo.canceledByFullName ? `@${ariza.aktInfo.canceledByFullName}` : ''
              }`}
            />
          )}
          {ariza.sana && (
            <InfoRow
              label={t('tableHeaders.createdDate', 'Ariza sanasi:')}
              value={format(new Date(ariza.sana), 'yyyy-MM-dd HH:mm')}
            />
          )}
          {ariza.akt_date && (
            <InfoRow
              label={t('tableHeaders.actCreatedDate', 'Akt sanasi:')}
              value={format(new Date(ariza.akt_date), 'yyyy-MM-dd HH:mm')}
            />
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
          {t('recalculationDetailPage.actHistory', 'Akt tarixi')}
        </Typography>

        {(!ariza.actHistory || ariza.actHistory.length === 0) && !ariza.akt_date ? (
          <Typography variant="body2" color="text.secondary">
            {t('recalculationDetailPage.noHistory', 'Tarix mavjud emas')}
          </Typography>
        ) : (
          <Stack spacing={1}>
            {ariza.actHistory?.map((details: any, i: number) => {
              return (
                details?.createdAt && (
                  <InfoRow
                    key={i}
                    label={format(new Date(details?.createdAt), 'yyyy-MM-dd HH:mm')}
                    value={`${Number(details.amount || 0).toLocaleString('uz-UZ')} so‘m`}
                  />
                )
              );
            })}
            {ariza.akt_date && (
              <InfoRow
                label={format(new Date(ariza?.akt_date), 'yyyy-MM-dd HH:mm')}
                value={`${Number(ariza.aktInfo?.amount || 0).toLocaleString('uz-UZ')} so‘m`}
              />
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

interface InfoRowProps {
  label: string;
  value?: string | number;
  customComponent?: React.ReactNode;
  isMonospace?: boolean;
}

function InfoRow({ label, value, customComponent, isMonospace }: InfoRowProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
        {label}
      </Typography>
      {customComponent ? (
        customComponent
      ) : (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontFamily: isMonospace ? 'monospace' : 'inherit',
            textAlign: 'right'
          }}
        >
          {value}
        </Typography>
      )}
    </Box>
  );
}
