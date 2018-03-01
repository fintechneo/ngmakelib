import { suite, test, slow, timeout } from 'mocha-typescript';
import { equal } from 'assert';
import { NGMakeLib } from '../src/ngmakelib.api';
import { existsSync, unlinkSync } from 'fs';

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
}