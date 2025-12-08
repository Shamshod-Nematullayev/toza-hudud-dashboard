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
import { DocumentScannerOutlined, MoveDown, ReceiptOutlined, FolderOutlined } from '@mui/icons-material';
import uz from '../locales/uz';
import { MenuItem } from 'menu-items';

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
  TrendingDownIcon,
  DocumentScannerOutlined,
  ReceiptOutlined,
  FolderOutlined
};
// ==============================|| EMPLOYEERS MENU ITEMS ||============================== //

const billing: MenuItem = {
  id: 'workspace',
  title: 'workspace',
  type: 'group',
  allowedRoles: ['admin', 'billing', 'stm'],
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
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing']
    },
    {
      id: 'importAbonentPetition',
      title: 'importAbonentPetition',
      type: 'item',
      url: '/billing/importAbonentPetition',
      icon: icons.UploadFileOutlinedIcon,
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing']
    },
    {
      id: 'folders',
      title: 'folders',
      type: 'item',
      url: '/billing/folders',
      icon: icons.FolderOutlined,
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing']
    },
    {
      id: 'petitions',
      title: 'petitions',
      type: 'item',
      url: '/billing/recalculation',
      icon: icons.CalculateIcon,
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing']
    },
    {
      id: 'specialActs',
      title: 'specialActs',
      type: 'collapse',
      icon: EditNoteIcon,
      allowedRoles: ['admin', 'billing'],
      children: [
        {
          id: 'deleteDublicates',
          title: `deleteDublicates`,
          type: 'item',
          url: '/billing/deleteDublicate',
          icon: icons.DoNotDisturbOnIcon,
          breadcrumbs: false,
          allowedRoles: ['admin', 'billing']
        },
        {
          id: 'moneyTransfer',
          title: 'moneyTransfer',
          type: 'item',
          url: '/billing/specialMoneyTransfer',
          icon: MoveDown,
          breadcrumbs: false,
          allowedRoles: ['admin', 'billing']
        },
        {
          id: 'importAkt',
          title: 'importActs',
          type: 'item',
          url: '/billing/importAkt',
          icon: UploadFileOutlinedIcon,
          breadcrumbs: false,
          allowedRoles: ['admin', 'billing']
        }
      ]
    },
    {
      id: 'printAbonentsList',
      title: 'printAbonentsList',
      type: 'item',
      url: '/billing/printAbonentsList',
      icon: icons.PrintOutlinedIcon,
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing']
    },
    {
      id: 'inventory',
      title: 'inventory',
      type: 'collapse',
      icon: icons.ChecklistIcon,
      allowedRoles: ['admin', 'billing'],
      children: [
        {
          id: 'createInventory',
          title: 'createInventory',
          type: 'item',
          url: '/billing/xatlovOdamSoni',
          icon: icons.PersonAddAltIcon,
          breadcrumbs: false,
          allowedRoles: ['admin', 'billing']
        },
        {
          id: 'invertoreDocuments',
          title: 'invertoreDocuments',
          type: 'item',
          url: '/billing/xatlovDalolatnomalar',
          icon: icons.InsertDriveFileOutlinedIcon,
          breadcrumbs: false,
          allowedRoles: ['admin', 'billing']
        }
      ]
    },
    {
      id: 'reports',
      title: 'Hisobotlar',
      type: 'item',
      url: '/billing/reports',
      icon: icons.AssessmentOutlinedIcon,
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing']
    },
    {
      id: 'newAbonentRequirements',
      title: 'newAbonentRequirements',
      type: 'item',
      url: '/billing/pendingNewAbonents',
      icon: icons.PersonAddAltIcon,
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing']
    },
    {
      id: 'blanks',
      title: 'Blankalar',
      type: 'item',
      url: '/billing/blanks',
      icon: icons.DocumentScannerOutlined,
      breadcrumbs: false,
      allowedRoles: ['admin', 'billing', 'jurist']
    },
    {
      id: 'jurist',
      title: 'Yurist',
      type: 'collapse',
      icon: icons.BookIcon,
      allowedRoles: ['admin', 'jurist'],
      children: [
        {
          id: 'qarzdorAbonentlar',
          title: 'Qarzdor abonentlar',
          type: 'item',
          url: '/jurist/qarzdorAbonentlar',
          icon: icons.TrendingDownIcon,
          breadcrumbs: false,
          allowedRoles: ['admin', 'jurist']
        },
        {
          id: 'warningLetters',
          title: 'Ogohlantirish',
          type: 'item',
          url: '/jurist/warningLetter',
          icon: icons.MailIcon,
          breadcrumbs: false,
          allowedRoles: ['admin', 'jurist']
        },
        {
          id: 'courtProccesses',
          title: 'Sud jarayonlari',
          type: 'item',
          url: '/jurist/courtProccesses',
          icon: icons.GavelIcon,
          breadcrumbs: false,
          allowedRoles: ['admin', 'jurist']
        },
        {
          id: 'importPetition',
          title: 'Sudga arizalar kiritish',
          type: 'item',
          url: '/jurist/importPetition',
          icon: icons.FileDownloadOutlinedIcon,
          breadcrumbs: false,
          allowedRoles: ['admin', 'jurist']
        },
        {
          id: 'courtNote',
          title: 'Nishonga olingan abonentlar',
          type: 'item',
          url: '/jurist/courtNote',
          icon: icons.EditNoteIcon,
          breadcrumbs: false,
          allowedRoles: ['admin', 'jurist']
        },
        {
          id: 'courtInvoices',
          title: 'Sud harajatlari',
          type: 'item',
          breadcrumbs: false,
          allowedRoles: ['admin', 'jurist'],
          url: '/jurist/courtInvoices',
          icon: icons.ReceiptOutlined
        }
      ]
    },
    {
      id: 'stm',
      title: 'Sanitar Tozalash Markazi',
      type: 'collapse',
      icon: icons.ChecklistIcon,
      allowedRoles: ['admin', 'stm'],
      children: [
        {
          id: 'actPacks',
          title: 'Acts',
          type: 'item',
          url: '/stm/actPacks',
          icon: icons.ChecklistIcon,
          breadcrumbs: false,
          allowedRoles: ['admin', 'stm']
        }
      ]
    }
  ]
};

export default billing;
