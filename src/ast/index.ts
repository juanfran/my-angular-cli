import * as ts from "typescript";
import * as path from 'path';
import {readFileSync} from "fs";

function lineChar(sourceFile, node) {
  let { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  console.log(line, character);
}

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  fileNames.forEach(fileName => {

      let sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.ES5, true);
      //console.log(sourceFile);

      ts.forEachChild(sourceFile, (x) => {
        if (x.kind === ts.SyntaxKind.ClassDeclaration) {
          console.log('-----each');
          console.log(x.decorators);
          const printer = ts.createPrinter({
              newLine: ts.NewLineKind.LineFeed,
          });

          const result = printer.printNode(ts.EmitHint.Unspecified, x, sourceFile);

          console.log('==========================');
          //console.log(result);

          if (x.decorators && x.decorators.length) {
            const expression = x.decorators[0].expression;
            expression.getChildren().forEach((c, index) => {
              //console.log(index + '-->', c.getText());
            });


            const initDecoData = expression.getChildAt(2).getChildAt(0).getChildAt(1);
            const imports = initDecoData.getChildAt(0);
            const listImports = imports.getChildAt(2);
            console.log(listImports.getChildAt(1)); // browser module
    /*        if (expression.) {
              console.log(x.decorators[0].expression.);
            }*/
          }
        }
      });
  });
}

export const exampleCompile = () => {
  compile([path.join(__dirname, 'example.ts')], {
      noEmitOnError: true, noImplicitAny: true,
      target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
  });

};

/*
Decorator = 147
SyntaxList = 295,
*/
