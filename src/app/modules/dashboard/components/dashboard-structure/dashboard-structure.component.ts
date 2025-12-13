import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatisticsService } from '../../../../services/statistics.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

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
  imports: [CommonModule, FormsModule, BaseChartDirective],
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

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  public pieChartType = 'pie' as const;
  public barChartType = 'bar' as const;

  public sexeChartData: ChartConfiguration<'pie'>['data'] | null = null;
  public ageChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public substancesChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public professionChartData: ChartConfiguration<'pie'>['data'] | null = null;
  public modesAdministrationChartData: ChartConfiguration<'pie'>['data'] | null = null;
  public testDepistageChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public modalitesChartData: ChartConfiguration<'bar'>['data'] | null = null;

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
        this.buildCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.error = 'Erreur lors du chargement des statistiques';
        this.loading = false;
      }
    });
  }

  buildCharts(): void {
    if (!this.statistiques) return;

    if (this.statistiques.repartitionSexe) {
      this.sexeChartData = {
        labels: ['Hommes', 'Femmes'],
        datasets: [{
          data: [
            this.statistiques.repartitionSexe.hommes || 0,
            this.statistiques.repartitionSexe.femmes || 0
          ],
          backgroundColor: ['#3498db', '#e74c3c'],
          hoverBackgroundColor: ['#2980b9', '#c0392b']
        }]
      };
    }

    if (this.statistiques.demandesTraitement?.parAge) {
      this.ageChartData = {
        labels: this.statistiques.demandesTraitement.parAge.map((item: any) => item.tranche),
        datasets: [{
          label: 'Nombre de demandes',
          data: this.statistiques.demandesTraitement.parAge.map((item: any) => item.nombre),
          backgroundColor: '#3498db',
          hoverBackgroundColor: '#2980b9'
        }]
      };
    }

    if (this.statistiques.spaPersonnelle?.topSpaConsommees) {
      this.substancesChartData = {
        labels: this.statistiques.spaPersonnelle.topSpaConsommees.map((item: any) => item.type),
        datasets: [{
          label: 'Nombre de consommateurs',
          data: this.statistiques.spaPersonnelle.topSpaConsommees.map((item: any) => item.nombre),
          backgroundColor: '#27ae60',
          hoverBackgroundColor: '#229954'
        }]
      };
    }

    if (this.statistiques.demandesTraitement?.parProfession) {
      const topProfessions = this.statistiques.demandesTraitement.parProfession.slice(0, 8);
      this.professionChartData = {
        labels: topProfessions.map((item: any) => item.profession),
        datasets: [{
          data: topProfessions.map((item: any) => item.nombre),
          backgroundColor: [
            '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
            '#1abc9c', '#34495e', '#e67e22', '#95a5a6'
          ]
        }]
      };
    }

    if (this.statistiques.modesAdministration) {
      this.modesAdministrationChartData = {
        labels: this.statistiques.modesAdministration.map((item: any) => item.mode),
        datasets: [{
          data: this.statistiques.modesAdministration.map((item: any) => item.frequence),
          backgroundColor: [
            '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#1abc9c'
          ]
        }]
      };
    }

    if (this.statistiques.comportementsEtTests?.testsDepistage) {
      const tests = this.statistiques.comportementsEtTests.testsDepistage;
      this.testDepistageChartData = {
        labels: ['VIH', 'VHC', 'VHB', 'Syphilis'],
        datasets: [{
          label: 'Nombre de tests',
          data: [
            tests.nombreTestsVih || 0,
            tests.nombreTestsVhc || 0,
            tests.nombreTestsVhb || 0,
            tests.nombreTestsSyphilis || 0
          ],
          backgroundColor: '#e67e22',
          hoverBackgroundColor: '#d35400'
        }]
      };
    }

    if (this.statistiques.conduiteTherapeutique?.parModalitePriseEnCharge) {
      this.modalitesChartData = {
        labels: this.statistiques.conduiteTherapeutique.parModalitePriseEnCharge.map((item: any) => item.modalite),
        datasets: [{
          label: 'Nombre de patients',
          data: this.statistiques.conduiteTherapeutique.parModalitePriseEnCharge.map((item: any) => item.nombre),
          backgroundColor: '#1abc9c',
          hoverBackgroundColor: '#16a085'
        }]
      };
    }
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
