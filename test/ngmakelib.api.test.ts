import { suite, test, slow, timeout } from 'mocha-typescript';
import { equal, ok } from 'assert';
import { NGMakeLib } from '../src/ngmakelib.api';
import { existsSync, unlinkSync, watch } from 'fs';
import { execSync, ChildProcess } from 'child_process';

/**
 * Example test suite creating an example library.
 */
@suite export class NGMakelibAPITest {
    @test(timeout(20000)) createlib(done) {        
        const libsrc = 'examplelibrary_src/examplelib.module.ts';
        const moduleId = 'ngmakelibexample';
        const version = '0.2.0';
        const ngmakelib = new NGMakeLib(libsrc, moduleId, version);
        ngmakelib.build().then(() => {
            const filename = moduleId + '-' + version + '.tar.gz';
            equal(existsSync(filename), true);
            unlinkSync(filename);
            done();
        });
    }

    @test(timeout(20000)) createlibwithasset(done) {        
        const libsrc = 'examplelibrary_src/examplelib.module.ts';
        const moduleId = 'ngmakelibexample';
        const version = '0.2.0';
        const ngmakelib = new NGMakeLib(libsrc, moduleId, version);
        ngmakelib.addAssets(['examplelibrary_src/someasset.txt'])
        ngmakelib.build().then(() => {
            const filename = moduleId + '-' + version + '.tar.gz';
            equal(existsSync(filename), true);
            ok(execSync(`tar -tvf ${filename}`)
                .toString()
                .split(/\n/)
                .map(line => { console.log(line); return line;})
                .findIndex(line => line.indexOf('assets/someasset.txt') > -1) !== -1);
            unlinkSync(filename);
            done();
        });
    }

    @test(timeout(20000)) createlibcustomreadme(done) {        
        const libsrc = 'examplelibrary_src/examplelib.module.ts';
        const moduleId = 'ngmakelibexample';
        const version = '0.2.0';
        const ngmakelib = new NGMakeLib(libsrc, moduleId, version);
        ngmakelib.setREADME('examplelibrary_src/README_library.md');
        ngmakelib.build().then(() => {
            const filename = moduleId + '-' + version + '.tar.gz';
            equal(existsSync(filename), true);
            ok(execSync(`tar -xOzf ${filename} "./README.md"`)
                .toString()
                .split(/\n/)
                .map(line => { console.log(line); return line;})
                .findIndex(line => line.indexOf('# THE LIBRARY') > -1) !== -1);
            unlinkSync(filename);
            done();
        });
    }
}