import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai'

const expect = chai.expect;
chai.use(sinonChai);

import { Blueprint } from './blueprint';

class exampleBlueprint {
  context: {}
  preCompile() {}
  files() {
    return [
      {
        path: '<%= root %>/<%= name %>/<%= name %>.component.ts',
        text: `
          - <%= root %>
          - <%= utils.capitalize(name) %>
          - <%= utils.camelCase(name) %>
          - <%= utils.escape(name) %>
          - <%= utils.kebabCase(name) %>
          - <%= utils.lowerCase(name) %>
        `
      }
    ];
  }
}

describe('Blueprint', () => {
  it('compile themes', () => {
    const config = new exampleBlueprint();
    config.context = {
      root: 'src',
      name: 'hello'
    }

    config.preCompile = sinon.stub();
    const blueprintComponent = new Blueprint(<any> config);

    const compiledFiles = blueprintComponent.compileFiles();

    expect(config.preCompile).have.been.called;
    expect(blueprintComponent.compiledFiles[0].path).to.be.equal('src/hello/hello.component.ts');
    expect(blueprintComponent.compiledFiles[0].text).to.contains('hello');
  });
});
