import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DirectoryComponent } from './directory.component';

const routes: Routes = [
	{
		path: '',
		component: DirectoryComponent,
		children: [
			{
				path: ':id',
				loadChildren: () => {
                    const a = 2 + 1;
                    return import('./directory.module').then(m => m.DirectoryModule);
                }
			}
		]
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DirectoryRoutingModule { }
