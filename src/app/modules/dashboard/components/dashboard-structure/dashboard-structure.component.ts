import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatisticsService } from '../../../../services/statistics.service';

interface FilterParams {
  sexe?: string;
  anneeConsultation?: number;
  moisConsultation?: number;
  dateDebut?: string;
  dateFin?: string;
  ageMin?: number;
  ageMax?: number;
}

@Component({
  selector: 'app-dashboard-structure',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-structure.component.html',
  styleUrls: ['./dashboard-structure.component.css']
})
export class DashboardStructureComponent implements OnInit {
  statistiques: any;
  loading = false;
  error: string | null = null;

  filters: FilterParams = {
    sexe: 'tous'
  };

  anneesDisponibles: number[] = [];
  moisOptions = [
    { value: 0, label: 'Tous' },
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];

  tranchesAge = [
    { min: 0, max: 17, label: '< 18 ans' },
    { min: 18, max: 25, label: '18-25 ans' },
    { min: 26, max: 35, label: '26-35 ans' },
    { min: 36, max: 45, label: '36-45 ans' },
    { min: 46, max: 55, label: '46-55 ans' },
    { min: 56, max: 150, label: '> 55 ans' }
  ];

  usePeriode = false;

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.loadAnneesDisponibles();
    this.loadStatistiques();
  }

  loadAnneesDisponibles(): void {
    this.statisticsService.getAnneesDisponibles().subscribe({
      next: (annees) => {
        this.anneesDisponibles = annees;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des années:', error);
      }
    });
  }

  loadStatistiques(): void {
    this.loading = true;
    this.error = null;

    this.statisticsService.getStatistiquesStructure(this.filters).subscribe({
      next: (data) => {
        this.statistiques = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.error = 'Erreur lors du chargement des statistiques';
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadStatistiques();
  }

  resetFilters(): void {
    this.filters = {
      sexe: 'tous'
    };
    this.usePeriode = false;
    this.loadStatistiques();
  }

  selectTrancheAge(tranche: any): void {
    this.filters.ageMin = tranche.min;
    this.filters.ageMax = tranche.max;
    this.onFilterChange();
  }

  exportData(): void {
    this.statisticsService.exportData(this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statistiques_structure_${new Date().toISOString()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Erreur lors de l\'export:', error);
        this.error = 'Erreur lors de l\'export des données';
      }
    });
  }
}
