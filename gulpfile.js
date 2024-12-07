import { readdirSync, statSync } from "fs";
import { join } from "path";
import { src, task, dest } from "gulp";

function copyMisc() {
  const miscFiles = src(["README.md"]);
  // Since `dest()` does not take a string-array, we have to append it
  // ourselves

  const packagePaths = getDirs("packages");
  return packagePaths.reduce(
    (stream, packagePath) => stream.pipe(dest(packagePath)),
    miscFiles
  );
}

export function getFolders(dir) {
  return readdirSync(dir).filter((file) => isDirectory(join(dir, file)));
}

export function getDirs(base) {
  return getFolders(base).map((path) => `${base}/${path}`);
}

function isDirectory(path) {
  return statSync(path).isDirectory();
}
task("copy-misc", copyMisc);
