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
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', margin: '20px 0', borderBottom: '1px solid #ccc' }}>
      <Typography variant="subtitle1" className="key">
        <div>{kalit}:</div>
      </Typography>
      <Typography className="value">{value}</Typography>
    </div>
  );
}

function FindedDataTable() {
  const { currentFile, removePdfFile, setCurrentFile, ariza } = useStore();
  const [rows, setRows] = useState([]);
  const [licshetInput, setLicshetInput] = useState('');
  const [activeRow, setActiveRow] = useState({});
  const [inputDisabled, setInputDisabled] = useState(true);
  const [showSpoiler, setShowSpoiler] = useState(false)

  const theme = useTheme()

  // Fetch data from API or any other source
  const fetchData = async () => {
    try {
      setActiveRow({});
      setRows([]);
      const { data } = await api.get('/sudAkts/search-by-licshet', { params: { licshet: licshetInput } });
      if (!data.ok) {
        toast.error(data.message);
        return;
      }
      if (data.rows.length < 1) {
        toast.info('No results found');
        return;
      }
      const rows = data.rows.map((row, i) => {
        return {
          id: i + 1,
          ...row,
          warningDate: new Date(row.warningDate),
          createdAt: new Date(row.createdAt)
        };
      });
      if (rows.length == 1) {
        setActiveRow(rows[0]);
      }
      setRows(rows);
    } catch (err) {
      toast.error("Couldn't fetch data");
      console.error(err);
    }
  };

  useEffect(() => {
    if (ariza.isScanedFromQR) {
      setInputDisabled(true);
    } else setInputDisabled(false)

    if (!currentFile.url) {
      setInputDisabled(true)
    }
  }, [ariza])

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };
  const handlePrimaryButtonClick = async (e) => {
    try {
      e.preventDefault();
      if (!currentFile.url) {
        toast.error('Fayl tanlanmadi');
        return;
      }
      const formData = new FormData();
      formData.append('file', currentFile.blob, currentFile.file.name);
      formData.append('sud_akt_id', activeRow._id);

      const { data } = await api.post('/sudAkts/upload-ariza-file', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (!data.ok) {
        toast.error(data.message);
        return;
      }
      removePdfFile(currentFile.file.name);
      setCurrentFile({});
      toast.success(data.message);
    } catch (err) {
      console.error(err);
      toast.error("Serverga so'rov yuborilmadi");
    }
  };
  const handleDeleteButtonClick = async () => {
    if (!currentFile.url) {
      toast.error('Fayl tanlanmadi');
      return;
    }
    removePdfFile(currentFile.file.name);
    setCurrentFile({});
    setLicshetInput('');
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <FormControl style={{ display: 'flex', flexDirection: 'row' }}>
          <IconButton sx={{ padding: '15px' }} >
            <RefreshOutlinedIcon />
          </IconButton>
          <TextField
            disabled={inputDisabled}
            variant="outlined"
            name="licshet_input"
            placeholder="Ariza raqami"
            value={licshetInput}
            onChange={(e) => setLicshetInput(e.target.value)}
          />
          <Button sx={{ margin: 'auto 15px', padding: '15px 20px' }} onClick={handlePrimaryButtonClick}>
            <FileUploadOutlinedIcon />
            kiritish
          </Button>
          <Button sx={{ padding: '15px 20px', color: 'error.main' }} onClick={handleDeleteButtonClick}>
            <DeleteOutlinedIcon />
            o'chirish
          </Button>
          <IconButton sx={{ padding: '15px' }} onClick={() => setShowSpoiler(!showSpoiler)}>
            {showSpoiler ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </FormControl>
      </form>

      <DataGrid
        columns={[
          { field: 'id', headerName: 't/r', width: 10 },
          { field: 'davr', headerName: 'davr' },
          { field: 'saldo_n', headerName: 'saldo boshi', type: 'number' },
          { field: 'nachis', headerName: 'Hisoblandi', type: 'number' },
          { field: 'saldo_k', headerName: 'Saldo oxiri', type: 'number' },
          { field: 'akt', headerName: 'Akt', type: 'number' },
          { field: 'yashovchilar_soni', headerName: 'Yashovchi soni', type: 'number', width: 10 },
        ]}
        disableColumnFilter
        disableColumnSorting
        hideFooter
        rows={rows}
        style={{ margin: '25px auto', height: '30vh' }}
        onRowClick={(e) => setActiveRow(e.row)}
      />
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', margin: '20px 0', borderBottom: '1px solid #ccc' }}>
          <Typography variant="subtitle1" className="key">
            <div>Akt summasi:</div>
          </Typography>
          <Typography className="value"><input type='text' style={{ background: "none", outline: "none", border: "none", color: theme.colors.darkTextPrimary }} x={console.log(useTheme().colors.darkTextPrimary)} defaultValue="15+1500" /></Typography>
        </div>
        <KeyValue kalit={'Licshet'} value={activeRow.licshet} />
        <KeyValue kalit={'F. I. Sh'} value={activeRow.fio} />
        <KeyValue kalit={'Yashovchi soni'} value={activeRow.yashovchi_soni?.toLocaleString()} />
        <KeyValue kalit={'Yaratilgan sanasi'} value={activeRow.createdAt?.toLocaleDateString()} />
      </div>
    </div>
  );
}

export default FindedDataTable;
