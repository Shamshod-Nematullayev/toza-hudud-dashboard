import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import React from 'react';
import Chart from 'react-apexcharts';
import useCustomizationStore from 'store/customizationStore';

const RadialChart = ({ progress, label, isLoading }) => {
  const theme = useTheme();
  const { customization } = useCustomizationStore();
  const isXs = useMediaQuery('(max-width:600px)');

  const chartData = {
    series: [isLoading ? 0 : progress], // Loading bo'lsa progress = 0
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
              show: !!label,
              fontSize: isXs ? '14px' : '18px',
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              fontFamily: customization.fontFamily
            },
            value: {
              fontSize: '18px',
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
      },
      labels: [label]
    }
  };

  return <Chart options={chartData.options} series={chartData.series} type="radialBar" height={isXs ? 250 : 300} />;
};

export default RadialChart;
