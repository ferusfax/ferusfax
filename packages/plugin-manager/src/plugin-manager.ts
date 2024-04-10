import { IPlugin } from '@ferusfax/types';
import { Command } from 'commander';
import path = require('path');
import { writePluginPath } from './plugin/install-plugin';

class PluginManager {
  private pluginList: Map<string, IPlugin>;
  private commandPluginList: Map<string, string>;
  private program: Command;

  constructor(program: Command) {
    this.pluginList = new Map();
    this.commandPluginList = new Map();
    this.program = program;
  }

  private pluginExists(name: string): boolean {
    return this.pluginList.has(name);
  }

  private addPlugin(plugin: IPlugin, packageContents: any): void {
    this.pluginList.set(plugin.identifier.id, {
      ...plugin,
      instance: packageContents,
    });
    this.commandPluginList.set(plugin.metadata.option, plugin.identifier.id);
  }

  async registerPlugin(plugin: IPlugin) {
    if (!plugin.metadata.name || !plugin.metadata.packageName) {
      throw new Error('The plugin name and package are required');
    }

    if (this.pluginExists(plugin.metadata.name)) {
      throw new Error(`Cannot add existing plugin ${plugin.metadata.name}`);
    }

    try {
      const packageContents = await import(plugin.metadata.packageName);
      this.addPlugin(plugin, packageContents);
      this.program.option(plugin.metadata.flags, plugin.metadata.descrition);
    } catch (error) {
      console.log(`Cannot load plugin ${plugin.metadata.name}`, error);
      process.exit(1);
    }
  }

  loadPlugin<T>(name: string): T {
    const plugin = this.pluginList.get(name);
    if (!plugin) {
      throw new Error(`Cannot find plugin ${name}`);
    }
    // plugin.instance.default.prototype.options = plugin.options;
    return Object.create(plugin?.instance.default.prototype) as T;
  }

  /**
   *
   * @param option E o comando de opcao no terminal ex. --kubectl
   * @returns Uma instancia do tipo IPlugin, contendo a instancia do plugin ja imbutida no atributo instance
   */
  loadPluginByOption<T>(option: string): IPlugin {
    const pluginName: string = this.commandPluginList.get(option) as string;
    const plugin = this.pluginList.get(pluginName);
    if (!plugin) {
      throw new Error(`Cannot find plugin ${option}`);
    }
    plugin.instance = Object.create(plugin?.instance.default.prototype) as T;
    return plugin;
  }

  listPluginList(): Map<string, IPlugin> {
    return this.pluginList;
  }
}

export default PluginManager;

export { writePluginPath };
