import { Command } from 'commander';
import { IConfig } from '@ferusfax/types';
import cliProgress from 'cli-progress';
const figlet = require('figlet');

interface ITableData {
  head: string[];
  data: any[][];
}

export class Screen {
  private config: IConfig;
  private progressBar: cliProgress.SingleBar;
  private command: Command;

  constructor() {
    this.progressBar = new cliProgress.SingleBar(
      {
        clearOnComplete: false,
        hideCursor: true,
        format: ' {bar} | {percentage}% ',
      },
      cliProgress.Presets.shades_classic,
    );

    this.command = new Command();

    this.config = {
      appName: '',
      title: '',
      description: '',
      version: '',
      isInitialized: false,
      options: [],
    };
  }

  print(callback: { (): void; (): void }) {
    callback();
  }

  printLogo() {
    console.log(
      figlet.textSync(this.config.title, {
        horizontalLayout: 'fitted',
        verticalLayout: 'fitted',
        width: 80,
        whitespaceBreak: true,
      }),
    );
  }

  start(total: number) {
    this.progressBar.start(total, 0);
  }

  stop() {
    this.progressBar.stop();
  }

  getProgressBar() {
    return this.progressBar;
  }

  printTable(tableData: ITableData) {
    var Table = require('cli-table');

    if (tableData.data.length == 0) {
      console.log("There aren't any plugins installed");
      return;
    }
    // instantiate
    var table = new Table({
      style: { head: ['magenta'] },
      head: tableData.head,
      chars: {
        top: '-',
        bottom: '-',
      },
    });

    table.push(...tableData.data);

    console.log(table.toString());
  }
  setConfig(config: IConfig) {
    this.config = config;
  }

  loadOptions() {
    this.command
      .name(this.config.appName)
      .version(this.config.version)
      .description(this.config.description);
  }

  getCommand() {
    return this.command;
  }
}
