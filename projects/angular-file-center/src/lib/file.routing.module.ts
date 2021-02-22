import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileComponent } from './file.component';
import { FileService } from './file.service';

export const routes: Routes = [{
    path: 'file',
    component: FileComponent,
    canDeactivate: [FileService],
    children: [
        {
            path: ':id',
            loadChildren: () => import('./directory/directory.module').then(m => m.DirectoryModule)
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FileRoutingModule { }
