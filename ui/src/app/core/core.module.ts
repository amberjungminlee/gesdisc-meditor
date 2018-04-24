import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
// CONTAINERS
import { MainComponent } from './containers/main';
import { NotFoundPageComponent } from './containers/not-found-page';
import { SplashPageContainer } from './containers/splash-page/splash-page.container';
// COMPONENTS
import { ContentTypeButtonComponent } from './components/content-type-button/content-type-button.component';
import { LayoutComponent } from './components/layout';
import { MaterialModule } from '../material';
import { NavItemComponent } from './components/nav-item';
import { SidenavComponent } from './components/sidenav';
import { SplashBoxComponent } from './components/splash-box/splash-box.component';
import { ToolbarComponent } from './components/toolbar';

import { EffectsModule } from '@ngrx/effects';
import { ContentTypesEffects } from './effects/content-types';

import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { AuthModule } from '../auth/auth.module';

export const COMPONENTS = [
  ContentTypeButtonComponent,
  LayoutComponent,
  MainComponent,
  NotFoundPageComponent,
  SplashBoxComponent,
  SplashPageContainer,
  NavItemComponent,
  SidenavComponent,
  ToolbarComponent,
];

@NgModule({
  imports: [
  	CommonModule,
  	RouterModule,
  	MaterialModule,
  	FlexLayoutModule,
  	AngularFontAwesomeModule,
  	AuthModule.forRoot(),
  	EffectsModule.forFeature([ContentTypesEffects]),
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS
})

export class CoreModule {
  static forRoot() {
    return {
      ngModule: CoreModule
    };
  }
}
