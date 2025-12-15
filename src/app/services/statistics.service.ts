import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {Environment} from "@angular/cli/lib/config/workspace-schema";
import {environment} from "../../environments/environment";
import {Gouvernorat} from "../models/user.model";

export interface FilterParams {
  sexe?: string;
  anneeConsultation?: number;
  moisConsultation?: number;
  dateDebut?: string;
  dateFin?: string;
  gouvernorat?: string;
  ageMin?: number;
  ageMax?: number;
}

export interface StatistiquesData {
  totalConsultations: number;
  repartitionSexe: { hommes: number; femmes: number };
  moyenneAge: number;
  medianeAge: number;
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
  cse: {
    parSecteur: { secteur: string; nombre: number }[];
    parNationalite: { nationalite: string; nombre: number }[];
    parMotifConsultation: { motif: string; nombre: number }[];
    parCouvertureSociale: { type: string; nombre: number }[];
    parSituationLogement: { situation: string; nombre: number }[];
    parNatureLogement: { nature: string; nombre: number }[];
    parNiveauScolaire: { niveau: string; nombre: number }[];
  };
  tabac: {
    frequenceTabagiques: number;
    moyenneAgePremiereCigarette: number;
    medianeAgePremiereCigarette: number;
    moyennePaquetsAnnee: number;
    medianePaquetsAnnee: number;
    moyenneAgeSevrageExFumeurs: number;
    medianeAgeSevrageExFumeurs: number;
    frequenceSevrageAssiste: number;
    parFrequenceTabac: { frequence: string; nombre: number }[];
  };
  alcool: {
    frequenceConsommateursAlcool: number;
    moyenneAgePremiereConsommation: number;
    medianeAgePremiereConsommation: number;
    moyenneQuantiteConsommee: number;
    medianeQuantiteConsommee: number;
    parFrequenceAlcool: { frequence: string; nombre: number }[];
    parTypeAlcool: { type: string; nombre: number }[];
  };
  spaEntourage: {
    frequenceConsommationSpaEntourage: number;
    parLienConsommateur: { lien: string; nombre: number }[];
    parTypeSpaEntourage: { type: string; nombre: number }[];
    top3SpaEntourage: { type: string; nombre: number }[];
    nombreDecesLiesSpaDansEntourage: number;
  };
  spaPersonnelle: {
    nombreTotalDemandesTraitement: number;
    parTypeSpa: { type: string; nombre: number }[];
    topSpaConsommees: { type: string; nombre: number }[];
    spaInitiation: { type: string; nombre: number }[];
    moyenneAgeInitiation: number;
    medianeAgeInitiation: number;
    frequencePolyConsommation: number;
    associationsUsageFrequentes: { association: string; nombre: number }[];
    substancesPrincipalesPolyConsommateurs: { type: string; nombre: number }[];
    moyenneAgeInitiationSubstancePrincipale: number;
    medianeAgeInitiationSubstancePrincipale: number;
    frequenceSubstancePrincipale: { frequence: string; nombre: number }[];
    frequenceAccompagnementSevrage: number;
  };
  autresAddictions: {
    prevalenceAddictionJeuxPathologiques: number;
    prevalenceAddictionEcrans: number;
    prevalenceComportementsSexuelsAddictifs: number;
  };
  comportementsEtTests: {
    parVoieAdministration: { voie: string; nombre: number }[];
    voiesAdministrationPlusFrequentes: { voie: string; nombre: number }[];
    frequencePartageSeringues: number;
    testsDepistage: {
      nombreTestsVih: number;
      nombreTestsVhc: number;
      nombreTestsVhb: number;
      nombreTestsSyphilis: number;
      nombreUsagersAtteints: number;
    };
  };
  comorbidites: {
    frequenceTroublesAlimentaires: number;
    frequenceAtcdPsychiatriquesPersonnels: number;
    frequenceAtcdSomatiquesPersonnels: number;
    atcdPsychiatriquesPlusFrequents: { type: string; nombre: number }[];
    atcdSomatiquesPlusFrequents: { type: string; nombre: number }[];
  };
  conduiteTherapeutique: {
    parModalitePriseEnCharge: { modalite: string; nombre: number }[];
    moyenneNombreConsultations: number;
    medianeNombreConsultations: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = environment.apiUrl+'/statistiques' || 'http://10.172.20.45:9093/api';


  constructor(private http: HttpClient) {}

  /**
   * Récupère les statistiques nationales avec filtres complets
   */
  getStatistiquesNationales(filters?: FilterParams): Observable<StatistiquesData> {
    let params = new HttpParams();

    if (filters) {
      if (filters.sexe && filters.sexe !== 'tous') {
        params = params.set('sexe', filters.sexe.toUpperCase());
      }
      if (filters.anneeConsultation && filters.anneeConsultation > 0) {
        params = params.set('anneeConsultation', filters.anneeConsultation.toString());
      }
      if (filters.moisConsultation && filters.moisConsultation > 0) {
        params = params.set('moisConsultation', filters.moisConsultation.toString());
      }
      if (filters.dateDebut) {
        params = params.set('dateDebut', filters.dateDebut);
      }
      if (filters.dateFin) {
        params = params.set('dateFin', filters.dateFin);
      }
      if (filters.gouvernorat) {
        params = params.set('gouvernorat', filters.gouvernorat);
      }
      if (filters.ageMin !== undefined) {
        params = params.set('ageMin', filters.ageMin.toString());
      }
      if (filters.ageMax !== undefined) {
        params = params.set('ageMax', filters.ageMax.toString());
      }
    }

    return this.http.get<any>(`${this.apiUrl}/national`, { params }).pipe(
        map(data => this.transformStatistiques(data))
    );
  }

  /**
   * Récupère les statistiques par structure pour l'utilisateur connecté
   */
  getStatistiquesStructure(filters?: FilterParams): Observable<StatistiquesData> {
    let params = new HttpParams();

    if (filters) {
      if (filters.sexe && filters.sexe !== 'tous') {
        params = params.set('sexe', filters.sexe.toUpperCase());
      }
      if (filters.anneeConsultation && filters.anneeConsultation > 0) {
        params = params.set('anneeConsultation', filters.anneeConsultation.toString());
      }
      if (filters.moisConsultation && filters.moisConsultation > 0) {
        params = params.set('moisConsultation', filters.moisConsultation.toString());
      }
      if (filters.dateDebut) {
        params = params.set('dateDebut', filters.dateDebut);
      }
      if (filters.dateFin) {
        params = params.set('dateFin', filters.dateFin);
      }
      if (filters.ageMin !== undefined) {
        params = params.set('ageMin', filters.ageMin.toString());
      }
      if (filters.ageMax !== undefined) {
        params = params.set('ageMax', filters.ageMax.toString());
      }
    }

    return this.http.get<any>(`${this.apiUrl}/structure`, { params }).pipe(
        map(data => this.transformStatistiques(data))
    );
  }

  /**
   * Récupère les statistiques générales avec filtres optionnels (ancienne version pour compatibilité)
   */
  getStatistiques(filters?: FilterParams): Observable<StatistiquesData> {
    return this.getStatistiquesNationales(filters);
  }

  /**
   * Exporte les données au format Excel
   */
  exportData(filters?: FilterParams): Observable<Blob> {
    let params = new HttpParams();

    if (filters) {
      if (filters.sexe && filters.sexe !== 'tous') {
        params = params.set('sexe', filters.sexe.toUpperCase());
      }
      if (filters.anneeConsultation && filters.anneeConsultation > 0) {
        params = params.set('anneeConsultation', filters.anneeConsultation.toString());
      }
      if (filters.ageMin !== undefined) {
        params = params.set('ageMin', filters.ageMin.toString());
      }
      if (filters.ageMax !== undefined) {
        params = params.set('ageMax', filters.ageMax.toString());
      }
    }

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Récupère les années disponibles pour le filtre
   */
  getAnneesDisponibles(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/annees`);
  }

  /**
   * Récupère les gouvernorats disponibles pour le filtre
   */

  getGouvernoratsDisponibles(): Observable<Gouvernorat[]> {
    return this.http.get<Gouvernorat[]>(`${this.apiUrl}/gouvernorats`);
  }

  /**
   * Transforme les données brutes du backend au format attendu par le composant
   */
  private transformStatistiques(data: any): StatistiquesData {
    return {
      totalConsultations: data.totalConsultations || 0,
      repartitionSexe: {
        hommes: data.repartitionSexe?.hommes || 0,
        femmes: data.repartitionSexe?.femmes || 0
      },
      moyenneAge: data.moyenneAge || 0,
      medianeAge: data.medianeAge || 0,
      decesLieDrogues: data.decesLieDrogues || 0,
      modesAdministration: data.modesAdministration || [],
      demandesTraitement: {
        total: data.demandesTraitement?.total || 0,
        parAge: data.demandesTraitement?.parAge || [],
        parSexe: data.demandesTraitement?.parSexe || [],
        parRegion: data.demandesTraitement?.parRegion || [],
        parProfession: data.demandesTraitement?.parProfession || [],
        parNSE: data.demandesTraitement?.parNSE || [],
        parSituationFamiliale: data.demandesTraitement?.parSituationFamiliale || [],
        parSubstance: data.demandesTraitement?.parSubstance || []
      },
      cse: {
        parSecteur: data.cse?.parSecteur || [],
        parNationalite: data.cse?.parNationalite || [],
        parMotifConsultation: data.cse?.parMotifConsultation || [],
        parCouvertureSociale: data.cse?.parCouvertureSociale || [],
        parSituationLogement: data.cse?.parSituationLogement || [],
        parNatureLogement: data.cse?.parNatureLogement || [],
        parNiveauScolaire: data.cse?.parNiveauScolaire || []
      },
      tabac: {
        frequenceTabagiques: data.tabac?.frequenceTabagiques || 0,
        moyenneAgePremiereCigarette: data.tabac?.moyenneAgePremiereCigarette || 0,
        medianeAgePremiereCigarette: data.tabac?.medianeAgePremiereCigarette || 0,
        moyennePaquetsAnnee: data.tabac?.moyennePaquetsAnnee || 0,
        medianePaquetsAnnee: data.tabac?.medianePaquetsAnnee || 0,
        moyenneAgeSevrageExFumeurs: data.tabac?.moyenneAgeSevrageExFumeurs || 0,
        medianeAgeSevrageExFumeurs: data.tabac?.medianeAgeSevrageExFumeurs || 0,
        frequenceSevrageAssiste: data.tabac?.frequenceSevrageAssiste || 0,
        parFrequenceTabac: data.tabac?.parFrequenceTabac || []
      },
      alcool: {
        frequenceConsommateursAlcool: data.alcool?.frequenceConsommateursAlcool || 0,
        moyenneAgePremiereConsommation: data.alcool?.moyenneAgePremiereConsommation || 0,
        medianeAgePremiereConsommation: data.alcool?.medianeAgePremiereConsommation || 0,
        moyenneQuantiteConsommee: data.alcool?.moyenneQuantiteConsommee || 0,
        medianeQuantiteConsommee: data.alcool?.medianeQuantiteConsommee || 0,
        parFrequenceAlcool: data.alcool?.parFrequenceAlcool || [],
        parTypeAlcool: data.alcool?.parTypeAlcool || []
      },
      spaEntourage: {
        frequenceConsommationSpaEntourage: data.spaEntourage?.frequenceConsommationSpaEntourage || 0,
        parLienConsommateur: data.spaEntourage?.parLienConsommateur || [],
        parTypeSpaEntourage: data.spaEntourage?.parTypeSpaEntourage || [],
        top3SpaEntourage: data.spaEntourage?.top3SpaEntourage || [],
        nombreDecesLiesSpaDansEntourage: data.spaEntourage?.nombreDecesLiesSpaDansEntourage || 0
      },
      spaPersonnelle: {
        nombreTotalDemandesTraitement: data.spaPersonnelle?.nombreTotalDemandesTraitement || 0,
        parTypeSpa: data.spaPersonnelle?.parTypeSpa || [],
        topSpaConsommees: data.spaPersonnelle?.topSpaConsommees || [],
        spaInitiation: data.spaPersonnelle?.spaInitiation || [],
        moyenneAgeInitiation: data.spaPersonnelle?.moyenneAgeInitiation || 0,
        medianeAgeInitiation: data.spaPersonnelle?.medianeAgeInitiation || 0,
        frequencePolyConsommation: data.spaPersonnelle?.frequencePolyConsommation || 0,
        associationsUsageFrequentes: data.spaPersonnelle?.associationsUsageFrequentes || [],
        substancesPrincipalesPolyConsommateurs: data.spaPersonnelle?.substancesPrincipalesPolyConsommateurs || [],
        moyenneAgeInitiationSubstancePrincipale: data.spaPersonnelle?.moyenneAgeInitiationSubstancePrincipale || 0,
        medianeAgeInitiationSubstancePrincipale: data.spaPersonnelle?.medianeAgeInitiationSubstancePrincipale || 0,
        frequenceSubstancePrincipale: data.spaPersonnelle?.frequenceSubstancePrincipale || [],
        frequenceAccompagnementSevrage: data.spaPersonnelle?.frequenceAccompagnementSevrage || 0
      },
      autresAddictions: {
        prevalenceAddictionJeuxPathologiques: data.autresAddictions?.prevalenceAddictionJeuxPathologiques || 0,
        prevalenceAddictionEcrans: data.autresAddictions?.prevalenceAddictionEcrans || 0,
        prevalenceComportementsSexuelsAddictifs: data.autresAddictions?.prevalenceComportementsSexuelsAddictifs || 0
      },
      comportementsEtTests: {
        parVoieAdministration: data.comportementsEtTests?.parVoieAdministration || [],
        voiesAdministrationPlusFrequentes: data.comportementsEtTests?.voiesAdministrationPlusFrequentes || [],
        frequencePartageSeringues: data.comportementsEtTests?.frequencePartageSeringues || 0,
        testsDepistage: {
          nombreTestsVih: data.comportementsEtTests?.testsDepistage?.nombreTestsVih || 0,
          nombreTestsVhc: data.comportementsEtTests?.testsDepistage?.nombreTestsVhc || 0,
          nombreTestsVhb: data.comportementsEtTests?.testsDepistage?.nombreTestsVhb || 0,
          nombreTestsSyphilis: data.comportementsEtTests?.testsDepistage?.nombreTestsSyphilis || 0,
          nombreUsagersAtteints: data.comportementsEtTests?.testsDepistage?.nombreUsagersAtteints || 0
        }
      },
      comorbidites: {
        frequenceTroublesAlimentaires: data.comorbidites?.frequenceTroublesAlimentaires || 0,
        frequenceAtcdPsychiatriquesPersonnels: data.comorbidites?.frequenceAtcdPsychiatriquesPersonnels || 0,
        frequenceAtcdSomatiquesPersonnels: data.comorbidites?.frequenceAtcdSomatiquesPersonnels || 0,
        atcdPsychiatriquesPlusFrequents: data.comorbidites?.atcdPsychiatriquesPlusFrequents || [],
        atcdSomatiquesPlusFrequents: data.comorbidites?.atcdSomatiquesPlusFrequents || []
      },
      conduiteTherapeutique: {
        parModalitePriseEnCharge: data.conduiteTherapeutique?.parModalitePriseEnCharge || [],
        moyenneNombreConsultations: data.conduiteTherapeutique?.moyenneNombreConsultations || 0,
        medianeNombreConsultations: data.conduiteTherapeutique?.medianeNombreConsultations || 0
      }
    };
  }
}
