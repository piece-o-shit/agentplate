import { ReactNode } from 'react';
import { Alert } from './Alert';

export interface FormErrorProps {
  children?: ReactNode;
  error?: string;
  className?: string;
}

export interface FormSuccessProps {
  children?: ReactNode;
  message?: string;
  className?: string;
}

export function FormError({ children, error, className }: FormErrorProps) {
  if (!children && !error) return null;
  return (
    <Alert type="error" className={className}>
      {children || error}
    </Alert>
  );
}

export function FormSuccess({ children, message, className }: FormSuccessProps) {
  if (!children && !message) return null;
  return (
    <Alert type="success" className={className}>
      {children || message}
    </Alert>
  );
}
