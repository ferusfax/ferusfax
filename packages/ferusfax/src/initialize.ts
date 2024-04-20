import { Command } from 'commander';
const figlet = require('figlet');
import { IConfig } from '@ferusfax/types';
import { readConfigFile, writeConfigFile } from './services/configService';
import { writePluginPath } from '@ferusfax/plugin-manager';
import { Screen } from './screen/screen';

class Initialize {
  config: IConfig = {
    appName: 'ferusfax',
    title: 'Ferusfax CLI',
    description:
      'command line application that makes your work easier by simplifying your tasks',
    version: process.env.npm_package_version as string,
    isInitialized: true,
    options: [
      {
        flags: '-i, --install ',
        description: 'install plugins',
      },
      {
        flags: '-l, --ls ',
        description: 'list all plugins',
      },
      {
        flags: '-r, --remove ',
        description: 'remove plugin',
      },
      {
        flags: '-a, --all ',
        description: 'list all plugins and run one',
      },
    ],
  };
  private screen: Screen;

  constructor() {
    this.screen = new Screen();
  }
  printLogo() {
    console.log(
      figlet.textSync(this.config.title, {
        horizontalLayout: 'fitted',
        verticalLayout: 'fitted',
        width: 80,
        whitespaceBreak: true,
      }),
    );
  }
  int(): Command {
    const program = new Command();
    program
      .name(this.config.appName)
      .version(this.config.version)
      .description(this.config.description);
    program.showHelpAfterError();
    const config: IConfig | undefined = readConfigFile();

    if (config) {
      // app initialized
      if (!config.isInitialized) {
        this._initConfigs();
      }
    } else {
      this._initConfigs();
    }

    return program;
  }

  private _initConfigs() {
    this.printLogo();
    this.screen.print(() => {
      console.log('Creating configs ...');
      writeConfigFile(this.config);
      writePluginPath();
    });
  }
}

const initialize = new Initialize();

export default initialize;
