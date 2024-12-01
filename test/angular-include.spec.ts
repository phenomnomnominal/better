import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should report the status of the Angular compiler on specific files', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, readFile, cleanup, testNames } = await createFixture('angular-include', {
      '.betterer.js': `
import { angular } from '@betterer/angular';

export default {
  angular: () => angular('./tsconfig.json', {
    strictTemplates: true
  }).include('./src/app/hero-list.component.ts')
};
        `,
      'angular.json': `
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "first-app": {
      "projectType": "application",      
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "outputPath": "dist/first-app",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              {
                "glob": "**/*",
                "input": "src/public"
              }
            ],
            "styles": ["src/styles.css"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kB",
                  "maximumError": "1MB"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kB",
                  "maximumError": "4kB"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        }
      }
    }
  }
}
        `,
      'tsconfig.json': `
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true
  }
}
      `,
      'tsconfig.app.json': `
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
      `,
      './src/app/app.component.ts': `
import { Component } from '@angular/core';
import { HeroListComponent } from './hero-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeroListComponent],
  template: \`
    <div>{{ title }}</div>
    <hero-list/>
  \`,
})
export class AppComponent {}
`,
      './src/app/hero-list.component.ts': `
import { Component } from '@angular/core';

interface Hero {
  id: number;
  name: string;
}

@Component({
  selector: 'hero-list',
  standalone: true,
  template: \`
    <ul>
        @for (hero of heroes; track hero.id) {
            <li>
                <div>{{ hero.Id }} {{ hero.name }}</div>
            </li>
        }
    </ul>
  \`,
})
export class HeroListComponent {
  public heroes: Array<Hero> = [
    { id: 10, name: "Landon" },
    { id: 20, name: "Ella" },
    { id: 30, name: "Madelyn" },
    { id: 40, name: "Haley" }
  ];
}
      `,
      './src/main.ts': `
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';

bootstrapApplication(AppComponent, { providers: [] }).catch((err) => console.error(err));
      `,
      './src/index.html': `
  <app-root></app-root>
      `
    });

    const cachePath = paths.cache;
    const configPaths = [paths.config];
    const resultsPath = paths.results;

    const newTestRun = await betterer({ cachePath, configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['angular']);

    const [newRun] = newTestRun.new;
    const appComponentPath = newRun.filePaths?.find((path) => path.endsWith('app.component.ts'));

    expect(appComponentPath).not.toBeDefined();

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
