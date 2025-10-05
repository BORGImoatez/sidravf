import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormulaireData } from '../../../models/formulaire.model';

@Component({
  selector: 'app-step7',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="step-container card">
      <div class="card-header">
        <h2 class="step-title">Étape 7 : Conduite à tenir thérapeutique</h2>
        <p class="step-description">
          Informations sur la prise en charge thérapeutique du patient
        </p>
      </div>

      <div class="card-body">
        <form class="step-form">
          <div class="form-section">
            <h3 class="section-title">Le patient est référé pour une prise en charge spécifique</h3>

            <!-- Question 40.1 - Prise en charge médicale -->
            <div class="form-group">
              <h4 class="subsection-title">40.1) Médicale</h4>

              <div class="form-group">
                <label class="form-label required">Prise en charge médicale</label>
                <div class="radio-options">
                  <label class="radio-option">
                    <input
                        type="radio"
                        name="priseEnChargeMedicale"
                        [value]="true"
                        [(ngModel)]="localData.conduiteATenir!.priseEnChargeMedicale"
                        (change)="onFieldChange()"
                    >
                    <span class="radio-text">1. Oui</span>
                  </label>
                  <label class="radio-option">
                    <input
                        type="radio"
                        name="priseEnChargeMedicale"
                        [value]="false"
                        [(ngModel)]="localData.conduiteATenir!.priseEnChargeMedicale"
                        (change)="onFieldChange()"
                    >
                    <span class="radio-text">2. Non</span>
                  </label>
                </div>
                <div *ngIf="showValidationErrors && localData.conduiteATenir!.priseEnChargeMedicale === undefined" class="form-error">
                  Ce champ est obligatoire
                </div>
              </div>

              <!-- Si oui, précision médicale -->
              <div class="conditional-field" *ngIf="localData.conduiteATenir!.priseEnChargeMedicale === true">
                <label class="form-label required">Si oui, à préciser</label>
                <textarea
                    class="form-input"
                    [class.error]="showValidationErrors && !localData.conduiteATenir!.priseEnChargeMedicalePrecision"
                    [(ngModel)]="localData.conduiteATenir!.priseEnChargeMedicalePrecision"
                    name="priseEnChargeMedicalePrecision"
                    placeholder="Préciser la prise en charge médicale"
                    rows="3"
                    (input)="onFieldChange()"
                ></textarea>
                <div *ngIf="showValidationErrors && !localData.conduiteATenir!.priseEnChargeMedicalePrecision" class="form-error">
                  Ce champ est obligatoire
                </div>
              </div>

              <!-- Hospitalisation -->
              <div class="form-group nested" *ngIf="localData.conduiteATenir!.priseEnChargeMedicale === true">
                <label class="form-label required">Hospitalisation</label>
                <div class="radio-options">
                  <label class="radio-option">
                    <input
                        type="radio"
                        name="hospitalisation"
                        [value]="true"
                        [(ngModel)]="localData.conduiteATenir!.hospitalisation"
                        (change)="onFieldChange()"
                    >
                    <span class="radio-text">1. Oui</span>
                  </label>
                  <label class="radio-option">
                    <input
                        type="radio"
                        name="hospitalisation"
                        [value]="false"
                        [(ngModel)]="localData.conduiteATenir!.hospitalisation"
                        (change)="onFieldChange()"
                    >
                    <span class="radio-text">2. Non</span>
                  </label>
                </div>
                <div *ngIf="showValidationErrors && localData.conduiteATenir!.hospitalisation === undefined" class="form-error">
                  Ce champ est obligatoire
                </div>
              </div>

              <!-- RDV consultation externe addictologie -->
              <div class="form-group nested" *ngIf="localData.conduiteATenir!.priseEnChargeMedicale === true">
                <label class="form-label required">RDV à la consultation externe d'addictologie</label>
                <div class="radio-options">
                  <label class="radio-option">
                    <input
                        type="radio"
                        name="rdvConsultationExterne"
                        [value]="true"
                        [(ngModel)]="localData.conduiteATenir!.rdvConsultationExterne"
                        (change)="onFieldChange()"
                    >
                    <span class="radio-text">1. Oui</span>
                  </label>
                  <label class="radio-option">
                    <input
                        type="radio"
                        name="rdvConsultationExterne"
                        [value]="false"
                        [(ngModel)]="localData.conduiteATenir!.rdvConsultationExterne"
                        (change)="onFieldChange()"
                    >
                    <span class="radio-text">2. Non</span>
                  </label>
                </div>
                <div *ngIf="showValidationErrors && localData.conduiteATenir!.rdvConsultationExterne === undefined" class="form-error">
                  Ce champ est obligatoire
                </div>
              </div>
            </div>

            <!-- Question 40.2 - Prise en charge psychologique -->
            <div class="form-group">
              <h4 class="subsection-title">40.2) Psychologique</h4>

              <div class="form-group">
                <label class="form-label required">Prise en charge psychologique</label>
                <div class="radio-options">
                  <label class="radio-option">
                    <input
                        type="radio"
                        name="priseEnChargePsychologique"
                        [value]="true"
                        [(ngModel)]="localData.conduiteATenir!.priseEnChargePsychologique"
                        (change)="onFieldChange()"
                    >
                    <span class="radio-text">1. Oui</span>
                  </label>
                  <label class="radio-option">
                    <input
                        type="radio"
                        name="priseEnChargePsychologique"
                        [value]="false"
                        [(ngModel)]="localData.conduiteATenir!.priseEnChargePsychologique"
                        (change)="onFieldChange()"
                    >
                    <span class="radio-text">2. Non</span>
                  </label>
                </div>
                <div *ngIf="showValidationErrors && localData.conduiteATenir!.priseEnChargePsychologique === undefined" class="form-error">
                  Ce champ est obligatoire
                </div>
              </div>

              <!-- Si oui, précision psychologique -->
              <div class="conditional-field" *ngIf="localData.conduiteATenir!.priseEnChargePsychologique === true">
                <label class="form-label required">Si oui, à préciser</label>
                <textarea
                    class="form-input"
                    [class.error]="showValidationErrors && !localData.conduiteATenir!.priseEnChargePsychologiquePrecision"
                    [(ngModel)]="localData.conduiteATenir!.priseEnChargePsychologiquePrecision"
                    name="priseEnChargePsychologiquePrecision"
                    placeholder="Préciser la prise en charge psychologique"
                    rows="3"
                    (input)="onFieldChange()"
                ></textarea>
                <div *ngIf="showValidationErrors && !localData.conduiteATenir!.priseEnChargePsychologiquePrecision" class="form-error">
                  Ce champ est obligatoire
                </div>
              </div>
            </div>

            <!-- Question 40.3 - Prise en charge sociale -->
            <div class="form-group">
              <h4 class="subsection-title">40.3) Sociale</h4>

              <div class="form-group">
                <label class="form-label required">Prise en charge sociale</label>
                <div class="radio-options">
                  <label class="radio-option">
                    <input
                        type="radio"
                        name="priseEnChargeSociale"
                        [value]="true"
                        [(ngModel)]="localData.conduiteATenir!.priseEnChargeSociale"
                        (change)="onFieldChange()"
                    >
                    <span class="radio-text">1. Oui</span>
                  </label>
                  <label class="radio-option">
                    <input
                        type="radio"
                        name="priseEnChargeSociale"
                        [value]="false"
                        [(ngModel)]="localData.conduiteATenir!.priseEnChargeSociale"
                        (change)="onFieldChange()"
                    >
                    <span class="radio-text">2. Non</span>
                  </label>
                </div>
                <div *ngIf="showValidationErrors && localData.conduiteATenir!.priseEnChargeSociale === undefined" class="form-error">
                  Ce champ est obligatoire
                </div>
              </div>

              <!-- Si oui, précision sociale -->
              <div class="conditional-field" *ngIf="localData.conduiteATenir!.priseEnChargeSociale === true">
                <label class="form-label required">Si oui, à préciser</label>
                <textarea
                    class="form-input"
                    [class.error]="showValidationErrors && !localData.conduiteATenir!.priseEnChargeSocialePrecision"
                    [(ngModel)]="localData.conduiteATenir!.priseEnChargeSocialePrecision"
                    name="priseEnChargeSocialePrecision"
                    placeholder="Préciser la prise en charge sociale"
                    rows="3"
                    (input)="onFieldChange()"
                ></textarea>
                <div *ngIf="showValidationErrors && !localData.conduiteATenir!.priseEnChargeSocialePrecision" class="form-error">
                  Ce champ est obligatoire
                </div>
              </div>
            </div>

            <!-- Récapitulatif final -->
            <div class="completion-summary">
              <h4 class="summary-title">Récapitulatif complet du formulaire</h4>
              <p class="summary-text">
                Vous avez terminé la saisie de toutes les sections du formulaire SIDRA.
                Vérifiez que toutes les informations sont correctes avant de valider.
              </p>

              <div class="summary-sections">
                <div class="summary-item">
                  <span class="summary-icon">✅</span>
                  <span class="summary-label">Informations structure/centre & usager SPA</span>
                </div>
                <div class="summary-item">
                  <span class="summary-icon">✅</span>
                  <span class="summary-label">Consommation tabac & alcool</span>
                </div>
                <div class="summary-item">
                  <span class="summary-icon">✅</span>
                  <span class="summary-label">Consommation de substances psychoactives</span>
                </div>
                <div class="summary-item">
                  <span class="summary-icon">✅</span>
                  <span class="summary-label">Comportements liés à la consommation et tests de dépistage</span>
                </div>
                <div class="summary-item">
                  <span class="summary-icon">✅</span>
                  <span class="summary-label">Comorbidités</span>
                </div>
                <div class="summary-item">
                  <span class="summary-icon">✅</span>
                  <span class="summary-label">Décès induit par les SPA dans l'entourage</span>
                </div>
                <div class="summary-item">
                  <span class="summary-icon">✅</span>
                  <span class="summary-label">Conduite à tenir thérapeutique</span>
                </div>
              </div>

              <div class="final-note">
                <p>
                  <strong>Prochaine étape :</strong> Cliquez sur "Valider le formulaire" pour enregistrer
                  définitivement les données et générer l'IUN (Identifiant Unique National).
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .step-container {
      margin-bottom: var(--spacing-6);
    }

    .step-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0 0 var(--spacing-2) 0;
    }

    .step-description {
      color: var(--gray-600);
      margin: 0;
    }

    .form-section {
      margin-bottom: var(--spacing-8);
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0 0 var(--spacing-6) 0;
      padding-bottom: var(--spacing-3);
      border-bottom: 2px solid var(--primary-200);
    }

    .subsection-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--gray-800);
      margin: 0 0 var(--spacing-4) 0;
      padding-bottom: var(--spacing-2);
      border-bottom: 1px solid var(--gray-300);
    }

    .form-group {
      margin-bottom: var(--spacing-6);
    }

    .conditional-field {
      margin-left: var(--spacing-6);
      padding-left: var(--spacing-4);
      border-left: 3px solid var(--primary-200);
      background-color: var(--gray-50);
      padding: var(--spacing-4);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-4);
      animation: slideIn 0.3s ease-out;
    }

    .nested {
      margin-left: var(--spacing-6);
      padding-left: var(--spacing-4);
      border-left: 2px solid var(--primary-300);
      background-color: var(--primary-50);
      padding: var(--spacing-3);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-4);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .radio-options {
      display: flex;
      gap: var(--spacing-6);
      flex-wrap: wrap;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      cursor: pointer;
    }

    .radio-option input[type="radio"] {
      width: 16px;
      height: 16px;
      accent-color: var(--primary-600);
    }

    .radio-text {
      font-weight: 500;
      color: var(--gray-700);
    }

    .form-input.error {
      border-color: var(--error-500);
      background-color: var(--error-50);
    }

    .form-error {
      margin-top: var(--spacing-2);
      font-size: 12px;
      color: var(--error-500);
      font-weight: 500;
    }

    .form-input[rows] {
      resize: vertical;
      min-height: 80px;
    }

    .completion-summary {
      margin-top: var(--spacing-8);
      padding: var(--spacing-6);
      background: linear-gradient(135deg, var(--success-500), var(--primary-50));
      border: 1px solid var(--success-100);
      border-radius: var(--radius-lg);
    }

    .summary-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0 0 var(--spacing-3) 0;
    }

    .summary-text {
      color: var(--gray-700);
      margin: 0 0 var(--spacing-6) 0;
      line-height: 1.5;
    }

    .summary-sections {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--spacing-3);
      margin-bottom: var(--spacing-6);
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      background-color: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--success-200);
    }

    .summary-icon {
      font-size: 16px;
      color: var(--success-600);
    }

    .summary-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--gray-800);
    }

    .final-note {
      padding: var(--spacing-4);
      background-color: var(--primary-100);
      border-radius: var(--radius-md);
      border: 1px solid var(--primary-300);
    }

    .final-note p {
      margin: 0;
      font-size: 14px;
      color: var(--primary-800);
      line-height: 1.5;
    }

    .final-note strong {
      color: var(--primary-800);
    }

    @media (max-width: 768px) {
      .conditional-field {
        margin-left: var(--spacing-3);
        padding-left: var(--spacing-3);
      }

      .nested {
        margin-left: var(--spacing-3);
        padding-left: var(--spacing-3);
      }

      .radio-options {
        flex-direction: column;
        gap: var(--spacing-3);
      }

      .completion-summary {
        padding: var(--spacing-4);
      }
    }
  `]
})
export class Step7Component implements OnInit, OnChanges {
  @Input() data: Partial<FormulaireData> = {};
  @Output() dataChange = new EventEmitter<Partial<FormulaireData>>();
  @Output() validationChange = new EventEmitter<boolean>();

  localData: Partial<FormulaireData> = {};
  @Input() showValidationErrors = false;

  ngOnInit(): void {
    this.initializeData();
  }

  ngOnChanges(): void {
    this.initializeData();
  }

  private initializeData(): void {
    this.localData = {
      ...this.data,
      conduiteATenir: this.data.conduiteATenir || {}
    };
    this.validateStep();
  }

  onFieldChange(): void {
    // Nettoyer les champs conditionnels si les conditions ne sont plus remplies
    if (this.localData.conduiteATenir?.priseEnChargeMedicale === false) {
      this.localData.conduiteATenir.priseEnChargeMedicalePrecision = undefined;
      this.localData.conduiteATenir.hospitalisation = undefined;
      this.localData.conduiteATenir.rdvConsultationExterne = undefined;
    }

    if (this.localData.conduiteATenir?.priseEnChargePsychologique === false) {
      this.localData.conduiteATenir.priseEnChargePsychologiquePrecision = undefined;
    }

    if (this.localData.conduiteATenir?.priseEnChargeSociale === false) {
      this.localData.conduiteATenir.priseEnChargeSocialePrecision = undefined;
    }

    this.dataChange.emit(this.localData);
    this.validateStep();
  }

  private validateStep(): void {
    let isValid = true;

    // Validation des champs obligatoires de base
    if (this.localData.conduiteATenir?.priseEnChargeMedicale === undefined ||
        this.localData.conduiteATenir?.priseEnChargePsychologique === undefined ||
        this.localData.conduiteATenir?.priseEnChargeSociale === undefined) {
      isValid = false;
    }

    // Validation des champs conditionnels pour la prise en charge médicale
    if (this.localData.conduiteATenir?.priseEnChargeMedicale === true) {
      if (!this.localData.conduiteATenir?.priseEnChargeMedicalePrecision ||
          this.localData.conduiteATenir?.priseEnChargeMedicalePrecision.trim() === '') {
        isValid = false;
      }

      if (this.localData.conduiteATenir?.hospitalisation === undefined ||
          this.localData.conduiteATenir?.rdvConsultationExterne === undefined) {
        isValid = false;
      }
    }

    // Validation des champs conditionnels pour la prise en charge psychologique
    if (this.localData.conduiteATenir?.priseEnChargePsychologique === true &&
        (!this.localData.conduiteATenir?.priseEnChargePsychologiquePrecision ||
            this.localData.conduiteATenir?.priseEnChargePsychologiquePrecision.trim() === '')) {
      isValid = false;
    }

    // Validation des champs conditionnels pour la prise en charge sociale
    if (this.localData.conduiteATenir?.priseEnChargeSociale === true &&
        (!this.localData.conduiteATenir?.priseEnChargeSocialePrecision ||
            this.localData.conduiteATenir?.priseEnChargeSocialePrecision.trim() === '')) {
      isValid = false;
    }

    console.log('Validation Step 7:', {
      priseEnChargeMedicale: this.localData.conduiteATenir?.priseEnChargeMedicale,
      priseEnChargePsychologique: this.localData.conduiteATenir?.priseEnChargePsychologique,
      priseEnChargeSociale: this.localData.conduiteATenir?.priseEnChargeSociale,
      isValid: isValid
    });
    this.validationChange.emit(isValid);
  }
}
