import PluginManager from '@ferusfax/plugin-manager';
import { IConfig, IPlugin, PluginStatus } from '@ferusfax/types';
import { input, select } from '@inquirer/prompts';
import { Screen } from '../screen';
import { readConfigFile, writeConfigFile } from './configService';

import { Choice } from '../controller';
const screen = new Screen();

export async function installPlugins(pluginManager: PluginManager) {
  pluginManager.onPluginInstall((status: PluginStatus) => {
    if (status == PluginStatus.PEDDING) {
      screen.start(150);
      screen.getProgressBar().update(50);
    } else if (status == PluginStatus.CREATED) {
      screen.getProgressBar().update(100);
    } else if (status == PluginStatus.RESOLVED) {
      screen.getProgressBar().update(150);
      screen.stop();
    }
  });

  const plugin: IPlugin = {
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
                  flag.replace('<value>', '').replace('[value]', '').trim() ===
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

  let regex = new RegExp('--[a-z]*', 'i');
  let match = regex.exec(plugin.metadata.flags) as RegExpExecArray;
  plugin.metadata.option = match[0].replace('--', '');

  const config = readConfigFile();

  config?.options.push({
    flags: plugin.metadata.flags,
    description: plugin.metadata.descrition,
  });

  writeConfigFile(config as IConfig);

  try {
    pluginManager.registerPlugin(plugin);
  } catch (error: any) {
    console.error(error.message);
  }
}

export function listPlugins(plugins: Map<string, IPlugin>) {
  var Table = require('cli-table');

  // instantiate
  var table = new Table({
    style: { head: ['magenta'] },
    head: ['Installed Plugin', 'Version', 'Option'],
    chars: {
      top: '-',
      bottom: '-',
    },
  });

  plugins.forEach((plugin) => {
    table.push([plugin.metadata.name, plugin.version, plugin.metadata.flags]);
  });

  console.log(table.toString());
}

export async function removePlugin(pluginManager: PluginManager) {
  pluginManager.onPluginInstall((status: PluginStatus) => {
    if (status == PluginStatus.PEDDING) {
      screen.start(100);
      screen.getProgressBar().update(50);
    } else if (status == PluginStatus.REMOVED) {
      screen.getProgressBar().update(100);
      screen.stop();
    }
  });

  const pluginChoices: Choice[] = [];
  pluginManager.listPluginList().forEach((plugin) => {
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
      pluginManager.remove(plugin as IPlugin);
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
