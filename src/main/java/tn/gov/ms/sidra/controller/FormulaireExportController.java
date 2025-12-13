package tn.gov.ms.sidra.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
 import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tn.gov.ms.sidra.entity.Formulaire;
import tn.gov.ms.sidra.entity.User;
import tn.gov.ms.sidra.repository.FormulaireRepository;
import tn.gov.ms.sidra.service.FormulaireExcelExportService;
import tn.gov.ms.sidra.service.FormulaireService;

import java.io.IOException;
 import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@CrossOrigin(origins = "localhost:4200", maxAge = 3600)

@RestController
@RequestMapping("/export")
@RequiredArgsConstructor
public class FormulaireExportController {
    private final FormulaireService formulaireService;

    private final FormulaireRepository formulaireRepository;
    private final FormulaireExcelExportService excelExportService;

    /**
     * Exporter tous les formulaires en Excel
     */
    @GetMapping("/excel")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_STRUCTURE', 'UTILISATEUR')")
    public ResponseEntity<Resource> exportAllFormulairesToExcel(
            @AuthenticationPrincipal User currentUser


            ) throws IOException {
        List<Formulaire> formulaires = formulaireRepository.findByUtilisateur(currentUser);

        byte[] excelData = excelExportService.exportFormulairesToExcel(formulaires);
        ByteArrayResource resource = new ByteArrayResource(excelData);

        String filename = "formulaires_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelData.length)
                .body(resource);
    }
}
