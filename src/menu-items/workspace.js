//assets
import ImportantDevicesOutlinedIcon from '@mui/icons-material/ImportantDevicesOutlined';
import CalculateIcon from '@mui/icons-material/CalculateOutlined';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOnOutlined';
import BookIcon from '@mui/icons-material/BookOutlined';
import MailIcon from '@mui/icons-material/MailOutline';
import GavelIcon from '@mui/icons-material/GavelOutlined';
//contans
const icons = { ImportantDevicesOutlinedIcon, CalculateIcon, DoNotDisturbOnIcon, BookIcon, MailIcon, GavelIcon };
// ==============================|| EMPLOYEERS MENU ITEMS ||============================== //

const billing = {
  id: 'workspace',
  title: 'Ish maydoni',
  type: 'group',
  children: [
    {
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
          icon: icons.CalculateIcon
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
    },
    {
      id: 'jurist',
      title: 'Yurist',
      type: 'collapse',
      icon: icons.BookIcon,
      children: [
        {
          id: 'warningLetters',
          title: 'Ogohlantirish',
          type: 'item',
          url: '/jurist/warningLetter',
          icon: icons.MailIcon,
          breadcrumbs: true
        },
        {
          id: 'courtProccesses',
          title: 'Sud jarayonlari',
          type: 'item',
          url: '/jurist/courtProccesses',
          icon: icons.GavelIcon
        }
      ]
    }
  ]
};

export default billing;
