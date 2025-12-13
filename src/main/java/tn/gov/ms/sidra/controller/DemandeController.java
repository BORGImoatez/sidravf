package tn.gov.ms.sidra.controller;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tn.gov.ms.sidra.dto.demande.DemandePriseEnChargeDto;
import tn.gov.ms.sidra.entity.Delegation;
import tn.gov.ms.sidra.entity.DemandePriseEnCharge;
import tn.gov.ms.sidra.entity.Gouvernorat;
import tn.gov.ms.sidra.entity.User;
import tn.gov.ms.sidra.repository.DelegationRepository;
import tn.gov.ms.sidra.repository.GouvernoratRepository;
import tn.gov.ms.sidra.service.DemandeService;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/demandes")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "localhost:4200", maxAge = 3600)
public class DemandeController {
    private final DemandeService service;
    private final GouvernoratRepository gouvernoratRepository;
    private final DelegationRepository delegationRepository;




    @PreAuthorize("hasAnyRole('ROLE_BNS','BNS')")
    @GetMapping
    public List<DemandePriseEnChargeDto> getAll() {
        return service.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('ROLE_BNS','BNS')")
    @GetMapping("/{id}")
    public DemandePriseEnCharge getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PreAuthorize("hasAnyRole('ROLE_BNS','BNS')")
    @PostMapping
    public DemandePriseEnCharge create(@RequestBody DemandePriseEnCharge demande,@AuthenticationPrincipal User currentUser) {

        return service.save(demande,currentUser.getId());
    }

    @PreAuthorize("hasAnyRole('ROLE_BNS','BNS')")
    @PutMapping("/{id}")
    public DemandePriseEnCharge update(@PathVariable Long id, @RequestBody DemandePriseEnCharge demande,@AuthenticationPrincipal User currentUser) {
        demande.setId(id);
        return service.save(demande,currentUser.getId());
    }

    @PreAuthorize("hasAnyRole('ROLE_BNS','BNS')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteById(id);
    }
    private DemandePriseEnChargeDto convertToDto(DemandePriseEnCharge d) {

        DemandePriseEnChargeDto dto = new DemandePriseEnChargeDto();

        // Champs simples
        dto.setId(d.getId());
        dto.setNom(d.getNom());
        dto.setPrenom(d.getPrenom());
        dto.setGenre(d.getGenre());
        dto.setDateNaissance(d.getDateNaissance());

        // Gouvernorat
        if (d.getGouvernorat() != null) {
            dto.setGouvernoratId(d.getGouvernorat());
            dto.setGouvernoratLibelle(
                    gouvernoratRepository.findById(Long.valueOf(d.getGouvernorat()))
                            .map(Gouvernorat::getNom)
                            .orElse(null)
            );
        }

        // Délégation
        if (d.getDelegation() != null) {
            dto.setDelegationId(d.getDelegation());
            dto.setDelegationLibelle(
                    delegationRepository.findById(Long.valueOf(d.getDelegation()))
                            .map(Delegation::getNom)
                            .orElse(null)
            );
        }

        // Auteur de la demande
        dto.setAuteurType(d.getAuteurType());
        dto.setLienAvecPatient(d.getLienAvecPatient());
        dto.setCinAuteur(d.getCinAuteur());

        // Certificat médical
        dto.setTypeCertificat(d.getTypeCertificat());
        dto.setEtablissementPublic(d.getEtablissementPublic());
        dto.setGouvernoratEtablissement(d.getGouvernoratEtablissement());

        // Commission & création
        dto.setDateCommission(d.getDateCommission());
        dto.setDateCreation(d.getDateCreation());

        // Décision
        dto.setDecision(d.getDecision());
        dto.setEtablissementPriseEnCharge(d.getEtablissementPriseEnCharge());
        dto.setPriseEnChargeMethadone(d.getPriseEnChargeMethadone());
        dto.setPiecesManquantes(d.getPiecesManquantes());
        dto.setMotifRefus(d.getMotifRefus());

        // Utilisateur ajouté par
        if (d.getUtilisateur() != null) {
            dto.setAddedBy(d.getUtilisateur().getNom()+" "+ d.getUtilisateur().getPrenom());
        }

        return dto;
    }
}
