'use client';

import { type ReactNode } from 'react';
import { UserList } from '@/features/admin';
import { PageContainer, PageHeader } from '@/components/ui';

export default function AdminUsersPage(): ReactNode {
  return (
    <PageContainer>
      <PageHeader
        title="User Management"
        description="View and manage user accounts"
      />
      <div className="mt-6">
        <UserList />
      </div>
    </PageContainer>
  );
}
