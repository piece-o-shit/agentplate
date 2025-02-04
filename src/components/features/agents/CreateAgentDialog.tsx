'use client';

import { useState } from 'react';
import { Card } from '@/components/layout/containers/Card';
import { Button } from '@/components/ui/Form';
import { Input, TextArea, Select } from '@/components/ui/Form';
import { FormError, FormSuccess } from '@/components/ui/feedback';
import { useAgents } from '@/hooks/useAgents';

interface CreateAgentDialogProps {
  onClose: () => void;
}

const AGENT_TYPES = [
  { value: 'basic', label: 'Basic Agent' },
  { value: 'workflow', label: 'Workflow Agent' },
  { value: 'drama', label: 'Drama Agent' }
];

export function CreateAgentDialog({ onClose }: CreateAgentDialogProps) {
  const { createAgent } = useAgents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'basic',
    config: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(undefined);

    try {
      await createAgent(formData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Create New Agent</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure your agent&apos;s basic settings.
              </p>
            </div>

            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="My Agent"
            />

            <TextArea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this agent do?"
              rows={3}
            />

            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={AGENT_TYPES}
            />

            {error && <FormError error={error} />}
            {success && (
              <FormSuccess message="Agent created successfully! Redirecting..." />
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Create Agent
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
