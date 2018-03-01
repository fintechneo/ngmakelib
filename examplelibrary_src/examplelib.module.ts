import { NgModule } from '@angular/core';
import { ExampleComponent } from './example.component';

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