import { Button, FormControl, IconButton, TextField, Typography, useTheme } from '@mui/material';
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
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const initialYear = initialDate.getFullYear();
  const initialMonth = initialDate.getMonth();
  return (currentYear - initialYear) * 12 - (currentMonth - initialMonth);
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

  const theme = useTheme();

  useEffect(() => {
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
      (isNaN(ariza.next_prescribed_cnt - ariza.current_prescribed_cnt) ? 0 : ariza.next_prescribed_cnt - ariza.current_prescribed_cnt) *
      4625 *
      diffMonth;
    if (lateAktSumm > 0 && ariza.document_type != 'viza') {
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
      const { data } = await api.get('/arizalar/get-ariza-by-document-number/' + arizaNumberInput);
      if (!data.ok) {
        toast.error(data.message);
        return;
      }
      setAriza(data.ariza);
    } catch (err) {
      console.log(err);
      toast.error("Serverga so'rov yuborilmadi");
    }
  };
  const handlePrimaryButtonClick = async (e) => {
    try {
      e.preventDefault();
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
      formData.append('description', 'fuqaro arizasi ' + ariza.comment);

      const { data } = await api.post('/billing/create-full-akt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (!data.ok) {
        setIsUploading(false);
        toast.error(data.message);
        return;
      }
      removePdfFile(currentFile.file.name);
      setCurrentFile({});
      setAriza({});
      setIsUploading(false);
      toast.success(data.message);
    } catch (err) {
      console.error(err);
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
        <FormControl style={{ display: 'flex', flexDirection: 'row' }}>
          <IconButton sx={{ padding: '15px' }} onClick={handleClickRefreshButton}>
            <RefreshOutlinedIcon />
          </IconButton>
          <TextField
            disabled={inputDisabled}
            variant="outlined"
            name="licshet_input"
            placeholder="Ariza raqami"
            value={arizaNumberInput}
            onChange={(e) => setArizaNumberInput(e.target.value)}
          />
          <Button
            sx={{ margin: 'auto 15px', padding: '15px 20px' }}
            onClick={handlePrimaryButtonClick}
            disabled={ariza.status === 'yangi' && ariza.document_type !== 'dvaynik' ? false || isUploading : true}
          >
            <FileUploadOutlinedIcon />
            kiritish
          </Button>
          <Button sx={{ padding: '15px 20px', color: 'secondary.main' }} onClick={handleDeleteButtonClick}>
            <DeleteOutlinedIcon />
            faylni o'chirish
          </Button>
          <Button
            sx={{ padding: '15px 20px', color: 'error.main' }}
            onClick={() => setShowDialog(true)}
            disabled={ariza.status === 'yangi' && ariza.document_type !== 'dvaynik' ? false && isUploading : true}
          >
            <DeleteOutlinedIcon />
            bekor qilish
          </Button>
          <IconButton sx={{ padding: '15px' }} onClick={() => setShowSpoiler(!showSpoiler)}>
            {showSpoiler ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </FormControl>
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
