import { Command } from 'commander';
const figlet = require('figlet');
import { IConfig } from '@ferusfax/types';
import { readConfigFile, writeConfigFile } from './services/configService';
import { writePluginPath } from '@ferusfax/plugin-manager';
import { Screen } from './screen/screen';

class Initialize {
  private config: IConfig;
  private screen: Screen;
  private program: Command;

  constructor() {
    this.screen = new Screen();
    this.program = new Command();
    var pjson = require('../package.json');
    this.config = {
      appName: 'ferusfax',
      title: 'Ferusfax CLI',
      description:
        'command line application that makes your work easier by simplifying your tasks',
      version: pjson.version,
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

      this.config = readConfigFile() as IConfig;
      this.program
        .name(this.config.appName)
        .version(this.config.version)
        .description(this.config.description);
    });
  }
}

const initialize = new Initialize();

export default initialize;
