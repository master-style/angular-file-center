import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileComponent } from './file.component';
import { FileService } from './file.service';

export const routes: Routes = [
    {
        path: '',
        component: FileComponent,
        canDeactivate: [FileService],
        children: [
            {
                path: ':id',
                loadChildren: () => import('./directory/directory.module').then(m => m.DirectoryModule)
            }
        ]
    }
];