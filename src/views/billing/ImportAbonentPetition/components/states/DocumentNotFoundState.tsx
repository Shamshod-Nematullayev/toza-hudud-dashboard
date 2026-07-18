import { Box, Button, Divider, IconButton, Stack, TextField, Typography, useTheme } from '@mui/material';
import { Keyboard, RefreshOutlined as RefreshOutlinedIcon, SearchOffOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { t } from 'i18next';
import ChooseArizaPopper from '../../ChooseArizaPopper';
import useStore from '../../hooks/useStore';

interface DocumentNotFoundStateProps {
  arizaNumberInput: string;
  setArizaNumberInput: (val: string) => void;
  handleClickRefreshButton: () => void;
  isLoading: boolean;
  ui: any;
  setManualEditing: (val: boolean) => void;
  setEnteringMode: (mode: 'ariza' | 'manual') => void;
}

export function DocumentNotFoundState({
  arizaNumberInput,
  setArizaNumberInput,
  handleClickRefreshButton,
  isLoading,
  ui,
  setManualEditing,
  setEnteringMode
}: DocumentNotFoundStateProps) {
  const theme = useTheme();
  const btnRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        p: 4
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 450 }}
      >
        <Stack spacing={4} sx={{ alignItems: 'center' }}>
          {/* Skanerlash xatosi ramzi */}
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: 'error.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'error.main'
              }}
            >
              <SearchOffOutlined sx={{ fontSize: 50 }} />
            </Box>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                border: `2px solid ${theme.palette.error.main}`
              }}
            />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }} color="text.primary" gutterBottom>
              {t('Hujjat topilmadi')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('QR kodni o‘qib bo‘lmadi yoki ma’lumot bazada mavjud emas. Iltimos, raqamni o‘zingiz kiriting.')}
            </Typography>
          </Box>

          {/* Qidiruv Formasi */}
          <Box sx={{ width: '100%', p: 3, borderRadius: 3, bgcolor: 'action.hover' }}>
            <Stack spacing={2.5}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleClickRefreshButton();
                }}
              >
                <div ref={btnRef}>
                  <TextField
                    fullWidth
                    label={t('documentNumber')}
                    variant="outlined"
                    value={arizaNumberInput}
                    onChange={(e) => setArizaNumberInput(e.target.value)}
                    autoFocus
                    placeholder="Masalan: 123456"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <IconButton color="primary" onClick={handleClickRefreshButton}>
                            <RefreshOutlinedIcon />
                          </IconButton>
                        )
                      }
                    }}
                  />
                </div>
              </form>

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={!arizaNumberInput || isLoading}
                onClick={handleClickRefreshButton}
                sx={{ py: 1.5, fontWeight: 600 }}
              >
                {t('Raqam bo‘yicha qidirish')}
              </Button>
              <ChooseArizaPopper
                anchorEl={btnRef.current}
                open={ui.arizaChooseDialog}
                handleClose={() => useStore.setState({ ui: { ...ui, arizaChooseDialog: false } })}
              />

              <Divider>
                <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase' }}>
                  {t('yoki')}
                </Typography>
              </Divider>

              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                startIcon={<Keyboard />}
                onClick={() => {
                  setManualEditing(true);
                  setEnteringMode('manual');
                }}
                sx={{ py: 1.2 }}
              >
                {t('Qo‘lda kiritish rejimiga o‘tish')}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </motion.div>
    </Box>
  );
}
