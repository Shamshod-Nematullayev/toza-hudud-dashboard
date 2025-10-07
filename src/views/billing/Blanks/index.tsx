import { Box, Button, Tab, Tabs } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { documentTypes, reactToPrintDefaultOptions } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import OdamSoniBlank from './Documents/OdamSoniBlank';
import VizaBlank from './Documents/VizaBlank';
import DeathBlank from './Documents/DeathBlank';
import DvaynikBlank from './Documents/DvaynikBlank';
import GpsBlank from './Documents/GpsBlank';
import { Print } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';

function Blanks() {
  const [tabsValue, setTabsValue] = useState(documentTypes[0]);

  const { t } = useTranslation();

  const handleTabsChange = (e: React.SyntheticEvent, newValue: string) => {
    setTabsValue(newValue);
  };

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    ...reactToPrintDefaultOptions,
    documentTitle: tabsValue,
    contentRef: componentRef
  });
  return (
    <MainCard>
      <TabContext value={tabsValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex' }}>
          <TabList onChange={handleTabsChange}>
            {documentTypes.map((item) => (
              <Tab key={item} label={t(`documentTypes.${item}`)} value={item} />
            ))}
          </TabList>
          <Button sx={{ ml: 'auto' }} variant="contained" color="primary" onClick={() => handlePrint()}>
            <Print />
            {t('tableActions.print')}
          </Button>
        </Box>
        <div ref={componentRef}>
          <TabPanel value={documentTypes[0]}>
            <OdamSoniBlank />
          </TabPanel>
          <TabPanel value={documentTypes[1]}>
            <VizaBlank />
          </TabPanel>
          <TabPanel value={documentTypes[2]}>
            <DeathBlank />
          </TabPanel>
          <TabPanel value={documentTypes[3]}>
            <DvaynikBlank />
          </TabPanel>
          <TabPanel value={documentTypes[4]}>
            <GpsBlank />
          </TabPanel>
        </div>
      </TabContext>
    </MainCard>
  );
}

export default Blanks;
