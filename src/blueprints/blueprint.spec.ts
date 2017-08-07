import { expect } from 'chai';

import { Blueprint } from './blueprint';

const exampleBlueprint = {
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
};

describe('Blueprint', () => {
  it('compile themes', () => {
    const blueprintComponent = new Blueprint(exampleBlueprint, {
      root: 'src',
      name: 'hello'
    });

    const compiledFiles = blueprintComponent.compileFiles();

    console.log(blueprintComponent.compiledFiles);

    expect(blueprintComponent.compiledFiles[0].path).to.be.equal('src/hello/hello.component.ts');
    expect(blueprintComponent.compiledFiles[0].text).to.contains('hello');

  });
});