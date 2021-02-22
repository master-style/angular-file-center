import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FileModule } from 'projects/angular-file-center/src/lib/file.module';
import { AppComponent } from './app.component';
import { RoutingModule } from './app.routing.module';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        FileModule.forRoot(),
        RoutingModule
    ],
    bootstrap: [AppComponent],
    schemas: []
})
export class AppModule { }
