import { component } from './blueprints/component.blueprint';
import { template } from 'lodash';

class Blueprint {
    public compiledFiles: any[] = [];

    constructor(private blueprintConfig: any, private context: any) {}

    public compileFiles() {
        for (let file of this.blueprintConfig.files()) {
            let compiledFile = {
                path: template(file.path)(this.context),
                text: template(file.text)(this.context)
            }

            this.compiledFiles.push(compiledFile);
        }
    }
}


const blueprintComponent = new Blueprint(component, {
    root: 'src/module1',
    name: 'hello'
});

blueprintComponent.compileFiles();

export function bluePrintManager() {
    console.log(blueprintComponent.compiledFiles);
}