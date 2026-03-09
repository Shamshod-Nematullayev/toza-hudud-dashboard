import React from 'react';
import { Stack, Typography, Box, SvgIconProps, SxProps } from '@mui/material';

// Komponent parametrlari: icon (komponent), label (key), value
const InfoChip = ({
  icon: Icon,
  label,
  value,
  valueColor = '',
  ...containerSX
}: {
  icon: React.ElementType<SvgIconProps>;
  label: string | number;
  value: string | number;
  containerSX?: SxProps;
  valueColor?: string;
}) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: '12px',
        border: '1px dashed #e0e0e0', // Dashed border - xohlasangiz 'solid' qiling
        bgcolor: 'rgba(255, 255, 255, 0.6)',
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: '#fff',
          borderColor: 'primary.main',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        },

        width: {
          xs: 100,
          sm: 100,
          md: 250
        },
        ...containerSX
      }}
    >
      {/* Icon qismi */}
      <Box
        sx={{
          display: 'flex',
          color: 'primary.main',
          bgcolor: 'primary.light',
          p: 0.8,
          borderRadius: '8px',
          opacity: 0.9
        }}
      >
        <Icon sx={{ fontSize: 24 }} />
      </Box>

      {/* Matn qismi */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: valueColor, mt: 0.5, fontSize: 18 }}>
          {value}
        </Typography>
        <Typography variant="caption" display="block" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1 }}>
          {label}
        </Typography>
      </Box>
    </Stack>
  );
};

export default InfoChip;
