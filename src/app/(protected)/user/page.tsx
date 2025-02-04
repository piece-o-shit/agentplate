'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Profile, UserSettings, getProfile, getUserSettings } from '@/lib/profile';
import Link from 'next/link';
import Image from 'next/image';

export default function UserDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profileData, settingsData] = await Promise.all([
        getProfile(user!.id),
        getUserSettings(user!.id)
      ]);
      setProfile(profileData);
      setSettings(settingsData);
    } catch (error) {
      setError('Error loading dashboard data');
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-5">
            <div className="relative flex-shrink-0 h-16 w-16 rounded-full overflow-hidden bg-gray-100">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome back, {profile?.full_name || user?.email?.split('@')[0]}
              </h2>
              <p className="text-sm text-gray-500">
                {profile?.bio || 'No bio added yet'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
        <Link
          href="/user/profile"
          className="block p-6 bg-white shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-500 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Profile Settings</h3>
              <p className="text-sm text-gray-500">Update your personal information</p>
            </div>
          </div>
        </Link>

        <Link
          href="/user/agents"
          className="block p-6 bg-white shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-green-500 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Manage Agents</h3>
              <p className="text-sm text-gray-500">Configure and monitor your agents</p>
            </div>
          </div>
        </Link>

        <Link
          href="/user/activity"
          className="block p-6 bg-white shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-purple-500 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Activity History</h3>
              <p className="text-sm text-gray-500">View your recent activities</p>
            </div>
          </div>
        </Link>
      </div>

      {/* System Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">System</h4>
                  <p className="text-sm text-gray-500">All systems operational</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Agents</h4>
                  <p className="text-sm text-gray-500">0 active agents</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">API</h4>
                  <p className="text-sm text-gray-500">API is responding</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
