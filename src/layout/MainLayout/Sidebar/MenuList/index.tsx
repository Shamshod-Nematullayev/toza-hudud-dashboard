// material-ui
import { Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// project imports
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import NavCollapse from './NavCollapse';
import useCustomizationStore from 'store/customizationStore';
import { getCustomizedMenuItems } from 'utils/menuCustomizationHelper';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
  const { user, menuSettings } = useCustomizationStore();
  const customizedItems = getCustomizedMenuItems(menuItem.items, menuSettings);

  const navItems = customizedItems.map((item) => {
    switch (item.type) {
      case 'group':
        return item.allowedRoles?.some((role) => user?.roles?.includes(role)) && <NavGroup key={item.id} item={item} />;
      case 'collapse':
        return item.allowedRoles?.some((role) => user?.roles?.includes(role)) && <NavCollapse key={item.id} menu={item} level={1} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return <>{navItems}</>;
};

export default MenuList;
