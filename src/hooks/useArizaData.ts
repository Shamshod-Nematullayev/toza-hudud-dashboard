import { useEffect, useState, useCallback } from 'react';
import { IAriza } from 'types/models';
import api from 'utils/api';

interface IRow {
  id: number;
  davr: string;
  saldo_n: number;
  nachis: number;
  saldo_k: number;
  akt: number;
  yashovchilar_soni: number;
  allPaymentsSum: number;
}

interface UseArizaDataReturn {
  rows: IRow[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useArizaData(ariza: IAriza | null): UseArizaDataReturn {
  const [rows, setRows] = useState<IRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transformRows = (data: any[]): IRow[] =>
    data.map((row, i) => ({
      id: i + 1,
      davr: row.period,
      saldo_n: row.nSaldo,
      nachis: row.accrual,
      saldo_k: row.kSaldo,
      akt: row.actAmount,
      yashovchilar_soni: row.inhabitantCount,
      allPaymentsSum: row.allPaymentsSum
    }));

  const fetchData = useCallback(async () => {
    if (!ariza?.abonentId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/billing/get-abonent-dxj-by-id', { params: { residentId: ariza.abonentId } });

      const data = response.data;

      if (!data.ok) {
        setError(data.message || 'Server error');
        return;
      }

      const mappedRows = transformRows(data.rows);

      setRows(mappedRows);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch ariza data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [ariza?._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    rows,
    loading,
    error,
    refetch: fetchData
  };
}
