import { IPlugin } from '@ferusfax/types';

export function listPlugins(plugins: Map<string, IPlugin>) {
  var Table = require('cli-table');

  // instantiate
  var table = new Table({
    style: { head: ['magenta'] },
    head: ['Installed Plugin', 'Option'],
    chars: {
      top: '-',
      bottom: '-',
    },
  });

  // table is an Array, so you can `push`, `unshift`, `splice` and friends
  plugins.forEach((plugin) => {
    table.push([plugin.metadata.name, plugin.metadata.flags]);
  });

  console.log(table.toString());
}
