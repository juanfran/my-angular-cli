import * as ts from "typescript";
import * as path from 'path';
import { readFileSync, writeFileSync } from "fs";
import { ArrayLiteralExpression } from "typescript";

function getIndentation(text: string) {
  return text.match(/^\r?\n\s+/);
}

function filter(node: ts.Node, fn: (node: ts.Node) => boolean): any[] {
  let list: any[] = [];

  node.getChildren().forEach((children) => {
    if (fn(children)) {
      list.push(children);
    }

    list = [
      ...list,
      ...filter(children, fn)
    ]
  });

  return list;
}

function find(node: ts.Node, fn: (node: ts.Node) => boolean) {
  for(let children of node.getChildren()) {
    if (fn(children)) {
      return children;
    } else {
      const childrenFinded = find(children, fn);

      if (childrenFinded) {
        return childrenFinded;
      }
    }
  }
}

function findLast(node: ts.Node, fn: (node: ts.Node) => boolean) {
  let lastChildren;

  for(let children of node.getChildren()) {
    if (fn(children)) {
      lastChildren = children;
    } else {
      const childrenFinded = find(children, fn);

      if (childrenFinded) {
        lastChildren = children;
      }
    }
  }

  return lastChildren;
}

function getDecorator(node: ts.Node, id: string): ts.Decorator | undefined {
  return query([node])
    .find((node) => {
      if (node.kind === ts.SyntaxKind.Decorator) {
        const expr = node.expression as ts.CallExpression;

        if (expr.expression.kind == ts.SyntaxKind.Identifier) {
          const exprId = expr.expression as ts.Identifier;
          return exprId.getFullText() === id;
        }
      }

      return false;
    })
    .get();
}

function getDeclarationListNode(node: ts.Node): ts.SyntaxList | undefined {
  const module = getDecorator(node, 'NgModule');

  if (module && module.parent) {
    const imports = query([module])
      .find((node) => node.kind === ts.SyntaxKind.Identifier && node.getText() === 'declarations')
      .get();

    if (imports && imports.parent) {
      return query([imports.parent])
      .find((node) => node.kind === ts.SyntaxKind.SyntaxList)
      .get();
    }
  }
}

const query = (nodes: any[] = []) => {
  const _query = {
    filter: (condition) => {
      const filterNodes = nodes.reduce((oldValue: any[], currentValue) => {
        const value: any[] = [];
        value.push(...oldValue);
        value.push(...filter(currentValue, condition));

        return value;
      }, []);

      return query(filterNodes);
    },
    find: (condition) => {
      let resultNode;

      nodes.find((node) => {
        const result = find(node, condition);

        if (result) {
          resultNode = result;
        }

        return result;
      });

      if (resultNode) {
        return query([resultNode]);
      } else {
        return query([]);
      }
    },
    findLast: (condition) => {
      let last;

      for(let node of nodes) {
        const finded = findLast(node, condition);

        if (finded) {
          last = finded;
        }
      }

      if (last) {
        return query([last]);
      } else {
        return query([]);
      }
    },
    first: () => {
      if (nodes.length) {
        return query([nodes[0]]);
      } else {
        return query([]);
      }
    },
    last: () => {
      if (nodes.length) {
        return query(nodes[nodes.length - 1]);
      } else {
        return query([]);
      }
    },
    get: (index: number = 0) => {
      if (nodes[index]) {
        return nodes[index];
      }
    },
    getAll: () => {
      return nodes;
    }
  }

  return _query;
};

export function removeComponent(source: string, componentName: string) {
  const printer: ts.Printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed
  });

  const sourceFile: ts.SourceFile = ts.createSourceFile(
    '', source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
  );

  const module = getDecorator(sourceFile, 'NgModule');
  const declarationsListNode = getDeclarationListNode(sourceFile);

  if (module && declarationsListNode) {
    const declarations = query([declarationsListNode])
    .filter((node) => {
      return node.kind === ts.SyntaxKind.Identifier ||  node.kind === ts.SyntaxKind.CommaToken
    })
    .getAll();

    const componentIndex = declarations.findIndex((it) => it.getText() === componentName);

    if (componentIndex) {
      const component = declarations[componentIndex];

      source = [source.slice(0, component.pos), source.slice(component.end)].join('');

      if (declarations[componentIndex - 1] && declarations[componentIndex - 1].kind === ts.SyntaxKind.CommaToken) {
          const commaToken = declarations[componentIndex - 1];

          source = [source.slice(0, commaToken.pos), source.slice(commaToken.end)].join('');
      }
    }
  }

  return source;
}

export function addComponent(source: string, componentName: string, componentPath: string) {
  const printer: ts.Printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed
  });

  const sourceFile: ts.SourceFile = ts.createSourceFile(
    '', source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
  );

  const module = getDecorator(sourceFile, 'NgModule');
  const declarationsListNode = getDeclarationListNode(sourceFile);

  if (module) {
    if (declarationsListNode) {
      const declarations = query([declarationsListNode])
        .filter((node) => node.kind === ts.SyntaxKind.Identifier)
        .getAll();

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
        toInsert.push(' ' + componentName + ' ');
      }

      source = [source.slice(0, insertPosition), toInsert.join(''), source.slice(insertPosition)].join('');
    } else {
      const expr = query([module])
        .find((node) => node.kind === ts.SyntaxKind.ObjectLiteralExpression)
        .get();

      if (expr) {
        const firstProperty = query([expr])
          .find((node) => node.kind === ts.SyntaxKind.PropertyAssignment)
          .get();

        const firstPunctuation = query([expr])
          .find((node) => node.kind === ts.SyntaxKind.FirstPunctuation)
          .get();

        if (firstProperty && firstPunctuation) {
          const toInsert: string[] = [];
          const insertPosition = firstPunctuation.end;
          const indentation = getIndentation(firstProperty.getFullText());

          if (indentation) {
            toInsert.push(indentation[0]);
            toInsert.push(`declarations: [ ${componentName} ],`)
          }

          source = [source.slice(0, insertPosition), toInsert.join(''), source.slice(insertPosition)].join('');
        }
      }
    }
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
