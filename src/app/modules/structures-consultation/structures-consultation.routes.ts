import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/structures-list/structures-list.component').then(m => m.StructuresListComponent)
  },
  {
    path: 'structure/:id/patients',
    loadComponent: () => import('./components/structure-patients/structure-patients.component').then(m => m.StructurePatientsComponent)
  },
  {
    path: 'structure/:structureId/patient/:patientId/formulaires',
    loadComponent: () => import('./components/patient-formulaires-consultation/patient-formulaires-consultation.component').then(m => m.PatientFormulairesConsultationComponent)
  }
];