import { Box, Divider, Grid, List, ListItem, ListItemButton, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import useStore from './hooks/useStore';
import { useUiStore } from './hooks/useUiStore';
import { t } from 'i18next';
import FileInputDrop from 'ui-component/FileInputDrop';

function FilesList() {
  const { pdfFiles, processFile } = useStore();
  const { setPdfFileLoading } = useUiStore();

  // handlers
  const handleListItemClick = async (file_name: string) => {
    setPdfFileLoading(true);
    await processFile(file_name);
    setPdfFileLoading(false);
  };

  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    setSearchQuery('');
  }, [pdfFiles]);

  const filteredFiles = pdfFiles.filter(({ file }) => file?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const countText = t('countFiles', { cnt: filteredFiles.length });

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <TextField
        placeholder={t('tableActions.search-file') + '...'}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
      />
      <Divider sx={{ mt: 1 }} />
      <Typography variant="h5" sx={{ mt: 1 }}>
        {t('countFiles', { cnt: filteredFiles.length })}
      </Typography>
      <List sx={{ overflowY: 'auto', flex: 1 }}>
        {filteredFiles.map((pdfFile, i) => (
          <ListItem key={pdfFile.file.name}>
            <ListItemButton
              selected={pdfFile.active}
              sx={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', paddingRight: '10px' }}
              onClick={() => handleListItemClick(pdfFile.file.name)}
            >
              {i + 1}. {pdfFile.file.name}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default FilesList;
