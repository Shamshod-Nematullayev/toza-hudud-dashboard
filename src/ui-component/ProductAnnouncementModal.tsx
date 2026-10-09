import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
   alpha,
  useTheme
} from '@mui/material';
import {
  WorkspacePremium as WorkspacePremiumIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircleOutlined as CheckCircleOutlineIcon,
  Replay as ReplayIcon,
  Close as CloseIcon,
  BoltOutlined as BoltOutlinedIcon
} from '@mui/icons-material';
import api from 'utils/api';
import useCustomizationStore from 'store/customizationStore';

export interface ProductAnnouncementItem {
  _id?: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  imageFileId?: string | null;
  isPremium: boolean;
  status: 'draft' | 'published' | 'unpublished';
  startAt?: string | Date;
  endAt?: string | Date | null;
  displayDelay: number;
  displayDelayMs?: number;
  priority: number;
  viewsCount?: number;
  createdAt?: string;
}

interface ProductAnnouncementModalProps {
  /**
   * When provided, renders the modal in Admin Preview mode without making API calls
   * or recording view history.
   */
  previewOpen?: boolean;
  previewAnnouncement?: ProductAnnouncementItem | null;
  onClosePreview?: () => void;
}

/**
 * Checks whether driver.js is currently running an active tour in the DOM.
 */
const isDriverJsActive = (): boolean => {
  if (typeof document === 'undefined') return false;
  return (
    document.body.classList.contains('driver-active') ||
    Boolean(document.querySelector('.driver-popover')) ||
    Boolean(document.querySelector('.driver-overlay'))
  );
};

export const ProductAnnouncementModal: React.FC<ProductAnnouncementModalProps> = ({
  previewOpen = false,
  previewAnnouncement = null,
  onClosePreview
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isPreviewMode = Boolean(previewAnnouncement !== null || onClosePreview !== undefined);

  const { user } = useCustomizationStore();
  const sessionUserKey = user?.login || user?.id || (user as any)?._id || '';
  const isUserLoaded = Boolean(sessionUserKey);

  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<ProductAnnouncementItem | null>(null);
  const [resolvedImageSrc, setResolvedImageSrc] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [submittingView, setSubmittingView] = useState(false);

  // Track which user session we have already checked in this mount/login session
  const checkedUserKeyRef = useRef<string | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeItem = isPreviewMode ? previewAnnouncement : announcement;
  const isModalOpen = isPreviewMode ? Boolean(previewOpen && previewAnnouncement) : open;

  // Resolve imageUrl or Telegram imageFileId into a displayable src
  useEffect(() => {
    let revokeUrl: string | null = null;
    let isCancelled = false;

    const resolveImage = async () => {
      if (!activeItem) {
        setResolvedImageSrc(null);
        return;
      }

      if (activeItem.imageUrl) {
        setResolvedImageSrc(activeItem.imageUrl);
        return;
      }

      if (activeItem.imageFileId) {
        try {
          const response = await api.get(`/fetchTelegram/${activeItem.imageFileId}`, {
            responseType: 'blob',
            headers: { 'hide-error': 'true' }
          });
          if (!isCancelled && response.data) {
            const mimeType = String(response.headers['content-type'] || 'image/jpeg');
            const blob = new Blob([response.data], { type: mimeType });
            revokeUrl = URL.createObjectURL(blob);
            setResolvedImageSrc(revokeUrl);
          }
        } catch {
          if (!isCancelled) {
            setResolvedImageSrc(null);
          }
        }
        return;
      }

      setResolvedImageSrc(null);
    };

    resolveImage();

    return () => {
      isCancelled = true;
      if (revokeUrl) {
        URL.revokeObjectURL(revokeUrl);
      }
    };
  }, [activeItem?.imageUrl, activeItem?.imageFileId]);

  const startCountdown = useCallback((seconds: number) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    const initialSec = Math.max(0, Math.round(Number(seconds) || 0));
    setCountdown(initialSec);

    if (initialSec > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, []);

  // Handle countdown in Preview Mode when opened
  useEffect(() => {
    if (!isPreviewMode) return;
    if (previewOpen && previewAnnouncement) {
      const delaySec =
        typeof previewAnnouncement.displayDelay === 'number'
          ? Math.max(0, previewAnnouncement.displayDelay)
          : 3;
      startCountdown(delaySec);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }
  }, [isPreviewMode, previewOpen, previewAnnouncement, startCountdown]);

  // Post-login initialization for real authenticated users
  useEffect(() => {
    if (isPreviewMode) return;
    if (!isUserLoaded || !sessionUserKey) {
      checkedUserKeyRef.current = null;
      setOpen(false);
      setAnnouncement(null);
      return;
    }

    // Only run once per logged-in user session
    if (checkedUserKeyRef.current === sessionUserKey) return;
    checkedUserKeyRef.current = sessionUserKey;

    // IMPORTANT: Check if this is the user's first login where driver.js onboarding tour runs.
    // OnboardingTour uses tourKey = `app_onboarding_${user?.id || user?.login || 'default'}`
    // which stores `has_seen_tour_app_onboarding_${onboardingKey}` in localStorage ONLY after
    // the tour finishes. So if `hasSeenOnboardingTour` is false right now, driver.js will run
    // during this first login session, and ProductAnnouncementModal MUST pause for this session.
    let hasSeenOnboardingTour = false;
    try {
      const byId = user?.id
        ? localStorage.getItem(`has_seen_tour_app_onboarding_${user.id}`) === 'true'
        : false;
      const byMongoId = (user as any)?._id
        ? localStorage.getItem(`has_seen_tour_app_onboarding_${(user as any)._id}`) === 'true'
        : false;
      const byLogin = user?.login
        ? localStorage.getItem(`has_seen_tour_app_onboarding_${user.login}`) === 'true'
        : false;
      hasSeenOnboardingTour = byId || byMongoId || byLogin;
    } catch {
      hasSeenOnboardingTour = false;
    }

    if (!hasSeenOnboardingTour || isDriverJsActive()) {
      return;
    }

    let isCancelled = false;

    const fetchActiveAnnouncement = async () => {
      try {
        const res = await api.get('/product-announcements/active', {
          headers: { 'hide-error': 'true' }
        });

        if (isCancelled) return;
        const activeData: ProductAnnouncementItem | null = res.data?.data || null;
        if (!res.data?.ok || !activeData || !activeData._id) {
          return;
        }

        // Check local fallback cache just in case
        const localViewKey = `gz_announcement_viewed_${sessionUserKey}_${activeData._id}`;
        try {
          if (localStorage.getItem(localViewKey) === 'true') {
            return;
          }
        } catch {
          // ignore storage errors
        }

        const delaySeconds =
          typeof activeData.displayDelay === 'number'
            ? Math.max(0, activeData.displayDelay)
            : 3;
        const delayMs = delaySeconds * 1000;

        setAnnouncement(activeData);

        delayTimerRef.current = setTimeout(() => {
          if (isCancelled) return;
          // Double-check driver.js is not active right when modal is about to appear
          if (isDriverJsActive()) {
            return;
          }
          setOpen(true);
          startCountdown(delaySeconds);
        }, delayMs);
      } catch {
        // Silent fail: Announcement API failure must never break GreenZone main workflow
      }
    };

    fetchActiveAnnouncement();

    return () => {
      isCancelled = true;
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };
  }, [isPreviewMode, isUserLoaded, sessionUserKey, user?.id, user?.login, startCountdown]);

  useEffect(() => {
    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const handleAcknowledge = async () => {
    if (isPreviewMode) {
      onClosePreview?.();
      return;
    }

    if (countdown > 0) return;

    const currentId = announcement?._id;
    setOpen(false);

    if (!currentId) return;

    try {
      setSubmittingView(true);
      try {
        localStorage.setItem(`gz_announcement_viewed_${sessionUserKey}_${currentId}`, 'true');
      } catch {
        // ignore localStorage error
      }
      await api.post(
        `/product-announcements/${currentId}/view`,
        {},
        { headers: { 'hide-error': 'true' } }
      );
    } catch {
      // Non-critical error; modal is already closed
    } finally {
      setSubmittingView(false);
    }
  };

  if (!activeItem) return null;

  const isPremium = Boolean(activeItem.isPremium);
  const isButtonDisabled = !isPreviewMode && (countdown > 0 || submittingView);

  return (
    <Dialog
      open={isModalOpen}
      onClose={() => {
        if (isPreviewMode) {
          onClosePreview?.();
        } else if (countdown === 0) {
          handleAcknowledge();
        }
      }}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(6px)',
            backgroundColor: alpha('#090D16', isDark ? 0.72 : 0.5)
          }
        },
        paper: {
          elevation: 0,
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: theme.palette.background.paper,
            border: '1px solid',
            borderColor: isPremium
              ? alpha(theme.palette.warning.main, isDark ? 0.45 : 0.35)
              : theme.palette.divider,
            boxShadow: isDark
              ? '0 24px 64px rgba(0, 0, 0, 0.65)'
              : '0 24px 60px rgba(15, 23, 42, 0.18)',
            position: 'relative'
          }
        }
      }}
    >
      {/* Top Accent Bar */}
      <Box
        sx={{
          height: 5,
          width: '100%',
          background: isPremium
            ? `linear-gradient(90deg, ${theme.palette.warning.dark} 0%, ${theme.palette.warning.main} 50%, ${theme.palette.warning.light} 100%)`
            : `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`
        }}
      />

      {/* Admin Preview Banner */}
      {isPreviewMode && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1,
            bgcolor: alpha(theme.palette.info.main, isDark ? 0.16 : 0.08),
            borderBottom: '1px solid',
            borderColor: theme.palette.divider
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip
              size="small"
              label="PREVIEW REJIMI"
              color="info"
              sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
            />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Kutish vaqti: {activeItem.displayDelay ?? 3} sek
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Tooltip title="Countdownni qayta tekshirish">
              <IconButton
                size="small"
                onClick={() => startCountdown(activeItem.displayDelay ?? 3)}
                sx={{ color: theme.palette.text.secondary }}
              >
                <ReplayIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Yopish">
              <IconButton
                size="small"
                onClick={onClosePreview}
                sx={{ color: theme.palette.text.secondary }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      )}

      <DialogContent sx={{ p: 0 }}>
        {/* Hero Image or Header Graphic */}
        {resolvedImageSrc ? (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxHeight: { xs: 220, sm: 280 },
              minHeight: 180,
              bgcolor: isDark
                ? alpha(theme.palette.common.black, 0.35)
                : alpha(theme.palette.primary.main, 0.04),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderBottom: '1px solid',
              borderColor: theme.palette.divider
            }}
          >
            <Box
              component="img"
              src={resolvedImageSrc}
              alt={activeItem.title}
              sx={{
                width: '100%',
                maxHeight: { xs: 220, sm: 280 },
                objectFit: 'cover',
                display: 'block'
              }}
            />

            {/* Floating Badges over Image */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                right: 16,
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              {isPremium ? (
                <Chip
                  icon={<WorkspacePremiumIcon sx={{ fontSize: '18px !important' }} />}
                  label="PREMIUM"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    fontSize: '0.75rem',
                    bgcolor: theme.palette.warning.main,
                    color: '#0F172A',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.45)',
                    '& .MuiChip-icon': {
                      color: '#0F172A'
                    }
                  }}
                />
              ) : (
                <Chip
                  icon={<AutoAwesomeIcon sx={{ fontSize: '16px !important' }} />}
                  label="YANGI IMKONIYAT"
                  size="small"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    color: theme.palette.primary.main,
                    backdropFilter: 'blur(8px)',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.3)
                  }}
                />
              )}
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              px: { xs: 3, sm: 4 },
              pt: { xs: 3, sm: 3.5 },
              pb: 1,
              background: isPremium
                ? `radial-gradient(circle at top right, ${alpha(theme.palette.warning.main, isDark ? 0.18 : 0.12)}, transparent 65%)`
                : `radial-gradient(circle at top right, ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1)}, transparent 65%)`
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              {isPremium ? (
                <Chip
                  icon={<WorkspacePremiumIcon sx={{ fontSize: '18px !important' }} />}
                  label="PREMIUM"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    fontSize: '0.75rem',
                    bgcolor: alpha(theme.palette.warning.main, isDark ? 0.22 : 0.15),
                    color: isDark ? theme.palette.warning.light : theme.palette.warning.dark,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.warning.main, 0.45),
                    '& .MuiChip-icon': {
                      color: theme.palette.warning.main
                    }
                  }}
                />
              ) : (
                <Chip
                  icon={<BoltOutlinedIcon sx={{ fontSize: '17px !important' }} />}
                  label="Yangi imkoniyat"
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1),
                    color: theme.palette.primary.main
                  }}
                />
              )}
            </Stack>
          </Box>
        )}

        {/* Content Body */}
        <Box sx={{ px: { xs: 3, sm: 4 }, pt: resolvedImageSrc ? 3 : 2, pb: { xs: 3, sm: 3.5 } }}>
          {resolvedImageSrc && isPremium && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: isDark ? theme.palette.warning.light : theme.palette.warning.dark,
                  lineHeight: 1.2
                }}
              >
                Premium versiya imkoniyati
              </Typography>
            </Stack>
          )}

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.25rem', sm: '1.45rem' },
              lineHeight: 1.35,
              color: theme.palette.text.primary,
              mb: 1.75
            }}
          >
            {activeItem.title}
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              bgcolor: isDark
                ? alpha(theme.palette.background.default, 0.55)
                : alpha(theme.palette.primary.main, 0.03),
              border: '1px solid',
              borderColor: theme.palette.divider,
              maxHeight: 240,
              overflowY: 'auto',
              mb: 3
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                lineHeight: 1.65,
                whiteSpace: 'pre-line',
                fontSize: '0.95rem'
              }}
            >
              {activeItem.description}
            </Typography>
          </Box>

          {/* Action Footer */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={isButtonDisabled}
              onClick={handleAcknowledge}
              startIcon={countdown === 0 ? <CheckCircleOutlineIcon /> : undefined}
              sx={{
                py: 1.35,
                px: 4,
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '0.95rem',
                textTransform: 'none',
                transition: 'all 0.2s ease',
                ...(isPremium && countdown === 0
                  ? {
                      bgcolor: theme.palette.warning.main,
                      color: '#0F172A',
                      '&:hover': {
                        bgcolor: theme.palette.warning.dark
                      }
                    }
                  : {})
              }}
            >
              {countdown > 0 ? (
                <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.text.primary, 0.12),
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}
                  >
                    {countdown}
                  </Box>
                  <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    Tushundim ({countdown}s)
                  </Typography>
                </Stack>
              ) : (
                'Tushundim'
              )}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ProductAnnouncementModal;
