import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import useStore from './useStore';
import api from 'utils/api';
import FileUploadOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import Visibility from '@mui/icons-material/VisibilityOutlined';
import VisibilityOff from '@mui/icons-material/VisibilityOffOutlined';
import useLoaderStore from 'store/loaderStore';
import Cancel from '@mui/icons-material/CancelOutlined';
import ChooseArizaPopper from './ChooseArizaPopper';
import { useTranslation } from 'react-i18next';
import { useTariff } from 'hooks/useTariff';
import { documentTypes } from 'store/constant';
import { useStore as useRecalculatorStore } from '../CreateAbonentPetition.jsx/useStore';
import { IAriza } from 'types/models';
import { CompactKeyValue } from 'ui-component/CompactKeyValue';
import { Keyboard } from '@mui/icons-material';
import RecalculateForm from '../CreateAbonentPetition.jsx/CreateArizaStepper/RecalculateForm';
import RecalculatorAbonent from 'ui-component/cards/RecalculatorAbonent';
import { hasValidAriza, IRow, useFindedTableLogic } from './useFindedTableLogic';
import { AnimatePresence, motion } from 'framer-motion';
import AccountNumberInput from 'ui-component/AccountNumberInput';

function FindedDataTable() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { ariza, setAriza, setShowDialog } = useStore();
  const { yashovchiSoniInput, setYashovchiSoniInput, aktType, setAktType, abonentData } = useRecalculatorStore();

  const manualActDocumentTypes = documentTypes.filter((dt) => dt !== 'pul_kuchirish' && dt !== 'dvaynik');

  const {
    handleClickRefreshButton,
    handleCloseChooseArizaModal,
    handleDeleteButtonClick,
    handlePrimaryButtonClick,
    handleTabChange,
    showArizaChooseDialog,
    tabIndex,
    inputDisabled,
    arizaNumberInput,
    setArizaNumberInput,
    arizalarRows,
    isUploading,
    setShowSpoiler,
    showSpoiler,
    rowAfterAkt,
    aktSumm,
    setAktSumm,
    manualEditing,
    setManualEditing,
    rows,
    rowsDublicate,
    manualAccountNumber,
    setManualAccountNumber,
    loadAbonentByAccountForManual
  } = useFindedTableLogic();

  const btnRef = useRef(null);

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

  return (
    <AnimatePresence>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)' }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          sx={{
            p: 2,
            borderRadius: 3,
            backgroundColor: 'background.paper',
            boxShadow: 2,
            flex: 0
          }}
        >
          {/* LEFT SECTION */}
          <Box display="flex" alignItems="center" gap={1.5}>
            <IconButton ref={btnRef} onClick={handleClickRefreshButton}>
              <RefreshOutlinedIcon />
            </IconButton>

            <TextField
              size="small"
              disabled={inputDisabled}
              name="licshet_input"
              placeholder={t('documentNumber')}
              value={arizaNumberInput}
              onChange={(e) => setArizaNumberInput(e.target.value)}
              sx={{ maxWidth: 100 }}
            />
            <ChooseArizaPopper
              anchorEl={btnRef.current}
              open={showArizaChooseDialog}
              handleClose={handleCloseChooseArizaModal}
              rows={arizalarRows}
              setAriza={setAriza}
            />
          </Box>

          {/* CENTER SECTION */}
          <Box display="flex" alignItems="center" gap={1.5} sx={{ textWrap: 'nowrap' }}>
            <Button
              variant="contained"
              startIcon={<FileUploadOutlinedIcon />}
              disabled={!((ariza?.status === 'yangi' || ariza?.status === 'qabul qilindi') && !isUploading) && !manualEditing}
              onClick={handlePrimaryButtonClick}
              sx={{ px: 3 }}
            >
              {t('buttons.submitEntry')}
            </Button>

            <Button variant="outlined" color="secondary" startIcon={<DeleteOutlinedIcon />} onClick={handleDeleteButtonClick}>
              {t('buttons.remove')}
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => setShowDialog(true)}
              disabled={ariza?.status !== 'yangi' || isUploading}
            >
              {t('buttons.cancel')}
            </Button>
            <Button startIcon={<Keyboard />} variant="outlined" color="secondary" onClick={() => setManualEditing(!manualEditing)}>
              {t('buttons.manualEntry')}
            </Button>
          </Box>

          {/* RIGHT SECTION */}
          <IconButton onClick={() => setShowSpoiler(!showSpoiler)} disabled={!rows.length}>
            {showSpoiler ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </Box>
        <Box sx={{ flex: 0, mt: 2 }}>
          <CompactKeyValue
            data={[
              {
                key: t('tableHeaders.accountNumber'),
                value: hasValidAriza(ariza as IAriza | null)
                  ? ariza?.document_type === 'dvaynik'
                    ? `${ariza?.licshet} : ${ariza?.ikkilamchi_licshet}`
                    : ariza?.licshet || ''
                  : abonentData?.accountNumber || '—'
              },
              {
                key: t('tableHeaders.fullName'),
                value: hasValidAriza(ariza as IAriza | null) ? ariza?.fio || '' : abonentData?.fullName || '—'
              },
              {
                key: t('tableHeaders.inhabitantCount'),
                value: (
                  <input
                    type="number"
                    min={1}
                    style={{
                      background: 'none',
                      outline: 'none',
                      border: 'none',
                      color: theme.colors.darkTextPrimary,
                      textAlign: 'right',
                      maxWidth: '100px'
                    }}
                    value={
                      hasValidAriza(ariza as IAriza | null)
                        ? String((ariza as IAriza).next_prescribed_cnt ?? rows[0]?.yashovchilar_soni ?? '')
                        : yashovchiSoniInput
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (hasValidAriza(ariza as IAriza | null)) {
                        setAriza({ ...(ariza as IAriza), next_prescribed_cnt: v === '' ? (null as any) : Number(v) });
                      } else {
                        setYashovchiSoniInput(v);
                      }
                    }}
                  />
                )
              },
              { key: t('tableHeaders.createdDate'), value: ariza?.sana ? new Date(ariza.sana).toLocaleDateString() : '' },
              { key: t('tableHeaders.status'), value: ariza?.status || '' },
              {
                key: t('createAbonentPetitionPage.actAmount'),
                value: (
                  <input
                    type="text"
                    style={{
                      background: 'none',
                      outline: 'none',
                      border: 'none',
                      color: theme.colors.darkTextPrimary,
                      textAlign: 'right',
                      maxWidth: '100px'
                    }}
                    value={aktSumm}
                    onChange={(e) => setAktSumm(e.target.value)}
                  />
                )
              }
            ]}
          />
        </Box>

        {manualEditing && !hasValidAriza(ariza as IAriza | null) && (
          <motion.div
            style={{ flex: 1 }}
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                maxHeight: 300,
                overflow: 'auto'
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} flexWrap="wrap">
                <AccountNumberInput
                  size="small"
                  label={t('tableHeaders.accountNumber')}
                  value={manualAccountNumber}
                  setFunc={setManualAccountNumber}
                  sx={{ minWidth: 160 }}
                />
                <Button variant="contained" color="secondary" onClick={() => void loadAbonentByAccountForManual()}>
                  Yuklash
                </Button>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel id="manual-akt-type">{t('tableHeaders.documentType')}</InputLabel>
                  <Select
                    labelId="manual-akt-type"
                    label={t('tableHeaders.documentType')}
                    value={aktType ?? ''}
                    displayEmpty
                    onChange={(e) => setAktType((e.target.value || null) as typeof aktType)}
                    renderValue={(v) => (v ? (t as (k: string) => string)(`documentTypes.${v}`) : 'Akt turini tanlang')}
                  >
                    <MenuItem value="">
                      <em>Tanlanmagan</em>
                    </MenuItem>
                    {manualActDocumentTypes.map((dt) => (
                      <MenuItem key={dt} value={dt}>
                        {(t as (k: string) => string)(`documentTypes.${dt}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {abonentData?.fullName ? (
                  <Typography variant="body2" color="text.secondary">
                    {abonentData.fullName} (ID: {abonentData.id})
                  </Typography>
                ) : null}
              </Stack>
              <RecalculatorAbonent />
            </Box>
          </motion.div>
        )}

        <Tabs value={tabIndex} onChange={handleTabChange} sx={{ flex: 0 }}>
          <Tab label="Asosiy jadval" />
          {ariza?.document_type === 'dvaynik' && (
            <Tooltip title="Ikkilamchi hisob raqam jadvali">
              <Tab label="Qo'shimcha jadval" />
            </Tooltip>
          )}
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ mt: 2, height: '200px', flex: 1 }}>
          {tabIndex === 0 && (
            <DataGrid
              columns={columns}
              disableColumnFilter
              disableColumnSorting
              hideFooter
              rows={showSpoiler ? [rowAfterAkt as IRow, ...rows.slice(1)] : rows}
              style={{ margin: '0 auto', height: '100%' }}
            />
          )}
          {tabIndex === 1 && (
            <DataGrid
              columns={columns}
              disableColumnFilter
              disableColumnSorting
              hideFooter
              rows={showSpoiler ? [rowAfterAkt as IRow, ...rowsDublicate.slice(1)] : rowsDublicate}
              style={{ margin: '0 auto', height: '100%' }}
            />
          )}
        </Box>
      </Box>
    </AnimatePresence>
  );
}

export default FindedDataTable;
