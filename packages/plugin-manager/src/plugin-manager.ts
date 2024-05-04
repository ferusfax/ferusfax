import { IPlugin, PluginStatus } from '@ferusfax/types';
import { Command } from 'commander';
import { PluginEvent, pluginEvent } from './lifecycle';

import { IPluginManager } from 'interfaces/plugin-manager.interface';
import { IPLuginService, PluginService } from '@services/plugin';

class PluginManager implements IPluginManager<IPlugin> {
  private pluginList: Map<string, IPlugin>;
  private program: Command;
  private pluginEvent: PluginEvent;
  private pluginService: IPLuginService;

  constructor(program: Command) {
    this.pluginList = new Map();
    this.program = program;
    this.pluginEvent = pluginEvent;
    this.pluginService = new PluginService();
  }

  init(): void {
    this.pluginService.createPluginFolder();
  }

  async registerPlugin(plugin: IPlugin): Promise<IPlugin> {
    try {
      if (!plugin.metadata.name || !plugin.metadata.packageName) {
        throw new Error('The plugin name and package are required');
      }

      this.pluginEvent.emitPluginInstall(PluginStatus.PEDDING);
      plugin = await this.pluginService.registerPlugin(plugin);

      this.program.option(plugin.metadata.flags, plugin.metadata.description);
      this.pluginEvent.emitPluginInstall(PluginStatus.RESOLVED);
    } catch (error: any) {
      this.pluginEvent.emitPluginInstall(PluginStatus.FAILED, error.message);
    }
    return plugin;
  }

  async remove(plugin: IPlugin): Promise<IPlugin> {
    try {
      plugin = await this.pluginService.remove(plugin);
    } catch (error: any) {
      this.pluginEvent.emitPluginInstall(PluginStatus.FAILED, error.message);
    }

    return plugin;
  }

  onPluginInstall(listener = (data: PluginStatus) => {}) {
    this.pluginEvent.onPluginInstall(listener);
  }

  onPluginRemove(listener = (data: PluginStatus) => {}) {
    this.pluginEvent.onPluginRemove(listener);
  }

  loadPlugin<P>(name: string): P {
    const plugin = this.pluginList.get(name);
    if (!plugin) {
      throw new Error(`Cannot find plugin ${name}`);
    }
    return Object.create(plugin?.instance.default.prototype) as P;
  }

  /**
   *
   * @param option E o comando de opcao no terminal ex. --kubectl
   * @returns Uma instancia do tipo IPlugin, contendo a instancia do plugin ja imbutida no atributo instance
   */
  async loadPluginByOption(option: string): Promise<IPlugin> {
    return this.pluginService.getPluginByOption(option);
  }

  listPluginList(): Map<string, IPlugin> {
    return this.pluginService.getAllAsMap();
  }
}

export default PluginManager;
export { IPluginManager };
