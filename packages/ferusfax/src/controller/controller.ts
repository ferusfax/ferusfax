import PluginManager, { IPluginManager } from '@ferusfax/plugin-manager';
import { IConfig, IPlugin, Plugin } from '@ferusfax/types';
import { select } from '@inquirer/prompts';
import { Command } from 'commander';
import { IPluginService, PluginService } from '@services/plugin/';
import { Screen } from '@screen/screen';
import { IConfigService, ConfigService } from '@services/config';
import path from 'path';

export interface Choice {
  name: string;
  value: string | IPlugin;
}

class FerusfaxController {
  private pluginManager: IPluginManager<IPlugin>;
  private program: Command;
  private screen: Screen;
  private pluginService: IPluginService;
  private configService: IConfigService<IConfig>;

  constructor() {
    this.screen = new Screen();
    this.program = this.screen.getCommand();
    this.pluginManager = new PluginManager(this.program);
    this.configService = new ConfigService();
    this.pluginService = new PluginService(
      this.pluginManager,
      this.configService,
    );
    this.init();
  }

  /**
   *  Inicial configs of ferusfax
   */
  private init() {
    this.configService.create();
    const config = this.configService.load() as IConfig;
    if (config) {
      if (!config.isInitialized) {
        this._initConfigs(config);
      } else {
        this.screen.setConfig(config);
      }
    } else {
      this._initConfigs(config);
    }
    this.buildOptions({ config: this.configService.load() });
  }

  private _initConfigs(config: IConfig) {
    console.log('Creating configs ...');
    this.pluginManager.init();
    this.configService.setAsInitialized();
    this.screen.setConfig(config);
  }
  private buildOptions(args: { config: IConfig | undefined }) {
    this.buildDefaultOptions(args);
    this.buildPluginsOptions();
  }

  private buildPluginsOptions() {
    this.pluginManager
      .getPluginsAsMap()
      .forEach((plugin) =>
        this.program.option(plugin.metadata.flags, plugin.metadata.description),
      );
  }

  private buildDefaultOptions(args: { config: IConfig | undefined }) {
    args.config?.options.forEach((option) =>
      this.program.option(option.flags, option.description),
    );
  }

  async run() {
    this.program.parse(process.argv);
    const options = this.program.opts();
    if (!process.argv.slice(2).length) {
      this.screen.printLogo();
      this.program.outputHelp();
      return;
    }

    if (options.ls) {
      this.pluginService.listPlugins();
    } else if (options.install) {
      this.pluginService.installPlugins();
    } else if (options.remove) {
      this.pluginService.removePlugin();
    } else if (options.all) {
      this.displayPrompt();
    } else if (options.edit) {
      this.pluginService.editPlugin();
    } else {
      try {
        const plugin = await this.pluginManager.loadPluginByOption(
          Object.keys(options)[0],
        );
        plugin.instance?.activate(
          options[plugin.metadata.option] == true
            ? undefined
            : options[plugin.metadata.option],
        );
      } catch (error) {
        this.screen.print(() => console.log('Plugin não encontrado ...'));
      }
    }
  }

  private displayPrompt(): void {
    const pluginChoices: Choice[] = [];
    this.pluginManager.getPluginsAsMap().forEach((plugin) => {
      pluginChoices.push({
        name: plugin.metadata.name,
        value: plugin.metadata.name,
      });
    });

    const answer = select({
      message: 'Qual plugin deseja executar?',
      choices: pluginChoices,
    }).then((answer) => {
      // Execute the plugin
      const textPlugin = this.pluginManager.loadPlugin<Plugin>(
        answer as string,
      );
      console.log(
        `This is the transformed result for ${answer}: ${textPlugin.activate('ls')}`,
      );
    });
  }

  remove() {
    this.configService.deleteConfigFile();
  }
}

export default FerusfaxController;
