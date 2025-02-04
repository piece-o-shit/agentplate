import { supabase } from './supabase';

export type Role = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type UserRole = {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
  role?: Role;
};

// Get all available roles
export const getRoles = async (): Promise<Role[]> => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

// Get roles for a specific user
export const getUserRoles = async (userId: string): Promise<UserRole[]> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      *,
      role:roles(*)
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

// Check if a user has a specific role
export const hasRole = async (userId: string, roleName: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      roles (
        name
      )
    `)
    .eq('user_id', userId)
    .eq('roles.name', roleName)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};

// Assign a role to a user
export const assignRole = async (userId: string, roleId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role_id: roleId });

  if (error) throw error;
};

// Remove a role from a user
export const removeRole = async (userId: string, roleId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_id', roleId);

  if (error) throw error;
};

// Get role by name
export const getRoleByName = async (name: string): Promise<Role | null> => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('name', name)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Assign default role to a new user
export const assignDefaultRole = async (userId: string): Promise<void> => {
  const userRole = await getRoleByName('user');
  if (!userRole) throw new Error('Default role not found');
  await assignRole(userId, userRole.id);
};
