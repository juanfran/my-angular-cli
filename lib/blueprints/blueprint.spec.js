"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);
var blueprint_1 = require("./blueprint");
var exampleBlueprint = (function () {
    function exampleBlueprint() {
    }
    exampleBlueprint.prototype.preCompile = function () { };
    exampleBlueprint.prototype.files = function () {
        return [
            {
                path: '<%= root %>/<%= name %>/<%= name %>.component.ts',
                text: "\n          - <%= root %>\n          - <%= utils.capitalize(name) %>\n          - <%= utils.camelCase(name) %>\n          - <%= utils.escape(name) %>\n          - <%= utils.kebabCase(name) %>\n          - <%= utils.lowerCase(name) %>\n        "
            }
        ];
    };
    return exampleBlueprint;
}());
describe('Blueprint', function () {
    it('compile themes', function () {
        var config = new exampleBlueprint();
        config.context = {
            root: 'src',
            name: 'hello'
        };
        config.preCompile = sinon.stub();
        var blueprintComponent = new blueprint_1.Blueprint(config);
        var compiledFiles = blueprintComponent.compileFiles();
        expect(config.preCompile).have.been.called;
        expect(blueprintComponent.compiledFiles[0].path).to.be.equal('src/hello/hello.component.ts');
        expect(blueprintComponent.compiledFiles[0].text).to.contains('hello');
    });
});
