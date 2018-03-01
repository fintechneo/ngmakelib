export class AngularCompilerConfig {
    config : any = {
        "compilerOptions": {    
            
            "target": "es5",
            "module": "es2015",
            "moduleResolution": "node",
            "sourceMap": true,
            "emitDecoratorMetadata": true,
            "experimentalDecorators": true,
            "declaration": true,
            "lib": ["es2015", "dom"],    
            "suppressImplicitAnyIndexErrors": true
            },
        
            "files": [
                
            ],
    
        "angularCompilerOptions": {
            "annotationsAs": "decorators",            
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