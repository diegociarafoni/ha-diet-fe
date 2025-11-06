import { Routes } from '@angular/router';
import { WeeklyView } from './pages/weekly-view/weekly-view';
import { DailyView } from './pages/daily-view/daily-view';
import { ConfigWeek } from './pages/config-week/config-week';
import { Stats } from './pages/stats/stats';
import { CommonView } from './pages/common-view/common-view';

export const routes: Routes = [
  { path: '', redirectTo: 'week', pathMatch: 'full' },
  { path: 'week', component: WeeklyView },
  { path: 'day', component: DailyView },
  { path: 'config', component: ConfigWeek },
  { path: 'stats', component: Stats },
  { path: 'common', component: CommonView },
];
