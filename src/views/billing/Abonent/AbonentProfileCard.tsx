import React, { ReactNode, useRef, useState } from 'react';
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
  MenuItem
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
import { useAbonentStore } from './hooks/abonentStore';
import useLoaderStore from 'store/loaderStore';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { formatPhoneNumber } from 'views/tools/formatters';
import { Link } from 'react-router-dom';

interface Data extends AbonentDetails {
  photo?: string;
}

const AbonentProfileCard = ({ data }: { data: Data | null }) => {
  const isLoading = !data;

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
    getResidentCadastrs
  } = useAbonentStore();
  const { setIsLoading } = useLoaderStore();

  console.log(similarAbonentsByElectricity);
  const isDublicateElectricity = similarAbonentsByElectricity.length > 1;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const etkInfoRow = useRef<HTMLDivElement>(null);
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(etkInfoRow.current);
  };

  const handleClose = () => {
    setAnchorEl(null);
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

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    color = 'text.primary',
    fontSize,
    copyable,
    labelColor,
    isSkeleton
  }: {
    icon: React.ElementType<SvgIconProps>;
    label: string | number;
    value?: string | number | ReactNode;
    color?: string;
    labelColor?: string;
    fontSize?: number;
    copyable?: boolean;
    isSkeleton?: boolean;
  }) => (
    <Grid container spacing={1} sx={{ py: 0.7, alignItems: 'center' }}>
      <Grid item xs={5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Icon sx={{ fontSize: 18, color: labelColor || 'text.secondary', opacity: 0.7 }} />
        <Typography variant="body2" sx={{ color: labelColor || 'text.secondary' }}>
          {label}:
        </Typography>
      </Grid>
      <Grid item xs={7} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isSkeleton ? (
          <Skeleton variant="text" width="80%" height={20} />
        ) : (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600, color: color, fontSize }}>
              {value || '—'}
            </Typography>
            {copyable && value && (
              <IconButton size="small" onClick={() => navigator.clipboard.writeText(value.toString())} sx={{ opacity: 0.8 }}>
                <ContentCopy fontSize="small" color="primary" />
              </IconButton>
            )}
          </>
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
        border: '1px solid #eef2f6',
        mt: 2
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Avatar qismi */}
          <Grid item xs={3} md={1.5} alignItems={'center'} justifyContent={'center'} display={'flex'} direction={'column'}>
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
          <Grid item xs={6} md={4.5}>
            <Box sx={{ mb: 2 }}>
              {!isLoading && ['BLOCK', 'ALREADY_BLOCK'].includes(blockReport?.blockStatus || '') && (
                <Alert color="error" sx={{ mb: 1 }}>
                  {t('abonentCardPage.blockedByHet')}: {dayjs(blockReport?.blockDate).format('DD.MM.YYYY')}{' '}
                  {blockReport?.blockDebt.toLocaleString()} {t('uzs')}
                </Alert>
              )}

              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
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
                <Grid item xs={5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <JshshirIcon sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.7 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    ЖШШИР:
                  </Typography>
                </Grid>
                <Grid item xs={7} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isLoading ? (
                    <Skeleton variant="text" width="80%" height={20} />
                  ) : (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {data?.citizen.pnfl || '—'}
                      </Typography>
                      <Tooltip title={t("Yashash manzili ma'lumotlari")} placement="top">
                        <IconButton
                          size="small"
                          onClick={() => fetchAbonentMvdAddress(data?.citizen.pnfl || '')}
                          disabled={ui.mvdAddressLoading || !data?.citizen.pnfl || data.citizen.pnfl.length !== 14}
                        >
                          {ui.mvdAddressLoading ? <CircularProgress size={16} /> : <MvdIcon sx={{ fontSize: 18, color: 'primary.main' }} />}
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Grid>
              </Grid>

              <InfoRow icon={ContractIcon} label="Шартнома рақами" value={data?.contractNumber || ''} isSkeleton={isLoading} />
              <InfoRow
                icon={CadastreIcon}
                label="Кадастр рақами"
                value={
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {data?.house.cadastralNumber}
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
                  </>
                }
                isSkeleton={isLoading}
              />
              <InfoRow icon={DateIcon} label="Шартнома санаси" value={data?.contractDate} isSkeleton={isLoading} />
            </Box>
          </Grid>

          {/* O'ng tomon: Qo'shimcha ma'lumotlar */}
          <Grid item xs={6}>
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
                value={data ? formatPhoneNumber(data.phone || '') : undefined}
                labelColor={data && !data.phone ? 'error.main' : undefined}
                color={data && !data.phone ? 'error.main' : undefined}
                isSkeleton={isLoading}
              />
              <InfoRow icon={HomePhoneIcon} label="Уй телефони" value={formatPhoneNumber(data?.homePhone || '')} isSkeleton={isLoading} />
              <InfoRow icon={SoatoIcon} label="Электр СОАТО" value={data?.electricityCoato} isSkeleton={isLoading} />
              <div ref={etkInfoRow}>
                <InfoRow
                  icon={EnergyIcon}
                  label="Электр рақами"
                  labelColor={isDublicateElectricity ? 'error.main' : undefined}
                  value={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
                      <Typography color={isDublicateElectricity ? 'error.main' : 'inherit'}>{data?.electricityAccountNumber}</Typography>

                      {isDublicateElectricity && (
                        <>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={handleOpen}
                            startIcon={<WarningIcon />}
                            sx={{ textTransform: 'none', py: 0, px: 1, fontSize: '0.75rem' }}
                          >
                            {similarAbonentsByElectricity.length - 1} dublikat
                          </Button>
                          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} sx={{ maxHeight: 300 }}>
                            <MenuItem disabled sx={{ fontSize: '0.8rem' }}>
                              O'xshash abonentlarga o'tish:
                            </MenuItem>
                            {similarAbonentsByElectricity
                              .filter((a) => a.id !== data?.id)
                              .map((sub) => (
                                <MenuItem key={sub.id} component={Link} to={`/abonent/${sub.id}/details`} onClick={handleClose}>
                                  {sub.fullName} ({sub.accountNumber})
                                </MenuItem>
                              ))}
                          </Menu>
                        </>
                      )}
                    </Box>
                  }
                  isSkeleton={isLoading}
                />
              </div>
              <InfoRow icon={NoteIcon} label="Изоҳ" value={data?.description || ''} isSkeleton={isLoading} />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AbonentProfileCard;
