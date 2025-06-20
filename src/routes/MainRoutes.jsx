import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import Inspectors from 'views/employeers/Inspectors';
import AbonentPetitions from 'views/billing/AbonentPetitions';
import DeleteDublicate from 'views/billing/DeleteDublicate';
import WarningLetters from 'views/jurist/WarningLetters/index';
import CourtProcesses from 'views/jurist/CourtProcesses/index';
import ImportPetition from 'views/jurist/ImportPetition.jsx/index';
import ImportAbonentPetition from 'views/billing/ImportAbonentPetition';
import CreateAbonentPetition from 'views/billing/CreateAbonentPetition.jsx';
import PrintAbonentsList from 'views/billing/PrintAbonentsList';
import XatlovOdamSoni from 'views/billing/OdamSoniXatlov';
import AbonentPetition from 'views/billing/AbonentPetition';
import CourtNote from 'views/jurist/CourtNotes';
import XatlovDalolatnomalar from 'views/billing/XatlovDalolatnomalar';
import Reports from 'views/billing/Reports';
import PendingNewAbonents from 'views/billing/PendingNewAbonents';
import QarzdorAbonentlar from 'views/jurist/QarzdorAbonentlar';
import NazoratchilarXatlov from 'views/billing/Reports/NazoratchilarXatlov';
import ActPacks from 'views/stm/ActPacks';
import Acts from 'views/stm/Acts';
import ActCheck from 'views/stm/ActCheck';
import MonayTransfer from 'views/billing/MonayTransfer/MonayTransfer';
import ReportPetitions from 'views/billing/Reports/AbonentPetitions/ReportPetitions';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));
// const UtilsMaterialIcons = Loadable(lazy(() => import('views/utilities/MaterialIcons')));
// const UtilsTablerIcons = Loadable(lazy(() => import('views/utilities/TablerIcons')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-typography',
          element: <UtilsTypography />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-color',
          element: <UtilsColor />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-shadow',
          element: <UtilsShadow />
        }
      ]
    },
    {
      path: 'employeers',
      children: [
        {
          path: 'inspectors',
          element: <Inspectors />
        }
      ]
    },
    {
      path: 'billing',
      children: [
        {
          path: 'createAbonentAriza',
          element: <CreateAbonentPetition />
        },
        {
          path: 'recalculation',
          element: <AbonentPetitions />
        },
        {
          path: 'recalculation/:ariza_id',
          element: <AbonentPetition />
        },
        {
          path: 'deleteDublicate',
          element: <DeleteDublicate />
        },
        {
          path: 'specialMoneyTransfer',
          element: <MonayTransfer />
        },
        {
          path: 'importAbonentPetition',
          element: <ImportAbonentPetition />
        },
        {
          path: 'printAbonentsList',
          element: <PrintAbonentsList />
        },
        {
          path: 'xatlovOdamSoni',
          element: <XatlovOdamSoni />
        },
        {
          path: 'xatlovDalolatnomalar',
          element: <XatlovDalolatnomalar />
        },
        {
          path: 'reports',
          element: <Reports />
        },
        {
          path: 'xatlov-inspectors',
          element: <NazoratchilarXatlov />
        },
        {
          path: 'report-petitions',
          element: <ReportPetitions />
        },
        {
          path: 'pendingNewAbonents',
          element: <PendingNewAbonents />
        }
      ]
    },
    {
      path: 'jurist',
      children: [
        {
          path: 'qarzdorAbonentlar',
          element: <QarzdorAbonentlar />
        },
        {
          path: 'warningLetter',
          element: <WarningLetters />
        },
        {
          path: 'courtProccesses',
          element: <CourtProcesses />
        },
        {
          path: 'importPetition',
          element: <ImportPetition />
        },
        {
          path: 'courtNote',
          element: <CourtNote />
        }
      ]
    },
    {
      path: 'stm',
      children: [
        {
          path: 'actPacks',
          element: <ActPacks />
        },
        {
          path: 'acts',
          element: <Acts />
        },
        {
          path: 'acts/:packId',
          element: <Acts />
        },
        {
          path: 'actCheck/:actId',
          element: <ActCheck />
        }
      ]
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: '*',
      element: () => <div>Page not found</div>
    }
  ]
};

export default MainRoutes;
