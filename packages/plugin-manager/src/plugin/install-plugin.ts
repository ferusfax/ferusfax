import os from 'os';
import path, { sep } from 'path';
import fs from 'fs';

const ROOT_FOLDER = '.ferusfax';
const PLUGIN_FOLDER = 'plugins';

export function getPluginFilePath() {
  return path.join(os.homedir(), ROOT_FOLDER, PLUGIN_FOLDER, 'plugins.json');
}

export function getPluginFolderPath() {
  return path.join(os.homedir(), ROOT_FOLDER, PLUGIN_FOLDER);
}

function getRootFolderPath() {
  return path.join(os.homedir(), ROOT_FOLDER);
}
export async function writePluginPath() {
  const pluginFilePath = getPluginFilePath();

  if (!fs.existsSync(getPluginFolderPath())) {
    fs.mkdirSync(getPluginFolderPath(), { recursive: true });
  }
}
