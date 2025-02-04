'use client';

import { useState } from 'react';
import { useAgents } from '@/hooks/useAgents';
import { Card } from '@/components/layout/containers/Card';
import { LoadingSpinner } from '@/components/ui/feedback/LoadingSpinner';
import { Alert } from '@/components/ui/feedback/Alert';
import { Button } from '@/components/ui/forms/Button';
import { CreateAgentDialog } from '@/components/features/agents/CreateAgentDialog';

export default function AgentsPage() {
  const { agents, loading, error, createAgent } = useAgents();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" title="Error loading agents">
        {error.message}
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor your automated agents.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="inline-flex items-center"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <Card>
          <div className="px-4 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No agents</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first agent.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowCreateDialog(true)}>
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Agent
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id}>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {agent.name}
                </h3>
                {agent.description && (
                  <p className="mt-1 text-sm text-gray-500">{agent.description}</p>
                )}
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {agent.type}
                  </span>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <Button variant="secondary" size="sm">
                    View Details
                  </Button>
                  <Button variant="primary" size="sm">
                    Run
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreateDialog && (
        <CreateAgentDialog onClose={() => setShowCreateDialog(false)} />
      )}
    </div>
  );
}
