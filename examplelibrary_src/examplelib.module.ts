import { NgModule } from '@angular/core';
import { ExampleComponent } from './example.component';

/** 
 * This is an example library module used in the test suites
*/
@NgModule({
    declarations: [
        ExampleComponent
    ],
    exports: [
        ExampleComponent
    ]
})
export class ExampleLibModule {
    
}