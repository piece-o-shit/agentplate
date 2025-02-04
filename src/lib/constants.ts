// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  USER: {
    DASHBOARD: '/user',
    PROFILE: '/user/profile',
    AGENTS: '/user/agents',
    ACTIVITY: '/user/activity',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    ROLES: '/admin/roles',
    SETTINGS: '/admin/settings',
  },
} as const;

// API endpoints
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  USER: {
    PROFILE: '/api/user/profile',
    SETTINGS: '/api/user/settings',
    ACTIVITY: '/api/user/activity',
  },
  ADMIN: {
    USERS: '/api/admin/users',
    ROLES: '/api/admin/roles',
  },
} as const;

// Role types
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Activity types
export const ACTIVITY_TYPES = {
  PROFILE_UPDATED: 'profile_updated',
  SETTINGS_UPDATED: 'settings_updated',
  PASSWORD_CHANGED: 'password_changed',
  LOGIN: 'login',
  LOGOUT: 'logout',
  AGENT_CREATED: 'agent_created',
  AGENT_UPDATED: 'agent_updated',
  AGENT_DELETED: 'agent_deleted',
} as const;

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type Theme = typeof THEMES[keyof typeof THEMES];

// Language options
export const LANGUAGES = {
  EN: { value: 'en', label: 'English' },
  ES: { value: 'es', label: 'Spanish' },
  FR: { value: 'fr', label: 'French' },
} as const;

export type Language = typeof LANGUAGES[keyof typeof LANGUAGES]['value'];

// Agent status types
export const AGENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ERROR: 'error',
  RUNNING: 'running',
  STOPPED: 'stopped',
} as const;

export type AgentStatus = typeof AGENT_STATUS[keyof typeof AGENT_STATUS];

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  NAME_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 500,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
  PASSWORD_TOO_LONG: `Password must be less than ${VALIDATION.PASSWORD_MAX_LENGTH} characters`,
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  INVALID_CREDENTIALS: 'Invalid email or password',
  SERVER_ERROR: 'An unexpected error occurred. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  SETTINGS_UPDATED: 'Settings updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  AGENT_CREATED: 'Agent created successfully',
  AGENT_UPDATED: 'Agent updated successfully',
  AGENT_DELETED: 'Agent deleted successfully',
} as const;

// Date formats
export const DATE_FORMATS = {
  FULL: 'MMMM d, yyyy h:mm a',
  SHORT: 'MMM d, yyyy',
  TIME: 'h:mm a',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;
