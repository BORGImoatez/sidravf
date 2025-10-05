-- Script de migration pour convertir les données JSON en entités relationnelles
-- Ce script doit être exécuté après la création des nouvelles tables

-- Fonction pour migrer les données de cadre_consultation
CREATE OR REPLACE FUNCTION migrate_cadre_consultation() RETURNS void AS $$
DECLARE
    f RECORD;
    json_data JSONB;
BEGIN
    FOR f IN SELECT id, cadre_consultation FROM formulaires WHERE cadre_consultation IS NOT NULL AND cadre_consultation != '{}' LOOP
        json_data := f.cadre_consultation::jsonb;
        
        INSERT INTO cadre_consultations (
            formulaire_id, addictologie, addictologie_type, psychiatrie, psychologique, 
            medecine_generale, neurologique, infectieux, espace_amis_jeunes, echange_materiel, 
            rehabilitation, urgence_medicale, urgence_chirurgicale, depistage, autre, autre_precision
        ) VALUES (
            f.id,
            (json_data->>'addictologie')::boolean,
            json_data->>'addictologieType',
            (json_data->>'psychiatrie')::boolean,
            (json_data->>'psychologique')::boolean,
            (json_data->>'medecineGenerale')::boolean,
            (json_data->>'neurologique')::boolean,
            (json_data->>'infectieux')::boolean,
            (json_data->>'espaceAmisJeunes')::boolean,
            (json_data->>'echangeMateriel')::boolean,
            (json_data->>'rehabilitation')::boolean,
            (json_data->>'urgenceMedicale')::boolean,
            (json_data->>'urgenceChirurgicale')::boolean,
            (json_data->>'depistage')::boolean,
            (json_data->>'autre')::boolean,
            json_data->>'autrePrecision'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour migrer les données de origine_demande
CREATE OR REPLACE FUNCTION migrate_origine_demande() RETURNS void AS $$
DECLARE
    f RECORD;
    json_data JSONB;
BEGIN
    FOR f IN SELECT id, origine_demande FROM formulaires WHERE origine_demande IS NOT NULL AND origine_demande != '{}' LOOP
        json_data := f.origine_demande::jsonb;
        
        INSERT INTO origine_demandes (
            formulaire_id, lui_meme, famille, amis, cellule_ecoute, autre_centre,
            structure_sociale, structure_judiciaire, juge_enfance, autre, autre_precision
        ) VALUES (
            f.id,
            (json_data->>'luiMeme')::boolean,
            (json_data->>'famille')::boolean,
            (json_data->>'amis')::boolean,
            (json_data->>'celluleEcoute')::boolean,
            (json_data->>'autreCentre')::boolean,
            (json_data->>'structureSociale')::boolean,
            (json_data->>'structureJudiciaire')::boolean,
            (json_data->>'jugeEnfance')::boolean,
            (json_data->>'autre')::boolean,
            json_data->>'autrePrecision'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour migrer les données de type_alcool
CREATE OR REPLACE FUNCTION migrate_type_alcool() RETURNS void AS $$
DECLARE
    f RECORD;
    json_data JSONB;
BEGIN
    FOR f IN SELECT id, type_alcool FROM formulaires WHERE type_alcool IS NOT NULL AND type_alcool != '{}' LOOP
        json_data := f.type_alcool::jsonb;
        
        INSERT INTO type_alcools (
            formulaire_id, biere, liqueurs, alcool_bruler, legmi, boukha
        ) VALUES (
            f.id,
            (json_data->>'biere')::boolean,
            (json_data->>'liqueurs')::boolean,
            (json_data->>'alcoolBruler')::boolean,
            (json_data->>'legmi')::boolean,
            (json_data->>'boukha')::boolean
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour migrer les données de entourage_spa
CREATE OR REPLACE FUNCTION migrate_entourage_spa() RETURNS void AS $$
DECLARE
    f RECORD;
    json_data JSONB;
BEGIN
    FOR f IN SELECT id, entourage_spa FROM formulaires WHERE entourage_spa IS NOT NULL AND entourage_spa != '{}' LOOP
        json_data := f.entourage_spa::jsonb;
        
        INSERT INTO entourage_spas (
            formulaire_id, membres_famille, amis, milieu_professionnel, milieu_sportif,
            milieu_scolaire, autre, autre_precision
        ) VALUES (
            f.id,
            (json_data->>'membresFamille')::boolean,
            (json_data->>'amis')::boolean,
            (json_data->>'milieuProfessionnel')::boolean,
            (json_data->>'milieuSportif')::boolean,
            (json_data->>'milieuScolaire')::boolean,
            (json_data->>'autre')::boolean,
            json_data->>'autrePrecision'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour migrer les données de type_spa_entourage
CREATE OR REPLACE FUNCTION migrate_type_spa_entourage() RETURNS void AS $$
DECLARE
    f RECORD;
    json_data JSONB;
BEGIN
    FOR f IN SELECT id, type_spa_entourage FROM formulaires WHERE type_spa_entourage IS NOT NULL AND type_spa_entourage != '{}' LOOP
        json_data := f.type_spa_entourage::jsonb;
        
        INSERT INTO substances_psychoactives (
            formulaire_id, type, tabac, alcool, cannabis, opium, morphiniques, morphiniques_precision,
            heroine, cocaine, hypnotiques, hypnotiques_precision, hypnotiques_autre_precision,
            amphetamines, ecstasy, produits_inhaler, pregabaline, ketamines, lsd, autre, autre_precision
        ) VALUES (
            f.id,
            'ENTOURAGE',
            (json_data->>'tabac')::boolean,
            (json_data->>'alcool')::boolean,
            (json_data->>'cannabis')::boolean,
            (json_data->>'opium')::boolean,
            (json_data->>'morphiniques')::boolean,
            json_data->>'morphiniquesPrecision',
            (json_data->>'heroine')::boolean,
            (json_data->>'cocaine')::boolean,
            (json_data->>'hypnotiques')::boolean,
            json_data->>'hypnotiquesPrecision',
            json_data->>'hypnotiquesAutrePrecision',
            (json_data->>'amphetamines')::boolean,
            (json_data->>'ecstasy')::boolean,
            (json_data->>'produitsInhaler')::boolean,
            (json_data->>'pregabaline')::boolean,
            (json_data->>'ketamines')::boolean,
            (json_data->>'lsd')::boolean,
            (json_data->>'autre')::boolean,
            json_data->>'autrePrecision'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour migrer les données de drogues_actuelles
CREATE OR REPLACE FUNCTION migrate_drogues_actuelles() RETURNS void AS $$
DECLARE
    f RECORD;
    json_data JSONB;
BEGIN
    FOR f IN SELECT id, drogues_actuelles FROM formulaires WHERE drogues_actuelles IS NOT NULL AND drogues_actuelles != '{}' LOOP
        json_data := f.drogues_actuelles::jsonb;
        
        INSERT INTO substances_psychoactives (
            formulaire_id, type, tabac, alcool, cannabis, opium, morphiniques, morphiniques_precision,
            heroine, cocaine, hypnotiques, hypnotiques_precision, hypnotiques_autre_precision,
            amphetamines, ecstasy, produits_inhaler, pregabaline, ketamines, lsd, autre, autre_precision
        ) VALUES (
            f.id,
            'ACTUELLE',
            (json_data->>'tabac')::boolean,
            (json_data->>'alcool')::boolean,
            (json_data->>'cannabis')::boolean,
            (json_data->>'opium')::boolean,
            (json_data->>'morphiniques')::boolean,
            json_data->>'morphiniquesPrecision',
            (json_data->>'heroine')::boolean,
            (json_data->>'cocaine')::boolean,
            (json_data->>'hypnotiques')::boolean,
            json_data->>'hypnotiquesPrecision',
            json_data->>'hypnotiquesAutrePrecision',
            (json_data->>'amphetamines')::boolean,
            (json_data->>'ecstasy')::boolean,
            (json_data->>'produitsInhaler')::boolean,
            (json_data->>'pregabaline')::boolean,
            (json_data->>'ketamines')::boolean,
            (json_data->>'lsd')::boolean,
            (json_data->>'autre')::boolean,
            json_data->>'autrePrecision'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour migrer les données de substance_initiation
CREATE OR REPLACE FUNCTION migrate_substance_initiation() RETURNS void AS $$
DECLARE
    f RECORD;
    json_data JSONB;
BEGIN
    FOR f IN SELECT id, substance_initiation, age_initiation_premiere FROM formulaires WHERE substance_initiation IS NOT NULL AND substance_initiation != '{}' LOOP
        json_data := f.substance_initiation::jsonb;
        
        INSERT INTO substances_psychoactives (
            formulaire_id, type, tabac, alcool, cannabis, opium, morphiniques, morphiniques_precision,
            heroine, cocaine, hypnotiques, hypnotiques_precision, hypnotiques_autre_precision,
            amphetamines, ecstasy, produits_inhaler, pregabaline, ketamines, lsd, autre, autre_precision, age_initiation
        ) VALUES (
            f.id,
            'INITIATION',
            (json_data->>'tabac')::boolean,
            (json_data->>'alcool')::boolean,
            (json_data->>'cannabis')::boolean,
            (json_data->>'opium')::boolean,
            (json_data->>'morphiniques')::boolean,
            json_data->>'morphiniquesPrecision',
            (json_data->>'heroine')::boolean,
            (json_data->>'cocaine')::boolean,
            (json_data->>'hypnotiques')::boolean,
            json_data->>'hypnotiquesPrecision',
            json_data->>'hypnotiquesAutrePrecision',
            (json_data->>'amphetamines')::boolean,
            (json_data->>'ecstasy')::boolean,
            (json_data->>'produitsInhaler')::boolean,
            (json_data->>'pregabaline')::boolean,
            (json_data->>'ketamines')::boolean,
            (json_data->>'lsd')::boolean,
            (json_data->>'autre')::boolean,
            json_data->>'autrePrecision',
            f.age_initiation_premiere
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour migrer les données de substance_principale
CREATE OR REPLACE FUNCTION migrate_substance_principale() RETURNS void AS $$
DECLARE
    f RECORD;
    json_data JSONB;
BEGIN
    FOR f IN SELECT id, substance_principale, age_initiation_principale FROM formulaires WHERE substance_principale IS NOT NULL AND substance_principale != '{}' LOOP
        json_data := f.substance_principale::jsonb;
        
        INSERT INTO substances_psychoactives (
            formulaire_id, type, tabac, alcool, cannabis, opium, morphiniques, morphiniques_precision,
            heroine, cocaine, hypnotiques, hypnotiques_precision, hypnotiques_autre_precision,
            amphetamines, ecstasy, produits_inhaler, pregabaline, ketamines, lsd, autre, autre_precision, age_initiation
        ) VALUES (
            f.id,
            'PRINCIPALE',
            (json_data->>'tabac')::boolean,
            (json_data->>'alcool')::boolean,
            (json_data->>'cannabis')::boolean,
            (json_data->>'opium')::boolean,
            (json_data->>'morphiniques')::boolean,
            json_data->>'morphiniquesPrecision',
            (json_data->>'heroine')::boolean,
            (json_data->>'cocaine')::boolean,
            (json_data->>'hypnotiques')::boolean,
            json_data->>'hypnotiquesPrecision',
            json_data->>'hypnotiquesAutrePrecision',
            (json_data->>'amphetamines')::boolean,
            (json_data->>'ecstasy')::boolean,
            (json_data->>'produitsInhaler')::boolean,
            (json_data->>'pregabaline')::boolean,
            (json_data->>'ketamines')::boolean,
            (json_data->>'lsd')::boolean,
            (json_data->>'autre')::boolean,
            json_data->>'autrePrecision',
            f.age_initiation_principale
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour migrer les données de voie_administration
CREATE OR REPLACE FUNCTION migrate_voie_administration() RETURNS void AS $$
DECLARE
    f RECORD;
    json_data JSONB;
BEGIN
    FOR f IN SELECT id, voie_administration FROM formulaires WHERE voie_administration IS NOT NULL AND voie_administration != '{}' LOOP
        json_data := f.voie_administration::jsonb;
        
        INSERT INTO voies_administration (
            formulaire_id, injectee, fumee, ingeree, sniffee, inhalee, autre, autre_precision
        ) VALUES (
            f.id,
            (json_data->>'injectee')::boolean,
            (json_data->>'fumee')::boolean,
            (json_data->>'ingeree')::boolean,
            (json_data->>'sniffee')::boolean,
            (json_data->>'inhalee')::boolean,
            (json_data->>'autre')::boolean,
            json_data->>'autrePrecision'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour migrer les données des tests de dépistage
CREATE OR REPLACE FUNCTION migrate_tests_depistage() RETURNS void AS $$
DECLARE
    f RECORD;
    json_vih JSONB;
    json_vhc JSONB;
    json_vhb JSONB;
    json_syphilis JSONB;
BEGIN
    FOR f IN SELECT id, test_vih, test_vhc, test_vhb, test_syphilis FROM formulaires LOOP
        -- Test VIH
        IF f.test_vih IS NOT NULL AND f.test_vih != '{}' THEN
            json_vih := f.test_vih::jsonb;
            INSERT INTO tests_depistage (formulaire_id, type_test, realise, periode)
            VALUES (f.id, 'VIH', (json_vih->>'realise')::boolean, json_vih->>'periode');
        END IF;
        
        -- Test VHC
        IF f.test_vhc IS NOT NULL AND f.test_vhc != '{}' THEN
            json_vhc := f.test_vhc::jsonb;
            INSERT INTO tests_depistage (formulaire_id, type_test, realise, periode)
            VALUES (f.id, 'VHC', (json_vhc->>'realise')::boolean, json_vhc->>'periode');
        END IF;
        
        -- Test VHB
        IF f.test_vhb IS NOT NULL AND f.test_vhb != '{}' THEN
            json_vhb := f.test_vhb::jsonb;
            INSERT INTO tests_depistage (formulaire_id, type_test, realise, periode)
            VALUES (f.id, 'VHB', (json_vhb->>'realise')::boolean, json_vhb->>'periode');
        END IF;
        
        -- Test Syphilis
        IF f.test_syphilis IS NOT NULL AND f.test_syphilis != '{}' THEN
            json_syphilis := f.test_syphilis::jsonb;
            INSERT INTO tests_depistage (formulaire_id, type_test, realise, periode)
            VALUES (f.id, 'SYPHILIS', (json_syphilis->>'realise')::boolean, json_syphilis->>'periode');
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour migrer les données de tentative_sevrage_details
CREATE OR REPLACE FUNCTION migrate_tentative_sevrage() RETURNS void AS $$
DECLARE
    f RECORD;
    json_data JSONB;
BEGIN
    FOR f IN SELECT id, tentative_sevrage_details FROM formulaires WHERE tentative_sevrage_details IS NOT NULL AND tentative_sevrage_details != '{}' LOOP
        json_data := f.tentative_sevrage_details::jsonb;
        
        INSERT INTO tentatives_sevrage (
            formulaire_id, tout_seul, soutien_famille, soutien_ami, soutien_scolaire,
            structure_sante, structure_sante_precision
        ) VALUES (
            f.id,
            (json_data->>'toutSeul')::boolean,
            (json_data->>'soutienFamille')::boolean,
            (json_data->>'soutienAmi')::boolean,
            (json_data->>'soutienScolaire')::boolean,
            (json_data->>'structureSante')::boolean,
            json_data->>'structureSantePrecision'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Exécuter toutes les fonctions de migration
SELECT migrate_cadre_consultation();
SELECT migrate_origine_demande();
SELECT migrate_type_alcool();
SELECT migrate_entourage_spa();
SELECT migrate_type_spa_entourage();
SELECT migrate_drogues_actuelles();
SELECT migrate_substance_initiation();
SELECT migrate_substance_principale();
SELECT migrate_voie_administration();
SELECT migrate_tests_depistage();
SELECT migrate_tentative_sevrage();

-- Supprimer les fonctions temporaires
DROP FUNCTION migrate_cadre_consultation();
DROP FUNCTION migrate_origine_demande();
DROP FUNCTION migrate_type_alcool();
DROP FUNCTION migrate_entourage_spa();
DROP FUNCTION migrate_type_spa_entourage();
DROP FUNCTION migrate_drogues_actuelles();
DROP FUNCTION migrate_substance_initiation();
DROP FUNCTION migrate_substance_principale();
DROP FUNCTION migrate_voie_administration();
DROP FUNCTION migrate_tests_depistage();
DROP FUNCTION migrate_tentative_sevrage();