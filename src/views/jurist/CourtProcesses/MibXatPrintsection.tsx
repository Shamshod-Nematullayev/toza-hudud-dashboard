import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { AbonentDetails, IAbonent } from 'types/billing';
import { formatName } from 'views/billing/CreateAbonentPetition.jsx/PrintSection';

function formatCourtNumber(input) {
  // String ko‘rinishga o‘tkazamiz
  const str = String(input);

  // 1-raqam, keyingi 4 ta, keyingi 4 ta, qolganlari
  const part1 = str.slice(0, 1);
  const part2 = str.slice(1, 5);
  const part3 = str.slice(5, 9);
  const part4 = str.slice(9);

  // Format qilib qaytaramiz
  return `${part1}-${part2}-${part3}/${part4}`;
}

function MibXatPrintsection({
  courtResultDate,
  courtResultNumber,
  claimAmount,
  abonentDetails,
  printRef
}: {
  courtResultDate: Dayjs;
  courtResultNumber: string;
  claimAmount: number;
  abonentDetails: IAbonent;
  printRef: any;
}) {
  const currentTime = new Date();

  return (
    <div className="page" ref={printRef}>
      <h1>ANVARJON BIZNES INVEST MCHJ</h1>
      <p style={{ width: '70%' }}>
        <i>
          Samarqand viloyati Kattaqo`rg`on tumani Boltabek MFY Jalayer q-q, Pochta INDEKS 141408 INN:303421898 Н/r:20208000900611603001
          МFO:01037 ATB Qishloqqurilishbank Bosh amaliyotlar boshqarmasi Тел:+99894 489 20 32
        </i>
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '33%' }}>
          SANA:{' '}
          <b>
            {String(currentTime.getDate()).padStart(2, '0')}.{String(courtResultDate.month() + 1).padStart(2, '0')}.
            {currentTime.getFullYear()}
          </b>{' '}
          yil <br /> №: ____
        </div>
        <div style={{ width: '33%' }}>
          Majburiy Ijro Byurosi Kattaqo’rg’on tuman bo’limi boshlig’i <br />
          adliya maslahatchisi A.T.Elmuradovga
        </div>
      </div>
      <p style={{ textIndent: '25px', textAlign: 'justify' }}>
        Fuqarolik ishlari bo’yicha Kattaqo’rg’on tumalararo sudining{' '}
        {/* <b>
          {String(courtResultDate.date()).padStart(2, '0')}.{String(courtResultDate.month() + 1).padStart(2, '0')}.{courtResultDate.year()}
        </b>
        -yildagi*/}
        <b>{formatCourtNumber(courtResultNumber)}</b> sonli ijro varaqasiga asosan qarzdor <b>{formatName(abonentDetails?.fullName)}</b> dan
        undiruvchi <b>“Anvarjon Biznes Invest” MChJ</b> foydasiga <b>{Number(claimAmount).toLocaleString()}</b> so’m qarz undirish
        belgilangan.
      </p>
      <p style={{ textIndent: '25px', textAlign: 'justify' }}>
        Fuqarolik ishlari bo’yicha Kattaqo’rg’on tumalararo sudining{' '}
        {/* <b>
          {String(courtResultDate.date()).padStart(2, '0')}.{String(courtResultDate.month() + 1).padStart(2, '0')}.{courtResultDate.year()}
        </b>
        -yildagi*/}{' '}
        <b>{formatCourtNumber(courtResultNumber)}</b> sonli ijro varaqasini O’zbekiston Respublikasi “Sud xujjatlari va boshqa organlar
        qarorlarini ijro etish to’g’risidagi” Qonunning 40-moddasi 1-bandiga asosan ijro qilmasdan ijrosiz qaytarishingizni so’rayman.
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          “Anvarjon biznes invest” MChJ <br /> Kattaqo‘rg‘on tuman filiali rahbari:
        </div>
        <div>A.Sadriddinov</div>
      </div>
    </div>
  );
}

export default MibXatPrintsection;
