import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should still reports errors if another file effects a cached Angular file', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, readFile, resolve, cleanup, testNames, writeFile } = await createFixture('angular-cache', {
      '.betterer.js': `
import { angular } from '@betterer/angular';

export default {
  angular: () => angular('./tsconfig.json', {
    strictTemplates: true
  }).include('./src/**/*.ts', './src/**/*.html')
};
        `,
      'angular.json': `
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "demo": {
      "root": "",
      "sourceRoot": "src",
      "projectType": "application",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "index": "src/index.html",
            "main": "src/main.ts",
            "tsConfig": "tsconfig.json"
          },
          "configurations": {}
        }
      }
    }
  },
  "defaultProject": "demo"
}
        `,
      'tsconfig.json': `
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "module": "esnext",
    "moduleResolution": "node",
    "importHelpers": true,
    "strict": true,
    "target": "es2015",
    "typeRoots": [],
    "lib": [
      "es2018",
      "dom"
    ]
  },
  "angularCompilerOptions": {
    "disableTypeScriptVersionCheck": true
  }
}`,
      './src/app/hero.ts': `
export interface Hero {
  id: number;
  name: string;
}
      `,
      './src/app/app.component.ts': `
import { Component } from '@angular/core';
import { Hero } from './hero';

@Component({
  selector: 'my-app',
  template: \`
<div>{{ title }}</div>
<ul>
  <li *ngFor="let hero of heroes; trackBy: trackByHero">
    <div>{{ hero.Id }} {{ hero.name }}</div>
  </li>
</ul>
  \`,
})
export class AppComponent {
  public heroes: Array<Hero> = [
    { id: 10, name: "Landon" },
    { id: 20, name: "Ella" },
    { id: 30, name: "Madelyn" },
    { id: 40, name: "Haley" }
  ];
  public trackByHero(hero: Hero) {
    return hero.id;
  }
}
`,
      './src/app/app.module.ts': `
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, CommonModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
`,
      './src/index.html': `
<my-app></my-app>
`,
      './src/main.ts': `
import 'zone.js/dist/zone';

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
`
    });

    const cachePath = paths.cache;
    const configPaths = [paths.config];
    const resultsPath = paths.results;
    const heroPath = resolve('./src/app/hero.ts');

    const newTestRun = await betterer({ cachePath, configPaths, resultsPath, workers: false, cache: true });

    expect(testNames(newTestRun.new)).toEqual(['angular']);

    const sameTestRun = await betterer({ cachePath, configPaths, resultsPath, workers: false, cache: true });

    expect(testNames(sameTestRun.same)).toEqual(['angular']);

    await writeFile(heroPath, `\nexport interface Hero {\n  id: number;\n  name: string;\n  power: string;\n}`);

    const worseTestRun = await betterer({
      cachePath,
      configPaths,
      resultsPath,
      workers: false,
      cache: true,
      includes: [resolve('./src/app/app.component.ts')]
    });

    expect(testNames(worseTestRun.worse)).toEqual(['angular']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
