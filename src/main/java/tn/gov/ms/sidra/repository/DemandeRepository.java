package tn.gov.ms.sidra.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.gov.ms.sidra.entity.DemandePriseEnCharge;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DemandeRepository extends JpaRepository<DemandePriseEnCharge, Long> {

    List<DemandePriseEnCharge> findByDateCommissionBetween(LocalDate dateDebut, LocalDate dateFin);

    List<DemandePriseEnCharge> findByGouvernorat(String gouvernorat);

    @Query("SELECT DISTINCT YEAR(d.dateCommission) FROM DemandePriseEnCharge d WHERE d.dateCommission IS NOT NULL ORDER BY YEAR(d.dateCommission) DESC")
    List<Integer> findDistinctYears();
}
