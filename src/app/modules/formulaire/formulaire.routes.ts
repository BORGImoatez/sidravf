import { Routes } from '@angular/router';
import {ListeDemandesComponent} from "./components/liste-demandes/liste-demandes.component";

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/formulaire/formulaire.component').then(m => m.FormulaireComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/formulaire/formulaire.component').then(m => m.FormulaireComponent)
  },
  {
    path: 'demande/new',
    loadComponent: () => import('./components/demande-form/demande-form.component').then(m => m.DemandeFormComponent)
  },
  { path: 'listDemandes', component: ListeDemandesComponent },
  {
    path: 'demande/:id',
    loadComponent: () => import('./components/demande-form/demande-form.component').then(m => m.DemandeFormComponent)
  }
];
