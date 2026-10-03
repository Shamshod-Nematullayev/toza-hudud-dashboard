import { AdminPanelSettingsOutlined, BusinessOutlined, PeopleAltOutlined, AnalyticsOutlined, ManageHistoryOutlined } from '@mui/icons-material';
import { MenuItem } from './index';

const icons = {
  AdminPanelSettingsOutlined,
  BusinessOutlined,
  PeopleAltOutlined,
  AnalyticsOutlined,
  ManageHistoryOutlined
};

const productAdmin: MenuItem = {
  id: 'productAdminGroup',
  title: 'productAdmin',
  type: 'group',
  allowedRoles: ['product_admin'],
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
    },
    {
      id: 'agendaJobs',
      title: 'agendaJobs',
      type: 'item',
      url: '/product-admin/agenda-jobs',
      icon: icons.ManageHistoryOutlined,
      breadcrumbs: false,
      allowedRoles: ['product_admin']
    }
  ]
};

export default productAdmin;
