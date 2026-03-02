import { Box, Grid, Typography } from '@mui/material';
import { ReactNode } from 'react';

export const CompactKeyValue = ({
  data,
  xs = 6,
  sm = 4,
  md = 4
}: {
  data: { key: string; value: string | number | ReactNode }[];
  xs?: number;
  sm?: number;
  md?: number;
}) => {
  return (
    <Grid container spacing={1}>
      {data.map((item, i) => (
        <Grid item xs={xs} sm={sm} md={md} key={i}>
          <Box display="flex" justifyContent="space-between" px={1} py={0.5} borderBottom="1px solid #eee">
            <Typography variant="subtitle2" color="textSecondary">
              {item.key}:
            </Typography>
            <Box textAlign="right">
              {typeof item.value === 'string' || typeof item.value === 'number' ? (
                <Typography variant="body2" fontWeight={500} style={{ textOverflow: 'ellipsis' }}>
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
