import React, { useEffect, useState } from 'react';
import { Button, Grid, IconButton, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DoneOutline, Delete, DeleteOutline, DoneAllOutlined, Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import FileInputDrop from 'ui-component/FileInputDrop';
import Loader from 'ui-component/Loader';
import useOdamSoniXatlovStore from './odamSoniXatlovStore';
import api from 'utils/api';
import { getRequestdocumentByIds } from 'services/getRequestdocumentByIds';
import { extractQRCodeFromPDF } from 'views/tools/extractQRCodeFromPDF';
import { IMultiplyRequest } from 'types/billing';

const getStatusRequest = (data: IMultiplyRequest) => {
  if (data.isCancel) return 'bekor qilindi';
  if (!data.document_id) return 'yangi';
  if (!data.actId) return 'xujjat yaratilgan';
  if (!data.confirm) return 'akt qilingan';
  return 'yakunlangan';
};

function SidePanel() {
  const { t } = useTranslation();
  const { ui, pdfFile, dalolatnoma, setPdfFile, setLoading: setIsLoading, toggleRefresh } = useOdamSoniXatlovStore();

  const [dalolatnomaNumber, setDalolatnomaNumber] = useState('');
  const [uploadingRows, setUploadingRows] = useState<any[]>([]);
  const [clearTrigger, setClearTrigger] = useState(false);

  // 1. Dalolatnoma va unga tegishli qatorlarni olish
  const getDalolatnomaData = async (params: any) => {
    try {
      setIsLoading(true);
      const { data: response } = await api.get('/yashovchi-soni-xatlov/get-one-dalolatnoma', { params });

      const requestRows = await getRequestdocumentByIds(response.data.request_ids);

      // Store'dagi dalolatnoma ma'lumotlarini yangilash
      useOdamSoniXatlovStore.setState((state) => ({
        dalolatnoma: {
          ...state.dalolatnoma,
          _id: response.data._id,
          documentNumber: response.data.documentNumber
        }
      }));

      setUploadingRows(
        requestRows.map((item, i) => ({
          id: i + 1,
          _id: item._id,
          accountNumber: item.KOD,
          fullName: item.fio,
          YASHOVCHILAR: item.YASHOVCHILAR,
          status: getStatusRequest(item),
          isCancel: item.isCancel,
          actId: item.actId,
          abonentId: item.abonentId
        }))
      );
    } catch (error) {
      toast.error(t('errors.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Yakka tartibda tasdiqlash
  const handleConfirmRow = async (_id: string, silent = false) => {
    if (!pdfFile) return toast.error(t('errors.pdfFileRequired'));

    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      if (!silent) setIsLoading(true);
      await api.put(`/yashovchi-soni-xatlov/confirm/${_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (!silent) await getDalolatnomaData({ _id: dalolatnoma._id });
    } catch (error) {
      if (!silent) toast.error(t('errors.somethingWentWrong'));
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // 3. Ommaviy tasdiqlash
  const handleConfirmAll = async () => {
    const targets = uploadingRows.filter((row) => row.status === 'xujjat yaratilgan');
    if (targets.length === 0) return toast.info(t('errors.noDocumentsToConfirm'));

    setIsLoading(true);
    for (const row of targets) {
      await handleConfirmRow(row._id, true);
    }
    await getDalolatnomaData({ _id: dalolatnoma._id });
    toggleRefresh(); // Asosiy jadvalni yangilash
    setIsLoading(false);
    toast.success(t('successMessages.allDocumentConfirmed'));
  };

  // 4. Bekor qilish mantiqlari
  const handleCancelRow = async (_id: string) => {
    await api.put(`/yashovchi-soni-xatlov/${_id}`, { isCancel: true });
    await getDalolatnomaData({ _id: dalolatnoma._id });
  };

  const handleCancelAll = async () => {
    setIsLoading(true);
    await Promise.all(uploadingRows.map((row) => api.put(`/yashovchi-soni-xatlov/${row._id}`, { isCancel: true })));
    await getDalolatnomaData({ _id: dalolatnoma._id });
    setIsLoading(false);
  };

  // 5. PDF yuklanganda QR kodni o'qish
  useEffect(() => {
    if (pdfFile) {
      const processQR = async () => {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const data = await extractQRCodeFromPDF(new Uint8Array(arrayBuffer), 'lastPage');
        if (!data.ok) return toast.error(data.message);

        const docId = data.result?.split('_')[1];
        if (docId) await getDalolatnomaData({ _id: docId });
      };
      processQR();
    }
  }, [pdfFile]);

  useEffect(() => {
    setDalolatnomaNumber(dalolatnoma.documentNumber?.toString() || '');
  }, [dalolatnoma.documentNumber]);

  return (
    <Grid container style={{ height: '100%' }} spacing={2}>
      {!pdfFile ? (
        <Grid item xs={12}>
          <FileInputDrop setFiles={(files) => setPdfFile(files ? files[0] : null)} clearTrigger={clearTrigger} />
        </Grid>
      ) : (
        <>
          {ui.loading && <Loader />}
          <Grid item md={3}>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <TextField
                label={t('documentNumber')}
                value={dalolatnomaNumber}
                fullWidth
                onChange={(e) => setDalolatnomaNumber(e.target.value)}
              />
              <IconButton
                sx={{ position: 'absolute', right: 5, top: 10 }}
                onClick={() => getDalolatnomaData({ documentNumber: dalolatnomaNumber })}
              >
                <Refresh />
              </IconButton>
            </div>

            <Button variant="outlined" fullWidth sx={{ mb: 1 }} onClick={handleConfirmAll}>
              <DoneAllOutlined sx={{ mr: 1 }} /> {t('buttons.acceptAll')}
            </Button>

            <Button variant="outlined" color="error" fullWidth sx={{ mb: 1 }} onClick={handleCancelAll}>
              <DeleteOutline sx={{ mr: 1 }} /> {t('buttons.rejectAll')}
            </Button>

            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={() => {
                setPdfFile(null);
                setUploadingRows([]);
                setClearTrigger(!clearTrigger);
              }}
            >
              {t('buttons.clear')}
            </Button>
          </Grid>

          <Grid item md={9}>
            <DataGrid
              rows={uploadingRows}
              columns={[
                { field: 'id', headerName: '№', width: 50 },
                { field: 'accountNumber', headerName: t('tableHeaders.accountNumber'), width: 120 },
                { field: 'fullName', headerName: t('tableHeaders.fullName'), width: 180 },
                { field: 'YASHOVCHILAR', headerName: 'Soni', width: 70 },
                { field: 'status', headerName: t('tableHeaders.status'), width: 130 },
                {
                  field: 'actions',
                  headerName: t('tableHeaders.actions'),
                  width: 120,
                  renderCell: (params) => (
                    <>
                      <IconButton
                        color="success"
                        disabled={params.row.isCancel || !!params.row.actId}
                        onClick={() => handleConfirmRow(params.row._id)}
                      >
                        <DoneOutline />
                      </IconButton>
                      <IconButton color="error" disabled={params.row.isCancel} onClick={() => handleCancelRow(params.row._id)}>
                        <Delete />
                      </IconButton>
                    </>
                  )
                }
              ]}
              hideFooter
              sx={{ height: '70vh' }}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default SidePanel;
