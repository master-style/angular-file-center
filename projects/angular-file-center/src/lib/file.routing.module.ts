import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileComponent } from './file.component';
import { FileService } from './file.service';

const routes: Routes = [
    {
        path: '',
        component: FileComponent,
        canActivate: [FileService],
        children: [
            {
                path: ':id',
                loadChildren: () => import('./directory/directory.module').then(m => m.DirectoryModule)
            }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FileRoutingModule { }
