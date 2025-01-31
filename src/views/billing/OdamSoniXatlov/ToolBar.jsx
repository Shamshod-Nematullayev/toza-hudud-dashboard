import React, { useState } from 'react';
import { Button } from '@mui/material';
import SimCardDownloadOutlinedIcon from '@mui/icons-material/SimCardDownloadOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { CSVDownload } from 'react-csv';
import api from 'utils/api';
import odamSoniXatlovStore from './odamSoniXatlovStore';
import { toast } from 'react-toastify';

function ToolBar() {
  const { filter, rows, refresh, setLoading, setDalolatnomaData, setOpenPrintSection } = odamSoniXatlovStore();
  const [readyToDownload, setReadyToDownload] = useState(false);
  const [data, setData] = useState([]);
  const handleCreateButtonClick = async () => {
    // Create new account logic here
    const request_ids = rows.filter((row) => row.status === 'yangi');
    if (request_ids.length < 1) return toast.error("yangi holatdagi qatorlar yo'q");
    const { data, mahalla } = (
      await api.post('/yashovchi-soni-xatlov', {
        request_ids,
        mahallaId: filter.mahallaId
      })
    ).data;
    setDalolatnomaData({
      data,
      mahalla,
      rows: rows.map((row) => {
        if (request_ids.includes(row._id)) {
          return row;
        }
      })
    });
    setOpenPrintSection(true);
    refresh();
  };
  const handleDownloadExcel = () => {
    api
      .get('/yashovchi-soni-xatlov', {
        params: {
          limit: 1000,
          ...filter
        }
      })
      .then(({ data }) => {
        setData(
          data.data.map((row, i) => {
            return {
              id: i + 1,
              accountNumber: row.KOD,
              fio: row.fio,
              currentInhabitantCount: row.currentInhabitantCount,
              YASHOVCHILAR: row.YASHOVCHILAR,
              mahallaId: row.mahallaName,
              status: (() => {
                if (!row.document_id) {
                  return 'yangi';
                } else {
                  return 'xujjat yaratilgan';
                }
              })()
            };
          })
        );
        setReadyToDownload(true);
        setTimeout(() => setReadyToDownload(false), 1000);
      });
  };

  const handleClickRefresh = () => {
    let counter = 0;
    setLoading(true);
    const interval = async () => {
      if (counter === rows.length) {
        toast.success('Yangilandi');
        refresh();
        setLoading(false);
        return;
      }
      await api.patch('/yashovchi-soni-xatlov/update-from-tozamakon/' + rows[counter]._id, { abonentId: rows[counter].abonentId });
      counter++;
      interval();
    };
    interval();
  };
  return (
    <div style={{ display: 'flex', margin: '10px 0' }}>
      <Button variant="contained" color="primary" disabled={!filter.mahallaId} onClick={handleCreateButtonClick}>
        Dalolatnoma yaratish
      </Button>
      <Button variant="outlined" style={{ margin: '0 5px' }} onClick={handleDownloadExcel}>
        <SimCardDownloadOutlinedIcon />
        Excelga
      </Button>
      <Button variant="outlined" onClick={handleClickRefresh}>
        <RefreshIcon />
        TozaMakon tizimidan yangilash
        {readyToDownload && <CSVDownload data={data} filename="yashovchi_sonlari_sorovlari.csv" />}
      </Button>
    </div>
  );
}

export default ToolBar;
