package tn.gov.ms.sidra.service;


import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.gov.ms.sidra.entity.Formulaire;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
 import tn.gov.ms.sidra.entity.*;
import tn.gov.ms.sidra.repository.DelegationRepository;
import tn.gov.ms.sidra.repository.GouvernoratRepository;

import java.io.ByteArrayOutputStream;
import java.util.Objects;
import java.util.Optional;

@Service
@AllArgsConstructor
public class FormulaireExcelExportService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
    private final GouvernoratRepository gouvernoratRepository;
    private final DelegationRepository delegationRepository;

    public byte[] exportFormulairesToExcel(List<Formulaire> formulaires) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {

            // Styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);

            // Créer les feuilles
            createFormulaireSheet(workbook, formulaires, headerStyle, dateStyle);
            createSubstancesSheet(workbook, formulaires, headerStyle);
            createTestsDepistageSheet(workbook, formulaires, headerStyle);

            // Écrire dans un ByteArrayOutputStream
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private void createFormulaireSheet(Workbook workbook, List<Formulaire> formulaires,
                                       CellStyle headerStyle, CellStyle dateStyle) {
        Sheet sheet = workbook.createSheet("Formulaires");

        // En-têtes
        Row headerRow = sheet.createRow(0);
        String[] headers = {
                "ID", "Identifiant Unique", "Date Consultation", "Patient", "Utilisateur", "Structure",
                // Partie 1
                "Secteur", "ONG Précision", "Ministère", "Gouvernorat Structure",
                "Nationalité", "Résidence", "Gouvernorat Résidence", "Délégation Résidence", "Pays Résidence",
                "Couverture Sociale", "Type Couverture Sociale", "Type Carnet CNAM",
                // Cadre consultation
                "Addictologie", "Type Addictologie", "Psychiatrie", "Psychologique", "Médecine Générale",
                "Neurologique", "Infectieux", "Espace Amis Jeunes", "Échange Matériel", "Réhabilitation",
                "Urgence Médicale", "Urgence Chirurgicale", "Dépistage", "Autre Cadre", "Autre Cadre Précision",
                // Origine demande et consultation
                "Cause/Circonstance", "Consultation Antérieure", "Date Consultation Antérieure",
                "Motif Consultation Antérieure", "Motif Consultation Antérieure Précision",
                "Cause Récidive", "Cause Échec Sevrage",
                // Situation personnelle
                "Situation Familiale", "Situation Familiale Autre", "Logement 30 Jours",
                "Logement 30 Jours Autre", "Nature Logement", "Profession", "Niveau Scolaire",
                "Activité Sportive", "Fréquence Activité Sportive", "Type Activité Sportive",
                "Espaces Loisirs", "Dopage",
                // Partie 2 - Tabac
                "Consommation Tabac", "Âge Première Consommation Tabac", "Consommation Tabac 30 Jours",
                "Fréquence Tabac 30 Jours", "Nombre Cigarettes/Jour", "Nombre Paquets/Année",
                "Âge Arrêt Tabac", "Soins Sevrage Tabac", "Sevrage Assisté",
                // Alcool
                "Consommation Alcool", "Âge Première Consommation Alcool", "Consommation Alcool 30 Jours",
                "Fréquence Alcool 30 Jours", "Quantité Alcool/Prise",
                "Type Alcool - Bière", "Type Alcool - Liqueurs", "Type Alcool - Alcool à Brûler",
                "Type Alcool - Legmi", "Type Alcool - Boukha",
                // Partie 3 - SPA
                "Consommation SPA Entourage", "Entourage - Famille", "Entourage - Amis",
                "Entourage - Milieu Professionnel", "Entourage - Milieu Sportif", "Entourage - Milieu Scolaire",
                "Entourage - Autre", "Entourage - Autre Précision",
                "Consommation SPA Personnelle", "Âge Initiation Première", "Âge Initiation Principale",
                "Troubles Alimentaires", "Addiction Jeux", "Addiction Écrans", "Comportements Sexuels",
                // Partie 4 - Comportements
                "Voie Administration - Injectée", "Voie Administration - Fumée", "Voie Administration - Ingérée",
                "Voie Administration - Sniffée", "Voie Administration - Inhalée",
                "Voie Administration - Autre", "Voie Administration - Autre Précision",
                "Fréquence Substance Principale", "Partage Seringues",
                "Accompagnement Sevrage", "Accompagnement Sevrage Non Raison", "Tentative Sevrage",
                "Sevrage - Tout Seul", "Sevrage - Soutien Famille", "Sevrage - Soutien Ami",
                "Sevrage - Soutien Scolaire", "Sevrage - Structure Santé", "Sevrage - Structure Santé Précision",
                // Partie 5 - Comorbidités
                "Comorbidité Psychiatrique Personnelle", "Comorbidité Psychiatrique Personnelle Précision",
                "Comorbidité Somatique Personnelle", "Comorbidité Somatique Personnelle Précision",
                "Comorbidité Psychiatrique Partenaire", "Comorbidité Psychiatrique Partenaire Précision",
                "Comorbidité Somatique Partenaire", "Comorbidité Somatique Partenaire Précision",
                "Nombre Condamnations", "Durée Détention (Jours)", "Durée Détention (Mois)", "Durée Détention (Années)",
                // Partie 6 - Décès
                "Nombre Décès SPA Entourage", "Causes Décès SPA Entourage",
                // Partie 7 - Conduite thérapeutique
                "Prise en Charge Médicale", "Prise en Charge Médicale Précision",
                "Hospitalisation", "RDV Consultation Externe",
                "Prise en Charge Psychologique", "Prise en Charge Psychologique Précision",
                "Prise en Charge Sociale", "Prise en Charge Sociale Précision",
                "Date Création", "Date Modification"
        };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Données
        int rowNum = 1;
        for (Formulaire f : formulaires) {
            Row row = sheet.createRow(rowNum++);
            int colNum = 0;

            // Informations de base
            createCell(row, colNum++, f.getId());
            createCell(row, colNum++, f.getIdentifiantUnique());
            createDateCell(row, colNum++, f.getDateConsultation(), dateStyle);
            createCell(row, colNum++, f.getPatient() != null ? f.getPatient().getNom()+ " "+f.getPatient().getPrenom() : "");
            createCell(row, colNum++, f.getUtilisateur() != null ? f.getUtilisateur().getUsername() : "");
            createCell(row, colNum++, f.getStructure() != null ? f.getStructure().getNom() : "");

            // Partie 1
            createCell(row, colNum++, f.getSecteur());
            createCell(row, colNum++, f.getOngPrecision());
            createCell(row, colNum++, f.getMinistere());
            createCell(row, colNum++, f.getGouvernoratStructure());
            createCell(row, colNum++, f.getNationalite());
            createCell(row, colNum++, f.getResidence());
            createCell(
                    row,
                    colNum++,
                    Optional.ofNullable(f.getGouvernoratResidence())
                            .filter(id -> !id.isBlank())
                            .map(Long::valueOf)
                            .flatMap(gouvernoratRepository::findById)
                            .map(Gouvernorat::getNom)
                            .orElse("")
            );
            createCell(
                    row,
                    colNum++,
                    Optional.ofNullable(f.getDelegationResidence())
                            .filter(id -> !id.isBlank())
                            .map(Long::valueOf)
                            .flatMap(delegationRepository::findById)
                            .map(Delegation::getNom)
                            .orElse("")
            );


             createCell(row, colNum++, f.getPaysResidence());
            createCell(row, colNum++, f.getCouvertureSociale());
            createCell(row, colNum++, f.getTypeCouvertureSociale());
            createCell(row, colNum++, f.getTypeCarnetCnam());

            // Cadre consultation
            CadreConsultation cadre = f.getCadreConsultation();
            if (cadre != null) {
                createCell(row, colNum++, cadre.getAddictologie());
                createCell(row, colNum++, cadre.getAddictologieType());
                createCell(row, colNum++, cadre.getPsychiatrie());
                createCell(row, colNum++, cadre.getPsychologique());
                createCell(row, colNum++, cadre.getMedecineGenerale());
                createCell(row, colNum++, cadre.getNeurologique());
                createCell(row, colNum++, cadre.getInfectieux());
                createCell(row, colNum++, cadre.getEspaceAmisJeunes());
                createCell(row, colNum++, cadre.getEchangeMateriel());
                createCell(row, colNum++, cadre.getRehabilitation());
                createCell(row, colNum++, cadre.getUrgenceMedicale());
                createCell(row, colNum++, cadre.getUrgenceChirurgicale());
                createCell(row, colNum++, cadre.getDepistage());
                createCell(row, colNum++, cadre.getAutre());
                createCell(row, colNum++, cadre.getAutrePrecision());
            } else {
                colNum += 15;
            }

            // Consultation
            createCell(row, colNum++, f.getCauseCirconstance());
            createCell(row, colNum++, f.getConsultationAnterieure());
            createCell(row, colNum++, f.getDateConsultationAnterieure());
            createCell(row, colNum++, f.getMotifConsultationAnterieure());
            createCell(row, colNum++, f.getMotifConsultationAnterieurePrecision());
            createCell(row, colNum++, f.getCauseRecidive());
            createCell(row, colNum++, f.getCauseEchecSevrage());

            // Situation personnelle
            createCell(row, colNum++, f.getSituationFamiliale());
            createCell(row, colNum++, f.getSituationFamilialeAutre());
            createCell(row, colNum++, f.getLogement30Jours());
            createCell(row, colNum++, f.getLogement30JoursAutre());
            createCell(row, colNum++, f.getNatureLogement());
            createCell(row, colNum++, f.getProfession());
            createCell(row, colNum++, f.getNiveauScolaire());
            createCell(row, colNum++, f.getActiviteSportive());
            createCell(row, colNum++, f.getActiviteSportiveFrequence());
            createCell(row, colNum++, f.getActiviteSportiveType());
            createCell(row, colNum++, f.getEspacesLoisirs());
            createCell(row, colNum++, f.getDopage());

            // Tabac
            createCell(row, colNum++, f.getConsommationTabac());
            createCell(row, colNum++, f.getAgePremiereConsommationTabac());
            createCell(row, colNum++, f.getConsommationTabac30Jours());
            createCell(row, colNum++, f.getFrequenceTabac30Jours());
            createCell(row, colNum++, f.getNombreCigarettesJour());
            createCell(row, colNum++, f.getNombrePaquetsAnnee());
            createCell(row, colNum++, f.getAgeArretTabac());
            createCell(row, colNum++, f.getSoinsSevrageTabac());
            createCell(row, colNum++, f.getSevrageAssiste());

            // Alcool
            createCell(row, colNum++, f.getConsommationAlcool());
            createCell(row, colNum++, f.getAgePremiereConsommationAlcool());
            createCell(row, colNum++, f.getConsommationAlcool30Jours());
            createCell(row, colNum++, f.getFrequenceAlcool30Jours());
            createCell(row, colNum++, f.getQuantiteAlcoolPrise());

            TypeAlcool typeAlcool = f.getTypeAlcool();
            if (typeAlcool != null) {
                createCell(row, colNum++, typeAlcool.getBiere());
                createCell(row, colNum++, typeAlcool.getLiqueurs());
                createCell(row, colNum++, typeAlcool.getAlcoolBruler());
                createCell(row, colNum++, typeAlcool.getLegmi());
                createCell(row, colNum++, typeAlcool.getBoukha());
            } else {
                colNum += 5;
            }

            // SPA Entourage
            createCell(row, colNum++, f.getConsommationSpaEntourage());
            EntourageSpa entourage = f.getEntourageSpa();
            if (entourage != null) {
                createCell(row, colNum++, entourage.getMembresFamille());
                createCell(row, colNum++, entourage.getAmis());
                createCell(row, colNum++, entourage.getMilieuProfessionnel());
                createCell(row, colNum++, entourage.getMilieuSportif());
                createCell(row, colNum++, entourage.getMilieuScolaire());
                createCell(row, colNum++, entourage.getAutre());
                createCell(row, colNum++, entourage.getAutrePrecision());
            } else {
                colNum += 7;
            }

            createCell(row, colNum++, f.getConsommationSpaPersonnelle());
            createCell(row, colNum++, f.getAgeInitiationPremiere());
            createCell(row, colNum++, f.getAgeInitiationPrincipale());
            createCell(row, colNum++, f.getTroublesAlimentaires());
            createCell(row, colNum++, f.getAddictionJeux());
            createCell(row, colNum++, f.getAddictionEcrans());
            createCell(row, colNum++, f.getComportementsSexuels());

            // Voie administration
            VoieAdministration voie = f.getVoieAdministration();
            if (voie != null) {
                createCell(row, colNum++, voie.getInjectee());
                createCell(row, colNum++, voie.getFumee());
                createCell(row, colNum++, voie.getIngeree());
                createCell(row, colNum++, voie.getSniffee());
                createCell(row, colNum++, voie.getInhalee());
                createCell(row, colNum++, voie.getAutre());
                createCell(row, colNum++, voie.getAutrePrecision());
            } else {
                colNum += 7;
            }

            createCell(row, colNum++, f.getFrequenceSubstancePrincipale());
            createCell(row, colNum++, f.getPartageSeringues());
            createCell(row, colNum++, f.getAccompagnementSevrage());
            createCell(row, colNum++, f.getAccompagnementSevrageNonRaison());
            createCell(row, colNum++, f.getTentativeSevrage());

            TentativeSevrage sevrage = f.getTentativeSevrageDetails();
            if (sevrage != null) {
                createCell(row, colNum++, sevrage.getToutSeul());
                createCell(row, colNum++, sevrage.getSoutienFamille());
                createCell(row, colNum++, sevrage.getSoutienAmi());
                createCell(row, colNum++, sevrage.getSoutienScolaire());
                createCell(row, colNum++, sevrage.getStructureSante());
                createCell(row, colNum++, sevrage.getStructureSantePrecision());
            } else {
                colNum += 6;
            }

            // Comorbidités
            createCell(row, colNum++, f.getComorbiditePsychiatriquePersonnelle());
            createCell(row, colNum++, f.getComorbiditePsychiatriquePersonnellePrecision());
            createCell(row, colNum++, f.getComorbiditeSomatiquePersonnelle());
            createCell(row, colNum++, f.getComorbiditeSomatiquePersonnellePrecision());
            createCell(row, colNum++, f.getComorbiditePsychiatriquePartenaire());
            createCell(row, colNum++, f.getComorbiditePsychiatriquePartenairePrecision());
            createCell(row, colNum++, f.getComorbiditeSomatiquePartenaire());
            createCell(row, colNum++, f.getComorbiditeSomatiquePartenairePrecision());
            createCell(row, colNum++, f.getNombreCondamnations());
            createCell(row, colNum++, f.getDureeDetentionJours());
            createCell(row, colNum++, f.getDureeDetentionMois());
            createCell(row, colNum++, f.getDureeDetentionAnnees());

            // Décès
            createCell(row, colNum++, f.getNombreDecesSpaDansEntourage());
            createCell(row, colNum++, f.getCausesDecesSpaDansEntourage());

            // Conduite thérapeutique
            createCell(row, colNum++, f.getPriseEnChargeMedicale());
            createCell(row, colNum++, f.getPriseEnChargeMedicalePrecision());
            createCell(row, colNum++, f.getHospitalisation());
            createCell(row, colNum++, f.getRdvConsultationExterne());
            createCell(row, colNum++, f.getPriseEnChargePsychologique());
            createCell(row, colNum++, f.getPriseEnChargePsychologiquePrecision());
            createCell(row, colNum++, f.getPriseEnChargeSociale());
            createCell(row, colNum++, f.getPriseEnChargeSocialePrecision());

            createDateTimeCell(row, colNum++, f.getDateCreation(), dateStyle);
            createDateTimeCell(row, colNum++, f.getDateModification(), dateStyle);
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createSubstancesSheet(Workbook workbook, List<Formulaire> formulaires, CellStyle headerStyle) {
        Sheet sheet = workbook.createSheet("Substances Psychoactives");

        Row headerRow = sheet.createRow(0);
        String[] headers = {
                "Formulaire ID", "Type", "Tabac", "Alcool", "Cannabis", "Opium", "Morphiniques",
                "Morphiniques Précision", "Héroïne", "Cocaïne", "Hypnotiques", "Hypnotiques Précision",
                "Hypnotiques Autre Précision", "Amphétamines", "Ecstasy", "Produits à Inhaler",
                "Prégabaline", "Kétamines", "LSD", "Autre", "Autre Précision", "Âge Initiation"
        };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 1;
        for (Formulaire f : formulaires) {
            for (SubstancePsychoactive s : f.getSubstancesPsychoactives()) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;

                createCell(row, colNum++, f.getId());
                createCell(row, colNum++, s.getType() != null ? s.getType().name() : "");
                createCell(row, colNum++, s.getTabac());
                createCell(row, colNum++, s.getAlcool());
                createCell(row, colNum++, s.getCannabis());
                createCell(row, colNum++, s.getOpium());
                createCell(row, colNum++, s.getMorphiniques());
                createCell(row, colNum++, s.getMorphiniquesPrecision());
                createCell(row, colNum++, s.getHeroine());
                createCell(row, colNum++, s.getCocaine());
                createCell(row, colNum++, s.getHypnotiques());
                createCell(row, colNum++, s.getHypnotiquesPrecision());
                createCell(row, colNum++, s.getHypnotiquesAutrePrecision());
                createCell(row, colNum++, s.getAmphetamines());
                createCell(row, colNum++, s.getEcstasy());
                createCell(row, colNum++, s.getProduitsInhaler());
                createCell(row, colNum++, s.getPregabaline());
                createCell(row, colNum++, s.getKetamines());
                createCell(row, colNum++, s.getLsd());
                createCell(row, colNum++, s.getAutre());
                createCell(row, colNum++, s.getAutrePrecision());
                createCell(row, colNum++, s.getAgeInitiation());
            }
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createTestsDepistageSheet(Workbook workbook, List<Formulaire> formulaires, CellStyle headerStyle) {
        Sheet sheet = workbook.createSheet("Tests Dépistage");

        Row headerRow = sheet.createRow(0);
        String[] headers = {"Formulaire ID", "Type Test", "Réalisé", "Période"};

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 1;
        for (Formulaire f : formulaires) {
            for (TestDepistage t : f.getTestsDepistage()) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;

                createCell(row, colNum++, f.getId());
                createCell(row, colNum++, t.getTypeTest() != null ? t.getTypeTest().name() : "");
                createCell(row, colNum++, t.getRealise());
                createCell(row, colNum++, t.getPeriode());
            }
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.getCreationHelper().createDataFormat().getFormat("dd/mm/yyyy"));
        return style;
    }

    private void createCell(Row row, int column, Object value) {
        Cell cell = row.createCell(column);
        if (value == null) {
            cell.setCellValue("");
        } else if (value instanceof String) {
            cell.setCellValue((String) value);
        } else if (value instanceof Integer) {
            cell.setCellValue((Integer) value);
        } else if (value instanceof Long) {
            cell.setCellValue((Long) value);
        } else if (value instanceof Double) {
            cell.setCellValue((Double) value);
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value ? "Oui" : "Non");
        } else {
            cell.setCellValue(value.toString());
        }
    }

    private void createDateCell(Row row, int column, java.time.LocalDate date, CellStyle style) {
        Cell cell = row.createCell(column);
        if (date != null) {
            cell.setCellValue(date.format(DATE_FORMATTER));
            cell.setCellStyle(style);
        }
    }

    private void createDateTimeCell(Row row, int column, java.time.LocalDateTime dateTime, CellStyle style) {
        Cell cell = row.createCell(column);
        if (dateTime != null) {
            cell.setCellValue(dateTime.format(DATETIME_FORMATTER));
            cell.setCellStyle(style);
        }
    }
}
