import PluginManager from '@ferusfax/plugin-manager';
import { IPlugin, Plugin } from '@ferusfax/types';
import { select } from '@inquirer/prompts';
import { Command } from 'commander';
import initialize from './initialize';
import {
  installPlugins,
  removePlugin,
  listPlugins,
} from './services/pluginsService';
import { Screen } from './screen';
import { readConfigFile } from './services/configService';

export interface Choice {
  name: string;
  value: string | IPlugin;
}

class FerusfaxController {
  private pluginManager: PluginManager;
  private program: Command;
  private screen: Screen;

  constructor() {
    this.program = initialize.int();
    this._init();
    this.pluginManager = new PluginManager(this.program);
    this.screen = new Screen();
  }

  /**
   *  Inicial configs of ferusfax
   */
  _init() {
    const config = readConfigFile();
    config?.options.forEach((option) =>
      this.program.option(option.flags, option.description),
    );
  }

  run() {
    this.program.parse(process.argv);
    const options = this.program.opts();
    // se nao enviar nada mostra a pagina de ajuda
    if (!process.argv.slice(2).length) {
      this.program.outputHelp();
      return;
    }

    if (options.ls) {
      listPlugins(this.pluginManager.listPluginList());
    } else if (options.install) {
      installPlugins(this.pluginManager);
    } else if (options.remove) {
      removePlugin(this.pluginManager);
    } else if (options.all) {
      this.displayPrompt();
    } else {
      try {
        this.pluginManager
          .loadPluginByOption<Plugin>(Object.keys(options)[0])
          .then((plugin) => {
            plugin.instance.activate(
              options[plugin.metadata.option] == true
                ? undefined
                : options[plugin.metadata.option],
            );
          });
      } catch (error) {
        this.screen.print(() => console.log('Plugin não encontrado ...'));
      }
    }
  }

  displayPrompt(): void {
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
