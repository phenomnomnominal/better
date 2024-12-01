import type {
  IApiDocumenterPluginManifest,
  IMarkdownDocumenterFeatureOnBeforeWritePageArgs
} from '@microsoft/api-documenter';

import { MarkdownDocumenterFeature } from '@microsoft/api-documenter';
import dedent from 'dedent';
import path from 'node:path';

const REPLACERS = new Map<RegExp, string>([
  [/\\\*/g, '*'],
  [/\\_/g, '_'],
  [/\\`/g, '`'],
  [/\\\[/g, '['],
  [/\\\]/g, ']'],
  [/<!-- -->/g, '']
]);

const TITLE_REGEXP = /\n## ([\S]*).*\n/;

class BettererMarkdownDocumenter extends MarkdownDocumenterFeature {
  onBeforeWritePage(eventArgs: IMarkdownDocumenterFeatureOnBeforeWritePageArgs): void {
    Array.from(REPLACERS.entries()).forEach((replacer) => {
      eventArgs.pageContent = eventArgs.pageContent.replace(...replacer);
    });

    const id = path.basename(eventArgs.outputFilename, '.md');
    const [, title] = TITLE_REGEXP.exec(eventArgs.pageContent) ?? [];

    if (title == null) {
      throw new Error(`No title match found in "${eventArgs.pageContent}"`);
    }

    const metadata = dedent(`
      ---
      id: ${id}
      title: ${title}
      sidebar_label: ${title}
      slug: /${id}
      ---
      `).trim();
    eventArgs.pageContent = `${metadata}\n\n${eventArgs.pageContent}`;

    eventArgs.pageContent = eventArgs.pageContent.replace('[Home](./index.md)', '[API](./index.md)');

    eventArgs.pageContent = eventArgs.pageContent.replace('<b>Signature:</b>', '## Signature');
    eventArgs.pageContent = eventArgs.pageContent.replace('<b>Returns:</b>', '## Returns');
    eventArgs.pageContent = eventArgs.pageContent.replace('<b>References:</b>', '## References\n');

    eventArgs.pageContent = eventArgs.pageContent.replace(TITLE_REGEXP, '');
  }
}

export const apiDocumenterPluginManifest: IApiDocumenterPluginManifest = {
  manifestVersion: 1000,
  features: [
    {
      featureName: 'betterer-docgen',
      kind: 'MarkdownDocumenterFeature',
      subclass: BettererMarkdownDocumenter
    }
  ]
};
