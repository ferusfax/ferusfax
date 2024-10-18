import os from 'os';
import fs from 'fs';
import path, { sep } from 'path';
import { IPluginRepository } from '@repository/plugin/interfaces/plugin.internface';
import { IPlugin } from '@ferusfax/types';
import { PackageJson } from 'interfaces/package-json.interface';

export class PluginRepository implements IPluginRepository {
  private ROOT_FOLDER = '.ferusfax';
  private PLUGIN_FOLDER = 'plugins';
  getPluginFilePath(): string {
    return path.join(
      this.getRootFolderPath(),
      this.PLUGIN_FOLDER,
      'plugins.json',
    );
  }
  getPluginFolderPath(): string {
    return path.join(os.homedir(), this.ROOT_FOLDER, this.PLUGIN_FOLDER);
  }
  getRootFolderPath(): string {
    return path.join(os.homedir(), this.ROOT_FOLDER);
  }
  createPluginFolder(): void {
    if (!fs.existsSync(this.getPluginFolderPath())) {
      fs.mkdirSync(this.getPluginFolderPath(), { recursive: true });
    }
  }

  save(plugin: IPlugin) {
    const plugins: IPlugin[] = this.loadPluginsData();
    plugins.push(plugin);
    this.saveAll(plugins);
  }

  edit(plugin: IPlugin) {
    const plugins: IPlugin[] = this.loadPluginsData();

    const _plugins = plugins.map((p) =>
      p.identifier?.uuid === plugin.identifier?.uuid ? plugin : p,
    );

    this.saveAll(_plugins);
  }

  private saveAll(plugins: IPlugin[]) {
    fs.writeFileSync(this.getPluginFilePath(), JSON.stringify(plugins), 'utf8');
  }

  remove(plugin: IPlugin): IPlugin {
    let plugins: IPlugin[] = this.loadPluginsData();

    plugin = plugins
      .filter((p) => p.identifier?.uuid == plugin.identifier?.uuid)
      .pop() as IPlugin;

    const index = plugins.findIndex(
      (p) => p.identifier?.uuid == plugin.identifier?.uuid,
    );
    plugins.splice(index, 1);
    this.saveAll(plugins);

    fs.rm(plugin.location?.path as string, { recursive: true }, (err) => {
      if (err) {
        throw err;
      }
    });

    return plugin;
  }

  isFolderHasBeenCreated(): boolean {
    return fs.existsSync(this.getPluginFilePath());
  }

  loadPluginsData(): IPlugin[] {
    try {
      return this.loadPluginsConfigFile().sort((p1, p2) =>
        p1.metadata.name < p2.metadata.name ? -1 : 1,
      );
    } catch (error) {
      return [];
    }
  }

  async readPluginPackageJson(plugin: IPlugin): Promise<IPlugin | undefined> {
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
  private loadPluginsConfigFile(): IPlugin[] {
    if (!fs.existsSync(this.getPluginFilePath())) {
      throw new Error('Plugin file not found');
    }

    const json = fs.readFileSync(this.getPluginFilePath(), 'utf8');

    const plugins: IPlugin[] = JSON.parse(json);
    return plugins;
  }
}
