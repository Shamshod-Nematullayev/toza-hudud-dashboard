import { Button, FormControl, Grid, IconButton, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
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

function KeyValue({ kalit, value }) {
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
const counterDiffMonth = function (initialDate) {
  const currentDate = new Date();
  const yearDiff = currentDate.getFullYear() - initialDate.getFullYear();
  const monthDiff = currentDate.getMonth() - initialDate.getMonth();
  return yearDiff * 12 + monthDiff;
};

function FindedDataTable() {
  const { currentFile, removePdfFile, setCurrentFile, ariza, setAriza, setShowDialog } = useStore();
  const [rows, setRows] = useState([]);
  const [arizaNumberInput, setArizaNumberInput] = useState('');
  const [inputDisabled, setInputDisabled] = useState(true);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [aktSumm, setAktSumm] = useState('');
  const [rowAfterAkt, setRowAfterAkt] = useState();
  const [isUploading, setIsUploading] = useState(false);
  const { setIsLoading } = useLoaderStore();

  const theme = useTheme();

  useEffect(() => {
    if (!ariza.licshet) return setInputDisabled(false);
    api
      .get('/billing/get-abonent-dxj-by-licshet/' + ariza.licshet)

      .catch((err) => {
        toast.error(err.message);
      })
      .then(({ data }) => {
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
      4624 *
      diffMonth;
    if (ariza.document_type == 'dvaynik') {
      api.get('/billing/get-abonent-dxj-by-licshet/' + ariza.ikkilamchi_licshet).then(({ data }) => {
        let summ = 0;
        data.rows.forEach((item) => (summ += item.allPaymentsSum));
        setAktSumm(summ);
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
    const joriyTarif = 4624;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };
  const handleClickRefreshButton = async (e) => {
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
      setAriza(data.data[0]);
      setIsUploading(false);
    } catch (err) {
      console.log(err);
      toast.error("Serverga so'rov yuborilmadi");
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
      formData.append('next_inhabitant_count', ariza.next_prescribed_cnt);
      formData.append('akt_sum', eval(aktSumm));
      formData.append('amountWithoutQQS', ariza.aktSummCounts?.withoutQQSTotal || 0);
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
      console.error(err.message);
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
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Grid container>
          <Grid item xs={1}>
            <IconButton sx={{ padding: '15px' }} onClick={handleClickRefreshButton}>
              <RefreshOutlinedIcon />
            </IconButton>
          </Grid>
          <Grid item xs={1.5}>
            <TextField
              disabled={inputDisabled}
              variant="outlined"
              name="licshet_input"
              placeholder="Ariza raqami"
              value={arizaNumberInput}
              onChange={(e) => setArizaNumberInput(e.target.value)}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              sx={{ margin: 'auto 15px', padding: '12px 15px' }}
              onClick={handlePrimaryButtonClick}
              variant="contained"
              disabled={(ariza.status === 'yangi' || ariza.status === 'qabul qilindi') && !isUploading ? false : true}
            >
              <FileUploadOutlinedIcon />
              kiritish
            </Button>
          </Grid>
          <Grid item xs={2.5}>
            <Button sx={{ padding: '12px 15px', color: 'secondary.main' }} onClick={handleDeleteButtonClick}>
              <DeleteOutlinedIcon />
              tashlab ketish
            </Button>
          </Grid>
          <Grid item xs={2.5}>
            <Button
              sx={{ padding: '12px 15px', color: 'error.main' }}
              onClick={() => setShowDialog(true)}
              disabled={ariza.status === 'yangi' ? false && isUploading : true}
            >
              <Cancel />
              bekor qilish
            </Button>
          </Grid>
          <Grid item xs={2}>
            <Tooltip title={showSpoiler ? "Akt bo'lmasidan oldingi holat" : "Aktdan keyingi holatni ko'rish"}>
              <IconButton sx={{ padding: '15px' }} onClick={() => setShowSpoiler(!showSpoiler)} disabled={!ariza || !rows.length}>
                {showSpoiler ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </form>
      <div>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', margin: '20px 0', borderBottom: '1px solid #ccc' }}
        >
          <Typography variant="subtitle1" className="key">
            <div>Akt summasi:</div>
          </Typography>
          <Typography className="value">
            <input
              type="text"
              style={{ background: 'none', outline: 'none', border: 'none', color: theme.colors.darkTextPrimary, textAlign: 'right' }}
              x={console.log(useTheme().colors.darkTextPrimary)}
              value={aktSumm}
              onChange={(e) => setAktSumm(e.target.value)}
            />
          </Typography>
        </div>
        <KeyValue kalit={'Licshet'} value={ariza.licshet} />
        <KeyValue kalit={'F. I. Sh'} value={ariza.fio} />
        <KeyValue kalit={'Yashovchi soni'} value={ariza.next_prescribed_cnt} />
        <KeyValue kalit={'Yaratilgan sanasi'} value={new Date(ariza.sana)?.toLocaleDateString()} />
        <KeyValue kalit={'Ariza holati'} value={ariza.status} />
      </div>
      <DataGrid
        columns={[
          { field: 'id', headerName: 't/r', width: 10 },
          { field: 'davr', headerName: 'davr' },
          { field: 'saldo_n', headerName: 'saldo boshi', type: 'number' },
          { field: 'nachis', headerName: 'Hisoblandi', type: 'number' },
          { field: 'allPaymentsSum', headerName: 'Tushum', type: 'number' },
          { field: 'saldo_k', headerName: 'Saldo oxiri', type: 'number' },
          { field: 'akt', headerName: 'Akt', type: 'number' },
          { field: 'yashovchilar_soni', headerName: 'Yashovchi soni', type: 'number', width: 10 }
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
