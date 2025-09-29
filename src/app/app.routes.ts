import { Routes } from '@angular/router';
import { Login } from './authentication/pages/login/login';
import { Layout } from './shared/layout/layout';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard-module').then((m) => m.DashboardModule),
      },
      {
        path: 'projects',
        loadChildren: () => import('./projects/projects-module').then((m) => m.ProjectsModule),
      },
      {
        path: 'reports',
        loadChildren: () => import('./reports/reports-module').then((m) => m.ReportsModule),
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users-module').then((m) => m.UsersModule),
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings-module').then((m) => m.SettingsModule),
      },
      {
        path: 'deliveryunits',
        loadChildren: () =>
          import('./deliveryunits/deliveryunits-module').then((m) => m.DeliveryunitsModule),
      },
      {
        path: 'roles',
        loadChildren: () => import('./roles/roles-module').then((m) => m.RolesModule),
      },
    ],
  },
];
