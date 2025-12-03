import { ILogger, LogLevel } from '../../application/ports/ILogger';
import { colors } from '../../shared/constants/colors';

export class ConsoleLogger implements ILogger {
  constructor(private readonly level: LogLevel = LogLevel.INFO) {}

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`${colors.dim}[DEBUG]${colors.reset} ${message}`, meta || '');
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (this.level <= LogLevel.INFO) {
      console.info(`${colors.blue}[INFO]${colors.reset} ${message}`, meta || '');
    }
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`${colors.yellow}[WARN]${colors.reset} ${message}`, meta || '');
    }
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`${colors.red}[ERROR]${colors.reset} ${message}`);
      if (error) {
        console.error(error.stack);
      }
      if (meta) {
        console.error(meta);
      }
    }
  }
}
