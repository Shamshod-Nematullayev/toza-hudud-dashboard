import { Outlet, useLocation } from 'react-router-dom';
import AbonentTools from './AbonentTools';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { usePrefetchAbonentPageData, useAbonentDetailsSupplementaryData, useAbonentLogic } from './hooks/useAbonentLogic';
import ChangePhoneDialog from './modals/ChangePhone';
import EditDetails from './modals/EditDetails';
import PrintAbonentCard from './modals/PrintAbonentCard';
import PrintDebtCertificate from './modals/PrintDebtCertificate';
import IIBInhabitants from './modals/IIBInhabitants';
import AddInhabitants from './modals/AddInhabitants';
import EditElectricAccountModal from './modals/ElectricAccountEdit';
import MvdAddress from './modals/MvdAddress';
import ArizaDocumentModal from './modals/ArizaDocumentModal';
import { useAbonentStore } from './hooks/abonentStore';
import ResidentCadastrs from './modals/ResidentCadastrs';
import TozaMakonHistoryModal from './modals/TozaMakonHistoryModal';

function Abonent() {
  usePrefetchAbonentPageData();
  useAbonentDetailsSupplementaryData();
  const { openPrintAbonentcardState, setOpenPrintAbonentcardState, abonentDetails } = useAbonentStore();
  const { residentId } = useAbonentLogic();
  const location = useLocation();
  const currentTab = location.pathname.split('/').pop() || 'details';
  return (
    <div>
      <AbonentTools />
      {currentTab !== 'details' && abonentDetails && (
        <Paper
          elevation={0}
          sx={{
            px: 2.5,
            py: 1.25,
            mb: 1,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mr: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Abonent:
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', textTransform: 'uppercase' }}>
              {abonentDetails.fullName}
            </Typography>
          </Stack>
          <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', height: 20 }} />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Hisob raqami:
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'success.main', fontFamily: 'monospace', fontSize: '1rem' }}>
              {abonentDetails.accountNumber}
            </Typography>
          </Stack>
        </Paper>
      )}
      <Outlet />

      {/* Using modals */}
      <ChangePhoneDialog />
      <EditDetails />
      <PrintAbonentCard open={openPrintAbonentcardState} onClose={() => setOpenPrintAbonentcardState(false)} fetchParams={{ residentId }} />
      <PrintDebtCertificate />
      <IIBInhabitants />
      <AddInhabitants />
      <EditElectricAccountModal />
      <MvdAddress />
      <ArizaDocumentModal />
      <ResidentCadastrs />
      <TozaMakonHistoryModal />
    </div>
  );
}

export default Abonent;
