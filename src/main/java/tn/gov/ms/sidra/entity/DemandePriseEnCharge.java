package tn.gov.ms.sidra.entity;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.time.LocalDate;
import java.util.Objects;


@Entity
@Table(name = "demandes")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class DemandePriseEnCharge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1-2 Nom & Prénom
    private String nom;
    private String prenom;

    // 3 Genre
    @Enumerated(EnumType.STRING)
    private Genre genre;

    // 4 Date de naissance
    private LocalDate dateNaissance;

    // 5 Adresse
    private String delegation;
    private String gouvernorat;

    // 6 Auteur de la demande
    private String auteurType; // "lui_meme", "mere", "pere", "autre"
    private String lienAvecPatient; // seulement si "autre"
    private String cinAuteur;

    // 7 Certificat médical
    private String typeCertificat; // "public" ou "prive"
    private String etablissementPublic;
    private String gouvernoratEtablissement;

    // 8 Date commission
    private LocalDate dateCommission;
    private LocalDate dateCreation;

    // 9 Décision
    private String decision; // "complet_favorable", "incomplet_favorable_reserve", "defavorable"
    private String etablissementPriseEnCharge; // si favorable complet
    private Boolean priseEnChargeMethadone; // oui/non
    private String piecesManquantes; // si incomplet
    private String motifRefus; // si défavorable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    @JsonIgnoreProperties({"structure", "authorities", "password", "username", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
    @ToString.Exclude
    private User utilisateur;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        DemandePriseEnCharge that = (DemandePriseEnCharge) o;
        return getId() != null && Objects.equals(getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}
