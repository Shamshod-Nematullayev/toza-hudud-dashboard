import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Box,
  Chip,
  Divider,
  Stack,
  SvgIconProps,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
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
  InfoOutlined as NoteIcon,
  Verified as VerifiedIcon,
  TravelExplore as MvdIcon
} from '@mui/icons-material';
import { AbonentDetails } from 'types/billing';
import { useAbonentStore } from './abonentStore';
import useLoaderStore from 'store/loaderStore';
import dayjs from 'dayjs';
import { t } from 'i18next';

interface Data extends AbonentDetails {
  photo?: string;
}

const AbonentProfileCard = ({ data }: { data: Data }) => {
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

  const {
    verifyIdentity,
    getCitizensDetails,
    setResidentPhoto,
    abonentDetails,
    setOpenPhotoModal,
    blockReport,
    fetchAbonentMvdAddress,
    ui
  } = useAbonentStore();
  const { setIsLoading } = useLoaderStore();

  const handleClickAvatar = async () => {
    try {
      console.log(abonentDetails?.citizen.photo);
      if (abonentDetails?.citizen.photo) return setOpenPhotoModal(true);
      setIsLoading(true);
      const citizenData = await getCitizensDetails({
        birthDate: data.citizen.birthDate,
        pnfl: data.citizen.pnfl,
        passport: data.citizen.passport,
        photoStatus: 'WITH_PHOTO'
      });
      if (typeof citizenData.photo === 'string') setResidentPhoto(citizenData.photo);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      sx={{
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        border: '1px solid #eef2f6',
        mt: 2
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={3} md={1.5} alignItems={'center'} justifyContent={'center'} display={'flex'} direction={'column'}>
            <Avatar
              variant="rounded"
              src={'data:image/png;base64,' + abonentDetails?.citizen.photo} // Bu yerga rasm url keladi
              sx={{
                width: '100%',
                height: 'auto',
                aspectRatio: '1/1.2',
                borderRadius: '12px',
                bgcolor: '#f0f2f5',
                cursor: 'pointer'
              }}
              onClick={handleClickAvatar}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {data?.citizen.birthDate || ''}{' '}
            </Typography>
          </Grid>
          {/* Chap tomon */}

          <Grid item xs={6} md={4}>
            <Box sx={{ mb: 2 }}>
              {blockReport?.blockStatus === 'BLOCK' && (
                <Alert color="error">
                  {t('abonentCardPage.blockedByHet')}: {dayjs(blockReport?.blockDate).format('DD.MM.YYYY')}{' '}
                  {blockReport?.blockDebt.toLocaleString()} {t('uzs')}
                </Alert>
              )}
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="h4" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  {data?.fullName || ''}
                </Typography>
                <IconButton onClick={() => verifyIdentity(data.id, !data.identified)}>
                  {data.identified ? (
                    <VerifiedIcon sx={{ color: 'success.main', fontSize: 20 }} />
                  ) : (
                    <WarningIcon sx={{ color: 'error.main', fontSize: 20 }} />
                  )}
                </IconButton>
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
              <InfoRow icon={PassportIcon} label="Паспорт рақами" value={data?.citizen.passport} />
              <Grid container spacing={1} sx={{ py: 0.7, alignItems: 'center' }}>
                <Grid item xs={5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <JshshirIcon sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.7 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    ЖШШИР:
                  </Typography>
                </Grid>
                <Grid item xs={7} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {data?.citizen.pnfl || '—'}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => fetchAbonentMvdAddress(abonentDetails?.citizen.pnfl || '')}
                    disabled={ui.mvdAddressLoading || !abonentDetails?.citizen.pnfl || abonentDetails.citizen.pnfl.length === 14}
                    sx={{ ml: 0.5, p: 0.5 }}
                  >
                    {ui.mvdAddressLoading ? (
                      <CircularProgress size={18} thickness={5} />
                    ) : (
                      <MvdIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                    )}
                  </IconButton>
                </Grid>
              </Grid>
              <InfoRow icon={ContractIcon} label="Шартнома рақами" value={data?.contractNumber || ''} />
              <InfoRow icon={CadastreIcon} label="Кадастр рақами" value={data?.house.cadastralNumber} />
              <InfoRow icon={DateIcon} label="Шартнома тасдиқланган сана" value={data?.contractDate} />
            </Box>
          </Grid>
          {/* O'ng tomon: Ma'lumotlar */}
          <Grid item xs={6}>
            <Stack spacing={0.5}>
              <InfoRow icon={CompanyIcon} label="Корхона номи" value={data?.companyName || 'DEMO'} />
              <InfoRow
                icon={AddressIcon}
                label="Манзил"
                value={
                  `${data?.mahallaName} ${data.streetName} ${data?.house.homeNumber} uy ${data?.house.homeIndex}-хонадон` ||
                  'Самарканд вилояти Самарканд шаҳар Сайқал МФЙ (4-сектор) маҳалла РУДАКИЙ (ТИТОВА) кўча 175 Ж уй 19-хонадон'
                }
              />
              <InfoRow icon={PhoneIcon} label="Телефон рақами" value={data?.phone || ''} />
              <InfoRow icon={HomePhoneIcon} label="Уй телефони" value={data?.homePhone || ''} />
              <InfoRow icon={SoatoIcon} label="Электр энергия СОАТО" value={data?.electricityCoato || ''} />
              <InfoRow icon={EnergyIcon} label="Электр энергия рақами" value={data?.electricityAccountNumber || ''} />
              <InfoRow icon={NoteIcon} label="Изоҳ" value={data?.description || ''} />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AbonentProfileCard;
