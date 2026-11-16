import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Stack,
  useTheme,
  Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  IconSparkles,
  IconArrowRight,
  IconClock,
  IconMapPin,
  IconUsers,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconExternalLink,
  IconRefresh,
  IconUserCheck,
  IconPlus
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { INewAbonentItem } from './types';

interface TodayCreatedAbonentsProps {
  /** Yangi abonent qo'shilganda yoki tashqaridan yangilash chaqirilganda */
  refreshTrigger?: number;
  /** Yangi qo'shilgan abonent IDsi (highlight effekti uchun) */
  highlightId?: string | null;
  /** Qo'lda ochish modalini ochish */
  onOpenManualCreate?: () => void;
}

export const TodayCreatedAbonents: React.FC<TodayCreatedAbonentsProps> = ({
  refreshTrigger = 0,
  highlightId = null,
  onOpenManualCreate
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<INewAbonentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const fetchToday = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/pendingNewAbonents/today');
      if (res.data?.ok) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Bugun ochilgan abonentlarni yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday, refreshTrigger]);

  // highlightId kelganda eng boshiga silliq scroll qilish
  useEffect(() => {
    if (highlightId && scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [highlightId, items]);

  // Gorizontal scroll boshqaruvi
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Sichqoncha scrollini gorizontalga o'tkazish
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  // Nusxalash
  const handleCopy = (e: React.MouseEvent, text?: string, label?: string) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.info(`${label || 'Hisob raqam'} nusxalandi: ${text}`);
  };

  // Abonent profiliga kirish
  const handleNavigateToAbonent = async (item: INewAbonentItem, inNewTab = false, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // 1. Agar residentId mavjud bo'lsa — to'g'ridan-to'g'ri o'tamiz
    if (item.residentId) {
      const targetUrl = `/abonent/${item.residentId}/details`;
      if (inNewTab) {
        window.open(targetUrl, '_blank');
      } else {
        navigate(targetUrl);
      }
      return;
    }

    // 2. Agar residentId bo'lmasa, hisob raqami orqali qidirib o'tamiz
    if (item.accountNumber) {
      setNavigatingId(item._id);
      try {
        const res = await api.get('/abonents/tozamakon', {
          params: { accountNumber: item.accountNumber }
        });
        const resident = res.data?.content?.[0] || res.data?.[0];
        const resId = resident?.id || resident?.residentId;
        if (resId) {
          const targetUrl = `/abonent/${resId}/details`;
          if (inNewTab) {
            window.open(targetUrl, '_blank');
          } else {
            navigate(targetUrl);
          }
          return;
        }
      } catch (err) {
        console.error('Abonent qidirishda xatolik:', err);
      } finally {
        setNavigatingId(null);
      }

      // Agar topilmasa, hisob raqami bilan abonentlar ro'yxatiga yo'naltirish
      navigate(`/billing/printAbonentsList?search=${encodeURIComponent(item.accountNumber)}`);
    } else {
      toast.warning("Abonentning hisob raqami yoki ID raqami mavjud emas");
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getDisplayName = (item: INewAbonentItem) => {
    if (item.abonent_name) return item.abonent_name;
    const { lastName = '', firstName = '', patronymic = '' } = item.citizen || {};
    return `${lastName} ${firstName} ${patronymic}`.trim() || 'Noma’lum fuqaro';
  };

  return (
    <Card
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: '18px',
        border: '1px solid',
        borderColor: isDark ? alpha(theme.palette.success.main, 0.25) : alpha(theme.palette.success.main, 0.2),
        bgcolor: isDark
          ? alpha(theme.palette.success.dark, 0.12)
          : alpha(theme.palette.success.light, 0.1),
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isDark
          ? `0 4px 20px ${alpha(theme.palette.common.black, 0.4)}`
          : `0 4px 20px ${alpha(theme.palette.success.main, 0.06)}`
      }}
    >
      {/* Yuqori Panel: Sarlavha, Statistika va Tugmalar */}
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          pt: { xs: 1.5, sm: 2 },
          pb: 1.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: isDark ? alpha(theme.palette.divider, 0.3) : alpha(theme.palette.success.main, 0.12)
        }}
      >
        <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: theme.palette.success.main,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 3px 10px ${alpha(theme.palette.success.main, 0.35)}`
            }}
          >
            <IconSparkles size={20} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  color: isDark ? '#a7f3d0' : '#065f46',
                  letterSpacing: '-0.01em'
                }}
              >
                Bugun ochilgan abonentlar
              </Typography>
              <Chip
                label={`${items.length} ta`}
                size="small"
                sx={{
                  height: 22,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  bgcolor: theme.palette.success.main,
                  color: '#ffffff'
                }}
              />
            </Stack>
            <Typography
              variant="caption"
              sx={{
                color: isDark ? alpha('#a7f3d0', 0.7) : '#047857',
                fontWeight: 500,
                display: 'block'
              }}
            >
              Bugungi sana bo‘yicha tizimda muvaffaqiyatli ochilgan barcha abonentlar. Bir bosishda profilinga o‘tish mumkin.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {onOpenManualCreate && (
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<IconPlus size={15} />}
              onClick={onOpenManualCreate}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                py: 0.5,
                px: 1.5,
                fontSize: '0.8rem',
                display: { xs: 'none', sm: 'inline-flex' }
              }}
            >
              Yangi ochish
            </Button>
          )}

          <Tooltip title="Ro'yxatni yangilash">
            <IconButton
              size="small"
              onClick={fetchToday}
              disabled={loading}
              sx={{
                bgcolor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.white, 0.8),
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: '8px'
              }}
            >
              <IconRefresh size={16} />
            </IconButton>
          </Tooltip>

          {items.length > 0 && (
            <Stack direction="row" spacing={0.5}>
              <IconButton
                size="small"
                onClick={() => handleScroll('left')}
                sx={{
                  bgcolor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.white, 0.8),
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  borderRadius: '8px',
                  width: 32,
                  height: 32
                }}
              >
                <IconChevronLeft size={16} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleScroll('right')}
                sx={{
                  bgcolor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.white, 0.8),
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  borderRadius: '8px',
                  width: 32,
                  height: 32
                }}
              >
                <IconChevronRight size={16} />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Asosiy Qism: Gorizontal Scroll Kartalar */}
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        {loading ? (
          <Stack direction="row" spacing={2} sx={{ overflowX: 'hidden' }}>
            {[1, 2, 3, 4].map((n) => (
              <Skeleton
                key={n}
                variant="rectangular"
                width={300}
                height={140}
                sx={{ borderRadius: '14px', flexShrink: 0 }}
              />
            ))}
          </Stack>
        ) : items.length === 0 ? (
          <Box
            sx={{
              py: 2.5,
              px: 2,
              textAlign: 'center',
              borderRadius: '12px',
              bgcolor: isDark ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.common.white, 0.7),
              border: '1px dashed',
              borderColor: alpha(theme.palette.success.main, 0.3)
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: isDark ? 'text.secondary' : '#047857'
              }}
            >
              Bugun hali yangi abonent ochilmadi.
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.4 }}>
              Yangi abonent ochish uchun "Qo'lda ochish" tugmasini bosing yoki arizalar navbatidan tasdiqlang.
            </Typography>
          </Box>
        ) : (
          <Box
            ref={scrollRef}
            onWheel={handleWheel}
            sx={{
              display: 'flex',
              gap: 1.8,
              overflowX: 'auto',
              pb: 0.8,
              scrollBehavior: 'smooth',
              '&::-webkit-scrollbar': {
                height: 6
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: isDark ? alpha('#000', 0.2) : alpha(theme.palette.success.main, 0.05),
                borderRadius: 4
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.success.main, 0.35),
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.success.main, 0.6)
                }
              }
            }}
          >
            {items.map((item, idx) => {
              const isHighlighted = highlightId === item._id || (idx === 0 && !highlightId);
              const isThisNavigating = navigatingId === item._id;

              return (
                <Card
                  key={item._id}
                  elevation={0}
                  sx={{
                    minWidth: { xs: 290, sm: 320 },
                    maxWidth: { xs: 300, sm: 330 },
                    flexShrink: 0,
                    borderRadius: '14px',
                    border: '1.5px solid',
                    borderColor: isHighlighted
                      ? theme.palette.success.main
                      : isDark
                      ? alpha(theme.palette.divider, 0.5)
                      : alpha(theme.palette.divider, 0.8),
                    bgcolor: isDark ? 'background.paper' : '#ffffff',
                    transition: 'all 0.22s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isHighlighted
                      ? `0 6px 20px ${alpha(theme.palette.success.main, 0.2)}`
                      : '0 2px 10px rgba(0,0,0,0.03)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderColor: theme.palette.success.main,
                      boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.22)}`
                    }
                  }}
                >
                  <CardActionArea
                    onClick={(e) => handleNavigateToAbonent(item, false, e)}
                    sx={{ p: 1.8, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    {/* Kartaning yuqori qatori: Hisob raqami va Ochilgan vaqti */}
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1.2
                      }}
                    >
                      {/* Hisob raqami */}
                      {item.accountNumber ? (
                        <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                          <Chip
                            label={item.accountNumber}
                            size="small"
                            onClick={(e) => handleCopy(e, item.accountNumber, 'Hisob raqam')}
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              bgcolor: isDark ? alpha(theme.palette.success.main, 0.2) : '#ecfdf5',
                              color: isDark ? '#6ee7b7' : '#047857',
                              border: '1px solid',
                              borderColor: alpha(theme.palette.success.main, 0.3),
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.success.main, 0.3)
                              }
                            }}
                          />
                          <Tooltip title="Nusxalash">
                            <IconButton
                              size="small"
                              onClick={(e) => handleCopy(e, item.accountNumber, 'Hisob raqam')}
                              sx={{ p: 0.3, color: 'text.secondary' }}
                            >
                              <IconCopy size={13} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Chip
                          label="Hisob raqamsiz"
                          size="small"
                          color="default"
                          sx={{ height: 22, fontSize: '0.7rem' }}
                        />
                      )}

                      {/* Ochilgan vaqti */}
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <IconClock size={13} style={{ color: theme.palette.text.secondary }} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: 'text.secondary',
                            fontSize: '0.75rem'
                          }}
                        >
                          {formatTime(item.confirmDate || item.createdAt) || 'Bugun'}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* F.I.SH */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        color: 'text.primary',
                        lineHeight: 1.25,
                        mb: 0.8,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {getDisplayName(item)}
                    </Typography>

                    {/* Manzil */}
                    <Stack direction="row" spacing={0.6} sx={{ alignItems: 'flex-start', mb: 0.6 }}>
                      <IconMapPin
                        size={14}
                        style={{ color: theme.palette.text.secondary, marginTop: 2, flexShrink: 0 }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '90%'
                        }}
                      >
                        {item.mahallaName || 'Mahalla'}{item.streetName ? `, ${item.streetName}` : ''}
                      </Typography>
                    </Stack>

                    {/* Yashovchilar va Nazoratchi / Admin */}
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1.5,
                        mt: 'auto',
                        pt: 0.5
                      }}
                    >
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <IconUsers size={13} style={{ color: theme.palette.text.secondary }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {item.inhabitant_cnt || 1} nafar
                        </Typography>
                      </Stack>

                      {(item.confirmedBy || item.inspector_name) && (
                        <Stack direction="row" spacing={0.4} sx={{ alignItems: 'center' }}>
                          <IconUserCheck size={13} style={{ color: theme.palette.text.secondary }} />
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.72rem',
                              maxWidth: 120,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {item.confirmedBy || item.inspector_name}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    {/* CTA: Bitta click bilan abonent profiliga kirish */}
                    <Box
                      sx={{
                        pt: 1,
                        borderTop: '1px dashed',
                        borderColor: theme.palette.divider,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: theme.palette.success.main,
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          {isThisNavigating ? 'Yuklanmoqda...' : 'Profilga kirish'}
                          <IconArrowRight size={14} />
                        </Typography>
                      </Stack>

                      <Tooltip title="Yangi oynada ochish">
                        <IconButton
                          size="small"
                          onClick={(e) => handleNavigateToAbonent(item, true, e)}
                          sx={{
                            p: 0.5,
                            color: 'text.secondary',
                            '&:hover': {
                              color: theme.palette.success.main,
                              bgcolor: alpha(theme.palette.success.main, 0.1)
                            }
                          }}
                        >
                          <IconExternalLink size={14} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default TodayCreatedAbonents;
