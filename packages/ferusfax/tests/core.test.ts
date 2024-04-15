import fs from 'fs';
import {
  IConfig,
  getConfigFilePath,
  writeConfigFile,
  updateConfigFile,
  readConfigFile,
  deleteConfigFile,
} from '../src/service';

test('test if app is undefined', () => {
  // deleteConfigFile();
  const config = readConfigFile();
  expect(config).toBe(undefined);
});

test('test if file config json exists', () => {
  const conf: IConfig = {
    appName: 'ferusfax',
    isInitialized: false,
  };
  writeConfigFile(conf);
  expect(fs.existsSync(getConfigFilePath())).toBe(true);
});

test('test if app is not initialized', () => {
  const config: IConfig = readConfigFile() as IConfig;
  expect(config.isInitialized).toBe(false);
});

test('test if can update config json', () => {
  updateConfigFile();

  const config: IConfig = readConfigFile() as IConfig;
  expect(config.isInitialized).toBe(true);
});

test('test if config json has been deleted', () => {
  deleteConfigFile();

  const config: IConfig | undefined = readConfigFile() as IConfig;
  expect(config).toBe(undefined);
});
