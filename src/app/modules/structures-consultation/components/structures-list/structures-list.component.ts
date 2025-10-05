import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { Structure, Gouvernorat, UserRole } from '../../../../models/user.model';

@Component({
  selector: 'app-structures-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="structures-list-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Consultation par structure</h1>
          <p class="page-description">
            Consulter les données des patients par structure
          </p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-section card">
        <div class="card-body">
          <div class="filters-grid">
            <div class="filter-group">
              <label class="form-label">Rechercher</label>
              <input
                  type="text"
                  class="form-input"
                  placeholder="Nom de la structure..."
                  [(ngModel)]="searchTerm"
                  (input)="filterStructures()"
              >
            </div>

            <div class="filter-group">
              <label class="form-label">Type</label>
              <select class="form-select" [(ngModel)]="selectedType" (change)="filterStructures()">
                <option value="">Tous les types</option>
                <option value="PUBLIQUE">Publique</option>
                <option value="PRIVEE">Privée</option>
                <option value="ONG">ONG</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="form-label">Gouvernorat</label>
              <select class="form-select" [(ngModel)]="selectedGouvernoratId" (change)="filterStructures()">
                <option value="">Tous les gouvernorats</option>
                <option *ngFor="let gouvernorat of gouvernorats" [value]="gouvernorat.id">
                  {{ gouvernorat.nom }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des structures -->
      <div class="structures-table-container card">
        <div class="card-header">
          <h3 class="card-title">
            Structures ({{ filteredStructures.length }})
          </h3>
        </div>

        <div class="card-body p-0" *ngIf="!isLoading; else loadingTemplate">
          <div class="table-responsive">
            <table class="structures-table">
              <thead>
              <tr>
                <th>Structure</th>
                <th>Type</th>
                <th>Gouvernorat</th>
                <th>Secteur</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              <tr *ngFor="let structure of filteredStructures" class="structure-row">
                <td>
                  <div class="structure-info">
                    <div class="structure-name">{{ structure.nom }}</div>
                    <div class="structure-contact" *ngIf="structure.telephone">
                      📞 {{ structure.telephone }}
                    </div>
                    <div class="structure-address" *ngIf="structure.adresse">
                      📍 {{ structure.adresse }}
                    </div>
                  </div>
                </td>
                <td>
                    <span class="type-badge" [class]="getTypeClass(structure.type)">
                      {{ getTypeLabel(structure.type) }}
                    </span>
                </td>
                <td>
                  <div class="gouvernorat-info">
                    {{ structure.gouvernorat?.nom }}
                  </div>
                </td>
                <td>
                  <div class="secteur-info">
                    {{ structure.secteur }}
                  </div>
                </td>
                <td>
                  <div class="actions-menu">
                    <button
                        class="btn btn-sm btn-primary"
                        [routerLink]="['/structures-consultation/structure', structure.id, 'patients']"
                        type="button"
                        title="Voir les patients"
                    >
                      👥 Patients
                    </button>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Message si aucune structure trouvée -->
      <div class="no-results card" *ngIf="!isLoading && filteredStructures.length === 0">
        <div class="card-body text-center">
          <div class="no-results-icon">🔍</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">
            Aucune structure trouvée
          </h3>
          <p class="text-gray-600 mb-6">
            Aucune structure ne correspond à vos critères de recherche.
          </p>
        </div>
      </div>
    </div>

    <ng-template #loadingTemplate>
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Chargement des structures...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .structures-list-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: var(--spacing-6);
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

    .filters-section {
      margin-bottom: var(--spacing-6);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-4);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .structures-table-container {
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

    .structures-table {
      width: 100%;
      border-collapse: collapse;
    }

    .structures-table th {
      background-color: var(--gray-50);
      padding: var(--spacing-4);
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      color: var(--gray-700);
      border-bottom: 1px solid var(--gray-200);
    }

    .structures-table td {
      padding: var(--spacing-4);
      border-bottom: 1px solid var(--gray-100);
      vertical-align: middle;
    }

    .structure-row:hover {
      background-color: var(--gray-50);
    }

    .structure-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .structure-name {
      font-weight: 600;
      color: var(--gray-900);
    }

    .structure-contact,
    .structure-address {
      font-size: 12px;
      color: var(--gray-600);
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

    .gouvernorat-info,
    .secteur-info {
      font-size: 14px;
      color: var(--gray-900);
    }

    .actions-menu {
      display: flex;
      gap: var(--spacing-2);
    }

    .actions-menu .btn {
      padding: var(--spacing-2) var(--spacing-3);
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
      .filters-grid {
        grid-template-columns: 1fr;
      }

      .structures-table {
        font-size: 14px;
      }

      .structures-table th,
      .structures-table td {
        padding: var(--spacing-3);
      }
    }
  `]
})
export class StructuresListComponent implements OnInit {
  structures: Structure[] = [];
  filteredStructures: Structure[] = [];
  gouvernorats: Gouvernorat[] = [];

  // Filtres
  searchTerm = '';
  selectedType = '';
  selectedGouvernoratId = '';

  // États
  isLoading = false;

  constructor(
      private userService: UserService,
      private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStructures();
    this.loadGouvernorats();
  }

  private loadStructures(): void {
    this.isLoading = true;

    this.userService.getStructures().subscribe({
      next: (structures) => {
        this.structures = structures.filter(s => s.actif);
        this.filterStructures();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des structures:', error);
        this.isLoading = false;
      }
    });
  }

  private loadGouvernorats(): void {
    this.userService.getGouvernorats().subscribe({
      next: (gouvernorats) => {
        this.gouvernorats = gouvernorats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des gouvernorats:', error);
      }
    });
  }

  filterStructures(): void {
    this.filteredStructures = this.structures.filter(structure => {
      const matchesSearch = !this.searchTerm ||
          structure.nom.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesType = !this.selectedType || structure.type === this.selectedType;

      const matchesGouvernorat = !this.selectedGouvernoratId ||
          structure.gouvernorat?.id?.toString() === this.selectedGouvernoratId;

      return matchesSearch && matchesType && matchesGouvernorat;
    });
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

  getTypeClass(type: string): string {
    switch (type) {
      case 'PUBLIQUE':
        return 'publique';
      case 'PRIVEE':
        return 'privee';
      case 'ONG':
        return 'ong';
      default:
        return '';
    }
  }
}