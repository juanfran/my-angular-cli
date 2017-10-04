import * as ts from 'typescript';
import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';

import * as ast from '../ast';
import { findModule } from '../ast';

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
export function addComponent(options: AddComponentOptions) {
  options = {
    ...options
  };

  if (!options.modulePath && options.moduleName) {
    // todo
    options.modulePath = '';
  } else {
    throw new Error('moduleName or modulePath needed');
  }

  if (!options.componentPath && options.componentName) {
    // todo
    options.componentPath = '';
  } else {
    throw new Error('componentName or componentPath needed');
  }

  const fileContent = fs.readFileSync(options.modulePath, 'utf8');
  const newFileContent = ast.addComponent(fileContent, options.componentName, options.componentPath);

  fs.writeFileSync(options.modulePath, newFileContent);
}




/* TEST */

const cwd = 'custom-cwd';
glob(('**/*.ts'), {
  cwd
}, function(er, files) {
  const find = files.find((file) => {
    const fileContent = fs.readFileSync(path.join(cwd, file), 'utf8');
    const sourceFile: ts.SourceFile = ts.createSourceFile(
      '', fileContent, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
    );

    return !!findModule(sourceFile, 'CmsModule');
  });

  console.log(find);
})




