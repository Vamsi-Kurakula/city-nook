import { useEffect, useCallback } from 'react';
import { useAsyncState } from './useAsyncState';

interface UseDataFetchingOptions<T> {
  fetchFn: () => Promise<T>;
  dependencies?: any[];
  autoFetch?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useDataFetching<T>({
  fetchFn,
  dependencies = [],
  autoFetch = true,
  onSuccess,
  onError,
}: UseDataFetchingOptions<T>) {
  const { data, loading, error, execute, setData, setError } = useAsyncState<T>();

  const fetchData = useCallback(async () => {
    try {
      const result = await execute(fetchFn);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      onError?.(errorMessage);
      throw err;
    }
  }, [execute, fetchFn, onSuccess, onError]);

  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  // Auto-fetch when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    fetchData,
    refresh,
    setData,
    setError,
  };
} 