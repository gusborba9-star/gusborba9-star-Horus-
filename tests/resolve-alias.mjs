import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const extensions = ['.ts', '.tsx', '.js', '.mjs', '.json'];

function resolveLocalPath(basePath) {
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) return basePath;
  for (const extension of extensions) {
    const candidate = `${basePath}${extension}`;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
    for (const extension of extensions) {
      const candidate = path.join(basePath, `index${extension}`);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const absolutePath = resolveLocalPath(path.resolve(process.cwd(), specifier.slice(2)));
    if (absolutePath) return nextResolve(pathToFileURL(absolutePath).href, context);
  }

  if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
    const parentPath = path.dirname(fileURLToPath(context.parentURL));
    const absolutePath = resolveLocalPath(path.resolve(parentPath, specifier));
    if (absolutePath) return nextResolve(pathToFileURL(absolutePath).href, context);
  }

  return nextResolve(specifier, context);
}
