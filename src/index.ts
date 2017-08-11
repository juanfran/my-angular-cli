  // testing file

import { Blueprint } from './blueprints/blueprint';
import { ComponentBluePrint } from './blueprints/angular/component.blueprint';

const config = new ComponentBluePrint();

config.context = {
  root: 'src',
  name: 'hello',
  inlineTemplate: false,
  onPush: false
};

const blueprintComponent = new Blueprint(config);

console.log('sdfsdf');

blueprintComponent.compileFiles();
blueprintComponent.save();
