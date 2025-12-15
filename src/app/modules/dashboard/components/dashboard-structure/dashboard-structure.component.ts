import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatisticsService } from '../../../../services/statistics.service';
import { MarketStatisticsService } from '../../../../services/market-statistics.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import {Gouvernorat} from "../../../../models/user.model";
import {UserService} from "../../../../services/user.service";

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
  statistiquesMarche: any;
  loading = false;
  error: string | null = null;
  showFilters = true;

  filters: FilterParams = {
    sexe: 'tous'
  };

  // Enhanced Chart Options
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8
      }
    }
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 11 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11 }
        }
      }
    }
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8
      }
    },
    cutout: '65%'
  };

  public pieChartType = 'pie' as const;
  public barChartType = 'bar' as const;
  public lineChartType = 'line' as const;
  public doughnutChartType = 'doughnut' as const;

  // Chart Data
  public sexeChartData: ChartConfiguration<'doughnut'>['data'] | null = null;
  public ageChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public substancesChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public regionChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public professionChartData: ChartConfiguration<'doughnut'>['data'] | null = null;
  public modesAdministrationChartData: ChartConfiguration<'pie'>['data'] | null = null;
  public testDepistageChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public modalitesChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public secteurChartData: ChartConfiguration<'doughnut'>['data'] | null = null;
  public nationaliteChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public niveauScolaireChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public typesAlcoolChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public spaEntourageChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public associationsSpaChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public substancesPrincipalesChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public autresAddictionsChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public testDepistageDetailChartData: ChartConfiguration<'bar'>['data'] | null = null;

  // New charts for remaining indicators
  public tabacChartData: ChartConfiguration<'line'>['data'] | null = null;
  public alcoolChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public comorbiditeChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public consultationsChartData: ChartConfiguration<'line'>['data'] | null = null;
  public demandesTraitementSexeChartData: ChartConfiguration<'doughnut'>['data'] | null = null;
  public demandesTraitementSubstanceChartData: ChartConfiguration<'bar'>['data'] | null = null;
// 1. Charts manquants à déclarer
  public situationFamilialeChartData: ChartConfiguration<'doughnut'>['data'] | null = null;
  public motifConsultationChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public couvertureSocialeChartData: ChartConfiguration<'doughnut'>['data'] | null = null;
  public situationLogementChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public natureLogementChartData: ChartConfiguration<'doughnut'>['data'] | null = null;
  public frequenceTabacChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public frequenceAlcoolChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public lienConsommateurEntourageChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public spaInitiationChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public frequenceSubstancePrincipaleChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public voiesAdministrationChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public atcdPsychiatriquesChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public atcdSomatiquesChartData: ChartConfiguration<'bar'>['data'] | null = null;

  public substancesSaisiesChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public saisiesParRegionChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public nouvellesSubstancesChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public evolutionPrixChartData: ChartConfiguration<'line'>['data'] | null = null;
  public arrestationsChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public profilInculpesChartData: ChartConfiguration<'doughnut'>['data'] | null = null;
  public comparaisonSaisieConsommationChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public hospitalisationsChartData: ChartConfiguration<'bar'>['data'] | null = null;
  public echangeSeringuesChartData: ChartConfiguration<'doughnut'>['data'] | null = null;

// 2. Ajoutez ces méthodes dans buildCharts()
  private buildMissingCharts(): void {
    // Situation Familiale
    if (this.statistiques.demandesTraitement?.parSituationFamiliale) {
      this.situationFamilialeChartData = {
        labels: this.statistiques.demandesTraitement.parSituationFamiliale.map((item: any) => item.situation),
        datasets: [{
          data: this.statistiques.demandesTraitement.parSituationFamiliale.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.primary,
          borderWidth: 0
        }]
      };
    }

    // Motif de Consultation
    if (this.statistiques.cse?.parMotifConsultation) {
      this.motifConsultationChartData = {
        labels: this.statistiques.cse.parMotifConsultation.map((item: any) =>
            item.motif.replace(/_/g, ' ')
        ),
        datasets: [{
          label: 'Patients',
          data: this.statistiques.cse.parMotifConsultation.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.warm,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Couverture Sociale
    if (this.statistiques.cse?.parCouvertureSociale) {
      this.couvertureSocialeChartData = {
        labels: this.statistiques.cse.parCouvertureSociale.map((item: any) => item.type),
        datasets: [{
          data: this.statistiques.cse.parCouvertureSociale.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.gradient,
          borderWidth: 0
        }]
      };
    }

    // Situation de Logement
    if (this.statistiques.cse?.parSituationLogement) {
      this.situationLogementChartData = {
        labels: this.statistiques.cse.parSituationLogement.map((item: any) =>
            item.situation.replace(/_/g, ' ')
        ),
        datasets: [{
          label: 'Patients',
          data: this.statistiques.cse.parSituationLogement.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.multi,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Nature du Logement
    if (this.statistiques.cse?.parNatureLogement) {
      this.natureLogementChartData = {
        labels: this.statistiques.cse.parNatureLogement.map((item: any) => item.nature),
        datasets: [{
          data: this.statistiques.cse.parNatureLogement.map((item: any) => item.nombre),
          backgroundColor: ['#667eea', '#fa709a'],
          borderWidth: 0
        }]
      };
    }

    // Fréquence Tabac
    if (this.statistiques.tabac?.parFrequenceTabac) {
      this.frequenceTabacChartData = {
        labels: this.statistiques.tabac.parFrequenceTabac.map((item: any) => item.frequence),
        datasets: [{
          label: 'Fumeurs',
          data: this.statistiques.tabac.parFrequenceTabac.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.warm,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Fréquence Alcool
    if (this.statistiques.alcool?.parFrequenceAlcool) {
      this.frequenceAlcoolChartData = {
        labels: this.statistiques.alcool.parFrequenceAlcool.map((item: any) =>
            item.frequence.replace(/_/g, ' ')
        ),
        datasets: [{
          label: 'Consommateurs',
          data: this.statistiques.alcool.parFrequenceAlcool.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.gradient,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Lien Consommateur dans l'Entourage
    if (this.statistiques.spaEntourage?.parLienConsommateur) {
      this.lienConsommateurEntourageChartData = {
        labels: this.statistiques.spaEntourage.parLienConsommateur.map((item: any) => item.lien),
        datasets: [{
          label: 'Fréquence',
          data: this.statistiques.spaEntourage.parLienConsommateur.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.primary,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // SPA d'Initiation
    if (this.statistiques.spaPersonnelle?.spaInitiation) {
      this.spaInitiationChartData = {
        labels: this.statistiques.spaPersonnelle.spaInitiation.map((item: any) => item.type),
        datasets: [{
          label: 'Nombre',
          data: this.statistiques.spaPersonnelle.spaInitiation.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.warm,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Fréquence Substance Principale
    if (this.statistiques.spaPersonnelle?.frequenceSubstancePrincipale) {
      this.frequenceSubstancePrincipaleChartData = {
        labels: this.statistiques.spaPersonnelle.frequenceSubstancePrincipale.map((item: any) =>
            item.frequence.replace(/_/g, ' ')
        ),
        datasets: [{
          label: 'Usagers',
          data: this.statistiques.spaPersonnelle.frequenceSubstancePrincipale.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.gradient,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Voies d'Administration
    if (this.statistiques.comportementsEtTests?.parVoieAdministration) {
      this.voiesAdministrationChartData = {
        labels: this.statistiques.comportementsEtTests.parVoieAdministration.map((item: any) => item.voie),
        datasets: [{
          label: 'Fréquence',
          data: this.statistiques.comportementsEtTests.parVoieAdministration.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.multi,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // ATCD Psychiatriques (Top 5)
    if (this.statistiques.comorbidites?.atcdPsychiatriquesPlusFrequents) {
      const top5Psy = this.statistiques.comorbidites.atcdPsychiatriquesPlusFrequents.slice(0, 5);
      this.atcdPsychiatriquesChartData = {
        labels: top5Psy.map((item: any) => item.type),
        datasets: [{
          label: 'Fréquence',
          data: top5Psy.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.warm,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // ATCD Somatiques (Top 5)
    if (this.statistiques.comorbidites?.atcdSomatiquesPlusFrequents) {
      const top5Som = this.statistiques.comorbidites.atcdSomatiquesPlusFrequents.slice(0, 5);
      this.atcdSomatiquesChartData = {
        labels: top5Som.map((item: any) => item.type),
        datasets: [{
          label: 'Fréquence',
          data: top5Som.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.primary,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }
  }
  anneesDisponibles: number[] = [];
  gouvernoratsDisponibles: Gouvernorat[] = [];
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

  // Color palettes
  private colorPalettes = {
    primary: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
    gradient: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b'],
    warm: ['#fa709a', '#fee140', '#30cfd0', '#667eea'],
    multi: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140']
  };

  constructor(
    private statisticsService: StatisticsService,
    private marketStatisticsService: MarketStatisticsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadAnneesDisponibles();
    this.loadGouvernoratsDisponibles();
    this.loadStatistiques();
    this.loadStatistiquesMarche();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
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

  loadGouvernoratsDisponibles(): void {
    this.userService.getGouvernorats().subscribe({
      next: (gouvernorats) => {
        this.gouvernoratsDisponibles = gouvernorats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des gouvernorats:', error);
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

  loadStatistiquesMarche(): void {
    const dateDebut = this.filters.dateDebut;
    const dateFin = this.filters.dateFin;

    this.marketStatisticsService.getStatistiquesStructure(dateDebut, dateFin).subscribe({
      next: (data) => {
        this.statistiquesMarche = data;
        this.buildMarketCharts();
        console.log('Statistiques marché structure:', this.statistiquesMarche);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques marché:', error);
      }
    });
  }

  buildCharts(): void {
    if (!this.statistiques) return;
    this.buildMissingCharts();
    this.buildHealthCharts();

    // Répartition par sexe (Doughnut)
    if (this.statistiques.repartitionSexe) {
      this.sexeChartData = {
        labels: ['Hommes', 'Femmes'],
        datasets: [{
          data: [
            this.statistiques.repartitionSexe.hommes || 0,
            this.statistiques.repartitionSexe.femmes || 0
          ],
          backgroundColor: ['#667eea', '#f093fb'],
          borderWidth: 0
        }]
      };
    }

    // Répartition par âge
    if (this.statistiques.demandesTraitement?.parAge) {
      this.ageChartData = {
        labels: this.statistiques.demandesTraitement.parAge.map((item: any) => item.tranche),
        datasets: [{
          label: 'Demandes',
          data: this.statistiques.demandesTraitement.parAge.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.gradient,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Substances consommées
    if (this.statistiques.spaPersonnelle?.topSpaConsommees) {
      this.substancesChartData = {
        labels: this.statistiques.spaPersonnelle.topSpaConsommees.map((item: any) => item.type),
        datasets: [{
          label: 'Consommateurs',
          data: this.statistiques.spaPersonnelle.topSpaConsommees.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.warm,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Répartition par région
    if (this.statistiques.demandesTraitement?.parRegion) {
      const topRegions = this.statistiques.demandesTraitement.parRegion.slice(0, 10);
      this.regionChartData = {
        labels: topRegions.map((item: any) => item.region),
        datasets: [{
          label: 'Demandes',
          data: topRegions.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.primary,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Répartition par profession (Doughnut)
    if (this.statistiques.demandesTraitement?.parProfession) {
      const topProfessions = this.statistiques.demandesTraitement.parProfession.slice(0, 8);
      this.professionChartData = {
        labels: topProfessions.map((item: any) => item.profession),
        datasets: [{
          data: topProfessions.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.multi,
          borderWidth: 0
        }]
      };
    }

    // Demandes traitement par sexe
    if (this.statistiques.demandesTraitement?.parSexe) {
      this.demandesTraitementSexeChartData = {
        labels: this.statistiques.demandesTraitement.parSexe.map((item: any) => item.sexe),
        datasets: [{
          data: this.statistiques.demandesTraitement.parSexe.map((item: any) => item.nombre),
          backgroundColor: ['#667eea', '#f093fb'],
          borderWidth: 0
        }]
      };
    }

    // Demandes traitement par substance
    if (this.statistiques.demandesTraitement?.parSubstance) {
      const topSubstances = this.statistiques.demandesTraitement.parSubstance.slice(0, 10);
      this.demandesTraitementSubstanceChartData = {
        labels: topSubstances.map((item: any) => item.substance),
        datasets: [{
          label: 'Demandes',
          data: topSubstances.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.gradient,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Modes d'administration
    if (this.statistiques.modesAdministration) {
      this.modesAdministrationChartData = {
        labels: this.statistiques.modesAdministration.map((item: any) => item.mode),
        datasets: [{
          data: this.statistiques.modesAdministration.map((item: any) => item.frequence),
          backgroundColor: this.colorPalettes.warm,
          borderWidth: 0
        }]
      };
    }

    // Tests de dépistage
    if (this.statistiques.comportementsEtTests?.testsDepistage) {
      const tests = this.statistiques.comportementsEtTests.testsDepistage;
      this.testDepistageChartData = {
        labels: ['VIH', 'VHC', 'VHB', 'Syphilis'],
        datasets: [{
          label: 'Tests effectués',
          data: [
            tests.nombreTestsVih || 0,
            tests.nombreTestsVhc || 0,
            tests.nombreTestsVhb || 0,
            tests.nombreTestsSyphilis || 0
          ],
          backgroundColor: this.colorPalettes.primary,
          borderRadius: 8,
          borderSkipped: false
        }]
      };

      // Tests détaillés
      this.testDepistageDetailChartData = {
        labels: ['VIH', 'VHC', 'VHB', 'Syphilis'],
        datasets: [
          {
            label: 'Tests effectués',
            data: [
              tests.nombreTestsVih || 0,
              tests.nombreTestsVhc || 0,
              tests.nombreTestsVhb || 0,
              tests.nombreTestsSyphilis || 0
            ],
            backgroundColor: '#667eea',
            borderRadius: 8,
            borderSkipped: false
          },
          {
            label: 'Usagers atteints',
            data: [
              tests.nombreUsagersAtteints || 0,
              0,
              0,
              0
            ],
            backgroundColor: '#fa709a',
            borderRadius: 8,
            borderSkipped: false
          }
        ]
      };
    }

    // Modalités de prise en charge
    if (this.statistiques.conduiteTherapeutique?.parModalitePriseEnCharge) {
      this.modalitesChartData = {
        labels: this.statistiques.conduiteTherapeutique.parModalitePriseEnCharge.map((item: any) => item.modalite),
        datasets: [{
          label: 'Patients',
          data: this.statistiques.conduiteTherapeutique.parModalitePriseEnCharge.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.gradient,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Secteur socio-économique
    if (this.statistiques.cse?.parSecteur) {
      this.secteurChartData = {
        labels: this.statistiques.cse.parSecteur.map((item: any) => item.secteur),
        datasets: [{
          data: this.statistiques.cse.parSecteur.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.primary,
          borderWidth: 0
        }]
      };
    }

    // Nationalité
    if (this.statistiques.cse?.parNationalite) {
      this.nationaliteChartData = {
        labels: this.statistiques.cse.parNationalite.map((item: any) => item.nationalite),
        datasets: [{
          label: 'Patients',
          data: this.statistiques.cse.parNationalite.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.warm,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Niveau scolaire
    if (this.statistiques.cse?.parNiveauScolaire) {
      this.niveauScolaireChartData = {
        labels: this.statistiques.cse.parNiveauScolaire.map((item: any) => item.niveau),
        datasets: [{
          label: 'Patients',
          data: this.statistiques.cse.parNiveauScolaire.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.gradient,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Types d'alcool
    if (this.statistiques.alcool?.parTypeAlcool) {
      this.typesAlcoolChartData = {
        labels: this.statistiques.alcool.parTypeAlcool.map((item: any) => item.type),
        datasets: [{
          label: 'Fréquence',
          data: this.statistiques.alcool.parTypeAlcool.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.warm,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Alcool - Chart général
    if (this.statistiques.alcool) {
      this.alcoolChartData = {
        labels: ['Consommateurs', 'Âge 1ère conso.'],
        datasets: [{
          label: 'Statistiques Alcool',
          data: [
            this.statistiques.alcool.frequenceConsommateursAlcool || 0,
            this.statistiques.alcool.moyenneAgePremiereConsommation || 0
          ],
          backgroundColor: ['#667eea', '#f093fb'],
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Tabac - Line chart
    if (this.statistiques.tabac) {
      this.tabacChartData = {
        labels: ['Fumeurs', 'Âge 1ère cigarette', 'Sevrage assisté'],
        datasets: [{
          label: 'Statistiques Tabac',
          data: [
            this.statistiques.tabac.frequenceTabagiques || 0,
            this.statistiques.tabac.moyenneAgePremiereCigarette || 0,
            this.statistiques.tabac.frequenceSevrageAssiste || 0
          ],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      };
    }

    // SPA Entourage
    if (this.statistiques.spaEntourage?.parTypeSpaEntourage) {
      this.spaEntourageChartData = {
        labels: this.statistiques.spaEntourage.parTypeSpaEntourage.map((item: any) => item.type),
        datasets: [{
          label: 'Fréquence',
          data: this.statistiques.spaEntourage.parTypeSpaEntourage.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.primary,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Associations de SPA
    if (this.statistiques.spaPersonnelle?.associationsUsageFrequentes) {
      this.associationsSpaChartData = {
        labels: this.statistiques.spaPersonnelle.associationsUsageFrequentes.map((item: any) => item.association),
        datasets: [{
          label: 'Fréquence',
          data: this.statistiques.spaPersonnelle.associationsUsageFrequentes.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.gradient,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Substances principales polyconsommateurs
    if (this.statistiques.spaPersonnelle?.substancesPrincipalesPolyConsommateurs) {
      this.substancesPrincipalesChartData = {
        labels: this.statistiques.spaPersonnelle.substancesPrincipalesPolyConsommateurs.map((item: any) => item.type),
        datasets: [{
          label: 'Fréquence',
          data: this.statistiques.spaPersonnelle.substancesPrincipalesPolyConsommateurs.map((item: any) => item.nombre),
          backgroundColor: this.colorPalettes.warm,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Autres addictions
    if (this.statistiques.autresAddictions) {
      const addictions = this.statistiques.autresAddictions;
      this.autresAddictionsChartData = {
        labels: ['Jeux pathologiques', 'Écrans', 'Comportements sexuels'],
        datasets: [{
          label: 'Prévalence',
          data: [
            addictions.prevalenceAddictionJeuxPathologiques || 0,
            addictions.prevalenceAddictionEcrans || 0,
            addictions.prevalenceComportementsSexuelsAddictifs || 0
          ],
          backgroundColor: this.colorPalettes.primary,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Comorbidités
    if (this.statistiques.comorbidites) {
      this.comorbiditeChartData = {
        labels: ['Troubles alimentaires', 'ATCD psychiatriques', 'ATCD somatiques'],
        datasets: [{
          label: 'Fréquence',
          data: [
            this.statistiques.comorbidites.frequenceTroublesAlimentaires || 0,
            this.statistiques.comorbidites.frequenceAtcdPsychiatriquesPersonnels || 0,
            this.statistiques.comorbidites.frequenceAtcdSomatiquesPersonnels || 0
          ],
          backgroundColor: this.colorPalettes.warm,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    // Consultations (Line chart)
    if (this.statistiques.conduiteTherapeutique) {
      this.consultationsChartData = {
        labels: ['Moyenne consultations'],
        datasets: [{
          label: 'Nombre de consultations',
          data: [this.statistiques.conduiteTherapeutique.moyenneNombreConsultations || 0],
          borderColor: '#f093fb',
          backgroundColor: 'rgba(240, 147, 251, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#f093fb',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      };
    }
  }

  onFilterChange(): void {
    this.loadStatistiques();
    this.loadStatistiquesMarche();
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
        a.download = `statistiques_${new Date().toISOString()}.xlsx`;
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

  buildHealthCharts(): void {
    if (!this.statistiques?.comportementsEtTests) return;

    if (this.statistiques.comportementsEtTests.hospitalisations) {
      const hosp = this.statistiques.comportementsEtTests.hospitalisations;
      this.hospitalisationsChartData = {
        labels: ['Usage drogues', 'Overdose', 'Endocardite', 'Total'],
        datasets: [{
          label: 'Nombre d\'hospitalisations',
          data: [
            hosp.nombreHospitalisationsUsageDrogues || 0,
            hosp.nombreHospitalisationsOverdose || 0,
            hosp.nombreHospitalisationsEndocardite || 0,
            hosp.nombreTotalHospitalisations || 0
          ],
          backgroundColor: this.colorPalettes.warm,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    if (this.statistiques.comportementsEtTests.echangeSeringuesParONG) {
      const echangeData = this.statistiques.comportementsEtTests.echangeSeringuesParONG;
      if (echangeData && echangeData.length > 0) {
        this.echangeSeringuesChartData = {
          labels: echangeData.map((item: any) => item.nomONG),
          datasets: [{
            data: echangeData.map((item: any) => item.nombreUsagers),
            backgroundColor: this.colorPalettes.primary,
            borderWidth: 0
          }]
        };
      }
    }
  }

  buildMarketCharts(): void {
    if (!this.statistiquesMarche) return;

    if (this.statistiquesMarche.substancesSaisies) {
      this.substancesSaisiesChartData = {
        labels: this.statistiquesMarche.substancesSaisies.map((item: any) => item.nomSubstance),
        datasets: [{
          label: 'Quantité saisie',
          data: this.statistiquesMarche.substancesSaisies.map((item: any) => item.quantiteTotale),
          backgroundColor: this.colorPalettes.gradient,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    if (this.statistiquesMarche.saisiesParRegion) {
      const regionsMap = new Map<string, number>();
      this.statistiquesMarche.saisiesParRegion.forEach((item: any) => {
        const current = regionsMap.get(item.region) || 0;
        regionsMap.set(item.region, current + item.quantite);
      });
      const top10Regions = Array.from(regionsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      this.saisiesParRegionChartData = {
        labels: top10Regions.map(item => item[0]),
        datasets: [{
          label: 'Quantité totale saisie',
          data: top10Regions.map(item => item[1]),
          backgroundColor: this.colorPalettes.warm,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    if (this.statistiquesMarche.nouvellesSubstances && this.statistiquesMarche.nouvellesSubstances.length > 0) {
      this.nouvellesSubstancesChartData = {
        labels: this.statistiquesMarche.nouvellesSubstances.map((item: any) => item.nomSubstance),
        datasets: [{
          label: 'Nombre de saisies',
          data: this.statistiquesMarche.nouvellesSubstances.map((item: any) => item.nombreSaisies),
          backgroundColor: this.colorPalettes.primary,
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }

    if (this.statistiquesMarche.evolutionPrix && this.statistiquesMarche.evolutionPrix.length > 0) {
      const substancesMap = new Map<string, any[]>();
      this.statistiquesMarche.evolutionPrix.forEach((item: any) => {
        if (!substancesMap.has(item.substance)) {
          substancesMap.set(item.substance, []);
        }
        substancesMap.get(item.substance)!.push(item);
      });

      const datasets = Array.from(substancesMap.entries()).map(([substance, data], index) => ({
        label: substance,
        data: data.map((item: any) => item.prixMoyen),
        borderColor: this.colorPalettes.multi[index % this.colorPalettes.multi.length],
        backgroundColor: `${this.colorPalettes.multi[index % this.colorPalettes.multi.length]}33`,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: this.colorPalettes.multi[index % this.colorPalettes.multi.length],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }));

      this.evolutionPrixChartData = {
        labels: Array.from(new Set(this.statistiquesMarche.evolutionPrix.map((item: any) => item.periode))),
        datasets: datasets
      };
    }

    if (this.statistiquesMarche.comparaisonSaisieConsommation && this.statistiquesMarche.comparaisonSaisieConsommation.length > 0) {
      const substances = this.statistiquesMarche.comparaisonSaisieConsommation.map((item: any) => item.substance);
      const saisies = this.statistiquesMarche.comparaisonSaisieConsommation.map((item: any) => item.quantiteSaisie);
      const consommateurs = this.statistiquesMarche.comparaisonSaisieConsommation.map((item: any) => item.nombreConsommateurs);

      this.comparaisonSaisieConsommationChartData = {
        labels: substances,
        datasets: [
          {
            label: 'Quantité saisie',
            data: saisies,
            backgroundColor: '#667eea',
            borderRadius: 8,
            borderSkipped: false
          },
          {
            label: 'Nombre consommateurs',
            data: consommateurs,
            backgroundColor: '#f093fb',
            borderRadius: 8,
            borderSkipped: false
          }
        ]
      };
    }

    if (this.statistiquesMarche.arrestations) {
      const arr = this.statistiquesMarche.arrestations;
      if (arr.arrestationsParType) {
        const types = Object.keys(arr.arrestationsParType);
        const values = Object.values(arr.arrestationsParType);
        this.arrestationsChartData = {
          labels: types,
          datasets: [{
            label: 'Nombre d\'arrestations',
            data: values as number[],
            backgroundColor: this.colorPalettes.gradient,
            borderRadius: 8,
            borderSkipped: false
          }]
        };
      }
    }

    if (this.statistiquesMarche.profilInculpes) {
      const profil = this.statistiquesMarche.profilInculpes;
      if (profil.repartitionGenre) {
        const genres = Object.keys(profil.repartitionGenre);
        const values = Object.values(profil.repartitionGenre);
        this.profilInculpesChartData = {
          labels: genres,
          datasets: [{
            data: values as number[],
            backgroundColor: this.colorPalettes.primary,
            borderWidth: 0
          }]
        };
      }
    }
  }
}

