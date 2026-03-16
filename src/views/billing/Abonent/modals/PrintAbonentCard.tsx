import React from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../abonentStore';
import { t } from 'i18next';

function PrintAbonentCard() {
  const { openPrintAbonentcardState, setOpenPrintAbonentcardState } = useAbonentStore();

  return (
    <DraggableDialog
      open={openPrintAbonentcardState}
      title={t('buttons.print') + ' ' + t('abonentCardPage.abonentCard')}
      onClose={() => setOpenPrintAbonentcardState(false)}
    >
      ABONENT CARD PRINT SECTION
    </DraggableDialog>
  );
}

export default PrintAbonentCard;
