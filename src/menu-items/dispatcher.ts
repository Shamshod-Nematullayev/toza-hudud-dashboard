import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TelegramIcon from '@mui/icons-material/Telegram';
import { MenuItem } from 'menu-items';

const dispatcher: MenuItem = {
  id: 'dispatcher',
  title: 'dispatcher',
  type: 'group',
  allowedRoles: ['admin', 'dispatcher'],
  children: [
    {
      id: 'dispatcher-home',
      title: 'dispatcherHome',
      type: 'item',
      url: '/dispatcher',
      icon: DashboardOutlinedIcon,
      breadcrumbs: false,
      allowedRoles: ['admin', 'dispatcher'],
    },
    {
      id: 'orders',
      title: 'orders',
      type: 'item',
      url: '/dispatcher/orders',
      icon: ListAltOutlinedIcon,
      breadcrumbs: false,
      allowedRoles: ['admin', 'dispatcher'],
    },
    {
      id: 'dispatch-schedule',
      title: 'dispatchSchedule',
      type: 'item',
      url: '/dispatcher/schedule',
      icon: CalendarMonthOutlinedIcon,
      breadcrumbs: false,
      allowedRoles: ['admin', 'dispatcher'],
    },
    {
      id: 'drivers',
      title: 'drivers',
      type: 'item',
      url: '/dispatcher/drivers',
      icon: LocalShippingOutlinedIcon,
      breadcrumbs: false,
      allowedRoles: ['admin', 'dispatcher'],
    },
    {
      id: 'dispatch-telegram',
      title: 'dispatchTelegram',
      type: 'item',
      url: '/dispatcher/telegram',
      icon: TelegramIcon,
      breadcrumbs: false,
      allowedRoles: ['admin', 'dispatcher'],
    },
  ],
};

export default dispatcher;
