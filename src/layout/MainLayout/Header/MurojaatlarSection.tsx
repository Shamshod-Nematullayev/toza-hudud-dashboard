import { Avatar, Badge, ButtonBase, useTheme } from '@mui/material';
import { IconMessageReport } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from 'utils/api';

function MurojaatlarSection() {
  const theme = useTheme();
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await api.get('/murojaatlar/open-count');

      setCount(data);
    };
    fetchData();
  }, []);

  const handleClick = () => {
    navigate('/jurist/murojaatlar');
  };

  return (
    <ButtonBase sx={{ borderRadius: '12px' }}>
      <Badge color="warning" variant="standard" badgeContent={count} max={20}>
        <Avatar
          variant="rounded"
          sx={{
            // @ts-ignore
            ...theme.typography.commonAvatar,
            // @ts-ignore
            ...theme.typography.mediumAvatar,
            transition: 'all .2s ease-in-out',
            background: theme.palette.secondary.light,
            color: theme.palette.secondary.dark,
            '&[aria-controls="menu-list-grow"],&:hover': {
              background: theme.palette.secondary.dark,
              color: theme.palette.secondary.light
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
