export interface File {
    path: string;
    text: string;
}
export declare class Blueprint {
    private blueprintConfig;
    compiledFiles: any[];
    constructor(blueprintConfig: BlueprintConfig);
    compileFiles(): any[];
    save(): void;
}
export interface BlueprintConfig {
    context?: any;
    params?: any;
    preCompile?: () => void;
    files: () => File[];
}
