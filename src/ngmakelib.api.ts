import { inlineResourcesForDirectory } from './pkg-tools/inline-resources';
import { AngularCompilerConfig } from './configs/angularcompiler.config';
import { PackageJSONConfig } from './configs/packagejson.config';

import {writeFileSync,mkdirSync} from 'fs';
import { exec } from 'shelljs';
import { rollup, Options, WriteOptions } from 'rollup';

declare var process;

export class NGMakeLib {
    tmpdir = ".ngmakelibtmp";
    ngcConfig: any;
    packageJSONConfig: any;
    rollupInputOptions: Options;
    rollupOutputOptions: WriteOptions;

    liborigsrcdir: string;
    srcfile: string;

    constructor(
            public libsrc: string, 
            public moduleId: string
        ) {

        this.liborigsrcdir = libsrc.substring(0,libsrc.lastIndexOf("/"));
        this.srcfile = libsrc.substring(libsrc.lastIndexOf("/")+1);

        // Prepare configs
        this.ngcConfig = new AngularCompilerConfig().getConfig(
            "src/"+this.srcfile,
            "build",
            this.moduleId);

        this.packageJSONConfig = new PackageJSONConfig().getConfig(moduleId);
        this.rollupInputOptions = {
            input: this.tmpdir+"/build/"+this.moduleId+".js"    
        };
        this.rollupOutputOptions = {
            file: this.tmpdir+"/dist/"+this.moduleId+".js",
            format: 'es'
        }   
    }

    build(): Promise<any> {        
        exec("rm -Rf "+this.tmpdir);
        mkdirSync(this.tmpdir);
        exec("cp -r "+this.liborigsrcdir+" "+this.tmpdir+"/src");
        inlineResourcesForDirectory(this.tmpdir);
        
        writeFileSync(this.tmpdir+'/tsconfig.json',JSON.stringify(this.ngcConfig));
        exec('"node_modules/.bin/ngc" -p ' + this.tmpdir +'/tsconfig.json');
        
        return rollup(this.rollupInputOptions)
            .then((bundle) =>  bundle.write(this.rollupOutputOptions))
            .then(() => {
                exec('"node_modules/.bin/cpx" "' + this.tmpdir + '/build/**/*.d.ts" "' + this.tmpdir + '/dist"');
                exec("cp "+ this.tmpdir +"/build/*.metadata.json "+
                    this.tmpdir+"/dist/");
                writeFileSync(this.tmpdir + "/dist/package.json",
                    JSON.stringify(this.packageJSONConfig, null, 1
                    )
                );
                exec("cd "+this.tmpdir + "/dist && tar -zcvf " + "../../" + this.moduleId + ".tar.gz .");
                exec("rm -Rf "+this.tmpdir);                            
            });        
    }
}
