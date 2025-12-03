import { homedir } from 'os';
import { join } from 'path';

export const PATHS = {
  HOME: homedir(),
  CCK_DIR: join(homedir(), '.cck'),
  KEYS_FILE: join(homedir(), '.cck/keys.json'),
  CACHE_FILE: join(homedir(), '.cck/cache'),
  CONFIG_FILE: join(homedir(), '.cckrc'),
} as const;
