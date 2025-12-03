import { spawn } from 'child_process';
import { IProcessLauncher } from '../../application/ports/IProcessLauncher';
import { ILogger } from '../../application/ports/ILogger';
import { LaunchError } from '../../shared/errors/LaunchError';

export class NodeProcessLauncher implements IProcessLauncher {
  constructor(private readonly logger: ILogger) {}

  async launch(command: string, args: string[], env: Record<string, string>): Promise<void> {
    this.logger.debug(`Launching: ${command} ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, {
        stdio: 'inherit',
        env: { ...process.env, ...env },
      });

      proc.on('error', (error) => {
        reject(new LaunchError(`Failed to spawn process: ${error.message}`, error));
      });

      proc.on('exit', (code) => {
        if (code === 0 || code === null) {
          resolve();
        } else {
          reject(new LaunchError(`Process exited with code ${code}`));
        }
      });
    });
  }
}
