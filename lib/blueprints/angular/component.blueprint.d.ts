import { File, BlueprintConfig } from '../blueprint';
export declare class ComponentBluePrint implements BlueprintConfig {
    context: any;
    params(): {
        root: string[];
        name: string[];
        inlineTemplate: (string | boolean)[];
    };
    preCompile(): void;
    files(): File[];
}
