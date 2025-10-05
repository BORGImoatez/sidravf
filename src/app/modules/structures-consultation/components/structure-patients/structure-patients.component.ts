import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientService } from '../../../../services/patient.service';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { UserRole } from '../../../../models/user.model';

@Component({
  selector: 'app-structure-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="structure-patients-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Patients de la structure</h1>
          <p class="page-description" *ngIf="structure">
            {{ structure.nom }} - {{ structure.type }}
          </p>
        </div>
        <button
            class="btn btn-secondary"
            routerLink="/structures-consultation"
            type="button"
        >
          ← Retour aux structures
        </button>
      </div>

      <!-- Informations structure -->
      <div class="structure-info-card card" *ngIf="structure">
        <div class="card-header">
          <h3 class="section-title">Informations de la structure</h3>
        </div>
        <div class="card-body">
          <div class="structure-info-grid">
            <div class="info-item">
              <span class="info-label">Nom</span>
              <span class="info-value">{{ structure.nom }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Type</span>
              <span class="info-value">{{ getTypeLabel(structure.type) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Gouvernorat</span>
              <span class="info-value">{{ structure.gouvernorat?.nom }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Secteur</span>
              <span class="info-value">{{ structure.secteur }}</span>
            </div>
            <div class="info-item" *ngIf="structure.telephone">
              <span class="info-label">Téléphone</span>
              <span class="info-value">{{ structure.telephone }}</span>
            </div>
            <div class="info-item" *ngIf="structure.adresse">
              <span class="info-label">Adresse</span>
              <span class="info-value">{{ structure.adresse }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recherche -->
      <div class="search-section card">
        <div class="card-body">
          <div class="search-box">
            <label class="form-label">Rechercher un patient</label>
            <input
                type="text"
                class="form-input"
                placeholder="Code patient..."
                [(ngModel)]="searchTerm"
                (input)="searchPatients()"
            >
          </div>
        </div>
      </div>

      <!-- Liste des patients -->
      <div class="patients-table-container card" *ngIf="!isLoading && patients.length > 0; else noPatients">
        <div class="card-header">
          <h3 class="card-title">
            Patients ({{ patients.length }})
          </h3>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="patients-table">
              <thead>
              <tr>
                <th>Code patient</th>
                <th>Genre</th>
                <th>Date de naissance</th>
                <th>Nombre de formulaires</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              <tr *ngFor="let patient of patients" class="patient-row">
                <td>
                  <div class="patient-code">{{ patient.codePatient }}</div>
                </td>
                <td>
                  <div class="patient-genre">{{ patient.genre === 'HOMME' ? 'H' : 'F' }}</div>
                </td>
                <td>
                  <div class="patient-birth">
                    {{ patient.dateNaissance | date:'dd/MM/yyyy' }}
                    <div class="patient-age">({{ calculateAge(patient.dateNaissance) }} ans)</div>
                  </div>
                </td>
                <td>
                  <div class="formulaires-count">{{ patient.nombreFormulaires || 0 }}</div>
                </td>
                <td>
                  <div class="actions-menu">
                    <button
                        class="btn btn-sm btn-secondary"
                        [routerLink]="['/structures-consultation/structure', structureId, 'patient', patient.id, 'formulaires']"
                        type="button"
                        title="Voir les formulaires"
                    >
                      📋 Formulaires
                    </button>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <ng-template #noPatients>
      <div class="no-results card" *ngIf="!isLoading">
        <div class="card-body text-center">
          <div class="no-results-icon">👥</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">
            Aucun patient trouvé
          </h3>
          <p class="text-gray-600 mb-6">
            Cette structure n'a pas encore de patients enregistrés ou aucun patient ne correspond à votre recherche.
          </p>
        </div>
      </div>
    </ng-template>

    <ng-template #loadingTemplate>
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Chargement des données...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .structure-patients-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-6);
      gap: var(--spacing-4);
    }

    .header-content {
      flex: 1;
    }

    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--gray-900);
      margin: 0 0 var(--spacing-2) 0;
    }

    .page-description {
      color: var(--gray-600);
      font-size: 16px;
      margin: 0;
    }

    .structure-info-card,
    .search-section {
      margin-bottom: var(--spacing-6);
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
    }

    .structure-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-4);
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .info-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--gray-600);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--gray-900);
    }

    .search-box {
      max-width: 400px;
    }

    .patients-table-container {
      margin-bottom: var(--spacing-6);
    }

    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .patients-table {
      width: 100%;
      border-collapse: collapse;
    }

    .patients-table th {
      background-color: var(--gray-50);
      padding: var(--spacing-4);
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      color: var(--gray-700);
      border-bottom: 1px solid var(--gray-200);
    }

    .patients-table td {
      padding: var(--spacing-4);
      border-bottom: 1px solid var(--gray-100);
      vertical-align: middle;
    }

    .patient-row:hover {
      background-color: var(--gray-50);
    }

    .patient-code {
      font-family: monospace;
      font-weight: 500;
      color: var(--primary-700);
      background-color: var(--primary-50);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radius-sm);
      display: inline-block;
    }

    .patient-genre {
      font-weight: 600;
      color: var(--gray-900);
    }

    .patient-birth {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .patient-age {
      font-size: 12px;
      color: var(--gray-600);
    }

    .formulaires-count {
      font-weight: 600;
      color: var(--gray-900);
      text-align: center;
    }

    .actions-menu {
      display: flex;
      gap: var(--spacing-2);
    }

    .type-badge {
      display: inline-block;
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .type-badge.publique {
      background-color: var(--primary-100);
      color: var(--primary-700);
    }

    .type-badge.privee {
      background-color: var(--error-100);
      color: var(--error-700);
    }

    .type-badge.ong {
      background-color: var(--success-100);
      color: var(--success-700);
    }

    .no-results {
      max-width: 600px;
      margin: 0 auto;
    }

    .no-results-icon {
      font-size: 64px;
      margin-bottom: var(--spacing-6);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-12);
      gap: var(--spacing-4);
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .structure-info-grid {
        grid-template-columns: 1fr;
      }

      .patients-table {
        font-size: 14px;
      }

      .patients-table th,
      .patients-table td {
        padding: var(--spacing-3);
      }
    }
  `]
})
export class StructurePatientsComponent implements OnInit {
  structureId: number = 0;
  structure: any = null;
  patients: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private patientService: PatientService,
      private userService: UserService,
      private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.structureId = +params['id'];
      if (this.structureId) {
        this.loadStructure();
        this.loadPatients();
      } else {
        this.router.navigate(['/structures-consultation']);
      }
    });
  }

  private loadStructure(): void {
    this.userService.getStructures().subscribe({
      next: (structures) => {
        this.structure = structures.find(s => s.id === this.structureId);
        if (!this.structure) {
          this.router.navigate(['/structures-consultation']);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la structure:', error);
        this.router.navigate(['/structures-consultation']);
      }
    });
  }

  private loadPatients(): void {
    this.isLoading = true;

    // Simuler l'appel API pour récupérer les patients d'une structure
    // TODO: Créer un endpoint spécifique pour récupérer les patients par structure
    this.patientService.getAllPatients().subscribe({
      next: (data) => {
        // Filtrer les patients par structure (côté client pour l'instant)
        this.patients = data.filter(p => p.structure?.id === this.structureId);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des patients:', error);
        this.isLoading = false;
      }
    });
  }

  searchPatients(): void {
    if (!this.searchTerm || this.searchTerm.trim().length === 0) {
      this.loadPatients();
      return;
    }

    this.isLoading = true;

    this.patientService.getAllPatients(this.searchTerm).subscribe({
      next: (data) => {
        // Filtrer les patients par structure
        this.patients = data.filter(p => p.structure?.id === this.structureId);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la recherche des patients:', error);
        this.isLoading = false;
      }
    });
  }

  calculateAge(dateNaissance: string): number {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'PUBLIQUE':
        return 'Publique';
      case 'PRIVEE':
        return 'Privée';
      case 'ONG':
        return 'ONG';
      default:
        return type;
    }
  }
}