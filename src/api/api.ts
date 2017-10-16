import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

import * as ast from '../ast';
import { findModule } from '../ast';
import { findModuleFile } from '../file/index';

/*
my-angular-cli add component
  --componentName ExampleComponent
  --componentPath ../example/example.component
  --modulePath src/example/example.module.ts

my-angular-cli add component
  --componentName ExampleComponent
  --moduleName src/example/example.module.ts
*/

export interface AddComponentOptions {
  componentName: string;
  componentPath?: string;
  modulePath?: string;
  moduleName?: string;
}

/*
  Todo:
    modulePath could be xx.module.ts no the full path
*/
export async function addComponent(options: AddComponentOptions) {
  options = {
    ...options
  };

  if (!options.modulePath && options.moduleName) {
    options.modulePath = await findModuleFile(options.moduleName);
  }

  if (!options.modulePath) {
    throw new Error('moduleName or modulePath needed');
  }

  if (!options.componentPath && options.componentName) {
    // todo
    options.componentPath = '';
  }

  if (!options.componentPath || !options.componentName) {
    throw new Error('componentName or componentPath needed');
  }

  const fileContent = fs.readFileSync(options.modulePath, 'utf8');
  const newFileContent = ast.addComponent(fileContent, options.componentName, options.componentPath);

  fs.writeFileSync(options.modulePath, newFileContent);
}

addComponent({
  componentName: 'xxxComponent',
  componentPath: '../hola.ts',
  moduleName: 'CmsModule'
});







