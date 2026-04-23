import React, { useEffect, useRef, useState } from 'react';
import { AbonentDetails } from 'types/billing';
import { IAriza } from 'types/models';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { ArizaHeading } from 'views/billing/CreateAbonentPetition.jsx/DocumentComponents/ArizaHeading';
import { ArizaTitle } from 'views/billing/CreateAbonentPetition.jsx/DocumentComponents/ArizaTitle';
import { QRSection } from 'views/billing/CreateAbonentPetition.jsx/DocumentComponents/QRSection';
import { useAbonentStore } from '../abonentStore';
import { Button, DialogActions, DialogContent } from '@mui/material';
import { t } from 'i18next';
import { useReactToPrint } from 'react-to-print';
import { reactToPrintDefaultOptions } from 'store/constant';
import api from 'utils/api';
import { useAbonentLogic } from '../useAbonentLogic';

interface Props {
  relation?: string;
  relationFullName?: string;
}
function ArizaDocumentModal({ relation, relationFullName }: Props) {
  const isRelative = !!relation && !!relationFullName;
  const relationText = relation ? relation.toLowerCase() : '';
  const { residentId } = useAbonentLogic();

  const {
    ui,
    abonentPetitions,
    currentArizaId: ariza_id,
    closeAbonentPetitionModal,
    abonentDetails,
    getAbonentPetitions
  } = useAbonentStore();
  const [ariza, setAriza] = useState<IAriza | null>(null);
  useEffect(() => {
    const petition = abonentPetitions.find((p) => p._id === ariza_id);
    if (petition) {
      setAriza(petition);
    } else {
      setAriza(null);
    }
  }, [ui.abonentPetitionModalOpenState]);

  const handleMoveToInboxIconClick = (_id: string) => {
    api.put('/arizalar/move-to-inbox/' + _id).then(() => {
      getAbonentPetitions(residentId);
    });
  };

  const renderArizaText = () => {
    if (isRelative) {
      return `Shuni yozib ma’lum qilamanki, men fuqaro ${abonentDetails?.fullName}ning ${relationText} — ${relationFullName} bo'laman. Mazkur xonadonga tegishli ${abonentDetails?.accountNumber} shaxsiy hisob raqami onlayn bazaga noto‘g‘ri hisob-kitob qilingani sababli ushbu xujjatni taqdim qilyapman.`;
    }
    return `Shuni yozib ma’lum qilamanki, mening ${abonentDetails?.accountNumber} hisob raqamim onlayn bazaga noto‘g‘ri hisob-kitob qilingani sababli xujjat taqdim qilyapman.`;
  };

  const printContentRef = useRef<any>(null);
  const printFunction = useReactToPrint({
    ...reactToPrintDefaultOptions,
    contentRef: printContentRef
  });
  return (
    <DraggableDialog
      title=""
      open={ui.abonentPetitionModalOpenState}
      onClose={closeAbonentPetitionModal}
      sx={{ '& .MuiDialog-paper': { width: '85%', maxWidth: '800px' } }}
    >
      <DialogContent>
        {ariza && abonentDetails && (
          <div ref={printContentRef}>
            <div className="page" style={{ fontSize: '16px', textAlign: 'justify', position: 'relative' }}>
              <span style={{ position: 'absolute', top: 0, left: 0, fontWeight: 'bold' }}>{ariza.document_number}</span>
              <ArizaHeading
                abonentData={abonentDetails as AbonentDetails}
                vakil={relation ? { relation, fullName: relationFullName || '' } : undefined}
              />
              <br />
              <ArizaTitle type={ariza.document_type} />
              <br />
              <p style={{ fontWeight: 'bold', lineHeight: '40px', textIndent: '40px' }}>
                {renderArizaText()} Ushbu xujjat asosida qayta hisob-kitob qilib berishingizni so‘rayman.
              </p>
              <QRSection
                abonentData={{ ...abonentDetails, fullName: isRelative ? relationFullName : abonentDetails?.fullName || '' }}
                ariza={ariza}
                date={new Date()}
              />
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            printFunction();
            closeAbonentPetitionModal();
            handleMoveToInboxIconClick(ariza_id);
          }}
        >
          {t('buttons.print')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default ArizaDocumentModal;
