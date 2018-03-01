import { readFileSync } from 'fs';

export class PackageJSONConfig {
    public getConfig(moduleId: string, version?: string) : any {        
        if(!version) {
            try {                
                version = JSON.parse(readFileSync('package.json').toString()).version;
            } catch (e) {                
                version = '0.1.0';
                console.log(`Defaulting to version {{version}} since no version were provided, and couldn't find version in package.json of your project`);
            }
        }
        return {
            "name": moduleId,
            "version": version,
            "main": moduleId+".js",
            "types": moduleId+".d.ts"
        };
    }
}