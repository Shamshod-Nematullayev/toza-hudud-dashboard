import { Outlet } from 'react-router-dom';
import AbonentTools from './AbonentTools';
import { usePrefetchAbonentPageData, useAbonentDetailsSupplementaryData, useAbonentLogic } from './useAbonentLogic';
import ChangePhoneDialog from './modals/ChangePhone';
import EditDetails from './modals/EditDetails';
import PrintAbonentCard from './modals/PrintAbonentCard';
import PrintDebtCertificate from './modals/PrintDebtCertificate';
import IIBInhabitants from './modals/IIBInhabitants';
import AddInhabitants from './modals/AddInhabitants';
import EditElectricAccountModal from './modals/ElectricAccountEdit';
import MvdAddress from './modals/MvdAddress';
import ArizaDocumentModal from './modals/ArizaDocumentModal';
import { useAbonentStore } from './abonentStore';

function Abonent() {
  usePrefetchAbonentPageData();
  useAbonentDetailsSupplementaryData();
  const { openPrintAbonentcardState, setOpenPrintAbonentcardState } = useAbonentStore();
  const { residentId } = useAbonentLogic();
  return (
    <div>
      <AbonentTools />
      {/* Info Chips */}
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
    </div>
  );
}

export default Abonent;
