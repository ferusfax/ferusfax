import PluginManager from '@ferusfax/plugin-manager';
import { Plugin } from '@ferusfax/types';
import { select } from '@inquirer/prompts';
import { Command, OptionValues } from 'commander';
import { listPlugins } from './list-plugins';
import initialize from './initialize';

export interface ITextSelectedChoice {
  text: string;
  pluginName: string;
}

interface Choice {
  name: string;
  value: string;
}

class FerusfaxController {
  private pluginManager: PluginManager;
  private program: Command;

  constructor() {
    this.program = initialize.int();
    this._init();
    this.pluginManager = new PluginManager(this.program);
  }

  /**
   *  Inicial configs of ferusfax
   */
  _init() {
    this.program
      .option('-l, --ls ', 'list all plugins')
      .option('-a, --all ', 'list all plugins and run one');
  }

  run() {
    const options = this.program.opts();
    // se nao enviar nada mostra a pagina de ajuda
    if (!process.argv.slice(2).length) {
      this.program.outputHelp();
      return;
    }

    if (options.ls) {
      listPlugins(this.pluginManager.listPluginList());
    } else if (options.all) {
      this.displayPrompt();
    } else {
      try {
        const plugin = this.pluginManager.loadPluginByOption<Plugin>(
          Object.keys(options)[0],
        );

        plugin.instance.activate(
          options[plugin.metadata.option] == true
            ? undefined
            : options[plugin.metadata.option],
        );
      } catch (error) {
        console.log('Plugin não encontrado ...');
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
      const textPlugin = this.pluginManager.loadPlugin<Plugin>(answer);
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
