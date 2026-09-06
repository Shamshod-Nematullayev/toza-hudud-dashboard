import React, { useState } from 'react';
import DataTable from './DataTable/DataTable';
import SideBar from './SideBarAbonentPetitions';
import useStore from './useStore';
import PrintSection from '../CreateAbonentPetition.jsx/PrintSection';
import Loader from 'ui-component/Loader';
import { Box, Drawer, Grid, useMediaQuery, useTheme } from '@mui/material';

function Recalculate() {
  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { showPrintSection, setShowPrintSection, currentAriza, abonentData, abonentData2, mahalla, mahallaDublicat, isLoading } =
    useStore();

  return (
    <Box sx={{ width: '100%' }}>
      {isLoading && <Loader />}
      <PrintSection
        show={showPrintSection}
        setShowPrintSection={setShowPrintSection}
        aniqlanganYashovchiSoni={parseInt(currentAriza?.next_prescribed_cnt || '0')}
        documentType={currentAriza?.document_type}
        ariza={currentAriza}
        muzlatiladi={currentAriza?.muzlatiladi}
        recalculationPeriods={currentAriza?.recalculationPeriods}
        abonentData={abonentData}
        abonentData2={abonentData2}
        mahalla={mahalla}
        mahalla2={mahallaDublicat}
      />

      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            lg: isLgUp ? 9 : 12
          }}
        >
          <DataTable
            onOpenMobileFilter={() => setMobileFilterOpen(true)}
            showMobileFilterButton={!isLgUp}
          />
        </Grid>

        {isLgUp && (
          <Grid
            size={{
              xs: 12,
              lg: 3
            }}
          >
            <SideBar />
          </Grid>
        )}
      </Grid>

      {/* Responsive drawer for tablets/smaller screens */}
      {!isLgUp && (
        <Drawer
          anchor="right"
          open={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          slotProps={{
            paper: {
              sx: { width: { xs: 300, sm: 360 }, p: 1 }
            }
          }}
        >
          <SideBar onClose={() => setMobileFilterOpen(false)} />
        </Drawer>
      )}
    </Box>
  );
}

export default Recalculate;
