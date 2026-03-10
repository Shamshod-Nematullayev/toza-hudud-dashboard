import InfoChips from '../../InfoChips';
import AbonentProfileCard from '../../AbonentProfileCard';
import { useAbonentStore } from '../../abonentStore';

function AbonentDetails() {
  const { abonentDetails } = useAbonentStore();

  return (
    <>
      {abonentDetails && (
        <>
          <InfoChips
            {...{
              balance: abonentDetails?.balance.kSaldo,
              balanceToYearEnd: 999,
              calculated: abonentDetails?.balance.accrual,
              inhabitantCount: abonentDetails?.house.inhabitantCnt,
              registeredInhabitants: 0,
              payments: 999,
              period: abonentDetails?.balance.period,
              tariff: Number(abonentDetails?.balance.rate)
            }}
          />
          <AbonentProfileCard data={{ image: '', ...abonentDetails }} />
        </>
      )}
    </>
  );
}

export default AbonentDetails;
