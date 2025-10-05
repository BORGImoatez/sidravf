-- Création des nouvelles tables pour les entités liées au formulaire

-- Table pour CadreConsultation
CREATE TABLE IF NOT EXISTS cadre_consultations (
    id BIGSERIAL PRIMARY KEY,
    formulaire_id BIGINT UNIQUE REFERENCES formulaires(id) ON DELETE CASCADE,
    addictologie BOOLEAN,
    addictologie_type VARCHAR(255),
    psychiatrie BOOLEAN,
    psychologique BOOLEAN,
    medecine_generale BOOLEAN,
    neurologique BOOLEAN,
    infectieux BOOLEAN,
    espace_amis_jeunes BOOLEAN,
    echange_materiel BOOLEAN,
    rehabilitation BOOLEAN,
    urgence_medicale BOOLEAN,
    urgence_chirurgicale BOOLEAN,
    depistage BOOLEAN,
    autre BOOLEAN,
    autre_precision VARCHAR(255)
);

-- Table pour OrigineDemande
CREATE TABLE IF NOT EXISTS origine_demandes (
    id BIGSERIAL PRIMARY KEY,
    formulaire_id BIGINT UNIQUE REFERENCES formulaires(id) ON DELETE CASCADE,
    lui_meme BOOLEAN,
    famille BOOLEAN,
    amis BOOLEAN,
    cellule_ecoute BOOLEAN,
    autre_centre BOOLEAN,
    structure_sociale BOOLEAN,
    structure_judiciaire BOOLEAN,
    juge_enfance BOOLEAN,
    autre BOOLEAN,
    autre_precision VARCHAR(255)
);

-- Table pour TypeAlcool
CREATE TABLE IF NOT EXISTS type_alcools (
    id BIGSERIAL PRIMARY KEY,
    formulaire_id BIGINT UNIQUE REFERENCES formulaires(id) ON DELETE CASCADE,
    biere BOOLEAN,
    liqueurs BOOLEAN,
    alcool_bruler BOOLEAN,
    legmi BOOLEAN,
    boukha BOOLEAN
);

-- Table pour EntourageSpa
CREATE TABLE IF NOT EXISTS entourage_spas (
    id BIGSERIAL PRIMARY KEY,
    formulaire_id BIGINT UNIQUE REFERENCES formulaires(id) ON DELETE CASCADE,
    membres_famille BOOLEAN,
    amis BOOLEAN,
    milieu_professionnel BOOLEAN,
    milieu_sportif BOOLEAN,
    milieu_scolaire BOOLEAN,
    autre BOOLEAN,
    autre_precision VARCHAR(255)
);

-- Table pour SubstancePsychoactive
CREATE TABLE IF NOT EXISTS substances_psychoactives (
    id BIGSERIAL PRIMARY KEY,
    formulaire_id BIGINT REFERENCES formulaires(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    tabac BOOLEAN,
    alcool BOOLEAN,
    cannabis BOOLEAN,
    opium BOOLEAN,
    morphiniques BOOLEAN,
    morphiniques_precision VARCHAR(255),
    heroine BOOLEAN,
    cocaine BOOLEAN,
    hypnotiques BOOLEAN,
    hypnotiques_precision VARCHAR(255),
    hypnotiques_autre_precision VARCHAR(255),
    amphetamines BOOLEAN,
    ecstasy BOOLEAN,
    produits_inhaler BOOLEAN,
    pregabaline BOOLEAN,
    ketamines BOOLEAN,
    lsd BOOLEAN,
    autre BOOLEAN,
    autre_precision VARCHAR(255),
    age_initiation INTEGER
);

-- Table pour VoieAdministration
CREATE TABLE IF NOT EXISTS voies_administration (
    id BIGSERIAL PRIMARY KEY,
    formulaire_id BIGINT UNIQUE REFERENCES formulaires(id) ON DELETE CASCADE,
    injectee BOOLEAN,
    fumee BOOLEAN,
    ingeree BOOLEAN,
    sniffee BOOLEAN,
    inhalee BOOLEAN,
    autre BOOLEAN,
    autre_precision VARCHAR(255)
);

-- Table pour TestDepistage
CREATE TABLE IF NOT EXISTS tests_depistage (
    id BIGSERIAL PRIMARY KEY,
    formulaire_id BIGINT REFERENCES formulaires(id) ON DELETE CASCADE,
    type_test VARCHAR(50) NOT NULL,
    realise BOOLEAN,
    periode VARCHAR(50)
);

-- Table pour TentativeSevrage
CREATE TABLE IF NOT EXISTS tentatives_sevrage (
    id BIGSERIAL PRIMARY KEY,
    formulaire_id BIGINT UNIQUE REFERENCES formulaires(id) ON DELETE CASCADE,
    tout_seul BOOLEAN,
    soutien_famille BOOLEAN,
    soutien_ami BOOLEAN,
    soutien_scolaire BOOLEAN,
    structure_sante BOOLEAN,
    structure_sante_precision VARCHAR(255)
);

-- Création d'index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_substances_psychoactives_formulaire_id ON substances_psychoactives(formulaire_id);
CREATE INDEX IF NOT EXISTS idx_substances_psychoactives_type ON substances_psychoactives(type);
CREATE INDEX IF NOT EXISTS idx_tests_depistage_formulaire_id ON tests_depistage(formulaire_id);
CREATE INDEX IF NOT EXISTS idx_tests_depistage_type_test ON tests_depistage(type_test);