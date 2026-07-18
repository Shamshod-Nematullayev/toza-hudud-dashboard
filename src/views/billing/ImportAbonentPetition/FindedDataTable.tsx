import { Box } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import useStore from './hooks/useStore';
import { documentTypes } from 'store/constant';
import { useStore as useRecalculatorStore } from '../CreateAbonentPetition.jsx/useStore';
import { parseAktSumExpression, useFindedTableLogic } from './hooks/useFindedTableLogic';
import { AnimatePresence } from 'framer-motion';
import useLoaderStore from 'store/loaderStore';
import { useUiStore } from './hooks/useUiStore';
import { t } from 'i18next';
import api from 'utils/api';
import PasteImageDialog from 'ui-component/PasteImageDialog';

import { NoFileSelectedState } from './components/states/NoFileSelectedState';
import { DocumentNotFoundState } from './components/states/DocumentNotFoundState';
import { ManualEntryMode } from './components/manual/ManualEntryMode';
import { ArizaMode } from './components/ariza/ArizaMode';
import { useAdjustmentCalculation } from './hooks/useAdjustmentCalculation';
import { GridColDef } from '@mui/x-data-grid';

function FindedDataTable() {
  const { ariza, setAriza, setShowDialog, ui, pdfFiles, currentFile, enteringMode, setEnteringMode } = useStore();
  const { yashovchiSoniInput, setYashovchiSoniInput, aktType, setAktType, abonentData, recalculationPeriods } =
    useRecalculatorStore();

  const manualActDocumentTypes = documentTypes.filter((dt) => dt !== 'pul_kuchirish' && dt !== 'dvaynik');
  manualActDocumentTypes.push('cancelContract');

  const {
    handleClickRefreshButton,
    handleDeleteButtonClick,
    handlePrimaryButtonClick,
    handleTabChange,
    tabIndex,
    arizaNumberInput,
    setArizaNumberInput,
    setShowSpoiler,
    showSpoiler,
    rowAfterAkt,
    aktSumm,
    setAktSumm,
    setManualEditing,
    rows,
    manualAccountNumber,
    setManualAccountNumber,
    loadAbonentByAccountForManual,
    photos,
    setPhotos
  } = useFindedTableLogic();
  const { isLoading } = useLoaderStore();
  const { pdfFileLoading } = useUiStore();

  // Adjustment calculation via custom hook
  const residentId = ariza?.abonentId || abonentData?.id;
  const nextInhabitantCount =
    enteringMode === 'manual'
      ? Number(yashovchiSoniInput || 0)
      : Number(ariza?.next_prescribed_cnt ?? rows[0]?.yashovchilar_soni ?? 0);
  const actAmount = parseAktSumExpression(aktSumm);

  const adjustmentData = useAdjustmentCalculation({
    arizaId: ariza?._id,
    residentId,
    nextInhabitantCount,
    actAmount
  });

  useEffect(() => {
    if (enteringMode === 'manual') {
      setAktSumm(recalculationPeriods.reduce((a, b) => a + b.total, 0).toString());
    }
  }, [recalculationPeriods, enteringMode, setAktSumm]);

  const [aktSumEditing, setAktSumEditing] = useState(false);
  const [inhabitantCountEditing, setInhabitantCountEditing] = useState(false);
  const [openPasteImageDialog, setOpenPasteImageDialog] = useState(false);

  const handleAddPhoto = async (photo: File) => {
    const formData = new FormData();
    formData.append('file', photo);
    const document_id = (
      await api.post('/fetchTelegram/create-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    ).data.document_id;
    setPhotos([...photos, document_id]);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: '№', width: 10 },
    { field: 'davr', headerName: t('tableHeaders.period') },
    { field: 'saldo_n', headerName: t('tableHeaders.nSaldo'), type: 'number' },
    { field: 'nachis', headerName: t('tableHeaders.nachis'), type: 'number' },
    { field: 'allPaymentsSum', headerName: t('tableHeaders.allPaymentsSum'), type: 'number' },
    { field: 'saldo_k', headerName: t('tableHeaders.kSaldo'), type: 'number', flex: 1 },
    { field: 'akt', headerName: t('tableHeaders.act'), type: 'number' },
    { field: 'yashovchilar_soni', headerName: t('tableHeaders.inhabitantCount'), type: 'number', width: 10 }
  ];

  if (pdfFiles.length === 0) {
    return null;
  }

  let page: ReactNode = null;

  if (!currentFile?.blob) {
    page = <NoFileSelectedState />;
  } else if (currentFile && !ariza && !pdfFileLoading) {
    page = (
      <DocumentNotFoundState
        arizaNumberInput={arizaNumberInput}
        setArizaNumberInput={setArizaNumberInput}
        handleClickRefreshButton={handleClickRefreshButton}
        isLoading={isLoading}
        ui={ui}
        setManualEditing={setManualEditing}
        setEnteringMode={setEnteringMode}
      />
    );
  } else if (enteringMode === 'manual') {
    page = (
      <ManualEntryMode
        ariza={ariza}
        setAriza={setAriza}
        abonentData={abonentData}
        yashovchiSoniInput={yashovchiSoniInput}
        setYashovchiSoniInput={setYashovchiSoniInput}
        aktSumm={aktSumm}
        setAktSumm={setAktSumm}
        rows={rows}
        manualAccountNumber={manualAccountNumber}
        setManualAccountNumber={setManualAccountNumber}
        loadAbonentByAccountForManual={loadAbonentByAccountForManual}
        aktType={aktType}
        setAktType={setAktType}
        photos={photos}
        handlePrimaryButtonClick={handlePrimaryButtonClick}
        handleDeleteButtonClick={handleDeleteButtonClick}
        setOpenPasteImageDialog={setOpenPasteImageDialog}
        adjustmentData={adjustmentData}
        isLoading={isLoading}
        manualActDocumentTypes={manualActDocumentTypes}
        enteringMode={enteringMode}
      />
    );
  } else if (enteringMode === 'ariza' && ariza) {
    page = (
      <ArizaMode
        ariza={ariza}
        setAriza={setAriza}
        rows={rows}
        aktSumm={aktSumm}
        setAktSumm={setAktSumm}
        aktSumEditing={aktSumEditing}
        setAktSumEditing={setAktSumEditing}
        inhabitantCountEditing={inhabitantCountEditing}
        setInhabitantCountEditing={setInhabitantCountEditing}
        adjustmentData={adjustmentData}
        tabIndex={tabIndex}
        handleTabChange={handleTabChange}
        showSpoiler={showSpoiler}
        setShowSpoiler={setShowSpoiler}
        rowAfterAkt={rowAfterAkt}
        columns={columns}
        isLoading={isLoading}
        handlePrimaryButtonClick={handlePrimaryButtonClick}
        handleDeleteButtonClick={handleDeleteButtonClick}
        setShowDialog={setShowDialog}
      />
    );
  }

  return (
    <>
      <PasteImageDialog
        key="paste-image-dialog"
        open={openPasteImageDialog}
        onClose={() => setOpenPasteImageDialog(false)}
        onAddButtonClick={handleAddPhoto}
      />
      <AnimatePresence>
        {page && (
          <Box key="content-box" sx={{ display: 'flex', flexDirection: 'column' }}>
            {page}
          </Box>
        )}
      </AnimatePresence>
    </>
  );
}

export default FindedDataTable;
