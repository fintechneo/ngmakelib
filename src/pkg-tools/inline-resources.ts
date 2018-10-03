import {dirname, join} from 'path';
import {readFileSync, writeFileSync, readFile, writeFile } from 'fs';
import {sync as glob} from 'glob';
import { renderSync } from 'node-sass';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

export const resourceSourceFileRefs: {[tsfile: string] : {[resourcefile: string]: boolean }} = {};

/** Finds all JavaScript files in a directory and inlines all resources of Angular components. */
export function inlineResourcesForDirectory(folderPath: string) {
  glob(join(folderPath, '**/*.ts')).forEach(filePath => inlineResources(filePath));
}

/** Inlines the external resources of Angular components of a file. */
export function inlineResources(filePath: string) {
    console.log("Inlining resources",filePath);
  let fileContent = readFileSync(filePath, 'utf-8');

  fileContent = inlineTemplate(fileContent, filePath);
  fileContent = inlineStyles(fileContent, filePath);
  fileContent = removeModuleId(fileContent);

  writeFileSync(filePath, fileContent, 'utf-8');
}

/** Inlines the external resources of Angular components of a file. */
export function inlineResourcesAsync(filePath: string): Observable<string> {
  return new Observable(observer => {
    readFile(filePath, 'utf-8', (err, fileContent) => {
      fileContent = inlineTemplate(fileContent, filePath);
      fileContent = inlineStyles(fileContent, filePath);
      fileContent = removeModuleId(fileContent);

      writeFile(filePath, fileContent, {encoding: 'utf-8'}, () => {
        console.log('Inlined resources', filePath);
        // console.log(fileContent);
        observer.next(fileContent);
      });
    })
  });
}

/** Inlines the templates of Angular components for a specified source file. */
function inlineTemplate(fileContent: string, filePath: string) {  
  
  return fileContent.replace(/templateUrl:\s*["']([^']+?\.html)["']/g, (_match, templateUrl) => {      
    const templatePath = join(dirname(filePath), templateUrl);
    const templateContent = loadResourceFile(templatePath);
    addResourceSourceFileRef(filePath, templatePath);  
    return `template: "${templateContent}"`;
  });
}

function addResourceSourceFileRef(tsfile, resourcefile) {
  if(!resourceSourceFileRefs[resourcefile]) {
    resourceSourceFileRefs[resourcefile] = {};
  }
  resourceSourceFileRefs[resourcefile][tsfile] = true;
}

export function getAffectedTypeScriptSourceFilesForResource(resourcefile: string): string[] {
  if(!resourceSourceFileRefs[resourcefile]) {
    return [];
  } else {
    return Object.keys(resourceSourceFileRefs[resourcefile]);
  }
}

export function inlineResource(resourcefile): Observable<any> {
  const ret = [];
  Object.keys(resourceSourceFileRefs[resourcefile]).forEach(r =>
    ret.push(inlineResourcesAsync(r))
  );

  
  if(ret.length>0) {
    return ret.reduce((p, c) => p.pipe(mergeMap(() => c), ret[0]));
  } else {
    return of(true);
  }
}

/** Inlines the external styles of Angular components for a specified source file. */
function inlineStyles(fileContent: string, filePath: string) {
  return fileContent.replace(/styleUrls:\s*(\[[\s\S]*?])/gm, (_match, styleUrlsValue) => {
    // The RegExp matches the array of external style files. This is a string right now and
    // can to be parsed using the `eval` method. The value looks like "['AAA.css', 'BBB.css']"
    const styleUrls = eval(styleUrlsValue) as string[];

    const styleContents = styleUrls
      .map(url => join(dirname(filePath), url))
      .map(path => {        
        addResourceSourceFileRef(filePath, path);
        if(path.endsWith(".scss")) {   
          const rendered = renderSync({
            file: path
          });          
          return rendered.css.toString()
                    .replace(/([\n\r]\s*)+/gm, ' ')
                    .replace(/"/g, '\\"');;          
        }  else {          
          return loadResourceFile(path);
        }               
      });

    return `styles: ["${styleContents.join(' ')}"]`;
  });
}

/** Remove every mention of `moduleId: module.id` */
function removeModuleId(fileContent: string) {
  return fileContent.replace(/\s*moduleId:\s*module\.id\s*,?\s*/gm, '');
}

/** Loads the specified resource file and drops line-breaks of the content. */
function loadResourceFile(filePath: string): string {
  console.log("Inlining resource",filePath);
  return readFileSync(filePath, 'utf-8')
    .replace(/([\n\r]\s*)+/gm, ' ')
    .replace(/"/g, '\\"');
}
