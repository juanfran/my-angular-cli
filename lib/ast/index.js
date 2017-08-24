"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var path = require("path");
var fs_1 = require("fs");
var example = "\nimport { NgModule }      from '@angular/core';\nimport { BrowserModule } from '@angular/platform-browser';\nimport { AppComponent }  from './app.component';\n\n@NgModule({\n  imports: [\n    BrowserModule,\n    TestModule\n  ],\n  declarations: [ AppComponent, TestComponent ],\n  bootstrap:    [ AppComponent ]\n})\nexport class AppModule { }\n\n";
function filter(node, kind) {
    var list = [];
    node.getChildren().forEach(function (children) {
        if (children.kind === kind) {
            list.push(children);
        }
        list = list.concat(filter(children, kind));
    });
    return list;
}
function find(node, kind, text) {
    for (var _i = 0, _a = node.getChildren(); _i < _a.length; _i++) {
        var children = _a[_i];
        if (children.kind === kind && (!text || (text && text === children.getText()))) {
            return children;
        }
        else {
            var childrenFinded = find(children, kind, text);
            if (childrenFinded) {
                return childrenFinded;
            }
        }
    }
}
function findListDeclarationsNode(node) {
    var module = find(node, ts.SyntaxKind.Decorator);
    if (module && module.parent) {
        var imports = find(module, ts.SyntaxKind.Identifier, 'declarations');
        if (imports && imports.parent) {
            return find(imports.parent, ts.SyntaxKind.ArrayLiteralExpression);
        }
    }
}
function addImport(name, path) {
    var newImportSpecifier = ts.createImportSpecifier(undefined, ts.createIdentifier(name));
    return ts.createImportDeclaration(undefined, undefined, ts.createImportClause(undefined, ts.createNamedImports([newImportSpecifier])), ts.createLiteral(path));
}
function test1(componentName, componentPath, modulePath) {
    var printer = ts.createPrinter();
    var source = fs_1.readFileSync(modulePath).toString();
    var loggingTransformer = function (transformationContext) { return function (rootNode) {
        function propertyAssignmentVisitor(node) {
            if (ts.isArrayLiteralExpression(node)) {
                var identifiers = filter(node, ts.SyntaxKind.Identifier);
                return ts.updateArrayLiteral(node, identifiers.concat([
                    ts.createIdentifier(componentName)
                ]));
            }
            else {
                node = ts.visitEachChild(node, propertyAssignmentVisitor, transformationContext);
            }
            return node;
        }
        function decoratorVisitor(node) {
            if (ts.isPropertyAssignment(node) && node.name.getText() === 'declarations') {
                node = ts.visitEachChild(node, propertyAssignmentVisitor, transformationContext);
            }
            else {
                node = ts.visitEachChild(node, decoratorVisitor, transformationContext);
            }
            return node;
        }
        function visit(node) {
            if (ts.isDecorator(node)) {
                node = ts.visitEachChild(node, decoratorVisitor, transformationContext);
            }
            else {
                node = ts.visitEachChild(node, visit, transformationContext);
            }
            return node;
        }
        return ts.visitNode(rootNode, visit);
    }; };
    var sourceFile = ts.createSourceFile(modulePath, source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
    var result = ts.transform(sourceFile, [loggingTransformer]);
    var transformedSourceFile = result.transformed[0];
    transformedSourceFile.statements = ts.createNodeArray([
        addImport(componentName, componentPath)
    ].concat(transformedSourceFile.statements));
    fs_1.writeFileSync(modulePath, printer.printFile(transformedSourceFile));
    console.log('trnasformed');
    console.log(printer.printFile(transformedSourceFile));
}
function compile(fileNames, options) {
    console.log(fs_1.readFileSync(path.join(process.cwd(), 'src/app/cms/cms.module.ts')).toString());
    test1('Test1Component', '../component1/testcomponent', path.join(process.cwd(), 'src/app/cms/cms.module.ts'));
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
exports.exampleCompile = function () {
    compile([path.join(__dirname, 'example.ts')], {
        noEmitOnError: true, noImplicitAny: true,
        target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
    });
};
