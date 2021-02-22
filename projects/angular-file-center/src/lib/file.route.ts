import { Route } from '@angular/router';
import { FileComponent } from './file.component';
import { FileService } from './file.service';

export const fileRoute: Route = {
    path: 'file',
    component: FileComponent,
    canDeactivate: [FileService],
    children: [
        {
            path: ':id',
            loadChildren: () => import('./directory/directory.module').then(m => m.DirectoryModule)
        }
    ]
};