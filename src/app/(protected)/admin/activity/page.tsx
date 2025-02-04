'use client';

import { type ReactNode, useState, useCallback } from 'react';
import { Select, Button } from '@/components/ui/forms';
import { Card, CardContent } from '@/components/layout/containers';
import { FormError } from '@/components/ui/feedback/Alert';
import { LoadingSpinner } from '@/components/ui/feedback/LoadingSpinner';
import { PageContainer, PageHeader } from '@/components/layout/containers';
import { formatDate } from '@/lib/utils';
import { 
  ActivityLog, 
  useActivityLogs, 
  formatActivityDetails, 
  getActivityIcon, 
  type TimeframeOption,
  type ActivityLogAction,
  ActivityApiError 
} from '@/features/admin';

export default function AdminActivityPage(): ReactNode {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const {
    logs: activities,
    totalLogs,
    isLoading,
    error,
    refresh,
    currentTimeframe,
    setTimeframe,
    fetchLogs
  } = useActivityLogs({
    defaultLimit: pageSize,
    autoFetch: true,
    defaultTimeframe: '24h',
    onError: (err) => {
      if (err instanceof ActivityApiError) {
        console.error('Activity logs error:', {
          message: err.message,
          code: err.code || 'UNKNOWN',
          details: err.details || {}
        });
      } else if (err instanceof Error) {
        console.error('Activity logs error:', err.message);
      } else {
        console.error('Activity logs error:', String(err));
      }
    }
  });

  const getActionLabel = useCallback((action: ActivityLogAction) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    fetchLogs({ offset: (newPage - 1) * pageSize });
  }, [fetchLogs, pageSize]);

  return (
    <PageContainer>
      <PageHeader
        title="Activity Log"
        description="Monitor system activity and user actions"
        action={
          <div className="flex items-center space-x-4">
            <Select
              value={currentTimeframe}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeframe(e.target.value as TimeframeOption)}
              options={[
                { value: '24h', label: 'Last 24 Hours' },
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
                { value: 'all', label: 'All Time' },
              ]}
              className="w-48"
            />
            <Button
              onClick={refresh}
              variant="secondary"
              size="sm"
              isLoading={isLoading}
            >
              Refresh
            </Button>
          </div>
        }
      />

      <div className="mt-6">
        <Card>
          <CardContent>
            <div className="space-y-6">
              {error && (
                <FormError
                  error={
                    error instanceof ActivityApiError
                      ? error.code
                        ? `${error.message} (${error.code})`
                        : error.message
                      : error instanceof Error
                        ? error.message
                        : String(error)
                  }
                  className="mb-6"
                />
              )}

              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-sm font-medium text-gray-900">No activities found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No system activities have been recorded in the selected timeframe.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {activities.map((activity: ActivityLog, activityIdx: number) => (
                        <li key={activity.id}>
                          <div className="relative pb-8">
                            {activityIdx !== activities.length - 1 ? (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                                  {getActivityIcon(activity.action)}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    <span className="font-medium text-gray-900">
                                      {activity.user_email}
                                    </span>{' '}
                                    {getActionLabel(activity.action as ActivityLogAction)}
                                  </p>
                                  {activity.details && (
                                    <p className="mt-1 text-sm text-gray-500">
                                      {formatActivityDetails(activity.details)}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  {formatDate(activity.created_at, 'FULL')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pagination */}
                  {totalLogs > pageSize && (
                    <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                      <div className="flex flex-1 justify-between sm:hidden">
                        <Button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          variant="secondary"
                          size="sm"
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage * pageSize >= totalLogs}
                          variant="secondary"
                          size="sm"
                        >
                          Next
                        </Button>
                      </div>
                      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(currentPage * pageSize, totalLogs)}</span> of{' '}
                            <span className="font-medium">{totalLogs}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <Button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              variant="secondary"
                              size="sm"
                              className="rounded-l-md"
                            >
                              Previous
                            </Button>
                            <Button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage * pageSize >= totalLogs}
                              variant="secondary"
                              size="sm"
                              className="rounded-r-md"
                            >
                              Next
                            </Button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
