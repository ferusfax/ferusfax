import os from 'os';
import fs from 'fs';
import { IConfig } from '@ferusfax/types';
import { IConfigRepository } from 'repositories/config';
import path from 'path';

export class ConfigRepository implements IConfigRepository<IConfig> {
  private ROOT_FOLDER = '.ferusfax';
  private PATH_CONFIG = '.config.json';

  constructor() {}

  save(config: IConfig) {
    this.createProjectFolder();
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
    return path.join(this.getRootFolderPath(), this.PATH_CONFIG);
  }

  private createProjectFolder() {
    if (!fs.existsSync(this.getRootFolderPath())) {
      fs.mkdirSync(this.getRootFolderPath(), { recursive: true });
    }
  }
  deleteConfigFile() {
    fs.unlinkSync(this.getConfigFilePath());
  }
  private getRootFolderPath(): string {
    return path.join(os.homedir(), this.ROOT_FOLDER);
  }
}
