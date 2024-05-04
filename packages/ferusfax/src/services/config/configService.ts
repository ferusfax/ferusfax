import fs from 'fs';
import { IConfig } from '@ferusfax/types';
import { ConfigRepository } from 'infrastructure/repositories/config';
import { IConfigService } from '@services/config/interface/config.interface';
var pjson = require('../../../package.json');

export class ConfigService implements IConfigService<IConfig> {
  private config: IConfig;
  private configRepository: ConfigRepository;

  constructor(pathRoot: string) {
    this.configRepository = new ConfigRepository(pathRoot);
    this.config = {
      appName: 'ferusfax',
      title: 'Ferusfax CLI',
      description:
        'command line application that makes your work easier by simplifying your tasks',
      version: pjson.version,
      isInitialized: false,
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
        {
          flags: '-e, --edit ',
          description: 'edit a plugin',
        },
      ],
    };
  }

  save(config: IConfig): void {
    this.configRepository.save(config);
  }

  create(): void {
    if (!this.load()) {
      this.configRepository.save(this.config);
    }
  }

  setAsInitialized(): void {
    this.config.isInitialized = true;
    this.configRepository.save(this.config);
  }
  load(): IConfig | undefined {
    try {
      return this.configRepository.load();
    } catch (error) {
      return undefined;
    }
  }
  getConfigFilePath(): fs.PathLike {
    return this.configRepository.getConfigFilePath();
  }
  deleteConfigFile(): void {
    this.configRepository.deleteConfigFile();
  }
}
