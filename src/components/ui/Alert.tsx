import React from "react";

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  className?: string;
}

const alertStyles = {
  success: {
    container: 'bg-green-50',
    text: 'text-green-700',
  },
  error: {
    container: 'bg-red-50',
    text: 'text-red-700',
  },
  warning: {
    container: 'bg-yellow-50',
    text: 'text-yellow-700',
  },
  info: {
    container: 'bg-blue-50',
    text: 'text-blue-700',
  },
};

export function Alert({ type, message, className = '' }: AlertProps) {
  const styles = alertStyles[type];

  return (
    <div className={`rounded-md p-4 ${styles.container} ${className}`}>
      <div className={`text-sm ${styles.text}`}>{message}</div>
    </div>
  );
}

interface FormErrorProps {
  error?: string | null;
  className?: string;
}

export function FormError({ error, className = '' }: FormErrorProps) {
  if (!error) return null;

  return (
    <Alert
      type="error"
      message={error}
      className={`mb-4 ${className}`}
    />
  );
}

interface FormSuccessProps {
  message?: string | null;
  className?: string;
}

export function FormSuccess({ message, className = '' }: FormSuccessProps) {
  if (!message) return null;

  return (
    <Alert
      type="success"
      message={message}
      className={`mb-4 ${className}`}
    />
  );
}

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'error' | 'warning';
  text: string;
  className?: string;
}

const statusStyles = {
  active: {
    dot: 'bg-green-400',
    text: 'text-green-700',
    bg: 'bg-green-50',
  },
  inactive: {
    dot: 'bg-gray-400',
    text: 'text-gray-700',
    bg: 'bg-gray-50',
  },
  error: {
    dot: 'bg-red-400',
    text: 'text-red-700',
    bg: 'bg-red-50',
  },
  warning: {
    dot: 'bg-yellow-400',
    text: 'text-yellow-700',
    bg: 'bg-yellow-50',
  },
};

export function StatusBadge({ status, text, className = '' }: StatusBadgeProps) {
  const styles = statusStyles[status];

  return (
    <span className={`inline-flex items-center ${styles.bg} px-2.5 py-0.5 rounded-full ${className}`}>
      <div className={`h-2 w-2 rounded-full ${styles.dot}`}></div>
      <span className={`ml-2 text-sm font-medium ${styles.text}`}>{text}</span>
    </span>
  );
}
