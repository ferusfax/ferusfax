import { PluginEvent, pluginEvent } from 'lifecycle';
import { IPlugin, Plugin, PluginStatus } from '@ferusfax/types';
import { IPluginRepository } from '@repository/plugin/interfaces/plugin.internface';
import { PluginRepository } from '@repository/plugin/plugin.repository';
import { IPLuginService } from '@services/plugin/interfaces/plugin.interface';
import { spawn } from 'child_process';
import path = require('path');
import { v4 as uuidv4 } from 'uuid';

export class PluginService implements IPLuginService {
  private pluginRepository: IPluginRepository;
  private pluginEvent: PluginEvent;

  constructor() {
    this.pluginRepository = new PluginRepository();
    this.pluginEvent = pluginEvent;
  }

  async registerPlugin(plugin: IPlugin): Promise<IPlugin> {
    if (this.isPluginExists(plugin)) {
      throw new Error(`Cannot add existing plugin ${plugin.metadata.name}`);
    }
    plugin = await this.downloadPlugin(plugin);
    this.pluginEvent.emitPluginInstall(PluginStatus.CREATED);
    plugin = (await this.pluginRepository.readPluginPackageJson(
      plugin,
    )) as IPlugin;
    this.addPlugin(plugin);
    return plugin;
  }

  async remove(plugin: IPlugin): Promise<IPlugin> {
    if (!this.isPluginExists(plugin)) {
      throw new Error(`Plugin ${plugin.metadata.name} not found`);
    }

    this.pluginEvent.emitPluginRemove(PluginStatus.PEDDING);
    this.pluginRepository.remove(plugin);
    this.pluginEvent.emitPluginRemove(PluginStatus.REMOVED);

    return plugin;
  }

  createPluginFolder(): void {
    this.pluginRepository.createPluginFolder();
  }

  async getPluginByOption(option: string): Promise<IPlugin> {
    const plugins: IPlugin[] = this.pluginRepository.loadPluginsData();

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

  getAllAsMap(): Map<string, IPlugin> {
    const plugins: IPlugin[] = this.pluginRepository.loadPluginsData();
    const map = new Map();
    plugins.forEach((p) => map.set(p.identifier?.id as string, p));
    return map;
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
    this.pluginRepository.save(plugin);
  }

  private async downloadPlugin(plugin: IPlugin) {
    const child = spawn(
      `npm v ${plugin.metadata.packageName} dist.tarball | xargs curl | tar -xz && mv package/ ${plugin.metadata.packageName}`,
      {
        shell: true,
        cwd: this.pluginRepository.getPluginFolderPath(),
      },
    );

    for await (const chunk of child.stdout) {
      this.pluginEvent.emitPluginInstall(PluginStatus.PEDDING);
    }

    plugin.location = {
      path: path.join(
        this.pluginRepository.getPluginFolderPath(),
        path.sep,
        plugin.metadata.packageName,
      ),
    };
    return plugin;
  }

  private isPluginExists(plugin: IPlugin): boolean {
    try {
      const plugins: IPlugin[] = this.pluginRepository.loadPluginsData();
      return plugins.filter(
        (p) => p.metadata.packageName === plugin.metadata.packageName,
      ).length > 0
        ? true
        : false;
    } catch (error) {
      return false;
    }
  }

  getAllAsList(): IPlugin[] {
    return this.pluginRepository.loadPluginsData();
  }
}
