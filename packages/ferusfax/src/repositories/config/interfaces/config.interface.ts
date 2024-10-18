import fs from 'fs';

export interface IConfigRepository<T> {
  save(config: T): void;
  load(): T;
  getConfigFilePath(): fs.PathLike;
  deleteConfigFile(): void;
}
