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
    private Long decesLieDrogues;
    private List<ModeAdministration> modesAdministration;
    private DemandesTraitement demandesTraitement;

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
}