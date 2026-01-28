//assets
import { Checklist } from '@mui/icons-material';
import BadgeIcon from '@mui/icons-material/BadgeOutlined';
import { MenuItem } from 'menu-items';
//contans
const icons = { BadgeIcon, Checklist };
// ==============================|| EMPLOYEERS MENU ITEMS ||============================== //

const employeers: MenuItem = {
  id: 'employeers',
  title: 'employeers',
  type: 'group',
  allowedRoles: ['admin', 'billing'],
  children: [
    {
      id: 'inspectors',
      title: 'inspectors',
      type: 'item',
      url: '/employeers/inspectors',
      icon: icons.BadgeIcon,
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing']
    },
    {
      id: 'tasks',
      title: 'tasks',
      type: 'item',
      url: '/employeers/tasks',
      icon: icons.Checklist,
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing']
    }
  ]
};

export default employeers;
