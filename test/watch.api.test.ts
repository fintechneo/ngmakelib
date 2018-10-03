import { suite, test, slow, timeout } from 'mocha-typescript';
import { equal, ok } from 'assert';
import { NGMakeLib } from '../src/ngmakelib.api';
import { existsSync, unlinkSync, watch, exists } from 'fs';
import { execSync, ChildProcess } from 'child_process';

/**
 * Example test suite creating an example library.
 */
@suite export class WatchAPITest {
    @test(timeout(20000)) createandwatchwithasset(done) {        
        const libsrc = 'examplelibrary_src/examplelib.module.ts';
        const moduleId = 'ngmakelibexample';
        const version = '0.2.0';
        const ngmakelib = new NGMakeLib(libsrc, moduleId, version);
        ngmakelib.addAssets(['examplelibrary_src/someasset.txt']);
        console.log("Check that someasset.txt is not present before build");
        ok(!existsSync(ngmakelib.tmpdir + '/build/assets/someasset.txt'));

        ngmakelib.watch().then((watchprocess: ChildProcess) => {
            
            watchprocess.stderr.on('data', (line) => {
                console.log('got line',line.toString());
                if(line.toString().indexOf('Compilation complete. Watching for file changes') > -1) {
                    ok(existsSync(ngmakelib.tmpdir + '/build/assets/someasset.txt'));
                    watchprocess.kill();
                    done();
                }
            });
            
        });
    }

    @test(timeout(20000)) ensuretmpdirnotdeleted(done) {  
        
        console.log('Checking that tmp dir is not deleted when going into watch mode')      
        const libsrc = 'examplelibrary_src/examplelib.module.ts';
        const moduleId = 'ngmakelibexample';
        const version = '0.2.0';
        const ngmakelib = new NGMakeLib(libsrc, moduleId, version);
        ok(existsSync(ngmakelib.tmpdir + '/build/assets/someasset.txt'));
        
        ngmakelib.watch().then((watchprocess: ChildProcess) => {
            
            watchprocess.stderr.on('data', (line) => {
                console.log('got line',line.toString());
                if(line.toString().indexOf('Compilation complete. Watching for file changes') > -1) {
                    ok(existsSync(ngmakelib.tmpdir + '/build/assets/someasset.txt'));
                    watchprocess.kill();
                    done();
                }
            });
            
        });
    }
}