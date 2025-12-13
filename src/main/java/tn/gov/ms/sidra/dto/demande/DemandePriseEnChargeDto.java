package tn.gov.ms.sidra.dto.demande;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.gov.ms.sidra.entity.Genre;

import java.time.LocalDate;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DemandePriseEnChargeDto {
    private Long id;
    private String nom;
    private String prenom;
    private Genre genre;
    private LocalDate dateNaissance;

    // IDs stockés
    private String gouvernoratId;
    private String delegationId;

    // Libellés pour affichage
    private String gouvernoratLibelle;
    private String delegationLibelle;

    private String auteurType;
    private String lienAvecPatient;
    private String cinAuteur;

    private String typeCertificat;
    private String etablissementPublic;
    private String gouvernoratEtablissement;

    private LocalDate dateCommission;
    private String decision;
    private String etablissementPriseEnCharge;
    private Boolean priseEnChargeMethadone;
    private String piecesManquantes;
    private String motifRefus;
    private String addedBy;
    private LocalDate dateCreation;
}
