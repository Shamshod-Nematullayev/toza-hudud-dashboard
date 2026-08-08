import { AdminPanelSettingsOutlined, BusinessOutlined, PeopleAltOutlined, AnalyticsOutlined } from '@mui/icons-material';
import { MenuItem } from './index';

const icons = {
  AdminPanelSettingsOutlined,
  BusinessOutlined,
  PeopleAltOutlined,
  AnalyticsOutlined
};

const productAdmin: MenuItem = {
  id: 'productAdminGroup',
  title: 'productAdmin',
  type: 'group',
  allowedRoles: ['admin', 'product_admin'],
  children: [
    {
      id: 'manageCompanies',
      title: 'manageCompanies',
      type: 'item',
      url: '/product-admin/companies',
      icon: icons.BusinessOutlined,
      breadcrumbs: false,
      allowedRoles: ['product_admin']
    },
    {
      id: 'manageUsers',
      title: 'manageUsers',
      type: 'item',
      url: '/product-admin/users',
      icon: icons.PeopleAltOutlined,
      breadcrumbs: false,
      allowedRoles: ['product_admin']
    },
    {
      id: 'productAnalytics',
      title: 'productAnalytics',
      type: 'item',
      url: '/product-admin/analytics',
      icon: icons.AnalyticsOutlined,
      breadcrumbs: false,
      allowedRoles: ['admin', 'product_admin']
    }
  ]
};

export default productAdmin;
