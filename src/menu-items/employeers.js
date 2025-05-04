//assets
import BadgeIcon from '@mui/icons-material/BadgeOutlined';
//contans
const icons = { BadgeIcon };
// ==============================|| EMPLOYEERS MENU ITEMS ||============================== //

const employeers = {
  id: 'employeers',
  title: 'employeers',
  type: 'group',
  children: [
    {
      id: 'inspectors',
      title: 'inspectors',
      type: 'item',
      url: '/employeers/inspectors',
      icon: icons.BadgeIcon,
      breadcrumbs: false
    }
  ]
};

export default employeers;
