package tn.gov.ms.sidra.dto.offredrogues;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatistiquesMarcheDTO {

    private Long totalSaisies;
    private List<SubstanceSaisieDto> substancesSaisies;
    private List<SubstanceParRegionDto> saisiesParRegion;
    private List<NouvelleSubstanceDto> nouvellesSubstances;
    private List<PrixSubstanceDto> evolutionPrix;
    private ArrestationsDto arrestations;
    private ProfilSocioDemographiqueDto profilInculpes;
    private List<ComparaisonSaisieConsommationDto> comparaisonSaisieConsommation;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubstanceSaisieDto {
        private String substance;
        private Double quantiteTotale;
        private String unite;
        private Double prixMoyen;
        private Long nombreSaisies;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubstanceParRegionDto {
        private String region;
        private String substance;
        private Double quantite;
        private String unite;
        private Long nombreSaisies;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NouvelleSubstanceDto {
        private String substance;
        private String datePremiereDetection;
        private String region;
        private Double quantite;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrixSubstanceDto {
        private String substance;
        private Double prixMin;
        private Double prixMax;
        private Double prixMoyen;
        private String periode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArrestationsDto {
        private Long totalArrestations;
        private List<ArrestationParTypeDto> parType;
        private List<ArrestationParRegionDto> parRegion;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArrestationParTypeDto {
        private String type;
        private Long nombre;
        private Double pourcentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArrestationParRegionDto {
        private String region;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfilSocioDemographiqueDto {
        private RepartitionGenreDto genre;
        private List<RepartitionAgeDto> age;
        private List<RepartitionNationaliteDto> nationalite;
        private List<RepartitionEtatCivilDto> etatCivil;
        private List<RepartitionProfessionDto> profession;
        private List<RepartitionNSEDto> niveauSocioEconomique;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RepartitionGenreDto {
        private Long masculin;
        private Long feminin;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RepartitionAgeDto {
        private String tranche;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RepartitionNationaliteDto {
        private String nationalite;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RepartitionEtatCivilDto {
        private String etatCivil;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RepartitionProfessionDto {
        private String profession;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RepartitionNSEDto {
        private String niveau;
        private Long nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparaisonSaisieConsommationDto {
        private String substance;
        private Double quantiteSaisie;
        private Long nombreConsommateurs;
        private String tendance;
    }
}
