import React from 'react';
import { Company } from '..';

function DateLocationHeader({ company }: { company: Company }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        lineHeight: '50px'
      }}
    >
      <div>Sana: “____” __________________ 20___ yil</div>
      <div>{company.locationName}</div>
    </div>
  );
}

export default DateLocationHeader;
