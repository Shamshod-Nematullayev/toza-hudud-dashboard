import InfoChips from '../InfoChips';
import AbonentProfileCard from '../AbonentProfileCard';
import { useAbonentStore } from '../abonentStore';
import { useAbonentLogic } from '../useAbonentLogic';

function AbonentDetails() {
  const { abonentDetails, incomeStats, balancePredicts } = useAbonentStore();
  const { periodEndYear } = useAbonentLogic();

  return (
    <>
      {abonentDetails && (
        <>
          <InfoChips
            {...{
              balance: abonentDetails?.balance.kSaldo * -1,
              balanceToYearEnd: (balancePredicts?.balancePredictItems.find((i) => i.period === periodEndYear)?.balanceAmount || 0) * -1,
              calculated: abonentDetails?.balance.accrual,
              inhabitantCount: abonentDetails?.house.inhabitantCnt,
              registeredInhabitants: abonentDetails.house.miaInhabitantCnt || 0,
              payments: incomeStats.find((i) => i.period === abonentDetails?.balance.period)?.income || 0,
              period: abonentDetails?.balance.period,
              tariff: Number(abonentDetails?.balance.rate)
            }}
          />
          <AbonentProfileCard data={{ photo: '', ...abonentDetails }} />
        </>
      )}
    </>
  );
}

export default AbonentDetails;
