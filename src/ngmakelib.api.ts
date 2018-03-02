import { inlineResourcesForDirectory, inlineResourcesAsync, inlineResource, getAffectedTypeScriptSourceFilesForResource } from './pkg-tools/inline-resources';
import { AngularCompilerConfig } from './configs/angularcompiler.config';
import { PackageJSONConfig } from './configs/packagejson.config';

import {writeFileSync, mkdirSync, copyFile} from 'fs';
import { exec as asyncExec} from 'child_process';
import { exec } from 'shelljs';
import { rollup, Options, WriteOptions } from 'rollup';
import { resolve as resolvePath } from 'path';

import { watch, copy } from 'cpx';

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
            public moduleId: string,
            public version?: string
        ) {

        this.liborigsrcdir = libsrc.substring(0,libsrc.lastIndexOf("/"));
        this.srcfile = libsrc.substring(libsrc.lastIndexOf("/")+1);

        // Prepare configs
        this.ngcConfig = new AngularCompilerConfig().getConfig(
            "src/"+this.srcfile,
            "build",
            this.moduleId);

        this.packageJSONConfig = new PackageJSONConfig().getConfig(moduleId, version);
        this.version = this.packageJSONConfig.version;

        this.rollupInputOptions = {
            input: this.tmpdir+"/build/"+this.moduleId+".js"    
        };
        this.rollupOutputOptions = {
            file: this.tmpdir+"/dist/"+this.moduleId+".js",
            format: 'es'
        }   
    }

    watch() {        
        exec("rm -Rf "+this.tmpdir);
        mkdirSync(this.tmpdir);
        mkdirSync(this.tmpdir +'/build');

        this.ngcConfig.angularCompilerOptions.generateCodeForLibraries = false;

        writeFileSync(this.tmpdir+'/tsconfig.json',JSON.stringify(this.ngcConfig));
        writeFileSync(this.tmpdir + '/build/package.json',
                JSON.stringify(this.packageJSONConfig, null, 1
            )
        );

        const watcher = watch(this.liborigsrcdir+'/**', this.tmpdir + '/src/');
        watcher.on('watch-error', (err) => console.log(err));
        
        // watcher.on('remove', (evt) => console.log('remove', evt));
        watcher.on('watch-ready', () => {
            inlineResourcesForDirectory(this.tmpdir + '/src');
            watcher.on('copy', (evt) => {
                const path = evt.srcPath.substring(this.liborigsrcdir.length + 1);
                
                if(path.indexOf('.ts')>0) {
                    inlineResourcesAsync(this.tmpdir + '/src/' + path).subscribe();
                } else if(['.css','.scss','.html'].find(ext => path.indexOf(ext)>-1)) {
                    getAffectedTypeScriptSourceFilesForResource(this.tmpdir + '/src/' + path)
                        .forEach(tsfile => {
                            console.log(tsfile);
                            copyFile(
                                this.liborigsrcdir + '/' + tsfile.substring((this.tmpdir + '/src/').length),
                                tsfile,
                                () => inlineResourcesAsync(tsfile).subscribe()
                            );
                        });
                }
            });
            const ngcproc = asyncExec('"node_modules/.bin/ngc" -w -p ' + this.tmpdir +'/tsconfig.json');
            ngcproc.stdout.pipe(process.stdout);
            ngcproc.stderr.pipe(process.stderr);
        });        
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
                exec("cd "+this.tmpdir + "/dist && tar -zcvf " + "../../" +
                        this.moduleId + '-' +
                        this.version +
                        ".tar.gz ."
                    );
                    
                // exec("rm -Rf "+this.tmpdir);                            
            });        
    }
}
