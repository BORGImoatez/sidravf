import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RepartitionSexe {
  hommes: number;
  femmes: number;
  pourcentageHommes: number;
  pourcentageFemmes: number;
}

export interface AuteurDemande {
  auteur: string;
  nombre: number;
  pourcentage: number;
}

export interface CertificatMedical {
  type: string;
  nombre: number;
  pourcentage: number;
}

export interface ParDelegation {
  delegation: string;
  delegationLibelle:string;
  nombre: number;
  pourcentage: number;
}

export interface ParGouvernorat {
  gouvernorat: string;
  gouvernoratLibelle:string;
  nombre: number;
  pourcentage: number;
  parDelegation: ParDelegation[];
}

export interface StatistiquesDemande {
  totalDemandes: number;
  repartitionSexe: RepartitionSexe;
  moyenneAge: number;
  medianeAge: number;
  auteursDemandes: AuteurDemande[];
  certificatsMedicaux: CertificatMedical[];
  parGouvernorat: ParGouvernorat[];
}

interface FilterParams {
  gouvernorat?: string;
  annee?: number;
  mois?: number;
  dateDebut?: string;
  dateFin?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DemandeStatisticsService {
  private apiUrl = `${environment.apiUrl}/statistiques/demandes`;

  constructor(private http: HttpClient) {}

  getStatistiquesDemandes(filters?: FilterParams): Observable<StatistiquesDemande> {
    let params = new HttpParams();

    if (filters?.gouvernorat) {
      params = params.set('gouvernorat', filters.gouvernorat);
    }
    if (filters?.annee) {
      params = params.set('annee', filters.annee.toString());
    }
    if (filters?.mois) {
      params = params.set('mois', filters.mois.toString());
    }
    if (filters?.dateDebut) {
      params = params.set('dateDebut', filters.dateDebut);
    }
    if (filters?.dateFin) {
      params = params.set('dateFin', filters.dateFin);
    }

    return this.http.get<StatistiquesDemande>(this.apiUrl, { params });
  }
}
