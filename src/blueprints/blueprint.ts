import * as writeFile from 'write';
import * as INPUT from '../inputs';

import * as _ from 'lodash';

export interface File {
  path: string;
  text: string;
}

export class Blueprint {
  public compiledFiles: any[] = [];

  constructor(private blueprintConfig: BlueprintConfig) { }

  public compileFiles() {
    if(this.blueprintConfig.preCompile) {
      this.blueprintConfig.preCompile();
    }

    const context = {
      ...this.blueprintConfig.context,
      utils: {
        capitalize: _.capitalize,
        camelCase: _.camelCase,
        escape: _.escape,
        kebabCase: _.kebabCase,
        lowerCase: _.lowerCase
      }
    };

    for (let file of this.blueprintConfig.files()) {
      let compiledFile = {
        path: _.template(file.path)(context),
        text: _.template(file.text)(context)
      }

      this.compiledFiles.push(compiledFile);
    }

    return this.compiledFiles;
  }

  public save() {
    this.compiledFiles.forEach((file) => {
      writeFile(file.path, file.text, function (err) {
        if (err) {
          return console.error(err);
        }
      });
    });
  }
}

export interface BlueprintConfig {
  context?: any,
  params?: any;
  preCompile?: () => void;
  files: () => File[]
}
