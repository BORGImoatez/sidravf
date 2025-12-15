import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SubstanceSaisieDto {
  nomSubstance: string;
  quantiteTotale: number;
  unite: string;
  nombreSaisies: number;
  prixMoyen: number;
}

export interface SubstanceParRegionDto {
  region: string;
  substance: string;
  quantite: number;
  nombreSaisies: number;
}

export interface NouvelleSubstanceDto {
  nomSubstance: string;
  premiereDateDetection: string;
  nombreSaisies: number;
}

export interface PrixSubstanceDto {
  substance: string;
  periode: string;
  prixMoyen: number;
  variationPourcentage: number;
}

export interface ArrestationsDto {
  nombreTotalArrestations: number;
  arrestationsParType: Map<string, number>;
  tendanceArrestations: string;
}

export interface ProfilSocioDemographiqueDto {
  agesMoyens: Map<string, number>;
  repartitionGenre: Map<string, number>;
  originesGeographiques: Map<string, number>;
}

export interface ComparaisonSaisieConsommationDto {
  substance: string;
  quantiteSaisie: number;
  nombreConsommateurs: number;
  tendance: string;
}

export interface EvolutionAnnuelleSubstanceDto {
  annee: number;
  substance: string;
  quantiteTotale: number;
  nombreSaisies: number;
}

export interface StatistiquesMarcheDTO {
  totalSaisies: number;
  substancesSaisies: SubstanceSaisieDto[];
  saisiesParRegion: SubstanceParRegionDto[];
  nouvellesSubstances: NouvelleSubstanceDto[];
  evolutionPrix: PrixSubstanceDto[];
  arrestations: ArrestationsDto;
  profilInculpes: ProfilSocioDemographiqueDto;
  comparaisonSaisieConsommation: ComparaisonSaisieConsommationDto[];
  evolutionAnnuelleSubstances: EvolutionAnnuelleSubstanceDto[];
}

export interface EchangeSeringuesONG {
  nomONG: string;
  nombreUsagers: number;
}

export interface TypeHospitalisation {
  type: string;
  nombre: number;
  pourcentage: number;
}

export interface Hospitalisations {
  nombreHospitalisationsUsageDrogues: number;
  nombreHospitalisationsOverdose: number;
  nombreHospitalisationsEndocardite: number;
  nombreTotalHospitalisations: number;
  parType: TypeHospitalisation[];
}

@Injectable({
  providedIn: 'root'
})
export class MarketStatisticsService {
  private apiUrl = `${environment.apiUrl}/statistiques/marche`;

  constructor(private http: HttpClient) { }

  getStatistiquesNationales(dateDebut?: string, dateFin?: string, gouvernorat?: string): Observable<StatistiquesMarcheDTO> {
    let params = new HttpParams();

    if (dateDebut) {
      params = params.set('dateDebut', dateDebut);
    }
    if (dateFin) {
      params = params.set('dateFin', dateFin);
    }
    if (gouvernorat) {
      params = params.set('gouvernorat', gouvernorat);
    }

    return this.http.get<StatistiquesMarcheDTO>(`${this.apiUrl}/nationales`, { params });
  }

  getStatistiquesStructure(dateDebut?: string, dateFin?: string, mesDonneesUniquement?: boolean): Observable<StatistiquesMarcheDTO> {
    let params = new HttpParams();

    if (dateDebut) {
      params = params.set('dateDebut', dateDebut);
    }
    if (dateFin) {
      params = params.set('dateFin', dateFin);
    }
    if (mesDonneesUniquement !== undefined) {
      params = params.set('mesDonneesUniquement', mesDonneesUniquement.toString());
    }

    return this.http.get<StatistiquesMarcheDTO>(`${this.apiUrl}/structure`, { params });
  }
}
