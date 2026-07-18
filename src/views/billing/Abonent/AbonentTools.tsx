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
  Divider
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
    px: 2.5,
    py: 1.2,
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.85rem',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    }
  };

  const handleRefreshDetails = () => {
    void refreshAbonentDetailsPage(residentId, periodEndYear);
  };

  const [anchorElActions, setAnchorElActions] = useState<null | HTMLElement>(null);
  const [openBoundingElectrAccountsModal, setOpenBindingElectrAccountsModal] = useState(false);
  return (
    <>
      <Stack
        direction="row"
        sx={{
          p: 1,
          bgcolor: 'background.paper',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          marginBottom: 1,
          justifyContent: 'space-between'
        }}
      >
        <BindingElectrAccountsModal
          open={openBoundingElectrAccountsModal}
          onClose={() => setOpenBindingElectrAccountsModal(false)}
          accountNumber={abonentDetails?.accountNumber}
        />
        <ButtonGroup
          variant="outlined"
          sx={{
            '& .MuiButton-root': {
              borderColor: '#cbd5e1',
              color: 'text.primary',
              bgcolor: 'background.default',
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
        <Tooltip title={t('buttons.refresh')}>
          <IconButton onClick={handleRefreshDetails} sx={{ p: 1 }} aria-label={t('buttons.refresh')}>
            <Refresh />
          </IconButton>
        </Tooltip>
        <Tabs value={tab} onChange={handleTabsChange}>
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
    </>
  );
}

export default AbonentTools;
