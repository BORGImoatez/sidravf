package tn.gov.ms.sidra.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.gov.ms.sidra.dto.demande.StatistiquesDemandeDTO;
import tn.gov.ms.sidra.entity.Delegation;
import tn.gov.ms.sidra.entity.DemandePriseEnCharge;
import tn.gov.ms.sidra.entity.Genre;
import tn.gov.ms.sidra.entity.Gouvernorat;
import tn.gov.ms.sidra.repository.DelegationRepository;
import tn.gov.ms.sidra.repository.DemandeRepository;
import tn.gov.ms.sidra.repository.GouvernoratRepository;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatistiquesDemandeService {

    private final DemandeRepository demandeRepository;

    public StatistiquesDemandeDTO getStatistiquesDemandes(
            String gouvernorat,
            Integer annee,
            Integer mois,
            LocalDate dateDebut,
            LocalDate dateFin
    ) {
        List<DemandePriseEnCharge> demandes = getDemandesWithFilters(
                gouvernorat, annee, mois, dateDebut, dateFin
        );

        long total = demandes.size();

        return StatistiquesDemandeDTO.builder()
                .totalDemandes(total)
                .repartitionSexe(getRepartitionSexe(demandes, total))
                .moyenneAge(getMoyenneAge(demandes))
                .medianeAge(getMedianeAge(demandes))
                .auteursDemandes(getAuteursDemandes(demandes, total))
                .certificatsMedicaux(getCertificatsMedicaux(demandes, total))
                .parGouvernorat(getRepartitionParGouvernorat(demandes, total))
                .build();
    }

    private List<DemandePriseEnCharge> getDemandesWithFilters(
            String gouvernorat,
            Integer annee,
            Integer mois,
            LocalDate dateDebut,
            LocalDate dateFin
    ) {
        List<DemandePriseEnCharge> demandes;

        if (dateDebut != null && dateFin != null) {
            demandes = demandeRepository.findByDateCommissionBetween(dateDebut, dateFin);
        } else {
            demandes = demandeRepository.findAll();
        }

        return demandes.stream()
                .filter(d -> filterDemande(d, gouvernorat, annee, mois))
                .collect(Collectors.toList());
    }

    private boolean filterDemande(DemandePriseEnCharge d, String gouvernorat, Integer annee, Integer mois) {
        if (gouvernorat != null && !gouvernorat.equals(d.getGouvernorat())) {
            return false;
        }

        if (d.getDateCommission() != null) {
            if (annee != null && annee > 0 && d.getDateCommission().getYear() != annee) {
                return false;
            }
            if (mois != null && mois > 0 && d.getDateCommission().getMonthValue() != mois) {
                return false;
            }
        }

        return true;
    }

    private StatistiquesDemandeDTO.RepartitionSexe getRepartitionSexe(
            List<DemandePriseEnCharge> demandes, long total) {
        long hommes = demandes.stream()
                .filter(d -> d.getGenre() == Genre.MASCULIN)
                .count();
        long femmes = demandes.stream()
                .filter(d -> d.getGenre() == Genre.FEMININ)
                .count();

        double pourcentageHommes = total > 0 ? (hommes * 100.0 / total) : 0.0;
        double pourcentageFemmes = total > 0 ? (femmes * 100.0 / total) : 0.0;

        return StatistiquesDemandeDTO.RepartitionSexe.builder()
                .hommes(hommes)
                .femmes(femmes)
                .pourcentageHommes(pourcentageHommes)
                .pourcentageFemmes(pourcentageFemmes)
                .build();
    }

    private Double getMoyenneAge(List<DemandePriseEnCharge> demandes) {
        return demandes.stream()
                .filter(d -> d.getDateNaissance() != null)
                .mapToInt(d -> LocalDate.now().getYear() - d.getDateNaissance().getYear())
                .average()
                .orElse(0.0);
    }

    private Double getMedianeAge(List<DemandePriseEnCharge> demandes) {
        List<Integer> ages = demandes.stream()
                .filter(d -> d.getDateNaissance() != null)
                .map(d -> LocalDate.now().getYear() - d.getDateNaissance().getYear())
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

    private List<StatistiquesDemandeDTO.AuteurDemande> getAuteursDemandes(
            List<DemandePriseEnCharge> demandes, long total) {
        Map<String, Long> auteurs = demandes.stream()
                .filter(d -> d.getAuteurType() != null)
                .collect(Collectors.groupingBy(
                        DemandePriseEnCharge::getAuteurType,
                        Collectors.counting()
                ));

        return auteurs.entrySet().stream()
                .map(e -> StatistiquesDemandeDTO.AuteurDemande.builder()
                        .auteur(formatAuteurType(e.getKey()))
                        .nombre(e.getValue())
                        .pourcentage(total > 0 ? (e.getValue() * 100.0 / total) : 0.0)
                        .build())
                .sorted(Comparator.comparing(StatistiquesDemandeDTO.AuteurDemande::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private List<StatistiquesDemandeDTO.CertificatMedical> getCertificatsMedicaux(
            List<DemandePriseEnCharge> demandes, long total) {
        Map<String, Long> certificats = demandes.stream()
                .filter(d -> d.getTypeCertificat() != null)
                .collect(Collectors.groupingBy(
                        DemandePriseEnCharge::getTypeCertificat,
                        Collectors.counting()
                ));

        return certificats.entrySet().stream()
                .map(e -> StatistiquesDemandeDTO.CertificatMedical.builder()
                        .type(formatTypeCertificat(e.getKey()))
                        .nombre(e.getValue())
                        .pourcentage(total > 0 ? (e.getValue() * 100.0 / total) : 0.0)
                        .build())
                .sorted(Comparator.comparing(StatistiquesDemandeDTO.CertificatMedical::getNombre).reversed())
                .collect(Collectors.toList());
    }
    private final GouvernoratRepository gouvernoratRepository;

    private List<StatistiquesDemandeDTO.ParGouvernorat> getRepartitionParGouvernorat(
            List<DemandePriseEnCharge> demandes, long total) {

        Map<String, List<DemandePriseEnCharge>> parGouvernorat = demandes.stream()
                .filter(d -> d.getGouvernorat() != null)
                .collect(Collectors.groupingBy(DemandePriseEnCharge::getGouvernorat));

        return parGouvernorat.entrySet().stream()
                .map(e -> {
                    String gouvernoratCode = e.getKey();
                    List<DemandePriseEnCharge> demandesGouv = e.getValue();
                    long nombreGouv = demandesGouv.size();

                    // 🔹 Récupération du libellé depuis la base
                    String gouvernoratLibelle = gouvernoratRepository
                            .findById(Long.valueOf(gouvernoratCode))
                            .map(Gouvernorat::getNom)
                            .orElse(gouvernoratCode); // fallback si non trouvé

                    List<StatistiquesDemandeDTO.ParDelegation> delegations =
                            getDelegations(demandesGouv, nombreGouv);

                    return StatistiquesDemandeDTO.ParGouvernorat.builder()
                            .gouvernorat(gouvernoratCode)
                            .gouvernoratLibelle(gouvernoratLibelle)
                            .nombre(nombreGouv)
                            .pourcentage(total > 0 ? (nombreGouv * 100.0 / total) : 0.0)
                            .parDelegation(delegations)
                            .build();
                })
                .sorted(Comparator.comparing(
                        StatistiquesDemandeDTO.ParGouvernorat::getNombre).reversed())
                .collect(Collectors.toList());
    }

    private final DelegationRepository delegationRepository;

    private List<StatistiquesDemandeDTO.ParDelegation> getDelegations(
            List<DemandePriseEnCharge> demandes, long totalGouv) {

        Map<String, Long> parDelegation = demandes.stream()
                .filter(d -> d.getDelegation() != null)
                .collect(Collectors.groupingBy(
                        DemandePriseEnCharge::getDelegation,
                        Collectors.counting()
                ));

        return parDelegation.entrySet().stream()
                .map(e -> {
                    String delegationCode = e.getKey();
                    long nombre = e.getValue();

                    // 🔹 Récupération du libellé depuis la base
                    String delegationLibelle = delegationRepository
                            .findById(Long.valueOf(delegationCode))
                            .map(Delegation::getNom)
                            .orElse(delegationCode); // fallback

                    return StatistiquesDemandeDTO.ParDelegation.builder()
                            .delegation(delegationCode)
                            .delegationLibelle(delegationLibelle)
                            .nombre(nombre)
                            .pourcentage(totalGouv > 0 ? (nombre * 100.0 / totalGouv) : 0.0)
                            .build();
                })
                .sorted(Comparator.comparing(
                        StatistiquesDemandeDTO.ParDelegation::getNombre).reversed())
                .collect(Collectors.toList());
    }


    private String formatAuteurType(String auteurType) {
        return switch (auteurType.toLowerCase()) {
            case "lui_meme" -> "Lui-même/Elle-même";
            case "mere" -> "Mère";
            case "pere" -> "Père";
            case "autre" -> "Autre";
            default -> auteurType;
        };
    }

    private String formatTypeCertificat(String type) {
        return switch (type.toLowerCase()) {
            case "public" -> "Établissement Public";
            case "prive" -> "Établissement Privé";
            default -> type;
        };
    }
}
