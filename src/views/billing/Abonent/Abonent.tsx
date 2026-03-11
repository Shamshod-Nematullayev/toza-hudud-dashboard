import { Outlet } from 'react-router-dom';
import AbonentTools from './AbonentTools';
import { useAbonentLogic } from './useAbonentLogic';
import ChangePhoneDialog from './modals/ChangePhone';
import { useAbonentStore } from './abonentStore';

function Abonent() {
  const { openChangePhoneDialogState, setOpenChangePhoneDialog } = useAbonentStore();
  useAbonentLogic();
  return (
    <div>
      <AbonentTools />
      {/* Info Chips */}
      <Outlet />

      {/* Using modals */}
      <ChangePhoneDialog open={openChangePhoneDialogState} handleClose={() => setOpenChangePhoneDialog(false)} />
    </div>
  );
}

export default Abonent;
