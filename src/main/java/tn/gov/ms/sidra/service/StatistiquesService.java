package tn.gov.ms.sidra.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.gov.ms.sidra.dto.formulaire.StatistiquesDTO;
import tn.gov.ms.sidra.entity.SubstancePsychoactive;
import tn.gov.ms.sidra.repository.FormulaireRepository;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatistiquesService {

    private final FormulaireRepository formulaireRepository;

    /**
     * Récupère les statistiques avec filtres
     */
    public StatistiquesDTO getStatistiques(String sexe, Integer anneeConsultation,
                                           Integer ageMin, Integer ageMax) {

        // Construction de la requête avec filtres
        List<Object[]> formulaires = formulaireRepository
                .findStatisticsWithFilters(sexe, anneeConsultation, ageMin, ageMax);

        // Calculs des statistiques
        return StatistiquesDTO.builder()
                .totalConsultations(getTotalConsultations(sexe, anneeConsultation, ageMin, ageMax))
                .repartitionSexe(getRepartitionSexe(sexe, anneeConsultation, ageMin, ageMax))
                .moyenneAge(getMoyenneAge(sexe, anneeConsultation, ageMin, ageMax))
                .decesLieDrogues(getDecesLieDrogues(sexe, anneeConsultation, ageMin, ageMax))
                .modesAdministration(getModesAdministration(sexe, anneeConsultation, ageMin, ageMax))
                .demandesTraitement(getDemandesTraitement(sexe, anneeConsultation, ageMin, ageMax))
                .build();
    }

    /**
     * Récupère le total des consultations
     */
    private Long getTotalConsultations(String sexe, Integer anneeConsultation,
                                       Integer ageMin, Integer ageMax) {
        return formulaireRepository.countWithFilters(sexe, anneeConsultation, ageMin, ageMax);
    }

    /**
     * Calcule la répartition par sexe
     */
    private StatistiquesDTO.RepartitionSexe getRepartitionSexe(String sexe,
                                                               Integer anneeConsultation,
                                                               Integer ageMin, Integer ageMax) {
        Long hommes = formulaireRepository.countBySexe("HOMME", anneeConsultation, ageMin, ageMax);
        Long femmes = formulaireRepository.countBySexe("FEMME", anneeConsultation, ageMin, ageMax);

        return StatistiquesDTO.RepartitionSexe.builder()
                .hommes(hommes)
                .femmes(femmes)
                .build();
    }

    /**
     * Calcule la moyenne d'âge
     */
    private Double getMoyenneAge(String sexe, Integer anneeConsultation,
                                 Integer ageMin, Integer ageMax) {
        return formulaireRepository.calculateAverageAge(sexe, anneeConsultation, ageMin, ageMax);
    }

    /**
     * Récupère le nombre de décès liés aux drogues
     */
    private Long getDecesLieDrogues(String sexe, Integer anneeConsultation,
                                    Integer ageMin, Integer ageMax) {
        return formulaireRepository.countDeathsRelatedToDrugs(sexe, anneeConsultation, ageMin, ageMax);
    }

    /**
     * Récupère les modes d'administration
     */
    private List<StatistiquesDTO.ModeAdministration> getModesAdministration(
            String sexe, Integer anneeConsultation, Integer ageMin, Integer ageMax) {

        List<Object[]> results = formulaireRepository
                .getAdministrationModes(sexe, anneeConsultation, ageMin, ageMax);

        return results.stream()
                .map(row -> StatistiquesDTO.ModeAdministration.builder()
                        .mode(getModeLabel((String) row[0]))
                        .frequence((Long) row[1])
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Récupère les demandes de traitement détaillées
     */
    private StatistiquesDTO.DemandesTraitement getDemandesTraitement(
            String sexe, Integer anneeConsultation, Integer ageMin, Integer ageMax) {

        return StatistiquesDTO.DemandesTraitement.builder()
                .total(getTotalDemandesTraitement(sexe, anneeConsultation, ageMin, ageMax))
                .parAge(getDemandesParAge(sexe, anneeConsultation, ageMin, ageMax))
                .parSexe(getDemandesParSexe(sexe, anneeConsultation, ageMin, ageMax))
                .parRegion(getDemandesParRegion(sexe, anneeConsultation, ageMin, ageMax))
                .parProfession(getDemandesParProfession(sexe, anneeConsultation, ageMin, ageMax))
                .parNSE(getDemandesParNSE(sexe, anneeConsultation, ageMin, ageMax))
                .parSituationFamiliale(getDemandesParSituationFamiliale(sexe, anneeConsultation, ageMin, ageMax))
                .parSubstance(getDemandesParSubstance(sexe, anneeConsultation, ageMin, ageMax))
                .build();
    }

    private Long getTotalDemandesTraitement(String sexe, Integer anneeConsultation,
                                            Integer ageMin, Integer ageMax) {
        return formulaireRepository.countTreatmentRequests(sexe, anneeConsultation, ageMin, ageMax);
    }

    private List<StatistiquesDTO.TrancheAge> getDemandesParAge(
            String sexe, Integer anneeConsultation, Integer ageMin, Integer ageMax) {

        List<Object[]> results = formulaireRepository
                .getTreatmentRequestsByAgeGroup(sexe, anneeConsultation, ageMin, ageMax);

        return results.stream()
                .map(row -> StatistiquesDTO.TrancheAge.builder()
                        .tranche(getAgeGroupLabel((String) row[0]))
                        .nombre((Long) row[1])
                        .build())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParSexe> getDemandesParSexe(
            String sexe, Integer anneeConsultation, Integer ageMin, Integer ageMax) {

        List<Object[]> results = formulaireRepository
                .getTreatmentRequestsBySexe(sexe, anneeConsultation, ageMin, ageMax);

        return results.stream()
                .map(row -> StatistiquesDTO.ParSexe.builder()
                        .sexe((String) row[0])
                        .nombre((Long) row[1])
                        .build())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParRegion> getDemandesParRegion(
            String sexe, Integer anneeConsultation, Integer ageMin, Integer ageMax) {

        List<Object[]> results = formulaireRepository
                .getTreatmentRequestsByRegion(sexe, anneeConsultation, ageMin, ageMax);

        return results.stream()
                .map(row -> StatistiquesDTO.ParRegion.builder()
                        .region((String) row[0])
                        .nombre((Long) row[1])
                        .build())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParProfession> getDemandesParProfession(
            String sexe, Integer anneeConsultation, Integer ageMin, Integer ageMax) {

        List<Object[]> results = formulaireRepository
                .getTreatmentRequestsByProfession(sexe, anneeConsultation, ageMin, ageMax);

        return results.stream()
                .map(row -> StatistiquesDTO.ParProfession.builder()
                        .profession(getProfessionLabel((String) row[0]))
                        .nombre((Long) row[1])
                        .build())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParNSE> getDemandesParNSE(
            String sexe, Integer anneeConsultation, Integer ageMin, Integer ageMax) {

        List<Object[]> results = formulaireRepository
                .getTreatmentRequestsByNSE(sexe, anneeConsultation, ageMin, ageMax);

        return results.stream()
                .map(row -> StatistiquesDTO.ParNSE.builder()
                        .niveau((String) row[0])
                        .nombre((Long) row[1])
                        .build())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParSituationFamiliale> getDemandesParSituationFamiliale(
            String sexe, Integer anneeConsultation, Integer ageMin, Integer ageMax) {

        List<Object[]> results = formulaireRepository
                .getTreatmentRequestsByFamilyStatus(sexe, anneeConsultation, ageMin, ageMax);

        return results.stream()
                .map(row -> StatistiquesDTO.ParSituationFamiliale.builder()
                        .situation(getFamilyStatusLabel((String) row[0]))
                        .nombre((Long) row[1])
                        .build())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParSubstance> getDemandesParSubstance(
            String sexe, Integer anneeConsultation, Integer ageMin, Integer ageMax) {

        List<Object[]> results = formulaireRepository
                .getTreatmentRequestsBySubstance(sexe, anneeConsultation, ageMin, ageMax);

        // Log lisible
        results.forEach(row -> log.info("Row: {}", Arrays.toString(row)));

        return results.stream()
                .map(row -> {
                    String type = (String) row[0];  // <-- ici String et pas SubstancePsychoactive
                    Long count = (Long) row[1];

                    return StatistiquesDTO.ParSubstance.builder()
                            .substance(type)
                            .nombre(count)
                            .build();
                })
                .collect(Collectors.toList());

    }


    /**
     * Récupère les années disponibles
     */
    public List<Integer> getAnneesDisponibles() {
        return formulaireRepository.findDistinctYears();
    }

    /**
     * Exporte les données en Excel
     */


    // Méthodes utilitaires pour les labels
    private String getModeLabel(String mode) {
        if (mode == null) return "Non spécifié";
        return switch (mode.toUpperCase()) {
            case "FUMEE" -> "Fumée";
            case "INJECTEE" -> "Injection";
            case "INGEREE" -> "Ingérée/bue";
            case "SNIFFEE" -> "Sniffée";
            case "INHALEE" -> "Inhalée";
            default -> mode;
        };
    }

    private String getAgeGroupLabel(String group) {
        // Logique de mapping des tranches d'âge
        return group;
    }

    private String getProfessionLabel(String profession) {
        if (profession == null) return "Non spécifié";
        return switch (profession.toUpperCase()) {
            case "EMPLOYE" -> "Employé";
            case "COMPTE_PROPRE" -> "Travaille pour son propre compte";
            case "JOURNALIER" -> "Journalier/travail irrégulier";
            case "CHOMAGE" -> "En chômage";
            case "ETUDIANT" -> "Étudiant";
            case "SPORTIF" -> "Sportif professionnel";
            case "ELEVE" -> "Élève";
            case "FORMATION" -> "En formation professionnelle";
            case "RETRAITE" -> "Retraité";
            case "SANS_RESSOURCES" -> "Sans ressources";

            default -> profession;
        };
    }

    private String getFamilyStatusLabel(String status) {
        if (status == null) return "Non spécifié";
        return switch (status.toUpperCase()) {
            case "CELIBATAIRE" -> "Célibataire";
            case "MARIE" -> "Marié(e)";
            case "DIVORCE" -> "Divorcé(e)";
            case "VEUF" -> "Veuf/Veuve";
            case "SEPARE" -> "Séparé";
            case "AUTRE" -> "Autre";
            default -> status;
        };
    }
}