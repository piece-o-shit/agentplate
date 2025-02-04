'use client';

import { useState, useEffect } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { UserListParams, AdminUser } from '../../types';
import { ROLES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { getRoleByName, type Role } from '@/lib/roles';
import { Card, CardHeader, CardContent } from '@/components/layout/containers';
import { Input, Select, Button } from '@/components/ui/forms';
import { FormError } from '@/components/ui/feedback/Alert';
import { LoadingSpinner } from '@/components/ui/feedback/LoadingSpinner';
import { EmptyState } from '@/components/ui';

export function UserList() {
  const {
    users,
    totalUsers,
    currentPage,
    isLoading,
    error,
    fetchUsers,
    removeUser,
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = async () => {
    const params: UserListParams = {
      search: searchTerm || undefined,
    };

    if (selectedRole) {
      const role = await getRoleByName(selectedRole);
      if (role) {
        params.role = role;
      }
    }

    fetchUsers(params);
  };

  const handleDelete = async (userId: string) => {
    try {
      setIsDeleting(userId);
      await removeUser(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Users"
        description={`${totalUsers} total users`}
        action={
          <Button
            onClick={() => fetchUsers()}
            variant="secondary"
            size="sm"
          >
            Refresh
          </Button>
        }
      />

      <CardContent>
        {error && <FormError error={error} className="mb-4" />}

        <div className="mb-6 flex gap-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select
            options={[
              { value: '', label: 'All Roles' },
              ...Object.entries(ROLES).map(([key, value]) => ({
                value,
                label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
              })),
            ]}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar_url ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar_url}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-medium">
                                {user.full_name?.[0] || user.email[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at, 'SHORT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_sign_in_at
                        ? formatDate(user.last_sign_in_at, 'SHORT')
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* TODO: View user details */}}
                      >
                        View
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="ml-2"
                        onClick={() => handleDelete(user.id)}
                        isLoading={isDeleting === user.id}
                        disabled={isDeleting !== null}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
