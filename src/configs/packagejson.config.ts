export class PackageJSONConfig {
    public getConfig(moduleId: string, version = '0.1.0') : any {
        return {
            "name": moduleId,
            "version": version,
            "main": moduleId+".js",
            "types": moduleId+".d.ts"
        };
    }
}