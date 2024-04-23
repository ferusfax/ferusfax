import { IPluginManager } from '@ferusfax/plugin-manager';
import { IConfig, IPlugin, PluginStatus } from '@ferusfax/types';
import { input, select } from '@inquirer/prompts';
import { Screen } from '@screen/screen';
import { readConfigFile, writeConfigFile } from '@services/configService';

import { Choice } from '../controller';
import { onPluginEvent, print } from '@screen/decorators';
const screen = new Screen();

export class PluginSevice {
  @onPluginEvent()
  private accessor pluginManager: IPluginManager<IPlugin>;

  constructor(pluginManager: IPluginManager<IPlugin>) {
    this.pluginManager = pluginManager;
  }

  async installPlugins() {
    const plugin: IPlugin = await this.buildPluginInstallQuestions();

    let regex = new RegExp('--[a-z]*', 'i');
    let match = regex.exec(plugin.metadata.flags) as RegExpExecArray;
    plugin.metadata.option = match[0].replace('--', '');

    this.addPluginOptions(plugin);

    try {
      this.pluginManager.registerPlugin(plugin);
    } catch (error: any) {
      console.error(error.message);
    }
  }

  private addPluginOptions(plugin: IPlugin) {
    const config = readConfigFile();

    config?.options.push({
      flags: plugin.metadata.flags,
      description: plugin.metadata.descrition,
    });

    writeConfigFile(config as IConfig);
  }

  private async buildPluginInstallQuestions(): Promise<IPlugin> {
    return {
      metadata: {
        name: await input({
          message: 'Plugin name ?',
          validate: async (input) => {
            if (!input) {
              return 'Incorrect asnwer';
            }
            return true;
          },
        }),
        packageName: await input({
          message: 'PackageName name?',
          validate: async (input) => {
            if (!input) {
              return 'Incorrect asnwer';
            }
            return true;
          },
        }),
        descrition: await input({
          message: 'Description? default empty',
          default: '',
        }),
        flags: await input({
          message: 'Plugin flags?: ex.: -l, --list: ',
          validate: async (input) => {
            if (!input) {
              return 'Incorrect asnwer';
            }
            let regex = new RegExp(
              '(-[a-z]{1}), (--[a-z]*) ?([value <>\\[\\]]*)',
              'i',
            );
            if (!regex.test(input)) {
              return 'Incorrect asnwer';
            }

            const config = readConfigFile() as IConfig;
            let flag = '';
            const isExists = config?.options.find((option) => {
              for (flag of option.flags.split(',')) {
                for (const _flag of input.split(',')) {
                  if (
                    flag
                      .replace('<value>', '')
                      .replace('[value]', '')
                      .trim() ===
                    _flag.replace('<value>', '').replace('[value]', '').trim()
                  ) {
                    return true;
                  }
                }
              }
              return false;
            });

            if (isExists) {
              return `The flag (${flag}) already exists`;
            }
            return true;
          },
        }),
        option: '',
      },
    };
  }

  @print
  listPlugins() {
    const plugins = this.pluginManager.listPluginList();
    let data: string[][] = [];
    plugins.forEach((plugin) => {
      data.push([
        plugin.metadata.name,
        plugin.version as string,
        plugin.metadata.flags,
      ]);
    });

    screen.printTable({
      head: ['Installed Plugin', 'Version', 'Option'],
      data,
    });
  }

  async removePlugin() {
    const pluginChoices: Choice[] = [];
    this.pluginManager.listPluginList().forEach((plugin) => {
      pluginChoices.push({
        name: plugin.metadata.name,
        value: plugin as IPlugin,
      });
    });

    if (pluginChoices.length === 0) {
      screen.print(() =>
        console.log('There are no plugins installed at the moment'),
      );
      return;
    }

    select({
      message: 'Select plugin to remove?',
      choices: pluginChoices,
    }).then((plugin) => {
      try {
        this.pluginManager.remove(plugin as IPlugin);
        const config = readConfigFile() as IConfig;
        const index = config.options.findIndex((o) => {
          const _plugin = plugin as IPlugin;
          return o.flags === _plugin.metadata.flags;
        });

        config.options.splice(index, 1);
        writeConfigFile(config);
      } catch (error: any) {
        console.error(error.message);
      }
    });
  }
}
