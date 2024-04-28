import { IPlugin } from '@ferusfax/types';

export interface IPLuginService {
  createPluginFolder(): void;
  registerPlugin(plugin: IPlugin): Promise<IPlugin>;
  remove(plugin: IPlugin): Promise<IPlugin>;
  getPluginByOption(option: string): Promise<IPlugin>;
  getAllAsMap(): Map<string, IPlugin>;
}
