package tn.gov.ms.sidra.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import tn.gov.ms.sidra.entity.TentativeSevrage;


@Repository
public interface TentativeSevrageRepository extends JpaRepository<TentativeSevrage, Long> {
    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM TentativeSevrage t WHERE t.formulaire.id = :formulaireId")
    void deleteByFormulaireId(@Param("formulaireId") Long formulaireId);
}
