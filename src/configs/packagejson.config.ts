export class PackageJSONConfig {
    public getConfig(moduleId: string) : any {
        return {
            "name": moduleId,
            "version": "0.1.0",
            "main": moduleId+".js",
            "types": moduleId+".d.ts"
        };
    }
}