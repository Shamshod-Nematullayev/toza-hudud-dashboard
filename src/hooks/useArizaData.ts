import { useEffect, useState, useCallback } from 'react';
import { getAbonentDataByAccountnumber } from 'services/getAbonentDataByAccountnumber';
import { getAbonentDxjByResidentId } from 'services/getAbonentDHJ';
import { IAriza } from 'types/models';

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

export function useArizaData(ariza: IAriza | null, manualResidentId?: number | null): UseArizaDataReturn {
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

  const effectiveResidentId =
    ariza?.abonentId && ariza.abonentId > 0
      ? ariza.abonentId
      : manualResidentId && manualResidentId > 0
        ? manualResidentId
        : null;

  const fetchData = useCallback(async () => {
    if (!effectiveResidentId) {
      setRows([]);
      setRowsDuplicate([]);
      setAllPaymentsSumOnDuplicate(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const rows = await getAbonentDxjByResidentId(effectiveResidentId);

      const mappedRows = transformRows(rows);

      setRows(mappedRows);
      if (ariza?.document_type === 'dvaynik' && ariza.ikkilamchi_licshet) {
        const abonentData = await getAbonentDataByAccountnumber(ariza.ikkilamchi_licshet);
        const responseDublicateRows = await getAbonentDxjByResidentId(abonentData.id);
        const mappedRowsDublicate = transformRows(responseDublicateRows);
        const sumOnDublicate = mappedRowsDublicate.reduce((sum, row) => sum + row.allPaymentsSum, 0);
        setAllPaymentsSumOnDuplicate(sumOnDublicate);
        setRowsDuplicate(mappedRowsDublicate);
      } else {
        setRowsDuplicate([]);
        setAllPaymentsSumOnDuplicate(0);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch ariza data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [ariza?._id, ariza?.document_type, ariza?.ikkilamchi_licshet, effectiveResidentId]);

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
