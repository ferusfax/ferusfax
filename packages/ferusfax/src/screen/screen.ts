import cliProgress from 'cli-progress';

interface ITableData {
  head: string[];
  data: any[][];
}

export class Screen {
  private progressBar: cliProgress.SingleBar;

  constructor() {
    this.progressBar = new cliProgress.SingleBar(
      {
        clearOnComplete: false,
        hideCursor: true,
        format: ' {bar} | {percentage}% ',
      },
      cliProgress.Presets.shades_classic,
    );
  }

  print(callback: { (): void; (): void }) {
    callback();
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
}
