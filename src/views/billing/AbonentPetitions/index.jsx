import MainCard from 'ui-component/cards/MainCard';
import DataTable from './DataTable';
import SideBar from './SideBarAbonentPetitions';
import useStore from './useStore';
import PrintSection from '../CreateAbonentPetition.jsx/PrintSection';
import Loader from 'ui-component/Loader';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';

function Recalculate() {
  const { showPrintSection, setShowPrintSection, currentAriza, abonentData, abonentData2, mahalla, mahallaDublicat, isLoading } =
    useStore();
  return (
    <MainCard>
      {isLoading && <Loader />}
      <PrintSection
        show={showPrintSection}
        setShowPrintSection={setShowPrintSection}
        aniqlanganYashovchiSoni={parseInt(currentAriza.next_prescribed_cnt)}
        documentType={currentAriza.document_type}
        ariza={currentAriza}
        muzlatiladi={currentAriza.muzlatiladi}
        recalculationPeriods={currentAriza.recalculationPeriods}
        abonentData={abonentData}
        abonentData2={abonentData2}
        mahalla={mahalla}
        mahalla2={mahallaDublicat}
      />
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} sm={9}>
          <DataTable />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SideBar />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default Recalculate;
