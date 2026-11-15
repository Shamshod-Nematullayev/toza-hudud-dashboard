import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { InsightsOutlined, DashboardOutlined } from '@mui/icons-material';
import useCustomizationStore from 'store/customizationStore';

const DashboardModeSwitcher = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useCustomizationStore();

  const isProductAdmin = Boolean(user?.roles?.includes('product_admin'));
  if (!isProductAdmin) return null;

  const isProductIntelligence = location.pathname.startsWith('/dashboard/product-intelligence');
  const currentMode = isProductIntelligence ? 'product-intelligence' : 'my-dashboard';

  const handleChange = (_event: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if (!newMode || newMode === currentMode) return;

    if (newMode === 'product-intelligence') {
      navigate('/dashboard/product-intelligence');
    } else {
      navigate('/dashboard/default');
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <ToggleButtonGroup
        value={currentMode}
        exclusive
        onChange={handleChange}
        size="small"
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.100',
          p: 0.5,
          borderRadius: '10px',
          border: '1px solid',
          borderColor: theme.palette.divider,
          '& .MuiToggleButtonGroup-grouped': {
            border: 0,
            borderRadius: '8px !important',
            mx: 0.25,
            px: 1.5,
            py: 0.5,
            textTransform: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: theme.palette.text.secondary,
            '&.Mui-selected': {
              bgcolor: theme.palette.background.paper,
              color: theme.palette.primary.main,
              boxShadow: theme.palette.mode === 'dark' ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.08)',
              '&:hover': {
                bgcolor: theme.palette.background.paper
              }
            },
            '&:hover': {
              bgcolor: theme.palette.action.hover
            }
          }
        }}
      >
        <Tooltip title="Butun GreenZone ekotizimini nazorat qilish paneli" arrow>
          <ToggleButton value="product-intelligence" aria-label="product intelligence">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <InsightsOutlined sx={{ fontSize: 18 }} />
              <span>Product Intelligence</span>
            </Box>
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Tashkilot boshqaruv paneli" arrow>
          <ToggleButton value="my-dashboard" aria-label="my dashboard">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <DashboardOutlined sx={{ fontSize: 18 }} />
              <span>My Dashboard</span>
            </Box>
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
};

export default DashboardModeSwitcher;
