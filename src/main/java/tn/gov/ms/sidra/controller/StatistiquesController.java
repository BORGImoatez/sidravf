package tn.gov.ms.sidra.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.gov.ms.sidra.dto.formulaire.StatistiquesDTO;
import tn.gov.ms.sidra.service.StatistiquesService;

import java.util.List;

@RestController
@RequestMapping("/statistiques")
@RequiredArgsConstructor
@CrossOrigin(origins = "localhost:4200", maxAge = 3600)
public class StatistiquesController {

    private final StatistiquesService statistiquesService;

    /**
     * Récupère les statistiques avec filtres optionnels
     */
    @GetMapping
    public ResponseEntity<StatistiquesDTO> getStatistiques(
            @RequestParam(required = false) String sexe,
            @RequestParam(required = false) Integer anneeConsultation,
            @RequestParam(required = false) Integer ageMin,
            @RequestParam(required = false) Integer ageMax
    ) {
        StatistiquesDTO stats = statistiquesService.getStatistiques(
                sexe,
                anneeConsultation,
                ageMin,
                ageMax
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


}