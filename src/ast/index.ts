import * as ts from "typescript";
import * as path from 'path';
import {readFileSync} from "fs";

function lineChar(sourceFile, node) {
  let { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  console.log(line, character);
}

function find(node: ts.Node, kind: ts.SyntaxKind, text?: string): ts.Node | undefined {
  for(let children of node.getChildren()) {
    if (children.kind === kind && (!text || (text && text === children.getText()))) {
      return children;
    } else {
      const childrenFinded = find(children, kind, text);

      if (childrenFinded) {
        return childrenFinded;
      }
    }
  }
}

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  fileNames.forEach(fileName => {

      let sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.Latest, true);
      //console.log(sourceFile);

      const module = find(sourceFile, ts.SyntaxKind.Decorator);

      if (module && module.parent) {
        //console.log(module);
        /*let x = module.getChildAt(1).getChildAt(2).getChildAt(0).getChildAt(1);
        console.log(x.getChildAt(0));
        console.log(x.getChildAt(0).getText());*/

        const imports = find(module, ts.SyntaxKind.Identifier, 'imports');

        if (imports && imports.parent) {
          const listImports = find(imports.parent, ts.SyntaxKind.SyntaxList); // BrowserModule, TestModule

          if (listImports) {
            console.log(listImports.getText());
            console.log(listImports.getChildAt(0).getText());
          }

          /*
          console.log(imports.parent);
          console.log(imports.parent.getChildAt(2));
          console.log(imports.getText());
          */
        }

        //module = find(sourceFile, ts.SyntaxKind.Identifier, 'NgModule');

        //console.log(module.getText());
      }
      /*
      ts.forEachChild(sourceFile, (x) => {
        if (x.kind === ts.SyntaxKind.ClassDeclaration) {
          console.log('-----each');;

          console.log('==========================');
          //console.log(result);

          if (x.decorators && x.decorators.length) {
            // NgModule
            let x1 = x.getChildAt(0).getChildAt(0).getChildAt(1).getChildAt(0);
            console.log('x1', x1.kind, x1.getText());
            console.log(x1);

            const expression = x.decorators[0].expression;

            const initDecoData = expression.getChildAt(2).getChildAt(0).getChildAt(1);
            const imports = initDecoData.getChildAt(0);
            const listImports = imports.getChildAt(2);
            //console.log(listImports.getChildAt(1).getText()); // browser module



          }
        }
      });*/
  });
}


/*            function addImport(file, name, pathTo) {
	file.statements.unshift(
		ts.createImportDeclaration(
			undefined,
			undefined,
			ts.createImportClause(ts.createIdentifier(name)),
			ts.createLiteral(pathTo)
		)
	);
	return file;
}

*/

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
