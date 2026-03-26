import { Outlet } from 'react-router-dom';
import AbonentTools from './AbonentTools';
import { useAbonentLogic } from './useAbonentLogic';
import ChangePhoneDialog from './modals/ChangePhone';
import { useAbonentStore } from './abonentStore';
import EditDetails from './modals/EditDetails';
import PrintAbonentCard from './modals/PrintAbonentCard';
import PrintDebtCertificate from './modals/PrintDebtCertificate';
import IIBInhabitants from './modals/IIBInhabitants';
import AddInhabitants from './modals/AddInhabitants';
import EditElectricAccountModal from './modals/ElectricAccountEdit';

function Abonent() {
  useAbonentLogic();
  return (
    <div>
      <AbonentTools />
      {/* Info Chips */}
      <Outlet />

      {/* Using modals */}
      <ChangePhoneDialog />
      <EditDetails />
      <PrintAbonentCard />
      <PrintDebtCertificate />
      <IIBInhabitants />
      <AddInhabitants />
      <EditElectricAccountModal />
    </div>
  );
}

export default Abonent;
