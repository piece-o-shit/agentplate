import { Tool } from '../types';
import { z } from 'zod';

// Parameter schemas for validation
const RequestParams = z.object({
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
  timeout: z.number().positive().optional().default(30000)
});

export class NetworkTool implements Tool {
  public name = 'network';
  public description = 'Provides network operations like HTTP requests';

  public async execute(params: Record<string, unknown>): Promise<unknown> {
    const { url, method, headers, body, timeout } = RequestParams.parse(params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: headers as HeadersInit,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try to parse as JSON first, fallback to text
      try {
        return await response.json();
      } catch {
        return await response.text();
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
      }
      throw new Error('Unknown network error');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public validate(params: Record<string, unknown>): boolean {
    try {
      RequestParams.parse(params);
      return true;
    } catch {
      return false;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }
}
