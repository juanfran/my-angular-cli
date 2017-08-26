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
function findLast(node, kind, text) {
    var lastChildren;
    for (var _i = 0, _a = node.getChildren(); _i < _a.length; _i++) {
        var children = _a[_i];
        if (children.kind === kind && (!text || (text && text === children.getText()))) {
            lastChildren = children;
        }
        else {
            var childrenFinded = find(children, kind, text);
            if (childrenFinded) {
                lastChildren = children;
            }
        }
    }
    return lastChildren;
}
function findListDeclarationsNode(node) {
    var module = find(node, ts.SyntaxKind.Decorator);
    if (module && module.parent) {
        var imports = find(module, ts.SyntaxKind.Identifier, 'declarations');
        if (imports && imports.parent) {
            var declarations = find(imports.parent, ts.SyntaxKind.SyntaxList);
            /// const closeBraket = find(declarations, ts.SyntaxKind.CloseBracketToken);
            console.log(declarations);
            return declarations.end;
            //console.log(ts.SyntaxKind[declarations.getChildAt(2).kind]);
        }
    }
}
function addImport(name, path) {
    var newImportSpecifier = ts.createImportSpecifier(undefined, ts.createIdentifier(name));
    return ts.createImportDeclaration(undefined, undefined, ts.createImportClause(undefined, ts.createNamedImports([newImportSpecifier])), ts.createLiteral(path));
}
function test1(componentName, componentPath, modulePath) {
    var printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed
    });
    var source = fs_1.readFileSync(modulePath).toString();
    var sourceFile = ts.createSourceFile(modulePath, source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
    var declarations = findListDeclarationsNode(sourceFile);
    console.log(declarations);
    source = [source.slice(0, declarations), ", " + componentName, source.slice(declarations)].join('');
    //console.log(declarations.getText());
    var toInsert = "import { " + componentName + " }" +
        (" from '" + componentPath + "';\n");
    source = toInsert + source;
    fs_1.writeFileSync(modulePath, source);
    console.log(source);
}
function compile(fileNames, options) {
    test1('Test1Component', '../component1/testcomponent', path.join(process.cwd(), 'src/app/cms/workspace/workspace.module.ts'));
}
exports.exampleCompile = function () {
    compile([path.join(__dirname, 'example.ts')], {
        noEmitOnError: true, noImplicitAny: true,
        target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
    });
};
