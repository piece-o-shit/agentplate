import { promises as fs } from 'fs';
import path from 'path';
import { Tool } from '../types';
import { z } from 'zod';

// Parameter schemas for validation
const ReadFileParams = z.object({
  path: z.string(),
  encoding: z.string().optional().default('utf-8')
});

const WriteFileParams = z.object({
  path: z.string(),
  content: z.string(),
  encoding: z.string().optional().default('utf-8')
});

const DeleteFileParams = z.object({
  path: z.string()
});

export class FileSystemTool implements Tool {
  public name = 'filesystem';
  public description = 'Provides file system operations like reading, writing, and deleting files';

  public async execute(params: Record<string, unknown>): Promise<unknown> {
    const action = params.action as string;

    switch (action) {
      case 'read':
        return this.readFile(params);
      case 'write':
        return this.writeFile(params);
      case 'delete':
        return this.deleteFile(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  public validate(params: Record<string, unknown>): boolean {
    const action = params.action as string;

    try {
      switch (action) {
        case 'read':
          ReadFileParams.parse(params);
          break;
        case 'write':
          WriteFileParams.parse(params);
          break;
        case 'delete':
          DeleteFileParams.parse(params);
          break;
        default:
          return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  private async readFile(params: Record<string, unknown>): Promise<string> {
    const { path: filePath, encoding } = ReadFileParams.parse(params);
    return fs.readFile(filePath, { encoding: encoding as BufferEncoding });
  }

  private async writeFile(params: Record<string, unknown>): Promise<void> {
    const { path: filePath, content, encoding } = WriteFileParams.parse(params);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    return fs.writeFile(filePath, content, { encoding: encoding as BufferEncoding });
  }

  private async deleteFile(params: Record<string, unknown>): Promise<void> {
    const { path: filePath } = DeleteFileParams.parse(params);
    return fs.unlink(filePath);
  }
}
