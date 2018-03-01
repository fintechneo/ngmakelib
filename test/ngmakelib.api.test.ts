import { suite, test, slow, timeout } from 'mocha-typescript';
import { equal } from 'assert';
import { NGMakeLib } from '../src/ngmakelib.api';
import { existsSync, unlinkSync } from 'fs';

@suite export class NGMakelibAPITest {
    @test(timeout(20000)) createlib(done) {        
        const libsrc = 'examplelibrary_src/examplelib.module.ts';
        const moduleId = 'ngmakelibexample';
        const ngmakelib = new NGMakeLib(libsrc, moduleId);
        ngmakelib.build().then(() => {
            const filename = moduleId + '.tar.gz';
            equal(existsSync(filename), true);
            unlinkSync(filename);
            done();
        });
    }
}