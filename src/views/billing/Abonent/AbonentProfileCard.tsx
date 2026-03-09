import React from 'react';
import { Card, CardContent, Grid, Typography, Avatar, Box, Chip, Divider, Stack, SvgIconProps, IconButton } from '@mui/material';
import {
  CreditCardOutlined as CardIcon,
  BadgeOutlined as PassportIcon,
  FingerprintOutlined as JshshirIcon,
  AssignmentOutlined as ContractIcon,
  MapOutlined as CadastreIcon,
  HistoryOutlined as OldAccountIcon,
  EventAvailableOutlined as DateIcon,
  ErrorOutline as WarningIcon,
  ContentCopy,
  BusinessOutlined as CompanyIcon,
  LocationOnOutlined as AddressIcon,
  PhoneAndroidOutlined as PhoneIcon,
  PhoneInTalkOutlined as HomePhoneIcon,
  FlashOnOutlined as EnergyIcon,
  NumbersOutlined as SoatoIcon,
  InfoOutlined as NoteIcon
} from '@mui/icons-material';

const AbonentProfileCard = ({ data }: any) => {
  // Qatorlarni yaratish uchun yordamchi komponent
  const InfoRow = ({
    icon: Icon,
    label,
    value,
    color = 'text.primary',
    fontSize,
    copyable
  }: {
    icon: React.ElementType<SvgIconProps>;
    label: string | number;
    value: string | number;
    color?: string;
    fontSize?: number;
    copyable?: boolean;
  }) => (
    <Grid container spacing={1} sx={{ py: 0.7, alignItems: 'center' }}>
      <Grid item xs={5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Icon sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.7 }} />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {label}:
        </Typography>
      </Grid>
      <Grid item xs={7} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: color, fontSize }}>
          {value || '—'}
        </Typography>
        {copyable && (
          <Grid item xs={12}>
            <IconButton
              onClick={() => {
                navigator.clipboard.writeText(value.toString());
              }}
              sx={{
                cursor: 'pointer',
                opacity: 0.9
              }}
            >
              <ContentCopy color="primary" />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </Grid>
  );

  return (
    <Card
      sx={{
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        border: '1px solid #eef2f6'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Chap tomon: Rasm */}
          <Grid item xs={3} md={1} alignItems={'center'} justifyContent={'center'} display={'flex'}>
            <Avatar
              variant="rounded"
              src={data?.image} // Bu yerga rasm url keladi
              sx={{
                width: '100%',
                height: 'auto',
                aspectRatio: '1/1.2',
                borderRadius: '12px',
                bgcolor: '#f0f2f5'
              }}
            />
          </Grid>

          {/* O'ng tomon: Ma'lumotlar */}
          <Grid item xs={6} md={4}>
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="h4" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  {data?.fullName || "ABDULLAYEVA GULGUNA G'AYBULLAYEVNA"}
                </Typography>
                <WarningIcon sx={{ color: '#ff4d4f', fontSize: 20 }} />
                <Chip
                  label={`ID: ${data?.id || '18860208'}`}
                  size="small"
                  sx={{
                    bgcolor: '#e6f7f0',
                    color: '#5299fa',
                    fontWeight: 'bold',
                    borderRadius: '6px'
                  }}
                />
              </Stack>
            </Box>

            <Box sx={{ mt: 1 }}>
              <InfoRow
                icon={CardIcon}
                label="Ҳисоб рақами"
                value={data?.accountNumber || '105120500123'}
                color="#52c41a"
                fontSize={20}
                copyable
              />
              <InfoRow icon={PassportIcon} label="Паспорт рақами" value={data?.passportNumber || 'AD9836144'} />
              <InfoRow icon={JshshirIcon} label="ЖШШИР" value={data?.jshshir || '41802793990114'} />
              <InfoRow icon={ContractIcon} label="Шартнома рақами" value={data?.contractNumber || '18860208'} />
              <InfoRow icon={CadastreIcon} label="Кадастр рақами" value={data?.cadastreNumber || '14:16:03:01:12:0005:0001:019'} />
              <InfoRow icon={OldAccountIcon} label="Эски ҳисоб рақами" value={data?.oldAccount} />
              <InfoRow icon={DateIcon} label="Шартнома тасдиқланган сана" value={data?.contractDate} />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Stack spacing={0.5}>
              <InfoRow icon={CompanyIcon} label="Корхона номи" value={data?.companyName || 'Marokand Obod'} />
              <InfoRow
                icon={AddressIcon}
                label="Манзил"
                value={
                  data?.address ||
                  'Самарканд вилояти Самарканд шаҳар Сайқал МФЙ (4-сектор) маҳалла РУДАКИЙ (ТИТОВА) кўча 175 Ж уй 19-хонадон'
                }
              />
              <InfoRow icon={PhoneIcon} label="Телефон рақами" value={data?.phoneNumber || '991311313'} />
              <InfoRow icon={HomePhoneIcon} label="Уй телефони" value={data?.homePhone} />
              <InfoRow icon={SoatoIcon} label="Электр энергия СОАТО" value={data?.energySoato || '18405'} />
              <InfoRow icon={EnergyIcon} label="Электр энергия рақами" value={data?.energyNumber || '8167219'} />
              <InfoRow icon={NoteIcon} label="Изоҳ" value={data?.note || 'n'} />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AbonentProfileCard;
