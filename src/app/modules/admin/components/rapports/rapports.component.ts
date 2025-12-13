import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { StatisticsService } from '../../../../services/statistics.service';

  import { BaseChartDirective } from 'ng2-charts';
import {ChartConfiguration, ChartOptions, ChartType} from "chart.js"; // Importez la directive
 // Utilisez
  interface FilterState {
  sexe: string;
  anneeConsultation: number;
  ageMin: number;
  ageMax: number;
}

interface StatistiquesData {
  totalConsultations: number;
  repartitionSexe: { hommes: number; femmes: number };
  moyenneAge: number;
  decesLieDrogues: number;
  modesAdministration: { mode: string; frequence: number }[];
  demandesTraitement: {
    total: number;
    parAge: { tranche: string; nombre: number }[];
    parSexe: { sexe: string; nombre: number }[];
    parRegion: { region: string; nombre: number }[];
    parProfession: { profession: string; nombre: number }[];
    parNSE: { niveau: string; nombre: number }[];
    parSituationFamiliale: { situation: string; nombre: number }[];
    parSubstance: { substance: string; nombre: number }[];
  };
}

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
      templateUrl: './rapports.component.html'
  ,

  styleUrls: ['./rapports.component.css']})
export class RapportsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  filters: FilterState = {
    sexe: 'tous',
    anneeConsultation: 0,
    ageMin: 10,
    ageMax: 100,
  };

  anneesDisponibles: number[] = [];
  isLoading = false;
  isExporting = false;
  errorMessage = '';

  stats: StatistiquesData = {
    totalConsultations: 0,
    repartitionSexe: { hommes: 0, femmes: 0 },
    moyenneAge: 0,
    decesLieDrogues: 0,
    modesAdministration: [],
    demandesTraitement: {
      total: 0,
      parAge: [],
      parSexe: [],
      parRegion: [],
      parProfession: [],
      parNSE: [],
      parSituationFamiliale: [],
      parSubstance: [],
    },
  };

  /* CHART.JS CONFIG */

  // SEXE
  sexeChartType: ChartType = 'doughnut';
  sexeChartData: ChartConfiguration['data'] = {
    labels: ['Hommes', 'Femmes'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#3b82f6', '#ec4899'],
        hoverOffset: 4,
      },
    ],
  };
  sexeChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
     plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.label || '';
            const value = ctx.parsed as number;
            return `${label}: ${value.toLocaleString('fr-FR')}`;
          },
        },
      },
    },
  };

  // AGE
  ageChartType: ChartType = 'bar';
  ageChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Demandes',
        data: [],
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      },
    ],
  };
  ageChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        ticks: { font: { size: 10 } },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  // MODE ADMIN
  modeAdminChartType: ChartType = 'bar';
  modeAdminChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Fréquence',
        data: [],
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
    ],
  };
  modeAdminChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        ticks: { font: { size: 10 } },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  // REGION (horizontal)
  regionChartType: ChartType = 'bar';
  regionChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Demandes',
        data: [],
        backgroundColor: '#6366f1',
        borderRadius: 6,
      },
    ],
  };
  regionChartOptions: ChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        ticks: { font: { size: 10 } },
      },
      y: {
        ticks: { font: { size: 10 } },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  // SUBSTANCE (horizontal)
  substanceChartType: ChartType = 'bar';
  substanceChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Demandes',
        data: [],
        backgroundColor: '#f97316',
        borderRadius: 6,
      },
    ],
  };
  substanceChartOptions: ChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        ticks: { font: { size: 10 } },
      },
      y: {
        ticks: { font: { size: 10 } },
      },
    },
    plugins: {
      legend: { display: false },
    },

  };
// PROFESSION (horizontal bar)
  professionChartType: ChartType = 'bar';
  professionChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Demandes',
        data: [],
        backgroundColor: '#8b5cf6',
        borderRadius: 6,
      },
    ],
  };
  professionChartOptions: ChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        ticks: { font: { size: 10 } },
      },
      y: {
        ticks: { font: { size: 10 } },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  // SITUATION FAMILIALE (doughnut)
  situationFamilialeChartType: ChartType = 'doughnut';
  situationFamilialeChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#06b6d4',
          '#14b8a6',
          '#10b981',
          '#84cc16',
          '#eab308',
          '#f97316',
        ],
        hoverOffset: 4,
      },
    ],
  };
  situationFamilialeChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 10 }, padding: 10 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.label || '';
            const value = ctx.parsed as number;
            return `${label}: ${value.toLocaleString('fr-FR')}`;
          },
        },
      },
    },
  };
  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.loadAnneesDisponibles();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* DATA LOADING */

  loadAnneesDisponibles(): void {
    this.statisticsService
        .getAnneesDisponibles()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (annees) => {
            this.anneesDisponibles = annees;
          },
          error: (error) => {
            console.error('Erreur lors du chargement des années:', error);
            this.anneesDisponibles = [2020, 2021, 2022, 2023, 2024, 2025];
          },
        });
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filterParams = {
      sexe: this.filters.sexe,
      anneeConsultation: this.filters.anneeConsultation,
      ageMin: this.filters.ageMin,
      ageMax: this.filters.ageMax,
    };

    this.statisticsService
        .getStatistiques(filterParams)
        .pipe(
            takeUntil(this.destroy$),
            finalize(() => (this.isLoading = false))
        )
        .subscribe({
          next: (data) => {
            this.stats = data;
            this.updateCharts();
          },
          error: (error) => {
            console.error('Erreur lors du chargement des statistiques:', error);
            this.errorMessage =
                'Impossible de charger les données. Veuillez réessayer.';
          },
        });
  }

  /* FILTRES */

  applyFilters(): void {
    this.loadData();
  }

  resetFilters(): void {
    this.filters = {
      sexe: 'tous',
      anneeConsultation: 0,
      ageMin: 10,
      ageMax: 100,
    };
    this.applyFilters();
  }

  onAgeMinChange(): void {
    if (this.filters.ageMin > this.filters.ageMax) {
      this.filters.ageMin = this.filters.ageMax;
    }
  }

  onAgeMaxChange(): void {
    if (this.filters.ageMax < this.filters.ageMin) {
      this.filters.ageMax = this.filters.ageMin;
    }
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filters.sexe !== 'tous') count++;
    if (this.filters.anneeConsultation !== 0) count++;
    if (!(this.filters.ageMin === 10 && this.filters.ageMax === 100)) count++;
    return count;
  }

  getSexeFilterLabel(): string {
    if (this.filters.sexe === 'homme') return 'Hommes';
    if (this.filters.sexe === 'femme') return 'Femmes';
    return 'Tous';
  }

  /* EXPORT */

  exportData(): void {
    this.isExporting = true;
    this.errorMessage = '';

    const filterParams = {
      sexe: this.filters.sexe,
      anneeConsultation: this.filters.anneeConsultation,
      ageMin: this.filters.ageMin,
      ageMax: this.filters.ageMax,
    };

    this.statisticsService
        .exportData(filterParams)
        .pipe(
            takeUntil(this.destroy$),
            finalize(() => (this.isExporting = false))
        )
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `statistiques_drogues_${new Date()
                .toISOString()
                .split('T')[0]}.xlsx`;
            link.click();
            window.URL.revokeObjectURL(url);
          },
          error: (error) => {
            console.error("Erreur lors de l'export:", error);
            this.errorMessage =
                "Impossible d'exporter les données. Veuillez réessayer.";
          },
        });
  }

  dismissError(): void {
    this.errorMessage = '';
  }

  /* KPIs & HELPERS */

  getSexePercentage(sexe: 'hommes' | 'femmes'): number {
    const total =
        this.stats.repartitionSexe.hommes + this.stats.repartitionSexe.femmes;
    if (total === 0) return 0;
    return (this.stats.repartitionSexe[sexe] / total) * 100;
  }

  getModePercentage(frequence: number): number {
    const total = this.stats.modesAdministration.reduce(
        (sum, mode) => sum + mode.frequence,
        0
    );
    if (total === 0) return 0;
    return (frequence / total) * 100;
  }

  getConsultationsParJour(): number {
    if (this.stats.totalConsultations === 0) return 0;
    return this.stats.totalConsultations / 365;
  }

  getTauxDeces(): number {
    if (this.stats.totalConsultations === 0) return 0;
    return (this.stats.decesLieDrogues / this.stats.totalConsultations) * 100;
  }

  getTrancheAgeDominante(): string | null {
    if (!this.stats.demandesTraitement.parAge.length) return null;
    const sorted = [...this.stats.demandesTraitement.parAge].sort(
        (a, b) => b.nombre - a.nombre
    );
    return sorted[0]?.tranche ?? null;
  }

  getSubstanceTop(): string | null {
    if (!this.stats.demandesTraitement.parSubstance.length) return null;
    const sorted = [...this.stats.demandesTraitement.parSubstance].sort(
        (a, b) => b.nombre - a.nombre
    );
    return sorted[0]?.substance ?? null;
  }

  /* UPDATE CHARTS */

  private updateCharts(): void {
    this.updateSexeChart();
    this.updateAgeChart();
    this.updateModeAdminChart();
    this.updateRegionChart();
    this.updateSubstanceChart();
    this.updateProfessionChart();
    this.updateSituationFamilialeChart();
  }
  private updateProfessionChart(): void {
    const dataProfessions = this.stats.demandesTraitement.parProfession || [];
    this.professionChartData = {
      labels: dataProfessions.map((p) => p.profession),
      datasets: [
        {
          label: 'Demandes',
          data: dataProfessions.map((p) => p.nombre),
          backgroundColor: '#8b5cf6',
          borderRadius: 6,
        },
      ],
    };
  }

  private updateSituationFamilialeChart(): void {
    const dataSituations = this.stats.demandesTraitement.parSituationFamiliale || [];
    this.situationFamilialeChartData = {
      labels: dataSituations.map((s) => s.situation),
      datasets: [
        {
          data: dataSituations.map((s) => s.nombre),
          backgroundColor: [
            '#06b6d4',
            '#14b8a6',
            '#10b981',
            '#84cc16',
            '#eab308',
            '#f97316',
          ],
          hoverOffset: 4,
        },
      ],
    };
  }
  private updateSexeChart(): void {
    const hommes = this.stats.repartitionSexe.hommes || 0;
    const femmes = this.stats.repartitionSexe.femmes || 0;
    this.sexeChartData = {
      labels: ['Hommes', 'Femmes'],
      datasets: [
        {
          data: [hommes, femmes],
          backgroundColor: ['#3b82f6', '#ec4899'],
          hoverOffset: 4,
        },
      ],
    };
  }

  private updateAgeChart(): void {
    const dataAge = this.stats.demandesTraitement.parAge || [];
    this.ageChartData = {
      labels: dataAge.map((a) => a.tranche),
      datasets: [
        {
          label: 'Demandes',
          data: dataAge.map((a) => a.nombre),
          backgroundColor: '#3b82f6',
          borderRadius: 6,
        },
      ],
    };
  }

  private updateModeAdminChart(): void {
    const dataModes = this.stats.modesAdministration || [];
    this.modeAdminChartData = {
      labels: dataModes.map((m) => m.mode),
      datasets: [
        {
          label: 'Fréquence',
          data: dataModes.map((m) => m.frequence),
          backgroundColor: '#10b981',
          borderRadius: 6,
        },
      ],
    };
  }

  private updateRegionChart(): void {
    const dataRegions = this.stats.demandesTraitement.parRegion || [];
    this.regionChartData = {
      labels: dataRegions.map((r) => r.region),
      datasets: [
        {
          label: 'Demandes',
          data: dataRegions.map((r) => r.nombre),
          backgroundColor: '#6366f1',
          borderRadius: 6,
        },
      ],
    };
  }

  private updateSubstanceChart(): void {
    const dataSubstances = this.stats.demandesTraitement.parSubstance || [];
    this.substanceChartData = {
      labels: dataSubstances.map((s) => s.substance),
      datasets: [
        {
          label: 'Demandes',
          data: dataSubstances.map((s) => s.nombre),
          backgroundColor: '#f97316',
          borderRadius: 6,
        },
      ],
    };
  }
}
