import path from 'path';
import fs from 'fs';

export interface IConfig {
  appName: string;
  isInitialized: boolean;
}

const PATH_CONFIG = '.config.json';
const root = path.dirname(path.dirname(__dirname));

export function getConfigFilePath(): fs.PathLike {
  return path.join(root, PATH_CONFIG);
}

/**
 *  Config of application
 */
export async function writeConfigFile(config: IConfig) {
  fs.writeFileSync(getConfigFilePath(), JSON.stringify(config), 'utf8');
}

export function updateConfigFile() {
  const _config: IConfig = readConfigFile() as IConfig;

  _config.isInitialized = true;

  writeConfigFile(_config);
}

export function readConfigFile(): IConfig | undefined {
  try {
    const data = fs.readFileSync(getConfigFilePath(), 'utf8');

    const _config: IConfig = JSON.parse(data) as IConfig;
    return _config;
  } catch (error) {
    return undefined;
  }
}

export function deleteConfigFile() {
  fs.unlinkSync(getConfigFilePath());
}
