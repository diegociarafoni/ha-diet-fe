import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { AppComponent } from './app.component';
import { WeeklyView } from './pages/weekly-view/weekly-view';
import { DailyView } from './pages/daily-view/daily-view';
import { ConfigWeek } from './pages/config-week/config-week';
import { Stats } from './pages/stats/stats';
import { CommonView } from './pages/common-view/common-view';

const routes: Routes = [
  { path: '', redirectTo: 'week', pathMatch: 'full' },
  { path: 'week', component: WeeklyView },
  { path: 'day', component: DailyView },
  { path: 'config', component: ConfigWeek },
  { path: 'stats', component: Stats },
  { path: 'common', component: CommonView }
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    MatToolbarModule,
    MatButtonModule,
    AppComponent
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
