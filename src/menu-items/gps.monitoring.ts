//assets
import { NoteAddOutlined, MapOutlined, PlaceOutlined } from '@mui/icons-material';
import { MenuItem } from 'menu-items';
//contans
const icons = { NoteAddOutlined, MapOutlined, PlaceOutlined };
// ==============================|| EMPLOYEERS MENU ITEMS ||============================== //

const gpsMonitoring: MenuItem = {
  id: 'gps-monitoring',
  title: 'gpsMonitoring',
  type: 'group',
  allowedRoles: ['admin', 'gps', 'billing', 'product_admin'],
  url: '/gpsMonitoring/gpsDalolatnomalar',
  breadcrumbs: false,
  children: [
    // {
    //   id: 'gpsDalolatnomalar',
    //   title: 'gpsDalolatnomalar',
    //   type: 'item',
    //   url: '/gpsMonitoring/gpsDalolatnomalar',
    //   icon: icons.NoteAddOutlined,
    //   breadcrumbs: false,
    //   allowedRoles: ['admin', 'gps']
    // },
    {
      id: 'visitsGraph',
      title: 'visitsGraph',
      type: 'item',
      url: '/gpsMonitoring/visitsGraph',
      icon: icons.MapOutlined,
      breadcrumbs: false,
      allowedRoles: ['admin', 'gps']
    },
    {
      id: 'abonentsMap',
      title: 'abonentsMap',
      type: 'item',
      url: '/gpsMonitoring/abonentsMap',
      icon: icons.PlaceOutlined,
      breadcrumbs: false,
      allowedRoles: ['admin', 'gps', 'billing', 'product_admin']
    }
  ]
};

export default gpsMonitoring;
