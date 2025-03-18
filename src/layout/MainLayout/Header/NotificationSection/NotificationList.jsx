import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

// project-import
import Chip from 'ui-component/extended/Chip';

import useNotificationStore from './useStore';

const ListItemWrapper = ({ children }) => {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'primary.light'
        }
      }}
    >
      {children}
    </Box>
  );
};

ListItemWrapper.propTypes = {
  children: PropTypes.node
};

// ==============================|| NOTIFICATION LIST ITEM ||============================== //

const NotificationList = () => {
  const theme = useTheme();

  const chipSX = {
    height: 24,
    padding: '0 6px'
  };
  const chipErrorSX = {
    ...chipSX,
    color: theme.palette.error.dark,
    backgroundColor: theme.palette.error.light,
    marginRight: '5px'
  };

  const chipWarningSX = {
    ...chipSX,
    color: theme.palette.warning.dark,
    backgroundColor: theme.palette.warning.light
  };

  const chipSuccessSX = {
    ...chipSX,
    color: theme.palette.success.dark,
    backgroundColor: theme.palette.success.light,
    height: 28
  };

  const { notifications, markNotificationAsRead, filterStatus } = useNotificationStore();

  return (
    <List
      sx={{
        width: '100%',
        maxWidth: 330,
        py: 0,
        borderRadius: '10px',
        [theme.breakpoints.down('md')]: {
          maxWidth: 300
        },
        '& .MuiListItemSecondaryAction-root': {
          top: 22
        },
        '& .MuiDivider-root': {
          my: 0
        },
        '& .list-container': {
          pl: 7
        }
      }}
    >
      <div>
        {notifications
          .filter((n) => n.status === filterStatus || filterStatus === 'all')
          .map((notification) => (
            <div key={notification._id}>
              <ListItemWrapper>
                <ListItem alignItems="center">
                  <ListItemAvatar>
                    <Avatar alt={notification.sender.name || notification.sender.id} src={notification.sender.photo} />
                  </ListItemAvatar>
                  <ListItemText primary={notification.sender.name || notification.sender.id} />
                  <ListItemSecondaryAction>
                    <Grid container justifyContent="flex-end">
                      <Grid item xs={12}>
                        <Typography variant="caption" display="block" gutterBottom>
                          {parseTimeDistanceString(new Date(notification.createdAt))}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ListItemSecondaryAction>
                </ListItem>
                <Grid container direction="column" className="list-container">
                  <Grid item xs={12} sx={{ pb: 2 }}>
                    <Typography variant={notification.status === 'new' ? 'subtitle1' : 'subtitle2'}>{notification.message}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container>
                      <Grid item>
                        {notification.status === 'new' && (
                          <Chip label="O'qildi" sx={chipSX} onClick={() => markNotificationAsRead(notification._id)} />
                        )}
                      </Grid>
                      {notification.type === 'task' && (
                        <Grid item>
                          <Chip label="Bajarildi" sx={chipSuccessSX} />
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </ListItemWrapper>
              <Divider />
            </div>
          ))}
      </div>
    </List>
  );
};

export default NotificationList;

function parseTimeDistanceString(date) {
  const distance = new Date() - date;
  if (distance < 1000 * 60) {
    return 'Hozir';
  } else if (distance < 1000 * 60 * 60) {
    return Math.floor(distance / (1000 * 60)) + ' daqiqa avval';
  } else if (distance < 1000 * 60 * 60 * 24) {
    return Math.floor(distance / (1000 * 60 * 60)) + ' soat avval';
  } else {
    return Math.floor(distance / (1000 * 60 * 60 * 24)) + ' kun avval';
  }
}
