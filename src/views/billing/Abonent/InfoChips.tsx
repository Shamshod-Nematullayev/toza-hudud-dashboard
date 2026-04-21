import { ClickAwayListener, Divider, List, ListItem, Menu, MenuItem, Paper, Popper, Stack } from '@mui/material';
import { t } from 'i18next';
import InfoChip from 'ui-component/InfoChip';
import {
  CalendarMonthOutlined as PeriodIcon, // Davr (Period)
  PeopleAltOutlined as InhabitantsIcon, // Yashovchilar soni
  HowToRegOutlined as RegisteredIcon, // IIB bazasi
  ReceiptLongOutlined as TariffIcon, // Tarif
  CalculateOutlined as CalculatedIcon, // Hisoblangan (Nachisleniye)
  AccountBalanceWalletOutlined as IncomeIcon, // Tushum (Payments)
  PieChartOutline as BalanceIcon, // Balans
  EventRepeatOutlined as YearEndIcon // Yil oxiri balansi
} from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import Transitions from 'ui-component/extended/Transitions';
import MainCard from 'ui-component/cards/MainCard';
import { useAbonentStore } from './abonentStore';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { useAbonentLogic } from './useAbonentLogic';

interface InfoChipsProps {
  period: string;
  inhabitantCount: number;
  registeredInhabitants: number;
  tariff: number;
  calculated: number;
  payments: number;
  balance: number;
  balanceToYearEnd: number | null;
}

function InfoChips(props: InfoChipsProps) {
  const { residentId } = useAbonentLogic();
  const { balancePredicts, getIncomePredicts, setOpenIIBInhabitantsDialog } = useAbonentStore();
  const calculatorRef = useRef<any>(null);
  const [openCalc, setOpenCalc] = useState(false);

  const [toDate, setToDate] = useState<Dayjs | null>(dayjs().endOf('year'));
  const [toDateBalance, setToDateBalance] = useState(0);
  const handleCloseCalculator = () => {
    setOpenCalc(false);
  };

  useEffect(() => {
    let found = false;
    balancePredicts?.balancePredictItems.forEach((i) => {
      const [month, year] = i.period.split('.').map(Number);
      // @ts-ignore
      if (month === toDate?.month() + 1 && year === toDate?.year()) {
        setToDateBalance(i.balanceAmount * -1);
        found = true;
      }
    });
    if (!found && toDate) {
      getIncomePredicts(residentId, `${toDate?.month() + 1}.${toDate?.year()}`);
    }
  }, [toDate, openCalc]);

  return (
    <Stack direction="row" spacing={1}>
      {/* Vaqt va Tarif guruhi */}
      <InfoChip icon={PeriodIcon} label={t('tableHeaders.period')} value={props.period} />
      <InfoChip icon={TariffIcon} label={t('tableHeaders.tariff')} value={props.tariff} />

      {/* Aholi guruhi */}
      <InfoChip icon={InhabitantsIcon} label={t('tableHeaders.inhabitantCount')} value={props.inhabitantCount} />
      <InfoChip
        icon={RegisteredIcon}
        label={t('tableHeaders.registeredInhabitants')}
        value={props.registeredInhabitants}
        containerSX={{
          cursor: 'pointer'
        }}
        onClick={() => setOpenIIBInhabitantsDialog(true)}
      />

      {/* Moliyaviy hisob-kitoblar */}
      <InfoChip icon={CalculatedIcon} label={t('tableHeaders.calculated')} value={props.calculated.toLocaleString('uz-Latn')} />
      <InfoChip icon={IncomeIcon} label={t('tableHeaders.income')} value={props.payments.toLocaleString('uz-Latn')} />

      {/* Yakuniy holat */}
      <InfoChip
        icon={BalanceIcon}
        label={t('tableHeaders.balance')}
        value={props.balance.toLocaleString('uz-Latn')}
        valueColor={props.balance < 0 ? 'error.main' : 'success.main'}
      />
      <InfoChip
        icon={YearEndIcon}
        label={t('tableHeaders.balanceToYearEnd')}
        value={(props.balanceToYearEnd || 0).toLocaleString('uz-Latn')}
        valueColor={props.balanceToYearEnd || 0 < 0 ? 'error.main' : 'success.main'}
        onClick={() => setOpenCalc(true)}
        containerSX={{
          cursor: 'pointer'
        }}
        containerRef={calculatorRef}
        loading={props.balanceToYearEnd === null}
      />
      <Popper
        placement={'bottom-start'}
        open={openCalc}
        anchorEl={calculatorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [-20, 10]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions position={'top-left'} in={openCalc} {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleCloseCalculator}>
                <MainCard sx={{ boxShadow: 3, ':hover': { boxShadow: 5 }, fontSize: 20, lineHeight: '30px' }}>
                  <List>
                    <ListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t('tableHeaders.currentTariff')}:</span>
                      <span>
                        {props.tariff.toLocaleString()}
                        {' ' + t('uzs')}
                      </span>
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                      <span>{t('tableHeaders.inhabitantCount')}:</span>
                      <span>{props.inhabitantCount}</span>
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                      <span style={{ maxWidth: '200px' }}>{t('tableHeaders.currentDebitor')}:</span>
                      <span style={{ color: props.balance < 0 ? 'red' : 'green' }}>
                        {props.balance.toLocaleString()}
                        {' ' + t('uzs')}
                      </span>
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                      <span style={{ maxWidth: '200px' }}>{t('tableHeaders.choosedPeriodDebitor')}:</span>
                      <span style={{ color: toDateBalance < 0 ? 'red' : 'green' }}>
                        {toDateBalance.toLocaleString()}
                        {' ' + t('uzs')}
                      </span>
                    </ListItem>
                    <Divider />
                    <DatePicker
                      views={['month']}
                      label={t('tableHeaders.period')}
                      value={toDate}
                      onChange={(newValue) => setToDate(newValue)}
                      sx={{ mt: 2, width: '100%' }}
                      format={'MM.YYYY'}
                      minDate={dayjs().add(1, 'month').startOf('month')}
                    />
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Stack>
  );
}

export default InfoChips;
