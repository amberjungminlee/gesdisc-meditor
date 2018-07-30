import { Routes } from '@angular/router';
import { AuthGuard } from './auth/services/auth-guard.service';
import { NotFoundPageComponent } from './core/containers/not-found-page';
import { SplashPageComponent } from './core/containers/splash-page/splash-page.component';
import { ModelsExistsGuard } from './store/guards/models-exists.guard';

export const routes: Routes = [
	{
		path: '',
		component: SplashPageComponent,
		// canActivate: [AuthGuard],
	},
	{
		path: 'search',
		loadChildren: './search/search.module#SearchModule',
		canActivate: [ ModelsExistsGuard ]
	},
	{
		path: 'document',
		loadChildren: './document/document.module#DocumentModule',
		canActivate: [ ModelsExistsGuard ]
	},
		{ path: '**', component: NotFoundPageComponent },
	];
