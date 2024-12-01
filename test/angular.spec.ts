import { describe, expect, it } from 'vitest';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should report the status of the Angular compiler in strict mode', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { paths, logs, readFile, cleanup, testNames } = await createFixture('angular-strict', {
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
      './src/app/app.component.ts': `
import { Component } from '@angular/core';

interface Hero {
  id: number;
  name: string;
}

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

    const newTestRun = await betterer({ cachePath, configPaths, resultsPath, workers: false });

    expect(testNames(newTestRun.new)).toEqual(['angular']);

    const result = await readFile(resultsPath);

    expect(result).toMatchSnapshot();

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});
