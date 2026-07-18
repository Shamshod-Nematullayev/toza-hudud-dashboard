import { Box, Stack, Typography, useTheme } from '@mui/material';
import { PictureAsPdfOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { t } from 'i18next';

export function NoFileSelectedState() {
  const theme = useTheme();

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
        position: 'relative',
        overflow: 'hidden',
        p: 4,
        minHeight: 'calc(100vh - 130px)'
      }}
    >
      {/* Chapga yo'naltiruvchi dinamik ko'prik (Pulse Ring) */}
      <Box
        sx={{
          position: 'absolute',
          left: '-20px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, -15, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4
            }}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: theme.palette.primary.main
            }}
          />
        ))}
      </Box>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', zIndex: 3 }}
      >
        <Stack sx={{ alignItems: 'center' }} spacing={3}>
          {/* Markaziy Ramz */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              boxShadow: `0 0 20px ${theme.palette.primary.light}`
            }}
          >
            <PictureAsPdfOutlined sx={{ fontSize: 40 }} />
          </Box>

          {/* Matnli muloqot */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }} color="text.primary" gutterBottom>
              {t('Fayl tanlanmagan')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300, mx: 'auto' }}>
              {t('Davom etish uchun chap tomondagi ro‘yxatdan kerakli faylni tanlang')}
            </Typography>
          </Box>

          {/* Harakatga chorlovchi tugma yoki ishora */}
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Box
              sx={{
                py: 0.5,
                px: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.main',
                color: 'primary.main',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1
              }}
            >
              {t('Kutilmoqda')}
            </Box>
          </motion.div>
        </Stack>
      </motion.div>

      {/* Fon uchun xira bezak (Background Decor) */}
      <Box
        sx={{
          position: 'absolute',
          right: -50,
          bottom: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          zIndex: 1
        }}
      />
    </Box>
  );
}
