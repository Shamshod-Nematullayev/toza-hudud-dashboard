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

function KeyValue({ kalit, value }: { kalit: string; value: string | number }) {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', margin: '20px 0 0 0', borderBottom: '1px solid #ccc' }}
    >
      <Typography variant="subtitle1" className="key">
        <div>{kalit}:</div>
      </Typography>
      <Typography className="value">{value}</Typography>
    </div>
  );
}

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
  const { rows, loading: arizaLoading } = useArizaData(ariza);
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
  }, [showSpoiler, rows, ariza, aktSumm]);
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
      <Grid container spacing={0.5}>
        <Grid item xs={1}>
          <div>
            <form onSubmit={handleSubmit}>
              <IconButton aria-describedby={'transition-popper'} ref={btnRef} sx={{ padding: '15px' }} onClick={handleClickRefreshButton}>
                <RefreshOutlinedIcon />
              </IconButton>
              <ChooseArizaPopper
                anchorEl={btnRef.current}
                open={showArizaChooseDialog}
                handleClose={handleCloseChooseArizaModal}
                rows={arizalarRows}
                setAriza={setAriza}
              />
            </form>
          </div>
        </Grid>
        <Grid item xs={1.5}>
          <Tooltip title={t('documentNumber')}>
            <TextField
              disabled={inputDisabled}
              variant="outlined"
              name="licshet_input"
              placeholder={t('documentNumber')}
              value={arizaNumberInput}
              onChange={(e) => setArizaNumberInput(e.target.value)}
            />
          </Tooltip>
        </Grid>
        <Grid item xs={2}>
          <Button
            sx={{ padding: '12px 15px' }}
            onClick={handlePrimaryButtonClick}
            variant="contained"
            disabled={(ariza?.status === 'yangi' || ariza?.status === 'qabul qilindi') && !isUploading ? false : true}
          >
            <FileUploadOutlinedIcon />
            {t('buttons.submitEntry')}
          </Button>
        </Grid>
        <Grid item xs={2.5}>
          <Button sx={{ padding: '12px 0', color: 'secondary.main' }} onClick={handleDeleteButtonClick}>
            <DeleteOutlinedIcon />
            {t('buttons.remove')}
          </Button>
        </Grid>
        <Grid item xs={2.5}>
          <Button
            sx={{ padding: '12px 15px', color: 'error.main' }}
            onClick={() => setShowDialog(true)}
            disabled={ariza?.status === 'yangi' ? false && isUploading : true}
          >
            <Cancel />
            {t('buttons.cancel')}
          </Button>
        </Grid>
        <Grid item xs={2}>
          <IconButton sx={{ padding: '15px' }} onClick={() => setShowSpoiler(!showSpoiler)} disabled={!ariza || !rows.length}>
            {showSpoiler ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </Grid>
      </Grid>
      <div>
        {/* <div
          style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', margin: '20px 0', borderBottom: '1px solid #ccc' }}
        >
          <Typography variant="subtitle1" className="key">
            <div>{t('createAbonentPetitionPage.actAmount')}:</div>
          </Typography>
          <Typography className="value">
            <input
              type="text"
              style={{ background: 'none', outline: 'none', border: 'none', color: theme.colors.darkTextPrimary, textAlign: 'right' }}
              value={aktSumm}
              onChange={(e) => setAktSumm(e.target.value)}
            />
          </Typography>
        </div> */}
        <CompactKeyValue
          data={[
            { key: t('tableHeaders.accountNumber'), value: ariza?.licshet || '' },
            { key: t('tableHeaders.fullName'), value: ariza?.fio || '' },
            { key: t('tableHeaders.inhabitantCount'), value: ariza?.next_prescribed_cnt || '' },
            { key: t('tableHeaders.createdDate'), value: ariza?.sana ? new Date(ariza.sana).toLocaleDateString() : '' },
            { key: t('tableHeaders.status'), value: ariza?.status || '' },
            { key: t('createAbonentPetitionPage.actAmount'), value: aktSumm }
          ]}
        />
      </div>
      <Tabs value={tabIndex} onChange={handleTabChange}>
        <Tab label="Asosiy jadval" />
        <Tooltip title="Ikkilamchi hisob raqam jadvali">
          <Tab label="Qo'shimcha jadval" />
        </Tooltip>
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
            rows={showSpoiler ? [rowAfterAkt as IRow, ...rows.slice(1)] : rows}
            style={{ margin: '0 auto', height: '60vh' }}
          />
        </Box>
      )}
    </div>
  );
}

export default FindedDataTable;
