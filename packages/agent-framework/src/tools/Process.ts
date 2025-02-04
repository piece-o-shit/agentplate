import { exec } from 'child_process';
import { promisify } from 'util';
import { Tool } from '../types';
import { z } from 'zod';

const execAsync = promisify(exec);

// Parameter schemas for validation
const ExecuteParams = z.object({
  command: z.string(),
  cwd: z.string().optional(),
  timeout: z.number().positive().optional().default(30000),
  env: z.record(z.string()).optional()
});

export class ProcessTool implements Tool {
  public name = 'process';
  public description = 'Provides system process operations like executing commands';

  public async execute(params: Record<string, unknown>): Promise<unknown> {
    const { command, cwd, timeout, env } = ExecuteParams.parse(params);

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout,
        env: env ? { ...process.env, ...env } : process.env
      });

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
          ...(error as any).stdout && { stdout: (error as any).stdout.trim() },
          ...(error as any).stderr && { stderr: (error as any).stderr.trim() }
        };
      }
      throw new Error('Unknown process error');
    }
  }

  public validate(params: Record<string, unknown>): boolean {
    try {
      ExecuteParams.parse(params);
      return true;
    } catch {
      return false;
    }
  }

  private sanitizeCommand(command: string): string {
    // Basic command sanitization
    // Remove shell special characters and potentially dangerous operations
    return command.replace(/[;&|`$]/g, '');
  }

  private validateWorkingDirectory(cwd?: string): boolean {
    if (!cwd) return true;
    try {
      // Check if directory exists and is accessible
      return true; // In a real implementation, we'd check the directory
    } catch {
      return false;
    }
  }
}
