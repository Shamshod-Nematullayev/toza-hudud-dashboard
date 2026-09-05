import { Avatar, Badge, ButtonBase, useTheme } from '@mui/material';
import { IconMessageReport } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCustomizationStore from 'store/customizationStore';
import api from 'utils/api';

function MurojaatlarSection() {
  const theme = useTheme();
  const { openMurojaatCount, setOpenMurojaatCount, user } = useCustomizationStore();
  const [dueMurojaatCount, setDueMurojaatCount] = useState(0);
  const navigate = useNavigate();

  const roles = user?.roles || [];
  const hasMurojaatAccess =
    roles.some((role) => ['admin', 'jurist', 'rahbar', 'murojaat_nazoratchi', 'product_admin'].includes(role)) &&
    !roles.every((role) => role === 'dispatcher');

  useEffect(() => {
    if (!hasMurojaatAccess) return;

    const fetchData = async () => {
      try {
        const { data } = await api.get<any>('/murojaatlar/open-count');
        const openCount = typeof data === 'number' ? data : (data?.openMurojaatCount ?? 0);
        const overdueCount = typeof data === 'object' && data !== null ? (data?.overdueMurojaatCount ?? 0) : 0;
        setOpenMurojaatCount(openCount);
        setDueMurojaatCount(overdueCount);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [hasMurojaatAccess]);

  if (!hasMurojaatAccess) {
    return null;
  }

  const handleClick = () => {
    navigate('/jurist/murojaatlar');
  };

  const countToDisplay =
    typeof openMurojaatCount === 'number'
      ? openMurojaatCount
      : typeof (openMurojaatCount as any)?.openMurojaatCount === 'number'
      ? (openMurojaatCount as any).openMurojaatCount
      : 0;

  return (
    <ButtonBase sx={{ borderRadius: '12px' }}>
      <Badge color={dueMurojaatCount > 0 ? 'error' : 'warning'} variant="standard" badgeContent={countToDisplay} max={20}>
        <Avatar
          variant="rounded"
          sx={{
            // @ts-ignore
            ...theme.typography.commonAvatar,
            // @ts-ignore
            ...theme.typography.mediumAvatar,
            transition: 'all .2s ease-in-out',
            background: theme.palette.mode === 'dark' ? '#16204A' : theme.palette.secondary.light,
            color: theme.palette.mode === 'dark' ? '#EDEFFA' : theme.palette.secondary.dark,
            border: theme.palette.mode === 'dark' ? '1px solid #29346B' : 'none',
            '&[aria-controls="menu-list-grow"],&:hover': {
              background: theme.palette.mode === 'dark' ? '#1B2554' : theme.palette.secondary.dark,
              color: theme.palette.mode === 'dark' ? '#EDEFFA' : theme.palette.secondary.light
            }
          }}
          onClick={handleClick}
          color="inherit"
        >
          <IconMessageReport stroke={1.5} size="1.3rem" />
        </Avatar>
      </Badge>
    </ButtonBase>
  );
}

export default MurojaatlarSection;
