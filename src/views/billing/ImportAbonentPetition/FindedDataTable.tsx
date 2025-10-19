import { Button, Grid, IconButton, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
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
import { AxiosResponse } from 'axios';
import { ITariff } from 'types/billing';
import { getTariffs } from 'services/getTariffs';
import { useTranslation } from 'react-i18next';

function KeyValue({ kalit, value }: { kalit: string; value: string }) {
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
const counterDiffMonth = function (initialDate: Date): number {
  const currentDate = new Date();
  const yearDiff = currentDate.getFullYear() - initialDate.getFullYear();
  const monthDiff = currentDate.getMonth() - initialDate.getMonth();
  return yearDiff * 12 + monthDiff;
};

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
  const { currentFile, removePdfFile, setCurrentFile, ariza, setAriza, setShowDialog } = useStore();
  const [rows, setRows] = useState<IRow[]>([]);
  const [arizaNumberInput, setArizaNumberInput] = useState('');
  const [arizalarRows, setArizalarRows] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(true);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [aktSumm, setAktSumm] = useState('');
  const [rowAfterAkt, setRowAfterAkt] = useState<IRow | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { setIsLoading } = useLoaderStore();
  const [anchorEl] = useState(null);
  const [currentTarif, setCurrentTarif] = useState<ITariff>(null);

  const theme = useTheme();

  useEffect(() => {
    const now = new Date();
    async function asyncFunc() {
      const tariffs = await getTariffs();
      setCurrentTarif(tariffs.find((t) => t.month == now.getMonth() + 1 && t.year == now.getFullYear()));
    }
    asyncFunc();
  }, []);

  useEffect(() => {
    setAktSumm('0');
    if (!ariza.licshet) return setInputDisabled(false);
    api
      .get('/billing/get-abonent-dxj-by-id', { params: { residentId: ariza.abonentId } })

      .catch((err) => {
        toast.error(err.message);
      })
      .then((response: AxiosResponse<any, any>) => {
        const data = response.data;
        if (!data.ok) {
          toast.error(data.message || 'Xatolik kuzatildi');
          return;
        }
        setShowSpoiler(false);
        setRows(
          data.rows.map((row, i) => ({
            id: i + 1,
            davr: row.period,
            saldo_n: row.nSaldo,
            nachis: row.accrual,
            saldo_k: row.kSaldo,
            akt: row.actAmount,
            yashovchilar_soni: row.inhabitantCount,
            allPaymentsSum: row.allPaymentsSum
          }))
        );
        setRowAfterAkt(
          data.rows.map((row, i) => ({
            id: i + 1,
            davr: row.period,
            saldo_n: row.nSaldo,
            nachis: row.accrual,
            saldo_k: row.kSaldo,
            akt: row.actAmount,
            yashovchilar_soni: row.inhabitantCount,
            allPaymentsSum: row.allPaymentsSum
          }))[0]
        );
      });
    const diffMonth = counterDiffMonth(new Date(ariza.sana));
    const lateAktSumm =
      (isNaN(ariza.next_prescribed_cnt - ariza.current_prescribed_cnt) ? 0 : ariza.current_prescribed_cnt - ariza.next_prescribed_cnt) *
      currentTarif.hisoblandi *
      diffMonth;
    if (ariza.document_type == 'dvaynik') {
      api.get('/billing/get-abonent-data-by-licshet/' + ariza.ikkilamchi_licshet).then(({ data }) => {
        api.get('/billing/get-abonent-dxj-by-id', { params: { residentId: data.abonentData.id } }).then(({ data }) => {
          let summ = 0;
          data.rows.forEach((item) => (summ += item.allPaymentsSum));
          setAktSumm(summ.toString());
        });
      });
    } else if (lateAktSumm !== 0 && ariza.document_type != 'viza') {
      setAktSumm(ariza.aktSummasi + '+' + lateAktSumm);
    } else {
      setAktSumm(ariza.aktSummasi);
    }
    if (ariza.isScanedFromQR) {
      setArizaNumberInput(ariza.document_number);
      setInputDisabled(true);
    } else setInputDisabled(false);

    if (!currentFile?.url) {
      setInputDisabled(true);
    }
  }, [ariza]);

  useEffect(() => {
    const joriyTarif = 8000;
    if (showSpoiler) {
      const yashovchilar_soni = isNaN(ariza.next_prescribed_cnt) ? rowAfterAkt.yashovchilar_soni : ariza.next_prescribed_cnt;
      const nachis = isNaN(yashovchilar_soni) ? rowAfterAkt.nachis : joriyTarif * yashovchilar_soni;
      setRowAfterAkt({
        id: 1,
        davr: rowAfterAkt.davr,
        saldo_n: rowAfterAkt.saldo_n,
        nachis,
        saldo_k: rowAfterAkt.saldo_n + nachis - rowAfterAkt.allPaymentsSum - eval(aktSumm),
        akt: rowAfterAkt.akt + eval(aktSumm),
        yashovchilar_soni: yashovchilar_soni,
        allPaymentsSum: rowAfterAkt.allPaymentsSum
      });
    } else {
      setRowAfterAkt(rows[0]);
    }
  }, [showSpoiler]);
  const btnRef = useRef(null);

  const handleSubmit = (e) => {
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
      if (ariza.length === 1) {
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
  const handlePrimaryButtonClick = async (e) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      setIsUploading(true);
      if (!currentFile?.url) {
        toast.error('Fayl tanlanmadi');
        return;
      }
      const formData = new FormData();
      formData.append('file', currentFile.blob, currentFile.file.name);
      formData.append('document_type', ariza.document_type);
      formData.append('ariza_id', ariza._id);
      formData.append('licshet', ariza.licshet);
      formData.append('next_inhabitant_count', ariza.next_prescribed_cnt === null ? rows[0].yashovchilar_soni : ariza.next_prescribed_cnt);
      formData.append('akt_sum', eval(aktSumm));
      formData.append('amountWithoutQQS', (Math.round(ariza.aktSummCounts?.withoutQQSTotal) || 0).toString());
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
      removePdfFile(currentFile.file.name);
      setCurrentFile({});
      setAriza({});
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
    setCurrentFile({});
    setAriza({});
    setArizaNumberInput('');
    setRows([]);
    setAktSumm('');
  };
  const [showArizaChooseDialog, setShowArizaChooseDialog] = useState(false);
  const handleCloseChooseArizaModal = () => setShowArizaChooseDialog(false);
  const canBeOpen = showArizaChooseDialog && Boolean(anchorEl);
  const id = canBeOpen ? 'transition-popper' : undefined;
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

          {/* <Popper
            id={id}
            open={showArizaChooseDialog}
            anchorEl={btnRef.current}
            placement="top-start"
            style={{ zIndex: 1300 }}
            transition
            modifiers={{
              preventOverflow: {
                enabled: true,
                escapeWithReference: true,
                boundariesElement: 'viewport'
              }
            }}
            // disablePortal
          >
            <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>The content of the Popper.</Box>
          </Popper> */}
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
            disabled={(ariza.status === 'yangi' || ariza.status === 'qabul qilindi') && !isUploading ? false : true}
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
            disabled={ariza.status === 'yangi' ? false && isUploading : true}
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
        <div
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
        </div>
        <KeyValue kalit={t('tableHeaders.accountNumber')} value={ariza.licshet} />
        <KeyValue kalit={t('tableHeaders.fullName')} value={ariza.fio} />
        <KeyValue kalit={t('tableHeaders.inhabitantCount')} value={ariza.next_prescribed_cnt} />
        <KeyValue kalit={t('tableHeaders.createdDate')} value={new Date(ariza.sana)?.toLocaleDateString()} />
        <KeyValue kalit={t('tableHeaders.status')} value={ariza.status} />
      </div>
      <DataGrid
        columns={[
          { field: 'id', headerName: '№', width: 10 },
          { field: 'davr', headerName: t('tableHeaders.period') },
          { field: 'saldo_n', headerName: t('tableHeaders.nSaldo'), type: 'number' },
          { field: 'nachis', headerName: t('tableHeaders.nachis'), type: 'number' },
          { field: 'allPaymentsSum', headerName: t('tableHeaders.allPaymentsSum'), type: 'number' },
          { field: 'saldo_k', headerName: t('tableHeaders.kSaldo'), type: 'number' },
          { field: 'akt', headerName: t('tableHeaders.act'), type: 'number' },
          { field: 'yashovchilar_soni', headerName: t('tableHeaders.inhabitantCount'), type: 'number', width: 10 }
        ]}
        disableColumnFilter
        disableColumnSorting
        hideFooter
        rows={rows.length > 0 ? [rowAfterAkt, ...rows.slice(1)] : []}
        style={{ margin: '0 auto', height: '40vh' }}
      />
    </div>
  );
}

export default FindedDataTable;
