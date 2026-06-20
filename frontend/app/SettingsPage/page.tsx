"use client";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowLeft,
  faArrowsRotate,
  faCamera,
  faChevronRight,
  faCircleHalfStroke,
  faCircleQuestion,
  faCodeBranch,
  faDesktop,
  faDownload,
  faFileContract,
  faGlobe,
  faHeadset,
  faHome,
  faLocationDot,
  faMoon,
  faPalette,
  faRecycle,
  faRobot,
  faRoute,
  faShieldHalved,
  faSignOutAlt,
  faSun,
  faTextHeight,
  faTrophy,
  faUniversalAccess,
  faWifi,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useSettings } from "@/lib/SettingsContext";

const notificationSettings = [
  {
    label: "Nearby bins",
    description: "Get an alert when useful recycling points are close.",
    checked: true,
  },
  {
    label: "Community challenges",
    description: "Hear about new team goals and weekly eco missions.",
    checked: true,
  },
  {
    label: "SEB updates",
    description: "Receive product tips and assistant improvements.",
    checked: false,
  },
];

const privacySettings = [
  {
    label: "Location access",
    description: "Use your position to find nearby recycling bins.",
    checked: true,
    icon: faLocationDot,
  },
  {
    label: "Camera access",
    description: "Allow scanning waste items and packaging labels.",
    checked: true,
    icon: faCamera,
  },
  {
    label: "Personalized recommendations",
    description: "Adapt challenges and tips based on your recycling activity.",
    checked: true,
    icon: faRecycle,
  },
];

const recyclingMaterials = ["Plastic", "Glass", "Paper", "Metal"];

const securitySettings = [
  {
    label: "Share map data",
    description: "Help improve bin availability and routes around you.",
    checked: false,
  },
  {
    label: "Send crash reports",
    description: "Send diagnostics so the app can be fixed faster.",
    checked: true,
  },
];

const accessibilitySettings = [
  {
    label: "Reduce animations",
    description: "Use calmer transitions across the app.",
    checked: false,
  },
  {
    label: "High contrast mode",
    description: "Increase contrast for text, controls, and map details.",
    checked: false,
  },
];

const supportActions = [
  { label: "Contact SEB", icon: faHeadset },
  { label: "FAQ", icon: faCircleQuestion },
  { label: "Terms & Conditions", icon: faFileContract },
  { label: "Privacy Policy", icon: faShieldHalved },
];

const translations: Record<string, Record<string, string>> = {
  "Romanian (RO)": {
    Settings: "Setari",
    Home: "Acasa",
    "SEB: Eco Assistant": "SEB: Asistent Eco",
    "Eco Legend in Training": "Legenda eco in devenire",
    Points: "Puncte",
    "Level 7": "Nivel 7",
    "Progress to Level 8": "Progres catre nivelul 8",
    Notifications: "Notificari",
    "Choose what Recyvo should remind you about.":
      "Alege despre ce sa iti aminteasca Recyvo.",
    "Nearby bins": "Cosuri apropiate",
    "Get an alert when useful recycling points are close.":
      "Primeste o alerta cand punctele utile de reciclare sunt aproape.",
    "Community challenges": "Provocari comunitare",
    "Hear about new team goals and weekly eco missions.":
      "Afla despre obiective de echipa si misiuni eco saptamanale.",
    "SEB updates": "Actualizari SEB",
    "Receive product tips and assistant improvements.":
      "Primeste sfaturi despre produs si imbunatatiri ale asistentului.",
    Privacy: "Confidentialitate",
    "Control permissions and how your data is used.":
      "Controleaza permisiunile si modul in care sunt folosite datele tale.",
    "Location access": "Acces la locatie",
    "Use your position to find nearby recycling bins.":
      "Foloseste pozitia ta pentru a gasi cosuri de reciclare apropiate.",
    "Camera access": "Acces la camera",
    "Allow scanning waste items and packaging labels.":
      "Permite scanarea deseurilor si a etichetelor de ambalaje.",
    "Personalized recommendations": "Recomandari personalizate",
    "Adapt challenges and tips based on your recycling activity.":
      "Adapteaza provocarile si sfaturile dupa activitatea ta de reciclare.",
    "Download My Data": "Descarca datele mele",
    "Privacy Policy": "Politica de confidentialitate",
    Preferences: "Preferinte",
    "Set the language and app appearance you prefer.":
      "Seteaza limba si aspectul aplicatiei.",
    Language: "Limba",
    Theme: "Tema",
    Light: "Luminoasa",
    Dark: "Intunecata",
    Device: "Browser",
    "Recycling Preferences": "Preferinte de reciclare",
    "Tune bin suggestions around the way you recycle.":
      "Ajusteaza sugestiile de cosuri dupa modul in care reciclezi.",
    "Preferred materials": "Materiale preferate",
    Plastic: "Plastic",
    Glass: "Sticla",
    Paper: "Hartie",
    Metal: "Metal",
    "Max nearby distance": "Distanta maxima apropiata",
    "Distance unit": "Unitate de distanta",
    Kilometers: "Kilometri",
    Miles: "Mile",
    Accessibility: "Accesibilitate",
    "Make Recyvo easier to read and navigate.":
      "Fa Recyvo mai usor de citit si de folosit.",
    "Text size": "Dimensiune text",
    Small: "Mic",
    Medium: "Mediu",
    Large: "Mare",
    "Reduce animations": "Redu animatiile",
    "Use calmer transitions across the app.":
      "Foloseste tranzitii mai calme in aplicatie.",
    "High contrast mode": "Mod contrast ridicat",
    "Increase contrast for text, controls, and map details.":
      "Mareste contrastul pentru text, controale si detalii de harta.",
    "Advanced & Security": "Avansat si securitate",
    "Share map data": "Partajeaza datele hartii",
    "Help improve bin availability and routes around you.":
      "Ajuta la imbunatatirea disponibilitatii cosurilor si rutelor din jur.",
    "Send crash reports": "Trimite rapoarte de eroare",
    "Send diagnostics so the app can be fixed faster.":
      "Trimite diagnostice pentru ca aplicatia sa fie reparata mai rapid.",
    "App Status": "Status aplicatie",
    "Check app health, sync state, and installed version.":
      "Verifica starea aplicatiei, sincronizarea si versiunea instalata.",
    "App version": "Versiune aplicatie",
    "Last sync": "Ultima sincronizare",
    Connection: "Conexiune",
    Changelog: "Istoric modificari",
    Online: "Online",
    "Today, 15:20": "Astazi, 15:20",
    "View latest updates": "Vezi ultimele actualizari",
    "Support & Legal": "Suport si legal",
    "Find help or review Recyvo policies.":
      "Gaseste ajutor sau consulta politicile Recyvo.",
    "Contact SEB": "Contacteaza SEB",
    FAQ: "FAQ",
    "Terms & Conditions": "Termeni si conditii",
    Logout: "Delogare",
    Close: "Inchide",
    "Settings saved locally": "Setarile au fost salvate local",
    "Data export downloaded": "Exportul de date a fost descarcat",
    "Recyvo uses saved preferences, optional location access, and scan permissions to personalize recycling suggestions. You can disable permissions from this page at any time.":
      "Recyvo foloseste preferintele salvate, accesul optional la locatie si permisiunile de scanare pentru a personaliza sugestiile de reciclare. Poti dezactiva permisiunile oricand din aceasta pagina.",
    "Use Recyvo responsibly and check local recycling rules before disposing of items. Community data is informational and may change.":
      "Foloseste Recyvo responsabil si verifica regulile locale de reciclare inainte de a arunca obiecte. Datele comunitatii sunt informative si se pot schimba.",
    "How are bins suggested?": "Cum sunt sugerate cosurile?",
    "Recyvo uses your selected materials, distance preference, and optional location access.":
      "Recyvo foloseste materialele selectate, preferinta de distanta si accesul optional la locatie.",
    "Are settings saved?": "Setarile sunt salvate?",
    "Yes, this page saves them in this browser.":
      "Da, aceasta pagina le salveaza in acest browser.",
    "Send questions to support@recyvo.local or include crash reports so the team can investigate app problems faster.":
      "Trimite intrebari la support@recyvo.local sau include rapoarte de eroare pentru ca echipa sa investigheze problemele mai rapid.",
    "Settings now save locally in your browser.":
      "Setarile se salveaza acum local in browser.",
    "Privacy, support, and legal buttons open useful details.":
      "Butoanele de confidentialitate, suport si legal deschid detalii utile.",
    "Download My Data exports your current preferences.":
      "Descarca datele mele exporta preferintele curente.",
    "You are using Recyvo version 1.0.0.":
      "Folosesti Recyvo versiunea 1.0.0.",
    "Your settings and app status were last checked today at 15:20.":
      "Setarile si statusul aplicatiei au fost verificate ultima data astazi la 15:20.",
    "Recyvo is online and ready to sync local changes.":
      "Recyvo este online si gata sa sincronizeze modificarile locale.",
  },
  "German (DE)": {
    Settings: "Einstellungen",
    Home: "Startseite",
    "SEB: Eco Assistant": "SEB: Oeko-Assistent",
    "Eco Legend in Training": "Oeko-Legende im Training",
    Points: "Punkte",
    "Level 7": "Stufe 7",
    "Progress to Level 8": "Fortschritt zu Stufe 8",
    Notifications: "Benachrichtigungen",
    "Choose what Recyvo should remind you about.":
      "Waehle, woran Recyvo dich erinnern soll.",
    "Nearby bins": "Nahegelegene Behaelter",
    "Get an alert when useful recycling points are close.":
      "Erhalte eine Meldung, wenn nuetzliche Recyclingpunkte in der Naehe sind.",
    "Community challenges": "Community-Herausforderungen",
    "Hear about new team goals and weekly eco missions.":
      "Erfahre von neuen Teamzielen und woechentlichen Oeko-Missionen.",
    "SEB updates": "SEB-Updates",
    "Receive product tips and assistant improvements.":
      "Erhalte Produkttipps und Verbesserungen des Assistenten.",
    Privacy: "Datenschutz",
    "Control permissions and how your data is used.":
      "Steuere Berechtigungen und wie deine Daten verwendet werden.",
    "Location access": "Standortzugriff",
    "Use your position to find nearby recycling bins.":
      "Nutze deinen Standort, um Recyclingbehaelter in der Naehe zu finden.",
    "Camera access": "Kamerazugriff",
    "Allow scanning waste items and packaging labels.":
      "Erlaube das Scannen von Abfaellen und Verpackungsetiketten.",
    "Personalized recommendations": "Personalisierte Empfehlungen",
    "Adapt challenges and tips based on your recycling activity.":
      "Passe Herausforderungen und Tipps an deine Recyclingaktivitaet an.",
    "Download My Data": "Meine Daten herunterladen",
    "Privacy Policy": "Datenschutzerklaerung",
    Preferences: "Praeferenzen",
    "Set the language and app appearance you prefer.":
      "Lege Sprache und Darstellung der App fest.",
    Language: "Sprache",
    Theme: "Design",
    Light: "Hell",
    Dark: "Dunkel",
    Device: "Browser",
    "Recycling Preferences": "Recycling-Praeferenzen",
    "Tune bin suggestions around the way you recycle.":
      "Passe Behaeltervorschlaege an deine Art zu recyceln an.",
    "Preferred materials": "Bevorzugte Materialien",
    Plastic: "Kunststoff",
    Glass: "Glas",
    Paper: "Papier",
    Metal: "Metall",
    "Max nearby distance": "Maximale Entfernung",
    "Distance unit": "Entfernungseinheit",
    Kilometers: "Kilometer",
    Miles: "Meilen",
    Accessibility: "Barrierefreiheit",
    "Make Recyvo easier to read and navigate.":
      "Mache Recyvo leichter lesbar und einfacher zu bedienen.",
    "Text size": "Textgroesse",
    Small: "Klein",
    Medium: "Mittel",
    Large: "Gross",
    "Reduce animations": "Animationen reduzieren",
    "Use calmer transitions across the app.":
      "Nutze ruhigere Uebergaenge in der App.",
    "High contrast mode": "Hoher Kontrast",
    "Increase contrast for text, controls, and map details.":
      "Erhoehe den Kontrast fuer Text, Bedienelemente und Kartendetails.",
    "Advanced & Security": "Erweitert und Sicherheit",
    "Share map data": "Kartendaten teilen",
    "Help improve bin availability and routes around you.":
      "Hilf, Behaelterverfuegbarkeit und Routen in deiner Umgebung zu verbessern.",
    "Send crash reports": "Absturzberichte senden",
    "Send diagnostics so the app can be fixed faster.":
      "Sende Diagnosedaten, damit die App schneller repariert werden kann.",
    "App Status": "App-Status",
    "Check app health, sync state, and installed version.":
      "Pruefe App-Zustand, Synchronisierung und installierte Version.",
    "App version": "App-Version",
    "Last sync": "Letzte Synchronisierung",
    Connection: "Verbindung",
    Changelog: "Aenderungsprotokoll",
    Online: "Online",
    "Today, 15:20": "Heute, 15:20",
    "View latest updates": "Neueste Updates anzeigen",
    "Support & Legal": "Support und Rechtliches",
    "Find help or review Recyvo policies.":
      "Finde Hilfe oder lies die Recyvo-Richtlinien.",
    "Contact SEB": "SEB kontaktieren",
    FAQ: "FAQ",
    "Terms & Conditions": "Allgemeine Bedingungen",
    Logout: "Abmelden",
    Close: "Schliessen",
    "Settings saved locally": "Einstellungen lokal gespeichert",
    "Data export downloaded": "Datenexport heruntergeladen",
    "Recyvo uses saved preferences, optional location access, and scan permissions to personalize recycling suggestions. You can disable permissions from this page at any time.":
      "Recyvo verwendet gespeicherte Praeferenzen, optionalen Standortzugriff und Scanberechtigungen, um Recyclingvorschlaege zu personalisieren. Du kannst Berechtigungen jederzeit auf dieser Seite deaktivieren.",
    "Use Recyvo responsibly and check local recycling rules before disposing of items. Community data is informational and may change.":
      "Nutze Recyvo verantwortungsvoll und pruefe lokale Recyclingregeln, bevor du Gegenstaende entsorgst. Community-Daten dienen nur zur Information und koennen sich aendern.",
    "How are bins suggested?": "Wie werden Behaelter vorgeschlagen?",
    "Recyvo uses your selected materials, distance preference, and optional location access.":
      "Recyvo nutzt deine ausgewaehlten Materialien, die Entfernungseinstellung und optionalen Standortzugriff.",
    "Are settings saved?": "Werden Einstellungen gespeichert?",
    "Yes, this page saves them in this browser.":
      "Ja, diese Seite speichert sie in diesem Browser.",
    "Send questions to support@recyvo.local or include crash reports so the team can investigate app problems faster.":
      "Sende Fragen an support@recyvo.local oder fuege Absturzberichte hinzu, damit das Team Probleme schneller untersuchen kann.",
    "Settings now save locally in your browser.":
      "Einstellungen werden nun lokal in deinem Browser gespeichert.",
    "Privacy, support, and legal buttons open useful details.":
      "Datenschutz-, Support- und Rechtsbuttons oeffnen nuetzliche Details.",
    "Download My Data exports your current preferences.":
      "Meine Daten herunterladen exportiert deine aktuellen Praeferenzen.",
    "You are using Recyvo version 1.0.0.":
      "Du verwendest Recyvo Version 1.0.0.",
    "Your settings and app status were last checked today at 15:20.":
      "Deine Einstellungen und der App-Status wurden heute um 15:20 zuletzt geprueft.",
    "Recyvo is online and ready to sync local changes.":
      "Recyvo ist online und bereit, lokale Aenderungen zu synchronisieren.",
  },
  "French (FR)": {
    Settings: "Parametres",
    Home: "Accueil",
    "SEB: Eco Assistant": "SEB : Assistant eco",
    "Eco Legend in Training": "Legende eco en formation",
    Points: "Points",
    "Level 7": "Niveau 7",
    "Progress to Level 8": "Progression vers le niveau 8",
    Notifications: "Notifications",
    "Choose what Recyvo should remind you about.":
      "Choisis ce que Recyvo doit te rappeler.",
    "Nearby bins": "Bacs a proximite",
    "Get an alert when useful recycling points are close.":
      "Recois une alerte quand des points de recyclage utiles sont proches.",
    "Community challenges": "Defis communautaires",
    "Hear about new team goals and weekly eco missions.":
      "Recois les nouveaux objectifs d'equipe et missions eco hebdomadaires.",
    "SEB updates": "Mises a jour SEB",
    "Receive product tips and assistant improvements.":
      "Recois des conseils produit et des ameliorations de l'assistant.",
    Privacy: "Confidentialite",
    "Control permissions and how your data is used.":
      "Controle les permissions et l'utilisation de tes donnees.",
    "Location access": "Acces a la localisation",
    "Use your position to find nearby recycling bins.":
      "Utilise ta position pour trouver des bacs de recyclage proches.",
    "Camera access": "Acces a la camera",
    "Allow scanning waste items and packaging labels.":
      "Autorise le scan des dechets et des etiquettes d'emballage.",
    "Personalized recommendations": "Recommandations personnalisees",
    "Adapt challenges and tips based on your recycling activity.":
      "Adapte les defis et conseils selon ton activite de recyclage.",
    "Download My Data": "Telecharger mes donnees",
    "Privacy Policy": "Politique de confidentialite",
    Preferences: "Preferences",
    "Set the language and app appearance you prefer.":
      "Definis la langue et l'apparence de l'application.",
    Language: "Langue",
    Theme: "Theme",
    Light: "Clair",
    Dark: "Sombre",
    Device: "Navigateur",
    "Recycling Preferences": "Preferences de recyclage",
    "Tune bin suggestions around the way you recycle.":
      "Ajuste les suggestions de bacs selon ta facon de recycler.",
    "Preferred materials": "Materiaux preferes",
    Plastic: "Plastique",
    Glass: "Verre",
    Paper: "Papier",
    Metal: "Metal",
    "Max nearby distance": "Distance maximale",
    "Distance unit": "Unite de distance",
    Kilometers: "Kilometres",
    Miles: "Miles",
    Accessibility: "Accessibilite",
    "Make Recyvo easier to read and navigate.":
      "Rends Recyvo plus facile a lire et a parcourir.",
    "Text size": "Taille du texte",
    Small: "Petit",
    Medium: "Moyen",
    Large: "Grand",
    "Reduce animations": "Reduire les animations",
    "Use calmer transitions across the app.":
      "Utilise des transitions plus calmes dans l'application.",
    "High contrast mode": "Mode contraste eleve",
    "Increase contrast for text, controls, and map details.":
      "Augmente le contraste du texte, des controles et des details de carte.",
    "Advanced & Security": "Avance et securite",
    "Share map data": "Partager les donnees de carte",
    "Help improve bin availability and routes around you.":
      "Aide a ameliorer la disponibilite des bacs et les trajets autour de toi.",
    "Send crash reports": "Envoyer les rapports d'erreur",
    "Send diagnostics so the app can be fixed faster.":
      "Envoie des diagnostics pour corriger l'application plus rapidement.",
    "App Status": "Etat de l'application",
    "Check app health, sync state, and installed version.":
      "Verifie l'etat de l'application, la synchronisation et la version installee.",
    "App version": "Version de l'application",
    "Last sync": "Derniere synchronisation",
    Connection: "Connexion",
    Changelog: "Journal des modifications",
    Online: "En ligne",
    "Today, 15:20": "Aujourd'hui, 15:20",
    "View latest updates": "Voir les dernieres mises a jour",
    "Support & Legal": "Support et legal",
    "Find help or review Recyvo policies.":
      "Trouve de l'aide ou consulte les politiques Recyvo.",
    "Contact SEB": "Contacter SEB",
    FAQ: "FAQ",
    "Terms & Conditions": "Conditions generales",
    Logout: "Deconnexion",
    Close: "Fermer",
    "Settings saved locally": "Parametres enregistres localement",
    "Data export downloaded": "Export de donnees telecharge",
    "Recyvo uses saved preferences, optional location access, and scan permissions to personalize recycling suggestions. You can disable permissions from this page at any time.":
      "Recyvo utilise les preferences enregistrees, l'acces optionnel a la localisation et les permissions de scan pour personnaliser les suggestions de recyclage. Tu peux desactiver les permissions a tout moment depuis cette page.",
    "Use Recyvo responsibly and check local recycling rules before disposing of items. Community data is informational and may change.":
      "Utilise Recyvo de facon responsable et verifie les regles locales de recyclage avant de jeter des objets. Les donnees communautaires sont informatives et peuvent changer.",
    "How are bins suggested?": "Comment les bacs sont-ils suggeres ?",
    "Recyvo uses your selected materials, distance preference, and optional location access.":
      "Recyvo utilise les materiaux selectionnes, la preference de distance et l'acces optionnel a la localisation.",
    "Are settings saved?": "Les parametres sont-ils enregistres ?",
    "Yes, this page saves them in this browser.":
      "Oui, cette page les enregistre dans ce navigateur.",
    "Send questions to support@recyvo.local or include crash reports so the team can investigate app problems faster.":
      "Envoie tes questions a support@recyvo.local ou ajoute des rapports d'erreur pour aider l'equipe a enqueter plus vite.",
    "Settings now save locally in your browser.":
      "Les parametres sont maintenant enregistres localement dans ton navigateur.",
    "Privacy, support, and legal buttons open useful details.":
      "Les boutons confidentialite, support et legal ouvrent des details utiles.",
    "Download My Data exports your current preferences.":
      "Telecharger mes donnees exporte tes preferences actuelles.",
    "You are using Recyvo version 1.0.0.":
      "Tu utilises Recyvo version 1.0.0.",
    "Your settings and app status were last checked today at 15:20.":
      "Tes parametres et l'etat de l'application ont ete verifies aujourd'hui a 15:20.",
    "Recyvo is online and ready to sync local changes.":
      "Recyvo est en ligne et pret a synchroniser les changements locaux.",
  },
  "Spanish (ES)": {
    Settings: "Configuracion",
    Home: "Inicio",
    "SEB: Eco Assistant": "SEB: Asistente eco",
    "Eco Legend in Training": "Leyenda eco en entrenamiento",
    Points: "Puntos",
    "Level 7": "Nivel 7",
    "Progress to Level 8": "Progreso al nivel 8",
    Notifications: "Notificaciones",
    "Choose what Recyvo should remind you about.":
      "Elige que debe recordarte Recyvo.",
    "Nearby bins": "Contenedores cercanos",
    "Get an alert when useful recycling points are close.":
      "Recibe una alerta cuando haya puntos de reciclaje utiles cerca.",
    "Community challenges": "Retos comunitarios",
    "Hear about new team goals and weekly eco missions.":
      "Recibe nuevos objetivos de equipo y misiones eco semanales.",
    "SEB updates": "Actualizaciones de SEB",
    "Receive product tips and assistant improvements.":
      "Recibe consejos del producto y mejoras del asistente.",
    Privacy: "Privacidad",
    "Control permissions and how your data is used.":
      "Controla permisos y como se usan tus datos.",
    "Location access": "Acceso a ubicacion",
    "Use your position to find nearby recycling bins.":
      "Usa tu posicion para encontrar contenedores de reciclaje cercanos.",
    "Camera access": "Acceso a camara",
    "Allow scanning waste items and packaging labels.":
      "Permite escanear residuos y etiquetas de envases.",
    "Personalized recommendations": "Recomendaciones personalizadas",
    "Adapt challenges and tips based on your recycling activity.":
      "Adapta retos y consejos segun tu actividad de reciclaje.",
    "Download My Data": "Descargar mis datos",
    "Privacy Policy": "Politica de privacidad",
    Preferences: "Preferencias",
    "Set the language and app appearance you prefer.":
      "Configura el idioma y la apariencia de la aplicacion.",
    Language: "Idioma",
    Theme: "Tema",
    Light: "Claro",
    Dark: "Oscuro",
    Device: "Navegador",
    "Recycling Preferences": "Preferencias de reciclaje",
    "Tune bin suggestions around the way you recycle.":
      "Ajusta sugerencias de contenedores segun como reciclas.",
    "Preferred materials": "Materiales preferidos",
    Plastic: "Plastico",
    Glass: "Vidrio",
    Paper: "Papel",
    Metal: "Metal",
    "Max nearby distance": "Distancia maxima cercana",
    "Distance unit": "Unidad de distancia",
    Kilometers: "Kilometros",
    Miles: "Millas",
    Accessibility: "Accesibilidad",
    "Make Recyvo easier to read and navigate.":
      "Haz que Recyvo sea mas facil de leer y navegar.",
    "Text size": "Tamano del texto",
    Small: "Pequeno",
    Medium: "Mediano",
    Large: "Grande",
    "Reduce animations": "Reducir animaciones",
    "Use calmer transitions across the app.":
      "Usa transiciones mas tranquilas en la aplicacion.",
    "High contrast mode": "Modo de alto contraste",
    "Increase contrast for text, controls, and map details.":
      "Aumenta el contraste de texto, controles y detalles del mapa.",
    "Advanced & Security": "Avanzado y seguridad",
    "Share map data": "Compartir datos del mapa",
    "Help improve bin availability and routes around you.":
      "Ayuda a mejorar la disponibilidad de contenedores y rutas cercanas.",
    "Send crash reports": "Enviar informes de errores",
    "Send diagnostics so the app can be fixed faster.":
      "Envia diagnosticos para reparar la aplicacion mas rapido.",
    "App Status": "Estado de la aplicacion",
    "Check app health, sync state, and installed version.":
      "Comprueba el estado de la app, la sincronizacion y la version instalada.",
    "App version": "Version de la app",
    "Last sync": "Ultima sincronizacion",
    Connection: "Conexion",
    Changelog: "Registro de cambios",
    Online: "En linea",
    "Today, 15:20": "Hoy, 15:20",
    "View latest updates": "Ver ultimas actualizaciones",
    "Support & Legal": "Soporte y legal",
    "Find help or review Recyvo policies.":
      "Encuentra ayuda o revisa las politicas de Recyvo.",
    "Contact SEB": "Contactar con SEB",
    FAQ: "FAQ",
    "Terms & Conditions": "Terminos y condiciones",
    Logout: "Cerrar sesion",
    Close: "Cerrar",
    "Settings saved locally": "Ajustes guardados localmente",
    "Data export downloaded": "Exportacion de datos descargada",
    "Recyvo uses saved preferences, optional location access, and scan permissions to personalize recycling suggestions. You can disable permissions from this page at any time.":
      "Recyvo usa preferencias guardadas, acceso opcional a ubicacion y permisos de escaneo para personalizar sugerencias de reciclaje. Puedes desactivar permisos desde esta pagina en cualquier momento.",
    "Use Recyvo responsibly and check local recycling rules before disposing of items. Community data is informational and may change.":
      "Usa Recyvo con responsabilidad y revisa las reglas locales de reciclaje antes de desechar objetos. Los datos de la comunidad son informativos y pueden cambiar.",
    "How are bins suggested?": "Como se sugieren los contenedores?",
    "Recyvo uses your selected materials, distance preference, and optional location access.":
      "Recyvo usa tus materiales seleccionados, la preferencia de distancia y el acceso opcional a ubicacion.",
    "Are settings saved?": "Se guardan los ajustes?",
    "Yes, this page saves them in this browser.":
      "Si, esta pagina los guarda en este navegador.",
    "Send questions to support@recyvo.local or include crash reports so the team can investigate app problems faster.":
      "Envia preguntas a support@recyvo.local o incluye informes de errores para que el equipo investigue problemas mas rapido.",
    "Settings now save locally in your browser.":
      "Los ajustes ahora se guardan localmente en tu navegador.",
    "Privacy, support, and legal buttons open useful details.":
      "Los botones de privacidad, soporte y legal abren detalles utiles.",
    "Download My Data exports your current preferences.":
      "Descargar mis datos exporta tus preferencias actuales.",
    "You are using Recyvo version 1.0.0.":
      "Estas usando Recyvo version 1.0.0.",
    "Your settings and app status were last checked today at 15:20.":
      "Tus ajustes y el estado de la app se comprobaron hoy a las 15:20.",
    "Recyvo is online and ready to sync local changes.":
      "Recyvo esta en linea y listo para sincronizar cambios locales.",
  },
};

// SettingsState type removed from here to avoid duplicate/unused alias (provider defines the canonical type)

type ModalContent = {
  title: string;
  body: ReactNode;
};

function SettingsCard({
  title,
  description,
  children,
  isDark,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  isDark: boolean;
}) {
  return (
    <section
      className={`rounded-xl p-4 shadow ${
        isDark
          ? "border border-white/5 bg-zinc-800 text-white"
          : "border border-zinc-200 bg-white text-zinc-950"
      }`}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? (
          <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  icon,
  onChange,
  isDark,
}: {
  label: string;
  description: string;
  // checked can be undefined when the settings object hasn't been populated yet
  checked?: boolean;
  icon?: IconDefinition;
  onChange: (checked: boolean) => void;
  isDark: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors ${
        isDark
          ? "bg-zinc-700/60 text-white hover:bg-zinc-700"
          : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
      }`}
    >
      <span className="flex min-w-0 gap-3">
        {icon ? (
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              isDark ? "bg-zinc-800 text-green-500" : "bg-white text-green-600"
            }`}
          >
            <FontAwesomeIcon icon={icon} className="w-4" />
          </span>
        ) : null}
        <span>
          <span className="block font-medium">{label}</span>
          <span
            className={`mt-0.5 block text-sm ${
              isDark ? "text-zinc-400" : "text-zinc-600"
            }`}
          >
            {description}
          </span>
        </span>
      </span>
      <input
        type="checkbox"
        // ensure the input is always controlled (boolean) to avoid uncontrolled -> controlled warning
        checked={!!checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-green-600"
      />
    </label>
  );
}

function ActionButton({
  label,
  icon,
  danger,
  onClick,
  isDark,
}: {
  label: string;
  icon: IconDefinition;
  danger?: boolean;
  onClick: () => void;
  isDark: boolean;
}) {
  const buttonClassName = danger
    ? isDark
      ? "border-red-900/70 text-red-200 hover:bg-red-950/40"
      : "border-red-300 text-red-700 hover:bg-red-50"
    : isDark
      ? "border-zinc-600 text-white hover:bg-zinc-700"
      : "border-zinc-300 text-zinc-950 hover:bg-zinc-100";

  return (
    <button
      className={`flex min-h-12 w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${buttonClassName}`}
      type="button"
      onClick={onClick}
    >
      <span className="flex items-center gap-3 font-medium">
        <FontAwesomeIcon
          icon={icon}
          className={`w-4 ${danger ? "text-red-400" : "text-green-500"}`}
        />
        {label}
      </span>
      <FontAwesomeIcon icon={faChevronRight} className="w-3 text-zinc-500" />
    </button>
  );
}

export default function SettingsPage() {
  const { settings, updateToggle, updateMaterial, updateSetting, resolvedTheme, isDark, savedMessage, setSavedMessage } = useSettings();
  const [modal, setModal] = useState<ModalContent | null>(null);

  // resolvedTheme and isDark come from the SettingsProvider

  const mainClassName = useMemo(() => {
    const textSizeClass =
      settings.textSize === "Small"
        ? "text-sm"
        : settings.textSize === "Large"
          ? "text-lg"
          : "text-base";
    const themeClass =
      resolvedTheme === "Light"
        ? "bg-zinc-100 text-zinc-950"
        : "bg-zinc-900 text-white";
    const contrastClass = (settings.toggles as Record<string, boolean>)["High contrast mode"]
      ? "contrast-125"
      : "";

    return `min-h-screen ${themeClass} ${textSizeClass} ${contrastClass}`;
  }, [resolvedTheme, settings.textSize, settings.toggles]);

  const selectClassName = `w-full rounded-lg border p-3 outline-none ${
    isDark
      ? "border-zinc-600 bg-zinc-700 text-white focus:border-green-500"
      : "border-zinc-300 bg-white text-zinc-950 focus:border-green-600"
  }`;

  function t(text: string) {
    return translations[settings.language]?.[text] ?? text;
  }

  // use the update functions provided by the Settings context (destructured above)

  function openInfoModal(label: string) {
    const modalContent: Record<string, ModalContent> = {
      "Privacy Policy": {
        title: t("Privacy Policy"),
        body: (
          <p>
            {t(
              "Recyvo uses saved preferences, optional location access, and scan permissions to personalize recycling suggestions. You can disable permissions from this page at any time.",
            )}
          </p>
        ),
      },
      "Terms & Conditions": {
        title: t("Terms & Conditions"),
        body: (
          <p>
            {t(
              "Use Recyvo responsibly and check local recycling rules before disposing of items. Community data is informational and may change.",
            )}
          </p>
        ),
      },
      FAQ: {
        title: t("FAQ"),
        body: (
          <div className="space-y-3">
            <p>
              <strong>{t("How are bins suggested?")}</strong>{" "}
              {t(
                "Recyvo uses your selected materials, distance preference, and optional location access.",
              )}
            </p>
            <p>
              <strong>{t("Are settings saved?")}</strong>{" "}
              {t("Yes, this page saves them in this browser.")}
            </p>
          </div>
        ),
      },
      "Contact SEB": {
        title: t("Contact SEB"),
        body: (
          <p>
            {t(
              "Send questions to support@recyvo.local or include crash reports so the team can investigate app problems faster.",
            )}
          </p>
        ),
      },
      Changelog: {
        title: t("Changelog"),
        body: (
          <ul className="list-disc space-y-2 pl-5">
            <li>{t("Settings now save locally in your browser.")}</li>
            <li>{t("Privacy, support, and legal buttons open useful details.")}</li>
            <li>{t("Download My Data exports your current preferences.")}</li>
          </ul>
        ),
      },
      "App version": {
        title: t("App version"),
        body: <p>{t("You are using Recyvo version 1.0.0.")}</p>,
      },
      "Last sync": {
        title: t("Last sync"),
        body: (
          <p>
            {t(
              "Your settings and app status were last checked today at 15:20.",
            )}
          </p>
        ),
      },
      Connection: {
        title: t("Connection"),
        body: <p>{t("Recyvo is online and ready to sync local changes.")}</p>,
      },
    };

    setModal(modalContent[label]);
  }

  function downloadMyData() {
    const data = {
      exportedAt: new Date().toISOString(),
      profile: {
        level: 7,
        points: 12450,
      },
      settings,
    };
    const file = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "recyvo-settings.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setSavedMessage("Data export downloaded");
  }

  function logout() {
    window.localStorage.removeItem("recyvo-settings");
    window.location.href = "../HomePage";
  }

  return (
    // suppressHydrationWarning: many browser extensions inject attributes (eg. fdprocessedid)
    // which cause harmless hydration diffs. Suppress warnings for this subtree to avoid noisy errors.
    <main suppressHydrationWarning className={mainClassName}>
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
        <header
          className={`rounded-b-3xl bg-linear-to-r px-6 pt-6 pb-8 text-white ${
            isDark ? "from-green-900 to-green-800" : "from-green-700 to-green-600"
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <Link
                href="../HomePage"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Back to home"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-4" />
              </Link>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-700">
                <FontAwesomeIcon icon={faRobot} className="w-4" />
              </div>
              <div>
                <p className="text-xs text-green-100">{t("SEB: Eco Assistant")}</p>
                <h1 className="text-xl font-semibold">{t("Settings")}</h1>
              </div>
            </div>
            <Link
              href="../HomePage"
              className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm font-medium hover:bg-white/30 transition-colors"
            >
              <FontAwesomeIcon icon={faHome} className="w-4" />
              {t("Home")}
            </Link>
          </div>

          <div
            className={`rounded-xl p-4 ${
              isDark ? "bg-gray-800 shadow-none" : "bg-white shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {t("Eco Legend in Training")}
                </p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  {t("Points")}: <span className="text-green-700">12,450</span>
                </p>
              </div>
              <div className="flex flex-col items-center">
                <FontAwesomeIcon icon={faTrophy} className="w-6 text-amber-500" />
                <span className="text-xs text-gray-500 mt-1">{t("Level 7")}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>{t("Progress to Level 8")}</span>
              <span>70%</span>
            </div>
            <div
              className={`h-2 w-full rounded-full ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <div className="bg-green-600 h-2 rounded-full w-[70%]" />
            </div>
          </div>
        </header>

        <div className="flex-1 space-y-4 px-4 py-5">
          <SettingsCard
            title={t("Notifications")}
            description={t("Choose what Recyvo should remind you about.")}
            isDark={isDark}
          >
            <div className="space-y-2">
              {notificationSettings.map((setting) => (
                <ToggleRow
                  key={setting.label}
                  {...setting}
                  label={t(setting.label)}
                  description={t(setting.description)}
                   checked={(settings.toggles as Record<string, boolean>)[setting.label]}
                  onChange={(checked) => updateToggle(setting.label, checked)}
                  isDark={isDark}
                />
              ))}
            </div>
          </SettingsCard>

          <SettingsCard
            title={t("Privacy")}
            description={t("Control permissions and how your data is used.")}
            isDark={isDark}
          >
            <div className="space-y-2">
              {privacySettings.map((setting) => (
                <ToggleRow
                  key={setting.label}
                  {...setting}
                  label={t(setting.label)}
                  description={t(setting.description)}
                   checked={(settings.toggles as Record<string, boolean>)[setting.label]}
                  onChange={(checked) => updateToggle(setting.label, checked)}
                  isDark={isDark}
                />
              ))}
            </div>
            <div className="grid gap-2 mt-4 sm:grid-cols-2">
              <ActionButton
                label={t("Download My Data")}
                icon={faDownload}
                onClick={downloadMyData}
                isDark={isDark}
              />
              <ActionButton
                label={t("Privacy Policy")}
                icon={faShieldHalved}
                onClick={() => openInfoModal("Privacy Policy")}
                isDark={isDark}
              />
            </div>
          </SettingsCard>

          <SettingsCard
            title={t("Preferences")}
            description={t("Set the language and app appearance you prefer.")}
            isDark={isDark}
          >
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 font-medium">
                  <FontAwesomeIcon icon={faGlobe} className="w-4 text-green-500" />
                  {t("Language")}
                </span>
                <select
                  value={settings.language}
                  onChange={(event) => updateSetting("language", event.target.value)}
                  className={selectClassName}
                >
                  <option>English (US)</option>
                  <option>Romanian (RO)</option>
                  <option>German (DE)</option>
                  <option>French (FR)</option>
                  <option>Spanish (ES)</option>
                </select>
              </label>

              <div>
                <p className="mb-2 flex items-center gap-2 font-medium">
                  <FontAwesomeIcon icon={faPalette} className="w-4 text-green-500" />
                  {t("Theme")}
                </p>

                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { label: "Light", icon: faSun },
                    { label: "Dark", icon: faMoon, checked: true },
                    { label: "Device", icon: faDesktop },
                  ].map((theme) => (
                    <label
                      key={theme.label}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                        isDark
                          ? "bg-zinc-700/60 text-white hover:bg-zinc-700"
                          : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        checked={settings.theme === theme.label}
                        onChange={() => updateSetting("theme", theme.label)}
                        className="accent-green-600"
                      />
                      <FontAwesomeIcon
                        icon={theme.icon}
                        className={`w-4 ${
                          isDark ? "text-zinc-300" : "text-zinc-600"
                        }`}
                      />
                      <span className="font-medium">{t(theme.label)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            title={t("Recycling Preferences")}
            description={t("Tune bin suggestions around the way you recycle.")}
            isDark={isDark}
          >
            <div className="mb-4">
              <p className="mb-2 flex items-center gap-2 font-medium">
                <FontAwesomeIcon icon={faRecycle} className="w-4 text-green-500" />
                {t("Preferred materials")}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {recyclingMaterials.map((material) => (
                  <label
                    key={material}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-3 transition-colors ${
                      isDark
                        ? "bg-zinc-700/60 text-white hover:bg-zinc-700"
                        : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      // coerce to boolean to ensure the input is always controlled
                      checked={(settings.materials as Record<string, boolean>)[material]}
                      onChange={(event) =>
                        updateMaterial(material, event.target.checked)
                      }
                      className="accent-green-600"
                    />
                    <span className="font-medium">{t(material)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 font-medium">
                  <FontAwesomeIcon icon={faRoute} className="w-4 text-green-500" />
                  {t("Max nearby distance")}
                </span>
                <select
                  value={settings.maxDistance}
                  onChange={(event) =>
                    updateSetting("maxDistance", event.target.value)
                  }
                  className={selectClassName}
                >
                  <option>1 km</option>
                  <option>3 km</option>
                  <option>5 km</option>
                  <option>10 km</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 font-medium">
                  <FontAwesomeIcon icon={faLocationDot} className="w-4 text-green-500" />
                  {t("Distance unit")}
                </span>
                <select
                  value={settings.distanceUnit}
                  onChange={(event) =>
                    updateSetting("distanceUnit", event.target.value)
                  }
                  className={selectClassName}
                >
                  <option value="Kilometers">{t("Kilometers")}</option>
                  <option value="Miles">{t("Miles")}</option>
                </select>
              </label>
            </div>
          </SettingsCard>

          <SettingsCard
            title={t("Accessibility")}
            description={t("Make Recyvo easier to read and navigate.")}
            isDark={isDark}
          >
            <div className="mb-4">
              <p className="mb-2 flex items-center gap-2 font-medium">
                <FontAwesomeIcon icon={faTextHeight} className="w-4 text-green-500" />
                {t("Text size")}
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {["Small", "Medium", "Large"].map((size) => (
                  <label
                    key={size}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                      isDark
                        ? "bg-zinc-700/60 text-white hover:bg-zinc-700"
                        : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="text-size"
                      checked={settings.textSize === size}
                      onChange={() => updateSetting("textSize", size)}
                      className="accent-green-600"
                    />
                    <FontAwesomeIcon
                      icon={faUniversalAccess}
                      className={`w-4 ${
                        isDark ? "text-zinc-300" : "text-zinc-600"
                      }`}
                    />
                    <span className="font-medium">{t(size)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {accessibilitySettings.map((setting) => (
                <ToggleRow
                  key={setting.label}
                  {...setting}
                  label={t(setting.label)}
                  description={t(setting.description)}
                   checked={(settings.toggles as Record<string, boolean>)[setting.label]}
                  onChange={(checked) => updateToggle(setting.label, checked)}
                  isDark={isDark}
                  icon={
                    setting.label === "High contrast mode"
                      ? faCircleHalfStroke
                      : faArrowsRotate
                  }
                />
              ))}
            </div>
          </SettingsCard>

          <SettingsCard title={t("Advanced & Security")} isDark={isDark}>
            <div className="space-y-2">
              {securitySettings.map((setting) => (
                <ToggleRow
                  key={setting.label}
                  {...setting}
                  label={t(setting.label)}
                  description={t(setting.description)}
                   checked={(settings.toggles as Record<string, boolean>)[setting.label]}
                  onChange={(checked) => updateToggle(setting.label, checked)}
                  isDark={isDark}
                />
              ))}
            </div>
          </SettingsCard>

          <SettingsCard
            title={t("App Status")}
            description={t("Check app health, sync state, and installed version.")}
            isDark={isDark}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: "App version", value: "1.0.0", icon: faCodeBranch },
                { label: "Last sync", value: "Today, 15:20", icon: faArrowsRotate },
                { label: "Connection", value: "Online", icon: faWifi },
                { label: "Changelog", value: "View latest updates", icon: faFileContract },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => openInfoModal(item.label)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                    isDark
                      ? "bg-zinc-700/60 text-white hover:bg-zinc-700"
                      : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isDark ? "bg-zinc-800 text-green-500" : "bg-white text-green-600"
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="w-4" />
                  </span>
                  <span>
                    <span
                      className={`block text-sm ${
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      }`}
                    >
                      {t(item.label)}
                    </span>
                    <span className="block font-medium">{t(item.value)}</span>
                  </span>
                </button>
              ))}
            </div>
          </SettingsCard>

          <SettingsCard
            title={t("Support & Legal")}
            description={t("Find help or review Recyvo policies.")}
            isDark={isDark}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {supportActions.map((action) => (
                <ActionButton
                  key={action.label}
                  label={t(action.label)}
                  icon={action.icon}
                  onClick={() => openInfoModal(action.label)}
                  isDark={isDark}
                />
              ))}
            </div>
          </SettingsCard>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 bg-red-600 text-white p-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-4" />
            {t("Logout")}
          </button>
          <p
            className={`text-center text-xs ${
              isDark ? "text-zinc-500" : "text-zinc-600"
            }`}
          >
            {t(savedMessage)}
          </p>
        </div>
      </div>
      {modal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
        >
          <div
            className={`w-full max-w-md rounded-xl border p-5 shadow-xl ${
              isDark
                ? "border-white/10 bg-zinc-800 text-white"
                : "border-zinc-200 bg-white text-zinc-950"
            }`}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <h2 id="settings-modal-title" className="text-lg font-semibold">
                {modal.title}
              </h2>
              <button
                type="button"
                onClick={() => setModal(null)}
                className={`rounded-lg px-3 py-1 text-sm font-medium ${
                  isDark
                    ? "bg-zinc-700 text-white hover:bg-zinc-600"
                    : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                }`}
              >
                {t("Close")}
              </button>
            </div>
            <div
              className={`text-sm leading-6 ${
                isDark ? "text-zinc-300" : "text-zinc-700"
              }`}
            >
              {modal.body}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
