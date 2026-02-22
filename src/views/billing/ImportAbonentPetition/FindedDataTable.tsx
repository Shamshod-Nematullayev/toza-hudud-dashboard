import { Box, Button, Grid, IconButton, Tab, Tabs, TextField, Tooltip, Typography, useTheme } from '@mui/material';
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
import { useArizaData } from 'hooks/useArizaData';
import { CompactKeyValue } from 'ui-component/CompactKeyValue';

interface IRow {
  id: number;
  davr: string;
  saldo_n: number;
  nachis: number;
  saldo_k: number;
  akt: number;
  yashovchilar_soni: number;
  allPaymentsSum: number;
}

function FindedDataTable() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { currentFile, removePdfFile, setCurrentFile, ariza, setAriza, setShowDialog } = useStore();
  const [arizaNumberInput, setArizaNumberInput] = useState('');
  const [arizalarRows, setArizalarRows] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(true);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [aktSumm, setAktSumm] = useState('0');

  const [isUploading, setIsUploading] = useState(false);
  const { setIsLoading } = useLoaderStore();
  const { refetch: refetchTariffs, currentTariff, loading: tariffsLoading } = useTariff();
  const { rows, rowsDublicate, allPaymentsSumOnDublicate, loading: arizaLoading } = useArizaData(ariza);
  const [rowAfterAkt, setRowAfterAkt] = useState<IRow | null>(null);

  useEffect(() => {
    if (tariffsLoading) {
      setIsLoading(true);
      setInputDisabled(true);
    } else {
      setInputDisabled(false);
      setIsLoading(false);
    }
  }, [tariffsLoading, arizaLoading]);

  useEffect(() => {
    if (!currentTariff) {
      refetchTariffs();
      return;
    }
    if (showSpoiler && ariza) {
      const yashovchilar_soni = isNaN(ariza.next_prescribed_cnt) ? rows[0].yashovchilar_soni : ariza.next_prescribed_cnt;
      const nachis = isNaN(yashovchilar_soni) ? rows[0].nachis : currentTariff?.hisoblandi * yashovchilar_soni;
      setRowAfterAkt({
        id: 1,
        davr: rows[0].davr,
        saldo_n: rows[0].saldo_n,
        nachis,
        saldo_k: rows[0].saldo_n + nachis - rows[0].akt - rows[0].allPaymentsSum - eval(aktSumm),
        akt: rows[0].akt + eval(aktSumm),
        yashovchilar_soni: yashovchilar_soni,
        allPaymentsSum: rows[0].allPaymentsSum
      });
    } else {
      setRowAfterAkt(rows[0]);
    }
  }, [showSpoiler, rows]);

  useEffect(() => {
    if (ariza?.document_type === 'dvaynik') {
      setAktSumm(allPaymentsSumOnDublicate.toString() || '0');
    } else {
      setAktSumm(ariza?.aktSummCounts.total.toString() || '0');
    }
  }, [ariza]);

  const btnRef = useRef(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleClickRefreshButton();
  };
  const handleClickRefreshButton = async () => {
    try {
      const { data } = await api.get('/arizalar/', {
        params: {
          document_number: arizaNumberInput
        }
      });
      if (!data.ok) {
        return toast.error(data.message);
      }
      if (data.data.length === 0) {
        return toast.error('Bunday tartib raqamga ega ariza topilmadi');
      }
      if (data.data.length === 1) {
        setAriza(data.data[0]);
      } else {
        setArizalarRows(data.data);
        setShowArizaChooseDialog(true);
      }
    } catch (err) {
      console.log(err);
      toast.error("Serverga so'rov yuborilmadi");
    } finally {
      setIsUploading(false);
    }
  };
  const handlePrimaryButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      setIsUploading(true);
      if (!currentFile?.url) {
        toast.error('Fayl tanlanmadi');
        return;
      }
      if (!ariza) {
        toast.error('Ariza tanlanmadi');
        return;
      }
      const formData = new FormData();
      formData.append('file', currentFile.blob, currentFile.file.name);
      formData.append('document_type', ariza.document_type);
      formData.append('ariza_id', ariza._id);
      formData.append('licshet', ariza.licshet);
      formData.append('residentId', ariza.abonentId.toString());
      formData.append(
        'next_inhabitant_count',
        (ariza.next_prescribed_cnt === null ? rows[0].yashovchilar_soni : ariza.next_prescribed_cnt).toString()
      );
      formData.append('akt_sum', Math.floor(eval(aktSumm)).toString());
      formData.append('amountWithoutQQS', (Math.floor(ariza.aktSummCounts?.withoutQQSTotal) || 0).toString());
      formData.append('description', ariza.comment.length < 150 ? 'fuqaro arizasi ' + ariza.comment : 'fuqaro arizasi');
      ariza.photos?.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo);
      });

      const url = ariza.document_type === 'dvaynik' ? '/billing/create-dvaynik-akt-by-ariza' : '/billing/create-full-akt';
      const { data } = await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (!data.ok) {
        toast.error(data.message);
        return;
      }
      handleDeleteButtonClick();
      toast.success(data.message);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err ?? "Noma'lum xatolik");
      console.error(message);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };
  const handleDeleteButtonClick = async () => {
    if (!currentFile?.url) {
      toast.error('Fayl tanlanmadi');
      return;
    }
    removePdfFile(currentFile.file.name);
    setCurrentFile('');
    setAriza(null);
    setArizaNumberInput('0');
    setAktSumm('');
  };
  const [showArizaChooseDialog, setShowArizaChooseDialog] = useState(false);
  const handleCloseChooseArizaModal = () => setShowArizaChooseDialog(false);

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: any, newValue: number) => setTabIndex(newValue);

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
    <div>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        sx={{
          p: 2,
          borderRadius: 3,
          backgroundColor: 'background.paper',
          boxShadow: 2
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
            sx={{ width: 220 }}
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
        <Box display="flex" alignItems="center" gap={1.5}>
          <Button
            variant="contained"
            startIcon={<FileUploadOutlinedIcon />}
            disabled={!((ariza?.status === 'yangi' || ariza?.status === 'qabul qilindi') && !isUploading)}
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
        </Box>

        {/* RIGHT SECTION */}
        <IconButton onClick={() => setShowSpoiler(!showSpoiler)} disabled={!ariza || !rows.length}>
          {showSpoiler ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      </Box>
      <div>
        <CompactKeyValue
          data={[
            {
              key: t('tableHeaders.accountNumber'),
              value: ariza?.document_type === 'dvaynik' ? `${ariza?.licshet} : ${ariza?.ikkilamchi_licshet}` : ariza?.licshet || ''
            },
            { key: t('tableHeaders.fullName'), value: ariza?.fio || '' },
            { key: t('tableHeaders.inhabitantCount'), value: ariza?.next_prescribed_cnt || '' },
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
      </div>
      <Tabs value={tabIndex} onChange={handleTabChange}>
        <Tab label="Asosiy jadval" />
        {ariza?.document_type === 'dvaynik' && (
          <Tooltip title="Ikkilamchi hisob raqam jadvali">
            <Tab label="Qo'shimcha jadval" />
          </Tooltip>
        )}
      </Tabs>

      {/* Tab Panels */}
      {tabIndex === 0 && (
        <Box sx={{ mt: 2, height: '400px' }} className="scrollbar-container">
          <DataGrid
            columns={columns}
            disableColumnFilter
            disableColumnSorting
            hideFooter
            rows={showSpoiler ? [rowAfterAkt as IRow, ...rows.slice(1)] : rows}
            style={{ margin: '0 auto', height: '60vh' }}
          />
        </Box>
      )}
      {tabIndex === 1 && (
        <Box sx={{ mt: 2, height: '400px' }} className="scrollbar-container">
          <DataGrid
            columns={columns}
            disableColumnFilter
            disableColumnSorting
            hideFooter
            rows={showSpoiler ? [rowAfterAkt as IRow, ...rowsDublicate.slice(1)] : rowsDublicate}
            style={{ margin: '0 auto', height: '60vh' }}
          />
        </Box>
      )}
    </div>
  );
}

export default FindedDataTable;
