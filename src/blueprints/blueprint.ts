import * as writeFile from 'write';

import * as _ from 'lodash';

export class Blueprint {
  public compiledFiles: any[] = [];

  constructor(private blueprintConfig: any, private context: any) {}

  public compileFiles() {
    const context = {
      ...this.context,
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
