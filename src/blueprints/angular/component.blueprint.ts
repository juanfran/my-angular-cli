
import * as path from 'path';

import * as INPUT from '../../inputs';
import { File, BlueprintConfig } from '../blueprint';

export class componentBluePrint implements BlueprintConfig {
  context:any = {}
  params() {
    return {
      root: ['', INPUT.REQUIRED],
      name: ['', INPUT.REQUIRED],
      inlineTemplate: [false, INPUT.OPTIONAL]
    };
  }
  files() {
    const files:File[] = [];

    let template = 'templateUrl: \'<%= name %>.component.html\',';

    if (!this.context.inlineTemplate) {
      files.push({
        path: path.join('<%= root %>', '<%= name %>', '<%= name %>.component.html'),
        text: `
          <%= utils.capitalize(name) %> Template
        `
      });

      template = 'template: `<%= utils.capitalize(name) %> Template`';
    }

    files.push({
      path: path.join('<%= root %>', '<%= name %>', '<%= name %>.component.ts'),
      text: `
        @Component({
          selector: 'dashboard-page-item',
          ${template}
          styleUrls: ['dashboard-page-item.component.css'],
          changeDetection: ChangeDetectionStrategy.OnPush
        })
        class <%= utils.capitalize(name) %>Component {}
      `
    });

    return files;
  }
};
