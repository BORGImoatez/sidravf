package tn.gov.ms.sidra.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.gov.ms.sidra.dto.formulaire.StatistiquesDTO;
import tn.gov.ms.sidra.entity.User;
import tn.gov.ms.sidra.entity.UserRole;
import tn.gov.ms.sidra.service.StatistiquesService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/statistiques")
@RequiredArgsConstructor
@CrossOrigin(origins = "localhost:4200", maxAge = 3600)
public class StatistiquesController {

    private final StatistiquesService statistiquesService;

    /**
     * Récupère les statistiques nationales avec filtres optionnels
     * Accessible à tous les utilisateurs
     */
    @GetMapping("/national")
    public ResponseEntity<StatistiquesDTO> getStatistiquesNationales(
            @RequestParam(required = false) String sexe,
            @RequestParam(required = false) Integer anneeConsultation,
            @RequestParam(required = false) Integer moisConsultation,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) String gouvernorat,
            @RequestParam(required = false) Integer ageMin,
            @RequestParam(required = false) Integer ageMax
    ) {
        StatistiquesDTO stats = statistiquesService.getStatistiquesNationales(
                sexe, anneeConsultation, moisConsultation, dateDebut, dateFin,
                gouvernorat, ageMin, ageMax
        );
        return ResponseEntity.ok(stats);
    }

    /**
     * Récupère les statistiques par structure
     * Accessible uniquement aux utilisateurs avec rôle UTILISATEUR pour leur structure
     */
    @GetMapping("/structure")
    public ResponseEntity<StatistiquesDTO> getStatistiquesStructure(
            Authentication authentication,
            @RequestParam(required = false) String sexe,
            @RequestParam(required = false) Integer anneeConsultation,
            @RequestParam(required = false) Integer moisConsultation,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Integer ageMin,
            @RequestParam(required = false) Integer ageMax,
            @RequestParam(required = false, defaultValue = "false") Boolean mesDonneesUniquement
    ) {
        User user = (User) authentication.getPrincipal();

        if (user.getRole() != UserRole.UTILISATEUR || user.getStructure() == null) {
            return ResponseEntity.badRequest().build();
        }

        StatistiquesDTO stats = statistiquesService.getStatistiquesStructure(
                user.getStructure().getId(),
                sexe, anneeConsultation, moisConsultation, dateDebut, dateFin,
                ageMin, ageMax, mesDonneesUniquement ? user.getId() : null
        );
        return ResponseEntity.ok(stats);
    }

    /**
     * Récupère les statistiques avec filtres optionnels (ancienne version, à conserver pour compatibilité)
     */
    @GetMapping
    public ResponseEntity<StatistiquesDTO> getStatistiques(
            @RequestParam(required = false) String sexe,
            @RequestParam(required = false) Integer anneeConsultation,
            @RequestParam(required = false) Integer ageMin,
            @RequestParam(required = false) Integer ageMax
    ) {
        StatistiquesDTO stats = statistiquesService.getStatistiquesNationales(
                sexe, anneeConsultation, null, null, null, null, ageMin, ageMax
        );
        return ResponseEntity.ok(stats);
    }

    /**
     * Récupère les années disponibles pour le filtre
     */
    @GetMapping("/annees")
    public ResponseEntity<List<Integer>> getAnneesDisponibles() {
        List<Integer> annees = statistiquesService.getAnneesDisponibles();
        return ResponseEntity.ok(annees);
    }

    /**
     * Récupère les gouvernorats disponibles pour le filtre
     */
    @GetMapping("/gouvernorats")
    public ResponseEntity<List<String>> getGouvernoratsDisponibles() {
        List<String> gouvernorats = statistiquesService.getGouvernoratsDisponibles();
        return ResponseEntity.ok(gouvernorats);
    }
}