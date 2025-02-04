import { useState, useCallback } from 'react';
import { AdminUser, UserListParams, UserListResponse, UpdateUserData } from '../types';
import { getUsers, getUser, updateUser, deleteUser, getUserActivity } from '../api/users';
import { useAuth } from '@/hooks/useAuth';

interface UseUsersReturn {
  users: AdminUser[];
  totalUsers: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  fetchUsers: (params?: UserListParams) => Promise<void>;
  fetchUser: (userId: string) => Promise<AdminUser>;
  updateUserData: (userId: string, data: UpdateUserData) => Promise<AdminUser>;
  removeUser: (userId: string) => Promise<void>;
  fetchUserActivity: (userId: string, limit?: number) => Promise<any[]>;
}

export function useUsers(): UseUsersReturn {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (params?: UserListParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getUsers(params);
      setUsers(response.users);
      setTotalUsers(response.total);
      setCurrentPage(response.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async (userId: string) => {
    try {
      setError(null);
      return await getUser(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      throw err;
    }
  }, []);

  const updateUserData = useCallback(async (userId: string, data: UpdateUserData) => {
    try {
      setError(null);
      const updatedUser = await updateUser(userId, data);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? updatedUser : user
        )
      );
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  }, []);

  const removeUser = useCallback(async (userId: string) => {
    if (userId === user?.id) {
      throw new Error('Cannot delete your own account');
    }

    try {
      setError(null);
      await deleteUser(userId);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setTotalUsers(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  }, [user?.id]);

  const fetchUserActivity = useCallback(async (userId: string, limit?: number) => {
    try {
      setError(null);
      return await getUserActivity(userId, limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user activity');
      throw err;
    }
  }, []);

  return {
    users,
    totalUsers,
    currentPage,
    isLoading,
    error,
    fetchUsers,
    fetchUser,
    updateUserData,
    removeUser,
    fetchUserActivity,
  };
}
