import { List, ListItem, ListItemButton } from '@mui/material';
import React from 'react';
import useStore from './useStore';
import { useTheme } from '@mui/material/styles';

function FilesList() {
  const { pdfFiles, setCurrentFile, currentFile } = useStore();
  const theme = useTheme();

  // handlers
  const handleListItemClick = (file_name) => {
    setCurrentFile(file_name);
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
              color: currentFile.file?.name == pdfFile.file?.name ? theme.colors.menuSelected : '',
              background: currentFile.file?.name == pdfFile.file?.name ? theme.colors.menuSelectedBack : ''
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
