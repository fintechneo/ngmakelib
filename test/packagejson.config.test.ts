import { suite, test, slow, timeout } from 'mocha-typescript';
import { PackageJSONConfig } from '../src/configs/packagejson.config';
import { equal } from 'assert';

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
}