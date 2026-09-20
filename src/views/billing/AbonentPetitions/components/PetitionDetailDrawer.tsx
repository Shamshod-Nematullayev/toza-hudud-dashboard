import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  Close,
  NavigateBefore,
  NavigateNext,
  OpenInNew,
  PublishedWithChanges,
  RestartAlt,
  MoveToInboxOutlined,
  CancelOutlined,
  PrintOutlined,
  AddPhotoAlternateOutlined
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from 'utils/api';
import useArizaStore from '../../AbonentPetition/useStore';
import AktChangerModal from '../../AbonentPetition/AktChangerModal';
import PasteImageDialog from '../../AbonentPetition/PasteImageDialog';
import PDFViewer from '../../AbonentPetition/PDFViewer';
import DHJTable from '../../AbonentPetition/DHJTable';
import AktInfoCard from '../../AbonentPetition/AktInfoCard';

interface PetitionDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  arizaId: string | null;
  rows: any[];
  onOpenRejectDialog: (row: any) => void;
  onMoveToInbox: (id: string) => void;
  onPrint: (id: string) => void;
  printingId: string | null;
  onReloadList: () => void;
}

const PetitionDetailDrawer: React.FC<PetitionDetailDrawerProps> = ({
  open,
  onClose,
  arizaId,
  rows,
  onOpenRejectDialog,
  onMoveToInbox,
  onPrint,
  printingId,
  onReloadList
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const { ariza, setAriza, aktFileURL, setAktFileURL, pasteImgModalOpen, setPasteImgModalOpen } = useArizaStore();

  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<'info' | 'files' | 'dhj'>('info');
  const [showAktModal, setShowAktModal] = useState(false);
  const [isUpdatingFromBilling, setIsUpdatingFromBilling] = useState(false);
  const [dhjRows, setDhjRows] = useState<any[]>([]);

  // Find index of the currently selected row for Prev/Next navigation
  const currentIndex = rows.findIndex((r) => r._id === arizaId);

  const handleNavigate = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < rows.length) {
      const nextItem = rows[newIndex];
      if (nextItem?._id) {
        fetchArizaDetail(nextItem._id);
      }
    }
  };

  const fetchArizaDetail = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        const res = await api.get(`/arizalar/${id}`);
        const arizaData = res.data?.ariza;
        setAriza(arizaData);

        // Fetch PDF/File
        if (arizaData?.aktInfo?.fileId) {
          try {
            const fileRes = await api.get('/billing/get-file/', {
              params: { file_id: arizaData.aktInfo.fileId }
            });
            setAktFileURL(fileRes.data?.file || null);
          } catch {
            setAktFileURL(null);
          }
        } else {
          setAktFileURL(null);
        }

        // Fetch DHJ
        if (arizaData?.abonentId) {
          try {
            const dxjRes = await api.get('/billing/get-abonent-dxj-by-id', {
              params: { residentId: arizaData.abonentId }
            });
            setDhjRows(
              (dxjRes.data?.rows || []).map((row: any, i: number) => ({
                id: i + 1,
                hisoblandi: row.accrual,
                davr: row.period,
                tushum: row.allPaymentsSum,
                act: row.actAmount,
                saldo_oxiri: row.kSaldo
              }))
            );
          } catch {
            setDhjRows([]);
          }
        } else {
          setDhjRows([]);
        }
      } catch (error) {
        console.error(error);
        toast.error(t('messages.error', 'Ariza ma’lumotlarini yuklashda xatolik'));
      } finally {
        setIsLoading(false);
      }
    },
    [setAriza, setAktFileURL, t]
  );

  useEffect(() => {
    if (open && arizaId) {
      fetchArizaDetail(arizaId);
    }
  }, [open, arizaId, fetchArizaDetail]);

  // Synchronize / Update from Tozamakon billing
  const handleUpdateFromBilling = async () => {
    if (!ariza?._id) return;
    try {
      setIsUpdatingFromBilling(true);
      const res = await api.put(`/arizalar/update-from-billing/${ariza._id}`);
      const updatedAriza = res.data?.ariza;
      setAriza(updatedAriza);
      toast.success(t('messages.success', 'Billing tizimidan yangilandi!'));
      onReloadList();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || t('messages.error', 'Xatolik yuz berdi'));
    } finally {
      setIsUpdatingFromBilling(false);
    }
  };

  const isAcceptDisabled = ariza?.status !== 'yangi';
  const isCancelDisabled = ariza?.status === 'tasdiqlangan' || ariza?.status === 'bekor qilindi';
  const isPrintingThis = printingId === ariza?._id;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: '80%', md: '55%', lg: '45%' },
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 8,
              borderLeft: '1px solid',
              borderColor: 'divider'
            }
          }
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50'
          }}
        >
          {/* Left: Document Info */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>
              #{ariza?.document_number || '---'}
            </Typography>

            {ariza?.status && (
              <Chip
                label={ariza.status}
                color={
                  ariza.status === 'tasdiqlangan' ? 'success' : ariza.status === 'bekor qilindi' ? 'error' : 'primary'
                }
                size="small"
                sx={{ fontWeight: 700 }}
              />
            )}

            {ariza?.licshet && (
              <Chip
                label={ariza.licshet}
                size="small"
                variant="outlined"
                sx={{ fontFamily: 'monospace', fontWeight: 700 }}
              />
            )}
          </Stack>

          {/* Right: Prev / Next Navigation & Close */}
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            {rows.length > 1 && (
              <>
                <Tooltip title="Oldingi ariza">
                  <span>
                    <IconButton
                      size="small"
                      disabled={currentIndex <= 0}
                      onClick={() => handleNavigate(currentIndex - 1)}
                    >
                      <NavigateBefore />
                    </IconButton>
                  </span>
                </Tooltip>

                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', px: 0.5 }}>
                  {currentIndex >= 0 ? `${currentIndex + 1} / ${rows.length}` : ''}
                </Typography>

                <Tooltip title="Keyingi ariza">
                  <span>
                    <IconButton
                      size="small"
                      disabled={currentIndex >= rows.length - 1 || currentIndex < 0}
                      onClick={() => handleNavigate(currentIndex + 1)}
                    >
                      <NavigateNext />
                    </IconButton>
                  </span>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto', mx: 0.5 }} />
              </>
            )}

            <Tooltip title="To‘liq sahifada ochish">
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  if (ariza?._id) {
                    navigate(`/billing/recalculation/${ariza._id}`);
                  }
                }}
              >
                <OpenInNew fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Yopish">
              <IconButton size="small" onClick={onClose}>
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Tabs Bar */}
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={(e, val) => setCurrentTab(val)}
            variant="fullWidth"
            sx={{
              minHeight: 44,
              '& .MuiTab-root': {
                minHeight: 44,
                py: 1,
                fontWeight: 600,
                fontSize: '0.85rem'
              }
            }}
          >
            <Tab value="info" label={t('recalculationDetailPage.tabInfo', 'Tafsilotlar & Akt')} />
            <Tab value="files" label={t('recalculationDetailPage.tabFiles', 'Fayl / PDF Preview')} />
            <Tab value="dhj" label={t('recalculationDetailPage.tabDhj', 'DHJ Tarixi')} />
          </Tabs>
        </Box>

        {/* Drawer Body */}
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Tab 1: Info & Akt Details */}
              {currentTab === 'info' && (
                <Stack spacing={2}>
                  {/* Abonent Summary Box */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'background.paper'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: 'primary.main' }}>
                      Mijoz ma‘lumotlari
                    </Typography>

                    <Stack spacing={1}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          F.I.Sh:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ariza?.fio || ariza?.fullName || '-'}
                        </Typography>
                      </Stack>

                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Hisob raqami:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {ariza?.licshet || '-'}
                        </Typography>
                      </Stack>

                      {ariza?.ikkilamchi_licshet && (
                        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Ikkilamchi hisob:
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            {ariza.ikkilamchi_licshet}
                          </Typography>
                        </Stack>
                      )}

                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Hujjat turi:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {String(t(`documentTypes.${ariza?.document_type}`, ariza?.document_type || '-'))}
                        </Typography>
                      </Stack>

                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Yashovchilar (eski / yangi):
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ariza?.current_prescribed_cnt ?? '-'} kishi &rarr; {ariza?.next_prescribed_cnt ?? '-'} kishi
                        </Typography>
                      </Stack>

                      {ariza?.comment && (
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Ariza izohi:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>
                            {ariza.comment}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Box>

                  {/* Akt Info Card */}
                  <AktInfoCard />
                </Stack>
              )}

              {/* Tab 2: Files & PDF Preview */}
              {currentTab === 'files' && (
                <Stack spacing={2} sx={{ height: '100%' }}>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddPhotoAlternateOutlined />}
                      onClick={() => setPasteImgModalOpen(true)}
                    >
                      {t('recalculationDetailPage.attachImage', 'Rasm biriktirish')}
                    </Button>
                  </Stack>

                  <Box sx={{ height: 500, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <PDFViewer base64String={aktFileURL} />
                  </Box>
                </Stack>
              )}

              {/* Tab 3: DHJ Table */}
              {currentTab === 'dhj' && (
                <Box>
                  <DHJTable rows={dhjRows} />
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Drawer Sticky Bottom Actions */}
        <Box
          sx={{
            p: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1
          }}
        >
          {/* Quick Primary Actions */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Accept (move to inbox) */}
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<MoveToInboxOutlined />}
              disabled={isAcceptDisabled}
              onClick={() => {
                if (ariza?._id) onMoveToInbox(ariza._id);
              }}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              {t('tableActions.accept', 'Qabul qilish')}
            </Button>

            {/* Act Changer / Re-act */}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<PublishedWithChanges />}
              onClick={() => setShowAktModal(true)}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              {t('recalculationDetailPage.reAct', 'Akt biriktirish')}
            </Button>

            {/* Update / Confirm from Tozamakon */}
            <Button
              variant="outlined"
              color="success"
              size="small"
              startIcon={isUpdatingFromBilling ? <CircularProgress size={16} /> : <RestartAlt />}
              disabled={isUpdatingFromBilling}
              onClick={handleUpdateFromBilling}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              {t('buttons.sync', 'Tasdiqlash / Yangilash')}
            </Button>
          </Stack>

          {/* Secondary Actions: Cancel / Print */}
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Tooltip title="Chop etish">
              <span>
                <IconButton
                  color="info"
                  size="small"
                  disabled={isPrintingThis || !ariza?._id}
                  onClick={() => ariza?._id && onPrint(ariza._id)}
                >
                  {isPrintingThis ? <CircularProgress size={18} /> : <PrintOutlined fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Bekor qilish">
              <span>
                <IconButton
                  color="error"
                  size="small"
                  disabled={isCancelDisabled || !ariza?._id}
                  onClick={() => ariza && onOpenRejectDialog(ariza)}
                >
                  <CancelOutlined fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>
      </Drawer>

      {/* Act Changer Modal */}
      {showAktModal && (
        <AktChangerModal
          onClose={() => {
            setShowAktModal(false);
            if (ariza?._id) fetchArizaDetail(ariza._id);
            onReloadList();
          }}
        />
      )}

      {/* Paste Image Dialog */}
      <PasteImageDialog open={pasteImgModalOpen} setOpen={setPasteImgModalOpen} />
    </>
  );
};

export default PetitionDetailDrawer;
