export interface IPluginService {
  installPlugins(): Promise<void>;
  listPlugins();
  removePlugin();
}
