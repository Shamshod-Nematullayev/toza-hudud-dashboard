import { useEffect, useState, useCallback } from 'react';
import { getAbonentDataByAccountnumber } from 'services/getAbonentDataByAccountnumber';
import { getAbonentDxjByResidentId } from 'services/getAbonentDHJ';
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
  rowsDublicate: IRow[];
  allPaymentsSumOnDublicate: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useArizaData(ariza: IAriza | null): UseArizaDataReturn {
  const [rows, setRows] = useState<IRow[]>([]);
  const [rowsDublicate, setRowsDuplicate] = useState<IRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allPaymentsSumOnDublicate, setAllPaymentsSumOnDuplicate] = useState<number>(0);

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

      const rows = await getAbonentDxjByResidentId(ariza.abonentId);

      const abonentData = await getAbonentDataByAccountnumber(ariza.ikkilamchi_licshet);
      const responseDublicateRows = await getAbonentDxjByResidentId(abonentData.id);
      const mappedRows = transformRows(rows);
      const mappedRowsDublicate = transformRows(responseDublicateRows);

      setRows(mappedRows);
      setRowsDuplicate(mappedRowsDublicate);
      const sumOnDublicate = mappedRowsDublicate.reduce((sum, row) => sum + row.allPaymentsSum, 0);
      setAllPaymentsSumOnDuplicate(sumOnDublicate);
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
    rowsDublicate,
    allPaymentsSumOnDublicate,
    loading,
    error,
    refetch: fetchData
  };
}
