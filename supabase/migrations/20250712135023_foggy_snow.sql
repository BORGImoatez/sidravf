-- Suppression des colonnes JSON après migration des données

-- Supprimer les colonnes JSON de la table formulaires
ALTER TABLE formulaires 
    DROP COLUMN IF EXISTS cadre_consultation,
    DROP COLUMN IF EXISTS origine_demande,
    DROP COLUMN IF EXISTS type_alcool,
    DROP COLUMN IF EXISTS entourage_spa,
    DROP COLUMN IF EXISTS type_spa_entourage,
    DROP COLUMN IF EXISTS drogues_actuelles,
    DROP COLUMN IF EXISTS substance_initiation,
    DROP COLUMN IF EXISTS substance_principale,
    DROP COLUMN IF EXISTS voie_administration,
    DROP COLUMN IF EXISTS test_vih,
    DROP COLUMN IF EXISTS test_vhc,
    DROP COLUMN IF EXISTS test_vhb,
    DROP COLUMN IF EXISTS test_syphilis,
    DROP COLUMN IF EXISTS tentative_sevrage_details;