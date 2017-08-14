import * as ts from "typescript";
import * as path from 'path';
import {readFileSync} from "fs";

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  fileNames.forEach(fileName => {

      let sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.ES5, true);
      //console.log(sourceFile);

      ts.forEachChild(sourceFile, (x) => {
        console.log('-----each');
        console.log(x);

        const printer = ts.createPrinter({
            newLine: ts.NewLineKind.LineFeed,
        });

          const result = printer.printNode(ts.EmitHint.Unspecified, x, sourceFile);

          console.log('==========================');
          console.log(result);
      });
  });
}

export const exampleCompile = () => {
  compile([path.join(__dirname, 'example.ts')], {
      noEmitOnError: true, noImplicitAny: true,
      target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
  });

};
