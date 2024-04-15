export abstract class Plugin {
  options: any;
  abstract activate(args?: string): string;
}

export interface IPlugin {
  identifier?: {
    id: string;
    uuid: string;
  };
  version?: string;
  location?: {
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

/**
 * PEDDING -> CREATED -> RESOLVED
 */
export enum PluginStatus {
  /**
   *  Wait for download and create configs
   */
  PEDDING,
  /**
   * has downloaded and created its config
   */
  CREATED,
  DISABLED,
  /**
   * The plugin is created. All the dependencies are created and resolved.
   * The plugin is ready to be started.
   */
  RESOLVED,
  UNLOADED,
  FAILED,
  REMOVED,
}
