import { PwaBrowser } from './pwa-platform';

export interface PwaInstallGuideStep {
  icon: string;
  text: string;
}

export interface PwaInstallGuide {
  browserLabel: string;
  title: string;
  subtitle: string;
  steps: PwaInstallGuideStep[];
  note?: string;
}

export const PWA_INSTALL_GUIDES: Record<PwaBrowser, PwaInstallGuide> = {
  'safari-ios': {
    browserLabel: 'Safari sur iPhone',
    title: 'Installer Sereno sur iPhone',
    subtitle: 'Sur Safari, l’installation se fait en 2 étapes :',
    steps: [
      {
        icon: 'ios_share',
        text: 'Appuie sur Partager en bas de l’écran (icône carré avec une flèche vers le haut).',
      },
      {
        icon: 'add_to_home_screen',
        text: 'Choisis « Sur l’écran d’accueil », puis appuie sur Ajouter.',
      },
    ],
  },
  'chrome-ios': {
    browserLabel: 'Chrome sur iPhone',
    title: 'Installer Sereno avec Chrome',
    subtitle: 'Sur Chrome iOS, utilise le menu du navigateur :',
    steps: [
      {
        icon: 'more_horiz',
        text: 'Appuie sur les trois points en bas à droite de Chrome.',
      },
      {
        icon: 'ios_share',
        text: 'Choisis Partager, puis « Sur l’écran d’accueil » et confirme.',
      },
    ],
    note: 'Si tu ne vois pas l’option, ouvre Sereno dans Safari pour une installation plus simple.',
  },
  'firefox-ios': {
    browserLabel: 'Firefox sur iPhone',
    title: 'Installer Sereno avec Firefox',
    subtitle: 'Sur Firefox iOS, procède ainsi :',
    steps: [
      {
        icon: 'ios_share',
        text: 'Appuie sur Partager dans la barre d’adresse.',
      },
      {
        icon: 'add_to_home_screen',
        text: 'Sélectionne « Sur l’écran d’accueil », puis valide.',
      },
    ],
  },
  'edge-ios': {
    browserLabel: 'Edge sur iPhone',
    title: 'Installer Sereno avec Edge',
    subtitle: 'Sur Edge iOS :',
    steps: [
      {
        icon: 'more_horiz',
        text: 'Ouvre le menu (trois points) en bas de l’écran.',
      },
      {
        icon: 'add_to_home_screen',
        text: 'Choisis « Ajouter à l’écran d’accueil », puis confirme.',
      },
    ],
  },
  'chrome-android': {
    browserLabel: 'Chrome sur Android',
    title: 'Installer Sereno sur Android',
    subtitle: 'Sur Chrome Android, tu peux installer en 1 clic ou via le menu :',
    steps: [
      {
        icon: 'download',
        text: 'Appuie sur le bouton Télécharger Sereno si le navigateur le propose.',
      },
      {
        icon: 'more_vert',
        text: 'Sinon, ouvre le menu (trois points) puis « Installer l’application » ou « Ajouter à l’écran d’accueil ».',
      },
    ],
  },
  'samsung-internet': {
    browserLabel: 'Samsung Internet',
    title: 'Installer Sereno sur Samsung',
    subtitle: 'Dans Samsung Internet :',
    steps: [
      {
        icon: 'menu',
        text: 'Ouvre le menu (trois lignes) en bas à droite.',
      },
      {
        icon: 'add_to_home_screen',
        text: 'Choisis « Ajouter la page à » puis « Écran d’accueil ».',
      },
    ],
  },
  'firefox-android': {
    browserLabel: 'Firefox sur Android',
    title: 'Installer Sereno avec Firefox',
    subtitle: 'Sur Firefox Android :',
    steps: [
      {
        icon: 'more_vert',
        text: 'Ouvre le menu (trois points) en haut à droite.',
      },
      {
        icon: 'install_mobile',
        text: 'Choisis « Installer » ou « Ajouter à l’écran d’accueil ».',
      },
    ],
  },
  'chrome-desktop': {
    browserLabel: 'Chrome',
    title: 'Installer Sereno sur ordinateur',
    subtitle: 'Dans Chrome :',
    steps: [
      {
        icon: 'download',
        text: 'Clique sur Télécharger Sereno si le bouton apparaît ici.',
      },
      {
        icon: 'install_desktop',
        text: 'Sinon, clique sur l’icône d’installation dans la barre d’adresse (à droite de l’URL).',
      },
    ],
  },
  'edge-desktop': {
    browserLabel: 'Microsoft Edge',
    title: 'Installer Sereno sur ordinateur',
    subtitle: 'Dans Edge :',
    steps: [
      {
        icon: 'download',
        text: 'Utilise le bouton Télécharger Sereno si disponible.',
      },
      {
        icon: 'apps',
        text: 'Sinon, ouvre le menu (⋯) → Applications → Installer Sereno.',
      },
    ],
  },
  'safari-desktop': {
    browserLabel: 'Safari sur Mac',
    title: 'Ajouter Sereno sur Mac',
    subtitle: 'Safari ne propose pas encore l’installation PWA complète. Tu peux :',
    steps: [
      {
        icon: 'bookmark',
        text: 'Ajouter Sereno aux Favoris pour un accès rapide.',
      },
      {
        icon: 'open_in_browser',
        text: 'Ou ouvrir Sereno dans Chrome / Edge pour l’installer comme application.',
      },
    ],
  },
  'firefox-desktop': {
    browserLabel: 'Firefox',
    title: 'Installer Sereno sur ordinateur',
    subtitle: 'Firefox gère mal l’installation PWA. Recommandation :',
    steps: [
      {
        icon: 'open_in_browser',
        text: 'Ouvre Sereno dans Chrome ou Edge pour l’installer en un clic.',
      },
      {
        icon: 'bookmark',
        text: 'Sinon, ajoute la page aux favoris pour y revenir facilement.',
      },
    ],
  },
  unknown: {
    browserLabel: 'Ton navigateur',
    title: 'Installer Sereno',
    subtitle: 'Procédure générale :',
    steps: [
      {
        icon: 'menu',
        text: 'Ouvre le menu de ton navigateur (souvent ⋯ ou ☰).',
      },
      {
        icon: 'install_mobile',
        text: 'Cherche « Installer l’application », « Ajouter à l’écran d’accueil » ou une icône de téléchargement.',
      },
    ],
    note: 'Pour une installation en 1 clic, utilise Chrome ou Edge sur Android / ordinateur.',
  },
};

export function getPwaInstallGuide(browser: PwaBrowser): PwaInstallGuide {
  return PWA_INSTALL_GUIDES[browser];
}
