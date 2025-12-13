import {Component, OnInit} from '@angular/core';
import {Gouvernorat} from "../../../../models/user.model";
import {Delegation, DelegationService} from "../../../../services/delegation.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './demande-form.component.html',
  styleUrl: './demande-form.component.css'
})
export class DemandeFormComponent implements OnInit {

  demande: any = {
    genre: 'MASCULIN',
    auteurType: 'lui_meme',
    typeCertificat: 'public',
    decision: 'complet_favorable',
    priseEnChargeMethadone: false,
    gouvernoratId: null,
    delegationId: null,
    etablissementPriseEnCharge: null
  };

  gouvernorats: Gouvernorat[] = [];
  delegationsFiltered: Delegation[] = [];

  isEditMode: boolean = false;
  demandeId: number | null = null;

  private apiUrl = environment.apiUrl || 'http://10.172.20.45:9093/api';

  constructor(
      private delegationService: DelegationService,
      private http: HttpClient,
      private router: Router,
      private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Charger tous les gouvernorats
    this.delegationService.getGouvernorat().subscribe({
      next: (gouvs) => {
        this.gouvernorats = gouvs;

        // Mode édition ?
        this.route.params.subscribe(params => {
          if (params['id']) {
            this.isEditMode = true;
            this.demandeId = +params['id'];
            this.loadDemande(this.demandeId);
          }
        });
      }
    });
  }

  loadDemande(id: number): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('sidra_token')}`
    });

    this.http.get(`${this.apiUrl}/demandes/${id}`, { headers }).subscribe({
      next: (data: any) => {
        console.log("Données reçues :", data);

        this.demande = {
          ...data,
          dateNaissance: this.formatDateForInput(data.dateNaissance),
          dateCommission: this.formatDateForInput(data.dateCommission),

          // Mapping backend → frontend
          gouvernoratId: Number(data.gouvernorat),
          delegationId: Number(data.delegation),

          // Mapping établissement prise en charge
          etablissementPriseEnCharge: Number(data.etablissementPriseEnCharge)
        };

        // Charger la liste des délégations du gouvernorat
        if (this.demande.gouvernoratId) {
          this.loadDelegations(this.demande.gouvernoratId, true);
        }
      },
      error: (err) => {
        console.error("Erreur loadDemande :", err);
        this.router.navigate(['/formulaire/listDemandes']);
      }
    });
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onGouvernoratChange(): void {
    const govId = this.demande.gouvernoratId;

    this.demande.delegationId = null;

    if (govId) {
      this.loadDelegations(govId);
    } else {
      this.delegationsFiltered = [];
    }
  }

  loadDelegations(gouvernoratId: number, fromEdit = false): void {
    this.delegationService.getDelegationsByGouvernorat(gouvernoratId).subscribe({
      next: (delegations) => {
        this.delegationsFiltered = delegations;

        if (fromEdit) {
          console.log("Pré-sélection délégation :", this.demande.delegationId);
        }
      },
      error: () => {
        this.delegationsFiltered = [];
      }
    });
  }

  onSubmit(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('sidra_token')}`
    });

    // Corriger champs envoyés au backend
    this.demande.gouvernorat = this.demande.gouvernoratId;
    this.demande.delegation = this.demande.delegationId;

    if (this.isEditMode && this.demandeId) {
      this.http.put(`${this.apiUrl}/demandes/${this.demandeId}`, this.demande, { headers })
          .subscribe({
            next: () => {
              alert("Demande modifiée avec succès");
              this.router.navigate(['/formulaire/listDemandes']);
            }
          });
    } else {
      this.http.post(`${this.apiUrl}/demandes`, this.demande, { headers })
          .subscribe({
            next: () => {
              alert("Demande créée avec succès");
              this.router.navigate(['/formulaire/listDemandes']);
            }
          });
    }
  }

  annuler(): void {
    this.router.navigate(['/formulaire/listDemandes']);
  }
}
