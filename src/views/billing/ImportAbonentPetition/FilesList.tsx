import { Grid, List, ListItem, ListItemButton, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import useStore from './useStore';
import { useTranslation } from 'react-i18next';
import { useUiStore } from './hooks/useUiStore';

function FilesList() {
  const { pdfFiles, processFile } = useStore();
  const { setPdfFileLoading } = useUiStore();
  const { t } = useTranslation();

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

  return (
    <Grid container height={'100%'}>
      <Grid item xs={12}>
        <TextField placeholder={t('search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} fullWidth />
      </Grid>
      <Grid item xs={12} height={'100%'}>
        <List sx={{ overflowY: 'auto', height: 'calc(100% - 5vh)' }}>
          {filteredFiles.map((pdfFile, i) => (
            <ListItem key={pdfFile.file.name}>
              <ListItemButton
                selected={pdfFile.active}
                sx={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  paddingRight: '10px'
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
