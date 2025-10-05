package tn.gov.ms.sidra.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import tn.gov.ms.sidra.entity.EntourageSpa;


@Repository
public interface EntourageSpaRepository extends JpaRepository<EntourageSpa, Long> {
    @Transactional
    @Modifying(clearAutomatically = true)    @Query("DELETE FROM EntourageSpa e WHERE e.formulaire.id = :formulaireId")
    void deleteByFormulaireId(@Param("formulaireId") Long formulaireId);
}
