import * as ts from "typescript";
import * as path from 'path';
import {readFileSync} from "fs";
import { ArrayLiteralExpression } from "typescript";

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

function find(node: ts.Node, kind: ts.SyntaxKind, text?: string) {
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
      return find(imports.parent, ts.SyntaxKind.ArrayLiteralExpression);
    }
  }
}

function addImport(name: string, path: string) {
  var newImportSpecifier = ts.createImportSpecifier(undefined, ts.createIdentifier(name));

  return ts.createImportDeclaration(
    undefined,
    undefined,
    ts.createImportClause(undefined, ts.createNamedImports([newImportSpecifier])),
    ts.createLiteral(path));
}

function test1(declarations) {
  const printer: ts.Printer = ts.createPrinter();
  const source: string = readFileSync(path.join(__dirname, 'example.ts')).toString();

  //ts.updateArrayLiteral

  const loggingTransformer = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
      function visit(node: any): ts.Node {
        console.log("Visiting " + ts.SyntaxKind[node.kind]);
        if (node.pos === declarations.pos) {
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

  // Options may be passed to transform
  const result: ts.TransformationResult<ts.SourceFile> = ts.transform<ts.SourceFile>(
    sourceFile, [ loggingTransformer ]
  );

  const transformedSourceFile: ts.SourceFile = result.transformed[0];

  transformedSourceFile.statements = ts.createNodeArray([
    addImport('TestComponent2', 'path/to'),
    ...transformedSourceFile.statements
  ]);

  console.log('trnasformed');
  console.log(printer.printFile(transformedSourceFile));
}

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  fileNames.forEach(fileName => {

      let sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.Latest, true);

      const declarations = findListDeclarationsNode(sourceFile);

      if (declarations) {
        test1(declarations);
      }
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
