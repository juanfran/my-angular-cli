"use strict";
// testing file
/*
import { Blueprint } from './blueprints/blueprint';
import { ComponentBluePrint } from './blueprints/angular/component.blueprint';

const config = new ComponentBluePrint();

config.context = {
  root: 'src',
  name: 'hello',
  inlineTemplate: true,
  inlineStyles: true,
  onPush: true
};

const blueprintComponent = new Blueprint(config);

console.log('sdfsdf');

blueprintComponent.compileFiles();
blueprintComponent.save();
*/
exports.__esModule = true;
var ast_1 = require("./ast");
ast_1.exampleCompile();
