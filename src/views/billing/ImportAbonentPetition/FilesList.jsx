import { Grid, List, ListItem, ListItemButton, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import useStore from './useStore';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import api from 'utils/api';
import * as pdfjsLib from 'pdfjs-dist';
import jsQR from 'jsqr';

function FilesList() {
  const { pdfFiles, setCurrentFile, currentFile, setAriza } = useStore();
  const theme = useTheme();

  const extractQRCodeFromPDF = async (pdfData) => {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(1); // 1-sahifani olish

    const viewport = page.getViewport({ scale: 1 }); // Sahifani ko'rsatish uchun viewportni olish
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
  // handlers
  const handleListItemClick = async (file_name) => {
    try {
      const currentFile = pdfFiles.find(({ file }) => file.name === file_name);
      const file = currentFile.file;
      if (!file) {
        console.log('Fayl topilmadi.');
        return;
      }

      // Faylni ArrayBuffer formatida o'qing
      const arrayBuffer = await file.arrayBuffer();

      // PDF faylni o'qish
      const pdfData = new Uint8Array(arrayBuffer);

      // pdfjsLib yordamida PDFni yuklash
      const data = await extractQRCodeFromPDF(pdfData);

      setCurrentFile(file_name);
      if (!data.ok) {
        return toast.error(data.message);
      }
      if (data.result.split('_')[0] !== 'ariza') {
        return toast.error("Noma'lum QR kod");
      }
      let ariza = (await api.get('/arizalar/' + data.result.split('_')[1])).data;
      if (!ariza.ok) {
        return toast.error(ariza.message);
      }
      ariza = ariza.ariza;
      if (ariza.document_number != data.result.split('_')[2]) {
        return toast.error("QR koddagi va bazadagi ariza raqamlari o'zaro mos emas");
      }
      setAriza({ ...ariza, isScanedFromQR: true });
    } catch (error) {
      console.error(error);
    }
  };

  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    setRows(pdfFiles);
    setSearchQuery('');
  }, [pdfFiles]);
  useEffect(() => {
    if (!searchQuery) {
      setRows(pdfFiles);
    } else {
      setRows(
        pdfFiles.filter(({ file }) => {
          console.log(file?.name?.toLowerCase());
          console.log(searchQuery.toLowerCase());
          return file?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    }
  }, [searchQuery]);

  return (
    <Grid container height={'100%'}>
      <Grid item xs={12}>
        <TextField placeholder="Qidirish" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} fullWidth />
      </Grid>
      <Grid item xs={12} height={'100%'}>
        <List sx={{ overflowY: 'auto', height: 'calc(100% - 5vh)' }}>
          {rows.map((pdfFile, i) => (
            <ListItem key={pdfFile.file.name}>
              <ListItemButton
                // sx={{ color: theme.colors.menuSelected }}
                sx={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  paddingRight: '10px',
                  color: currentFile?.file?.name == pdfFile.file?.name ? theme.colors.menuSelected : '',
                  background: currentFile?.file?.name == pdfFile.file?.name ? theme.colors.menuSelectedBack : ''
                }}
                onClick={() => handleListItemClick(pdfFile.file.name)}
              >
                {i + 1}. {pdfFile.file.name}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Grid>
    </Grid>
  );
}

export default FilesList;
