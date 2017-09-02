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

function filter<T extends ts.Node>(node: ts.Node, kind: ts.SyntaxKind): T[] {
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

function find<T extends ts.Node>(node: ts.Node, kind: ts.SyntaxKind, text?: string): T | undefined {
  for(let children of node.getChildren()) {
    if (children.kind === kind && (!text || (text && text === children.getText()))) {
      return children as T;
    } else {
      const childrenFinded = find<T>(children, kind, text);

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

function getDeclarationListNode(node: ts.Node): ts.SyntaxList | undefined {
  const module = find<ts.Decorator>(node, ts.SyntaxKind.Decorator);

  if (module && module.parent) {
    const imports = find<ts.Identifier>(module, ts.SyntaxKind.Identifier, 'declarations');

    if (imports && imports.parent) {
      return find<ts.SyntaxList>(imports.parent, ts.SyntaxKind.SyntaxList);
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

  // let source: string = readFileSync(modulePath).toString();
  let source = example;

  const sourceFile: ts.SourceFile = ts.createSourceFile(
    modulePath, source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
  );

  const declarationsListNode = getDeclarationListNode(sourceFile);

  if (declarationsListNode) {
    const declarations = filter<ts.Identifier>(declarationsListNode, ts.SyntaxKind.Identifier);
    const insertPosition = declarationsListNode.end;

    const lastListNodeChildren = declarationsListNode.getChildAt(declarationsListNode.getChildCount() - 1);

    console.log(lastListNodeChildren.kind === ts.SyntaxKind.CommaToken);

    if (declarations.length && lastListNodeChildren.kind !== ts.SyntaxKind.CommaToken) {
      source = [source.slice(0, insertPosition), `, ${componentName}`, source.slice(insertPosition)].join('');
    } else {
      source = [source.slice(0, insertPosition), componentName, source.slice(insertPosition)].join('');
    }
  }

  let toInsert = `import { ${componentName} }` +
  ` from '${componentPath}';\n`;

  source = toInsert + source;

  //writeFileSync(modulePath, source);
  console.log(source);
}

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  test1(
    'Test1Component',
    '../component1/testcomponent',
    path.join(process.cwd(), '.module.ts')
  );
}

export const exampleCompile = () => {
  compile([path.join(__dirname, 'example.ts')], {
      noEmitOnError: true, noImplicitAny: true,
      target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
  });
};
