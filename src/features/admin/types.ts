import { Role } from '@/lib/roles';
import { type Database, type UUID, type Timestamp, type ActivityLogDetails } from '@/lib/database.types';

export interface AdminUser {
  id: UUID;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  created_at: Timestamp;
  last_sign_in_at: Timestamp | null;
  is_active: boolean;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  sort?: 'email' | 'created_at' | 'last_sign_in_at';
  order?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateUserData {
  full_name?: string;
  role?: Role;
  is_active?: boolean;
}

export interface SystemStats {
  total_users: number;
  active_users: number;
  total_agents: number;
  active_agents: number;
}

export type ActivityLogAction =
  | 'user_login'
  | 'user_logout'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'role_assigned'
  | 'role_removed'
  | 'settings_updated'
  | 'agent_created'
  | 'agent_updated'
  | 'agent_deleted';

export type TimeframeOption = '24h' | '7d' | '30d' | 'all';

export interface ActivityLog {
  id: UUID;
  user_id: UUID;
  user_email: string;
  action: ActivityLogAction;
  details: ActivityLogDetails;
  created_at: Timestamp;
}

export interface RoleWithPermissions extends Role {
  permissions: string[];
  user_count: number;
}

export interface SystemSettings {
  maintenance_mode: boolean;
  allow_signups: boolean;
  default_user_role: Role;
  session_timeout: number;
  max_agents_per_user: number;
}

export interface ActivityLogParams {
  timeframe?: TimeframeOption;
  userId?: UUID;
  limit?: number;
  offset?: number;
}

export interface ActivityLogResponse {
  logs: ActivityLog[];
  total: number;
}

export interface AnalyticsData {
  timeframe: 'day' | 'week' | 'month' | 'year';
  data: {
    timestamp: Timestamp;
    value: number;
  }[];
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface ErrorLog {
  id: UUID;
  error: string;
  stack_trace: string;
  user_id?: UUID;
  user_email?: string;
  created_at: Timestamp;
  metadata: Record<string, unknown>;
}
