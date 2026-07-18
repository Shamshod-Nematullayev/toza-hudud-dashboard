import { useEffect, useState, useRef } from 'react';
import { MurojaatRow } from '../types';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { Box, Button, DialogActions, DialogContent, Stack, Typography, TextField, CircularProgress, IconButton, Checkbox, FormControlLabel, RadioGroup, Radio, Alert } from '@mui/material';
import api from 'utils/api';
import FileInputDrop from 'ui-component/FileInputDrop';
import { toast } from 'react-toastify';
import { Delete, CloudUpload, CheckCircle, Close } from '@mui/icons-material';

export function CloseMurojaatDialog({
  open,
  row,
  onClose,
  onSuccess,
  file,
  setFile
}: {
  open: boolean;
  row: MurojaatRow | null;
  onClose: () => void;
  onSuccess: () => void;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}) {
  const [residentId, setResidentId] = useState<number | null>(null);
  const [abonentDetails, setAbonentDetails] = useState<any | null>(null);
  const [abonentLoading, setAbonentLoading] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [noAbonent, setNoAbonent] = useState(false);
  const [pasteTarget, setPasteTarget] = useState<'gps' | 'additional'>('gps');
  const [submitting, setSubmitting] = useState(false);

  const [gpsPhotoFileId, setGpsPhotoFileId] = useState<string | null>(null);
  const [gpsPreview, setGpsPreview] = useState<string | null>(null);
  const [gpsUploading, setGpsUploading] = useState(false);
  const [dragOverGps, setDragOverGps] = useState(false);

  const [additionalPhotos, setAdditionalPhotos] = useState<Array<{ file: File; id: string; preview: string }>>([]);
  const [additionalUploading, setAdditionalUploading] = useState(false);
  const [dragOverAdditional, setDragOverAdditional] = useState(false);

  const gpsInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  const fetchAbonentDetails = async (resId: number) => {
    try {
      setAbonentLoading(true);
      const { data } = await api.get('/billing/get-abonent-details/' + resId);
      setAbonentDetails(data);
      setResidentId(resId);
    } catch (err) {
      console.error(err);
      toast.error("Abonent ma'lumotlarini olishda xatolik yuz berdi");
    } finally {
      setAbonentLoading(false);
    }
  };

  const handleSearchAbonent = async () => {
    const acc = accountNumber.trim();
    if (!acc) {
      toast.error('Hisob raqamini kiriting');
      return;
    }
    try {
      setAbonentLoading(true);
      const { data } = await api.get('/billing/get-abonent-data-by-licshet/' + acc);
      if (data.ok && data.abonentData) {
        setAbonentDetails(data.abonentData);
        setResidentId(data.abonentData.id);
        toast.success('Abonent topildi');
      } else {
        toast.error(data.message || 'Abonent topilmadi');
      }
    } catch (err) {
      console.error(err);
      toast.error('Qidiruvda xatolik yuz berdi');
    } finally {
      setAbonentLoading(false);
    }
  };

  const handleClearAbonent = () => {
    setResidentId(null);
    setAbonentDetails(null);
    setAccountNumber('');
  };

  const processAndUploadGps = async (imageFile: File) => {
    try {
      setGpsUploading(true);
      const previewUrl = URL.createObjectURL(imageFile);
      setGpsPreview(previewUrl);

      const formData = new FormData();
      formData.append('file', imageFile);
      const { data } = await api.post('/fetchTelegram/create-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.ok === false || !data.document_id) {
        throw new Error(data.message || 'Error uploading file');
      }
      setGpsPhotoFileId(data.document_id);
      toast.success('GPS rasm yuklandi');
    } catch (err: any) {
      console.error(err);
      toast.error('GPS rasm yuklashda xatolik yuz berdi');
      setGpsPreview(null);
      setGpsPhotoFileId(null);
    } finally {
      setGpsUploading(false);
    }
  };

  const processAndUploadAdditional = async (imageFile: File) => {
    try {
      setAdditionalUploading(true);
      const previewUrl = URL.createObjectURL(imageFile);

      const formData = new FormData();
      formData.append('file', imageFile);
      const { data } = await api.post('/fetchTelegram/create-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.ok === false || !data.document_id) {
        throw new Error(data.message || 'Error uploading file');
      }

      setAdditionalPhotos((prev) => [
        ...prev,
        { file: imageFile, id: data.document_id, preview: previewUrl }
      ]);
      toast.success("Qo'shimcha rasm yuklandi");
    } catch (err: any) {
      console.error(err);
      toast.error("Qo'shimcha rasm yuklashda xatolik yuz berdi");
    } finally {
      setAdditionalUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent, setDragState: (val: boolean) => void) => {
    e.preventDefault();
    setDragState(true);
  };

  const handleDragLeave = (e: React.DragEvent, setDragState: (val: boolean) => void) => {
    e.preventDefault();
    setDragState(false);
  };

  const handleGpsDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverGps(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        await processAndUploadGps(droppedFile);
      } else {
        toast.error('Faqat rasm fayllarini yuklash mumkin');
      }
    }
  };

  const handleAdditionalDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverAdditional(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const imageFiles = filesArray.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        for (const imgFile of imageFiles) {
          await processAndUploadAdditional(imgFile);
        }
      } else {
        toast.error('Faqat rasm fayllarini yuklash mumkin');
      }
    }
  };

  const handleDialogPaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          if (pasteTarget === 'gps') {
            await processAndUploadGps(file);
          } else {
            await processAndUploadAdditional(file);
          }
          break;
        }
      }
    }
  };

  const handleGpsClick = () => {
    gpsInputRef.current?.click();
  };

  const handleAdditionalClick = () => {
    additionalInputRef.current?.click();
  };

  const handleGpsInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processAndUploadGps(e.target.files[0]);
    }
  };

  const handleAdditionalInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      for (const f of filesArray) {
        await processAndUploadAdditional(f);
      }
    }
  };

  useEffect(() => {
    if (open) {
      if (row?.residentId) {
        fetchAbonentDetails(row.residentId);
      } else {
        setResidentId(null);
        setAbonentDetails(null);
        setAccountNumber('');
      }
      setGpsPhotoFileId(null);
      setGpsPreview(null);
      setAdditionalPhotos([]);
      setNoAbonent(false);
      setPasteTarget('gps');
      setSubmitting(false);
    } else {
      setFile(null);
    }
  }, [open, row, setFile]);

  useEffect(() => {
    return () => {
      if (gpsPreview) URL.revokeObjectURL(gpsPreview);
      additionalPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, [gpsPreview, additionalPhotos]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (!row || !file || !gpsPhotoFileId || submitting) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('gpsPhotoFileId', gpsPhotoFileId);

      if (residentId) {
        formData.append('residentId', String(residentId));
      }

      if (additionalPhotos.length > 0) {
        additionalPhotos.forEach((photo, index) => {
          formData.append(`additionalPhotoFileIds[${index}]`, photo.id);
        });
      }

      await api.patch(`/murojaatlar/close/${row._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Murojaat muvaffaqiyatli yopildi');
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Murojaatni yopishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DraggableDialog title="Murojaatni yopish" open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogContent onPaste={handleDialogPaste}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2">
            Yopish hujjatini yuklang. Murojaat statusi <b>🟢 Yopiq</b> bo‘ladi.
          </Typography>

          <Box>
            <FileInputDrop setFiles={(files) => setFile(files![0])} fileType="pdf" clearTrigger={open} />
            {!file && (
              <Typography variant="caption" color="error">
                Yopish hujjati majburiy
              </Typography>
            )}
          </Box>

          {/* Abonent selection */}
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Abonent (Resident) biriktirish
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={noAbonent}
                    onChange={(e) => {
                      setNoAbonent(e.target.checked);
                      if (e.target.checked) {
                        handleClearAbonent();
                      } else {
                        if (row?.residentId) {
                          fetchAbonentDetails(row.residentId);
                        }
                      }
                    }}
                    color="warning"
                  />
                }
                label={
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Abonentsiz yopish
                  </Typography>
                }
                sx={{ mr: 0 }}
              />
            </Box>

            {noAbonent && (
              <Alert severity="warning" sx={{ mb: 2, py: 0.5 }}>
                Ogohlantirish: Abonentsiz yopish tavsiya etilmaydi!
              </Alert>
            )}

            {!noAbonent && (
              <>
                {abonentLoading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1, py: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2">Yuklanmoqda...</Typography>
                  </Box>
                ) : abonentDetails ? (
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5 }}>
                      <CheckCircle color="success" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {abonentDetails.fullName || abonentDetails.citizen?.firstName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Licshet: {abonentDetails.accountNumber || abonentDetails.licshet} | ID: {residentId}
                        </Typography>
                      </Box>
                    </Box>
                    {!row?.residentId && (
                      <Button size="small" color="error" onClick={handleClearAbonent}>
                        O'chirish
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <TextField
                      size="small"
                      label="Hisob raqami (Licshet)"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      fullWidth
                    />
                    <Button variant="outlined" onClick={handleSearchAbonent}>
                      Qidirish
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* Clipboard Paste Target Selector */}
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, bgcolor: 'action.hover' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: 'text.secondary' }}>
              Rasm buferidan joylash (Ctrl+V) nishonini tanlang:
            </Typography>
            <RadioGroup
              row
              value={pasteTarget}
              onChange={(e) => setPasteTarget(e.target.value as 'gps' | 'additional')}
              sx={{ gap: 2 }}
            >
              <FormControlLabel
                value="gps"
                control={<Radio size="small" />}
                label={<Typography variant="body2">GPS xulosasi rasmi</Typography>}
              />
              <FormControlLabel
                value="additional"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Qo'shimcha rasmlar</Typography>}
              />
            </RadioGroup>
          </Box>

          {/* GPS Photo (Required) */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                GPS xulosasi rasmi (Majburiy)
              </Typography>
              {pasteTarget === 'gps' && (
                <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                  ● Ctrl+V bu yerga joylaydi
                </Typography>
              )}
            </Box>
            <input
              type="file"
              accept="image/*"
              ref={gpsInputRef}
              style={{ display: 'none' }}
              onChange={handleGpsInputChange}
            />
            <Box
              onClick={handleGpsClick}
              onDragOver={(e) => handleDragOver(e, setDragOverGps)}
              onDragLeave={(e) => handleDragLeave(e, setDragOverGps)}
              onDrop={handleGpsDrop}
              tabIndex={0}
              sx={{
                border: '2px dashed',
                borderColor: dragOverGps || pasteTarget === 'gps' ? 'primary.main' : 'divider',
                bgcolor: dragOverGps ? 'action.hover' : (pasteTarget === 'gps' ? 'action.hover' : 'background.paper'),
                borderRadius: 2,
                p: gpsPreview ? 1 : 3,
                textAlign: 'center',
                cursor: 'pointer',
                outline: 'none',
                position: 'relative',
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                '&:focus': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
              }}
            >
              {gpsUploading ? (
                <CircularProgress size={30} />
              ) : gpsPreview ? (
                <Box sx={{ position: 'relative', width: '100%', maxWidth: 200, maxHeight: 150, overflow: 'hidden', borderRadius: 1 }}>
                  <img src={gpsPreview} alt="GPS Xulosasi" style={{ width: '100%', objectFit: 'contain' }} />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGpsPreview(null);
                      setGpsPhotoFileId(null);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <>
                  <CloudUpload color="action" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Faylni surib kelib tashlang yoki tanlash uchun bosing
                  </Typography>
                </>
              )}
            </Box>
            {!gpsPhotoFileId && !gpsUploading && (
              <Typography variant="caption" color="error">
                GPS rasmi majburiy
              </Typography>
            )}
          </Box>

          {/* Additional Photos (Optional) */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Qo'shimcha rasmlar (Ixtiyoriy)
              </Typography>
              {pasteTarget === 'additional' && (
                <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                  ● Ctrl+V bu yerga joylaydi
                </Typography>
              )}
            </Box>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={additionalInputRef}
              style={{ display: 'none' }}
              onChange={handleAdditionalInputChange}
            />
            <Box
              onClick={handleAdditionalClick}
              onDragOver={(e) => handleDragOver(e, setDragOverAdditional)}
              onDragLeave={(e) => handleDragLeave(e, setDragOverAdditional)}
              onDrop={handleAdditionalDrop}
              tabIndex={0}
              sx={{
                border: '2px dashed',
                borderColor: dragOverAdditional || pasteTarget === 'additional' ? 'primary.main' : 'divider',
                bgcolor: dragOverAdditional ? 'action.hover' : (pasteTarget === 'additional' ? 'action.hover' : 'background.paper'),
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                outline: 'none',
                mb: 1.5,
                transition: 'all 0.2s ease',
                '&:focus': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
              }}
            >
              <CloudUpload color="action" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Fayllarni surib tashlang yoki tanlash uchun bosing
              </Typography>
            </Box>

            {/* Previews Grid */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap' }}>
              {additionalPhotos.map((photo, index) => (
                <Box
                  key={photo.id}
                  sx={{
                    position: 'relative',
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden'
                  }}
                >
                  <img src={photo.preview} alt={`Qo'shimcha ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAdditionalPhotos((prev) => prev.filter((p) => p.id !== photo.id));
                    }}
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      p: 0.2,
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                    }}
                  >
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
              {additionalUploading && (
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    border: '1px dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CircularProgress size={20} />
                </Box>
              )}
            </Box>
          </Box>

        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>Bekor qilish</Button>
        <Button
          variant="contained"
          disabled={!file || !gpsPhotoFileId || gpsUploading || additionalUploading || (!residentId && !noAbonent) || submitting}
          onClick={handleSubmit}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {submitting ? 'Yopilmoqda...' : 'Yopish'}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}
