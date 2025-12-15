package tn.gov.ms.sidra.dto.demande;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatistiquesDemandeDTO {

    private Long totalDemandes;
    private RepartitionSexe repartitionSexe;
    private Double moyenneAge;
    private Double medianeAge;
    private List<AuteurDemande> auteursDemandes;
    private List<CertificatMedical> certificatsMedicaux;
    private List<ParGouvernorat> parGouvernorat;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RepartitionSexe {
        private Long hommes;
        private Long femmes;
        private Double pourcentageHommes;
        private Double pourcentageFemmes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuteurDemande {
        private String auteur;
        private Long nombre;
        private Double pourcentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificatMedical {
        private String type;
        private Long nombre;
        private Double pourcentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParGouvernorat {
        private String gouvernorat;
        private Long nombre;
        private Double pourcentage;
        private List<ParDelegation> parDelegation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParDelegation {
        private String delegation;
        private Long nombre;
        private Double pourcentage;
    }
}
