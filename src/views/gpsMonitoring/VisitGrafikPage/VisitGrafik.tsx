import { useAnimationFrame } from 'framer-motion';
import React, { useEffect } from 'react';
import { useVisitGrafikStore } from './useVisitGrafikStore';

function VisitGrafik() {
  const { fetchVisitGrafik, rows } = useVisitGrafikStore();
  useEffect(() => {
    fetchVisitGrafik();
  }, []);

  return (
    <div>
      <table
        border={1}
        style={{
          borderCollapse: 'collapse',
          margin: 'auto',
          width: '100%',
          height: '100%',
          border: '1px solid #ccc'
        }}
      >
        <thead>
          <tr>
            <th>№</th>
            <th>Avtotransport davlat raqami</th>
            <th>Biriktirilgan mahallalar</th>
            <th>Dushanba</th>
            <th>Seshanba</th>
            <th>Chorshanba</th>
            <th>Payshanba</th>
            <th>Juma</th>
            <th>Shanba</th>
            <th>Yakshanba</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            return (
              <tr key={row.mahallaId}>
                <td>{i + 1}</td>
                <td>{row.name}</td>
                <td>{row.mahallaName}</td>
                <td
                  style={{
                    backgroundColor: row.service?.some((s) => s.day == 1) ? 'green' : ''
                  }}
                >
                  {row.service?.find((s) => s.day == 1)?.time}
                </td>
                <td
                  style={{
                    backgroundColor: row.service?.some((s) => s.day == 2) ? 'green' : ''
                  }}
                >
                  {row.service?.find((s) => s.day == 2)?.time}
                </td>
                <td
                  style={{
                    backgroundColor: row.service?.some((s) => s.day == 3) ? 'green' : ''
                  }}
                >
                  {row.service?.find((s) => s.day == 3)?.time}
                </td>
                <td
                  style={{
                    backgroundColor: row.service?.some((s) => s.day == 4) ? 'green' : ''
                  }}
                >
                  {row.service?.find((s) => s.day == 4)?.time}
                </td>
                <td
                  style={{
                    backgroundColor: row.service?.some((s) => s.day == 5) ? 'green' : ''
                  }}
                >
                  {row.service?.find((s) => s.day == 5)?.time}
                </td>
                <td
                  style={{
                    backgroundColor: row.service?.some((s) => s.day == 6) ? 'green' : ''
                  }}
                >
                  {row.service?.find((s) => s.day == 6)?.time}
                </td>
                <td
                  style={{
                    backgroundColor: row.service?.some((s) => s.day == 7) ? 'green' : ''
                  }}
                >
                  {row.service?.find((s) => s.day == 7)?.time}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default VisitGrafik;
