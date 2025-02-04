import { supabase } from '@/lib/supabase';
import { type ActivityLog, type ActivityLogParams, type ActivityLogResponse, type TimeframeOption } from '../types';
import { type UUID, type ActivityLogDetails } from '@/lib/database.types';

export class ActivityApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ActivityApiError';
  }
}

export async function getActivityLogs({
  timeframe = '24h',
  userId,
  limit = 50,
  offset = 0
}: ActivityLogParams = {}): Promise<ActivityLogResponse> {
  try {
    const { data, error, count } = await supabase.rpc('get_activity_logs', {
      p_timeframe: timeframe,
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset
    });

    if (error) {
      throw new ActivityApiError(
        'Failed to fetch activity logs',
        error.code,
        error.details
      );
    }

    if (!data || !Array.isArray(data)) {
      throw new ActivityApiError('Invalid response from activity logs query');
    }

    return {
      logs: data as ActivityLog[],
      total: count || 0
    };
  } catch (error) {
    if (error instanceof ActivityApiError) {
      throw error;
    }
    throw new ActivityApiError(
      'Unexpected error fetching activity logs',
      undefined,
      error
    );
  }
}

interface LogActivityOptions {
  userId: UUID;
  userEmail: string;
  action: string;
  details?: ActivityLogDetails;
}

export async function logActivity({
  userId,
  userEmail,
  action,
  details
}: LogActivityOptions): Promise<ActivityLog> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        user_email: userEmail,
        action,
        details,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new ActivityApiError(
        'Failed to log activity',
        error.code,
        error.details
      );
    }

    if (!data) {
      throw new ActivityApiError('No data returned after logging activity');
    }

    return data as ActivityLog;
  } catch (error) {
    if (error instanceof ActivityApiError) {
      throw error;
    }
    throw new ActivityApiError(
      'Unexpected error logging activity',
      undefined,
      error
    );
  }
}

interface DeleteActivityLogsOptions {
  before: Date;
  userId?: UUID;
}

export async function deleteActivityLogs({
  before,
  userId
}: DeleteActivityLogsOptions): Promise<number> {
  try {
    const { data: deletedCount, error } = await supabase.rpc(
      'delete_old_activity_logs',
      {
        p_days: Math.floor(
          (Date.now() - before.getTime()) / (1000 * 60 * 60 * 24)
        ),
        p_user_id: userId
      }
    );

    if (error) {
      throw new ActivityApiError(
        'Failed to delete activity logs',
        error.code,
        error.details
      );
    }

    return deletedCount || 0;
  } catch (error) {
    if (error instanceof ActivityApiError) {
      throw error;
    }
    throw new ActivityApiError(
      'Unexpected error deleting activity logs',
      undefined,
      error
    );
  }
}

export function getTimeframeDate(timeframe: TimeframeOption): Date {
  const now = new Date();
  switch (timeframe) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all':
      return new Date(0); // Beginning of time
    default:
      throw new ActivityApiError(`Invalid timeframe: ${timeframe}`);
  }
}
