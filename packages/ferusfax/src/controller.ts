import PluginManager, { IPluginManager } from '@ferusfax/plugin-manager';
import { IConfig, IPlugin, Plugin } from '@ferusfax/types';
import { select } from '@inquirer/prompts';
import { Command } from 'commander';
import initialize from './initialize';
import { PluginSevice } from './services/pluginsService';
import { Screen } from './screen/screen';
import { readConfigFile } from './services/configService';

export interface Choice {
  name: string;
  value: string | IPlugin;
}

class FerusfaxController {
  private pluginManager: IPluginManager<IPlugin>;
  private program: Command;
  private screen: Screen;
  private pluginService: PluginSevice;

  constructor() {
    this.program = initialize.int();
    this.init();
    this.pluginManager = new PluginManager(this.program);
    this.screen = new Screen();
    this.pluginService = new PluginSevice(this.pluginManager);
  }

  /**
   *  Inicial configs of ferusfax
   */
  private init() {
    this.buildOptions({ config: readConfigFile() });
  }

  private buildOptions(args: { config: IConfig | undefined }) {
    args.config?.options.forEach((option) =>
      this.program.option(option.flags, option.description),
    );
  }

  async run() {
    this.program.parse(process.argv);
    const options = this.program.opts();
    // se nao enviar nada mostra a pagina de ajuda
    if (!process.argv.slice(2).length) {
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
    } else {
      try {
        const plugin = await this.pluginManager.loadPluginByOption(
          Object.keys(options)[0],
        );
        plugin.instance.activate(
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
    this.pluginManager.listPluginList().forEach((plugin) => {
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

  getProgram() {
    return this.program;
  }
}

export default FerusfaxController;
