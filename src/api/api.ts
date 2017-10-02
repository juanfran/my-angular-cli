import * as glob from 'glob';
import * as fs from 'fs';

import * as ast from '../ast';

/*
my-angular-cli add component
  --name ExampleComponent
  --componentPath ../example/example.component
  --modulePath src/example/example.module.ts

my-angular-cli add component
  --name ExampleComponent
  --moduleName src/example/example.module.ts
*/

export interface AddComponentOptions {
  componentName: string;
  componentPath?: string;
  modulePath?: string;
}

export function addComponent(options: AddComponentOptions) {
  options = {
    ...options
  };

  if (!options.modulePath) {
    // todo
    options.modulePath = '';
  }

  if (!options.componentPath) {
    // todo
    options.componentPath = '';
  }

  const fileContent = fs.readFileSync(options.modulePath, 'utf8');
  const newFileContent = ast.addComponent(fileContent, options.componentName, options.componentPath);

  fs.writeFileSync(options.modulePath, newFileContent);
}

