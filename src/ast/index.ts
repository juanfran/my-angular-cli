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

function getIndentation(text: string) {
  return text.match(/^\r?\n\s+/);
}

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

export function addComponent(source: string, componentName: string, componentPath: string) {
  const printer: ts.Printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed
  });

  // let source: string = readFileSync(modulePath).toString();
  const sourceFile: ts.SourceFile = ts.createSourceFile(
    '', source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
  );

  const declarationsListNode = getDeclarationListNode(sourceFile);

  if (declarationsListNode) {
    const declarations = filter<ts.Identifier>(declarationsListNode, ts.SyntaxKind.Identifier);
    const insertPosition = declarationsListNode.end;

    const lastListNodeChildren = declarationsListNode.getChildAt(declarationsListNode.getChildCount() - 1);

    const toInsert: string[] = [];

    if (declarations.length) {
      const lastDeclaration = declarations[declarations.length - 1];
      const indentation = getIndentation(lastDeclaration.getFullText());

      if (lastListNodeChildren.kind !== ts.SyntaxKind.CommaToken) {
        toInsert.push(',');
      }

      if (indentation && indentation.length) {
        toInsert.push(indentation[0]);
      } else {
        toInsert.push(' ');
      }

      toInsert.push(componentName);
    } else {
      toInsert.push(' ' + componentName);
    }

    source = [source.slice(0, insertPosition), toInsert.join(''), source.slice(insertPosition)].join('');
  }

  const result = `import { ${componentName} }` +
  ` from '${componentPath}';\n`;


    //writeFileSync(modulePath, source);
    //console.log(source);
  return result + source;
}

export const exampleCompile = () => {
  addComponent
};
