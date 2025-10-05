package tn.gov.ms.sidra.entity;

import lombok.Getter;

@Getter
public enum UserRole {
    SUPER_ADMIN("Super Administrateur"),
    ADMINISTRATEUR_INSP("Administrateur INSP"),
    BNS("Rôle BNS"),
    ADMIN_STRUCTURE("Administrateur Structure"),
    UTILISATEUR("Utilisateur"),
    EXTERNE("Utilisateur Externe"),
    PENDING("En attente d'activation");

    private final String label;

    UserRole(String label) {
        this.label = label;
    }

}