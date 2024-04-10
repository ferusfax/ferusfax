export abstract class Plugin {
  options: any;
  abstract activate(args?: string): string;
}

export interface IPlugin {
  identifier: {
    id: string;
    uuid: string;
  };
  version: string;
  location: {
    path: string;
  };
  metadata: {
    name: string;
    packageName: string;
    descrition: string;
    option: string;
    flags: string;
  };
  instance?: any;
}
