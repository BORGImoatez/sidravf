// liste-demandes.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {environment} from "../../../../../environments/environment";

interface DemandePriseEnChargeDto {
  id: number;
  nom: string;
  prenom: string;
  genre: string;
  dateNaissance: string;
  gouvernoratLibelle: string;
  delegationLibelle: string;
  auteurType: string;
  lienAvecPatient?: string;
  cinAuteur: string;
  typeCertificat: string;
  etablissementPublic?: string;
  gouvernoratEtablissement?: string;
  dateCommission: string;
  decision: string;
  etablissementPriseEnCharge?: string;
  priseEnChargeMethadone?: boolean;
  piecesManquantes?: string;
  motifRefus?: string;
  addedBy: string;
  dateCreation: string;
}

@Component({
  selector: 'app-liste-demandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './liste-demandes.component.html',
  styleUrls: ['./liste-demandes.component.css']
})
export class ListeDemandesComponent implements OnInit {
  demandes: DemandePriseEnChargeDto[] = [];
  demandesFiltrees: DemandePriseEnChargeDto[] = [];
  loading = false;
  searchTerm = '';
  filtreDecision = '';
  private apiUrl = environment.apiUrl; // Ou utilisez environment.apiUrl

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.chargerDemandes();
  }

  async chargerDemandes(): Promise<void> {
    this.loading = true;
    try {
      const response = await fetch(`${this.apiUrl}/demandes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sidra_token')}`
        }
      });

      if (response.ok) {
        this.demandes = await response.json();
        this.demandesFiltrees = [...this.demandes];
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      alert('Erreur lors du chargement des demandes');
    } finally {
      this.loading = false;
    }
  }

  filtrer(): void {
    this.demandesFiltrees = this.demandes.filter(d => {
      const matchSearch = !this.searchTerm ||
          d.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          d.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          d.cinAuteur.includes(this.searchTerm);

      const matchDecision = !this.filtreDecision || d.decision === this.filtreDecision;

      return matchSearch && matchDecision;
    });
  }

  modifier(id: number): void {
    this.router.navigate(['/formulaire/demande', id]);
  }

  async supprimer(id: number): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/demandes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sidra_token')}`
        }
      });

      if (response.ok) {
        alert('Demande supprimée avec succès');
        this.chargerDemandes();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  }

  telechargerPDF(demande: DemandePriseEnChargeDto): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // En-tête
    doc.setFillColor(65, 105, 225);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('DEMANDE DE PRISE EN CHARGE', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.text('Bureau National des Stupéfiants', pageWidth / 2, 25, { align: 'center' });
    doc.text(`Référence: ${demande.id}/${new Date().getFullYear()}`, pageWidth / 2, 32, { align: 'center' });

    yPos = 50;
    doc.setTextColor(0, 0, 0);

    // Informations du patient
    this.ajouterSection(doc, 'INFORMATIONS DU PATIENT', yPos);
    yPos += 10;

    const infosPatient = [
      ['Nom et Prénom', `${demande.nom} ${demande.prenom}`],
      ['Genre', demande.genre],
      ['Date de naissance', this.formatDate(demande.dateNaissance)],
      ['Gouvernorat', demande.gouvernoratLibelle || '-'],
      ['Délégation', demande.delegationLibelle || '-']
    ];

    yPos = this.ajouterTableau(doc, infosPatient, yPos);
    yPos += 5;

    // Auteur de la demande
    this.ajouterSection(doc, 'AUTEUR DE LA DEMANDE', yPos);
    yPos += 10;

    const infosAuteur = [
      ['Type d\'auteur', this.getAuteurTypeLabel(demande.auteurType)],
      ['CIN de l\'auteur', demande.cinAuteur]
    ];

    yPos = this.ajouterTableau(doc, infosAuteur, yPos);
    yPos += 5;

    // Certificat médical
    this.ajouterSection(doc, 'CERTIFICAT MÉDICAL', yPos);
    yPos += 10;

    const infosCertificat = [
      ['Type', demande.typeCertificat === 'public' ? 'Public' : 'Privé'],
      ['Établissement', demande.etablissementPublic || '-'],
      ['Gouvernorat établissement', demande.gouvernoratEtablissement || '-']
    ];

    yPos = this.ajouterTableau(doc, infosCertificat, yPos);
    yPos += 5;

    // Commission et décision
    this.ajouterSection(doc, 'COMMISSION ET DÉCISION', yPos);
    yPos += 10;

    const infosCommission = [
      ['Date de commission', this.formatDate(demande.dateCommission)],
      ['Décision', this.getDecisionLabel(demande.decision)]
    ];

    if (demande.decision === 'complet_favorable') {
      infosCommission.push(['Établissement de prise en charge', demande.etablissementPriseEnCharge || '-']);
      infosCommission.push(['Prise en charge méthadone', demande.priseEnChargeMethadone ? 'Oui' : 'Non']);
    } else if (demande.decision === 'incomplet_favorable_reserve') {
      infosCommission.push(['Pièces manquantes', demande.piecesManquantes || '-']);
    } else if (demande.decision === 'defavorable') {
      infosCommission.push(['Motif du refus', demande.motifRefus || '-']);
    }

    yPos = this.ajouterTableau(doc, infosCommission, yPos);
    yPos += 10;

    // Informations administratives
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Demande créée le ${this.formatDate(demande.dateCreation)} par ${demande.addedBy}`, 14, yPos);

    // Pied de page avec cachet
    const footerY = pageHeight - 40;
    doc.setDrawColor(65, 105, 225);
    doc.setLineWidth(0.5);
    doc.line(14, footerY, pageWidth - 14, footerY);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('BUREAU NATIONAL DES STUPÉFIANTS', pageWidth / 2, footerY + 8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('bureau national des stupéfiants - République Tunisienne', pageWidth / 2, footerY + 18, { align: 'center' });

    // Cadre pour cachet
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.rect(pageWidth - 60, footerY + 5, 40, 20);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Cachet et signature', pageWidth - 40, footerY + 16, { align: 'center' });

    // Télécharger le PDF
    doc.save(`Demande_${demande.nom}_${demande.prenom}_${demande.id}.pdf`);
  }

  public ajouterSection(doc: jsPDF, titre: string, y: number): void {
    doc.setFillColor(240, 240, 240);
    doc.rect(14, y, doc.internal.pageSize.getWidth() - 28, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(65, 105, 225);
    doc.text(titre, 16, y + 5.5);
  }

  public ajouterTableau(doc: jsPDF, data: string[][], y: number): number {
    autoTable(doc, {
      startY: y,
      head: [],
      body: data,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60, fillColor: [250, 250, 250] },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 14, right: 14 }
    });

    return (doc as any).lastAutoTable.finalY + 5;
  }

  public formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  public getAuteurTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'lui_meme': 'Lui-même',
      'mere': 'Mère',
      'pere': 'Père',
      'autre': 'Autre personne'
    };
    return labels[type] || type;
  }

  public getDecisionLabel(decision: string): string {
    const labels: { [key: string]: string } = {
      'complet_favorable': 'Dossier complet - Avis favorable',
      'incomplet_favorable_reserve': 'Dossier incomplet - Avis favorable sous réserve',
      'defavorable': 'Avis défavorable'
    };
    return labels[decision] || decision;
  }

  getDecisionClass(decision: string): string {
    if (decision === 'complet_favorable') return 'badge-success';
    if (decision === 'incomplet_favorable_reserve') return 'badge-warning';
    if (decision === 'defavorable') return 'badge-danger';
    return 'badge-secondary';
  }

  nouvelleDemande(): void {
    this.router.navigate(['formulaire/demandes/nouvelle']);
  }

  getCountByDecision(decision: string): number {
    return this.demandes.filter(d => d.decision === decision).length;
  }
}
