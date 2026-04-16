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
    setUploadingDalolatnoma,
    uploadingDalolatnomaRows,
    setUploadingDalolatnomaRows,
    setLoading: setIsLoading,
    ui,
    setPdfFile,
    pdfFile,
    dalolatnoma
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
    if (!pdfFile) return toast.error('Iltimos PDF faylni yuklang');
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', pdfFile);
    await api.put(`/yashovchi-soni-xatlov/confirm/${_id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    if (isUpdate) await getDalolatnomaData({ _id: dalolatnoma._id });
    setIsLoading(false);
  };
  const handleClickAllDoneButton = async function () {
    if (!pdfFile) return toast.error('Iltimos PDF faylni yuklang');
    setIsLoading(true);
    toast.info('Iltimos kuting...');
    const formData = new FormData();
    formData.append('file', pdfFile);
    for (const row of uploadingDalolatnomaRows) {
      if (row.status === 'xujjat yaratilgan') {
        await handleClickDoneButton(row._id, false);
      }
    }
    handleClickRefresh();

    setIsLoading(false);
  };
  const [clearPdfFileTrigger, setClearPdfFileTrigger] = useState(false);
  useEffect(() => {
    if (pdfFile) {
      async function getDataFromQR() {
        if (!pdfFile) return;
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);
        const data = await extractQRCodeFromPDF(pdfData, 'lastPage');
        if (!data.ok) return toast.error(data.message);
        await getDalolatnomaData({
          _id: data.result?.split('_')[1]
        });
      }
      getDataFromQR();
    }
  }, [pdfFile]);

  useEffect(() => {
    setDalolatnomaNumber(dalolatnoma.documentNumber.toString());
  }, [dalolatnoma]);

  const handleClickRefresh = () => {
    getDalolatnomaData({
      documentNumber: dalolatnomaNumber
    });
  };
  const handleCancelById = async (_id: string) => {
    await api.put(`/yashovchi-soni-xatlov/${_id}`, {
      isCancel: true
    });
    await getDalolatnomaData({ _id: dalolatnoma._id });
  };
  const handleClickCancelAll = async () => {
    for (const row of uploadingDalolatnomaRows) {
      await api.put(`/yashovchi-soni-xatlov/${row._id}`, {
        isCancel: true
      });
    }
    await getDalolatnomaData({ _id: dalolatnoma._id });
  };
  return (
    <Grid container style={{ height: '100%' }} spacing={2}>
      {!pdfFile ? (
        <Grid item xs={12}>
          <FileInputDrop
            setFiles={(files) => {
              setPdfFile(files ? files[0] : null);
            }}
            clearTrigger={clearPdfFileTrigger}
          />
        </Grid>
      ) : (
        <>
          {ui.loading && <Loader />}
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
            <Button
              variant="outlined"
              color="secondary"
              sx={{ margin: 1 }}
              onClick={() => {
                setPdfFile(null);
                setClearPdfFileTrigger(!clearPdfFileTrigger);
              }}
              fullWidth
            >
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
