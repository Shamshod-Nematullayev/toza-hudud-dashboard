import uz from 'locales/uz';
import employeers from './employeers';
import workspace from './workspace';
import gpsMonitoring from './gps.monitoring';
import { caller } from './caller';
import productAdmin from './productAdmin';
import dispatcher from './dispatcher';

// ==============================|| MENU ITEMS ||============================== //

export interface MenuItem {
  id: string;
  title: keyof typeof uz.menuItems;
  type: 'group' | 'collapse' | 'item';
  url?: string;
  icon?: any;
  breadcrumbs?: boolean;
  children?: MenuItem[];
  allowedRoles?: ('admin' | 'billing' | 'stm' | 'jurist' | 'gps' | 'product_admin' | 'rahbar' | 'dispatcher' | 'murojaat_nazoratchi')[];
  caption?: string;
}

const menuItems = {
  items: [dispatcher, employeers, workspace, gpsMonitoring, caller, productAdmin]
};

export default menuItems;
