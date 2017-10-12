export class AngularCompilerConfig {
    config : any = {
        "compilerOptions": {    
            
            "target": "es5",
            "module": "es2015",
            "moduleResolution": "node",
            "sourceMap": true,
            "emitDecoratorMetadata": false,
            "experimentalDecorators": true,
            "declaration": true,
            "lib": ["es2015", "dom"],    
            "noImplicitAny": true,
            "suppressImplicitAnyIndexErrors": true
            },
        
            "files": [
                
            ],
    
        "angularCompilerOptions": {
            "genDir": "build",
            "flatModuleOutFile": null,
            "flatModuleId": null,
            "skipTemplateCodegen": true,
            "annotateForClosureCompiler": true,
            "strictMetadataEmit": true
        }
    }

    public getConfig(
            tsfile: string,
            outDir : string,
            moduleId : string) : any {
        this.config.files[0] = tsfile;
        this.config.compilerOptions.outDir = outDir;
        this.config.angularCompilerOptions.flatModuleOutFile = moduleId+".js";
        this.config.angularCompilerOptions.flatModuleId = moduleId;
        return this.config;
    }
}