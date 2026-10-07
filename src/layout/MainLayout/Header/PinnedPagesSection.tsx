import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  ButtonBase,
  Chip,
  ClickAwayListener,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Popper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  IconBuilding,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconPin,
  IconPinnedOff,
  IconPlus,
  IconSearch,
  IconX
} from '@tabler/icons-react';
import { FiberManualRecord } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import menuItems, { MenuItem as IMenuItem } from 'menu-items';
import useCustomizationStore from 'store/customizationStore';
import Transitions from 'ui-component/extended/Transitions';

export interface FlattenedPageItem {
  id: string;
  url: string;
  title: string;
  icon?: any;
  groupId: string;
  groupTitle: string;
}

export const extractPinnablePages = (
  items: IMenuItem[],
  userRoles?: string[],
  parentGroup?: { id: string; title: string }
): FlattenedPageItem[] => {
  let result: FlattenedPageItem[] = [];

  items.forEach((item) => {
    if (item.allowedRoles && userRoles && !item.allowedRoles.some((role) => userRoles.includes(role))) {
      return;
    }

    const currentGroup =
      item.type === 'group'
        ? { id: item.id, title: String(item.title) }
        : parentGroup || { id: item.id, title: String(item.title) };

    if (item.type === 'item' && item.title && item.url) {
      result.push({
        id: item.id,
        url: item.url,
        title: String(item.title),
        icon: item.icon,
        groupId: currentGroup.id,
        groupTitle: currentGroup.title
      });
    }

    if (item.children && item.children.length > 0) {
      const nextGroup =
        item.type === 'collapse' && parentGroup
          ? { id: parentGroup.id, title: `${parentGroup.title}` }
          : currentGroup;
      result = result.concat(extractPinnablePages(item.children, userRoles, nextGroup));
    }
  });

  // Deduplicate by URL
  const seenUrls = new Set<string>();
  return result.filter((page) => {
    if (seenUrls.has(page.url)) return false;
    seenUrls.add(page.url);
    return true;
  });
};

const renderPageIcon = (IconComponent: any, size = 16) => {
  if (!IconComponent) {
    return <FiberManualRecord sx={{ fontSize: 8 }} />;
  }
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        '& svg': {
          width: size,
          height: size,
          fontSize: size
        }
      }}
    >
      <IconComponent size={size} stroke={1.75} fontSize="small" />
    </Box>
  );
};

const PinnedPagesSection: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const { user, customization, menuSettings, setMenuSettings } = useCustomizationStore();
  const isProductAdmin = Boolean(user?.roles?.includes('product_admin'));
  const isDark = theme.palette.mode === 'dark';

  const [openPopover, setOpenPopover] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const availablePages = useMemo(
    () => extractPinnablePages(menuItems.items, user?.roles),
    [user?.roles]
  );

  const pinnedUrls = menuSettings.pinnedPages || [];

  const pinnedPageItems = useMemo(() => {
    const pageMap = new Map<string, FlattenedPageItem>();
    availablePages.forEach((p) => {
      pageMap.set(p.url, p);
      pageMap.set(p.id, p);
    });

    const resolved: FlattenedPageItem[] = [];
    pinnedUrls.forEach((key) => {
      const found = pageMap.get(key);
      if (found && !resolved.some((r) => r.url === found.url)) {
        resolved.push(found);
      }
    });
    return resolved;
  }, [availablePages, pinnedUrls]);

  const handleTogglePin = (url: string) => {
    const current = pinnedPageItems.map((p) => p.url);
    const exists = current.includes(url);
    const updated = exists ? current.filter((u) => u !== url) : [...current, url];
    setMenuSettings({ pinnedPages: updated });
  };

  const handleMovePin = (index: number, direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    const current = pinnedPageItems.map((p) => p.url);
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) return;
    const next = [...current];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    setMenuSettings({ pinnedPages: next });
  };

  const handleToggleCompanySelector = () => {
    setMenuSettings({
      showCompanySelectorInHeader: !menuSettings.showCompanySelectorInHeader
    });
  };

  const filteredPages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availablePages;
    return availablePages.filter((page) => {
      const translatedTitle = t(`menuItems.${page.title}`, { defaultValue: page.title }).toLowerCase();
      const translatedGroup = t(`menuItems.${page.groupTitle}`, { defaultValue: page.groupTitle }).toLowerCase();
      return (
        translatedTitle.includes(q) ||
        translatedGroup.includes(q) ||
        page.title.toLowerCase().includes(q) ||
        page.url.toLowerCase().includes(q)
      );
    });
  }, [availablePages, searchQuery, t]);

  const handleClosePopover = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpenPopover(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        minWidth: 0,
        flex: 1,
        mx: { md: 1, lg: 1.5 }
      }}
    >
      {/* Pinned Pages Horizontal Strip */}
      {pinnedPageItems.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            overflowX: 'auto',
            minWidth: 0,
            py: 0.25,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }}
        >
          {pinnedPageItems.map((page) => {
            const isActive = location.pathname === page.url;
            const translatedLabel = t(`menuItems.${page.title}`, { defaultValue: page.title });

            return (
              <Box
                key={page.url}
                onClick={() => navigate(page.url)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(page.url);
                  }
                }}
                sx={{
                  group: 'true',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  pl: 1.25,
                  pr: 0.75,
                  py: 0.55,
                  borderRadius: `${Math.min(customization.borderRadius, 10)}px`,
                  cursor: 'pointer',
                  userSelect: 'none',
                  flexShrink: 0,
                  position: 'relative',
                  transition: 'all 0.18s ease-in-out',
                  bgcolor: isActive
                    ? alpha(theme.palette.secondary.main, isDark ? 0.24 : 0.12)
                    : isDark
                      ? alpha(theme.palette.background.default, 0.65)
                      : alpha(theme.palette.grey[200], 0.55),
                  color: isActive
                    ? isDark
                      ? theme.palette.secondary.light
                      : theme.palette.secondary.dark
                    : theme.palette.text.secondary,
                  border: '1px solid',
                  borderColor: isActive
                    ? alpha(theme.palette.secondary.main, isDark ? 0.55 : 0.4)
                    : theme.palette.divider,
                  '&:hover': {
                    bgcolor: isActive
                      ? alpha(theme.palette.secondary.main, isDark ? 0.3 : 0.16)
                      : alpha(theme.palette.secondary.main, isDark ? 0.12 : 0.06),
                    color: isActive
                      ? isDark
                        ? theme.palette.secondary.light
                        : theme.palette.secondary.dark
                      : theme.palette.text.primary,
                    borderColor: alpha(theme.palette.secondary.main, 0.35),
                    '& .unpin-btn': {
                      opacity: 1
                    }
                  }
                }}
              >
                {renderPageIcon(page.icon, 15)}
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 600 : 500,
                    color: 'inherit',
                    maxWidth: { md: 130, lg: 170, xl: 210 }
                  }}
                >
                  {translatedLabel}
                </Typography>

                <Tooltip title={t('headerPins.unpin', 'Headerdan olib tashlash')} placement="bottom">
                  <IconButton
                    size="small"
                    className="unpin-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePin(page.url);
                    }}
                    sx={{
                      p: 0.2,
                      ml: 0.15,
                      opacity: 0.45,
                      color: 'inherit',
                      borderRadius: 1,
                      transition: 'opacity 0.15s ease, background-color 0.15s ease',
                      '&:hover': {
                        opacity: 1,
                        bgcolor: alpha(theme.palette.error.main, 0.15),
                        color: theme.palette.error.main
                      }
                    }}
                  >
                    <IconX size={12} stroke={2} />
                  </IconButton>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      )}

      {/* + Add / Manage Pinned Pages Button (ClickUp style) */}
      <Tooltip
        title={t('headerPins.manageTooltip', "Tezkor bo'lim qo'shish yoki sozlash")}
        placement="bottom"
      >
        <ButtonBase
          ref={anchorRef}
          onClick={() => setOpenPopover((prev) => !prev)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
            px: pinnedPageItems.length === 0 ? 1.25 : 0.85,
            py: pinnedPageItems.length === 0 ? 0.6 : 0.6,
            borderRadius: `${Math.min(customization.borderRadius, 10)}px`,
            flexShrink: 0,
            border: '1px dashed',
            borderColor: openPopover
              ? theme.palette.secondary.main
              : alpha(theme.palette.text.secondary, isDark ? 0.35 : 0.3),
            bgcolor: openPopover
              ? alpha(theme.palette.secondary.main, isDark ? 0.2 : 0.1)
              : 'transparent',
            color: openPopover ? theme.palette.secondary.main : theme.palette.text.secondary,
            transition: 'all 0.18s ease-in-out',
            '&:hover': {
              borderColor: theme.palette.secondary.main,
              color: theme.palette.secondary.main,
              bgcolor: alpha(theme.palette.secondary.main, isDark ? 0.14 : 0.06)
            }
          }}
        >
          <IconPlus size={15} stroke={2} />
          {pinnedPageItems.length === 0 && (
            <Typography
              variant="caption"
              noWrap
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                color: 'inherit'
              }}
            >
              {t('headerPins.addQuickPage', "Bo'lim biriktirish")}
            </Typography>
          )}
        </ButtonBase>
      </Tooltip>

      {/* Popover for Selecting / Ordering Pinned Pages */}
      <Popper
        open={openPopover}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        transition
        sx={{ zIndex: 1305 }}
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 10]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions position="top-left" in={openPopover} {...TransitionProps}>
            <Paper
              elevation={12}
              sx={{
                width: { xs: 310, sm: 360 },
                borderRadius: 3,
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: theme.palette.divider,
                boxShadow: theme.shadows[16],
                overflow: 'hidden'
              }}
            >
              <ClickAwayListener onClickAway={handleClosePopover}>
                <Box>
                  {/* Header */}
                  <Box
                    sx={{
                      p: 2,
                      pb: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.03),
                      borderBottom: '1px solid',
                      borderColor: theme.palette.divider
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <IconPin size={18} color={theme.palette.secondary.main} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {t('headerPins.title', "Tezkor bo'limlar paneli")}
                        </Typography>
                      </Stack>
                      <Chip
                        size="small"
                        label={`${pinnedPageItems.length} ta`}
                        color={pinnedPageItems.length > 0 ? 'secondary' : 'default'}
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>
                      {t(
                        'headerPins.subtitle',
                        "Ko'p ishlatadigan sahifalaringizni headerga biriktirib qo'ying"
                      )}
                    </Typography>

                    <TextField
                      fullWidth
                      size="small"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('headerPins.searchPlaceholder', "Bo'lim nomini qidiring...")}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconSearch size={15} />
                            </InputAdornment>
                          ),
                          endAdornment: searchQuery ? (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.25 }}>
                                <IconX size={14} />
                              </IconButton>
                            </InputAdornment>
                          ) : undefined
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: theme.palette.background.paper,
                          fontSize: '0.8125rem'
                        }
                      }}
                    />
                  </Box>

                  {/* Product Admin Option: Toggle CompanySelector in Header */}
                  {isProductAdmin && (
                    <Box
                      sx={{
                        px: 2,
                        py: 1.25,
                        borderBottom: '1px solid',
                        borderColor: theme.palette.divider,
                        bgcolor: alpha(theme.palette.warning.main, isDark ? 0.08 : 0.04)
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                          <IconBuilding size={18} color={theme.palette.warning.main} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                              {t('headerPins.showCompanySelector', 'Tashkilot tanlash inputi')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem' }}>
                              {t('headerPins.showCompanySelectorHint', "Headerda ko'rsatish yoki yashirish")}
                            </Typography>
                          </Box>
                        </Stack>
                        <Switch
                          size="small"
                          color="warning"
                          checked={Boolean(menuSettings.showCompanySelectorInHeader)}
                          onChange={handleToggleCompanySelector}
                        />
                      </Stack>
                    </Box>
                  )}

                  {/* Pages List */}
                  <Box
                    sx={{
                      maxHeight: 320,
                      overflowY: 'auto',
                      p: 1
                    }}
                  >
                    {filteredPages.length === 0 ? (
                      <Box sx={{ py: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('noResultsFound', 'Natija topilmadi')}
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={0.5}>
                        {filteredPages.map((page) => {
                          const pinIndex = pinnedPageItems.findIndex((p) => p.url === page.url);
                          const isPinned = pinIndex > -1;
                          const translatedTitle = t(`menuItems.${page.title}`, { defaultValue: page.title });
                          const translatedGroup = t(`menuItems.${page.groupTitle}`, {
                            defaultValue: page.groupTitle
                          });

                          return (
                            <Box
                              key={page.url}
                              onClick={() => handleTogglePin(page.url)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                                px: 1.25,
                                py: 0.85,
                                borderRadius: 2,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                bgcolor: isPinned
                                  ? alpha(theme.palette.secondary.main, isDark ? 0.18 : 0.08)
                                  : 'transparent',
                                border: '1px solid',
                                borderColor: isPinned
                                  ? alpha(theme.palette.secondary.main, 0.35)
                                  : 'transparent',
                                '&:hover': {
                                  bgcolor: isPinned
                                    ? alpha(theme.palette.secondary.main, isDark ? 0.24 : 0.12)
                                    : theme.palette.action.hover
                                }
                              }}
                            >
                              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}>
                                <Box
                                  sx={{
                                    color: isPinned
                                      ? theme.palette.secondary.main
                                      : theme.palette.text.secondary,
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  {renderPageIcon(page.icon, 18)}
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{
                                      fontWeight: isPinned ? 600 : 500,
                                      fontSize: '0.825rem',
                                      color: isPinned
                                        ? isDark
                                          ? theme.palette.secondary.light
                                          : theme.palette.secondary.dark
                                        : theme.palette.text.primary
                                    }}
                                  >
                                    {translatedTitle}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    noWrap
                                    color="text.secondary"
                                    sx={{ display: 'block', fontSize: '0.68rem' }}
                                  >
                                    {translatedGroup}
                                  </Typography>
                                </Box>
                              </Stack>

                              <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center', flexShrink: 0 }}>
                                {isPinned && !searchQuery && pinnedPageItems.length > 1 && (
                                  <>
                                    <Tooltip title={t('headerPins.moveLeft', 'Chapga surish')}>
                                      <span>
                                        <IconButton
                                          size="small"
                                          disabled={pinIndex === 0}
                                          onClick={(e) => handleMovePin(pinIndex, 'left', e)}
                                          sx={{ p: 0.35 }}
                                        >
                                          <IconChevronUp size={14} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                    <Tooltip title={t('headerPins.moveRight', "O'ngga surish")}>
                                      <span>
                                        <IconButton
                                          size="small"
                                          disabled={pinIndex === pinnedPageItems.length - 1}
                                          onClick={(e) => handleMovePin(pinIndex, 'right', e)}
                                          sx={{ p: 0.35 }}
                                        >
                                          <IconChevronDown size={14} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </>
                                )}
                                <Box
                                  sx={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 1.25,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: isPinned
                                      ? theme.palette.secondary.main
                                      : alpha(theme.palette.text.secondary, 0.1),
                                    color: isPinned
                                      ? theme.palette.secondary.contrastText
                                      : theme.palette.text.secondary
                                  }}
                                >
                                  {isPinned ? <IconCheck size={14} stroke={2.5} /> : <IconPlus size={14} />}
                                </Box>
                              </Stack>
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>

                  {/* Footer */}
                  {pinnedPageItems.length > 0 && (
                    <>
                      <Divider />
                      <Stack
                        direction="row"
                        sx={{
                          px: 2,
                          py: 1,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: alpha(theme.palette.background.default, 0.5)
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {t('headerPins.pinnedCount', '{{count}} ta bo‘lim biriktirilgan', {
                            count: pinnedPageItems.length
                          })}
                        </Typography>
                        <ButtonBase
                          onClick={() => setMenuSettings({ pinnedPages: [] })}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1,
                            py: 0.4,
                            borderRadius: 1,
                            color: theme.palette.error.main,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.error.main, 0.08)
                            }
                          }}
                        >
                          <IconPinnedOff size={13} />
                          {t('headerPins.clearAll', 'Barchasini tozalash')}
                        </ButtonBase>
                      </Stack>
                    </>
                  )}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default PinnedPagesSection;
