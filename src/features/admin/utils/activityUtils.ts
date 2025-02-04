import { type ActivityLogDetails } from '@/lib/database.types';

export function formatActivityDetails(details: ActivityLogDetails | null): string {
  if (!details) return '';

  try {
    if (typeof details === 'string') {
      return details;
    }

    if (Array.isArray(details)) {
      return details.join(', ');
    }

    if (typeof details === 'object') {
      // Handle update operations with old/new values
      if ('old' in details && 'new' in details && 'changed_fields' in details) {
        const changedFields = details.changed_fields as Record<string, boolean>;
        return Object.entries(changedFields)
          .map(([field]) => {
            const oldValue = (details.old as Record<string, any>)[field];
            const newValue = (details.new as Record<string, any>)[field];
            return `${field}: ${oldValue} → ${newValue}`;
          })
          .join(', ');
      }

      // Handle specific fields based on common patterns
      if ('email' in details) {
        return `Email: ${details.email}`;
      }

      if ('name' in details) {
        return `Name: ${details.name}`;
      }

      if ('status' in details) {
        return `Status: ${details.status}`;
      }

      // Default object formatting
      return Object.entries(details)
        .map(([key, value]) => {
          // Skip internal or sensitive fields
          if (['id', 'password', 'token'].includes(key)) {
            return null;
          }
          
          // Format the value based on its type
          let formattedValue = value;
          if (typeof value === 'boolean') {
            formattedValue = value ? 'Yes' : 'No';
          } else if (value === null) {
            formattedValue = 'None';
          } else if (Array.isArray(value)) {
            formattedValue = value.join(', ');
          }

          return `${key.replace(/_/g, ' ')}: ${formattedValue}`;
        })
        .filter(Boolean)
        .join(', ');
    }

    return JSON.stringify(details);
  } catch (error) {
    console.error('Error formatting activity details:', error);
    return 'Error formatting details';
  }
}
