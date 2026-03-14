import { Outlet } from 'react-router-dom';
import AbonentTools from './AbonentTools';
import { useAbonentLogic } from './useAbonentLogic';
import ChangePhoneDialog from './modals/ChangePhone';
import { useAbonentStore } from './abonentStore';
import EditDetails from './modals/EditDetails';

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
    </div>
  );
}

export default Abonent;
