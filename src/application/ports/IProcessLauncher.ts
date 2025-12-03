export interface IProcessLauncher {
  launch(command: string, args: string[], env: Record<string, string>): Promise<void>;
}
