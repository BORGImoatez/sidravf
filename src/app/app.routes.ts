import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import {
  DashboardNationalComponent
} from "./modules/dashboard/components/dashboard-national/dashboard-national.component";

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'otp',
    loadComponent: () => import('./components/otp/otp.component').then(m => m.OtpComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboardNational',
        loadComponent: () => import('./modules/dashboard/components/dashboard-national/dashboard-national.component').then(m => m.DashboardNationalComponent)
      },
      {
        path: 'dashboardStrucutre',
        loadComponent: () => import('./modules/dashboard/components/dashboard-structure/dashboard-structure.component').then(m => m.DashboardStructureComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'formulaire',
        loadChildren: () => import('./modules/formulaire/formulaire.routes').then(m => m.routes)
      },
      {
        path: 'mes-formulaires',
        loadChildren: () => import('./modules/mes-formulaires/mes-formulaires.routes').then(m => m.routes)
      },
      {
        path: 'patient-access',
        loadChildren: () => import('./modules/patient-access/patient-access.routes').then(m => m.routes)
      },
      {
        path: 'offre-drogues',
        loadChildren: () => import('./modules/offre-drogues/offre-drogues.routes').then(m => m.routes)
      },
      {
        path: 'structures-consultation',
        loadChildren: () => import('./modules/structures-consultation/structures-consultation.routes').then(m => m.routes)
      },
      {
        path: 'admin',
        canActivate: [AdminGuard],
        loadChildren: () => import('./modules/admin/admin.routes').then(m => m.routes)
      },
      {
        path: 'aide',
        loadChildren: () => import('./modules/aide/aide.routes').then(m => m.routes)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
