import * as ts from "typescript";
import * as path from 'path';
import { readFileSync, writeFileSync } from "fs";
import { ArrayLiteralExpression } from "typescript";

const example = `
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent }  from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    TestModule
  ],
  declarations: [ AppComponent, TestComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }

`;

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

function findLast(node: ts.Node, kind: ts.SyntaxKind, text?: string) {
  let lastChildren;

  for(let children of node.getChildren()) {
    if (children.kind === kind && (!text || (text && text === children.getText()))) {
      lastChildren = children;
    } else {
      const childrenFinded = find(children, kind, text);

      if (childrenFinded) {
        lastChildren = children;
      }
    }
  }

  return lastChildren;
}

function findListDeclarationsNode(node: ts.Node) {
  const module = find(node, ts.SyntaxKind.Decorator);

  if (module && module.parent) {
    const imports = find(module, ts.SyntaxKind.Identifier, 'declarations');

    if (imports && imports.parent) {
      const declarations = find(imports.parent, ts.SyntaxKind.SyntaxList);

      /// const closeBraket = find(declarations, ts.SyntaxKind.CloseBracketToken);
      console.log(declarations);

      return declarations.end;

      //console.log(ts.SyntaxKind[declarations.getChildAt(2).kind]);
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

function test1(componentName: string, componentPath: string, modulePath: string) {
  const printer: ts.Printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed
  });

  // const source: string = readFileSync(modulePath).toString();
  const source = example;

/*   const loggingTransformer = <T extends ts.Node>(transformationContext: ts.TransformationContext) => (rootNode: T) => {
    function propertyAssignmentVisitor(node: ts.Node): ts.Node {
      if (ts.isArrayLiteralExpression(node)) {
        const identifiers = filter(node, ts.SyntaxKind.Identifier);

        return ts.updateArrayLiteral(node, [
          ...identifiers,
          ts.createIdentifier(componentName)
        ]);
      } else {
        node = ts.visitEachChild(node, propertyAssignmentVisitor, transformationContext);
      }

      return node;
    }

    function decoratorVisitor(node: ts.Node): ts.Node {
      if (ts.isPropertyAssignment(node) && node.name.getText() === 'declarations') {
        node = ts.visitEachChild(node, propertyAssignmentVisitor, transformationContext);
      } else {
        node = ts.visitEachChild(node, decoratorVisitor, transformationContext);
      }

      return node;
    }

    function visit(node: ts.Node): ts.Node {
      if (ts.isDecorator(node)) {
        node = ts.visitEachChild(node, decoratorVisitor, transformationContext);
      } else {
        node = ts.visitEachChild(node, visit, transformationContext);
      }

      return node;
    }

    return ts.visitNode(rootNode, visit);
  };

 */
  const sourceFile: ts.SourceFile = ts.createSourceFile(
    modulePath, source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
  );

  let str = '';
  const declarations = findListDeclarationsNode(sourceFile);
  console.log(declarations);

  str = [example.slice(0, declarations), `, ${componentName}`, example.slice(declarations)].join('');
  //console.log(declarations.getText());



  /*
  const result: ts.TransformationResult<ts.SourceFile> = ts.transform<ts.SourceFile>(
    sourceFile, [ loggingTransformer ]
  );

  const transformedSourceFile: ts.SourceFile = result.transformed[0];

  transformedSourceFile.statements = ts.createNodeArray([
    addImport(componentName, componentPath),
    ...transformedSourceFile.statements
  ]);
  */

  // const str = printer.printFile(transformedSourceFile);

  //writeFileSync(modulePath, str);
  console.log(str);
}

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  test1(
    'Test1Component',
    '../component1/testcomponent',
    path.join(process.cwd(), 'src/app/cms/cms.module.ts')
  );
  /*
  fileNames.forEach(fileName => {

      let sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.Latest, true);

      const declarations = findListDeclarationsNode(sourceFile);

      if (declarations) {
        //test1();
      }
  });
  */
}

export const exampleCompile = () => {
  compile([path.join(__dirname, 'example.ts')], {
      noEmitOnError: true, noImplicitAny: true,
      target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
  });

};
