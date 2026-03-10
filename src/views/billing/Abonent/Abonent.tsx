import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import AbonentTools from './AbonentTools';
import { useAbonentLogic } from './useAbonentLogic';
import InfoChips from './InfoChips';
import AbonentProfileCard from './AbonentProfileCard';
import ChangePhoneDialog from './modals/ChangePhone';
import { useAbonentStore } from './abonentStore';

function Abonent() {
  const { openChangePhoneDialogState, setOpenChangePhoneDialog, abonentDetails } = useAbonentStore();
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
