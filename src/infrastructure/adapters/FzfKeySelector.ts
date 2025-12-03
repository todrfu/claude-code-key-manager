import { spawn } from 'child_process';
import { IKeySelector } from '../../application/ports/IKeySelector';
import { KeyCollection } from '../../core/entities/KeyCollection';
import { KeyName } from '../../core/value-objects/KeyName';
import { ILogger } from '../../application/ports/ILogger';

export class FzfKeySelector implements IKeySelector {
  constructor(
    private readonly fallback: IKeySelector,
    private readonly logger: ILogger
  ) {}

  async select(collection: KeyCollection, defaultKey?: KeyName): Promise<string> {
    const keys = collection.getAll();

    if (keys.length === 0) {
      throw new Error('No API keys available');
    }

    if (keys.length === 1) {
      return keys[0].name.value;
    }

    // Check if fzf is available
    if (!(await this.isFzfAvailable())) {
      this.logger.warn('fzf not available, falling back to builtin selector');
      return this.fallback.select(collection, defaultKey);
    }

    return this.selectWithFzf(keys, defaultKey);
  }

  private async isFzfAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn('which', ['fzf'], { stdio: 'ignore' });
      proc.on('exit', (code) => resolve(code === 0));
      proc.on('error', () => resolve(false));
    });
  }

  private async selectWithFzf(keys: ApiKey[], defaultKey?: KeyName): Promise<string> {
    const fzfInput = keys
      .map((k) => {
        const isDefault = k.name.equals(defaultKey);
        const marker = isDefault ? '* ' : '  ';
        return `${marker}${k.name.value}\t${k.getMaskedKey()}\t${k.note || ''}`;
      })
      .join('\n');

    const fzf = spawn('fzf', [
      '--prompt=Select API Key > ',
      '--header=↑/↓: Navigate | Enter: Select | Esc: Cancel',
      '--height=40%',
      '--border',
      '--reverse',
      '--ansi',
      `--query=${defaultKey?.value || ''}`,
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    fzf.stdin.write(fzfInput);
    fzf.stdin.end();

    return new Promise((resolve, reject) => {
      let output = '';
      fzf.stdout.on('data', (data) => (output += data));
      fzf.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error('Selection cancelled'));
        } else {
          const selectedLine = output.trim();
          const keyName = selectedLine.split('\t')[0].trim().replace(/^\*\s+/, '');
          resolve(keyName);
        }
      });
    });
  }
}

// Import ApiKey type
import { ApiKey } from '../../core/entities/ApiKey';
