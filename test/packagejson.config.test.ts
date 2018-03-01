import { suite, test, slow, timeout } from 'mocha-typescript';
import { PackageJSONConfig } from '../src/configs/packagejson.config';
import { equal } from 'assert';

import { readFileSync } from 'fs';

@suite export class PackageJSONConfigTest {
    @test createConfig() {
        const moduleId = 'myModuleId';
        const version = '2.8.2';
        const conf = new PackageJSONConfig().getConfig('myModuleId', '2.8.2');
        equal(conf.name, moduleId);
        equal(conf.version, version);
        equal(conf.main, moduleId+'.js');
        equal(conf.types, moduleId+'.d.ts');
        return true;
    }

    @test createConfigWithoutVersion() {
        const moduleId = 'myModuleId';
        const expectedVersion = JSON.parse(readFileSync('package.json').toString()).version;
        const conf = new PackageJSONConfig().getConfig('myModuleId');
        equal(conf.name, moduleId);
        equal(conf.version, expectedVersion);
        equal(conf.main, moduleId+'.js');
        equal(conf.types, moduleId+'.d.ts');
        return true;
    }
}