/**
 *  Converts the icon specified in manifest and gives back the base64-encoded Data Url
 */
import manifest from '../manifest.config.ts';
import { fileURLToPath } from 'node:url';
import { readFile } from 'fs/promises';
import path from 'node:path';

const main = async () => {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(dirname, "..");

  const iconPath = path.join(rootDir, "src", "assets", manifest.other.iconName);
  const iconExtension = manifest.other.iconName.split(".").at(-1);

  if (!iconExtension) {
    throw new Error("Invalid icon file");
  }

  const contents = await readFile(iconPath);

  console.log(`Icon's data url:
    data:image/${iconExtension === "svg" ? "svg+xml" : iconExtension};base64,${contents.toString("base64")}`);
}

main();
