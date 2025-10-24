//assets
import BadgeIcon from '@mui/icons-material/BadgeOutlined';
import { MenuItem } from 'menu-items';
//contans
const icons = { BadgeIcon };
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
    }
  ]
};

export default employeers;
