import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import SimCardDownloadOutlinedIcon from '@mui/icons-material/SimCardDownloadOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { CSVDownload } from 'react-csv';
import { toast } from 'react-toastify';

import api from 'utils/api';
import useOdamSoniXatlovStore from './odamSoniXatlovStore';

function XatlovActionsToolbar() {
  const { rows, pagination, setLoading, toggleRefresh, setPrintModal, setRows } = useOdamSoniXatlovStore();

  const [readyToDownload, setReadyToDownload] = useState(false);
  const [csvData, setCsvData] = useState([]);

  // 1. Dalolatnoma yaratish
  const handleCreateButtonClick = async () => {
    const request_ids = rows.filter((row) => row.status === 'yangi').map((row) => row._id);

    if (request_ids.length < 1) {
      return toast.error('Yangi holatdagi qatorlar topilmadi');
    }

    try {
      setLoading(true);
      const { data: responseData } = await api.post('/yashovchi-soni-xatlov', {
        request_ids,
        mahallaId: pagination.filter.mahallaId
      });

      // Store'dagi dalolatnoma ma'lumotlarini yangilash (agar store'da setter bo'lsa)
      // Bu yerda bevosita set() ishlatish yoki store'ga yangi action qo'shish mumkin
      useOdamSoniXatlovStore.setState((state) => ({
        dalolatnoma: {
          ...state.dalolatnoma,
          data: responseData.data,
          mahalla: responseData.mahalla,
          rows: rows.filter((row) => request_ids.includes(row._id)),
          _id: responseData.data._id,
          documentNumber: responseData.data.documentNumber
        }
      }));

      setPrintModal(true);
      toggleRefresh();
    } catch (error) {
      toast.error('Hujjat yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // 2. Excel (CSV) yuklab olish
  const handleDownloadExcel = async () => {
    try {
      const { data } = await api.get('/yashovchi-soni-xatlov', {
        params: {
          limit: 1000,
          ...pagination.filter
        }
      });

      const formatted = data.data.map((row: any, i: number) => ({
        id: i + 1,
        accountNumber: row.KOD,
        fio: row.fio,
        currentInhabitantCount: row.currentInhabitantCount,
        YASHOVCHILAR: row.YASHOVCHILAR,
        mahalla: row.mahallaName,
        status: !row.document_id ? 'yangi' : 'xujjat yaratilgan'
      }));

      setCsvData(formatted);
      setReadyToDownload(true);
      setTimeout(() => setReadyToDownload(false), 2000);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    }
  };

  // 3. TozaMakon tizimidan rekursiv yangilash
  const handleClickRefresh = async () => {
    if (rows.length === 0) return;

    setLoading(true);
    let successCount = 0;

    try {
      for (const row of rows) {
        await api.patch(`/yashovchi-soni-xatlov/update-from-tozamakon/${row._id}`, {
          abonentId: row.abonentId
        });
        successCount++;
      }

      toast.success(`${successCount} ta ma'lumot yangilandi`);
      toggleRefresh();
    } catch (error) {
      toast.error('Yangilash jarayonida xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Tooltip title="Dalolatnoma yaratish">
        <span>
          <IconButton color="primary" disabled={!pagination.filter.mahallaId} onClick={handleCreateButtonClick}>
            <NoteAddOutlinedIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Excelga yuklab olish">
        <IconButton onClick={handleDownloadExcel} color="success">
          <SimCardDownloadOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="TozaMakon tizimidan yangilash">
        <IconButton onClick={handleClickRefresh} color="info">
          <RefreshIcon />
        </IconButton>
      </Tooltip>

      {readyToDownload && <CSVDownload data={csvData} filename={`xatlov_${new Date().toLocaleDateString()}.csv`} target="_blank" />}
    </div>
  );
}

export default XatlovActionsToolbar;
