import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Box, Typography } from '@mui/material';
import React from 'react';
import Chart from 'react-apexcharts';
import useCustomizationStore from 'store/customizationStore';

const RadialChart = ({ progress, label, isLoading }) => {
  const theme = useTheme();
  const { customization } = useCustomizationStore();
  const isXs = useMediaQuery('(max-width:600px)');

  const chartData = {
    series: [isLoading ? 0 : progress],
    options: {
      chart: {
        type: 'radialBar'
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '60%'
          },
          dataLabels: {
            show: true,
            name: {
              show: false // label doira ichida ko'rinmasin
            },
            value: {
              fontSize: isXs ? '25px' : '50px',
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              fontFamily: customization.fontFamily
            }
          },
          track: {
            background: '#E0E0E0'
          }
        }
      },
      fill: {
        opacity: 1
      }
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {label && (
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          fontSize={isXs ? '14px' : '18px'}
          color={theme.palette.primary.main}
          fontFamily={customization.fontFamily}
          mt={1}
        >
          {label}
        </Typography>
      )}
      <Chart options={chartData.options} series={chartData.series} type="radialBar" height={isXs ? 250 : 300} />
    </Box>
  );
};

export default RadialChart;
