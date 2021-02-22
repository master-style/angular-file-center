import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { fileRoute } from 'projects/angular-file-center/src/public-api';

const routes: Routes = [
    fileRoute
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })
    ],
    exports: [RouterModule]
})
export class RoutingModule { }
