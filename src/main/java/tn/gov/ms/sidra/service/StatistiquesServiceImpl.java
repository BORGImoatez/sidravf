package tn.gov.ms.sidra.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.gov.ms.sidra.dto.formulaire.StatistiquesDTO;
import tn.gov.ms.sidra.entity.Formulaire;
import tn.gov.ms.sidra.entity.Gouvernorat;
import tn.gov.ms.sidra.entity.TestDepistage;
import tn.gov.ms.sidra.repository.FormulaireRepository;
import tn.gov.ms.sidra.repository.GouvernoratRepository;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatistiquesServiceImpl {

    private final FormulaireRepository formulaireRepository;
    private final GouvernoratRepository gouvernoratRepository;

    public StatistiquesDTO getStatistiquesNationales(
            String sexe, Integer anneeConsultation, Integer moisConsultation,
            LocalDate dateDebut, LocalDate dateFin, String gouvernorat,
            Integer ageMin, Integer ageMax
    ) {
        return buildStatistiques(sexe, anneeConsultation, moisConsultation,
                dateDebut, dateFin, gouvernorat, null, ageMin, ageMax, null);
    }

    public StatistiquesDTO getStatistiquesStructure(
            Long structureId, String sexe, Integer anneeConsultation,
            Integer moisConsultation, LocalDate dateDebut, LocalDate dateFin,
            Integer ageMin, Integer ageMax, Long userId
    ) {
        return buildStatistiques(sexe, anneeConsultation, moisConsultation,
                dateDebut, dateFin, null, structureId, ageMin, ageMax, userId);
    }

    private StatistiquesDTO buildStatistiques(
            String sexe, Integer anneeConsultation, Integer moisConsultation,
            LocalDate dateDebut, LocalDate dateFin, String gouvernorat,
            Long structureId, Integer ageMin, Integer ageMax, Long userId
    ) {
        List<Formulaire> formulaires = getFormulairesWithFilters(
                sexe, anneeConsultation, moisConsultation, dateDebut, dateFin,
                gouvernorat, structureId, ageMin, ageMax, userId
        );
        log.info("Comorbidites = {}", getComorbidites(formulaires));

        return StatistiquesDTO.builder()
                .totalConsultations((long) formulaires.size())
                .repartitionSexe(getRepartitionSexe(formulaires))
                .moyenneAge(getMoyenneAge(formulaires))
                .medianeAge(getMedianeAge(formulaires))
                .decesLieDrogues(getDecesLieDrogues(formulaires))
                .modesAdministration(getModesAdministration(formulaires))
                .demandesTraitement(getDemandesTraitement(formulaires))
                .cse(getCaracteristiquesSocioEconomiques(formulaires))
                .tabac(getConsommationTabac(formulaires))
                .alcool(getConsommationAlcool(formulaires))
                .spaEntourage(getConsommationSpaEntourage(formulaires))
                .spaPersonnelle(getConsommationSpaPersonnelle(formulaires))
                .autresAddictions(getAutresAddictions(formulaires))
                .comportementsEtTests(getComportementsEtTests(formulaires))
                .comorbidites(getComorbidites(formulaires))
                .conduiteTherapeutique(getConduiteTherapeutique(formulaires))
                .build();
    }

    private List<Formulaire> getFormulairesWithFilters(
            String sexe, Integer anneeConsultation, Integer moisConsultation,
            LocalDate dateDebut, LocalDate dateFin, String gouvernorat,
            Long structureId, Integer ageMin, Integer ageMax, Long userId
    ) {
        List<Formulaire> formulaires;

        if (structureId != null) {
            if (dateDebut != null && dateFin != null) {
                formulaires = formulaireRepository.findByStructureIdAndDateConsultationBetween(
                        structureId, dateDebut, dateFin
                );
            } else {
                formulaires = formulaireRepository.findByStructureId(structureId);
            }
        } else if (dateDebut != null && dateFin != null) {
            formulaires = formulaireRepository.findByDateConsultationBetween(dateDebut, dateFin);
        } else {
            formulaires = formulaireRepository.findAll();
        }

        return formulaires.stream()
                .filter(f -> filterFormulaire(f, sexe, anneeConsultation, moisConsultation,
                        gouvernorat, ageMin, ageMax, userId))
                .collect(Collectors.toList());
    }

    private boolean filterFormulaire(Formulaire f, String sexe, Integer annee, Integer mois,
                                     String gouvernorat, Integer ageMin, Integer ageMax, Long userId) {
        if (sexe != null && !sexe.equalsIgnoreCase("tous") &&
                !f.getPatient().getGenre().equalsIgnoreCase(sexe)) {
            return false;
        }

        if (annee != null && annee > 0 && f.getDateConsultation().getYear() != annee) {
            return false;
        }

        if (mois != null && mois > 0 && f.getDateConsultation().getMonthValue() != mois) {
            return false;
        }

        if (gouvernorat != null && !gouvernorat.equals(f.getGouvernoratResidence())) {
            return false;
        }

        if (f.getPatient().getDateNaissance() != null) {
            int age = LocalDate.now().getYear() - f.getPatient().getDateNaissance().getYear();
            if (ageMin != null && age < ageMin) {
                return false;
            }
            if (ageMax != null && age > ageMax) {
                return false;
            }
        }

        if (userId != null && f.getUtilisateur() != null && !f.getUtilisateur().getId().equals(userId)) {
            return false;
        }

        return true;
    }

    private StatistiquesDTO.RepartitionSexe getRepartitionSexe(List<Formulaire> formulaires) {
        long hommes = formulaires.stream()
                .filter(f -> f.getPatient().getGenre().equalsIgnoreCase("HOMME"))
                .count();
        long femmes = formulaires.stream()
                .filter(f -> f.getPatient().getGenre().equalsIgnoreCase("FEMME"))
                .count();

        return StatistiquesDTO.RepartitionSexe.builder()
                .hommes(hommes)
                .femmes(femmes)
                .build();
    }

    private Double getMoyenneAge(List<Formulaire> formulaires) {
        return formulaires.stream()
                .filter(f -> f.getPatient().getDateNaissance() != null)
                .mapToInt(f -> LocalDate.now().getYear() -
                        f.getPatient().getDateNaissance().getYear())
                .average()
                .orElse(0.0);
    }

    private Double getMedianeAge(List<Formulaire> formulaires) {
        List<Integer> ages = formulaires.stream()
                .filter(f -> f.getPatient().getDateNaissance() != null)
                .map(f -> LocalDate.now().getYear() - f.getPatient().getDateNaissance().getYear())
                .sorted()
                .collect(Collectors.toList());

        if (ages.isEmpty()) {
            return 0.0;
        }

        int size = ages.size();
        if (size % 2 == 0) {
            return (ages.get(size / 2 - 1) + ages.get(size / 2)) / 2.0;
        } else {
            return (double) ages.get(size / 2);
        }
    }

    private Long getDecesLieDrogues(List<Formulaire> formulaires) {
        return formulaires.stream()
                .filter(f -> f.getNombreDecesSpaDansEntourage() != null)
                .mapToLong(Formulaire::getNombreDecesSpaDansEntourage)
                .sum();
    }

    private List<StatistiquesDTO.ModeAdministration> getModesAdministration(List<Formulaire> formulaires) {
        Map<String, Long> modes = new HashMap<>();

        for (Formulaire f : formulaires) {
            if (f.getVoieAdministration() != null) {
                var voie = f.getVoieAdministration();
                if (Boolean.TRUE.equals(voie.getFumee())) modes.merge("Fumée", 1L, Long::sum);
                if (Boolean.TRUE.equals(voie.getInjectee())) modes.merge("Injection", 1L, Long::sum);
                if (Boolean.TRUE.equals(voie.getIngeree())) modes.merge("Ingérée/bue", 1L, Long::sum);
                if (Boolean.TRUE.equals(voie.getSniffee())) modes.merge("Sniffée", 1L, Long::sum);
                if (Boolean.TRUE.equals(voie.getInhalee())) modes.merge("Inhalée", 1L, Long::sum);
            }
        }

        return modes.entrySet().stream()
                .map(e -> StatistiquesDTO.ModeAdministration.builder()
                        .mode(e.getKey())
                        .frequence(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ModeAdministration::getFrequence).reversed())
                .collect(Collectors.toList());
    }

    private StatistiquesDTO.DemandesTraitement getDemandesTraitement(List<Formulaire> formulaires) {
        List<Formulaire> demandesTraitement = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getPriseEnChargeMedicale()) ||
                        Boolean.TRUE.equals(f.getPriseEnChargePsychologique()) ||
                        Boolean.TRUE.equals(f.getPriseEnChargeSociale()))
                .collect(Collectors.toList());

        return StatistiquesDTO.DemandesTraitement.builder()
                .total((long) demandesTraitement.size())
                .parAge(getDemandesParAge(demandesTraitement))
                .parSexe(getDemandesParSexe(demandesTraitement))
                .parRegion(getDemandesParRegion(demandesTraitement))
                .parProfession(getDemandesParProfession(demandesTraitement))
                .parNSE(getDemandesParNSE(demandesTraitement))
                .parSituationFamiliale(getDemandesParSituationFamiliale(demandesTraitement))
                .parSubstance(getDemandesParSubstance(demandesTraitement))
                .build();
    }

    private List<StatistiquesDTO.TrancheAge> getDemandesParAge(List<Formulaire> formulaires) {
        Map<String, Long> tranches = new HashMap<>();

        for (Formulaire f : formulaires) {
            if (f.getPatient().getDateNaissance() != null) {
                int age = LocalDate.now().getYear() - f.getPatient().getDateNaissance().getYear();
                String tranche;
                if (age < 18) tranche = "< 18 ans";
                else if (age <= 25) tranche = "18-25 ans";
                else if (age <= 35) tranche = "26-35 ans";
                else if (age <= 45) tranche = "36-45 ans";
                else if (age <= 55) tranche = "46-55 ans";
                else tranche = "> 55 ans";

                tranches.merge(tranche, 1L, Long::sum);
            }
        }

        return tranches.entrySet().stream()
                .map(e -> StatistiquesDTO.TrancheAge.builder()
                        .tranche(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParSexe> getDemandesParSexe(List<Formulaire> formulaires) {
        Map<String, Long> sexes = formulaires.stream()
                .collect(Collectors.groupingBy(
                        f -> f.getPatient().getGenre(),
                        Collectors.counting()
                ));

        return sexes.entrySet().stream()
                .map(e -> StatistiquesDTO.ParSexe.builder()
                        .sexe(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .collect(Collectors.toList());
    }
    private List<StatistiquesDTO.ParRegion> getDemandesParRegion(List<Formulaire> formulaires) {

        Map<String, Long> regions = formulaires.stream()
                .filter(f -> f.getGouvernoratResidence() != null)
                .collect(Collectors.groupingBy(
                        Formulaire::getGouvernoratResidence, // ID gouvernorat
                        Collectors.counting()
                ));

        return regions.entrySet().stream()
                .map(e -> {
                    Gouvernorat gouvernorat = gouvernoratRepository
                            .findById(Long.valueOf(e.getKey()))
                            .orElse(null);

                    return StatistiquesDTO.ParRegion.builder()
                            .region(gouvernorat != null ? gouvernorat.getNom() : "Inconnu")
                            .nombre(e.getValue())
                            .build();
                })
                .sorted(Comparator.comparing(StatistiquesDTO.ParRegion::getNombre).reversed())
                .collect(Collectors.toList());
    }


    private List<StatistiquesDTO.ParProfession> getDemandesParProfession(List<Formulaire> formulaires) {
        Map<String, Long> professions = formulaires.stream()
                .filter(f -> f.getProfession() != null)
                .collect(Collectors.groupingBy(
                        f -> getProfessionLabel(f.getProfession()),
                        Collectors.counting()
                ));

        return professions.entrySet().stream()
                .map(e -> StatistiquesDTO.ParProfession.builder()
                        .profession(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParProfession::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParNSE> getDemandesParNSE(List<Formulaire> formulaires) {
        long faible = formulaires.stream()
                .filter(f -> f.getProfession() != null &&
                        (f.getProfession().equals("CHOMAGE") ||
                                f.getProfession().equals("SANS_RESSOURCES")))
                .count();

        return List.of(StatistiquesDTO.ParNSE.builder()
                .niveau("Faible")
                .nombre(faible)
                .build());
    }

    private List<StatistiquesDTO.ParSituationFamiliale> getDemandesParSituationFamiliale(
            List<Formulaire> formulaires) {
        Map<String, Long> situations = formulaires.stream()
                .filter(f -> f.getSituationFamiliale() != null)
                .collect(Collectors.groupingBy(
                        f -> getFamilyStatusLabel(f.getSituationFamiliale()),
                        Collectors.counting()
                ));

        return situations.entrySet().stream()
                .map(e -> StatistiquesDTO.ParSituationFamiliale.builder()
                        .situation(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParSituationFamiliale::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParSubstance> getDemandesParSubstance(List<Formulaire> formulaires) {
        Map<String, Long> substances = new HashMap<>();

        for (Formulaire f : formulaires) {
            var substancePrincipale = f.getSubstancePrincipale();
            if (substancePrincipale != null) {
                if (Boolean.TRUE.equals(substancePrincipale.getTabac()))
                    substances.merge("Tabac", 1L, Long::sum);
                if (Boolean.TRUE.equals(substancePrincipale.getAlcool()))
                    substances.merge("Alcool", 1L, Long::sum);
                if (Boolean.TRUE.equals(substancePrincipale.getCannabis()))
                    substances.merge("Cannabis", 1L, Long::sum);
                if (Boolean.TRUE.equals(substancePrincipale.getHeroine()))
                    substances.merge("Héroïne", 1L, Long::sum);
                if (Boolean.TRUE.equals(substancePrincipale.getMorphiniques()))
                    substances.merge("Morphiniques", 1L, Long::sum);
                if (Boolean.TRUE.equals(substancePrincipale.getEcstasy()))
                    substances.merge("Ecstasy", 1L, Long::sum);
                if (Boolean.TRUE.equals(substancePrincipale.getPregabaline()))
                    substances.merge("Prégabaline", 1L, Long::sum);
            }
        }

        return substances.entrySet().stream()
                .map(e -> StatistiquesDTO.ParSubstance.builder()
                        .substance(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParSubstance::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private StatistiquesDTO.CaracteristiquesSocioEconomiques getCaracteristiquesSocioEconomiques(
            List<Formulaire> formulaires) {
        return StatistiquesDTO.CaracteristiquesSocioEconomiques.builder()
                .parSecteur(getDistributionParSecteur(formulaires))
                .parNationalite(getDistributionParNationalite(formulaires))
                .parMotifConsultation(getDistributionParMotifConsultation(formulaires))
                .parCouvertureSociale(getDistributionParCouvertureSociale(formulaires))
                .parSituationLogement(getDistributionParSituationLogement(formulaires))
                .parNatureLogement(getDistributionParNatureLogement(formulaires))
                .parNiveauScolaire(getDistributionParNiveauScolaire(formulaires))
                .build();
    }

    private List<StatistiquesDTO.ParSecteur> getDistributionParSecteur(List<Formulaire> formulaires) {
        Map<String, Long> secteurs = formulaires.stream()
                .filter(f -> f.getSecteur() != null)
                .collect(Collectors.groupingBy(Formulaire::getSecteur, Collectors.counting()));

        return secteurs.entrySet().stream()
                .map(e -> StatistiquesDTO.ParSecteur.builder()
                        .secteur(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParSecteur::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParNationalite> getDistributionParNationalite(List<Formulaire> formulaires) {
        Map<String, Long> nationalites = formulaires.stream()
                .filter(f -> f.getNationalite() != null)
                .collect(Collectors.groupingBy(Formulaire::getNationalite, Collectors.counting()));

        return nationalites.entrySet().stream()
                .map(e -> StatistiquesDTO.ParNationalite.builder()
                        .nationalite(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParNationalite::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParMotifConsultation> getDistributionParMotifConsultation(
            List<Formulaire> formulaires) {
        Map<String, Long> motifs = formulaires.stream()
                .filter(f -> f.getCadreConsultation() != null &&
                        f.getMotifConsultationAnterieure() != null)
                .collect(Collectors.groupingBy(
                        Formulaire::getMotifConsultationAnterieure,
                        Collectors.counting()
                ));

        return motifs.entrySet().stream()
                .map(e -> StatistiquesDTO.ParMotifConsultation.builder()
                        .motif(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParMotifConsultation::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParCouvertureSociale> getDistributionParCouvertureSociale(
            List<Formulaire> formulaires) {
        Map<String, Long> types = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getCouvertureSociale()) &&
                        f.getTypeCouvertureSociale() != null)
                .collect(Collectors.groupingBy(
                        Formulaire::getTypeCouvertureSociale,
                        Collectors.counting()
                ));

        return types.entrySet().stream()
                .map(e -> StatistiquesDTO.ParCouvertureSociale.builder()
                        .type(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParCouvertureSociale::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParSituationLogement> getDistributionParSituationLogement(
            List<Formulaire> formulaires) {
        Map<String, Long> situations = formulaires.stream()
                .filter(f -> f.getLogement30Jours() != null)
                .collect(Collectors.groupingBy(
                        Formulaire::getLogement30Jours,
                        Collectors.counting()
                ));

        return situations.entrySet().stream()
                .map(e -> StatistiquesDTO.ParSituationLogement.builder()
                        .situation(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParSituationLogement::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParNatureLogement> getDistributionParNatureLogement(
            List<Formulaire> formulaires) {
        Map<String, Long> natures = formulaires.stream()
                .filter(f -> f.getNatureLogement() != null)
                .collect(Collectors.groupingBy(
                        Formulaire::getNatureLogement,
                        Collectors.counting()
                ));

        return natures.entrySet().stream()
                .map(e -> StatistiquesDTO.ParNatureLogement.builder()
                        .nature(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParNatureLogement::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParNiveauScolaire> getDistributionParNiveauScolaire(
            List<Formulaire> formulaires) {
        Map<String, Long> niveaux = formulaires.stream()
                .filter(f -> f.getNiveauScolaire() != null)
                .collect(Collectors.groupingBy(
                        Formulaire::getNiveauScolaire,
                        Collectors.counting()
                ));

        return niveaux.entrySet().stream()
                .map(e -> StatistiquesDTO.ParNiveauScolaire.builder()
                        .niveau(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParNiveauScolaire::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private StatistiquesDTO.ConsommationTabac getConsommationTabac(List<Formulaire> formulaires) {
        List<Formulaire> fumeurs = formulaires.stream()
                .filter(f -> f.getConsommationTabac() != null &&
                        !f.getConsommationTabac().equals("NON_FUMEUR"))
                .collect(Collectors.toList());

        List<Formulaire> exFumeurs = formulaires.stream()
                .filter(f -> "EX_FUMEUR".equals(f.getConsommationTabac()))
                .collect(Collectors.toList());

        return StatistiquesDTO.ConsommationTabac.builder()
                .frequenceTabagiques((long) fumeurs.size())
                .moyenneAgePremiereCigarette(getMoyenne(fumeurs, Formulaire::getAgePremiereConsommationTabac))
                .medianeAgePremiereCigarette(getMediane(fumeurs, Formulaire::getAgePremiereConsommationTabac))
                .moyennePaquetsAnnee(getMoyenneDouble(fumeurs, Formulaire::getNombrePaquetsAnnee))
                .medianePaquetsAnnee(getMedianeDouble(fumeurs, Formulaire::getNombrePaquetsAnnee))
                .moyenneAgeSevrageExFumeurs(getMoyenne(exFumeurs, Formulaire::getAgeArretTabac))
                .medianeAgeSevrageExFumeurs(getMediane(exFumeurs, Formulaire::getAgeArretTabac))
                .frequenceSevrageAssiste(exFumeurs.stream()
                        .filter(f -> Boolean.TRUE.equals(f.getSevrageAssiste()))
                        .count())
                .parFrequenceTabac(getDistributionFrequenceTabac(fumeurs))
                .build();
    }

    private List<StatistiquesDTO.ParFrequenceTabac> getDistributionFrequenceTabac(List<Formulaire> formulaires) {
        Map<String, Long> frequences = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getConsommationTabac30Jours()) &&
                        f.getFrequenceTabac30Jours() != null)
                .collect(Collectors.groupingBy(
                        Formulaire::getFrequenceTabac30Jours,
                        Collectors.counting()
                ));

        return frequences.entrySet().stream()
                .map(e -> StatistiquesDTO.ParFrequenceTabac.builder()
                        .frequence(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParFrequenceTabac::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private StatistiquesDTO.ConsommationAlcool getConsommationAlcool(List<Formulaire> formulaires) {
        List<Formulaire> consommateurs = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getConsommationAlcool()))
                .collect(Collectors.toList());

        return StatistiquesDTO.ConsommationAlcool.builder()
                .frequenceConsommateursAlcool((long) consommateurs.size())
                .moyenneAgePremiereConsommation(getMoyenne(consommateurs,
                        Formulaire::getAgePremiereConsommationAlcool))
                .medianeAgePremiereConsommation(getMediane(consommateurs,
                        Formulaire::getAgePremiereConsommationAlcool))
                .moyenneQuantiteConsommee(getMoyenne(consommateurs,
                        Formulaire::getQuantiteAlcoolPrise))
                .medianeQuantiteConsommee(getMediane(consommateurs,
                        Formulaire::getQuantiteAlcoolPrise))
                .parFrequenceAlcool(getDistributionFrequenceAlcool(consommateurs))
                .parTypeAlcool(getDistributionTypeAlcool(consommateurs))
                .build();
    }

    private List<StatistiquesDTO.ParFrequenceAlcool> getDistributionFrequenceAlcool(
            List<Formulaire> formulaires) {
        Map<String, Long> frequences = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getConsommationAlcool30Jours()) &&
                        f.getFrequenceAlcool30Jours() != null)
                .collect(Collectors.groupingBy(
                        Formulaire::getFrequenceAlcool30Jours,
                        Collectors.counting()
                ));

        return frequences.entrySet().stream()
                .map(e -> StatistiquesDTO.ParFrequenceAlcool.builder()
                        .frequence(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParFrequenceAlcool::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParTypeAlcool> getDistributionTypeAlcool(List<Formulaire> formulaires) {
        Map<String, Long> types = new HashMap<>();

        for (Formulaire f : formulaires) {
            if (f.getTypeAlcool() != null) {
                var typeAlcool = f.getTypeAlcool();
                if (Boolean.TRUE.equals(typeAlcool.getBiere())) types.merge("Bière", 1L, Long::sum);
                if (Boolean.TRUE.equals(typeAlcool.getLiqueurs())) types.merge("Liqueurs", 1L, Long::sum);
                if (Boolean.TRUE.equals(typeAlcool.getAlcoolBruler())) types.merge("Alcool à brûler", 1L, Long::sum);
                if (Boolean.TRUE.equals(typeAlcool.getLegmi())) types.merge("Legmi", 1L, Long::sum);
                if (Boolean.TRUE.equals(typeAlcool.getLegmi())) types.merge("Boukha", 1L, Long::sum);


            }
        }

        return types.entrySet().stream()
                .map(e -> StatistiquesDTO.ParTypeAlcool.builder()
                        .type(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParTypeAlcool::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private StatistiquesDTO.ConsommationSpaEntourage getConsommationSpaEntourage(
            List<Formulaire> formulaires) {
        List<Formulaire> avecConsommationEntourage = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getConsommationSpaEntourage()))
                .collect(Collectors.toList());

        return StatistiquesDTO.ConsommationSpaEntourage.builder()
                .frequenceConsommationSpaEntourage((long) avecConsommationEntourage.size())
                .parLienConsommateur(getDistributionLienConsommateur(avecConsommationEntourage))
                .parTypeSpaEntourage(getDistributionTypeSpaEntourage(avecConsommationEntourage))
                .top3SpaEntourage(getTop3SpaEntourage(avecConsommationEntourage))
                .nombreDecesLiesSpaDansEntourage(getDecesLieDrogues(formulaires))
                .build();
    }

    private List<StatistiquesDTO.ParLienConsommateur> getDistributionLienConsommateur(
            List<Formulaire> formulaires) {
        Map<String, Long> liens = new HashMap<>();

        for (Formulaire f : formulaires) {
            if (f.getEntourageSpa() != null) {
                var entourage = f.getEntourageSpa();
                if (Boolean.TRUE.equals(entourage.getMembresFamille())) liens.merge("Membre(s) de la famille", 1L, Long::sum);
                if (Boolean.TRUE.equals(entourage.getAmis())) liens.merge("Ami(e)s", 1L, Long::sum);
                if (Boolean.TRUE.equals(entourage.getMilieuProfessionnel())) liens.merge("Milieu professionnel", 1L, Long::sum);
                if (Boolean.TRUE.equals(entourage.getMilieuSportif())) liens.merge("Milieu sportif", 1L, Long::sum);
                if (Boolean.TRUE.equals(entourage.getMilieuScolaire())) liens.merge("Milieu scolaire et universitaire ", 1L, Long::sum);
                if (Boolean.TRUE.equals(entourage.getAutre())) liens.merge("Autres", 1L, Long::sum);
            }
        }

        return liens.entrySet().stream()
                .map(e -> StatistiquesDTO.ParLienConsommateur.builder()
                        .lien(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParLienConsommateur::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParTypeSpaEntourage> getDistributionTypeSpaEntourage(
            List<Formulaire> formulaires) {
        return getDistributionSpa(formulaires, "ENTOURAGE");
    }

    private List<StatistiquesDTO.ParTypeSpaEntourage> getTop3SpaEntourage(List<Formulaire> formulaires) {
        return getDistributionTypeSpaEntourage(formulaires).stream()
                .limit(3)
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParTypeSpaEntourage> getDistributionSpa(
            List<Formulaire> formulaires, String typeSubstance) {
        Map<String, Long> types = new HashMap<>();

        for (Formulaire f : formulaires) {
            var substance = f.getSubstancesPsychoactives().stream()
                    .filter(s -> s.getType().name().equals(typeSubstance))
                    .findFirst()
                    .orElse(null);

            if (substance != null) {
                if (Boolean.TRUE.equals(substance.getTabac())) types.merge("Tabac", 1L, Long::sum);
                if (Boolean.TRUE.equals(substance.getAlcool())) types.merge("Alcool", 1L, Long::sum);
                if (Boolean.TRUE.equals(substance.getCannabis())) types.merge("Cannabis", 1L, Long::sum);
                if (Boolean.TRUE.equals(substance.getHeroine())) types.merge("Héroïne", 1L, Long::sum);
                if (Boolean.TRUE.equals(substance.getMorphiniques())) types.merge("Morphiniques", 1L, Long::sum);
                if (Boolean.TRUE.equals(substance.getEcstasy())) types.merge("Ecstasy", 1L, Long::sum);
                if (Boolean.TRUE.equals(substance.getPregabaline())) types.merge("Prégabaline", 1L, Long::sum);
            }
        }

        return types.entrySet().stream()
                .map(e -> StatistiquesDTO.ParTypeSpaEntourage.builder()
                        .type(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParTypeSpaEntourage::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private StatistiquesDTO.ConsommationSpaPersonnelle getConsommationSpaPersonnelle(
            List<Formulaire> formulaires) {
        List<Formulaire> avecConsommationPersonnelle = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getConsommationSpaPersonnelle()))
                .collect(Collectors.toList());

        long polyConsommation = avecConsommationPersonnelle.stream()
                .filter(f -> f.getSubstancesPsychoactives().stream()
                        .filter(s -> s.getType().name().equals("ACTUELLE"))
                        .count() > 1)
                .count();

        return StatistiquesDTO.ConsommationSpaPersonnelle.builder()
                .nombreTotalDemandesTraitement((long) avecConsommationPersonnelle.size())
                .parTypeSpa(getDistributionTypeSpaPersonnelle(avecConsommationPersonnelle))
                .topSpaConsommees(getTopSpaConsommees(avecConsommationPersonnelle))
                .spaInitiation(getDistributionSpaInitiation(avecConsommationPersonnelle))
                .moyenneAgeInitiation(getMoyenne(avecConsommationPersonnelle,
                        Formulaire::getAgeInitiationPremiere))
                .medianeAgeInitiation(getMediane(avecConsommationPersonnelle,
                        Formulaire::getAgeInitiationPremiere))
                .frequencePolyConsommation(polyConsommation)
                .associationsUsageFrequentes(getAssociationsUsageFrequentes(avecConsommationPersonnelle))
                .substancesPrincipalesPolyConsommateurs(getSubstancesPrincipalesPolyConsommateurs(
                        avecConsommationPersonnelle))
                .moyenneAgeInitiationSubstancePrincipale(getMoyenne(avecConsommationPersonnelle,
                        Formulaire::getAgeInitiationPrincipale))
                .medianeAgeInitiationSubstancePrincipale(getMediane(avecConsommationPersonnelle,
                        Formulaire::getAgeInitiationPrincipale))
                .frequenceSubstancePrincipale(getFrequenceSubstancePrincipale(avecConsommationPersonnelle))
                .frequenceAccompagnementSevrage(avecConsommationPersonnelle.stream()
                        .filter(f -> Boolean.TRUE.equals(f.getAccompagnementSevrage()))
                        .count())
                .build();
    }

    private List<StatistiquesDTO.ParTypeSpa> getDistributionTypeSpaPersonnelle(List<Formulaire> formulaires) {
        Map<String, Long> types = new HashMap<>();

        for (Formulaire f : formulaires) {
            f.getSubstancesPsychoactives().stream()
                    .filter(s -> s.getType().name().equals("ACTUELLE"))
                    .forEach(substance -> {
                        if (Boolean.TRUE.equals(substance.getTabac())) types.merge("Tabac", 1L, Long::sum);
                        if (Boolean.TRUE.equals(substance.getAlcool())) types.merge("Alcool", 1L, Long::sum);
                        if (Boolean.TRUE.equals(substance.getCannabis())) types.merge("Cannabis", 1L, Long::sum);
                        if (Boolean.TRUE.equals(substance.getHeroine())) types.merge("Héroïne", 1L, Long::sum);
                        if (Boolean.TRUE.equals(substance.getMorphiniques()))
                            types.merge("Morphiniques", 1L, Long::sum);
                        if (Boolean.TRUE.equals(substance.getEcstasy())) types.merge("Ecstasy", 1L, Long::sum);
                        if (Boolean.TRUE.equals(substance.getPregabaline()))
                            types.merge("Prégabaline", 1L, Long::sum);
                    });
        }

        return types.entrySet().stream()
                .map(e -> StatistiquesDTO.ParTypeSpa.builder()
                        .type(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParTypeSpa::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParTypeSpa> getTopSpaConsommees(List<Formulaire> formulaires) {
        return getDistributionTypeSpaPersonnelle(formulaires).stream()
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParTypeSpa> getDistributionSpaInitiation(List<Formulaire> formulaires) {
        Map<String, Long> types = new HashMap<>();

        for (Formulaire f : formulaires) {
            var substance = f.getSubstanceInitiation();
            if (substance != null) {
                if (Boolean.TRUE.equals(substance.getTabac())) types.merge("Tabac", 1L, Long::sum);
                if (Boolean.TRUE.equals(substance.getAlcool())) types.merge("Alcool", 1L, Long::sum);
                if (Boolean.TRUE.equals(substance.getCannabis())) types.merge("Cannabis", 1L, Long::sum);
                if (Boolean.TRUE.equals(substance.getHeroine())) types.merge("Héroïne", 1L, Long::sum);
                if (Boolean.TRUE.equals(substance.getMorphiniques())) types.merge("Morphiniques", 1L, Long::sum);
                if (Boolean.TRUE.equals(substance.getEcstasy())) types.merge("Ecstasy", 1L, Long::sum);
                if (Boolean.TRUE.equals(substance.getPregabaline())) types.merge("Prégabaline", 1L, Long::sum);
            }
        }

        return types.entrySet().stream()
                .map(e -> StatistiquesDTO.ParTypeSpa.builder()
                        .type(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParTypeSpa::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.AssociationUsage> getAssociationsUsageFrequentes(
            List<Formulaire> formulaires) {
        Map<String, Long> associations = new HashMap<>();

        for (Formulaire f : formulaires) {
            List<String> substances = new ArrayList<>();
            f.getSubstancesPsychoactives().stream()
                    .filter(s -> s.getType().name().equals("ACTUELLE"))
                    .forEach(s -> {
                        if (Boolean.TRUE.equals(s.getTabac())) substances.add("Tabac");
                        if (Boolean.TRUE.equals(s.getAlcool())) substances.add("Alcool");
                        if (Boolean.TRUE.equals(s.getCannabis())) substances.add("Cannabis");
                        if (Boolean.TRUE.equals(s.getHeroine())) substances.add("Héroïne");
                    });

            if (substances.size() > 1) {
                substances.sort(String::compareTo);
                String association = String.join(" + ", substances);
                associations.merge(association, 1L, Long::sum);
            }
        }

        return associations.entrySet().stream()
                .map(e -> StatistiquesDTO.AssociationUsage.builder()
                        .association(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.AssociationUsage::getNombre).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParTypeSpa> getSubstancesPrincipalesPolyConsommateurs(
            List<Formulaire> formulaires) {
        Map<String, Long> types = new HashMap<>();

        for (Formulaire f : formulaires) {
            long nbSubstances = f.getSubstancesPsychoactives().stream()
                    .filter(s -> s.getType().name().equals("ACTUELLE"))
                    .count();

            if (nbSubstances > 1) {
                var substancePrincipale = f.getSubstancePrincipale();
                if (substancePrincipale != null) {
                    if (Boolean.TRUE.equals(substancePrincipale.getTabac())) types.merge("Tabac", 1L, Long::sum);
                    if (Boolean.TRUE.equals(substancePrincipale.getAlcool())) types.merge("Alcool", 1L, Long::sum);
                    if (Boolean.TRUE.equals(substancePrincipale.getCannabis()))
                        types.merge("Cannabis", 1L, Long::sum);
                    if (Boolean.TRUE.equals(substancePrincipale.getHeroine())) types.merge("Héroïne", 1L, Long::sum);
                }
            }
        }

        return types.entrySet().stream()
                .map(e -> StatistiquesDTO.ParTypeSpa.builder()
                        .type(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParTypeSpa::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.FrequenceConsommationSubstancePrincipale> getFrequenceSubstancePrincipale(
            List<Formulaire> formulaires) {
        Map<String, Long> frequences = formulaires.stream()
                .filter(f -> f.getFrequenceSubstancePrincipale() != null)
                .collect(Collectors.groupingBy(
                        Formulaire::getFrequenceSubstancePrincipale,
                        Collectors.counting()
                ));

        return frequences.entrySet().stream()
                .map(e -> StatistiquesDTO.FrequenceConsommationSubstancePrincipale.builder()
                        .frequence(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(
                        StatistiquesDTO.FrequenceConsommationSubstancePrincipale::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private StatistiquesDTO.AutresAddictions getAutresAddictions(List<Formulaire> formulaires) {
        return StatistiquesDTO.AutresAddictions.builder()
                .prevalenceAddictionJeuxPathologiques(formulaires.stream()
                        .filter(f -> Boolean.TRUE.equals(f.getAddictionJeux()))
                        .count())
                .prevalenceAddictionEcrans(formulaires.stream()
                        .filter(f -> Boolean.TRUE.equals(f.getAddictionEcrans()))
                        .count())
                .prevalenceComportementsSexuelsAddictifs(formulaires.stream()
                        .filter(f -> Boolean.TRUE.equals(f.getComportementsSexuels()))
                        .count())
                .build();
    }

    private StatistiquesDTO.ComportementsEtTests getComportementsEtTests(List<Formulaire> formulaires) {
        List<StatistiquesDTO.ParVoieAdministration> voies = getDistributionVoieAdministration(formulaires);

        long usagersInjecteurs = formulaires.stream()
                .filter(f -> f.getVoieAdministration() != null &&
                           Boolean.TRUE.equals(f.getVoieAdministration().getInjectee()))
                .count();

        long usagersInjecteursAvecEchange = formulaires.stream()
                .filter(f -> f.getVoieAdministration() != null &&
                           Boolean.TRUE.equals(f.getVoieAdministration().getInjectee()) &&
                           Boolean.TRUE.equals(f.getEchangeSeringues()))
                .count();

        return StatistiquesDTO.ComportementsEtTests.builder()
                .parVoieAdministration(voies)
                .voiesAdministrationPlusFrequentes(voies.stream()
                        .limit(5)
                        .collect(Collectors.toList()))
                .frequencePartageSeringues(formulaires.stream()
                        .filter(f -> "OUI".equalsIgnoreCase(f.getPartageSeringues()))
                        .count())
                .proportionEchangeSeringues(usagersInjecteurs > 0 ?
                        (usagersInjecteursAvecEchange * 100 / usagersInjecteurs) : 0L)
                .echangeSeringuesParONG(getEchangeSeringuesParONG(formulaires))
                .hospitalisations(getHospitalisations(formulaires))
                .testsDepistage(getTestsDepistage(formulaires))
                .build();
    }

    private List<StatistiquesDTO.ParVoieAdministration> getDistributionVoieAdministration(
            List<Formulaire> formulaires) {
        Map<String, Long> voies = new HashMap<>();

        for (Formulaire f : formulaires) {
            if (f.getVoieAdministration() != null) {
                var voie = f.getVoieAdministration();
                if (Boolean.TRUE.equals(voie.getFumee())) voies.merge("Fumée", 1L, Long::sum);
                if (Boolean.TRUE.equals(voie.getInjectee())) voies.merge("Injection", 1L, Long::sum);
                if (Boolean.TRUE.equals(voie.getIngeree())) voies.merge("Ingérée/bue", 1L, Long::sum);
                if (Boolean.TRUE.equals(voie.getSniffee())) voies.merge("Sniffée", 1L, Long::sum);
                if (Boolean.TRUE.equals(voie.getInhalee())) voies.merge("Inhalée", 1L, Long::sum);
            }
        }

        return voies.entrySet().stream()
                .map(e -> StatistiquesDTO.ParVoieAdministration.builder()
                        .voie(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParVoieAdministration::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.EchangeSeringuesONG> getEchangeSeringuesParONG(List<Formulaire> formulaires) {
        Map<String, Long> ongMap = new HashMap<>();

        for (Formulaire f : formulaires) {
            if (Boolean.TRUE.equals(f.getEchangeSeringues()) &&
                f.getEchangeSeringuesOng() != null && !f.getEchangeSeringuesOng().trim().isEmpty()) {
                ongMap.merge(f.getEchangeSeringuesOng(), 1L, Long::sum);
            }
        }

        return ongMap.entrySet().stream()
                .map(e -> StatistiquesDTO.EchangeSeringuesONG.builder()
                        .ong(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.EchangeSeringuesONG::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private StatistiquesDTO.Hospitalisations getHospitalisations(List<Formulaire> formulaires) {
        long hospitalisationsUsageDrogues = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getHospitalisationUsageDrogues()))
                .count();

        long hospitalisationsOverdose = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getHospitalisationOverdose()))
                .count();

        long hospitalisationsEndocardite = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getHospitalisationEndocardite()))
                .count();

        long nombreTotalHospitalisations = formulaires.stream()
                .filter(f -> f.getNombreHospitalisations() != null && f.getNombreHospitalisations() > 0)
                .mapToLong(f -> f.getNombreHospitalisations())
                .sum();

        List<StatistiquesDTO.TypeHospitalisation> parType = new ArrayList<>();
        if (hospitalisationsOverdose > 0) {
            parType.add(StatistiquesDTO.TypeHospitalisation.builder()
                    .type("Overdose")
                    .nombre(hospitalisationsOverdose)
                    .build());
        }
        if (hospitalisationsEndocardite > 0) {
            parType.add(StatistiquesDTO.TypeHospitalisation.builder()
                    .type("Endocardite")
                    .nombre(hospitalisationsEndocardite)
                    .build());
        }
        if (hospitalisationsUsageDrogues > 0) {
            parType.add(StatistiquesDTO.TypeHospitalisation.builder()
                    .type("Autres complications liées aux drogues")
                    .nombre(hospitalisationsUsageDrogues - hospitalisationsOverdose - hospitalisationsEndocardite)
                    .build());
        }

        return StatistiquesDTO.Hospitalisations.builder()
                .nombreHospitalisationsUsageDrogues(hospitalisationsUsageDrogues)
                .nombreHospitalisationsOverdose(hospitalisationsOverdose)
                .nombreHospitalisationsEndocardite(hospitalisationsEndocardite)
                .nombreTotalHospitalisations(nombreTotalHospitalisations)
                .parType(parType)
                .build();
    }

    private StatistiquesDTO.TestsDepistage getTestsDepistage(List<Formulaire> formulaires) {

        long testsVih = 0;
        long testsVhc = 0;
        long testsVhb = 0;
        long testsSyphilis = 0;

        for (Formulaire f : formulaires) {
            if (f.getTestsDepistage() == null) {
                continue;
            }

            for (TestDepistage test : f.getTestsDepistage()) {

                // ✅ Ne compter que les tests réalisés
                if (!Boolean.TRUE.equals(test.getRealise())) {
                    continue;
                }

                switch (test.getTypeTest()) {
                    case VIH -> testsVih++;
                    case VHC -> testsVhc++;
                    case VHB -> testsVhb++;
                    case SYPHILIS -> testsSyphilis++;
                }
            }
        }

        return StatistiquesDTO.TestsDepistage.builder()
                .nombreTestsVih(testsVih)
                .nombreTestsVhc(testsVhc)
                .nombreTestsVhb(testsVhb)
                .nombreTestsSyphilis(testsSyphilis)
                .build();
    }


    private StatistiquesDTO.Comorbidites getComorbidites(List<Formulaire> formulaires) {

        long troublesAlimentairesCount = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getTroublesAlimentaires()))
                .count();
        log.info("Comorbidités - Troubles alimentaires : {}", troublesAlimentairesCount);

        long atcdPsychPersoCount = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getComorbiditePsychiatriquePersonnelle()))
                .count();
        log.info("Comorbidités - ATCD psychiatriques personnels : {}", atcdPsychPersoCount);

        long atcdSomatiquesPersoCount = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getComorbiditeSomatiquePersonnelle()))
                .count();
        log.info("Comorbidités - ATCD somatiques personnels : {}", atcdSomatiquesPersoCount);

        return StatistiquesDTO.Comorbidites.builder()
                .frequenceTroublesAlimentaires(troublesAlimentairesCount)
                .frequenceAtcdPsychiatriquesPersonnels(atcdPsychPersoCount)
                .frequenceAtcdSomatiquesPersonnels(atcdSomatiquesPersoCount)
                .atcdPsychiatriquesPlusFrequents(getAtcdPsychiatriques(formulaires))
                .atcdSomatiquesPlusFrequents(getAtcdSomatiques(formulaires))
                .build();
    }


    private List<StatistiquesDTO.ParTypeComorbidite> getAtcdPsychiatriques(List<Formulaire> formulaires) {
        Map<String, Long> atcds = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getComorbiditePsychiatriquePersonnelle()) &&
                        f.getComorbiditePsychiatriquePersonnellePrecision() != null)
                .collect(Collectors.groupingBy(
                        Formulaire::getComorbiditePsychiatriquePersonnellePrecision,
                        Collectors.counting()
                ));
            log.info("ani hne");
        return atcds.entrySet().stream()
                .map(e -> StatistiquesDTO.ParTypeComorbidite.builder()
                        .type(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParTypeComorbidite::getNombre).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<StatistiquesDTO.ParTypeComorbidite> getAtcdSomatiques(List<Formulaire> formulaires) {
        Map<String, Long> atcds = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getComorbiditeSomatiquePersonnelle()) &&
                        f.getComorbiditeSomatiquePersonnellePrecision() != null)
                .collect(Collectors.groupingBy(
                        Formulaire::getComorbiditeSomatiquePersonnellePrecision,
                        Collectors.counting()
                ));

        return atcds.entrySet().stream()
                .map(e -> StatistiquesDTO.ParTypeComorbidite.builder()
                        .type(e.getKey())
                        .nombre(e.getValue())
                        .build())
                .sorted(Comparator.comparing(StatistiquesDTO.ParTypeComorbidite::getNombre).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    private StatistiquesDTO.ConduiteTherapeutique getConduiteTherapeutique(List<Formulaire> formulaires) {
        List<StatistiquesDTO.ParModalitePriseEnCharge> modalites = new ArrayList<>();

        long medicale = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getPriseEnChargeMedicale()))
                .count();
        if (medicale > 0) {
            modalites.add(StatistiquesDTO.ParModalitePriseEnCharge.builder()
                    .modalite("Prise en charge médicale")
                    .nombre(medicale)
                    .build());
        }

        long psychologique = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getPriseEnChargePsychologique()))
                .count();
        if (psychologique > 0) {
            modalites.add(StatistiquesDTO.ParModalitePriseEnCharge.builder()
                    .modalite("Prise en charge psychologique")
                    .nombre(psychologique)
                    .build());
        }

        long sociale = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getPriseEnChargeSociale()))
                .count();
        if (sociale > 0) {
            modalites.add(StatistiquesDTO.ParModalitePriseEnCharge.builder()
                    .modalite("Prise en charge sociale")
                    .nombre(sociale)
                    .build());
        }

        long hospitalisation = formulaires.stream()
                .filter(f -> Boolean.TRUE.equals(f.getHospitalisation()))
                .count();
        if (hospitalisation > 0) {
            modalites.add(StatistiquesDTO.ParModalitePriseEnCharge.builder()
                    .modalite("Hospitalisation")
                    .nombre(hospitalisation)
                    .build());
        }

        Map<Long, Long> consultationsParPatient = formulaires.stream()
                .collect(Collectors.groupingBy(
                        f -> f.getPatient().getId(),
                        Collectors.counting()
                ));

        double moyenneConsultations = consultationsParPatient.values().stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);

        double medianeConsultations = getMedianeFromValues(
                consultationsParPatient.values().stream()
                        .mapToLong(Long::longValue)
                        .boxed()
                        .collect(Collectors.toList())
        );

        return StatistiquesDTO.ConduiteTherapeutique.builder()
                .parModalitePriseEnCharge(modalites)
                .moyenneNombreConsultations(moyenneConsultations)
                .medianeNombreConsultations(medianeConsultations)
                .build();
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

    private <T> Double getMoyenne(List<Formulaire> formulaires,
                                   java.util.function.Function<Formulaire, T> getter) {
        return formulaires.stream()
                .map(getter)
                .filter(Objects::nonNull)
                .filter(v -> v instanceof Number)
                .mapToDouble(v -> ((Number) v).doubleValue())
                .average()
                .orElse(0.0);
    }

    private <T> Double getMediane(List<Formulaire> formulaires,
                                   java.util.function.Function<Formulaire, T> getter) {
        List<Double> values = formulaires.stream()
                .map(getter)
                .filter(Objects::nonNull)
                .filter(v -> v instanceof Number)
                .map(v -> ((Number) v).doubleValue())
                .sorted()
                .collect(Collectors.toList());

        if (values.isEmpty()) {
            return 0.0;
        }

        int size = values.size();
        if (size % 2 == 0) {
            return (values.get(size / 2 - 1) + values.get(size / 2)) / 2.0;
        } else {
            return values.get(size / 2);
        }
    }

    private Double getMoyenneDouble(List<Formulaire> formulaires,
                                     java.util.function.Function<Formulaire, Double> getter) {
        return formulaires.stream()
                .map(getter)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
    }

    private Double getMedianeDouble(List<Formulaire> formulaires,
                                     java.util.function.Function<Formulaire, Double> getter) {
        List<Double> values = formulaires.stream()
                .map(getter)
                .filter(Objects::nonNull)
                .sorted()
                .collect(Collectors.toList());

        if (values.isEmpty()) {
            return 0.0;
        }

        int size = values.size();
        if (size % 2 == 0) {
            return (values.get(size / 2 - 1) + values.get(size / 2)) / 2.0;
        } else {
            return values.get(size / 2);
        }
    }

    private Double getMedianeFromValues(List<Long> values) {
        if (values.isEmpty()) {
            return 0.0;
        }

        List<Long> sorted = values.stream().sorted().collect(Collectors.toList());
        int size = sorted.size();
        if (size % 2 == 0) {
            return (sorted.get(size / 2 - 1) + sorted.get(size / 2)) / 2.0;
        } else {
            return (double) sorted.get(size / 2);
        }
    }

    public List<Integer> getAnneesDisponibles() {
        return formulaireRepository.findDistinctYears();
    }

    public List<String> getGouvernoratsDisponibles() {
        return gouvernoratRepository.findAll().stream()
                .map(g -> g.getId().toString())
                .collect(Collectors.toList());
    }
}
