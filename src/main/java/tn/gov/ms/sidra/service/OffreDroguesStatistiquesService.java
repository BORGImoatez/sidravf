package tn.gov.ms.sidra.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.gov.ms.sidra.dto.offredrogues.StatistiquesMarcheDTO;
import tn.gov.ms.sidra.dto.offredrogues.StatistiquesMarcheDTO.*;
import tn.gov.ms.sidra.entity.OffreDrogues;
import tn.gov.ms.sidra.entity.Formulaire;
import tn.gov.ms.sidra.entity.SubstancePsychoactive;
import tn.gov.ms.sidra.repository.OffreDroguesRepository;
import tn.gov.ms.sidra.repository.FormulaireRepository;
import tn.gov.ms.sidra.repository.GouvernoratRepository;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OffreDroguesStatistiquesService {

    private final OffreDroguesRepository offreDroguesRepository;
    private final FormulaireRepository formulaireRepository;
    private final GouvernoratRepository gouvernoratRepository;

    @Transactional(readOnly = true)
    public StatistiquesMarcheDTO getStatistiquesNationales(
            LocalDate dateDebut, LocalDate dateFin, String gouvernorat) {

        log.info("Récupération des statistiques du marché - période: {} - {}, gouvernorat: {}",
                 dateDebut, dateFin, gouvernorat);

        List<OffreDrogues> offres = getOffresWithFilters(dateDebut, dateFin, gouvernorat, null, null);
        List<Formulaire> formulaires = getFormulairesWithFilters(dateDebut, dateFin, gouvernorat);

        return StatistiquesMarcheDTO.builder()
                .totalSaisies((long) offres.size())
                .substancesSaisies(getSubstancesSaisies(offres))
                .saisiesParRegion(getSaisiesParRegion(offres))
                .nouvellesSubstances(getNouvellesSubstances(offres))
                .evolutionPrix(getEvolutionPrix(offres))
                .arrestations(getArrestations(offres))
                .profilInculpes(getProfilSocioDemographique(offres))
                .comparaisonSaisieConsommation(getComparaisonSaisieConsommation(offres, formulaires))
                .evolutionAnnuelleSubstances(getEvolutionAnnuelleSubstances(offres))
                .build();
    }

    @Transactional(readOnly = true)
    public StatistiquesMarcheDTO getStatistiquesStructure(
            Long structureId, LocalDate dateDebut, LocalDate dateFin, Long userId) {

        log.info("Récupération des statistiques du marché pour structure: {}, userId: {}", structureId, userId);

        List<OffreDrogues> offres = getOffresWithFilters(dateDebut, dateFin, null, structureId, userId);
        List<Formulaire> formulaires = formulaireRepository.findByStructureId(structureId);

        if (dateDebut != null && dateFin != null) {
            formulaires = formulaires.stream()
                    .filter(f -> !f.getDateConsultation().isBefore(dateDebut) &&
                                 !f.getDateConsultation().isAfter(dateFin))
                    .collect(Collectors.toList());
        }

        if (userId != null) {
            formulaires = formulaires.stream()
                    .filter(f -> f.getUtilisateur() != null && f.getUtilisateur().getId().equals(userId))
                    .collect(Collectors.toList());
        }

        return StatistiquesMarcheDTO.builder()
                .totalSaisies((long) offres.size())
                .substancesSaisies(getSubstancesSaisies(offres))
                .saisiesParRegion(getSaisiesParRegion(offres))
                .nouvellesSubstances(getNouvellesSubstances(offres))
                .evolutionPrix(getEvolutionPrix(offres))
                .arrestations(getArrestations(offres))
                .profilInculpes(getProfilSocioDemographique(offres))
                .comparaisonSaisieConsommation(getComparaisonSaisieConsommation(offres, formulaires))
                .evolutionAnnuelleSubstances(getEvolutionAnnuelleSubstances(offres))
                .build();
    }

    private List<OffreDrogues> getOffresWithFilters(
            LocalDate dateDebut, LocalDate dateFin, String gouvernorat, Long structureId, Long userId) {

        List<OffreDrogues> offres;

        if (dateDebut != null && dateFin != null) {
            offres = offreDroguesRepository.findByDateSaisieBetween(dateDebut, dateFin);
        } else {
            offres = offreDroguesRepository.findAllByOrderByDateSaisieDesc();
        }

        if (gouvernorat != null) {
            offres = offres.stream()
                    .filter(o -> o.getStructure() != null &&
                                 o.getStructure().getGouvernorat() != null &&
                                 gouvernorat.equals(o.getStructure().getGouvernorat().getId().toString()))
                    .collect(Collectors.toList());
        }

        if (structureId != null) {
            offres = offres.stream()
                    .filter(o -> o.getStructure() != null &&
                                 structureId.equals(o.getStructure().getId()))
                    .collect(Collectors.toList());
        }

        if (userId != null) {
            offres = offres.stream()
                    .filter(o -> o.getUtilisateur() != null && userId.equals(o.getUtilisateur().getId()))
                    .collect(Collectors.toList());
        }

        return offres;
    }

    private List<Formulaire> getFormulairesWithFilters(
            LocalDate dateDebut, LocalDate dateFin, String gouvernorat) {

        List<Formulaire> formulaires;

        if (dateDebut != null && dateFin != null) {
            formulaires = formulaireRepository.findByDateConsultationBetween(dateDebut, dateFin);
        } else {
            formulaires = formulaireRepository.findAll();
        }

        if (gouvernorat != null) {
            formulaires = formulaires.stream()
                    .filter(f -> gouvernorat.equals(f.getGouvernoratResidence()))
                    .collect(Collectors.toList());
        }

        return formulaires;
    }

    private List<SubstanceSaisieDto> getSubstancesSaisies(List<OffreDrogues> offres) {
        Map<String, SubstanceData> substancesMap = new HashMap<>();

        for (OffreDrogues offre : offres) {
            ajouterSubstance(substancesMap, "Cannabis", offre.getCannabis(), "kg",
                           offre.getCannabis() != null && offre.getCannabis() > 0 ? offre.getCannabis() : null,
                           offre.getCannabis() != null && offre.getCannabis() > 0 ? offre.getCannabis() : null,
                           offre.getCannabis() != null && offre.getCannabis() > 0 ? offre.getCannabis() : null,
                           offre.getCannabis() != null && offre.getCannabis() > 0 ? offre.getCannabis() : null,
                           offre.getCannabis() != null && offre.getCannabis() > 0);

            ajouterSubstance(substancesMap, "Comprimés Tableau A", (double) offre.getComprimesTableauA(), "unités",
                           offre.getComprimesTableauA() != null && offre.getComprimesTableauA() > 0 ? offre.getComprimesTableauA().doubleValue() : null,
                           offre.getComprimesTableauA() != null && offre.getComprimesTableauA() > 0 ? offre.getComprimesTableauA().doubleValue() : null,
                           offre.getComprimesTableauA() != null && offre.getComprimesTableauA() > 0 ? offre.getComprimesTableauA().doubleValue() : null,
                           offre.getComprimesTableauA() != null && offre.getComprimesTableauA() > 0 ? offre.getComprimesTableauA().doubleValue() : null,
                           offre.getComprimesTableauA() != null && offre.getComprimesTableauA() > 0);

            ajouterSubstance(substancesMap, "Ecstasy (comprimé)", (double) offre.getEcstasyComprime(), "unités",
                           offre.getEcstasyComprime() != null && offre.getEcstasyComprime() > 0 ? offre.getEcstasyComprime().doubleValue() : null,
                           offre.getEcstasyComprime() != null && offre.getEcstasyComprime() > 0 ? offre.getEcstasyComprime().doubleValue() : null,
                           offre.getEcstasyComprime() != null && offre.getEcstasyComprime() > 0 ? offre.getEcstasyComprime().doubleValue() : null,
                           offre.getEcstasyComprime() != null && offre.getEcstasyComprime() > 0 ? offre.getEcstasyComprime().doubleValue() : null,
                           offre.getEcstasyComprime() != null && offre.getEcstasyComprime() > 0);

            ajouterSubstance(substancesMap, "Ecstasy (poudre)", offre.getEcstasyPoudre(), "kg",
                           offre.getEcstasyPoudre() != null && offre.getEcstasyPoudre() > 0 ? offre.getEcstasyPoudre() : null,
                           offre.getEcstasyPoudre() != null && offre.getEcstasyPoudre() > 0 ? offre.getEcstasyPoudre() : null,
                           offre.getEcstasyPoudre() != null && offre.getEcstasyPoudre() > 0 ? offre.getEcstasyPoudre() : null,
                           offre.getEcstasyPoudre() != null && offre.getEcstasyPoudre() > 0 ? offre.getEcstasyPoudre() : null,
                           offre.getEcstasyPoudre() != null && offre.getEcstasyPoudre() > 0);

            ajouterSubstance(substancesMap, "Subutex", (double) offre.getSubutex(), "unités",
                           offre.getSubutex() != null && offre.getSubutex() > 0 ? offre.getSubutex().doubleValue() : null,
                           offre.getSubutex() != null && offre.getSubutex() > 0 ? offre.getSubutex().doubleValue() : null,
                           offre.getSubutex() != null && offre.getSubutex() > 0 ? offre.getSubutex().doubleValue() : null,
                           offre.getSubutex() != null && offre.getSubutex() > 0 ? offre.getSubutex().doubleValue() : null,
                           offre.getSubutex() != null && offre.getSubutex() > 0);

            ajouterSubstance(substancesMap, "Cocaïne", offre.getCocaine(), "kg",
                           offre.getCocaine() != null && offre.getCocaine() > 0 ? offre.getCocaine() : null,
                           offre.getCocaine() != null && offre.getCocaine() > 0 ? offre.getCocaine() : null,
                           offre.getCocaine() != null && offre.getCocaine() > 0 ? offre.getCocaine() : null,
                           offre.getCocaine() != null && offre.getCocaine() > 0 ? offre.getCocaine() : null,
                           offre.getCocaine() != null && offre.getCocaine() > 0);

            ajouterSubstance(substancesMap, "Héroïne", offre.getHeroine(), "kg",
                           offre.getHeroine() != null && offre.getHeroine() > 0 ? offre.getHeroine() : null,
                           offre.getHeroine() != null && offre.getHeroine() > 0 ? offre.getHeroine() : null,
                           offre.getHeroine() != null && offre.getHeroine() > 0 ? offre.getHeroine() : null,
                           offre.getHeroine() != null && offre.getHeroine() > 0 ? offre.getHeroine() : null,
                           offre.getHeroine() != null && offre.getHeroine() > 0);
        }

        return substancesMap.entrySet().stream()
                .map(entry -> {
                    SubstanceData data = entry.getValue();
                    return SubstanceSaisieDto.builder()
                            .substance(entry.getKey())
                            .quantiteTotale(data.quantiteTotale)
                            .unite(data.unite)
                            .prixMoyen(data.nombreSaisies > 0 ? data.sommePrix / data.nombreSaisies : 0.0)
                            .nombreSaisies(data.nombreSaisies)
                            .build();
                })
                .sorted((a, b) -> Double.compare(b.getQuantiteTotale(), a.getQuantiteTotale()))
                .collect(Collectors.toList());
    }

    private void ajouterSubstance(Map<String, SubstanceData> map, String nom, Double quantite,
                                 String unite, Double prix1, Double prix2, Double prix3,
                                 Double prix4, boolean avecQuantite) {
        if (quantite != null && quantite > 0) {
            SubstanceData data = map.computeIfAbsent(nom, k -> new SubstanceData(unite));
            data.quantiteTotale += quantite;
            if (prix1 != null) data.sommePrix += prix1;
            if (avecQuantite) data.nombreSaisies++;
        }
    }

    private static class SubstanceData {
        double quantiteTotale = 0;
        double sommePrix = 0;
        long nombreSaisies = 0;
        String unite;

        SubstanceData(String unite) {
            this.unite = unite;
        }
    }

    private List<SubstanceParRegionDto> getSaisiesParRegion(List<OffreDrogues> offres) {
        Map<String, Map<String, RegionData>> regionsMap = new HashMap<>();

        for (OffreDrogues offre : offres) {
            String region = getRegionName(offre);
            if (region == null) continue;

            Map<String, RegionData> substancesRegion = regionsMap.computeIfAbsent(region, k -> new HashMap<>());

            ajouterSubstanceRegion(substancesRegion, "Cannabis", offre.getCannabis(), "kg");
            ajouterSubstanceRegion(substancesRegion, "Comprimés Tableau A",
                                 offre.getComprimesTableauA() != null ? offre.getComprimesTableauA().doubleValue() : null, "unités");
            ajouterSubstanceRegion(substancesRegion, "Ecstasy (comprimé)",
                                 offre.getEcstasyComprime() != null ? offre.getEcstasyComprime().doubleValue() : null, "unités");
            ajouterSubstanceRegion(substancesRegion, "Ecstasy (poudre)", offre.getEcstasyPoudre(), "kg");
            ajouterSubstanceRegion(substancesRegion, "Subutex",
                                 offre.getSubutex() != null ? offre.getSubutex().doubleValue() : null, "unités");
            ajouterSubstanceRegion(substancesRegion, "Cocaïne", offre.getCocaine(), "kg");
            ajouterSubstanceRegion(substancesRegion, "Héroïne", offre.getHeroine(), "kg");
        }

        List<SubstanceParRegionDto> result = new ArrayList<>();
        for (Map.Entry<String, Map<String, RegionData>> regionEntry : regionsMap.entrySet()) {
            for (Map.Entry<String, RegionData> substanceEntry : regionEntry.getValue().entrySet()) {
                RegionData data = substanceEntry.getValue();
                result.add(SubstanceParRegionDto.builder()
                        .region(regionEntry.getKey())
                        .substance(substanceEntry.getKey())
                        .quantite(data.quantite)
                        .unite(data.unite)
                        .nombreSaisies(data.nombreSaisies)
                        .build());
            }
        }

        return result.stream()
                .sorted((a, b) -> Double.compare(b.getQuantite(), a.getQuantite()))
                .collect(Collectors.toList());
    }

    private void ajouterSubstanceRegion(Map<String, RegionData> map, String substance,
                                       Double quantite, String unite) {
        if (quantite != null && quantite > 0) {
            RegionData data = map.computeIfAbsent(substance, k -> new RegionData(unite));
            data.quantite += quantite;
            data.nombreSaisies++;
        }
    }

    private static class RegionData {
        double quantite = 0;
        long nombreSaisies = 0;
        String unite;

        RegionData(String unite) {
            this.unite = unite;
        }
    }

    private String getRegionName(OffreDrogues offre) {
        if (offre.getStructure() != null && offre.getStructure().getGouvernorat() != null) {
            return offre.getStructure().getGouvernorat().getNom();
        }
        return "Non spécifié";
    }

    private List<NouvelleSubstanceDto> getNouvellesSubstances(List<OffreDrogues> offres) {
        List<NouvelleSubstanceDto> nouvelles = new ArrayList<>();

        for (OffreDrogues offre : offres) {
            if (Boolean.TRUE.equals(offre.getCannabisNouvelleSubstance()) && offre.getCannabis() != null) {
                nouvelles.add(createNouvelleSubstanceDto("Cannabis", offre));
            }
            if (Boolean.TRUE.equals(offre.getComprimesTableauANouvelleSubstance()) && offre.getComprimesTableauA() != null) {
                nouvelles.add(createNouvelleSubstanceDto("Comprimés Tableau A", offre));
            }
            if (Boolean.TRUE.equals(offre.getEcstasyComprimeNouvelleSubstance()) && offre.getEcstasyComprime() != null) {
                nouvelles.add(createNouvelleSubstanceDto("Ecstasy (comprimé)", offre));
            }
            if (Boolean.TRUE.equals(offre.getEcstasyPoudreNouvelleSubstance()) && offre.getEcstasyPoudre() != null) {
                nouvelles.add(createNouvelleSubstanceDto("Ecstasy (poudre)", offre));
            }
            if (Boolean.TRUE.equals(offre.getSubutexNouvelleSubstance()) && offre.getSubutex() != null) {
                nouvelles.add(createNouvelleSubstanceDto("Subutex", offre));
            }
            if (Boolean.TRUE.equals(offre.getCocaineNouvelleSubstance()) && offre.getCocaine() != null) {
                nouvelles.add(createNouvelleSubstanceDto("Cocaïne", offre));
            }
            if (Boolean.TRUE.equals(offre.getHeroineNouvelleSubstance()) && offre.getHeroine() != null) {
                nouvelles.add(createNouvelleSubstanceDto("Héroïne", offre));
            }
        }

        return nouvelles.stream()
                .sorted((a, b) -> b.getDatePremiereDetection().compareTo(a.getDatePremiereDetection()))
                .collect(Collectors.toList());
    }

    private NouvelleSubstanceDto createNouvelleSubstanceDto(String substance, OffreDrogues offre) {
        return NouvelleSubstanceDto.builder()
                .substance(substance)
                .datePremiereDetection(offre.getDateSaisie().toString())
                .region(getRegionName(offre))
                .quantite(getQuantiteSubstance(substance, offre))
                .build();
    }

    private Double getQuantiteSubstance(String substance, OffreDrogues offre) {
        return switch (substance) {
            case "Cannabis" -> offre.getCannabis();
            case "Comprimés Tableau A" -> offre.getComprimesTableauA() != null ? offre.getComprimesTableauA().doubleValue() : null;
            case "Ecstasy (comprimé)" -> offre.getEcstasyComprime() != null ? offre.getEcstasyComprime().doubleValue() : null;
            case "Ecstasy (poudre)" -> offre.getEcstasyPoudre();
            case "Subutex" -> offre.getSubutex() != null ? offre.getSubutex().doubleValue() : null;
            case "Cocaïne" -> offre.getCocaine();
            case "Héroïne" -> offre.getHeroine();
            default -> null;
        };
    }

    private List<PrixSubstanceDto> getEvolutionPrix(List<OffreDrogues> offres) {
        Map<String, PrixData> prixMap = new HashMap<>();

        for (OffreDrogues offre : offres) {
            ajouterPrix(prixMap, "Cannabis", offre.getCannabis(), offre.getCannabis());
            ajouterPrix(prixMap, "Comprimés Tableau A",
                       offre.getComprimesTableauA() != null ? offre.getComprimesTableauA().doubleValue() : null,
                       offre.getComprimesTableauA() != null ? offre.getComprimesTableauA().doubleValue() : null);
            ajouterPrix(prixMap, "Ecstasy (comprimé)",
                       offre.getEcstasyComprime() != null ? offre.getEcstasyComprime().doubleValue() : null,
                       offre.getEcstasyComprime() != null ? offre.getEcstasyComprime().doubleValue() : null);
            ajouterPrix(prixMap, "Ecstasy (poudre)", offre.getEcstasyPoudre(), offre.getEcstasyPoudre());
            ajouterPrix(prixMap, "Subutex",
                       offre.getSubutex() != null ? offre.getSubutex().doubleValue() : null,
                       offre.getSubutex() != null ? offre.getSubutex().doubleValue() : null);
            ajouterPrix(prixMap, "Cocaïne", offre.getCocaine(), offre.getCocaine());
            ajouterPrix(prixMap, "Héroïne", offre.getHeroine(), offre.getHeroine());
        }

        return prixMap.entrySet().stream()
                .map(entry -> {
                    PrixData data = entry.getValue();
                    return PrixSubstanceDto.builder()
                            .substance(entry.getKey())
                            .prixMin(data.prixMin)
                            .prixMax(data.prixMax)
                            .prixMoyen(data.count > 0 ? data.sommePrix / data.count : 0.0)
                            .periode("Toute la période")
                            .build();
                })
                .collect(Collectors.toList());
    }

    private void ajouterPrix(Map<String, PrixData> map, String substance, Double quantite, Double prix) {
        if (quantite != null && quantite > 0 && prix != null && prix > 0) {
            PrixData data = map.computeIfAbsent(substance, k -> new PrixData());
            data.sommePrix += prix;
            data.count++;
            if (data.prixMin == null || prix < data.prixMin) data.prixMin = prix;
            if (data.prixMax == null || prix > data.prixMax) data.prixMax = prix;
        }
    }

    private static class PrixData {
        double sommePrix = 0;
        int count = 0;
        Double prixMin = null;
        Double prixMax = null;
    }

    private ArrestationsDto getArrestations(List<OffreDrogues> offres) {
        long totalConsommateurs = 0;
        long totalVendeurs = 0;
        long totalTrafiquants = 0;
        Map<String, Long> parRegion = new HashMap<>();

        for (OffreDrogues offre : offres) {
            if (offre.getConsommateurNombre() != null) {
                totalConsommateurs += offre.getConsommateurNombre();
            }
            if (offre.getVendeurNombre() != null) {
                totalVendeurs += offre.getVendeurNombre();
            }
            if (offre.getTrafiquantNombre() != null) {
                totalTrafiquants += offre.getTrafiquantNombre();
            }

            String region = getRegionName(offre);
            long total = (offre.getConsommateurNombre() != null ? offre.getConsommateurNombre() : 0) +
                        (offre.getVendeurNombre() != null ? offre.getVendeurNombre() : 0) +
                        (offre.getTrafiquantNombre() != null ? offre.getTrafiquantNombre() : 0);
            parRegion.merge(region, total, Long::sum);
        }

        long totalArrestations = totalConsommateurs + totalVendeurs + totalTrafiquants;

        List<ArrestationParTypeDto> parType = new ArrayList<>();
        if (totalArrestations > 0) {
            parType.add(ArrestationParTypeDto.builder()
                    .type("Consommateurs")
                    .nombre(totalConsommateurs)
                    .pourcentage((totalConsommateurs * 100.0) / totalArrestations)
                    .build());
            parType.add(ArrestationParTypeDto.builder()
                    .type("Vendeurs")
                    .nombre(totalVendeurs)
                    .pourcentage((totalVendeurs * 100.0) / totalArrestations)
                    .build());
            parType.add(ArrestationParTypeDto.builder()
                    .type("Trafiquants")
                    .nombre(totalTrafiquants)
                    .pourcentage((totalTrafiquants * 100.0) / totalArrestations)
                    .build());
        }

        List<ArrestationParRegionDto> parRegionList = parRegion.entrySet().stream()
                .map(entry -> ArrestationParRegionDto.builder()
                        .region(entry.getKey())
                        .nombre(entry.getValue())
                        .build())
                .sorted((a, b) -> Long.compare(b.getNombre(), a.getNombre()))
                .collect(Collectors.toList());

        return ArrestationsDto.builder()
                .totalArrestations(totalArrestations)
                .parType(parType)
                .parRegion(parRegionList)
                .build();
    }

    private ProfilSocioDemographiqueDto getProfilSocioDemographique(List<OffreDrogues> offres) {
        long totalMasculin = 0;
        long totalFeminin = 0;
        Map<String, Long> age = new HashMap<>();
        Map<String, Long> nationalite = new HashMap<>();
        Map<String, Long> etatCivil = new HashMap<>();
        Map<String, Long> profession = new HashMap<>();
        Map<String, Long> nse = new HashMap<>();

        for (OffreDrogues offre : offres) {
            if (offre.getMasculinNombre() != null) totalMasculin += offre.getMasculinNombre();
            if (offre.getFemininNombre() != null) totalFeminin += offre.getFemininNombre();

            if (offre.getMoins12ansNombre() != null && offre.getMoins12ansNombre() > 0) {
                age.merge("< 12 ans", (long) offre.getMoins12ansNombre(), Long::sum);
            }
            if (offre.getMoins18ansNombre() != null && offre.getMoins18ansNombre() > 0) {
                age.merge("12-18 ans", (long) offre.getMoins18ansNombre(), Long::sum);
            }
            if (offre.getEntre18et40Nombre() != null && offre.getEntre18et40Nombre() > 0) {
                age.merge("18-40 ans", (long) offre.getEntre18et40Nombre(), Long::sum);
            }
            if (offre.getPlus40ansNombre() != null && offre.getPlus40ansNombre() > 0) {
                age.merge("> 40 ans", (long) offre.getPlus40ansNombre(), Long::sum);
            }

            if (offre.getTunisienneNombre() != null && offre.getTunisienneNombre() > 0) {
                nationalite.merge("Tunisienne", (long) offre.getTunisienneNombre(), Long::sum);
            }
            if (offre.getMaghrebineNombre() != null && offre.getMaghrebineNombre() > 0) {
                nationalite.merge("Maghrébine", (long) offre.getMaghrebineNombre(), Long::sum);
            }
            if (offre.getAutresNationaliteNombre() != null && offre.getAutresNationaliteNombre() > 0) {
                nationalite.merge("Autres", (long) offre.getAutresNationaliteNombre(), Long::sum);
            }

            if (offre.getCelibataireNombre() != null && offre.getCelibataireNombre() > 0) {
                etatCivil.merge("Célibataire", (long) offre.getCelibataireNombre(), Long::sum);
            }
            if (offre.getMarieNombre() != null && offre.getMarieNombre() > 0) {
                etatCivil.merge("Marié(e)", (long) offre.getMarieNombre(), Long::sum);
            }
            if (offre.getDivorceNombre() != null && offre.getDivorceNombre() > 0) {
                etatCivil.merge("Divorcé(e)", (long) offre.getDivorceNombre(), Long::sum);
            }
            if (offre.getVeufNombre() != null && offre.getVeufNombre() > 0) {
                etatCivil.merge("Veuf/Veuve", (long) offre.getVeufNombre(), Long::sum);
            }

            if (offre.getEleveNombre() != null && offre.getEleveNombre() > 0) {
                profession.merge("Élève", (long) offre.getEleveNombre(), Long::sum);
            }
            if (offre.getEtudiantNombre() != null && offre.getEtudiantNombre() > 0) {
                profession.merge("Étudiant", (long) offre.getEtudiantNombre(), Long::sum);
            }
            if (offre.getOuvrierNombre() != null && offre.getOuvrierNombre() > 0) {
                profession.merge("Ouvrier", (long) offre.getOuvrierNombre(), Long::sum);
            }
            if (offre.getFonctionnaireNombre() != null && offre.getFonctionnaireNombre() > 0) {
                profession.merge("Fonctionnaire", (long) offre.getFonctionnaireNombre(), Long::sum);
            }

            if (offre.getCarteIndigentNombre() != null && offre.getCarteIndigentNombre() > 0) {
                nse.merge("Carte indigent", (long) offre.getCarteIndigentNombre(), Long::sum);
            }
            if (offre.getCarnetCnamPubliqueNombre() != null && offre.getCarnetCnamPubliqueNombre() > 0) {
                nse.merge("CNAM public", (long) offre.getCarnetCnamPubliqueNombre(), Long::sum);
            }
            if (offre.getCarnetCnamFamilleNombre() != null && offre.getCarnetCnamFamilleNombre() > 0) {
                nse.merge("CNAM famille", (long) offre.getCarnetCnamFamilleNombre(), Long::sum);
            }
            if (offre.getCarnetCnamRemboursementNombre() != null && offre.getCarnetCnamRemboursementNombre() > 0) {
                nse.merge("CNAM remboursement", (long) offre.getCarnetCnamRemboursementNombre(), Long::sum);
            }
        }

        return ProfilSocioDemographiqueDto.builder()
                .genre(RepartitionGenreDto.builder()
                        .masculin(totalMasculin)
                        .feminin(totalFeminin)
                        .build())
                .age(age.entrySet().stream()
                        .map(e -> RepartitionAgeDto.builder()
                                .tranche(e.getKey())
                                .nombre(e.getValue())
                                .build())
                        .sorted((a, b) -> Long.compare(b.getNombre(), a.getNombre()))
                        .collect(Collectors.toList()))
                .nationalite(nationalite.entrySet().stream()
                        .map(e -> RepartitionNationaliteDto.builder()
                                .nationalite(e.getKey())
                                .nombre(e.getValue())
                                .build())
                        .sorted((a, b) -> Long.compare(b.getNombre(), a.getNombre()))
                        .collect(Collectors.toList()))
                .etatCivil(etatCivil.entrySet().stream()
                        .map(e -> RepartitionEtatCivilDto.builder()
                                .etatCivil(e.getKey())
                                .nombre(e.getValue())
                                .build())
                        .sorted((a, b) -> Long.compare(b.getNombre(), a.getNombre()))
                        .collect(Collectors.toList()))
                .profession(profession.entrySet().stream()
                        .map(e -> RepartitionProfessionDto.builder()
                                .profession(e.getKey())
                                .nombre(e.getValue())
                                .build())
                        .sorted((a, b) -> Long.compare(b.getNombre(), a.getNombre()))
                        .collect(Collectors.toList()))
                .niveauSocioEconomique(nse.entrySet().stream()
                        .map(e -> RepartitionNSEDto.builder()
                                .niveau(e.getKey())
                                .nombre(e.getValue())
                                .build())
                        .sorted((a, b) -> Long.compare(b.getNombre(), a.getNombre()))
                        .collect(Collectors.toList()))
                .build();
    }

    private List<ComparaisonSaisieConsommationDto> getComparaisonSaisieConsommation(
            List<OffreDrogues> offres, List<Formulaire> formulaires) {

        Map<String, Double> saisies = new HashMap<>();
        Map<String, Long> consommateurs = new HashMap<>();

        for (OffreDrogues offre : offres) {
            if (offre.getCannabis() != null && offre.getCannabis() > 0) {
                saisies.merge("Cannabis", offre.getCannabis(), Double::sum);
            }
            if (offre.getCocaine() != null && offre.getCocaine() > 0) {
                saisies.merge("Cocaïne", offre.getCocaine(), Double::sum);
            }
            if (offre.getHeroine() != null && offre.getHeroine() > 0) {
                saisies.merge("Héroïne", offre.getHeroine(), Double::sum);
            }
            if (offre.getEcstasyPoudre() != null && offre.getEcstasyPoudre() > 0) {
                saisies.merge("Ecstasy", offre.getEcstasyPoudre(), Double::sum);
            }
        }

        for (Formulaire formulaire : formulaires) {
            for (SubstancePsychoactive substance : formulaire.getSubstancesPsychoactives()) {
                if (Boolean.TRUE.equals(substance.getCannabis())) {
                    consommateurs.merge("Cannabis", 1L, Long::sum);
                }
                if (Boolean.TRUE.equals(substance.getCocaine())) {
                    consommateurs.merge("Cocaïne", 1L, Long::sum);
                }
                if (Boolean.TRUE.equals(substance.getHeroine())) {
                    consommateurs.merge("Héroïne", 1L, Long::sum);
                }
                if (Boolean.TRUE.equals(substance.getEcstasy())) {
                    consommateurs.merge("Ecstasy", 1L, Long::sum);
                }
            }
        }

        List<ComparaisonSaisieConsommationDto> result = new ArrayList<>();
        Set<String> toutesSubstances = new HashSet<>();
        toutesSubstances.addAll(saisies.keySet());
        toutesSubstances.addAll(consommateurs.keySet());

        for (String substance : toutesSubstances) {
            Double quantiteSaisie = saisies.getOrDefault(substance, 0.0);
            Long nombreConsommateurs = consommateurs.getOrDefault(substance, 0L);

            String tendance = "Équilibré";
            if (quantiteSaisie > 0 && nombreConsommateurs == 0) {
                tendance = "Saisies sans consommation déclarée";
            } else if (quantiteSaisie == 0 && nombreConsommateurs > 0) {
                tendance = "Consommation sans saisies";
            } else if (quantiteSaisie > nombreConsommateurs * 10) {
                tendance = "Saisies élevées vs consommation";
            } else if (nombreConsommateurs > quantiteSaisie * 10) {
                tendance = "Consommation élevée vs saisies";
            }

            result.add(ComparaisonSaisieConsommationDto.builder()
                    .substance(substance)
                    .quantiteSaisie(quantiteSaisie)
                    .nombreConsommateurs(nombreConsommateurs)
                    .tendance(tendance)
                    .build());
        }

        return result.stream()
                .sorted((a, b) -> Double.compare(
                        b.getQuantiteSaisie() + b.getNombreConsommateurs(),
                        a.getQuantiteSaisie() + a.getNombreConsommateurs()))
                .collect(Collectors.toList());
    }

    private List<StatistiquesMarcheDTO.EvolutionAnnuelleSubstanceDto> getEvolutionAnnuelleSubstances(List<OffreDrogues> offres) {
        Map<String, Map<Integer, EvolutionData>> evolutionMap = new HashMap<>();

        for (OffreDrogues offre : offres) {
            Integer annee = offre.getDateSaisie().getYear();

            ajouterEvolution(evolutionMap, "Cannabis", annee, offre.getCannabis());
            ajouterEvolution(evolutionMap, "Comprimés Tableau A", annee,
                    offre.getComprimesTableauA() != null ? offre.getComprimesTableauA().doubleValue() : null);
            ajouterEvolution(evolutionMap, "Ecstasy (comprimé)", annee,
                    offre.getEcstasyComprime() != null ? offre.getEcstasyComprime().doubleValue() : null);
            ajouterEvolution(evolutionMap, "Ecstasy (poudre)", annee, offre.getEcstasyPoudre());
            ajouterEvolution(evolutionMap, "Subutex", annee,
                    offre.getSubutex() != null ? offre.getSubutex().doubleValue() : null);
            ajouterEvolution(evolutionMap, "Cocaïne", annee, offre.getCocaine());
            ajouterEvolution(evolutionMap, "Héroïne", annee, offre.getHeroine());
        }

        List<StatistiquesMarcheDTO.EvolutionAnnuelleSubstanceDto> result = new ArrayList<>();
        for (Map.Entry<String, Map<Integer, EvolutionData>> substanceEntry : evolutionMap.entrySet()) {
            String substance = substanceEntry.getKey();
            for (Map.Entry<Integer, EvolutionData> anneeEntry : substanceEntry.getValue().entrySet()) {
                Integer annee = anneeEntry.getKey();
                EvolutionData data = anneeEntry.getValue();
                result.add(StatistiquesMarcheDTO.EvolutionAnnuelleSubstanceDto.builder()
                        .annee(annee)
                        .substance(substance)
                        .quantiteTotale(data.quantiteTotale)
                        .nombreSaisies(data.nombreSaisies)
                        .build());
            }
        }

        return result.stream()
                .sorted((a, b) -> {
                    int anneeCompare = Integer.compare(a.getAnnee(), b.getAnnee());
                    if (anneeCompare != 0) return anneeCompare;
                    return a.getSubstance().compareTo(b.getSubstance());
                })
                .collect(Collectors.toList());
    }

    private void ajouterEvolution(Map<String, Map<Integer, EvolutionData>> map, String substance,
                                   Integer annee, Double quantite) {
        if (quantite != null && quantite > 0) {
            Map<Integer, EvolutionData> annees = map.computeIfAbsent(substance, k -> new HashMap<>());
            EvolutionData data = annees.computeIfAbsent(annee, k -> new EvolutionData());
            data.quantiteTotale += quantite;
            data.nombreSaisies++;
        }
    }

    private static class EvolutionData {
        double quantiteTotale = 0;
        long nombreSaisies = 0;
    }
}
