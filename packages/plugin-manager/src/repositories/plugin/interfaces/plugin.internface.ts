import { IPlugin } from '@ferusfax/types';

export interface IPluginRepository {
  getPluginFilePath(): string;
  getPluginFolderPath(): string;
  getRootFolderPath(): string;
  createPluginFolder(): void;
  save(plugin: IPlugin): void;
  remove(plugin: IPlugin): IPlugin;
  readPluginPackageJson(plugin: IPlugin): Promise<IPlugin | undefined>;
  loadPluginsData(): IPlugin[];
}
