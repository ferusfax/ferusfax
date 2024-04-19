export interface Option {
  flags: string;
  description?: string;
}

export interface IConfig {
  appName: string;
  title: string;
  description: string;
  version: string;
  isInitialized: boolean;
  options: Option[];
}
