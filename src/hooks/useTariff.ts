import { useEffect, useMemo, useState } from 'react';
import { ITariff } from 'types/billing';
import { getTariffs } from 'services/getTariffs';

interface UseTariffReturn {
  currentTariff: ITariff | null;
  tariffs: ITariff[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTariff(): UseTariffReturn {
  const [tariffs, setTariffs] = useState<ITariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTariffs = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getTariffs();
      setTariffs(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tariffs';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  const currentTariff = useMemo(() => {
    if (!tariffs.length) return null;

    const now = new Date();
    return tariffs.find((t) => t.month === now.getMonth() + 1 && t.year === now.getFullYear()) || null;
  }, [tariffs]);

  return {
    currentTariff,
    tariffs,
    loading,
    error,
    refetch: fetchTariffs
  };
}
