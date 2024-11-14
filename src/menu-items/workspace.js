//assets
import ImportantDevicesOutlinedIcon from '@mui/icons-material/ImportantDevicesOutlined';
import CalculateIcon from '@mui/icons-material/CalculateOutlined';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOnOutlined';
import BookIcon from '@mui/icons-material/BookOutlined';
import MailIcon from '@mui/icons-material/MailOutline';
import GavelIcon from '@mui/icons-material/GavelOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
//contans
const icons = {
  ImportantDevicesOutlinedIcon,
  CalculateIcon,
  DoNotDisturbOnIcon,
  BookIcon,
  MailIcon,
  GavelIcon,
  FileDownloadOutlinedIcon,
  UploadFileOutlinedIcon,
  NoteAddOutlinedIcon,
  PrintOutlinedIcon
};
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
          id: 'createAbonentAriza',
          title: 'Abonent arizasi yaratish',
          type: 'item',
          url: '/billing/createAbonentAriza',
          icon: icons.NoteAddOutlinedIcon
        },
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
          icon: icons.DoNotDisturbOnIcon
        },
        {
          id: 'importAbonentPetition',
          title: 'Abonent arizalari kiritish',
          type: 'item',
          url: '/billing/importAbonentPetition',
          icon: icons.UploadFileOutlinedIcon
        },
        {
          id: 'printAbonentsList',
          title: "Abonentlar ro'yxatini chop etish",
          type: 'item',
          url: '/billing/printAbonentsList',
          icon: icons.PrintOutlinedIcon,
          breadcrumbs: false
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
        },
        {
          id: 'importPetition',
          title: 'Sudga arizalar kiritish',
          type: 'item',
          url: '/jurist/importPetition',
          icon: icons.FileDownloadOutlinedIcon
        }
      ]
    }
  ]
};

export default billing;
