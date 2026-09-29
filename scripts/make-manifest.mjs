/**
 *  Makes a valid manifest.json of the plugin
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import manifest from '../manifest.config.ts';

const main = async () => {
  const dirname = path.dirname(fileURLToPath(import.meta.url));

  const rootDir = path.resolve(dirname, "..");
  const distDir = path.join(rootDir, "dist");

  const pluginOutputName = `${manifest.other.pluginOutputName}.js`;
  const pluginOutputPath = path.join(distDir, pluginOutputName);

  const contents = await readFile(pluginOutputPath, "utf-8");

  const hash = createHash('sha256');

  const hashString = hash.update(contents).digest('hex');

  const manifestPath = path.join(distDir, "manifest.json");

  const manifestObject = {
    name: manifest.name,
    author: manifest.author,
    description: manifest.description,
    version: manifest.version,
    downloadUrl: manifest.downloadUrl,
    sha256: hashString,
    releaseDate: new Date().toISOString(),
    type: manifest.type,
    icon: manifest.icon,
    category: manifest.category,
    features: manifest.features,
    repo: manifest.repo,
    minimumFirebotVersion: manifest.minimumFirebotVersion
  };

  await writeFile(manifestPath, JSON.stringify(manifestObject,null,"\t"), "utf-8");
};

main();
