import { Grid, Typography } from '@mui/material';
import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { AssessmentOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const reportTypes = [
  { id: 1, name: "Nazoratchilar: Abonent ma'lumotlari", path: 'xatlov-inspectors' },
  { id: 2, name: 'Arizalar hisoboti', path: 'report-petitions' },
  { id: 3, name: 'Identifikatsiya mahalla kesimida ', path: 'report-identifikatsiya' }
];

function Reports() {
  return (
    <div>
      <Grid container height={'100%'} spacing={2}>
        {reportTypes.map((reportType) => (
          <Grid item xs={12} sm={3} md={2} key={reportType.id}>
            <Link to={`/billing/${reportType.path}`} style={{ textDecoration: 'none' }}>
              <MainCard
                sx={{
                  height: 150,
                  boxShadow: 3
                }}
                key={reportType.id}
              >
                <AssessmentOutlined sx={{ color: 'success.main', fontSize: '3.5em' }} />
                <Typography variant="h4">{reportType.name}</Typography>
              </MainCard>
            </Link>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default Reports;
