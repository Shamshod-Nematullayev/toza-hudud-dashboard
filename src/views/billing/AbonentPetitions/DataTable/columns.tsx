import { ArrowForward, Cancel, MoveToInboxOutlined, PrintOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { t } from 'i18next';
import { Link } from 'react-router-dom';
import api from 'utils/api';
import useStore from '../useStore';
import { toast } from 'react-toastify';
import { useState } from 'react';

export const columns: () => GridColDef[] = function () {
  const { setShowPrintSection, setCurrentAriza, setAbonentData, setAbonentData2, setMahalla, setMahallaDublicat, setIsLoading, reload } =
    useStore();

  const handleMoveToInboxIconClick = (_id: string) => {
    api.patch('/arizalar/move-to-inbox/' + _id).then(() => {
      reload();
    });
  };
  const handleCancelIconClick = (_id: string) => {
    const canceling_description = prompt('Nima sababdan bekor qilinyapti?');
    if (canceling_description === null) return;
    api
      .post('/arizalar/cancel', {
        _id: _id,
        canceling_description
      })
      .then(() => {
        reload();
      });
  };
  const handlePrintButtonClick = async (_id: string) => {
    try {
      setIsLoading(true);
      let ariza = (await api.get('/arizalar/' + _id)).data;
      ariza = ariza.ariza;
      const abonentData = (await api.get('/billing/get-abonent-data-by-licshet/' + ariza.licshet)).data.abonentData;
      setAbonentData(abonentData);
      const mahallaData = (await api.get('/billing/get-mfy-by-id/' + abonentData.mahallaId)).data;
      setMahalla(mahallaData);
      if (ariza.document_type === 'dvaynik') {
        const abonentData = (await api.get('/billing/get-abonent-data-by-licshet/' + ariza.ikkilamchi_licshet)).data.abonentData;
        setAbonentData2(abonentData);
        const mahallaData = (await api.get('/billing/get-mfy-by-id/' + abonentData.mahallaId)).data;
        setMahallaDublicat(mahallaData);
      }
      setCurrentAriza(ariza);
      setShowPrintSection(true);
    } catch (error) {
      console.error(error);
      toast.error('Xatolik kuzatildi');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: '№', width: 50 },
    { field: 'documentType', headerName: t('tableHeaders.documentType') },
    { field: 'accountNumber', headerName: t('tableHeaders.accountNumber'), width: 120 },
    { field: 'aktSummasi', headerName: t('tableHeaders.actAmount'), type: 'number' },
    { field: 'status', headerName: t('tableHeaders.status') },
    { field: 'actStatus', headerName: t('tableHeaders.actStatus') },
    {
      field: 'actions',
      headerName: t('tableHeaders.actions'),
      renderCell: (e) => {
        return (
          <>
            <Tooltip title="qabul qilish" arrow enterDelay={1000}>
              <span>
                <IconButton onClick={() => handleMoveToInboxIconClick(e.row._id)} disabled={e.row.status !== 'yangi' ? true : false}>
                  <MoveToInboxOutlined />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="bekor qilish" arrow enterDelay={1000}>
              <span>
                <IconButton
                  onClick={() => handleCancelIconClick(e.row._id)}
                  disabled={e.row.status === 'tasdiqlangan' || e.row.status === 'bekor qilindi' ? true : false}
                >
                  <Cancel />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="chop etish" arrow enterDelay={1000}>
              <span>
                <IconButton
                  // disabled={e.row.status === 'tasdiqlangan' || e.row.status === 'bekor qilindi' ? true : false}
                  onClick={() => handlePrintButtonClick(e.row._id)}
                >
                  <PrintOutlined />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="aktga o'tish" arrow enterDelay={1000}>
              <span>
                <Link to={`/billing/recalculation/${e.row._id}`}>
                  <IconButton>
                    <ArrowForward />
                  </IconButton>
                </Link>
              </span>
            </Tooltip>
          </>
        );
      },
      width: 180
    }
  ];
  return columns;
};
