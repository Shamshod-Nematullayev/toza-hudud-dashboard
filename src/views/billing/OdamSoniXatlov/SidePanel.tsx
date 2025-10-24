import React, { lazy, useEffect, useState } from 'react';
import FileInputDrop from 'ui-component/FileInputDrop';
import odamSoniXatlovStore from './odamSoniXatlovStore';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Grid, IconButton, TextField } from '@mui/material';
import Refresh from '@mui/icons-material/Refresh';
import api from 'utils/api';
import { toast } from 'react-toastify';
import DoneOutline from '@mui/icons-material/DoneOutline';
import Delete from '@mui/icons-material/Delete';
import { DeleteOutline, DoneAllOutlined } from '@mui/icons-material';
import Loader from 'ui-component/Loader';
import { useTranslation } from 'react-i18next';
import { getRequestdocumentByIds } from 'services/getRequestdocumentByIds';
import { extractQRCodeFromPDF } from 'views/tools/extractQRCodeFromPDF';
import { IMultiplyRequest } from 'types/billing';

const getStatusRequest = function (data: IMultiplyRequest) {
  if (data.isCancel) return 'bekor qilindi';
  if (!data.document_id) return 'yangi';
  if (!data.actId) return 'xujjat yaratilgan';
  if (!data.confirm) return 'akt qilingan';
  return 'yakunlangan';
};
function SidePanel() {
  const {
    setPdfFiles,
    pdfFiles,
    clearPdfFiles,
    uploadingDalolatnoma,
    setUploadingDalolatnoma,
    uploadingDalolatnomaRows,
    setUploadingDalolatnomaRows,
    isLoading,
    setIsLoading
  } = odamSoniXatlovStore();
  const { t } = useTranslation();

  const [dalolatnomaNumber, setDalolatnomaNumber] = useState('');
  const getDalolatnomaData = async (params: any) => {
    const dalolatnoma = (
      await api.get('/yashovchi-soni-xatlov/get-one-dalolatnoma', {
        params
      })
    ).data;

    const rows = await getRequestdocumentByIds(dalolatnoma.data.request_ids);

    setUploadingDalolatnoma(dalolatnoma.data);
    setUploadingDalolatnomaRows(
      rows.map((item, i) => ({
        id: i + 1,
        _id: item._id,
        accountNumber: item.KOD,
        fullName: item.fio,
        YASHOVCHILAR: item.YASHOVCHILAR,
        status: getStatusRequest(item),
        isCancel: item.isCancel,
        actId: item.actId
      }))
    );
  };

  const handleClickDoneButton = async function (_id: string, isUpdate = true) {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', pdfFiles[0]);
    await api.put(`/yashovchi-soni-xatlov/confirm/${_id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    if (isUpdate) await getDalolatnomaData({ _id: uploadingDalolatnoma._id });
    setIsLoading(false);
  };
  const handleClickAllDoneButton = async function () {
    setIsLoading(true);
    toast.info('Iltimos kuting...');
    const formData = new FormData();
    formData.append('file', pdfFiles[0]);
    for (const row of uploadingDalolatnomaRows) {
      if (row.status === 'xujjat yaratilgan') {
        await handleClickDoneButton(row._id, false);
      }
    }
    handleClickRefresh();

    setIsLoading(false);
  };
  useEffect(() => {
    if (pdfFiles.length > 0) {
      async function getDataFromQR() {
        const arrayBuffer = await pdfFiles[0].arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);
        const data = await extractQRCodeFromPDF(pdfData, 1);
        if (!data.ok) return toast.error(data.message);
        await getDalolatnomaData({
          _id: data.result?.split('_')[1]
        });
      }
      getDataFromQR();
    }
  }, [pdfFiles]);

  useEffect(() => {
    setDalolatnomaNumber(uploadingDalolatnoma.documentNumber);
  }, [uploadingDalolatnoma]);

  const handleClickRefresh = () => {
    getDalolatnomaData({
      documentNumber: dalolatnomaNumber
    });
  };
  const handleCancelById = async (_id: string) => {
    await api.put(`/yashovchi-soni-xatlov/${_id}`, {
      isCancel: true
    });
    await getDalolatnomaData({ _id: uploadingDalolatnoma._id });
  };
  const handleClickCancelAll = async () => {
    for (const row of uploadingDalolatnomaRows) {
      await api.put(`/yashovchi-soni-xatlov/${row._id}`, {
        isCancel: true
      });
    }
    await getDalolatnomaData({ _id: uploadingDalolatnoma._id });
  };
  return (
    <Grid container style={{ height: '100%' }} spacing={2}>
      {pdfFiles.length === 0 ? (
        <Grid item xs={12}>
          <FileInputDrop setFiles={setPdfFiles} clearTrigger={clearPdfFiles} />
        </Grid>
      ) : (
        <>
          {isLoading && <Loader />}
          <Grid item md={3}>
            <div style={{ position: 'relative' }}>
              <TextField
                sx={{ margin: 1 }}
                label={t('documentNumber')}
                value={dalolatnomaNumber}
                fullWidth
                onChange={(e) => setDalolatnomaNumber(e.target.value)}
              />
              <IconButton sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} onClick={handleClickRefresh}>
                <Refresh />
              </IconButton>
            </div>
            <Button variant="outlined" sx={{ margin: 1 }} fullWidth onClick={handleClickAllDoneButton}>
              <DoneAllOutlined />
              {t('buttons.acceptAll')}
            </Button>
            <Button variant="outlined" sx={{ margin: 1 }} color="error" onClick={handleClickCancelAll} fullWidth>
              <DeleteOutline />
              {t('buttons.rejectAll')}{' '}
            </Button>
            <Button variant="outlined" color="secondary" sx={{ margin: 1 }} onClick={() => clearPdfFiles()} fullWidth>
              {t('buttons.clear')}
            </Button>
          </Grid>
          <Grid item md={9}>
            <DataGrid
              disableColumnSorting
              disableColumnMenu
              columns={[
                { field: 'id', headerName: '№', width: 50 },
                { field: 'accountNumber', headerName: t('tableHeaders.accountNumber'), width: 120 },
                { field: 'fullName', headerName: t('tableHeaders.fullName'), width: 200 },
                { field: 'YASHOVCHILAR', headerName: t('tableHeaders.inhabitantCount'), width: 50 },
                { field: 'status', headerName: t('tableHeaders.status') },
                {
                  field: 'actions',
                  headerName: t('tableHeaders.actions'),
                  renderCell: (params) => {
                    return (
                      <>
                        <IconButton
                          disabled={params.row.isCancel || Boolean(params.row.actId)}
                          onClick={() => handleClickDoneButton(params.row._id)}
                        >
                          <DoneOutline />
                        </IconButton>
                        <IconButton disabled={params.row.isCancel} onClick={() => handleCancelById(params.row._id)}>
                          <Delete />
                        </IconButton>
                      </>
                    );
                  }
                }
              ]}
              rows={uploadingDalolatnomaRows}
              sx={{ height: '100%' }}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default SidePanel;
