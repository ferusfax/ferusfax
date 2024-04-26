import { IConfig } from '@ferusfax/types';
import { IConfigRepository } from 'infrastructure/repositories/config';
import path from 'path';
import fs from 'fs';

export class ConfigRepository implements IConfigRepository<IConfig> {
  private PATH_CONFIG = '.config.json';
  private pathRoot: string;

  constructor(pathRoot: string) {
    this.pathRoot = pathRoot;
  }

  save(config: IConfig) {
    fs.writeFileSync(this.getConfigFilePath(), JSON.stringify(config), 'utf8');
  }

  load(): IConfig {
    try {
      const data = fs.readFileSync(this.getConfigFilePath(), 'utf8');

      const _config: IConfig = JSON.parse(data) as IConfig;

      return _config;
    } catch (error) {
      throw new Error('Config not found');
    }
  }
  getConfigFilePath(): fs.PathLike {
    return path.join(this.pathRoot, this.PATH_CONFIG);
  }
  deleteConfigFile() {
    fs.unlinkSync(this.getConfigFilePath());
  }
}
