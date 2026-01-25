import { useAnimationFrame } from 'framer-motion';
import React, { useEffect, useMemo } from 'react';
import { IRow, useVisitGrafikStore } from './useVisitGrafikStore';
import { t } from 'i18next';
import { IconButton, MenuItem, Select, Tooltip } from '@mui/material';
import { Add, CancelOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from '@mui/icons-material';
import MahallaSelection from 'ui-component/MahallaSelection';
import api from 'utils/api';

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
  currentDriver?: string;
}

interface EditKey {
  autoId: string;
  mahallaId?: number;
}

interface UIMahallaRow {
  mahallaId?: number;
  mahallaName?: string;
  service?: { day: number; time: 0.5 | 1 }[];
  isEmpty?: boolean;
  isNew?: boolean; // 👈 YANGI
}

function VisitGrafik() {
  const { fetchVisitGrafik, rows, addMahallaToAuto, updateMahallaOfAuto, deleteAutoMobile, deleteMahallaOfAuto } = useVisitGrafikStore();
  useEffect(() => {
    fetchVisitGrafik();
  }, []);

  const [editKey, setEditKey] = React.useState<EditKey | null>(null);
  const [editingRow, setEditingRow] = React.useState<{ mahallaId: string | number; service: { day: number; time: 0.5 | 1 }[] } | null>(
    null
  );
  const [selectedMahallaId, setSelectedMahallaId] = React.useState<number | string>('');
  const [mahallalar, setMahallalar] = React.useState<{ id: number; name: string }[]>([]);
  const [groupedRows, setGroupedRows] = React.useState<UIAutoRow[]>([]);

  const handleClickEditButton = (autoId: string, mahallaId?: number) => {
    setEditKey({ autoId, mahallaId });
    const auto = groupedRows.find((a) => a._id === autoId && a.rows.find((r) => r.mahallaId === mahallaId)) || null;
    setEditingRow({
      mahallaId: mahallaId || '',
      service: auto ? auto.rows.find((r) => r.mahallaId === mahallaId)?.service || [] : []
    });
    setSelectedMahallaId(mahallaId || '');
  };

  const handleClickCancelButton = () => {
    setEditKey(null);
    setEditingRow(null);
    setSelectedMahallaId('');
    fetchVisitGrafik();
  };

  const handleClickSaveButton = () => {
    if (!editingRow?.mahallaId) return;

    if (editKey?.mahallaId) {
      updateMahallaOfAuto(
        editKey!.autoId,
        editKey!.mahallaId!,
        editingRow.mahallaId as number,
        mahallalar.find((m) => m.id == editingRow.mahallaId)?.name || '',
        editingRow.service
      ).then(() => {
        // tozalash
        handleClickCancelButton();
      });
    } else {
      addMahallaToAuto(
        editKey?.autoId!,
        editingRow.mahallaId as number,
        mahallalar.find((m) => m.id == editingRow.mahallaId)?.name || '',
        editingRow.service
      ).then(() => {
        // tozalash
        handleClickCancelButton();
      });
    }
  };

  const handleAddMahalla = (autoId: string) => {
    setGroupedRows((prev) =>
      prev.map((auto) =>
        auto._id === autoId
          ? {
              ...auto,
              rows: [
                ...auto.rows,
                {
                  isNew: true,
                  service: []
                }
              ]
            }
          : auto
      )
    );

    setEditKey({
      autoId,
      mahallaId: undefined
    });

    setEditingRow({
      mahallaId: '',
      service: []
    });
  };

  useEffect(() => {
    if (editKey && selectedMahallaId) {
      setEditingRow((prev) => ({
        mahallaId: selectedMahallaId,
        service: prev ? prev.service : []
      }));
    }
  }, [selectedMahallaId]);

  useEffect(() => {
    const map = new Map<string, UIAutoRow>();

    rows.forEach((row) => {
      if (!map.has(row._id)) {
        map.set(row._id, {
          _id: row._id,
          name: row.name,
          currentDriver: row.currentDriver,
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

    map.forEach((auto) => {
      if (auto.rows.length === 0) {
        auto.rows.push({ isEmpty: true });
      }
    });

    setGroupedRows(Array.from(map.values()));
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
                {rowIndex === 0 && (
                  <td rowSpan={auto.rows.length} align="center" width={200}>
                    {auto.name}
                    <br />
                    {auto.currentDriver}
                  </td>
                )}

                {/* Mahalla */}
                <td>
                  {auto._id === editKey?.autoId && row.mahallaId === editKey?.mahallaId ? (
                    <MahallaSelection
                      selectedMahallaId={selectedMahallaId}
                      setSelectedMahallaId={setSelectedMahallaId}
                      setMahallalar={setMahallalar}
                    />
                  ) : row.isEmpty ? (
                    <em style={{ color: '#999' }}>Biriktirilmagan</em>
                  ) : (
                    row.mahallaName
                  )}
                </td>

                {/* Haftalik servis */}
                {Array.from({ length: 7 }).map((_, i) =>
                  editKey?.autoId === auto._id && row.mahallaId === editKey?.mahallaId ? (
                    <td key={i}>
                      <Select
                        value={editingRow?.service.find((s) => s.day === i + 1)?.time ?? ''}
                        onChange={(e) => {
                          const timeValue = e.target.value as 0.5 | 1;

                          setEditingRow((prev) => {
                            if (!prev) return prev;

                            const existingService = prev.service.filter((s) => s.day !== i + 1);

                            return {
                              ...prev,
                              service: timeValue ? [...existingService, { day: i + 1, time: timeValue }] : existingService
                            };
                          });
                        }}
                        displayEmpty
                        fullWidth
                      >
                        <MenuItem value="">-</MenuItem>
                        <MenuItem value={0.5}>Yarim kun 1</MenuItem>
                        <MenuItem value={1}>To'liq kun 2</MenuItem>
                      </Select>
                    </td>
                  ) : (
                    <td key={i}>{row.service?.find((s) => s.day === i + 1)?.time ?? ''}</td>
                  )
                )}

                {/* Actions */}
                <td>
                  <IconButton size="small" color="primary" onClick={() => handleClickEditButton(auto._id, row.mahallaId)}>
                    <EditOutlined />
                  </IconButton>
                  {editKey?.autoId === auto._id && row.mahallaId === editKey?.mahallaId && (
                    <>
                      <IconButton onClick={handleClickSaveButton}>
                        {' '}
                        <SaveOutlined />
                      </IconButton>
                      <IconButton onClick={() => handleClickCancelButton()}>
                        {' '}
                        <CancelOutlined />
                      </IconButton>
                    </>
                  )}
                  {!(row.isEmpty && !editKey) && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        deleteMahallaOfAuto(auto._id, row.mahallaId!);
                      }}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  )}
                  {!row.isEmpty && !editKey && (
                    <Tooltip title="Yangi mahalla qo'shish">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => {
                          handleAddMahalla(auto._id);
                        }}
                      >
                        <Add />
                      </IconButton>
                    </Tooltip>
                  )}
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
