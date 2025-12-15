/*
  # Ajout des champs pour prix, hospitalisation et échange de seringues

  ## Modifications

  1. Table `offre_drogues` - Ajout des champs de prix et nouvelles substances
    - Champs de prix pour chaque substance (cannabis_prix_kg, cocine_prix_kg, etc.)
    - Marqueurs pour identifier les nouvelles substances psychoactives (NPS)

  2. Table `formulaire` - Ajout des champs hospitalisation et échange de seringues
    - Champs pour tracer les hospitalisations liées à l'usage de drogues
    - Champs pour l'échange de seringues et l'ONG dispensant le service

  ## Détails des modifications

  ### Table offre_drogues
  - cannabis_prix_kg : Prix du kilogramme de cannabis
  - cannabis_nouvelle_substance : Marqueur NPS pour cannabis
  - comprimes_tableau_a_prix_unite : Prix unitaire des comprimés
  - comprimes_tableau_a_nouvelle_substance : Marqueur NPS
  - ecstasy_comprime_prix_unite : Prix unitaire ecstasy comprimé
  - ecstasy_comprime_nouvelle_substance : Marqueur NPS
  - ecstasy_poudre_prix_kg : Prix du kilogramme ecstasy poudre
  - ecstasy_poudre_nouvelle_substance : Marqueur NPS
  - subutex_prix_unite : Prix unitaire subutex
  - subutex_nouvelle_substance : Marqueur NPS
  - cocaine_prix_kg : Prix du kilogramme de cocaïne
  - cocaine_nouvelle_substance : Marqueur NPS
  - heroine_prix_kg : Prix du kilogramme d'héroïne
  - heroine_nouvelle_substance : Marqueur NPS

  ### Table formulaire
  - echange_seringues : Si le patient bénéficie d'un programme d'échange de seringues
  - echange_seringues_ong : Nom de l'ONG dispensant l'échange de seringues
  - hospitalisation_usage_drogues : Si le patient a été hospitalisé pour usage de drogues
  - hospitalisation_overdose : Si l'hospitalisation était due à une overdose
  - hospitalisation_endocardite : Si l'hospitalisation était due à une endocardite
  - hospitalisation_autres_complications : Autres complications ayant nécessité une hospitalisation
  - nombre_hospitalisations : Nombre total d'hospitalisations liées aux drogues
*/

-- Ajout des champs dans la table offre_drogues
ALTER TABLE offre_drogues ADD COLUMN IF NOT EXISTS cannabis_prix_kg DOUBLE PRECISION;
ALTER TABLE offre_drogues ADD COLUMN IF NOT EXISTS cannabis_nouvelle_substance BOOLEAN DEFAULT FALSE;

ALTER TABLE offre_drogues ADD COLUMN IF NOT EXISTS comprimes_tableau_a_prix_unite DOUBLE PRECISION;
ALTER TABLE offre_drogues ADD COLUMN IF NOT EXISTS comprimes_tableau_a_nouvelle_substance BOOLEAN DEFAULT FALSE;

ALTER TABLE offre_drogues ADD COLUMN IF NOT EXISTS ecstasy_comprime_prix_unite DOUBLE PRECISION;
ALTER TABLE offre_drogues ADD COLUMN IF NOT EXISTS ecstasy_comprime_nouvelle_substance BOOLEAN DEFAULT FALSE;

ALTER TABLE offre_drogues ADD COLUMN IF NOT EXISTS ecstasy_poudre_prix_kg DOUBLE PRECISION;
ALTER TABLE offre_drogues ADD COLUMN IF NOT EXISTS ecstasy_poudre_nouvelle_substance BOOLEAN DEFAULT FALSE;

ALTER TABLE offre_drogues ADD COLUMN IF NOT EXISTS subutex_prix_unite DOUBLE PRECISION;
ALTER TABLE offre_drogues ADD COLUMN IF NOT EXISTS subutex_nouvelle_substance BOOLEAN DEFAULT FALSE;

ALTER TABLE offre_drogues ADD COLUMN IF NOT EXISTS cocaine_prix_kg DOUBLE PRECISION;
ALTER TABLE offre_drogues ADD COLUMN IF NOT EXISTS cocaine_nouvelle_substance BOOLEAN DEFAULT FALSE;

ALTER TABLE offre_drogues ADD COLUMN IF NOT EXISTS heroine_prix_kg DOUBLE PRECISION;
ALTER TABLE offre_drogues ADD COLUMN IF NOT EXISTS heroine_nouvelle_substance BOOLEAN DEFAULT FALSE;

-- Ajout des champs dans la table formulaire
ALTER TABLE formulaire ADD COLUMN IF NOT EXISTS echange_seringues BOOLEAN DEFAULT FALSE;
ALTER TABLE formulaire ADD COLUMN IF NOT EXISTS echange_seringues_ong VARCHAR(255);

ALTER TABLE formulaire ADD COLUMN IF NOT EXISTS hospitalisation_usage_drogues BOOLEAN DEFAULT FALSE;
ALTER TABLE formulaire ADD COLUMN IF NOT EXISTS hospitalisation_overdose BOOLEAN DEFAULT FALSE;
ALTER TABLE formulaire ADD COLUMN IF NOT EXISTS hospitalisation_endocardite BOOLEAN DEFAULT FALSE;
ALTER TABLE formulaire ADD COLUMN IF NOT EXISTS hospitalisation_autres_complications TEXT;
ALTER TABLE formulaire ADD COLUMN IF NOT EXISTS nombre_hospitalisations INTEGER DEFAULT 0;

-- Commentaires sur les colonnes pour documentation
COMMENT ON COLUMN offre_drogues.cannabis_prix_kg IS 'Prix moyen du kilogramme de cannabis lors de la saisie';
COMMENT ON COLUMN offre_drogues.cannabis_nouvelle_substance IS 'Indique si le cannabis saisi est une nouvelle substance psychoactive (NPS)';

COMMENT ON COLUMN formulaire.echange_seringues IS 'Indique si le patient bénéficie d''un programme d''échange de seringues';
COMMENT ON COLUMN formulaire.echange_seringues_ong IS 'Nom de l''ONG ou organisme dispensant l''échange de seringues';
COMMENT ON COLUMN formulaire.hospitalisation_usage_drogues IS 'Indique si le patient a été hospitalisé en lien avec l''usage de drogues';
COMMENT ON COLUMN formulaire.hospitalisation_overdose IS 'Indique si une hospitalisation était due à une overdose';
COMMENT ON COLUMN formulaire.hospitalisation_endocardite IS 'Indique si une hospitalisation était due à une endocardite liée à l''usage IV';
COMMENT ON COLUMN formulaire.nombre_hospitalisations IS 'Nombre total d''hospitalisations liées à l''usage de drogues';
