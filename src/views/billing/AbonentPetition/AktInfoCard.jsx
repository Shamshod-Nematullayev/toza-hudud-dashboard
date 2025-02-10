import { Card, CardContent, Typography, Box } from '@mui/material';
import { format } from 'date-fns';
import useArizaStore from './useStore';
import { actStatusOptions } from 'store/constant';

export default function AktInfoCard() {
  const { ariza } = useArizaStore();
  return (
    <Card sx={{ margin: 'auto', p: 2, boxShadow: 3, height: '100%', overflowY: 'scroll' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Akt Ma'lumotlari
        </Typography>

        <InfoRow label="Hisob raqami:" value={ariza.licshet} />
        <InfoRow label="Holati:" value={actStatusOptions.find((status) => status.value === ariza.actStatus)?.label} />
        <InfoRow
          label="Yashovchi soni/Summa:"
          value={`${ariza.aktInfo?.currentInhabitantCount || ariza.next_prescribed_cnt} kishi | ${ariza.aktSummasi} so'm`}
        />
        <InfoRow label="Akt izohi:" value={ariza.aktInfo?.description} />
        {ariza.aktInfo?.warningConclusion && (
          <InfoRow label="Ogohlantirish sababi:" value={`${ariza.aktInfo.warningConclusion} @${ariza.aktInfo.warnedByFullName}`} />
        )}
        {ariza.aktInfo?.cancellationConclusion && (
          <InfoRow label="Bekor qilish sababi:" value={`${ariza.aktInfo.cancellationConclusion} @${ariza.aktInfo.canceledByFullName}`} />
        )}
        {ariza.sana && <InfoRow label="Ariza sanasi:" value={format(new Date(ariza.sana), 'yyyy-MM-dd HH:mm')} />}
        {ariza.akt_date && <InfoRow label="Akt sanasi:" value={format(new Date(ariza.akt_date), 'yyyy-MM-dd HH:mm')} />}

        <Typography variant="h6" sx={{ mb: 2 }}>
          Akt tarixi:
        </Typography>
        {ariza.actHistory?.map((details, i) => {
          return <InfoRow key={i} label={format(new Date(details?.createdAt), 'yyyy-MM-dd HH:mm')} value={`${details.amount} so'm`} />;
        })}
        {ariza && <InfoRow label={format(new Date(ariza.aktInfo?.createdAt), 'yyyy-MM-dd HH:mm')} value={`${ariza.aktInfo.amount} so'm`} />}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography fontWeight={500}>{label}</Typography>
      <Typography color="text.secondary">{value}</Typography>
    </Box>
  );
}
