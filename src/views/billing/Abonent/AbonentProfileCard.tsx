import React, { ReactNode, useEffect, useRef, useState } from 'react';
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
  CircularProgress,
  Tooltip,
  Skeleton,
  Menu,
  Button,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  CreditCardOutlined as CardIcon,
  BadgeOutlined as PassportIcon,
  FingerprintOutlined as JshshirIcon,
  AssignmentOutlined as ContractIcon,
  MapOutlined as CadastreIcon,
  HistoryOutlined as OldAccountIcon,
  EventAvailableOutlined as DateIcon,
  ErrorOutlineOutlined as WarningIcon,
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
import { useAbonentStore } from './hooks/abonentStore';
import useLoaderStore from 'store/loaderStore';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { formatPhoneNumber } from 'views/tools/formatters';
import { Link } from 'react-router-dom';
import { STATUS_CFG, PHONE_CFG, HET_ACCOUNT_CFG } from '../Debitors/types';
import { ElectricityBalanceBadge } from './ElectricityBalanceBadge';

interface Data extends AbonentDetails {
  photo?: string;
}

interface InfoRowProps {
  icon: any;
  label: string | number;
  value?: string | number | ReactNode;
  color?: string;
  labelColor?: string;
  fontSize?: number;
  copyable?: boolean;
  isSkeleton?: boolean;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
  color = 'text.primary',
  fontSize,
  copyable,
  labelColor,
  isSkeleton
}: InfoRowProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';

  return (
    <Grid container spacing={1} sx={{ py: 0.7, alignItems: 'center' }}>
      <Grid size={5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {typeof Icon === 'string' ? (
          <span style={{ fontSize: '18px', opacity: 0.9, lineHeight: 1 }}>{Icon}</span>
        ) : (
          <Icon sx={{ fontSize: 18, color: labelColor || 'text.secondary', opacity: 0.7 }} />
        )}
        <Typography variant="body2" sx={{ color: isMobile && isDark ? '#9AA3C7' : labelColor || 'text.secondary' }}>
          {label}:
        </Typography>
      </Grid>
      <Grid size={7} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isSkeleton ? (
          <Skeleton variant="text" width="80%" height={20} />
        ) : (
          <>
            {React.isValidElement(value) ? (
              value
            ) : (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: isMobile && isDark ? (color === 'text.primary' ? '#EDEFFA' : color) : color,
                  fontSize
                }}
              >
                {value || '—'}
              </Typography>
            )}
            {copyable && value && typeof value === 'string' && (
              <IconButton size="small" onClick={() => navigator.clipboard.writeText(value.toString())} sx={{ opacity: 0.8 }}>
                <ContentCopy fontSize="small" color="primary" />
              </IconButton>
            )}
          </>
        )}
      </Grid>
    </Grid>
  );
};

const AbonentProfileCard = ({ data }: { data: Data | null }) => {
  const isLoading = !data;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';

  const {
    verifyIdentity,
    getCitizensDetails,
    setResidentPhoto,
    abonentDetails,
    setOpenPhotoModal,
    blockReport,
    fetchAbonentMvdAddress,
    ui,
    similarAbonentsByElectricity,
    similarAbonentsByCadastr,
    similarAbonentsByPinfl,
    getResidentCadastrs,
    abonentDebitorStatus
  } = useAbonentStore();
  const { setIsLoading } = useLoaderStore();

  const isDublicateElectricity = similarAbonentsByElectricity.length > 1;
  const duplicateCadastrList = similarAbonentsByCadastr.filter((a) => a.id !== data?.id);
  const isDublicateCadastr = duplicateCadastrList.length > 0;
  const duplicatePinflList = similarAbonentsByPinfl.filter((a) => a.id !== data?.id);
  const isDublicatePinfl = duplicatePinflList.length > 0;

  const [electricityAnchorEl, setElectricityAnchorEl] = useState<null | HTMLElement>(null);
  const handleOpenElectricity = (event: React.MouseEvent<HTMLButtonElement>) => {
    setElectricityAnchorEl(event.currentTarget);
  };
  const handleCloseElectricity = () => {
    setElectricityAnchorEl(null);
  };

  const [cadastrAnchorEl, setCadastrAnchorEl] = useState<null | HTMLElement>(null);
  const handleOpenCadastr = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCadastrAnchorEl(event.currentTarget);
  };
  const handleCloseCadastr = () => {
    setCadastrAnchorEl(null);
  };

  const [pinflAnchorEl, setPinflAnchorEl] = useState<null | HTMLElement>(null);
  const handleOpenPinfl = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPinflAnchorEl(event.currentTarget);
  };
  const handleClosePinfl = () => {
    setPinflAnchorEl(null);
  };

  const handleClickAvatar = async () => {
    if (isLoading || !data) return;
    try {
      if (abonentDetails?.citizen.photo) return setOpenPhotoModal(true);
      setIsLoading(true);
      const citizenData = await getCitizensDetails({
        birthDate: dayjs(data.citizen.birthDate).format('YYYY-MM-DD'),
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
    <>
      {isMobile ? (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {/* Card 1: Abonent Profile */}
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: isDark ? '#29346B' : 'divider',
              bgcolor: isDark ? '#16204A' : 'background.paper',
              color: isDark ? '#EDEFFA' : 'text.primary'
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', mb: 2 }}>
                {isLoading ? (
                  <Skeleton variant="rounded" sx={{ width: 64, height: 76, borderRadius: '12px' }} />
                ) : (
                  <Avatar
                    variant="rounded"
                    src={abonentDetails?.citizen.photo ? 'data:image/png;base64,' + abonentDetails.citizen.photo : undefined}
                    sx={{
                      width: 64,
                      height: 76,
                      borderRadius: '12px',
                      bgcolor: 'action.hover',
                      cursor: 'pointer'
                    }}
                    onClick={handleClickAvatar}
                  />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      flexWrap: 'wrap',
                      color: 'inherit'
                    }}
                  >
                    {data?.fullName || ''}
                    {!isLoading && (
                      <IconButton size="small" onClick={() => verifyIdentity(data!.id, !data!.identified)} sx={{ p: 0 }}>
                        {data?.identified ? (
                          <VerifiedIcon sx={{ color: '#4C8DFF', fontSize: 18 }} />
                        ) : (
                          <WarningIcon sx={{ color: 'error.main', fontSize: 18 }} />
                        )}
                      </IconButton>
                    )}
                  </Typography>
                  <Chip
                    label={`ID: ${data?.id || ''}`}
                    size="small"
                    sx={{ bgcolor: 'primary.lighter', color: 'primary.main', fontWeight: 'bold', borderRadius: '6px', mt: 1 }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                    Tug'ilgan sana: {isLoading ? <Skeleton width={60} /> : dayjs(data?.citizen.birthDate).format('DD.MM.YYYY') || ''}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ mb: 1.5 }} />

              <Stack spacing={0.5}>
                <InfoRow
                  icon="💳"
                  label="Ҳисоб raqami"
                  value={data?.accountNumber}
                  color="success.main"
                  fontSize={16}
                  copyable
                  isSkeleton={isLoading}
                />
                <InfoRow icon="🪪" label="Паспорт raqami" value={data?.citizen.passport} isSkeleton={isLoading} />
                <InfoRow
                  icon="🔑"
                  label="ЖШШИР"
                  labelColor={isDublicatePinfl ? 'error.main' : undefined}
                  value={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', flexWrap: 'wrap' }}>
                      <Typography color={isDublicatePinfl ? 'error.main' : 'inherit'}>
                        {data?.citizen.pnfl || '—'}
                      </Typography>
                      {isDublicatePinfl && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={handleOpenPinfl}
                          startIcon={<WarningIcon />}
                          sx={{ textTransform: 'none', py: 0, px: 1, fontSize: '0.75rem' }}
                        >
                          {duplicatePinflList.length} dublikat
                        </Button>
                      )}
                    </Box>
                  }
                  isSkeleton={isLoading}
                  copyable
                />
                <InfoRow icon="📄" label="Шартнома raqami" value={data?.contractNumber} isSkeleton={isLoading} />
                <InfoRow
                  icon="🏠"
                  label="Кадастр raqami"
                  labelColor={isDublicateCadastr ? 'error.main' : undefined}
                  value={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', flexWrap: 'wrap' }}>
                      <Typography color={isDublicateCadastr ? 'error.main' : 'inherit'}>
                        {data?.house.cadastralNumber || '—'}
                      </Typography>
                      {isDublicateCadastr && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={handleOpenCadastr}
                          startIcon={<WarningIcon />}
                          sx={{ textTransform: 'none', py: 0, px: 1, fontSize: '0.75rem' }}
                        >
                          {duplicateCadastrList.length} dublikat
                        </Button>
                      )}
                    </Box>
                  }
                  isSkeleton={isLoading}
                  copyable
                />
                <InfoRow icon="📅" label="Шартнома sanasi" value={data?.contractDate} isSkeleton={isLoading} />
              </Stack>
            </CardContent>
          </Card>

          {/* Card 2: Korxona ma'lumotlari */}
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: isDark ? '#29346B' : 'divider',
              bgcolor: isDark ? '#16204A' : 'background.paper',
              color: isDark ? '#EDEFFA' : 'text.primary'
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                Korxona ma'lumotlari
              </Typography>
              <Stack spacing={0.5}>
                <InfoRow icon="🏢" label="Корхона номи" value={data?.companyName} isSkeleton={isLoading} />
                <InfoRow
                  icon="📍"
                  label="Манzil"
                  value={data ? `${data.mahallaName} ${data.streetName} ${data.house.homeNumber} uy` : undefined}
                  isSkeleton={isLoading}
                />
                <InfoRow
                  icon="📱"
                  label="Телефон raqami"
                  value={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: isMobile && isDark ? (data?.phone ? '#EDEFFA' : '#FF4D4F') : data?.phone ? 'text.primary' : 'error.main'
                        }}
                      >
                        {data ? formatPhoneNumber(data.phone || '') : '—'}
                      </Typography>
                      {abonentDebitorStatus?.phoneStatus && PHONE_CFG[abonentDebitorStatus.phoneStatus] && (
                        <Chip
                          label={PHONE_CFG[abonentDebitorStatus.phoneStatus].label}
                          color={(PHONE_CFG[abonentDebitorStatus.phoneStatus].color as any) || 'default'}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  }
                  labelColor={data && !data.phone ? 'error.main' : undefined}
                  isSkeleton={isLoading}
                />
                <InfoRow icon="☎️" label="Уй telefoni" value={formatPhoneNumber(data?.homePhone || '')} isSkeleton={isLoading} />
                <InfoRow icon="⚡" label="Электр СОАТО" value={data?.electricityCoato} isSkeleton={isLoading} />
                <InfoRow
                  icon="🔌"
                  label="Электр raqami"
                  labelColor={isDublicateElectricity ? 'error.main' : undefined}
                  value={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', flexWrap: 'wrap' }}>
                      <Typography color={isDublicateElectricity ? 'error.main' : 'inherit'}>
                        {data?.electricityAccountNumber || '—'}
                      </Typography>
                      {data?.electricityAccountNumber && (
                        <ElectricityBalanceBadge
                          accountNumber={data.electricityAccountNumber}
                          coato={data.electricityCoato}
                        />
                      )}
                      {abonentDebitorStatus?.hetAccountStatus && HET_ACCOUNT_CFG[abonentDebitorStatus.hetAccountStatus] && (
                        <Chip
                          label={HET_ACCOUNT_CFG[abonentDebitorStatus.hetAccountStatus].label}
                          color={(HET_ACCOUNT_CFG[abonentDebitorStatus.hetAccountStatus].color as any) || 'default'}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}

                      {isDublicateElectricity && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={handleOpenElectricity}
                          startIcon={<WarningIcon />}
                          sx={{ textTransform: 'none', py: 0, px: 1, fontSize: '0.75rem' }}
                        >
                          {similarAbonentsByElectricity.length - 1} dublikat
                        </Button>
                      )}
                    </Box>
                  }
                  isSkeleton={isLoading}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Card 3: Izoh */}
          {data?.description && (
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: isDark ? '#29346B' : 'divider',
                bgcolor: isDark ? '#16204A' : 'background.paper',
                color: isDark ? '#EDEFFA' : 'text.primary'
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Izoh
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {data.description}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      ) : (
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
              {/* Avatar qismi */}
              <Grid
                size={{ xs: 3, md: 1.5 }}
                sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}
              >
                {isLoading ? (
                  <Skeleton variant="rounded" sx={{ width: '100%', aspectRatio: '1/1.2', borderRadius: '12px', mb: 1 }} />
                ) : (
                  <Avatar
                    variant="rounded"
                    src={abonentDetails?.citizen.photo ? 'data:image/png;base64,' + abonentDetails.citizen.photo : undefined}
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
                )}
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {isLoading ? <Skeleton width={60} /> : dayjs(data?.citizen.birthDate).format('DD.MM.YYYY') || ''}
                </Typography>
              </Grid>

              {/* Markaziy qism: F.I.O va asosiy ID ma'lumotlar */}
              <Grid
                size={{
                  xs: 6,
                  md: 4.5
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {!isLoading && ['BLOCK', 'ALREADY_BLOCK'].includes(blockReport?.blockStatus || '') && (
                    <Alert color="error" sx={{ mb: 1 }}>
                      {t('abonentCardPage.blockedByHet')}: {dayjs(blockReport?.blockDate).format('DD.MM.YYYY')}{' '}
                      {blockReport?.blockDebt.toLocaleString()} {t('uzs')}
                    </Alert>
                  )}

                  <Stack sx={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }} spacing={1}>
                    {isLoading ? (
                      <Skeleton variant="text" width="70%" height={40} />
                    ) : (
                      <>
                        <Typography variant="h4" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                          {data?.fullName || ''}
                        </Typography>
                        <IconButton onClick={() => verifyIdentity(data!.id, !data!.identified)}>
                          {data?.identified ? (
                            <VerifiedIcon sx={{ color: 'success.main', fontSize: 20 }} />
                          ) : (
                            <WarningIcon sx={{ color: 'error.main', fontSize: 20 }} />
                          )}
                        </IconButton>
                        <Chip
                          label={`ID: ${data?.id || ''}`}
                          size="small"
                          sx={{ bgcolor: '#e6f7f0', color: '#5299fa', fontWeight: 'bold', borderRadius: '6px' }}
                        />
                      </>
                    )}
                  </Stack>
                </Box>

                <Box>
                  <InfoRow
                    icon={CardIcon}
                    label="Ҳисоб рақами"
                    value={data?.accountNumber}
                    color="#52c41a"
                    fontSize={20}
                    copyable
                    isSkeleton={isLoading}
                  />
                  <InfoRow icon={PassportIcon} label="Паспорт рақами" value={data?.citizen.passport} isSkeleton={isLoading} />

                  <Grid container spacing={1} sx={{ py: 0.7, alignItems: 'center' }}>
                    <Grid size={{ xs: 5 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <JshshirIcon sx={{ fontSize: 18, color: isDublicatePinfl ? 'error.main' : 'text.secondary', opacity: 0.7 }} />
                      <Typography variant="body2" sx={{ color: isDublicatePinfl ? 'error.main' : 'text.secondary' }}>
                        ЖШШИР:
                      </Typography>
                    </Grid>
                    <Grid size={7} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      {isLoading ? (
                        <Skeleton variant="text" width="80%" height={20} />
                      ) : (
                        <>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: isDublicatePinfl ? 'error.main' : 'inherit' }}>
                            {data?.citizen.pnfl || '—'}
                          </Typography>
                          <Tooltip title={t("Yashash manzili ma'lumotlari")} placement="top">
                            <IconButton
                              size="small"
                              onClick={() => fetchAbonentMvdAddress(data?.citizen.pnfl || '')}
                              disabled={ui.mvdAddressLoading || !data?.citizen.pnfl || data.citizen.pnfl.length !== 14}
                            >
                              {ui.mvdAddressLoading ? (
                                <CircularProgress size={16} />
                              ) : (
                                <MvdIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                              )}
                            </IconButton>
                          </Tooltip>
                          {isDublicatePinfl && (
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={handleOpenPinfl}
                              startIcon={<WarningIcon />}
                              sx={{ textTransform: 'none', py: 0, px: 1, fontSize: '0.75rem' }}
                            >
                              {duplicatePinflList.length} dublikat
                            </Button>
                          )}
                        </>
                      )}
                    </Grid>
                  </Grid>

                  <InfoRow icon={ContractIcon} label="Шартнома рақами" value={data?.contractNumber || ''} isSkeleton={isLoading} />
                  <InfoRow
                    icon={CadastreIcon}
                    label="Кадастр рақами"
                    labelColor={isDublicateCadastr ? 'error.main' : undefined}
                    value={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: isDublicateCadastr ? 'error.main' : 'inherit' }}>
                          {data?.house.cadastralNumber || '—'}
                          <Tooltip title={t('Nomidagi uylar')} placement="top">
                            <IconButton
                              size="small"
                              onClick={() => getResidentCadastrs(data?.citizen.pnfl || '')}
                              disabled={ui.residentCadastrsLoading || !data?.citizen.pnfl || data.citizen.pnfl.length !== 14}
                            >
                              {ui.residentCadastrsLoading ? <CircularProgress size={16} /> : '🏠'}
                            </IconButton>
                          </Tooltip>
                        </Typography>
                        {isDublicateCadastr && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={handleOpenCadastr}
                            startIcon={<WarningIcon />}
                            sx={{ textTransform: 'none', py: 0, px: 1, fontSize: '0.75rem' }}
                          >
                            {duplicateCadastrList.length} dublikat
                          </Button>
                        )}
                      </Box>
                    }
                    isSkeleton={isLoading}
                  />
                  <InfoRow icon={DateIcon} label="Шартнома санаси" value={data?.contractDate} isSkeleton={isLoading} />
                </Box>
              </Grid>

              {/* O'ng tomon: Qo'shimcha ma'lumotlar */}
              <Grid size={6}>
                <Stack spacing={0.5}>
                  <InfoRow icon={CompanyIcon} label="Корхона номи" value={data?.companyName} isSkeleton={isLoading} />
                  <InfoRow
                    icon={AddressIcon}
                    label="Манзил"
                    value={data ? `${data.mahallaName} ${data.streetName} ${data.house.homeNumber} uy` : undefined}
                    isSkeleton={isLoading}
                  />
                  <InfoRow
                    icon={PhoneIcon}
                    label="Телефон рақами"
                    value={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: data?.phone ? 'text.primary' : 'error.main' }}>
                          {data ? formatPhoneNumber(data.phone || '') : '—'}
                        </Typography>
                        {abonentDebitorStatus?.phoneStatus && PHONE_CFG[abonentDebitorStatus.phoneStatus] && (
                          <Chip
                            label={PHONE_CFG[abonentDebitorStatus.phoneStatus].label}
                            color={(PHONE_CFG[abonentDebitorStatus.phoneStatus].color as any) || 'default'}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    labelColor={data && !data.phone ? 'error.main' : undefined}
                    isSkeleton={isLoading}
                  />
                  <InfoRow
                    icon={HomePhoneIcon}
                    label="Уй телефони"
                    value={formatPhoneNumber(data?.homePhone || '')}
                    isSkeleton={isLoading}
                  />
                  <InfoRow icon={SoatoIcon} label="Электр СОАТО" value={data?.electricityCoato} isSkeleton={isLoading} />
                  <InfoRow
                    icon={EnergyIcon}
                    label="Электр рақами"
                    labelColor={isDublicateElectricity ? 'error.main' : undefined}
                    value={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', flexWrap: 'wrap' }}>
                        <Typography color={isDublicateElectricity ? 'error.main' : 'inherit'}>
                          {data?.electricityAccountNumber || '—'}
                        </Typography>
                        {data?.electricityAccountNumber && (
                          <ElectricityBalanceBadge
                            accountNumber={data.electricityAccountNumber}
                            coato={data.electricityCoato}
                          />
                        )}
                        {abonentDebitorStatus?.hetAccountStatus && HET_ACCOUNT_CFG[abonentDebitorStatus.hetAccountStatus] && (
                          <Chip
                            label={HET_ACCOUNT_CFG[abonentDebitorStatus.hetAccountStatus].label}
                            color={(HET_ACCOUNT_CFG[abonentDebitorStatus.hetAccountStatus].color as any) || 'default'}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}

                        {isDublicateElectricity && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={handleOpenElectricity}
                            startIcon={<WarningIcon />}
                            sx={{ textTransform: 'none', py: 0, px: 1, fontSize: '0.75rem' }}
                          >
                            {similarAbonentsByElectricity.length - 1} dublikat
                          </Button>
                        )}
                      </Box>
                    }
                    isSkeleton={isLoading}
                  />
                  <InfoRow icon={NoteIcon} label="Изоҳ" value={data?.description || ''} isSkeleton={isLoading} />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Dublikat abonentlar menyusi: Kadastr */}
      <Menu
        anchorEl={cadastrAnchorEl}
        open={Boolean(cadastrAnchorEl)}
        onClose={handleCloseCadastr}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 300,
              minWidth: 220,
              mt: 0.5,
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.15)'
            }
          }
        }}
      >
        <MenuItem disabled sx={{ fontSize: '0.8rem' }}>
          O'xshash abonentlarga o'tish:
        </MenuItem>
        {duplicateCadastrList.map((sub) => (
          <MenuItem
            key={sub.id}
            component={Link}
            to={`/abonent/${sub.id}/details`}
            onClick={handleCloseCadastr}
          >
            {sub.fullName} ({sub.accountNumber})
          </MenuItem>
        ))}
      </Menu>

      {/* Dublikat abonentlar menyusi: JShShIR */}
      <Menu
        anchorEl={pinflAnchorEl}
        open={Boolean(pinflAnchorEl)}
        onClose={handleClosePinfl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 300,
              minWidth: 220,
              mt: 0.5,
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.15)'
            }
          }
        }}
      >
        <MenuItem disabled sx={{ fontSize: '0.8rem' }}>
          O'xshash abonentlarga o'tish:
        </MenuItem>
        {duplicatePinflList.map((sub) => (
          <MenuItem
            key={sub.id}
            component={Link}
            to={`/abonent/${sub.id}/details`}
            onClick={handleClosePinfl}
          >
            {sub.fullName} ({sub.accountNumber})
          </MenuItem>
        ))}
      </Menu>

      {/* Dublikat abonentlar menyusi: Elektr hisob raqami */}
      <Menu
        anchorEl={electricityAnchorEl}
        open={Boolean(electricityAnchorEl)}
        onClose={handleCloseElectricity}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 300,
              minWidth: 220,
              mt: 0.5,
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.15)'
            }
          }
        }}
      >
        <MenuItem disabled sx={{ fontSize: '0.8rem' }}>
          O'xshash abonentlarga o'tish:
        </MenuItem>
        {similarAbonentsByElectricity
          .filter((a) => a.id !== data?.id)
          .map((sub) => (
            <MenuItem key={sub.id} component={Link} to={`/abonent/${sub.id}/details`} onClick={handleCloseElectricity}>
              {sub.fullName} ({sub.accountNumber})
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

export default AbonentProfileCard;
