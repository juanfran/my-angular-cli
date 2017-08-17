import * as ts from "typescript";
import * as path from 'path';
import {readFileSync} from "fs";
import { ArrayLiteralExpression } from "typescript";

function lineChar(sourceFile, node) {
  let { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  console.log(line, character);
}

function filter(node: ts.Node, kind: ts.SyntaxKind) {
  let list: any[] = [];

  node.getChildren().forEach((children) => {
    if (children.kind === kind) {
      list.push(children);
    }

    list = [
      ...list,
      ...filter(children, kind)
    ]
  });

  return list;
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

function findListDeclarationsNode(node: ts.Node) {
  const module = find(node, ts.SyntaxKind.Decorator);

  if (module && module.parent) {
    const imports = find(module, ts.SyntaxKind.Identifier, 'declarations');

    if (imports && imports.parent) {
      return find(imports.parent, ts.SyntaxKind.SyntaxList); // BrowserModule, TestModule
    }
  }
}

function create(name: string) {
  ts.createIdentifier('TestComponent');
}


/*
Decorator = the full module
Identifier = NgModule
Identifier = declarations
Identifier = TestComponent
ArrayLiteralExpression = [ AppComponent, TestComponent ]
PropertyAssignment = declarations: [ AppComponent, TestComponent ]

*/

function test1() {
  const printer: ts.Printer = ts.createPrinter();
  const source: string = readFileSync(path.join(__dirname, 'example.ts')).toString();

  //ts.updateArrayLiteral

  const loggingTransformer = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
      function visit(node: ts.Node): ts.Node {
        if (ts.isArrayLiteralExpression(node)) {
          const identifiers = filter(node, ts.SyntaxKind.Identifier);

          return ts.updateArrayLiteral(node, [
            ...identifiers,
            ts.createIdentifier('TestComponent2')
          ]);
        } else {
          node = ts.visitEachChild(node, visit, context);
        }

        return node;
      }
      return ts.visitNode(rootNode, visit);
  };


  const sourceFile: ts.SourceFile = ts.createSourceFile(
    'test.ts', source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
  );

  //console.log('source');
  //console.log(printer.printFile(sourceFile));


  // Options may be passed to transform
  const result: ts.TransformationResult<ts.SourceFile> = ts.transform<ts.SourceFile>(
    sourceFile, [ loggingTransformer ]
  );

  const transformedSourceFile: ts.SourceFile = result.transformed[0];

  console.log('trnasformed');
  console.log(printer.printFile(transformedSourceFile));
}

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  fileNames.forEach(fileName => {

      let sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.Latest, true);

      const declarations = findListDeclarationsNode(sourceFile);

      if (declarations) {
        // console.log(declarations);
      }

      test1();



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
