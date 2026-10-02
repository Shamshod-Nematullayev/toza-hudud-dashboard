import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  Tooltip,
  CircularProgress,
  Chip,
  useTheme,
  alpha,
  DialogContentText
} from '@mui/material';
import {
  Close,
  NavigateBefore,
  NavigateNext,
  ZoomIn,
  ZoomOut,
  RestartAlt,
  RotateRight,
  Download,
  DeleteOutlined,
  AddPhotoAlternateOutlined,
  CollectionsOutlined,
  OpenInNew
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from 'utils/api';
import useArizaStore from './useStore';

interface AttachedImagesModalProps {
  open: boolean;
  onClose: () => void;
}

interface ImageState {
  url: string;
  loading: boolean;
  error: boolean;
}

const AttachedImagesModal: React.FC<AttachedImagesModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { ariza, setAriza, setPasteImgModalOpen } = useArizaStore();

  const photoIds: string[] = Array.isArray(ariza?.tempPhotos)
    ? ariza.tempPhotos.filter((id: any): id is string => typeof id === 'string' && id.trim().length > 0)
    : [];
  const photoIdsKey = photoIds.join(',');

  const requestedIdsRef = useRef<Set<string>>(new Set());
  const createdBlobUrlsRef = useRef<string[]>([]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imagesMap, setImagesMap] = useState<Record<string, ImageState>>({});
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Keep index within bounds
  useEffect(() => {
    if (selectedIndex >= photoIds.length && photoIds.length > 0) {
      setSelectedIndex(photoIds.length - 1);
    }
  }, [photoIds.length, selectedIndex]);

  // Reset zoom & rotation when switching image
  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [selectedIndex]);

  // Fetch images as blob URLs (each fileId requested at most once)
  useEffect(() => {
    if (!open || photoIds.length === 0) return;

    photoIds.forEach((fileId) => {
      if (!fileId || requestedIdsRef.current.has(fileId)) return;
      requestedIdsRef.current.add(fileId);

      setImagesMap((prev) => ({
        ...prev,
        [fileId]: { url: '', loading: true, error: false }
      }));

      api
        .get(`/fetchTelegram/${fileId}`, {
          responseType: 'blob',
          headers: { 'hide-error': true }
        })
        .then((res) => {
          const blobUrl = URL.createObjectURL(res.data);
          createdBlobUrlsRef.current.push(blobUrl);
          setImagesMap((prev) => ({
            ...prev,
            [fileId]: { url: blobUrl, loading: false, error: false }
          }));
        })
        .catch((err) => {
          console.warn(`Could not load Telegram image ${fileId}:`, err?.message);
          setImagesMap((prev) => ({
            ...prev,
            [fileId]: { url: '', loading: false, error: true }
          }));
        });
    });
  }, [open, photoIdsKey]);

  // Clean up blob URLs when modal is closed
  useEffect(() => {
    if (!open) {
      createdBlobUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      createdBlobUrlsRef.current = [];
      requestedIdsRef.current.clear();
      setImagesMap({});
      setSelectedIndex(0);
      setZoom(1);
      setRotation(0);
    }
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      createdBlobUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      createdBlobUrlsRef.current = [];
    };
  }, []);

  const handlePrev = useCallback(() => {
    if (photoIds.length <= 1) return;
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : photoIds.length - 1));
  }, [photoIds.length]);

  const handleNext = useCallback(() => {
    if (photoIds.length <= 1) return;
    setSelectedIndex((prev) => (prev < photoIds.length - 1 ? prev + 1 : 0));
  }, [photoIds.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (deleteConfirmOpen) return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handlePrev, handleNext, onClose, deleteConfirmOpen]);

  const currentFileId = photoIds[selectedIndex] || '';
  const currentImage = imagesMap[currentFileId];

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  // Download handler
  const handleDownload = () => {
    if (!currentImage?.url) return;
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = `ariza_${ariza?.document_number || ariza?._id || 'photo'}_${selectedIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open in new tab
  const handleOpenInNewTab = () => {
    if (!currentImage?.url) return;
    window.open(currentImage.url, '_blank');
  };

  // Delete current image
  const handleDeleteImage = async () => {
    if (!ariza?._id || !currentFileId) return;
    try {
      setIsDeleting(true);
      const res = await api.put(`/arizalar/remove-image/${ariza._id}`, { file_id: currentFileId });
      if (res.data?.ariza) {
        setAriza(res.data.ariza);
      }
      toast.success(t('messages.imageDeleted', 'Rasm o‘chirildi'));
      setDeleteConfirmOpen(false);
      // Revoke deleted URL
      if (currentImage?.url) {
        URL.revokeObjectURL(currentImage.url);
      }
      setImagesMap((prev) => {
        const next = { ...prev };
        delete next[currentFileId];
        return next;
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || t('messages.error', 'Rasmni o‘chirishda xatolik yuz berdi'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }
          }
        }}
      >
        {/* Modal Header */}
        <DialogTitle
          sx={{
            p: 2,
            px: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: (th) => (th.palette.mode === 'dark' ? alpha(th.palette.common.white, 0.02) : 'grey.50')
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (th) => alpha(th.palette.primary.main, 0.1),
                color: 'primary.main'
              }}
            >
              <CollectionsOutlined fontSize="small" />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {t('recalculationDetailPage.viewImages', 'Biriktirilgan rasmlar')}
                </Typography>
                <Chip
                  size="small"
                  label={`${photoIds.length} ${t('common.pieces', 'ta')}`}
                  color={photoIds.length > 0 ? 'primary' : 'default'}
                  sx={{ fontWeight: 600, height: 22, fontSize: '0.75rem' }}
                />
              </Stack>
              {ariza?.document_number && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t('petitionDrawer.number', 'Ariza')} #{ariza.document_number}
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddPhotoAlternateOutlined />}
              onClick={() => setPasteImgModalOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              {t('buttons.add', 'Rasm biriktirish')}
            </Button>
            <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
              <Close fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>

        {/* Modal Content */}
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
            bgcolor: (th) => (th.palette.mode === 'dark' ? '#0f172a' : '#f8fafc')
          }}
        >
          {photoIds.length === 0 ? (
            /* Empty State */
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 6,
                minHeight: 380,
                textAlign: 'center'
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: (th) => alpha(th.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <CollectionsOutlined sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {t('recalculationDetailPage.noImagesFound', 'Biriktirilgan rasmlar mavjud emas')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420, mb: 3 }}>
                {t(
                  'recalculationDetailPage.noImagesDesc',
                  'Ushbu arizaga hali hech qanday rasm yoki fotosurat biriktirilmagan. Yangi rasm yuklash uchun quyidagi tugmani bosing.'
                )}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddPhotoAlternateOutlined />}
                onClick={() => setPasteImgModalOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                {t('recalculationDetailPage.attachImage', 'Rasm biriktirish')}
              </Button>
            </Box>
          ) : (
            /* Active Gallery & Viewer */
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 460 }}>
              {/* Toolbar */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {selectedIndex + 1} / {photoIds.length}
                </Typography>

                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Tooltip title={t('common.zoomIn', 'Kattalashtirish')}>
                    <span>
                      <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 3}>
                        <ZoomIn fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t('common.zoomOut', 'Kichraytirish')}>
                    <span>
                      <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                        <ZoomOut fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t('common.resetZoom', 'Dastlabki holat')}>
                    <IconButton size="small" onClick={handleResetView}>
                      <RestartAlt fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common.rotate', 'Aylantirish')}>
                    <IconButton size="small" onClick={handleRotate}>
                      <RotateRight fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Box sx={{ width: 1, height: 20, bgcolor: 'divider', mx: 0.5 }} />

                  <Tooltip title={t('common.download', 'Yuklab olish')}>
                    <span>
                      <IconButton size="small" onClick={handleDownload} disabled={!currentImage?.url}>
                        <Download fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title={t('common.openNewTab', 'Yangi oynada ochish')}>
                    <span>
                      <IconButton size="small" onClick={handleOpenInNewTab} disabled={!currentImage?.url}>
                        <OpenInNew fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title={t('tableActions.delete', 'O‘chirish')}>
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteConfirmOpen(true)}
                        disabled={!currentFileId}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Box>

              {/* Main Image Stage */}
              <Box
                sx={{
                  flex: 1,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  p: 2,
                  minHeight: 320
                }}
              >
                {/* Navigation: Prev Button */}
                {photoIds.length > 1 && (
                  <IconButton
                    onClick={handlePrev}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      zIndex: 2,
                      bgcolor: (th) => alpha(th.palette.background.paper, 0.85),
                      boxShadow: 3,
                      backdropFilter: 'blur(4px)',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                  >
                    <NavigateBefore />
                  </IconButton>
                )}

                {/* Navigation: Next Button */}
                {photoIds.length > 1 && (
                  <IconButton
                    onClick={handleNext}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      zIndex: 2,
                      bgcolor: (th) => alpha(th.palette.background.paper, 0.85),
                      boxShadow: 3,
                      backdropFilter: 'blur(4px)',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                  >
                    <NavigateNext />
                  </IconButton>
                )}

                {/* Active Image Content */}
                {currentImage?.loading ? (
                  <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
                    <CircularProgress size={36} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('loading', 'Rasm yuklanmoqda...')}
                    </Typography>
                  </Stack>
                ) : currentImage?.error ? (
                  <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                      {t('messages.error', 'Rasmni yuklab bo‘lmadi')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      ID: {currentFileId}
                    </Typography>
                  </Stack>
                ) : currentImage?.url ? (
                  <Box
                    component="img"
                    src={currentImage.url}
                    alt={`Attached image ${selectedIndex + 1}`}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 'calc(90vh - 280px)',
                      objectFit: 'contain',
                      borderRadius: 1.5,
                      boxShadow: (th) =>
                        th.palette.mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.6)' : '0 8px 24px rgba(0,0,0,0.12)',
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease-out',
                      userSelect: 'none'
                    }}
                  />
                ) : null}
              </Box>

              {/* Bottom Thumbnails Strip */}
              {photoIds.length > 1 && (
                <Box
                  sx={{
                    p: 1.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': { height: 6 },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'divider',
                      borderRadius: 3
                    }
                  }}
                >
                  {photoIds.map((fileId, index) => {
                    const thumb = imagesMap[fileId];
                    const isSelected = index === selectedIndex;
                    return (
                      <Box
                        key={fileId}
                        onClick={() => setSelectedIndex(index)}
                        sx={{
                          position: 'relative',
                          width: 64,
                          height: 64,
                          flexShrink: 0,
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          opacity: isSelected ? 1 : 0.65,
                          transition: 'all 0.15s ease',
                          bgcolor: 'background.default',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isSelected ? (th) => `0 0 0 2px ${alpha(th.palette.primary.main, 0.25)}` : 'none',
                          '&:hover': {
                            opacity: 1,
                            borderColor: isSelected ? 'primary.main' : 'text.secondary'
                          }
                        }}
                      >
                        {thumb?.loading ? (
                          <CircularProgress size={18} />
                        ) : thumb?.url ? (
                          <img
                            src={thumb.url}
                            alt={`Thumbnail ${index + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                            #{index + 1}
                          </Typography>
                        )}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 2,
                            right: 2,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            px: 0.5,
                            borderRadius: 0.5,
                            fontSize: 9,
                            fontWeight: 700,
                            lineHeight: 1.2
                          }}
                        >
                          {index + 1}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !isDeleting && setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {t('recalculationDetailPage.confirmDeleteImageTitle', 'Rasmni o‘chirish')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            {t(
              'recalculationDetailPage.confirmDeleteImageDesc',
              'Haqiqatan ham ushbu biriktirilgan rasmni arizadan o‘chirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1.5 }}>
          <Button color="inherit" onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>
            {t('tableActions.cancel', 'Bekor qilish')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteImage}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlined />}
          >
            {isDeleting ? t('loading', 'O‘chirilmoqda...') : t('tableActions.delete', 'O‘chirish')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AttachedImagesModal;
