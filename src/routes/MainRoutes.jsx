import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import Inspectors from 'views/employeers/Inspectors';
import Recalculate from 'views/billing';
import WarningLetters from 'views/jurist/WarningLetters/index';
import CourtProcesses from 'views/jurist/CourtProcesses/index';
import ImportPetition from 'views/jurist/CourtProcesses/ImportPetition.jsx';
import DataTable from 'views/jurist/CourtProcesses/DataTable';

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
          path: 'recalculation',
          element: <Recalculate />
        }
      ]
    },
    {
      path: 'jurist',
      children: [
        {
          path: 'warningLetter',
          element: <WarningLetters />
        },
        {
          path: 'courtProccesses',
          element: <CourtProcesses />,
          children: [
            {
              path: 'default',
              element: <DataTable />
            },
            {
              path: 'import-petition',
              element: <ImportPetition />
            }
          ]
        }
      ]
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    }
  ]
};

export default MainRoutes;
