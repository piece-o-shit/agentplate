'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, getCurrentUser } from '@/lib/supabase';
import { UserRole, getUserRoles, assignDefaultRole, hasRole } from '@/lib/roles';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user roles and update state
  const updateUserRoles = async (userId: string) => {
    try {
      setError(null);
      const userRoles = await getUserRoles(userId);
      setRoles(userRoles);
      const adminCheck = await hasRole(userId, 'admin');
      setIsAdmin(adminCheck);
    } catch (err) {
      setRoles([]);
      setIsAdmin(false);
      setError('Unable to fetch user roles. Please try refreshing the page.');
    }
  };

  // Retry fetching roles
  const retryFetchRoles = async () => {
    if (user) {
      setLoading(true);
      await updateUserRoles(user.id);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    const session = supabase.auth.getSession();
    const currentUser = session ? (session as any).user : null;
    setUser(currentUser);
    
    if (currentUser) {
      updateUserRoles(currentUser.id);
    }
    setLoading(false);

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      
      if (newUser) {
        await updateUserRoles(newUser.id);
      } else {
        setRoles([]);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      const { user: authUser } = await signIn(email, password, rememberMe);
      setUser(authUser);
      router.push('/user');
      return { user: authUser, error: null };
    } catch (error) {
      return { user: null, error };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const { user: authUser } = await signUp(email, password);
      if (authUser) {
        await assignDefaultRole(authUser.id);
        setUser(authUser);
        await updateUserRoles(authUser.id);
        router.push('/user');
      }
      return { user: authUser, error: null };
    } catch (error) {
      return { user: null, error };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      router.push('/login');
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    user,
    roles,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin,
    retryFetchRoles,
  };
}
