import { IPlugin, Plugin, PluginStatus } from '@ferusfax/types';
import { Command } from 'commander';
import path = require('path');
import {
  getPluginFilePath,
  getPluginFolderPath,
  writePluginPath,
} from './plugin/install-plugin';
import { exec, spawn } from 'child_process';
import { PluginEvent, pluginEvent } from './plugin/lifecycle';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

interface PackageJson {
  version: string;
}

export interface IPluginManager<T> {
  /**
   * Register and install plugins
   * @param plugin to install
   * @returns all plugin configs
   */
  registerPlugin(plugin: T): Promise<T>;
  loadPlugin<P>(name: string): P; //verificar
  loadPluginByOption(option: string): Promise<T>;
  listPluginList(): Map<string, T>;
  remove(plugin: T): Promise<T>;
  onPluginInstall(listener: any): void;
  onPluginRemove(listener: any): void;
}

class PluginManager implements IPluginManager<IPlugin> {
  private pluginList: Map<string, IPlugin>;
  private program: Command;
  private pluginEvent: PluginEvent;

  constructor(program: Command) {
    this.pluginList = new Map();
    this.program = program;
    this.pluginEvent = pluginEvent;
  }

  private pluginExists(plugin: IPlugin): boolean {
    try {
      const plugins: IPlugin[] = this.loadPluginsFile();
      return plugins.filter(
        (p) => p.metadata.packageName === plugin.metadata.packageName,
      ).length > 0
        ? true
        : false;
    } catch (error) {
      return false;
    }
  }

  private addPlugin(plugin: IPlugin): void {
    plugin.identifier = {
      id: plugin.metadata.packageName,
      uuid: uuidv4(),
    };

    const _plugin: IPlugin = {
      identifier: plugin.identifier,
      version: plugin.version,
      location: plugin.location,
      metadata: plugin.metadata,
    };

    if (!fs.existsSync(getPluginFilePath())) {
      fs.writeFileSync(getPluginFilePath(), JSON.stringify([_plugin]), 'utf8');
    } else {
      const plugins: IPlugin[] = this.loadPluginsFile();

      plugins.push(_plugin);
      fs.writeFileSync(getPluginFilePath(), JSON.stringify(plugins), 'utf8');
    }
  }

  async remove(plugin: IPlugin): Promise<IPlugin> {
    if (!this.pluginExists(plugin)) {
      this.pluginEvent.emitPluginRemove(PluginStatus.FAILED);
      throw new Error(`Plugin ${plugin.metadata.name} does not hists`);
    }

    this.pluginEvent.emitPluginRemove(PluginStatus.PEDDING);
    let plugins: IPlugin[] = this.loadPluginsFile();

    plugin = plugins
      .filter((p) => p.identifier?.uuid == plugin.identifier?.uuid)
      .pop() as IPlugin;

    const index = plugins.findIndex(
      (p) => p.identifier?.uuid == plugin.identifier?.uuid,
    );
    plugins.splice(index, 1);
    fs.writeFileSync(getPluginFilePath(), JSON.stringify(plugins), 'utf8');

    fs.rm(plugin.location?.path as string, { recursive: true }, (err) => {
      if (err) {
        throw err;
      }
      this.pluginEvent.emitPluginRemove(PluginStatus.REMOVED);
    });

    return plugin;
  }

  private loadPluginsFile() {
    if (!fs.existsSync(getPluginFilePath())) {
      throw new Error('Plugin file not found');
    }

    const json = fs.readFileSync(getPluginFilePath(), 'utf8');

    const plugins: IPlugin[] = JSON.parse(json);
    return plugins;
  }

  async registerPlugin(plugin: IPlugin): Promise<IPlugin> {
    if (!plugin.metadata.name || !plugin.metadata.packageName) {
      this.pluginEvent.emitPluginInstall(PluginStatus.FAILED);
      throw new Error('The plugin name and package are required');
    }

    if (this.pluginExists(plugin)) {
      this.pluginEvent.emitPluginInstall(PluginStatus.FAILED);
      throw new Error(`Cannot add existing plugin ${plugin.metadata.name}`);
    }

    this.pluginEvent.emitPluginInstall(PluginStatus.PEDDING);

    plugin = await this.downloadPlugin(plugin);
    this.pluginEvent.emitPluginInstall(PluginStatus.CREATED);
    plugin = (await this.readPluginPackageJson(plugin)) as IPlugin;

    this.addPlugin(plugin);

    this.program.option(plugin.metadata.flags, plugin.metadata.descrition);
    this.pluginEvent.emitPluginInstall(PluginStatus.RESOLVED);
    return plugin;
  }

  private async downloadPlugin(plugin: IPlugin) {
    const child = spawn(
      `npm v ${plugin.metadata.packageName} dist.tarball | xargs curl | tar -xz && mv package/ ${plugin.metadata.packageName}`,
      {
        shell: true,
        cwd: getPluginFolderPath(),
      },
    );

    for await (const chunk of child.stdout) {
      this.pluginEvent.emitPluginInstall(PluginStatus.PEDDING);
    }

    plugin.location = {
      path: path.join(
        getPluginFolderPath(),
        path.sep,
        plugin.metadata.packageName,
      ),
    };
    return plugin;
  }

  private async readPluginPackageJson(plugin: IPlugin) {
    try {
      const pluginPackageJson = path.join(
        plugin.location?.path as string,
        path.sep,
        'package.json',
      );
      const data = fs.readFileSync(pluginPackageJson, 'utf8');

      const packageJSON: PackageJson = JSON.parse(data);

      plugin.version = packageJSON.version;
      return plugin;
    } catch (error) {
      console.error(error);
    }
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
    const plugins: IPlugin[] = this.loadPluginsFile();

    const plugin = plugins.find((p) => p.metadata.option === option);

    if (!plugin) {
      throw new Error(`Cannot find plugin ${option}`);
    }

    const packageContents = await import(plugin.location?.path as string);
    plugin.instance = Object.create(
      packageContents.default.prototype,
    ) as Plugin;
    return plugin;
  }

  listPluginList(): Map<string, IPlugin> {
    const plugins: IPlugin[] = this.loadPluginsFile();
    plugins
      .sort((p1, p2) => (p1.metadata.name < p2.metadata.name ? -1 : 1))
      .forEach((p) => this.pluginList.set(p.identifier?.id as string, p));
    return this.pluginList;
  }
}

export default PluginManager;

export { writePluginPath };
