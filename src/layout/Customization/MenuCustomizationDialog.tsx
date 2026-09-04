import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  Visibility,
  VisibilityOff,
  RestartAlt,
  Tune,
  FiberManualRecord,
  NewReleasesOutlined
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import menuItem, { MenuItem } from 'menu-items';
import useCustomizationStore from 'store/customizationStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

const MenuCustomizationDialog: React.FC<Props> = ({ open, onClose }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user, menuSettings, setMenuSettings, resetMenuSettings } = useCustomizationStore();

  // Foydalanuvchiga ruxsat etilgan asosiy guruhlar
  const userGroups = menuItem.items.filter((group) =>
    group.allowedRoles?.some((role) => user?.roles?.includes(role))
  );

  // Tanlangan tab (0: Barcha guruhlar tartibi, 1..n: Muayyan guruh ichki elementlari)
  const [activeTab, setActiveTab] = useState(0);

  // Guruhlarning hozirgi tartibi
  const getOrderedGroups = (): MenuItem[] => {
    const savedOrder = menuSettings.groupOrder || [];
    const savedOrderSet = new Set(savedOrder);
    const itemMap = new Map<string, MenuItem>();
    userGroups.forEach((g) => itemMap.set(g.id, g));

    // Yangi guruhlar (savedOrder da yo'q bo'lganlar) eng yuqoriga chiqadi
    const newItems = userGroups.filter((g) => !savedOrderSet.has(g.id));
    const ordered: MenuItem[] = [];
    savedOrder.forEach((id) => {
      const g = itemMap.get(id);
      if (g) ordered.push(g);
    });

    return [...newItems, ...ordered];
  };

  // Guruh ichidagi bolalar (children) elementlari tartibi
  const getOrderedChildren = (group: MenuItem): MenuItem[] => {
    const children = (group.children || []).filter((child) =>
      child.allowedRoles?.some((role) => user?.roles?.includes(role))
    );
    const groupSetting = menuSettings.itemsByGroup?.[group.id];
    const savedOrder = groupSetting?.order || [];
    const savedOrderSet = new Set(savedOrder);
    const itemMap = new Map<string, MenuItem>();
    children.forEach((c) => itemMap.set(c.id, c));

    // Yangi qo'shilgan elementlar har doim ENG YUQORIGA tushadi
    const newItems = children.filter((c) => !savedOrderSet.has(c.id));
    const ordered: MenuItem[] = [];
    savedOrder.forEach((id) => {
      const c = itemMap.get(id);
      if (c) ordered.push(c);
    });

    return [...newItems, ...ordered];
  };

  // 1. Asosiy guruhni ko'rsatish/yashirish
  const handleToggleGroupVisibility = (groupId: string) => {
    const currentHidden = new Set(menuSettings.hiddenGroups || []);
    if (currentHidden.has(groupId)) {
      currentHidden.delete(groupId);
    } else {
      currentHidden.add(groupId);
    }
    setMenuSettings({ hiddenGroups: Array.from(currentHidden) });
  };

  // 2. Asosiy guruhni yuqoriga / pastga ko'chirish
  const handleMoveGroup = (index: number, direction: 'up' | 'down') => {
    const groups = getOrderedGroups();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= groups.length) return;

    const newGroups = [...groups];
    const [moved] = newGroups.splice(index, 1);
    newGroups.splice(targetIndex, 0, moved);

    setMenuSettings({ groupOrder: newGroups.map((g) => g.id) });
  };

  // 3. Guruh ichidagi elementni ko'rsatish/yashirish
  const handleToggleChildVisibility = (groupId: string, childId: string) => {
    const groupSettings = menuSettings.itemsByGroup?.[groupId] || {};
    const currentHidden = new Set(groupSettings.hidden || []);
    if (currentHidden.has(childId)) {
      currentHidden.delete(childId);
    } else {
      currentHidden.add(childId);
    }

    setMenuSettings({
      itemsByGroup: {
        ...menuSettings.itemsByGroup,
        [groupId]: {
          ...groupSettings,
          hidden: Array.from(currentHidden)
        }
      }
    });
  };

  // 4. Guruh ichidagi elementni yuqoriga / pastga ko'chirish
  const handleMoveChild = (group: MenuItem, index: number, direction: 'up' | 'down') => {
    const children = getOrderedChildren(group);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= children.length) return;

    const newChildren = [...children];
    const [moved] = newChildren.splice(index, 1);
    newChildren.splice(targetIndex, 0, moved);

    const groupSettings = menuSettings.itemsByGroup?.[group.id] || {};
    setMenuSettings({
      itemsByGroup: {
        ...menuSettings.itemsByGroup,
        [group.id]: {
          ...groupSettings,
          order: newChildren.map((c) => c.id)
        }
      }
    });
  };

  // Standart holatga qaytarish
  const handleReset = () => {
    resetMenuSettings();
  };

  const currentOrderedGroups = getOrderedGroups();
  const selectedGroup = activeTab > 0 ? currentOrderedGroups[activeTab - 1] : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Tune color="primary" />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Menyu Sozlamalari
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Menyularni ko'rsatish/yashirish va joylashuv tartibini o'zgartirish
              </Typography>
            </Box>
          </Stack>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<RestartAlt />}
            onClick={handleReset}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Standart holatga qaytarish
          </Button>
        </Stack>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 48
            }
          }}
        >
          <Tab label="📑 Asosiy Guruhlar" />
          {currentOrderedGroups.map((group) => (
            <Tab
              key={group.id}
              label={t('menuItems.' + group.title)}
            />
          ))}
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 2.5, flex: 1, overflowY: 'auto' }}>
        {activeTab === 0 ? (
          // TAB 0: ASOSIY GURUHLAR TARTIBI
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, px: 1 }}>
              Asosiy bo'limlarning yon paneldagi ketma-ketligini o'zgartiring yoki keraksizlarini yashiring:
            </Typography>
            <List disablePadding>
              {currentOrderedGroups.map((group, index) => {
                const isHidden = (menuSettings.hiddenGroups || []).includes(group.id);
                const isNew =
                  Boolean(menuSettings.groupOrder?.length) &&
                  !menuSettings.groupOrder?.includes(group.id);

                return (
                  <ListItem
                    key={group.id}
                    sx={{
                      mb: 1,
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isHidden ? 'divider' : 'primary.light',
                      bgcolor: isHidden
                        ? 'action.hover'
                        : theme.palette.mode === 'dark'
                          ? 'background.paper'
                          : 'grey.50',
                      opacity: isHidden ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: 'text.secondary',
                          width: 24,
                          textAlign: 'center'
                        }}
                      >
                        {index + 1}
                      </Typography>
                      <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {t('menuItems.' + group.title)}
                          </Typography>
                          {isNew && (
                            <Chip
                              label="Yangi"
                              color="success"
                              size="small"
                              icon={<NewReleasesOutlined sx={{ fontSize: 14 }} />}
                              sx={{ height: 20, fontSize: '10px', fontWeight: 700 }}
                            />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {group.children?.length || 0} ta ichki bo'lim mavjud
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Tooltip title="Yuqoriga surish">
                        <span>
                          <IconButton
                            size="small"
                            disabled={index === 0}
                            onClick={() => handleMoveGroup(index, 'up')}
                            color="primary"
                          >
                            <ArrowUpward fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Pastga surish">
                        <span>
                          <IconButton
                            size="small"
                            disabled={index === currentOrderedGroups.length - 1}
                            onClick={() => handleMoveGroup(index, 'down')}
                            color="primary"
                          >
                            <ArrowDownward fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                      <Tooltip title={isHidden ? "Ko'rsatish" : 'Yashirish'}>
                        <IconButton
                          size="small"
                          color={isHidden ? 'default' : 'primary'}
                          onClick={() => handleToggleGroupVisibility(group.id)}
                        >
                          {isHidden ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ) : selectedGroup ? (
          // TAB 1..N: GURUH ICHKI ELEMENTLARI
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2, px: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <strong>"{t('menuItems.' + selectedGroup.title)}"</strong> guruhi ichidagi menyularni sozlash:
              </Typography>
            </Stack>
            <List disablePadding>
              {getOrderedChildren(selectedGroup).map((child, index, arr) => {
                const groupSettings = menuSettings.itemsByGroup?.[selectedGroup.id] || {};
                const isHidden = (groupSettings.hidden || []).includes(child.id);
                const isNew =
                  Boolean(groupSettings.order?.length) &&
                  !groupSettings.order?.includes(child.id);

                const Icon = child.icon;

                return (
                  <ListItem
                    key={child.id}
                    sx={{
                      mb: 1,
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isHidden ? 'divider' : 'primary.light',
                      bgcolor: isHidden
                        ? 'action.hover'
                        : theme.palette.mode === 'dark'
                          ? 'background.paper'
                          : 'grey.50',
                      opacity: isHidden ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: 'text.secondary',
                          width: 24,
                          textAlign: 'center'
                        }}
                      >
                        {index + 1}
                      </Typography>
                      {Icon ? (
                        <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                          <Icon fontSize="small" />
                        </Box>
                      ) : (
                        <FiberManualRecord sx={{ fontSize: 10, color: 'text.secondary' }} />
                      )}
                      <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {t('menuItems.' + child.title)}
                          </Typography>
                          {isNew && (
                            <Chip
                              label="Yangi"
                              color="success"
                              size="small"
                              icon={<NewReleasesOutlined sx={{ fontSize: 14 }} />}
                              sx={{ height: 20, fontSize: '10px', fontWeight: 700 }}
                            />
                          )}
                          {child.type === 'collapse' && (
                            <Chip
                              label="Ochiluvchi guruh"
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '10px' }}
                            />
                          )}
                        </Stack>
                        {child.url && (
                          <Typography variant="caption" color="text.secondary">
                            {child.url}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Tooltip title="Yuqoriga surish">
                        <span>
                          <IconButton
                            size="small"
                            disabled={index === 0}
                            onClick={() => handleMoveChild(selectedGroup, index, 'up')}
                            color="primary"
                          >
                            <ArrowUpward fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Pastga surish">
                        <span>
                          <IconButton
                            size="small"
                            disabled={index === arr.length - 1}
                            onClick={() => handleMoveChild(selectedGroup, index, 'down')}
                            color="primary"
                          >
                            <ArrowDownward fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                      <Tooltip title={isHidden ? "Ko'rsatish" : 'Yashirish'}>
                        <IconButton
                          size="small"
                          color={isHidden ? 'default' : 'primary'}
                          onClick={() => handleToggleChildVisibility(selectedGroup.id, child.id)}
                        >
                          {isHidden ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
          💡 Barcha o'zgarishlar avtomatik saqlanadi va yangi qo'shilgan menyular har doim eng yuqorida ko'rinadi.
        </Typography>
        <Button onClick={onClose} variant="contained" color="primary" sx={{ px: 3 }}>
          Tayyor
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MenuCustomizationDialog;