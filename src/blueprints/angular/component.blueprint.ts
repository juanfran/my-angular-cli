
import * as path from 'path';

import * as INPUT from '../../inputs';

export default {
  params() {
    return {
      root: ['', INPUT.REQUIRED],
      name: ['', INPUT.REQUIRED],
      inlineTemplate: [false, INPUT.OPTIONAL]
    };
  },
  files() {
    return [
      {
        path: path.join('<%= root %>', '<%= name %>', '<%= name %>.component.ts'),
        text: `
          class <%= utils.capitalize(name) %>Component {}
        `
      }
    ];
  }
};
