import { supabase } from '@/lib/supabase';
import { AdminUser, UserListParams, UserListResponse, UpdateUserData } from '../types';
import { PAGINATION } from '@/lib/constants';
import { type Role } from '@/lib/roles';

interface UserQueryResult {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Array<{
    role: {
      id: string;
      name: string;
      description: string | null;
      created_at: string;
    };
  }> | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_active: boolean;
}

const DEFAULT_ROLE: Role = {
  id: '',
  name: 'user',
  description: null,
  created_at: new Date().toISOString()
};

export async function getUsers({
  page = 1,
  limit = PAGINATION.DEFAULT_PAGE_SIZE,
  search,
  role,
  sort = 'created_at',
  order = 'desc'
}: UserListParams = {}): Promise<UserListResponse> {
  try {
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        role:user_roles(role:roles(id, name, description, created_at)),
        created_at,
        last_sign_in_at,
        is_active
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('user_roles.roles.name', role);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Transform the data to match AdminUser type
    const users: AdminUser[] = (data as unknown as UserQueryResult[]).map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role?.[0]?.role || DEFAULT_ROLE,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      is_active: user.is_active
    }));

    return {
      users,
      total: count || 0,
      page,
      limit
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function getUser(userId: string): Promise<AdminUser> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        role:user_roles(role:roles(id, name, description, created_at)),
        created_at,
        last_sign_in_at,
        is_active
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('User not found');

    const user = data as unknown as UserQueryResult;
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role?.[0]?.role || DEFAULT_ROLE,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      is_active: user.is_active
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function updateUser(userId: string, data: UpdateUserData): Promise<AdminUser> {
  try {
    const updates: any = {};
    
    if (data.full_name !== undefined) {
      updates.full_name = data.full_name;
    }
    
    if (data.is_active !== undefined) {
      updates.is_active = data.is_active;
    }

    // Update user profile
    const { error: profileError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (profileError) throw profileError;

    // Update role if provided
    if (data.role) {
      // Get the role ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', data.role.name)
        .single();

      if (roleError) throw roleError;

      // Update user_roles
      const { error: userRoleError } = await supabase
        .from('user_roles')
        .update({ role_id: roleData.id })
        .eq('user_id', userId);

      if (userRoleError) throw userRoleError;
    }

    // Fetch updated user
    return await getUser(userId);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function getUserActivity(userId: string, limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
}
