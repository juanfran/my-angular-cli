
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

    files.push({
      path: path.join('<%= root %>', '<%= name %>', '<%= name %>.component.ts'),
      text: `import {<% _.forEach(dependencies, function(dependency) { %>
  <%- dependency %>,
<% }); %>} from '@angular/core';

export @Component({
  selector: 'dashboard-page-item',
  <% if (inlineTemplate) { %>templateUrl: '<%= name %>.component.html',<% } else { %>template: \`<%= utils.capitalize(name) %> Template\`<% } %>
  styleUrls: ['dashboard-page-item.component.css'],
  <% if (onPush) { %>changeDetection: ChangeDetectionStrategy.OnPush<% } %>
})
class <%= utils.capitalize(name) %>Component {}
      `
    });

    return files;
  }
};
