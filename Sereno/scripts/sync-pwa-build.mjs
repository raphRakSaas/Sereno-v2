import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const browserDirectory = join(process.cwd(), 'dist/Sereno/browser');
const clientShellPath = join(browserDirectory, 'index.csr.html');
const indexPath = join(browserDirectory, 'index.html');
const manifestPath = join(browserDirectory, 'ngsw.json');

copyFileSync(clientShellPath, indexPath);

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.index = '/index.html';

const applicationGroup = manifest.assetGroups?.find((group) => group.name === 'app');

if (applicationGroup) {
  const shellUrls = new Set(applicationGroup.urls ?? []);
  shellUrls.add('/index.html');
  shellUrls.delete('/index.csr.html');
  applicationGroup.urls = [...shellUrls];
}

writeFileSync(manifestPath, JSON.stringify(manifest));
