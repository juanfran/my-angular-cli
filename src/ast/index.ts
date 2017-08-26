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

  let source: string = readFileSync(modulePath).toString();

  const sourceFile: ts.SourceFile = ts.createSourceFile(
    modulePath, source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
  );

  const declarations = findListDeclarationsNode(sourceFile);
  console.log(declarations);

  source = [source.slice(0, declarations), `, ${componentName}`, source.slice(declarations)].join('');
  //console.log(declarations.getText());


  let toInsert = `import { ${componentName} }` +
  ` from '${componentPath}';\n`;

  source = toInsert + source;

  writeFileSync(modulePath, source);
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
