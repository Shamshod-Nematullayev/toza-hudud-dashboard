import React, { lazy, useEffect, useState } from 'react';
import FileInputDrop from 'ui-component/FileInputDrop';
import odamSoniXatlovStore from './odamSoniXatlovStore';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Grid, IconButton, TextField } from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';
import jsQR from 'jsqr';
import Refresh from '@mui/icons-material/Refresh';
import api from 'utils/api';
import { toast } from 'react-toastify';
import DoneOutline from '@mui/icons-material/DoneOutline';
import Delete from '@mui/icons-material/Delete';
import { DeleteOutline, DoneAllOutlined } from '@mui/icons-material';
import Loadable from 'ui-component/Loadable';
import Loader from 'ui-component/Loader';
const extractQRCodeFromPDF = async (pdfData) => {
  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;
  const page = await pdfDoc.getPage(totalPages); // oxirgi sahifa

  const viewport = page.getViewport({ scale: 1 });
  const canvas = document.createElement('canvas'); // Yangi canvas yaratish
  const context = canvas.getContext('2d');

  // Canvasni sahifa hajmiga moslashtirish
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  // Sahifani canvasga render qilish
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;

  // Canvasdan tasvirni olish
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  // QR kodni o'qish
  const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

  if (qrCode) {
    return { ok: true, result: qrCode.data };
  } else {
    return { ok: false, message: 'QR Code topilmadi.' };
  }
};

const getStatusRequest = function (data) {
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
  const [dalolatnomaNumber, setDalolatnomaNumber] = useState('');
  const getDalolatnomaData = async (params) => {
    const dalolatnoma = (
      await api.get('/yashovchi-soni-xatlov/get-one-dalolatnoma', {
        params
      })
    ).data;

    const rows = (
      await api.get('/yashovchi-soni-xatlov/get-rows-by-ids', {
        params: {
          request_ids: dalolatnoma.data.request_ids
        }
      })
    ).data;

    setUploadingDalolatnoma(dalolatnoma.data);
    setUploadingDalolatnomaRows(
      rows.data.map((item, i) => ({
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

  const handleClickDoneButton = async function (_id, isUpdate = true) {
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
    const formData = new FormData();
    formData.append('file', pdfFiles[0]);
    for (const row of uploadingDalolatnomaRows) {
      if (row.status === 'xujjat yaratilgan') {
        await handleClickDoneButton(row._id, false);
      }
    }

    setIsLoading(false);
  };
  useEffect(() => {
    if (pdfFiles.length > 0) {
      async function getDataFromQR() {
        const arrayBuffer = await pdfFiles[0].arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);
        const data = await extractQRCodeFromPDF(pdfData);
        if (!data.ok) return toast.error(data.message);
        await getDalolatnomaData({
          _id: data.result.split('_')[1]
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
  const handleCancelById = async (_id) => {
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
          <FileInputDrop setFunc={setPdfFiles} />
        </Grid>
      ) : (
        <>
          {isLoading && <Loader />}
          <Grid item md={3}>
            <div style={{ position: 'relative' }}>
              <TextField
                sx={{ margin: 1 }}
                label="dalolatnoma raqami"
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
              Hammasini kiritish
            </Button>
            <Button variant="outlined" sx={{ margin: 1 }} color="error" onClick={handleClickCancelAll} fullWidth>
              <DeleteOutline />
              Hammasini bekor qilish
            </Button>
            <Button variant="outlined" color="secondary" sx={{ margin: 1 }} onClick={() => clearPdfFiles()} fullWidth>
              Tugatish
            </Button>
          </Grid>
          <Grid item md={9}>
            <DataGrid
              disableColumnSorting
              disableColumnMenu
              columns={[
                { field: 'id', headerName: '№', width: 50 },
                { field: 'accountNumber', headerName: 'Hisob raqam', width: 120 },
                { field: 'fullName', headerName: 'F.I.O.', width: 200 },
                { field: 'YASHOVCHILAR', headerName: 'YASHOVCHILAR', width: 50 },
                { field: 'status', headerName: 'status' },
                {
                  field: 'actions',
                  headerName: 'harakatlar',
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
