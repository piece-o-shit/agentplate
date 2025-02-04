import { useState, useCallback, useEffect } from 'react';
import { 
  type ActivityLog, 
  type ActivityLogParams, 
  type ActivityLogResponse, 
  type TimeframeOption 
} from '../types';
import { getActivityLogs, deleteActivityLogs, ActivityApiError } from '../api/activity';
import { type UUID } from '@/lib/database.types';

interface UseActivityLogsOptions {
  autoFetch?: boolean;
  defaultTimeframe?: TimeframeOption;
  defaultLimit?: number;
  onError?: (error: Error | ActivityApiError) => void;
}

interface UseActivityLogsReturn {
  logs: ActivityLog[];
  totalLogs: number;
  isLoading: boolean;
  error: Error | ActivityApiError | null;
  fetchLogs: (params?: ActivityLogParams) => Promise<void>;
  deleteLogs: (before: Date, userId?: UUID) => Promise<void>;
  refresh: () => Promise<void>;
  currentTimeframe: TimeframeOption;
  setTimeframe: (timeframe: TimeframeOption) => void;
}

const DEFAULT_OPTIONS: UseActivityLogsOptions = {
  autoFetch: true,
  defaultTimeframe: '24h',
  defaultLimit: 50,
};

export function useActivityLogs(options: UseActivityLogsOptions = {}): UseActivityLogsReturn {
  const { autoFetch, defaultTimeframe, defaultLimit, onError } = { ...DEFAULT_OPTIONS, ...options };

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | ActivityApiError | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeOption>(defaultTimeframe!);
  const [currentParams, setCurrentParams] = useState<ActivityLogParams>({
    timeframe: defaultTimeframe,
    limit: defaultLimit,
  });

  const handleError = useCallback((err: unknown) => {
    let error: Error | ActivityApiError;
    if (err instanceof ActivityApiError) {
      error = err;
    } else if (err instanceof Error) {
      error = new ActivityApiError('Activity logs operation failed', undefined, err);
    } else {
      error = new ActivityApiError('Unknown activity logs error', undefined, { originalError: err });
    }
    setError(error);
    onError?.(error);
    return error;
  }, [onError]);

  const fetchLogs = useCallback(async (params: ActivityLogParams = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const mergedParams = { ...currentParams, ...params };
      setCurrentParams(mergedParams);

      const { logs, total } = await getActivityLogs(mergedParams);
      setLogs(logs);
      setTotalLogs(total);
    } catch (err) {
      throw handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentParams, handleError]);

  const deleteLogs = useCallback(async (before: Date, userId?: UUID) => {
    try {
      setError(null);
      await deleteActivityLogs({ before, userId });
      await fetchLogs(currentParams);
    } catch (err) {
      throw handleError(err);
    }
  }, [fetchLogs, currentParams, handleError]);

  const refresh = useCallback(() => fetchLogs(currentParams), [fetchLogs, currentParams]);

  useEffect(() => {
    if (autoFetch) {
      fetchLogs().catch(handleError);
    }
  }, [autoFetch, fetchLogs, handleError]);

  useEffect(() => {
    if (timeframe !== currentParams.timeframe) {
      fetchLogs({ timeframe }).catch(handleError);
    }
  }, [timeframe, currentParams.timeframe, fetchLogs, handleError]);

  return {
    logs,
    totalLogs,
    isLoading,
    error,
    fetchLogs,
    deleteLogs,
    refresh,
    currentTimeframe: timeframe,
    setTimeframe,
  };
}
