package tn.gov.ms.sidra.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tn.gov.ms.sidra.dto.offredrogues.StatistiquesMarcheDTO;
import tn.gov.ms.sidra.entity.User;
import tn.gov.ms.sidra.entity.UserRole;
import tn.gov.ms.sidra.service.OffreDroguesStatistiquesService;

import java.time.LocalDate;

@RestController
@RequestMapping("/statistiques/marche")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
public class StatistiquesMarcheController {

    private final OffreDroguesStatistiquesService statistiquesService;

    @GetMapping("/nationales")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'UTILISATEUR', 'ROLE_BNS')")
    public ResponseEntity<StatistiquesMarcheDTO> getStatistiquesNationales(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) String gouvernorat,
            @AuthenticationPrincipal User currentUser) {

        log.info("Récupération des statistiques nationales du marché par: {}", currentUser.getEmail());

        StatistiquesMarcheDTO statistiques = statistiquesService.getStatistiquesNationales(
                dateDebut, dateFin, gouvernorat);

        return ResponseEntity.ok(statistiques);
    }

    @GetMapping("/structure")
    @PreAuthorize("hasAnyRole('ADMIN_STRUCTURE', 'SUPER_ADMIN', 'UTILISATEUR')")
    public ResponseEntity<StatistiquesMarcheDTO> getStatistiquesStructure(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false, defaultValue = "false") Boolean mesDonneesUniquement,
            @AuthenticationPrincipal User currentUser) {

        log.info("Récupération des statistiques du marché pour structure par: {}", currentUser.getEmail());

        Long structureId = null;
        if (currentUser.getRole() == UserRole.ADMIN_STRUCTURE || currentUser.getRole() == UserRole.UTILISATEUR) {
            if (currentUser.getStructure() == null) {
                return ResponseEntity.badRequest().build();
            }
            structureId = currentUser.getStructure().getId();
        }

        StatistiquesMarcheDTO statistiques = statistiquesService.getStatistiquesStructure(
                structureId, dateDebut, dateFin, mesDonneesUniquement ? currentUser.getId() : null);

        return ResponseEntity.ok(statistiques);
    }
}
