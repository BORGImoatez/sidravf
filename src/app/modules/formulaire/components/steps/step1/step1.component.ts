import {Component, Input, Output, EventEmitter, OnInit, OnChanges} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {UserService} from '../../../../../services/user.service';
import {AuthService} from '../../../../../services/auth.service';
import {DelegationService, Delegation} from '../../../../../services/delegation.service';
import {FormulaireData} from '../../../models/formulaire.model';
import {UserStructureInfo, TypeStructure, Gouvernorat} from '../../../../../models/user.model';
import {CountryService, Country} from '../../../../../services/country.service';

@Component({
    selector: 'app-step1',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="step-container card">
            <div class="card-header">
                <h2 class="step-title">Étape 1 : Informations structure/centre & usager SPA</h2>
                <p class="step-description">
                    Renseignez les informations sur la structure et l'usager SPA
                </p>
            </div>

            <div class="card-body">
                <form class="step-form">
                    <!-- Section Structure -->
                    <div class="form-section">
                        <h3 class="section-title">Informations sur la structure</h3>

                        <div class="form-fields">
                            <!-- IUN (réservé à l'INSP) -->
                            <div class="form-group">
                                <label class="form-label">IUN (réservé à l'INSP, identifiant unique national généré
                                    systématiquement par
                                    la plateforme)</label>
                                <input
                                        type="text"
                                        class="form-input"
                                        [(ngModel)]="localData.iun"
                                        name="iun"
                                        placeholder="Généré automatiquement"
                                        readonly
                                        disabled
                                >
                            </div>

                            <!-- 1) Secteur -->
                            <div class="form-group">
                                <label class="form-label required">1) Secteur</label>
                                <div class="checkbox-options">
                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.secteur === 'PUBLIC'"
                                                (change)="onSecteurChange('PUBLIC')"
                                                name="secteurPublic"
                                                [disabled]="userStructureInfo?.hasStructure"
                                        >
                                        <span class="checkbox-text">1. Public</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.secteur === 'PRIVE'"
                                                (change)="onSecteurChange('PRIVE')"
                                                name="secteurPrive"
                                                [disabled]="userStructureInfo?.hasStructure"
                                        >
                                        <span class="checkbox-text">2. Privé</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.secteur === 'ONG'"
                                                (change)="onSecteurChange('ONG')"
                                                name="secteurOng"
                                                [disabled]="userStructureInfo?.hasStructure"
                                        >
                                        <span class="checkbox-text">3. Société civile (ONG)</span>
                                    </label>
                                </div>
                                <div *ngIf="showValidationErrors && !localData.secteur" class="form-error">
                                    Le secteur est requis
                                </div>
                            </div>

                            <!-- 1.a) Si ONG, préciser -->
                            <div class="form-group sub-field" *ngIf="localData.secteur === 'ONG'">
                                <label class="form-label required">1.a) ONG</label>
                                <input
                                        type="text"
                                        class="form-input"
                                        [(ngModel)]="localData.ongPrecision"
                                        name="ministere"
                                        placeholder="Nom de la structure"
                                        (input)="onFieldChange()"
                                        [class.error]="showValidationErrors && localData.secteur === 'ONG' && !localData.ongPrecision"
                                        [disabled]="!!userStructureInfo?.hasStructure"
                                >

                                <div *ngIf="showValidationErrors && localData.secteur === 'ONG' && !localData.ongPrecision"
                                     class="form-error">
                                    La précision ONG est requise
                                </div>
                            </div>

                            <!-- 2) Ministère -->
                            <div class="form-group" *ngIf="localData.secteur === 'PUBLIC'">
                                <label class="form-label">2) Ministère</label>
                                <input
                                        type="text"
                                        class="form-input"
                                        [(ngModel)]="localData.ministere"
                                        name="ministere"
                                        placeholder="Nom de la structure"
                                        (input)="onFieldChange()"
                                        [class.error]="showValidationErrors && !localData.structure"
                                        [disabled]="!!userStructureInfo?.hasStructure"
                                >
                            </div>

                            <!-- 3) Structure / Centre -->
                            <div *ngIf="localData.structure" class="form-group">
                                <label class="form-label required">3) Structure / Centre</label>
                                <input
                                        type="text"
                                        class="form-input"
                                        [(ngModel)]="localData.structure"
                                        name="structure"
                                        placeholder="Nom de la structure"
                                        (input)="onFieldChange()"
                                        [class.error]="showValidationErrors && !localData.structure"
                                        [disabled]="!!userStructureInfo?.hasStructure"
                                >
                                <div *ngIf="showValidationErrors && !localData.structure" class="form-error">
                                    La structure est requise
                                </div>
                            </div>

                            <!-- 3.a) Gouvernorat de la structure -->

                        </div>
                    </div>

                    <!-- Section Usager -->
                    <div class="form-section">
                        <h3 class="section-title">Informations sur l'usager SPA</h3>

                        <div class="form-fields">
                            <!-- Nom -->
                            <div class="form-group">
                                <label class="form-label">Nom</label>
                                <input
                                        type="text"
                                        class="form-input"
                                        name="nom"
                                        placeholder="Nom de famille"
                                        (input)="onFieldChange()"
                                >
                            </div>

                            <!-- Prénom -->
                            <div class="form-group">
                                <label class="form-label">Prénom</label>
                                <input
                                        type="text"
                                        class="form-input"
                                        [(ngModel)]="localData.prenom"
                                        name="prenom"
                                        placeholder="Prénom"
                                        (input)="onFieldChange()"
                                >
                            </div>

                            <!-- Code du patient -->


                            <!-- 4) Date de consultation -->
                            <div class="form-group">
                                <label class="form-label required">4) Date de la consultation/entretien</label>
                                <input
                                        type="text"
                                        class="form-input"
                                        [(ngModel)]="today"
                                        name="dateConsultation"


                                        [class.error]="showValidationErrors && !localData.dateConsultation"
                                        disabled
                                >
                                <div *ngIf="showValidationErrors && !localData.dateConsultation" class="form-error">
                                    La date de consultation est requise
                                </div>
                            </div>

                            <!-- 5) Genre -->
                            <div class="form-group">
                                <label class="form-label required">5) Genre</label>
                                <div class="radio-options">
                                    <label class="radio-label">
                                        <input
                                                type="radio"
                                                name="genre"
                                                value="HOMME"
                                                [(ngModel)]="localData.genre"
                                                (change)="onFieldChange()"
                                        >
                                        <span class="radio-text">1. Homme</span>
                                    </label>
                                    <label class="radio-label">
                                        <input
                                                type="radio"
                                                name="genre"
                                                value="FEMME"
                                                [(ngModel)]="localData.genre"
                                                (change)="onFieldChange()"
                                        >
                                        <span class="radio-text">2. Femme</span>
                                    </label>
                                </div>
                                <div *ngIf="showValidationErrors && !localData.genre" class="form-error">
                                    Le genre est requis
                                </div>
                            </div>

                            <!-- 6) Date de naissance -->
                            <div class="form-group">
                                <label class="form-label required">6) Date de naissance complète</label>
                                <input
                                        type="date"
                                        class="form-input"
                                        [max]="maxBirthDate"
                                        [class.error]="showValidationErrors && !isValidDateNaissance()"
                                        [(ngModel)]="localData.dateNaissance"
                                        name="dateNaissance"
                                        placeholder="JJ-MM-AAAA (seule l'année est obligatoire)"
                                        (input)="onFieldChange()"
                                >
                                <div *ngIf="showValidationErrors && !isValidDateNaissance()" class="form-error">
                                    L'année de naissance est obligatoire (format JJ-MM-AAAA)
                                </div>
                            </div>

                            <!-- 7) Nationalité -->
                            <div class="form-group">
                                <label class="form-label required">7) Nationalité</label>
                                <div class="dropdown-container">
                                    <div class="dropdown-input-group">
                                        <input
                                                type="text"
                                                class="form-input"
                                                [class.error]="showValidationErrors && !localData.nationalite"
                                                [(ngModel)]="localData.nationalite"
                                                name="nationalite"
                                                placeholder="Rechercher un pays..."
                                                (input)="onSearchCountry($event)"
                                                (focus)="toggleCountryDropdown()"
                                                autocomplete="off"
                                        >
                                        <button
                                                type="button"
                                                class="dropdown-toggle-btn"
                                                (click)="toggleCountryDropdown()"
                                        >
                                            <span>▼</span>
                                        </button>
                                    </div>
                                    <div class="dropdown-menu" *ngIf="showCountryDropdown">
                                        <div class="dropdown-item" *ngFor="let country of filteredCountries"
                                             (click)="selectCountry(country)">
                                            <span class="country-code">{{ country.codeIso3 }}</span>
                                            <span class="country-name">{{ country.nom }}</span>
                                        </div>
                                        <div class="dropdown-no-results" *ngIf="filteredCountries.length === 0">
                                            Aucun pays trouvé
                                        </div>
                                    </div>
                                </div>
                                <div *ngIf="showValidationErrors && !localData.nationalite" class="form-error">
                                    La nationalité est requise
                                </div>
                            </div>
                            <!-- Question 8 - Couverture sociale -->
                            <div class="form-group">
                                <label class="form-label required">8) Couverture sociale</label>
                                <div class="radio-options">
                                    <label class="radio-option">
                                        <input
                                                type="radio"
                                                name="couvertureSociale"
                                                [value]="true"
                                                [(ngModel)]="localData.couvertureSociale"
                                                (change)="onFieldChange()"
                                        >
                                        <span class="radio-text">1. Oui</span>
                                    </label>
                                    <label class="radio-option">
                                        <input
                                                type="radio"
                                                name="couvertureSociale"
                                                [value]="false"
                                                [(ngModel)]="localData.couvertureSociale"
                                                (change)="onFieldChange()"
                                        >
                                        <span class="radio-text">2. Non</span>
                                    </label>
                                </div>
                                <div *ngIf="showValidationErrors && localData.couvertureSociale === undefined"
                                     class="form-error">
                                    Ce champ est obligatoire
                                </div>
                            </div>

                            <!-- Question 8.a - Si oui, type de couverture -->
                            <div class="form-group conditional-field" *ngIf="localData.couvertureSociale === true">
                                <label class="form-label required">8.a) Si oui, type de couverture</label>
                                <div class="checkbox-options">
                                    <label class="checkbox-option"
                                           [class.selected]="localData.typeCouvertureSociale === 'CNAM'">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.typeCouvertureSociale === 'CNAM'"
                                                (change)="selectTypeCouverture('CNAM')"
                                        >
                                        <span class="checkbox-text">1. CNAM</span>
                                    </label>
                                    <label class="checkbox-option"
                                           [class.selected]="localData.typeCouvertureSociale === 'AUTRE'">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.typeCouvertureSociale === 'AUTRE'"
                                                (change)="selectTypeCouverture('AUTRE')"
                                        >
                                        <span class="checkbox-text">2. Autre</span>
                                    </label>
                                </div>
                                <div *ngIf="showValidationErrors && !localData.typeCouvertureSociale"
                                     class="form-error">
                                    Ce champ est obligatoire
                                </div>
                            </div>

                            <!-- Question 8.b - Si CNAM, type de carnet -->
                            <div class="form-group conditional-field nested"
                                 *ngIf="localData.couvertureSociale === true && localData.typeCouvertureSociale === 'CNAM'">
                                <label class="form-label required">8.b) Type de carnet CNAM</label>
                                <div class="checkbox-options">
                                    <label class="checkbox-option"
                                           [class.selected]="localData.typeCarnetCnam === 'CARTE_INDIGENT'">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.typeCarnetCnam === 'CARTE_INDIGENT'"
                                                (change)="selectTypeCarnetCnam('CARTE_INDIGENT')"
                                        >
                                        <span class="checkbox-text">1. Carte d'indigent 1 ou 2 ou carte AMEN</span>
                                    </label>
                                    <label class="checkbox-option"
                                           [class.selected]="localData.typeCarnetCnam === 'CARNET_SANTE_PUBLIQUE'">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.typeCarnetCnam === 'CARNET_SANTE_PUBLIQUE'"
                                                (change)="selectTypeCarnetCnam('CARNET_SANTE_PUBLIQUE')"
                                        >
                                        <span class="checkbox-text">2. CARNET CNAM de santé publique</span>
                                    </label>
                                    <label class="checkbox-option"
                                           [class.selected]="localData.typeCarnetCnam === 'CARNET_MEDECINE_FAMILLE'">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.typeCarnetCnam === 'CARNET_MEDECINE_FAMILLE'"
                                                (change)="selectTypeCarnetCnam('CARNET_MEDECINE_FAMILLE')"
                                        >
                                        <span class="checkbox-text">3. CARNET CNAM de médecine de famille</span>
                                    </label>
                                    <label class="checkbox-option"
                                           [class.selected]="localData.typeCarnetCnam === 'CARNET_REMBOURSEMENT'">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.typeCarnetCnam === 'CARNET_REMBOURSEMENT'"
                                                (change)="selectTypeCarnetCnam('CARNET_REMBOURSEMENT')"
                                        >
                                        <span class="checkbox-text">4. CARNET CNAM de remboursement</span>
                                    </label>
                                </div>
                                <div *ngIf="showValidationErrors && !localData.typeCarnetCnam" class="form-error">
                                    Ce champ est obligatoire
                                </div>
                            </div>

                            <!-- 8) Résidence -->
                            <div class="form-group">
                                <label class="form-label required">9) Résidence</label>
                                <div class="radio-options">
                                    <label class="radio-label">
                                        <input
                                                type="radio"
                                                name="residence"
                                                value="TUNISIE"
                                                [(ngModel)]="localData.residence"
                                                (change)="onFieldChange()"
                                        >
                                        <span class="radio-text">1. En Tunisie</span>
                                    </label>
                                    <label class="radio-label">
                                        <input
                                                type="radio"
                                                name="residence"
                                                value="ETRANGER"
                                                [(ngModel)]="localData.residence"
                                                (change)="onFieldChange()"
                                        >
                                        <span class="radio-text">2. À l'étranger</span>
                                    </label>
                                </div>
                                <div *ngIf="showValidationErrors && !localData.residence" class="form-error">
                                    La résidence est requise
                                </div>
                            </div>

                            <!-- 8.a) Gouvernorat de résidence -->
                            <div class="form-group sub-field" *ngIf="localData.residence === 'TUNISIE'">
                                <label class="form-label required">9.a) Gouvernorat</label>
                                <select
                                        class="form-select"
                                        [(ngModel)]="localData.gouvernoratResidence"
                                        name="gouvernoratResidence"
                                        (change)="onFieldChange()"
                                        [class.error]="showValidationErrors && localData.residence === 'TUNISIE' && !localData.gouvernoratResidence"
                                >
                                    <option value="">Sélectionner un gouvernorat</option>
                                    <option *ngFor="let gov of gouvernorats" [value]="gov.id">{{ gov.nom }}</option>
                                </select>
                                <div
                                        *ngIf="showValidationErrors && localData.residence === 'TUNISIE' && !localData.gouvernoratResidence"
                                        class="form-error">
                                    Le gouvernorat de résidence est requis
                                </div>
                            </div>

                            <!-- 8.b) Délégation -->
                            <div class="form-group sub-field"
                                 *ngIf="localData.residence === 'TUNISIE' && localData.gouvernoratResidence">
                                <label class="form-label required">9.b) Délégation</label>
                                <select
                                        class="form-select"
                                        [(ngModel)]="localData.delegationResidence"
                                        name="delegationResidence"
                                >
                                    <option value="">Sélectionner une délégation</option>
                                    <option *ngFor="let delegation of delegations" [value]="delegation.id">
                                        {{ delegation.nom }}
                                    </option>
                                </select>
                                <div
                                        *ngIf="showValidationErrors && !localData.delegationResidence"
                                        class="form-error">
                                    La délégation de résidence est requis
                                </div>
                            </div>

                            <!-- 8.c) Pays -->
                            <div class="form-group sub-field" *ngIf="localData.residence === 'ETRANGER'">
                                <label class="form-label required">9.c) Pays</label>
                                <div class="dropdown-container">
                                    <div class="dropdown-input-group">
                                        <input
                                                type="text"
                                                class="form-input"
                                                [class.error]="showValidationErrors && !localData.paysResidence"
                                                [(ngModel)]="localData.paysResidence"
                                                name="paysResidence"
                                                placeholder="Rechercher un pays..."
                                                (input)="onSearchResidenceCountry($event)"
                                                (focus)="toggleResidenceCountryDropdown()"
                                                autocomplete="off"
                                        >
                                        <button
                                                type="button"
                                                class="dropdown-toggle-btn"
                                                (click)="toggleResidenceCountryDropdown()"
                                        >
                                            <span>▼</span>
                                        </button>
                                    </div>
                                    <div class="dropdown-menu" *ngIf="showResidenceCountryDropdown">
                                        <div class="dropdown-item" *ngFor="let country of filteredResidenceCountries"
                                             (click)="selectResidenceCountry(country)">
                                            <span class="country-code">{{ country.codeIso3 }}</span>
                                            <span class="country-name">{{ country.nom }}</span>
                                        </div>
                                        <div class="dropdown-no-results"
                                             *ngIf="filteredResidenceCountries.length === 0">
                                            Aucun pays trouvé
                                        </div>
                                    </div>
                                </div>
                                <div *ngIf="showValidationErrors && !localData.paysResidence" class="form-error">
                                    Le pays de résidence est requis
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 9) Cadre de consultation -->
                    <div class="form-section">
                        <h3 class="section-title">10) Cadre de la consultation/entretien</h3>

                        <div class="form-fields">
                            <div class="form-group">
                                <label class="form-label required">Sélectionnez le cadre principal de
                                    consultation</label>
                                <div class="checkbox-options-vertical">
                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.cadreConsultation?.addictologie === true"
                                                (change)="onCadreConsultationChange('ADDICTOLOGIE',$event)"

                                                name="cadreAddictologie"
                                        >
                                        <span class="checkbox-text">1. Consultation d'addictologie</span>
                                    </label>

                                    <!-- Sous-options pour addictologie -->
                                    <div class="sub-options" *ngIf="localData.cadreConsultation?.addictologie === true">
                                        <label class="checkbox-label sub-label">
                                            <input
                                                    type="checkbox"
                                                    [checked]="localData.cadreConsultation!.addictologieType==='SEVRAGE'"
                                                    name="addictologie"
                                                    (change)="onAddictologieTypeChange('SEVRAGE')"
                                            >
                                            <span class="checkbox-text">1.a. Demande de sevrage</span>
                                        </label>
                                        <label class="checkbox-label sub-label">
                                            <input
                                                    type="checkbox"
                                                    [checked]="localData.cadreConsultation!.addictologieType==='GESTION_ADDICTION'"
                                                    name="addictologieGestion"
                                                    (change)="onAddictologieTypeChange('GESTION_ADDICTION')"
                                            >
                                            <span class="checkbox-text">1.b. Gestion d'une addiction sans substances ou autre</span>
                                        </label>
                                        <label class="checkbox-label sub-label">
                                            <input
                                                    type="checkbox"
                                                    name="addictologieRisque"
                                                    [checked]="localData.cadreConsultation!.addictologieType==='RISQUE_RECHUTE'"
                                                    (change)="onAddictologieTypeChange('RISQUE_RECHUTE')"
                                            >
                                            <span class="checkbox-text">1.c. Risque de glissement ou de rechute</span>
                                        </label>
                                    </div>
                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.cadreConsultation?.psychiatrie === true"
                                                (change)="onCadreConsultationChange('PSYCHIATRIE',$event)"
                                                name="cadrePsychiatrie"
                                        >
                                        <span class="checkbox-text">2. Psychiatrie (troubles mentaux)</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.cadreConsultation?.psychologique === true"
                                                (change)="onCadreConsultationChange('PSYCHOLOGIQUE',$event)"
                                                name="cadrePsychologique"
                                        >
                                        <span class="checkbox-text">3. Consultation psychologique</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.cadreConsultation?.medecineGenerale === true"
                                                (change)="onCadreConsultationChange('MEDECINE_GENERALE',$event)"
                                                name="cadreMedecineGenerale"
                                        >
                                        <span class="checkbox-text">4. Médecine générale, médecine interne</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.cadreConsultation?.neurologique === true"
                                                (change)="onCadreConsultationChange('NEUROLOGIQUE',$event)"
                                                name="cadreNeurologique"
                                        >
                                        <span class="checkbox-text">5. Troubles neurologiques</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.cadreConsultation?.infectieux === true"
                                                (change)="onCadreConsultationChange('INFECTIEUX',$event)"
                                                name="cadreInfectieux"
                                        >
                                        <span class="checkbox-text">6. Problèmes infectieux</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.cadreConsultation?.espaceAmisJeunes === true"
                                                (change)="onCadreConsultationChange('ESPACE_AMIS_JEUNES',$event)"
                                                name="cadreEspaceAmisJeunes"
                                        >
                                        <span class="checkbox-text">7. Espace amis des jeunes</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.cadreConsultation?.echangeMateriel === true"
                                                (change)="onCadreConsultationChange('ECHANGE_MATERIEL',$event)"
                                                name="cadreEchangeMateriel"
                                        >
                                        <span class="checkbox-text">8. Échange/approvisionnement de matériels à usage unique</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.cadreConsultation?.rehabilitation === true"
                                                (change)="onCadreConsultationChange('REHABILITATION',$event)"
                                                name="cadreRehabilitation"
                                        >
                                        <span class="checkbox-text">9. Réhabilitation</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.cadreConsultation?.urgenceMedicale === true"
                                                (change)="onCadreConsultationChange('URGENCE_MEDICALE',$event)"
                                                name="cadreUrgenceMedicale"
                                        >
                                        <span class="checkbox-text">10. Urgence médicale</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.cadreConsultation?.urgenceChirurgicale === true"
                                                (change)="onCadreConsultationChange('URGENCE_CHIRURGICALE',$event)"
                                                name="cadreUrgenceChirurgicale"
                                        >
                                        <span class="checkbox-text">11. Urgence chirurgicale</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.cadreConsultation?.depistage === true"
                                                (change)="onCadreConsultationChange('DEPISTAGE',$event)"
                                                name="cadreDepistage"
                                        >
                                        <span class="checkbox-text">12. Dépistage</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.cadreConsultation?.autre === true"
                                                (change)="onCadreConsultationChange('AUTRE',$event)"
                                                name="cadreAutre"
                                        >
                                        <span class="checkbox-text">13. Autre</span>
                                    </label>

                                    <!-- Précision pour autre -->
                                    <div class="sub-options" *ngIf="localData.cadreConsultation?.autre === true">
                                        <input
                                                type="text"
                                                class="form-input"
                                                [(ngModel)]="localData.cadreConsultation!.autrePrecision"
                                                name="cadreAutrePrecision"
                                                placeholder="13.a Si autre, préciser"
                                                (input)="onFieldChange()"
                                                [class.error]="showValidationErrors && localData.cadreConsultation?.autre === true && !localData.cadreConsultation?.autrePrecision"
                                        >
                                        <div
                                                *ngIf="showValidationErrors && localData.cadreConsultation?.autre === true && !localData.cadreConsultation?.autrePrecision"
                                                class="form-error">
                                            La précision est requise
                                        </div>
                                    </div>
                                </div>
                                <div *ngIf="showValidationErrors && !isAllCadreConsultationFalse()" class="form-error">
                                    Le cadre de consultation est requis
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 10) Origine de la demande -->
                    <div class="form-section">
                        <h3 class="section-title required">11) Origine de la demande</h3>

                        <div class="form-fields">
                            <div class="form-group">
                                <div class="checkbox-options-vertical">
                                    <label class="checkbox-label">
                                        <span class="checkbox-text">1. Lui-même</span>
                                        <div class="radio-inline">
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineLuiMeme"
                                                        value="true"
                                                        [checked]="localData.origineDemande?.luiMeme === true"
                                                        (change)="onOrigineDemandeChange('luiMeme', true)"
                                                >
                                                <span class="radio-text">1. Oui</span>
                                            </label>
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineLuiMeme"
                                                        value="false"
                                                        [checked]="localData.origineDemande?.luiMeme === false"
                                                        (change)="onOrigineDemandeChange('luiMeme', false)"
                                                >
                                                <span class="radio-text">2. Non</span>
                                            </label>
                                        </div>
                                    </label>

                                    <label class="checkbox-label">
                                        <span class="checkbox-text">2. Famille</span>
                                        <div class="radio-inline">
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineFamille"
                                                        value="true"
                                                        [checked]="localData.origineDemande?.famille === true"
                                                        (change)="onOrigineDemandeChange('famille', true)"
                                                >
                                                <span class="radio-text">1. Oui</span>
                                            </label>
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineFamille"
                                                        value="false"
                                                        [checked]="localData.origineDemande?.famille === false"
                                                        (change)="onOrigineDemandeChange('famille', false)"
                                                >
                                                <span class="radio-text">2. Non</span>
                                            </label>
                                        </div>
                                    </label>

                                    <label class="checkbox-label">
                                        <span class="checkbox-text">3. Amis</span>
                                        <div class="radio-inline">
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineAmis"
                                                        value="true"
                                                        [checked]="localData.origineDemande?.amis === true"
                                                        (change)="onOrigineDemandeChange('amis', true)"
                                                >
                                                <span class="radio-text">1. Oui</span>
                                            </label>
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineAmis"
                                                        value="false"
                                                        [checked]="localData.origineDemande?.amis === false"
                                                        (change)="onOrigineDemandeChange('amis', false)"
                                                >
                                                <span class="radio-text">2. Non</span>
                                            </label>
                                        </div>
                                    </label>

                                    <label class="checkbox-label">
                                        <span class="checkbox-text">4. Cellule d'écoute de médecine scolaire et universitaire</span>
                                        <div class="radio-inline">
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineCelluleEcoute"
                                                        value="true"
                                                        [checked]="localData.origineDemande?.celluleEcoute === true"
                                                        (change)="onOrigineDemandeChange('celluleEcoute', true)"
                                                >
                                                <span class="radio-text">1. Oui</span>
                                            </label>
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineCelluleEcoute"
                                                        value="false"
                                                        [checked]="localData.origineDemande?.celluleEcoute === false"
                                                        (change)="onOrigineDemandeChange('celluleEcoute', false)"
                                                >
                                                <span class="radio-text">2. Non</span>
                                            </label>
                                        </div>
                                    </label>

                                    <label class="checkbox-label">
                                        <span class="checkbox-text">5. Adressé par un autre centre</span>
                                        <div class="radio-inline">
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineAutreCentre"
                                                        value="true"
                                                        [checked]="localData.origineDemande?.autreCentre === true"
                                                        (change)="onOrigineDemandeChange('autreCentre', true)"
                                                >
                                                <span class="radio-text">1. Oui</span>
                                            </label>
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineAutreCentre"
                                                        value="false"
                                                        [checked]="localData.origineDemande?.autreCentre === false"
                                                        (change)="onOrigineDemandeChange('autreCentre', false)"
                                                >
                                                <span class="radio-text">2. Non</span>
                                            </label>
                                        </div>
                                    </label>

                                    <label class="checkbox-label">
                                        <span class="checkbox-text">6. Structure sociale</span>
                                        <div class="radio-inline">
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineStructureSociale"
                                                        value="true"
                                                        [checked]="localData.origineDemande?.structureSociale === true"
                                                        (change)="onOrigineDemandeChange('structureSociale', true)"
                                                >
                                                <span class="radio-text">1. Oui</span>
                                            </label>
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineStructureSociale"
                                                        value="false"
                                                        [checked]="localData.origineDemande?.structureSociale === false"
                                                        (change)="onOrigineDemandeChange('structureSociale', false)"
                                                >
                                                <span class="radio-text">2. Non</span>
                                            </label>
                                        </div>
                                    </label>

                                    <label class="checkbox-label">
                                        <span class="checkbox-text">7. Structure judiciaire</span>
                                        <div class="radio-inline">
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineStructureJudiciaire"
                                                        value="true"
                                                        [checked]="localData.origineDemande?.structureJudiciaire === true"
                                                        (change)="onOrigineDemandeChange('structureJudiciaire', true)"
                                                >
                                                <span class="radio-text">1. Oui</span>
                                            </label>
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineStructureJudiciaire"
                                                        value="false"
                                                        [checked]="localData.origineDemande?.structureJudiciaire === false"
                                                        (change)="onOrigineDemandeChange('structureJudiciaire', false)"
                                                >
                                                <span class="radio-text">2. Non</span>
                                            </label>
                                        </div>
                                    </label>


                                    <label class="checkbox-label">
                                        <span class="checkbox-text">8. Le juge de l'enfance</span>
                                        <div class="radio-inline">
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineJugeEnfance"
                                                        value="true"
                                                        [checked]="localData.origineDemande?.jugeEnfance === true"
                                                        (change)="onOrigineDemandeChange('jugeEnfance', true)"
                                                >
                                                <span class="radio-text">1. Oui</span>
                                            </label>
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineJugeEnfance"
                                                        value="false"
                                                        [checked]="localData.origineDemande?.jugeEnfance === false"
                                                        (change)="onOrigineDemandeChange('jugeEnfance', false)"
                                                >
                                                <span class="radio-text">2. Non</span>
                                            </label>
                                        </div>
                                    </label>
                                    <label class="checkbox-label">
                                        <span class="checkbox-text">9. Autre</span>
                                        <div class="radio-inline">
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineAutre"
                                                        value="true"
                                                        [checked]="localData.origineDemande?.autre === true"
                                                        (change)="onOrigineDemandeChange('autre', true)"
                                                >
                                                <span class="radio-text">1. Oui</span>
                                            </label>
                                            <label class="radio-label-inline">
                                                <input
                                                        type="radio"
                                                        name="origineAutre"
                                                        value="false"
                                                        [checked]="localData.origineDemande?.autre === false"
                                                        (change)="onOrigineDemandeChange('autre', false)"
                                                >
                                                <span class="radio-text">2. Non</span>
                                            </label>
                                        </div>
                                    </label>

                                    <!-- Précision pour autre -->
                                    <div class="sub-options" *ngIf="localData.origineDemande?.autre === true">
                                        <input
                                                type="text"
                                                class="form-input"
                                                [(ngModel)]="localData.origineDemande!.autrePrecision"
                                                name="origineAutrePrecision"
                                                placeholder="10. Si autre, préciser"
                                                (input)="onFieldChange()"
                                                [class.error]="showValidationErrors && localData.origineDemande?.autre === true && !localData.origineDemande?.autrePrecision"
                                        >
                                        <div
                                                *ngIf="showValidationErrors && localData.origineDemande?.autre === true && !localData.origineDemande?.autrePrecision"
                                                class="form-error">
                                            La précision est requise
                                        </div>
                                    </div>
                                </div>
                                <div *ngIf="showValidationErrors && !hasAllOrigineDemandeAnswered()" class="form-error">
                                    Veuillez répondre à toutes les options (Oui ou Non)
                                </div>
                            </div>

                            <!-- 10.a) Cause ou circonstance -->
                            <div class="form-group">
                                <label class="form-label required">10.a) La cause ou circonstance de l'abus</label>
                                <select
                                        class="form-select"
                                        [(ngModel)]="localData.causeCirconstance"
                                        name="causeCirconstance"
                                        (change)="onFieldChange()"
                                >
                                    <option value="">Sélectionner une cause</option>
                                    <option value="PROBLEME_SOCIAL">Problème social</option>
                                    <option value="PROBLEME_FINANCIER">Problème financier</option>
                                    <option value="PROBLEME_FAMILIAL">Problème familial</option>
                                    <option value="PROBLEME_SANTE_MENTALE">Problème de santé mentale</option>
                                    <option value="ADOLESCENCE">Adolescence</option>
                                </select>
                                <div
                                        *ngIf="showValidationErrors && !localData.causeCirconstance"
                                        class="form-error">
                                    La cause ou circonstance de l'abus
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 11) Consultation antérieure -->
                    <div class="form-section">
                        <h3 class="section-title">12) Consultation antérieure</h3>

                        <div class="form-fields">
                            <div class="form-group">
                                <div class="radio-options">
                                    <label class="radio-label">
                                        <input
                                                type="radio"
                                                name="consultationAnterieure"
                                                [value]="true"
                                                [(ngModel)]="localData.consultationAnterieure"
                                                (change)="onFieldChange()"
                                        >
                                        <span class="radio-text">1. Oui</span>
                                    </label>
                                    <label class="radio-label">
                                        <input
                                                type="radio"
                                                name="consultationAnterieure"
                                                [value]="false"
                                                [(ngModel)]="localData.consultationAnterieure"
                                                (change)="onFieldChange()"
                                        >
                                        <span class="radio-text">2. Non</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Sous-questions si consultation antérieure = oui -->
                            <div class="sub-section" *ngIf="localData.consultationAnterieure === true">
                                <div class="form-group conditional-field nested"
                                     *ngIf="localData.consultationAnterieure === true">
                                    <label class="form-label required">10.a) Date de la consultation antérieure
                                        (mois/année)</label>
                                    <input
                                            type="month"
                                            class="form-input"
                                            [class.error]="showValidationErrors && !localData.dateConsultationAnterieure"
                                            [(ngModel)]="localData.dateConsultationAnterieure"
                                            name="dateConsultationAnterieure"
                                            placeholder="MM/AAAA"
                                            (input)="onFieldChange()"
                                    >
                                    <div *ngIf="showValidationErrors && !localData.dateConsultationAnterieure"
                                         class="form-error">
                                        Ce champ est obligatoire
                                    </div>
                                </div>

                                <div class="form-group conditional-field nested"
                                     *ngIf="localData.consultationAnterieure === true">
                                    <label class="form-label required">10.b) Motif de la consultation antérieure</label>
                                    <select
                                            class="form-select"
                                            [(ngModel)]="localData.motifConsultationAnterieure"
                                            name="motifConsultationAnterieure"
                                            (change)="selectMotifConsultationAnterieure(localData.motifConsultationAnterieure)"
                                            [class.error]="showValidationErrors && !localData.motifConsultationAnterieure"
                                    >
                                        <option value="">Sélectionnez un motif</option>
                                        <option value="OVERDOSE">Overdose</option>
                                        <option value="TENTATIVE_SUICIDE">Tentative de suicide</option>
                                        <option value="SEVRAGE">Sevrage</option>
                                        <option value="TROUBLES_MENTAUX">Troubles mentaux</option>
                                        <option value="RECIDIVE">Récidive</option>
                                        <option value="ECHEC_SCOLAIRE">Échec scolaire</option>
                                        <option value="TROUBLE_COMPORTEMENT">Trouble de comportement</option>
                                        <option value="VIOLENCE">Violence</option>
                                        <option value="AUTRE">Autre, précisez</option>
                                    </select>
                                    <div *ngIf="showValidationErrors && !localData.motifConsultationAnterieure"
                                         class="form-error">
                                        Ce champ est obligatoire
                                    </div>
                                </div>

                                <div class="form-group conditional-field nested"
                                     *ngIf="localData.motifConsultationAnterieure === 'AUTRE'">
                                    <label class="form-label required">Précisez le motif</label>
                                    <input
                                            type="text"
                                            class="form-input"
                                            [class.error]="showValidationErrors && !localData.motifConsultationAnterieurePrecision"
                                            [(ngModel)]="localData.motifConsultationAnterieurePrecision"
                                            name="motifConsultationAnterieurePrecision"
                                            placeholder="Précisez le motif de la consultation antérieure"
                                            (input)="onFieldChange()"
                                    >
                                    <div *ngIf="showValidationErrors && !localData.motifConsultationAnterieurePrecision"
                                         class="form-error">
                                        Ce champ est obligatoire
                                    </div>
                                </div>

                                <div class="form-group conditional-field nested"
                                     *ngIf="localData.motifConsultationAnterieure === 'RECIDIVE'">
                                    <label class="form-label required">10.c) Cause de récidive</label>
                                    <select
                                            class="form-select"
                                            [(ngModel)]="localData.causeRecidive"
                                            name="causeRecidive"
                                            (change)="selectCauseRecidive(localData.causeRecidive)"
                                            [class.error]="showValidationErrors && !localData.causeRecidive"
                                    >
                                        <option value="">Sélectionnez une cause</option>
                                        <option value="PROBLEME_SOUTIEN_FAMILIAL">Problème de soutien familial</option>
                                        <option value="PROBLEME_SOUTIEN_ECOLE">Problème de soutien à l'école</option>
                                        <option value="PROBLEME_SOUTIEN_ENTOURAGE">Problème de soutien de l'entourage
                                        </option>
                                        <option value="PROBLEME_SOCIAL_NON_RESOLU">Problème social non résolu</option>
                                        <option value="MAUVAISE_GESTION_EMOTIONS">Mauvaise gestion des émotions</option>
                                        <option value="CRAVING">Craving</option>
                                        <option value="INFLUENCE_PAIRS">Influence des pairs</option>
                                        <option value="CHOMAGE_DEFAUT_OCCUPATION">Chômage et défaut d'occupation (pas
                                            d'activité)
                                        </option>
                                        <option value="AUTRE">Autre, précisez</option>
                                    </select>
                                    <div *ngIf="showValidationErrors && !localData.causeRecidive" class="form-error">
                                        Ce champ est obligatoire
                                    </div>
                                    <div *ngIf="localData.causeRecidive === 'AUTRE'" class="form-group nested">
                                        <input
                                                type="text"
                                                class="form-input"
                                                [class.error]="showValidationErrors && !localData.causeRecidivePrecision"
                                                [(ngModel)]="localData.causeRecidivePrecision"
                                                name="causeRecidivePrecision"
                                                placeholder="Précisez la cause de récidive"
                                                (input)="onFieldChange()"
                                        >
                                    </div>
                                </div>

                                <div class="form-group conditional-field nested"
                                     *ngIf="localData.motifConsultationAnterieure === 'SEVRAGE'">
                                    <label class="form-label required">10.d) Cause de l'échec de sevrage</label>
                                    <select
                                            class="form-select"
                                            [(ngModel)]="localData.causeEchecSevrage"
                                            name="causeEchecSevrage"
                                            (change)="selectCauseEchecSevrage(localData.causeEchecSevrage)"
                                            [class.error]="showValidationErrors && !localData.causeEchecSevrage"
                                    >
                                        <option value="">Sélectionnez une cause</option>
                                        <option value="NON_OBSERVANCE_TRAITEMENT">Non-observance du traitement</option>
                                        <option value="SUIVI_INTERROMPU">Suivi interrompu</option>
                                        <option value="NON_CONVAINCU_APPROCHE">Non convaincu de l'approche
                                            thérapeutique
                                        </option>
                                        <option value="SEJOUR_INTERROMPU">Séjour interrompu</option>
                                        <option value="MALADIE_MENTALE">Maladie mentale sous-jacente</option>
                                        <option value="PROBLEME_ACCESSIBILITE">Problème d'accessibilité au service
                                            (financière ou
                                            géographique)
                                        </option>
                                        <option value="AUTRE">Autre, précisez</option>
                                    </select>
                                    <div *ngIf="showValidationErrors && !localData.causeEchecSevrage"
                                         class="form-error">
                                        Ce champ est obligatoire
                                    </div>
                                    <div *ngIf="localData.causeEchecSevrage === 'AUTRE'" class="form-group nested">
                                        <input
                                                type="text"
                                                class="form-input"
                                                [class.error]="showValidationErrors && !localData.causeEchecSevragePrecision"
                                                [(ngModel)]="localData.causeEchecSevragePrecision"
                                                name="causeEchecSevragePrecision"
                                                placeholder="Précisez la cause de l'échec de sevrage"
                                                (input)="onFieldChange()"
                                        >
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>

                    <!-- 12) Situation familiale -->
                    <div class="form-section">
                        <h3 class="section-title">13) Situation familiale</h3>

                        <div class="form-fields">
                            <div class="form-group">
                                <label class="form-label required">Sélectionnez votre situation familiale</label>
                                <div class="checkbox-options-vertical">
                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.situationFamiliale === 'CELIBATAIRE'"
                                                (change)="onSituationFamilialeChange('CELIBATAIRE')"
                                                name="situationCelibataire"
                                        >
                                        <span class="checkbox-text">1. Célibataire</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.situationFamiliale === 'MARIE'"
                                                (change)="onSituationFamilialeChange('MARIE')"
                                                name="situationMarie"
                                        >
                                        <span class="checkbox-text">2. Marié(e)</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.situationFamiliale === 'DIVORCE'"
                                                (change)="onSituationFamilialeChange('DIVORCE')"
                                                name="situationDivorce"
                                        >
                                        <span class="checkbox-text">3. Divorcé(e)</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.situationFamiliale === 'SEPARE'"
                                                (change)="onSituationFamilialeChange('SEPARE')"
                                                name="situationSepare"
                                        >
                                        <span class="checkbox-text">4. Séparé(e)</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.situationFamiliale === 'VEUF'"
                                                (change)="onSituationFamilialeChange('VEUF')"
                                                name="situationVeuf"
                                        >
                                        <span class="checkbox-text">5. Veuf(ve)</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.situationFamiliale === 'AUTRE'"
                                                (change)="onSituationFamilialeChange('AUTRE')"
                                                name="situationAutre"
                                        >
                                        <span class="checkbox-text">6. Autre</span>
                                    </label>

                                    <!-- Précision pour autre -->
                                    <div class="sub-options" *ngIf="localData.situationFamiliale === 'AUTRE'">
                                        <input
                                                type="text"
                                                class="form-input"
                                                [(ngModel)]="localData.situationFamilialeAutre"
                                                name="situationFamilialeAutre"
                                                placeholder="12.a Si autre, préciser"
                                                (input)="onFieldChange()"
                                                [class.error]="showValidationErrors && localData.situationFamiliale === 'AUTRE' && !localData.situationFamilialeAutre"
                                        >
                                        <div
                                                *ngIf="showValidationErrors && localData.situationFamiliale === 'AUTRE' && !localData.situationFamilialeAutre"
                                                class="form-error">
                                            La précision est requise
                                        </div>
                                    </div>
                                </div>
                                <div *ngIf="showValidationErrors && !localData.situationFamiliale" class="form-error">
                                    La situation familiale est requise
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 13) Logement 30 jours -->
                    <div class="form-section">
                        <h3 class="section-title">14) Durant les 30 derniers jours précédant la consultation/dépistage,
                            le patient
                            vivait principalement</h3>

                        <div class="form-fields">
                            <div class="form-group">
                                <label class="form-label required">Sélectionnez votre situation de logement</label>
                                <div class="checkbox-options-vertical">
                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.logement30Jours === 'SEUL'"
                                                (change)="onLogement30JoursChange('SEUL')"
                                                name="logementSeul"
                                        >
                                        <span class="checkbox-text">1. Seul(e)</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.logement30Jours === 'FAMILLE_ORIGINE'"
                                                (change)="onLogement30JoursChange('FAMILLE_ORIGINE')"
                                                name="logementFamilleOrigine"
                                        >
                                        <span class="checkbox-text">2. Avec sa famille d'origine (parents, etc.)</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.logement30Jours === 'PARTENAIRE'"
                                                (change)="onLogement30JoursChange('PARTENAIRE')"
                                                name="logementPartenaire"
                                        >
                                        <span class="checkbox-text">3. Avec son partenaire</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.logement30Jours === 'ENFANTS'"
                                                (change)="onLogement30JoursChange('ENFANTS')"
                                                name="logementEnfants"
                                        >
                                        <span class="checkbox-text">4. Avec ses enfants</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.logement30Jours === 'AMIS'"
                                                (change)="onLogement30JoursChange('AMIS')"
                                                name="logementAmis"
                                        >
                                        <span class="checkbox-text">5. Avec des amis ou d'autres personnes (sans relation familiale)</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.logement30Jours === 'INTERNAT'"
                                                (change)="onLogement30JoursChange('INTERNAT')"
                                                name="logementInternat"
                                        >
                                        <span class="checkbox-text">6. Dans un Internat</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.logement30Jours === 'COLOCATION'"
                                                (change)="onLogement30JoursChange('COLOCATION')"
                                                name="logementColocation"
                                        >
                                        <span class="checkbox-text">7. En colocation</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.logement30Jours === 'FOYER'"
                                                (change)="onLogement30JoursChange('FOYER')"
                                                name="logementFoyer"
                                        >
                                        <span class="checkbox-text">8. Dans un foyer universitaire ou scolaire</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.logement30Jours === 'DETENTION'"
                                                (change)="onLogement30JoursChange('DETENTION')"
                                                name="logementDetention"
                                        >
                                        <span class="checkbox-text">9. En détention</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.logement30Jours === 'CENTRE_JEUNESSE'"
                                                (change)="onLogement30JoursChange('CENTRE_JEUNESSE')"
                                                name="logementCentreJeunesse"
                                        >
                                        <span class="checkbox-text">10. Dans un centre intégré de la jeunesse</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.logement30Jours === 'INSTITUTION'"
                                                (change)="onLogement30JoursChange('INSTITUTION')"
                                                name="logementInstitution"
                                        >
                                        <span class="checkbox-text">11. En institution/refuge (pas de détention)</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.logement30Jours === 'AUTRE'"
                                                (change)="onLogement30JoursChange('AUTRE')"
                                                name="logementAutre"
                                        >
                                        <span class="checkbox-text">12. Autre</span>
                                    </label>

                                    <!-- Précision pour autre -->
                                    <div class="sub-options" *ngIf="localData.logement30Jours === 'AUTRE'">
                                        <input
                                                type="text"
                                                class="form-input"
                                                [(ngModel)]="localData.logement30JoursAutre"
                                                name="logement30JoursAutre"
                                                placeholder="12.a Si autre, préciser"
                                                (input)="onFieldChange()"
                                                [class.error]="showValidationErrors && localData.logement30Jours === 'AUTRE' && !localData.logement30JoursAutre"
                                        >
                                        <div
                                                *ngIf="showValidationErrors && localData.logement30Jours === 'AUTRE' && !localData.logement30JoursAutre"
                                                class="form-error">
                                            La précision est requise
                                        </div>
                                    </div>
                                </div>
                                <div *ngIf="showValidationErrors && !localData.logement30Jours" class="form-error">
                                    La situation de logement est requise
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 14) Nature de logement -->
                    <div class="form-section">
                        <h3 class="section-title">15) Nature de logement</h3>

                        <div class="form-fields">
                            <div class="form-group">
                                <label class="form-label required">Sélectionnez la nature de votre logement</label>
                                <div class="checkbox-options">
                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.natureLogement === 'STABLE'"
                                                (change)="onNatureLogementChange('STABLE')"
                                                name="natureLogement"
                                        >
                                        <span class="checkbox-text">1. Logement stable</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.natureLogement === 'PRECAIRE'"
                                                (change)="onNatureLogementChange('PRECAIRE')"
                                                name="natureLogement"
                                        >
                                        <span class="checkbox-text">2. Logement précaire/sans abri</span>
                                    </label>
                                </div>
                                <div *ngIf="showValidationErrors && !localData.natureLogement" class="form-error">
                                    La nature de logement est requise
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 15) Profession -->
                    <div class="form-section">
                        <h3 class="section-title">16) Profession</h3>

                        <div class="form-fields">
                            <div class="form-group">
                                <label class="form-label required">Sélectionnez votre profession</label>
                                <div class="checkbox-options-vertical">
                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.profession === 'EMPLOYE'"
                                                (change)="onProfessionChange('EMPLOYE')"
                                                name="professionEmploye"
                                        >
                                        <span class="checkbox-text">1. Employé</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.profession === 'COMPTE_PROPRE'"
                                                (change)="onProfessionChange('COMPTE_PROPRE')"
                                                name="professionComptePropre"
                                        >
                                        <span class="checkbox-text">2. Travaille pour son propre compte</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.profession === 'JOURNALIER'"
                                                (change)="onProfessionChange('JOURNALIER')"
                                                name="professionJournalier"
                                        >
                                        <span class="checkbox-text">3. Journalier/travail irrégulier</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.profession === 'SPORTIF'"
                                                (change)="onProfessionChange('SPORTIF')"
                                                name="professionSportif"
                                        >
                                        <span class="checkbox-text">4. Sportif professionnel</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.profession === 'CHOMAGE'"
                                                (change)="onProfessionChange('CHOMAGE')"
                                                name="professionChomage"
                                        >
                                        <span class="checkbox-text">5. En chômage</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.profession === 'ELEVE'"
                                                (change)="onProfessionChange('ELEVE')"
                                                name="professionEleve"
                                        >
                                        <span class="checkbox-text">6. Élève</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.profession === 'ETUDIANT'"
                                                (change)="onProfessionChange('ETUDIANT')"
                                                name="professionEtudiant"
                                        >
                                        <span class="checkbox-text">7. Étudiant</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.profession === 'FORMATION'"
                                                (change)="onProfessionChange('FORMATION')"
                                                name="professionFormation"
                                        >
                                        <span class="checkbox-text">8. En formation professionnelle</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.profession === 'RETRAITE'"
                                                (change)="onProfessionChange('RETRAITE')"
                                                name="professionRetraite"
                                        >
                                        <span class="checkbox-text">9. Retraité</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.profession === 'SANS_RESSOURCES'"
                                                (change)="onProfessionChange('SANS_RESSOURCES')"
                                                name="professionSansRessources"
                                        >
                                        <span class="checkbox-text">10. Sans ressources</span>
                                    </label>
                                </div>
                                <div *ngIf="showValidationErrors && !localData.profession" class="form-error">
                                    La profession est requise
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 16) Niveau scolaire -->
                    <div class="form-section">
                        <h3 class="section-title">17) Niveau scolaire</h3>

                        <div class="form-fields">
                            <div class="form-group">
                                <label class="form-label required">Sélectionnez votre niveau scolaire</label>
                                <div class="checkbox-options-vertical">
                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.niveauScolaire === 'ANALPHABETE'"
                                                (change)="onNiveauScolaireChange('ANALPHABETE')"
                                                name="niveauAnalphabete"
                                        >
                                        <span class="checkbox-text">1. Analphabète</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.niveauScolaire === 'PRESCOLAIRE'"
                                                (change)="onNiveauScolaireChange('PRESCOLAIRE')"
                                                name="niveauPrescolaire"
                                        >
                                        <span class="checkbox-text">2. Préscolaire</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.niveauScolaire === 'PRIMAIRE'"
                                                (change)="onNiveauScolaireChange('PRIMAIRE')"
                                                name="niveauPrimaire"
                                        >
                                        <span class="checkbox-text">3. Primaire</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.niveauScolaire === 'COLLEGE'"
                                                (change)="onNiveauScolaireChange('COLLEGE')"
                                                name="niveauCollege"
                                        >
                                        <span class="checkbox-text">4. Collège</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.niveauScolaire === 'SECONDAIRE'"
                                                (change)="onNiveauScolaireChange('SECONDAIRE')"
                                                name="niveauSecondaire"
                                        >
                                        <span class="checkbox-text">5. Secondaire</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.niveauScolaire === 'FORMATION_PROF'"
                                                (change)="onNiveauScolaireChange('FORMATION_PROF')"
                                                name="niveauFormationProf"
                                        >
                                        <span class="checkbox-text">6. Formation professionnelle</span>
                                    </label>

                                    <label class="checkbox-label">
                                        <input
                                                type="checkbox"
                                                [checked]="localData.niveauScolaire === 'UNIVERSITAIRE'"
                                                (change)="onNiveauScolaireChange('UNIVERSITAIRE')"
                                                name="niveauUniversitaire"
                                        >
                                        <span class="checkbox-text">7. Universitaire</span>
                                    </label>
                                </div>
                                <div *ngIf="showValidationErrors && !localData.niveauScolaire" class="form-error">
                                    Le niveau scolaire est requis
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 17) Activité sportive -->
                    <div class="form-section">
                        <h3 class="section-title">18) Est-ce que vous pratiquez une activité sportive ?</h3>

                        <div class="form-fields">
                            <div class="form-group">
                                <div class="radio-options">
                                    <label class="radio-label">
                                        <input
                                                type="radio"
                                                name="activiteSportive"
                                                [value]="true"
                                                [(ngModel)]="localData.activiteSportive"
                                                (change)="onFieldChange()"
                                        >
                                        <span class="radio-text">1. Oui</span>
                                    </label>
                                    <label class="radio-label">
                                        <input
                                                type="radio"
                                                name="activiteSportive"
                                                [value]="false"
                                                [(ngModel)]="localData.activiteSportive"
                                                (change)="onFieldChange()"
                                        >
                                        <span class="radio-text">2. Non</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Sous-questions si activité sportive = oui -->
                            <div class="sub-section" *ngIf="localData.activiteSportive === true">
                                <div class="form-group sub-field">
                                    <label class="form-label required">18.a) Si oui, vous pratiquez une activité
                                        sportive de façon</label>
                                    <div class="radio-options">
                                        <label class="radio-label">
                                            <input
                                                    type="radio"
                                                    [checked]="localData.activiteSportiveFrequence === 'REGULIERE'"
                                                    (change)="onActiviteSportiveFrequenceChange('REGULIERE')"
                                                    name="activiteSportiveFrequence"
                                            >
                                            <span class="radio-text">1. Régulière</span>
                                        </label>

                                        <label class="radio-label">
                                            <input
                                                    type="radio"
                                                    [checked]="localData.activiteSportiveFrequence === 'IRREGULIERE'"
                                                    (change)="onActiviteSportiveFrequenceChange('IRREGULIERE')"
                                                    name="activiteSportiveFrequence"
                                            >
                                            <span class="radio-text">2. Irrégulière</span>
                                        </label>
                                    </div>
                                    <div
                                            *ngIf="showValidationErrors && localData.activiteSportive === true && !localData.activiteSportiveFrequence"
                                            class="form-error">
                                        La fréquence d'activité sportive est requise
                                    </div>
                                </div>

                                <div class="form-group sub-field">
                                    <label class="form-label required">18.b) Si oui, vous pratiquez une activité
                                        sportive</label>
                                    <div class="checkbox-options-vertical">
                                        <label class="checkbox-label">
                                            <input
                                                    type="checkbox"
                                                    [checked]="localData.activiteSportiveType === 'COMPETITION'"
                                                    (change)="onActiviteSportiveTypeChange('COMPETITION')"
                                                    name="activiteSportiveTypeCompetition"
                                                    required
                                            >
                                            <span class="checkbox-text">1. De compétition</span>
                                        </label>

                                        <label class="checkbox-label">
                                            <input
                                                    type="checkbox"
                                                    [checked]="localData.activiteSportiveType === 'LOISIR'"
                                                    (change)="onActiviteSportiveTypeChange('LOISIR')"
                                                    name="activiteSportiveTypeLoisir"
                                                    required
                                            >
                                            <span class="checkbox-text">2. De loisir</span>
                                        </label>

                                        <label class="checkbox-label">
                                            <input
                                                    type="checkbox"
                                                    [checked]="localData.activiteSportiveType === 'ESPACELOISIR'"
                                                    (change)="onActiviteSportiveTypeChange('ESPACELOISIR')"
                                                    name="activiteSportiveTypeEspacesLoisirs"
                                                    required
                                            >
                                            <span class="checkbox-text">3. Espaces de loisirs dans le quartier ou la zone de vie</span>
                                        </label>
                                    </div>
                                    <div
                                            *ngIf="showValidationErrors && localData.activiteSportive && !localData.activiteSportiveType"
                                            class="form-error">
                                        Le type d'activité sportive est requis
                                    </div>
                                </div>

                                <!-- Dopage si compétition -->
                                <div class="form-group sub-field"
                                     *ngIf="localData.activiteSportiveType === 'COMPETITION'">
                                    <label class="form-label required">17.b.1) Si de compétition, dopage</label>
                                    <div class="radio-options">
                                        <label class="radio-label">
                                            <input
                                                    type="radio"
                                                    name="dopage"
                                                    [value]="true"
                                                    [(ngModel)]="localData.dopage"
                                                    (change)="onFieldChange()"
                                            >
                                            <span class="radio-text">1. Oui</span>
                                        </label>
                                        <label class="radio-label">
                                            <input
                                                    type="radio"
                                                    name="dopage"
                                                    [value]="false"
                                                    [(ngModel)]="localData.dopage"
                                                    (change)="onFieldChange()"
                                            >
                                            <span class="radio-text">2. Non</span>
                                        </label>
                                    </div>
                                    <div
                                            *ngIf="showValidationErrors && localData.activiteSportiveType === 'COMPETITION' && localData.dopage === null"
                                            class="form-error">
                                        La réponse sur le dopage est requise
                                    </div>
                                </div>
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

        .form-section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--gray-900);
            margin: 0 0 var(--spacing-6) 0;
            padding-bottom: var(--spacing-3);
            border-bottom: 2px solid var(--primary-200);
        }

        .form-fields {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-6);
        }

        .conditional-field {
            margin-left: var(--spacing-6);
            padding-left: var(--spacing-4);
            border-left: 3px solid var(--primary-200);
            background-color: var(--gray-50);
            padding: var(--spacing-4);
            border-radius: var(--radius-md);
            margin-bottom: var(--spacing-4);
        }

        .conditional-field.nested {
            margin-left: var(--spacing-8);
            border-left-color: var(--primary-300);
            background-color: var(--primary-50);
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-3);
        }

        .sub-field {
            margin-left: var(--spacing-6);
            padding-left: var(--spacing-4);
            border-left: 3px solid var(--primary-200);
        }

        .checkbox-options {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-3);
        }

        .checkbox-option {
            display: flex;
            align-items: center;
            gap: var(--spacing-3);
            cursor: pointer;
            padding: var(--spacing-3);
            border-radius: var(--radius-md);
            transition: all 0.2s ease-in-out;
            border: 1px solid transparent;
        }

        .checkbox-option:hover {
            background-color: var(--gray-100);
        }

        .checkbox-option.selected {
            background-color: var(--primary-50);
            border-color: var(--primary-300);
        }

        .checkbox-option input[type="checkbox"] {
            width: 16px;
            height: 16px;
            accent-color: var(--primary-600);
        }

        .sub-section {
            margin-top: var(--spacing-4);
            padding: var(--spacing-4);
            background-color: var(--gray-50);
            border-radius: var(--radius-md);
        }

        .checkbox-options {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-4);
        }

        .checkbox-options-vertical {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-3);
        }

        .checkbox-label {
            display: flex;
            align-items: center;
            gap: var(--spacing-3);
            cursor: pointer;
            padding: var(--spacing-3);
            border-radius: var(--radius-md);
            transition: background-color 0.2s ease-in-out;
            border: 1px solid transparent;
        }

        .checkbox-label:hover {
            background-color: var(--gray-50);
        }

        .checkbox-label input[type="checkbox"] {
            width: 16px;
            height: 16px;
            accent-color: var(--primary-600);
        }

        .checkbox-text {
            font-weight: 500;
            color: var(--gray-700);
            flex: 1;
        }

        .radio-options {
            display: flex;
            gap: var(--spacing-4);
            flex-wrap: wrap;
        }

        .radio-label {
            display: flex;
            align-items: center;
            gap: var(--spacing-2);
            cursor: pointer;
            padding: var(--spacing-2) var(--spacing-3);
            border-radius: var(--radius-md);
            transition: background-color 0.2s ease-in-out;
        }

        .radio-label:hover {
            background-color: var(--gray-50);
        }

        .radio-label input[type="radio"] {
            width: 16px;
            height: 16px;
            accent-color: var(--primary-600);
        }

        .radio-text {
            font-weight: 500;
            color: var(--gray-700);
        }

        .radio-inline {
            display: flex;
            gap: var(--spacing-4);
            margin-left: var(--spacing-4);
        }

        .radio-label-inline {
            display: flex;
            align-items: center;
            gap: var(--spacing-2);
            cursor: pointer;
            padding: var(--spacing-2);
            border-radius: var(--radius-sm);
        }

        .radio-label-inline:hover {
            background-color: var(--gray-50);
        }

        .sub-options {
            margin-left: var(--spacing-6);
            margin-top: var(--spacing-3);
        }

        .sub-label {
            margin-left: var(--spacing-4);
            font-size: 14px;
        }

        .form-error {
            color: var(--error-500);
            font-size: 12px;
            margin-top: var(--spacing-1);
        }


        .prefilled {
            background-color: var(--gray-50);
            border-left: 3px solid var(--primary-500);
            padding-left: var(--spacing-4);
        }

        .prefilled-note {
            font-size: 12px;
            color: var(--primary-600);
            font-style: italic;
            margin-top: var(--spacing-2);
        }

        .search-select-container {
            position: relative;
        }

        .search-input {
            width: 100%;
        }

        .selected-value {
            margin-top: var(--spacing-2);
            padding: var(--spacing-2) var(--spacing-4);
            background-color: var(--primary-100);
            border: 1px solid var(--primary-300);
            border-radius: var(--radius-md);
            color: var(--primary-700);
            font-weight: 500;
        }

        .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            max-height: 200px;
            overflow-y: auto;
            background-color: white;
            border: 1px solid var(--gray-300);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-md);
            z-index: 10;
        }

        .search-result-item {
            padding: var(--spacing-3) var(--spacing-4);
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .search-result-item:hover {
            background-color: var(--primary-50);
        }

        .form-input.error,
        .form-select.error {
            border-color: var(--error-500);
        }

        .checkbox-label.error {
            border-color: var(--error-500);
            background-color: var(--error-50);
        }

        /* Style pour les champs désactivés */
        .form-select:disabled,
        .form-input:disabled,
        input[type="radio"]:disabled,
        input[type="checkbox"]:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            background-color: var(--gray-100);
        }

        /* Style pour indiquer visuellement les champs préremplis */
        .form-select:disabled,
        .form-input:disabled {
            border-left: 3px solid var(--primary-500);
        }

        /* Style pour les labels des champs préremplis */
        .radio-option input[type="radio"]:disabled + .radio-text {
            color: var(--gray-700);
        }

        .radio-option.disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .form-input:disabled {
            background-color: var(--gray-100);
            cursor: not-allowed;
            border-color: var(--gray-300);
            color: var(--gray-700);
        }

        .prefilled-field {
            background-color: var(--primary-50);
            border-color: var(--primary-300);
        }

        /* Styles pour la liste déroulante des pays */
        .country-dropdown {
            position: relative;
        }

        .dropdown-input-container {
            position: relative;
            display: flex;
        }

        .dropdown-toggle {
            position: absolute;
            right: 0;
            top: 0;
            height: 100%;
            padding: 0 var(--spacing-4);
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--gray-500);
        }

        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            max-height: 250px;
            overflow-y: auto;
            background-color: white;
            border: 1px solid var(--gray-300);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 100;
            margin-top: var(--spacing-1);
        }

        .dropdown-search-info {
            padding: var(--spacing-3);
            color: var(--gray-500);
            text-align: center;
            font-style: italic;
        }

        .dropdown-items {
            max-height: 200px;
            overflow-y: auto;
        }

        .dropdown-item {
            padding: var(--spacing-3);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: var(--spacing-3);
            transition: background-color 0.2s;
        }

        .dropdown-item:hover {
            background-color: var(--primary-50);
        }

        .country-code {
            font-weight: 600;
            color: var(--primary-600);
            min-width: 40px;
        }

        .country-name {
            flex: 1;
        }

        /* Styles pour les listes déroulantes */
        .dropdown-container {
            position: relative;
            width: 100%;
        }

        .dropdown-input-group {
            display: flex;
            align-items: center;
        }

        .dropdown-toggle-btn {
            position: absolute;
            right: 0;
            top: 0;
            height: 100%;
            padding: 0 var(--spacing-4);
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--gray-500);
        }

        .dropdown-no-results {
            padding: var(--spacing-4);
            text-align: center;
            color: var(--gray-500);
            font-style: italic;
        }

        @media (max-width: 768px) {
            .checkbox-options {
                flex-direction: column;
            }

            .radio-options {
                flex-direction: column;
            }

            .radio-inline {
                flex-direction: column;
                gap: var(--spacing-2);
            }

            .sub-field {
                margin-left: var(--spacing-3);
                padding-left: var(--spacing-3);
            }
        }
    `]
})
export class Step1Component implements OnInit, OnChanges {
    @Input() data: Partial<FormulaireData> = {};
    @Output() dataChange = new EventEmitter<Partial<FormulaireData>>();
    @Output() validationChange = new EventEmitter<boolean>();

    localData: Partial<FormulaireData> = {};
    @Input() showValidationErrors = false;

    userStructureInfo: UserStructureInfo | null = null;
    isLoading = true;

    delegations: Delegation[] = [];

    // Gestion des pays pour la nationalité
    countries: Country[] = [];
    filteredCountries: Country[] = [];
    searchTerm = '';
    showCountryDropdown = false;
    searchTermChanged = new Subject<string>();

    // Gestion des pays pour la résidence à l'étranger
    residenceCountries: Country[] = [];
    filteredResidenceCountries: Country[] = [];
    residenceSearchTerm = '';
    showResidenceCountryDropdown = false;
    residenceSearchTermChanged = new Subject<string>();
    today: string | null;
    maxBirthDate: string;
    // Données de référence
    selectedCountry: Country | null = null;

    gouvernorats: Gouvernorat[] = [];


    constructor(
        private userService: UserService,
        private authService: AuthService,
        private countryService: CountryService,
        private delegationService: DelegationService,
        private datePipe: DatePipe,
    ) {

        const now = new Date();
        const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        this.today = this.datePipe.transform(localDate, 'yyyy-MM-dd'); // ou 'dd/MM/yyyy' si tu préfères
        // Set max birth date (10 years before today)
        const maxDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
        this.maxBirthDate = maxDate.toISOString().split('T')[0];
    }

    ngOnInit(): void {
        this.initializeData();
        this.loadUserStructureInfo();
        this.loadCountries();
        this.getGouvernorat();

        // Configuration du debounce pour la recherche de nationalité
        this.searchTermChanged.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(term => {
            this.searchTerm = term;
            this.filterCountries();
        });

        // Configuration du debounce pour la recherche de pays de résidence
        this.residenceSearchTermChanged.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(term => {
            this.residenceSearchTerm = term;
            this.filterResidenceCountries();
        });

    }

    ngOnChanges(): void {
        this.initializeData();
    }

    nowDate!: Date;

    private initializeData(): void {


        this.localData = {
            ...this.data,

            cadreConsultation: this.data.cadreConsultation || {},
            origineDemande: this.data.origineDemande || {},
            dateConsultation: new Date(this.today!)
        }


        this.validateStep();
    }

    // Chargement des pays
    private loadCountries(): void {
        this.countryService.getAllCountries().subscribe({
            next: (countries) => {
                this.countries = countries;
                this.residenceCountries = [...countries];

                // Définir la Tunisie comme pays par défaut pour la nationalité
                const tunisie = this.countries.find(c => c.codeIso3 === 'TUN');
                if (tunisie && !this.localData.nationalite) {
                    this.localData.nationalite = tunisie.nom;
                }
            },
            error: (error) => {
                console.error('Erreur lors du chargement des pays:', error);
            }
        });
    }

    public showErrors(): void {
        this.showValidationErrors = true;
        this.validateStep();
    }

    // Gestion de la recherche de nationalité
    onSearchCountry(event: Event): void {
        const term = (event.target as HTMLInputElement).value;
        this.searchTermChanged.next(term);
    }

    filterCountries(): void {
        if (!this.searchTerm || this.searchTerm.trim() === '') {
            this.filteredCountries = this.countries.slice(0, 10); // Afficher les 10 premiers pays par défaut
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredCountries = this.countries.filter(country =>
                country.nom.toLowerCase().includes(term) ||
                country.codeIso3.toLowerCase().includes(term)
            ).slice(0, 10); // Limiter à 10 résultats
        }
    }

    selectCountry(country: Country): void {
        this.localData.nationalite = country.nom;
        this.showCountryDropdown = false;
        this.onFieldChange();
    }

    toggleCountryDropdown(): void {
        this.showCountryDropdown = !this.showCountryDropdown;
        if (this.showCountryDropdown) {
            this.filteredCountries = this.countries.slice(0, 197); // Afficher les 10 premiers pays par défaut
        }
    }

    // Gestion de la recherche de pays de résidence
    onSearchResidenceCountry(event: Event): void {
        const term = (event.target as HTMLInputElement).value;
        this.residenceSearchTermChanged.next(term);
    }

    filterResidenceCountries(): void {
        if (!this.residenceSearchTerm || this.residenceSearchTerm.trim() === '') {
            this.filteredResidenceCountries = this.residenceCountries.slice(0, 10); // Afficher les 10 premiers pays par défaut
        } else {
            const term = this.residenceSearchTerm.toLowerCase();
            this.filteredResidenceCountries = this.residenceCountries.filter(country =>
                country.nom.toLowerCase().includes(term) ||
                country.codeIso3.toLowerCase().includes(term)
            ).slice(0, 10); // Limiter à 10 résultats
        }
    }

    selectResidenceCountry(country: Country): void {
        this.localData.paysResidence = country.nom;
        this.showResidenceCountryDropdown = false;
        this.onFieldChange();
    }

    toggleResidenceCountryDropdown(): void {
        this.showResidenceCountryDropdown = !this.showResidenceCountryDropdown;
        if (this.showResidenceCountryDropdown) {
            this.filteredResidenceCountries = this.residenceCountries.slice(0, 10); // Afficher les 10 premiers pays par défaut
        }
    }

    // Chargement des informations de structure de l'utilisateur
    private loadUserStructureInfo(): void {
        this.userService.getUserStructureInfo().subscribe({
            next: (info) => {

                this.userStructureInfo = info;
                this.preFillUserData();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des informations de structure:', error);
                this.isLoading = false;
            }
        });
    }

    private preFillUserData(): void {
        if (this.userStructureInfo && this.userStructureInfo.hasStructure) {
            // Préremplir le secteur en fonction du type de structure
            if (this.userStructureInfo.typeStructure === TypeStructure.PUBLIQUE) {
                this.localData.secteur = 'PUBLIC';
            } else if (this.userStructureInfo.typeStructure === TypeStructure.PRIVEE) {
                this.localData.secteur = 'PRIVE';
            } else if (this.userStructureInfo.typeStructure === TypeStructure.ONG) {
                this.localData.secteur = 'ONG';
                this.localData.ongPrecision = this.userStructureInfo.structureNom;
            }

            // Préremplir le ministère
            this.localData.ministere = this.userStructureInfo.ministere;

            // Préremplir la structure
            this.localData.structure = this.userStructureInfo.structureNom;

            // Préremplir le gouvernorat de la structure
            this.localData.gouvernoratStructure = this.userStructureInfo.gouvernoratNom;

            // Émettre les changements
            this.onFieldChange();
        }
    }

    selectSecteur(secteur: string): void {
        this.localData.secteur = secteur;
        // Reset dependent fields
        if (secteur !== 'ONG' && secteur !== 'SOCIETE_CIVILE_ONG') {
            this.localData.ongPrecision = undefined;
        }
        this.onFieldChange();
    }

    onFieldChange(): void {
        this.dataChange.emit(this.localData);
        this.validateStep();

        // Si le gouvernorat change, mettre à jour les délégations
        if (this.localData.gouvernoratResidence) {
            this.loadDelegations(+this.localData.gouvernoratResidence);
        } else {
            this.delegations = [];
        }
    }

    getGouvernorat(): void {
        this.delegationService.getGouvernorat().subscribe({
            next: (governorat) => {
                console.log(governorat);
                this.gouvernorats = governorat;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des délégations:', error);
                this.delegations = [];
            }
        });
    }

    loadDelegations(gouvernoratId: number): void {
        this.delegationService.getDelegationsByGouvernorat(gouvernoratId).subscribe({
            next: (delegations) => {
                this.delegations = delegations;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des délégations:', error);
                this.delegations = [];
            }
        });
    }

    // Méthodes pour gérer les choix uniques avec checkboxes
    onSecteurChange(secteur: string): void {
        this.localData.secteur = this.localData.secteur === secteur ? undefined : secteur as any;
        if (secteur !== 'ONG' && secteur !== 'SOCIETE_CIVILE_ONG') {
            this.localData.ongPrecision = undefined;
        }
        this.onFieldChange();
    }

    onCadreConsultationChange(cadre: string, event: Event): void {
        const input = event.target as HTMLInputElement;
        const isChecked = input.checked;

        if (!this.localData.cadreConsultation) {
            this.localData.cadreConsultation = {};
        }

        if (cadre === "ADDICTOLOGIE") {
            this.localData.cadreConsultation = {
                addictologie: isChecked,
                psychiatrie: false,
                psychologique: false,
                medecineGenerale: false,
                neurologique: false,
                infectieux: false,
                espaceAmisJeunes: false,
                echangeMateriel: false,
                rehabilitation: false,
                urgenceMedicale: false,
                urgenceChirurgicale: false,
                depistage: false,
                autre: false,
            };
            if (!isChecked) {
                this.localData.cadreConsultation.addictologieType = undefined;
            }
        }

        if (cadre === "PSYCHIATRIE") {
            this.localData.cadreConsultation = {
                addictologie: false,
                addictologieType: undefined,
                psychiatrie: isChecked,
                psychologique: false,
                medecineGenerale: false,
                neurologique: false,
                infectieux: false,
                espaceAmisJeunes: false,
                echangeMateriel: false,
                rehabilitation: false,
                urgenceMedicale: false,
                urgenceChirurgicale: false,
                depistage: false,
                autre: false,
            };
        }

        if (cadre === "PSYCHOLOGIQUE") {
            this.localData.cadreConsultation = {
                addictologieType: undefined,

                addictologie: false,
                psychiatrie: false,
                psychologique: isChecked,
                medecineGenerale: false,
                neurologique: false,
                infectieux: false,
                espaceAmisJeunes: false,
                echangeMateriel: false,
                rehabilitation: false,
                urgenceMedicale: false,
                urgenceChirurgicale: false,
                depistage: false,
                autre: false,
            };
        }

        if (cadre === "MEDECINE_GENERALE") {
            this.localData.cadreConsultation = {
                addictologieType: undefined,

                addictologie: false,
                psychiatrie: false,
                psychologique: false,
                medecineGenerale: isChecked,
                neurologique: false,
                infectieux: false,
                espaceAmisJeunes: false,
                echangeMateriel: false,
                rehabilitation: false,
                urgenceMedicale: false,
                urgenceChirurgicale: false,
                depistage: false,
                autre: false,
            };
        }

        if (cadre === "NEUROLOGIQUE") {
            this.localData.cadreConsultation = {
                addictologieType: undefined,

                addictologie: false,
                psychiatrie: false,
                psychologique: false,
                medecineGenerale: false,
                neurologique: isChecked,
                infectieux: false,
                espaceAmisJeunes: false,
                echangeMateriel: false,
                rehabilitation: false,
                urgenceMedicale: false,
                urgenceChirurgicale: false,
                depistage: false,
                autre: false,
            };
        }

        if (cadre === "INFECTIEUX") {
            this.localData.cadreConsultation = {
                addictologieType: undefined,

                addictologie: false,
                psychiatrie: false,
                psychologique: false,
                medecineGenerale: false,
                neurologique: false,
                infectieux: isChecked,
                espaceAmisJeunes: false,
                echangeMateriel: false,
                rehabilitation: false,
                urgenceMedicale: false,
                urgenceChirurgicale: false,
                depistage: false,
                autre: false,
            };
        }

        if (cadre === "ESPACE_AMIS_JEUNES") {
            this.localData.cadreConsultation = {
                addictologieType: undefined,

                addictologie: false,
                psychiatrie: false,
                psychologique: false,
                medecineGenerale: false,
                neurologique: false,
                infectieux: false,
                espaceAmisJeunes: isChecked,
                echangeMateriel: false,
                rehabilitation: false,
                urgenceMedicale: false,
                urgenceChirurgicale: false,
                depistage: false,
                autre: false,
            };
        }

        if (cadre === "ECHANGE_MATERIEL") {
            this.localData.cadreConsultation = {
                addictologieType: undefined,

                addictologie: false,
                psychiatrie: false,
                psychologique: false,
                medecineGenerale: false,
                neurologique: false,
                infectieux: false,
                espaceAmisJeunes: false,
                echangeMateriel: isChecked,
                rehabilitation: false,
                urgenceMedicale: false,
                urgenceChirurgicale: false,
                depistage: false,
                autre: false,
            };
        }

        if (cadre === "REHABILITATION") {
            this.localData.cadreConsultation = {
                addictologieType: undefined,

                addictologie: false,
                psychiatrie: false,
                psychologique: false,
                medecineGenerale: false,
                neurologique: false,
                infectieux: false,
                espaceAmisJeunes: false,
                echangeMateriel: false,
                rehabilitation: isChecked,
                urgenceMedicale: false,
                urgenceChirurgicale: false,
                depistage: false,
                autre: false,
            };
        }

        if (cadre === "URGENCE_MEDICALE") {
            this.localData.cadreConsultation = {
                addictologieType: undefined,

                addictologie: false,
                psychiatrie: false,
                psychologique: false,
                medecineGenerale: false,
                neurologique: false,
                infectieux: false,
                espaceAmisJeunes: false,
                echangeMateriel: false,
                rehabilitation: false,
                urgenceMedicale: isChecked,
                urgenceChirurgicale: false,
                depistage: false,
                autre: false,
            };
        }

        if (cadre === "URGENCE_CHIRURGICALE") {
            this.localData.cadreConsultation = {
                addictologieType: undefined,

                addictologie: false,
                psychiatrie: false,
                psychologique: false,
                medecineGenerale: false,
                neurologique: false,
                infectieux: false,
                espaceAmisJeunes: false,
                echangeMateriel: false,
                rehabilitation: false,
                urgenceMedicale: false,
                urgenceChirurgicale: isChecked,
                depistage: false,
                autre: false,
            };
        }

        if (cadre === "DEPISTAGE") {
            this.localData.cadreConsultation = {
                addictologieType: undefined,

                addictologie: false,
                psychiatrie: false,
                psychologique: false,
                medecineGenerale: false,
                neurologique: false,
                infectieux: false,
                espaceAmisJeunes: false,
                echangeMateriel: false,
                rehabilitation: false,
                urgenceMedicale: false,
                urgenceChirurgicale: false,
                depistage: isChecked,
                autre: false,
            };
        }

        if (cadre === "AUTRE") {
            this.localData.cadreConsultation = {
                addictologieType: undefined,

                addictologie: false,
                psychiatrie: false,
                psychologique: false,
                medecineGenerale: false,
                neurologique: false,
                infectieux: false,
                espaceAmisJeunes: false,
                echangeMateriel: false,
                rehabilitation: false,
                urgenceMedicale: false,
                urgenceChirurgicale: false,
                depistage: false,
                autre: isChecked,
            };
        }

        // Réinitialisation de autrePrecision si AUTRE est décoché
        if (this.localData.cadreConsultation.autre !== true) {
            this.localData.cadreConsultation.autrePrecision = undefined;
        }

        this.onFieldChange();
    }
    hasAllOrigineDemandeAnswered(): boolean {
        const origine = this.localData.origineDemande;
        if (!origine) return false;

        // Toutes les options doivent avoir une valeur définie (true ou false)
        return (origine.luiMeme == true || origine.luiMeme == false ) &&
            (origine.famille == true || origine.famille == false ) &&
            (origine.amis == true || origine.amis == false ) &&
            (origine.celluleEcoute == true || origine.celluleEcoute == false ) &&
            (origine.autreCentre == true || origine.autreCentre == false ) &&
            (origine.structureSociale == true || origine.structureSociale == false ) &&
            (origine.structureJudiciaire == true || origine.structureJudiciaire == false ) &&
            (origine.jugeEnfance == true || origine.jugeEnfance == false ) &&
            (origine.autre == true || origine.autre == false );
    }
    onOrigineDemandeChange(origine: string, value: boolean): void {
        if (!this.localData.origineDemande) {
            this.localData.origineDemande = {};
        }
        (this.localData.origineDemande as any)[origine] = value;

        // Reset précision si autre n'est pas sélectionné
        if (origine === 'autre' && !value) {
            this.localData.origineDemande.autrePrecision = undefined;
        }

        this.onFieldChange();
    }

    onSituationFamilialeChange(situation: string): void {
        this.localData.situationFamiliale = this.localData.situationFamiliale === situation ? undefined : situation as any;
        if (this.localData.situationFamiliale !== 'AUTRE') {
            this.localData.situationFamilialeAutre = undefined;
        }
        this.onFieldChange();
    }

    onLogement30JoursChange(logement: string): void {
        this.localData.logement30Jours = this.localData.logement30Jours === logement ? undefined : logement as any;
        if (this.localData.logement30Jours !== 'AUTRE') {
            this.localData.logement30JoursAutre = undefined;
        }
        this.onFieldChange();
    }

    onNatureLogementChange(nature: string): void {
        this.localData.natureLogement = this.localData.natureLogement === nature ? undefined : nature as any;
        this.onFieldChange();
    }

    onProfessionChange(profession: string): void {
        this.localData.profession = this.localData.profession === profession ? undefined : profession as any;
        this.onFieldChange();
    }

    onNiveauScolaireChange(niveau: string): void {
        this.localData.niveauScolaire = this.localData.niveauScolaire === niveau ? undefined : niveau as any;
        this.onFieldChange();
    }

    onActiviteSportiveFrequenceChange(frequence: string): void {
        this.localData.activiteSportiveFrequence = frequence as any;
        this.onFieldChange();
    }

    onActiviteSportiveTypeChange(type: string): void {
        this.localData.activiteSportiveType = type as any;
        if (this.localData.activiteSportiveType !== 'COMPETITION') {
            this.localData.dopage = undefined;
        }
        this.onFieldChange();
    }

    selectMotifConsultationAnterieure(motif: string | undefined): void {
        this.localData.motifConsultationAnterieure = motif;

        // Réinitialiser les champs dépendants si le motif change
        if (motif !== 'RECIDIVE') {
            this.localData.causeRecidive = undefined;
            this.localData.causeRecidivePrecision = undefined;
        }

        if (motif !== 'SEVRAGE') {
            this.localData.causeEchecSevrage = undefined;
            this.localData.causeEchecSevragePrecision = undefined;
        }

        if (motif !== 'AUTRE') {
            this.localData.motifConsultationAnterieurePrecision = undefined;
        }

        this.onFieldChange();
    }

    selectCauseRecidive(cause: string | undefined): void {
        this.localData.causeRecidive = cause;

        if (cause !== 'AUTRE') {
            this.localData.causeRecidivePrecision = undefined;
        }

        this.onFieldChange();
    }

    selectCauseEchecSevrage(cause: string | undefined): void {
        this.localData.causeEchecSevrage = cause;

        if (cause !== 'AUTRE') {
            this.localData.causeEchecSevragePrecision = undefined;
        }

        this.onFieldChange();
    }

    private validateStep(): void {
        let isValid = true;

        // 1. Secteur obligatoire
        if (!this.localData.secteur) {
            isValid = false;
        }

        // 2. Si secteur ONG, ongPrecision obligatoire
        if (this.localData.secteur === 'ONG' &&
            (!this.localData.ongPrecision || this.localData.ongPrecision.trim() === '')) {
            isValid = false;
        }



        // 4. Date consultation obligatoire
        if (!this.localData.dateConsultation) {
            isValid = false;
        }

        // 5. Genre obligatoire
        if (!this.localData.genre) {
            isValid = false;
        }

        // 6. Date de naissance valide (au moins l'année)
        if (!this.isValidDateNaissance()) {
            isValid = false;
        }

        // 7. Nationalité obligatoire
        if (!this.localData.nationalite || this.localData.nationalite.trim() === '') {
            isValid = false;
        }

        // 8. Couverture sociale obligatoire
        if (this.localData.couvertureSociale === undefined) {
            isValid = false;
        }

        // 8.a. Si couverture sociale = true, type obligatoire
        if (this.localData.couvertureSociale === true &&
            (!this.localData.typeCouvertureSociale || this.localData.typeCouvertureSociale.trim() === '')) {
            isValid = false;
        }

        // 8.b. Si CNAM, type carnet obligatoire
        if (this.localData.typeCouvertureSociale === 'CNAM' &&
            (!this.localData.typeCarnetCnam || this.localData.typeCarnetCnam.trim() === '')) {
            isValid = false;
        }

        // 9. Résidence obligatoire
        if (!this.localData.residence) {
            isValid = false;
        }

        // 9.a. Si TUNISIE, gouvernorat obligatoire
        if (this.localData.residence === 'TUNISIE' && !this.localData.gouvernoratResidence) {
            isValid = false;
        }

        // 9.b. Si TUNISIE, délégation obligatoire
        if (this.localData.residence === 'TUNISIE' && !this.localData.delegationResidence) {
            isValid = false;
        }

        // 9.c. Si ETRANGER, pays obligatoire
        if (this.localData.residence === 'ETRANGER' &&
            (!this.localData.paysResidence || this.localData.paysResidence.trim() === '')) {
            isValid = false;
        }

        // 10. Cadre consultation - au moins un choix
        if (!this.isAllCadreConsultationFalse()) {
            isValid = false;
        }

        // 10.a. Si addictologie, type obligatoire
        if (this.localData.cadreConsultation?.addictologie === true &&
            (!this.localData.cadreConsultation?.addictologieType ||
                this.localData.cadreConsultation?.addictologieType.trim() === '')) {
            isValid = false;
        }

        // 10.b. Si autre, précision obligatoire
        if (this.localData.cadreConsultation?.autre === true &&
            (!this.localData.cadreConsultation?.autrePrecision ||
                this.localData.cadreConsultation?.autrePrecision.trim() === '')) {
            isValid = false;
        }

        // 11. Origine demande - TOUTES les options doivent avoir une réponse (oui ou non)
        if (!this.hasAllOrigineDemandeAnswered()) {
            isValid = false;
        }

        // 11.a. Si autre, précision obligatoire
        if (this.localData.origineDemande?.autre === true &&
            (!this.localData.origineDemande?.autrePrecision ||
                this.localData.origineDemande?.autrePrecision.trim() === '')) {
            isValid = false;
        }

        // 11.b. Cause ou circonstance obligatoire
        if (!this.localData.causeCirconstance || this.localData.causeCirconstance.trim() === '') {
            isValid = false;
        }

        // 12. Consultation antérieure obligatoire
        if (this.localData.consultationAnterieure === undefined) {
            isValid = false;
        }

        // 12.a. Si oui, date obligatoire
        if (this.localData.consultationAnterieure === true && !this.localData.dateConsultationAnterieure) {
            isValid = false;
        }

        // 12.b. Si oui, motif obligatoire
        if (this.localData.consultationAnterieure === true &&
            (!this.localData.motifConsultationAnterieure || this.localData.motifConsultationAnterieure.trim() === '')) {
            isValid = false;
        }

        // 12.b.1. Si motif autre, précision obligatoire
        if (this.localData.motifConsultationAnterieure === 'AUTRE' &&
            (!this.localData.motifConsultationAnterieurePrecision ||
                this.localData.motifConsultationAnterieurePrecision.trim() === '')) {
            isValid = false;
        }

        // 12.c. Si récidive, cause obligatoire
        if (this.localData.motifConsultationAnterieure === 'RECIDIVE' &&
            (!this.localData.causeRecidive || this.localData.causeRecidive.trim() === '')) {
            isValid = false;
        }

        // 12.c.1. Si cause autre, précision obligatoire
        if (this.localData.causeRecidive === 'AUTRE' &&
            (!this.localData.causeRecidivePrecision || this.localData.causeRecidivePrecision.trim() === '')) {
            isValid = false;
        }

        // 12.d. Si sevrage, cause échec obligatoire
        if (this.localData.motifConsultationAnterieure === 'SEVRAGE' &&
            (!this.localData.causeEchecSevrage || this.localData.causeEchecSevrage.trim() === '')) {
            isValid = false;
        }

        // 12.d.1. Si cause autre, précision obligatoire
        if (this.localData.causeEchecSevrage === 'AUTRE' &&
            (!this.localData.causeEchecSevragePrecision ||
                this.localData.causeEchecSevragePrecision.trim() === '')) {
            isValid = false;
        }

        // 13. Situation familiale obligatoire
        if (!this.localData.situationFamiliale) {
            isValid = false;
        }

        // 13.a. Si autre, précision obligatoire
        if (this.localData.situationFamiliale === 'AUTRE' &&
            (!this.localData.situationFamilialeAutre || this.localData.situationFamilialeAutre.trim() === '')) {
            isValid = false;
        }

        // 14. Logement 30 jours obligatoire
        if (!this.localData.logement30Jours) {
            isValid = false;
        }

        // 14.a. Si autre, précision obligatoire
        if (this.localData.logement30Jours === 'AUTRE' &&
            (!this.localData.logement30JoursAutre || this.localData.logement30JoursAutre.trim() === '')) {
            isValid = false;
        }

        // 15. Nature logement obligatoire
        if (!this.localData.natureLogement) {
            isValid = false;
        }

        // 16. Profession obligatoire
        if (!this.localData.profession) {
            isValid = false;
        }

        // 17. Niveau scolaire obligatoire
        if (!this.localData.niveauScolaire) {
            isValid = false;
        }

        // 18. Activité sportive obligatoire
        if (this.localData.activiteSportive === undefined) {
            isValid = false;
        }

        // 18.a. Si oui, fréquence obligatoire
        if (this.localData.activiteSportive === true && !this.localData.activiteSportiveFrequence) {
            isValid = false;
        }

        // 18.b. Si oui, type obligatoire
        if (this.localData.activiteSportive === true && !this.localData.activiteSportiveType) {
            isValid = false;
        }

        // 18.b.1. Si compétition, dopage obligatoire
        if (this.localData.activiteSportiveType === 'COMPETITION' && this.localData.dopage === undefined) {
            isValid = false;
        }

        this.validationChange.emit(isValid);
    }
    hasOrigineDemandeSelected(): boolean {
        const origine = this.localData.origineDemande;
        if (!origine) return false;

        return !!(origine.luiMeme || origine.famille || origine.amis || origine.celluleEcoute ||
            origine.autreCentre || origine.structureSociale || origine.structureJudiciaire ||
            origine.jugeEnfance || origine.autre);
    }

    /**
     * Vérifie si la date de naissance est valide (au moins l'année est renseignée)
     */
    isValidDateNaissance(): boolean {
        if (!this.localData.dateNaissance) {
            return false;
        }
        // Vérifier si la date contient au moins une année (4 chiffres)
        const dateString = String(this.localData.dateNaissance);
        return /\d{4}/.test(dateString);
    }

    isAllCadreConsultationFalse(): boolean {
        const c = this.localData.cadreConsultation;
        if (!c) return false;

        return !!(
            c.addictologie ||
            c.psychiatrie ||
            c.psychologique ||
            c.medecineGenerale ||
            c.neurologique ||
            c.infectieux ||
            c.espaceAmisJeunes ||
            c.echangeMateriel ||
            c.rehabilitation ||
            c.urgenceMedicale ||
            c.urgenceChirurgicale ||
            c.depistage ||
            c.autre
        );
    }

    selectTypeCouverture(type: string): void {
        this.localData.typeCouvertureSociale = type as any;

        // Reset dependent fields
        if (type !== 'CNAM') {
            this.localData.typeCarnetCnam = undefined;
        }

        this.onFieldChange();
    }

    selectTypeCarnetCnam(type: string): void {
        this.localData.typeCarnetCnam = type as any;
        this.onFieldChange();
    }
    // AJOUTEZ CETTE MÉTHODE ICI ↓
    onAddictologieTypeChange(type: string): void {
        if (!this.localData.cadreConsultation) {
            this.localData.cadreConsultation = {};
        }

        // Toggle behavior: si le même type est cliqué, on le désélectionne
        if (this.localData.cadreConsultation.addictologieType === type) {
            this.localData.cadreConsultation.addictologieType = undefined;
        } else {
            this.localData.cadreConsultation.addictologieType = type as any;
        }

        this.onFieldChange();
    }
}
