import React, { ReactNode, useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Slider from '@mui/material/Slider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';

// project imports
import SubCard from 'ui-component/cards/SubCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { gridSpacing } from 'store/constant';

// assets
import { IconSettings } from '@tabler/icons-react';
import useCustomizationStore, { FontFamily } from 'store/customizationStore';
import { useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import { Tune } from '@mui/icons-material';
import MenuCustomizationDialog from './MenuCustomizationDialog';

// concat 'px'
function valueText(value: number) {
  return `${value}px`;
}

// ==============================|| LIVE CUSTOMIZATION ||============================== //

const Customization = () => {
  const theme = useTheme();
  const { customization, setCustomization } = useCustomizationStore();

  const [mode, setMode] = useState(customization.mode);
  const [openMenuDialog, setOpenMenuDialog] = useState(false);
  useEffect(() => {
    setCustomization({ mode });
  }, [mode]);
  // drawer on/off
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen(!open);
  };

  // state - border radius
  const [borderRadius, setBorderRadius] = useState(customization.borderRadius);
  const handleBorderRadius = (event: any, newValue: number) => {
    setBorderRadius(newValue);
  };

  useEffect(() => {
    setCustomization({ borderRadius });
  }, [setCustomization, borderRadius]);

  let initialFont;
  switch (customization.fontFamily) {
    case FontFamily.Inter:
      initialFont = FontFamily.Inter;
      break;
    case FontFamily.Poppins:
      initialFont = FontFamily.Poppins;
      break;
    case FontFamily.TimesNewRoman:
      initialFont = FontFamily.TimesNewRoman;
      break;
    case FontFamily.Roboto:
    default:
      initialFont = FontFamily.Roboto;
      break;
  }

  // state - font family
  const [fontFamily, setFontFamily] = useState<FontFamily>(initialFont);
  useEffect(() => {
    let newFont;
    switch (fontFamily) {
      case FontFamily.Inter:
        newFont = FontFamily.Inter;
        break;
      case FontFamily.Poppins:
        newFont = FontFamily.Poppins;
        break;
      case FontFamily.TimesNewRoman:
        newFont = FontFamily.TimesNewRoman;
        break;
      case FontFamily.Roboto:
      default:
        newFont = FontFamily.Roboto;
        break;
    }
    setCustomization({ fontFamily: newFont });
  }, [setCustomization, fontFamily]);

  const location = useLocation();

  return (
    <>
      {/* toggle button */}
      {location.pathname !== '/pages/login/login' && (
        <Tooltip title="Mavzu">
          <Fab
            component="div"
            onClick={handleToggle}
            size="medium"
            variant="circular"
            color="secondary"
            sx={{
              borderRadius: 0,
              borderTopLeftRadius: '50%',
              borderBottomLeftRadius: '50%',
              borderTopRightRadius: '50%',
              borderBottomRightRadius: '4px',
              top: '25%',
              position: 'fixed',
              right: 10,
              zIndex: theme.zIndex.speedDial
            }}
          >
            <AnimateButton type="rotate">
              <IconButton color="inherit" size="large" disableRipple>
                <IconSettings />
              </IconButton>
            </AnimateButton>
          </Fab>
        </Tooltip>
      )}

      <Drawer
        anchor="right"
        onClose={handleToggle}
        open={open}
        slotProps={{
          paper: {
            sx: {
              width: 280
            }
          }
        }}
      >
        <PerfectScrollbar component="div">
          <Grid container spacing={gridSpacing} sx={{ p: 3 }}>
            <Grid size={12}>
              <SubCard title="Mode">
                <FormControl>
                  <RadioGroup aria-label="mode" value={mode} onChange={(e) => setMode(e.target.value)} name="mode-radio-buttons">
                    <FormControlLabel
                      value="dark"
                      control={<Radio />}
                      label="Dark"
                      sx={{
                        '& .MuiSvgIcon-root': { fontSize: 28 },
                        '& .MuiFormControlLabel-label': { color: theme.palette.grey[900] }
                      }}
                    />
                    <FormControlLabel
                      value="light"
                      control={<Radio />}
                      label="Light"
                      sx={{
                        '& .MuiSvgIcon-root': { fontSize: 28 },
                        '& .MuiFormControlLabel-label': { color: theme.palette.grey[900] }
                      }}
                    />
                  </RadioGroup>
                </FormControl>
              </SubCard>
            </Grid>
            <Grid size={12}>
              {/* font family */}
              <SubCard title="Font Family">
                <FormControl>
                  <RadioGroup
                    aria-label="font-family"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                    name="row-radio-buttons-group"
                  >
                    <FormControlLabel
                      value={FontFamily.Roboto}
                      control={<Radio />}
                      label="Roboto"
                      sx={{
                        '& .MuiSvgIcon-root': { fontSize: 28 },
                        '& .MuiFormControlLabel-label': { color: theme.palette.grey[900] }
                      }}
                    />
                    <FormControlLabel
                      value={FontFamily.Poppins}
                      control={<Radio />}
                      label="Poppins"
                      sx={{
                        '& .MuiSvgIcon-root': { fontSize: 28 },
                        '& .MuiFormControlLabel-label': { color: theme.palette.grey[900] }
                      }}
                    />
                    <FormControlLabel
                      value={FontFamily.TimesNewRoman}
                      control={<Radio />}
                      label="Times New Roman"
                      sx={{
                        '& .MuiSvgIcon-root': { fontSize: 28 },
                        '& .MuiFormControlLabel-label': { color: theme.palette.grey[900] }
                      }}
                    />
                    <FormControlLabel
                      value={FontFamily.Inter}
                      control={<Radio />}
                      label="Inter"
                      sx={{
                        '& .MuiSvgIcon-root': { fontSize: 28 },
                        '& .MuiFormControlLabel-label': { color: theme.palette.grey[900] }
                      }}
                    />
                  </RadioGroup>
                </FormControl>
              </SubCard>
            </Grid>
            <Grid size={12}>
              {/* border radius */}
              {React.createElement(
                SubCard as any,
                { title: 'Border Radius' },
                <Grid size={12} container spacing={2} sx={{ mt: 2.5, alignItems: 'center' }}>
                  <Grid>
                    <Typography variant="h6" color="secondary">
                      4px
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Slider
                      size="small"
                      value={borderRadius}
                      onChange={handleBorderRadius}
                      getAriaValueText={valueText}
                      valueLabelDisplay="on"
                      aria-labelledby="discrete-slider-small-steps"
                      marks
                      step={2}
                      min={4}
                      max={24}
                      color="secondary"
                      sx={{
                        '& .MuiSlider-valueLabel': {
                          color: 'secondary.light'
                        }
                      }}
                    />
                  </Grid>
                  <Grid>
                    <Typography variant="h6" color="secondary">
                      24px
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Grid>

            {/* Menyu elementlarini moslashtirish */}
            <Grid size={12}>
              <SubCard title="Menyu Sozlamalari">
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Menyu bandlarini tartiblash va kerakmaslarini yashirish
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  startIcon={<Tune />}
                  onClick={() => setOpenMenuDialog(true)}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                >
                  Menyularni Sozlash
                </Button>
              </SubCard>
            </Grid>
          </Grid>
        </PerfectScrollbar>
      </Drawer>

      <MenuCustomizationDialog
        open={openMenuDialog}
        onClose={() => setOpenMenuDialog(false)}
      />
    </>
  );
};

export default Customization;
