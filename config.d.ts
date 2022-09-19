declare interface IApplicationConfig {

}

type WriteFileOptions = { encoding?: string | null; mode?: number | string; flag?: string; } | string | null;

declare interface IDrive {
    filesystem: string;
    blocks: number;
    used: number;
    available: number;
    capacity: string;
    mounted: string;
}

declare interface IStats {
  isFile(): boolean;
  isDirectory(): boolean;
  isBlockDevice(): boolean;
  isCharacterDevice(): boolean;
  isSymbolicLink(): boolean;
  isFIFO(): boolean;
  isSocket(): boolean;
  dev: number;
  ino: number;
  mode: number;
  nlink: number;
  uid: number;
  gid: number;
  rdev: number;
  size: number;
  blksize: number;
  blocks: number;
  atimeMs: number;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;
}

declare interface IPartialStat {
    isFile: boolean;
    isDirectory: boolean;
}

declare interface IDirent {
  isFile(): boolean;
  isDirectory(): boolean;
  isBlockDevice(): boolean;
  isCharacterDevice(): boolean;
  isSymbolicLink(): boolean;
  isFIFO(): boolean;
  isSocket(): boolean;
  name: string;
}

declare interface IElectronApi {
  send: (channel: string, data?: any) => void;
  receive: (channel: string, func: (...args: any) => void) => void;
  interactivity: () => IInteractivity;
  db: () => PouchDB.Database;
}

declare interface IFileSystem {

  statSync(path: string | Buffer | URL): IStats;

  readdirSync(path: string | Buffer | URL, options?: { encoding: BufferEncoding | null; withFileTypes?: false } | BufferEncoding | null): string[];
  readdirSync(path: string | Buffer | URL, options: { encoding: "buffer"; withFileTypes?: false } | "buffer"): Buffer[];
  readdirSync(path: string | Buffer | URL, options?: { encoding?: string | null; withFileTypes?: false } | string | null): string[] | Buffer[];
  readdirSync(path: string | Buffer | URL, options: { withFileTypes: true }): IDirent[];

  readFileSync(path: string | Buffer | URL | number, options?: { encoding?: null; flag?: string; } | null): Buffer;
  readFileSync(path: string | Buffer | URL | number, options: { encoding: string; flag?: string; } | string): string;
  readFileSync(path: string | Buffer | URL | number, options?: { encoding?: string | null; flag?: string; } | string | null): string | Buffer;

  writeFileSync(path: string | Buffer | URL | number | number, data: any, options?: WriteFileOptions): void;
}

declare interface IInteractivity {
  fs: IFileSystem;
  getIcon: (path: string) => Promise<string>;
  getDiskInfo: () => Promise<IDrive[]>;
  getStat: (path: string) => IPartialStat;
}

declare interface Window {
  api: IElectronApi;
  dbPath: string;
  NodePouchDB: PouchDatabase
}

declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor(options?: WorkerOptions);
  }

  export default WebpackWorker;
}

interface PouchDatabase {
  new(name?: string, options?: PouchDB.Configuration.DatabaseConfiguration): PouchDB.Database
}
