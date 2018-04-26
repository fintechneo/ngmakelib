import { readFileSync } from 'fs';

export class PackageJSONConfig {
    public getConfig(moduleId: string, version?: string) : any {   
        const packageJSON = JSON.parse(readFileSync('package.json').toString());     
        if(!packageJSON.version && !version) {
            packageJSON.version = '0.1.0';
            console.log(`Defaulting to version {{version}} since no version were provided, and couldn't find version in package.json of your project`);
        }
        if(version) {
            packageJSON.version = version;
        }
        Object.assign(packageJSON, {
            "name": moduleId,
            "main": moduleId+".js",
            "types": moduleId+".d.ts"
        });
        delete packageJSON.scripts;
        return packageJSON;
    }
}