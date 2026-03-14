import React, { useState } from 'react';
import { Button, ButtonGroup, Stack, Menu, MenuItem, Tooltip, IconButton, useMediaQuery, Tabs, Tab, Badge } from '@mui/material';
import {
  Print as PrintIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  AddHome as AddHomeIcon,
  PhoneIphone as PhoneIcon,
  Description as PetitionIcon,
  AddHomeWork as MultipleIcon,
  Tune as ActionsIcon
} from '@mui/icons-material';
import { t } from 'i18next';
import { useAbonentStore } from './abonentStore';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAbonentLogic } from './useAbonentLogic';

export function AbonentToolsMobile() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const buttonStyle = {
    px: 2,
    py: 1,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem'
  };

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <ButtonGroup
        variant="contained"
        disableElevation
        sx={{
          borderRadius: '10px',
          '& .MuiButton-root': { borderColor: 'rgba(255,255,255,0.2)' },
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        {/* Asosiy harakat: Tahrirlash */}
        <Button startIcon={<EditIcon />} sx={{ ...buttonStyle, bgcolor: 'primary.main' }}>
          {t('buttons.edit')}
        </Button>

        {/* Chop etish */}
        <Tooltip title={t('buttons.print')}>
          <Button sx={buttonStyle}>
            <PrintIcon fontSize="small" />
          </Button>
        </Tooltip>

        {/* Qo'shimcha amallar menyusi */}
        <Button onClick={handleClick} sx={{ ...buttonStyle, minWidth: '40px', px: 1 }}>
          <MoreIcon />
        </Button>
      </ButtonGroup>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: '12px',
            minWidth: 200,
            boxShadow: '0px 10px 25px rgba(0,0,0,0.1)'
          }
        }}
      >
        <MenuItem onClick={handleClose} sx={{ gap: 1.5, py: 1.2 }}>
          <PetitionIcon fontSize="small" color="action" />
          {t('buttons.createAbonentPetition')}
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ gap: 1.5, py: 1.2 }}>
          <AddHomeIcon fontSize="small" color="action" />
          {t('buttons.addToMultipleLivings')}
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ gap: 1.5, py: 1.2 }}>
          <PhoneIcon fontSize="small" color="action" />
          {t('buttons.editPhone')}
        </MenuItem>
      </Menu>
    </Stack>
  );
}

type TabType = 'details' | 'dhj' | 'ariza' | 'acts';

function AbonentTools() {
  const { setOpenChangePhoneDialog, abonentDetails, dhjRows, setEditDialogOpenState, abonentPetitions } = useAbonentStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { residentId } = useAbonentLogic();
  const currentTab = location.pathname.split('/').pop();
  const [tab, setTab] = useState<TabType>(currentTab as TabType);

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

  const isXs = useMediaQuery('(max-width:600px)');

  return (
    <>
      {isXs ? (
        <AbonentToolsMobile />
      ) : (
        <Stack
          direction="row"
          justifyContent={'space-between'}
          sx={{
            p: 1,
            bgcolor: 'background.paper',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            marginBottom: 2
          }}
        >
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
              <Button sx={btnStyle} startIcon={<ActionsIcon color="primary" />}>
                {t('tableHeaders.actions')}
              </Button>
            </Tooltip>

            <Button sx={btnStyle} startIcon={<PrintIcon />}>
              {t('buttons.print')}
            </Button>

            <Button
              sx={btnStyle}
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
            >
              {t('buttons.createAbonentPetition')}
            </Button>

            <Button sx={btnStyle} startIcon={<MultipleIcon />} color="primary">
              {t('buttons.addToMultipleLivings')}
            </Button>

            {/* Tahrirlash guruhi - ajratilgan rangda */}
            <Button sx={btnStyle} startIcon={<EditIcon />} color="primary" onClick={() => setEditDialogOpenState(true)}>
              {t('buttons.edit')}
            </Button>

            <Button
              sx={{
                ...btnStyle,
                borderTopRightRadius: '12px !important',
                borderBottomRightRadius: '12px !important'
              }}
              startIcon={<PhoneIcon />}
              onClick={() => setOpenChangePhoneDialog(true)}
            >
              {t('buttons.editPhone')}
            </Button>
          </ButtonGroup>
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
      )}
    </>
  );
}

export default AbonentTools;
