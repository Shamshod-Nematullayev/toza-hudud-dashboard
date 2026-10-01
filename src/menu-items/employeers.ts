//assets
import { Checklist, LocationCity, Telegram } from '@mui/icons-material';
import BadgeIcon from '@mui/icons-material/BadgeOutlined';
import { MenuItem } from 'menu-items';
//contans
const icons = { BadgeIcon, Checklist, LocationCity, Telegram };
// ==============================|| EMPLOYEERS MENU ITEMS ||============================== //

const employeers: MenuItem = {
  id: 'employeers',
  title: 'employeers',
  type: 'group',
  allowedRoles: ['admin', 'billing', 'rahbar', 'murojaat_nazoratchi', 'product_admin'],
  children: [
    {
      id: 'inspectors',
      title: 'inspectors',
      type: 'item',
      url: '/employeers/inspectors',
      icon: icons.BadgeIcon,
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing', 'rahbar', 'product_admin']
    },
    {
      id: 'mahallas',
      title: 'mahallas',
      type: 'item',
      url: '/employeers/mahallas',
      icon: icons.LocationCity,
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing', 'rahbar', 'product_admin']
    },
    {
      id: 'tasks',
      title: 'tasks',
      type: 'item',
      url: '/employeers/tasks',
      icon: icons.Checklist,
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing', 'rahbar', 'product_admin']
    },
    {
      id: 'groupTasks',
      title: 'Guruh topshiriqlari (TG)',
      type: 'item',
      url: '/employeers/group-tasks',
      icon: icons.Telegram,
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing', 'rahbar', 'murojaat_nazoratchi', 'product_admin']
    }
  ]
};

export default employeers;
