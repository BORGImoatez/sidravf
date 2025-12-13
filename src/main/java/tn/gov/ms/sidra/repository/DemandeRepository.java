package tn.gov.ms.sidra.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.gov.ms.sidra.entity.DemandePriseEnCharge;

@Repository
public interface DemandeRepository extends JpaRepository<DemandePriseEnCharge, Long> {}
