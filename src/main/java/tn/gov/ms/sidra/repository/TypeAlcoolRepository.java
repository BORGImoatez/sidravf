package tn.gov.ms.sidra.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import tn.gov.ms.sidra.entity.TypeAlcool;

public interface TypeAlcoolRepository extends JpaRepository<TypeAlcool, Long> {
    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM TypeAlcool t WHERE t.formulaire.id = :formulaireId")
    void deleteByFormulaireId(@Param("formulaireId") Long formulaireId);

}
