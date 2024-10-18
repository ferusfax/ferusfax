import { Command } from 'commander';
import PluginManager, { IPluginManager } from '../src/plugin-manager';
import { IPlugin } from '@ferusfax/types';

const pluginManager: IPluginManager<IPlugin> = new PluginManager(new Command());

test('test if register plugin', () => {
  pluginManager.registerPlugin();

  // expect(fs.existsSync(getPluginFolderPath())).toBe(true);
});
