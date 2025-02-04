'use client';

import { type ReactNode, useState } from 'react';
import { PageContainer, PageHeader, Card, CardContent, Input, Select, Button, FormError, FormSuccess } from '@/components/ui';
import { ROLES, type Role } from '@/lib/constants';

interface SystemSettings {
  maintenance_mode: boolean;
  allow_signups: boolean;
  default_user_role: Role;
  session_timeout: number;
  max_agents_per_user: number;
}

export default function AdminSettingsPage(): ReactNode {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    allow_signups: true,
    default_user_role: ROLES.USER,
    session_timeout: 24,
    max_agents_per_user: 5
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement settings update API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setSuccess('Settings updated successfully');
    } catch (err) {
      setError('Failed to update settings');
      console.error('Error updating settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="System Settings"
        description="Configure system-wide settings and preferences"
      />

      <div className="mt-6">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <FormError error={error} />}
              {success && <FormSuccess message={success} />}

              <div className="space-y-4">
                {/* System Access */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">System Access</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="maintenance_mode"
                        type="checkbox"
                        checked={settings.maintenance_mode}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          maintenance_mode: e.target.checked
                        }))}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="maintenance_mode" className="ml-2 text-sm text-gray-700">
                        Enable maintenance mode
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="allow_signups"
                        type="checkbox"
                        checked={settings.allow_signups}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          allow_signups: e.target.checked
                        }))}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="allow_signups" className="ml-2 text-sm text-gray-700">
                        Allow new user signups
                      </label>
                    </div>
                  </div>
                </div>

                {/* User Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">User Settings</h3>
                  <div className="mt-4 space-y-4">
                    <Select
                      label="Default User Role"
                      value={settings.default_user_role}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        default_user_role: e.target.value as Role
                      }))}
                      options={Object.entries(ROLES).map(([key, value]) => ({
                        value,
                        label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
                      }))}
                    />

                    <Input
                      type="number"
                      label="Session Timeout (hours)"
                      value={settings.session_timeout}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        session_timeout: parseInt(e.target.value)
                      }))}
                      min={1}
                      max={72}
                    />

                    <Input
                      type="number"
                      label="Max Agents per User"
                      value={settings.max_agents_per_user}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        max_agents_per_user: parseInt(e.target.value)
                      }))}
                      min={1}
                      max={20}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
