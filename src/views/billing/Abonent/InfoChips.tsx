import { Info, Person } from '@mui/icons-material';
import { Stack } from '@mui/material';
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

interface InfoChipsProps {
  period: string;
  inhabitantCount: number;
  registeredInhabitants: number;
  tariff: number;
  calculated: number;
  payments: number;
  balance: number;
  balanceToYearEnd: number;
}

function InfoChips(props: InfoChipsProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
      {/* Vaqt va Tarif guruhi */}
      <InfoChip icon={PeriodIcon} label={t('tableHeaders.period')} value={props.period} />
      <InfoChip icon={TariffIcon} label={t('tableHeaders.tariff')} value={props.tariff} />

      {/* Aholi guruhi */}
      <InfoChip icon={InhabitantsIcon} label={t('tableHeaders.inhabitantCount')} value={props.inhabitantCount} />
      <InfoChip icon={RegisteredIcon} label={t('tableHeaders.registeredInhabitants')} value={props.registeredInhabitants} />

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
        value={props.balanceToYearEnd.toLocaleString('uz-Latn')}
        valueColor={props.balanceToYearEnd < 0 ? 'error.main' : 'success.main'}
      />
    </Stack>
  );
}

export default InfoChips;
