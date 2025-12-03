export const MANAGEMENT_COMMANDS = [
  'list',
  'ls',
  'add',
  'edit',
  'remove',
  'rm',
  'current',
  'use',
  'version',
  '-V',
  '--version',
  'help',
  '-h',
  '--help',
] as const;

export type ManagementCommand = (typeof MANAGEMENT_COMMANDS)[number];
