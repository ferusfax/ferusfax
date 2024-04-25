import fs from 'fs';
export interface IConfigService<T> {
  save(config: T): void;
  create(): void;
  setAsInitialized(): void;
  load(): T | undefined;
  getConfigFilePath(): fs.PathLike;
  deleteConfigFile(): void;
}
