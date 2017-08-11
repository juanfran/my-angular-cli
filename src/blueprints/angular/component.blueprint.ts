
import * as path from 'path';

import * as INPUT from '../../inputs';
import { File, BlueprintConfig } from '../blueprint';

export class ComponentBluePrint implements BlueprintConfig {
  context:any = {}
  params() {
    return {
      root: ['', INPUT.REQUIRED],
      name: ['', INPUT.REQUIRED],
      inlineTemplate: [false, INPUT.OPTIONAL]
    };
  }
  preCompile() {
    const dependencies = [
      'Component'
    ];

    if (this.context.onPush) {
      dependencies.push('ChangeDetectionStrategy');
    }
    this.context.dependencies = dependencies;
  }
  files() {
    const files:File[] = [];

    if (!this.context.inlineTemplate) {
      files.push({
        path: path.join('<%= root %>', '<%= name %>', '<%= name %>.component.html'),
        text: `
<%= utils.capitalize(name) %> Template
        `
      });
    }

    if (!this.context.inlineStyles) {
      files.push({
        path: path.join('<%= root %>', '<%= name %>', '<%= name %>.component.css'),
        text: `
:host {}
        `
      });
    }

    files.push({
      path: path.join('<%= root %>', '<%= name %>', '<%= name %>.component.ts'),
      text: `import { <%= dependencies.join(', ') %> } from '@angular/core';

export @Component({
  selector: '<%= name %>',
  <% if (!inlineTemplate) { %>templateUrl: '<%= name %>.component.html',<% } else { %>template: \`<%= utils.capitalize(name) %> Template\`<% } %>
  <% if (!inlineStyles) { %>styleUrls: ['<%= name %>.component.css'],<% } else { %>styles: ['']<% } %>
  <% if (onPush) { %>changeDetection: ChangeDetectionStrategy.OnPush<% } %>
})
class <%= utils.capitalize(name) %>Component {}
      `
    });

    return files;
  }
};
