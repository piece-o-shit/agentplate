import { LoadingSpinner } from './LoadingSpinner';

export interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <LoadingSpinner className="w-12 h-12" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}
