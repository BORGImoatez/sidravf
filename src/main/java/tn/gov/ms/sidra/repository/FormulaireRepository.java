package tn.gov.ms.sidra.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.gov.ms.sidra.entity.Formulaire;
import tn.gov.ms.sidra.entity.User;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FormulaireRepository extends JpaRepository<Formulaire, Long> {

    Optional<Formulaire> findByIdentifiantUnique(String identifiantUnique);

    @Query("SELECT f FROM Formulaire f WHERE f.utilisateur = :utilisateur ORDER BY f.dateConsultation DESC")
    List<Formulaire> findByUtilisateur(@Param("utilisateur") User utilisateur);

    @Query("SELECT f FROM Formulaire f WHERE f.structure.id = :structureId ORDER BY f.dateConsultation DESC")
    List<Formulaire> findByStructureId(@Param("structureId") Long structureId);

    @Query("SELECT f FROM Formulaire f WHERE f.patient.id = :patientId ORDER BY f.dateConsultation DESC")
    List<Formulaire> findByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT f FROM Formulaire f WHERE f.dateConsultation BETWEEN :debut AND :fin ORDER BY f.dateConsultation DESC")
    List<Formulaire> findByDateConsultationBetween(@Param("debut") LocalDate debut, @Param("fin") LocalDate fin);

    @Query("SELECT f FROM Formulaire f WHERE f.structure.id = :structureId AND f.dateConsultation BETWEEN :debut AND :fin ORDER BY f.dateConsultation DESC")
    List<Formulaire> findByStructureIdAndDateConsultationBetween(
            @Param("structureId") Long structureId,
            @Param("debut") LocalDate debut,
            @Param("fin") LocalDate fin);

    @Query("SELECT f FROM Formulaire f WHERE f.utilisateur = :utilisateur AND f.dateConsultation BETWEEN :debut AND :fin ORDER BY f.dateConsultation DESC")
    List<Formulaire> findByUtilisateurAndDateConsultationBetween(
            @Param("utilisateur") User utilisateur,
            @Param("debut") LocalDate debut,
            @Param("fin") LocalDate fin);

    @Query("""
    SELECT MAX(CAST(SUBSTRING(f.identifiantUnique, LOCATE('-', f.identifiantUnique, LOCATE('-', f.identifiantUnique) + 1) + 1) AS int))
    FROM Formulaire f
    WHERE f.identifiantUnique LIKE CONCAT('F-', :annee, '%')
""")
    Optional<Integer> findMaxSequenceNumberForYear(@Param("annee") String annee);
//-----------------------------------//
    /**
     * Compte le total des formulaires avec filtres
     */
    @Query("SELECT COUNT(f) FROM Formulaire f " +
            "JOIN f.patient p " +
            "WHERE (:sexe IS NULL OR :sexe = 'tous' OR UPPER(p.genre) = UPPER(:sexe)) " +
            "AND (:annee IS NULL OR :annee = 0 OR YEAR(f.dateConsultation) = :annee) " +
            "AND (:ageMin IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) >= :ageMin) " +
            "AND (:ageMax IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) <= :ageMax)")
    Long countWithFilters(@Param("sexe") String sexe,
                          @Param("annee") Integer anneeConsultation,
                          @Param("ageMin") Integer ageMin,
                          @Param("ageMax") Integer ageMax);

    /**
     * Compte par sexe
     */
    @Query("SELECT COUNT(f) FROM Formulaire f " +
            "JOIN f.patient p " +
            "WHERE UPPER(p.genre) = UPPER(:sexe) " +
            "AND (:annee IS NULL OR :annee = 0 OR YEAR(f.dateConsultation) = :annee) " +
            "AND (:ageMin IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) >= :ageMin) " +
            "AND (:ageMax IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) <= :ageMax)")
    Long countBySexe(@Param("sexe") String sexe,
                     @Param("annee") Integer anneeConsultation,
                     @Param("ageMin") Integer ageMin,
                     @Param("ageMax") Integer ageMax);

    /**
     * Calcule la moyenne d'âge
     */
    @Query("SELECT AVG(YEAR(CURRENT_DATE) - YEAR(p.dateNaissance)) " +
            "FROM Formulaire f " +
            "JOIN f.patient p " +
            "WHERE (:sexe IS NULL OR :sexe = 'tous' OR UPPER(p.genre) = UPPER(:sexe)) " +
            "AND (:annee IS NULL OR :annee = 0 OR YEAR(f.dateConsultation) = :annee) " +
            "AND (:ageMin IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) >= :ageMin) " +
            "AND (:ageMax IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) <= :ageMax)")
    Double calculateAverageAge(@Param("sexe") String sexe,
                               @Param("annee") Integer anneeConsultation,
                               @Param("ageMin") Integer ageMin,
                               @Param("ageMax") Integer ageMax);

    /**
     * Compte les décès liés aux drogues
     */
    @Query("SELECT COALESCE(SUM(f.nombreDecesSpaDansEntourage), 0) " +
            "FROM Formulaire f " +
            "JOIN f.patient p " +
            "WHERE (:sexe IS NULL OR :sexe = 'tous' OR UPPER(p.genre) = UPPER(:sexe)) " +
            "AND (:annee IS NULL OR :annee = 0 OR YEAR(f.dateConsultation) = :annee) " +
            "AND (:ageMin IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) >= :ageMin) " +
            "AND (:ageMax IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) <= :ageMax)")
    Long countDeathsRelatedToDrugs(@Param("sexe") String sexe,
                                   @Param("annee") Integer anneeConsultation,
                                   @Param("ageMin") Integer ageMin,
                                   @Param("ageMax") Integer ageMax);

    /**
     * Récupère les modes d'administration avec leur fréquence
     */
    @Query("SELECT " +
            "CASE " +
            "   WHEN v.fumee = true THEN 'FUMEE' " +
            "   WHEN v.injectee = true THEN 'INJECTEE' " +
            "   WHEN v.ingeree = true THEN 'INGEREE' " +
            "   WHEN v.sniffee = true THEN 'SNIFFEE' " +
            "   WHEN v.inhalee = true THEN 'INHALEE' " +

            "   ELSE 'AUTRE' " +
            "END as mode, " +
            "COUNT(f) as frequence " +
            "FROM Formulaire f " +
            "JOIN f.voieAdministration v " +
            "JOIN f.patient p " +
            "WHERE (:sexe IS NULL OR :sexe = 'tous' OR UPPER(p.genre) = UPPER(:sexe)) " +
            "AND (:annee IS NULL OR :annee = 0 OR YEAR(f.dateConsultation) = :annee) " +
            "AND (:ageMin IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) >= :ageMin) " +
            "AND (:ageMax IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) <= :ageMax) " +
            "GROUP BY mode " +
            "ORDER BY frequence DESC")
    List<Object[]> getAdministrationModes(@Param("sexe") String sexe,
                                          @Param("annee") Integer anneeConsultation,
                                          @Param("ageMin") Integer ageMin,
                                          @Param("ageMax") Integer ageMax);

    /**
     * Compte les demandes de traitement
     */
    @Query("SELECT COUNT(f) FROM Formulaire f " +
            "JOIN f.patient p " +
            "WHERE (f.priseEnChargeMedicale = true OR f.priseEnChargePsychologique = true OR f.priseEnChargeSociale = true) " +
            "AND (:sexe IS NULL OR :sexe = 'tous' OR UPPER(p.genre) = UPPER(:sexe)) " +
            "AND (:annee IS NULL OR :annee = 0 OR YEAR(f.dateConsultation) = :annee) " +
            "AND (:ageMin IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) >= :ageMin) " +
            "AND (:ageMax IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) <= :ageMax)")
    Long countTreatmentRequests(@Param("sexe") String sexe,
                                @Param("annee") Integer anneeConsultation,
                                @Param("ageMin") Integer ageMin,
                                @Param("ageMax") Integer ageMax);

    /**
     * Récupère les demandes par tranche d'âge
     */
    /**
     * Récupère les demandes par tranche d'âge
     */
    /**
     * Récupère les demandes par tranche d'âge
     */
    @Query("SELECT " +
            "CASE " +
            "   WHEN (YEAR(CURRENT_DATE) - YEAR(p.dateNaissance)) < 18 THEN '< 18 ans' " +
            "   WHEN (YEAR(CURRENT_DATE) - YEAR(p.dateNaissance)) BETWEEN 18 AND 25 THEN '18-25 ans' " +
            "   WHEN (YEAR(CURRENT_DATE) - YEAR(p.dateNaissance)) BETWEEN 26 AND 35 THEN '26-35 ans' " +
            "   WHEN (YEAR(CURRENT_DATE) - YEAR(p.dateNaissance)) BETWEEN 36 AND 45 THEN '36-45 ans' " +
            "   WHEN (YEAR(CURRENT_DATE) - YEAR(p.dateNaissance)) BETWEEN 46 AND 55 THEN '46-55 ans' " +
            "   ELSE '> 55 ans' " +
            "END as tranche, " +
            "COUNT(f) as nombre " +
            "FROM Formulaire f " +
            "JOIN f.patient p " +
            "WHERE (f.priseEnChargeMedicale = true OR f.priseEnChargePsychologique = true OR f.priseEnChargeSociale = true) " +
            "AND (:sexe IS NULL OR :sexe = 'tous' OR UPPER(p.genre) = UPPER(:sexe)) " +
            "AND (:annee IS NULL OR :annee = 0 OR YEAR(f.dateConsultation) = :annee) " +
            "AND (:ageMin IS NULL OR (YEAR(CURRENT_DATE) - YEAR(p.dateNaissance)) >= :ageMin) " +
            "AND (:ageMax IS NULL OR (YEAR(CURRENT_DATE) - YEAR(p.dateNaissance)) <= :ageMax) " +
            "GROUP BY " +
            "CASE " +
            "   WHEN (YEAR(CURRENT_DATE) - YEAR(p.dateNaissance)) < 18 THEN '< 18 ans' " +
            "   WHEN (YEAR(CURRENT_DATE) - YEAR(p.dateNaissance)) BETWEEN 18 AND 25 THEN '18-25 ans' " +
            "   WHEN (YEAR(CURRENT_DATE) - YEAR(p.dateNaissance)) BETWEEN 26 AND 35 THEN '26-35 ans' " +
            "   WHEN (YEAR(CURRENT_DATE) - YEAR(p.dateNaissance)) BETWEEN 36 AND 45 THEN '36-45 ans' " +
            "   WHEN (YEAR(CURRENT_DATE) - YEAR(p.dateNaissance)) BETWEEN 46 AND 55 THEN '46-55 ans' " +
            "   ELSE '> 55 ans' " +
            "END " +
            "ORDER BY MIN(YEAR(CURRENT_DATE) - YEAR(p.dateNaissance))")
    List<Object[]> getTreatmentRequestsByAgeGroup(@Param("sexe") String sexe,
                                                  @Param("annee") Integer anneeConsultation,
                                                  @Param("ageMin") Integer ageMin,
                                                  @Param("ageMax") Integer ageMax);


    /**
     * Récupère les demandes par sexe
     */
    @Query("SELECT p.genre, COUNT(f) " +
            "FROM Formulaire f " +
            "JOIN f.patient p " +
            "WHERE (f.priseEnChargeMedicale = true OR f.priseEnChargePsychologique = true OR f.priseEnChargeSociale = true) " +
            "AND (:sexe IS NULL OR :sexe = 'tous' OR UPPER(p.genre) = UPPER(:sexe)) " +
            "AND (:annee IS NULL OR :annee = 0 OR YEAR(f.dateConsultation) = :annee) " +
            "AND (:ageMin IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) >= :ageMin) " +
            "AND (:ageMax IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) <= :ageMax) " +
            "GROUP BY p.genre " +
            "ORDER BY COUNT(f) DESC")
    List<Object[]> getTreatmentRequestsBySexe(@Param("sexe") String sexe,
                                              @Param("annee") Integer anneeConsultation,
                                              @Param("ageMin") Integer ageMin,
                                              @Param("ageMax") Integer ageMax);

    /**
     * Récupère les demandes par région
     */
    @Query("SELECT g.nom, COUNT(f) " +
            "FROM Formulaire f " +
            "JOIN f.patient p " +
            "JOIN Gouvernorat g ON CAST(g.id AS string) = f.gouvernoratResidence " +
            "WHERE (f.priseEnChargeMedicale = true OR f.priseEnChargePsychologique = true OR f.priseEnChargeSociale = true) " +
            "AND (:sexe IS NULL OR :sexe = 'tous' OR UPPER(p.genre) = UPPER(:sexe)) " +
            "AND (:annee IS NULL OR :annee = 0 OR YEAR(f.dateConsultation) = :annee) " +
            "AND (:ageMin IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) >= :ageMin) " +
            "AND (:ageMax IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) <= :ageMax) " +
            "GROUP BY g.nom " +
            "ORDER BY COUNT(f) DESC")
    List<Object[]> getTreatmentRequestsByRegion(@Param("sexe") String sexe,
                                                @Param("annee") Integer anneeConsultation,
                                                @Param("ageMin") Integer ageMin,
                                                @Param("ageMax") Integer ageMax);



    /**
     * Récupère les demandes par profession
     */
    @Query("SELECT f.profession, COUNT(f) " +
            "FROM Formulaire f " +
            "JOIN f.patient p " +
            "WHERE (f.priseEnChargeMedicale = true OR f.priseEnChargePsychologique = true OR f.priseEnChargeSociale = true) " +
            "AND (:sexe IS NULL OR :sexe = 'tous' OR UPPER(p.genre) = UPPER(:sexe)) " +
            "AND (:annee IS NULL OR :annee = 0 OR YEAR(f.dateConsultation) = :annee) " +
            "AND (:ageMin IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) >= :ageMin) " +
            "AND (:ageMax IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) <= :ageMax) " +
            "GROUP BY f.profession " +
            "ORDER BY COUNT(f) DESC")
    List<Object[]> getTreatmentRequestsByProfession(@Param("sexe") String sexe,
                                                    @Param("annee") Integer anneeConsultation,
                                                    @Param("ageMin") Integer ageMin,
                                                    @Param("ageMax") Integer ageMax);

    /**
     * Récupère les demandes par niveau socio-économique
     * Note: Vous devrez adapter selon la structure de vos données
     */
    @Query("SELECT 'Faible' as niveau, COUNT(f) " +
            "FROM Formulaire f " +
            "JOIN f.patient p " +
            "WHERE (f.priseEnChargeMedicale = true OR f.priseEnChargePsychologique = true OR f.priseEnChargeSociale = true) " +
            "AND f.profession IN ('CHOMAGE', 'SANS_RESSOURCES') " +
            "AND (:sexe IS NULL OR :sexe = 'tous' OR UPPER(p.genre) = UPPER(:sexe)) " +
            "AND (:annee IS NULL OR :annee = 0 OR YEAR(f.dateConsultation) = :annee) " +
            "AND (:ageMin IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) >= :ageMin) " +
            "AND (:ageMax IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) <= :ageMax)")
    List<Object[]> getTreatmentRequestsByNSE(@Param("sexe") String sexe,
                                             @Param("annee") Integer anneeConsultation,
                                             @Param("ageMin") Integer ageMin,
                                             @Param("ageMax") Integer ageMax);

    /**
     * Récupère les demandes par situation familiale
     */
    @Query("SELECT f.situationFamiliale, COUNT(f) " +
            "FROM Formulaire f " +
            "JOIN f.patient p " +
            "WHERE (f.priseEnChargeMedicale = true OR f.priseEnChargePsychologique = true OR f.priseEnChargeSociale = true) " +
            "AND (:sexe IS NULL OR :sexe = 'tous' OR UPPER(p.genre) = UPPER(:sexe)) " +
            "AND (:annee IS NULL OR :annee = 0 OR YEAR(f.dateConsultation) = :annee) " +
            "AND (:ageMin IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) >= :ageMin) " +
            "AND (:ageMax IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) <= :ageMax) " +
            "GROUP BY f.situationFamiliale " +
            "ORDER BY COUNT(f) DESC")
    List<Object[]> getTreatmentRequestsByFamilyStatus(@Param("sexe") String sexe,
                                                      @Param("annee") Integer anneeConsultation,
                                                      @Param("ageMin") Integer ageMin,
                                                      @Param("ageMax") Integer ageMax);

    /**
     * Récupère les demandes par substance
     * Note: Nécessite de parser les données de substances psychoactives
     */
    @Query("SELECT " +
            "CASE " +
            "   WHEN s.tabac THEN 'tabac' " +
            "   WHEN s.alcool THEN 'alcool' " +
            "   WHEN s.cannabis THEN 'cannabis' " +
            "   WHEN s.opium THEN 'opium' " +
            "   WHEN s.morphiniques THEN 'morphiniques' " +
            "   WHEN s.heroine THEN 'heroine' " +
            "   WHEN s.hypnotiques THEN 'hypnotiques' " +
            "   WHEN s.amphetamines THEN 'amphetamines' " +
            "   WHEN s.ecstasy THEN 'ecstasy' " +
            "   WHEN s.produitsInhaler THEN 'produitsInhaler' " +
            "   WHEN s.pregabaline THEN 'pregabaline' " +
            "   WHEN s.ketamines THEN 'ketamines' " +
            "   WHEN s.lsd THEN 'lsd' " +

            "   ELSE 'Autre' " +
            "END as typeSup," +
            " COUNT(f) " +
            "FROM Formulaire f " +
            "JOIN f.substancesPsychoactives s " +
            "JOIN f.patient p " +
            "WHERE (f.priseEnChargeMedicale = true OR f.priseEnChargePsychologique = true OR f.priseEnChargeSociale = true) " +
            "AND s.type = 'PRINCIPALE' " +
            "AND (:sexe IS NULL OR :sexe = 'tous' OR UPPER(p.genre) = UPPER(:sexe)) " +
            "AND (:annee IS NULL OR :annee = 0 OR YEAR(f.dateConsultation) = :annee) " +
            "AND (:ageMin IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) >= :ageMin) " +
            "AND (:ageMax IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) <= :ageMax) " +
            "GROUP BY typeSup " +
            "ORDER BY COUNT(f) DESC")
    List<Object[]> getTreatmentRequestsBySubstance(@Param("sexe") String sexe,
                                                   @Param("annee") Integer anneeConsultation,
                                                   @Param("ageMin") Integer ageMin,
                                                   @Param("ageMax") Integer ageMax);

    /**
     * Récupère les années distinctes des consultations
     */
    @Query("SELECT DISTINCT YEAR(f.dateConsultation) " +
            "FROM Formulaire f " +
            "ORDER BY YEAR(f.dateConsultation) DESC")
    List<Integer> findDistinctYears();

    /**
     * Requête générale pour récupérer les statistiques avec filtres
     */
    @Query("SELECT f, p FROM Formulaire f " +
            "JOIN f.patient p " +
            "WHERE (:sexe IS NULL OR :sexe = 'tous' OR UPPER(p.genre) = UPPER(:sexe)) " +
            "AND (:annee IS NULL OR :annee = 0 OR YEAR(f.dateConsultation) = :annee) " +
            "AND (:ageMin IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) >= :ageMin) " +
            "AND (:ageMax IS NULL OR YEAR(CURRENT_DATE) - YEAR(p.dateNaissance) <= :ageMax)")
    List<Object[]> findStatisticsWithFilters(@Param("sexe") String sexe,
                                             @Param("annee") Integer anneeConsultation,
                                             @Param("ageMin") Integer ageMin,
                                             @Param("ageMax") Integer ageMax);
}