'use client';

import { type ReactNode } from 'react';
import { PageContainer, PageHeader, Card, CardContent } from '@/components/ui';
import { useUsers } from '@/features/admin';

export default function AdminDashboardPage(): ReactNode {
  const { totalUsers } = useUsers();

  return (
    <PageContainer>
      <PageHeader
        title="Admin Dashboard"
        description="System overview and management"
      />

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Users Card */}
        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-indigo-500 p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agents Card */}
        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Agents
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    0
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status Card */}
        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    System Status
                  </dt>
                  <dd className="text-lg font-semibold text-green-600">
                    Operational
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Card */}
        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Storage Used
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    0 MB
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent>
              <h3 className="text-sm font-medium text-gray-900">User Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                View and manage user accounts, roles, and permissions.
              </p>
              <div className="mt-4">
                <a
                  href="/admin/users"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View Users →
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-sm font-medium text-gray-900">System Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure system-wide settings and preferences.
              </p>
              <div className="mt-4">
                <a
                  href="/admin/settings"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View Settings →
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-sm font-medium text-gray-900">Activity Logs</h3>
              <p className="mt-1 text-sm text-gray-500">
                Monitor system activity and user actions.
              </p>
              <div className="mt-4">
                <a
                  href="/admin/activity"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View Logs →
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
