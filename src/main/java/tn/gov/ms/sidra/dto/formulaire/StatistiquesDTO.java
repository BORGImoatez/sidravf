package tn.gov.ms.sidra.dto.formulaire;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatistiquesDTO {

    private Long totalConsultations;
    private RepartitionSexe repartitionSexe;
    private Double moyenneAge;
    private Double medianeAge;
    private Long decesLieDrogues;
    private List<ModeAdministration> modesAdministration;
    private DemandesTraitement demandesTraitement;

    private CaracteristiquesSocioEconomiques cse;
    private ConsommationTabac tabac;
    private ConsommationAlcool alcool;
    private ConsommationSpaEntourage spaEntourage;
    private ConsommationSpaPersonnelle spaPersonnelle;
    private AutresAddictions autresAddictions;
    private ComportementsEtTests comportementsEtTests;
    private Comorbidites comorbidites;
    private ConduiteTherapeutique conduiteTherapeutique;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RepartitionSexe {
        private Long hommes;
        private Long femmes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModeAdministration {
        private String mode;
        private Long frequence;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DemandesTraitement {
        private Long total;
        private List<TrancheAge> parAge;
        private List<ParSexe> parSexe;
        private List<ParRegion> parRegion;
        private List<ParProfession> parProfession;
        private List<ParNSE> parNSE;
        private List<ParSituationFamiliale> parSituationFamiliale;
        private List<ParSubstance> parSubstance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrancheAge {
        private String tranche;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParSexe {
        private String sexe;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParRegion {
        private String region;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParProfession {
        private String profession;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParNSE {
        private String niveau;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParSituationFamiliale {
        private String situation;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParSubstance {
        private String substance;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CaracteristiquesSocioEconomiques {
        private List<ParSecteur> parSecteur;
        private List<ParNationalite> parNationalite;
        private List<ParMotifConsultation> parMotifConsultation;
        private List<ParCouvertureSociale> parCouvertureSociale;
        private List<ParSituationLogement> parSituationLogement;
        private List<ParNatureLogement> parNatureLogement;
        private List<ParNiveauScolaire> parNiveauScolaire;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParSecteur {
        private String secteur;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParNationalite {
        private String nationalite;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParMotifConsultation {
        private String motif;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParCouvertureSociale {
        private String type;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParSituationLogement {
        private String situation;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParNatureLogement {
        private String nature;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParNiveauScolaire {
        private String niveau;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsommationTabac {
        private Long frequenceTabagiques;
        private Double moyenneAgePremiereCigarette;
        private Double medianeAgePremiereCigarette;
        private Double moyennePaquetsAnnee;
        private Double medianePaquetsAnnee;
        private Double moyenneAgeSevrageExFumeurs;
        private Double medianeAgeSevrageExFumeurs;
        private Long frequenceSevrageAssiste;
        private List<ParFrequenceTabac> parFrequenceTabac;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParFrequenceTabac {
        private String frequence;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsommationAlcool {
        private Long frequenceConsommateursAlcool;
        private Double moyenneAgePremiereConsommation;
        private Double medianeAgePremiereConsommation;
        private Double moyenneQuantiteConsommee;
        private Double medianeQuantiteConsommee;
        private List<ParFrequenceAlcool> parFrequenceAlcool;
        private List<ParTypeAlcool> parTypeAlcool;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParFrequenceAlcool {
        private String frequence;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParTypeAlcool {
        private String type;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsommationSpaEntourage {
        private Long frequenceConsommationSpaEntourage;
        private List<ParLienConsommateur> parLienConsommateur;
        private List<ParTypeSpaEntourage> parTypeSpaEntourage;
        private List<ParTypeSpaEntourage> top3SpaEntourage;
        private Long nombreDecesLiesSpaDansEntourage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParLienConsommateur {
        private String lien;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParTypeSpaEntourage {
        private String type;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsommationSpaPersonnelle {
        private Long nombreTotalDemandesTraitement;
        private List<ParTypeSpa> parTypeSpa;
        private List<ParTypeSpa> topSpaConsommees;
        private List<ParTypeSpa> spaInitiation;
        private Double moyenneAgeInitiation;
        private Double medianeAgeInitiation;
        private Long frequencePolyConsommation;
        private List<AssociationUsage> associationsUsageFrequentes;
        private List<ParTypeSpa> substancesPrincipalesPolyConsommateurs;
        private Double moyenneAgeInitiationSubstancePrincipale;
        private Double medianeAgeInitiationSubstancePrincipale;
        private List<FrequenceConsommationSubstancePrincipale> frequenceSubstancePrincipale;
        private Long frequenceAccompagnementSevrage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParTypeSpa {
        private String type;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssociationUsage {
        private String association;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FrequenceConsommationSubstancePrincipale {
        private String frequence;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AutresAddictions {
        private Long prevalenceAddictionJeuxPathologiques;
        private Long prevalenceAddictionEcrans;
        private Long prevalenceComportementsSexuelsAddictifs;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComportementsEtTests {
        private List<ParVoieAdministration> parVoieAdministration;
        private List<ParVoieAdministration> voiesAdministrationPlusFrequentes;
        private Long frequencePartageSeringues;
        private TestsDepistage testsDepistage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParVoieAdministration {
        private String voie;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestsDepistage {
        private Long nombreTestsVih;
        private Long nombreTestsVhc;
        private Long nombreTestsVhb;
        private Long nombreTestsSyphilis;
        private Long nombreUsagersAtteints;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Comorbidites {
        private Long frequenceTroublesAlimentaires;
        private Long frequenceAtcdPsychiatriquesPersonnels;
        private Long frequenceAtcdSomatiquesPersonnels;
        private List<ParTypeComorbidite> atcdPsychiatriquesPlusFrequents;
        private List<ParTypeComorbidite> atcdSomatiquesPlusFrequents;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParTypeComorbidite {
        private String type;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConduiteTherapeutique {
        private List<ParModalitePriseEnCharge> parModalitePriseEnCharge;
        private Double moyenneNombreConsultations;
        private Double medianeNombreConsultations;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParModalitePriseEnCharge {
        private String modalite;
        private Long nombre;
    }
}