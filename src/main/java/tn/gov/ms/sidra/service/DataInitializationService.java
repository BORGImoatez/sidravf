package tn.gov.ms.sidra.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.gov.ms.sidra.entity.*;
import tn.gov.ms.sidra.repository.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializationService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final GouvernoratRepository gouvernoratRepository;
    private final StructureRepository structureRepository;
    private final CountryRepository countryRepository;
    private final MinistereRepository ministereRepository;
    private final DelegationRepository delegationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        initializeGouvernorats();
        initializeMinisteres();
         initializeStructures();
        initializeDelegations();
        initializeCountries();
      initializeDefaultSuperAdmin();


    }

    /**
     * Initialise les gouvernorats de la Tunisie
     */
    private void initializeGouvernorats() {
        log.info("Initialisation des gouvernorats...");

        if (gouvernoratRepository.count() == 0) {
            String[][] gouvernoratsData = {
                    {"Tunis", "TUN"}, {"Ariana", "ARI"}, {"Ben Arous", "BEN"}, {"Manouba", "MAN"},
                    {"Nabeul", "NAB"}, {"Zaghouan", "ZAG"}, {"Bizerte", "BIZ"}, {"Béja", "BEJ"},
                    {"Jendouba", "JEN"}, {"Kef", "KEF"}, {"Siliana", "SIL"}, {"Sousse", "SOU"},
                    {"Monastir", "MON"}, {"Mahdia", "MAH"}, {"Sfax", "SFX"}, {"Kairouan", "KAI"},
                    {"Kasserine", "KAS"}, {"Sidi Bouzid", "SID"}, {"Gabès", "GAB"}, {"Médenine", "MED"},
                    {"Tataouine", "TAT"}, {"Gafsa", "GAF"}, {"Tozeur", "TOZ"}, {"Kébili", "KEB"}
            };

            for (String[] data : gouvernoratsData) {
                Gouvernorat gouvernorat = new Gouvernorat();
                gouvernorat.setNom(data[0]);
                gouvernorat.setCodeIso3(data[1]);
                gouvernoratRepository.save(gouvernorat);
            }

            log.info("✅ {} gouvernorats initialisés", gouvernoratsData.length);
        } else {
            log.info("✅ Gouvernorats déjà initialisés");
        }
    }

    /**
     * Initialise les ministères
     */
    private void initializeMinisteres() {
        log.info("Initialisation des ministères...");

        if (ministereRepository.count() == 0) {
            List<String[]> ministeresData = Arrays.asList(
                    new String[]{"Ministère de la Santé", "MS"},
                    new String[]{"Ministère de l'Intérieur", "MI"},
                    new String[]{"Ministère de la Justice", "MJ"},
                    new String[]{"Ministère de l'Éducation", "ME"},
                    new String[]{"Ministère de l'Enseignement Supérieur et de la Recherche Scientifique", "MESRS"},
                    new String[]{"Ministère des Affaires Sociales", "MAS"},
                    new String[]{"Ministère de la Jeunesse et des Sports", "MJS"},
                    new String[]{"Ministère de la Défense Nationale", "MDN"},
                    new String[]{"Ministère des Finances", "MF"},
                    new String[]{"Ministère des Affaires Étrangères", "MAE"},
                    new String[]{"Ministère de l'Agriculture", "MA"},
                    new String[]{"Ministère de l'Industrie", "MIND"},
                    new String[]{"Ministère du Tourisme", "MT"},
                    new String[]{"Ministère du Transport", "MTR"},
                    new String[]{"Ministère de l'Environnement", "MENV"}
            );

            for (String[] data : ministeresData) {
                Ministere ministere = new Ministere();
                ministere.setNom(data[0]);
                ministere.setCode(data[1]);
                ministere.setActif(true);
                ministereRepository.save(ministere);
            }

            log.info("✅ {} ministères initialisés", ministeresData.size());
        } else {
            log.info("✅ Ministères déjà initialisés");
        }
    }

    /**
     * Initialise les délégations pour le gouvernorat d'Ariana
     */
  /**
 * Initialise les délégations pour chaque gouvernorat
 */
private void initializeDelegations() {
    log.info("Initialisation des délégations...");

    // === Gouvernorat de Tunis ===
    Gouvernorat tunis = gouvernoratRepository.findByNom("Tunis").orElse(null);
    if (tunis != null) {
        if (tunis.getDelegations() == null || tunis.getDelegations().isEmpty()) {
            List<String> delegationsTunis = Arrays.asList(
                "Carthage",
                "La Medina",
                "Bab El Bhar",
                "Bab Souika",
                "El Omrane",
                "El Omrane Supérieur",
                "Ettahrir",
                "El Menzah",
                "Cité El Khadhra",
                "Le Bardo",
                "Sijoumi",
                "Ezzouhour",
                "El Hrairia",
                "Sidi Hassine",
                "El Ouardia",
                "El Kabaria",
                "Sidi El Béchir",
                "Djebel Djelloud",
                "La Goulette",
                "Le Kram",
                "La Marsa"
            );

            for (String nomDelegation : delegationsTunis) {
                Delegation delegation = new Delegation();
                delegation.setNom(nomDelegation);
                delegation.setGouvernorat(tunis);
                delegationRepository.save(delegation);
            }

            log.info("✅ {} délégations créées pour Tunis", delegationsTunis.size());
        } else {
            log.info("✅ Délégations pour Tunis déjà initialisées");
        }
    } else {
        log.warn("⚠️ Gouvernorat Tunis non trouvé, impossible d'initialiser les délégations");
    }

    // === Gouvernorat d'Ariana (déjà présent) ===
    Gouvernorat ariana = gouvernoratRepository.findByNom("Ariana").orElse(null);
    if (ariana != null) {
        if (ariana.getDelegations() == null || ariana.getDelegations().isEmpty()) {
            List<String> delegationsAriana = Arrays.asList(
                "Soukra",
                "Borj Louzir",
                "Ariana Ville",
                "Raoued",
                "Kalaat el-Andalous",
                "Sidi Thabet"
            );

            for (String nomDelegation : delegationsAriana) {
                Delegation delegation = new Delegation();
                delegation.setNom(nomDelegation);
                delegation.setGouvernorat(ariana);
                delegationRepository.save(delegation);
            }

            log.info("✅ {} délégations créées pour Ariana", delegationsAriana.size());
        } else {
            log.info("✅ Délégations pour Ariana déjà initialisées");
        }
    } else {
        log.warn("⚠️ Gouvernorat Ariana non trouvé, impossible d'initialiser les délégations");
    }
    // === Gouvernorat de Ben Arous ===
Gouvernorat benArous = gouvernoratRepository.findByNom("Ben Arous").orElse(null);
if (benArous != null) {
    if (benArous.getDelegations() == null || benArous.getDelegations().isEmpty()) {
        List<String> delegationsBenArous = Arrays.asList(
            "La Nouvelle Medina",
            "El Mourouj",
            "Hammam Lif",
            "Hammam Chôtt",
            "Bou Mhel El Bassatine",
            "Ezzahra",
            "Radès",
            "Megrine",
            "Mohamedia",
            "Fouchana",
            "Mornag"
        );

        for (String nomDelegation : delegationsBenArous) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(benArous);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Ben Arous", delegationsBenArous.size());
    } else {
        log.info("✅ Délégations pour Ben Arous déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Ben Arous non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Manouba ===
Gouvernorat manouba = gouvernoratRepository.findByNom("Manouba").orElse(null);
if (manouba != null) {
    if (manouba.getDelegations() == null || manouba.getDelegations().isEmpty()) {
        List<String> delegationsManouba = Arrays.asList(
            "Mannouba",
            "Douar Hicher",
            "Oued Ellil",
            "Mornaguia",
            "Borj Amri",
            "Djedeida",
            "Tebourba",
            "El Battane"
        );

        for (String nomDelegation : delegationsManouba) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(manouba);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Manouba", delegationsManouba.size());
    } else {
        log.info("✅ Délégations pour Manouba déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Manouba non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Nabeul ===
Gouvernorat nabeul = gouvernoratRepository.findByNom("Nabeul").orElse(null);
if (nabeul != null) {
    if (nabeul.getDelegations() == null || nabeul.getDelegations().isEmpty()) {
        List<String> delegationsNabeul = Arrays.asList(
            "Nabeul",
            "Dar Châabane El Fehri",
            "Beni khiar",
            "Korba",
            "Menzel Temime",
            "El Mida",
            "Kelibia",
            "Hammam El Guezaz",
            "El Haouaria",
            "Takelsa",
            "Soliman",
            "Menzel Bouzelfa",
            "Beni Khalled",
            "Grombalia",
            "Bou Argoub",
            "Hammamet"
        );

        for (String nomDelegation : delegationsNabeul) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(nabeul);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Nabeul", delegationsNabeul.size());
    } else {
        log.info("✅ Délégations pour Nabeul déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Nabeul non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Zaghouan ===
Gouvernorat zaghouan = gouvernoratRepository.findByNom("Zaghouan").orElse(null);
if (zaghouan != null) {
    if (zaghouan.getDelegations() == null || zaghouan.getDelegations().isEmpty()) {
        List<String> delegationsZaghouan = Arrays.asList(
            "Zaghouan",
            "Ez-Zeriba",
            "Bir Mchergua",
            "El Fahs",
            "En-Nadhour",
            "Saouaf"
        );

        for (String nomDelegation : delegationsZaghouan) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(zaghouan);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Zaghouan", delegationsZaghouan.size());
    } else {
        log.info("✅ Délégations pour Zaghouan déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Zaghouan non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Bizerte ===
Gouvernorat bizerte = gouvernoratRepository.findByNom("Bizerte").orElse(null);
if (bizerte != null) {
    if (bizerte.getDelegations() == null || bizerte.getDelegations().isEmpty()) {
        List<String> delegationsBizerte = Arrays.asList(
            "Bizerte Nord",
            "Zarzouna",
            "Bizerte Sud",
            "Sedjnane",
            "Djoumine",
            "Mateur",
            "Ghezala",
            "Menzel Bourguiba",
            "Tinja",
            "Utique",
            "Ghar El Meleh",
            "Menzel Djemil",
            "El Alia",
            "Ras Djebel"
        );

        for (String nomDelegation : delegationsBizerte) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(bizerte);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Bizerte", delegationsBizerte.size());
    } else {
        log.info("✅ Délégations pour Bizerte déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Bizerte non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Béja ===
Gouvernorat beja = gouvernoratRepository.findByNom("Béja").orElse(null);
if (beja != null) {
    if (beja.getDelegations() == null || beja.getDelegations().isEmpty()) {
        List<String> delegationsBeja = Arrays.asList(
            "Béja Nord",
            "Béja Sud",
            "Amdoun",
            "Nefza",
            "Teboursouk",
            "Tibar",
            "Testour",
            "Goubellat",
            "Medjez El Bab"
        );

        for (String nomDelegation : delegationsBeja) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(beja);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Béja", delegationsBeja.size());
    } else {
        log.info("✅ Délégations pour Béja déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Béja non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Jendouba ===
Gouvernorat jendouba = gouvernoratRepository.findByNom("Jendouba").orElse(null);
if (jendouba != null) {
    if (jendouba.getDelegations() == null || jendouba.getDelegations().isEmpty()) {
        List<String> delegationsJendouba = Arrays.asList(
            "Jendouba",
            "Jendouba Nord",
            "Bou Salem",
            "Tabarka",
            "Ain Draham",
            "Fernana",
            "Ghardimaou",
            "Oued Meliz",
            "Balta - Bou Aouane"
        );

        for (String nomDelegation : delegationsJendouba) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(jendouba);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Jendouba", delegationsJendouba.size());
    } else {
        log.info("✅ Délégations pour Jendouba déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Jendouba non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat du Kef ===
Gouvernorat kef = gouvernoratRepository.findByNom("Kef").orElse(null);
if (kef != null) {
    if (kef.getDelegations() == null || kef.getDelegations().isEmpty()) {
        List<String> delegationsKef = Arrays.asList(
            "Kef Ouest",
            "Kef Est",
            "Nebeur",
            "Sakiet Sidi Youssef",
            "Tajerouine",
            "Kalâat Snan",
            "Kalâat Khasbah",
            "Djerissa",
            "El Ksour",
            "Dahmani",
            "Es-Sers"
        );

        for (String nomDelegation : delegationsKef) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(kef);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Kef", delegationsKef.size());
    } else {
        log.info("✅ Délégations pour Kef déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Kef non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Siliana ===
Gouvernorat siliana = gouvernoratRepository.findByNom("Siliana").orElse(null);
if (siliana != null) {
    if (siliana.getDelegations() == null || siliana.getDelegations().isEmpty()) {
        List<String> delegationsSiliana = Arrays.asList(
            "Siliana Nord",
            "Siliana Sud",
            "Bou Arada",
            "Gaâfour",
            "El Krib",
            "Bourouis",
            "Makthar",
            "Er-Rouhia",
            "Kesra",
            "Bargou",
            "El Aroussa"
        );

        for (String nomDelegation : delegationsSiliana) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(siliana);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Siliana", delegationsSiliana.size());
    } else {
        log.info("✅ Délégations pour Siliana déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Siliana non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Sousse ===
Gouvernorat sousse = gouvernoratRepository.findByNom("Sousse").orElse(null);
if (sousse != null) {
    if (sousse.getDelegations() == null || sousse.getDelegations().isEmpty()) {
        List<String> delegationsSousse = Arrays.asList(
            "Sousse Medina",
            "Sousse Riadh",
            "Sousse Jawhara",
            "Sousse Sidi Abdelhamid",
            "Hammam Sousse",
            "Akouda",
            "Kalaâ Kebira",
            "Sidi Bou Ali",
            "Hergla",
            "Enfidha",
            "Bouficha",
            "Kondar",
            "Sidi El Héni",
            "M'saken",
            "Kalaâ Seghira",
            "Zaouia - Ksiba - Thrayet"
        );

        for (String nomDelegation : delegationsSousse) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(sousse);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Sousse", delegationsSousse.size());
    } else {
        log.info("✅ Délégations pour Sousse déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Sousse non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Monastir ===
Gouvernorat monastir = gouvernoratRepository.findByNom("Monastir").orElse(null);
if (monastir != null) {
    if (monastir.getDelegations() == null || monastir.getDelegations().isEmpty()) {
        List<String> delegationsMonastir = Arrays.asList(
            "Monastir",
            "Ouerdanine",
            "Sahline",
            "Zermadine",
            "Beni Hassen",
            "Jammel",
            "Bembla",
            "Moknine",
            "Bekalta",
            "Teboulba",
            "Ksar Helal",
            "Ksibet El Mediouni",
            "Sayada-Lamta Bou-Hjar"
        );

        for (String nomDelegation : delegationsMonastir) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(monastir);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Monastir", delegationsMonastir.size());
    } else {
        log.info("✅ Délégations pour Monastir déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Monastir non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Mahdia ===
Gouvernorat mahdia = gouvernoratRepository.findByNom("Mahdia").orElse(null);
if (mahdia != null) {
    if (mahdia.getDelegations() == null || mahdia.getDelegations().isEmpty()) {
        List<String> delegationsMahdia = Arrays.asList(
            "Mahdia",
            "Bou Merdès",
            "Ouled Chamekh",
            "Chorbane",
            "Hebira",
            "Essouassi",
            "El Djem",
            "Chebba",
            "Melloulech",
            "Sidi Alouane",
            "Ksour Essef"
        );

        for (String nomDelegation : delegationsMahdia) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(mahdia);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Mahdia", delegationsMahdia.size());
    } else {
        log.info("✅ Délégations pour Mahdia déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Mahdia non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Sfax ===
Gouvernorat sfax = gouvernoratRepository.findByNom("Sfax").orElse(null);
if (sfax != null) {
    if (sfax.getDelegations() == null || sfax.getDelegations().isEmpty()) {
        List<String> delegationsSfax = Arrays.asList(
            "Sfax Ville",
            "Sfax Ouest",
            "Sakiet Ezzit",
            "Sakiet Eddaïer",
            "Sfax Sud",
            "Tina",
            "Agareb",
            "Djebeniana",
            "El Amra",
            "El Hencha",
            "Menzel Chaker",
            "Ghraiba",
            "Bir ali Ben Kelifa",
            "Skhira",
            "Mahres",
            "Kerkenah"
        );

        for (String nomDelegation : delegationsSfax) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(sfax);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Sfax", delegationsSfax.size());
    } else {
        log.info("✅ Délégations pour Sfax déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Sfax non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Kairouan ===
Gouvernorat kairouan = gouvernoratRepository.findByNom("Kairouan").orElse(null);
if (kairouan != null) {
    if (kairouan.getDelegations() == null || kairouan.getDelegations().isEmpty()) {
        List<String> delegationsKairouan = Arrays.asList(
            "Kairouan Nord",
            "Kairouan Sud",
            "Echebika",
            "Sbikha",
            "EL Ouslatia",
            "Haffouz",
            "El Alâa",
            "Hajeb el Ayoun",
            "Nasrallah",
            "Echrarda",
            "Bouhajla"
        );

        for (String nomDelegation : delegationsKairouan) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(kairouan);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Kairouan", delegationsKairouan.size());
    } else {
        log.info("✅ Délégations pour Kairouan déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Kairouan non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Kasserine ===
Gouvernorat kasserine = gouvernoratRepository.findByNom("Kasserine").orElse(null);
if (kasserine != null) {
    if (kasserine.getDelegations() == null || kasserine.getDelegations().isEmpty()) {
        List<String> delegationsKasserine = Arrays.asList(
            "Kasserine Nord",
            "Kasserine Sud",
            "Ezzouhour",
            "Hassi Ferid",
            "Sbeitla",
            "Sbiba",
            "Djedeliane",
            "El Ayoun",
            "Thala",
            "Hidra",
            "Foussana",
            "Feriana",
            "Majel Bel Abbès"
        );

        for (String nomDelegation : delegationsKasserine) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(kasserine);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Kasserine", delegationsKasserine.size());
    } else {
        log.info("✅ Délégations pour Kasserine déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Kasserine non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Sidi Bouzid ===
Gouvernorat sidiBouzid = gouvernoratRepository.findByNom("Sidi Bouzid").orElse(null);
if (sidiBouzid != null) {
    if (sidiBouzid.getDelegations() == null || sidiBouzid.getDelegations().isEmpty()) {
        List<String> delegationsSidiBouzid = Arrays.asList(
            "Sidi Bouzid Ouest",
            "Sidi Bouzid Est",
            "Jilma",
            "Cebalet Ouled Asker",
            "Bir El Hafey",
            "Sidi Ali Ben Aoûn",
            "Menzel Bouzaïenne",
            "Meknassy",
            "Souk Jedid",
            "Mezzouna",
            "Regueb",
            "Ouled Haffouz"
        );

        for (String nomDelegation : delegationsSidiBouzid) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(sidiBouzid);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Sidi Bouzid", delegationsSidiBouzid.size());
    } else {
        log.info("✅ Délégations pour Sidi Bouzid déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Sidi Bouzid non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Gabès ===
Gouvernorat gabes = gouvernoratRepository.findByNom("Gabès").orElse(null);
if (gabes != null) {
    if (gabes.getDelegations() == null || gabes.getDelegations().isEmpty()) {
        List<String> delegationsGabes = Arrays.asList(
            "Gabes Medina",
            "Gabes Ouest",
            "Gabes Sud",
            "Ghanouch",
            "El Metouia",
            "Menzel El Habib",
            "El Hamma",
            "Matmata",
            "Nouvelle Matmata",
            "Mareth"
        );

        for (String nomDelegation : delegationsGabes) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(gabes);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Gabès", delegationsGabes.size());
    } else {
        log.info("✅ Délégations pour Gabès déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Gabès non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Médenine ===
Gouvernorat medenine = gouvernoratRepository.findByNom("Médenine").orElse(null);
if (medenine != null) {
    if (medenine.getDelegations() == null || medenine.getDelegations().isEmpty()) {
        List<String> delegationsMedenine = Arrays.asList(
            "Medenine Nord",
            "Medenine Sud",
            "Beni Khedech",
            "Ben Guerdane",
            "Zarzis",
            "Djerba Houmet Souk",
            "Djerba Midoun",
            "Djerba Ajim",
            "Sidi Makhloulf"
        );

        for (String nomDelegation : delegationsMedenine) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(medenine);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Médenine", delegationsMedenine.size());
    } else {
        log.info("✅ Délégations pour Médenine déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Médenine non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Tataouine ===
Gouvernorat tataouine = gouvernoratRepository.findByNom("Tataouine").orElse(null);
if (tataouine != null) {
    if (tataouine.getDelegations() == null || tataouine.getDelegations().isEmpty()) {
        List<String> delegationsTataouine = Arrays.asList(
            "Tataouine Nord",
            "Tataouine Sud",
            "Smâr",
            "Bir Lahmar",
            "Ghomrassen",
            "Dhehiba",
            "Remada"
        );

        for (String nomDelegation : delegationsTataouine) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(tataouine);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Tataouine", delegationsTataouine.size());
    } else {
        log.info("✅ Délégations pour Tataouine déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Tataouine non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Gafsa ===
Gouvernorat gafsa = gouvernoratRepository.findByNom("Gafsa").orElse(null);
if (gafsa != null) {
    if (gafsa.getDelegations() == null || gafsa.getDelegations().isEmpty()) {
        List<String> delegationsGafsa = Arrays.asList(
            "Gafsa Nord",
            "Sidi Aïch",
            "El Ksar",
            "Gafsa Sud",
            "Oum El Araies",
            "Redeyef",
            "Metlaoui",
            "Mdhila",
            "EL Guetar",
            "Belkhir",
            "Sned"
        );

        for (String nomDelegation : delegationsGafsa) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(gafsa);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Gafsa", delegationsGafsa.size());
    } else {
        log.info("✅ Délégations pour Gafsa déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Gafsa non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Tozeur ===
Gouvernorat tozeur = gouvernoratRepository.findByNom("Tozeur").orElse(null);
if (tozeur != null) {
    if (tozeur.getDelegations() == null || tozeur.getDelegations().isEmpty()) {
        List<String> delegationsTozeur = Arrays.asList(
            "Tozeur",
            "Degach",
            "Tameghza",
            "Nefta",
            "Hazoua"
        );

        for (String nomDelegation : delegationsTozeur) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(tozeur);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Tozeur", delegationsTozeur.size());
    } else {
        log.info("✅ Délégations pour Tozeur déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Tozeur non trouvé, impossible d'initialiser les délégations");
}
// === Gouvernorat de Kébili ===
Gouvernorat kebili = gouvernoratRepository.findByNom("Kébili").orElse(null);
if (kebili != null) {
    if (kebili.getDelegations() == null || kebili.getDelegations().isEmpty()) {
        List<String> delegationsKebili = Arrays.asList(
            "Kebili Sud",
            "Kebeli Nord",
            "Souk El Ahed",
            "Douz Nord",
            "Douz Sud",
            "Faouar"
        );

        for (String nomDelegation : delegationsKebili) {
            Delegation delegation = new Delegation();
            delegation.setNom(nomDelegation);
            delegation.setGouvernorat(kebili);
            delegationRepository.save(delegation);
        }

        log.info("✅ {} délégations créées pour Kébili", delegationsKebili.size());
    } else {
        log.info("✅ Délégations pour Kébili déjà initialisées");
    }
} else {
    log.warn("⚠️ Gouvernorat Kébili non trouvé, impossible d'initialiser les délégations");
}

}


    /**
     * Initialise quelques structures par défaut
     */
    private void initializeStructures() {
        log.info("Initialisation des structures par défaut...");

        if (structureRepository.count() == 0) {
            Gouvernorat tunis = gouvernoratRepository.findByNom("Tunis").orElse(null);
            Gouvernorat sfax = gouvernoratRepository.findByNom("Sfax").orElse(null);
            Ministere sante = ministereRepository.findByNomAndActifTrue("Ministère de la Santé").orElse(null);

            if (tunis != null && sante != null) {
                // Structures publiques
                createStructure("Hôpital Charles Nicolle", TypeStructure.PUBLIQUE, tunis, "Secteur Public", sante);
                createStructure("Hôpital La Rabta", TypeStructure.PUBLIQUE, tunis, "Secteur Public", sante);

                // Structure privée
                createStructure("Clinique Avicenne", TypeStructure.PRIVEE, tunis, "Secteur Privé", null);

                // ONG
                createStructure("Association Tunisienne de Lutte contre les Drogues", TypeStructure.ONG, tunis, "ATLD", null);
            }

            if (sfax != null && sante != null) {
                createStructure("Hôpital Habib Bourguiba", TypeStructure.PUBLIQUE, sfax, "Secteur Public", sante);
            }

            log.info("✅ Structures par défaut initialisées");
        } else {
            log.info("✅ Structures déjà initialisées");
        }
    }

    private void createStructure(String nom, TypeStructure type, Gouvernorat gouvernorat, String secteur, Ministere ministere) {
        Structure structure = new Structure();
        structure.setNom(nom);
        structure.setType(type);
        structure.setGouvernorat(gouvernorat);
        structure.setSecteur(secteur);
        structure.setMinistere(ministere);
        structure.setActif(true);
        structureRepository.save(structure);
    }

    /**
     * Initialise la liste des pays
     */
    private void initializeCountries() {
        log.info("Initialisation des pays...");

        if (countryRepository.count() == 0) {
            // Liste des pays avec leurs codes ISO
            Object[][] countriesData = {
                    {"Afghanistan", "AF", "AFG"}, {"Afrique du Sud", "ZA", "ZAF"}, {"Albanie", "AL", "ALB"},
                    {"Algérie", "DZ", "DZA"}, {"Allemagne", "DE", "DEU"}, {"Andorre", "AD", "AND"},
                    {"Angola", "AO", "AGO"}, {"Antigua-et-Barbuda", "AG", "ATG"}, {"Arabie saoudite", "SA", "SAU"},
                    {"Argentine", "AR", "ARG"}, {"Arménie", "AM", "ARM"}, {"Australie", "AU", "AUS"},
                    {"Autriche", "AT", "AUT"}, {"Azerbaïdjan", "AZ", "AZE"}, {"Bahamas", "BS", "BHS"},
                    {"Bahreïn", "BH", "BHR"}, {"Bangladesh", "BD", "BGD"}, {"Barbade", "BB", "BRB"},
                    {"Belgique", "BE", "BEL"}, {"Belize", "BZ", "BLZ"}, {"Bénin", "BJ", "BEN"},
                    {"Bhoutan", "BT", "BTN"}, {"Biélorussie", "BY", "BLR"}, {"Birmanie", "MM", "MMR"},
                    {"Bolivie", "BO", "BOL"}, {"Bosnie-Herzégovine", "BA", "BIH"}, {"Botswana", "BW", "BWA"},
                    {"Brésil", "BR", "BRA"}, {"Brunei", "BN", "BRN"}, {"Bulgarie", "BG", "BGR"},
                    {"Burkina Faso", "BF", "BFA"}, {"Burundi", "BI", "BDI"}, {"Cambodge", "KH", "KHM"},
                    {"Cameroun", "CM", "CMR"}, {"Canada", "CA", "CAN"}, {"Cap-Vert", "CV", "CPV"},
                    {"Chili", "CL", "CHL"}, {"Chine", "CN", "CHN"}, {"Chypre", "CY", "CYP"},
                    {"Colombie", "CO", "COL"}, {"Comores", "KM", "COM"}, {"Congo", "CG", "COG"},
                    {"Corée du Nord", "KP", "PRK"}, {"Corée du Sud", "KR", "KOR"}, {"Costa Rica", "CR", "CRI"},
                    {"Côte d'Ivoire", "CI", "CIV"}, {"Croatie", "HR", "HRV"}, {"Cuba", "CU", "CUB"},
                    {"Danemark", "DK", "DNK"}, {"Djibouti", "DJ", "DJI"}, {"Dominique", "DM", "DMA"},
                    {"Égypte", "EG", "EGY"}, {"Émirats arabes unis", "AE", "ARE"}, {"Équateur", "EC", "ECU"},
                    {"Érythrée", "ER", "ERI"}, {"Espagne", "ES", "ESP"}, {"Estonie", "EE", "EST"},
                    {"États-Unis", "US", "USA"}, {"Éthiopie", "ET", "ETH"}, {"Fidji", "FJ", "FJI"},
                    {"Finlande", "FI", "FIN"}, {"France", "FR", "FRA"}, {"Gabon", "GA", "GAB"},
                    {"Gambie", "GM", "GMB"}, {"Géorgie", "GE", "GEO"}, {"Ghana", "GH", "GHA"},
                    {"Grèce", "GR", "GRC"}, {"Grenade", "GD", "GRD"}, {"Guatemala", "GT", "GTM"},
                    {"Guinée", "GN", "GIN"}, {"Guinée-Bissau", "GW", "GNB"}, {"Guinée équatoriale", "GQ", "GNQ"},
                    {"Guyana", "GY", "GUY"}, {"Haïti", "HT", "HTI"}, {"Honduras", "HN", "HND"},
                    {"Hongrie", "HU", "HUN"}, {"Îles Marshall", "MH", "MHL"}, {"Îles Salomon", "SB", "SLB"},
                    {"Inde", "IN", "IND"}, {"Indonésie", "ID", "IDN"}, {"Irak", "IQ", "IRQ"},
                    {"Iran", "IR", "IRN"}, {"Irlande", "IE", "IRL"}, {"Islande", "IS", "ISL"},
                    {"Israël", "IL", "ISR"}, {"Italie", "IT", "ITA"}, {"Jamaïque", "JM", "JAM"},
                    {"Japon", "JP", "JPN"}, {"Jordanie", "JO", "JOR"}, {"Kazakhstan", "KZ", "KAZ"},
                    {"Kenya", "KE", "KEN"}, {"Kirghizistan", "KG", "KGZ"}, {"Kiribati", "KI", "KIR"},
                    {"Koweït", "KW", "KWT"}, {"Laos", "LA", "LAO"}, {"Lesotho", "LS", "LSO"},
                    {"Lettonie", "LV", "LVA"}, {"Liban", "LB", "LBN"}, {"Liberia", "LR", "LBR"},
                    {"Libye", "LY", "LBY"}, {"Liechtenstein", "LI", "LIE"}, {"Lituanie", "LT", "LTU"},
                    {"Luxembourg", "LU", "LUX"}, {"Macédoine du Nord", "MK", "MKD"}, {"Madagascar", "MG", "MDG"},
                    {"Malaisie", "MY", "MYS"}, {"Malawi", "MW", "MWI"}, {"Maldives", "MV", "MDV"},
                    {"Mali", "ML", "MLI"}, {"Malte", "MT", "MLT"}, {"Maroc", "MA", "MAR"},
                    {"Maurice", "MU", "MUS"}, {"Mauritanie", "MR", "MRT"}, {"Mexique", "MX", "MEX"},
                    {"Micronésie", "FM", "FSM"}, {"Moldavie", "MD", "MDA"}, {"Monaco", "MC", "MCO"},
                    {"Mongolie", "MN", "MNG"}, {"Monténégro", "ME", "MNE"}, {"Mozambique", "MZ", "MOZ"},
                    {"Namibie", "NA", "NAM"}, {"Nauru", "NR", "NRU"}, {"Népal", "NP", "NPL"},
                    {"Nicaragua", "NI", "NIC"}, {"Niger", "NE", "NER"}, {"Nigeria", "NG", "NGA"},
                    {"Norvège", "NO", "NOR"}, {"Nouvelle-Zélande", "NZ", "NZL"}, {"Oman", "OM", "OMN"},
                    {"Ouganda", "UG", "UGA"}, {"Ouzbékistan", "UZ", "UZB"}, {"Pakistan", "PK", "PAK"},
                    {"Palaos", "PW", "PLW"}, {"Palestine", "PS", "PSE"}, {"Panama", "PA", "PAN"},
                    {"Papouasie-Nouvelle-Guinée", "PG", "PNG"}, {"Paraguay", "PY", "PRY"}, {"Pays-Bas", "NL", "NLD"},
                    {"Pérou", "PE", "PER"}, {"Philippines", "PH", "PHL"}, {"Pologne", "PL", "POL"},
                    {"Portugal", "PT", "PRT"}, {"Qatar", "QA", "QAT"}, {"République centrafricaine", "CF", "CAF"},
                    {"République démocratique du Congo", "CD", "COD"}, {"République dominicaine", "DO", "DOM"}, {"République tchèque", "CZ", "CZE"},
                    {"Roumanie", "RO", "ROU"}, {"Royaume-Uni", "GB", "GBR"}, {"Russie", "RU", "RUS"},
                    {"Rwanda", "RW", "RWA"}, {"Saint-Kitts-et-Nevis", "KN", "KNA"}, {"Saint-Marin", "SM", "SMR"},
                    {"Saint-Vincent-et-les-Grenadines", "VC", "VCT"}, {"Sainte-Lucie", "LC", "LCA"}, {"Salvador", "SV", "SLV"},
                    {"Samoa", "WS", "WSM"}, {"São Tomé-et-Principe", "ST", "STP"}, {"Sénégal", "SN", "SEN"},
                    {"Serbie", "RS", "SRB"}, {"Seychelles", "SC", "SYC"}, {"Sierra Leone", "SL", "SLE"},
                    {"Singapour", "SG", "SGP"}, {"Slovaquie", "SK", "SVK"}, {"Slovénie", "SI", "SVN"},
                    {"Somalie", "SO", "SOM"}, {"Soudan", "SD", "SDN"}, {"Soudan du Sud", "SS", "SSD"},
                    {"Sri Lanka", "LK", "LKA"}, {"Suède", "SE", "SWE"}, {"Suisse", "CH", "CHE"},
                    {"Suriname", "SR", "SUR"}, {"Syrie", "SY", "SYR"}, {"Tadjikistan", "TJ", "TJK"},
                    {"Tanzanie", "TZ", "TZA"}, {"Tchad", "TD", "TCD"}, {"Thaïlande", "TH", "THA"},
                    {"Timor oriental", "TL", "TLS"}, {"Togo", "TG", "TGO"}, {"Tonga", "TO", "TON"},
                    {"Trinité-et-Tobago", "TT", "TTO"}, {"Tunisie", "TN", "TUN"}, {"Turkménistan", "TM", "TKM"},
                    {"Turquie", "TR", "TUR"}, {"Tuvalu", "TV", "TUV"}, {"Ukraine", "UA", "UKR"},
                    {"Uruguay", "UY", "URY"}, {"Vanuatu", "VU", "VUT"}, {"Vatican", "VA", "VAT"},
                    {"Venezuela", "VE", "VEN"}, {"Viêt Nam", "VN", "VNM"}, {"Yémen", "YE", "YEM"},
                    {"Zambie", "ZM", "ZMB"}, {"Zimbabwe", "ZW", "ZWE"}
            };

            for (Object[] data : countriesData) {
                Country country = new Country();
                country.setNom((String) data[0]);
                country.setCodeIso2((String) data[1]);
                country.setCodeIso3((String) data[2]);
                countryRepository.save(country);
            }

            log.info("✅ {} pays initialisés", countriesData.length);
        } else {
            log.info("✅ Pays déjà initialisés");
        }
    }

    /**
     * Crée un utilisateur SUPER_ADMIN par défaut s'il n'en existe aucun
     */
    private void initializeDefaultSuperAdmin() {
        log.info("Vérification de l'existence d'un utilisateur SUPER_ADMIN...");

        // Vérifier s'il existe déjà un SUPER_ADMIN
        boolean superAdminExists = userRepository.findByRole(UserRole.SUPER_ADMIN)
                .stream()
                .anyMatch(User::getActif);

        if (!superAdminExists) {
            log.info("Aucun utilisateur SUPER_ADMIN actif trouvé. Création du compte par défaut...");

            // Créer le SUPER_ADMIN par défaut
            User defaultSuperAdmin = new User();
            defaultSuperAdmin.setNom("Administrateur");
            defaultSuperAdmin.setPrenom("Système");
            defaultSuperAdmin.setEmail("admin@sidra.tn");
            defaultSuperAdmin.setTelephone("+21695418515"); // Numéro spécifié
            defaultSuperAdmin.setMotDePasse(passwordEncoder.encode("Insp2025")); // Mot de passe spécifié
            defaultSuperAdmin.setRole(UserRole.SUPER_ADMIN);
            defaultSuperAdmin.setActif(true);
            defaultSuperAdmin.setDateCreation(LocalDateTime.now());
            defaultSuperAdmin.setTentativesConnexion(0);

            try {
                userRepository.save(defaultSuperAdmin);
                log.info("✅ Utilisateur SUPER_ADMIN créé avec succès:");
                log.info("   📧 Email: {}", defaultSuperAdmin.getEmail());
                log.info("   📱 Téléphone: {}", defaultSuperAdmin.getTelephone());
                log.info("   🔑 Mot de passe: Insp2025");
                log.info("   👤 Rôle: {}", defaultSuperAdmin.getRole());
            } catch (Exception e) {
                log.error("❌ Erreur lors de la création du SUPER_ADMIN par défaut: {}", e.getMessage(), e);
            }

            // Créer un utilisateur EXTERNE pour les tests
            createDefaultExterneUser();
            createDefaultAdministrateurInspUser();
            createDefaultRoleBnsUser();
        } else {
            log.info("✅ Un utilisateur SUPER_ADMIN existe déjà. Aucune action nécessaire.");
        }
    }

    /**
     * Crée un utilisateur EXTERNE par défaut pour les tests
     */
    private void createDefaultExterneUser() {
        log.info("Création d'un utilisateur EXTERNE par défaut...");

        // Récupérer une structure par défaut
        Structure defaultStructure = structureRepository.findByNomContainingIgnoreCase("Charles Nicolle")
                .stream()
                .findFirst()
                .orElse(null);

        if (defaultStructure != null) {
            User externeUser = new User();
            externeUser.setNom("Externe");
            externeUser.setPrenom("Utilisateur");
            externeUser.setEmail("externe@sidra.tn");
            externeUser.setTelephone("+21698407454");
            externeUser.setMotDePasse(passwordEncoder.encode("123456"));
            externeUser.setRole(UserRole.EXTERNE);
            externeUser.setStructure(defaultStructure);
            externeUser.setActif(true);
            externeUser.setDateCreation(LocalDateTime.now());
            externeUser.setTentativesConnexion(0);

            try {
                userRepository.save(externeUser);
                log.info("✅ Utilisateur EXTERNE créé avec succès:");
                log.info("   📧 Email: {}", externeUser.getEmail());
                log.info("   📱 Téléphone: {}", externeUser.getTelephone());
                log.info("   🔑 Mot de passe: 123456");
                log.info("   👤 Rôle: {}", externeUser.getRole());
            } catch (Exception e) {
                log.error("❌ Erreur lors de la création de l'utilisateur EXTERNE: {}", e.getMessage(), e);
            }
        }
    }

    /**
     * Crée un utilisateur ADMINISTRATEUR_INSP par défaut pour les tests
     */
    private void createDefaultAdministrateurInspUser() {
        log.info("Création d'un utilisateur ADMINISTRATEUR_INSP par défaut...");

        User adminInspUser = new User();
        adminInspUser.setNom("Administrateur");
        adminInspUser.setPrenom("INSP");
        adminInspUser.setEmail("admin.insp@sidra.tn");
        adminInspUser.setTelephone("+21698407455");
        adminInspUser.setMotDePasse(passwordEncoder.encode("AdminInsp2025"));
        adminInspUser.setRole(UserRole.ADMINISTRATEUR_INSP);
        adminInspUser.setStructure(null); // Pas de structure pour ADMINISTRATEUR_INSP
        adminInspUser.setActif(true);
        adminInspUser.setDateCreation(LocalDateTime.now());
        adminInspUser.setTentativesConnexion(0);

        try {
            userRepository.save(adminInspUser);
            log.info("✅ Utilisateur ADMINISTRATEUR_INSP créé avec succès:");
            log.info("   📧 Email: {}", adminInspUser.getEmail());
            log.info("   📱 Téléphone: {}", adminInspUser.getTelephone());
            log.info("   🔑 Mot de passe: AdminInsp2025");
            log.info("   👤 Rôle: {}", adminInspUser.getRole());
        } catch (Exception e) {
            log.error("❌ Erreur lors de la création de l'utilisateur ADMINISTRATEUR_INSP: {}", e.getMessage(), e);
        }
    }

    /**
     * Crée un utilisateur ROLE_BNS par défaut pour les tests
     */
    private void createDefaultRoleBnsUser() {
        log.info("Création d'un utilisateur ROLE_BNS par défaut...");

        // Récupérer une structure par défaut
        Structure defaultStructure = structureRepository.findByNomContainingIgnoreCase("Charles Nicolle")
                .stream()
                .findFirst()
                .orElse(null);

        if (defaultStructure != null) {
            User roleBnsUser = new User();
            roleBnsUser.setNom("BNS");
            roleBnsUser.setPrenom("Utilisateur");
            roleBnsUser.setEmail("bns@sidra.tn");
            roleBnsUser.setTelephone("+21698407456");
            roleBnsUser.setMotDePasse(passwordEncoder.encode("BNS2025"));
            roleBnsUser.setRole(UserRole.BNS);
            roleBnsUser.setStructure(defaultStructure);
            roleBnsUser.setActif(true);
            roleBnsUser.setDateCreation(LocalDateTime.now());
            roleBnsUser.setTentativesConnexion(0);

            try {
                userRepository.save(roleBnsUser);
                log.info("✅ Utilisateur ROLE_BNS créé avec succès:");
                log.info("   📧 Email: {}", roleBnsUser.getEmail());
                log.info("   📱 Téléphone: {}", roleBnsUser.getTelephone());
                log.info("   🔑 Mot de passe: BNS2025");
                log.info("   👤 Rôle: {}", roleBnsUser.getRole());
            } catch (Exception e) {
                log.error("❌ Erreur lors de la création de l'utilisateur ROLE_BNS: {}", e.getMessage(), e);
            }
        }
    }
}