import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {Environment} from "@angular/cli/lib/config/workspace-schema";
import {environment} from "../../environments/environment";

interface FilterParams {
  sexe?: string;
  anneeConsultation?: number;
  moisConsultation?: number;
  dateDebut?: string;
  dateFin?: string;
  gouvernorat?: string;
  ageMin?: number;
  ageMax?: number;
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
  getGouvernoratsDisponibles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/gouvernorats`);
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
      }
    };
  }
}
