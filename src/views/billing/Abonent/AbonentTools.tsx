import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Stack,
  Menu,
  MenuItem,
  Tooltip,
  IconButton,
  useMediaQuery,
  Tabs,
  Tab,
  Badge,
  List,
  ListItem,
  Divider,
  Box,
  Typography,
  Paper,
  useTheme
} from '@mui/material';
import {
  Print as PrintIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  AddHome as AddHomeIcon,
  PhoneIphone as PhoneIcon,
  Description as PetitionIcon,
  AddHomeWork as MultipleIcon,
  Tune as ActionsIcon,
  ElectricBolt,
  Refresh,
  History as HistoryIcon
} from '@mui/icons-material';
import { t } from 'i18next';
import { useAbonentStore } from './hooks/abonentStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAbonentLogic } from './hooks/useAbonentLogic';
import MainPopper from 'ui-component/cards/MainPopper';
import { IconCertificate, IconFileSpreadsheet } from '@tabler/icons-react';
import BindingElectrAccountsModal from './modals/BindingElectrAccountsModal';

type TabType = 'details' | 'dhj' | 'ariza' | 'acts';

function AbonentTools() {
  const {
    setOpenChangePhoneDialog,
    abonentDetails,
    dhjRows,
    setEditDialogOpenState,
    abonentPetitions,
    setOpenPrintAbonentcardState,
    setOpenDebtCertificateDialog,
    setOpenAddInhabitantsDialog,
    setOpenEditElectricAccountState,
    refreshAbonentDetailsPage,
    setOpenTozaMakonHistoryDialog
  } = useAbonentStore();
  const navigate = useNavigate();
  const location = useLocation();
  const printSectionRef = useRef(null);
  const [printSelectionOpen, setPrintSelectionOpen] = useState(false);
  const { residentId, periodEndYear } = useAbonentLogic();
  const currentTab = location.pathname.split('/').pop();
  const [tab, setTab] = useState<TabType>((currentTab as TabType) || 'details');
  useEffect(() => {
    if (currentTab && ['details', 'dhj', 'ariza', 'acts'].includes(currentTab)) {
      setTab(currentTab as TabType);
    }
  }, [currentTab]);

  const handleTabsChange = (e: React.SyntheticEvent, newValue: TabType) => {
    setTab(newValue);
    navigate(`/abonent/${residentId}/${newValue}`);
  };

  // Umumiy tugma stillari
  const btnStyle = {
    px: 1.75,
    py: 0.85,
    whiteSpace: 'nowrap',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.82rem',
    lineHeight: 1.3,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    }
  };

  const handleRefreshDetails = () => {
    void refreshAbonentDetailsPage(residentId, periodEndYear);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';
  const [anchorElMore, setAnchorElMore] = useState<null | HTMLElement>(null);
  const [anchorElActions, setAnchorElActions] = useState<null | HTMLElement>(null);
  const [anchorElPrint, setAnchorElPrint] = useState<null | HTMLElement>(null);
  const [openBindingElectrAccountsModal, setOpenBindingElectrAccountsModal] = useState(false);
  return (
    <>
      <BindingElectrAccountsModal
        open={openBindingElectrAccountsModal}
        onClose={() => setOpenBindingElectrAccountsModal(false)}
        accountNumber={abonentDetails?.accountNumber}
      />

      {isMobile ? (
        <>
          {/* Top Scrollable Tabs Strip */}
          <Box sx={{ mb: 2, borderBottom: '1px solid', borderColor: isDark ? '#29346B' : 'divider', pb: 1 }}>
            <Tabs
              value={tab}
              onChange={handleTabsChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-flexContainer': { gap: 1 },
                '& .MuiTab-root': {
                  minHeight: 'auto',
                  py: 1,
                  px: 2.25,
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: isDark ? '#29346B' : 'divider',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  bgcolor: isDark ? '#16204A' : 'background.paper',
                  color: isDark ? '#9AA3C7' : 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(52, 199, 123, 0.14)' : 'rgba(33, 150, 243, 0.12)',
                    color: isDark ? '#34C77B' : 'primary.main',
                    borderColor: isDark ? 'rgba(52, 199, 123, 0.4)' : 'primary.main'
                  }
                },
                '& .MuiTabs-indicator': { display: 'none' }
              }}
            >
              <Tab label="Ma'lumotlar" value="details" />
              <Tab label="DHJ" value="dhj" />
              <Tab
                label={
                  <Badge badgeContent={abonentPetitions.filter((a) => a.status === 'yangi').length} color="primary" variant="dot">
                    Arizalar
                  </Badge>
                }
                value="ariza"
              />
              <Tab label="Aktlar" value="acts" />
            </Tabs>
          </Box>

          {/* Sticky Bottom Bar */}
          <Paper
            elevation={isDark ? 4 : 8}
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'space-around',
              bgcolor: isDark ? '#121B42' : 'background.paper',
              borderTop: '1px solid',
              borderColor: isDark ? '#29346B' : 'divider',
              boxShadow: isDark ? '0 -2px 10px rgba(0,0,0,0.5)' : '0 -2px 12px rgba(0,0,0,0.08)',
              pb: 'env(safe-area-inset-bottom, 10px)',
              pt: 1
            }}
          >
            {/* Item 1: Amallar */}
            <IconButton
              onClick={(e) => setAnchorElActions(e.currentTarget)}
              sx={{ flexDirection: 'column', color: isDark ? '#9AA3C7' : 'text.secondary', gap: 0.5 }}
            >
              <ActionsIcon sx={{ fontSize: 20, color: '#FFB648' }} />
              <Typography variant="caption" sx={{ fontSize: '9.5px', fontWeight: 600, color: isDark ? '#34C77B' : 'primary.main' }}>
                Amallar
              </Typography>
            </IconButton>
            <Menu
              anchorEl={anchorElActions}
              open={Boolean(anchorElActions)}
              onClose={() => setAnchorElActions(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <MenuItem
                sx={{ display: 'flex', width: 280, gap: 2 }}
                onClick={() => {
                  setOpenBindingElectrAccountsModal(true);
                  setAnchorElActions(null);
                }}
              >
                <ElectricBolt /> Qo'shimcha elektr hisob raqamlari
              </MenuItem>
              <MenuItem
                sx={{ display: 'flex', width: 280, gap: 2 }}
                onClick={() => {
                  setOpenTozaMakonHistoryDialog(true);
                  setAnchorElActions(null);
                }}
              >
                <HistoryIcon /> Tizimdagi amallar tarixi
              </MenuItem>
            </Menu>

            {/* Item 2: Chop etish */}
            <IconButton
              onClick={(e) => setAnchorElPrint(e.currentTarget)}
              sx={{ flexDirection: 'column', color: isDark ? '#9AA3C7' : 'text.secondary', gap: 0.5 }}
            >
              <PrintIcon sx={{ fontSize: 20, color: isDark ? '#EDEFFA' : 'text.primary' }} />
              <Typography variant="caption" sx={{ fontSize: '9.5px', fontWeight: 600, color: isDark ? '#9AA3C7' : 'text.secondary' }}>
                Chop etish
              </Typography>
            </IconButton>
            <Menu
              anchorEl={anchorElPrint}
              open={Boolean(anchorElPrint)}
              onClose={() => setAnchorElPrint(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <MenuItem
                sx={{ display: 'flex', justifyContent: 'space-between', width: 180, gap: 2 }}
                onClick={() => {
                  setOpenPrintAbonentcardState(true);
                  setAnchorElPrint(null);
                }}
              >
                <IconFileSpreadsheet /> {t('abonentCardPage.abonentCard')}
              </MenuItem>
              <Divider />
              <MenuItem
                sx={{ display: 'flex', justifyContent: 'space-between', width: 180, gap: 2 }}
                onClick={() => {
                  setOpenDebtCertificateDialog(true);
                  setAnchorElPrint(null);
                }}
              >
                <IconCertificate /> {t('abonentCardPage.certificate')}
              </MenuItem>
            </Menu>

            {/* Item 3: Yashovchi */}
            <IconButton
              onClick={() => setOpenAddInhabitantsDialog(true)}
              sx={{ flexDirection: 'column', color: isDark ? '#9AA3C7' : 'text.secondary', gap: 0.5 }}
            >
              <MultipleIcon sx={{ fontSize: 20, color: isDark ? '#EDEFFA' : 'text.primary' }} />
              <Typography variant="caption" sx={{ fontSize: '9.5px', fontWeight: 600, color: isDark ? '#9AA3C7' : 'text.secondary' }}>
                Yashovchi
              </Typography>
            </IconButton>

            {/* Item 4: Telefon */}
            <IconButton
              onClick={() => setOpenChangePhoneDialog(true)}
              sx={{ flexDirection: 'column', color: isDark ? '#9AA3C7' : 'text.secondary', gap: 0.5 }}
            >
              <PhoneIcon sx={{ fontSize: 20, color: isDark ? '#EDEFFA' : 'text.primary' }} />
              <Typography variant="caption" sx={{ fontSize: '9.5px', fontWeight: 600, color: isDark ? '#9AA3C7' : 'text.secondary' }}>
                Telefon
              </Typography>
            </IconButton>

            {/* Item 5: Yana */}
            <IconButton
              onClick={(e) => setAnchorElMore(e.currentTarget)}
              sx={{ flexDirection: 'column', color: isDark ? '#9AA3C7' : 'text.secondary', gap: 0.5 }}
            >
              <MoreIcon sx={{ fontSize: 20, color: isDark ? '#EDEFFA' : 'text.primary' }} />
              <Typography variant="caption" sx={{ fontSize: '9.5px', fontWeight: 600, color: isDark ? '#9AA3C7' : 'text.secondary' }}>
                Yana
              </Typography>
            </IconButton>
            <Menu
              anchorEl={anchorElMore}
              open={Boolean(anchorElMore)}
              onClose={() => setAnchorElMore(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <MenuItem
                onClick={() => {
                  setEditDialogOpenState(true);
                  setAnchorElMore(null);
                }}
              >
                <EditIcon sx={{ mr: 1 }} /> {t('buttons.edit')}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setOpenEditElectricAccountState(true);
                  setAnchorElMore(null);
                }}
              >
                <ElectricBolt sx={{ mr: 1 }} /> {t('tableHeaders.electricityAccountNumber')}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  navigate('/billing/createAbonentAriza', {
                    state: {
                      abonentData: {
                        ...abonentDetails,
                        dhjRows: dhjRows
                      }
                    }
                  });
                  setAnchorElMore(null);
                }}
              >
                <PetitionIcon sx={{ mr: 1 }} /> {t('buttons.createAbonentPetition')}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleRefreshDetails();
                  setAnchorElMore(null);
                }}
              >
                <Refresh sx={{ mr: 1 }} /> {t('buttons.refresh')}
              </MenuItem>
            </Menu>
          </Paper>
        </>
      ) : (
        <Stack
          direction="row"
          sx={{
            p: 1,
            bgcolor: 'background.paper',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            alignItems: 'center',
            marginBottom: 1,
            justifyContent: 'space-between',
            gap: 1.5,
            overflowX: 'auto'
          }}
        >
          <ButtonGroup
            variant="outlined"
            sx={{
              flexShrink: 0,
              '& .MuiButton-root': {
                borderColor: '#cbd5e1',
                color: 'text.primary',
                bgcolor: 'background.default',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: '#f1f5f9',
                  borderColor: '#94a3b8',
                  color: '#475569'
                }
              }
            }}
          >
            {/* Asosiy amallar guruhi */}
            <Tooltip title={t('tableHeaders.actions')}>
              <Button
                sx={btnStyle}
                startIcon={<ActionsIcon color="primary" />}
                onClick={(e) => {
                  setAnchorElActions(anchorElActions ? null : e.currentTarget);
                }}
              >
                {t('tableHeaders.actions')}
              </Button>
            </Tooltip>
            <Menu
              anchorEl={anchorElActions}
              open={Boolean(anchorElActions)}
              onClose={() => setAnchorElActions(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
            >
              <MenuItem
                sx={{ display: 'flex', width: 280, gap: 2 }}
                onClick={() => {
                  setOpenBindingElectrAccountsModal(true);
                  setAnchorElActions(null);
                }}
              >
                <ElectricBolt /> Qo'shimcha elektr hisob raqamlari
              </MenuItem>
              <MenuItem
                sx={{ display: 'flex', width: 280, gap: 2 }}
                onClick={() => {
                  setOpenTozaMakonHistoryDialog(true);
                  setAnchorElActions(null);
                }}
              >
                <HistoryIcon /> Tizimdagi amallar tarixi
              </MenuItem>
            </Menu>

            <Button sx={btnStyle} startIcon={<PrintIcon />} ref={printSectionRef} onClick={() => setPrintSelectionOpen(true)}>
              {t('buttons.print')}
            </Button>
            <Menu
              anchorEl={printSectionRef.current}
              open={printSelectionOpen}
              onClose={() => setPrintSelectionOpen(false)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
            >
              <MenuItem
                sx={{ display: 'flex', justifyContent: 'space-between', width: 180, gap: 2 }}
                onClick={() => {
                  setOpenPrintAbonentcardState(true);
                  setPrintSelectionOpen(false);
                }}
              >
                <IconFileSpreadsheet /> {t('abonentCardPage.abonentCard')}
              </MenuItem>

              <Divider />

              <MenuItem
                sx={{ display: 'flex', justifyContent: 'space-between', width: 180, gap: 2 }}
                onClick={() => {
                  setOpenDebtCertificateDialog(true);
                  setPrintSelectionOpen(false);
                }}
              >
                <IconCertificate /> {t('abonentCardPage.certificate')}
              </MenuItem>
            </Menu>

            <Button sx={btnStyle} startIcon={<MultipleIcon />} color="primary" onClick={() => setOpenAddInhabitantsDialog(true)}>
              {t('buttons.addToMultipleLivings')}
            </Button>

            {/* Tahrirlash guruhi - ajratilgan rangda */}
            <Button sx={btnStyle} startIcon={<EditIcon />} color="primary" onClick={() => setEditDialogOpenState(true)}>
              {t('buttons.edit')}
            </Button>

            <Button sx={btnStyle} startIcon={<PhoneIcon />} onClick={() => setOpenChangePhoneDialog(true)}>
              {t('tableHeaders.phone')}
            </Button>
            <Button sx={btnStyle} startIcon={<ElectricBolt />} onClick={() => setOpenEditElectricAccountState(true)}>
              {t('tableHeaders.electricityAccountNumber')}
            </Button>
            <Button
              startIcon={<PetitionIcon />}
              onClick={() =>
                navigate('/billing/createAbonentAriza', {
                  state: {
                    abonentData: {
                      ...abonentDetails
                    },
                    dhjRows: dhjRows
                  }
                })
              }
              sx={{
                ...btnStyle,
                borderTopRightRadius: '12px !important',
                borderBottomRightRadius: '12px !important'
              }}
            >
              {t('buttons.createAbonentPetition')}
            </Button>
          </ButtonGroup>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
            <Tooltip title={t('buttons.refresh')}>
              <IconButton onClick={handleRefreshDetails} sx={{ p: 0.8 }} aria-label={t('buttons.refresh')}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tabs
              value={tab}
              onChange={handleTabsChange}
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  minHeight: 40,
                  py: 0.5,
                  px: 1.5,
                  fontSize: '0.85rem'
                }
              }}
            >
              <Tab label={"Ma'lumotlar"} value={'details'} />
              <Tab label={'DHJ'} value={'dhj'} />
              <Tab
                label={
                  <Badge badgeContent={abonentPetitions.filter((a) => a.status === 'yangi').length} color="primary" variant="dot">
                    Arizalar
                  </Badge>
                }
                value={'ariza'}
              />
              <Tab label={'Aktlar'} value={'acts'} />
            </Tabs>
          </Stack>
        </Stack>
      )}
    </>
  );
}

export default AbonentTools;
