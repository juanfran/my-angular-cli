import * as globby from 'globby';
import * as path from 'path';
import * as ts from 'typescript';
import * as fs from 'fs';

import { findModule } from '../ast';

export async function findModuleFile(moduleName: string) {
  const cwd = 'custom-cwd';

  const files = await globby(('**/*.ts'), {
    cwd
  });

  return files.find((file) => {
    const fileContent = fs.readFileSync(path.join(cwd, file), 'utf8');
    const sourceFile: ts.SourceFile = ts.createSourceFile(
      '', fileContent, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
    );

    return !!findModule(sourceFile, moduleName);
  });
}