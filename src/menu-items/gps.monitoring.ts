//assets
import { NoteAddOutlined, MapOutlined } from '@mui/icons-material';
import { MenuItem } from 'menu-items';
//contans
const icons = { NoteAddOutlined, MapOutlined };
// ==============================|| EMPLOYEERS MENU ITEMS ||============================== //

const gpsMonitoring: MenuItem = {
  id: 'gps-monitoring',
  title: 'gpsMonitoring',
  type: 'group',
  allowedRoles: ['admin', 'gps'],
  url: '/gpsMonitoring/gpsDalolatnomalar',
  breadcrumbs: false,
  children: [
    {
      id: 'gpsDalolatnomalar',
      title: 'gpsDalolatnomalar',
      type: 'item',
      url: '/gpsMonitoring/gpsDalolatnomalar',
      icon: icons.NoteAddOutlined,
      breadcrumbs: false,
      allowedRoles: ['admin', 'gps']
    },
    {
      id: 'visitsGraph',
      title: 'visitsGraph',
      type: 'item',
      url: '/gpsMonitoring/visitsGraph',
      icon: icons.MapOutlined,
      breadcrumbs: false,
      allowedRoles: ['admin', 'gps']
    }
  ]
};

export default gpsMonitoring;
