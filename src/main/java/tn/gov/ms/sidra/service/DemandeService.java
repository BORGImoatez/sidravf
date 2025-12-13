package tn.gov.ms.sidra.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.gov.ms.sidra.entity.DemandePriseEnCharge;
import tn.gov.ms.sidra.entity.User;
import tn.gov.ms.sidra.repository.DemandeRepository;
import tn.gov.ms.sidra.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemandeService {
    private final DemandeRepository repository;
    private final UserRepository userRepository;

    public List<DemandePriseEnCharge> findAll() { return repository.findAll(); }
    public DemandePriseEnCharge findById(Long id) { return repository.findById(id).orElse(null); }
    public DemandePriseEnCharge save(DemandePriseEnCharge demande,Long userid) {
        User user=userRepository.findById(userid).orElseThrow();
        demande.setUtilisateur(user);
        DemandePriseEnCharge demandeSave=repository.save(demande);
        return repository.save(demandeSave); }
    public void deleteById(Long id) { repository.deleteById(id); }
}
