//assets
import ImportantDevicesOutlinedIcon from '@mui/icons-material/ImportantDevicesOutlined';
import CalculateIcon from '@mui/icons-material/CalculateOutlined';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOnOutlined';
//contans
const icons = { ImportantDevicesOutlinedIcon, CalculateIcon, DoNotDisturbOnIcon };
// ==============================|| EMPLOYEERS MENU ITEMS ||============================== //

const billing = {
  id: 'billing',
  title: 'Billing',
  type: 'collapse',
  icon: icons.ImportantDevicesOutlinedIcon,
  children: [
    {
      id: 'recalculation',
      title: 'Qayta hisob-kitob',
      type: 'item',
      url: '/billing/recalculation',
      icon: icons.CalculateIcon,
      target: true
    },
    {
      id: 'deleteDublicate',
      title: `Ikkilamchi kodlarni o'chirish`,
      type: 'item',
      url: '/billing/deleteDublicate',
      icon: icons.DoNotDisturbOnIcon,
      target: true
    }
  ]
};

export default billing;
