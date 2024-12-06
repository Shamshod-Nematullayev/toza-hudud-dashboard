import React, { useEffect, useState } from 'react';
import FileInputDrop from 'ui-component/FileInputDrop';
import odamSoniXatlovStore from './odamSoniXatlovStore';
import { DataGrid } from '@mui/x-data-grid';
import { Button, IconButton, TextField } from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';
import jsQR from 'jsqr';
import Refresh from '@mui/icons-material/Refresh';
import api from 'utils/api';
import { toast } from 'react-toastify';
import DoneOutline from '@mui/icons-material/DoneOutline';
import Delete from '@mui/icons-material/Delete';
import { DeleteOutline, DoneAllOutlined } from '@mui/icons-material';
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
  if (!data.akt_id) return 'xujjat yaratilgan';
  if (data.akt.status !== 'tasdiqlandi') return 'akt qilingan';
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
    setUploadingDalolatnomaRows
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
        isCancel: item.isCancel
      }))
    );
  };
  useEffect(() => {
    if (pdfFiles.length > 0) {
      async function getDataFromQR() {
        const arrayBuffer = await pdfFiles[0].file.arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);
        const data = await extractQRCodeFromPDF(pdfData);
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
    <div style={{ width: '100%', display: 'flex', justifyContent: 'left' }}>
      {pdfFiles.length === 0 ? (
        <FileInputDrop setPdfFiles={setPdfFiles} />
      ) : (
        <>
          <div style={{ margin: '0 20px', display: 'flex', flexDirection: 'column' }}>
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
            <Button variant="outlined" sx={{ margin: 1 }}>
              <DoneAllOutlined />
              Hammasini kiritish
            </Button>
            <Button variant="outlined" sx={{ margin: 1 }} color="error" onClick={handleClickCancelAll}>
              <DeleteOutline />
              Hammasini bekor qilish
            </Button>
            <Button variant="outlined" color="secondary" sx={{ margin: 1 }} onClick={() => clearPdfFiles()}>
              Tugatish
            </Button>
          </div>
          <div>
            <DataGrid
              disableColumnFilter
              disableColumnSorting
              disableColumnMenu
              columns={[
                { field: 'id', headerName: '№', width: 50 },
                { field: 'accountNumber', headerName: 'Hisob raqam', width: 120 },
                { field: 'fullName', headerName: 'F.I.O.', width: 200 },
                { field: 'YASHOVCHILAR', headerName: 'YASHOVCHILAR' },
                { field: 'status', headerName: 'status' },
                {
                  field: 'actions',
                  headerName: 'harakatlar',
                  renderCell: (params) => {
                    return (
                      <>
                        <IconButton disabled={params.row.isCancel}>
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
            />
          </div>
        </>
      )}
    </div>
  );
}

export default SidePanel;
