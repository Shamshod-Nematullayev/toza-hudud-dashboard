import { List, ListItem, ListItemButton } from '@mui/material';
import React from 'react';
import useStore from './useStore';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import api from 'utils/api';

function FilesList() {
  const { pdfFiles, setCurrentFile, currentFile, setAriza } = useStore();
  const theme = useTheme();

  // handlers
  const handleListItemClick = async (file_name) => {
    try {
      const currentFile = pdfFiles.find(({ file }) => file.name === file_name);
      const { data } = await api.post(
        '/arizalar/scan_ariza_qr',
        { file: currentFile.blob },
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (!data.ok) {
        return toast.error(response.result);
      }
      if (data.result.split('_')[0] !== 'ariza') {
        return toast.error("Noma'lum QR kod");
      }
      let ariza = await api.get('/arizalar/get-ariza-by-id/' + data.result.split("_"))[1];
      if (!ariza.ok) {
        return toast.error(ariza.message)
      }
      ariza = ariza.ariza
      if (ariza.document_number != response.result.split("_")[2]) {
        return toast.error(
          "QR koddagi va bazadagi ariza raqamlari o'zaro mos emas"
        );
      }
      setAriza({ ...ariza, isScanedFromQR: true })
      setCurrentFile(file_name);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    }
  };
  return (
    <List sx={{ width: 200, overflowY: 'auto' }}>
      {pdfFiles.map((pdfFile, i) => (
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
  );
}

export default FilesList;
