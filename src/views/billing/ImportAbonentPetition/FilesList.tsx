import { Grid, List, ListItem, ListItemButton, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import useStore from './useStore';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { getArizaById } from 'services/getArizaById';
import { extractQRCodeFromPDF } from 'views/tools/extractQRCodeFromPDF';

function FilesList() {
  const { pdfFiles, setCurrentFile, currentFile, setAriza } = useStore();
  const theme = useTheme();

  // handlers
  const handleListItemClick = async (file_name: string) => {
    setAriza({});
    try {
      const currentFile = pdfFiles.find(({ file }) => file.name === file_name);
      const file = currentFile.file;
      if (!file) {
        toast.error('Fayl topilmadi.');
        return;
      }

      // Fayldan QR kod ma'lumotlarini olish
      const data = await extractQRCodeFromPDF(new Uint8Array(await file.arrayBuffer()), 1);

      setCurrentFile(file_name);
      if (!data.ok) {
        return toast.error(data.message);
      }
      const [key, id, document_number] = data.result.split('_');
      if (key !== 'ariza') {
        return toast.error("Noma'lum QR kod");
      }
      const ariza = await getArizaById(id);
      if (ariza.document_number !== Number(document_number)) {
        return toast.error("QR koddagi va bazadagi ariza raqamlari o'zaro mos emas");
      }
      if (ariza.document_type === 'pul_kuchirish') {
        return toast.info("Pul ko'chirish arizalari: Maxsus aktlar / Pul ko'chirish bo'limi orqali amalga oshiriladi", {
          autoClose: false
        });
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
