import cliProgress from 'cli-progress';

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
}
