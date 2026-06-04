import { Box, Grid, Typography } from '@mui/material';
import { ReactNode } from 'react';

export const CompactKeyValue = ({
  data,
  xs,
  sm,
  md
}: {
  data: { key: string; value: string | number | ReactNode }[];
  xs?: number;
  sm?: number;
  md?: number;
}) => {
  return (
    <Grid container spacing={1}>
      {data.map((item, i) => (
        <Grid
          size={{
            xs,
            sm,
            md
          }}
          key={i}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              px: 1,
              py: 0.5,
              borderBottom: '1px solid #eee'
            }}
          >
            <Typography variant="subtitle2" color="textSecondary">
              {item.key}:
            </Typography>
            <Box sx={{ textAlign: 'right' }}>
              {typeof item.value === 'string' || typeof item.value === 'number' ? (
                <Typography variant="body2" sx={{ textOverflow: 'ellipsis', fontWeight: 500 }}>
                  {item.value}
                </Typography>
              ) : (
                item.value
              )}
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};
