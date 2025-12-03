import { promises as fs } from 'fs';
import { dirname } from 'path';

export class FileSystem {
  async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf-8');
  }

  async writeFile(path: string, content: string): Promise<void> {
    const dir = dirname(path);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path, content, 'utf-8');
  }

  async delete(path: string): Promise<void> {
    await fs.unlink(path);
  }

  async chmod(path: string, mode: number): Promise<void> {
    await fs.chmod(path, mode);
  }
}
