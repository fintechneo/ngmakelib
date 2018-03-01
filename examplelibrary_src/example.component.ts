import { Component } from '@angular/core';

@Component({
    templateUrl: 'example.component.html',
    selector: 'ngmakelib-example-component'
})
export class ExampleComponent {
    title: string;

    constructor() {
        this.title = 'Hello';    
    }
}