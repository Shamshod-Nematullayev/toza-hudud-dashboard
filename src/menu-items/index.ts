import uz from 'locales/uz';
import employeers from './employeers';
import workspace from './workspace';
import gpsMonitoring from './gps.monitoring';
import { caller } from './caller';

// ==============================|| MENU ITEMS ||============================== //

export interface MenuItem {
  id: string;
  title: keyof typeof uz.menuItems;
  type: 'group' | 'collapse' | 'item';
  url?: string;
  icon?: any;
  breadcrumbs?: boolean;
  children?: MenuItem[];
  allowedRoles?: ('admin' | 'billing' | 'stm' | 'jurist' | 'gps')[];
  caption?: string;
}

const menuItems = {
  items: [employeers, workspace, gpsMonitoring, caller]
};

export default menuItems;
