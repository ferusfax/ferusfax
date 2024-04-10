import { writePluginPath } from '../dist/plugin/install-plugin';
import fs from 'fs';
import {
  getPluginFilePath,
  getPluginFolderPath,
} from '../src/plugin/install-plugin';

test('test if file plugin json exists', () => {
  writePluginPath();

  expect(fs.existsSync(getPluginFolderPath())).toBe(true);
});
