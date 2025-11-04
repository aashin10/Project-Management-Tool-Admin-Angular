import { Routes } from '@angular/router';
import { Login } from './authentication/pages/login/login';
import { Layout } from './shared/layout/layout';
import { NotFound } from './shared/components/not-found/not-found';
import { AuthGuard } from './shared/services/authenticationservice/auth.guard';
import { LoginRedirectGuard } from './shared/services/authenticationservice/login-redirect.guard';

export const routes: Routes = [
  // Login route (outside layout)
  { 
    path: 'login', 
    component: Login,
    canActivate: [LoginRedirectGuard]
  },
  
  // All authenticated routes wrapped inside the layout
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard],
    children: [
      // Default redirect to projects
      {
        path: '',
        redirectTo: 'projects',
        pathMatch: 'full'
      },
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
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./deliveryunits/deliveryunits-module').then((m) => m.DeliveryunitsModule),
      },
      {
        path: 'roles',
        canActivate: [AuthGuard],
        loadChildren: () => import('./roles/roles-module').then((m) => m.RolesModule),
      },
    ],
  },

  // Wildcard route for 404 - must be last
  {
    path: '**',
    component: NotFound
  },
];