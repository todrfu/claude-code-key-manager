import readline from 'readline';
import { IKeySelector } from '../../application/ports/IKeySelector';
import { KeyCollection } from '../../core/entities/KeyCollection';
import { KeyName } from '../../core/value-objects/KeyName';
import { colors } from '../../shared/constants/colors';

export class FallbackKeySelector implements IKeySelector {
  async select(collection: KeyCollection, defaultKey?: KeyName): Promise<string> {
    const keys = collection.getAll();

    if (keys.length === 0) {
      throw new Error('No API keys available');
    }

    if (keys.length === 1) {
      return keys[0].name.value;
    }

    console.log(`\n${colors.bright}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}║     Select an API Key                  ║${colors.reset}`);
    console.log(`${colors.bright}╚════════════════════════════════════════╝${colors.reset}\n`);

    keys.forEach((key, index) => {
      const marker = key.name.equals(defaultKey) ? `${colors.green}→${colors.reset} ` : '  ';
      const defaultLabel = key.name.equals(defaultKey)
        ? ` ${colors.dim}[default]${colors.reset}`
        : '';
      console.log(
        `${marker}${colors.cyan}${index + 1}${colors.reset}) ${key.name.value} ${colors.dim}(${key.getMaskedKey()})${colors.reset}${defaultLabel}`
      );
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve, reject) => {
      const defaultIndex = defaultKey
        ? keys.findIndex((k) => k.name.equals(defaultKey)) + 1
        : 1;

      rl.question(
        `\nEnter number (1-${keys.length}, default: ${defaultIndex}): `,
        (answer) => {
          rl.close();

          const choice = answer.trim() === '' ? defaultIndex : parseInt(answer);

          if (isNaN(choice) || choice < 1 || choice > keys.length) {
            reject(new Error('Invalid selection'));
          } else {
            resolve(keys[choice - 1].name.value);
          }
        }
      );
    });
  }
}
