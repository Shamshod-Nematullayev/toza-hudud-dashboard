import { useAnimationFrame } from 'framer-motion';
import React, { useEffect, useMemo } from 'react';
import { IRow, useVisitGrafikStore } from './useVisitGrafikStore';
import { t } from 'i18next';
import { IconButton, MenuItem, Select } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';

interface UIMahallaRow {
  mahallaId?: number;
  mahallaName?: string;
  service?: {
    day: number;
    time: 0.5 | 1;
  }[];
  isEmpty?: boolean;
}

interface UIAutoRow {
  _id: string;
  name: string;
  rows: UIMahallaRow[];
}

function VisitGrafik() {
  const { fetchVisitGrafik, rows } = useVisitGrafikStore();
  useEffect(() => {
    fetchVisitGrafik();
  }, []);
  const groupedRows = useMemo<UIAutoRow[]>(() => {
    const map = new Map<string, UIAutoRow>();

    rows.forEach((row) => {
      if (!map.has(row._id)) {
        map.set(row._id, {
          _id: row._id,
          name: row.name,
          rows: []
        });
      }

      if (row.mahallaId) {
        map.get(row._id)!.rows.push({
          mahallaId: row.mahallaId,
          mahallaName: row.mahallaName,
          service: row.service
        });
      }
    });

    // 🚨 MUHIM JOY
    map.forEach((auto) => {
      if (auto.rows.length === 0) {
        auto.rows.push({
          isEmpty: true
        });
      }
    });

    return Array.from(map.values());
  }, [rows]);

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
            <th>{t('weekDays.day-1')}</th>
            <th>{t('weekDays.day-2')}</th>
            <th>{t('weekDays.day-3')}</th>
            <th>{t('weekDays.day-4')}</th>
            <th>{t('weekDays.day-5')}</th>
            <th>{t('weekDays.day-6')}</th>
            <th>{t('weekDays.day-7')}</th>
            <th>{t('tableHeaders.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {groupedRows.map((auto, autoIndex) =>
            auto.rows.map((row, rowIndex) => (
              <tr key={auto._id + '-' + rowIndex}>
                {/* № */}
                {rowIndex === 0 && <td rowSpan={auto.rows.length}>{autoIndex + 1}</td>}

                {/* Avtomobil */}
                {rowIndex === 0 && <td rowSpan={auto.rows.length}>{auto.name}</td>}

                {/* Mahalla */}
                <td>{row.isEmpty ? <em style={{ color: '#999' }}>Biriktirilmagan</em> : row.mahallaName}</td>

                {/* Haftalik servis */}
                {Array.from({ length: 7 }).map((_, i) => (
                  <td key={i}>{row.service?.find((s) => s.day === i + 1)?.time ?? ''}</td>
                ))}

                {/* Actions */}
                <td>
                  <IconButton size="small" color="primary">
                    <EditOutlined />
                  </IconButton>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default VisitGrafik;
