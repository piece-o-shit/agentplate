'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Profile, UserSettings, getProfile, getUserSettings, updateProfile, updateUserSettings, uploadAvatar, logActivity } from '@/lib/profile';
import Image from 'next/image';
import { PageContainer, PageHeader, Card, CardHeader, CardContent } from '@/components/layout/containers';
import { Input, TextArea, Select, Button } from '@/components/ui/forms';
import { FormError, FormSuccess } from '@/components/ui/feedback/Alert';
import { LoadingPage } from '@/components/ui/feedback/LoadingSpinner';
import { LANGUAGES, SUCCESS_MESSAGES } from '@/lib/constants';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileData, settingsData] = await Promise.all([
        getProfile(user!.id),
        getUserSettings(user!.id)
      ]);
      setProfile(profileData);
      setSettings(settingsData);
    } catch (error) {
      setError('Error loading profile data');
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Upload new avatar if selected
      if (avatarFile) {
        await uploadAvatar(user.id, avatarFile);
      }

      // Update profile
      const updatedProfile = await updateProfile(user.id, {
        full_name: profile?.full_name || null,
        bio: profile?.bio || null
      });
      setProfile(updatedProfile);

      // Update settings
      const updatedSettings = await updateUserSettings(user.id, {
        theme: settings?.theme || 'light',
        notifications: settings?.notifications || { email: true, push: true },
        language: settings?.language || 'en'
      });
      setSettings(updatedSettings);

      // Log activity
      await logActivity(user.id, 'profile_updated');

      setSuccess('Profile updated successfully');
    } catch (error) {
      setError('Error updating profile');
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Profile Settings" 
        description="Manage your personal information and preferences"
      />

      <Card>
        <CardContent>
          <FormError error={error} />
          <FormSuccess message={success} />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
              <div className="mt-2 flex items-center space-x-4">
                <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                  {(previewUrl || profile?.avatar_url) ? (
                    <Image
                      src={previewUrl || profile?.avatar_url || ''}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </div>

            {/* Profile Information */}
            <Input
              label="Full Name"
              id="full_name"
              value={profile?.full_name || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
            />

            <TextArea
              label="Bio"
              id="bio"
              rows={3}
              value={profile?.bio || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
            />

            {/* Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
              <div className="mt-4 space-y-4">
                <Select
                  label="Theme"
                  id="theme"
                  value={settings?.theme || 'light'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSettings(prev => prev ? { ...prev, theme: e.target.value } : null)}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System' },
                  ]}
                />

                <Select
                  label="Language"
                  id="language"
                  value={settings?.language || 'en'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSettings(prev => prev ? { ...prev, language: e.target.value } : null)}
                  options={Object.values(LANGUAGES)}
                />

                <div>
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-700">Notifications</legend>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          id="email_notifications"
                          type="checkbox"
                          checked={settings?.notifications?.email || false}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => prev ? {
                            ...prev,
                            notifications: { ...prev.notifications, email: e.target.checked }
                          } : null)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="email_notifications" className="ml-2 text-sm text-gray-700">
                          Email notifications
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="push_notifications"
                          type="checkbox"
                          checked={settings?.notifications?.push || false}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => prev ? {
                            ...prev,
                            notifications: { ...prev.notifications, push: e.target.checked }
                          } : null)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="push_notifications" className="ml-2 text-sm text-gray-700">
                          Push notifications
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                isLoading={saving}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
