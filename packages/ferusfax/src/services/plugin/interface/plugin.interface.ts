export interface IPluginService {
  installPlugins(): Promise<void>;
  listPlugins(): void;
  removePlugin(): void;
  editPlugin(): void;
}
