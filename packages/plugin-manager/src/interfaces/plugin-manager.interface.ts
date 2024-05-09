export interface IPluginManager<T> {
  /**
   * Register and install plugins
   * @param plugin to install
   * @returns all plugin configs
   */
  registerPlugin(plugin: T): Promise<T>;
  loadPlugin<P>(name: string): P; //verificar
  loadPluginByOption(option: string): Promise<T>;
  getPluginsAsMap(): Map<string, T>;
  getPluginsAslist(): T[];
  remove(plugin: T): Promise<T>;
  onPluginInstall(listener: any): void;
  onPluginRemove(listener: any): void;
  init(): void;
}
