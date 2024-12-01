import { promises as fs } from 'node:fs';
import path from 'node:path';

interface ApiItem {
  canonicalReference: string;
  members?: Array<ApiItem>;
}

const MODELS_DIR = path.join(process.cwd(), 'goldens', 'models');
const MODELS_EXTENSION = '.api.json';

void (async () => {
  await removeInternalModules([
    'angular',
    'betterer',
    'constraints',
    'coverage',
    'errors',
    'eslint',
    'knip',
    'logger',
    'reporter',
    'regexp',
    'stylelint',
    'tsquery',
    'typescript'
  ]);

  await removeItems({
    betterer: ['@betterer/betterer!betterer:namespace']
  });
})();

async function removeInternalModules(includedPackages: Array<string>) {
  const modelJSONPaths = await fs.readdir(MODELS_DIR);

  await Promise.all(
    modelJSONPaths.map(async (modelJSONPath) => {
      const packageName = path.basename(modelJSONPath, MODELS_EXTENSION);
      if (!includedPackages.includes(packageName)) {
        await fs.rm(path.join(MODELS_DIR, modelJSONPath));
      }
    })
  );
}

async function removeItems(toRemove: Record<string, Array<string>>) {
  await Promise.all(
    Object.entries(toRemove).map(async ([name, memberNames]) => {
      const modelJSONPath = path.join(MODELS_DIR, `${name}${MODELS_EXTENSION}`);
      const modelJSON = await fs.readFile(modelJSONPath, 'utf-8');
      const model = JSON.parse(modelJSON) as ApiItem;
      if (model.members) {
        removeMembers(model.members, memberNames);
      }
      await fs.writeFile(modelJSONPath, JSON.stringify(model, null, 2), 'utf-8');
    })
  );
}

function removeMembers(members: Array<ApiItem>, references: Array<string>) {
  references.forEach((reference) => {
    const index = members.findIndex((member) => member.canonicalReference === reference);
    if (index != -1) {
      members.splice(index, 1);
    }
  });
  members.forEach((member) => {
    if (member.members) {
      removeMembers(member.members, references);
    }
  });
}
