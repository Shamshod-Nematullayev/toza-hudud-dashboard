import {
  ClickAwayListener,
  Divider,
  List,
  ListItem,
  Menu,
  MenuItem,
  Paper,
  Popper,
  Stack,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  Box,
  Typography
} from '@mui/material';
import { t } from 'i18next';
import InfoChip from 'ui-component/InfoChip';
import {
  CalendarMonthOutlined as PeriodIcon, // Davr (Period)
  PeopleAltOutlined as InhabitantsIcon, // Yashovchilar soni
  HowToRegOutlined as RegisteredIcon, // IIB bazasi
  ReceiptLongOutlined as TariffIcon, // Tarif
  CalculateOutlined as CalculatedIcon, // Hisoblangan (Nachisleniye)
  AccountBalanceWalletOutlined as IncomeIcon, // Tushum (Payments)
  PieChartOutlineOutlined as BalanceIcon, // Balans
  EventRepeatOutlined as YearEndIcon // Yil oxiri balansi
} from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import Transitions from 'ui-component/extended/Transitions';
import MainCard from 'ui-component/cards/MainCard';
import { useAbonentStore } from './hooks/abonentStore';
import dayjs, { Dayjs } from 'dayjs';

import { useAbonentLogic } from './hooks/useAbonentLogic';
import { useReactToPrint } from 'react-to-print';
import { reactToPrintDefaultOptions } from 'store/constant';
import { AbonentCardView } from 'ui-component/cards/AbonentCardView';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { residentId } = useAbonentLogic();
  const { balancePredicts, getIncomePredicts, setOpenIIBInhabitantsDialog, getCardDetails, abonentDetails, cardDetails } =
    useAbonentStore();
  const calculatorRef = useRef<any>(null);
  const [openCalc, setOpenCalc] = useState(false);

  const [toDate, setToDate] = useState<Dayjs | null>(dayjs().endOf('year'));
  const [toDateBalance, setToDateBalance] = useState(0);

  const currentYear = dayjs().year();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
  const months = [
    { value: 0, label: 'Yanvar' },
    { value: 1, label: 'Fevral' },
    { value: 2, label: 'Mart' },
    { value: 3, label: 'Aprel' },
    { value: 4, label: 'May' },
    { value: 5, label: 'Iyun' },
    { value: 6, label: 'Iyul' },
    { value: 7, label: 'Avgust' },
    { value: 8, label: 'Sentabr' },
    { value: 9, label: 'Oktabr' },
    { value: 10, label: 'Noyabr' },
    { value: 11, label: 'Dekabr' }
  ];

  const selectedYear = toDate ? toDate.year() : dayjs().year();
  const selectedMonth = toDate ? toDate.month() : dayjs().month();

  const handleYearChange = (newYear: number) => {
    const today = dayjs();
    let nextMonth = selectedMonth;
    if (newYear === today.year() && selectedMonth <= today.month()) {
      nextMonth = today.month() + 1;
    }
    setToDate(dayjs().year(newYear).month(nextMonth).startOf('month'));
  };

  const handleMonthChange = (newMonth: number) => {
    setToDate(dayjs().year(selectedYear).month(newMonth).startOf('month'));
  };

  const today = dayjs();
  const validMonths = months.filter((m) => {
    if (selectedYear === today.year()) {
      return m.value > today.month();
    }
    return true;
  });

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

  const printSectionRef = useRef(null);
  const printAbonentCard = useReactToPrint({
    ...reactToPrintDefaultOptions,
    contentRef: printSectionRef
  });

  const handleClickIncomeChip = async () => {
    const today = dayjs();
    const format = 'MM.YYYY';
    await getCardDetails({
      lang: 'UZ',
      periodFrom: today.format(format),
      periodTo: today.format(format),
      residentId: residentId
    });
    printAbonentCard();
  };

  return (
    <>
      <div style={{ display: 'none' }}>
        {cardDetails && <AbonentCardView abonentDetails={abonentDetails} cardDetails={cardDetails} t={t} ref={printSectionRef} />}
      </div>

      {isMobile ? (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#9AA3C7',
              display: 'block',
              mb: 1
            }}
          >
            Davr bo'yicha holat
          </Typography>
          <Grid container spacing={1.5}>
            {/* Wide Balance Card */}
            <Grid size={12}>
              <Card
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: '14px',
                  border: '1px solid #29346B',
                  bgcolor: '#16204A',
                  cursor: 'pointer'
                }}
                onClick={() => setOpenCalc(true)}
                ref={calculatorRef}
              >
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" color={props.balance < 0 ? 'error.main' : 'success.main'} sx={{ fontWeight: 800 }}>
                      {props.balance.toLocaleString('uz-Latn')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      💳 Balans (so'm)
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="h4"
                      color={Number(props.balanceToYearEnd) < 0 ? 'error.main' : 'success.main'}
                      sx={{ fontWeight: 800 }}
                    >
                      {props.balanceToYearEnd !== null ? Number(props.balanceToYearEnd).toLocaleString('uz-Latn') : '—'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      📉 Yil oxiriga balans
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>

            {/* Stats Grid Items */}
            {[
              { icon: '📅', val: props.period, label: t('tableHeaders.period') },
              { icon: '💸', val: props.tariff.toLocaleString(), label: t('tableHeaders.tariff') },
              { icon: '👥', val: props.inhabitantCount, label: t('tableHeaders.inhabitantCount') },
              {
                icon: '👮',
                val: props.registeredInhabitants,
                label: t('tableHeaders.registeredInhabitants'),
                onClick: () => setOpenIIBInhabitantsDialog(true),
                clickable: true
              },
              { icon: '📊', val: props.calculated.toLocaleString('uz-Latn'), label: t('tableHeaders.calculated') },
              {
                icon: '💰',
                val: props.payments.toLocaleString('uz-Latn'),
                label: t('tableHeaders.income'),
                onClick: handleClickIncomeChip,
                clickable: true,
                valColor: 'success.main'
              }
            ].map((item, idx) => (
              <Grid key={idx} size={6}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    height: '100%',
                    borderRadius: '14px',
                    border: '1px solid #29346B',
                    bgcolor: '#16204A',
                    color: '#EDEFFA',
                    cursor: item.clickable ? 'pointer' : 'default',
                    '&:hover': item.clickable
                      ? {
                          bgcolor: '#1B2554'
                        }
                      : {}
                  }}
                  onClick={item.onClick}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: '#1B2554',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                      fontSize: '18px'
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1, color: item.valColor || '#EDEFFA' }}>
                    {item.val}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9AA3C7', display: 'block', mt: 0.5, lineHeight: 1.2 }}>
                    {item.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
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
          <Tooltip title={'Joriy davrni chop etish'}>
            <InfoChip
              icon={IncomeIcon}
              label={t('tableHeaders.income')}
              value={props.payments.toLocaleString('uz-Latn')}
              onClick={handleClickIncomeChip}
              containerSX={{
                cursor: 'pointer'
              }}
            />
          </Tooltip>

          {/* Yakuniy holat */}
          <InfoChip
            icon={BalanceIcon}
            label={t('tableHeaders.balance')}
            value={props.balance.toLocaleString('uz-Latn')}
            valueColor={props.balance < 0 ? 'error.main' : 'success.main'}
            onClick={() => setOpenCalc(true)}
            containerSX={{
              cursor: 'pointer'
            }}
            containerRef={calculatorRef}
          />
        </Stack>
      )}

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
                    <Stack direction="row" spacing={1} sx={{ mt: 2, width: '100%' }}>
                      <TextField
                        select
                        size="small"
                        label="Yil"
                        value={selectedYear}
                        onChange={(e) => handleYearChange(Number(e.target.value))}
                        sx={{ flex: 1 }}
                        slotProps={{
                          select: {
                            native: true
                          }
                        }}
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </TextField>
                      <TextField
                        select
                        size="small"
                        label="Oy"
                        value={selectedMonth}
                        onChange={(e) => handleMonthChange(Number(e.target.value))}
                        sx={{ flex: 1.2 }}
                        slotProps={{
                          select: {
                            native: true
                          }
                        }}
                      >
                        {validMonths.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </TextField>
                    </Stack>
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
}

export default InfoChips;
