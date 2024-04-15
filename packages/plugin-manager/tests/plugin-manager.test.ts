import PluginManager from '../src/plugin-manager';

import { IPlugin } from '@ferusfax/types';
import fs from 'fs';
import { Command } from 'commander';
import path from 'path';

import {
  writePluginPath,
  getPluginFilePath,
  getPluginFolderPath,
} from '../src/plugin/install-plugin';
import { PluginStatus } from '@ferusfax/types';

test('test if file plugin json exists', () => {
  writePluginPath();

  expect(fs.existsSync(getPluginFolderPath())).toBe(true);
});

test('test if path to plugin exists', async () => {
  let plugin: IPlugin = {
    metadata: {
      name: 'jest',
      packageName: 'jest',
      descrition: 'jest',
      option: '-j, --jest',
      flags: '--jest',
    },
  };

  // let plugin: IPlugin = {
  //   metadata: {
  //     name: 'commander',
  //     packageName: 'commander',
  //     descrition: 'commander',
  //     option: '-c, --commander',
  //     flags: '--commander',
  //   },
  // };

  const program = new Command();
  const pluginManager = new PluginManager(program);

  plugin = await pluginManager.registerPlugin(plugin);

  expect(fs.existsSync(plugin.location?.path as string)).toBe(true);
});

test('test if config plugin exists', async () => {
  expect(fs.existsSync(getPluginFilePath())).toBe(true);
});

test('test if plugin exists', async () => {
  const program = new Command();
  const pluginManager = new PluginManager(program);

  expect(pluginManager.listPluginList().size).toBeGreaterThan(0);
});

test('test if remove plugin', async () => {
  const program = new Command();
  const pluginManager = new PluginManager(program);

  let plugin: IPlugin = {
    metadata: {
      descrition: '',
      flags: '',
      name: '',
      option: '',
      packageName: '',
    },
  };

  pluginManager.listPluginList().forEach((value) => (plugin = value));

  plugin = await pluginManager.remove(plugin);

  expect(fs.existsSync(plugin.location?.path as string)).toBe(true);
});
