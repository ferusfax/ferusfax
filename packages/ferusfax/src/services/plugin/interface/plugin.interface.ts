import { OptionValues } from 'commander';

export interface IPluginService {
  installPlugins(): Promise<void>;
  listPlugins(): void;
  removePlugin(): void;
  editPlugin(): void;
  runPlugin(options: OptionValues): void;
}
