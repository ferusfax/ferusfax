import { Command } from 'commander';
const figlet = require('figlet');
import { App } from '@ferusfax/types';
import { IConfig, readConfigFile, writeConfigFile } from './service';
import { writePluginPath } from '@ferusfax/plugin-manager';

class Initialize {
  app: App = {
    title: 'Ferusfax CLI',
    name: 'ferusfax',
    description:
      'command line application that makes your work easier by simplifying your tasks',
    version: '1.0.0',
  };

  int(): Command {
    const program = new Command();
    program
      .name(this.app.name)
      .version(this.app.version)
      .description(this.app.description);
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
    console.log(figlet.textSync(this.app.title));
    console.log();
    console.log();
    console.log();
    console.log('Creating configs ...');

    const config: IConfig = {
      appName: 'ferusfax',
      isInitialized: true,
    };
    writeConfigFile(config);
    writePluginPath();

    console.log();
    console.log();
    console.log();
  }
}

const initialize = new Initialize();

export default initialize;
