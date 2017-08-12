"use strict";
// testing file
Object.defineProperty(exports, "__esModule", { value: true });
var blueprint_1 = require("./blueprints/blueprint");
var component_blueprint_1 = require("./blueprints/angular/component.blueprint");
var config = new component_blueprint_1.ComponentBluePrint();
config.context = {
    root: 'src',
    name: 'hello',
    inlineTemplate: true,
    inlineStyles: true,
    onPush: true
};
var blueprintComponent = new blueprint_1.Blueprint(config);
console.log('sdfsdf');
/*
blueprintComponent.compileFiles();
blueprintComponent.save();
*/
