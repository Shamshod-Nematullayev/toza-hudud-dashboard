// material-ui
import { Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// project imports
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import NavCollapse from './NavCollapse';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navItems = menuItem.items.map((item) => {
    switch (item.type) {
      case 'group':
        return item.allowedRoles.some((role) => user?.roles.includes(role)) && <NavGroup key={item.id} item={item} />;
      case 'collapse':
        return item.allowedRoles.some((role) => user?.roles.includes(role)) && <NavCollapse key={item.id} menu={item} level={1} />;
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
