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
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ChecklistIcon from '@mui/icons-material/Checklist';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

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
  PrintOutlinedIcon,
  PersonAddAltIcon,
  EditNoteIcon,
  ChecklistIcon,
  InsertDriveFileOutlinedIcon,
  AssessmentOutlinedIcon,
  TrendingDownIcon
};
// ==============================|| EMPLOYEERS MENU ITEMS ||============================== //

const billing = {
  id: 'workspace',
  title: 'workspace',
  type: 'group',
  children: [
    // {
    //   id: 'billing',
    //   title: 'billing',
    //   type: 'collapse',
    //   icon: icons.ImportantDevicesOutlinedIcon,
    //   children: [
    {
      id: 'createAbonentPetition',
      title: 'createAbonentPetition',
      type: 'item',
      url: '/billing/createAbonentAriza',
      icon: icons.NoteAddOutlinedIcon,
      breadcrumbs: false
    },
    {
      id: 'importAbonentPetition',
      title: 'importAbonentPetition',
      type: 'item',
      url: '/billing/importAbonentPetition',
      icon: icons.UploadFileOutlinedIcon,
      breadcrumbs: false
    },
    {
      id: 'petitions',
      title: 'petitions',
      type: 'item',
      url: '/billing/recalculation',
      icon: icons.CalculateIcon,
      breadcrumbs: false
    },
    {
      id: 'deleteDublicates',
      title: `deleteDublicates`,
      type: 'item',
      url: '/billing/deleteDublicate',
      icon: icons.DoNotDisturbOnIcon
    },
    {
      id: 'printAbonentsList',
      title: 'printAbonentsList',
      type: 'item',
      url: '/billing/printAbonentsList',
      icon: icons.PrintOutlinedIcon,
      breadcrumbs: false
    },
    {
      id: 'inventory',
      title: 'inventory',
      type: 'collapse',
      icon: icons.ChecklistIcon,
      children: [
        {
          id: 'createInventory',
          title: 'createInventory',
          type: 'item',
          url: '/billing/xatlovOdamSoni',
          icon: icons.PersonAddAltIcon,
          breadcrumbs: false
        },
        {
          id: 'invertoreDocuments',
          title: 'invertoreDocuments',
          type: 'item',
          url: '/billing/xatlovDalolatnomalar',
          icon: icons.InsertDriveFileOutlinedIcon,
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'reports',
      title: 'Hisobotlar',
      type: 'item',
      url: '/billing/reports',
      icon: icons.AssessmentOutlinedIcon,
      breadcrumbs: false
    },
    {
      id: 'newAbonentRequirements',
      title: 'newAbonentRequirements',
      type: 'item',
      url: '/billing/pendingNewAbonents',
      icon: icons.PersonAddAltIcon,
      breadcrumbs: false
    },
    //   ]
    // }
    {
      id: 'jurist',
      title: 'Yurist',
      type: 'collapse',
      icon: icons.BookIcon,
      children: [
        {
          id: 'qarzdorAbonentlar',
          title: 'Qarzdor abonentlar',
          type: 'item',
          url: '/jurist/qarzdorAbonentlar',
          icon: icons.TrendingDownIcon,
          breadcrumbs: false
        },
        {
          id: 'warningLetters',
          title: 'Ogohlantirish',
          type: 'item',
          url: '/jurist/warningLetter',
          icon: icons.MailIcon,
          breadcrumbs: false
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
        },
        {
          id: 'courtNote',
          title: 'Nishonga olingan abonentlar',
          type: 'item',
          url: '/jurist/courtNote',
          icon: icons.EditNoteIcon,
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default billing;
