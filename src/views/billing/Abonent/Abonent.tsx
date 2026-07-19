import { Outlet, useLocation } from 'react-router-dom';
import AbonentTools from './AbonentTools';
import { Box, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Box sx={isMobile ? { pb: '84px', bgcolor: '#0B1330', minHeight: '100vh', mx: -2, mt: -2, p: 2 } : undefined}>
      <AbonentTools />
      {currentTab !== 'details' && abonentDetails && (
        <Paper
          elevation={0}
          sx={{
            px: isMobile ? 1.5 : 2.5,
            py: isMobile ? 1 : 1.25,
            mb: 1.5,
            borderRadius: isMobile ? '10px' : '12px',
            border: isMobile ? '1px solid #29346B' : '1px solid',
            borderColor: isMobile ? undefined : 'divider',
            bgcolor: isMobile ? '#16204A' : 'background.paper',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 0.5 : 2
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: isMobile ? '#9AA3C7' : 'text.secondary' }}>
              👤 Abonent:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: isMobile ? '#EDEFFA' : 'text.primary', textTransform: 'uppercase', fontSize: isMobile ? '12px' : 'inherit' }}>
              {abonentDetails.fullName}
            </Typography>
          </Stack>
          {!isMobile && <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', height: 20 }} />}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: isMobile ? '#9AA3C7' : 'text.secondary' }}>
              💳 Hisob raqami:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: isMobile ? '#34C77B' : 'success.main', fontFamily: 'monospace', fontSize: isMobile ? '12px' : '1rem' }}>
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
    </Box>
  );
}

export default Abonent;
