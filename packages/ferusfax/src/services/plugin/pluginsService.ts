import { IPluginManager } from '@ferusfax/plugin-manager';
import { IConfig, IPlugin, PluginStatus } from '@ferusfax/types';
import { input, select } from '@inquirer/prompts';
import { Screen } from '@screen/screen';
import { IConfigService, ConfigService } from '@services/config';
import { Choice } from '../../controller/controller';
import { onPluginEvent, print } from '@screen/decorators';
import { IPluginService } from '@services/plugin/interface/plugin.interface';
import { Option } from '@ferusfax/types/dist/app.interface';
const screen = new Screen();

export class PluginService implements IPluginService {
  @onPluginEvent()
  private accessor pluginManager: IPluginManager<IPlugin>;
  private configService: IConfigService<IConfig>;

  constructor(
    pluginManager: IPluginManager<IPlugin>,
    configService: IConfigService<IConfig>,
  ) {
    this.pluginManager = pluginManager;
    this.configService = configService;
  }
  editPlugin(): void {
    this.buildPluginCoices();
  }

  async installPlugins() {
    const plugin: IPlugin = await this.buildPluginInstallQuestions();

    plugin.metadata.option = await this.extractOptionOfPlugin(plugin);

    try {
      this.pluginManager.registerPlugin(plugin);
    } catch (error: any) {
      console.error(error.message);
    }
  }

  private extractOptionOfPlugin(plugin: IPlugin): Promise<string> {
    return new Promise((resolve, reject) => {
      let regex = new RegExp('--[a-z]*', 'i');
      let match = regex.exec(plugin.metadata.flags) as RegExpExecArray;
      resolve(match[0].replace('--', ''));
    });
  }

  private edit(plugin: IPlugin) {
    const config = this.configService.load() as IConfig;
    this.pluginManager.edit(plugin);
  }

  private async buildPluginInstallQuestions(): Promise<IPlugin> {
    return {
      metadata: {
        name: await input({
          message: 'Plugin name ?',
          validate: async (input) => {
            try {
              this.isInputEmpty(input);
            } catch (error: any) {
              return error.message;
            }
            return true;
          },
        }),
        packageName: await input({
          message: 'PackageName name?',
          validate: async (input) => {
            try {
              this.isInputEmpty(input);
            } catch (error: any) {
              return error.message;
            }
            return true;
          },
        }),
        description: await input({
          message: 'Description? default empty',
          default: '',
        }),
        flags: await input({
          message: 'Plugin flags?: ex.: -l, --list: ',
          validate: async (input) => {
            try {
              this.isInputEmpty(input);
              this.isInputValid(input);
              this.isOptionExists(input);
            } catch (error: any) {
              return error.message;
            }
            return true;
          },
        }),
        option: '',
      },
    };
  }

  private isInputEmpty(input: string) {
    if (!input) {
      throw new Error('Incorrect asnwer');
    }
  }

  private isInputValid(input: string) {
    let regex = new RegExp('(-[a-z]{1}), (--[a-z]*) ?([value <>\\[\\]]*)', 'i');
    if (!regex.test(input)) {
      return 'Incorrect asnwer';
    }
  }

  private isOptionExists(input: string) {
    this.isOptionDefaultExists(input);
    this.isOptionPluginExists(input);
  }

  private isOptionDefaultExists(input: string) {
    const config = this.configService.load() as IConfig;

    const isExists = config?.options.find((option) => {
      this.isFlagExists(option, input);
      return false;
    });
  }

  private isOptionPluginExists(input: string) {
    const options = this.pluginManager
      .getPluginsAslist()
      .map((p) => p.metadata);

    options.find((option) => {
      this.isFlagExists(option, input);
      return false;
    });
  }

  private isFlagExists(
    option: {
      flags: string;
    },
    input: string,
  ) {
    for (let flag of option.flags.split(',')) {
      for (const _flag of input.split(',')) {
        if (
          flag.replace('<value>', '').replace('[value]', '').trim() ===
          _flag.replace('<value>', '').replace('[value]', '').trim()
        ) {
          throw new Error(`The flag (${flag}) already exists`);
        }
      }
    }
  }

  @print
  listPlugins() {
    const plugins = this.pluginManager.getPluginsAsMap();
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
    this.pluginManager.getPluginsAsMap().forEach((plugin) => {
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
        // const config = this.configService.load() as IConfig;
        // const index = config.options.findIndex((o) => {
        //   const _plugin = plugin as IPlugin;
        //   return o.flags === _plugin.metadata.flags;
        // });

        // config.options.splice(index, 1);
        // this.configService.save(config);
      } catch (error: any) {
        console.error(error.message);
      }
    });
  }

  private buildPluginCoices(): void {
    const pluginChoices: Choice[] = [];
    this.pluginManager.getPluginsAsMap().forEach((plugin: IPlugin) => {
      pluginChoices.push({
        name: plugin.metadata.name,
        value: plugin,
      });
    });

    const answer = select({
      message: 'Select one to edit:',
      choices: pluginChoices,
    }).then(async (answer) => {
      const oldPlugin = JSON.parse(JSON.stringify(answer as IPlugin));

      const plugin = await this.buildPluginEditQuestions(answer as IPlugin);

      plugin.metadata.option = await this.extractOptionOfPlugin(plugin);

      this.edit(plugin);
    });
  }

  private async buildPluginEditQuestions(plugin: IPlugin): Promise<IPlugin> {
    plugin.metadata = {
      name: await input({
        message: 'Plugin name ?',
        default: plugin.metadata.name,
        validate: async (input) => {
          if (!input) {
            return 'Incorrect asnwer';
          }
          return true;
        },
      }),
      packageName: plugin.metadata.packageName,
      description: await input({
        message: 'Description? default empty',
        default: plugin.metadata.description,
      }),
      flags: await input({
        message: 'Plugin flags?: ex.: -l, --list: ',
        default: plugin.metadata.flags,
        validate: async (input) => {
          this.isInputEmpty(input);
          let regex = new RegExp(
            '(-[a-z]{1}), (--[a-z]*) ?([value <>\\[\\]]*)',
            'i',
          );
          if (!regex.test(input)) {
            return 'Incorrect asnwer';
          }

          const config = this.configService.load() as IConfig;
          let flag = '';
          const isExists = config?.options.find((option) => {
            for (flag of option.flags.split(',')) {
              for (const _flag of input.split(',')) {
                if (
                  flag.replace('<value>', '').replace('[value]', '').trim() ===
                  _flag.replace('<value>', '').replace('[value]', '').trim()
                ) {
                  for (const flagOld of plugin.metadata.flags.split(',')) {
                    if (
                      flagOld
                        .replace('<value>', '')
                        .replace('[value]', '')
                        .trim() ===
                      _flag.replace('<value>', '').replace('[value]', '').trim()
                    ) {
                      return false;
                    }
                  }

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
      option: plugin.metadata.option,
    };

    return plugin;
  }
}
