import { PhonelinkSetup, PhoneOutlined } from '@mui/icons-material';
import { MenuItem } from 'menu-items';

export const caller: MenuItem = {
  id: 'caller',
  title: 'caller',
  type: 'group',
  allowedRoles: ['admin', 'billing'],
  children: [
    {
      id: 'call-warnings',
      title: 'call-warnings',
      type: 'item',
      url: '/caller/warnings',
      icon: PhonelinkSetup,
      allowedRoles: ['admin'],
      breadcrumbs: false
    },
    {
      id: 'call-warnings-workspace',
      title: 'call-warnings-workspace',
      type: 'item',
      url: '/caller/start',
      icon: PhoneOutlined,
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing']
    }
  ]
};
